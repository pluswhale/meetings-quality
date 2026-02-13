/**
 * DateTimePicker - Modern, mobile-friendly date and time picker component
 */

import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ru } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker-custom.css';

registerLocale('ru', ru);

interface DateTimePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  disabled?: boolean;
  showTimeSelect?: boolean;
  className?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selected,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Выберите дату и время',
  disabled = false,
  showTimeSelect = true,
  className = '',
}) => {
  return (
    <div className="datepicker-wrapper">
      <DatePicker
        selected={selected}
        onChange={onChange}
        showTimeSelect={showTimeSelect}
        timeFormat="HH:mm"
        timeIntervals={1}
        dateFormat={showTimeSelect ? "dd.MM.yyyy HH:mm" : "dd.MM.yyyy"}
        timeCaption="Время"
        locale="ru"
        placeholderText={placeholder}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        className={`datepicker-input ${className}`}
        calendarClassName="datepicker-calendar"
        popperClassName="datepicker-popper"
        showPopperArrow={false}
        timeInputLabel="Точное время:"
        showTimeInput
      />
    </div>
  );
};
