
"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
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
import { Loader2, BarChartBig, Info, Trophy, TrendingDown, BookOpen, User, Lightbulb, CalendarDays, CheckCircle2, AlertTriangle, FileDown, BrainCircuit } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateFeedbackAction } from "@/app/actions";
import type { GenerateFeedbackOutput } from "@/ai/schemas";
import { Skeleton } from "@/components/ui/skeleton";
import { GlowCard } from "./ui/spotlight-card";

// Data types
type StudentData = {
  name: string;
  rollNo: string;
  marks: { [subject: string]: number };
};

type AnalysisResult = {
  averageMarks: { [subject: string]: number };
  topper: { name: string; rollNo: string; total: number; percentage: number };
  lowestScorer: { name: string; rollNo: string; total: number; percentage: number };
  subjectToppers: { [subject: string]: { name: string; rollNo: string; score: number } };
  subjects: string[];
  maxMarksPerSubject: number;
};

// Main Component
export function GradeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [selectedStudentRollNo, setSelectedStudentRollNo] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<GenerateFeedbackOutput | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setAnalysis(null);
    setStudents([]);
    setSelectedStudentRollNo(null);
    setFeedback(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xls') || selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
      } else {
        setError("Invalid file type. Please upload a .csv, .xls or .xlsx file.");
        setFile(null);
        e.target.value = '';
      }
    }
  };

  const parseJsonData = (jsonData: any[]): { headers: string[]; data: StudentData[] } => {
    if (jsonData.length === 0) {
        throw new Error("No data found in the file.");
    }

    const firstRow = jsonData[0];
    const rawHeaders = Object.keys(firstRow);
    
    const normalizedHeaders = rawHeaders.map(h => h.trim().toLowerCase().replace(/\s/g, ''));

    const nameIndex = normalizedHeaders.indexOf('name');
    const rollNoIndex = normalizedHeaders.indexOf('rollno');
    
    if (nameIndex === -1 || rollNoIndex === -1) {
        throw new Error("Invalid header format. 'Name' and 'Roll No' columns are required.");
    }
    
    const subjectHeaders = rawHeaders.filter((h, i) => i !== nameIndex && i !== rollNoIndex);
    if(subjectHeaders.length === 0) {
      throw new Error("No subject columns found. Please ensure there is at least one subject column.")
    }

    const data = jsonData.map((row, rowIndex) => {
        const name = row[rawHeaders[nameIndex]];
        const rollNo = row[rawHeaders[rollNoIndex]];
        
        if (!name || !rollNo) {
            throw new Error(`Row ${rowIndex + 2}: 'Name' and 'Roll No' cannot be empty.`);
        }

        const student: StudentData = {
            name: String(name),
            rollNo: String(rollNo),
            marks: {},
        };

        subjectHeaders.forEach(subject => {
            const score = Number(row[subject]);
            if (isNaN(score) || score < 0) {
                throw new Error(`Invalid mark for ${student.name} in ${subject} on row ${rowIndex + 2}. Marks must be positive numbers.`);
            }
            student.marks[subject] = score;
        });

        return student;
    });

    return { headers: subjectHeaders, data };
  }

  const analyzeData = (parsedData: { headers: string[]; data: StudentData[] }): AnalysisResult => {
    const { headers: subjects, data: students } = parsedData;
    const maxMarksPerSubject = 100; // Assuming max marks is 100 for percentage calculation
    const totalMaxMarks = subjects.length * maxMarksPerSubject;

    const studentsWithTotal = students.map(s => {
      const total = Object.values(s.marks).reduce((sum, mark) => sum + mark, 0);
      return {
        ...s,
        total,
        percentage: totalMaxMarks > 0 ? (total / totalMaxMarks) * 100 : 0,
      };
    });
  
    if (studentsWithTotal.length === 0) {
        throw new Error("No student data found to analyze.");
    }

    const sortedByTotal = [...studentsWithTotal].sort((a, b) => b.total - a.total);
    const topper = sortedByTotal[0];
    const lowestScorer = sortedByTotal[sortedByTotal.length - 1];
    
    const averageMarks: { [subject: string]: number } = {};
    subjects.forEach(subject => {
      const total = students.reduce((sum, s) => sum + (s.marks[subject] || 0), 0);
      averageMarks[subject] = parseFloat((total / students.length).toFixed(2));
    });
  
    const subjectToppers: { [subject: string]: { name: string; rollNo: string; score: number } } = {};
    subjects.forEach(subject => {
      let topStudent = students[0];
      let topScore = students[0].marks[subject] || -1;
      for (let i = 0; i < students.length; i++) {
        const currentScore = students[i].marks[subject] || -1;
        if (currentScore > topScore) {
          topScore = currentScore;
          topStudent = students[i];
        }
      }
      subjectToppers[subject] = { name: topStudent.name, rollNo: topStudent.rollNo, score: topScore };
    });
  
    return {
      averageMarks,
      topper: { name: topper.name, rollNo: topper.rollNo, total: topper.total, percentage: parseFloat(topper.percentage.toFixed(2)) },
      lowestScorer: { name: lowestScorer.name, rollNo: lowestScorer.rollNo, total: lowestScorer.total, percentage: parseFloat(lowestScorer.percentage.toFixed(2)) },
      subjectToppers,
      subjects,
      maxMarksPerSubject
    };
  }

  const handleAnalyze = () => {
    if (!file) {
      setError("Please upload a file first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setStudents([]);
    setSelectedStudentRollNo(null);
    setFeedback(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileData = event.target?.result;
      try {
        const workbook = XLSX.read(fileData, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);
        
        const parsedData = parseJsonData(json);
        setStudents(parsedData.data);
        const analysisResult = analyzeData(parsedData);
        setAnalysis(analysisResult);
        toast({
            title: "Analysis Complete",
            description: "Student performance data has been successfully analyzed.",
        });
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Failed to parse or analyze the file.";
        setError(errorMessage);
        setAnalysis(null);
        toast({
            variant: "destructive",
            title: "Analysis Failed",
            description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      const errorMessage = "Failed to read the file.";
      setError(errorMessage);
      setIsLoading(false);
      toast({
          variant: "destructive",
          title: "File Error",
          description: errorMessage,
      });
    }
    reader.readAsBinaryString(file);
  };

  const handleStudentSelect = async (rollNo: string) => {
    setSelectedStudentRollNo(rollNo);
    setFeedback(null);
    if (!rollNo) return;

    const student = students.find(s => s.rollNo === rollNo);
    if (!student || !analysis) return;

    setIsFeedbackLoading(true);
    try {
        const result = await generateFeedbackAction({
            studentName: student.name,
            marks: student.marks,
            subjects: analysis.subjects,
        });

        if (result.error) {
            throw new Error(result.error);
        }
        setFeedback(result.feedback || null);

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        toast({
            variant: "destructive",
            title: "Feedback Generation Failed",
            description: errorMessage,
        });
        setFeedback(null);
    } finally {
        setIsFeedbackLoading(false);
    }
  };
  
  const selectedStudent = students.find(s => s.rollNo === selectedStudentRollNo);

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
            <BarChartBig className="h-6 w-6" /> Upload Marks & Analyze Grades
          </CardTitle>
          <CardDescription>
            Upload a CSV or Excel file of student marks to get performance insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="file-upload" className="font-medium text-sm">Upload CSV or Excel File</label>
            <Input 
                id="file-upload" 
                type="file" 
                accept=".csv, .xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileChange} 
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                <Info className="h-3 w-3" />
                Format: Name, Roll No, Subject 1, Subject 2... (Header row is required)
            </p>
          </div>
          {error && <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>}
        </CardContent>
        <CardFooter>
          <Button onClick={handleAnalyze} className="w-full" disabled={!file || isLoading}>
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
            ) : (
              <><BarChartBig className="mr-2 h-4 w-4" />Analyze Student Performance</>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {isLoading && (
          <Card className="w-full shadow-lg">
            <CardHeader><CardTitle>Analyzing Data...</CardTitle></CardHeader>
            <CardContent className="flex justify-center items-center p-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </CardContent>
          </Card>
      )}

      {analysis && (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-headline">Performance Analysis</CardTitle>
                <CardDescription>
                    Summary of student performance based on the uploaded data.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <GlowCard customSize className="p-0" glowColor="green">
                        <Card className="w-full h-full bg-transparent">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Class Topper</CardTitle>
                                <Trophy className="h-5 w-5 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analysis.topper.name}</div>
                                <p className="text-xs text-muted-foreground">Roll No: {analysis.topper.rollNo}</p>
                                <p className="text-sm font-semibold mt-2">{analysis.topper.total} / {analysis.subjects.length * analysis.maxMarksPerSubject} ({analysis.topper.percentage}%)</p>
                            </CardContent>
                        </Card>
                    </GlowCard>
                     <GlowCard customSize className="p-0" glowColor="red">
                        <Card className="w-full h-full bg-transparent">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Lowest Scorer</CardTitle>
                                <TrendingDown className="h-5 w-5 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analysis.lowestScorer.name}</div>
                                <p className="text-xs text-muted-foreground">Roll No: {analysis.lowestScorer.rollNo}</p>
                                <p className="text-sm font-semibold mt-2">{analysis.lowestScorer.total} / {analysis.subjects.length * analysis.maxMarksPerSubject} ({analysis.lowestScorer.percentage}%)</p>
                            </CardContent>
                        </Card>
                    </GlowCard>
                </div>
                <Separator />
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><BookOpen className="h-5 w-5" /> Subject Averages</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Subject</TableHead>
                                    <TableHead className="text-right">Average Marks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {analysis.subjects.map(subject => (
                                    <TableRow key={subject}>
                                        <TableCell className="font-medium">{subject}</TableCell>
                                        <TableCell className="text-right">{analysis.averageMarks[subject]}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><User className="h-5 w-5" /> Subject Toppers</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Topper</TableHead>
                                    <TableHead className="text-right">Score</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {analysis.subjects.map(subject => (
                                    <TableRow key={subject}>
                                        <TableCell className="font-medium">{subject}</TableCell>
                                        <TableCell>{analysis.subjectToppers[subject].name}</TableCell>
                                        <TableCell className="text-right">{analysis.subjectToppers[subject].score}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      {analysis && students.length > 0 && (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-headline flex items-center gap-2">
                    <BrainCircuit className="h-6 w-6" /> AI-Powered Feedback Generator
                </CardTitle>
                <CardDescription>
                    Select a student to generate personalized feedback and a study plan.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Select onValueChange={handleStudentSelect} value={selectedStudentRollNo ?? ''}>
                    <SelectTrigger className="w-full md:w-1/2">
                        <SelectValue placeholder="Choose a student..." />
                    </SelectTrigger>
                    <SelectContent>
                        {students.map(student => (
                            <SelectItem key={student.rollNo} value={student.rollNo}>
                                {student.name} ({student.rollNo})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {isFeedbackLoading && <FeedbackSkeleton />}

                {feedback && selectedStudent && <FeedbackDisplay feedback={feedback} studentName={selectedStudent.name} />}
            </CardContent>
        </Card>
      )}
    </div>
  );
}

function FeedbackSkeleton() {
    return (
        <div className="space-y-6 pt-4">
            <div className="space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
            </div>
             <div className="space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
            </div>
        </div>
    );
}

function FeedbackDisplay({ feedback, studentName }: { feedback: GenerateFeedbackOutput, studentName: string }) {
    const plan = Object.entries(feedback.studyPlan);
    
    const handleExportPdf = () => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text('EduBuddy AI', 15, 20);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Personalized Feedback Report for: ${studentName}`, 15, 28);
        
        doc.setLineWidth(0.5);
        doc.line(15, 32, pageWidth - 15, 32);

        let yPos = 45;

        // Strengths
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Strengths', 15, yPos);
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const strengths = feedback.strengths.length > 0
            ? feedback.strengths
            : ["No specific strengths identified (scores > 85)."];
        strengths.forEach(item => {
            doc.text(`• ${item}`, 20, yPos, { maxWidth: pageWidth - 35 });
            yPos += 7;
        });
        yPos += 5;

        // Weaknesses
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Areas for Improvement', 15, yPos);
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const weaknesses = feedback.weaknesses.length > 0
            ? feedback.weaknesses
            : ["No specific weaknesses identified (scores < 75)."];
        weaknesses.forEach(item => {
            doc.text(`• ${item}`, 20, yPos, { maxWidth: pageWidth - 35 });
            yPos += 7;
        });
        yPos += 5;

        // Improvement Tips
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Actionable Improvement Tips', 15, yPos);
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const splitTips = doc.splitTextToSize(feedback.improvementTips, pageWidth - 30);
        doc.text(splitTips, 15, yPos);
        yPos += (splitTips.length * 5) + 10;

        // Study Plan
        const planData = Object.entries(feedback.studyPlan).map(([day, details], index) => [
            `Day ${index + 1}`,
            details.topic,
            details.task
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['Day', 'Focus Topic', 'Suggested Task']],
            body: planData,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] }, // A blue color
            didDrawPage: (data) => {
                // Footer
                const footerStr = "Generated by EduBuddy AI – Powered by OpenAI";
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(footerStr, data.settings.margin.left, pageHeight - 10);
            }
        });

        doc.save(`feedback_${studentName.replace(/\s+/g, '_')}.pdf`);
    };

    const strengthsContent = feedback.strengths.length > 0
        ? <ul className="list-disc list-inside space-y-1">{feedback.strengths.map(s => <li key={s}>{s}</li>)}</ul>
        : <p className="text-muted-foreground text-sm">No specific strengths identified (scores &gt; 85).</p>;

    const weaknessesContent = feedback.weaknesses.length > 0
        ? <ul className="list-disc list-inside space-y-1">{feedback.weaknesses.map(w => <li key={w}>{w}</li>)}</ul>
        : <p className="text-muted-foreground text-sm">No specific weaknesses identified (scores &lt; 75).</p>;

    return (
        <div className="space-y-8 pt-4">
            <div className="grid md:grid-cols-2 gap-6">
                <GlowCard customSize className="p-0" glowColor="green">
                    <Card className="w-full h-full bg-transparent">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600" /> Strengths
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {strengthsContent}
                        </CardContent>
                    </Card>
                </GlowCard>
                <GlowCard customSize className="p-0" glowColor="red">
                    <Card className="w-full h-full bg-transparent">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" /> Areas for Improvement
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {weaknessesContent}
                        </CardContent>
                    </Card>
                </GlowCard>
            </div>
            
            <div>
                <h3 className="text-xl font-semibold flex items-center gap-2 mb-3">
                    <Lightbulb className="h-5 w-5" /> Actionable Improvement Tips
                </h3>
                <p className="text-muted-foreground bg-accent/40 p-4 rounded-lg">{feedback.improvementTips}</p>
            </div>
            
            <div className="space-y-3">
                 <h3 className="text-xl font-semibold flex items-center gap-2 mb-3">
                    <CalendarDays className="h-5 w-5" /> Your 7-Day Personalized Plan
                </h3>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Day</TableHead>
                                <TableHead>Focus Topic</TableHead>
                                <TableHead>Suggested Task</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plan.map(([day, details], index) => (
                                <TableRow key={day}>
                                    <TableCell className="font-medium">Day {index + 1}</TableCell>
                                    <TableCell>{details.topic}</TableCell>
                                    <TableCell>{details.task}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
            
            <CardFooter className="px-0 pt-6 justify-end">
                <Button variant="outline" onClick={handleExportPdf}>
                    <FileDown className="mr-2 h-4 w-4" /> Export Feedback as PDF
                </Button>
            </CardFooter>
        </div>
    );
}
