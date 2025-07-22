
"use client";

import React, { useState, useEffect } from 'react';
import { getPerformanceReports } from '@/app/actions';
import type { PerformanceReport } from '@/ai/schemas';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2, Lightbulb, CalendarDays, BookOpen, User, Eye, Target } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import type { GenerateFeedbackOutput } from "@/ai/schemas";

type ParsedFeedback = {
    strengths: string[];
    weaknesses: string[];
    improvementTips: string;
};

type ParsedStudyPlan = GenerateFeedbackOutput['studyPlan'];

function ReportDetails({ report }: { report: PerformanceReport }) {
    let parsedFeedback: ParsedFeedback | null = null;
    let parsedStudyPlan: ParsedStudyPlan | null = null;

    try {
        if (report.feedback) {
            parsedFeedback = typeof report.feedback === 'string' 
                ? JSON.parse(report.feedback) 
                : report.feedback;
        }
        if (report.improvement_plan) {
            parsedStudyPlan = typeof report.improvement_plan === 'string'
                ? JSON.parse(report.improvement_plan)
                : report.improvement_plan;
        }
    } catch (e) {
        console.error("Error parsing report data:", e);
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
                <h3 className="text-lg font-semibold">Error Parsing Report</h3>
                <p className="text-sm text-muted-foreground">The data for this report seems to be corrupted.</p>
            </div>
        )
    }

    const plan = parsedStudyPlan ? Object.entries(parsedStudyPlan) : [];

    const strengthsContent = parsedFeedback?.strengths && parsedFeedback.strengths.length > 0
        ? <ul className="list-disc list-inside space-y-1">{parsedFeedback.strengths.map(s => <li key={s}>{s}</li>)}</ul>
        : <p className="text-muted-foreground text-sm">No specific strengths identified (scores &gt; 85).</p>;

    const weaknessesContent = parsedFeedback?.weaknesses && parsedFeedback.weaknesses.length > 0
        ? <ul className="list-disc list-inside space-y-1">{parsedFeedback.weaknesses.map(w => <li key={w}>{w}</li>)}</ul>
        : <p className="text-muted-foreground text-sm">No specific weaknesses identified (scores &lt; 75).</p>;

    return (
        <div className="space-y-6 pt-4 text-left">
             <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-secondary/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" /> Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {strengthsContent}
                  </CardContent>
                </Card>

                <Card className="bg-destructive/10">
                   <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" /> Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {weaknessesContent}
                  </CardContent>
                </Card>
            </div>
            
            {parsedFeedback?.improvementTips && (
                <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2 mb-3">
                        <Lightbulb className="h-5 w-5" /> Actionable Improvement Tips
                    </h3>
                    <p className="text-muted-foreground bg-accent/40 p-4 rounded-lg">{parsedFeedback.improvementTips}</p>
                </div>
            )}
            
            {plan.length > 0 && (
                <div>
                     <h3 className="text-xl font-semibold flex items-center gap-2 mb-3">
                        <CalendarDays className="h-5 w-5" /> 7-Day Personalized Plan
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
                                        <TableCell>{(details as any).topic}</TableCell>
                                        <TableCell>{(details as any).task}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}

export function PerformanceDashboard() {
  const [reports, setReports] = useState<PerformanceReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      setError(null);
      const result = await getPerformanceReports();
      if (result.error) {
        setError(result.error);
      } else {
        setReports(result.reports || []);
      }
      setIsLoading(false);
    }
    loadReports();
  }, []);

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Could Not Load Reports</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </CardContent>
      </Card>
    );
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
            <BookOpen className="h-6 w-6" /> Performance Reports
        </CardTitle>
        <CardDescription>
            View and manage all AI-generated student performance reports.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reports.length > 0 ? (
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><User className="inline-block mr-1 h-4 w-4" />Student Name</TableHead>
                            <TableHead><BookOpen className="inline-block mr-1 h-4 w-4" />Subject(s)</TableHead>
                            <TableHead><Target className="inline-block mr-1 h-4 w-4" />Score</TableHead>
                            <TableHead><CalendarDays className="inline-block mr-1 h-4 w-4" />Date Generated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.map((report) => (
                            <TableRow key={report.id}>
                                <TableCell className="font-medium">{report.student_name}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{report.subject}</TableCell>
                                <TableCell>{report.score}/{report.total}</TableCell>
                                <TableCell>{format(new Date(report.created_at), 'MMMM d, yyyy')}</TableCell>
                                <TableCell className="text-right">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl">Feedback Report for {report.student_name}</DialogTitle>
                                                <DialogDescription>
                                                    Generated on {format(new Date(report.created_at), 'PPP')}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <ReportDetails report={report} />
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        ) : (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <h3 className="text-lg font-semibold text-muted-foreground">No Reports Found</h3>
                <p className="text-sm text-muted-foreground mt-1">Generate feedback in the Grade Analyzer tab to see reports here.</p>
            </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}
