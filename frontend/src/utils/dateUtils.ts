import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

export const formatRelativeTime = (date: Date | string) => {
  const parsed = dayjs(date);
  const now = dayjs();
  const diffMinutes = now.diff(parsed, 'minutes');
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return parsed.fromNow();
  if (diffMinutes < 1440) return parsed.fromNow();
  
  return parsed.format('MMM D, h:mm A');
};

export const formatTime = (date?: Date) => {
  return dayjs(date).format('h:mm:ss A');
};

export const formatDateTime = (date: Date | string) => {
  return dayjs(date).format('MMM D, YYYY h:mm A');
};

export const formatNoteDate = (date: Date | string) => {
  const parsed = dayjs(date);
  const now = dayjs();
  
  if (parsed.isSame(now, 'day')) return parsed.format('h:mm A');
  if (parsed.isSame(now, 'year')) return parsed.format('MMM D');
  return parsed.format('MMM D, YYYY');
};

export const convertUTCToLocal = (utcDate: string) => {
  return dayjs.utc(utcDate).local().toDate();
};

export const getCurrentTimestamp = () => {
  return dayjs().toDate();
};

export const isToday = (date: Date | string) => {
  return dayjs(date).isSame(dayjs(), 'day');
};

export const isThisWeek = (date: Date | string) => {
  return dayjs(date).isSame(dayjs(), 'week');
};

export const formatTypingTimestamp = (timestamp: string) => {
  return dayjs(timestamp).fromNow();
};

export const formatConnectionTime = (timestamp: string) => {
  return `Connected ${dayjs(timestamp).fromNow()}`;
};

export const formatSessionDuration = (startTime: string) => {
  const start = dayjs(startTime);
  const now = dayjs();
  const duration = now.diff(start, 'minutes');
  
  if (duration < 1) return 'Just started';
  if (duration < 60) return `${duration}m session`;
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return `${hours}h ${minutes}m session`;
};