
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';

const InputField: React.FC<{
  type: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}> = ({ type, placeholder, value, onChange, required }) => (
  <div className="group space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 group-focus-within:text-blue-600 transition-colors">{placeholder}</label>
    <input
      type={type}
      required={required}
      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white text-slate-900 font-bold transition-all outline-none placeholder:text-slate-300 shadow-sm"
      placeholder={`Введите ${placeholder.toLowerCase()}...`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export const LoginScreen: React.FC = () => {
  const login = useStore(state => state.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email)) {
      navigate('/dashboard');
    } else {
      alert('Пользователь не найден. Попробуйте другой email.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50">
      <div className="w-full max-w-md bg-white p-10 md:p-14 rounded-[40px] shadow-2xl shadow-slate-200/60 border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-200 mb-6">M</div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">MeetingQuality</h1>
          <p className="mt-2 text-slate-400 font-medium">Вернем эффективность совещаниям</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <InputField 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={setEmail} 
            required 
          />
          <InputField 
            type="password" 
            placeholder="Пароль" 
            value={password} 
            onChange={setPassword} 
            required 
          />
          <button
            type="submit"
            className="w-full py-5 text-white bg-slate-900 rounded-[20px] font-black uppercase tracking-widest text-sm hover:bg-black hover:-translate-y-1 active:translate-y-0 transition-all shadow-xl shadow-slate-200"
          >
            Войти
          </button>
        </form>
        <div className="mt-8 text-center">
          <Link to="/register" className="text-slate-400 text-sm font-bold hover:text-blue-600 transition-colors uppercase tracking-widest">
            Регистрация
          </Link>
        </div>
      </div>
    </div>
  );
};

export const RegisterScreen: React.FC = () => {
  const register = useStore(state => state.register);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    register(name, email);
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50">
      <div className="w-full max-w-md bg-white p-10 md:p-14 rounded-[40px] shadow-2xl shadow-slate-200/60 border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-200 mb-6">M</div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Присоединиться</h1>
          <p className="mt-2 text-slate-400 font-medium">Начните оценивать качество встреч</p>
        </div>
        <form className="space-y-6" onSubmit={handleRegister}>
          <InputField 
            type="text" 
            placeholder="ФИО" 
            value={name} 
            onChange={setName} 
            required 
          />
          <InputField 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={setEmail} 
            required 
          />
          <InputField 
            type="password" 
            placeholder="Пароль" 
            value={password} 
            onChange={setPassword} 
            required 
          />
          <button
            type="submit"
            className="w-full py-5 text-white bg-slate-900 rounded-[20px] font-black uppercase tracking-widest text-sm hover:bg-black hover:-translate-y-1 active:translate-y-0 transition-all shadow-xl shadow-slate-200"
          >
            Создать аккаунт
          </button>
        </form>
        <div className="mt-8 text-center">
          <Link to="/login" className="text-slate-400 text-sm font-bold hover:text-blue-600 transition-colors uppercase tracking-widest">
            Уже есть аккаунт? Войти
          </Link>
        </div>
      </div>
    </div>
  );
};
