'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerAction } from '@/app/actions';
import { RegisterSchema, type RegisterInput } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function RegisterForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const form = useForm<RegisterInput>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            department: '',
            college_name: '',
        },
    });

    async function onSubmit(values: RegisterInput) {
        setIsSubmitting(true);
        setError(null);
        try {
            const result = await registerAction(values);
            if (result?.error) {
                setError(result.error);
            } else {
                 toast({
                    title: "Registration Successful",
                    description: "You are now logged in. Redirecting...",
                });
            }
        } catch (e) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Registration Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Dr. Jane Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="teacher@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Department</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., CSE" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="college_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>College Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., National University" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Account...</>
                    ) : (
                        'Create Account'
                    )}
                </Button>
            </form>
        </Form>
    );
}
