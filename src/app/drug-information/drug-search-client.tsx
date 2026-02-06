'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { defaultDrugInfo } from '@/lib/data';
import type { SummarizeDrugInfoOutput } from '@/ai/flows/summarize-drug-info';
import { getDrugSummary } from './actions';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const FormSchema = z.object({
  drugName: z.string().min(2, { message: 'Drug name must be at least 2 characters.' }),
  formulation: z.string(),
  strength: z.string(),
  uses: z.string(),
  dosage: z.string(),
  contraindications: z.string(),
  warnings: z.string(),
});

export default function DrugSearchClient() {
  const { toast } = useToast();
  const [summaryResult, setSummaryResult] = useState<SummarizeDrugInfoOutput | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: defaultDrugInfo,
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setSummaryResult(undefined);
    const result = await getDrugSummary(data);
    setIsLoading(false);

    if (result.success && result.data) {
      setSummaryResult(result.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
  }

  return (
    <div className="mt-6 grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Drug Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="drugName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drug Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Paracetamol" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="formulation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formulation</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Tablet" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="strength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strength</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 500mg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="uses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uses</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Summary
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Summary</CardTitle>
        </CardHeader>
        <CardContent>
            {isLoading && (
                <div className="space-y-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            )}
            {summaryResult && (
                 <div className="prose prose-stone dark:prose-invert max-w-none">
                    <p>{summaryResult.summary}</p>
                </div>
            )}
            {!isLoading && !summaryResult && (
                <p className="text-muted-foreground">The AI-generated summary will appear here.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
