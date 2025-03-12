"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { FileText, List, Save, Loader2, LogIn, Check } from "lucide-react";

interface Action {
  id: string;
  text: string;
  timestamp: Date;
  completed: boolean;
}

export default function Home() {
  const { data: session } = useSession();
  const [noteFormat, setNoteFormat] = useState<string>("txt");
  const [noteContent, setNoteContent] = useState<string>("");
  const [actions, setActions] = useState<Action[]>([]);
  const [previousContent, setPreviousContent] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Load actions from API on mount and when session changes
  useEffect(() => {
    if (session) {
      fetch('/api/actions')
        .then(res => res.json())
        .then(data => setActions(data))
        .catch(error => console.error('Error loading actions:', error));
    }
  }, [session]);

  const extractNewContent = (oldContent: string, newContent: string): string => {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    const addedLines = newLines.filter(line => !oldLines.includes(line));
    return addedLines.join('\n');
  };

  const extractActionsWithAI = async (text: string) => {
    try {
      setIsProcessing(true);
      
      const response = await fetch('/api/extract-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to extract actions');
      }

      const data = await response.json();
      
      if (data.actions && data.actions !== "NO_ACTIONS") {
        const actionPromises = data.actions
          .split('\n')
          .filter((line: string) => line.trim())
          .map((text: string) => 
            fetch('/api/actions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ text: text.trim() }),
            }).then(res => res.json())
          );

        const newActions = await Promise.all(actionPromises);
        setActions(prevActions => [...prevActions, ...newActions]);
      }
    } catch (error) {
      console.error('Error extracting actions:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAndExtract = async () => {
    const newContent = extractNewContent(previousContent, noteContent);
    if (newContent.trim()) {
      await extractActionsWithAI(newContent);
    }
    setPreviousContent(noteContent);
  };

  const toggleActionComplete = async (action: Action) => {
    try {
      const response = await fetch('/api/actions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: action.id,
          completed: !action.completed,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update action');
      }

      const updatedAction = await response.json();
      setActions(prevActions =>
        prevActions.map(a =>
          a.id === updatedAction.id ? updatedAction : a
        )
      );
    } catch (error) {
      console.error('Error updating action:', error);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-8">ActionScribe</h1>
        <Button onClick={() => signIn('google')}>
          <LogIn className="w-4 h-4 mr-2" />
          Sign in with Google
        </Button>
      </div>
    );
  }

  const sortedActions = [...actions].sort((a, b) => {
    // Sort by completion status first
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // Then by timestamp (newest first)
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">ActionScribe</h1>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column - Note Input */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Select value={noteFormat} onValueChange={setNoteFormat}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="txt">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>.txt</span>
                  </div>
                </SelectItem>
                <SelectItem value="md">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>.md</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={handleSaveAndExtract}
              className="ml-auto"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isProcessing ? 'Processing...' : 'Save & Extract'}
            </Button>
          </div>
          
          <Textarea
            placeholder="Enter your notes here..."
            className="min-h-[600px] font-mono"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />
        </div>

        {/* Right Column - Extracted Actions */}
        <div>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <List className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Extracted Actions</h2>
              <span className="ml-auto text-sm text-muted-foreground">
                {actions.length} items
              </span>
            </div>
            
            <div className="space-y-2">
              {actions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No actions extracted yet. Write some notes and click "Save & Extract"!
                </p>
              ) : (
                sortedActions.map((action) => (
                  <div
                    key={action.id}
                    className={`p-3 rounded-lg bg-muted/50 flex items-start gap-2 ${
                      action.completed ? 'opacity-60' : ''
                    }`}
                    onClick={() => toggleActionComplete(action)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={`w-4 h-4 mt-1 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      action.completed ? 'bg-primary border-primary' : ''
                    }`}>
                      {action.completed && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <div className="flex-1">
                      <p className={action.completed ? 'line-through' : ''}>
                        {action.text}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(action.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
