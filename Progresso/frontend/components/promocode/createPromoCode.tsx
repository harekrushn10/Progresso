"use client"

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

interface CreatePromoCodeFormProps {
    onSuccess: () => void;
}

interface FormData {
    code: string;
}

const CreatePromoCodeForm: React.FC<CreatePromoCodeFormProps> = ({ onSuccess }) => {
    const [formData, setFormData] = useState<FormData>({
        code: ''
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/promocode/create-promocode`, formData, {
                withCredentials: true
            });

            if (response.data.success) {
                setFormData({ code: '' });
                onSuccess();
            } else {
                setError(response.data.message || 'Failed to create promo code');
            }
        } catch (err: any) {
            console.error('Error creating promo code:', err);
            setError(err.response?.data?.message || 'Failed to create promo code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='w-full flex justify-center items-center'>
            <div className="bg-white dark:bg-[#18181a] w-1/3 p-6 rounded-lg shadow-lg mb-8 dark:border-0 border-[#bdbdbd] border-[1px]">
                <h2 className="text-xl font-semibold text-black dark:text-white/90 mb-4">Create New Promo Code</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-[#18181a] text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-black">
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-neutral-500">
                            Promo Code
                        </label>
                        <input
                            type="text"
                            id="code"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            required
                            placeholder="Enter promo code (e.g., SAVE20)"
                            className="mt-1 block w-full px-3 py-2 text-black dark:text-white/90 bg-white dark:bg-[#18181a] border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <p className="text-xs text-neutral-400 mt-1">Code will be automatically converted to uppercase</p>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black flex items-center justify-center"
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                                Creating...
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <Plus size={16} className="mr-2" />
                                Create Promo Code
                            </span>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default CreatePromoCodeForm;