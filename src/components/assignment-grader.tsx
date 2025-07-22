
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
import { Loader2, GraduationCap, FileUp, Sparkles, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { gradeAssignmentAction } from "@/app/actions";
import type { GradeAssignmentOutput } from "@/ai/schemas";
import { Skeleton } from "./ui/skeleton";

const formSchema = z.object({
    studentName: z.string().min(2, { message: "Student name must be at least 2 characters." }),
    subject: z.string().min(2, { message: "Subject must be at least 2 characters." }),
    file: z
        .any()
        .refine((files) => files?.length === 1, "Assignment file is required.")
        .refine((files) => files?.[0]?.size <= 5000000, `Max file size is 5MB.`)
        .refine(
            (files) => ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(files?.[0]?.type),
            ".pdf and .docx files are accepted."
        ),
});

export function AssignmentGrader() {
  const [gradingResult, setGradingResult] = useState<GradeAssignmentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: "",
      subject: "",
      file: undefined,
    },
  });
  const fileRef = form.register("file");

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
    setGradingResult(null);

    try {
        const file = values.file[0];
        const fileDataUri = await readFileAsDataURL(file);

        const result = await gradeAssignmentAction({
            studentName: values.studentName,
            subject: values.subject,
            fileDataUri: fileDataUri,
        });

        if (result.error) {
            throw new Error(result.error);
        }
        setGradingResult(result.result || null);
        if (result.result) {
             toast({
                title: "Grading Complete",
                description: "The assignment has been successfully graded and saved.",
            });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({
            variant: "destructive",
            title: "Error Grading Assignment",
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
              <GraduationCap className="h-6 w-6" /> AI Assignment Grader
            </CardTitle>
            <CardDescription>
              Upload a student's assignment (PDF/DOCX) to get an AI-powered score and feedback.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                 <FormField
                    control={form.control}
                    name="studentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Alex Johnson" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Quantum Physics" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
            </div>
            <FormField
                control={form.control}
                name="file"
                render={() => (
                    <FormItem>
                        <FormLabel className="flex items-center gap-2"><FileUp className="h-4 w-4" />Assignment Document</FormLabel>
                        <FormControl>
                            <Input
                                type="file"
                                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                {...fileRef}
                                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
             {isLoading && (
                 <div className="space-y-4 pt-4">
                     <p className="text-sm text-center text-muted-foreground flex items-center justify-center gap-2">
                         <Loader2 className="h-4 w-4 animate-spin" />
                         AI is reading and grading the assignment... this may take a moment.
                     </p>
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            )}
            {gradingResult && (
                <div className="space-y-4 pt-4">
                    <Alert variant="default" className="bg-secondary/50">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle className="text-xl">Grading Complete!</AlertTitle>
                        <AlertDescription className="space-y-2">
                             <div className="flex items-baseline gap-2 pt-2">
                                <span className="text-4xl font-bold text-primary">{gradingResult.score}</span>
                                <span className="text-lg text-muted-foreground">/ 10</span>
                            </div>
                            <div>
                                <h4 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-yellow-500" />Feedback</h4>
                                <p className="text-muted-foreground">{gradingResult.feedback}</p>
                            </div>
                        </AlertDescription>
                    </Alert>
                </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Grading...</>
              ) : ("Grade Assignment")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
    </div>
  );
}
