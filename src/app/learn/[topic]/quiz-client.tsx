'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { createQuiz } from './actions';
import { useToast } from '@/hooks/use-toast';
import type { GenerateQuizQuestionsOutput } from '@/ai/flows/generate-quiz-questions';
import { CheckCircle, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

type QuizState = 'idle' | 'loading' | 'active' | 'finished';

export default function QuizClient({ topic }: { topic: string }) {
  const { toast } = useToast();
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [quizData, setQuizData] = useState<GenerateQuizQuestionsOutput | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Array<{ question: string; answer: string; isCorrect: boolean }>>([]);

  const handleStartQuiz = async () => {
    setQuizState('loading');
    const result = await createQuiz(topic);
    if (result.success && result.data) {
      setQuizData(result.data);
      setQuizState('active');
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setScore(0);
      setUserAnswers([]);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      setQuizState('idle');
    }
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswer || !quizData) return;
    
    const currentQuestion = quizData.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.answer;
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setUserAnswers([...userAnswers, { question: currentQuestion.question, answer: selectedAnswer, isCorrect }]);
    setIsAnswered(true);
  };
  
  const handleNextQuestion = () => {
    if (!quizData) return;
    
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setQuizState('finished');
    }
  };
  
  const currentQuestion = quizData?.questions[currentQuestionIndex];
  const progress = quizData ? ((currentQuestionIndex + 1) / quizData.questions.length) * 100 : 0;

  if (quizState === 'loading') {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Generating Your Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="size-12 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Our AI is preparing a fresh set of questions on {topic} for you...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (quizState === 'active' && currentQuestion) {
    return (
      <Card>
        <CardHeader>
            <div className='flex justify-between items-start'>
                <div>
                    <CardTitle>Question {currentQuestionIndex + 1} of {quizData?.questions.length}</CardTitle>
                    <CardDescription className='mt-2'>{currentQuestion.question}</CardDescription>
                </div>
                <Badge variant="secondary">{topic}</Badge>
            </div>
            <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedAnswer ?? ''}
            onValueChange={setSelectedAnswer}
            disabled={isAnswered}
          >
            {currentQuestion.choices.map((choice, index) => {
              const isCorrectChoice = choice === currentQuestion.answer;
              const isSelectedChoice = choice === selectedAnswer;
              
              return (
                <Label
                  key={index}
                  className={cn(
                    "flex items-center space-x-3 rounded-md border p-4 transition-colors hover:bg-accent hover:text-accent-foreground",
                    isAnswered && isCorrectChoice && "border-green-500 bg-green-500/10",
                    isAnswered && isSelectedChoice && !isCorrectChoice && "border-red-500 bg-red-500/10",
                    isAnswered ? "cursor-default" : "cursor-pointer"
                  )}
                >
                  <RadioGroupItem value={choice} />
                  <span>{choice}</span>
                   {isAnswered && isCorrectChoice && <CheckCircle className="ml-auto size-5 text-green-500" />}
                   {isAnswered && isSelectedChoice && !isCorrectChoice && <XCircle className="ml-auto size-5 text-red-500" />}
                </Label>
              )
            })}
          </RadioGroup>
          {isAnswered && (
            <div className="mt-4 rounded-md border bg-muted p-4">
              <h4 className="font-semibold">Explanation</h4>
              <p className="mt-2 text-sm text-muted-foreground">{currentQuestion.explanation}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {isAnswered ? (
            <Button onClick={handleNextQuestion} className="w-full">
              {currentQuestionIndex === (quizData?.questions.length ?? 0) - 1 ? 'Finish Quiz' : 'Next Question'}
            </Button>
          ) : (
            <Button onClick={handleCheckAnswer} disabled={!selectedAnswer} className="w-full">
              Check Answer
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }
  
  if (quizState === 'finished' && quizData) {
      return (
          <Card>
              <CardHeader className='text-center'>
                  <CardTitle>Quiz Complete!</CardTitle>
                  <CardDescription>You scored {score} out of {quizData.questions.length}.</CardDescription>
              </CardHeader>
              <CardContent>
                <h3 className="mb-4 text-lg font-semibold">Your Answers:</h3>
                  <ul className="space-y-4">
                      {quizData.questions.map((q, index) => {
                          const userAnswer = userAnswers[index];
                          return (
                              <li key={index} className="rounded-md border p-4">
                                  <p className="font-medium">{q.question}</p>
                                  <p className={cn("mt-2 text-sm", userAnswer.isCorrect ? "text-green-600" : "text-red-600")}>
                                      Your answer: {userAnswer.answer} {userAnswer.isCorrect ? <CheckCircle className="inline-block ml-1 size-4" /> : <XCircle className="inline-block ml-1 size-4" />}
                                  </p>
                                  {!userAnswer.isCorrect && <p className="text-sm text-muted-foreground">Correct answer: {q.answer}</p>}
                              </li>
                          )
                      })}
                  </ul>
              </CardContent>
              <CardFooter>
                  <Button onClick={handleStartQuiz} className="w-full">
                      <RefreshCw className="mr-2 size-4" />
                      Take Another Quiz
                  </Button>
              </CardFooter>
          </Card>
      );
  }

  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle>Ready to Test Your Knowledge?</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Click the button below to start a new quiz on {topic}.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleStartQuiz} className="w-full">
          Start Quiz
        </Button>
      </CardFooter>
    </Card>
  );
}
