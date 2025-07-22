
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { QuestionGenerator } from "@/components/question-generator";
import { GradeAnalyzer } from "@/components/grade-analyzer";
import { TeachingPlanAdvisor } from "@/components/teaching-plan-advisor";
import { PerformanceDashboard } from "@/components/performance-dashboard";
import { QuestionPaperGenerator } from "@/components/question-paper-generator";
import { AttendanceTracker } from "@/components/attendance-tracker";
import { MarkCalculator } from "@/components/mark-calculator";
import { KnowledgeGalaxy } from "@/components/knowledge-galaxy";
import { StudentProfile } from "@/components/student-profile";
import { AcademicCalendar } from "@/components/academic-calendar";
import { AssignmentGrader } from "@/components/assignment-grader";
import { ProjectTracker } from "@/components/project-tracker";
import { DocumentVault } from "@/components/document-vault";
import { ClassroomGamifier } from "@/components/classroom-gamifier";
import { PlagiarismChecker } from "@/components/plagiarism-checker";
import { MainNavigation } from "@/components/main-navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LampContainer } from "@/components/ui/lamp";

const componentMap: { [key: string]: React.ComponentType } = {
  "student-profile": StudentProfile,
  "academic-calendar": AcademicCalendar,
  "gamifier": ClassroomGamifier,
  "document-vault": DocumentVault,
  "question-generator": QuestionGenerator,
  "question-paper-generator": QuestionPaperGenerator,
  "assignment-grader": AssignmentGrader,
  "project-tracker": ProjectTracker,
  "grade-analyzer": GradeAnalyzer,
  "teaching-plan-advisor": TeachingPlanAdvisor,
  "report-dashboard": PerformanceDashboard,
  "attendance-tracker": AttendanceTracker,
  "mark-calculator": MarkCalculator,
  "knowledge-galaxy": KnowledgeGalaxy,
  "plagiarism-checker": PlagiarismChecker,
};

type ViewState = 'welcome' | 'hub' | 'feature';

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>('welcome');
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const ActiveComponent = activeTab ? componentMap[activeTab] : null;

  const handleNodeClick = (tab: string) => {
    setActiveTab(tab);
    setViewState('feature');
  }

  const renderContent = () => {
    switch (viewState) {
      case 'welcome':
        return (
          <LampContainer>
            <motion.h1
              initial={{ opacity: 0.5, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="bg-gradient-to-br from-blue-300 to-violet-500 bg-clip-text py-4 text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
            >
              EduBuddy AI
            </motion.h1>
             <motion.p 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                    delay: 0.5,
                    duration: 0.8,
                    ease: "easeInOut",
                }}
                className="mt-4 text-lg text-center text-slate-400 max-w-lg"
             >
                Your AI-powered toolkit for teaching excellence.
            </motion.p>
            <motion.div
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                    delay: 0.7,
                    duration: 0.8,
                    ease: "easeInOut",
                }}
                animate={{
                    y: [0, -8, 0],
                }}
                className="mt-8"
            >
                <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setViewState('hub')}
                    className="bg-transparent text-white border-white/50 hover:bg-white/10 hover:text-white"
                >
                    Get Started
                </Button>
            </motion.div>
          </LampContainer>
        );

      case 'hub':
        return <MainNavigation setActiveTab={handleNodeClick} />;

      case 'feature':
        return (
          <main className="flex-1 p-4 sm:p-6 md:p-8">
            <Button variant="outline" size="sm" onClick={() => setViewState('hub')} className="absolute top-4 left-4 z-20">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Hub
            </Button>
            {ActiveComponent && <ActiveComponent />}
          </main>
        );

      default:
        return null;
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-950 text-slate-50">
      {renderContent()}
    </div>
  );
}
