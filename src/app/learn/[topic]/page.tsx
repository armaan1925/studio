import { PageShell } from '@/components/page-shell';
import { learningTopics } from '@/lib/data';
import { notFound } from 'next/navigation';
import QuizClient from './quiz-client';

interface TopicPageProps {
  params: {
    topic: string;
  };
}

function formatTopic(topic: string) {
    const topicData = learningTopics.find(t => t.id === topic);
    if (topicData) {
        return topicData.title;
    }
    return topic.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}


export default function TopicPage({ params }: TopicPageProps) {
    const topicData = learningTopics.find(t => t.id === params.topic);
    
    if (!topicData) {
        notFound();
    }

    const formattedTopic = formatTopic(params.topic);

  return (
    <PageShell title={`Quiz: ${formattedTopic}`}>
      <QuizClient topic={formattedTopic} />
    </PageShell>
  );
}
