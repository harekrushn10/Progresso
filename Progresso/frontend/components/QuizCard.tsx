import { BookOpen, TrendingUp, Clock, CalendarClock, CheckCircle, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Quiz } from '@/app/admin/(app)/quizzes/page';
import { useRouter } from 'next/navigation';

export const QuizCard = ({ quiz }: { quiz: Quiz }) => {
  const router = useRouter();

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
      statusText: 'No deadline',
      statusColor: 'bg-[#0d2b44] text-[#bfe1f8]',
      icon: <Clock className="w-4 h-4 mr-1" />
    };
  };

  const quizStatus = getQuizStatusInfo();

  return (
    <div className="dark:bg-[#18181a] dark:border-0 border-[#bdbdbd] border-[1px] rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col w-full">
            <div className='flex flex-row justify-between w-full items-center'>
              <h3 className="text-xl font-bold text-black dark:text-white/90 truncate pr-4">
                {quiz.title}
              </h3>
              <div className={`flex items-center ${quizStatus.statusColor} px-4 py-2 rounded-full text-xs font-medium w-fit gap-1 mt-2 mb-4`}>
                {quizStatus.icon}
                {quizStatus.statusText}
              </div>
            </div>
            <p className="text-neutral-400 line-clamp-2">
              {quiz.description}
            </p>

          </div>
        </div>



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

        <span className=" dark:text-white/90 text-lg my-5 font-semibold">
          Entry fee : {quiz.price}
        </span>

        <div className="flex justify-between items-center text-black dark:text-white border-t pt-4 mt-4">
          <div className="flex flex-col">
            {quiz.startDate && (
              <span className="text-xs text-gray-500">
                Start: {formatDate(quiz.startDate)}
              </span>
            )}
            {quiz.endDate && (
              <span className="text-xs text-gray-500">
                End: {formatDate(quiz.endDate)}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <Link href={`/user/quiz/${quiz.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-[#1177b8] hover:bg-[#0f5f95] text-white/90"
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