
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import jsPDF from "jspdf";
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
import { Loader2, FileDown, FileText, Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { generateQuestionPaperAction } from "@/app/actions";
import type { GenerateQuestionPaperOutput } from "@/ai/schemas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const topicFormSchema = z.object({
  subject: z.string().min(2, { message: "Subject must be at least 2 characters." }),
  unit: z.string().min(2, { message: "Unit/Topic must be at least 2 characters." }),
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

export function QuestionPaperGenerator() {
  const [generatedPaper, setGeneratedPaper] = useState<GenerateQuestionPaperOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState({ subject: "", unit: "" });
  const { toast } = useToast();

  const topicForm = useForm<z.infer<typeof topicFormSchema>>({
    resolver: zodResolver(topicFormSchema),
    defaultValues: { subject: "", unit: "" },
  });

  const fileForm = useForm<z.infer<typeof fileFormSchema>>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: { subject: "", file: undefined },
  });
  const fileRef = fileForm.register("file");

  const handleGeneration = async (values: { subject: string; unit?: string; fileDataUri?: string }) => {
    setIsLoading(true);
    setGeneratedPaper(null);
    setFormState({ subject: values.subject, unit: values.unit || `From File` });

    try {
      const result = await generateQuestionPaperAction(values);
      if (result.error) throw new Error(result.error);
      
      setGeneratedPaper(result.paper || null);
      if (!result.paper || result.paper.oneMarkQuestions.length === 0) {
        toast({
            title: "No Content Generated",
            description: "The AI couldn't generate a question paper for the given criteria. Try different options.",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Error Generating Paper",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  async function onTopicSubmit(values: z.infer<typeof topicFormSchema>) {
    await handleGeneration(values);
  }

  async function onFileSubmit(values: z.infer<typeof fileFormSchema>) {
    const file = values.file[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        const fileDataUri = reader.result as string;
        await handleGeneration({ subject: values.subject, fileDataUri });
    };
    reader.onerror = () => {
        toast({ variant: "destructive", title: "File Error", description: "Failed to read the uploaded file." });
    };
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
        <Tabs defaultValue="topic" className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl font-headline flex items-center gap-2">
                <FileText className="h-6 w-6" /> Question Paper Generator
              </CardTitle>
              <CardDescription>
                Generate a balanced question paper for engineering exams from a topic or a document.
              </CardDescription>
              <TabsList className="grid w-full grid-cols-2 mt-4">
                <TabsTrigger value="topic"><FileText className="mr-2 h-4 w-4"/>From Topic</TabsTrigger>
                <TabsTrigger value="file"><Upload className="mr-2 h-4 w-4"/>From File</TabsTrigger>
              </TabsList>
            </CardHeader>
            <TabsContent value="topic" className="p-0">
                <Form {...topicForm}>
                <form onSubmit={topicForm.handleSubmit(onTopicSubmit)}>
                    <CardContent className="space-y-4 px-6 pb-6">
                    <FormField
                        control={topicForm.control}
                        name="subject"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Computer Networks" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={topicForm.control}
                        name="unit"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Unit / Topic</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Unit 3: Transport Layer" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </CardContent>
                    <CardFooter className="px-6 pb-6">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
                        ) : ( "Generate from Topic" )}
                    </Button>
                    </CardFooter>
                </form>
                </Form>
            </TabsContent>
            <TabsContent value="file" className="p-0">
                <Form {...fileForm}>
                <form onSubmit={fileForm.handleSubmit(onFileSubmit)}>
                    <CardContent className="space-y-4 px-6 pb-6">
                    <FormField
                        control={fileForm.control}
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
                        control={fileForm.control}
                        name="file"
                        render={() => (
                        <FormItem>
                            <FormLabel>Syllabus or Notes (PDF/TXT)</FormLabel>
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
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
                        ) : ( "Generate from File" )}
                    </Button>
                    </CardFooter>
                </form>
                </Form>
            </TabsContent>
        </Tabs>
      </Card>
      
      {isLoading && <PaperSkeleton />}
      {generatedPaper && <PaperDisplay paper={generatedPaper} subject={formState.subject} unit={formState.unit} />}
    </div>
  );
}

function PaperDisplay({ paper, subject, unit }: { paper: GenerateQuestionPaperOutput; subject: string; unit: string }) {
  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    let y = 20;

    const checkPageBreak = (spaceNeeded: number) => {
        if (y + spaceNeeded > pageHeight - 20) {
            doc.addPage();
            y = 20;
        }
    };

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(subject, pageWidth / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(unit, pageWidth / 2, y, { align: 'center' });
    y += 15;

    // --- 1-Mark Questions ---
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Part A: 1-Mark Questions (10 x 1 = 10 Marks)', 15, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    paper.oneMarkQuestions.forEach((mcq, index) => {
        const questionText = `${index + 1}. ${mcq.question}`;
        const splitQuestion = doc.splitTextToSize(questionText, pageWidth - 30);
        checkPageBreak(splitQuestion.length * 5 + 25);
        doc.text(splitQuestion, 15, y);
        y += splitQuestion.length * 5 + 2;

        const options = [`a) ${mcq.options.a}`, `b) ${mcq.options.b}`, `c) ${mcq.options.c}`, `d) ${mcq.options.d}`];
        options.forEach(opt => {
            const splitOption = doc.splitTextToSize(opt, pageWidth - 40);
            doc.text(splitOption, 20, y);
            y += splitOption.length * 5;
        });
        y += 4;
    });

    // --- 2-Mark Questions ---
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Part B: 2-Mark Questions (10 x 2 = 20 Marks)', 15, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    paper.twoMarkQuestions.forEach((q, index) => {
        const questionText = `${index + 1}. ${q}`;
        const splitQuestion = doc.splitTextToSize(questionText, pageWidth - 30);
        checkPageBreak(splitQuestion.length * 5 + 4);
        doc.text(splitQuestion, 15, y);
        y += splitQuestion.length * 5 + 4;
    });

    // --- 10-Mark Questions ---
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Part C: 10-Mark Questions (Answer any TWO) (2 x 10 = 20 Marks)', 15, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    paper.tenMarkQuestions.forEach((q, index) => {
        const questionText = `${index + 1}. ${q}`;
        const splitQuestion = doc.splitTextToSize(questionText, pageWidth - 30);
        checkPageBreak(splitQuestion.length * 5 + 6);
        doc.text(splitQuestion, 15, y);
        y += splitQuestion.length * 5 + 6;
    });

    // --- Answer Key ---
    doc.addPage();
    y = 20;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Answer Key for Part A', 15, y);
    y += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    paper.oneMarkQuestions.forEach((mcq, index) => {
        const answerText = `${index + 1}. ${mcq.answer}`;
        const splitAnswer = doc.splitTextToSize(answerText, pageWidth-30)
        checkPageBreak(splitAnswer.length * 7);
        doc.text(splitAnswer, 15, y);
        y += splitAnswer.length * 7;
    });

    doc.save(`question_paper_${subject.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  return (
    <Card className="w-full shadow-lg mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Generated Question Paper</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="text-xl font-bold mb-4">📘 1-Mark Questions (Choose the correct option)</h3>
          <div className="space-y-6">
            {paper.oneMarkQuestions.map((mcq, index) => (
              <div key={index}>
                <p className="font-medium">{index + 1}. {mcq.question}</p>
                <div className="pl-4 mt-2 space-y-1 text-muted-foreground">
                  <p>a) {mcq.options.a}</p>
                  <p>b) {mcq.options.b}</p>
                  <p>c) {mcq.options.c}</p>
                  <p>d) {mcq.options.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />

        <div>
          <h3 className="text-xl font-bold mb-4">✍️ 2-Mark Questions</h3>
          <ol className="list-decimal list-inside space-y-3">
            {paper.twoMarkQuestions.map((q, index) => (
              <li key={index}>{q}</li>
            ))}
          </ol>
        </div>

        <Separator />

        <div>
          <h3 className="text-xl font-bold mb-4">📝 10-Mark Questions (Answer any TWO)</h3>
          <ol className="list-decimal list-inside space-y-4">
            {paper.tenMarkQuestions.map((q, index) => (
              <li key={index}>{q}</li>
            ))}
          </ol>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end pt-6">
          <Button onClick={handleDownloadPdf} variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Download as PDF
          </Button>
      </CardFooter>
    </Card>
  );
}

function PaperSkeleton() {
    return (
        <Card className="mt-8">
            <CardHeader><CardTitle>Generating Paper...</CardTitle></CardHeader>
            <CardContent className="space-y-6 p-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
            </CardContent>
        </Card>
    );
}
