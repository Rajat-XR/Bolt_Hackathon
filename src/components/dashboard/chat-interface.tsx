'use client';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { conversationalChat, type ConversationalChatOutput } from '@/ai/flows/conversational-chat';
import { Loader2, Send, Bot, User } from 'lucide-react';
import type { Scores } from './dashboard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '@/lib/utils';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: any;
};

interface ChatInterfaceProps {
  scores: Scores;
  userValues: string;
  memories: string[];
  chatHistory: ChatMessage[];
  onNewChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>;
  onAIAssistantResponse: (output: ConversationalChatOutput) => void;
}

export function ChatInterface({ scores, userValues, memories, chatHistory, onNewChatMessage, onAIAssistantResponse }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Omit<ChatMessage, 'id' | 'timestamp'> = { role: 'user', content: input };
    
    setIsLoading(true);
    setInput('');
    await onNewChatMessage(userMessage);

    try {
        const assistantHistory = chatHistory.map(m => ({role: m.role, content: m.content as string}));

        const result = await conversationalChat({
            message: input,
            chatHistory: assistantHistory,
            scores,
            userValues,
            memories,
        });

        const assistantMessage: Omit<ChatMessage, 'id' | 'timestamp'> = { role: 'assistant', content: result.response };
        await onNewChatMessage(assistantMessage);
        
        onAIAssistantResponse(result);
        
        if (result.feedback) {
            toast({ title: 'Dashboard Updated!', description: result.feedback });
        }
        if (result.newActions && result.newActions.length > 0) {
            toast({ title: 'New Actions Suggested!', description: 'Check your action items list.' });
        }
        if (result.newMemory) {
            toast({ title: 'Memory Saved!', description: 'I\'ll remember that.' });
        }

    } catch (error) {
      console.error('Chat failed:', error);
      toast({ title: 'Error Processing Message', description: 'Something went wrong. Please try again.', variant: 'destructive' });
      const errorMessage: Omit<ChatMessage, 'id' | 'timestamp'> = { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again." };
      await onNewChatMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="lg:col-span-2 flex flex-col h-[500px]">
      <CardHeader>
        <CardTitle>Chat with your AI Coach</CardTitle>
        <CardDescription>Talk about your day, ask for advice, and get insights.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {chatHistory.map((message) => (
              <div key={message.id} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20}/></AvatarFallback>
                  </Avatar>
                )}
                <div className={cn("p-3 rounded-lg max-w-sm md:max-w-md", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback><User size={20} /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && chatHistory.at(-1)?.role === 'user' && (
                <div className="flex items-start gap-3 justify-start">
                    <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20}/></AvatarFallback>
                    </Avatar>
                    <div className="p-3 rounded-lg bg-muted flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-2">
            <Input
              placeholder="Message your AI coach..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="text-base flex-1"
              disabled={isLoading}
              autoComplete="off"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
        </form>
      </CardContent>
    </Card>
  );
}
