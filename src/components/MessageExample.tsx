import React from 'react';
import { Message } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface MessageExampleProps {
  message: Message;
}

export function MessageExample({ message }: MessageExampleProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-2">
      <div className="flex justify-between items-start mb-2">
        <span className="font-medium text-gray-700">{message.sender}</span>
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </span>
      </div>
      <p className="text-gray-600">{message.content}</p>
    </div>
  );
}