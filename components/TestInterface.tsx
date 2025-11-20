import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { Clock, ChevronRight, ChevronLeft, Flag, Calendar, Check, PlayCircle, X, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface TestInterfaceProps {
  questions: Question[];
  onComplete: (answers: Record<string, number>, timeTaken: number) => void;
  subjectName: string;
  mode: 'test' | 'practice' | 'olympiad';
}

const VideoModal: React.FC<{ query: string, onClose: () => void }> = ({ query, onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl bg-gray-900 shadow-2xl border border-gray-800 rounded-none overflow-hidden flex flex-col">
        {/* Player Header */}
        <div className="flex justify-between items-center p-4 bg-black border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <PlayCircle className="w-4 h-4 text-white" />
            <h3 className="text-white font-bold uppercase tracking-widest text-xs">
              Video Solution
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Responsive Video Container (16:9) */}
        <div className="relative w-full pb-[56.25%] bg-black">
           <iframe 
             className="absolute top-0 left-0 w-full h-full"
             src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}&autoplay=1`} 
             title="Video Solution Player"
             frameBorder="0" 
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
             allowFullScreen
           ></iframe>
        </div>

        {/* Player Footer */}
        <div className="p-4 bg-black border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
           <p className="text-[10px] uppercase tracking-widest text-gray-500">
             * Generated based on concept: "{query}"
           </p>
           <a 
             href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`} 
             target="_blank" 
             rel="noreferrer"
             className="flex items-center px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors"
           >
             Open in YouTube <ExternalLink className="w-3 h-3 ml-2" />
           </a>
        </div>
      </div>
    </div>
  );
};

export const StructuredExplanation: React.FC<{ text: string }> = ({ text }) => {
  const parseSections = (rawText: string) => {
    const sections = { concept: '', formulas: '', solution: '' };
    const conceptMatch = rawText.match(/###\s*Key Concept\s*([\s\S]*?)(?=###|$)/i);
    const formulaMatch = rawText.match(/###\s*Formulas?.*?\s*([\s\S]*?)(?=###|$)/i);
    const solutionMatch = rawText.match(/###\s*.*Solution\s*([\s\S]*?)(?=###|$)/i);

    if (conceptMatch) sections.concept = conceptMatch[1].trim();
    if (formulaMatch) sections.formulas = formulaMatch[1].trim();
    if (solutionMatch) sections.solution = solutionMatch[1].trim();
    if (!sections.concept && !sections.formulas && !sections.solution) sections.solution = rawText;
    return sections;
  };

  const data = parseSections(text);

  const SectionItem = ({ title, content, defaultOpen = true }: any) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    if (!content) return null;

    return (
      <div className="border-b border-gray-200 last:border-0 py-4">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between text-left group"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-black transition-colors">{title}</span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {isOpen && (
          <div className="mt-3 text-gray-800 text-sm leading-loose font-serif whitespace-pre-wrap">
            {content}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-8 pt-8 border-t border-black animate-fade-in">
      <SectionItem title="Core Concept" content={data.concept} />
      <SectionItem title="Mathematical Rules" content={data.formulas} />
      <SectionItem title="Solution Path" content={data.solution} />
    </div>
  );
};

export const TestInterface: React.FC<TestInterfaceProps> = ({ questions, onComplete, subjectName, mode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(questions.length * (mode === 'test' ? 120 : 300)); 
  const [initialTime] = useState(questions.length * (mode === 'test' ? 120 : 300));
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    setShowSolution(false);
  }, [currentIndex]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionIndex: number) => {
    setAnswers({ ...answers, [questions[currentIndex].id]: optionIndex });
  };

  const toggleReview = () => {
    const newSet = new Set(markedForReview);
    const qId = questions[currentIndex].id;
    if (newSet.has(qId)) newSet.delete(qId);
    else newSet.add(qId);
    setMarkedForReview(newSet);
  };

  const handleSubmit = () => {
    const timeTaken = initialTime - timeLeft;
    onComplete(answers, timeTaken);
  };

  const currentQuestion = questions[currentIndex];
  const isReview = markedForReview.has(currentQuestion.id);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-white">
      {/* Header */}
      <div className="bg-white px-8 py-4 flex justify-between items-center border-b border-gray-100">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900">
            {subjectName} <span className="text-gray-400 mx-2">/</span> {mode}
          </h2>
        </div>
        <div className="flex items-center space-x-6">
          <div className="font-mono text-lg tracking-wider text-black">
            {formatTime(timeLeft)}
          </div>
          <button 
            onClick={handleSubmit}
            className="bg-black hover:bg-gray-800 text-white px-6 py-2 text-xs font-bold uppercase tracking-widest transition-colors"
          >
            Submit
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Question Area */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center space-x-4">
                 <span className="text-3xl font-light text-gray-300">
                   {(currentIndex + 1).toString().padStart(2, '0')}
                 </span>
                 {currentQuestion.year && (
                   <span className="px-2 py-1 border border-gray-200 text-[10px] uppercase font-bold tracking-widest text-gray-500">
                     {currentQuestion.year}
                   </span>
                 )}
              </div>
              <button onClick={toggleReview} className={`text-xs font-bold uppercase tracking-widest flex items-center ${isReview ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}>
                <Flag className="w-3 h-3 mr-2" fill={isReview ? "currentColor" : "none"} />
                {isReview ? 'Marked' : 'Mark'}
              </button>
            </div>
            
            <p className="text-xl md:text-2xl text-black mb-12 leading-normal font-light">
              {currentQuestion.text}
            </p>

            <div className="space-y-4">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = answers[currentQuestion.id] === idx;
                const isCorrect = currentQuestion.correctOptionIndex === idx;

                let containerStyle = "border-gray-200 text-gray-600 hover:border-black";
                
                if (showSolution) {
                   if (isCorrect) containerStyle = "border-black bg-gray-50 text-black";
                   else if (isSelected) containerStyle = "border-gray-300 bg-gray-100 text-gray-400 line-through decoration-gray-400";
                   else containerStyle = "border-gray-100 text-gray-300";
                } else if (isSelected) {
                   containerStyle = "border-black bg-black text-white";
                }

                return (
                  <div 
                    key={idx}
                    onClick={() => !showSolution && handleOptionSelect(idx)}
                    className={`p-6 border cursor-pointer transition-all flex items-center group ${containerStyle}`}
                  >
                    <div className={`w-6 h-6 flex items-center justify-center mr-6 text-xs font-bold uppercase ${isSelected || (showSolution && isCorrect) ? 'opacity-100' : 'opacity-40'}`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-lg font-light">{opt}</span>
                    {showSolution && isCorrect && <Check className="ml-auto w-5 h-5" />}
                  </div>
                );
              })}
            </div>

            {(mode === 'practice' || mode === 'olympiad') && (
              <div className="mt-12 flex gap-4">
                {!showSolution ? (
                  <>
                    <button 
                      onClick={() => setShowSolution(true)}
                      className="px-6 py-3 border border-black text-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                    >
                      Reveal Logic
                    </button>
                    {currentQuestion.videoQuery && (
                      <button 
                        onClick={() => setVideoUrl(currentQuestion.videoQuery || currentQuestion.text)}
                        className="px-6 py-3 border border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-black hover:border-black transition-colors flex items-center"
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Video
                      </button>
                    )}
                  </>
                ) : (
                  <div className="w-full">
                     <StructuredExplanation text={currentQuestion.explanation || ''} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Side Palette */}
        <div className="w-20 border-l border-gray-100 flex flex-col items-center py-8 hidden lg:flex">
          <div className="space-y-2 w-full px-4">
              {questions.map((q, idx) => {
                const ans = answers[q.id] !== undefined;
                const curr = currentIndex === idx;
                
                let dotClass = "bg-gray-200";
                if (ans) dotClass = "bg-black";
                if (curr) dotClass = "ring-2 ring-offset-2 ring-black bg-transparent border-2 border-black";

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className="w-full flex justify-center py-2 group"
                  >
                    <div className={`w-2 h-2 rounded-full transition-all ${dotClass}`}></div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 flex gap-2">
         <button 
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(c => c - 1)}
            className="w-12 h-12 bg-white border border-gray-200 flex items-center justify-center hover:border-black disabled:opacity-20 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
             disabled={currentIndex === questions.length - 1}
             onClick={() => setCurrentIndex(c => c + 1)}
             className="w-12 h-12 bg-black text-white flex items-center justify-center hover:bg-gray-800 disabled:opacity-20 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
      </div>

      {videoUrl && <VideoModal query={videoUrl} onClose={() => setVideoUrl(null)} />}
    </div>
  );
};