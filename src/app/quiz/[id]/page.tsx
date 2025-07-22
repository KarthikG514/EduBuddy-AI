
import { getQuizAction } from "@/app/actions";
import { QuizPlayer } from "@/components/quiz-player";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default async function QuizPage({ params }: { params: { id: string } }) {
  const { quiz, error } = await getQuizAction(params.id);

  if (error || !quiz) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/40">
             <Alert variant="destructive" className="max-w-lg">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Quiz Not Found</AlertTitle>
                <AlertDescription>
                    {error || "The quiz you are looking for does not exist or could not be loaded."}
                </AlertDescription>
            </Alert>
        </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/40">
        <div className="w-full max-w-4xl">
            <QuizPlayer quiz={quiz} />
        </div>
    </main>
  );
}
