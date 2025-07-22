
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { getStudentList, getStudentProfileData } from '@/app/actions';
import type { StudentInfo, StudentProfileData, TeacherRemarkRecord } from '@/ai/schemas';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, UserCircle, Loader2, CalendarCheck, Tags, PenSquare, Sparkles, BookOpen, MoveUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { GlowCard } from './ui/spotlight-card';

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
};

function CallToActionCard() {
    return (
        <div className="text-center py-10 border-2 border-dashed rounded-lg mt-6 bg-background/50">
            <div className="flex justify-center items-center mb-4">
                <div className="p-4 rounded-full bg-primary/10">
                     <UserCircle className="h-12 w-12 text-primary" />
                </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground">Welcome to your Dashboard</h3>
            <p className="text-md text-muted-foreground mt-2 max-w-md mx-auto">
                Select a student from the dropdown above to view their complete academic and behavioral profile.
            </p>
             <div className="mt-6 flex justify-center">
                <MoveUpRight className="h-8 w-8 text-muted-foreground animate-pulse" />
            </div>
        </div>
    )
}

export function StudentProfile() {
  const [studentList, setStudentList] = useState<StudentInfo[]>([]);
  const [selectedRollNo, setSelectedRollNo] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<StudentProfileData | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStudentList() {
      setIsLoadingList(true);
      setError(null);
      const result = await getStudentList();
      if (result.error) {
        setError(result.error);
      } else {
        setStudentList(result.students || []);
      }
      setIsLoadingList(false);
    }
    loadStudentList();
  }, []);

  const handleStudentSelect = async (rollNo: string) => {
    setSelectedRollNo(rollNo);
    if (!rollNo) {
        setProfileData(null);
        return;
    }
    setIsLoadingProfile(true);
    setError(null);
    setProfileData(null);
    const result = await getStudentProfileData(rollNo);
    if (result.error) {
      setError(result.error);
    } else {
      setProfileData(result.profile || null);
    }
    setIsLoadingProfile(false);
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
        <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <UserCircle className="h-6 w-6" /> Student Profile Dashboard
        </CardTitle>
        <CardDescription>
            Select a student to view their comprehensive academic and behavioral profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="w-full md:w-1/2">
            <label htmlFor="student-select" className="font-medium text-sm">Select Student</label>
            {isLoadingList ? (
                <Skeleton className="h-10 w-full mt-2" />
            ) : (
                <Select onValueChange={handleStudentSelect} value={selectedRollNo ?? ''} disabled={studentList.length === 0}>
                    <SelectTrigger id="student-select" className="mt-2">
                        <SelectValue placeholder="Choose a student..." />
                    </SelectTrigger>
                    <SelectContent>
                        {studentList.map(student => (
                            <SelectItem key={student.roll_no} value={student.roll_no}>
                                {student.student_name} ({student.roll_no})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>

        {error && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {isLoadingProfile && <ProfileSkeleton />}

        {!isLoadingProfile && profileData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                <div className="lg:col-span-1 space-y-6">
                    <GlowCard customSize className="p-0">
                        <Card className="bg-transparent w-full h-full">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2"><CalendarCheck className="h-5 w-5" />Attendance</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Progress value={profileData.attendance.percentage} className="h-3" />
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-2xl">{profileData.attendance.percentage}%</span>
                                    <span className="text-muted-foreground">{profileData.attendance.presentDays} / {profileData.attendance.totalDays} Days</span>
                                </div>
                            </CardContent>
                        </Card>
                    </GlowCard>
                     <GlowCard customSize className="p-0" glowColor="purple">
                        <Card className="bg-transparent w-full h-full">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2"><Tags className="h-5 w-5" />Behavior Tags</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {profileData.behaviorTags.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {profileData.behaviorTags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                    </div>
                                ) : <p className="text-sm text-muted-foreground">No behavior tags recorded.</p>}
                            </CardContent>
                        </Card>
                     </GlowCard>
                    <GlowCard customSize className="p-0" glowColor="orange">
                        <Card className="bg-transparent w-full h-full">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="h-5 w-5" />AI Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{profileData.aiFeedback || 'No AI-generated feedback available.'}</p>
                            </CardContent>
                        </Card>
                    </GlowCard>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><BookOpen className="h-5 w-5" />Academic Performance</CardTitle>
                             <CardDescription>Internal marks (out of 30) across different subjects.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {profileData.marks.length > 0 ? (
                                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                    <BarChart data={profileData.marks} accessibilityLayer margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="subject" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} />
                                        <YAxis domain={[0, 30]} />
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                        <Bar dataKey="internal_score" name="Score" fill="var(--color-score)" radius={4} />
                                    </BarChart>
                                </ChartContainer>
                            ) : <p className="text-sm text-muted-foreground text-center py-10">No mark data available.</p>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                             <CardTitle className="text-lg flex items-center gap-2"><PenSquare className="h-5 w-5" />Teacher Remarks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {profileData.remarks.length > 0 ? (
                                <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2">
                                    {profileData.remarks.map(remark => (
                                        <div key={remark.id} className="text-sm border-l-2 pl-3">
                                            <p className="font-medium">{remark.remark}</p>
                                            <p className="text-xs text-muted-foreground">
                                                on {format(new Date(remark.created_at), 'PPP')} for {remark.subject}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-muted-foreground">No remarks have been added.</p>}
                        </CardContent>
                    </Card>
                </div>
            </div>
        )}
        
        {!isLoadingProfile && !selectedRollNo && studentList.length > 0 && (
            <CallToActionCard />
        )}

        {!isLoadingProfile && !isLoadingList && studentList.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed rounded-lg mt-6">
                <h3 className="text-lg font-semibold text-muted-foreground">No Student Data Found</h3>
                <p className="text-sm text-muted-foreground mt-1">Add attendance records to populate the student list.</p>
            </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}

const ProfileSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
        <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    </div>
);
