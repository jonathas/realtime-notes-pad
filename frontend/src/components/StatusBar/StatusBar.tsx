import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import './StatusBar.css';
import { formatRelativeTime, formatTime } from '../../utils/dateUtils';

interface StatusBarProps {
  note?: {
    id: string;
    title: string;
    content?: string;
  };
  isConnected?: boolean;
  lastSaved?: Date;
  wordCount?: number;
  isUserTyping?: boolean;
  userName?: string;
}

export default function StatusBar({ 
  note, 
  isConnected = true, 
  lastSaved,
  wordCount,
  isUserTyping = false,
  userName = '',
}: Readonly<StatusBarProps>) {
   const [currentTime, setCurrentTime] = useState(dayjs());

  const formatLastSaved = (date?: Date) => {
    return date ? formatRelativeTime(date) : 'Never';
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getWordCount = () => {
    if (!wordCount && note?.content) {
      return note.content.trim().split(/\s+/).filter(word => word.length > 0).length;
    }
    return wordCount || 0;
  };

  return (
    <div className="status-bar">
      <div className="flex items-center space-x-4">
        <span className={`status-item ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </span>

       <span className="status-item text-blue-400 min-w-[120px]">
        {isUserTyping ? (
          <span className="animate-pulse">✏️ {userName} is typing...</span>
        ) : (
          <span className="invisible">✏️ is typing...</span>
        )}
      </span>
    </div>

    <div className="flex items-center space-x-4">
      <span className="status-item">
        💾 {formatLastSaved(lastSaved)}
      </span>
      
      <span className="status-item">
        Words: {getWordCount()}
      </span>
      
      <span className="status-item">
        {formatTime(currentTime.toDate())}
      </span>
      </div>
    </div>
  );
}