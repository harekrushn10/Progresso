import Logo from '@/public/mainLogo.png'
import Image from 'next/image';
import { Home, ChartCandlestick, Trophy, BadgePercent, Users, Plus, Timer, TimerOff, LogOut, BookOpen } from 'lucide-react';
import { Link } from '../ui/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';

export function Sidebar() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/logout`, {}, {
        withCredentials: true
      });
      
      if (response.data && response.data.success) {
        toast.success('Logged out successfully');
        // Redirect to home page after successful logout
        router.push('/');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };
  return (
    <div className="w-64 dark:bg-[#18181a] h-full max-h-screen fixed left-0 top-0 text-white dark:border-0 border-[#bdbdbd] border-[1px] p-6">
      <div className="flex items-center space-x-2 pb-10">
        <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-black" />
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Progresso
        </span>
      </div>
      
      <nav className="space-y-2">
        <Link href={'/admin/dashboard'} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
          <Home className="w-5 h-5 text-black dark:text-white/90" />
          <h1 className='text-black dark:text-white/90'>Dashboard</h1>
        </Link>
        <Link href={'/admin/evaluator'} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
          <ChartCandlestick className="w-5 h-5 text-black dark:text-white/90" />
          <h1 className='text-black dark:text-white/90'>Evaluator</h1>
        </Link>
        <Link href={'/admin/create-quiz'} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
          <Plus className="w-5 h-5 text-black dark:text-white/90" />
          <h1 className='text-black dark:text-white/90'>Create Quiz</h1>
        </Link>
        <Link href={'/admin/quizzes'} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
          <Trophy className="w-5 h-5 text-black dark:text-white/90" />
          <h1 className='text-black dark:text-white/90'>Ongoing Quizzes</h1>
        </Link>
        <Link href={'/admin/upcoming-quiz'} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
          <Timer className="w-5 h-5 text-black dark:text-white/90" />
          <h1 className='text-black dark:text-white/90'>Upcoming Quizzes</h1>
        </Link>
        <Link href={'/admin/completed-quiz'} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
          <TimerOff className="w-5 h-5 text-black dark:text-white/90" />
          <h1 className='text-black dark:text-white/90'>Completed Quizzes</h1>
        </Link>
        <Link href={'/admin/promo-code'} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
          <BadgePercent className="w-5 h-5 text-black dark:text-white/90" />
          <h1 className='text-black dark:text-white/90'>Promo Code</h1>
        </Link>
        <Link href={'/admin/students'} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
          <Users className="w-5 h-5 text-black dark:text-white/90" />
          <h1 className='text-black dark:text-white/90'>Students</h1>
        </Link>
        <Link href={'/admin/sub-admin'} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
          <Users className="w-5 h-5 text-black dark:text-white/90" />
          <h1 className='text-black dark:text-white/90'>Manage Sub-admins</h1> 
        </Link>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center text-black dark:text-white/90 gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-left"
        >
          <LogOut className="w-5 h-5 text-black dark:text-white/90" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </nav>
    </div>
  );
}