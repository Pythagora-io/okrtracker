import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isWithinInterval } from 'date-fns';

export const getWeekRange = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 }); // Sunday
  return { start, end };
};

export const formatWeekLabel = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `Week of ${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
};

export const isCurrentWeek = (weekStart: string) => {
  const start = new Date(weekStart);
  const { start: currentStart, end: currentEnd } = getWeekRange(new Date());
  return isWithinInterval(start, { start: currentStart, end: currentEnd });
};

export const generateWeeks = (count: number = 12) => {
  const weeks = [];
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const weekDate = subWeeks(today, i);
    const { start, end } = getWeekRange(weekDate);
    weeks.push({
      start: start.toISOString(),
      end: end.toISOString(),
      isCurrent: i === 0
    });
  }
  
  return weeks;
};