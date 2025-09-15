"use client"

import React, { useState } from 'react';
import { ChevronDown, BookOpen, TrendingUp, Users, Brain, Award, BarChart3, Target, Zap, CheckCircle } from 'lucide-react';

const ProgressoLanding = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const features = [
    {
      icon: Brain,
      title: "Smart Assessments",
      description: "AI-powered evaluation with 30 questions across easy, medium, and hard difficulty levels"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Real-time monitoring of student performance across multiple subjects"
    },
    {
      icon: Target,
      title: "Personalized Resources",
      description: "LLM-powered recommendations for weak concepts and learning gaps"
    },
    {
      icon: Users,
      title: "Teacher Dashboard",
      description: "Comprehensive analytics for educators to monitor all students' performance and identify areas needing attention"
    },
    {
      icon: Award,
      title: "Quiz Competitions",
      description: "Interactive quizzes created by teachers with real-time leaderboards to boost student engagement"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Detailed insights into student strengths and weaknesses with visual charts and progress reports"
    }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Create Assessment",
      description: "Teachers generate comprehensive exams with difficulty-based questions"
    },
    {
      step: "02",
      title: "Student Takes Test",
      description: "Students complete assessments and receive instant AI-powered feedback"
    },
    {
      step: "03",
      title: "Get Insights",
      description: "Teachers access detailed analytics and personalized improvement recommendations"
    }
  ];

  const faqs = [
    {
      question: "How does Progresso generate assessment questions?",
      answer: "Progresso uses AI to create 30 balanced questions per exam, automatically distributed across easy, medium, and hard difficulty levels to comprehensively evaluate student understanding."
    },
    {
      question: "Can teachers track multiple students' progress?",
      answer: "Yes, teachers get comprehensive dashboards showing all students' performance, progress trends, and areas needing attention across different subjects."
    },
    {
      question: "What kind of recommendations does the system provide?",
      answer: "Our LLM analyzes weak concepts and provides personalized learning resources, practice materials, and study strategies tailored to each student's needs."
    },
    {
      question: "How do quiz leaderboards work?",
      answer: "After each quiz, students see real-time leaderboards showing top performers, encouraging healthy competition and engagement."
    },
    {
      question: "Is the platform suitable for all subjects?",
      answer: "Yes, Progresso supports multiple subjects and automatically adapts question types and evaluation criteria based on the subject matter."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900/20 via-black to-gray-800/30"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4 backdrop-blur-sm border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-black" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Progresso
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <a href="/signin" className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
              Log In
            </a>
            <a href="/signup" className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium">
              Sign Up
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700/50 mb-8">
            <Zap className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-300">AI-Powered Educational Assessment</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent">
            Track Student Progress
            <br />
            <span className="bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent">
              with Progresso
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Empower educators with AI-driven assessments, personalized learning recommendations, 
            and comprehensive progress tracking across all subjects.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="px-8 py-4 bg-white text-black rounded-lg hover:bg-gray-200 transition-all duration-300 font-semibold text-lg group">
              Get Started for Free
              <div className="w-0 group-hover:w-full h-0.5 bg-black transition-all duration-300"></div>
            </button>
            <button className="px-8 py-4 border border-gray-600 text-white rounded-lg hover:bg-gray-800/50 transition-all duration-300 font-semibold text-lg">
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              Powerful Features for Modern Education
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Comprehensive tools designed to enhance learning outcomes and streamline educational assessment
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-8 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:-translate-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="relative z-10 py-24 px-6 bg-gradient-to-b from-gray-900/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              Complete Educational Solution
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to enhance teaching effectiveness and student learning outcomes
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-white">Adaptive Learning Path</h3>
              </div>
              <p className="text-gray-400 leading-relaxed mb-4">
                Our AI analyzes student responses to create personalized learning paths. When a student struggles with specific concepts, 
                the system automatically adjusts difficulty and provides targeted practice materials.
              </p>
              <ul className="text-gray-400 space-y-2">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-gray-500 mr-2" /> Automatic difficulty adjustment</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-gray-500 mr-2" /> Concept-based remediation</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-gray-500 mr-2" /> Progress milestone tracking</li>
              </ul>
            </div>
            
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-white">Collaborative Learning</h3>
              </div>
              <p className="text-gray-400 leading-relaxed mb-4">
                Foster student engagement through interactive quizzes and competitions. Teachers can create custom quizzes, 
                monitor participation in real-time, and use leaderboards to motivate students.
              </p>
              <ul className="text-gray-400 space-y-2">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-gray-500 mr-2" /> Real-time quiz participation</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-gray-500 mr-2" /> Dynamic leaderboards</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-gray-500 mr-2" /> Peer performance comparison</li>
              </ul>
            </div>
            
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-white">Advanced Analytics</h3>
              </div>
              <p className="text-gray-400 leading-relaxed mb-4">
                Get comprehensive insights into student performance with detailed analytics. Track progress over time, 
                identify learning patterns, and make data-driven decisions to improve teaching strategies.
              </p>
              <ul className="text-gray-400 space-y-2">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-gray-500 mr-2" /> Performance trend analysis</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-gray-500 mr-2" /> Subject-wise breakdowns</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-gray-500 mr-2" /> Class performance comparison</li>
              </ul>
            </div>
            
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-white">AI-Powered Recommendations</h3>
              </div>
              <p className="text-gray-400 leading-relaxed mb-4">
                Our LLM integration provides intelligent recommendations for struggling students. Get personalized study materials, 
                practice exercises, and learning resources tailored to each student's specific needs and learning style.
              </p>
              <ul className="text-gray-400 space-y-2">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-gray-500 mr-2" /> Personalized study plans</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-gray-500 mr-2" /> Resource recommendations</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-gray-500 mr-2" /> Learning style adaptation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-24 px-6 bg-gradient-to-b from-transparent to-gray-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              How Progresso Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Simple steps to transform your educational assessment process
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold text-black">{step.step}</span>
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-gray-600 to-gray-700 transform translate-x-1/2"></div>
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-700/50 rounded-xl overflow-hidden bg-gray-900/30 backdrop-blur-sm">
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-800/30 transition-colors"
                >
                  <span className="text-lg font-semibold text-white">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFAQ === index ? 'rotate-180' : ''}`} />
                </button>
                {openFAQ === index && (
                  <div className="px-8 pb-6 text-gray-400 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            Ready to Transform Your Teaching?
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join thousands of educators using Progresso to enhance student learning outcomes
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="px-8 py-4 bg-white text-black rounded-lg hover:bg-gray-200 transition-all duration-300 font-semibold text-lg group">
              Start Free Trial
              <div className="w-0 group-hover:w-full h-0.5 bg-black transition-all duration-300"></div>
            </button>
            <button className="px-8 py-4 border border-gray-600 text-white rounded-lg hover:bg-gray-800/50 transition-all duration-300 font-semibold text-lg">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-black" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Progresso
              </span>
            </div>
            
            <div className="flex items-center space-x-8 text-gray-400">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms</a>
              <a href="/support" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800/50 text-center text-gray-400">
            <p>&copy; 2025 Progresso. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProgressoLanding;