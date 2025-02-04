import React from 'react';
import { Message } from '../types';
import { formatDate } from '../utils/dateFormatter';

interface MessageExamplesProps {
  messages: Message[];
  title: string;
}

export function MessageExamples({ messages, title }: MessageExamplesProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-4 max-h-60 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={`${message.sender}-${index}`}
            className="border-l-4 border-blue-500 pl-4 py-2"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-700">{message.sender}</span>
              <span className="text-sm text-gray-500">
                {formatDate(message.timestamp)}
              </span>
            </div>
            <p className="text-gray-600">{message.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}