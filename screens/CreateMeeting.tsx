
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Button, Input, TextArea, Heading, Text, IconButton } from '../components/ui';

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
      <Button
        variant="ghost"
        onClick={() => navigate('/dashboard')}
        leftIcon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        }
        className="mb-10"
      >
        Назад к списку
      </Button>
      
      <header className="mb-12">
        <Heading level="h1" className="mb-4">
          Новая встреча
        </Heading>
        <Text variant="body" color="muted" className="text-lg italic">
          Сформулируйте повестку для достижения максимальной прозрачности.
        </Text>
      </header>
      
      <form onSubmit={handleSubmit} className="space-y-10">
        <Input
          type="text"
          label="Тема совещания"
          placeholder="Напр., Стратегия развития Q3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          fullWidth
          inputSize="lg"
        />
        
        <TextArea
          label="Главный вопрос"
          placeholder="Какой основной результат мы должны получить по итогам обсуждения?"
          rows={6}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          fullWidth
        />
        
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          className="uppercase tracking-[0.2em]"
        >
          Запустить процесс
        </Button>
      </form>
    </div>
  );
};
