import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAppContext } from '../../contexts/AppContext';
import { createPluginSDK } from '../../lib/plugin-sdk';
import { Globe, Trophy, Play } from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const questions: Question[] = [
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2
  },
  {
    question: "Which country has the largest population?",
    options: ["India", "China", "USA", "Indonesia"],
    correctAnswer: 1
  },
  {
    question: "What is the smallest country in the world?",
    options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
    correctAnswer: 1
  },
];

export function GeoQuickPlugin() {
  const { context } = useAppContext();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  if (!context) return null;

  const sdk = createPluginSDK(context);

  const startGame = async () => {
    const response = await sdk.spend('GEO_ROUND', { gameMode: 'quick' });

    if (!response.success) {
      alert(`Unable to start game: ${response.error}`);
      return;
    }

    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    if (answerIndex === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameState('finished');
      }
    }, 1500);
  };

  const resetGame = () => {
    setGameState('idle');
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl">
              🌍
            </div>
            Geo Quick
          </h1>
          <p className="text-gray-600 mt-1">
            Test your geography knowledge
          </p>
        </div>
        <Badge variant="info">5 credits per round</Badge>
      </div>

      {gameState === 'idle' && (
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Globe className="text-blue-600" size={48} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Ready to play?</h2>
              <p className="text-gray-600 mt-2">
                Answer {questions.length} geography questions and test your knowledge!
              </p>
            </div>
            <div className="pt-4">
              <Button variant="primary" size="lg" onClick={startGame}>
                <Play size={20} className="mr-2" />
                Start Game (5 credits)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {gameState === 'playing' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
                <Badge variant="success">Score: {score}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {questions[currentQuestion].question}
              </h3>
              <div className="grid gap-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !showResult && handleAnswer(index)}
                    disabled={showResult}
                    className={`p-4 text-left rounded-lg border-2 transition-all ${
                      showResult
                        ? index === questions[currentQuestion].correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : index === selectedAnswer
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                        : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                    }`}
                  >
                    <span className="font-medium">{option}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {gameState === 'finished' && (
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="text-yellow-600" size={48} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Game Over!</h2>
              <p className="text-4xl font-bold text-blue-600 mt-4">
                {score} / {questions.length}
              </p>
              <p className="text-gray-600 mt-2">
                {score === questions.length
                  ? 'Perfect score! You know your geography!'
                  : score >= questions.length / 2
                  ? 'Good job! Keep practicing!'
                  : 'Keep learning and try again!'}
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-4">
              <Button variant="primary" onClick={startGame}>
                Play Again (5 credits)
              </Button>
              <Button variant="secondary" onClick={resetGame}>
                Back to Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
