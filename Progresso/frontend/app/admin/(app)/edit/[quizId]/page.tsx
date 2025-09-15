"use client"
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Save, Upload, FileSpreadsheet, ShieldAlert, Calendar, Loader2 } from 'lucide-react';
import { Sidebar } from '@/components/admin/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';

interface QuizQuestion {
  text: string;
  correctAnswer: string;
  options: { text: string }[];
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  price: number | null;
  startDate: string | null;
  endDate: string | null;
  questions: QuizQuestion[];
}

interface DashboardResponse {
  user: {
    role: string;
  }
}

const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return '';
  
  // Convert to local ISO string and format for datetime-local input
  const date = new Date(dateString);
  // Format: YYYY-MM-DDThh:mm
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
    .toISOString()
    .slice(0, 16);
};

const EditQuiz = () => {
  const params = useParams();
  const quizId = params.quizId as string;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [fileName, setFileName] = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  // Check if user is authorized (admin only)
  const checkAdminStatus = async () => {
    try {
      // Use the dashboard endpoint to check if user is authenticated and their role
      const response = await axios.get<DashboardResponse>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/dashboard`, {
        withCredentials: true
      });
      
      if (response.data && response.data.user) {
        // Set admin status based on user role
        const isUserAdmin = response.data.user.role === 'ADMIN';
        setIsAdmin(isUserAdmin);
        
        // If not admin, redirect to dashboard or another appropriate page
        if (!isUserAdmin) {
          toast.error('Access denied. Only administrators can edit quizzes.');
          router.push('/admin/dashboard');
        } else {
          // Fetch quiz data if user is admin
          fetchQuizData();
        }
      }
    } catch (err) { 
      console.error('Authentication error:', err);
      toast.error('Authentication failed. Please login again.');
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuizData = async () => {
    setIsFetching(true);
    try {
      const response = await axios.get<{success: boolean, data: QuizData}>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/quiz/${quizId}`,
        { withCredentials: true }
      );
      
      if (response.data.success && response.data.data) {
        const quiz = response.data.data;
        setTitle(quiz.title);
        setDescription(quiz.description);
        setPrice(quiz.price?.toString() || '');
        setStartDate(formatDateForInput(quiz.startDate));
        setEndDate(formatDateForInput(quiz.endDate));
        setQuestions(quiz.questions);
      } else {
        toast.error('Failed to fetch quiz data');
        router.push('/admin/quizzes');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Failed to load quiz data. Please try again.');
      router.push('/admin/quizzes');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target?.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert Excel to JSON
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      // Transform data to match our quiz question structure
      const parsedQuestions: QuizQuestion[] = data.map((row: any) => ({
        text: row['Question Text'],
        correctAnswer: row['Correct Answer'],
        options: [
          { text: row['Option 1'] },
          { text: row['Option 2'] },
          { text: row['Option 3'] },
          { text: row['Option 4'] }
        ]
      }));

      setQuestions(parsedQuestions);
    };
    reader.readAsBinaryString(file);
  };

  const validateDates = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        toast.error('End date must be after start date');
        return false;
      }
    }
    return true;
  };

  const handleUpdateQuiz = async () => {
    // Validate inputs
    if (!title || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate dates if both are provided
    if (!validateDates()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Determine if we're replacing questions
      const operation = fileName ? 'replace' : undefined;
      
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/quiz/${quizId}`,
        {
          title,
          description,
          price: parseFloat(price) || 0,
          startDate: startDate || null,
          endDate: endDate || null,
          ...(fileName && { questions, operation })
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
  
      if (response.data.success) {
        toast.success('Quiz updated successfully!');
        setFileName('');
        router.back();
      } else {
        toast.error(response.data.message || 'Failed to update quiz');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error updating quiz:', error.response?.data);
        toast.error(
          error.response?.data?.message || 
          'An error occurred while updating the quiz'
        );
      } else {
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadExcelTemplate = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Question Text', 'Correct Answer', 'Option 1', 'Option 2', 'Option 3', 'Option 4'],
      ['Sample Question', 'Correct Option', 'Option A', 'Option B', 'Option C', 'Option D']
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Quiz Questions');

    XLSX.writeFile(workbook, 'quiz_template.xlsx');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full min-h-screen flex items-center bg-white dark:bg-[#0e0e10] justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  // Access denied state (should redirect, but just in case)
  if (!isAdmin) {
    return (
      <div className="h-full min-h-screen flex flex-col w-full overflow-hidden bg-white dark:bg-[#0e0e10]">
        <div className='hidden md:flex'>
          <Sidebar />
        </div>
        <main className="md:ml-64 p-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90 mb-2">Access Denied</h1>
            <p className="text-neutral-500 mb-6">You don't have permission to access this page. Only administrators can edit quizzes.</p>
            <Button onClick={() => router.push('/admin/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Fetching quiz data
  if (isFetching) {
    return (
      <div className="h-full min-h-screen flex flex-col w-full overflow-hidden bg-white dark:bg-[#0e0e10]">
        <div className='hidden md:flex'>
          <Sidebar />
        </div>
        <main className="md:ml-64 p-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <Loader2 className="w-16 h-16 text-blue-500 mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e2f1fc] mb-2">Loading Quiz Data</h1>
            <p className="text-neutral-500">Please wait while we fetch the quiz information...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e2f1fc]">Edit Quiz</h1>
            <p className="text-neutral-600">Update quiz details and questions</p>
          </div>
        </div>

        <div className="dark:bg-[#18181a] dark:border-0 border-[#bdbdbd] border-[1px] shadow-lg rounded-lg p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter quiz title"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="price">Price (Optional)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter quiz price"
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter quiz description"
              className="mt-2"
            />
          </div>

          {/* Date fields */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="startDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date (Optional)
              </Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                End Date (Optional)
              </Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="mb-2">Current Questions</Label>
              <div className="bg-gray-50 dark:bg-[#18181a] p-4 rounded-md">
                <p className="text-sm text-gray-600">{questions.length} questions in this quiz</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <Label className="mb-2">Replace Questions (Optional)</Label>
              <p className="text-sm text-gray-600 mb-3">Upload a new Excel file to replace all existing questions</p>
              
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={downloadExcelTemplate}
                  className="flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Download Template
                </Button>
                
                <div className="relative">
                  <input 
                    type="file" 
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {fileName ? `${fileName}` : 'Upload Excel'}
                  </Button>
                </div>
              </div>

              {fileName && (
                <div className="mt-4">
                  <p className="text-sm text-amber-600 font-medium">
                    Warning: Uploading a new file will replace all existing questions!
                  </p>
                  <p className="text-sm text-gray-600">
                    {questions.length} questions loaded from file
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleUpdateQuiz}
              disabled={!title || !description || isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Quiz
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EditQuiz;