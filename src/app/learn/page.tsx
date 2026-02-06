import { PageShell } from '@/components/page-shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { learningTopics } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function LearnPage() {
  return (
    <PageShell title="Learning Hub">
      <div className="prose prose-stone dark:prose-invert max-w-none mb-8">
        <p>
          Expand your knowledge with our AI-powered learning modules. Choose a topic below to start a quiz and earn points. New quizzes are generated each time to provide a unique learning experience.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {learningTopics.map((topic) => (
          <Card key={topic.id} className="flex flex-col overflow-hidden">
            {topic.image && (
              <div className="relative h-48 w-full">
                <Image
                  src={topic.image.imageUrl}
                  alt={topic.image.description}
                  fill
                  className="object-cover"
                  data-ai-hint={topic.image.imageHint}
                />
              </div>
            )}
            <CardHeader>
              <CardTitle>{topic.title}</CardTitle>
              <CardDescription className="line-clamp-3">
                {topic.description}
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Button asChild>
                <Link href={`/learn/${topic.id}`}>
                  Start Quiz <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
