import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAppContext } from '../../contexts/AppContext';
import { createPluginSDK } from '../../lib/plugin-sdk';
import { Calculator, Trophy, Play, Clock } from 'lucide-react';

interface MathProblem {
  question: string;
  answer: number;
}

function generateProblem(): MathProblem {
  const operations = ['+', '-', '*'];
  const op = operations[Math.floor(Math.random() * operations.length)];
  let a = Math.floor(Math.random() * 20) + 1;
  let b = Math.floor(Math.random() * 20) + 1;

  let answer: number;
  let question: string;

  switch (op) {
    case '+':
      answer = a + b;
      question = `${a} + ${b}`;
      break;
    case '-':
      if (b > a) [a, b] = [b, a];
      answer = a - b;
      question = `${a} - ${b}`;
      break;
    case '*':
      a = Math.floor(Math.random() * 12) + 1;
      b = Math.floor(Math.random() * 12) + 1;
      answer = a * b;
      question = `${a} × ${b}`;
      break;
    default:
      answer = a + b;
      question = `${a} + ${b}`;
  }

  return { question, answer };
}

export function FastMathPlugin() {
  const { context } = useAppContext();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [problem, setProblem] = useState<MathProblem>(generateProblem());
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished');
    }
  }, [timeLeft, gameState]);

  if (!context) return null;

  const sdk = createPluginSDK(context);

  const startGame = async () => {
    const response = await sdk.spend('FAST_MATH_GAME', { difficulty: 'normal' });

    if (!response.success) {
      alert(`Unable to start game: ${response.error}`);
      return;
    }

    setGameState('playing');
    setScore(0);
    setTimeLeft(30);
    setQuestionsAnswered(0);
    setUserAnswer('');
    setProblem(generateProblem());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const answer = parseInt(userAnswer);
    if (answer === problem.answer) {
      setScore(score + 1);
    }

    setQuestionsAnswered(questionsAnswered + 1);
    setUserAnswer('');
    setProblem(generateProblem());
  };

  const resetGame = () => {
    setGameState('idle');
    setScore(0);
    setTimeLeft(30);
    setQuestionsAnswered(0);
    setUserAnswer('');
    setProblem(generateProblem());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-2xl">
              🔢
            </div>
            Fast Math
          </h1>
          <p className="text-gray-600 mt-1">
            Speed arithmetic challenge
          </p>
        </div>
        <Badge variant="info">2 credits per game</Badge>
      </div>

      {gameState === 'idle' && (
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Calculator className="text-green-600" size={48} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Ready for a challenge?</h2>
              <p className="text-gray-600 mt-2">
                Solve as many math problems as you can in 30 seconds!
              </p>
            </div>
            <div className="pt-4">
              <Button variant="primary" size="lg" onClick={startGame}>
                <Play size={20} className="mr-2" />
                Start Game (2 credits)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {gameState === 'playing' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="text-blue-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Time Left</p>
                    <p className="text-3xl font-bold text-gray-900">{timeLeft}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Trophy className="text-yellow-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Score</p>
                    <p className="text-3xl font-bold text-gray-900">{score}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6 text-center space-y-6">
              <div>
                <p className="text-6xl font-bold text-gray-900 mb-4">
                  {problem.question}
                </p>
                <form onSubmit={handleSubmit} className="max-w-xs mx-auto">
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    autoFocus
                    placeholder="Your answer"
                    className="w-full px-4 py-3 text-2xl text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <Button type="submit" variant="primary" size="lg" className="w-full mt-4">
                    Submit Answer
                  </Button>
                </form>
              </div>
              <p className="text-sm text-gray-500">
                Questions answered: {questionsAnswered}
              </p>
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
              <h2 className="text-2xl font-bold text-gray-900">Time's Up!</h2>
              <p className="text-4xl font-bold text-green-600 mt-4">{score} correct</p>
              <p className="text-gray-600 mt-2">
                Out of {questionsAnswered} questions answered
              </p>
              {score > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Accuracy: {Math.round((score / questionsAnswered) * 100)}%
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-center pt-4">
              <Button variant="primary" onClick={startGame}>
                Play Again (2 credits)
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
