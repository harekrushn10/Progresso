"use client"
import { useState, useEffect, useRef, use } from 'react';
import axios from 'axios';
import { ArrowLeft, Clock, AlertCircle, Loader2, AlertTriangle, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Define interfaces for type safety
interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

interface Quiz {
  quizId: string;
  title: string;
  description: string;
  totalQuestions: number;
  questions: QuizQuestion[];
  category?: string;
}

const QuizTaking = ({ params }: { params: Promise<{ quizId: string }> }) => {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(true);

  // Category related states
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCategorySelection, setShowCategorySelection] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [promoCode, setPromoCode] = useState<string>('');
  const [promoCodeError, setPromoCodeError] = useState<string>('');
  const [promoCodeSuccess, setPromoCodeSuccess] = useState<string>('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const maxTabSwitches = 3;
  const fullscreenRef = useRef<HTMLDivElement>(null);

  const { quizId } = use(params);

  // Fetch available categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/quiz/${quizId}/categories`, {
          withCredentials: true
        });

        if (response.data.success) {
          setCategories(response.data.data.categories);
          if (response.data.data.categories.length === 0) {
            setError('No categories found for this quiz');
          }
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.message || err.message
            : err instanceof Error
              ? err.message
              : 'Failed to load categories'
        );
      } finally {
        setCategoryLoading(false);
      }
    };

    if (quizId) {
      fetchCategories();
    }
  }, [quizId]);

  // Handle category selection
  const handleCategorySelect = () => {
    if (!selectedCategory) {
      alert('Please select a category to continue');
      return;
    }
    setShowCategorySelection(false);
    setLoading(true);
    fetchQuizQuestions();
  };

  // Improved fullscreen function with better error handling
  const enterFullscreen = async () => {
    try {
      if (fullscreenRef.current) {
        // Try different fullscreen APIs
        if (fullscreenRef.current.requestFullscreen) {
          await fullscreenRef.current.requestFullscreen();
        } else if ((fullscreenRef.current as any).webkitRequestFullscreen) {
          await (fullscreenRef.current as any).webkitRequestFullscreen();
        } else if ((fullscreenRef.current as any).mozRequestFullScreen) {
          await (fullscreenRef.current as any).mozRequestFullScreen();
        } else if ((fullscreenRef.current as any).msRequestFullscreen) {
          await (fullscreenRef.current as any).msRequestFullscreen();
        }
        
        // Set fullscreen state
        setIsFullscreen(true);
        console.log('Fullscreen activated successfully');
      }
    } catch (error) {
      console.error('Error entering fullscreen:', error);
      // If fullscreen fails, still proceed with the quiz
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      
      setIsFullscreen(isCurrentlyFullscreen);
      
      if (!isCurrentlyFullscreen && !showFullscreenWarning && !showCategorySelection) {
        handleTabSwitch();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [showFullscreenWarning, showCategorySelection]);

  // Monitor visibility change for tab switches
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !showFullscreenWarning && !showCategorySelection) {
        handleTabSwitch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [tabSwitchCount, showFullscreenWarning, showCategorySelection]);

  // Handle tab switch counter
  const handleTabSwitch = () => {
    const newCount = tabSwitchCount + 1;
    setTabSwitchCount(newCount);
    console.log(`Tab switch detected. Count: ${newCount}`);

    if (newCount >= maxTabSwitches) {
      // Auto-submit when max tab switches reached
      handleSubmitQuiz();
    }
  };

  // Modified start quiz function with better fullscreen handling
  const startQuiz = async () => {
    console.log('Starting quiz and entering fullscreen...');
    setShowFullscreenWarning(false);
    
    // Small delay to ensure UI updates
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Enter fullscreen
    await enterFullscreen();
  };

  // Fetch quiz questions with category filter
  const fetchQuizQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/quiz/${quizId}/take?category=${selectedCategory}`, {
        withCredentials: true
      });

      if (response.data.success) {
        setQuiz(response.data.data);
        // Initialize timer if quiz has time limit
        if (response.data.data.timeLimit) {
          setTimeLeft(response.data.data.timeLimit);
        }
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('Error fetching quiz questions:', err);
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : err instanceof Error
            ? err.message
            : 'Failed to load quiz questions'
      );
    } finally {
      setLoading(false);
    }
  };

  // Timer functionality
  useEffect(() => {
    const timer = setInterval(() => {
      // Increment elapsed time
      setTimeElapsed(prev => prev + 1);

      // Decrement time left if there's a time limit
      if (timeLeft !== null) {
        setTimeLeft(prev => {
          if (prev !== null && prev <= 1) {
            clearInterval(timer);
            // Auto-submit when time is up
            handleSubmitQuiz();
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // Submit quiz answers
  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    // Prepare answers in required format
    const answersArray = Object.entries(answers).map(([questionId, answerId]) => ({
      questionId,
      answerId
    }));

    // Debug logging
    console.log("Submitting answers:", answersArray);

    try {
      setIsSubmitting(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/quiz/${quizId}/submit`, {
        answers: answersArray,
        category: selectedCategory // Include selected category
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        console.log("Quiz submission successful:", response.data);
        console.log(answers);

        // Exit fullscreen before redirecting
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(err => console.error(err));
        }

        // Redirect to result page
        router.push(`/user/quiz-result/${quizId}?category=${selectedCategory}`);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : err instanceof Error
            ? err.message
            : 'Failed to submit quiz'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if all questions are answered
  const allQuestionsAnswered = () => {
    if (!quiz) return false;
    return quiz.questions.every(q => answers[q.id]);
  };

  // Validate and join quiz with promo code
  const handlePromoCodeSubmit = async () => {
    // If no promo code is entered, proceed directly with category selection
    if (!promoCode.trim()) {
      handleCategorySelect();
      return;
    }

    try {
      setIsValidatingPromo(true);
      setPromoCodeError('');
      setPromoCodeSuccess('');

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/promocode/join-quiz`,
        { code: promoCode.trim() },
        { withCredentials: true }
      );

      if (response.data.success) {
        setPromoCodeSuccess('Promo code applied successfully!');
        // Continue with category selection after successful promo code validation
        handleCategorySelect();
      } else {
        setPromoCodeError(response.data.message || 'Invalid promo code');
      }
    } catch (err) {
      console.error('Error validating promo code:', err);
      setPromoCodeError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to validate promo code'
          : 'Failed to validate promo code'
      );
    } finally {
      setIsValidatingPromo(false);
    }
  };

  // Category selection screen
  if (showCategorySelection) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-[#0e0e10]">
        <div className="bg-white dark:bg-[#18181a] border-[#bdbdbd] border-[1px] p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-black dark:text-white/90 mb-6 text-center">
            Quiz Setup
          </h2>

          {categoryLoading ? (
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-black dark:text-white/70">Loading categories...</p>
            </div>
          ) : (
            <>
              {/* Promo Code Section - Optional */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-black dark:text-white/90 mb-2">
                  Enter Promo Code (Optional):
                </label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    setPromoCodeError('');
                    setPromoCodeSuccess('');
                  }}
                  placeholder="Enter your promo code (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white dark:bg-[#242427] text-black dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {promoCodeError && (
                  <p className="text-red-500 text-sm mt-2">{promoCodeError}</p>
                )}
                {promoCodeSuccess && (
                  <p className="text-green-500 text-sm mt-2">{promoCodeSuccess}</p>
                )}
              </div>

              {/* Category Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-black dark:text-white/90 mb-2">
                  Choose a category:
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none bg-white dark:bg-[#242427] text-black dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {selectedCategory && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Selected:</strong> {selectedCategory}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    You will only see questions from this category
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => router.back()}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handlePromoCodeSubmit}
                  disabled={!selectedCategory || isValidatingPromo}
                  className={`flex-1 px-4 py-3 rounded-md font-medium transition flex items-center justify-center gap-2 ${selectedCategory && !isValidatingPromo
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {isValidatingPromo ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    'Start Quiz'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-[#0e0e10]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-black dark:text-white/90">Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen w-full text-black flex items-center justify-center bg-white dark:bg-[#0e0e10] ">
        <div className="bg-white dark:bg-[#18181a] p-6 border-[#bdbdbd] border-[1px] shadow-md rounded-lg text-center w-full max-w-md">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-black dark:text-white/90 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // If quiz not loaded
  if (!quiz) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br bg-white dark:bg-[#0e0e10]">
        <div className="bg-white dark:bg-[#18181a] p-6 rounded-lg text-center w-full max-w-md">
          <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-yellow-600 mb-2">Quiz Not Found</h2>
          <p className="text-black text-white/90 mb-4">The requested quiz could not be loaded.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Fullscreen warning state
  if (showFullscreenWarning) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-[#0e0e10]">
        <div className="bg-white dark:bg-[#18181a] border-[#bdbdbd] border-[1px] p-8 rounded-lg shadow-lg text-center w-full max-w-md">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-black dark:text-white/90 mb-4">Quiz Rules</h2>

          {/* Show selected category info */}
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Selected Category:</strong> {selectedCategory}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
              {quiz.totalQuestions} questions in this category
            </p>
          </div>

          <div className="text-left mb-6 space-y-3">
            <p className="text-gray-text-black dark:text-white/70">This quiz will open in fullscreen mode:</p>
            <ul className="list-disc pl-5 text-black dark:text-white/80 space-y-2">
              <li><strong>No tab switching allowed</strong> - You are permitted a maximum of <strong>3 tab switches</strong>.</li>
              <li>Exiting fullscreen will count as a tab switch.</li>
              <li>After 3 tab switches, your quiz will be automatically submitted.</li>
              <li>The remaining tab switches will be shown at the bottom of the quiz.</li>
            </ul>
          </div>
          <button
            onClick={startQuiz}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
          >
            I Understand, Start Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQuestionData = quiz.questions[currentQuestion];

  return (
    <div ref={fullscreenRef} className="h-screen w-full flex flex-col bg-white dark:bg-[#0e0e10]">
      {/* Quiz header */}
      <header className="bg-white dark:bg-[#18181a] border-[#bdbdbd] border-[1px] shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (confirm("Are you sure you want to exit the quiz? Your progress will be lost.")) {
                if (document.fullscreenElement) {
                  document.exitFullscreen().catch(err => console.error(err));
                }
                router.back();
              }
            }}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-black dark:text-white" />
          </button>
          <div>
            <h1 className="font-bold text-xl text-black dark:text-white/90">{quiz.title}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Category: {selectedCategory}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-black dark:text-white/90">
              {timeLeft !== null ? formatTime(timeLeft) : formatTime(timeElapsed)}
            </span>
          </div>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Question {currentQuestion + 1} / {quiz.totalQuestions}
          </div>
        </div>
      </header>

      {/* Quiz content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-3xl mx-auto">
          {/* Question */}
          <div className="bg-white dark:bg-[#18181a] border-[#bdbdbd] border-[1px] rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-medium text-black dark:text-white/90 mb-6">
              {currentQuestionData.text}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestionData.options.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition ${answers[currentQuestionData.id] === option.text
                    ? 'bg-blue-50 dark:bg-[#242427] border-blue-300'
                    : 'bg-gray-50 dark:bg-[#242427] border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestionData.id}`}
                    value={option.text}
                    checked={answers[currentQuestionData.id] === option.text}
                    onChange={() => handleAnswerSelect(currentQuestionData.id, option.text)}
                    className="h-5 w-5 text-blue-600"
                  />
                  <span className="text-black dark:text-white/90">{option.text}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quiz navigation */}
      <footer className="bg-white dark:bg-[#18181a] border-[#bdbdbd] border-[1px] shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 0}
            className={`px-4 py-2 rounded-md font-medium ${currentQuestion === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
          >
            Previous
          </button>

          {/* Tab switch counter */}
          <div className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${tabSwitchCount >= maxTabSwitches - 1 ? 'bg-red-100 text-red-800' :
            tabSwitchCount >= maxTabSwitches - 2 ? 'bg-amber-100 text-amber-800' :
              'bg-green-100 text-green-800'
            }`}>
            {maxTabSwitches - tabSwitchCount} tab switches remaining
          </div>
        </div>

        <div className="flex gap-3">
          {!isFullscreen && (
            <button
              onClick={enterFullscreen}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition font-medium"
            >
              Return to Fullscreen
            </button>
          )}

          {currentQuestion < quiz.questions.length - 1 ? (
            <button
              onClick={handleNextQuestion}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              disabled={!allQuestionsAnswered() || isSubmitting}
              className={`px-6 py-2 rounded-md font-medium flex items-center gap-2 ${allQuestionsAnswered() && !isSubmitting
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Quiz'
              )}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default QuizTaking;