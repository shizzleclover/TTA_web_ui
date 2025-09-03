'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: string;
}

interface Player {
  userId: string;
  username: string;
  displayName?: string;
  score: number;
  rank: number;
  isHost: boolean;
  avatar: string;
}

interface GameplayScreenProps {
  question: Question;
  timePerQuestion: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  players: Player[];
  onAnswerSubmit: (answerIndex: number) => void;
  onTimeUp: () => void;
}

export function GameplayScreen({
  question,
  timePerQuestion,
  currentQuestionIndex,
  totalQuestions,
  players,
  onAnswerSubmit,
  onTimeUp,
}: GameplayScreenProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(timePerQuestion / 1000);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowResult(false);
    setTimeLeft(timePerQuestion / 1000);
  }, [question.id, timePerQuestion]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || isAnswered) return;
    
    setIsAnswered(true);
    const correct = selectedAnswer === question.correctAnswer;
    setIsCorrect(correct);
    
    // Show result briefly before submitting
    setShowResult(true);
    setTimeout(() => {
      onAnswerSubmit(selectedAnswer);
      setShowResult(false);
    }, 1500);
  };

  const getProgressPercentage = () => {
    return ((timePerQuestion / 1000 - timeLeft) / (timePerQuestion / 1000)) * 100;
  };

  const getTimeColor = () => {
    if (timeLeft > 10) return 'text-green-600';
    if (timeLeft > 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Gameplay Area */}
      <div className="lg:col-span-2 space-y-6">
        {/* Question Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </CardTitle>
                <CardDescription>
                  {question.category} • {question.difficulty}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className={`text-2xl font-mono font-bold ${getTimeColor()}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </CardHeader>
        </Card>

        {/* Question */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-medium leading-relaxed">
                {question.text}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswer === index ? 'default' : 'outline'}
                  className={`w-full h-auto p-4 text-left justify-start ${
                    selectedAnswer === index ? 'ring-2 ring-primary' : ''
                  } ${
                    showResult && index === question.correctAnswer
                      ? 'bg-green-100 border-green-300 text-green-900'
                      : showResult && selectedAnswer === index && !isCorrect
                      ? 'bg-red-100 border-red-300 text-red-900'
                      : ''
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isAnswered}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-lg">{option}</span>
                    {showResult && index === question.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                    )}
                    {showResult && selectedAnswer === index && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                    )}
                  </div>
                </Button>
              ))}
            </div>

            {/* Submit Button */}
            <div className="mt-6 text-center">
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null || isAnswered}
                size="lg"
                className="px-8"
              >
                {isAnswered ? (
                  isCorrect ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Correct!
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 mr-2" />
                      Incorrect
                    </>
                  )
                ) : (
                  'Submit Answer'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mini Scoreboard */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Live Scoreboard
            </CardTitle>
            <CardDescription>Current rankings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.userId}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    index === 0
                      ? 'bg-yellow-50 border border-yellow-200'
                      : index === 1
                      ? 'bg-gray-50 border border-gray-200'
                      : index === 2
                      ? 'bg-amber-50 border border-amber-200'
                      : 'bg-background border border-border'
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8">
                    {index === 0 ? (
                      <Trophy className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={player.avatar} />
                    <AvatarFallback>
                      {(player.displayName || player.username).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {player.displayName || player.username}
                      {player.isHost && (
                        <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                          Host
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-primary">{player.score}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Question Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {currentQuestionIndex + 1} / {totalQuestions}
              </div>
              <Progress 
                value={((currentQuestionIndex + 1) / totalQuestions) * 100} 
                className="h-2" 
              />
              <div className="text-sm text-muted-foreground mt-2">
                {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}% Complete
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
