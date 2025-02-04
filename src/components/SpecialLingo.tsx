import React from 'react';
import { MessageSquareText, Lightbulb } from 'lucide-react';
import type { SpecialTerm } from '../types';

interface SpecialLingoProps {
  terms: SpecialTerm[];
}

export function SpecialLingo({ terms }: SpecialLingoProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center gap-2">
          <MessageSquareText className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold">Special Lingo</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Unique words and expressions used in your conversations
        </p>
      </div>
      <div className="p-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {terms.map((term, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500"
            >
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-green-500" />
                <span className="font-medium text-gray-700">{term.term}</span>
              </div>
              <p className="text-gray-600 mb-2">{term.meaning}</p>
              <div className="text-sm text-gray-500">
                <span className="font-medium">Used by: </span>
                {term.users.join(', ')}
              </div>
              {term.frequency && (
                <div className="mt-2">
                  <div className="text-sm text-gray-500">
                    Used {term.frequency} times
                  </div>
                  <div className="flex gap-1 mt-1">
                    {Array.from({ length: Math.min(5, Math.ceil(term.frequency / 10)) }).map((_, i) => (
                      <div
                        key={i}
                        className="w-4 h-1 bg-green-500 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}