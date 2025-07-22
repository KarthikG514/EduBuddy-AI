
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { getProjectTrackerRecords } from '@/app/actions';
import type { ProjectTrackerRecord } from '@/ai/schemas';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, PlusCircle, Edit, KanbanSquare, CheckCircle2, Circle, MoreHorizontal } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ProjectTrackerForm } from './project-tracker-form';
import { cn } from '@/lib/utils';

const ProgressStep = ({ label, isCompleted, isCurrent }: { label: string; isCompleted: boolean; isCurrent: boolean }) => (
    <div className="flex items-center gap-2">
        <div className={cn(
            "h-6 w-6 rounded-full flex items-center justify-center border-2",
            isCompleted ? "bg-green-500 border-green-500 text-white" : "bg-secondary border-border",
            isCurrent && !isCompleted && "border-primary"
        )}>
            {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Circle className={cn("h-3 w-3", isCurrent ? "text-primary" : "text-muted-foreground/50")} />}
        </div>
        <span className={cn("text-sm", isCurrent && !isCompleted ? "font-semibold text-primary" : "text-muted-foreground", isCompleted && "font-medium text-foreground")}>
            {label}
        </span>
    </div>
);

const ProjectCard = ({ record, onEdit }: { record: ProjectTrackerRecord, onEdit: (record: ProjectTrackerRecord) => void }) => {
    const stages = [
        { label: 'Topic Selected', completed: record.topic_selected },
        { label: 'Review 1 Done', completed: record.review1_score !== null },
        { label: 'Review 2 Done', completed: record.review2_score !== null },
        { label: 'Final Submission', completed: record.final_submission },
    ];
    const completedCount = stages.filter(s => s.completed).length;
    const progress = (completedCount / stages.length) * 100;
    const currentStageIndex = stages.findIndex(s => !s.completed);

    const renderScore = (score: number | null, feedback: string | null) => {
        if (score === null) return <span className="text-muted-foreground">Pending</span>;
        return (
            <div className='flex flex-col'>
                <Badge variant="secondary" className="w-fit">{score} / 100</Badge>
                {feedback && <p className="text-xs text-muted-foreground mt-1">"{feedback}"</p>}
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{record.project_title}</CardTitle>
                        <CardDescription>{record.student_name} ({record.roll_no}) | Mentor: {record.mentor_name}</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(record)}><Edit className="h-4 w-4 mr-2" />Edit</Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="text-sm font-semibold mb-3">Progress</h4>
                    <div className="flex items-center space-x-2">
                        {stages.map((stage, index) => (
                            <React.Fragment key={stage.label}>
                                <ProgressStep label={stage.label} isCompleted={stage.completed} isCurrent={index === currentStageIndex} />
                                {index < stages.length - 1 && <MoreHorizontal className="text-muted-foreground/50" />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                        <p className="font-medium">Review 1</p>
                        {renderScore(record.review1_score, record.review1_feedback)}
                    </div>
                    <div className="space-y-1">
                        <p className="font-medium">Review 2</p>
                        {renderScore(record.review2_score, record.review2_feedback)}
                    </div>
                    <div className="space-y-1">
                        <p className="font-medium">Final Score</p>
                        {renderScore(record.final_score, record.final_feedback)}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export function ProjectTracker() {
    const [records, setRecords] = useState<ProjectTrackerRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<ProjectTrackerRecord | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        const result = await getProjectTrackerRecords();
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

    const handleNew = () => {
        setEditingRecord(null);
        setIsFormOpen(true);
    };

    const handleEdit = (record: ProjectTrackerRecord) => {
        setEditingRecord(record);
        setIsFormOpen(true);
    };
    
    const handleSuccess = () => {
        setIsFormOpen(false);
        loadData();
    };

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
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-2xl font-headline flex items-center gap-2">
                            <KanbanSquare className="h-6 w-6" /> Final Year Project Tracker
                        </CardTitle>
                        <CardDescription>
                            Monitor and update the progress of student projects.
                        </CardDescription>
                    </div>
                    <Button onClick={handleNew}><PlusCircle className="mr-2 h-4 w-4" /> Track New Project</Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="space-y-4">
                        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
                    </div>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error Loading Projects</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {!isLoading && !error && (
                    records.length > 0 ? (
                        <div className="space-y-4">
                            {records.map(record => (
                                <ProjectCard key={record.id} record={record} onEdit={handleEdit} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg">
                            <h3 className="text-lg font-semibold text-muted-foreground">No Projects Tracked</h3>
                            <p className="text-sm text-muted-foreground mt-1">Click "Track New Project" to get started.</p>
                        </div>
                    )
                )}

                <ProjectTrackerForm 
                    isOpen={isFormOpen} 
                    setIsOpen={setIsFormOpen} 
                    onSuccess={handleSuccess}
                    record={editingRecord}
                />
            </CardContent>
        </Card>
        </div>
    );
}
