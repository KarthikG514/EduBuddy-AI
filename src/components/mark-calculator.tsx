
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Loader2, Calculator, Wand2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SaveInternalMarksInputSchema, type SaveInternalMarksInput } from "@/ai/schemas";
import { saveInternalMarksAction } from "@/app/actions";

export function MarkCalculator() {
  const [generatedFeedback, setGeneratedFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<SaveInternalMarksInput>({
    resolver: zodResolver(SaveInternalMarksInputSchema),
    defaultValues: {
      student_name: "",
      roll_no: "",
      subject: "",
      test1: undefined,
      test2: undefined,
      assignment: undefined,
      attendance: undefined,
    },
  });

  async function onSubmit(values: SaveInternalMarksInput) {
    setIsLoading(true);
    setGeneratedFeedback(null);

    try {
      const result = await saveInternalMarksAction(values);
      if (result.error) {
        throw new Error(result.error);
      }
      setGeneratedFeedback(result.feedback || "No feedback was generated.");
      toast({
        title: "Success!",
        description: "Student marks and feedback have been saved.",
      });
      form.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Error",
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
              <Calculator className="h-6 w-6" /> Mark Calculator
            </CardTitle>
            <CardDescription>
              Enter student marks to calculate internal score, grade, and generate AI feedback.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="student_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Keerthi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="roll_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roll Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ECE021" {...field} />
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
                      <Input placeholder="e.g., Digital Signal Processing" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              <FormField
                control={form.control}
                name="test1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test 1 (out of 10)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="10" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="test2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test 2 (out of 10)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="10" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assignment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignment (out of 10)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="10" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="attendance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attendance (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {generatedFeedback && (
              <Alert>
                <Wand2 className="h-4 w-4" />
                <AlertTitle>AI Generated Feedback</AlertTitle>
                <AlertDescription>
                  {generatedFeedback}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Calculating & Saving...</>
              ) : ("Calculate & Generate Feedback")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
    </div>
  );
}
