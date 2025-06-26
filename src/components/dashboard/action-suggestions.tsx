'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lightbulb } from 'lucide-react';
import type { ActionItem } from './dashboard';

interface ActionSuggestionsProps {
  actionItems: ActionItem[];
  setActionItems: React.Dispatch<React.SetStateAction<ActionItem[]>>;
}

export function ActionSuggestions({ actionItems, setActionItems }: ActionSuggestionsProps) {
  const toggleAction = (id: string) => {
    setActionItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const sortedActionItems = [...actionItems].sort((a, b) => Number(a.completed) - Number(b.completed));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Action Items</CardTitle>
        <CardDescription>Suggested tasks to help you grow. Check them off as you go.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 pr-4">
          {sortedActionItems.length > 0 ? (
            <div className="space-y-4">
              {sortedActionItems.map(item => (
                <div key={item.id} className="flex items-start space-x-3 p-2 rounded-lg transition-colors hover:bg-muted/50">
                  <Checkbox
                    id={item.id}
                    checked={item.completed}
                    onCheckedChange={() => toggleAction(item.id)}
                    className="mt-1"
                  />
                  <Label
                    htmlFor={item.id}
                    className={`flex-1 text-sm leading-relaxed transition-all ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                  >
                    {item.text}
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
              <Lightbulb className="w-10 h-10 mb-4" />
              <p>No action items yet.</p>
              <p className="text-xs">Write a journal entry to get personalized suggestions.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
