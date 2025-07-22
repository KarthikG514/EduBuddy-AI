'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginAction } from '@/app/actions';
import { LoginSchema, type LoginInput } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LoginForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const form = useForm<LoginInput>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function onSubmit(values: LoginInput) {
        setIsSubmitting(true);
        setError(null);
        try {
            const result = await loginAction(values);
            if (result?.error) {
                setError(result.error);
            } else {
                 toast({
                    title: "Login Successful",
                    description: "Redirecting to your dashboard...",
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Login Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
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
                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Logging In...</>
                    ) : (
                        'Login'
                    )}
                </Button>
            </form>
        </Form>
    );
}
