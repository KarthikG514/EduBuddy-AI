
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getStudentDocumentsAction, updateDocumentStatusAction } from '@/app/actions';
import type { StudentDocumentRecord } from '@/ai/schemas';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Archive, Check, X, Download, Filter, Loader2, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export function DocumentVault() {
    const [records, setRecords] = useState<StudentDocumentRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState('all'); // 'all', 'pending', 'verified'
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const { toast } = useToast();

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const result = await getStudentDocumentsAction();
        if (result.error) {
            setError(result.error);
        } else {
            setRecords(result.records || []);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleUpdateStatus = async (id: string, verified: boolean) => {
        setIsUpdating(id);
        const result = await updateDocumentStatusAction(id, verified);
        if (result.error || !result.record) {
            toast({
                title: "Update Failed",
                description: result.error || "Could not update document status.",
                variant: "destructive"
            });
        } else {
            toast({
                title: "Success",
                description: "Document status has been updated.",
            });
            // Update local state directly to guarantee UI refresh
            setRecords(currentRecords => 
                currentRecords.map(rec => 
                    rec.id === id ? { ...rec, verified: result.record!.verified } : rec
                )
            );
        }
        setIsUpdating(null);
    };

    const copyUploadLink = () => {
        const uploadUrl = `${window.location.origin}/upload`;
        navigator.clipboard.writeText(uploadUrl);
        toast({
            title: "Link Copied!",
            description: "The student upload link has been copied to your clipboard.",
        });
    }

    const filteredRecords = useMemo(() => {
        if (filter === 'pending') return records.filter(r => !r.verified);
        if (filter === 'verified') return records.filter(r => r.verified);
        return records;
    }, [records, filter]);
    
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
                 <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl font-headline flex items-center gap-2">
                            <Archive className="h-6 w-6" /> Student Document Vault
                        </CardTitle>
                        <CardDescription>
                            Review, verify, and manage documents uploaded by students.
                        </CardDescription>
                    </div>
                    <Button variant="outline" onClick={copyUploadLink}>
                        <Copy className="h-4 w-4 mr-2"/>
                        Copy Upload Link
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-sm font-medium flex items-center gap-2"><Filter className="h-4 w-4" />Filter by Status:</h3>
                    <RadioGroup defaultValue="all" onValueChange={setFilter} className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="r-all" />
                            <Label htmlFor="r-all">All ({records.length})</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pending" id="r-pending" />
                            <Label htmlFor="r-pending">Pending ({records.filter(r => !r.verified).length})</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="verified" id="r-verified" />
                            <Label htmlFor="r-verified">Verified ({records.filter(r => r.verified).length})</Label>
                        </div>
                    </RadioGroup>
                </div>

                {isLoading ? (
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                ) : error ? (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error Loading Documents</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : (
                    filteredRecords.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Roll Number</TableHead>
                                    <TableHead>Document Type</TableHead>
                                    <TableHead>Uploaded At</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRecords.map(record => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">{record.student_name}</TableCell>
                                        <TableCell>{record.roll_no}</TableCell>
                                        <TableCell>{record.doc_type}</TableCell>
                                        <TableCell>{format(new Date(record.uploaded_at), 'PPP p')}</TableCell>
                                        <TableCell>
                                            <Badge variant={record.verified ? 'default' : 'secondary'}>
                                                {record.verified ? 'Verified' : 'Pending'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <a href={record.file_url} target="_blank" rel="noopener noreferrer" title="Download document">
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </Button>
                                            <Button 
                                                variant="outline" size="icon"
                                                title="Mark as verified"
                                                disabled={isUpdating === record.id || record.verified}
                                                onClick={() => handleUpdateStatus(record.id, true)}
                                            >
                                                {isUpdating === record.id && !record.verified ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-600" />}
                                            </Button>
                                            <Button 
                                                variant="outline" size="icon"
                                                title="Mark as pending"
                                                disabled={isUpdating === record.id || !record.verified}
                                                onClick={() => handleUpdateStatus(record.id, false)}
                                            >
                                                {isUpdating === record.id && record.verified ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 text-red-600" />}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg">
                            <h3 className="text-lg font-semibold text-muted-foreground">No Documents Found</h3>
                            <p className="text-sm text-muted-foreground mt-1">No documents match the current filter or none have been uploaded yet.</p>
                        </div>
                    )
                )}
            </CardContent>
        </Card>
        </div>
    );
}
