import { addDays, differenceInWeeks } from 'date-fns';

export function calculatePregnancyFromLmp(lmpDate: Date) {
  const dueDate = addDays(lmpDate, 280);
  const currentWeek = Math.min(Math.max(differenceInWeeks(new Date(), lmpDate), 0), 42);
  const trimester = currentWeek < 14 ? 1 : currentWeek < 28 ? 2 : 3;
  return { dueDate, currentWeek, trimester };
}
