"use client"

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/admin/sidebar';
import axios from 'axios';
import CreatePromoCodeForm from '@/components/promocode/createPromoCode';
import PromoCodeList from '@/components/promocode/promoCodeList';
import { PromoCode, ApiResponse } from '@/components/promocode/types';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PromoCodePage = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const router = useRouter();

  const fetchPromoCodes = async (page: number = 1, isActive?: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (isActive && isActive !== 'all') {
        params.append('isActive', isActive);
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/promocode/get-promocodes?${params}`, {
        withCredentials: true
      });
      
      if (response.data && response.data.success) {
        setPromoCodes(response.data.data.promoCodes || []);
        setPagination(response.data.data.pagination);
        setIsAdmin(true);
      } else {
        setError(response.data?.message || 'Failed to fetch promo codes');
      }
    } catch (err: any) {
      console.error('Error fetching promo codes:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setIsAdmin(false);
        setIsAuthenticated(false);
        setError('You do not have permission to access this page');
        return;
      }
      setError(err.response?.data?.message || 'Failed to fetch promo codes');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAdminStatus = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/dashboard`, {
        withCredentials: true
      });
      
      if (response.data && response.data.user) {
        const isUserAdmin = response.data.user.role === 'ADMIN';
        setIsAdmin(isUserAdmin);
        setIsAuthenticated(true);
        
        if (!isUserAdmin) {
          setError('Access denied. Only administrators can manage promo codes.');
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setIsAuthenticated(false);
        setError('Authentication failed. Please login to continue.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAdminStatus().then(() => {
      if (isAdmin) {
        fetchPromoCodes(currentPage, activeFilter);
      }
    });
  }, [isAdmin, currentPage, activeFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const refreshPromoCodes = () => {
    fetchPromoCodes(currentPage, activeFilter);
  };

  if (isLoading) {
    return (
      <div className="h-full min-h-screen flex items-center bg-white dark:bg-[#0e0e10] justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-full min-h-screen flex flex-col w-full overflow-hidden bg-white dark:bg-[#0e0e10]">
        <div className='hidden md:flex'>
          <Sidebar />
        </div>
        <main className="md:ml-64 p-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e2f1fc] mb-2">Access Denied</h1>
            <p className="text-gray-900 dark:text-[#e2f1fc] mb-6">
              {isAuthenticated 
                ? "You don't have permission to access this page. Only administrators can manage promo codes." 
                : "Please login with an administrator account to access this page."}
            </p>
            <Button 
              onClick={() => isAuthenticated 
                ? router.push('/admin/dashboard') 
                : router.push('/login')}
            >
              {isAuthenticated ? 'Return to Dashboard' : 'Go to Login'}
            </Button>
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
            <h1 className="text-gray-900 dark:text-[#e2f1fc]">Promo Codes</h1>
            <p className="text-neutral-500">Manage your promotional codes</p>
          </div>
          
          {/* Filter buttons */}
          <div className="flex gap-2 justify-center items-center">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-[#1177b8] hover:bg-[#0f5f95] text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange('true')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === 'true'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => handleFilterChange('false')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === 'false'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        <div>
          {isAdmin && <CreatePromoCodeForm onSuccess={refreshPromoCodes} />}
          
          {error && isAdmin && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <PromoCodeList 
            promoCodes={promoCodes} 
            isAdmin={isAdmin}
            onRefresh={refreshPromoCodes}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
    </div>
  );
}

export default PromoCodePage;
