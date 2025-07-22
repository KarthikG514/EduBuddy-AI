
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { getAcademicEventsAction, saveAcademicEventAction } from '@/app/actions';
import { SaveAcademicEventInputSchema, type SaveAcademicEventInput, type AcademicEventRecord } from "@/ai/schemas";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Calendar as CalendarIcon, Loader2, PlusCircle, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

function AddEventForm({ onSuccess }: { onSuccess: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<SaveAcademicEventInput>({
        resolver: zodResolver(SaveAcademicEventInputSchema),
        defaultValues: {
            title: "",
            description: "",
            event_type: "exam",
        },
    });

    async function onSubmit(values: SaveAcademicEventInput) {
        setIsSubmitting(true);
        try {
            const result = await saveAcademicEventAction(values);
            if (result.error) throw new Error(result.error);
            toast({ title: "Success", description: result.message });
            form.reset({
                title: "",
                description: "",
                event_date: undefined,
                event_type: "exam",
            });
            onSuccess();
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Submission Failed", description: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className='text-lg flex items-center gap-2'><PlusCircle className='h-5 w-5' />Add New Event</CardTitle>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Event Title</FormLabel>
                                <FormControl><Input placeholder="e.g. Mid-term Examinations" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description (Optional)</FormLabel>
                                <FormControl><Textarea placeholder="e.g. For all 2nd year students." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="event_date" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Event Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                >
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => {
                                                    const today = new Date();
                                                    today.setHours(0, 0, 0, 0);
                                                    return date < today;
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="event_type" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Event Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="exam">📘 Exam</SelectItem>
                                            <SelectItem value="holiday">🟥 Holiday</SelectItem>
                                            <SelectItem value="meeting">🟨 Meeting</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting} className='w-full'>
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Add Event"}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}

function EventDots({ events }: { events: AcademicEventRecord[] }) {
    if (!events || events.length === 0) return null;
    return (
        <div className="event-dots">
            {events.slice(0, 3).map(event => ( // Show max 3 dots
                <div key={event.id} className={cn("event-dot", `event-${event.event_type}`)}></div>
            ))}
        </div>
    );
}

const EventTypeBadge = ({ type }: { type: AcademicEventRecord['event_type'] }) => {
    const typeMap = {
        exam: { label: "Exam", color: "bg-blue-100 text-blue-800" },
        holiday: { label: "Holiday", color: "bg-red-100 text-red-800" },
        meeting: { label: "Meeting", color: "bg-yellow-100 text-yellow-800" },
    };
    const { label, color } = typeMap[type!] || { label: "Event", color: "bg-gray-100 text-gray-800" };
    return <Badge className={cn(color, 'border-transparent')}>{label}</Badge>;
};


export function AcademicCalendar() {
    const [events, setEvents] = useState<AcademicEventRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    
    const loadData = useCallback(async () => {
        setIsLoading(true);
        const result = await getAcademicEventsAction();
        if (result.error) {
            setError(result.error);
        } else {
            setEvents(result.events || []);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const eventsByDate = useMemo(() => {
        return events.reduce((acc, event) => {
            // Parse the date string as UTC to avoid timezone shifts
            const date = parse(event.event_date, 'yyyy-MM-dd', new Date());
            const dateStr = format(date, 'yyyy-MM-dd');

            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }
            acc[dateStr].push(event);
            return acc;
        }, {} as Record<string, AcademicEventRecord[]>);
    }, [events]);

    const selectedDateEvents = eventsByDate[format(selectedDate, 'yyyy-MM-dd')] || [];

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
                    <CalendarDays className="h-6 w-6" /> Academic Calendar
                </CardTitle>
                <CardDescription>
                    Add and view important academic events, holidays, and meetings.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {isLoading ? (
                        <Skeleton className="w-full h-[400px]" />
                    ) : error ? (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Error Loading Calendar</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : (
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => setSelectedDate(date || new Date())}
                            className="rounded-md border p-0"
                            classNames={{
                                month: 'space-y-4 p-3',
                                day_cell: 'relative'
                            }}
                            components={{
                                DayContent: ({ date }) => {
                                    const dateEvents = eventsByDate[format(date, 'yyyy-MM-dd')];
                                    return (
                                        <>
                                            <span>{date.getDate()}</span>
                                            <EventDots events={dateEvents} />
                                        </>
                                    );
                                }
                            }}
                        />
                    )}
                    <div className="flex justify-center gap-4 mt-4 text-xs">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div>Exam</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div>Holiday</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div>Meeting</div>
                    </div>
                </div>

                <div className='space-y-6'>
                    <AddEventForm onSuccess={loadData} />
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-lg'>Events on {format(selectedDate, "PPP")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedDateEvents.length > 0 ? (
                                <ul className="space-y-3">
                                    {selectedDateEvents.map(event => (
                                        <li key={event.id} className="text-sm">
                                            <div className="flex justify-between items-start">
                                                <p className="font-semibold">{event.title}</p>
                                                <EventTypeBadge type={event.event_type} />
                                            </div>
                                            {event.description && <p className="text-muted-foreground text-xs mt-1">{event.description}</p>}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No events scheduled for this day.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
        </div>
    );
}
