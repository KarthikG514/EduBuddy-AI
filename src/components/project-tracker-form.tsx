"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProjectTrackerInputSchema, type ProjectTrackerInput, type ProjectTrackerRecord } from "@/ai/schemas";
import { saveOrUpdateProjectTrackerAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Separator } from "./ui/separator";

type ProjectTrackerFormProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSuccess: () => void;
  record: ProjectTrackerRecord | null;
};

export function ProjectTrackerForm({ isOpen, setIsOpen, onSuccess, record }: ProjectTrackerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProjectTrackerInput>({
    resolver: zodResolver(ProjectTrackerInputSchema),
    defaultValues: {
        id: undefined,
        student_name: "",
        roll_no: "",
        project_title: "",
        mentor_name: "",
        topic_selected: false,
        review1_score: undefined,
        review1_feedback: "",
        review2_score: undefined,
        review2_feedback: "",
        final_submission: false,
        final_score: undefined,
        final_feedback: "",
    },
  });

  useEffect(() => {
    if (record) {
        form.reset({
            id: record.id,
            student_name: record.student_name,
            roll_no: record.roll_no,
            project_title: record.project_title,
            mentor_name: record.mentor_name,
            topic_selected: record.topic_selected,
            review1_score: record.review1_score ?? undefined,
            review1_feedback: record.review1_feedback ?? "",
            review2_score: record.review2_score ?? undefined,
            review2_feedback: record.review2_feedback ?? "",
            final_submission: record.final_submission,
            final_score: record.final_score ?? undefined,
            final_feedback: record.final_feedback ?? "",
        });
    } else {
        form.reset({
            id: undefined,
            student_name: "",
            roll_no: "",
            project_title: "",
            mentor_name: "",
            topic_selected: false,
            review1_score: undefined,
            review1_feedback: "",
            review2_score: undefined,
            review2_feedback: "",
            final_submission: false,
            final_score: undefined,
            final_feedback: "",
        });
    }
  }, [record, isOpen, form]);

  async function onSubmit(values: ProjectTrackerInput) {
    setIsSubmitting(true);
    try {
      const result = await saveOrUpdateProjectTrackerAction(values);
      if (result.error) {
        throw new Error(result.error);
      }
      toast({ title: "Success", description: result.message });
      onSuccess();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: "Submission Failed", description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record ? 'Edit Project' : 'Track New Project'}</DialogTitle>
          <DialogDescription>
            {record ? 'Update the details for this student project.' : 'Enter the details for a new student project.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold">Student & Project Info</h3>
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="student_name" render={({ field }) => (
                    <FormItem><FormLabel>Student Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="roll_no" render={({ field }) => (
                    <FormItem><FormLabel>Roll Number</FormLabel><FormControl><Input {...field} disabled={!!record} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="project_title" render={({ field }) => (
                    <FormItem><FormLabel>Project Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="mentor_name" render={({ field }) => (
                    <FormItem><FormLabel>Mentor Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
            
            <FormField control={form.control} name="topic_selected" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <div className="space-y-1 leading-none"><FormLabel>Topic Selected</FormLabel><FormDescription>Has the project topic been finalized?</FormDescription></div>
                </FormItem>
            )} />

            <Separator className="my-6" />

            <h3 className="text-lg font-semibold">Review 1</h3>
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="review1_score" render={({ field }) => (
                    <FormItem><FormLabel>Score (out of 100)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="review1_feedback" render={({ field }) => (
                    <FormItem><FormLabel>Feedback</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>

            <Separator className="my-6" />

            <h3 className="text-lg font-semibold">Review 2</h3>
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="review2_score" render={({ field }) => (
                    <FormItem><FormLabel>Score (out of 100)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="review2_feedback" render={({ field }) => (
                    <FormItem><FormLabel>Feedback</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>

            <Separator className="my-6" />

             <h3 className="text-lg font-semibold">Final Submission</h3>
             <FormField control={form.control} name="final_submission" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <div className="space-y-1 leading-none"><FormLabel>Final Project Submitted</FormLabel><FormDescription>Has the final project been submitted?</FormDescription></div>
                </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="final_score" render={({ field }) => (
                    <FormItem><FormLabel>Final Score (out of 100)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="final_feedback" render={({ field }) => (
                    <FormItem><FormLabel>Final Feedback</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
            
            <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Project"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
