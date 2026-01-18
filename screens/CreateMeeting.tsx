
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export const CreateMeeting: React.FC = () => {
  const navigate = useNavigate();
  const createMeeting = useStore(state => state.createMeeting);
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && question) {
      const id = createMeeting(title, question);
      navigate(`/meeting/${id}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12 animate-in slide-in-from-bottom-8 duration-500">
      <button onClick={() => navigate('/dashboard')} className="text-slate-500 mb-10 flex items-center gap-2 font-bold hover:text-slate-900 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Назад к списку
      </button>
      
      <header className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">Новая встреча</h1>
        <p className="text-slate-500 text-lg font-medium italic">Сформулируйте повестку для достижения максимальной прозрачности.</p>
      </header>
      
      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Тема совещания</label>
          <input
            type="text"
            required
            className="w-full px-8 py-6 bg-white border-2 border-slate-100 rounded-[24px] focus:ring-4 focus:ring-blue-100 focus:border-blue-400 text-slate-900 text-xl font-bold transition-all outline-none placeholder:text-slate-200 shadow-sm"
            placeholder="Напр., Стратегия развития Q3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Главный вопрос</label>
          <textarea
            required
            rows={6}
            className="w-full px-8 py-6 bg-white border-2 border-slate-100 rounded-[32px] focus:ring-4 focus:ring-blue-100 focus:border-blue-400 text-slate-900 text-lg font-bold transition-all outline-none placeholder:text-slate-200 leading-relaxed shadow-sm"
            placeholder="Какой основной результат мы должны получить по итогам обсуждения?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
        
        <button
          type="submit"
          className="w-full py-6 text-white bg-blue-600 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0 transition-all"
        >
          Запустить процесс
        </button>
      </form>
    </div>
  );
};
