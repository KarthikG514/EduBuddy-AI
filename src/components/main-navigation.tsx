
"use client";

import {
  TestTube,
  BarChart3,
  BookMarked,
  LayoutDashboard,
  FileText,
  ClipboardList,
  Calculator,
  ListTodo,
  UserCircle,
  Calendar,
  GraduationCap,
  KanbanSquare,
  Archive,
  Gamepad2,
  Orbit,
  Sparkles,
  ScanSearch,
} from "lucide-react";
import RadialOrbitalTimeline from "./ui/radial-orbital-timeline";


export const navigationData = [
    {
      id: 1,
      value: "student-profile",
      title: "Student Profile",
      content: "View detailed student profiles.",
      icon: UserCircle,
      relatedIds: [2, 8],
      status: "completed" as const,
      energy: 100,
    },
    {
      id: 2,
      value: "academic-calendar",
      title: "Calendar",
      content: "Manage academic events and schedules.",
      icon: Calendar,
      relatedIds: [1, 3],
      status: "completed" as const,
      energy: 95,
    },
    {
      id: 3,
      value: "gamifier",
      title: "Gamifier",
      content: "Create fun classroom games.",
      icon: Gamepad2,
      relatedIds: [2, 4],
      status: "completed" as const,
      energy: 90,
    },
    {
      id: 4,
      value: "document-vault",
      title: "Document Vault",
      content: "Manage student documents.",
      icon: Archive,
      relatedIds: [3, 5],
      status: "completed" as const,
      energy: 85,
    },
    {
      id: 5,
      value: "question-generator",
      title: "MCQ Generator",
      content: "Generate multiple-choice questions.",
      icon: TestTube,
      relatedIds: [4, 6],
      status: "completed" as const,
      energy: 80,
    },
    {
      id: 6,
      value: "question-paper-generator",
      title: "Question Paper",
      content: "Create full question papers.",
      icon: FileText,
      relatedIds: [5, 7],
      status: "completed" as const,
      energy: 75,
    },
    {
      id: 7,
      value: "assignment-grader",
      title: "Assignment Grader",
      content: "Grade assignments with AI assistance.",
      icon: GraduationCap,
      relatedIds: [6, 8],
      status: "in-progress" as const,
      energy: 70,
    },
    {
      id: 8,
      value: "project-tracker",
      title: "Project Tracker",
      content: "Track final year student projects.",
      icon: KanbanSquare,
      relatedIds: [7, 9, 1],
      status: "in-progress" as const,
      energy: 65,
    },
    {
      id: 9,
      value: "grade-analyzer",
      title: "Grade Analyzer",
      content: "Analyze student grades from files.",
      icon: BarChart3,
      relatedIds: [8, 10],
      status: "in-progress" as const,
      energy: 60,
    },
    {
      id: 10,
      value: "teaching-plan-advisor",
      title: "Teaching Advisor",
      content: "Get advice on teaching plans.",
      icon: BookMarked,
      relatedIds: [9, 11],
      status: "pending" as const,
      energy: 55,
    },
    {
      id: 11,
      value: "report-dashboard",
      title: "Report Dashboard",
      content: "View performance reports.",
      icon: LayoutDashboard,
      relatedIds: [10, 12],
      status: "pending" as const,
      energy: 50,
    },
     {
      id: 12,
      value: "attendance-tracker",
      title: "Attendance",
      content: "Track student attendance.",
      icon: ClipboardList,
      relatedIds: [11, 13],
      status: "pending" as const,
      energy: 45,
    },
    {
      id: 13,
      value: "mark-calculator",
      title: "Mark Calculator",
      content: "Calculate internal marks.",
      icon: Calculator,
      relatedIds: [12, 14],
      status: "pending" as const,
      energy: 40,
    },
    {
      id: 14,
      value: "knowledge-galaxy",
      title: "Knowledge Galaxy",
      content: "Visualize course syllabus.",
      icon: Sparkles,
      relatedIds: [13, 15],
      status: "pending" as const,
      energy: 35,
    },
    {
      id: 15,
      value: "plagiarism-checker",
      title: "Plagiarism Checker",
      content: "Compare documents for similarity.",
      icon: ScanSearch,
      relatedIds: [14],
      status: "pending" as const,
      energy: 30,
    },
];


interface MainNavigationProps {
    setActiveTab: (tab: string) => void;
}

export function MainNavigation({ setActiveTab }: MainNavigationProps) {
    const timelineData = navigationData.map(item => ({
        ...item,
        date: "Feature",
        category: "Module"
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full h-screen">
            <div className="w-full h-full">
                <RadialOrbitalTimeline timelineData={timelineData} onNodeClick={(id) => {
                    const navItem = navigationData.find(item => item.id === id);
                    if (navItem) {
                        setActiveTab(navItem.value);
                    }
                }} />
            </div>
             <div className="hidden lg:flex flex-col items-center justify-center text-center p-8">
                <div className="relative mb-8">
                    <Orbit className="h-32 w-32 text-primary/30 animate-spin" style={{ animationDuration: '20s' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-20 w-20 rounded-full bg-primary/20 animate-pulse"></div>
                    </div>
                </div>
                <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-slate-300 to-slate-500 bg-clip-text text-transparent">
                    EduBuddy AI
                </h1>
                <p className="mt-4 text-lg max-w-md text-slate-400">
                    Your AI-powered toolkit for teaching excellence. Select a feature from the orbital menu to get started.
                </p>
            </div>
        </div>
    )
}
