
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateClassroomGameAction, getLeaderboardAction, createCustomQuizAction } from '@/app/actions';
import { CreateCustomQuizInputSchema, type GenerateClassroomGameOutput, type GameLeaderboardRecord, type CustomQuizQuestion } from '@/ai/schemas';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Gamepad2, BrainCircuit, Trophy, Send, PlusCircle, Trash2, Copy, Share2, Link as LinkIcon, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const aiFormSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters." }),
});

const CustomQuizCreator = ({ setQuizLink, setLiveTopic }: { setQuizLink: (link: string) => void; setLiveTopic: (topic: string) => void; }) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof CreateCustomQuizInputSchema>>({
        resolver: zodResolver(CreateCustomQuizInputSchema),
        defaultValues: {
            topic: "",
            questions: [{ question: "", options: { A: "", B: "", C: "", D: "" }, answer: "A" }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "questions"
    });

    const onSubmit = async (values: z.infer<typeof CreateCustomQuizInputSchema>) => {
        setIsLoading(true);
        try {
            const result = await createCustomQuizAction(values);
            if (result.error) throw new Error(result.error);

            const quizId = result.quizId;
            const link = `${window.location.origin}/quiz/${quizId}`;
            setQuizLink(link);
            setLiveTopic(values.topic);
            toast({ title: "Quiz Created!", description: "Share the link with your students." });
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Failed to create quiz", description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="topic" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Quiz Topic</FormLabel>
                        <FormControl><Input placeholder="e.g., Final Review on Thermodynamics" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <Separator />

                {fields.map((field, index) => (
                    <Card key={field.id} className="p-4 bg-secondary/50">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold">Question {index + 1}</h4>
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                        <div className="space-y-4">
                             <FormField control={form.control} name={`questions.${index}.question`} render={({ field }) => (
                                <FormItem><FormLabel>Question Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                             )} />
                             <div className="grid grid-cols-2 gap-4">
                                 <FormField control={form.control} name={`questions.${index}.options.A`} render={({ field }) => (
                                    <FormItem><FormLabel>Option A</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                 )} />
                                 <FormField control={form.control} name={`questions.${index}.options.B`} render={({ field }) => (
                                    <FormItem><FormLabel>Option B</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                 )} />
                                 <FormField control={form.control} name={`questions.${index}.options.C`} render={({ field }) => (
                                    <FormItem><FormLabel>Option C</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                 )} />
                                 <FormField control={form.control} name={`questions.${index}.options.D`} render={({ field }) => (
                                    <FormItem><FormLabel>Option D</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                 )} />
                             </div>
                             <FormField control={form.control} name={`questions.${index}.answer`} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Correct Answer</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="A">Option A</SelectItem>
                                            <SelectItem value="B">Option B</SelectItem>
                                            <SelectItem value="C">Option C</SelectItem>
                                            <SelectItem value="D">Option D</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                             )} />
                        </div>
                    </Card>
                ))}

                <Button type="button" variant="outline" onClick={() => append({ question: "", options: { A: "", B: "", C: "", D: "" }, answer: "A" })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Question
                </Button>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Quiz...</> : 'Create & Get Link'}
                </Button>
            </form>
        </Form>
    )
};


const Leaderboard = ({ topic }: { topic: string }) => {
    const [records, setRecords] = useState<GameLeaderboardRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLeaderboard = useCallback(async () => {
        setIsLoading(true);
        const result = await getLeaderboardAction(topic);
        if (result.records) {
            setRecords(result.records);
        }
        setIsLoading(false);
    }, [topic]);

    useEffect(() => {
        if (!topic) return;
        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, [topic, fetchLeaderboard]);
    
    if (!topic) return null;

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Trophy className="text-yellow-500" /> Live Leaderboard</CardTitle>
                <CardDescription>Scores for "{topic}"</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && <Skeleton className="h-40 w-full" />}
                {!isLoading && records.length === 0 && <p className="text-sm text-center text-muted-foreground py-8">No scores yet. Waiting for players...</p>}
                {!isLoading && records.length > 0 && (
                     <ol className="space-y-3">
                        {records.map((r, i) => (
                            <li key={r.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-secondary/50">
                                <span className="font-medium truncate">
                                    {i === 0 && '🥇'}
                                    {i === 1 && '🥈'}
                                    {i === 2 && '🥉'}
                                    {i > 2 && `${i + 1}.`}
                                    &nbsp;{r.player_name}
                                </span>
                                <span className="font-bold text-primary">{r.score} pts</span>
                            </li>
                        ))}
                    </ol>
                )}
            </CardContent>
        </Card>
    )
};

export function ClassroomGamifier() {
  const [quizLink, setQuizLink] = useState<string>('');
  const [liveTopic, setLiveTopic] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof aiFormSchema>>({ 
    resolver: zodResolver(aiFormSchema),
    defaultValues: {
      topic: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof aiFormSchema>) => {
    setIsLoading(true);
    setQuizLink('');
    setLiveTopic('');
    try {
      const result = await generateClassroomGameAction(values.topic);
      if (result.error) throw new Error(result.error);
      
      if (result.game) {
        const customQuizInput: z.infer<typeof CreateCustomQuizInputSchema> = {
            topic: values.topic,
            questions: result.game.quiz.map(q => ({
                question: q.question,
                options: q.options,
                answer: q.answer
            }))
        };
        const createResult = await createCustomQuizAction(customQuizInput);
        if (createResult.error) throw new Error(createResult.error);
        
        const link = `${window.location.origin}/quiz/${createResult.quizId}`;
        setQuizLink(link);
        setLiveTopic(values.topic);
        toast({ title: "AI Quiz Generated!", description: "A shareable quiz link has been created."})
      } else {
        throw new Error("AI failed to generate a game.");
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: "Failed to create game", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(quizLink);
    toast({ title: "Link Copied!", description: "The quiz link is ready to be shared."})
  }

  const handleNewQuiz = () => {
    setQuizLink('');
    setLiveTopic('');
  }

  return (
    <div
          className="relative rounded-xl border border-transparent bg-transparent p-[1.5px] shadow-lg animate-glowing-border"
          style={
            {
              "--border-angle": "0deg",
              backgroundImage:
                "linear-gradient(var(--border-angle), hsl(var(--primary) / 0.5), hsl(var(--primary) / 0.1) 50%, hsl(var(--primary) / 0.5))",
            } as React.CSSProperties
          }
        >
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2">
          <Gamepad2 className="h-6 w-6" /> Classroom Gamifier
        </CardTitle>
        <CardDescription>
          Create a live, shareable quiz for your students using AI or by setting your own questions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {quizLink ? (
            <div className="text-center space-y-4 p-8 border-2 border-dashed rounded-lg">
                 <div className="flex justify-center items-center mb-4">
                    <div className="p-3 rounded-full bg-green-500/10">
                        <Share2 className="h-8 w-8 text-green-500" />
                    </div>
                </div>
                <h3 className="text-2xl font-bold">Quiz is Live!</h3>
                <p className="text-muted-foreground">Share this link with your students to have them join the quiz.</p>
                <div className="flex w-full max-w-md mx-auto items-center space-x-2">
                    <Input value={quizLink} readOnly />
                    <Button onClick={copyToClipboard} size="icon">
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                 <Button variant="outline" onClick={handleNewQuiz}>
                    <PlusCircle className="mr-2 h-4 w-4"/>Create Another Quiz
                </Button>
            </div>
        ) : (
             <Tabs defaultValue="create" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="create"><Edit className="mr-2 h-4 w-4"/>Create Your Own</TabsTrigger>
                    <TabsTrigger value="ai"><BrainCircuit className="mr-2 h-4 w-4"/>Use AI Generator</TabsTrigger>
                </TabsList>
                <TabsContent value="create" className="mt-6">
                     <CustomQuizCreator setQuizLink={setQuizLink} setLiveTopic={setLiveTopic} />
                </TabsContent>
                <TabsContent value="ai" className="mt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg mx-auto">
                        <FormField
                            control={form.control}
                            name="topic"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Enter Topic</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g. The Laws of Thermodynamics" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Game...</> : <><BrainCircuit className="mr-2 h-4 w-4" />Generate Classroom Game</>}
                        </Button>
                        </form>
                    </Form>
                </TabsContent>
             </Tabs>
        )}
        <Leaderboard topic={liveTopic} />
      </CardContent>
    </Card>
    </div>
  );
}
