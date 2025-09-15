"use client"
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Clock, Users, DollarSign, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Card } from './ui/card';
import { Link } from './ui/link';
interface Quiz {
  id: string;
  title: string;
  description: string;
  price: number;
  startDate: string | null;
  endDate: string | null;
  totalQuestions: number;
  totalParticipants: number;
  createdAt: string;
  updatedAt: string;
}

export function UpcomingQuizzes(): JSX.Element {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchQuizzes = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/quiz/upcoming`, { withCredentials: true });
        if (response.data.success) {
          setQuizzes(response.data.data);
        } else {
          setError('Failed to fetch quizzes');
        }
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleScroll = (direction: 'left' | 'right'): void => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = container.offsetWidth * 0.75;
    const newPosition = direction === 'left'
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(container.scrollWidth - container.offsetWidth, scrollPosition + scrollAmount);

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });

    setScrollPosition(newPosition);
  };

  // Format date difference as time left
  const getTimeLeft = (endDate: string | null): string => {
    if (!endDate) return "No deadline";

    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    return `${hours}h`;
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Quizzes</h2>
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Quizzes</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error: {error}. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white/90">Upcoming Quizzes</h2>
        {quizzes.length > 1 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleScroll('left')}
              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-neutral-400 dark:hover:bg-neutral-500 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-black" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-neutral-400 dark:hover:bg-neutral-500 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-black" />
            </button>
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <Card
              key={quiz.id}
              className="flex-shrink-0 w-[30rem] dark:border-0 border-[#bdbdbd] border-[1px] dark:bg-[#18181a]"
            >
              <div className="p-4">
                <div className="flex flex-col h-full">
                  <div className='flex flex-row w-full justify-between items-center'>
                    <h3 className="font-semibold text-black dark:text-white/90 text-lg mb-2">{quiz.title}</h3>
                    <div className="flex text-sm mb-4 gap-2 text-[#bfe1f8] w-fit rounded-3xl items-center px-3 py-2 bg-[#0d2b44]">
                      <Clock className="w-4 h-4" />
                      <p className='text-[#bfef8]'>Starts in</p>
                      {getTimeLeft(quiz.endDate)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 dark:text-neutral-400">{quiz.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-neutral-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-[#86caf3]" />
                      Total Participants : {quiz.totalParticipants}
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4 text-[#86caf3]" />
                      {quiz.totalQuestions === 1 ? "Question" : "Questions"} : {quiz.totalQuestions}
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-center gap-2 dark:text-white/90 font-medium my-5">
                      Entry Fee: ${quiz.price}
                    </div>
                    <Link href={`/user/quiz/${quiz.id}`}>
                      <button className="w-full px-4 py-2 text-sm bg-[#1177b8] hover:bg-[#0f5f95] text-white rounded-md transition-colors flex items-center justify-center gap-1">
                        View
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="flex items-center justify-center w-full py-8 text-gray-500">
            No upcoming quizzes available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}