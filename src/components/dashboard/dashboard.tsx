'use client';

import { useEffect, useState, useCallback } from 'react';
import { OnboardingDialog } from './onboarding-dialog';
import { DomainScores } from './domain-scores';
import { ActionSuggestions } from './action-suggestions';
import { GrowthTracker } from './growth-tracker';
import type { LifeDesignChatOnboardingOutput } from '@/ai/flows/life-design-chat-onboarding';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatInterface, type ChatMessage } from './chat-interface';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, onSnapshot, query, orderBy, limit, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { ConversationalChatOutput } from '@/ai/flows/conversational-chat';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Terminal } from 'lucide-react';

const USER_ID = 'default-user'; // Hardcoded user ID for this prototype

export type Scores = {
  social: number;
  personal: number;
  professional: number;
  spiritual: number;
};

export type ScoreHistory = {
  date: string;
  scores: Scores;
};

export type ActionItem = {
  id:string;
  text: string;
  completed: boolean;
};

type UserData = {
    onboardingCompleted: boolean;
    userValues: string;
    dashboardDescription: string;
    scores: Scores;
    scoreHistory: ScoreHistory[];
    actionItems: ActionItem[];
    memories: string[];
}

function DashboardSkeleton() {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-36 rounded-lg" />
                <Skeleton className="h-36 rounded-lg" />
                <Skeleton className="h-36 rounded-lg" />
                <Skeleton className="h-36 rounded-lg" />
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-96 rounded-lg lg:col-span-2" />
                <Skeleton className="h-96 rounded-lg" />
                <Skeleton className="h-80 rounded-lg lg:col-span-3" />
            </div>
        </div>
    );
}

export function Dashboard() {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [onboardingData, setOnboardingData] = useState<{
      completed: boolean,
      userValues: string,
      dashboardDescription: string,
  }>({
      completed: false,
      userValues: '',
      dashboardDescription: 'Your personalized insights will appear here.'
  });
  const [scores, setScores] = useState<Scores>({ social: 50, personal: 50, professional: 50, spiritual: 50 });
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [memories, setMemories] = useState<string[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  useEffect(() => {
    setIsClient(true);
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'your-project-id') {
      setConfigError("Your Firebase project credentials are not set. Please update the .env file for the app to function correctly.");
      setIsLoading(false);
      return;
    }
    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'your_api_key') {
      setConfigError("Your Gemini API key is not set. Please update the .env file for the app to function correctly.");
      setIsLoading(false);
      return;
    }
  }, []);
  
  const saveUserData = useCallback(async (data: Partial<UserData>) => {
      if (!isClient || configError) return;
      try {
        const userDocRef = doc(db, 'users', USER_ID);
        await setDoc(userDocRef, data, { merge: true });
      } catch (error) {
        console.error("Failed to save user data:", error);
        toast({ title: 'Error Saving Data', description: 'Could not connect to the database.', variant: 'destructive' });
      }
  }, [isClient, toast, configError]);

  const addChatMessage = useCallback(async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    if (!isClient || configError) return;
    try {
        const chatDocRef = doc(collection(db, 'users', USER_ID, 'chatHistory'));
        await setDoc(chatDocRef, { ...message, timestamp: serverTimestamp() });
    } catch (error) {
        console.error("Failed to add chat message:", error);
    }
  }, [isClient, configError]);

  useEffect(() => {
    if (!isClient || configError) return;

    let unsubscribeUser: (() => void) | undefined;
    let unsubscribeChat: (() => void) | undefined;

    const loadData = async () => {
        try {
            const userDocRef = doc(db, 'users', USER_ID);
            unsubscribeUser = onSnapshot(userDocRef, (doc) => {
                if (doc.exists()) {
                    const data = doc.data() as UserData;
                    setOnboardingData({
                        completed: data.onboardingCompleted || false,
                        userValues: data.userValues || '',
                        dashboardDescription: data.dashboardDescription || 'Your personalized insights will appear here.'
                    });
                    setScores(data.scores || { social: 50, personal: 50, professional: 50, spiritual: 50 });
                    setScoreHistory(data.scoreHistory || []);
                    setActionItems(data.actionItems || []);
                    setMemories(data.memories || []);
                } else {
                    const today = new Date().toISOString().split('T')[0];
                    setScoreHistory([{ date: today, scores: { social: 50, personal: 50, professional: 50, spiritual: 50 } }]);
                }
                setIsLoading(false);
            }, (error) => {
              console.error("Firestore user snapshot error:", error);
              toast({ title: 'Error Loading User Data', description: 'Could not connect to the database.', variant: 'destructive' });
              setIsLoading(false);
            });

            const q = query(collection(db, 'users', USER_ID, 'chatHistory'), orderBy('timestamp', 'asc'), limit(50));
            unsubscribeChat = onSnapshot(q, (querySnapshot) => {
                const history: ChatMessage[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    history.push({ 
                        id: doc.id, 
                        role: data.role,
                        content: data.content,
                        timestamp: (data.timestamp as Timestamp)?.toDate()
                    } as ChatMessage);
                });
                setChatHistory(history);
            }, (error) => {
              console.error("Firestore chat snapshot error:", error);
              toast({ title: 'Error Loading Chat History', description: 'Could not load chat history.', variant: 'destructive' });
            });

        } catch (error) {
            console.error("Failed to load user data:", error);
            toast({ title: 'Error Loading Data', description: 'Could not connect to the database.', variant: 'destructive' });
            setIsLoading(false);
        }
    };
    
    loadData();

    return () => {
        if (unsubscribeUser) unsubscribeUser();
        if (unsubscribeChat) unsubscribeChat();
    };
  }, [isClient, toast, configError]);
  
  const handleAIAssistantResponse = useCallback((output: ConversationalChatOutput) => {
    const dataToSave: Partial<UserData> = {};
    let wasUpdated = false;

    let newScores = scores;
    let newHistory = scoreHistory;
    let newActionItems = actionItems;
    let newMemories = memories;

    if (output.scoreUpdates) {
        newScores = { ...scores, ...output.scoreUpdates };
        newHistory = [...scoreHistory.slice(-29), { date: new Date().toISOString().split('T')[0], scores: newScores }];
        dataToSave.scores = newScores;
        dataToSave.scoreHistory = newHistory;
        wasUpdated = true;
    }
    if (output.newActions && output.newActions.length > 0) {
        const currentActionTexts = new Set(actionItems.map(item => item.text));
        const uniqueNewItems = output.newActions
            .filter(text => !currentActionTexts.has(text))
            .map(text => ({ id: crypto.randomUUID(), text, completed: false }));
        
        if (uniqueNewItems.length > 0) {
            newActionItems = [...uniqueNewItems, ...actionItems];
            dataToSave.actionItems = newActionItems;
            wasUpdated = true;
        }
    }
    if (output.newMemory) {
        newMemories = [...memories, output.newMemory];
        dataToSave.memories = newMemories;
        wasUpdated = true;
    }

    if (wasUpdated) {
        if (dataToSave.scores) setScores(newScores);
        if (dataToSave.scoreHistory) setScoreHistory(newHistory);
        if (dataToSave.actionItems) setActionItems(newActionItems);
        if (dataToSave.memories) setMemories(newMemories);
        
        saveUserData(dataToSave);
    }
  }, [scores, scoreHistory, actionItems, memories, saveUserData]);

  const handleOnboardingComplete = async (data: LifeDesignChatOnboardingOutput, values: string) => {
    const newScores = {
      social: data.socialScore,
      personal: data.personalScore,
      professional: data.professionalScore,
      spiritual: data.spiritualScore,
    };
    const today = new Date().toISOString().split('T')[0];
    const newHistory = [{ date: today, scores: newScores }];

    const newUserData: UserData = {
        onboardingCompleted: true,
        userValues: values,
        dashboardDescription: data.dashboardDescription,
        scores: newScores,
        scoreHistory: newHistory,
        actionItems: [],
        memories: [],
    };
    
    await saveUserData(newUserData);
  };
  
  if (isLoading) {
      return <DashboardSkeleton />;
  }

  if (configError) {
      return (
          <div className="container mx-auto p-4 sm:p-6 lg:p-8">
              <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Configuration Error</AlertTitle>
                  <AlertDescription>
                      {configError}
                  </AlertDescription>
              </Alert>
          </div>
      );
  }
  
  return (
    <>
        <OnboardingDialog 
          open={!onboardingData.completed} 
          onOnboardingComplete={handleOnboardingComplete} />
        
        {onboardingData.completed && (
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="space-y-8">
                <div>
                <h2 className="text-2xl font-bold tracking-tight">Your Life Dashboard</h2>
                <p className="text-muted-foreground">{onboardingData.dashboardDescription}</p>
                </div>

                <DomainScores scores={scores} />

                <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
                    <ChatInterface 
                        scores={scores} 
                        userValues={onboardingData.userValues}
                        memories={memories}
                        chatHistory={chatHistory}
                        onNewChatMessage={addChatMessage}
                        onAIAssistantResponse={handleAIAssistantResponse}
                    />
                    <ActionSuggestions actionItems={actionItems} setActionItems={(updater) => {
                        const newItems = typeof updater === 'function' ? updater(actionItems) : updater;
                        setActionItems(newItems);
                        saveUserData({ actionItems: newItems });
                    }} />
                    <div className="lg:col-span-3">
                        <GrowthTracker scoreHistory={scoreHistory} />
                    </div>
                </div>
            </div>
            </div>
        )}
    </>
  );
}
