
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateAdviceAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookCopy, Upload, CheckCircle2, SkipForward, RefreshCw, AlertTriangle, BookMarked } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { GenerateAdviceOutput } from "@/ai/schemas";
import { GlowCard } from "./ui/spotlight-card";

// Form Schemas
const textFormSchema = z.object({
  subject: z.string().min(2, { message: "Subject must be at least 2 characters." }),
  text: z.string().min(100, { message: "Please paste at least 100 characters of content." }),
});

const fileFormSchema = z.object({
  subject: z.string().min(2, { message: "Subject must be at least 2 characters." }),
  file: z
    .any()
    .refine((files) => files?.length === 1, "File is required.")
    .refine((files) => files?.[0]?.size <= 5000000, `Max file size is 5MB.`)
    .refine(
      (files) => ["application/pdf", "text/plain"].includes(files?.[0]?.type),
      ".pdf and .txt files are accepted."
    ),
});

// Main Component
export function TeachingPlanAdvisor() {
  const [adviceResult, setAdviceResult] = useState<GenerateAdviceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const textForm = useForm<z.infer<typeof textFormSchema>>({
    resolver: zodResolver(textFormSchema),
    defaultValues: { subject: "", text: "" },
  });

  const fileForm = useForm<z.infer<typeof fileFormSchema>>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: { subject: "", file: undefined },
  });
  const fileRef = fileForm.register("file");

  async function onTextSubmit(values: z.infer<typeof textFormSchema>) {
    setIsLoading(true);
    setAdviceResult(null);

    try {
      const result = await generateAdviceAction({ text: values.text, subject: values.subject });
      if (result.error) {
        throw new Error(result.error);
      }
      setAdviceResult(result.advice || null);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function onFileSubmit(values: z.infer<typeof fileFormSchema>) {
    setIsLoading(true);
    setAdviceResult(null);

    const file = values.file[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const fileDataUri = reader.result as string;

      try {
        const result = await generateAdviceAction({ fileDataUri, subject: values.subject });
        if (result.error) {
          throw new Error(result.error);
        }
        setAdviceResult(result.advice || null);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = (error) => {
      toast({
        variant: "destructive",
        title: "Error Reading File",
        description: "There was a problem reading your file.",
      });
      setIsLoading(false);
    };
  }
  
  function handleError(error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Error Generating Advice",
        description: errorMessage,
      });
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
        <Tabs defaultValue="paste" className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center gap-2">
                <BookMarked className="h-6 w-6" /> Teaching Plan Advisor
            </CardTitle>
            <CardDescription>
                Paste your syllabus or upload a file to get AI-powered teaching advice.
            </CardDescription>
            <TabsList className="grid w-full grid-cols-2 mt-4">
              <TabsTrigger value="paste"><BookCopy className="mr-2 h-4 w-4" />Paste Content</TabsTrigger>
              <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4" />Upload File</TabsTrigger>
            </TabsList>
          </CardHeader>

          <TabsContent value="paste" className="p-0">
            <Form {...textForm}>
              <form onSubmit={textForm.handleSubmit(onTextSubmit)}>
                <CardContent className="px-6 pb-6 space-y-4">
                  <FormField
                    control={textForm.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Advanced Algorithms" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={textForm.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Syllabus or Lecture Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paste your course content here..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="px-6 pb-6">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
                    ) : ("Get Advice")}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="upload" className="p-0">
            <Form {...fileForm}>
              <form onSubmit={fileForm.handleSubmit(onFileSubmit)}>
                <CardContent className="px-6 pb-6 space-y-4">
                  <FormField
                      control={fileForm.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Introduction to AI" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  <FormField
                    control={fileForm.control}
                    name="file"
                    render={({ field }) => (
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
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
                    ) : ("Get Advice from File")}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </Card>

      {isLoading && <AdviceSkeleton />}
      {adviceResult && <AdviceDisplay advice={adviceResult} />}
    </div>
  );
}

function AdviceSkeleton() {
  return (
    <Card className="w-full shadow-lg mt-8">
      <CardHeader>
        <Skeleton className="h-8 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AdviceDisplay({ advice }: { advice: GenerateAdviceOutput }) {
  const renderList = (items: string[], emptyText: string) => {
    if (!items || items.length === 0) {
      return <p className="text-muted-foreground text-sm">{emptyText}</p>;
    }
    return (
      <ul className="list-disc list-inside space-y-1 text-card-foreground">
        {items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    );
  };
  
  return (
    <Card className="w-full shadow-lg mt-8 bg-transparent border-none">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">AI Teaching Advice</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <GlowCard customSize className="p-4" glowColor="green">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><CheckCircle2 className="h-5 w-5 text-green-400" /> Covered Topics</h3>
            {renderList(advice.coveredTopics, "No specific topics were identified.")}
        </GlowCard>
         <GlowCard customSize className="p-4" glowColor="blue">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><SkipForward className="h-5 w-5 text-blue-400" /> Next Topic to Teach</h3>
            <p className="text-card-foreground">{advice.nextTopic || "Could not determine the next logical topic."}</p>
        </GlowCard>
         <GlowCard customSize className="p-4" glowColor="orange">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><RefreshCw className="h-5 w-5 text-orange-400" /> Suggested Revisions</h3>
            {renderList(advice.suggestedRevisions, "No specific revision suggestions.")}
        </GlowCard>
        <GlowCard customSize className="p-4" glowColor="red">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><AlertTriangle className="h-5 w-5 text-red-400" /> Missed or Skipped Concepts</h3>
            {renderList(advice.skippedConcepts, "No missed or skipped concepts were identified.")}
        </GlowCard>
      </CardContent>
    </Card>
  );
}
