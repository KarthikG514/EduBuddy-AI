
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getAttendanceRecords, generateAttendanceReportAction } from '@/app/actions';
import type { AttendanceRecord } from '@/ai/schemas';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, User, ClipboardList, BadgePercent, Tags, BrainCircuit, Loader2, Edit, Presentation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManualAttendanceForm } from './manual-attendance-form';

type AggregatedStudentData = {
    rollNo: string;
    name: string;
    totalDays: number;
    presentDays: number;
    behaviorTags: string[];
};

function AttendanceReportViewer({ records, isLoading, error }: { records: AttendanceRecord[], isLoading: boolean, error: string | null }) {
    const [selectedRollNo, setSelectedRollNo] = useState<string | null>(null);
    const [isReportLoading, setIsReportLoading] = useState(false);
    const [generatedReport, setGeneratedReport] = useState<string | null>(null);
    const { toast } = useToast();

    const aggregatedData = useMemo(() => {
        const studentMap = new Map<string, AggregatedStudentData>();
        records.forEach(record => {
            let student = studentMap.get(record.roll_no);
            if (!student) {
                student = {
                    rollNo: record.roll_no,
                    name: record.student_name,
                    totalDays: 0,
                    presentDays: 0,
                    behaviorTags: [],
                };
            }
            student.totalDays++;
            if (record.status === 'Present' || record.status === 'Late') {
                student.presentDays++;
            }
            if (record.behavior_tags) {
                const tags = record.behavior_tags.split(',').map(t => t.trim()).filter(Boolean);
                student.behaviorTags.push(...tags);
            }
            if (record.status === 'Late') {
                student.behaviorTags.push('Late');
            }
            studentMap.set(record.roll_no, student);
        });
        return Array.from(studentMap.values()).sort((a,b) => a.name.localeCompare(b.name));
    }, [records]);

    const selectedStudentData = useMemo(() => {
        return aggregatedData.find(s => s.rollNo === selectedRollNo) || null;
    }, [selectedRollNo, aggregatedData]);

    const handleStudentSelect = (rollNo: string) => {
        setSelectedRollNo(rollNo);
        setGeneratedReport(null);
    };
    
    const handleGenerateReport = async () => {
        if (!selectedStudentData) return;
        setIsReportLoading(true);
        setGeneratedReport(null);
        try {
            const result = await generateAttendanceReportAction({
                studentName: selectedStudentData.name,
                totalDays: selectedStudentData.totalDays,
                presentDays: selectedStudentData.presentDays,
                behaviorTags: [...new Set(selectedStudentData.behaviorTags)] // Pass unique tags
            });

            if (result.error) throw new Error(result.error);
            setGeneratedReport(result.report?.report || "Could not generate a report.");
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Report Generation Failed", description: errorMessage });
        } finally {
            setIsReportLoading(false);
        }
    };

    if (isLoading) {
        return <Skeleton className="w-full h-64" />;
    }
    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }
    if (aggregatedData.length === 0) {
        return (
             <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <h3 className="text-lg font-semibold text-muted-foreground">No Attendance Data</h3>
                <p className="text-sm text-muted-foreground mt-1">Use the Manual Entry tab to add records.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label htmlFor="student-select" className="font-medium text-sm flex items-center gap-2"><User className="h-4 w-4" /> Select Student</label>
                <Select onValueChange={handleStudentSelect} value={selectedRollNo ?? ''}>
                    <SelectTrigger id="student-select" className="w-full md:w-1/2">
                        <SelectValue placeholder="Choose a student..." />
                    </SelectTrigger>
                    <SelectContent>
                        {aggregatedData.map(student => (
                            <SelectItem key={student.rollNo} value={student.rollNo}>
                                {student.name} ({student.rollNo})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {selectedStudentData && (
                <Card className="bg-secondary/30">
                    <CardContent className="pt-6 grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2 text-muted-foreground"><BadgePercent className="h-5 w-5" /> Attendance</h3>
                            <p className="text-3xl font-bold">
                                {selectedStudentData.totalDays > 0 ? 
                                 ((selectedStudentData.presentDays / selectedStudentData.totalDays) * 100).toFixed(0) : 0}%
                            </p>
                            <p className="text-sm text-muted-foreground">{selectedStudentData.presentDays} / {selectedStudentData.totalDays} days present</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2 text-muted-foreground"><Tags className="h-5 w-5" /> Behavior Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedStudentData.behaviorTags.length > 0 ? (
                                    [...new Set(selectedStudentData.behaviorTags)].map((tag, i) => (
                                        <Badge key={i} variant="outline">{tag}</Badge>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No tags recorded.</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-4">
                        <Button onClick={handleGenerateReport} disabled={isReportLoading}>
                            {isReportLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Report...</>
                            ) : (
                                <><BrainCircuit className="mr-2 h-4 w-4" />Generate AI Report</>
                            )}
                        </Button>
                        {isReportLoading && <Skeleton className="h-10 w-full" />}
                        {generatedReport && (
                            <Alert>
                                <AlertTitle className="font-semibold">AI Generated Summary</AlertTitle>
                                <AlertDescription>{generatedReport}</AlertDescription>
                            </Alert>
                        )}
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}

export function AttendanceTracker() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        const result = await getAttendanceRecords();
        if (result.error) {
            setError(result.error);
        } else {
            setRecords(result.records || []);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

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
                    <ClipboardList className="h-6 w-6" /> Student Attendance
                </CardTitle>
                <CardDescription>
                    Manually enter daily attendance or view aggregated reports for students.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="entry" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="entry">
                            <Edit className="mr-2 h-4 w-4" /> Manual Entry
                        </TabsTrigger>
                        <TabsTrigger value="report">
                            <Presentation className="mr-2 h-4 w-4" /> View & Report
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="entry" className="mt-6">
                        <ManualAttendanceForm onSuccess={loadData} />
                    </TabsContent>
                    <TabsContent value="report" className="mt-6">
                        <AttendanceReportViewer records={records} isLoading={isLoading} error={error} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
        </div>
    );
}
