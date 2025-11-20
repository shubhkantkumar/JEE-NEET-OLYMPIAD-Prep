export enum ExamType {
  JEE = 'JEE',
  NEET = 'NEET',
  OLYMPIAD = 'OLYMPIAD'
}

export enum Subject {
  PHYSICS = 'Physics',
  CHEMISTRY = 'Chemistry',
  MATHS = 'Maths',
  BIOLOGY = 'Biology'
}

export enum QuestionType {
  MCQ = 'MCQ', // Single correct
  NUMERICAL = 'NUMERICAL' // Integer type (simplified for this demo to MCQ structure)
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number; // 0-3
  explanation?: string;
  subject: Subject;
  chapter: string;
  difficulty: Difficulty;
  year?: string; // e.g., "JEE Main 2023", "NEET 2021", "NSEP 2018"
  videoQuery?: string; // Search term for video solution
}

export interface User {
  id: string;
  name: string;
  email: string;
  targetExam: ExamType;
  avatarUrl?: string;
}

export interface TestResult {
  id: string;
  date: string; // ISO string
  score: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  timeTakenSeconds: number;
  questions: Question[];
  userAnswers: Record<string, number>; // questionId -> selectedOptionIndex
  subject: Subject;
  chapter: string;
}

export interface Chapter {
  id: string;
  name: string;
  subject: Subject;
  questionCount?: number; // Mock stats
}