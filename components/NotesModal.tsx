import React from 'react';
import { X, BookOpen } from 'lucide-react';

interface NotesModalProps {
  subject: string;
  chapter: string;
  content: string | null;
  onClose: () => void;
  loading: boolean;
}

export const NotesModal: React.FC<NotesModalProps> = ({ subject, chapter, content, onClose, loading }) => {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white border border-black text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="px-8 py-8">
            <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{subject}</p>
                <h3 className="text-2xl font-light text-black uppercase tracking-wide">
                  {chapter}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-black hover:opacity-50 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="min-h-[400px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="w-px h-12 bg-black animate-pulse"></div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Curating Content...</p>
                </div>
              ) : (
                <div className="prose prose-slate max-w-none font-serif leading-loose text-gray-800">
                  {content && <div dangerouslySetInnerHTML={{ __html: content }} />}
                </div>
              )}
            </div>
          </div>
          
          {!loading && content && (
            <div className="bg-black px-8 py-4 flex justify-end">
              <button
                type="button"
                className="text-white text-xs font-bold uppercase tracking-widest hover:text-gray-300"
                onClick={onClose}
              >
                Close Reader
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};