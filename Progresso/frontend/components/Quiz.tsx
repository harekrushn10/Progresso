"use client"
import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2
  },
  {
    id: 2, 
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1
  }
];

export default function Quiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: number}>({});
  const [timeLeft, setTimeLeft] = useState(30);
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(30);
    }
  };
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          handleNextQuestion();
          return 30;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, handleNextQuestion]);

  const handleOptionSelect = (questionId: number, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const getOptionClassName = (questionId: number, optionIndex: number) => {
    if (selectedAnswers[questionId] === undefined) {
      return "p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all";
    }

    if (optionIndex === sampleQuestions[questionId-1].correctAnswer) {
      return "p-4 border rounded-lg bg-green-100 border-green-500 text-green-700";
    }

    if (selectedAnswers[questionId] === optionIndex) {
      return "p-4 border rounded-lg bg-red-100 border-red-500 text-red-700";
    }

    return "p-4 border rounded-lg bg-gray-50 cursor-not-allowed opacity-50";
  };

  const currentQuestion = sampleQuestions[currentQuestionIndex];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quiz Title</h1>
        <div className="text-xl font-semibold text-blue-600">
          Time Left: {timeLeft}s
        </div>
      </div>
      
      <Card className="p-6">
        <div className="grid grid-cols-2 gap-8">
          <div className="border-r pr-8">
            <h2 className="text-2xl font-semibold mb-4">
              Question {currentQuestionIndex + 1} of {sampleQuestions.length}
            </h2>
            <p className="text-xl">{currentQuestion.question}</p>
          </div>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={getOptionClassName(currentQuestion.id, index)}
                onClick={() => {
                  if (selectedAnswers[currentQuestion.id] === undefined) {
                    handleOptionSelect(currentQuestion.id, index);
                  }
                }}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="mt-6 flex justify-end">
        {currentQuestionIndex < sampleQuestions.length - 1 && (
          <Button 
            onClick={handleNextQuestion}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Next Question
          </Button>
        )}
      </div>
    </div>
  );
}
