import React, { useState } from 'react';
import { 
  Heart, MessageSquare, ChevronDown, ChevronUp, 
  Clock, Activity, Shield, ArrowRight, ArrowLeft,
  BarChart2, Sparkles, Zap, Brain
} from 'lucide-react';
import type { ChatData, Message } from '../types';
import { WordCloud } from './WordCloud';
import { MessageExamples } from './MessageExamples';
import { SpecialLingo } from './SpecialLingo';
import { RelationshipTimeline } from './RelationshipTimeline';
import { formatDate } from '../utils/dateFormatter';

interface ChatAnalysisProps {
  data: ChatData;
}

export function ChatAnalysis({ data }: ChatAnalysisProps) {
  const { stats, participants, messages } = data;
  const [showMore, setShowMore] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(2);
  const [selectedExamples, setSelectedExamples] = useState<{
    title: string;
    messages: Message[];
  } | null>(null);

  const calculateDailyAverage = () => {
    const messagesByDay = messages.reduce((acc, msg) => {
      const date = msg.timestamp.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalDays = Object.keys(messagesByDay).length;
    const totalMessages = messages.length;
    return Math.round(totalMessages / Math.max(totalDays, 1));
  };

  const dailyAverage = calculateDailyAverage();

  const relationshipPhases = [
    {
      title: 'Initial Connection',
      description: 'Early interactions marked by curiosity and exploration.',
      insights: ['Frequent but brief exchanges', 'Getting to know each other', 'Establishing common ground']
    },
    {
      title: 'Growing Comfort',
      description: 'Increased openness and deeper conversations.',
      insights: ['Longer conversations', 'More personal topics', 'Building trust']
    },
    {
      title: 'Connected',
      description: 'Strong bond with deep mutual understanding.',
      insights: ['Deep emotional sharing', 'Strong support system', 'Comfortable silence']
    },
    {
      title: 'Deep Bond',
      description: 'Profound connection with lasting impact.',
      insights: ['Complete trust', 'Intuitive understanding', 'Shared growth']
    }
  ];

  const renderPhaseNavigation = () => (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={() => setCurrentPhaseIndex(prev => Math.max(0, prev - 1))}
        disabled={currentPhaseIndex === 0}
        className="p-2 text-gray-500 disabled:opacity-50"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="text-center">
        <h3 className="text-lg font-semibold">{relationshipPhases[currentPhaseIndex].title}</h3>
        <p className="text-sm text-gray-500">Phase {currentPhaseIndex + 1} of {relationshipPhases.length}</p>
      </div>
      <button
        onClick={() => setCurrentPhaseIndex(prev => Math.min(relationshipPhases.length - 1, prev + 1))}
        disabled={currentPhaseIndex === relationshipPhases.length - 1}
        className="p-2 text-gray-500 disabled:opacity-50"
      >
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  const renderCurrentPhase = () => {
    const phase = relationshipPhases[currentPhaseIndex];
    return (
      <div className="space-y-4">
        <p className="text-gray-600">{phase.description}</p>
        <div className="space-y-2">
          {phase.insights.map((insight, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              {insight}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCard = (
    title: string,
    icon: React.ReactNode,
    content: React.ReactNode,
    className: string = ''
  ) => (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden ${className}`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-blue-500">{icon}</div>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        {content}
      </div>
    </div>
  );

  const renderCommunicationRhythm = () => (
    <div className="space-y-4">
      <div className="h-20">
        <RelationshipTimeline messages={messages} milestones={[]} />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-sm text-gray-500">Peak Time</p>
          <p className="text-lg font-semibold">
            {Object.entries(stats.mostActiveHours)
              .sort(([,a], [,b]) => b - a)[0][0]}:00
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Daily Messages</p>
          <p className="text-lg font-semibold">
            {dailyAverage} avg
          </p>
        </div>
      </div>
    </div>
  );

  const renderPredictions = () => (
    <div className="space-y-6">
      {/* Next Message Predictions */}
      <div className="space-y-4">
        {Object.entries(stats.predictions.nextMessages).map(([participant, prediction]) => (
          <div key={participant} className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-700">{participant}</span>
              <span className="text-sm text-gray-500">
                {formatDate(prediction.expectedTime || new Date())}
              </span>
            </div>
            <p className="text-gray-600 italic mb-2">"{prediction.content}"</p>
            <div className="text-sm text-gray-500">
              {prediction.reasoning}
            </div>
          </div>
        ))}
      </div>

      {/* Interesting Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {stats.predictions.general.map((prediction, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-gray-700">
                {prediction.title}
              </span>
            </div>
            <p className="text-gray-600 mb-2">{prediction.content}</p>
            {prediction.confidence && (
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Confidence</span>
                  <span>{Math.round(prediction.confidence * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${prediction.confidence * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Connection Score */}
      {renderCard(
        'Connection Score',
        <Heart className="w-6 h-6" />,
        <div className="space-y-4">
          <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-blue-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.round(stats.relationshipDynamics.conversationBalance * 100)}%` }}
            />
          </div>
          <p className="text-3xl font-semibold text-center">
            {Math.round(stats.relationshipDynamics.conversationBalance * 100)}%
          </p>
          <p className="text-gray-600 text-center">
            Your relationship shows exceptional strength, with balanced communication and deep understanding.
          </p>
        </div>
      )}

      {/* Communication Rhythm */}
      {renderCard(
        'Communication Rhythm',
        <Activity className="w-6 h-6" />,
        renderCommunicationRhythm()
      )}

      {/* Relationship Journey */}
      {renderCard(
        'Relationship Journey',
        <Sparkles className="w-6 h-6" />,
        <div className="space-y-4">
          {renderPhaseNavigation()}
          {renderCurrentPhase()}
        </div>
      )}

      {/* More Analysis Button */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="w-full py-4 px-6 bg-white rounded-2xl shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <BarChart2 className="w-6 h-6 text-blue-500" />
          <span className="text-xl font-semibold">More Analysis</span>
        </div>
        {showMore ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Additional Analysis Sections */}
      {showMore && (
        <div className="space-y-6">
          {/* Predictions */}
          {renderCard(
            'Predictions',
            <Brain className="w-6 h-6" />,
            renderPredictions()
          )}

          {/* Word Cloud */}
          {renderCard(
            'Word Cloud',
            <MessageSquare className="w-6 h-6" />,
            <WordCloud words={stats.commonWords} messages={messages} />
          )}

          {/* Special Lingo */}
          {renderCard(
            'Special Lingo',
            <Zap className="w-6 h-6" />,
            <SpecialLingo terms={stats.specialLingo.slice(0, 4)} />
          )}
        </div>
      )}

      {/* Message Examples Modal */}
      {selectedExamples && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{selectedExamples.title}</h3>
              <button
                onClick={() => setSelectedExamples(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <MessageExamples
                messages={selectedExamples.messages}
                title={selectedExamples.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}