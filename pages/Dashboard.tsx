import React, { useState } from 'react';
import { User, Subject, ExamType, Difficulty } from '../types';
import { SUBJECTS_JEE, SUBJECTS_NEET, MOCK_CHAPTERS } from '../constants';
import { Brain, BookOpen, Trophy, X, ChevronRight } from 'lucide-react';
import { NotesModal } from '../components/NotesModal';
import { generateChapterNotes } from '../services/geminiService';

interface DashboardProps {
  user: User;
  startTest: (subject: Subject, chapter: string, difficulty: Difficulty, mode: 'practice' | 'pyq' | 'olympiad') => void;
  loading: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, startTest, loading }) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [viewingNotes, setViewingNotes] = useState<{subject: string, chapter: string, content: string | null, loading: boolean} | null>(null);
  const [pyqConfig, setPyqConfig] = useState<{subject: Subject, chapter: string} | null>(null);
  const [olympiadMode, setOlympiadMode] = useState<boolean>(false);
  
  const subjects = (olympiadMode || user.targetExam === ExamType.JEE || user.targetExam === ExamType.OLYMPIAD) 
    ? SUBJECTS_JEE 
    : SUBJECTS_NEET;

  const handleViewNotes = async (subject: Subject, chapter: string) => {
    setViewingNotes({ subject, chapter, content: null, loading: true });
    const notes = await generateChapterNotes(subject, chapter);
    setViewingNotes({ subject, chapter, content: notes.content, loading: false });
  };

  const confirmPyqStart = (difficulty: Difficulty) => {
    if (pyqConfig) {
      startTest(pyqConfig.subject, pyqConfig.chapter, difficulty, 'pyq');
      setPyqConfig(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 border-b border-gray-100 pb-8">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">DASHBOARD</p>
          <h1 className="text-4xl font-light text-black">Hello, {user.name}</h1>
        </div>
        
        <button 
          onClick={() => setOlympiadMode(!olympiadMode)}
          className={`flex items-center px-6 py-3 border text-xs font-bold uppercase tracking-widest transition-all ${
            olympiadMode 
            ? 'bg-black text-white border-black' 
            : 'bg-white text-black border-gray-200 hover:border-black'
          }`}
        >
          <Trophy className="w-4 h-4 mr-3" />
          {olympiadMode ? 'Olympiad Mode Active' : 'Switch to Olympiad'}
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-light mb-6 uppercase tracking-wide border-l-4 border-black pl-4">Select Subject</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <div 
              key={sub}
              onClick={() => setSelectedSubject(selectedSubject === sub ? null : sub)}
              className={`cursor-pointer p-8 border transition-all duration-300 ${
                selectedSubject === sub 
                ? 'border-black bg-black text-white' 
                : 'border-gray-200 bg-white text-black hover:border-black'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <Brain className={`w-6 h-6 ${selectedSubject === sub ? 'text-white' : 'text-black'}`} />
                {selectedSubject === sub && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
              <h3 className="text-xl font-light tracking-wide mb-1">{sub}</h3>
              <p className={`text-xs font-bold uppercase tracking-widest ${selectedSubject === sub ? 'text-gray-400' : 'text-gray-400'}`}>
                {MOCK_CHAPTERS[sub].length} Chapters
              </p>
            </div>
          ))}
        </div>
      </div>

      {selectedSubject && (
        <div className="mt-12 animate-fade-in">
          <h3 className="text-lg font-light mb-6 uppercase tracking-wide border-l-4 border-gray-200 pl-4">
            Chapters in {selectedSubject}
          </h3>
          <div className="border-t border-gray-100">
              {MOCK_CHAPTERS[selectedSubject].map((chap) => (
                <div key={chap.id} className="py-6 border-b border-gray-100 hover:bg-gray-50 flex flex-col md:flex-row md:items-center justify-between transition-colors group gap-4 px-2">
                  <div>
                    <h4 className="text-lg font-normal text-gray-900">{chap.name}</h4>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleViewNotes(selectedSubject, chap.name)}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-gray-300 hover:border-black hover:text-black text-gray-500 transition-all"
                    >
                      Notes
                    </button>
                    
                    {olympiadMode ? (
                      <button
                        disabled={loading}
                        onClick={() => startTest(selectedSubject, chap.name, Difficulty.HARD, 'olympiad')}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-black text-white hover:bg-gray-800 transition-all disabled:opacity-50"
                      >
                        Olympiad Set
                      </button>
                    ) : (
                      <button
                        disabled={loading}
                        onClick={() => setPyqConfig({ subject: selectedSubject, chapter: chap.name })}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-black text-black hover:bg-black hover:text-white transition-all disabled:opacity-50"
                      >
                        PYQ Archive
                      </button>
                    )}
                    
                    {!olympiadMode && (
                      <div className="flex gap-px bg-gray-300 border border-gray-300">
                        <button 
                          disabled={loading}
                          onClick={() => startTest(selectedSubject, chap.name, Difficulty.EASY, 'practice')}
                          className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-white hover:bg-gray-100 text-gray-900"
                        >
                          L1
                        </button>
                        <button 
                          disabled={loading}
                          onClick={() => startTest(selectedSubject, chap.name, Difficulty.MEDIUM, 'practice')}
                          className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-white hover:bg-gray-100 text-gray-900"
                        >
                          L2
                        </button>
                        <button 
                          disabled={loading}
                          onClick={() => startTest(selectedSubject, chap.name, Difficulty.HARD, 'practice')}
                          className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-white hover:bg-gray-100 text-gray-900"
                        >
                          L3
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {viewingNotes && (
        <NotesModal 
          subject={viewingNotes.subject}
          chapter={viewingNotes.chapter}
          content={viewingNotes.content}
          loading={viewingNotes.loading}
          onClose={() => setViewingNotes(null)}
        />
      )}

      {pyqConfig && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-white/90 backdrop-blur-sm">
          <div className="bg-white border border-black w-full max-w-md p-8 relative shadow-2xl">
            <button 
              onClick={() => setPyqConfig(null)}
              className="absolute top-4 right-4 text-black hover:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-light text-black uppercase tracking-wide">PYQ Archive</h3>
              <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">
                {pyqConfig.chapter}
              </p>
            </div>

            <div className="space-y-4">
              {[
                { level: Difficulty.EASY, label: 'Recent (5 Years)', desc: 'Foundational' },
                { level: Difficulty.MEDIUM, label: 'Decade (10 Years)', desc: 'Standard' },
                { level: Difficulty.HARD, label: 'Full (20 Years)', desc: 'Advanced' },
              ].map((opt) => (
                <button
                  key={opt.level}
                  onClick={() => confirmPyqStart(opt.level)}
                  className="w-full group flex items-center justify-between px-6 py-4 border border-gray-200 hover:border-black hover:bg-black transition-all"
                >
                  <div className="text-left">
                    <span className="block text-sm font-bold uppercase tracking-widest text-black group-hover:text-white">{opt.label}</span>
                    <span className="text-xs text-gray-400 group-hover:text-gray-400">{opt.desc}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-white" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};