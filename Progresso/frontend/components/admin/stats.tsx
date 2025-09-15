"use client"
import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Users, BookOpen, Trophy, TrendingUp, ExternalLink } from 'lucide-react';
import axios from 'axios';

// Define TypeScript interfaces
interface StatsDataItem {
  value: string;
}

interface StatsData {
  students: StatsDataItem;
  quizzes: StatsDataItem;
  questions: StatsDataItem;
  subAdmins: StatsDataItem;
}

interface Quiz {
  totalQuestions: number;
}

export function Stats() {
  const [statsData, setStatsData] = useState<StatsData>({
    students: { value: '0' },
    quizzes: { value: '0' },
    questions: { value: '0' },
    subAdmins: { value: '0' }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Configure axios with credentials
        const axiosConfig = {
          withCredentials: true
        };
        
        // Fetch all data in parallel
        const [usersResponse, ongoingResponse, upcomingResponse, subAdminsResponse] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/`, axiosConfig),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/quiz/ongoing`, axiosConfig),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/quiz/upcoming`, axiosConfig),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/sub-admins`, axiosConfig)
        ]);

        // Process the responses
        const totalStudents = usersResponse.data.count || usersResponse.data.data.length;
        const ongoingQuizzC = ongoingResponse.data.count || ongoingResponse.data.data.length;
        const upcomingQuizzC = upcomingResponse.data.count || upcomingResponse.data.data.length;
        const totalSubAdmins = subAdminsResponse.data.count || subAdminsResponse.data.subAdmins.length;

        setStatsData({
          students: { value: totalStudents.toLocaleString() },
          quizzes: { value: ongoingQuizzC.toLocaleString() },
          questions: { value: upcomingQuizzC.toLocaleString() },
          subAdmins: { value: totalSubAdmins.toLocaleString() }
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching stats data:", err);
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Define stats configuration
  const stats = [
    {
      label: 'Total Students',
      value: statsData.students.value,
      icon: Users,
      color: 'text-[#86caf3]',
      link: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/admin/students/`
    },
    {
      label: 'Active Quizzes',
      value: statsData.quizzes.value,
      icon: Trophy,
      color: 'text-[#86caf3]',
      link: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/admin/quiz/`
    },
    {
      label: 'Upcoming Quizzes',
      value: statsData.questions.value,
      icon: BookOpen,
      color: 'text-[#86caf3]',
      link: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/admin/quizzes`
    },
    {
      label: 'Sub Admins',
      value: statsData.subAdmins.value,
      icon: TrendingUp,
      color: 'text-[#86caf3]',
      link: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/admin/sub-admin`
    },
  ];

  if (error) {
    return <div className="text-red-500">Error loading stats data. Please try again later.</div>;
  }

  return (
    <div className="flex flex-col w-full justify-between lg:flex-row gap-6 mb-8">
      {stats.map((stat) => (
        <Card key={stat.label} className="w-full bg-white dark:bg-[#18181a] dark:border-0 border-[#bdbdbd] border-[1px] flex flex-col p-4 relative">
          <div className="flex items-start w-full justify-between">
            <div>
              <p className="text-gray-600 dark:text-white/90 text-sm">{stat.label}</p>
              <p className="text-2xl font-semibold text-black dark:text-white/90 mt-1">
                {loading ? '...' : stat.value}
              </p>
            </div>
            <stat.icon className={`w-8 h-8 ${stat.color}`} />
          </div>
        </Card>
      ))}
    </div>
  );
}