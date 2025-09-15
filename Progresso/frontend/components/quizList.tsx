import { Card } from './ui/card';
import { Clock, Users, Award } from 'lucide-react';
import Image from 'next/image';

const quizzes = [
  {
    id: 1,
    title: 'JavaScript Fundamentals',
    participants: 245,
    duration: '45 min',
    difficulty: 'Intermediate',
    image: '',
  },
  {
    id: 2,
    title: 'React Basics',
    participants: 189,
    duration: '30 min',
    difficulty: 'Beginner',
    // image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=300&h=200'
    image: '',
  },
];

export function QuizList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => (
        <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
          <Image
            src={quiz.image}
            alt={quiz.title}
            className="w-full h-40 object-cover rounded-lg mb-4"
          />
          <h3 className="text-lg font-semibold mb-2">{quiz.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {quiz.participants}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {quiz.duration}
            </div>
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              {quiz.difficulty}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}