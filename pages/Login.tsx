import React, { useState } from 'react';
import { ExamType } from '../types';

interface LoginProps {
  onLogin: (name: string, type: ExamType) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [examType, setExamType] = useState<ExamType>(ExamType.JEE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(name || (email.split('@')[0]), examType);
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-light tracking-tight text-black uppercase">
            {isLogin ? 'Sign In' : 'Join PrepMaster'}
          </h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-0 py-3 border-b border-gray-300 placeholder-gray-400 text-black focus:outline-none focus:border-black transition-colors bg-transparent"
                  placeholder="FULL NAME"
                />
              </div>
            )}
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-0 py-3 border-b border-gray-300 placeholder-gray-400 text-black focus:outline-none focus:border-black transition-colors bg-transparent"
                placeholder="EMAIL ADDRESS"
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none block w-full px-0 py-3 border-b border-gray-300 placeholder-gray-400 text-black focus:outline-none focus:border-black transition-colors bg-transparent"
                placeholder="PASSWORD"
              />
            </div>
            
            {!isLogin && (
              <div className="pt-6">
                 <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Target Exam</label>
                 <div className="flex space-x-4">
                   {[ExamType.JEE, ExamType.NEET].map((type) => (
                     <button
                      key={type}
                      type="button"
                      onClick={() => setExamType(type)}
                      className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest border transition-all ${
                        examType === type 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-gray-400 border-gray-200 hover:border-black'
                      }`}
                     >
                       {type}
                     </button>
                   ))}
                 </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-4 border border-transparent text-xs font-bold uppercase tracking-widest text-white bg-black hover:bg-gray-900 transition-all"
            >
              {isLogin ? 'Enter Platform' : 'Create Account'}
            </button>
          </div>
          
          <div className="text-center">
             <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-xs text-gray-400 uppercase tracking-widest hover:text-black border-b border-transparent hover:border-black pb-0.5 transition-all">
               {isLogin ? 'New user? Create account' : 'Existing user? Sign In'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};