import React, { useEffect, useState } from 'react';
import { TestResult, Question } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { generateAnalysis } from '../services/geminiService';
import { Check, X, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { StructuredExplanation } from '../components/TestInterface';

interface ResultsProps {
  result: TestResult | null;
  goHome: () => void;
}

const QuestionReviewCard: React.FC<{
  q: Question;
  userAnswerIdx?: number;
  index: number;
}> = ({ q, userAnswerIdx, index }) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const isCorrect = userAnswerIdx === q.correctOptionIndex;

  return (
    <div className="border-b border-gray-100 py-8 last:border-0">
      <div className="flex items-baseline mb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400 w-16">Q{String(index + 1).padStart(2, '0')}</span>
        <span className={`text-xs font-bold uppercase tracking-widest ${isCorrect ? 'text-black' : 'text-gray-400 line-through'}`}>
          {isCorrect ? 'Correct' : 'Incorrect'}
        </span>
      </div>
      <p className="text-lg font-light text-black mb-6 pl-16">{q.text}</p>
      
      <div className="pl-16 space-y-2">
        {q.options.map((opt, optIdx) => {
          let style = "text-gray-400";
          if (optIdx === q.correctOptionIndex) style = "text-black font-medium";
          if (optIdx === userAnswerIdx && !isCorrect) style = "text-gray-500 underline decoration-gray-300";
          
          return (
             <div key={optIdx} className={`text-sm flex items-center ${style}`}>
               <span className="w-6">{String.fromCharCode(65 + optIdx)}.</span>
               {opt}
               {optIdx === q.correctOptionIndex && <Check className="w-4 h-4 ml-4" />}
             </div>
          )
        })}
      </div>

      <div className="pl-16 mt-6">
        <button 
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-xs font-bold uppercase tracking-widest text-black border-b border-black pb-1 hover:opacity-50 transition-opacity"
        >
          {showExplanation ? 'Hide Analysis' : 'View Analysis'}
        </button>

        {showExplanation && q.explanation && (
          <div className="mt-6 bg-gray-50 p-6 border border-gray-100">
             <StructuredExplanation text={q.explanation} />
          </div>
        )}
      </div>
    </div>
  );
};

export const Results: React.FC<ResultsProps> = ({ result, goHome }) => {
  const [aiAnalysis, setAiAnalysis] = useState<{ summary: string; tips: string[] } | null>(null);

  useEffect(() => {
    if (result) {
      generateAnalysis(result.score, result.totalQuestions * 4, result.subject, [result.chapter])
        .then(setAiAnalysis);
    }
  }, [result]);

  if (!result) return <div>No result.</div>;

  const accuracyData = [
    { name: 'Correct', value: result.correctCount, color: '#000000' },
    { name: 'Incorrect', value: result.incorrectCount, color: '#e5e7eb' },
    { name: 'Skipped', value: result.totalQuestions - (result.correctCount + result.incorrectCount), color: '#f3f4f6' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="flex justify-between items-end mb-16 border-b border-black pb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Assessment Report</p>
          <h1 className="text-4xl font-light text-black uppercase">{result.chapter}</h1>
        </div>
        <button onClick={goHome} className="text-xs font-bold uppercase tracking-widest border border-black px-6 py-3 hover:bg-black hover:text-white transition-colors">
          Return to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2 mb-2">Score</p>
          <div className="text-5xl font-light">{result.score}</div>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2 mb-2">Accuracy</p>
          <div className="text-5xl font-light">
             {Math.round((result.correctCount / (result.correctCount + result.incorrectCount || 1)) * 100)}%
          </div>
        </div>
        <div>
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2 mb-2">Time</p>
           <div className="text-5xl font-light">{Math.floor(result.timeTakenSeconds / 60)}m</div>
        </div>
        <div className="h-24">
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie
                 data={accuracyData}
                 cx="50%"
                 cy="50%"
                 innerRadius={30}
                 outerRadius={40}
                 dataKey="value"
                 stroke="none"
               >
                 {accuracyData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={entry.color} />
                 ))}
               </Pie>
             </PieChart>
           </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-black text-white p-8 mb-16">
        <div className="flex items-center mb-6">
           <RefreshCw className="w-5 h-5 mr-4 animate-spin-slow" />
           <h3 className="font-bold text-sm uppercase tracking-widest">AI Performance Audit</h3>
        </div>
        
        {aiAnalysis ? (
          <div className="animate-fade-in">
            <p className="text-xl font-light leading-relaxed mb-8 border-l border-white/20 pl-6">
              "{aiAnalysis.summary}"
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/10 pt-8">
              {aiAnalysis.tips.map((tip, idx) => (
                <div key={idx}>
                  <span className="block text-xs font-bold text-gray-500 mb-2">ACTION 0{idx + 1}</span>
                  <p className="text-sm text-gray-300">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
           <p className="text-gray-500 text-sm uppercase tracking-widest">Analyzing data points...</p>
        )}
      </div>

      <div>
        <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-8">Detailed Review</h3>
        <div>
          {result.questions.map((q, idx) => (
            <QuestionReviewCard 
              key={q.id} 
              q={q} 
              index={idx} 
              userAnswerIdx={result.userAnswers[q.id]} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};