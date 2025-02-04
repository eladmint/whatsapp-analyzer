import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Message, RelationshipMilestone } from '../types';
import { Heart, AlertTriangle, PartyPopper, HandHeart, Clock } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

interface RelationshipTimelineProps {
  messages: Message[];
  milestones: RelationshipMilestone[];
}

export function RelationshipTimeline({ messages, milestones }: RelationshipTimelineProps) {
  // Prepare data for the chart with daily message counts
  const messagesByDay = messages.reduce((acc, msg) => {
    const date = msg.timestamp.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate moving average to smooth out spikes
  const movingAverageWindow = 7; // 7-day moving average
  const smoothedData = Object.entries(messagesByDay).map(([date, count], index, array) => {
    const start = Math.max(0, index - Math.floor(movingAverageWindow / 2));
    const end = Math.min(array.length, index + Math.ceil(movingAverageWindow / 2));
    const values = array.slice(start, end).map(([, c]) => c);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    return {
      x: new Date(date),
      y: Math.round(average)
    };
  });

  const data = {
    datasets: [
      {
        label: 'Message Frequency',
        data: smoothedData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHitRadius: 10
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'month' as const,
          displayFormats: {
            month: 'MMM yyyy'
          }
        },
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6,
          padding: 10,
          color: '#6B7280'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        border: {
          display: false
        },
        ticks: {
          padding: 10,
          color: '#6B7280',
          maxTicksLimit: 5
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1F2937',
        bodyColor: '#4B5563',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          title: (context: any) => {
            return new Date(context[0].parsed.x).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric'
            });
          },
          label: (context: any) => {
            return `${context.parsed.y} messages per day`;
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-full">
      <Line data={data} options={options} />
    </div>
  );
}