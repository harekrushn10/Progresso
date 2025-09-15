import { BookOpen, TrendingUp, Clock, CalendarClock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Quiz } from '@/app/admin/(app)/quizzes/page';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export const QuizCard = ({ quiz }: { quiz: Quiz }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  // Function to check admin status
  const checkAdminStatus = async () => {
    try {
      // Use the dashboard endpoint to check if user is authenticated and their role
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/dashboard`, {
        withCredentials: true
      });
      
      if (response.data && response.data.user) {
        // Set admin status based on user role
        const isUserAdmin = response.data.user.role === 'ADMIN';
        setIsAdmin(isUserAdmin);
        
        // If not admin, redirect to dashboard or another appropriate page
        // if (!isUserAdmin) {
        //   toast.error('Access denied. Only administrators can create quizzes.');
        //   router.push('/admin/dashboard');
        // }
      }
    } catch (err) {
      console.error('Authentication error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date to display month and day
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate quiz status and appropriate message
  const getQuizStatusInfo = () => {
    const now = new Date();
    const startDate = quiz.startDate ? new Date(quiz.startDate) : null;
    const endDate = quiz.endDate ? new Date(quiz.endDate) : null;

    // Quiz is upcoming if start date is in the future
    if (startDate && startDate > now) {
      const diffTime = Math.abs(startDate.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        status: 'upcoming',
        statusText: `Live in ${diffDays} day${diffDays !== 1 ? 's' : ''}`,
        statusColor: 'bg-purple-100 text-purple-700',
        icon: <CalendarClock className="w-4 h-4 mr-1" />
      };
    }
    
    // Quiz is completed if end date is in the past
    if (endDate && endDate < now) {
      return {
        status: 'completed',
        statusText: 'Finished',
        statusColor: 'bg-gray-100 text-gray-700',
        icon: <CheckCircle className="w-4 h-4 mr-1" />
      };
    }
    
    // Otherwise, quiz is ongoing
    // Calculate time remaining if there's an end date
    if (endDate) {
      const diffTime = Math.abs(endDate.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        status: 'ongoing',
        statusText: `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`,
        statusColor: 'bg-green-100 text-green-700',
        icon: <Clock className="w-4 h-4 mr-1" />
      };
    }
    
    // Ongoing with no end date
    return {
      status: 'ongoing',
      statusText: 'In progress',
      statusColor: 'bg-green-100 text-green-700',
      icon: <Clock className="w-4 h-4 mr-1" />
    };
  };

  const quizStatus = getQuizStatusInfo();

  return (
    <div className="dark:bg-[#18181a] dark:border-0 border-[#bdbdbd] border-[1px] rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-black dark:text-white/90 truncate pr-4">
              {quiz.title}
            </h3>
            <div className={`flex items-center ${quizStatus.statusColor} px-2 py-1 rounded-full text-xs font-medium w-fit mt-2`}>
              {quizStatus.icon}
              {quizStatus.statusText}
            </div>
          </div>
          <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
            ${quiz.price?.toFixed(2) || '0.00'}
          </span>
        </div>

        <p className="text-neutral-400 mb-4 line-clamp-2">
          {quiz.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-neutral-400">
              {quiz.totalQuestions} Questions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-neutral-400">
              {quiz.totalParticipants} Participants
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center text-black dark:text-white border-t pt-4 mt-4">
          <div className="flex flex-col">
            {/* Only show created date if user is admin */}
            {isAdmin && (
              <span className="text-xs text-black dark:text-white">
                Created: {formatDate(quiz.createdAt)}
              </span>
            )}
            {quiz.startDate && (
              <span className="text-xs text-black dark:text-white">
                Start: {formatDate(quiz.startDate)}
              </span>
            )}
            {quiz.endDate && (
              <span className="text-xs text-black dark:text-white">
                End: {formatDate(quiz.endDate)}
              </span>
            )}
          </div>
          <div className="flex space-x-2 bg-[#1177b8] hover:bg-[#0f5f95] text-white rounded-md">
            <Link href={`/admin/quiz/${quiz.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
              >
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};