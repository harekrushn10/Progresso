"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, Users, BookOpen, Search, ChevronDown, ExternalLink, ArrowLeft, PlusCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { Sidebar } from '@/components/admin/sidebar';

// Type Definitions
interface Student {
    id: string;
    name: string;
    email: string;
}

interface TestResult {
    id: string;
    student: Student;
    concept: string;
    scores: {
        easy: string;
        medium: string;
        hard: string;
        total: string;
    };
    percentage: number;
    performance: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';
    weakAreas: string[];
    completedAt: string;
}

interface AnalyticsData {
    overview: {
        totalAttempts: number;
        completedAttempts: number;
        completionRate: number;
    };
    performanceDistribution: Array<{
        performance: string;
        count: number;
    }>;
    conceptStatistics: Array<{
        concept: string;
        totalAttempts: number;
        averagePercentage: number;
    }>;
    topStudents: Array<{
        name: string;
        email: string;
        concept: string;
        percentage: number;
        completedAt: string;
    }>;
}

interface DetailedResult extends TestResult {
    detailedAnalysis: Array<{
        questionText: string;
        userAnswer: string;
        correctAnswer: string;
        isCorrect: boolean;
        difficulty: string;
        explanation: string;
    }>;
    conceptPerformance: Record<string, { correct: number; total: number }>;
    difficultyPerformance: {
        EASY: { correct: number; total: number };
        MEDIUM: { correct: number; total: number };
        HARD: { correct: number; total: number };
    };
}

interface ErrorAlertProps {
    message: string;
    onClose: () => void;
}

type AdminViewType = 'dashboard' | 'results' | 'resources';

const AdminEvaluatorDashboard = () => {
    const [activeView, setActiveView] = useState<AdminViewType>('dashboard');
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [results, setResults] = useState<TestResult[]>([]);
    const [selectedResult, setSelectedResult] = useState<DetailedResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [conceptFilter, setConceptFilter] = useState('all');
    const [performanceFilter, setPerformanceFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // API configuration
    const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1`;

    const apiClient = axios.create({
        baseURL: API_BASE_URL,
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // API functions
    const api = {
        getAnalytics: async (): Promise<AnalyticsData> => {
            const response = await apiClient.get('/evaluator/admin/analytics');
            return response.data.data;
        },
        getResults: async (page = 1, limit = 10, concept = 'all', performance = 'all'): Promise<{ data: TestResult[], totalPages: number }> => {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
            });
            if (concept !== 'all') params.append('concept', concept);
            if (performance !== 'all') params.append('performance', performance);

            const response = await apiClient.get(`/evaluator/admin/results?${params.toString()}`);
            return {
                data: response.data.data,
                totalPages: response.data.pagination.totalPages,
            };
        },
        getDetailedResult: async (attemptId: string): Promise<DetailedResult> => {
            const response = await apiClient.get(`/evaluator/admin/result/${attemptId}`);
            return response.data.data;
        },
        addResource: async (data: any): Promise<any> => {
            const response = await apiClient.post('/evaluator/admin/resources', data);
            return response.data.data;
        }
    };

    useEffect(() => {
        if (activeView === 'dashboard') {
            loadAnalytics();
        } else if (activeView === 'results') {
            loadResults();
        }
    }, [activeView, currentPage]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.getAnalytics();
            setAnalytics(data);
        } catch (err) {
            handleApiError(err, 'Failed to load analytics data.');
        } finally {
            setLoading(false);
        }
    };

    const loadResults = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data, totalPages } = await api.getResults(currentPage, 10, conceptFilter, performanceFilter);
            setResults(data);
            setTotalPages(totalPages);
        } catch (err) {
            handleApiError(err, 'Failed to load student results.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchAndFilter = () => {
        setCurrentPage(1); // Reset to first page
        loadResults();
    };

    const handleViewDetails = async (attemptId: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.getDetailedResult(attemptId);
            setSelectedResult(data);
        } catch (err) {
            handleApiError(err, 'Failed to load detailed result.');
        } finally {
            setLoading(false);
        }
    };

    const handleApiError = (err: unknown, defaultMessage: string) => {
        console.error(err);
        if (axios.isAxiosError(err)) {
            setError(err.response?.data?.message || defaultMessage);
        } else {
            setError(defaultMessage);
        }
    };

    const filteredResults = useMemo(() => {
        return results.filter(result =>
            result.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.student.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [results, searchTerm]);

    const getPerformanceColor = (performance: string) => {
        switch (performance) {
            case 'EXCELLENT': return 'text-green-600 bg-green-50 border-green-200';
            case 'GOOD': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'AVERAGE': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'NEEDS_IMPROVEMENT': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose }) => (
        <div className="fixed top-4 right-4 max-w-md bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50">
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-800 mb-1">Error</h4>
                    <p className="text-sm text-red-600">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-red-400 hover:text-red-600 transition-colors"
                >
                    <XCircle className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    const AnalyticsView = () => (
        <div className="space-y-8 ">
            <h1 className="text-3xl font-bold text-black dark:text-white">Student Performance</h1>
            {loading && !analytics ? <p>Loading analytics...</p> : analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Overview Cards */}
                    <div className="dark:bg-[#18181a] dark:border-0 border-[#bdbdbd] border-[1px] rounded-xl shadow-md p-6">
                        <h3 className="font-semibold text-black dark:text-white/90 mb-2">Total Attempts</h3>
                        <p className="text-4xl font-bold text-blue-600">{analytics.overview.totalAttempts}</p>
                    </div>
                    <div className="dark:bg-[#18181a] dark:border-0 border-[#bdbdbd] border-[1px] rounded-xl shadow-md p-6">
                        <h3 className="font-semibold text-black dark:text-white/90 mb-2">Completed Tests</h3>
                        <p className="text-4xl font-bold text-green-600">{analytics.overview.completedAttempts}</p>
                    </div>
                    <div className="dark:bg-[#18181a] dark:border-0 border-[#bdbdbd] border-[1px] rounded-xl shadow-md p-6">
                        <h3 className="font-semibold text-black dark:text-white/90 mb-2">Completion Rate</h3>
                        <p className="text-4xl font-bold text-purple-600">{analytics.overview.completionRate}%</p>
                    </div>

                    {/* Performance Distribution */}
                    <div className="md:col-span-3 dark:bg-[#18181a] dark:border-0 border-[#bdbdbd] border-[1px] rounded-xl shadow-md p-6">
                        <h3 className="font-semibold text-black dark:text-white/90 mb-4 text-center">Performance Distribution</h3>
                        <div className="flex gap-4 justify-center items-center">
                            {analytics.performanceDistribution.map(p => (
                                <div key={p.performance} className="text-center">
                                    <p className={`text-2xl font-bold ${getPerformanceColor(p.performance).split(' ')[0]}`}>{p.count}</p>
                                    <p className="text-sm text-black dark:text-white/50 capitalize">{p.performance.replace('_', ' ')}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Students */}
                    <div className="lg:col-span-3 dark:bg-[#18181a] dark:border-0 border-[#bdbdbd] border-[1px] rounded-xl shadow-md p-8">
                        <h3 className="font-semibold text-base text-black dark:text-white/90 mb-4">Top Performing Students</h3>
                        <div className="space-y-3">
                            {analytics.topStudents.map((student, i) => (
                                <div key={i} className="flex justify-between items-center text-base">
                                    <p className="font-medium text-black dark:text-white/90">{student.name}</p>
                                    <p className="text-black dark:text-white/90">{student.concept}</p>
                                    <p className="font-bold text-green-600">{student.percentage}%</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const ResultsView = () => (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-black dark:text-white/90">Student Results</h1>

            {/* Filters and Search */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by student name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                {/* Add dropdowns for concept and performance if concepts are dynamic */}
            </div>

            {/* Results Table */}
            <div className="bg-white dark:bg-[#18181a] rounded-xl shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-black dark:text-white/90">
                    <thead className="text-xs text-black dark:text-white/90 uppercase bg-gray-50 dark:bg-[#2c2c30]">
                        <tr>
                            <th scope="col" className="px-6 py-3">Student</th>
                            <th scope="col" className="px-6 py-3">Concept</th>
                            <th scope="col" className="px-6 py-3">Score</th>
                            <th scope="col" className="px-6 py-3">Performance</th>
                            <th scope="col" className="px-6 py-3">Completed At</th>
                            <th scope="col" className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="text-center p-6">Loading results...</td></tr>
                        ) : filteredResults.length === 0 ? (
                            <tr><td colSpan={6} className="text-center p-6">No results found for the current filters.</td></tr>
                        ) : (
                            filteredResults.map(result => (
                                <tr key={result.id} className="dark:bg-[#18181a]">
                                    <td className="px-6 py-4 font-medium text-black dark:text-white/90">
                                        {result.student.name}<br />
                                        <span className="text-black dark:text-white/90 font-normal">{result.student.email}</span>
                                    </td>
                                    <td className="px-6 py-4 capitalize">{result.concept}</td>
                                    <td className="px-6 py-4 font-semibold text-black dark:text-white/90">{result.percentage}%</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPerformanceColor(result.performance)}`}>
                                            {result.performance.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{new Date(result.completedAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleViewDetails(result.id)}
                                            className="font-medium text-blue-600 hover:underline"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50">Previous</button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50">Next</button>
                </div>
            )}
        </div>
    );

    const ResourceView = () => {
    const [formData, setFormData] = useState({
        concept: '',
        subConcept: '',
        title: '',
        description: '',
        type: 'YOUTUBE_VIDEO',
        url: '',
        difficulty: 'EASY'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.addResource(formData);
            alert('Resource added successfully!');
            // Reset form
            setFormData({
                concept: '', subConcept: '', title: '', description: '',
                type: 'YOUTUBE_VIDEO', url: '', difficulty: 'EASY'
            });
        } catch (err) {
            handleApiError(err, 'Failed to add resource.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="h-full min-h-screen flex flex-col w-full overflow-hidden bg-white dark:bg-[#0e0e10]">
            <main className="p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e2f1fc]">Manage Learning Resources</h1>
                        <p className="text-neutral-600">Add new educational resources to the platform</p>
                    </div>
                </div>

                <div className="dark:bg-[#18181a] dark:border-0 border-[#bdbdbd] border-[1px] shadow-lg rounded-lg p-6 space-y-6">
                    <div className="space-y-1 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-[#e2f1fc]">Add New Resource</h2>
                        <p className="text-sm text-neutral-600">Fill in the details to add a new learning resource</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Concept and Sub-concept fields */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Concept *
                                </label>
                                <input 
                                    type="text" 
                                    name="concept" 
                                    value={formData.concept} 
                                    onChange={handleChange} 
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2a2a2e] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" 
                                    placeholder="Enter main concept"
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Sub-concept
                                </label>
                                <input 
                                    type="text" 
                                    name="subConcept" 
                                    value={formData.subConcept} 
                                    onChange={handleChange} 
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2a2a2e] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    placeholder="Enter sub-concept (optional)"
                                />
                            </div>
                        </div>

                        {/* Title and URL fields */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Title *
                                </label>
                                <input 
                                    type="text" 
                                    name="title" 
                                    value={formData.title} 
                                    onChange={handleChange} 
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2a2a2e] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" 
                                    placeholder="Enter resource title"
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    URL *
                                </label>
                                <input 
                                    type="url" 
                                    name="url" 
                                    value={formData.url} 
                                    onChange={handleChange} 
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2a2a2e] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" 
                                    placeholder="https://example.com"
                                    required 
                                />
                            </div>
                        </div>

                        {/* Description field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2a2a2e] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-vertical"
                                placeholder="Enter resource description (optional)"
                            />
                        </div>

                        {/* Type and Difficulty fields */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Resource Type
                                </label>
                                <select 
                                    name="type" 
                                    value={formData.type} 
                                    onChange={handleChange} 
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2a2a2e] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                                >
                                    <option value="YOUTUBE_VIDEO">YouTube Video</option>
                                    <option value="DOCUMENTATION">Documentation</option>
                                    <option value="TUTORIAL">Tutorial</option>
                                    <option value="ARTICLE">Article</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Difficulty Level
                                </label>
                                <select 
                                    name="difficulty" 
                                    value={formData.difficulty} 
                                    onChange={handleChange} 
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2a2a2e] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                                >
                                    <option value="EASY">Easy</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HARD">Hard</option>
                                </select>
                            </div>
                        </div>

                        {/* Submit button */}
                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add Resource
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

    const DetailedResultModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <div className="bg-gray-50 dark:bg-[#18181a] rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-[#323236] p-4 border-b z-10 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-black dark:text-white/90">Test Result Details</h2>
                        <p className="text-sm text-black dark:text-white/50">{selectedResult?.student.name} - {selectedResult?.concept}</p>
                    </div>
                    <button onClick={() => setSelectedResult(null)} className="text-black dark:text-white/90 hover:text-gray-800">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>
                {loading ? <p className="p-8 text-center text-black dark:text-white/90">Loading details...</p> : selectedResult && (
                    <div className="p-6 space-y-6">
                        {/* Performance Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-white dark:bg-[#2a2a2e] rounded-lg">
                                <div className="text-3xl font-bold text-blue-600">{selectedResult.percentage}%</div>
                                <div className="text-sm text-black dark:text-white/50 font-medium">Overall Score</div>
                            </div>
                            {/* Difficulty performance... */}
                            {Object.entries(selectedResult.difficultyPerformance).map(([key, value]) => (
                                <div key={key} className="text-center p-4 bg-white dark:bg-[#2a2a2e] rounded-lg border">
                                    <div className="text-2xl font-bold text-black dark:text-white/90">{value.correct}/{value.total}</div>
                                    <div className="text-sm text-black dark:text-white/50 font-medium capitalize">{key.toLowerCase()}</div>
                                </div>
                            ))}
                        </div>

                        {/* Question by Question Analysis */}
                        <div>
                            <h3 className="text-lg font-semibold text-black dark:text-white/90 mb-4">Detailed Analysis</h3>
                            <div className="space-y-3">
                                {selectedResult.detailedAnalysis.map((item, i) => (
                                    <div key={i} className="bg-white dark:bg-[#2a2a2e] p-4 rounded-lg border">
                                        <p className="font-medium text-black dark:text-white/70 mb-2">{i + 1}. {item.questionText}</p>
                                        <p className={`text-sm ${item.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                            Student answer: {item.userAnswer || 'Not answered'} {item.isCorrect ? '(Correct)' : ''}
                                        </p>
                                        {!item.isCorrect && <p className="text-sm text-green-700">Correct answer: {item.correctAnswer}</p>}
                                        {item.explanation && <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">Explanation: {item.explanation}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white dark:bg-[#0e0e10] flex">
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main content area */}
            <div className="flex-1 ml-64">
                {error && (
                    <ErrorAlert
                        message={error}
                        onClose={() => setError(null)}
                    />
                )}

                <div className="p-4 sm:p-6 lg:p-8">
                    {/* Navigation tabs */}
                    <nav className="flex space-x-8 border-b mb-8">
                        <button
                            onClick={() => setActiveView('dashboard')}
                            className={`py-4 px-1 font-medium border-b-2 transition-colors ${activeView === 'dashboard' ? 'text-blue-600 border-blue-600' : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            <BarChart3 className="w-5 h-5 inline-block mr-2" />
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveView('results')}
                            className={`py-4 px-1 font-medium border-b-2 transition-colors ${activeView === 'results' ? 'text-blue-600 border-blue-600' : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            <Users className="w-5 h-5 inline-block mr-2" />
                            Results
                        </button>
                        <button
                            onClick={() => setActiveView('resources')}
                            className={`py-4 px-1 font-medium border-b-2 transition-colors ${activeView === 'resources' ? 'text-blue-600 border-blue-600' : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            <BookOpen className="w-5 h-5 inline-block mr-2" />
                            Resources
                        </button>
                    </nav>

                    {/* Centered main content */}
                    <main className="flex justify-center">
                        <div className="w-full max-w-6xl">
                            {activeView === 'dashboard' && <AnalyticsView />}
                            {activeView === 'results' && <ResultsView />}
                            {activeView === 'resources' && <ResourceView />}
                        </div>
                    </main>
                </div>
            </div>

            {selectedResult && <DetailedResultModal />}
        </div>
    );
};

export default AdminEvaluatorDashboard;