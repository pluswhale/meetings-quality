/**
 * TaskEmotionalScaleSlider - Emotional scale slider for task planning phase
 * Allows participants to rate their emotional state while planning tasks
 */

import React from 'react';
import { Slider } from '@/src/shared/ui';

interface TaskEmotionalScaleSliderProps {
  value: number;
  onChange: (value: number) => void;
  onAutoSave?: () => void;
  disabled?: boolean;
}

export const TaskEmotionalScaleSlider: React.FC<TaskEmotionalScaleSliderProps> = ({
  value,
  onChange,
  onAutoSave,
  disabled = false,
}) => {
  const getEmotionLabel = (score: number) => {
    if (score >= 80) return { text: 'Очень позитивный', color: 'text-green-600' };
    if (score >= 60) return { text: 'Позитивный', color: 'text-green-500' };
    if (score >= 40) return { text: 'Нейтральный', color: 'text-yellow-600' };
    if (score >= 20) return { text: 'Негативный', color: 'text-orange-500' };
    return { text: 'Очень негативный', color: 'text-red-600' };
  };

  const emotion = getEmotionLabel(value);

  const handleChange = (newValue: number) => {
    onChange(newValue);
  };

  const handleChangeEnd = () => {
    if (onAutoSave) {
      setTimeout(onAutoSave, 100);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
        Эмоциональное состояние
        <div className="flex-1 h-px bg-slate-200" />
        {onAutoSave && (
          <span className="text-xs font-bold px-3 py-1 bg-green-100 text-green-700 rounded-full whitespace-nowrap">
            ✓ Автосохранение
          </span>
        )}
      </h2>

      <div className="bg-white border border-slate-200 rounded-[32px] shadow-lg shadow-slate-100 p-10">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Как вы себя чувствуете при планировании этой задачи?
            </label>
            <div className="flex items-center gap-3">
              <span className={`text-2xl font-black ${emotion.color} tabular-nums`}>
                {value}
              </span>
              <span className={`text-sm font-bold ${emotion.color} px-3 py-1 bg-slate-50 rounded-full`}>
                {emotion.text}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Slider
              value={value}
              min={0}
              max={100}
              step={10}
              onChange={handleChange}
              onChangeEnd={handleChangeEnd}
              variant="emotional"
              disabled={disabled}
            />
            
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>0 (Очень негативный)</span>
              <span>50 (Нейтральный)</span>
              <span>100 (Очень позитивный)</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3 mt-6">
            <svg
              className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-blue-800 font-medium">
              Оцените свое эмоциональное состояние в процессе планирования задачи. 
              Это поможет команде понять общий настрой и выявить возможные проблемы.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
