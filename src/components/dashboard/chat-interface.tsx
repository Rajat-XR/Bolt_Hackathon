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

export function ChatInterface({ scores, userValues, memories, chatHistory: firestoreHistory, onNewChatMessage, onAIAssistantResponse }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [localChatHistory, setLocalChatHistory] = useState<ChatMessage[]>(firestoreHistory);

  useEffect(() => {
    setLocalChatHistory(firestoreHistory);
  }, [firestoreHistory]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [localChatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userInput = input;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: userInput, timestamp: new Date() };

    setLocalChatHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    onNewChatMessage({ role: 'user', content: userInput });

    try {
        const historyForAI = [...localChatHistory].map(m => ({role: m.role, content: m.content as string}));

        const result = await conversationalChat({
            message: userInput,
            chatHistory: historyForAI.slice(0, -1),
            scores,
            userValues,
            memories,
        });

        const assistantMessage: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: result.response, timestamp: new Date() };
        setLocalChatHistory(prev => [...prev, assistantMessage]);
        
        onNewChatMessage({ role: 'assistant', content: result.response });
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
      const errorText = "I'm sorry, I encountered an error. This could be due to an invalid API key or a network issue. Please check your configuration and try again.";
      const errorMessage: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: errorText, timestamp: new Date() };
      
      setLocalChatHistory(prev => [...prev, errorMessage]);
      onNewChatMessage({ role: 'assistant', content: errorText });
      
      toast({ title: 'Error Processing Message', description: 'Something went wrong. Please try again.', variant: 'destructive' });
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
            {localChatHistory.map((message) => (
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
             {isLoading && (
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
