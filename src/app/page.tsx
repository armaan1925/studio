import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, BookOpen, FlaskConical, Pill } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { placeholderImages } from '@/lib/data';
import { PageShell } from '@/components/page-shell';

export default function Home() {
  const features = [
    {
      title: 'Drug Information',
      description: 'Quickly search and get AI-summarized details about any drug.',
      href: '/drug-information',
      icon: <Pill className="size-6 text-primary" />,
    },
    {
      title: 'Learning Hub',
      description: 'Test your knowledge with AI-generated quizzes on various topics.',
      href: '/learn',
      icon: <BookOpen className="size-6 text-primary" />,
    },
    {
      title: 'Research Hub',
      description: 'Get AI suggestions for mentors and related studies.',
      href: '/research-hub',
      icon: <FlaskConical className="size-6 text-primary" />,
    },
  ];

  const heroImage = placeholderImages.find((img) => img.id === 'home-hero');

  return (
    <PageShell title="Dashboard">
      <div className="flex flex-col gap-8">
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-10">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-card-foreground">
                Welcome to MediMind AI
              </h2>
              <p className="mt-2 text-muted-foreground">
                Your AI-powered education and safety platform for pharmacy.
                Explore our features to enhance your learning and research.
              </p>
              <Button asChild className="mt-6">
                <Link href="/drug-information">
                  Get Started <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
            {heroImage && (
              <div className="relative h-64 md:h-full">
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={heroImage.imageHint}
                />
              </div>
            )}
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="flex flex-col transition-all hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="grid size-12 place-items-center rounded-full bg-primary/10">
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
              <CardContent>
                <Button asChild variant="outline" size="sm">
                  <Link href={feature.href}>
                    Go to {feature.title}{' '}
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
