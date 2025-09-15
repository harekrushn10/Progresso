"use client"

import React, { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import {
    ExternalLink,
    BookOpen,
    Video,
    FileText,
    Code,
    Search,
    ArrowLeft,
    Globe,
    Youtube,
    Book,
    Terminal,
    Database,
    Cpu,
    Layers,
    Smartphone,
    Cloud,
    Brain,
    Palette,
    Server,
    Shield,
    Zap
} from 'lucide-react';

// Type definitions
interface Resource {
    type: string;
    title: string;
    description: string;
    url: string;
    icon: React.ReactNode;
}

interface Subject {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    resources: Resource[];
}

const Resources = () => {
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const subjects: Subject[] = [
        {
            id: 'java',
            name: 'Java',
            description: 'Core Java programming concepts, syntax, and object-oriented principles',
            icon: <Code className="w-6 h-6" />,
            color: 'bg-orange-500',
            resources: [
                {
                    type: 'Documentation',
                    title: 'Oracle Java Documentation',
                    description: 'Official Java documentation and API references',
                    url: 'https://docs.oracle.com/en/java/',
                    icon: <FileText className="w-4 h-4" />
                },
                {
                    type: 'Tutorial',
                    title: 'Java Tutorial - W3Schools',
                    description: 'Interactive Java tutorial with examples',
                    url: 'https://www.w3schools.com/java/',
                    icon: <Globe className="w-4 h-4" />
                },
                {
                    type: 'Tutorial',
                    title: 'Java - GeeksforGeeks',
                    description: 'Comprehensive Java tutorials and practice problems',
                    url: 'https://www.geeksforgeeks.org/java/',
                    icon: <Book className="w-4 h-4" />
                },
                {
                    type: 'Video Course',
                    title: 'Java Programming - CodeWithHarry',
                    description: 'Complete Java course in Hindi',
                    url: 'https://www.youtube.com/watch?v=ntLJmHOJ0ME',
                    icon: <Youtube className="w-4 h-4" />
                },
                {
                    type: 'Video Course',
                    title: 'Java Tutorial for Beginners - Programming with Mosh',
                    description: 'Comprehensive Java tutorial for beginners',
                    url: 'https://www.youtube.com/watch?v=eIrMbAQSU34',
                    icon: <Youtube className="w-4 h-4" />
                }
            ]
        },
        {
            id: 'python',
            name: 'Python',
            description: 'Python programming fundamentals, syntax, and popular libraries',
            icon: <Terminal className="w-6 h-6" />,
            color: 'bg-blue-500',
            resources: [
                {
                    type: 'Documentation',
                    title: 'Python Official Documentation',
                    description: 'Official Python documentation and tutorials',
                    url: 'https://docs.python.org/3/',
                    icon: <FileText className="w-4 h-4" />
                },
                {
                    type: 'Tutorial',
                    title: 'Python Tutorial - W3Schools',
                    description: 'Interactive Python tutorial with examples',
                    url: 'https://www.w3schools.com/python/',
                    icon: <Globe className="w-4 h-4" />
                },
                {
                    type: 'Tutorial',
                    title: 'Python - GeeksforGeeks',
                    description: 'Python tutorials and programming examples',
                    url: 'https://www.geeksforgeeks.org/python-programming-language/',
                    icon: <Book className="w-4 h-4" />
                },
                {
                    type: 'Video Course',
                    title: 'Python Tutorial - CodeWithHarry',
                    description: 'Complete Python course in Hindi',
                    url: 'https://www.youtube.com/watch?v=7wnove7K-ZQ',
                    icon: <Youtube className="w-4 h-4" />
                },
                {
                    type: 'Interactive',
                    title: 'Python.org Beginner Guide',
                    description: 'Official beginner-friendly Python guide',
                    url: 'https://wiki.python.org/moin/BeginnersGuide',
                    icon: <BookOpen className="w-4 h-4" />
                }
            ]
        },
        {
            id: 'javascript',
            name: 'JavaScript',
            description: 'JavaScript fundamentals, ES6+, and DOM manipulation',
            icon: <Zap className="w-6 h-6" />,
            color: 'bg-yellow-500',
            resources: [
                {
                    type: 'Documentation',
                    title: 'MDN Web Docs - JavaScript',
                    description: 'Comprehensive JavaScript documentation by Mozilla',
                    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
                    icon: <FileText className="w-4 h-4" />
                },
                {
                    type: 'Tutorial',
                    title: 'JavaScript Tutorial - W3Schools',
                    description: 'Interactive JavaScript tutorial with examples',
                    url: 'https://www.w3schools.com/js/',
                    icon: <Globe className="w-4 h-4" />
                },
                {
                    type: 'Tutorial',
                    title: 'JavaScript - GeeksforGeeks',
                    description: 'JavaScript tutorials and examples',
                    url: 'https://www.geeksforgeeks.org/javascript/',
                    icon: <Book className="w-4 h-4" />
                },
                {
                    type: 'Video Course',
                    title: 'JavaScript Tutorial - Thapa Technical',
                    description: 'Complete JavaScript course in Hindi',
                    url: 'https://www.youtube.com/watch?v=KGkiIBTq0y0',
                    icon: <Youtube className="w-4 h-4" />
                },
                {
                    type: 'Interactive',
                    title: 'JavaScript.info',
                    description: 'Modern JavaScript tutorial with interactive examples',
                    url: 'https://javascript.info/',
                    icon: <BookOpen className="w-4 h-4" />
                }
            ]
        },
        {
            id: 'react',
            name: 'React',
            description: 'React.js library, hooks, state management, and ecosystem',
            icon: <Layers className="w-6 h-6" />,
            color: 'bg-cyan-500',
            resources: [
                {
                    type: 'Documentation',
                    title: 'React Official Documentation',
                    description: 'Official React documentation and guides',
                    url: 'https://react.dev/',
                    icon: <FileText className="w-4 h-4" />
                },
                {
                    type: 'Tutorial',
                    title: 'React Tutorial - W3Schools',
                    description: 'React tutorial with practical examples',
                    url: 'https://www.w3schools.com/react/',
                    icon: <Globe className="w-4 h-4" />
                },
                {
                    type: 'Tutorial',
                    title: 'ReactJS - GeeksforGeeks',
                    description: 'React tutorials and component examples',
                    url: 'https://www.geeksforgeeks.org/reactjs/',
                    icon: <Book className="w-4 h-4" />
                },
                {
                    type: 'Video Course',
                    title: 'React JS - CodeWithHarry',
                    description: 'Complete React course in Hindi',
                    url: 'https://www.youtube.com/watch?v=RGKi6LSPDLU',
                    icon: <Youtube className="w-4 h-4" />
                },
                {
                    type: 'Video Course',
                    title: 'React Course - Traversy Media',
                    description: 'React crash course for beginners',
                    url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8',
                    icon: <Youtube className="w-4 h-4" />
                }
            ]
        },
        {
            id: 'nodejs',
            name: 'Node.js',
            description: 'Node.js runtime, APIs, and server-side development',
            icon: <Server className="w-6 h-6" />,
            color: 'bg-green-600',
            resources: [
                {
                    type: 'Documentation',
                    title: 'Node.js Official Documentation',
                    description: 'Official Node.js documentation and API reference',
                    url: 'https://nodejs.org/en/docs/',
                    icon: <FileText className="w-4 h-4" />
                },
                {
                    type: 'Tutorial',
                    title: 'Node.js Tutorial - W3Schools',
                    description: 'Node.js tutorial with examples',
                    url: 'https://www.w3schools.com/nodejs/',
                    icon: <Globe className="w-4 h-4" />
                },
                {
                    type: 'Tutorial',
                    title: 'Node.js - GeeksforGeeks',
                    description: 'Node.js tutorials and examples',
                    url: 'https://www.geeksforgeeks.org/nodejs/',
                    icon: <Book className="w-4 h-4" />
                },
                {
                    type: 'Video Course',
                    title: 'Node.js - CodeWithHarry',
                    description: 'Complete Node.js course in Hindi',
                    url: 'https://www.youtube.com/watch?v=BLl32FvcdVM',
                    icon: <Youtube className="w-4 h-4" />
                },
                {
                    type: 'Video Course',
                    title: 'Node.js Crash Course - Traversy Media',
                    description: 'Node.js crash course for beginners',
                    url: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4',
                    icon: <Youtube className="w-4 h-4" />
                }
            ]
        },
        {
            id: 'sql',
            name: 'SQL',
            description: 'Database queries, joins, aggregations, and database design',
            icon: <Database className="w-6 h-6" />,
            color: 'bg-purple-500',
            resources: [
                {
                    type: 'Tutorial',
                    title: 'SQL Tutorial - W3Schools',
                    description: 'Interactive SQL tutorial with examples',
                    url: 'https://www.w3schools.com/sql/',
                    icon: <Globe className="w-4 h-4" />
                },
                {
                    type: 'Tutorial',
                    title: 'SQL - GeeksforGeeks',
                    description: 'SQL tutorials and database concepts',
                    url: 'https://www.geeksforgeeks.org/sql-tutorial/',
                    icon: <Book className="w-4 h-4" />
                },
                {
                    type: 'Video Course',
                    title: 'SQL Tutorial - CodeWithHarry',
                    description: 'Complete SQL course in Hindi',
                    url: 'https://www.youtube.com/watch?v=hlGoQC332VM',
                    icon: <Youtube className="w-4 h-4" />
                },
                {
                    type: 'Interactive',
                    title: 'SQLBolt',
                    description: 'Interactive SQL lessons and exercises',
                    url: 'https://sqlbolt.com/',
                    icon: <BookOpen className="w-4 h-4" />
                },
                {
                    type: 'Practice',
                    title: 'HackerRank SQL',
                    description: 'SQL practice problems and challenges',
                    url: 'https://www.hackerrank.com/domains/sql',
                    icon: <Terminal className="w-4 h-4" />
                }
            ]
        },
        {
            id: 'mongodb',
            name: 'MongoDB',
            description: 'MongoDB database operations, aggregation, and design',
            icon: <Database className="w-6 h-6" />,
            color: 'bg-green-500',
            resources: [
                {
                    type: 'Documentation',
                    title: 'MongoDB Official Documentation',
                    description: 'Official MongoDB documentation and guides',
                    url: 'https://docs.mongodb.com/',
                    icon: <FileText className="w-4 h-4" />
                },
                {
                    type: 'Tutorial',
                    title: 'MongoDB Tutorial - W3Schools',
                    description: 'MongoDB tutorial with examples',
                    url: 'https://www.w3schools.com/mongodb/',
                    icon: <Globe className="w-4 h-4" />
                },
                {
                    type: 'Tutorial',
                    title: 'MongoDB - GeeksforGeeks',
                    description: 'MongoDB tutorials and operations',
                    url: 'https://www.geeksforgeeks.org/mongodb-tutorial/',
                    icon: <Book className="w-4 h-4" />
                },
                {
                    type: 'Video Course',
                    title: 'MongoDB - CodeWithHarry',
                    description: 'Complete MongoDB course in Hindi',
                    url: 'https://www.youtube.com/watch?v=oSIv-E60NiU',
                    icon: <Youtube className="w-4 h-4" />
                },
                {
                    type: 'Course',
                    title: 'MongoDB University',
                    description: 'Free MongoDB courses and certifications',
                    url: 'https://university.mongodb.com/',
                    icon: <BookOpen className="w-4 h-4" />
                }
            ]
        },
        {
            id: 'dsa',
            name: 'Data Structures & Algorithms',
            description: 'Data Structures and Algorithms implementation and analysis',
            icon: <Cpu className="w-6 h-6" />,
            color: 'bg-red-500',
            resources: [
                {
                    type: 'Tutorial',
                    title: 'DSA - GeeksforGeeks',
                    description: 'Comprehensive DSA tutorials and problems',
                    url: 'https://www.geeksforgeeks.org/data-structures/',
                    icon: <Book className="w-4 h-4" />
                },
                {
                    type: 'Video Course',
                    title: 'DSA - CodeWithHarry',
                    description: 'Complete DSA course in Hindi',
                    url: 'https://www.youtube.com/watch?v=5_5oE5lgrhw',
                    icon: <Youtube className="w-4 h-4" />
                },
                {
                    type: 'Practice',
                    title: 'LeetCode',
                    description: 'Practice coding problems and algorithms',
                    url: 'https://leetcode.com/',
                    icon: <Terminal className="w-4 h-4" />
                },
                {
                    type: 'Practice',
                    title: 'HackerRank DSA',
                    description: 'Data structures and algorithms practice',
                    url: 'https://www.hackerrank.com/domains/data-structures',
                    icon: <Terminal className="w-4 h-4" />
                },
                {
                    type: 'Book',
                    title: 'Algorithm Visualizer',
                    description: 'Interactive algorithm visualization',
                    url: 'https://algorithm-visualizer.org/',
                    icon: <BookOpen className="w-4 h-4" />
                }
            ]
        },
        {
            id: 'html',
            name: 'HTML',
            description: 'HTML structure, semantics, and modern web standards',
            icon: <Globe className="w-6 h-6" />,
            color: 'bg-orange-600',
            resources: [
                {
                    type: 'Documentation',
                    title: 'MDN Web Docs - HTML',
                    description: 'Comprehensive HTML documentation by Mozilla',
                    url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
                    icon: <FileText className="w-4 h-4" />
                },
                {
                    type: 'Tutorial',
                    title: 'HTML Tutorial - W3Schools',
                    description: 'Interactive HTML tutorial with examples',
                    url: 'https://www.w3schools.com/html/',
                    icon: <Globe className="w-4 h-4" />
                },
                {
                    type: 'Tutorial',
                    title: 'HTML - GeeksforGeeks',
                    description: 'HTML tutorials and examples',
                    url: 'https://www.geeksforgeeks.org/html/',
                    icon: <Book className="w-4 h-4" />
                },
                {
                    type: 'Video Course',
                    title: 'HTML Tutorial - CodeWithHarry',
                    description: 'Complete HTML course in Hindi',
                    url: 'https://www.youtube.com/watch?v=BGeDBfH5uk4',
                    icon: <Youtube className="w-4 h-4" />
                }
            ]
        },
        {
            id: 'css',
            name: 'CSS',
            description: 'CSS styling, layouts, responsive design, and modern features',
            icon: <Palette className="w-6 h-6" />,
            color: 'bg-blue-600',
            resources: [
                {
                    type: 'Documentation',
                    title: 'MDN Web Docs - CSS',
                    description: 'Comprehensive CSS documentation by Mozilla',
                    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
                    icon: <FileText className="w-4 h-4" />
                },
                {
                    type: 'Tutorial',
                    title: 'CSS Tutorial - W3Schools',
                    description: 'Interactive CSS tutorial with examples',
                    url: 'https://www.w3schools.com/css/',
                    icon: <Globe className="w-4 h-4" />
                },
                {
                    type: 'Tutorial',
                    title: 'CSS - GeeksforGeeks',
                    description: 'CSS tutorials and styling examples',
                    url: 'https://www.geeksforgeeks.org/css/',
                    icon: <Book className="w-4 h-4" />
                },
                {
                    type: 'Video Course',
                    title: 'CSS Tutorial - CodeWithHarry',
                    description: 'Complete CSS course in Hindi',
                    url: 'https://www.youtube.com/watch?v=Edsxf_NBFrw',
                    icon: <Youtube className="w-4 h-4" />
                },
                {
                    type: 'Interactive',
                    title: 'CSS Grid Garden',
                    description: 'Learn CSS Grid through a fun game',
                    url: 'https://cssgridgarden.com/',
                    icon: <BookOpen className="w-4 h-4" />
                }
            ]
        },
        {
            id: 'aws',
            name: 'Amazon Web Services',
            description: 'Amazon Web Services cloud computing and services',
            icon: <Cloud className="w-6 h-6" />,
            color: 'bg-yellow-600',
            resources: [
                {
                    type: 'Documentation',
                    title: 'AWS Documentation',
                    description: 'Official AWS documentation and guides',
                    url: 'https://docs.aws.amazon.com/',
                    icon: <FileText className="w-4 h-4" />
                },
                {
                    type: 'Tutorial',
                    title: 'AWS - GeeksforGeeks',
                    description: 'AWS tutorials and cloud concepts',
                    url: 'https://www.geeksforgeeks.org/aws-tutorial/',
                    icon: <Book className="w-4 h-4" />
                },
                {
                    type: 'Video Course',
                    title: 'AWS Tutorial - Simplilearn',
                    description: 'Complete AWS tutorial for beginners',
                    url: 'https://www.youtube.com/watch?v=k1RI5locZE4',
                    icon: <Youtube className="w-4 h-4" />
                },
                {
                    type: 'Course',
                    title: 'AWS Training',
                    description: 'Official AWS training and certification',
                    url: 'https://aws.amazon.com/training/',
                    icon: <BookOpen className="w-4 h-4" />
                }
            ]
        },
        {
            id: 'machine-learning',
            name: 'Machine Learning',
            description: 'ML algorithms, concepts, and practical applications',
            icon: <Brain className="w-6 h-6" />,
            color: 'bg-indigo-600',
            resources: [
                {
                    type: 'Course',
                    title: 'Machine Learning - Coursera',
                    description: 'Andrew Ng\'s famous ML course',
                    url: 'https://www.coursera.org/learn/machine-learning',
                    icon: <BookOpen className="w-4 h-4" />
                },
                {
                    type: 'Tutorial',
                    title: 'Machine Learning - GeeksforGeeks',
                    description: 'ML tutorials and algorithms',
                    url: 'https://www.geeksforgeeks.org/machine-learning/',
                    icon: <Book className="w-4 h-4" />
                },
                {
                    type: 'Video Course',
                    title: 'ML - CodeWithHarry',
                    description: 'Machine Learning course in Hindi',
                    url: 'https://www.youtube.com/watch?v=7uwa9aPbBRU',
                    icon: <Youtube className="w-4 h-4" />
                },
                {
                    type: 'Documentation',
                    title: 'Scikit-learn Documentation',
                    description: 'Python ML library documentation',
                    url: 'https://scikit-learn.org/stable/',
                    icon: <FileText className="w-4 h-4" />
                }
            ]
        }
    ];

    const filteredSubjects = subjects.filter(subject =>
        subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getResourceTypeColor = (type: string): string => {
        switch (type.toLowerCase()) {
            case 'documentation':
                return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
            case 'tutorial':
                return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
            case 'video course':
                return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
            case 'interactive':
                return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400';
            case 'practice':
                return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400';
            default:
                return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    if (selectedSubject) {
        const subject = subjects.find(s => s.id === selectedSubject);

        if (!subject) {
            return (
                <div className="min-h-screen bg-white dark:bg-[#0e0e10] p-4">
                    <div className="ml-64 px-8">
                        <div className="max-w-7xl mx-auto">
                            <Sidebar />
                            <div className="text-center py-12">
                                <div className="text-red-500 text-lg mb-2">Subject not found</div>
                                <button
                                    onClick={() => setSelectedSubject(null)}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Back to Resources
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-white dark:bg-[#0e0e10] p-4">
                <div className="ml-64 px-8">
                    <div className="max-w-7xl mx-auto">
                        <Sidebar />
                        
                        {/* Back Button */}
                        <button
                            onClick={() => setSelectedSubject(null)}
                            className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Resources
                        </button>

                        {/* Subject Header */}
                        <div className="text-center mb-8">
                            <div className={`inline-flex items-center justify-center w-16 h-16 ${subject.color} text-white rounded-xl mb-4`}>
                                {subject.icon}
                            </div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                {subject.name}
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                {subject.description}
                            </p>
                        </div>

                        {/* Resources Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subject.resources.map((resource, index) => (
                                <a
                                    key={index}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group p-6 dark:bg-[#212124] dark:border-0 border-[#bdbdbd] border-[1px] rounded-xl shadow-sm hover:shadow-md dark:hover:shadow-lg transition-all duration-200 hover:scale-105"
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className={`p-2 rounded-lg ${getResourceTypeColor(resource.type)}`}>
                                            {resource.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${getResourceTypeColor(resource.type)}`}>
                                                {resource.type}
                                            </div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                                                {resource.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                {resource.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            Open Resource
                                        </span>
                                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0e0e10] p-4">
            <div className="ml-64 px-8">
                <div className="max-w-7xl mx-auto">
                    <Sidebar />
                    
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 py-8">
                            Learning Resources
                        </h1>

                        {/* Search Bar */}
                        <div className="max-w-md mx-auto relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search subjects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#232328] border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Subjects Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredSubjects.map((subject) => (
                            <div
                                key={subject.id}
                                onClick={() => setSelectedSubject(subject.id)}
                                className="group cursor-pointer p-6 dark:bg-[#212124] dark:border-0 border-[#bdbdbd] border-[1px] rounded-xl shadow-sm hover:shadow-md dark:hover:shadow-lg transition-all duration-200 hover:scale-105"
                            >
                                <div className="text-center">
                                    <div
                                        className={`inline-flex items-center justify-center w-12 h-12 ${subject.color} text-white rounded-lg mb-4 group-hover:scale-110 transition-transform`}
                                    >
                                        {subject.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {subject.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {subject.description}
                                    </p>
                                    <div className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                        <span>View Resources</span>
                                        <ExternalLink className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredSubjects.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 dark:text-gray-600 text-lg mb-2">
                                No subjects found matching your search
                            </div>
                            <p className="text-gray-500 dark:text-gray-500">
                                Try adjusting your search terms
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

};

export default Resources;