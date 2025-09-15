"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { use } from 'react'
import { Sidebar } from '@/components/admin/sidebar';
import { Calendar, Clock, Users, Award, FileText, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Link } from '@/components/ui/link';
import { useRouter } from 'next/navigation';

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
  startDate: string;
  endDate: string;
  userId: string;
  isPublic: boolean;
  timeLimit: number | null;
  questions: QuizQuestion[];
  totalParticipants: number;
  totalQuestions: number;
  leaderboardEntries: number;
  leaderboard?: Leaderboard;
  topScores: LeaderboardEntry[];
}

interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  completed: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface PageParams {
  quizId: string;
}

const Quiz = ({ params }: { params: Promise<PageParams> }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [quizUsers, setQuizUsers] = useState<QuizAttempt[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [showUsers, setShowUsers] = useState<boolean>(false);
  
  const router = useRouter();
  const {quizId} = use(params)

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

        setQuiz(response.data.data as Quiz);
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

  const fetchQuizUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/quiz/${quizId}/users`, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      if (response.status !== 200) {
        throw new Error(response.data.message || 'Failed to fetch quiz users');
      }

      setQuizUsers(response.data.data);
      setShowUsers(true);
    } catch (err) {
      console.error('Error fetching quiz users:', err);
      alert(
        axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : err instanceof Error
            ? err.message
            : 'An unknown error occurred'
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDeleteQuiz = async () => {
    try {
      setIsDeleting(true);
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/quiz/${quizId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      if (response.status !== 200) {
        throw new Error(response.data.message || 'Failed to delete quiz');
      }

      // Redirect to quizzes page after successful deletion
      router.push('/admin/quizzes');
      
    } catch (err) {
      console.error('Error deleting quiz:', err);
      alert(
        axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : err instanceof Error
            ? err.message
            : 'An unknown error occurred'
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

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

  if (loading) {
    return (
      <div className="h-full min-h-screen flex flex-col w-full overflow-hidden bg-white dark:bg-[#0e0e10]">
        <div className='hidden md:flex'>
          <Sidebar /> 
        </div>
        <main className="md:ml-64 p-8 flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-900 dark:text-white/90">Loading quiz details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full min-h-screen flex flex-col w-full overflow-hidden bg-white dark:bg-[#0e0e10]">
        <div className='hidden md:flex'>
          <Sidebar />
        </div>
        <main className="md:ml-64 p-8 flex items-center justify-center">
          <div className="bg-[#18181a] p-6 rounded-lg border text-center w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-900 dark:text-white/90">{error}</p>
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
      <div className="h-full min-h-screen flex flex-col w-full overflow-hidden bg-white dark:bg-[#0e0e10]">
        <div className='hidden md:flex'>
          <Sidebar />
        </div>
        <main className="md:ml-64 p-8 flex items-center justify-center">
          <div className="bg-[#18181a] p-6 rounded-lg text-center w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-yellow-600 mb-2">Quiz Not Found</h2>
            <p className="text-gray-900 dark:text-white/90">The requested quiz could not be found.</p>
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
      <main className="md:ml-64 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e2f1fc]">{quiz.title}</h1>
            <p className="text-gray-600 dark:text-neutral-400">{quiz.description}</p>
          </div>
          <div className="flex gap-2 justify-center items-center">
            <Link 
              href={`/admin/edit/${quizId}`}
              className="flex items-center gap-1 px-4 py-2  bg-[#1177b8] hover:bg-[#0f5f95] text-white rounded-md transition"
            >
              <Edit className="h-4 w-4" />
              <h1 className='pt-1 pl-2'>Edit</h1>
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              <h1 className='pt-1 pl-2'>{isDeleting ? 'Deleting...' : 'Delete'}</h1>
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-sky-50 dark:bg-[#18181a] rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center gap-3 mb-4 dark:text-white/90">
                <AlertCircle className="h-6 w-6" />
                <h3 className="text-xl font-semibold dark:text-white/90">Delete Quiz</h3>
              </div>
              <p className="text-neutral-500 mb-6">
                Are you sure you want to delete "{quiz.title}"? This action cannot be undone and will remove all questions, attempts, and leaderboard entries associated with this quiz.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteQuiz}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Quiz'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quiz details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="dark:border-0 border-[#bdbdbd] border-[1px] dark:bg-[#18181a] p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-[#86caf3]" />
              <h2 className="text-xl font-semibold text-black dark:text-white/90">Overview</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-black dark:text-white/90">{formatDate(quiz.createdAt)}</p>
                </div>
              </div>
              {quiz.startDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="text-black dark:text-white/90">{formatDate(quiz.startDate)}</p>
                  </div>
                </div>
              )}
              {quiz.endDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="text-black dark:text-white/90">{formatDate(quiz.endDate)}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Time Limit</p>
                  <p className="text-black dark:text-white/90">{formatTime(quiz.timeLimit)}</p>
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

          <div className="dark:border-0 border-[#bdbdbd] border-[1px] dark:bg-[#18181a] p-6 rounded-lg shadow-lg">
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
              <button
                onClick={fetchQuizUsers}
                className="w-full mt-4 px-4 py-2 bg-blue-200 text-blue-700 rounded-md hover:bg-blue-300 transition flex items-center justify-center gap-2"
                disabled={loadingUsers}
              >
                {loadingUsers ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Loading Users...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    View Participants
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="dark:border-0 border-[#bdbdbd] border-[1px] dark:bg-[#18181a] p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-[#86caf3]" />
                <h2 className="text-xl font-semibold text-black dark:text-white/90">Top Scores</h2>
              </div>
            </div>
            {quiz.topScores && quiz.topScores.length > 0 ? (
              <div className="space-y-2">
                {quiz.topScores.slice(0, 5).map((entry: LeaderboardEntry, index: number) => (
                  <div key={entry.id} className="flex items-center justify-between p-2 rounded bg-gray-100 dark:bg-[#2d2d31] hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-black dark:text-white/90">{index + 1}.</span>
                      <span className="font-medium text-black dark:text-white/90">{entry.user.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* <span className="text-sm text-gray-600">{formatTime(entry.completionTime)}</span> */}
                      <span className="font-bold text-blue-600">Score : {entry.score}/{quiz.questions.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No scores yet</p>
            )}
          </div>
        </div>

        {/* Quiz Participants Table */}
        {showUsers && (
          <div className="dark:bg-[#18181a] p-6 rounded-lg shadow-lg dark:border-0 border-[#bdbdbd] border-[1px] mt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Quiz Participants</h2>
              </div>
              <button 
                onClick={() => setShowUsers(false)}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Hide
              </button>
            </div>
            
            {quizUsers && quizUsers.length > 0 ? (
              <div className="overflow-x-auto bg-gray-50 dark:bg-[#18181a]">
                <table className="min-w-full divide-y divide-gray-500 bg-gray-200 dark:bg-[#18181a]">
                  <thead className="bg-gray-200 dark:bg-[#18181a]">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium dark:text-gray-200 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium dark:text-gray-200 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium dark:text-gray-200 uppercase tracking-wider">
                        Score
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium dark:text-gray-200 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium dark:text-gray-200 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-[#18181a] divide-y divide-gray-700">
                    {quizUsers.map((attempt) => (
                      <tr key={attempt.id} className="hover:bg-gray-200 dark:hover:bg-[#242427]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900 dark:text-[#e2f1fc]">{attempt.user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900 dark:text-[#e2f1fc]">{attempt.user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-blue-600 ">{attempt.score}/{quiz.questions.length}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${attempt.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {attempt.completed ? 'Completed' : 'In Progress'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-[#e2f1fc]">
                          {formatDate(attempt.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No participants found for this quiz</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Quiz;