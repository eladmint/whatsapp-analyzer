import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ChatAnalysis } from './components/ChatAnalysis';
import { ICPTest } from './components/ICPTest';
import { parseWhatsAppExport, analyzeChat } from './utils/chatParser';
import { analyzeWithAI } from './utils/aiAnalysis';
import { handleShareTarget } from './share-target-handler';
import type { ChatData } from './types';
import { MessageSquareShare } from 'lucide-react';

function App() {
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showICPTest, setShowICPTest] = useState(false);

  useEffect(() => {
    // Handle shared files when the app loads
    if (navigator.serviceWorker && window.location.pathname === '/share-target') {
      setIsAnalyzing(true);
      
      // Get the form data from the share and process it
      const formData = new FormData();
      const shareData = new URLSearchParams(window.location.search);
      shareData.forEach((value, key) => {
        formData.append(key, value);
      });

      handleShareTarget(formData)
        .then(data => {
          if (data) {
            setChatData(data);
            // Clean up the URL after processing
            window.history.replaceState(null, '', '/');
          }
        })
        .finally(() => {
          setIsAnalyzing(false);
        });
    }
  }, []);

  const handleFileUpload = async (content: string) => {
    setIsAnalyzing(true);
    const messages = parseWhatsAppExport(content);
    const participants = [...new Set(messages.map(m => m.sender))];
    const stats = analyzeChat(messages);
    
    try {
      const aiResult = await analyzeWithAI(messages);
      stats.aiAnalysis = aiResult;
    } catch (error) {
      console.error('AI analysis failed:', error);
      stats.aiAnalysis = {
        content: null,
        success: false,
        error: 'AI analysis unavailable'
      };
    }

    setChatData({
      messages,
      participants,
      stats,
    });
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquareShare className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900">
                WhatsApp Chat Analyzer
              </h1>
            </div>
            <button
              onClick={() => setShowICPTest(!showICPTest)}
              className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200 transition-colors"
            >
              {showICPTest ? 'Hide ICP Test' : 'Show ICP Test'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {showICPTest ? (
          <ICPTest />
        ) : !chatData ? (
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Analyze Your WhatsApp Conversations
              </h2>
              <p className="text-gray-600 mb-6">
                Upload your exported WhatsApp chat or share it directly from WhatsApp.
                Your data stays in your browser and is not sent anywhere except for AI analysis.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-800 mb-2">Share directly from WhatsApp:</h3>
                <ol className="text-sm text-blue-700 text-left list-decimal list-inside space-y-1">
                  <li>Open your WhatsApp chat</li>
                  <li>Tap the three dots menu ⋮</li>
                  <li>Select More {'>'} Export chat</li>
                  <li>Choose "Without Media"</li>
                  <li>Select "WhatsApp Chat Analyzer" from the share menu</li>
                </ol>
              </div>
            </div>
            <FileUpload onFileSelect={handleFileUpload} />
          </div>
        ) : (
          <ChatAnalysis data={chatData} />
        )}
      </main>

      {isAnalyzing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-700">Analyzing conversation...</p>
          </div>
        </div>
      )}

      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            Your privacy matters. All analysis is done locally in your browser.
            AI analysis is performed securely through OpenRouter.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;