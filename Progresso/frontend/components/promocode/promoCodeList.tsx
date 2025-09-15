// PromoCodeList.tsx
"use client"

import { useState } from 'react';
import { Trash2, Edit2, Eye, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { PromoCode } from './types';
import { Button } from '@/components/ui/button';

interface PromoCodeListProps {
  promoCodes: PromoCode[];
  isAdmin: boolean;
  onRefresh: () => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange: (page: number) => void;
}

const PromoCodeList: React.FC<PromoCodeListProps> = ({ 
  promoCodes, 
  isAdmin, 
  onRefresh, 
  pagination, 
  onPageChange 
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{code: string; isActive: boolean}>({
    code: '',
    isActive: true
  });
  const [updating, setUpdating] = useState<boolean>(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this promo code?')) {
      setDeletingId(id);
      try {
        const response = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/promocode/delete-promocode/${id}`, {
          withCredentials: true
        });
        
        if (response.data.success) {
          onRefresh();
        } else {
          alert(response.data.message || 'Failed to delete promo code');
        }
      } catch (error: any) {
        console.error('Failed to delete:', error);
        alert(error.response?.data?.message || 'Failed to delete promo code');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleEdit = (promoCode: PromoCode) => {
    setEditingId(promoCode.id);
    setEditForm({
      code: promoCode.code,
      isActive: promoCode.isActive
    });
  };

  const handleUpdate = async (id: string) => {
    setUpdating(true);
    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/promocode/update-promocode/${id}`, editForm, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setEditingId(null);
        onRefresh();
      } else {
        alert(response.data.message || 'Failed to update promo code');
      }
    } catch (error: any) {
      console.error('Failed to update:', error);
      alert(error.response?.data?.message || 'Failed to update promo code');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ code: '', isActive: true });
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (promoCodes.length === 0) {
    return (
      <div className="bg-white dark:bg-[#18181a] p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-500 dark:text-gray-400">No promo codes found.</p>
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
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-200 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-200 uppercase tracking-wider">
                Usage Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-200 uppercase tracking-wider">
                Created At
              </th>
              {isAdmin && (
                <th className="px-6 py-3 text-right text-xs font-medium dark:text-gray-200 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[#18181a] divide-y divide-gray-700">
            {promoCodes.map((promoCode: PromoCode) => (
              <>
                <tr key={promoCode.id} className="hover:bg-gray-200 dark:hover:bg-[#242427]">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === promoCode.id ? (
                      <input
                        type="text"
                        value={editForm.code}
                        onChange={(e) => setEditForm({...editForm, code: e.target.value.toUpperCase()})}
                        className="text-sm font-medium bg-white dark:bg-[#242427] text-gray-900 dark:text-[#e2f1fc] border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900 dark:text-[#e2f1fc] font-mono">
                        {promoCode.code}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === promoCode.id ? (
                      <select
                        value={editForm.isActive.toString()}
                        onChange={(e) => setEditForm({...editForm, isActive: e.target.value === 'true'})}
                        className="text-sm bg-white dark:bg-[#242427] text-gray-900 dark:text-[#e2f1fc] border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        promoCode.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                          : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                      }`}>
                        {promoCode.isActive ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-[#e2f1fc]">
                      {promoCode.usageCount}
                      {promoCode.payments.length > 0 && (
                        <button
                          onClick={() => toggleExpanded(promoCode.id)}
                          className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-[#e2f1fc]">
                      {new Date(promoCode.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {editingId === promoCode.id ? (
                          <>
                            <button
                              onClick={() => handleUpdate(promoCode.id)}
                              disabled={updating}
                              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none"
                            >
                              {updating ? (
                                <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                              ) : (
                                <Check size={16} />
                              )}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(promoCode)}
                              className="px-3 py-1 bg-[#1177b8] hover:bg-[#0f5f95] text-white rounded-md focus:outline-none"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(promoCode.id)}
                              disabled={deletingId === promoCode.id}
                              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
                            >
                              {deletingId === promoCode.id ? (
                                <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
                {expandedId === promoCode.id && promoCode.payments.length > 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 bg-gray-50 dark:bg-[#242427]">
                      <div className="text-sm text-gray-900 dark:text-[#e2f1fc]">
                        <h4 className="font-semibold mb-2">Payment History:</h4>
                        <div className="space-y-1">
                          {promoCode.payments.map((payment) => (
                            <div key={payment.id} className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                              <span>
                                {payment.user?.name} ({payment.user?.email}) - ${payment.amount}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded ${
                                payment.status === 'COMPLETED' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                  : payment.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                  : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                              }`}>
                                {payment.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white dark:bg-[#18181a] px-6 py-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalCount)} of {pagination.totalCount} results
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                variant="outline"
                size="sm"
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                if (pageNum > pagination.totalPages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    variant={pageNum === pagination.currentPage ? "default" : "outline"}
                    size="sm"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                variant="outline"
                size="sm"
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCodeList;