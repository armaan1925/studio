'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getResearchSuggestions } from './actions';
import { useToast } from '@/hooks/use-toast';
import type { SuggestRelatedResearchOutput } from '@/ai/flows/suggest-related-research';
import { FileText, Lightbulb, Loader2, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const FormSchema = z.object({
  researchPaperAbstract: z.string().min(50, {
    message: 'Abstract must be at least 50 characters.',
  }),
  userInterests: z.string().min(3, {
    message: 'Interests must be at least 3 characters.',
  }),
});

export function ResearchFormClient() {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<SuggestRelatedResearchOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      researchPaperAbstract: '',
      userInterests: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setSuggestions(null);
    const result = await getResearchSuggestions(data);
    setIsLoading(false);

    if (result.success && result.data) {
      setSuggestions(result.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
  }

  return (
    <div className="mt-6">
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="researchPaperAbstract"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Research Paper Abstract</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the abstract of your research paper here..."
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userInterests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Research Interests</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., oncology, drug delivery systems, pharmacokinetics"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Comma-separated list of your interests.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Suggestions...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Get AI Suggestions
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {(isLoading || suggestions) && (
        <div className="mt-8">
            <h2 className="text-2xl font-bold tracking-tight mb-4">AI Suggestions</h2>
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="size-5 text-primary" />
                            Related Research Papers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading && (
                            <div className="space-y-3">
                                <Skeleton className="h-5 w-4/5" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-3/4" />
                            </div>
                        )}
                        {suggestions?.relatedResearchPapers && (
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                {suggestions.relatedResearchPapers.map((paper, index) => (
                                    <li key={index}>{paper}</li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="size-5 text-primary" />
                            Suggested Mentors
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading && (
                            <div className="space-y-3">
                                <Skeleton className="h-5 w-1/2" />
                                <Skeleton className="h-5 w-2/3" />
                                <Skeleton className="h-5 w-1/2" />
                            </div>
                        )}
                         {suggestions?.suggestedMentors && (
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                {suggestions.suggestedMentors.map((mentor, index) => (
                                    <li key={index}>{mentor}</li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
      )}
    </div>
  );
}
