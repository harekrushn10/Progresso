"use client"
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Sidebar } from '@/components/admin/sidebar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import Link from 'next/link';
import { QuizCard } from '@/components/admin/QuizCard';

// Define interface for Quiz
export interface Quiz {
  id: string;
  title: string;
  description: string;
  price: number;
  totalQuestions: number;
  totalParticipants: number;
  leaderboardEntries: number;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate: string;
}

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch quizzes on component mount
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/quiz/completed`, {
          withCredentials: true
        });

        if (response.data.success) {
          setQuizzes(response.data.data);
        } else {
          toast.error('Failed to fetch quizzes', {
            description: response.data.message || 'An error occurred while fetching quizzes'
          });
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        toast.error('Network Error', {
          description: 'Unable to fetch quizzes. Please try again later.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-screen flex flex-col w-full overflow-hidden bg-white dark:bg-[#0e0e10]">
      <div className='hidden md:flex'>
        <Sidebar />
      </div>
      <main className="md:ml-64 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e2f1fc]">Completed Quizzes</h1>
          </div>
          <Link href="/admin/create-quiz">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create New Quiz
            </Button>
          </Link>
        </div>

        {quizzes.length === 0 ? (
          <div className="bg-white dark:bg-[#0e0e10] shadow-md rounded-lg p-6 text-center">
            <p className="text-gray-900 dark:text-[#e2f1fc]">No quizzes found. Create your first quiz!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Quizzes;