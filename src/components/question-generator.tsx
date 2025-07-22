
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateQuestionsAction, generateQuestionsFromFileAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ListOrdered, Info, RefreshCw, FileDown, BookText, FileUp, TestTube } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { type MCQQuestion } from "@/ai/schemas";
import { Separator } from "@/components/ui/separator";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { saveAs } from "file-saver";

// Form Schemas
const topicFormSchema = z.object({
  subject: z.string().min(1, { message: "Please select a course or subject." }),
  topic: z.string().min(2, { message: "Topic/Module must be at least 2 characters." }),
  numberOfQuestions: z.coerce.number().int().positive({ message: "Must be a positive number." }).min(1, { message: "At least 1 question." }).max(10, { message: "Max 10 questions." }),
  difficulty: z.enum(["Easy", "Moderate", "Advanced"]),
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
    numberOfQuestions: z.coerce.number().int().positive({ message: "Must be a positive number." }).min(1, { message: "At least 1 question." }).max(10, { message: "Max 10 questions." }),
    difficulty: z.enum(["Easy", "Moderate", "Advanced"]),
});


type GeneratedResult = {
  questions: MCQQuestion[];
  subject: string;
  topic: string;
  difficulty: string;
};

// Main Component
export function QuestionGenerator() {
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const topicForm = useForm<z.infer<typeof topicFormSchema>>({
    resolver: zodResolver(topicFormSchema),
    defaultValues: {
      subject: "Computer Science Engineering (CSE)",
      topic: "",
      numberOfQuestions: 5,
      difficulty: "Moderate",
    },
  });

  const fileForm = useForm<z.infer<typeof fileFormSchema>>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: {
      file: undefined,
      numberOfQuestions: 5,
      difficulty: "Moderate",
    },
  });
  const fileRef = fileForm.register("file");


  async function onTopicSubmit(values: z.infer<typeof topicFormSchema>) {
    setIsLoading(true);
    setGeneratedResult(null);
    
    try {
      const result = await generateQuestionsAction(values);
      if (result.error) {
        throw new Error(result.error);
      }
      setGeneratedResult({
        questions: result.questions || [],
        subject: values.subject,
        topic: values.topic,
        difficulty: values.difficulty,
      });
      if((result.questions || []).length === 0) {
        toast({
            title: "No Questions Generated",
            description: "The AI couldn't generate questions for the given criteria. Try different options.",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Error Generating Questions",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onFileSubmit(values: z.infer<typeof fileFormSchema>) {
    setIsLoading(true);
    setGeneratedResult(null);

    const file = values.file[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
        const fileDataUri = reader.result as string;

        try {
            const result = await generateQuestionsFromFileAction({
                fileDataUri,
                topic: `from ${file.name}`,
                numberOfQuestions: values.numberOfQuestions,
                difficulty: values.difficulty,
            });
            if (result.error) {
                throw new Error(result.error);
            }
            setGeneratedResult({
                questions: result.questions || [],
                subject: "Uploaded Document",
                topic: `from ${file.name}`,
                difficulty: values.difficulty,
            });
            if((result.questions || []).length === 0) {
                toast({
                    title: "No Questions Generated",
                    description: "The AI couldn't generate questions from the uploaded file.",
                });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({
                variant: "destructive",
                title: "Error Generating Questions",
                description: errorMessage,
            });
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

  const handleRegenerate = () => {
    // This is tricky now with two forms. For simplicity, we can't regenerate for file-based.
    // A better implementation would store the last used form and its values.
    // For now, we only allow regeneration for topic-based questions.
    if (generatedResult?.topic.startsWith("from ")) {
         toast({
            title: "Regeneration Not Available",
            description: "Cannot regenerate questions from a file upload.",
        });
    } else {
        onTopicSubmit(topicForm.getValues());
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
        <Tabs defaultValue="topic" className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl font-headline flex items-center gap-2"><TestTube className="h-6 w-6" />MCQ Generator</CardTitle>
                <CardDescription>Generate college-level MCQs from a specific topic or an uploaded file.</CardDescription>
                <TabsList className="grid w-full grid-cols-2 mt-4">
                    <TabsTrigger value="topic"><BookText className="mr-2 h-4 w-4" />From Topic</TabsTrigger>
                    <TabsTrigger value="file"><FileUp className="mr-2 h-4 w-4" />From File</TabsTrigger>
                </TabsList>
            </CardHeader>

            <TabsContent value="topic" className="p-0">
                <Form {...topicForm}>
                    <form onSubmit={topicForm.handleSubmit(onTopicSubmit)}>
                        <CardContent className="space-y-6 px-6 pb-6">
                            <TooltipProvider>
                                <div className="grid md:grid-cols-2 gap-6">
                                <FormField control={topicForm.control} name="subject" render={({ field }) => (
                                    <FormItem>
                                    <div className="flex items-center gap-2">
                                        <FormLabel>Select Course or Subject</FormLabel>
                                        <Tooltip>
                                        <TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                        <TooltipContent><p>Choose the engineering discipline for the questions.</p></TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select an engineering course" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                        <SelectItem value="Computer Science Engineering (CSE)">Computer Science Engineering (CSE)</SelectItem>
                                        <SelectItem value="Electrical and Electronics Engineering (EEE)">Electrical and Electronics Engineering (EEE)</SelectItem>
                                        <SelectItem value="Electronics and Communication Engineering (ECE)">Electronics and Communication Engineering (ECE)</SelectItem>
                                        <SelectItem value="Mechanical Engineering (ME)">Mechanical Engineering (ME)</SelectItem>
                                        <SelectItem value="Civil Engineering (CE)">Civil Engineering (CE)</SelectItem>
                                        <SelectItem value="Information Technology (IT)">Information Technology (IT)</SelectItem>
                                        <SelectItem value="Artificial Intelligence & Data Science (AI&DS)">Artificial Intelligence & Data Science (AI&DS)</SelectItem>
                                        <SelectItem value="Biomedical Engineering (BME)">Biomedical Engineering (BME)</SelectItem>
                                        <SelectItem value="Chemical Engineering">Chemical Engineering</SelectItem>
                                        <SelectItem value="Mechatronics">Mechatronics</SelectItem>
                                        <SelectItem value="Instrumentation Engineering">Instrumentation Engineering</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={topicForm.control} name="topic" render={({ field }) => (
                                    <FormItem>
                                    <div className="flex items-center gap-2">
                                        <FormLabel>Enter Topic / Module Title</FormLabel>
                                        <Tooltip>
                                        <TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                        <TooltipContent><p>e.g., "Thermodynamics," "Algorithm Design," or "Module 2: Circuit Theory".</p></TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <FormControl><Input placeholder="e.g. Data Structures & Algorithms" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                <FormField control={topicForm.control} name="numberOfQuestions" render={({ field }) => (
                                    <FormItem>
                                    <div className="flex items-center gap-2">
                                        <FormLabel># of Questions</FormLabel>
                                        <Tooltip>
                                        <TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                        <TooltipContent><p>How many questions do you need?</p></TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <FormControl><Input type="number" min="1" max="10" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={topicForm.control} name="difficulty" render={({ field }) => (
                                    <FormItem>
                                    <div className="flex items-center gap-2">
                                        <FormLabel>Academic Complexity</FormLabel>
                                        <Tooltip>
                                        <TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                        <TooltipContent><p>Define the cognitive and problem-solving skill level required.</p></TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                        <SelectItem value="Easy">Easy (Recall)</SelectItem>
                                        <SelectItem value="Moderate">Moderate (Application)</SelectItem>
                                        <SelectItem value="Advanced">Advanced (Critical Thinking)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                </div>
                            </TooltipProvider>
                        </CardContent>
                        <CardFooter className="px-6 pb-6">
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
                                ) : ( "Generate MCQs from Topic" )}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </TabsContent>
            <TabsContent value="file" className="p-0">
                <Form {...fileForm}>
                    <form onSubmit={fileForm.handleSubmit(onFileSubmit)}>
                        <CardContent className="space-y-6 px-6 pb-6">
                             <FormField
                                control={fileForm.control}
                                name="file"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Upload Notes / Syllabus (PDF or TXT)</FormLabel>
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
                             <div className="grid md:grid-cols-2 gap-6">
                                <FormField control={fileForm.control} name="numberOfQuestions" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel># of Questions</FormLabel>
                                        <FormControl><Input type="number" min="1" max="10" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={fileForm.control} name="difficulty" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Academic Complexity</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                            <SelectItem value="Easy">Easy (Recall)</SelectItem>
                                            <SelectItem value="Moderate">Moderate (Application)</SelectItem>
                                            <SelectItem value="Advanced">Advanced (Critical Thinking)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </CardContent>
                        <CardFooter className="px-6 pb-6">
                             <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
                                ) : ( "Generate MCQs from File" )}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </TabsContent>
        </Tabs>
      </Card>
      
      {isLoading ? <QuestionListSkeleton /> : <QuestionList result={generatedResult} onRegenerate={handleRegenerate} isSubmitting={isLoading} />}
    </div>
  );
}

const difficultyMap: { [key: string]: string } = {
  Easy: "Easy (Recall)",
  Moderate: "Moderate (Application)",
  Advanced: "Advanced (Critical Thinking)",
};

function QuestionList({ result, onRegenerate, isSubmitting }: { result: GeneratedResult | null; onRegenerate: () => void; isSubmitting: boolean }) {
  if (!result || result.questions.length === 0) {
    return (
        <Card className="w-full shadow-lg border-dashed mt-8">
            <CardContent className="p-10 text-center">
                <div className="flex justify-center items-center mb-4">
                    <div className="p-3 rounded-full bg-secondary">
                        <ListOrdered className="h-8 w-8 text-secondary-foreground" />
                    </div>
                </div>
                <h3 className="text-xl font-semibold">No Questions Yet</h3>
                <p className="text-muted-foreground">Your generated questions will appear here.</p>
            </CardContent>
        </Card>
    );
  }
  
  const handleExportPdf = () => {
    if (!result) return;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`${result.subject} - Quiz on ${result.topic}`, 15, 20);
    doc.setFontSize(12);

    let yPos = 30;
    
    result.questions.forEach((mcq, index) => {
        if (index > 0 && index % 5 === 0) { // Optional: Page break every 5 questions
            doc.addPage();
            yPos = 20;
        }

        const questionText = `Q${index + 1}. ${mcq.question}`;
        const splitQuestion = doc.splitTextToSize(questionText, 180);
        doc.text(splitQuestion, 15, yPos);
        yPos += splitQuestion.length * 6 + 2;

        const optionsText = [
            `A. ${mcq.options.A}`,
            `B. ${mcq.options.B}`,
            `C. ${mcq.options.C}`,
            `D. ${mcq.options.D}`,
        ];
        
        optionsText.forEach(opt => {
            const splitOption = doc.splitTextToSize(opt, 175);
            doc.text(splitOption, 20, yPos);
            yPos += splitOption.length * 6;
        });

        yPos += 7; // Extra space between questions

        if (yPos > 270) { // Manual page break if content overflows
            doc.addPage();
            yPos = 20;
        }
    });

    if (yPos > 240) {
        doc.addPage();
        yPos = 20;
    } else {
        yPos += 10;
    }

    doc.setFontSize(16);
    doc.text("Answer Key", 15, yPos);
    yPos += 10;
    doc.setFontSize(12);

    result.questions.forEach((mcq, index) => {
        doc.text(`${index + 1}. ${mcq.answer}`, 15, yPos);
        yPos += 7;
        if (yPos > 280) {
            doc.addPage();
            yPos = 20;
        }
    });

    doc.save(`quiz_${result.topic.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  const handleExportWord = () => {
    if (!result) return;

    const questionParagraphs = result.questions.flatMap((mcq, index) => {
      return [
        new Paragraph({
          children: [
            new TextRun({ text: `Q${index + 1}. ${mcq.question}`, bold: true }),
          ],
          spacing: { after: 120 },
        }),
        new Paragraph({ children: [new TextRun({ text: `A. ${mcq.options.A}` })] }),
        new Paragraph({ children: [new TextRun({ text: `B. ${mcq.options.B}` })] }),
        new Paragraph({ children: [new TextRun({ text: `C. ${mcq.options.C}` })] }),
        new Paragraph({ children: [new TextRun({ text: `D. ${mcq.options.D}` })] }),
        new Paragraph({ text: "" }), // spacing
      ];
    });

    const answerKeyParagraphs = [
      new Paragraph({
          text: "Answer Key",
          heading: "Heading1",
          spacing: { before: 240, after: 120 },
      }),
      ...result.questions.map((mcq, index) => new Paragraph({ text: `${index + 1}. ${mcq.answer}` })),
    ];

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            text: `${result.subject} – Quiz on ${result.topic}`,
            heading: "Title",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),
          ...questionParagraphs,
          ...answerKeyParagraphs,
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `quiz_${result.topic.replace(/[^a-zA-Z0-9]/g, '_')}.docx`);
    });
  };

  return (
    <Card className="w-full shadow-lg mt-8">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <CardTitle className="text-2xl font-headline mb-1 capitalize">{result.topic}</CardTitle>
            <Badge variant="secondary">{difficultyMap[result.difficulty] || result.difficulty}</Badge>
          </div>
          <Button onClick={onRegenerate} disabled={isSubmitting} variant="outline" className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="space-y-6 list-none p-0">
          {result.questions.map((mcq, index) => (
            <li key={index} className="flex items-start gap-4">
                <span className="flex h-8 w-8 text-lg shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  {index + 1}
                </span>
                <div className="flex-1">
                    <p className="font-medium text-base text-card-foreground">{mcq.question}</p>
                    <div className="mt-2 space-y-1 text-muted-foreground">
                      <p>A. {mcq.options.A}</p>
                      <p>B. {mcq.options.B}</p>
                      <p>C. {mcq.options.C}</p>
                      <p>D. {mcq.options.D}</p>
                    </div>
                </div>
            </li>
          ))}
        </ol>

        <Separator className="my-6" />

        <div>
          <h3 className="text-xl font-headline font-semibold mb-4">✅ Answer Key</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-x-4 gap-y-2">
            {result.questions.map((mcq, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className="font-bold">{index + 1}.</span>
                <span>{mcq.answer}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col sm:flex-row justify-end gap-2">
        <Button variant="outline" onClick={handleExportPdf}>
          <FileDown className="mr-2 h-4 w-4" />
          Export as PDF
        </Button>
         <Button variant="outline" onClick={handleExportWord}>
          <FileDown className="mr-2 h-4 w-4" />
          Download as Word
        </Button>
      </CardFooter>
    </Card>
  );
}

function QuestionListSkeleton() {
  return (
    <Card className="w-full shadow-lg mt-8">
      <CardHeader>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-6">
        {[...Array(5)].map((_, i) => (
           <div key={i} className="flex items-start gap-4">
             <Skeleton className="h-8 w-8 rounded-full" />
             <div className="space-y-2 flex-1">
               <Skeleton className="h-5 w-full" />
               <Skeleton className="h-5 w-2/3" />
             </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
