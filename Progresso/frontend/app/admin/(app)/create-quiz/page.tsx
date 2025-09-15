"use client"
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Plus, Upload, FileSpreadsheet, ShieldAlert, Calendar } from 'lucide-react';
import { Sidebar } from '@/components/admin/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { toast } from 'sonner';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface QuizQuestion {
  text: string;
  correctAnswer: string;
  options: { text: string }[];
  category: string;
}

interface DashboardResponse {
  user: {
    role: string;
  }
}

const CreateQuiz = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [defaultCategory, setDefaultCategory] = useState('GENERAL');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [fileName, setFileName] = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Predefined categories - you can modify these based on your requirements
  const categories = [
    'GENERAL',
    'IT',
    'SCIENCE',
    'MATHEMATICS',
    'HISTORY',
    'GEOGRAPHY',
    'ENGLISH',
    'BUSINESS',
    'ENGINEERING',
    'MEDICAL'
  ];

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
        // if (!isUserAdmin) {
        //   toast.error('Access denied. Only administrators can create quizzes.');
        //   router.push('/admin/dashboard');
        // }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      toast.error('Authentication failed. Please login again.');
      router.push('/login');
    } finally {
      setIsLoading(false);
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
        ],
        category: row['category'] || defaultCategory // Use default category if not provided in Excel
      }));

      setQuestions(parsedQuestions);
      toast.success(`${parsedQuestions.length} questions loaded successfully!`);
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

  const handleCreateQuiz = async () => {
    // Validate inputs
    if (!title || !description || questions.length === 0) {
      toast.error('Please fill in all required fields and upload questions');
      return;
    }

    // Validate dates if both are provided
    if (!validateDates()) {
      return;
    }

    // Ensure all questions have a category
    const questionsWithCategory = questions.map(q => ({
      ...q,
      category: q.category || defaultCategory
    }));
  
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/quiz/create-quiz`, 
        {
          title,
          description,
          price: parseFloat(price) || 0,
          startDate: startDate || null,
          endDate: endDate || null,
          questions: questionsWithCategory
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
  
      if (response.data.success) {
        toast.success('Quiz created successfully!');
        setTitle('');
        setDescription('');
        setPrice('');
        setStartDate('');
        setEndDate('');
        setDefaultCategory('GENERAL');
        setQuestions([]);
        setFileName('');
        router.push('/admin/dashboard')
      } else {
        toast.error(response.data.message || 'Failed to create quiz');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error creating quiz:', error.response?.data);
        toast.error(
          error.response?.data?.message || 
          'An error occurred while creating the quiz'
        );
      } else {
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred');
      }
    }
  };

  const downloadExcelTemplate = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Question Text', 'Correct Answer', 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'category'],
      ['What is 2+2?', '4', '3', '4', '5', '6', 'MATHEMATICS'],
      ['Capital of France?', 'Paris', 'London', 'Paris', 'Berlin', 'Rome', 'GEOGRAPHY']
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Quiz Questions');

    XLSX.writeFile(workbook, 'quiz_template.xlsx');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full min-h-screen flex items-center bg-white dark:bg-[#0e0e10] justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
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
            <p className="text-neutral-400 mb-6">You don't have permission to access this page. Only administrators can manage sub-admins.</p>
            <Button onClick={() => router.push('/admin/dashboard')}>
              Return to Dashboard
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e2f1fc]">Create Quiz</h1>
            <p className="text-neutral-500">Create new quizzes for your students</p>
          </div>
        </div>

        <div className="dark:bg-[#18181a] shadow-md rounded-lg p-6 space-y-6 dark:border-0 border-[#bdbdbd] border-[1px]">
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

          {/* Default Category Selection */}
          <div>
            <Label htmlFor="defaultCategory">Default Category</Label>
            <select
              id="defaultCategory"
              value={defaultCategory}
              onChange={(e) => setDefaultCategory(e.target.value)}
              className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#18181a] dark:text-white"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              This category will be applied to questions that don't have a category specified in the Excel file
            </p>
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
            <Label>Upload Quiz Questions</Label>
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

            <div className="text-sm text-gray-600 space-y-1">
              <p>• The Excel file should contain columns: Question Text, Correct Answer, Option 1-4, and category</p>
              <p>• If no category is specified in Excel, the default category will be used</p>
              <p>• Available categories: {categories.join(', ')}</p>
            </div>

            {questions.length > 0 && (
              <div className="mt-4 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">
                    {questions.length} questions loaded successfully
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleCreateQuiz}
              disabled={!title || !description || questions.length === 0}
              className="flex bg-blue-500 items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Quiz
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CreateQuiz;