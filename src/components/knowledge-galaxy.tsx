
"use client";

import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateKnowledgeGalaxyAction } from '@/app/actions';
import type { GenerateKnowledgeGalaxyOutput, Planet, Moon } from '@/ai/schemas';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2, Sparkles, BrainCircuit, FileUp, BookText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { GalaxyVisual } from './galaxy-visual';

const textFormSchema = z.object({
  subject: z.string().min(3, { message: "Subject must be at least 3 characters." }),
});

const fileFormSchema = z.object({
  file: z
    .any()
    .refine((files) => files?.length === 1, "File is required.")
    .refine((files) => files?.[0]?.size <= 5000000, `Max file size is 5MB.`)
    .refine(
      (files) => ["application/pdf", "text/plain"].includes(files?.[0]?.type),
      ".pdf and .txt files are accepted."
    ),
});

export function KnowledgeGalaxy() {
  const [galaxyData, setGalaxyData] = useState<GenerateKnowledgeGalaxyOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const textForm = useForm<z.infer<typeof textFormSchema>>({ 
    resolver: zodResolver(textFormSchema),
    defaultValues: { subject: "" },
  });

  const fileForm = useForm<z.infer<typeof fileFormSchema>>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: { file: undefined },
  });
  const fileRef = fileForm.register("file");

  const handleGeneration = async (values: { subject?: string; fileDataUri?: string }) => {
    setIsLoading(true);
    setGalaxyData(null);
    try {
      const result = await generateKnowledgeGalaxyAction(values);
      if (result.error) throw new Error(result.error);
      if (!result.galaxy || result.galaxy.planets.length === 0) {
        toast({
            title: "Could not build galaxy",
            description: "The AI was unable to generate a knowledge map for this. Try being more specific or using a different file.",
            variant: "destructive"
        });
        setGalaxyData(null);
      } else {
        setGalaxyData(result.galaxy);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: "Failed to create galaxy", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const onTextSubmit = async (values: z.infer<typeof textFormSchema>) => {
    await handleGeneration({ subject: values.subject });
  };

  const onFileSubmit = async (values: z.infer<typeof fileFormSchema>) => {
    const file = values.file[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        const fileDataUri = reader.result as string;
        await handleGeneration({ fileDataUri, subject: file.name.replace(/\.[^/.]+$/, "") });
    };
    reader.onerror = () => {
      toast({ variant: "destructive", title: "File Error", description: "Failed to read file."})
    }
  };


  return (
    <div className="space-y-6">
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
          <Tabs defaultValue="topic" className="w-full">
            <CardHeader className="p-6">
              <CardTitle className="text-2xl font-headline flex items-center gap-2">
                <Sparkles className="h-6 w-6" /> Knowledge Galaxy
              </CardTitle>
              <CardDescription>
                Enter a subject or upload a syllabus to visualize its core concepts as an interactive galaxy.
              </CardDescription>
              <TabsList className="grid w-full grid-cols-2 mt-4">
                <TabsTrigger value="topic"><BookText className="mr-2 h-4 w-4"/>From Topic</TabsTrigger>
                <TabsTrigger value="file"><FileUp className="mr-2 h-4 w-4"/>From File</TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="topic" className="p-0">
                <Form {...textForm}>
                <form onSubmit={textForm.handleSubmit(onTextSubmit)}>
                  <CardContent className="px-6 space-y-4">
                    <FormField
                      control={textForm.control}
                      name="subject"
                      render={({ field }) => (
                          <FormItem className="w-full">
                          <FormLabel>Enter a Subject</FormLabel>
                          <FormControl>
                              <Input placeholder="e.g., Quantum Mechanics, Data Structures, Macroeconomics..." {...field} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="px-6 pb-6">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Building...</> : <><BrainCircuit className="mr-2 h-4 w-4" />Build Galaxy from Topic</>}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="file" className="p-0">
               <Form {...fileForm}>
                <form onSubmit={fileForm.handleSubmit(onFileSubmit)}>
                   <CardContent className="px-6 space-y-4">
                      <FormField
                        control={fileForm.control}
                        name="file"
                        render={() => (
                          <FormItem>
                            <FormLabel>Upload Syllabus (PDF or TXT)</FormLabel>
                            <FormControl>
                              <Input
                                  type="file"
                                  accept=".pdf,.txt"
                                  {...fileRef}
                                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                   </CardContent>
                   <CardFooter className="px-6 pb-6">
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Building...</> : <><BrainCircuit className="mr-2 h-4 w-4" />Build Galaxy from File</>}
                      </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>

        {isLoading && (
            <Card>
                <CardContent className="p-6">
                    <div className="flex justify-center items-center h-[500px] flex-col gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground">AI is charting the cosmos of knowledge... this may take a moment.</p>
                    </div>
                </CardContent>
            </Card>
        )}

        {galaxyData && (
             <div
                className="relative rounded-xl border border-transparent bg-transparent p-[1.5px] shadow-lg animate-glowing-border"
                style={
                    { "--border-angle": "0deg", backgroundImage: "linear-gradient(var(--border-angle), hsl(var(--primary) / 0.5), hsl(var(--primary) / 0.1) 50%, hsl(var(--primary) / 0.5))" } as React.CSSProperties
                }
                >
                <Card className="w-full shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-headline flex items-center gap-2">
                            Galaxy for: {galaxyData.subject}
                        </CardTitle>
                        <CardDescription>
                            Click on a planet to see its moons (sub-topics). Hover over a moon to see its description. Click the sun to zoom out.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <GalaxyVisual galaxyData={galaxyData} />
                    </CardContent>
                </Card>
            </div>
        )}
    </div>
  );
}
