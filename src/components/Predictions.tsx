import React from 'react';
import { Brain, Sparkles, MessageSquare } from 'lucide-react';
import type { Prediction, Message } from '../types';
import { formatDate } from '../utils/dateFormatter';

interface PredictionsProps {
  predictions: {
    nextMessages: Record<string, Prediction>;
    general: Prediction[];
  };
}

export function Predictions({ predictions }: PredictionsProps) {
  return (
    <div className="space-y-6">
      {/* Next Message Predictions */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Next Message Predictions</h3>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {Object.entries(predictions.nextMessages).map(([participant, prediction]) => (
            <div key={participant} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">{participant}</span>
                <span className="text-sm text-gray-500">
                  Likely next active time: {formatDate(prediction.expectedTime)}
                </span>
              </div>
              <p className="text-gray-600 italic">"{prediction.content}"</p>
              <div className="mt-2 text-sm text-gray-500">
                <span className="font-medium">Based on: </span>
                {prediction.reasoning}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* General Predictions */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Interesting Predictions</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {predictions.general.map((prediction, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="font-medium text-gray-700">
                    {prediction.title}
                  </span>
                </div>
                <p className="text-gray-600">{prediction.content}</p>
                {prediction.confidence && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Confidence</span>
                      <span>{Math.round(prediction.confidence * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${prediction.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}