"use client"

import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, Trophy, Target, ArrowRight, CheckCircle, XCircle, BarChart3, Star, Lightbulb, Play, RefreshCw, AlertCircle, ExternalLink, Calendar, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { Sidebar } from '@/components/sidebar';

// Type definitions
interface Concept {
    id: string;
    concept: string;
    description: string;
    questionCount: number;
    totalAttempts: number;
}

interface Question {
    id: string;
    questionText: string;
    options: string[];
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

interface TestData {
    attemptId: string;
    concept: string;
    questions: Question[];
}

interface Scores {
    easy: number;
    medium: number;
    hard: number;
    total: number;
}

interface PersonalizedResource {
    title: string;
    description: string;
    type: 'VIDEO' | 'ARTICLE' | 'TUTORIAL' | 'DOCUMENTATION' | 'COURSE' | 'PRACTICE';
    url: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    estimatedTime: string;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    targetWeakness: string;
}

interface PersonalizedRecommendations {
    resources: PersonalizedResource[];
    studyPlan: {
        immediate: string;
        shortTerm: string;
        longTerm: string;
    };
    practiceAreas: string[];
}

interface TestResult {
    id: string;
    concept: string;
    performance: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';
    percentage: number;
    scores: Scores;
    completedAt: string;
    performanceMessage?: string;
    weakAreas?: string[];
    personalizedRecommendations?: PersonalizedRecommendations;
    recommendedResources?: Array<{
        title: string;
        url: string;
        type: string;
    }>;
}

interface AnswerData {
    questionId: string;
    userAnswer: string;
    timeSpent: number;
}

interface ErrorAlertProps {
    message: string;
    onClose: () => void;
}

type ViewType = 'concepts' | 'test' | 'results';

const EvaluatorDashboard = () => {
    const [activeView, setActiveView] = useState<ViewType>('concepts');
    const [concepts, setConcepts] = useState<Concept[]>([]);
    const [currentTest, setCurrentTest] = useState<TestData | null>(null);
    const [testQuestions, setTestQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeSpent, setTimeSpent] = useState<Record<string, number>>({});
    const [results, setResults] = useState<TestResult | null>(null);
    const [userResults, setUserResults] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    const [error, setError] = useState<string | null>(null);

    // API configuration
    const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1`;

    // Configure axios instance
    const apiClient = axios.create({
        baseURL: API_BASE_URL,
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // API functions
    const api = {
        getConcepts: async (): Promise<Concept[]> => {
            const response = await apiClient.get('/evaluator/concepts');
            return response.data.data;
        },

        startTest: async (concept: string): Promise<TestData> => {
            const response = await apiClient.post(`/evaluator/start/${concept}`);
            return response.data.data;
        },

        submitTest: async (attemptId: string, answersData: AnswerData[]): Promise<TestResult> => {
            const response = await apiClient.post(`/evaluator/submit/${attemptId}`, {
                answers: answersData
            });
            return response.data.data;
        },

        getUserResults: async (): Promise<TestResult[]> => {
            const response = await apiClient.get('/evaluator/results');
            return response.data.data;
        },

        getCurrentTest: async (): Promise<TestData | null> => {
            try {
                const response = await apiClient.get('/evaluator/current-test');
                return response.data.data;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    return null; // No active test
                }
                throw error;
            }
        },

        getDetailedResult: async (attemptId: string): Promise<TestResult> => {
            const response = await apiClient.get(`/evaluator/result/${attemptId}`);
            return response.data.data;
        }
    };

    useEffect(() => {
        loadConcepts();
        loadUserResults();
        checkForActiveTest();
    }, []);

    const checkForActiveTest = async (): Promise<void> => {
        try {
            const activeTest = await api.getCurrentTest();
            if (activeTest) {
                setCurrentTest(activeTest);
                setTestQuestions(activeTest.questions);
                setCurrentQuestionIndex(0);
                setAnswers({});
                setTimeSpent({});
                setQuestionStartTime(Date.now());
                setActiveView('test');
            }
        } catch (error) {
            console.error('Error checking for active test:', error);
        }
    };

    const loadConcepts = async (): Promise<void> => {
        try {
            setError(null);
            const data = await api.getConcepts();
            setConcepts(data);
        } catch (error) {
            console.error('Error loading concepts:', error);
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || 'Failed to load test concepts. Please try again.');
            } else {
                setError('Failed to load test concepts. Please try again.');
            }
        }
    };

    const loadUserResults = async (): Promise<void> => {
        try {
            const data = await api.getUserResults();
            setUserResults(data);
        } catch (error) {
            console.error('Error loading user results:', error);
            // Don't show error for this as it's not critical
        }
    };

    const startTest = async (concept: string): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            const testData = await api.startTest(concept);
            setCurrentTest(testData);
            setTestQuestions(testData.questions);
            setCurrentQuestionIndex(0);
            setAnswers({});
            setTimeSpent({});
            setQuestionStartTime(Date.now());
            setActiveView('test');
        } catch (error) {
            console.error('Error starting test:', error);
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || 'Failed to start test. Please try again.');
            } else {
                setError('Failed to start test. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const selectAnswer = (questionId: string, answer: string): void => {
        const currentTime = Date.now();
        const timeForQuestion = Math.round((currentTime - questionStartTime) / 1000);

        setAnswers(prev => ({ ...prev, [questionId]: answer }));
        setTimeSpent(prev => ({ ...prev, [questionId]: timeForQuestion }));
    };

    const nextQuestion = (): void => {
        if (currentQuestionIndex < testQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setQuestionStartTime(Date.now());
        }
    };

    const previousQuestion = (): void => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
            setQuestionStartTime(Date.now());
        }
    };

    const submitTest = async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            if (!currentTest) {
                throw new Error('No active test found');
            }

            const answersData: AnswerData[] = testQuestions.map(q => ({
                questionId: q.id,
                userAnswer: answers[q.id] || '',
                timeSpent: timeSpent[q.id] || 0
            }));

            const resultData = await api.submitTest(currentTest.attemptId, answersData);
            setResults(resultData);
            setActiveView('results');
            loadUserResults(); // Refresh user results
        } catch (error) {
            console.error('Error submitting test:', error);
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || 'Failed to submit test. Please try again.');
            } else {
                setError('Failed to submit test. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getPerformanceColor = (performance: string): string => {
        switch (performance) {
            case 'EXCELLENT': return 'text-green-600 bg-green-50 border-green-200';
            case 'GOOD': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'AVERAGE': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'NEEDS_IMPROVEMENT': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getDifficultyColor = (difficulty: string): string => {
        switch (difficulty) {
            case 'EASY': return 'bg-green-100 text-green-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
            case 'HARD': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getResourceTypeIcon = (type: string) => {
        switch (type) {
            case 'VIDEO':
                return <Play className="w-4 h-4" />;
            case 'ARTICLE':
                return <BookOpen className="w-4 h-4" />;
            case 'TUTORIAL':
                return <Lightbulb className="w-4 h-4" />;
            case 'DOCUMENTATION':
                return <BookOpen className="w-4 h-4" />;
            case 'COURSE':
                return <Trophy className="w-4 h-4" />;
            case 'PRACTICE':
                return <Target className="w-4 h-4" />;
            default:
                return <BookOpen className="w-4 h-4" />;
        }
    };

    const getResourceTypeColor = (type: string): string => {
        switch (type) {
            case 'VIDEO': return 'bg-red-100 text-red-800';
            case 'ARTICLE': return 'bg-blue-100 text-blue-800';
            case 'TUTORIAL': return 'bg-yellow-100 text-yellow-800';
            case 'DOCUMENTATION': return 'bg-gray-100 text-gray-800';
            case 'COURSE': return 'bg-purple-100 text-purple-800';
            case 'PRACTICE': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string): string => {
        switch (priority) {
            case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

    const ConceptsView = () => (
        <div className="space-y-6">
            <Sidebar />
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-[#e2f1fc] mb-4">Skill Evaluator</h1>
                <p className="text-xl text-gray-600 dark:text-neutral-400 max-w-3xl mx-auto">
                    Test your programming knowledge across different technologies. Each test contains 30 AI-generated questions
                    to evaluate your skills and identify areas for improvement.
                </p>
            </div>

            {concepts.length === 0 && !loading ? (
                <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tests Available</h3>
                    <p className="text-gray-600 mb-6">Tests are being prepared. Please check back later.</p>
                    <button
                        onClick={loadConcepts}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                    >
                        Refresh
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {concepts.map((concept) => (
                        <div key={concept.id} className="dark:bg-[#212124] dark:border-0 border-[#bdbdbd] border-[1px] rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-black dark:text-white/90 truncate pr-4 capitalize">
                                            {concept.concept.replace('-', ' ')}
                                        </h3>
                                        <p className="text-neutral-400 line-clamp-2">
                                            {concept.description}
                                        </p>
                                    </div>
                                    <div className="ml-4">
                                        <Target className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" />
                                        <span>{concept.questionCount} Questions</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 mb-4">
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">10 Easy</span>
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">10 Medium</span>
                                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">10 Hard</span>
                                </div>

                                <button
                                    onClick={() => startTest(concept.concept)}
                                    disabled={loading}
                                    className="w-full bg-[#1177b8] hover:bg-[#0f5f95] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Generating Questions...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4" />
                                            Start Test
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {userResults.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-black dark:text-white/90 mb-6">Your Recent Results</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userResults.slice(0, 6).map((result) => (
                            <div key={result.id} className="dark:bg-[#212124] dark:border-0 border-[#bdbdbd] border-[1px] rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-black dark:text-white/90 capitalize">{result.concept.replace('-', ' ')}</h4>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPerformanceColor(result.performance)}`}>
                                        {result.performance.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-neutral-400 line-clamp-2 mb-2">
                                    <span>Score: {result.scores.total}</span>
                                    <span className="font-semibold text-lg text-gray-900 dark:text-white">{result.percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${result.percentage}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    {new Date(result.completedAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => setActiveView('results')}
                        className="mt-4 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                    >
                        View All Results <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );

    const TestView = () => {
        const currentQuestion = testQuestions[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / testQuestions.length) * 100;
        const answeredCount = Object.keys(answers).length;

        if (!currentQuestion || !currentTest) return null;

        return (
            <div className="max-w-4xl mx-auto">
                <div className="dark:bg-[#1d1d1f] dark:border-0 border-[#bdbdbd] border-[1px] rounded-xl shadow-md">
                    {/* Header */}
                    <div className="dark:bg-[#434348] text-black dark:text-white/90 p-6 rounded-t-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold capitalize">{currentTest.concept.replace('-', ' ')} Test</h2>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
                                {currentQuestion.difficulty}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-sm opacity-90">
                            <span>Question {currentQuestionIndex + 1} of {testQuestions.length}</span>
                            <span>Answered: {answeredCount}/{testQuestions.length}</span>
                        </div>

                        <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-3">
                            <div
                                className="bg-white h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Question */}
                    <div className="p-8">
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-black dark:text-white/90 mb-6 leading-relaxed">
                                {currentQuestion.questionText}
                            </h3>

                            <div className="space-y-3">
                                {currentQuestion.options.map((option: string, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => selectAnswer(currentQuestion.id, option)}
                                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${answers[currentQuestion.id] === option
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-black dark:text-white/90'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <span className={`w-6 h-6 rounded-full border-2 m-3 flex justify-center items-center text-sm font-medium ${answers[currentQuestion.id] === option
                                                ? 'border-blue-500 text-blue-900 dark:text-blue-100 bg-blue-100 dark:bg-blue-800'
                                                : 'border-gray-400 dark:border-gray-500 text-gray-600 dark:text-gray-300'
                                                }`}>
                                                {String.fromCharCode(65 + index)}
                                            </span>
                                            <span className={`flex-1 ${answers[currentQuestion.id] === option
                                                ? 'text-blue-900 dark:text-blue-100 font-medium'
                                                : 'text-black dark:text-white/90'
                                                }`}>
                                                {option}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                            <button
                                onClick={previousQuestion}
                                disabled={currentQuestionIndex === 0}
                                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                ← Previous
                            </button>

                            <div className="flex gap-2 max-w-md overflow-x-auto">
                                {testQuestions.map((_, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setCurrentQuestionIndex(index);
                                            setQuestionStartTime(Date.now());
                                        }}
                                        className={`w-8 h-8 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${index === currentQuestionIndex
                                            ? 'bg-blue-600 text-white'
                                            : answers[testQuestions[index].id]
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>

                            {currentQuestionIndex === testQuestions.length - 1 ? (
                                <button
                                    onClick={submitTest}
                                    disabled={answeredCount < testQuestions.length || loading}
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Submit Test
                                            <CheckCircle className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={nextQuestion}
                                    disabled={currentQuestionIndex === testQuestions.length - 1}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    Next →
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ResultsView = () => {
        if (!results) return null;

        return (
            <div className="max-w-4xl mx-auto">
                <Sidebar />
                <div className="dark:bg-[#18181a] rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="dark:bg-[#2a2a2d] text-black dark:text-white p-8 text-center">
                        <div className="mb-4">
                            {results.performance === 'EXCELLENT' ? (
                                <Star className="w-16 h-16 mx-auto text-yellow-300" />
                            ) : results.performance === 'GOOD' ? (
                                <Trophy className="w-16 h-16 mx-auto text-yellow-300" />
                            ) : results.performance === 'AVERAGE' ? (
                                <Target className="w-16 h-16 mx-auto text-white" />
                            ) : (
                                <Lightbulb className="w-16 h-16 mx-auto text-white" />
                            )}
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Test Completed!</h2>
                        <p className="text-xl opacity-90">{results.percentage}% Score</p>
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium mt-4 ${results.performance === 'EXCELLENT' ? 'bg-green-500' :
                            results.performance === 'GOOD' ? 'bg-blue-500' :
                                results.performance === 'AVERAGE' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}>
                            {results.performance.replace('_', ' ')}
                        </span>
                        {results.performanceMessage && (
                            <p className="text-lg opacity-90 mt-4 max-w-2xl mx-auto">
                                {results.performanceMessage}
                            </p>
                        )}
                    </div>

                    {/* Scores Breakdown */}
                    <div className="p-8">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Score Breakdown</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="text-2xl font-bold text-green-600">{results.scores.easy}</div>
                                <div className="text-sm text-green-700 dark:text-green-300 font-medium">Easy</div>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <div className="text-2xl font-bold text-yellow-600">{results.scores.medium}</div>
                                <div className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Medium</div>
                            </div>
                            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                <div className="text-2xl font-bold text-red-600">{results.scores.hard}</div>
                                <div className="text-sm text-red-700 dark:text-red-300 font-medium">Hard</div>
                            </div>
                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="text-2xl font-bold text-blue-600">{results.scores.total}</div>
                                <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total</div>
                            </div>
                        </div>

                        {/* Weak Areas */}
                        {results.weakAreas && results.weakAreas.length > 0 && (
                            <div className="mb-8">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Areas for Improvement</h4>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {results.weakAreas.map((area: string, index: number) => (
                                        <span key={index} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-sm font-medium rounded-full">
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Personalized Study Plan */}
                        {results.personalizedRecommendations?.studyPlan && (
                            <div className="mb-8">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Personalized Study Plan
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                        <h5 className="font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            Immediate Focus
                                        </h5>
                                        <p className="text-sm text-red-700 dark:text-red-400">
                                            {results.personalizedRecommendations.studyPlan.immediate}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                        <h5 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Short Term (1 Week)
                                        </h5>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                            {results.personalizedRecommendations.studyPlan.shortTerm}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                        <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" />
                                            Long Term (1 Month)
                                        </h5>
                                        <p className="text-sm text-green-700 dark:text-green-400">
                                            {results.personalizedRecommendations.studyPlan.longTerm}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Practice Areas */}
                        {results.personalizedRecommendations?.practiceAreas && results.personalizedRecommendations.practiceAreas.length > 0 && (
                            <div className="mb-8">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5" />
                                    Key Practice Areas
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {results.personalizedRecommendations.practiceAreas.map((area: string, index: number) => (
                                        <span key={index} className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-lg border border-blue-200 dark:border-blue-800">
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Personalized Learning Resources */}
                        {results.personalizedRecommendations?.resources && results.personalizedRecommendations.resources.length > 0 && (
                            <div className="mb-8">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5" />
                                    Personalized Learning Resources
                                </h4>
                                <div className="space-y-4">
                                    {results.personalizedRecommendations.resources
                                        .sort((a, b) => {
                                            const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
                                            return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
                                        })
                                        .map((resource: PersonalizedResource, index: number) => (
                                        <div key={index} className="p-4 bg-gray-50 dark:bg-[#232328] hover:bg-gray-100 dark:hover:bg-[#1f1f23] rounded-lg border border-gray-200 dark:border-0 transition-colors group">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getResourceTypeColor(resource.type)}`}>
                                                            {getResourceTypeIcon(resource.type)}
                                                            {resource.type}
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(resource.priority)}`}>
                                                            {resource.priority} Priority
                                                        </span>
                                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-medium rounded-full">
                                                            {resource.difficulty}
                                                        </span>
                                                    </div>
                                                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {resource.title}
                                                    </h5>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                                        {resource.description}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {resource.estimatedTime}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Target className="w-3 h-3" />
                                                            {resource.targetWeakness}
                                                        </span>
                                                    </div>
                                                </div>
                                                <a
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-4 p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 flex items-center gap-1"
                                                    title={`Open ${resource.title}`}
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    <span className="text-sm font-medium">Open</span>
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Fallback to static resources if no personalized ones */}
                        {(!results.personalizedRecommendations || !results.personalizedRecommendations.resources) && results.recommendedResources && results.recommendedResources.length > 0 && (
                            <div className="mb-8">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recommended Learning Resources</h4>
                                <div className="space-y-3">
                                    {results.recommendedResources.map((resource, index: number) => (
                                        <a
                                            key={index}
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h5 className="font-medium text-gray-900 dark:text-white">{resource.title}</h5>
                                                    <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">{resource.type.replace('_', ' ')}</span>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-gray-400" />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => {
                                    setActiveView('concepts');
                                    setResults(null);
                                    setCurrentTest(null);
                                }}
                                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                            >
                                Back to Tests
                            </button>
                            {currentTest && (
                                <button
                                    onClick={() => {
                                        setResults(null);
                                        startTest(currentTest.concept);
                                    }}
                                    disabled={loading}
                                    className="px-6 py-3 bg-[#1177b8] hover:bg-[#0f5f95] text-white rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Retake Test
                                </button>
                            )}
                            <button
                                onClick={() => setActiveView('results')}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                            >
                                <BarChart3 className="w-4 h-4" />
                                View All Results
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const AllResultsView = () => (
        <div className="space-y-6">
            <Sidebar />
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-black dark:text-white/90">Your Test Results</h1>
                <button
                    onClick={() => setActiveView('concepts')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                    Take New Test
                </button>
            </div>

            {userResults.length === 0 ? (
                <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Yet</h3>
                    <p className="text-gray-600 mb-6">Take your first test to see results here!</p>
                    <button
                        onClick={() => setActiveView('concepts')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                    >
                        Browse Tests
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userResults.map((result) => (
                        <div key={result.id} className="dark:bg-[#212124] dark:border-0 border-[#bdbdbd] border-[1px] rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-black dark:text-white/90 truncate pr-4 capitalize">
                                        {result.concept.replace('-', ' ')}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPerformanceColor(result.performance)}`}>
                                        {result.performance.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-neutral-400 line-clamp-2">Overall Score</span>
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{result.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                                            style={{ width: `${result.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <div className="text-lg font-bold text-green-600">{result.scores.easy}</div>
                                        <div className="text-xs text-green-700 dark:text-green-300">Easy</div>
                                    </div>
                                    <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                        <div className="text-lg font-bold text-yellow-600">{result.scores.medium}</div>
                                        <div className="text-xs text-yellow-700 dark:text-yellow-300">Medium</div>
                                    </div>
                                    <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <div className="text-lg font-bold text-red-600">{result.scores.hard}</div>
                                        <div className="text-xs text-red-700 dark:text-red-300">Hard</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span>{new Date(result.completedAt).toLocaleDateString()}</span>
                                    </div>
                                    <span className="font-medium">{result.scores.total}</span>
                                </div>

                                <button
                                    onClick={() => startTest(result.concept)}
                                    disabled={loading}
                                    className="w-full px-4 py-2 bg-[#1177b8] hover:bg-[#0f5f95] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Retake Test
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-white dark:bg-[#0e0e10] p-4">
            {/* Error Alert */}
            {error && (
                <ErrorAlert
                    message={error}
                    onClose={() => setError(null)}
                />
            )}

            {/* Navigation */}
            <div className="max-w-7xl mx-auto mb-8">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveView('concepts')}
                        className={`pb-4 font-medium border-b-2 transition-colors ${activeView === 'concepts'
                            ? 'text-blue-600 border-blue-600'
                            : 'text-gray-500 border-transparent hover:text-gray-700'
                            }`}
                    >
                        Available Tests
                    </button>
                    <button
                        onClick={() => setActiveView('results')}
                        className={`pb-4 font-medium border-b-2 transition-colors ${activeView === 'results'
                            ? 'text-blue-600 border-blue-600'
                            : 'text-gray-500 border-transparent hover:text-gray-700'
                            }`}
                    >
                        My Results ({userResults.length})
                    </button>
                </nav>
            </div>

            {/* Content */}
            <div className="ml-64 px-8">
                <div className="max-w-7xl mx-auto">
                    {activeView === 'concepts' && <ConceptsView />}
                    {activeView === 'test' && <TestView />}
                    {activeView === 'results' && results && <ResultsView />}
                    {activeView === 'results' && !results && <AllResultsView />}
                </div>
            </div>

            {/* Loading Overlay */}
            {loading && activeView === 'concepts' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 text-center max-w-md mx-4">
                        <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Generating Questions</h3>
                        <p className="text-gray-600">Our AI is creating personalized questions for your test. This may take a moment...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EvaluatorDashboard;