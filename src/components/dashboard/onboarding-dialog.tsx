'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { lifeDesignChatOnboarding } from '@/ai/flows/life-design-chat-onboarding';
import type { LifeDesignChatOnboardingOutput } from '@/ai/flows/life-design-chat-onboarding';
import { Loader2 } from 'lucide-react';

interface OnboardingDialogProps {
  open: boolean;
  onOnboardingComplete: (data: LifeDesignChatOnboardingOutput, values: string) => void;
}

export function OnboardingDialog({ open, onOnboardingComplete }: OnboardingDialogProps) {
  const [userValues, setUserValues] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!userValues.trim()) {
      toast({
        title: 'Input required',
        description: 'Please tell us about your values and aspirations.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await lifeDesignChatOnboarding({ userValues });
      onOnboardingComplete(result, userValues);
       toast({
        title: 'Dashboard Created!',
        description: "Welcome to your new Life OS. Let's get started.",
      });
    } catch (error) {
      console.error('Onboarding failed:', error);
      toast({
        title: 'Onboarding Failed',
        description: 'There was an error setting up your dashboard. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to LifeArchitect AI</DialogTitle>
          <DialogDescription>
            Let's set up your personalized life dashboard. To start, please describe your values, aspirations, and any concerns you have. This will help the AI create a baseline for your journey.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="values">Your values, aspirations, and concerns</Label>
            <Textarea
              id="values"
              placeholder="e.g., 'I want to focus on my health, build stronger friendships, find more meaning in my work, and learn to be more mindful...'"
              value={userValues}
              onChange={(e) => setUserValues(e.target.value)}
              className="min-h-[140px] text-base"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading} size="lg">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create My Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
