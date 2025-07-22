
"use server";

import { generateQuestions } from "@/ai/flows/generate-questions";
import { generateFeedback } from "@/ai/flows/generate-feedback";
import { generateQuestionsFromFile } from "@/ai/flows/generate-questions-from-file";
import { generateAdvice } from "@/ai/flows/generate-advice";
import { generateQuestionPaper } from "@/ai/flows/generate-question-paper";
import { generateAttendanceReport } from "@/ai/flows/generate-attendance-report";
import { generateMarkFeedback } from "@/ai/flows/generate-mark-feedback";
import { gradeAssignment } from "@/ai/flows/grade-assignment-flow";
import { generateClassroomGame } from "@/ai/flows/generate-classroom-game";
import { generateKnowledgeGalaxy } from "@/ai/flows/generate-knowledge-galaxy";
import { checkPlagiarism } from "@/ai/flows/check-plagiarism";
import { 
    GenerateQuestionsInputSchema,
    GenerateFeedbackInputSchema,
    GenerateQuestionsFromFileInputSchema,
    GenerateAdviceInputSchema,
    GenerateQuestionPaperInputSchema,
    GenerateAttendanceReportInputSchema,
    SaveAttendanceInputSchema,
    SaveInternalMarksInputSchema,
    SaveSyllabusTrackerInputSchema,
    SaveAcademicEventInputSchema,
    GradeAssignmentInputSchema,
    ProjectTrackerInputSchema,
    UploadStudentDocumentInputSchema,
    GenerateClassroomGameInputSchema,
    SaveGameScoreInputSchema,
    GenerateKnowledgeGalaxyInputSchema,
    CreateCustomQuizInputSchema,
    LoginSchema,
    RegisterSchema,
    PlagiarismCheckInputSchema,
    type GenerateQuestionsInput, 
    type GenerateFeedbackInput, 
    type GenerateFeedbackOutput,
    type MCQQuestion,
    type GenerateQuestionsFromFileInput,
    type GenerateAdviceOutput,
    type GenerateQuestionPaperInput,
    type GenerateQuestionPaperOutput,
    type GenerateAttendanceReportInput,
    type GenerateAttendanceReportOutput,
    type SaveAttendanceInput,
    type SaveInternalMarksInput,
    type PerformanceReport,
    type AttendanceRecord,
    type SyllabusTrackerRecord,
    type SaveSyllabusTrackerInput,
    type TeacherRemarkRecord,
    type StudentInfo,
    type StudentProfileData,
    type AcademicEventRecord,
    type GradeAssignmentOutput,
    type ProjectTrackerInput,
    type ProjectTrackerRecord,
    type StudentDocumentRecord,
    type GenerateClassroomGameOutput,
    type GameLeaderboardRecord,
    type SaveGameScoreInput,
    type GenerateKnowledgeGalaxyOutput,
    type CreateCustomQuizInput,
    type CustomQuizRecord,
    type LoginInput,
    type RegisterInput,
    type GenerateKnowledgeGalaxyInput,
    type PlagiarismCheckInput,
    type PlagiarismCheckOutput,
} from "@/ai/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import mammoth from 'mammoth';

// === Question Actions ===
type QuestionActionResponse = {
  questions?: MCQQuestion[];
  error?: string;
};

async function saveQuestionsToSupabase(questions: MCQQuestion[], topic?: string) {
    if (!topic || questions.length === 0) return;

    const questionsToInsert = questions.map(q => ({
        topic: topic,
        question_text: q.question,
        option_a: q.options.A,
        option_b: q.options.B,
        option_c: q.options.C,
        option_d: q.options.D,
        correct_option: q.answer
    }));

    const supabase = getSupabaseAdmin();
    if (!supabase) return;
    const { error } = await supabase.from('mcq_questions').insert(questionsToInsert);
    if (error) {
        console.error("Error saving questions to Supabase:", error);
    }
}

export async function generateQuestionsAction(input: GenerateQuestionsInput): Promise<QuestionActionResponse> {
  const parsedInput = GenerateQuestionsInputSchema.safeParse(input);

  if (!parsedInput.success) {
    console.error("Invalid input for question generation:", parsedInput.error.flatten());
    return { error: "Invalid input." };
  }

  try {
    const output = await generateQuestions(parsedInput.data);
    if (output.questions) {
        saveQuestionsToSupabase(output.questions, parsedInput.data.topic);
    }
    return { questions: output.questions };
  } catch (error) {
    console.error("Error generating questions:", error);
    return { error: "Failed to generate questions. The AI model may be unavailable or the request timed out. Please try again later." };
  }
}

export async function generateQuestionsFromFileAction(input: GenerateQuestionsFromFileInput): Promise<QuestionActionResponse> {
  const parsedInput = GenerateQuestionsFromFileInputSchema.safeParse(input);

  if (!parsedInput.success) {
    console.error("Invalid input for question generation from file:", parsedInput.error.flatten());
    return { error: "Invalid input." };
  }

  try {
    const output = await generateQuestionsFromFile(parsedInput.data);
    if (output.questions) {
        saveQuestionsToSupabase(output.questions, parsedInput.data.topic);
    }
    return { questions: output.questions };
  } catch (error) {
    console.error("Error generating questions from file:", error);
    return { error: "Failed to generate questions from the file. The AI model may be unavailable or the request timed out. Please try again later." };
  }
}

async function saveFeedbackToSupabase(feedbackData: GenerateFeedbackOutput, input: GenerateFeedbackInput) {
    const supabase = getSupabaseAdmin();
    if (!supabase) return;
    
    const score = Object.values(input.marks).reduce((sum, mark) => sum + mark, 0);
    const total = input.subjects.length * 100; // Assuming 100 max marks per subject, consistent with grade-analyzer
    const subject = input.subjects.join(', ');

    const reportToInsert = {
      student_name: input.studentName,
      subject: subject,
      score: score,
      total: total,
      feedback: JSON.stringify({
          strengths: feedbackData.strengths,
          weaknesses: feedbackData.weaknesses,
          improvementTips: feedbackData.improvementTips,
      }),
      improvement_plan: JSON.stringify(feedbackData.studyPlan),
    };
    
    const { error } = await supabase.from('performance_reports').insert([reportToInsert]);
    if (error) {
        console.error("Error saving performance report to Supabase:", error);
    }
}

type FeedbackActionResponse = {
    feedback?: GenerateFeedbackOutput;
    error?: string;
};

export async function generateFeedbackAction(input: GenerateFeedbackInput): Promise<FeedbackActionResponse> {
    const parsedInput = GenerateFeedbackInputSchema.safeParse(input);

    if (!parsedInput.success) {
        return { error: "Invalid input for feedback generation." };
    }

    try {
        const output = await generateFeedback(parsedInput.data);
        if (output) {
            await saveFeedbackToSupabase(output, parsedInput.data);
        }
        revalidatePath('/');
        return { feedback: output };
    } catch (error) {
        console.error("Error generating feedback:", error);
        return { error: "Failed to generate AI feedback. The model may be unavailable or the request timed out. Please try again." };
    }
}

type AdviceActionResponse = {
    advice?: GenerateAdviceOutput;
    error?: string;
};

async function saveAdviceToSupabase(advice: GenerateAdviceOutput, input: { subject?: string; text?: string; fileDataUri?: string }) {
    const supabase = getSupabaseAdmin();
    if (!supabase) return;

    const planToInsert = {
      teacher_id: null, // No user to associate with
      subject: input.subject,
      uploaded_content: input.fileDataUri || input.text,
      covered_topics: JSON.stringify(advice.coveredTopics),
      next_topic: advice.nextTopic,
      revision_topics: JSON.stringify(advice.suggestedRevisions),
      missed_concepts: JSON.stringify(advice.skippedConcepts)
    };
    
    const { error } = await supabase.from('teaching_plans').insert([planToInsert]);
    if (error) {
        console.error("Error saving teaching plan to Supabase:", error);
    }
}

export async function generateAdviceAction(input: { subject?: string; text?: string; fileDataUri?: string }): Promise<AdviceActionResponse> {
    const parsedInput = GenerateAdviceInputSchema.safeParse(input);

    if (!parsedInput.success) {
        console.error("Invalid input for advice generation:", parsedInput.error.flatten());
        return { error: "Invalid input." };
    }

    try {
        const output = await generateAdvice(parsedInput.data);
        if (output) {
            saveAdviceToSupabase(output, parsedInput.data);
        }
        return { advice: output };
    } catch (error) {
        console.error("Error generating advice:", error);
        return { error: "Failed to generate teaching advice. The AI model may be unavailable or the request timed out. Please try again." };
    }
}

type ReportActionResponse = {
    reports?: PerformanceReport[];
    error?: string;
}

export async function getPerformanceReports(): Promise<ReportActionResponse> {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { error: "Could not create Supabase admin client." };
    
    const { data, error } = await supabase
      .from("performance_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching performance reports:", error);
        return { error: "Could not fetch performance reports. Please ensure the 'performance_reports' table exists and that your Supabase credentials are correct." };
    }

    return { reports: data as PerformanceReport[] };
}

type QuestionPaperActionResponse = {
    paper?: GenerateQuestionPaperOutput;
    error?: string;
};

async function saveQuestionPaperToSupabase(paper: GenerateQuestionPaperOutput, input: GenerateQuestionPaperInput) {
    const supabase = getSupabaseAdmin();
    if (!supabase) return;
    
    const paperToInsert = {
      teacher_id: null, // No user to associate with
      subject: input.subject,
      unit: input.unit || `File: ${new Date().toISOString()}`,
      one_mark: paper.oneMarkQuestions,
      two_mark: paper.twoMarkQuestions,
      ten_mark: paper.tenMarkQuestions,
    };

    const { error } = await supabase.from('question_papers_v2').insert([paperToInsert]);
    if (error) {
        console.error("Error saving question paper to Supabase:", error);
    }
}

export async function generateQuestionPaperAction(input: GenerateQuestionPaperInput): Promise<QuestionPaperActionResponse> {
    const parsedInput = GenerateQuestionPaperInputSchema.safeParse(input);

    if (!parsedInput.success) {
        console.error("Invalid input for question paper generation:", parsedInput.error.flatten());
        return { error: "Invalid input." };
    }

    try {
        const output = await generateQuestionPaper(parsedInput.data);
        if (output) {
            saveQuestionPaperToSupabase(output, parsedInput.data);
        }
        return { paper: output };
    } catch (error) {
        console.error("Error generating question paper:", error);
        return { error: "Failed to generate the question paper. The AI model may be unavailable or the request timed out. Please try again." };
    }
}

type AttendanceResponse = {
    records?: AttendanceRecord[];
    error?: string;
};

export async function getAttendanceRecords(): Promise<AttendanceResponse> {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { error: "Could not create Supabase admin client." };
    const { data, error } = await supabase
        .from('student_attendance')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching attendance records:', error);
        return { error: "Could not fetch attendance data. Please ensure the 'student_attendance' table exists." };
    }

    return { records: data as AttendanceRecord[] };
}

type AttendanceReportActionResponse = {
    report?: GenerateAttendanceReportOutput;
    error?: string;
};

export async function generateAttendanceReportAction(input: GenerateAttendanceReportInput): Promise<AttendanceReportActionResponse> {
    const parsedInput = GenerateAttendanceReportInputSchema.safeParse(input);

    if (!parsedInput.success) {
        console.error("Invalid input for attendance report generation:", parsedInput.error.flatten());
        return { error: "Invalid input." };
    }

    try {
        const output = await generateAttendanceReport(parsedInput.data);
        return { report: output };
    } catch (error) {
        console.error("Error generating attendance report:", error);
        return { error: "Failed to generate attendance report. The AI model may be unavailable or the request timed out." };
    }
}

export async function saveAttendanceAction(input: SaveAttendanceInput): Promise<{ message?: string, error?: string }> {
    const parsedInput = SaveAttendanceInputSchema.safeParse(input);
    if (!parsedInput.success) {
        return { error: "Invalid input." };
    }
    
    const { data } = parsedInput;
    const supabase = getSupabaseAdmin();
    if (!supabase) return { error: "Could not create Supabase admin client." };
        
    const record = {
        student_name: data.student_name,
        roll_no: data.roll_no,
        date: data.date, 
        subject: data.subject,
        period: data.period,
        status: data.status,
        remark: data.remark || null,
        behavior_tags: data.behavior_tags || null,
    };
    
    const { error } = await supabase
        .from('student_attendance')
        .insert([record]);
            
    if (error) {
        console.error("Error inserting attendance:", error);
        return { error: "Could not save attendance data due to a database error." };
    }
    
    revalidatePath('/');
    return { message: `Saved attendance for ${data.student_name} (${data.period}) — ${data.status} on ${data.date}`};
}

type MarkCalculatorActionResponse = {
    feedback?: string;
    error?: string;
};

export async function saveInternalMarksAction(input: SaveInternalMarksInput): Promise<MarkCalculatorActionResponse> {
    const parsedInput = SaveInternalMarksInputSchema.safeParse(input);

    if (!parsedInput.success) {
        console.error("Invalid input for mark calculation:", parsedInput.error.flatten());
        return { error: "Invalid input." };
    }

    const { student_name, roll_no, subject, test1, test2, assignment, attendance } = parsedInput.data;
    
    const internal_score = test1 + test2 + assignment;
    
    let grade = 'F';
    if (internal_score >= 27) grade = 'A+';
    else if (internal_score >= 24) grade = 'A';
    else if (internal_score >= 21) grade = 'B';
    else if (internal_score >= 18) grade = 'C';
    else if (internal_score >= 15) grade = 'D';

    try {
        // Generate AI feedback
        const feedbackResult = await generateMarkFeedback({
            studentName: student_name,
            internalScore: internal_score,
            grade: grade,
            attendance: attendance,
        });

        if (!feedbackResult.feedback) {
            throw new Error("AI failed to generate feedback.");
        }

        const supabase = getSupabaseAdmin();
        if (!supabase) return { error: "Could not create Supabase admin client." };
        // Save to Supabase
        const recordToInsert = {
            student_name,
            roll_no,
            subject,
            test1,
            test2,
            assignment,
            attendance,
            internal_score,
            grade,
            feedback: feedbackResult.feedback,
        };
        
        const { error: dbError } = await supabase.from('internal_marks').insert([recordToInsert]);

        if (dbError) {
            console.error("Error saving internal marks to Supabase:", dbError);
            throw new Error("Failed to save the record to the database.");
        }
        revalidatePath('/');
        return { feedback: feedbackResult.feedback };
    } catch (error) {
        console.error("Error in saveInternalMarksAction:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during feedback generation or saving.";
        return { error: errorMessage };
    }
}

export async function getSyllabusTrackerRecords(): Promise<{ records?: SyllabusTrackerRecord[], error?: string }> {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { error: "Could not create Supabase admin client." };

    const { data, error } = await supabase
        .from('syllabus_tracker')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching syllabus tracker records:', error);
        return { error: "Could not fetch syllabus tracker data. Please check your RLS policies." };
    }

    return { records: data };
}

export async function saveSyllabusTrackerAction(input: SaveSyllabusTrackerInput): Promise<{ message?: string, error?: string }> {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { error: "Could not create Supabase admin client." };

    const parsedInput = SaveSyllabusTrackerInputSchema.safeParse(input);
    if (!parsedInput.success) {
        return { error: "Invalid input." };
    }
    
    const { subject, topic } = parsedInput.data;
    
    const record = {
        subject: subject,
        topic: topic,
        completed: false, // Always false on creation
        uploaded_by: null, // No user to associate with
    };
    
    const { error } = await supabase.from('syllabus_tracker').insert([record]);
            
    if (error) {
        console.error("Error inserting syllabus topic:", error);
        return { error: "Could not save syllabus data due to a database error." };
    }
    revalidatePath('/');
    return { message: `Added topic "${topic}" to ${subject}.`};
}

export async function updateSyllabusTopicStatusAction(id: string, completed: boolean): Promise<{ message?: string, error?: string }> {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { error: "Could not create Supabase admin client." };
    
    const { error } = await supabase
        .from('syllabus_tracker')
        .update({ completed })
        .eq('id', id);

    if (error) {
        console.error("Error updating syllabus topic:", error);
        return { error: "Could not update topic status." };
    }
    revalidatePath('/');
    return { message: "Topic status updated." };
}


export async function getStudentList(): Promise<{ students?: StudentInfo[], error?: string }> {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { error: "Could not create Supabase admin client." };
    const { data, error } = await supabase
        .from('student_attendance')
        .select('student_name, roll_no')
        .order('student_name', { ascending: true });

    if (error) {
        console.error('Error fetching student list:', error);
        return { error: 'Could not fetch student list.' };
    }

    const uniqueStudents = Array.from(new Map(data.map(item => [item.roll_no, item])).values());
    
    return { students: uniqueStudents };
}

export async function getStudentProfileData(rollNo: string): Promise<{ profile?: StudentProfileData, error?: string }> {
    try {
        const supabase = getSupabaseAdmin();
        if (!supabase) return { error: "Could not create Supabase admin client." };
        const { data: attendanceData, error: attendanceError } = await supabase
            .from('student_attendance')
            .select('status, behavior_tags')
            .eq('roll_no', rollNo);
        if (attendanceError) throw new Error(`Attendance fetch failed: ${attendanceError.message}`);

        const totalDays = attendanceData.length;
        const presentDays = attendanceData.filter(r => r.status === 'Present' || r.status === 'Late').length;
        const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
        
        const behaviorTags = [...new Set(
            attendanceData
                .flatMap(r => (r.behavior_tags ? r.behavior_tags.split(',').map(tag => tag.trim()) : []))
                .filter(Boolean)
        )];
        
        const { data: marksData, error: marksError } = await supabase
            .from('internal_marks')
            .select('subject, internal_score, grade, student_name')
            .eq('roll_no', rollNo);
        if (marksError) throw new Error(`Marks fetch failed: ${marksError.message}`);

        const { data: remarksData, error: remarksError } = await supabase
            .from('teacher_remarks')
            .select('*')
            .eq('roll_no', rollNo)
            .order('created_at', { ascending: false });
        if (remarksError) throw new Error(`Remarks fetch failed: ${remarksError.message}`);

        const studentName = marksData?.[0]?.student_name || attendanceData?.[0]?.student_name || 'N/A';

        const { data: feedbackData, error: feedbackError } = await supabase
            .from('performance_reports')
            .select('feedback')
            .eq('student_name', studentName)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        
        let aiFeedback = null;
        if (feedbackData?.feedback) {
            try {
                const parsedFeedback = typeof feedbackData.feedback === 'string' ? JSON.parse(feedbackData.feedback) : feedbackData.feedback;
                aiFeedback = parsedFeedback.improvementTips || "No specific tips available.";
            } catch (e) {
                aiFeedback = "Could not parse AI feedback.";
            }
        }

        const profile: StudentProfileData = {
            studentName,
            rollNo: rollNo,
            attendance: {
                percentage: attendancePercentage,
                presentDays: presentDays,
                totalDays: totalDays,
            },
            behaviorTags: behaviorTags,
            marks: marksData.map(m => ({
                subject: m.subject,
                internal_score: m.internal_score,
                grade: m.grade
            })),
            remarks: remarksData as TeacherRemarkRecord[],
            aiFeedback: aiFeedback,
        };

        return { profile };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred fetching profile data.";
        console.error("Error in getStudentProfileData:", errorMessage);
        return { error: errorMessage };
    }
}


export async function getAcademicEventsAction(): Promise<{ events?: AcademicEventRecord[], error?: string }> {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) return { error: "Could not create Supabase admin client." };
    const { data, error } = await supabaseAdmin
        .from('academic_calendar')
        .select('*')
        .order('event_date', { ascending: true });

    if (error) {
        console.error('Error fetching academic events:', error);
        return { error: "Could not fetch academic events data." };
    }

    return { events: data };
}

export async function saveAcademicEventAction(
    input: Omit<AcademicEventRecord, 'id' | 'created_at' | 'posted_by' | 'event_date'> & { event_date: Date }
): Promise<{ message?: string, error?: string }> {
    const parsedInput = SaveAcademicEventInputSchema.safeParse(input);
    if (!parsedInput.success) {
        return { error: "Invalid input. " + parsedInput.error.flatten().formErrors.join(', ') };
    }
    
    const { title, description, event_date, event_type } = parsedInput.data;
    
    const formattedDate = format(event_date, 'yyyy-MM-dd');
    
    const record = {
        title,
        description: description || null,
        event_date: formattedDate,
        event_type,
        posted_by: null // No user to associate with
    };
    
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) return { error: "Could not create Supabase admin client." };
    const { error } = await supabaseAdmin.from('academic_calendar').insert([record]);
            
    if (error) {
        console.error("Error inserting academic event:", error);
        return { error: "Could not insert new event record." };
    }
    
    revalidatePath('/');

    return { message: `Successfully added event: "${title}"`};
}

type GradeAssignmentActionResponse = {
    result?: GradeAssignmentOutput;
    error?: string;
};

export async function gradeAssignmentAction(input: { studentName: string; subject: string; fileDataUri: string }): Promise<GradeAssignmentActionResponse> {
    const parsedInput = GradeAssignmentInputSchema.safeParse(input);

    if (!parsedInput.success) {
        console.error("Invalid input for assignment grading:", parsedInput.error.flatten());
        return { error: "Invalid input." };
    }

    try {
        const output = await gradeAssignment(parsedInput.data);
        if (output) {
            // Save to Supabase
            const supabase = getSupabaseAdmin();
            if (!supabase) return { error: "Could not create Supabase admin client." };
            const { error } = await supabase.from('assignment_scores').insert([{
                student_name: parsedInput.data.studentName,
                subject: parsedInput.data.subject,
                score: output.score,
                feedback: output.feedback,
            }]);

            if (error) {
                console.error("Error saving assignment score to Supabase:", error);
                throw new Error("Failed to save the grading result to the database.");
            }
        }
        revalidatePath('/');
        return { result: output };
    } catch (error) {
        console.error("Error grading assignment:", error);
        return { error: "Failed to grade the assignment. The AI model may be unavailable or the request timed out. Please try again." };
    }
}

export async function getProjectTrackerRecords(): Promise<{ records?: ProjectTrackerRecord[], error?: string }> {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { error: "Could not create Supabase admin client." };
    const { data, error } = await supabase
        .from('project_tracker')
        .select('*')
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching project tracker records:', error);
        return { error: "Could not fetch project tracker data." };
    }
    return { records: data };
}

export async function saveOrUpdateProjectTrackerAction(input: ProjectTrackerInput): Promise<{ message?: string, error?: string }> {
    const parsedInput = ProjectTrackerInputSchema.safeParse(input);
    if (!parsedInput.success) {
        return { error: "Invalid input: " + parsedInput.error.flatten().formErrors.join(', ') };
    }

    const { id, roll_no, ...recordData } = parsedInput.data;
    
    const recordToSave = { roll_no, ...recordData };
    const supabase = getSupabaseAdmin();
    if (!supabase) return { error: "Could not create Supabase admin client." };
    if (id) {
        const { error } = await supabase
            .from('project_tracker')
            .update(recordToSave)
            .eq('id', id);

        if (error) {
            console.error("Error updating project:", error);
            return { error: "Could not update project record." };
        }
        revalidatePath('/');
        return { message: `Updated project for ${recordToSave.student_name}.` };
    }
    
    const { data: existing, error: selectError } = await supabase
        .from('project_tracker')
        .select('id')
        .eq('roll_no', roll_no)
        .limit(1)
        .single();
    
    if (selectError && selectError.code !== 'PGRST116') {
        console.error("DB error checking for duplicates:", selectError);
        return { error: "Database error." };
    }
    
    if (existing) {
        return { error: `A project for Roll No. ${roll_no} already exists.` };
    }

    const { error: insertError } = await supabase
        .from('project_tracker')
        .insert([recordToSave]);
        
    if (insertError) {
        console.error("Error inserting project:", insertError);
        return { error: "Could not insert new project record." };
    }
    
    revalidatePath('/');
    return { message: `Added project for ${recordToSave.student_name}.` };
}

// === Student Document Vault Actions ===

// Get all documents for the teacher view
export async function getStudentDocumentsAction(): Promise<{ records?: StudentDocumentRecord[], error?: string }> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('student_documents')
        .select('*')
        .order('uploaded_at', { ascending: false });

    if (error) {
        console.error('Error fetching student documents:', error.message);
        return { error: "Could not fetch student documents. Please check your Supabase SELECT policy on the 'student_documents' table." };
    }
    return { records: data };
}

// Verify or un-verify a document
export async function updateDocumentStatusAction(documentId: string, verified: boolean): Promise<{ record?: StudentDocumentRecord, error?: string }> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('student_documents')
        .update({ verified })
        .eq('id', documentId)
        .select()
        .single();

    if (error) {
        console.error('Error updating document status:', error);
        return { error: "Could not update document status." };
    }
    revalidatePath('/');
    return { record: data };
}

// Upload a new document
export async function uploadStudentDocumentAction(formData: FormData): Promise<{ message?: string, error?: string }> {
    const rawData = {
        student_name: formData.get('student_name'),
        roll_no: formData.get('roll_no'),
        doc_type: formData.get('doc_type'),
    };
    
    const parsedInput = UploadStudentDocumentInputSchema.safeParse(rawData);
    if (!parsedInput.success) {
        const firstError = parsedInput.error.errors[0]?.message || 'Invalid input.';
        return { error: firstError };
    }

    const file = formData.get('file') as File;
    if (!file || file.size === 0) {
        return { error: 'File is required.' };
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return { error: 'File size must be less than 5MB.' };
    }

    try {
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const basePath = 'public';
        const filePath = `${basePath}/${parsedInput.data.roll_no}/${Date.now()}-${sanitizedFileName}`;

        const BUCKET_NAME = 'student-documents';
        const supabase = createServerClient();

        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file);

        if (uploadError) {
            console.error('Supabase Storage Upload Error:', uploadError);
            throw new Error(`Storage error: ${uploadError.message}. Please ensure the bucket '${BUCKET_NAME}' exists and has the correct policies.`);
        }

        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

        if (!urlData.publicUrl) {
            await supabase.storage.from(BUCKET_NAME).remove([filePath]);
            throw new Error("Could not get public URL for the uploaded file.");
        }

        const recordToInsert = {
            ...parsedInput.data,
            file_path: filePath,
            file_url: urlData.publicUrl,
            uploaded_by: 'student', // No user context
            verified: false,
        };

        const { error: insertError } = await supabase.from('student_documents').insert([recordToInsert]);

        if (insertError) {
            await supabase.storage.from(BUCKET_NAME).remove([filePath]);
            throw new Error(`Database error: ${insertError.message}`);
        }
        revalidatePath('/upload');
        revalidatePath('/');
        return { message: "Document uploaded successfully! It will be reviewed by your teacher." };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during upload.";
        console.error("Upload failed:", errorMessage);
        return { error: errorMessage };
    }
}

// === Classroom Gamifier Actions ===

export async function generateClassroomGameAction(
    topic: string
): Promise<{ game?: GenerateClassroomGameOutput, error?: string }> {
    const parsedInput = GenerateClassroomGameInputSchema.safeParse({ topic });
    if (!parsedInput.success) return { error: "Invalid input." };

    try {
        const gameData = await generateClassroomGame(parsedInput.data);
        return { game: gameData };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        console.error("Error in generateClassroomGameAction:", errorMessage);
        return { error: errorMessage };
    }
}

export async function createCustomQuizAction(input: CreateCustomQuizInput): Promise<{ quizId?: string, error?: string }> {
    const parsedInput = CreateCustomQuizInputSchema.safeParse(input);
    if (!parsedInput.success) return { error: "Invalid input." };

    const supabase = getSupabaseAdmin();
    if (!supabase) return { error: "Could not connect to the database." };

    const { data, error } = await supabase
        .from('custom_quizzes')
        .insert({
            topic: parsedInput.data.topic,
            questions: JSON.stringify(parsedInput.data.questions),
            created_by: null, // No auth
        })
        .select('id')
        .single();
    
    if (error) {
        console.error("Error creating custom quiz:", error);
        return { error: "Failed to save the quiz to the database." };
    }
    
    revalidatePath('/');
    return { quizId: data.id };
}

export async function getQuizAction(id: string): Promise<{ quiz?: CustomQuizRecord, error?: string }> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('custom_quizzes')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error) {
        console.error(`Error fetching quiz ${id}:`, error);
        return { error: "Could not find the requested quiz." };
    }
    return { quiz: data };
}


export async function getLeaderboardAction(topic: string): Promise<{ records?: GameLeaderboardRecord[], error?: string }> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('gamification_leaderboard')
        .select('*')
        .eq('topic', topic)
        .order('score', { ascending: false })
        .limit(10);

    if (error) {
        console.error("Error fetching leaderboard:", error);
        return { error: "Could not fetch leaderboard data." };
    }
    return { records: data };
}

export async function saveGameScoreAction(input: SaveGameScoreInput): Promise<{ success?: boolean, error?: string }> {
    const parsedInput = SaveGameScoreInputSchema.safeParse(input);
    if (!parsedInput.success) return { error: "Invalid input." };
    
    const supabase = getSupabaseAdmin();
    if (!supabase) return { error: "Could not connect to the database." };

    const { error } = await supabase.from('gamification_leaderboard').insert([parsedInput.data]);
    if (error) {
        console.error("Error saving score:", error);
        return { error: "Failed to save score." };
    }
    revalidatePath('/');
    return { success: true };
}


// === Knowledge Galaxy Actions ===

export async function generateKnowledgeGalaxyAction(
    input: GenerateKnowledgeGalaxyInput,
): Promise<{ galaxy?: GenerateKnowledgeGalaxyOutput, error?: string }> {
    const parsedInput = GenerateKnowledgeGalaxyInputSchema.safeParse(input);
    if (!parsedInput.success) return { error: "Invalid input." };

    try {
        const galaxyData = await generateKnowledgeGalaxy(parsedInput.data);
        if (!galaxyData || !galaxyData.subject) {
            // Add a subject if the AI didn't provide one (e.g., from a file)
            const fallbackSubject = input.subject || "Uploaded Syllabus";
            return { galaxy: { ...galaxyData, subject: fallbackSubject } };
        }
        return { galaxy: galaxyData };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        console.error("Error in generateKnowledgeGalaxyAction:", errorMessage);
        return { error: errorMessage };
    }
}


// === Plagiarism Checker Actions ===

async function getFileContentAsDataUri(fileContent: string, mimeType: string): Promise<string> {
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const buffer = Buffer.from(fileContent.split(',')[1], 'base64');
        const { value } = await mammoth.extractRawText({ buffer });
        return `data:text/plain;base64,${Buffer.from(value).toString('base64')}`;
    }
    // For PDF and TXT, the content is already a valid data URI
    return fileContent;
}

export async function checkPlagiarismAction(input: PlagiarismCheckInput): Promise<{ result?: PlagiarismCheckOutput, error?: string }> {
    const parsedInput = PlagiarismCheckInputSchema.safeParse(input);
    if (!parsedInput.success) {
        console.error("Invalid input for plagiarism check:", parsedInput.error.flatten());
        return { error: "Invalid input format for AI model." };
    }

    try {
        const [doc1DataUri, doc2DataUri] = await Promise.all([
            getFileContentAsDataUri(parsedInput.data.doc1Content, parsedInput.data.doc1MimeType),
            getFileContentAsDataUri(parsedInput.data.doc2Content, parsedInput.data.doc2MimeType)
        ]);

        const flowInput = {
            ...parsedInput.data,
            doc1Content: doc1DataUri,
            doc2Content: doc2DataUri,
        };
      
        const result = await checkPlagiarism(flowInput);
        return { result };

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to run plagiarism check. The AI model may be busy.";
      console.error("Error in checkPlagiarismAction:", errorMessage);
      return { error: errorMessage };
    }
}


// === Auth Actions ===
export async function loginAction(input: LoginInput): Promise<{ error?: string }> {
    redirect('/');
    return {};
}

export async function registerAction(input: RegisterInput): Promise<{ error?: string, success?: boolean }> {
    redirect('/');
    return { success: true };
}


export async function signOutAction(): Promise<void> {
    redirect('/');
}
