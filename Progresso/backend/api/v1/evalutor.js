import express from 'express';
import { PrismaClient } from '@prisma/client';
import authenticate from './middleware/authenticate.js';
import authMiddleware from './middleware/authMiddleware.js';
import Groq from 'groq-sdk';

const prisma = new PrismaClient();
const router = express.Router();

// Initialize GROQ client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Available test concepts
const AVAILABLE_CONCEPTS = [
  'java', 'python', 'sql', 'oops', 'c', 'cpp', 'dsa', 'html', 'css', 
  'javascript', 'typescript', 'web-development', 'machine-learning',
  'react', 'nodejs', 'mongodb', 'git', 'aws', 'docker'
];

// Concept descriptions for better context
const CONCEPT_DESCRIPTIONS = {
  'java': 'Core Java programming concepts, syntax, and object-oriented principles',
  'python': 'Python programming fundamentals, syntax, and popular libraries',
  'sql': 'Database queries, joins, aggregations, and database design',
  'oops': 'Object-Oriented Programming principles and design patterns',
  'c': 'C programming language fundamentals and memory management',
  'cpp': 'C++ programming including STL, templates, and advanced features',
  'dsa': 'Data Structures and Algorithms implementation and analysis',
  'html': 'HTML structure, semantics, and modern web standards',
  'css': 'CSS styling, layouts, responsive design, and modern features',
  'javascript': 'JavaScript fundamentals, ES6+, and DOM manipulation',
  'typescript': 'TypeScript features, type system, and advanced concepts',
  'web-development': 'Full-stack web development concepts and best practices',
  'machine-learning': 'ML algorithms, concepts, and practical applications',
  'react': 'React.js library, hooks, state management, and ecosystem',
  'nodejs': 'Node.js runtime, APIs, and server-side development',
  'mongodb': 'MongoDB database operations, aggregation, and design',
  'git': 'Version control with Git, branching, and collaboration',
  'aws': 'Amazon Web Services cloud computing and services',
  'docker': 'Containerization with Docker and orchestration basics'
};

// // Learning resources for weak areas
// const LEARNING_RESOURCES = {
//   'java': {
//     'basics': [
//       { title: 'Java Tutorial for Beginners', type: 'YOUTUBE_VIDEO', url: 'https://www.youtube.com/watch?v=eIrMbAQSU34' },
//       { title: 'Oracle Java Documentation', type: 'DOCUMENTATION', url: 'https://docs.oracle.com/javase/tutorial/' }
//     ],
//     'oops': [
//       { title: 'Java OOP Concepts Explained', type: 'YOUTUBE_VIDEO', url: 'https://www.youtube.com/watch?v=6T_HgnjoYwM' },
//       { title: 'Object-Oriented Programming in Java', type: 'TUTORIAL', url: 'https://www.javatpoint.com/java-oops-concepts' }
//     ],
//     'collections': [
//       { title: 'Java Collections Framework', type: 'YOUTUBE_VIDEO', url: 'https://www.youtube.com/watch?v=GdAon80-0KA' }
//     ]
//   },
//   'python': {
//     'basics': [
//       { title: 'Python Tutorial - Python Full Course', type: 'YOUTUBE_VIDEO', url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc' },
//       { title: 'Python.org Official Tutorial', type: 'DOCUMENTATION', url: 'https://docs.python.org/3/tutorial/' }
//     ],
//     'data-structures': [
//       { title: 'Python Data Structures', type: 'YOUTUBE_VIDEO', url: 'https://www.youtube.com/watch?v=R-HLU9Fl5ug' }
//     ]
//   },
//   'dsa': {
//     'arrays': [
//       { title: 'Data Structures and Algorithms Course', type: 'YOUTUBE_VIDEO', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM' }
//     ],
//     'sorting': [
//       { title: 'Sorting Algorithms Explained', type: 'YOUTUBE_VIDEO', url: 'https://www.youtube.com/watch?v=kPRA0W1kECg' }
//     ]
//   }
//   // Add more resources as needed
// };

/**
 * Generate personalized learning resources using GROQ AI
 */
async function generatePersonalizedResources(concept, weakAreas, performance, incorrectAnswers = []) {
  try {
    const prompt = `Based on a student's performance in a ${concept} test, recommend personalized learning resources.

Student Performance Details:
- Main Concept: ${concept}
- Weak Areas: ${weakAreas.join(', ')}
- Overall Performance: ${performance}
- Specific Topics Struggled With: ${incorrectAnswers.map(q => q.concept || q.topic).join(', ')}

Please provide 6-8 personalized learning resource recommendations in JSON format:

{
  "resources": [
    {
      "title": "Resource Title",
      "description": "Why this resource is specifically helpful for this student",
      "type": "VIDEO/ARTICLE/TUTORIAL/DOCUMENTATION/COURSE/PRACTICE",
      "url": "https://example.com",
      "priority": "HIGH/MEDIUM/LOW",
      "estimatedTime": "time in minutes/hours",
      "difficulty": "BEGINNER/INTERMEDIATE/ADVANCED",
      "targetWeakness": "specific weak area this addresses"
    }
  ],
  "studyPlan": {
    "immediate": "What to focus on first",
    "shortTerm": "What to work on in the next week",
    "longTerm": "What to master over the next month"
  },
  "practiceAreas": ["area1", "area2", "area3"]
}

Requirements:
- Prioritize resources that directly address the weak areas
- Include a mix of resource types (videos, articles, practice platforms)
- Consider the student's performance level when recommending difficulty
- Provide real, accessible URLs when possible
- Focus on practical, hands-on learning opportunities
- Include both foundational and advanced resources based on weak areas

Only return valid JSON, no other text.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from GROQ API for resource recommendations');
    }

    let resourceData;
    try {
      resourceData = JSON.parse(response);
    } catch (parseError) {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        resourceData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from GROQ API');
      }
    }

    return resourceData;
  } catch (error) {
    console.error('Error generating personalized resources:', error);
    // Return fallback resources
    return {
      resources: [
        {
          title: `${concept.charAt(0).toUpperCase() + concept.slice(1)} Fundamentals Review`,
          description: "Review the basic concepts to strengthen your foundation",
          type: "TUTORIAL",
          url: `https://www.tutorialspoint.com/${concept}/`,
          priority: "HIGH",
          estimatedTime: "2-3 hours",
          difficulty: "BEGINNER",
          targetWeakness: "fundamentals"
        }
      ],
      studyPlan: {
        immediate: `Focus on reviewing ${concept} basics`,
        shortTerm: "Practice coding exercises and examples",
        longTerm: "Work on projects to apply knowledge"
      },
      practiceAreas: weakAreas
    };
  }
}

/**
 * Generate study recommendations based on performance analysis
 */
async function generateStudyRecommendations(concept, detailedAnalysis, performance) {
  try {
    const incorrectQuestions = detailedAnalysis.filter(q => !q.isCorrect);
    const difficultyDistribution = {
      easy: detailedAnalysis.filter(q => q.difficulty === 'EASY' && !q.isCorrect).length,
      medium: detailedAnalysis.filter(q => q.difficulty === 'MEDIUM' && !q.isCorrect).length,
      hard: detailedAnalysis.filter(q => q.difficulty === 'HARD' && !q.isCorrect).length
    };

    const prompt = `Analyze a student's test performance and provide specific study recommendations.

Test Details:
- Subject: ${concept}
- Overall Performance: ${performance}
- Incorrect Questions by Difficulty:
  - Easy: ${difficultyDistribution.easy}/10
  - Medium: ${difficultyDistribution.medium}/10  
  - Hard: ${difficultyDistribution.hard}/10

Specific Questions Answered Incorrectly:
${incorrectQuestions.map((q, index) => `
${index + 1}. Question: ${q.questionText}
   Student Answer: ${q.userAnswer}
   Correct Answer: ${q.correctAnswer}
   Difficulty: ${q.difficulty}
   Topic: ${q.concept}
`).join('')}

Provide detailed study recommendations in JSON format:

{
  "priorityAreas": [
    {
      "area": "specific topic/concept",
      "reason": "why this needs attention",
      "urgency": "HIGH/MEDIUM/LOW"
    }
  ],
  "studyStrategy": {
    "approach": "recommended learning approach",
    "timeAllocation": "suggested time distribution",
    "sequence": "order of topics to study"
  },
  "practiceRecommendations": [
    {
      "type": "CODING_PRACTICE/THEORY_REVIEW/CONCEPT_MAPPING",
      "description": "what to practice",
      "frequency": "how often"
    }
  ],
  "weaknessAnalysis": {
    "conceptual": ["conceptual gaps"],
    "practical": ["practical skill gaps"],
    "foundational": ["missing fundamentals"]
  }
}

Only return valid JSON.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.6,
      max_tokens: 1500
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from GROQ API for study recommendations');
    }

    let studyData;
    try {
      studyData = JSON.parse(response);
    } catch (parseError) {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        studyData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from GROQ API');
      }
    }

    return studyData;
  } catch (error) {
    console.error('Error generating study recommendations:', error);
    return null;
  }
}

/**
 * @desc Initialize evaluator tests in database
 * @route POST /api/v1/evaluator/init
 * @access Private (Admin only)
 */
router.post('/init', authenticate(['ADMIN']), async (req, res) => {
  try {
    const tests = await Promise.all(
      AVAILABLE_CONCEPTS.map(concept => 
        prisma.evaluatorTest.upsert({
          where: { concept },
          update: { 
            description: CONCEPT_DESCRIPTIONS[concept] || `${concept} programming concepts and fundamentals`,
            isActive: true 
          },
          create: {
            concept,
            description: CONCEPT_DESCRIPTIONS[concept] || `${concept} programming concepts and fundamentals`,
            isActive: true
          }
        })
      )
    );

    res.status(200).json({
      success: true,
      message: 'Evaluator tests initialized successfully',
      data: tests
    });
  } catch (error) {
    console.error('Error initializing evaluator tests:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing evaluator tests',
      error: error.message
    });
  }
});

/**
 * @desc Get all available test concepts
 * @route GET /api/v1/evaluator/concepts
 * @access Public
 */
router.get('/concepts', authMiddleware, async (req, res) => {
  try {
    // Create formatted concepts from static data
    const formattedConcepts = AVAILABLE_CONCEPTS.map((concept, index) => ({
      id: index + 1, // Generate a simple ID
      concept: concept,
      description: CONCEPT_DESCRIPTIONS[concept] || `${concept} programming concepts and fundamentals`,
      totalAttempts: 0, // Since not stored in DB, set to 0 or you can remove this field
      questionCount: 30 // Each test has 30 questions (10 easy, 10 medium, 10 hard)
    }));

    res.status(200).json({
      success: true,
      data: formattedConcepts,
      count: AVAILABLE_CONCEPTS.length
    });
  } catch (error) {
    console.error('Error getting test concepts:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting test concepts',
      error: error.message
    });
  }
});

/**
 * Generate questions using GROQ AI
 */
async function generateQuestionsWithGroq(concept, difficulty, count = 10) {
  try {
    const prompt = `Generate ${count} ${difficulty} level multiple choice questions about ${concept}. 
    
    Please respond with a JSON array where each question has this exact format:
    {
      "questionText": "Your question here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "concept": "${concept}",
      "explanation": "Brief explanation of why this answer is correct"
    }
    
    Requirements:
    - Questions should be ${difficulty} level for ${concept}
    - Ensure questions test practical knowledge and understanding
    - Make sure the correctAnswer exactly matches one of the options
    - Keep questions concise but comprehensive
    - Focus on real-world applications where possible
    
    Only return the JSON array, no other text.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 4000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from GROQ API');
    }

    // Parse the JSON response
    let questions;
    try {
      questions = JSON.parse(response);
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from GROQ API');
      }
    }

    if (!Array.isArray(questions) || questions.length !== count) {
      throw new Error(`Expected ${count} questions, got ${questions.length}`);
    }

    return questions;
  } catch (error) {
    console.error('Error generating questions with GROQ:', error);
    throw error;
  }
}

/**
 * @desc Start a new evaluator test
 * @route POST /api/v1/evaluator/start/:concept
 * @access Private (User only)
 */
router.post('/start/:concept', authenticate(['USER']), async (req, res) => {
  const { concept } = req.params;
  const userId = req.user.id;

  try {
    // Validate concept
    if (!AVAILABLE_CONCEPTS.includes(concept.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid concept. Available concepts: ' + AVAILABLE_CONCEPTS.join(', ')
      });
    }

    // Find or create the evaluator test
    let test = await prisma.evaluatorTest.findUnique({
      where: { concept: concept.toLowerCase() }
    });

    if (!test) {
      test = await prisma.evaluatorTest.create({
        data: {
          concept: concept.toLowerCase(),
          description: CONCEPT_DESCRIPTIONS[concept.toLowerCase()] || `${concept} programming concepts`
        }
      });
    }

    // Check if user has an existing attempt and delete it (as per requirement)
    const existingAttempt = await prisma.evaluatorAttempt.findUnique({
      where: {
        userId_testId: {
          userId,
          testId: test.id
        }
      }
    });

    if (existingAttempt) {
      await prisma.evaluatorAttempt.delete({
        where: { id: existingAttempt.id }
      });
    }

    // Generate questions using GROQ AI
    console.log(`Generating questions for ${concept}...`);
    
    const [easyQuestions, mediumQuestions, hardQuestions] = await Promise.all([
      generateQuestionsWithGroq(concept, 'easy', 10),
      generateQuestionsWithGroq(concept, 'medium', 10),
      generateQuestionsWithGroq(concept, 'hard', 10)
    ]);

    // Create new attempt with generated questions
    const attempt = await prisma.evaluatorAttempt.create({
      data: {
        userId,
        testId: test.id,
        questions: {
          create: [
            ...easyQuestions.map(q => ({
              questionText: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswer,
              difficulty: 'EASY',
              concept: q.concept || concept,
              explanation: q.explanation
            })),
            ...mediumQuestions.map(q => ({
              questionText: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswer,
              difficulty: 'MEDIUM',
              concept: q.concept || concept,
              explanation: q.explanation
            })),
            ...hardQuestions.map(q => ({
              questionText: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswer,
              difficulty: 'HARD',
              concept: q.concept || concept,
              explanation: q.explanation
            }))
          ]
        }
      },
      include: {
        questions: {
          select: {
            id: true,
            questionText: true,
            options: true,
            difficulty: true,
            concept: true
            // Don't include correctAnswer in response
          },
          orderBy: [
            { difficulty: 'asc' },
            { createdAt: 'asc' }
          ]
        },
        test: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Test started successfully',
      data: {
        attemptId: attempt.id,
        concept: test.concept,
        description: test.description,
        totalQuestions: 30,
        questions: attempt.questions,
        timeLimit: 45 // 45 minutes suggested time limit
      }
    });

  } catch (error) {
    console.error('Error starting evaluator test:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting test. Please try again.',
      error: error.message
    });
  }
});

/**
 * @desc Submit evaluator test answers
 * @route POST /api/v1/evaluator/submit/:attemptId
 * @access Private (User only)
 */
router.post('/submit/:attemptId', authenticate(['USER']), async (req, res) => {
  const { attemptId } = req.params;
  const { answers } = req.body;
  const userId = req.user.id;

  try {
    const attempt = await prisma.evaluatorAttempt.findFirst({
      where: {
        id: attemptId,
        userId,
        completed: false
      },
      include: {
        questions: true,
        test: true
      }
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found or already completed'
      });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Answers must be provided as an array'
      });
    }

    let easyScore = 0, mediumScore = 0, hardScore = 0;
    const weakAreas = new Set();
    const answersToCreate = [];
    const incorrectAnswers = [];

    const questionsMap = new Map(attempt.questions.map(q => [q.id, q]));

    answers.forEach(answer => {
      const question = questionsMap.get(answer.questionId);
      if (!question) return;

      const isCorrect = question.correctAnswer === answer.userAnswer;
      
      if (isCorrect) {
        switch (question.difficulty) {
          case 'EASY':
            easyScore += 1;
            break;
          case 'MEDIUM':
            mediumScore += 1;
            break;
          case 'HARD':
            hardScore += 1;
            break;
        }
      } else {
        weakAreas.add(question.concept);
        incorrectAnswers.push({
          questionText: question.questionText,
          userAnswer: answer.userAnswer,
          correctAnswer: question.correctAnswer,
          difficulty: question.difficulty,
          concept: question.concept,
          explanation: question.explanation
        });
      }

      answersToCreate.push({
        attemptId,
        questionId: question.id,
        userAnswer: answer.userAnswer,
        isCorrect,
        difficulty: question.difficulty,
        concept: question.concept,
        timeSpent: answer.timeSpent || null
      });
    });

    const totalScore = easyScore + mediumScore + hardScore;
    const percentage = Math.round((totalScore / 30) * 100);

    let performance;
    if (percentage >= 90) performance = 'EXCELLENT';
    else if (percentage >= 75) performance = 'GOOD';
    else if (percentage >= 60) performance = 'AVERAGE';
    else performance = 'NEEDS_IMPROVEMENT';

    console.log(`Generating personalized resources for ${attempt.test.concept}...`);

    // Generate personalized resources using AI
    const personalizedResources = await generatePersonalizedResources(
      attempt.test.concept,
      Array.from(weakAreas),
      performance,
      incorrectAnswers
    );

    const updatedAttempt = await prisma.$transaction(async (prisma) => {
      await prisma.evaluatorAnswer.createMany({
        data: answersToCreate
      });

      return await prisma.evaluatorAttempt.update({
        where: { id: attemptId },
        data: {
          easyScore,
          mediumScore,
          hardScore,
          totalScore,
          percentage,
          performance,
          weakAreas: Array.from(weakAreas),
          completed: true
        },
        include: {
          test: true
        }
      });
    });

    const getPerformanceMessage = (perf, score) => {
      switch (perf) {
        case 'EXCELLENT':
          return `Outstanding performance! You scored ${score}%. You have excellent understanding of ${attempt.test.concept}.`;
        case 'GOOD':
          return `Good job! You scored ${score}%. You have a solid grasp of ${attempt.test.concept} with room for improvement.`;
        case 'AVERAGE':
          return `Average performance. You scored ${score}%. Consider reviewing the concepts and practicing more.`;
        case 'NEEDS_IMPROVEMENT':
          return `You scored ${score}%. Don't worry! Focus on the weak areas and practice regularly to improve.`;
        default:
          return `You scored ${score}%.`;
      }
    };

    res.status(200).json({
      success: true,
      message: 'Test submitted successfully',
      data: {
        attemptId: updatedAttempt.id,
        concept: attempt.test.concept,
        scores: {
          easy: `${easyScore}/10`,
          medium: `${mediumScore}/10`,
          hard: `${hardScore}/10`,
          total: `${totalScore}/30`
        },
        percentage,
        performance,
        performanceMessage: getPerformanceMessage(performance, percentage),
        weakAreas: Array.from(weakAreas),
        personalizedRecommendations: personalizedResources,
        completedAt: updatedAttempt.updatedAt
      }
    });

  } catch (error) {
    console.error('Error submitting evaluator test:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting test',
      error: error.message
    });
  }
});

/**
 * @desc Get detailed analysis with study recommendations
 * @route GET /api/v1/evaluator/analysis/:attemptId
 * @access Private (User only)
 */
router.get('/analysis/:attemptId', authenticate(['USER']), async (req, res) => {
  const { attemptId } = req.params;
  const userId = req.user.id;

  try {
    const result = await prisma.evaluatorAttempt.findFirst({
      where: {
        id: attemptId,
        userId,
        completed: true
      },
      include: {
        test: true,
        answers: {
          include: {
            attempt: {
              include: {
                questions: {
                  where: { 
                    id: { 
                      in: await prisma.evaluatorAnswer.findMany({
                        where: { attemptId },
                        select: { questionId: true }
                      }).then(answers => answers.map(a => a.questionId))
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Test result not found'
      });
    }

    // Create detailed analysis
    const questionsMap = new Map();
    result.answers[0]?.attempt?.questions?.forEach(q => {
      questionsMap.set(q.id, q);
    });

    const detailedAnalysis = result.answers.map(answer => {
      const question = questionsMap.get(answer.questionId);
      return {
        questionText: question?.questionText,
        userAnswer: answer.userAnswer,
        correctAnswer: question?.correctAnswer,
        isCorrect: answer.isCorrect,
        difficulty: answer.difficulty,
        concept: answer.concept,
        explanation: question?.explanation,
        timeSpent: answer.timeSpent
      };
    });

    console.log(`Generating study recommendations for ${result.test.concept}...`);

    // Generate study recommendations
    const studyRecommendations = await generateStudyRecommendations(
      result.test.concept,
      detailedAnalysis,
      result.performance
    );

    // Generate fresh personalized resources based on current analysis
    const personalizedResources = await generatePersonalizedResources(
      result.test.concept,
      result.weakAreas,
      result.performance,
      detailedAnalysis.filter(q => !q.isCorrect)
    );

    res.status(200).json({
      success: true,
      data: {
        attemptId: result.id,
        concept: result.test.concept,
        description: result.test.description,
        scores: {
          easy: `${result.easyScore}/10`,
          medium: `${result.mediumScore}/10`,
          hard: `${result.hardScore}/10`,
          total: `${result.totalScore}/30`
        },
        percentage: result.percentage,
        performance: result.performance,
        weakAreas: result.weakAreas,
        detailedAnalysis,
        studyRecommendations,
        personalizedResources,
        completedAt: result.updatedAt
      }
    });
  } catch (error) {
    console.error('Error getting detailed analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting detailed analysis',
      error: error.message
    });
  }
});

/**
 * @desc Get user's test results
 * @route GET /api/v1/evaluator/results
 * @access Private (User only)
 */
router.get('/results', authenticate(['USER']), async (req, res) => {
  const userId = req.user.id;

  try {
    const results = await prisma.evaluatorAttempt.findMany({
      where: {
        userId,
        completed: true
      },
      include: {
        test: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const formattedResults = results.map(result => ({
      id: result.id,
      concept: result.test.concept,
      description: result.test.description,
      scores: {
        easy: `${result.easyScore}/10`,
        medium: `${result.mediumScore}/10`,
        hard: `${result.hardScore}/10`,
        total: `${result.totalScore}/30`
      },
      percentage: result.percentage,
      performance: result.performance,
      weakAreas: result.weakAreas,
      completedAt: result.updatedAt
    }));

    res.status(200).json({
      success: true,
      data: formattedResults,
      count: results.length
    });
  } catch (error) {
    console.error('Error getting user results:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting results',
      error: error.message
    });
  }
});

/**
 * @desc Get specific test result with detailed analysis
 * @route GET /api/v1/evaluator/result/:attemptId
 * @access Private (User only)
 */
router.get('/result/:attemptId', authenticate(['USER']), async (req, res) => {
  const { attemptId } = req.params;
  const userId = req.user.id;

  try {
    const result = await prisma.evaluatorAttempt.findFirst({
      where: {
        id: attemptId,
        userId,
        completed: true
      },
      include: {
        test: true,
        answers: {
          include: {
            attempt: {
              include: {
                questions: {
                  where: { 
                    id: { 
                      in: await prisma.evaluatorAnswer.findMany({
                        where: { attemptId },
                        select: { questionId: true }
                      }).then(answers => answers.map(a => a.questionId))
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Test result not found'
      });
    }

    // Get learning resources for weak areas
    const recommendedResources = [];
    for (const weakArea of result.weakAreas) {
      const resources = LEARNING_RESOURCES[result.test.concept]?.[weakArea] || 
                       LEARNING_RESOURCES[result.test.concept]?.['basics'] || [];
      recommendedResources.push(...resources);
    }

    // Detailed question analysis
    const questionsMap = new Map();
    result.answers[0]?.attempt?.questions?.forEach(q => {
      questionsMap.set(q.id, q);
    });

    const detailedAnalysis = result.answers.map(answer => {
      const question = questionsMap.get(answer.questionId);
      return {
        questionText: question?.questionText,
        userAnswer: answer.userAnswer,
        correctAnswer: question?.correctAnswer,
        isCorrect: answer.isCorrect,
        difficulty: answer.difficulty,
        concept: answer.concept,
        explanation: question?.explanation,
        timeSpent: answer.timeSpent
      };
    });

    res.status(200).json({
      success: true,
      data: {
        attemptId: result.id,
        concept: result.test.concept,
        description: result.test.description,
        scores: {
          easy: `${result.easyScore}/10`,
          medium: `${result.mediumScore}/10`,
          hard: `${result.hardScore}/10`,
          total: `${result.totalScore}/30`
        },
        percentage: result.percentage,
        performance: result.performance,
        weakAreas: result.weakAreas,
        recommendedResources: recommendedResources.slice(0, 8),
        detailedAnalysis,
        completedAt: result.updatedAt
      }
    });
  } catch (error) {
    console.error('Error getting detailed result:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting detailed result',
      error: error.message
    });
  }
});

/**
 * @desc Get all student results for admin
 * @route GET /api/v1/evaluator/admin/results
 * @access Private (Admin only)
 */
router.get('/admin/results', authenticate(['ADMIN']), async (req, res) => {
  const { concept, performance, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const whereClause = {
      completed: true,
      ...(concept && { test: { concept } }),
      ...(performance && { performance })
    };

    const [results, totalCount] = await Promise.all([
      prisma.evaluatorAttempt.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          test: {
            select: {
              concept: true,
              description: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.evaluatorAttempt.count({ where: whereClause })
    ]);

    const formattedResults = results.map(result => ({
      id: result.id,
      student: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email
      },
      concept: result.test.concept,
      scores: {
        easy: `${result.easyScore}/10`,
        medium: `${result.mediumScore}/10`,
        hard: `${result.hardScore}/10`,
        total: `${result.totalScore}/30`
      },
      percentage: result.percentage,
      performance: result.performance,
      weakAreas: result.weakAreas,
      completedAt: result.updatedAt
    }));

    res.status(200).json({
      success: true,
      data: formattedResults,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalResults: totalCount,
        resultsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting admin results:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting admin results',
      error: error.message
    });
  }
});

/**
 * @desc Get specific student's test result for admin
 * @route GET /api/v1/evaluator/admin/result/:attemptId
 * @access Private (Admin only)
 */
router.get('/admin/result/:attemptId', authenticate(['ADMIN']), async (req, res) => {
  const { attemptId } = req.params;

  try {
    const result = await prisma.evaluatorAttempt.findFirst({
      where: {
        id: attemptId,
        completed: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        test: true,
        answers: true,
        questions: true
      }
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Test result not found'
      });
    }

    // Create questions map for detailed analysis
    const questionsMap = new Map(result.questions.map(q => [q.id, q]));

    const detailedAnalysis = result.answers.map(answer => {
      const question = questionsMap.get(answer.questionId);
      return {
        questionText: question?.questionText,
        userAnswer: answer.userAnswer,
        correctAnswer: question?.correctAnswer,
        isCorrect: answer.isCorrect,
        difficulty: answer.difficulty,
        concept: answer.concept,
        timeSpent: answer.timeSpent
      };
    });

    // Calculate concept-wise performance
    const conceptPerformance = {};
    result.answers.forEach(answer => {
      if (!conceptPerformance[answer.concept]) {
        conceptPerformance[answer.concept] = { correct: 0, total: 0 };
      }
      conceptPerformance[answer.concept].total += 1;
      if (answer.isCorrect) {
        conceptPerformance[answer.concept].correct += 1;
      }
    });

    // Calculate difficulty-wise performance
    const difficultyPerformance = {
      EASY: { correct: result.easyScore, total: 10 },
      MEDIUM: { correct: result.mediumScore, total: 10 },
      HARD: { correct: result.hardScore, total: 10 }
    };

    res.status(200).json({
      success: true,
      data: {
        attemptId: result.id,
        student: result.user,
        concept: result.test.concept,
        description: result.test.description,
        scores: {
          easy: `${result.easyScore}/10`,
          medium: `${result.mediumScore}/10`,
          hard: `${result.hardScore}/10`,
          total: `${result.totalScore}/30`
        },
        percentage: result.percentage,
        performance: result.performance,
        weakAreas: result.weakAreas,
        conceptPerformance,
        difficultyPerformance,
        detailedAnalysis,
        completedAt: result.updatedAt
      }
    });
  } catch (error) {
    console.error('Error getting admin result detail:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting result details',
      error: error.message
    });
  }
});

/**
 * @desc Get evaluator analytics for admin dashboard
 * @route GET /api/v1/evaluator/admin/analytics
 * @access Private (Admin only)
 */
router.get('/admin/analytics', authenticate(['ADMIN']), async (req, res) => {
  try {
    // Total attempts and completion rate
    const [totalAttempts, completedAttempts] = await Promise.all([
      prisma.evaluatorAttempt.count(),
      prisma.evaluatorAttempt.count({ where: { completed: true } })
    ]);

    // Performance distribution
    const performanceDistribution = await prisma.evaluatorAttempt.groupBy({
      by: ['performance'],
      where: { completed: true },
      _count: { performance: true }
    });

    // Concept-wise statistics
    const conceptStats = await prisma.evaluatorAttempt.groupBy({
      by: ['testId'],
      where: { completed: true },
      _count: { testId: true },
      _avg: { percentage: true }
    });

    // Get test details for concept stats
    const tests = await prisma.evaluatorTest.findMany();
    const testMap = new Map(tests.map(t => [t.id, t.concept]));

    const conceptStatistics = conceptStats.map(stat => ({
      concept: testMap.get(stat.testId),
      totalAttempts: stat._count.testId,
      averagePercentage: Math.round(stat._avg.percentage || 0)
    }));

    // Most challenging concepts (lowest average scores)
    const challengingConcepts = conceptStatistics
      .sort((a, b) => a.averagePercentage - b.averagePercentage)
      .slice(0, 5);

    // Top performing students
    const topStudents = await prisma.evaluatorAttempt.findMany({
      where: { completed: true },
      include: {
        user: {
          select: { name: true, email: true }
        },
        test: {
          select: { concept: true }
        }
      },
      orderBy: { percentage: 'desc' },
      take: 10
    });

    // Recent activity
    const recentActivity = await prisma.evaluatorAttempt.findMany({
      where: { completed: true },
      include: {
        user: {
          select: { name: true, email: true }
        },
        test: {
          select: { concept: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalAttempts,
          completedAttempts,
          completionRate: totalAttempts > 0 ? Math.round((completedAttempts / totalAttempts) * 100) : 0
        },
        performanceDistribution: performanceDistribution.map(p => ({
          performance: p.performance,
          count: p._count.performance
        })),
        conceptStatistics,
        challengingConcepts,
        topStudents: topStudents.map(student => ({
          name: student.user.name,
          email: student.user.email,
          concept: student.test.concept,
          percentage: student.percentage,
          completedAt: student.updatedAt
        })),
        recentActivity: recentActivity.map(activity => ({
          studentName: activity.user.name,
          concept: activity.test.concept,
          percentage: activity.percentage,
          performance: activity.performance,
          completedAt: activity.updatedAt
        }))
      }
    });
  } catch (error) {
    console.error('Error getting evaluator analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting analytics',
      error: error.message
    });
  }
});

/**
 * @desc Add or update learning resources
 * @route POST /api/v1/evaluator/admin/resources
 * @access Private (Admin only)
 */
router.post('/admin/resources', authenticate(['ADMIN']), async (req, res) => {
  const { concept, subConcept, title, description, type, url, difficulty } = req.body;

  try {
    if (!concept || !title || !type || !url || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'concept, title, type, url, and difficulty are required'
      });
    }

    const resource = await prisma.learningResource.create({
      data: {
        concept: concept.toLowerCase(),
        subConcept: subConcept?.toLowerCase(),
        title,
        description: description || '',
        type,
        url,
        difficulty,
        isActive: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Learning resource added successfully',
      data: resource
    });
  } catch (error) {
    console.error('Error adding learning resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding learning resource',
      error: error.message
    });
  }
});

/**
 * @desc Get learning resources by concept
 * @route GET /api/v1/evaluator/resources/:concept
 * @access Public
 */
router.get('/resources/:concept', authMiddleware, async (req, res) => {
  const { concept } = req.params;
  const { difficulty, type, subConcept } = req.query;

  try {
    const whereClause = {
      concept: concept.toLowerCase(),
      isActive: true,
      ...(difficulty && { difficulty }),
      ...(type && { type }),
      ...(subConcept && { subConcept: subConcept.toLowerCase() })
    };

    const resources = await prisma.learningResource.findMany({
      where: whereClause,
      orderBy: [
        { difficulty: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    res.status(200).json({
      success: true,
      data: resources,
      count: resources.length
    });
  } catch (error) {
    console.error('Error getting learning resources:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting learning resources',
      error: error.message
    });
  }
});

/**
 * @desc Get user's current active test (if any)
 * @route GET /api/v1/evaluator/current-test
 * @access Private (User only)
 */
router.get('/current-test', authenticate(['USER']), async (req, res) => {
  const userId = req.user.id;

  try {
    const activeTest = await prisma.evaluatorAttempt.findFirst({
      where: {
        userId,
        completed: false
      },
      include: {
        test: true,
        questions: {
          select: {
            id: true,
            questionText: true,
            options: true,
            difficulty: true,
            concept: true
          },
          orderBy: [
            { difficulty: 'asc' },
            { createdAt: 'asc' }
          ]
        }
      }
    });

    if (!activeTest) {
      return res.status(404).json({
        success: false,
        message: 'No active test found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        attemptId: activeTest.id,
        concept: activeTest.test.concept,
        description: activeTest.test.description,
        questions: activeTest.questions,
        totalQuestions: activeTest.questions.length,
        startedAt: activeTest.createdAt
      }
    });
  } catch (error) {
    console.error('Error getting current test:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting current test',
      error: error.message
    });
  }
});

export default router;