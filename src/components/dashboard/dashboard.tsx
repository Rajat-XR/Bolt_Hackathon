'use client';

import { useEffect, useState } from 'react';
import { OnboardingDialog } from './onboarding-dialog';
import { DomainScores } from './domain-scores';
import { Journaling } from './journaling';
import { ActionSuggestions } from './action-suggestions';
import { GrowthTracker } from './growth-tracker';
import type { LifeDesignChatOnboardingOutput } from '@/ai/flows/life-design-chat-onboarding';
import { Skeleton } from '@/components/ui/skeleton';

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
                <Skeleton className="h-72 rounded-lg lg:col-span-2" />
                <Skeleton className="h-72 rounded-lg" />
                <Skeleton className="h-80 rounded-lg lg:col-span-3" />
            </div>
        </div>
    );
}

export function Dashboard() {
  const [isClient, setIsClient] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [userValues, setUserValues] = useState('');
  const [dashboardDescription, setDashboardDescription] = useState('Your personalized insights will appear here.');
  const [scores, setScores] = useState<Scores>({ social: 50, personal: 50, professional: 50, spiritual: 50 });
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  useEffect(() => {
    setIsClient(true);
    const completed = localStorage.getItem('onboardingCompleted');
    if (completed === 'true') {
      setIsOnboardingCompleted(true);
      const savedScores = localStorage.getItem('scores');
      if (savedScores) setScores(JSON.parse(savedScores));
      const savedHistory = localStorage.getItem('scoreHistory');
      if (savedHistory) setScoreHistory(JSON.parse(savedHistory));
      const savedActions = localStorage.getItem('actionItems');
      if (savedActions) setActionItems(JSON.parse(savedActions));
      const savedValues = localStorage.getItem('userValues');
      if (savedValues) setUserValues(savedValues);
      const savedDesc = localStorage.getItem('dashboardDescription');
      if (savedDesc) setDashboardDescription(savedDesc);
    } else {
        const today = new Date().toISOString().split('T')[0];
        setScoreHistory([{ date: today, scores }]);
    }
  }, []);

  useEffect(() => {
    if (isOnboardingCompleted && isClient) {
      localStorage.setItem('scores', JSON.stringify(scores));
      localStorage.setItem('scoreHistory', JSON.stringify(scoreHistory));
      localStorage.setItem('actionItems', JSON.stringify(actionItems));
      localStorage.setItem('userValues', userValues);
      localStorage.setItem('dashboardDescription', dashboardDescription);
    }
  }, [scores, scoreHistory, actionItems, isOnboardingCompleted, userValues, dashboardDescription, isClient]);

  const handleOnboardingComplete = (data: LifeDesignChatOnboardingOutput, values: string) => {
    const newScores = {
      social: data.socialScore,
      personal: data.personalScore,
      professional: data.professionalScore,
      spiritual: data.spiritualScore,
    };
    const today = new Date().toISOString().split('T')[0];
    const newHistory = [{ date: today, scores: newScores }];

    setScores(newScores);
    setScoreHistory(newHistory);
    setUserValues(values);
    setDashboardDescription(data.dashboardDescription);
    setIsOnboardingCompleted(true);
    localStorage.setItem('onboardingCompleted', 'true');
  };
  
  if (!isClient) {
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
          <Journaling 
            scores={scores} 
            setScores={setScores} 
            setScoreHistory={setScoreHistory}
            userValues={userValues}
            setActionItems={setActionItems}
            actionItems={actionItems}
          />
          <ActionSuggestions actionItems={actionItems} setActionItems={setActionItems} />
          <div className="lg:col-span-3">
            <GrowthTracker scoreHistory={scoreHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}
