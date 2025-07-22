
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UploadStudentDocumentInputSchema } from "@/ai/schemas";
import { uploadStudentDocumentAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const clientSchema = UploadStudentDocumentInputSchema.extend({
    file: z.any()
        .refine((files) => files?.length === 1, "File is required.")
        .refine((files) => files?.[0].size <= 5 * 1024 * 1024, "Max file size is 5MB.")
        .refine(
            (files) => ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"].includes(files?.[0].type),
            "Only PDF, DOC(X), JPG, and PNG files are accepted."
        )
});

type FormValues = z.infer<typeof clientSchema>;

export function StudentUploadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      student_name: "",
      roll_no: "",
      doc_type: undefined,
      file: undefined,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    setSuccessMessage(null);
    const formData = new FormData();
    formData.append("student_name", values.student_name);
    formData.append("roll_no", values.roll_no);
    formData.append("doc_type", values.doc_type);
    formData.append("file", values.file[0]);

    try {
      const result = await uploadStudentDocumentAction(formData);
      if (result.error) {
        throw new Error(result.error);
      }
      setSuccessMessage(result.message || "Document uploaded successfully!");
      form.reset();
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (successMessage) {
    return (
      <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle>Upload Successful!</AlertTitle>
        <AlertDescription>{successMessage}</AlertDescription>
        <Button onClick={() => setSuccessMessage(null)} className="mt-4 w-full" variant="outline">
            Upload Another Document
        </Button>
      </Alert>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
            <FormField control={form.control} name="student_name" render={({ field }) => (
                <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="roll_no" render={({ field }) => (
                <FormItem>
                    <FormLabel>Roll Number</FormLabel>
                    <FormControl><Input placeholder="e.g., CSE001" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
        </div>
        
        <FormField control={form.control} name="doc_type" render={({ field }) => (
            <FormItem>
                <FormLabel>Document Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select the type of document" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="Bonafide">Bonafide Certificate</SelectItem>
                        <SelectItem value="Report">Project/Internship Report</SelectItem>
                        <SelectItem value="Certificate">Achievement Certificate</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
        )} />

        <FormField control={form.control} name="file" render={({ field }) => (
            <FormItem>
                <FormLabel>File (PDF, DOC, DOCX, JPG, PNG)</FormLabel>
                <FormControl>
                    <Input 
                        type="file" 
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png" 
                        ref={fileInputRef}
                        onChange={(e) => field.onChange(e.target.files)}
                    />
                </FormControl>
                <p className="text-xs text-muted-foreground pt-1">Your teacher will review and verify this document shortly.</p>
                <FormMessage />
            </FormItem>
        )} />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
          ) : "Submit Document"}
        </Button>
      </form>
    </Form>
  )
}
