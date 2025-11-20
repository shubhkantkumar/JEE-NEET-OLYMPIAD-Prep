import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { TestInterface } from './components/TestInterface';
import { Results } from './pages/Results';
import { User, ExamType, Subject, Difficulty, Question, TestResult } from './types';
import { generateQuestions } from './services/geminiService';

// Mock local storage keys
const STORAGE_KEY_USER = 'prepmaster_user';
const STORAGE_KEY_RESULTS = 'prepmaster_results';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingTest, setLoadingTest] = useState(false);
  const [activeTest, setActiveTest] = useState<{questions: Question[], subject: string, chapter: string, mode: 'test' | 'practice' | 'olympiad'} | null>(null);
  const [currentResult, setCurrentResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogin = (name: string, targetExam: ExamType) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
      targetExam,
    };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
    setActiveTest(null);
    setCurrentResult(null);
  };

  const startTest = async (subject: Subject, chapter: string, difficulty: Difficulty, mode: 'test' | 'practice' | 'pyq' | 'olympiad' = 'test') => {
    setLoadingTest(true);
    try {
      let apiMode: 'practice' | 'pyq' | 'olympiad' = 'practice';
      if (mode === 'pyq') apiMode = 'pyq';
      if (mode === 'olympiad') apiMode = 'olympiad';
      
      const questions = await generateQuestions(subject, chapter, difficulty, 10, apiMode);
      
      setActiveTest({ 
        questions, 
        subject, 
        chapter,
        mode: (mode === 'pyq' || mode === 'olympiad') ? 'practice' : mode === 'practice' ? 'practice' : 'test'
      });
      
      if (mode === 'olympiad') {
         setActiveTest({ questions, subject, chapter, mode: 'olympiad' });
      }

      window.location.hash = '/test';
    } catch (error) {
      console.error(error);
      alert("Failed to start test. Please check your API key.");
    } finally {
      setLoadingTest(false);
    }
  };

  const handleTestComplete = (answers: Record<string, number>, timeTaken: number) => {
    if (!activeTest || !user) return;

    let score = 0;
    let correct = 0;
    let incorrect = 0;

    activeTest.questions.forEach(q => {
      if (answers[q.id] !== undefined) {
        if (answers[q.id] === q.correctOptionIndex) {
          score += 4;
          correct++;
        } else {
          score -= 1;
          incorrect++;
        }
      }
    });

    const result: TestResult = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      score,
      totalQuestions: activeTest.questions.length,
      correctCount: correct,
      incorrectCount: incorrect,
      timeTakenSeconds: timeTaken,
      questions: activeTest.questions,
      userAnswers: answers,
      subject: activeTest.subject as Subject,
      chapter: activeTest.chapter
    };

    setCurrentResult(result);
    
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY_RESULTS) || '[]');
    localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify([result, ...history]));
    
    setActiveTest(null);
    window.location.hash = '/result';
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-white text-black selection:bg-gray-200">
        <Navbar user={user} logout={handleLogout} />
        
        <Routes>
          <Route path="/" element={
            user ? <Navigate to="/dashboard" /> : (
              <div className="max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                <div className="mb-8 px-4 py-1 border border-black rounded-full text-xs font-semibold tracking-widest uppercase">
                  Elite Preparation Platform
                </div>
                <h1 className="text-5xl tracking-tight font-light text-black sm:text-7xl mb-6">
                  PREP<span className="font-bold">MASTER</span>
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 font-light">
                  Master JEE, NEET & Olympiads. <br/> 
                  Twenty years of past papers. Infinite AI generation.
                </p>
                <div className="mt-12">
                   <div onClick={() => window.location.hash = '/login'} className="cursor-pointer inline-block px-10 py-4 border border-black bg-black text-white text-sm font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300">
                     Start Now
                   </div>
                </div>
                
                <div className="mt-32 grid grid-cols-1 gap-12 sm:grid-cols-3 border-t border-gray-100 pt-16 w-full max-w-5xl">
                   <div className="text-left">
                      <div className="text-3xl font-light mb-2">20+</div>
                      <p className="text-xs font-bold tracking-widest uppercase text-gray-400">Years of PYQs</p>
                   </div>
                   <div className="text-left">
                      <div className="text-3xl font-light mb-2">AI</div>
                      <p className="text-xs font-bold tracking-widest uppercase text-gray-400">Adaptive Analysis</p>
                   </div>
                   <div className="text-left">
                      <div className="text-3xl font-light mb-2">HD</div>
                      <p className="text-xs font-bold tracking-widest uppercase text-gray-400">Video Solutions</p>
                   </div>
                </div>
              </div>
            )
          } />
          
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
          
          <Route path="/signup" element={<Navigate to="/login" />} />

          <Route path="/dashboard" element={
            user ? <Dashboard user={user} startTest={startTest} loading={loadingTest} /> : <Navigate to="/login" />
          } />

          <Route path="/test" element={
            activeTest ? (
              <TestInterface 
                questions={activeTest.questions} 
                subjectName={activeTest.subject}
                onComplete={handleTestComplete}
                mode={activeTest.mode === 'practice' ? 'practice' : activeTest.mode === 'olympiad' ? 'olympiad' : 'test'}
              />
            ) : <Navigate to="/dashboard" />
          } />

          <Route path="/result" element={
             currentResult ? <Results result={currentResult} goHome={() => window.location.hash = '/dashboard'} /> : <Navigate to="/dashboard" />
          } />
          
          <Route path="/leaderboard" element={
             user ? (
                <div className="max-w-5xl mx-auto px-4 py-16">
                  <h2 className="text-3xl font-light mb-12 tracking-tight text-center">WEEKLY RANKING</h2>
                  <div className="overflow-hidden">
                    <table className="min-w-full text-left">
                      <thead>
                        <tr className="border-b border-black">
                          <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Rank</th>
                          <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Candidate</th>
                          <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Score</th>
                          <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Accuracy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {[
                          { rank: 1, name: 'Rahul Kumar', score: 280, acc: '92%' },
                          { rank: 2, name: 'Sneha Singh', score: 275, acc: '89%' },
                          { rank: 3, name: user.name, score: 240, acc: '85%' },
                          { rank: 4, name: 'Amit Verma', score: 230, acc: '82%' },
                        ].map((row) => (
                          <tr key={row.rank} className="group hover:bg-gray-50 transition-colors">
                            <td className="py-6 text-xl font-light">0{row.rank}</td>
                            <td className="py-6 font-medium">{row.name}</td>
                            <td className="py-6 font-light text-right">{row.score}</td>
                            <td className="py-6 font-light text-right text-gray-500">{row.acc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
             ) : <Navigate to="/login" />
          } />

        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;