'use client';

import { useState, useEffect } from 'react';
import ReactDatePicker from 'react-datepicker';
import { isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CalendarDay } from '@/types';
import "react-datepicker/dist/react-datepicker.css";

// Custom styles for DatePicker to match premium design
import '@/app/globals.css';

interface DateRangePickerProps {
  listingId: string;
  checkIn?: Date | null;
  checkOut?: Date | null;
  onDatesChange: (dates: [Date | null, Date | null]) => void;
  minDate?: Date;
  months?: number;
  inline?: boolean;
  calendarData?: CalendarDay[]; // Passed from parent or fetched via hook
  isLoading?: boolean;
}

export function DateRangePicker({
  checkIn,
  checkOut,
  onDatesChange,
  minDate = new Date(),
  months = 2,
  inline = false,
  calendarData = [],
  isLoading = false,
}: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<Date | null>(checkIn || null);
  const [endDate, setEndDate] = useState<Date | null>(checkOut || null);

  useEffect(() => {
    setStartDate(checkIn || null);
    setEndDate(checkOut || null);
  }, [checkIn, checkOut]);

  const onChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    onDatesChange(dates);
  };

  // Convert calendar data to map for O(1) lookup
  const availabilityMap = new Map(
    calendarData.map(day => [day.date, day])
  );

  // Custom day class logic
  const dayClassName = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayData = availabilityMap.get(dateStr);

    if (!dayData) return '';

    const classes = cn(
      dayData.available ? 'day-available' : 'day-blocked',
      dayData.closedToArrival && 'day-closed-arrival',
      dayData.closedToDeparture && 'day-closed-departure',
      dayData.price && 'day-has-price'
    );

    return classes || '';
  };

  // Blocked dates filter
  const isDateBlocked = (date: Date) => {
    // Basic past date check
    if (isBefore(date, new Date(new Date().setHours(0, 0, 0, 0)))) return false;

    const dateStr = date.toISOString().split('T')[0];
    const dayData = availabilityMap.get(dateStr);

    // If no data loaded yet, assume available (or blocked depending on UX preference)
    if (isLoading) return true;
    if (!dayData) return true; // Block if unlimited availability not confirmed

    return !dayData.available;
  };

  // Render
  return (
    <div className={cn("booking-calendar", inline ? "inline-calendar" : "")}>
      <style jsx global>{`
        /* Premium DatePicker Overrides */
        .react-datepicker {
          font-family: var(--font-sans);
          border: none;
          background: transparent;
        }
        
        .react-datepicker__header {
          background: transparent;
          border-bottom: none;
          padding-top: 1rem;
        }

        .react-datepicker__month-container {
          background: white;
          border-radius: 1rem;
          padding: 1rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          float: none;
          display: inline-block;
          margin: 0.5rem;
          border: 1px solid var(--color-neutral-200);
        }
        
        .dark .react-datepicker__month-container {
          background: var(--color-neutral-900);
          border-color: var(--color-neutral-800);
        }

        .react-datepicker__current-month {
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-neutral-900);
          margin-bottom: 1rem;
        }

        .react-datepicker__day-name {
          color: var(--color-neutral-400);
          font-weight: 500;
          font-size: 0.8rem;
          width: 2.5rem;
          text-transform: capitalize;
        }

        .react-datepicker__day {
          width: 2.5rem;
          height: 2.5rem;
          line-height: 2.5rem;
          font-weight: 500;
          border-radius: 50%;
          color: var(--color-neutral-900);
          transition: all 0.2s;
        }

        .react-datepicker__day:hover:not(.react-datepicker__day--disabled) {
          background-color: var(--color-neutral-100);
          color: var(--color-primary-600);
        }

        /* Selected Range */
        .react-datepicker__day--selected,
        .react-datepicker__day--in-range,
        .react-datepicker__day--range-start,
        .react-datepicker__day--range-end {
          background-color: var(--color-primary-600) !important;
          color: white !important;
        }

        .react-datepicker__day--in-selecting-range:not(.react-datepicker__day--in-range) {
          background-color: var(--color-primary-100) !important;
          color: var(--color-primary-700) !important;
        }

        /* Disabled / Blocked */
        .react-datepicker__day--disabled {
          color: var(--color-neutral-300);
          text-decoration: line-through;
          cursor: not-allowed;
        }

        /* Navigation Icons */
        .react-datepicker__navigation {
          top: 1.5rem;
        }

        .react-datepicker__navigation--previous {
          left: 1rem;
        }

        .react-datepicker__navigation--next {
          right: 1rem;
        }
      `}</style>

      <ReactDatePicker
        selected={startDate}
        onChange={onChange}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        minDate={minDate}
        monthsShown={months}
        dateFormat="dd 'de' MMM"
        locale={ptBR}
        inline={inline}
        filterDate={(date) => !isDateBlocked(date)}
        dayClassName={dayClassName}
        renderCustomHeader={({
          monthDate,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="flex items-center justify-between px-4 mb-4">
            <button
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className="p-1 rounded-full hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-display font-semibold text-lg capitalize">
              {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(monthDate)}
            </span>
            <button
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className="p-1 rounded-full hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      />

      {/* Legend / Info */}
      <div className="mt-4 flex gap-4 text-xs text-neutral-500 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-200 border border-neutral-300"></div>
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-primary-600"></div>
          <span>Selecionado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-100 text-neutral-300 line-through flex items-center justify-center">x</div>
          <span>Indisponível</span>
        </div>
      </div>
    </div>
  );
}
