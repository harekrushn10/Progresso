"use client"
import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { Sidebar } from '@/components/sidebar';
import { Calendar, Clock, Users, Award, FileText } from 'lucide-react';
import { Link } from '@/components/ui/link';

interface QuizOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  quizId: string;
  text: string;
  points: number;
  timeLimit: number | null;
  options: QuizOption[];
}

interface LeaderboardEntry {
  id: string;
  leaderboardId: string;
  userId: string;
  score: number;
  completionTime: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface Leaderboard {
  id: string;
  quizId: string;
  entries?: LeaderboardEntry[];
  _count?: {
    entries: number;
  };
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isPublic: boolean;
  timeLimit: number | null;
  questions: QuizQuestion[];
  totalParticipants: number;
  totalQuestions: number;
  leaderboardEntries: number;
  leaderboard?: Leaderboard;
  topScores: LeaderboardEntry[];
  startDate?: string;
  endDate?: string;
  status?: 'upcoming' | 'ongoing' | 'completed';
}

interface PageParams {
  quizId: string;
}

const Quiz = ({ params }: { params: Promise<PageParams> }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [alreadyJoined, setAlreadyJoined] = useState<boolean>(false);
  const [joinQuiz, setJoiningQuiz] = useState<boolean>(false);
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [quizStatus, setQuizStatus] = useState<'upcoming' | 'ongoing' | 'completed' | null>(null);

  const { quizId } = use(params);

  const handleJoin = async () => {
    setJoiningQuiz(true);
    setJoinError(null);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/quiz/${quizId}/join`, {}, {
        withCredentials: true
      });

      if (response.data.success) {
        setHasJoined(true);
      } else {
        setJoinError(response.data.message || 'Failed to join quiz');
      }
    } catch (err: any) {
      console.error(err);
      setJoinError(err?.response?.data?.message || 'Error joining quiz');
    } finally {
      setJoiningQuiz(false);
    }
  };

  // Determine quiz status based on dates
  const determineQuizStatus = (quiz: Quiz): 'upcoming' | 'ongoing' | 'completed' => {
    if (quiz.status) return quiz.status;

    const currentDate = new Date();
    let status: 'upcoming' | 'ongoing' | 'completed' = 'ongoing'; // Default

    if (quiz.startDate && quiz.endDate) {
      const startDate = new Date(quiz.startDate);
      const endDate = new Date(quiz.endDate);

      if (currentDate < startDate) {
        status = 'upcoming';
      } else if (currentDate >= startDate && currentDate <= endDate) {
        status = 'ongoing';
      } else {
        status = 'completed';
      }
    } else if (quiz.startDate && !quiz.endDate) {
      const startDate = new Date(quiz.startDate);
      status = currentDate >= startDate ? 'ongoing' : 'upcoming';
    } else if (!quiz.startDate && quiz.endDate) {
      const endDate = new Date(quiz.endDate);
      status = currentDate <= endDate ? 'ongoing' : 'completed';
    }

    return status;
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/quiz/${quizId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });

        if (response.status !== 200) {
          throw new Error(response.data.message || 'Failed to fetch quiz');
        }

        const quizData = response.data.data as Quiz;
        setQuiz(quizData);

        // Check if user has already joined
        try {
          const joinedQuizzes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/quiz/user/joined`, {
            withCredentials: true,
          });

          if (joinedQuizzes.data.success) {
            const hasJoinedThisQuiz = joinedQuizzes.data.data.some((attempt: any) =>
              attempt.quizId === quizId
            );
            setHasJoined(hasJoinedThisQuiz);
          }
        } catch (joinError) {
          console.error('Error checking joined status:', joinError);
        }

        // Set quiz status
        setQuizStatus(determineQuizStatus(quizData));
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.message || err.message
            : err instanceof Error
              ? err.message
              : 'An unknown error occurred'
        );
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (seconds: number | null | undefined): string => {
    if (!seconds) return 'No time limit';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderQuizActionButtons = () => {
    // Show "Show Results" button for completed quizzes
    if (quizStatus === 'completed') {
      return (
        <div className="gap-2 w-full justify-center items-center">
          <div className='flex justify-center items-center'>
            <Link href={`/user/quiz-result/${quizId}`}>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition">
                Show Results
              </button>
            </Link>
          </div>
          <div className='flex justify-center items-center mt-4'>
            <p className="text-gray-600 font-semibold">This quiz has ended. You can view your results.</p>
          </div>
        </div>
      );
    }

    // Show message for upcoming quizzes
    if (quizStatus === 'upcoming') {
      return (
        <div className="bg-gray-100 p-4 rounded-md text-center">
          <p className="text-yellow-600">This quiz hasn't started yet. Check back when it begins.</p>
        </div>
      );
    }

    // For ongoing quizzes, show join/start buttons
    return (
      <div className="flex gap-2 w-full justify-center items-center">
        {!hasJoined ? (
          <button
            className="px-4 py-2 bg-[#1177b8] hover:bg-[#0f5f95] text-white rounded-md transition"
            onClick={handleJoin}
            disabled={joinQuiz}
          >
            {joinQuiz ? 'Joining...' : 'Join Quiz'}
          </button>
        ) : (
          <Link href={`/user/start-quiz/${quizId}`}>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
              Start Quiz
            </button>
          </Link>
        )}

        {joinError && (
          <p className="text-red-500 mt-2">{joinError}</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-full min-h-screen flex flex-col w-full overflow-hidden border-[#bdbdbd] border-[1px] bg-white dark:bg-[#0e0e10]">
        <div className='hidden md:flex'>
          <Sidebar />
        </div>
        <main className="md:ml-64 p-8 flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-900 dark:text-[#e2f1fc]">Loading quiz details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full min-h-screen flex flex-col w-full overflow-hidden border-[#bdbdbd] border-[1px] bg-white dark:bg-[#0e0e10]">
        <div className='hidden md:flex'>
          <Sidebar />
        </div>
        <main className="md:ml-64 p-8 flex items-center justify-center">
          <div className="bg-[#18181a] p-6 rounded-lg text-center w-full max-w-2xl border-[#bdbdbd] border-[1px]">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-black dark:text-white/90">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="h-full min-h-screen flex flex-col w-full overflow-hidden border-[#bdbdbd] border-[1px] bg-white dark:bg-[#0e0e10]">
        <div className='hidden md:flex'>
          <Sidebar />
        </div>
        <main className="md:ml-64 p-8 flex items-center justify-center">
          <div className="bg-[#18181a] p-6 rounded-lg text-center w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[#e2f1fc] mb-2">Quiz Not Found</h2>
            <p className="text-gray-900 dark:text-[#e2f1fc]">The requested quiz could not be found.</p>
            <button
              onClick={() => window.history.back()}
              className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-full min-h-screen flex flex-col w-full overflow-hidden bg-white dark:bg-[#0e0e10]">
      <div className='hidden md:flex'>
        <Sidebar />
      </div>
      <main className="md:ml-64 p-8 ">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e2f1fc]">{quiz.title}</h1>
            <p className="text-gray-600 dark:text-neutral-400">{quiz.description}</p>
          </div>
          <div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${quizStatus === 'ongoing' ? 'bg-green-100 text-green-800' :
                quizStatus === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
              }`}>
              {quizStatus === 'ongoing' ? 'Ongoing' :
                quizStatus === 'upcoming' ? 'Upcoming' :
                  'Completed'}
            </span>
          </div>
        </div>

        {/* Quiz details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="dark:bg-[#18181a] border-[#bdbdbd] border-[1px] p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-[#86caf3]" />
              <h2 className="text-xl font-semibold text-black dark:dark:text-white/90">Overview</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-black dark:dark:text-white/90">{formatDate(quiz.createdAt)}</p>
                </div>
              </div>
              {quiz.startDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="text-black dark:dark:text-white/90">{formatDate(quiz.startDate)}</p>
                  </div>
                </div>
              )}
              {quiz.endDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="text-black dark:dark:text-white/90">{formatDate(quiz.endDate)}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Time Limit</p>
                  <p className="text-black dark:dark:text-white/90">{formatTime(quiz.timeLimit)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Questions</p>
                  <p className="text-black dark:text-white/90">{quiz.totalQuestions}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="dark:bg-[#18181a] border-[#bdbdbd] border-[1px] p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-6 w-6 text-[#86caf3]" />
              <h2 className="text-xl font-semibold text-black dark:text-white/90">Participation</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Participants</p>
                  <p className="text-black dark:text-white/90">{quiz.totalParticipants}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Leaderboard Entries</p>
                  <p className="text-black dark:text-white/90">{quiz.leaderboardEntries}</p>
                </div>
              </div>
              <div>
              </div>
            </div>
          </div>

          <div className="dark:bg-[#18181a] border-[#bdbdbd] border-[1px] p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-[#86caf3]" />
                <h2 className="text-xl font-semibold text-black dark:text-white/90">Top Scores</h2>
              </div>
            </div>
            {quiz.topScores && quiz.topScores.length > 0 ? (
              <div className="space-y-2">
                {quiz.topScores.slice(0, 5).map((entry: LeaderboardEntry, index: number) => (
                  <div key={entry.id} className="flex items-center justify-between p-2 rounded bg-[#f5f5f5] dark:bg-[#2d2d31] hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-black dark:text-white/90">{index + 1}.</span>
                      <span className="font-medium text-black dark:text-white/90">{entry.user.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#86caf3]">Score: {entry.score}/{quiz.questions.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No scores yet</p>
            )}
          </div>
        </div>

        {/* Quiz action buttons */}
        {renderQuizActionButtons()}
      </main>
    </div>
  );
}

export default Quiz;