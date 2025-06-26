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
import { collection, doc, getDoc, setDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

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
  id: string;
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
  const { toast } = useToast();
  const [isConfigured, setIsConfigured] = useState(true);
  
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [userValues, setUserValues] = useState('');
  const [dashboardDescription, setDashboardDescription] = useState('Your personalized insights will appear here.');
  const [scores, setScores] = useState<Scores>({ social: 50, personal: 50, professional: 50, spiritual: 50 });
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [memories, setMemories] = useState<string[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!firebaseProjectId || firebaseProjectId === 'your_project_id') {
      toast({
        title: 'Configuration Error',
        description: "Your Firebase Project ID is not set. Please add it to the .env file.",
        variant: 'destructive',
        duration: Infinity,
      });
      setIsConfigured(false);
      setIsLoading(false);
    }
  }, [toast]);
  
  const saveUserData = useCallback(async (data: Partial<UserData>) => {
      if (!isClient || !isConfigured) return;
      try {
        const userDocRef = doc(db, 'users', USER_ID);
        await setDoc(userDocRef, data, { merge: true });
      } catch (error) {
        console.error("Failed to save user data:", error);
      }
  }, [isClient, isConfigured]);

  const addChatMessage = useCallback(async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    if (!isClient || !isConfigured) return;
    try {
        const chatDocRef = doc(collection(db, 'users', USER_ID, 'chatHistory'));
        await setDoc(chatDocRef, { ...message, timestamp: serverTimestamp() });
    } catch (error) {
        console.error("Failed to add chat message:", error);
    }
  }, [isClient, isConfigured]);

  useEffect(() => {
    setIsClient(true);
    if (!isConfigured) return;

    const loadData = async () => {
        try {
            const userDocRef = doc(db, 'users', USER_ID);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data() as UserData;
                setIsOnboardingCompleted(data.onboardingCompleted || false);
                setUserValues(data.userValues || '');
                setDashboardDescription(data.dashboardDescription || 'Your personalized insights will appear here.');
                setScores(data.scores || { social: 50, personal: 50, professional: 50, spiritual: 50 });
                setScoreHistory(data.scoreHistory || []);
                setActionItems(data.actionItems || []);
                setMemories(data.memories || []);
            } else {
                // First time user, set default history
                const today = new Date().toISOString().split('T')[0];
                setScoreHistory([{ date: today, scores: { social: 50, personal: 50, professional: 50, spiritual: 50 } }]);
            }

            // Set up chat history listener
            const q = query(collection(db, 'users', USER_ID, 'chatHistory'), orderBy('timestamp', 'asc'), limit(50));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const history: ChatMessage[] = [];
                querySnapshot.forEach((doc) => {
                    history.push({ id: doc.id, ...doc.data() } as ChatMessage);
                });
                setChatHistory(history);
            });

            return unsubscribe;

        } catch (error) {
            console.error("Failed to load user data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    let unsubscribe: (() => void) | undefined;
    loadData().then(unsub => { unsubscribe = unsub });

    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
  }, [isConfigured]);

  const handleOnboardingComplete = (data: LifeDesignChatOnboardingOutput, values: string) => {
    if (!isConfigured) return;
    
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
    }

    setScores(newScores);
    setScoreHistory(newHistory);
    setUserValues(values);
    setDashboardDescription(data.dashboardDescription);
    setActionItems([]);
    setMemories([]);
    setIsOnboardingCompleted(true);
    
    saveUserData(newUserData);
  };
  
  if (!isClient || isLoading) {
      return <DashboardSkeleton />;
  }

  if (!isOnboardingCompleted) {
    return <OnboardingDialog onOnboardingComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Life Dashboard</h2>
          <p className="text-muted-foreground">{dashboardDescription}</p>
        </div>

        <DomainScores scores={scores} />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <ChatInterface 
            scores={scores} 
            userValues={userValues}
            memories={memories}
            chatHistory={chatHistory}
            onNewChatMessage={addChatMessage}
            onAIAssistantResponse={(output) => {
                if (output.scoreUpdates) {
                    setScores(output.scoreUpdates);
                    setScoreHistory(prev => {
                        const newHistory = [...prev.slice(-30), { date: new Date().toISOString(), scores: output.scoreUpdates! }];
                        saveUserData({ scoreHistory: newHistory });
                        return newHistory;
                    });
                    saveUserData({ scores: output.scoreUpdates });
                }
                if (output.newActions && output.newActions.length > 0) {
                    setActionItems(prev => {
                        const newItems = output.newActions!.map(text => ({ id: crypto.randomUUID(), text, completed: false }));
                        const uniqueNewItems = newItems.filter(newItem => !prev.some(existing => existing.text === newItem.text));
                        const updatedActions = [...uniqueNewItems, ...prev];
                        saveUserData({ actionItems: updatedActions });
                        return updatedActions;
                    });
                }
                if (output.newMemory) {
                    setMemories(prev => {
                        const updatedMemories = [...prev, output.newMemory!];
                        saveUserData({ memories: updatedMemories });
                        return updatedMemories;
                    });
                }
            }}
          />
          <ActionSuggestions actionItems={actionItems} setActionItems={(updater) => {
              setActionItems(prev => {
                const newItems = typeof updater === 'function' ? updater(prev) : updater;
                saveUserData({ actionItems: newItems });
                return newItems;
              });
          }} />
          <div className="lg:col-span-3">
            <GrowthTracker scoreHistory={scoreHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}
