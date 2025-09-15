"use client"
import { OngoingQuizzes } from '@/components/admin/onGoingContest';
import { UpcomingQuizzes } from '@/components/admin/upcomingContest';
import { Stats } from '@/components/admin/stats';
import { Sidebar } from '@/components/admin/sidebar';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

// Define types for admin data
type AdminProfile = {
  id: string;
  email: string;
  name: string;
  isSuper?: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  admin?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    subAdmins: number;
    quizzes: number;
  };
};

type SubAdminProfile = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  admin?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    subAdmins: number;
    quizzes: number;
  };
};

type ProfileData = AdminProfile | SubAdminProfile;

const DashboardComponent = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminName, setAdminName] = useState('Admin');
  const [role, setRole] = useState('');
  const [adminData, setAdminData] = useState<ProfileData | null>(null);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setIsLoading(true);
        
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/admin-profile`, {
          withCredentials: true
        });
        
        if (response.data && response.data.success) {
          const profile = response.data.admin;
          
          // Store the complete admin data
          setAdminData(profile);
          
          // Set admin name
          if (profile.name) {
            setAdminName(profile.name);
          }
          
          // Set role and admin status
          if (profile.role) {
            setRole(profile.role);
            setIsAdmin(profile.role === 'ADMIN');
          }
        } else {
          toast.error('Failed to fetch profile information');
        }
      } catch (err) {
        console.error('Authentication error:', err);
        toast.error('Authentication failed. Please login again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  // Generate appropriate welcome message based on role
  const getWelcomeMessage = () => {
    if (role === 'ADMIN') {
      return `Welcome back, Admin ${adminName}!`;
    } else if (role === 'SUB_ADMIN') {
      return `Welcome back, Sub-Admin ${adminName}!`;
    } else {
      return `Welcome back, ${adminName}!`;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="h-full min-h-screen flex flex-col w-full overflow-hidden bg-white dark:bg-[#0e0e10]">
      <div className='hidden md:flex'>
        <Sidebar />
      </div>
      <main className="md:ml-64 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e2f1fc]">{getWelcomeMessage()}</h1>
            <p className="text-neutral-500 text-lg">Here&apos;s what&apos;s happening with your quizzes today.</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <p className="font-medium text-lg text-gray-900 dark:text-white/90">
                  {role === 'ADMIN' ? 'Admin' : 'Sub-Admin'}: {adminName}
                </p>
                {adminData && role === 'ADMIN' && (
                  <p className="text-sm text-neutral-400">
                    {adminData._count?.quizzes || 0} Quizzes · {adminData._count?.subAdmins || 0} Sub-Admins
                  </p>
                )}
                {adminData && role === 'SUB_ADMIN' && (
                  <p className="text-sm text-gray-500">
                    Managed by: {adminData.admin?.name || 'Unknown Admin'}
                  </p>
                )}
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