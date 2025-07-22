
import { StudentUploadForm } from "@/components/student-upload-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { Package } from "lucide-react";
import { redirect } from "next/navigation";

export default async function StudentUploadPage() {
  const { data: { user } } = await supabase.auth.getUser();

  // If a teacher is logged in, redirect them away from the public upload form
  if (user) {
    redirect('/');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/40">
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center mb-4">
                    <Package className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-headline">Student Document Upload</CardTitle>
                <CardDescription>
                    Submit your documents here. They will be reviewed by your teacher. You can generate a QR code for this page's URL for easy access.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <StudentUploadForm />
            </CardContent>
        </Card>
        <p className="text-xs text-center text-muted-foreground mt-4">
            Powered by EduBuddy AI
        </p>
      </div>
    </main>
  );
}

    