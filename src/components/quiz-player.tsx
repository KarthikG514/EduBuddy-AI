
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { saveGameScoreAction } from '@/app/actions';
import type { CustomQuizRecord } from '@/ai/schemas';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Progress } from './ui/progress';
import { Check, X, Send, Award, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const nameFormSchema = z.object({
    player_name: z.string().min(2, "Please enter your name.").max(50, "Name is too long."),
});

export const QuizPlayer = ({ quiz }: { quiz: CustomQuizRecord }) => {
    const [playerName, setPlayerName] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [finalScore, setFinalScore] = useState<number | null>(null);
    const { toast } = useToast();

    const nameForm = useForm({
        resolver: zodResolver(nameFormSchema),
        defaultValues: { player_name: "" }
    });

    const handleNameSubmit = (values: z.infer<typeof nameFormSchema>) => {
        setPlayerName(values.player_name);
    };

    const handleAnswerSelect = (answer: string) => {
        if (isAnswered) return;
        setIsAnswered(true);
        setSelectedAnswer(answer);
        if (answer === quiz.questions[currentQuestionIndex].answer) {
            setScore(prev => prev + 10);
            toast({ title: "Correct!", description: "+10 points", className: "bg-green-600 border-green-700 text-white" });
        } else {
            toast({ title: "Incorrect!", description: `The correct answer was ${quiz.questions[currentQuestionIndex].answer}.`, variant: "destructive" });
        }
    };
  
    const handleNextQuestion = async () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setIsAnswered(false);
            setSelectedAnswer(null);
        } else {
            setFinalScore(score);
            if (playerName) {
                await saveGameScoreAction({ player_name: playerName, topic: quiz.topic, score });
            }
        }
    };

    if (!playerName) {
        return (
            <Card>
                <CardHeader className="text-center">
                     <div className="mx-auto bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center mb-4">
                        <Gamepad2 className="h-6 w-6" />
                    </div>
                    <CardTitle>Welcome to the Quiz!</CardTitle>
                    <CardDescription>{quiz.topic}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...nameForm}>
                        <form onSubmit={nameForm.handleSubmit(handleNameSubmit)} className="flex items-center justify-center gap-2 w-full max-w-sm mx-auto">
                            <FormField control={nameForm.control} name="player_name" render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel className="sr-only">Your Name</FormLabel>
                                <FormControl><Input placeholder="Enter your name to start..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )} />
                            <Button type="submit"><Send className="h-4 w-4" /></Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        );
    }
    
    if (finalScore !== null) {
        return (
            <Card className="text-center p-8 flex flex-col items-center">
                <Award className="h-20 w-20 text-yellow-500 animate-pulse" />
                <h2 className="text-3xl font-bold mt-4">Quiz Complete!</h2>
                <p className="text-muted-foreground">Well done, {playerName}!</p>
                <p className="text-6xl font-bold my-4 text-primary">{finalScore}</p>
                <p className="text-muted-foreground">You can now close this window.</p>
            </Card>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    if (!currentQuestion) {
        return <Card><CardContent>Loading question...</CardContent></Card>;
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Quiz: {quiz.topic}</CardTitle>
                <CardDescription>Question {currentQuestionIndex + 1} of {quiz.questions.length}</CardDescription>
                <Progress value={((currentQuestionIndex + 1) / quiz.questions.length) * 100} className="mt-2" />
            </CardHeader>
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                >
                    <CardContent>
                        <p className="font-semibold text-lg mb-6 text-center h-16 flex items-center justify-center">{currentQuestion.question}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentQuestion.options && Object.entries(currentQuestion.options).map(([key, value]) => {
                            const isSelected = selectedAnswer === key;
                            const isCorrect = currentQuestion.answer === key;
                            return (
                                <Button
                                key={key}
                                variant="outline"
                                className={cn(
                                    "justify-start p-4 h-auto text-wrap whitespace-normal",
                                    isAnswered && isCorrect && "bg-green-500/20 border-green-500 hover:bg-green-500/30",
                                    isAnswered && isSelected && !isCorrect && "bg-red-500/20 border-red-500 hover:bg-red-500/30"
                                )}
                                onClick={() => handleAnswerSelect(key)}
                                >
                                <div className="flex items-center w-full">
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3",
                                        isSelected ? "border-primary" : "border-muted-foreground"
                                    )}>
                                    {isSelected && <div className="w-3 h-3 rounded-full bg-primary" />}
                                    </div>
                                    <span className="flex-1 text-left">{value}</span>
                                    {isAnswered && isCorrect && <Check className="h-5 w-5 text-green-600" />}
                                    {isAnswered && isSelected && !isCorrect && <X className="h-5 w-5 text-red-600" />}
                                </div>
                                </Button>
                            )
                            })}
                        </div>
                    </CardContent>
                </motion.div>
            </AnimatePresence>
            <CardFooter className="flex justify-end">
                <Button onClick={handleNextQuestion} disabled={!isAnswered}>
                    {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </Button>
            </CardFooter>
        </Card>
    )
}
