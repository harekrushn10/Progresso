"use client"
import { OngoingQuizzes } from '@/components/onGoingContest';
import { UpcomingQuizzes } from '@/components/upcomingContest';
import { Stats } from '@/components/stats';
import { Sidebar } from '@/components/sidebar';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

// Define interfaces for type safety
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ApiResponse {
  success: boolean;
  user: {
    id: string;
    name?: string;
    email: string;
    role: string;
  };
}

const DashboardComponent = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User>({
    id: '',
    name: 'User',
    email: '',
    role: ''
  });

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<ApiResponse>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/profile`, {
          withCredentials: true
        });

        if (response.data && response.data.success) {
          setUser({
            id: response.data.user.id,
            name: response.data.user.name || 'User',
            email: response.data.user.email,
            role: response.data.user.role
          });
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        toast.error('Unable to load your profile. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const getWelcomeMessage = (): string => {
    const currentHour = new Date().getHours();
    let greeting = '';

    if (currentHour < 12) {
      greeting = 'Good morning';
    } else if (currentHour < 18) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }

    return `${greeting}, ${user.name}!`;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="h-full min-h-screen flex flex-col w-full overflow-hidden bg-white dark:bg-[#0e0e10]">
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <main className="md:ml-64 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e2f1fc]">{getWelcomeMessage()}</h1>
            <p className="text-neutral-500 text-lg">Here&apos;s what&apos;s happening with your quizzes today.</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <p className="font-medium text-gray-900 dark:text-white/90">
                  User : {user.name}
                </p>
                <p className="font-medium text-neutral-400">
                  Email : {user.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Stats />
        <OngoingQuizzes />
        <UpcomingQuizzes />
      </main>
    </div>
  );
}

export default DashboardComponent;