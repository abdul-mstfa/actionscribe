"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { FileText, List, Save, Loader2 } from "lucide-react";

interface Action {
  id: string;
  text: string;
  timestamp: number;
  source: string;
}

export default function Home() {
  const [noteFormat, setNoteFormat] = useState<string>("txt");
  const [noteContent, setNoteContent] = useState<string>("");
  const [actions, setActions] = useState<Action[]>([]);
  const [previousContent, setPreviousContent] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Load saved actions from localStorage on mount
  useEffect(() => {
    const savedActions = localStorage.getItem('actions');
    if (savedActions) {
      setActions(JSON.parse(savedActions));
    }
  }, []);

  // Save actions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('actions', JSON.stringify(actions));
  }, [actions]);

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
        const newActionItems = data.actions
          .split('\n')
          .filter((line: string) => line.trim())
          .map((text: string) => ({
            id: Math.random().toString(36).substr(2, 9),
            text: text.trim(),
            timestamp: Date.now(),
            source: 'ai'
          }));

        // Append new actions without duplicates
        setActions(prevActions => {
          const existingTexts = new Set(prevActions.map(a => a.text.toLowerCase()));
          const uniqueNewActions = newActionItems.filter(
            (action: Action) => !existingTexts.has(action.text.toLowerCase())
          );
          return [...prevActions, ...uniqueNewActions];
        });
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

  const formatTimestamp = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

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
                actions.map((action) => (
                  <div
                    key={action.id}
                    className="p-3 rounded-lg bg-muted/50 flex items-start gap-2"
                  >
                    <div className="w-4 h-4 mt-1 rounded-full border-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p>{action.text}</p>
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
