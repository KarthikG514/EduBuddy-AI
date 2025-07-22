

/**
 * @fileOverview Shared Zod schemas and TypeScript types for AI flows.
 */
import {z} from 'zod';

// === Question Generator Schemas ===

export const GenerateQuestionsInputSchema = z.object({
  subject: z.string().describe('The course or subject of the questions.'),
  topic: z.string().describe('The topic or module title for the questions.'),
  numberOfQuestions: z.number().int().positive().describe('The number of questions to generate.'),
  difficulty: z.enum(['Easy', 'Moderate', 'Advanced']).describe('The academic complexity level of the questions.'),
});

export type GenerateQuestionsInput = z.infer<typeof GenerateQuestionsInputSchema>;

export const MCQQuestionSchema = z.object({
  question: z.string().describe('The question text.'),
  options: z.object({
    A: z.string(),
    B: z.string(),
    C: z.string(),
    D: z.string(),
  }).describe('The four multiple-choice options.'),
  answer: z.enum(['A', 'B', 'C', 'D']).describe('The key of the correct option.'),
});

export type MCQQuestion = z.infer<typeof MCQQuestionSchema>;

export const GenerateQuestionsOutputSchema = z.object({
  questions: z.array(MCQQuestionSchema).describe('An array of generated multiple-choice questions.'),
});

export type GenerateQuestionsOutput = z.infer<typeof GenerateQuestionsOutputSchema>;


// === Question Generator From File Schemas ===

export const GenerateQuestionsFromFileInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The notes or syllabus file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  topic: z.string().optional().describe("The topic of the quiz, often derived from the filename."),
  numberOfQuestions: z.number().int().positive().describe('The number of questions to generate.'),
  difficulty: z.enum(['Easy', 'Moderate', 'Advanced']).describe('The academic complexity level of the questions.'),
});

export type GenerateQuestionsFromFileInput = z.infer<typeof GenerateQuestionsFromFileInputSchema>;


// === Feedback Generator Schemas ===

export const GenerateFeedbackInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  subjects: z.array(z.string()).describe('A list of all subjects.'),
  marks: z.record(z.string(), z.number()).describe('An object containing subjects as keys and marks as values.'),
});

export type GenerateFeedbackInput = z.infer<typeof GenerateFeedbackInputSchema>;

const DailyPlanSchema = z.object({
  topic: z.string().describe("The specific topic or subject to focus on for the day."),
  task: z.string().describe("A concrete task or activity for the student to complete."),
});

export const GenerateFeedbackOutputSchema = z.object({
  strengths: z.array(z.string()).describe('A list of subjects where the student scored above 85. These are the student\'s strong areas.'),
  weaknesses: z.array(z.string()).describe('A list of subjects where the student scored below 75. These are the areas needing improvement.'),
  improvementTips: z.string().describe('Actionable, concise tips for the student to improve in their weak areas.'),
  studyPlan: z.object({
    day1: DailyPlanSchema,
    day2: DailyPlanSchema,
    day3: DailyPlanSchema,
    day4: DailyPlanSchema,
    day5: DailyPlanSchema,
    day6: DailyPlanSchema,
    day7: DailyPlanSchema,
  }).describe('A personalized 7-day study plan to help the student improve.'),
});

export type GenerateFeedbackOutput = z.infer<typeof GenerateFeedbackOutputSchema>;


// === Teaching Plan Advisor Schemas ===

export const GenerateAdviceInputSchema = z.object({
  subject: z.string().optional().describe('The subject or course for which advice is being generated.'),
  text: z.string().optional().describe('The syllabus or lecture notes provided by the user as pasted text.'),
  fileDataUri: z.string().optional().describe("The syllabus or lecture notes file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
}).refine(data => data.text || data.fileDataUri, {
  message: "Either text or a file must be provided.",
});

export type GenerateAdviceInput = z.infer<typeof GenerateAdviceInputSchema>;


export const GenerateAdviceOutputSchema = z.object({
  coveredTopics: z.array(z.string()).describe('A list of topics that have been covered in the provided text.'),
  nextTopic: z.string().describe('The single, most logical topic to teach next based on the covered topics.'),
  suggestedRevisions: z.array(z.string()).describe('A list of topics that should be revised before a test.'),
  skippedConcepts: z.array(z.string()).describe('A list of important concepts that may have been missed or are unclear.'),
});

export type GenerateAdviceOutput = z.infer<typeof GenerateAdviceOutputSchema>;

// === Question Paper Generator Schemas ===

export const GenerateQuestionPaperInputSchema = z.object({
  subject: z.string().describe('The course or subject of the question paper.'),
  unit: z.string().optional().describe('The unit or topic for the question paper.'),
  fileDataUri: z.string().optional().describe("The syllabus or notes file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
}).refine(data => data.unit || data.fileDataUri, {
    message: "Either a topic or a file must be provided.",
});

export type GenerateQuestionPaperInput = z.infer<typeof GenerateQuestionPaperInputSchema>;

export const QuestionPaperMCQSchema = z.object({
  question: z.string().describe('The question text.'),
  options: z.object({
    a: z.string(),
    b: z.string(),
    c: z.string(),
    d: z.string(),
  }).describe('The four multiple-choice options with keys a, b, c, d.'),
  answer: z.string().describe('The correct answer description.'),
});

export type QuestionPaperMCQ = z.infer<typeof QuestionPaperMCQSchema>;

export const GenerateQuestionPaperOutputSchema = z.object({
  oneMarkQuestions: z.array(QuestionPaperMCQSchema).describe('An array of 10 one-mark MCQs.'),
  twoMarkQuestions: z.array(z.string()).describe('An array of 10 two-mark short answer questions.'),
  tenMarkQuestions: z.array(z.string()).describe('An array of 4 ten-mark descriptive questions.'),
});

export type GenerateQuestionPaperOutput = z.infer<typeof GenerateQuestionPaperOutputSchema>;


// === Attendance Report Generator Schemas ===

export const GenerateAttendanceReportInputSchema = z.object({
  studentName: z.string().describe("The name of the student."),
  totalDays: z.number().int().positive().describe("The total number of days attendance was tracked."),
  presentDays: z.number().int().describe("The number of days the student was present."),
  behaviorTags: z.array(z.string()).describe("A list of behavioral tags observed."),
});

export type GenerateAttendanceReportInput = z.infer<typeof GenerateAttendanceReportInputSchema>;

export const GenerateAttendanceReportOutputSchema = z.object({
  report: z.string().describe("A concise, one-sentence summary of the student's attendance and behavior."),
});

export type GenerateAttendanceReportOutput = z.infer<typeof GenerateAttendanceReportOutputSchema>;

// === Manual Attendance Entry Schemas ===
export const SaveAttendanceInputSchema = z.object({
  student_name: z.string().min(1, "Student name is required."),
  roll_no: z.string().min(1, "Roll number is required."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."),
  subject: z.string().min(1, "Subject is required."),
  period: z.string().min(1, "Period is required."),
  status: z.enum(["Present", "Absent", "Late"]),
  remark: z.string().optional(),
  behavior_tags: z.string().optional(), // Comma-separated
});
export type SaveAttendanceInput = z.infer<typeof SaveAttendanceInputSchema>;


// === Mark Calculator Schemas ===

export const SaveInternalMarksInputSchema = z.object({
  student_name: z.string().min(1, "Student name is required."),
  roll_no: z.string().min(1, "Roll number is required."),
  subject: z.string().min(1, "Subject is required."),
  test1: z.coerce.number().min(0, "Min 0 marks.").max(10, "Max 10 marks."),
  test2: z.coerce.number().min(0, "Min 0 marks.").max(10, "Max 10 marks."),
  assignment: z.coerce.number().min(0, "Min 0 marks.").max(10, "Max 10 marks."),
  attendance: z.coerce.number().min(0).max(100, "Must be between 0 and 100."),
});
export type SaveInternalMarksInput = z.infer<typeof SaveInternalMarksInputSchema>;


export const GenerateMarkFeedbackInputSchema = z.object({
    studentName: z.string(),
    internalScore: z.number(),
    grade: z.string(),
    attendance: z.number(),
});
export type GenerateMarkFeedbackInput = z.infer<typeof GenerateMarkFeedbackInputSchema>;

export const GenerateMarkFeedbackOutputSchema = z.object({
    feedback: z.string().describe("A concise, one-line summary of the student's performance."),
});
export type GenerateMarkFeedbackOutput = z.infer<typeof GenerateMarkFeedbackOutputSchema>;


// === Syllabus Tracker Schemas ===
export const SaveSyllabusTrackerInputSchema = z.object({
  subject: z.string().min(3, "Subject is required."),
  topic: z.string().min(3, "Topic is required."),
});

export type SaveSyllabusTrackerInput = z.infer<typeof SaveSyllabusTrackerInputSchema>;

// === Student Profile Schemas ===
export const StudentInfoSchema = z.object({
  student_name: z.string(),
  roll_no: z.string(),
});
export type StudentInfo = z.infer<typeof StudentInfoSchema>;

export const TeacherRemarkRecordSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  student_name: z.string().nullable(),
  roll_no: z.string().nullable(),
  subject: z.string().nullable(),
  remark: z.string().nullable(),
});

export const StudentProfileDataSchema = z.object({
  studentName: z.string(),
  rollNo: z.string(),
  attendance: z.object({
    percentage: z.number(),
    presentDays: z.number(),
    totalDays: z.number(),
  }),
  behaviorTags: z.array(z.string()),
  marks: z.array(z.object({
      subject: z.string(),
      internal_score: z.number(),
      grade: z.string(),
  })),
  remarks: z.array(TeacherRemarkRecordSchema),
  aiFeedback: z.string().nullable(),
});
export type StudentProfileData = z.infer<typeof StudentProfileDataSchema>;


// === Academic Calendar Schemas ===
export const SaveAcademicEventInputSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string().optional(),
  event_date: z.date({ required_error: "Please select a date." }),
  event_type: z.enum(["exam", "holiday", "meeting"]),
});

export type SaveAcademicEventInput = z.infer<typeof SaveAcademicEventInputSchema>;

// === Assignment Grader Schemas ===
export const GradeAssignmentInputSchema = z.object({
  studentName: z.string().describe("The name of the student who submitted the assignment."),
  subject: z.string().describe("The subject of the assignment."),
  fileDataUri: z
    .string()
    .describe(
      "The assignment document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GradeAssignmentInput = z.infer<typeof GradeAssignmentInputSchema>;

export const GradeAssignmentOutputSchema = z.object({
  score: z.number().min(0).max(10).describe("The numerical score for the assignment, out of 10."),
  feedback: z.string().describe("Concise, constructive feedback for the student, explaining the score."),
});
export type GradeAssignmentOutput = z.infer<typeof GradeAssignmentOutputSchema>;

// === Project Tracker Schemas ===
export const ProjectTrackerInputSchema = z.object({
  id: z.string().optional(),
  student_name: z.string().min(1, "Student name is required."),
  roll_no: z.string().min(1, "Roll number is required."),
  project_title: z.string().min(5, "Project title is required."),
  mentor_name: z.string().min(1, "Mentor name is required."),
  topic_selected: z.boolean().default(false),
  review1_score: z.coerce.number().min(0).max(100).optional().nullable(),
  review1_feedback: z.string().optional().nullable(),
  review2_score: z.coerce.number().min(0).max(100).optional().nullable(),
  review2_feedback: z.string().optional().nullable(),
  final_submission: z.boolean().default(false),
  final_score: z.coerce.number().min(0).max(100).optional().nullable(),
  final_feedback: z.string().optional().nullable(),
});
export type ProjectTrackerInput = z.infer<typeof ProjectTrackerInputSchema>;


// === Student Document Vault Schemas ===
export const UploadStudentDocumentInputSchema = z.object({
  student_name: z.string().min(2, "Student name is required."),
  roll_no: z.string().min(1, "Roll number is required."),
  doc_type: z.enum(["Bonafide", "Report", "Certificate", "Other"], {
    required_error: "Please select a document type."
  }),
});
export type UploadStudentDocumentInput = z.infer<typeof UploadStudentDocumentInputSchema>;


// === Classroom Gamifier Schemas ===
export const GenerateClassroomGameInputSchema = z.object({
  topic: z.string().describe("The topic to generate a game for."),
});
export type GenerateClassroomGameInput = z.infer<typeof GenerateClassroomGameInputSchema>;

export const GameQuizQuestionSchema = z.object({
  question: z.string().describe("The quiz question text."),
  options: z.object({
    A: z.string(),
    B: z.string(),
    C: z.string(),
    D: z.string(),
  }).describe("The four multiple-choice options."),
  answer: z.enum(['A', 'B', 'C', 'D']).describe("The key of the correct option."),
});
export type GameQuizQuestion = z.infer<typeof GameQuizQuestionSchema>;

export const GamePuzzleSchema = z.object({
  scrambled: z.string().describe("The scrambled word puzzle."),
  answer: z.string().describe("The unscrambled correct word."),
});
export type GamePuzzle = z.infer<typeof GamePuzzleSchema>;

export const GenerateClassroomGameOutputSchema = z.object({
  quiz: z.array(GameQuizQuestionSchema).describe("An array of 5 quiz questions."),
  puzzle: GamePuzzleSchema.describe("A word scramble puzzle."),
});
export type GenerateClassroomGameOutput = z.infer<typeof GenerateClassroomGameOutputSchema>;

export const SaveGameScoreInputSchema = z.object({
    player_name: z.string().min(2, "Player name must be at least 2 characters."),
    topic: z.string(),
    score: z.number().int().min(0),
});
export type SaveGameScoreInput = z.infer<typeof SaveGameScoreInputSchema>;

export const CustomQuizQuestionSchema = z.object({
    question: z.string().min(1, "Question text cannot be empty."),
    options: z.object({
        A: z.string().min(1, "Option A cannot be empty."),
        B: z.string().min(1, "Option B cannot be empty."),
        C: z.string().min(1, "Option C cannot be empty."),
        D: z.string().min(1, "Option D cannot be empty."),
    }),
    answer: z.enum(["A", "B", "C", "D"]),
});
export type CustomQuizQuestion = z.infer<typeof CustomQuizQuestionSchema>;

export const CreateCustomQuizInputSchema = z.object({
    topic: z.string().min(3, "Topic must be at least 3 characters long."),
    questions: z.array(CustomQuizQuestionSchema).min(1, "You must add at least one question."),
});
export type CreateCustomQuizInput = z.infer<typeof CreateCustomQuizInputSchema>;


// === Knowledge Galaxy Schemas ===
export const GenerateKnowledgeGalaxyInputSchema = z.object({
  subject: z.string().optional().describe("The subject to generate the knowledge galaxy for."),
  fileDataUri: z.string().optional().describe("The syllabus file to generate the knowledge galaxy from, as a data URI."),
}).refine(data => data.subject || data.fileDataUri, {
    message: "Either a subject or a file must be provided.",
});
export type GenerateKnowledgeGalaxyInput = z.infer<typeof GenerateKnowledgeGalaxyInputSchema>;

const MoonSchema = z.object({
  name: z.string().describe("Name of the sub-topic (moon)."),
  description: z.string().describe("A brief, one-sentence description of the sub-topic."),
});
export type Moon = z.infer<typeof MoonSchema>;

const PlanetSchema = z.object({
  name: z.string().describe("Name of the core concept (planet)."),
  description: z.string().describe("A brief, one-sentence description of the core concept."),
  moons: z.array(MoonSchema).describe("An array of related sub-topics (moons)."),
});
export type Planet = z.infer<typeof PlanetSchema>;

export const GenerateKnowledgeGalaxyOutputSchema = z.object({
  subject: z.string().describe("The subject of the generated galaxy."),
  planets: z.array(PlanetSchema).describe("An array of core concepts (planets) for the subject."),
});
export type GenerateKnowledgeGalaxyOutput = z.infer<typeof GenerateKnowledgeGalaxyOutputSchema>;


// === Plagiarism Checker Schemas ===
export const PlagiarismCheckInputSchema = z.object({
    doc1Name: z.string().describe("The filename of the first document."),
    doc1Content: z.string().describe("The content of the first document, either as a data URI or as extracted text."),
    doc1MimeType: z.string().describe("The MIME type of the first document."),
    doc2Name: z.string().describe("The filename of the second document."),
    doc2Content: z.string().describe("The content of the second document, either as a data URI or as extracted text."),
    doc2MimeType: z.string().describe("The MIME type of the second document."),
});
export type PlagiarismCheckInput = z.infer<typeof PlagiarismCheckInputSchema>;

export const PlagiarismCheckOutputSchema = z.object({
    similarityPercentage: z.number().min(0).max(100).describe("The percentage of similarity between the two documents."),
    analysis: z.string().describe("A detailed breakdown of the similarities found between the two documents."),
    verdict: z.enum(["No Plagiarism Detected", "Low Similarity", "Moderate Similarity", "High Similarity", "Likely Plagiarized"]).describe("The final conclusion on the similarity level."),
});
export type PlagiarismCheckOutput = z.infer<typeof PlagiarismCheckOutputSchema>;


// === Supabase Table Record Types ===

export type PerformanceReport = {
  id: string;
  created_at: string;
  student_name: string;
  subject: string | null;
  score: number | null;
  total: number | null;
  feedback: string | Record<string, any>;
  improvement_plan: string | Record<string, any>;
};

export type AttendanceRecord = {
    id: string;
    date: string;
    subject: string;
    student_name: string;
    roll_no: string;
    status: 'Present' | 'Absent' | 'Late';
    remark: string | null;
    behavior_tags: string | null;
    created_at: string;
};

export type InternalMarksRecord = {
    id: string;
    student_name: string;
    roll_no: string;
    subject: string;
    test1: number;
    test2: number;
    assignment: number;
    attendance: number;
    internal_score: number;
    grade: string;
    feedback: string;
    created_at: string;
};

export type SyllabusTrackerRecord = {
  id: string;
  subject: string;
  topic: string;
  completed: boolean;
  uploaded_by: string | null;
  created_at: string;
};

export type TeacherRemarkRecord = {
  id: string;
  created_at: string;
  student_name: string | null;
  roll_no: string | null;
  subject: string | null;
  remark: string | null;
};

export type AcademicEventRecord = {
  id: string;
  created_at: string;
  title: string | null;
  description: string | null;
  event_date: string; // YYYY-MM-DD
  event_type: 'exam' | 'holiday' | 'meeting' | null;
  posted_by: string | null;
};

export type AssignmentScoreRecord = {
  id: string;
  created_at: string;
  student_name: string;
  subject: string;
  score: number;
  feedback: string;
};

export type ProjectTrackerRecord = {
  id: string;
  student_name: string;
  roll_no: string;
  project_title: string;
  mentor_name: string;
  topic_selected: boolean;
  review1_score: number | null;
  review1_feedback: string | null;
  review2_score: number | null;
  review2_feedback: string | null;
  final_submission: boolean;
  final_score: number | null;
  final_feedback: string | null;
  updated_at: string;
};

export type StudentDocumentRecord = {
  id: string;
  uploaded_at: string;
  student_name: string;
  roll_no: string;
  doc_type: string;
  file_url: string;
  file_path: string | null;
  uploaded_by: string;
  verified: boolean;
};

export type ClassroomGameRecord = {
  id: string;
  created_at: string;
  topic: string;
  game_data: GenerateClassroomGameOutput;
};

export type GameLeaderboardRecord = {
    id: string;
    created_at: string;
    player_name: string;
    topic: string;
    score: number;
};

export type CustomQuizRecord = {
    id: string;
    created_at: string;
    topic: string;
    questions: CustomQuizQuestion[];
    created_by: string | null;
};


// === Auth Schemas ===
export const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});
export type LoginInput = z.infer<typeof LoginSchema>;


export const RegisterSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
  department: z.string().min(2, { message: "Department is required." }),
  college_name: z.string().min(3, { message: "College name is required." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});
export type RegisterInput = z.infer<typeof RegisterSchema>;
