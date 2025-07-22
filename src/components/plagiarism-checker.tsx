
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ScanSearch, FileUp, Sparkles } from "lucide-react";
import { checkPlagiarismAction } from "@/app/actions";
import type { PlagiarismCheckOutput } from "@/ai/schemas";
import { Skeleton } from "./ui/skeleton";
import { Progress } from "./ui/progress";

const formSchema = z.object({
  file1: z
    .any()
    .refine((files) => files?.length === 1, "First document is required.")
    .refine((files) => files?.[0]?.size <= 5000000, `Max file size is 5MB.`)
    .refine(
      (files) => ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(files?.[0]?.type),
      ".pdf, .txt, and .docx files are accepted."
    ),
  file2: z
    .any()
    .refine((files) => files?.length === 1, "Second document is required.")
    .refine((files) => files?.[0]?.size <= 5000000, `Max file size is 5MB.`)
    .refine(
      (files) => ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(files?.[0]?.type),
      ".pdf, .txt, and .docx files are accepted."
    ),
});

export function PlagiarismChecker() {
  const [checkResult, setCheckResult] = useState<PlagiarismCheckOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file1: undefined,
      file2: undefined,
    },
  });
  const file1Ref = form.register("file1");
  const file2Ref = form.register("file2");
  
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setCheckResult(null);

    try {
        const file1 = values.file1[0] as File;
        const file2 = values.file2[0] as File;

        const [doc1Content, doc2Content] = await Promise.all([
            readFileAsDataURL(file1),
            readFileAsDataURL(file2),
        ]);
        
        const result = await checkPlagiarismAction({
            doc1Name: file1.name,
            doc1Content,
            doc1MimeType: file1.type,
            doc2Name: file2.name,
            doc2Content,
            doc2MimeType: file2.type,
        });

        if (result.error) {
            throw new Error(result.error);
        }
        setCheckResult(result.result || null);
        if (result.result) {
            toast({
            title: "Analysis Complete",
            description: "The documents have been compared successfully.",
            });
        }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Error Checking Documents",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="text-2xl font-headline flex items-center gap-2">
                <ScanSearch className="h-6 w-6" /> AI Plagiarism Checker
              </CardTitle>
              <CardDescription>
                Upload two documents (PDF, TXT, DOCX) to compare them for potential plagiarism.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="file1"
                  render={() => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><FileUp className="h-4 w-4" />Document 1</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf,.txt,.docx,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          {...file1Ref}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="file2"
                  render={() => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><FileUp className="h-4 w-4" />Document 2</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf,.txt,.docx,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          {...file2Ref}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {isLoading && (
                <div className="space-y-4 pt-4">
                  <p className="text-sm text-center text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI is analyzing the documents... this may take a moment.
                  </p>
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              )}
              {checkResult && (
                <div className="space-y-6 pt-4">
                  <Card className="bg-secondary/30">
                    <CardHeader>
                        <CardTitle>Analysis Report</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between items-baseline mb-2">
                                <h4 className="font-semibold">Similarity Score</h4>
                                <span className="text-2xl font-bold text-primary">{checkResult.similarityPercentage.toFixed(2)}%</span>
                            </div>
                            <Progress value={checkResult.similarityPercentage} />
                        </div>
                        <div>
                            <h4 className="font-semibold">Verdict</h4>
                            <p className="text-muted-foreground">{checkResult.verdict}</p>
                        </div>
                    </CardContent>
                  </Card>
                   <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-yellow-500" />Detailed Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">{checkResult.analysis}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
                ) : ("Check for Plagiarism")}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
