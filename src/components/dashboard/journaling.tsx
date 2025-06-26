'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { parseJournalEntry } from '@/ai/flows/context-aware-daily-journaling';
import { suggestActions } from '@/ai/flows/goal-oriented-action-suggestions';
import { Loader2, Zap } from 'lucide-react';
import type { ActionItem, ScoreHistory, Scores } from './dashboard';

interface JournalingProps {
  scores: Scores;
  setScores: React.Dispatch<React.SetStateAction<Scores>>;
  setScoreHistory: React.Dispatch<React.SetStateAction<ScoreHistory[]>>;
  userValues: string;
  actionItems: ActionItem[];
  setActionItems: React.Dispatch<React.SetStateAction<ActionItem[]>>;
}

export function Journaling({ scores, setScores, setScoreHistory, userValues, actionItems, setActionItems }: JournalingProps) {
  const [journalEntry, setJournalEntry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getWeakAreas = (s: Scores) => {
    const sortedScores = Object.entries(s).sort(([, a], [, b]) => a - b);
    return sortedScores.slice(0, 2).map(s => s[0]).join(', ');
  }

  const handleSubmit = async () => {
    if (!journalEntry.trim()) {
      toast({ title: 'Journal entry is empty', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const result = await parseJournalEntry({
        journalEntry,
        ...scores
      });

      const newScores: Scores = {
        social: result.updatedSocialScore,
        personal: result.updatedPersonalScore,
        professional: result.updatedProfessionalScore,
        spiritual: result.updatedSpiritualScore,
      };
      setScores(newScores);
      setScoreHistory(prev => [...prev.slice(-30), { date: new Date().toISOString(), scores: newScores }]);
      toast({ title: 'Dashboard Updated', description: result.feedback });
      
      const actionResult = await suggestActions({
        weakAreas: getWeakAreas(newScores),
        userValues,
        ...newScores
      });

      const newActions: ActionItem[] = actionResult.suggestedActions.map(text => ({ id: crypto.randomUUID(), text, completed: false }));
      const uniqueNewActions = newActions.filter(newAction => !actionItems.some(existing => existing.text === newAction.text));
      setActionItems(prev => [...uniqueNewActions, ...prev]);

      if (uniqueNewActions.length > 0) {
        toast({ title: 'New Actions Suggested!', description: 'Check your action items list.', });
      }

      setJournalEntry('');

    } catch (error) {
      console.error('Journaling failed:', error);
      toast({ title: 'Error Processing Entry', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Daily Journal</CardTitle>
        <CardDescription>How was your day? Reflect on your experiences to update your dashboard.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Today I connected with an old friend, which was great for my social battery..."
          value={journalEntry}
          onChange={(e) => setJournalEntry(e.target.value)}
          className="min-h-[150px] text-base"
        />
        <Button onClick={handleSubmit} disabled={isLoading} className="w-full" size="lg">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
          Process Entry & Get Insights
        </Button>
      </CardContent>
    </Card>
  );
}
