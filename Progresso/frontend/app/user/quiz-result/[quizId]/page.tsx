"use client"

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { ChevronLeft, Award, XCircle, Users, Share2, Loader2 } from 'lucide-react';

interface QuizResult {
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentageScore: number;
  completed: boolean;
  completedAt: string;
  rank: number;
  totalParticipants: number;
  topScores: {
    rank: number;
    name: string;
    score: number;
    totalQuestions: number
  }[];
}

const QuizResult = ({ params }: { params: Promise<{ quizId: string }> }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";

  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { quizId } = use(params);

  useEffect(() => {
    const fetchQuizResult = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/quiz/${quizId}/result?category=${category}`,
          {
            withCredentials: true
          }
        );

        if (response.data.success) {
          setResult(response.data.data);
          console.log(response.data.data);

        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.error('Error fetching quiz result:', err);
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.message || err.message
            : err instanceof Error
              ? err.message
              : 'Failed to load quiz result'
        );
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuizResult();
    }
  }, [quizId, category]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => score >= 80 ? 'text-green-600' : score >= 60 ? 'text-blue-600' : score >= 40 ? 'text-yellow-600' : 'text-red-600';
  const getScoreBg = (score: number) => score >= 80 ? 'bg-green-100' : score >= 60 ? 'bg-blue-100' : score >= 40 ? 'bg-yellow-100' : 'bg-red-100';

  const handleBackToQuizzes = () => router.push('/user/quizzes');
  const handleViewQuizDetails = () => router.push(`/user/quiz/${quizId}`);

  const handleShareResult = () => {
    if (navigator.share) {
      navigator.share({
        title: `My Quiz Result: ${result?.quizTitle}`,
        text: `I scored ${result?.percentageScore}% on the ${result?.quizTitle} quiz!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Quiz result link copied to clipboard!'))
        .catch(() => alert('Failed to copy link'));
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
    </div>
  );

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center">
      <XCircle className="h-10 w-10 text-red-600 mb-2" />
      <p className="text-red-600 font-semibold mb-4">{error}</p>
      <button onClick={handleBackToQuizzes} className="px-4 py-2 bg-red-600 text-white rounded">Back to Quizzes</button>
    </div>
  );

  if (!result) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0e0e10]">
      <div className='hidden md:flex'>
        <Sidebar />
      </div>
      <main className="md:ml-64 p-4 md:p-8">
        <div className="mb-6 flex items-center gap-2">
          <button onClick={handleViewQuizDetails} className="p-2 rounded-full hover:bg-gray-200">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quiz Results</h1>
        </div>

        {/* Results Summary */}
        <div className="bg-gray-50 dark:bg-[#18181a] border rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{result.quizTitle}</h2>
          <p className="text-neutral-500 mb-4">Completed on {formatDate(result.completedAt)}</p>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className={`w-32 h-32 flex items-center justify-center rounded-full ${getScoreBg(result.percentageScore)}`}>
              <span className={`text-4xl font-bold ${getScoreColor(result.percentageScore)}`}>{result.percentageScore}%</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Award className="mx-auto text-[#86caf3]" />
                <p className="text-sm text-gray-500">Rank</p>
                <p className="text-xl font-bold">{result.rank} / {result.totalParticipants}</p>
              </div>
              <div className="text-center">
                <Users className="mx-auto text-[#86caf3]" />
                <p className="text-sm text-gray-500">Participants</p>
                <p className="text-xl font-bold">{result.totalParticipants}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handleShareResult}
            className="p-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center justify-center gap-2 text-black"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button onClick={handleViewQuizDetails} className="px-4 py-2 bg-[#1177b8] hover:bg-[#0f5f95] text-white rounded">
            View Quiz
          </button>
        </div>

        {/* Leaderboard */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="text-[#86caf3]" /> Leaderboard
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 dark:bg-[#242427]">
                <tr>
                  <th className="p-2">Rank</th>
                  <th className="p-2">Name</th>
                  <th className="p-2 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {result.topScores.map((entry) => (
                  <tr key={entry.rank} className="border-t">
                    <td className="p-2">{entry.rank}</td>
                    <td className={`p-2 ${entry.rank === result.rank ? 'text-[#86caf3] font-semibold' : ''}`}>
                      {entry.name}{entry.rank === result.rank ? ' (You)' : ''}
                    </td>
                    <td className="p-2 text-right">{entry.score} / {entry.totalQuestions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button onClick={handleBackToQuizzes} className="px-6 py-3 bg-[#1177b8] hover:bg-[#0f5f95] text-white rounded">
            Take Another Quiz
          </button>
        </div>
      </main>
    </div>
  );
};

export default QuizResult;
