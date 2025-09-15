"use client"

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import axios from 'axios';
import { SubAdmin } from './types';

interface SubAdminListProps {
  subAdmins: SubAdmin[];
  isAdmin: boolean;
  onRefresh: () => void;
}

const SubAdminList: React.FC<SubAdminListProps> = ({ subAdmins, isAdmin, onRefresh }) => {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this sub-admin?')) {
      setDeletingId(id);
      try {
        // Updated to use the correct endpoint for deleting sub-admins
        const response = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/sub-admin/${id}`, {
          withCredentials: true
        });
        
        if (response.data.success) {
          onRefresh(); // Refresh the list after deletion
        } else {
          alert(response.data.message || 'Failed to delete sub-admin');
        }
      } catch (error: any) {
        console.error('Failed to delete:', error);
        alert(error.response?.data?.message || 'Failed to delete sub-admin');
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (subAdmins.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-500">No sub-admins found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#18181a] dark:border-0 border-[#bdbdbd] border-[1px] rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-500">
          <thead className="bg-gray-100 dark:bg-[#18181a]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-200 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-200 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-200 uppercase tracking-wider">
                Created At
              </th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Password
              </th> */}
              {isAdmin && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[#18181a] divide-y divide-gray-700">
            {subAdmins.map((subAdmin: SubAdmin) => (
              <tr key={subAdmin.id} className="hover:bg-gray-200 dark:hover:bg-[#242427]">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-[#e2f1fc]">{subAdmin.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-[#e2f1fc]">{subAdmin.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-[#e2f1fc]">
                    {new Date(subAdmin.createdAt).toLocaleDateString()}
                  </div>
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm text-gray-500 mr-2">
                      {showPasswords[subAdmin.id] ? subAdmin.password : '••••••••'}
                    </div>
                    <button 
                      onClick={() => togglePasswordVisibility(subAdmin.id)}
                      className="text-black hover:text-gray-700 focus:outline-none"
                    >
                      {showPasswords[subAdmin.id] ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </td> */}
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(subAdmin.id)}
                      disabled={deletingId === subAdmin.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
                    >
                      {deletingId === subAdmin.id ? (
                        <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-red-600 rounded-full"></span>
                      ) : (
                        <>
                          <Trash2 size={16} className="mr-1 inline" />
                          Delete
                        </>
                      )}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubAdminList;