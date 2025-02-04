import React from 'react';
import { Image, Clock, Users, Sparkles } from 'lucide-react';
import type { ImageAnalytics } from '../types';
import { formatDate } from '../utils/dateFormatter';

interface ImageAnalyticsProps {
  analytics: ImageAnalytics;
}

export function ImageAnalytics({ analytics }: ImageAnalyticsProps) {
  const {
    totalImages,
    imagePatterns,
    insights
  } = analytics;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <Image className="w-5 h-5" />
            <h4 className="font-medium">Total Images</h4>
          </div>
          <p className="text-2xl font-semibold">{totalImages}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-green-500 mb-2">
            <Users className="w-5 h-5" />
            <h4 className="font-medium">Top Sharer</h4>
          </div>
          <p className="text-2xl font-semibold">{insights.mostActiveImageSharer}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-purple-500 mb-2">
            <Clock className="w-5 h-5" />
            <h4 className="font-medium">Peak Time</h4>
          </div>
          <p className="text-2xl font-semibold">{insights.peakImageSharingTime}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-yellow-500 mb-2">
            <Sparkles className="w-5 h-5" />
            <h4 className="font-medium">Avg Batch Size</h4>
          </div>
          <p className="text-2xl font-semibold">
            {insights.averageBatchSize.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Time Distribution */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Image Sharing Patterns</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="h-40 flex items-end gap-1">
            {Array.from({ length: 24 }).map((_, hour) => {
              const count = imagePatterns.timeDistribution[hour] || 0;
              const maxCount = Math.max(...Object.values(imagePatterns.timeDistribution));
              const height = maxCount > 0 ? (count / maxCount) * 100 : 0;

              return (
                <div
                  key={hour}
                  className="flex-1 bg-blue-100 hover:bg-blue-200 transition-colors relative group"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    {count} images at {hour}:00
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>12 AM</span>
            <span>12 PM</span>
            <span>11 PM</span>
          </div>
        </div>
      </div>

      {/* Notable Image Batches */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold">Notable Image Batches</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {imagePatterns.consecutiveShares.map((batch, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-700">{batch.sender}</p>
                    <p className="text-sm text-gray-500">
                      Shared {batch.count} images
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(batch.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}