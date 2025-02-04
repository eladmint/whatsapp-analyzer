import React, { useMemo, useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import { WordCloudData } from '../types';
import { MessageExamples } from './MessageExamples';
import type { Message } from '../types';

interface WordCloudProps {
  words: WordCloudData[];
  messages: Message[];
}

export function WordCloud({ words, messages }: WordCloudProps) {
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    examples: Message[];
  } | null>(null);

  const colors = {
    primary: ['text-red-600', 'text-red-500'],
    secondary: ['text-blue-600', 'text-blue-500'],
    tertiary: ['text-yellow-600', 'text-yellow-500'],
    quaternary: ['text-gray-600', 'text-gray-500']
  };

  const maxValue = Math.max(...words.map(w => w.value));
  const minValue = Math.min(...words.map(w => w.value));
  const range = maxValue - minValue;

  const getColorScheme = (index: number) => {
    const schemes = [colors.primary, colors.secondary, colors.tertiary, colors.quaternary];
    return schemes[index % schemes.length];
  };

  const processedWords = useMemo(() => {
    return words.map((word, index) => {
      const normalizedValue = (word.value - minValue) / range;
      const fontSize = 0.8 + normalizedValue * 2.5; // Scale from 0.8 to 3.3em
      const rotation = Math.random() * 30 - 15; // Random rotation between -15 and 15 degrees
      const colorScheme = getColorScheme(index);
      const color = colorScheme[Math.floor(Math.random() * colorScheme.length)];
      
      return {
        ...word,
        fontSize,
        rotation,
        color
      };
    });
  }, [words]);

  const handleWordClick = (word: string) => {
    const examples = messages.filter(msg => 
      msg.content.toLowerCase().includes(word.toLowerCase())
    ).slice(0, 5);

    setSelectedWord({
      word,
      examples
    });
  };

  return (
    <div className="relative">
      <div className="h-[500px] w-full overflow-hidden bg-white rounded-lg shadow-inner relative">
        <div className="absolute inset-0 flex flex-wrap justify-center items-center gap-4 p-8">
          {processedWords.map((word, index) => (
            <div
              key={`${word.text}-${index}`}
              className={`inline-block cursor-pointer transition-all duration-300 hover:scale-110 ${word.color}`}
              style={{
                fontSize: `${word.fontSize}em`,
                transform: `rotate(${word.rotation}deg)`,
                opacity: 0.7 + word.fontSize * 0.1,
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                fontWeight: word.value > (maxValue / 2) ? 'bold' : 'normal'
              }}
              onClick={() => handleWordClick(word.text)}
              title={`${word.text}: ${word.value} occurrences`}
            >
              {word.text}
            </div>
          ))}
        </div>
      </div>

      {/* Word Examples Modal */}
      {selectedWord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageSquareText className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold">
                  Examples of "{selectedWord.word}"
                </h3>
              </div>
              <button
                onClick={() => setSelectedWord(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <MessageExamples
                messages={selectedWord.examples}
                title={`Messages containing "${selectedWord.word}"`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}