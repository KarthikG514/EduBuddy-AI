
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { SaveAttendanceInputSchema, type SaveAttendanceInput } from "@/ai/schemas";
import { saveAttendanceAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type ManualAttendanceFormProps = {
  onSuccess: () => void;
};

export function ManualAttendanceForm({ onSuccess }: ManualAttendanceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SaveAttendanceInput>({
    resolver: zodResolver(SaveAttendanceInputSchema),
    defaultValues: {
      student_name: "",
      roll_no: "",
      date: format(new Date(), 'yyyy-MM-dd'),
      subject: "",
      period: "",
      status: "Present",
      remark: "",
      behavior_tags: "",
    },
  });

  async function onSubmit(values: SaveAttendanceInput) {
    setIsSubmitting(true);
    try {
      const result = await saveAttendanceAction(values);
      if (result.error) {
        throw new Error(result.error);
      }
      toast({
        title: "Success",
        description: result.message,
      });
      const currentValues = form.getValues();
      form.reset({
        ...currentValues,
        student_name: "",
        roll_no: "",
        remark: "",
        behavior_tags: "",
        status: "Present",
      });
      onSuccess(); // Trigger data refresh in parent
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField control={form.control} name="student_name" render={({ field }) => (
            <FormItem>
              <FormLabel>🧑 Student Name</FormLabel>
              <FormControl><Input placeholder="e.g. John Doe" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="roll_no" render={({ field }) => (
            <FormItem>
              <FormLabel>🆔 Roll Number</FormLabel>
              <FormControl><Input placeholder="e.g. CSE001" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem>
              <FormLabel>📅 Date</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="subject" render={({ field }) => (
            <FormItem>
              <FormLabel>📚 Subject</FormLabel>
              <FormControl><Input placeholder="e.g. Data Structures" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="period" render={({ field }) => (
            <FormItem>
              <FormLabel>⏱️ Period</FormLabel>
              <FormControl><Input placeholder="e.g. 1st" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>🔘 Status</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:items-center md:gap-x-6"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Present" />
                    </FormControl>
                    <FormLabel className="font-normal">Present</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Absent" />
                    </FormControl>
                    <FormLabel className="font-normal">Absent</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Late" />
                    </FormControl>
                    <FormLabel className="font-normal">Late</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField control={form.control} name="remark" render={({ field }) => (
          <FormItem>
            <FormLabel>💬 Remark (Optional)</FormLabel>
            <FormControl><Textarea placeholder="Any specific comments..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="behavior_tags" render={({ field }) => (
          <FormItem>
            <FormLabel>🏷️ Behavior Tags (Optional)</FormLabel>
            <FormControl><Input placeholder="Distracted, Late, Participated well" {...field} /></FormControl>
            <p className="text-xs text-muted-foreground">Enter tags separated by commas.</p>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
          ) : "Save Attendance"}
        </Button>
      </form>
    </Form>
  )
}
