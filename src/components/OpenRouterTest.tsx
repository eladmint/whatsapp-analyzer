import React, { useState } from 'react';
import { Bot, Loader } from 'lucide-react';
import type { AIAnalysis } from '../types';

export function OpenRouterTest() {
  const [apiKey, setApiKey] = useState('');
  const [response, setResponse] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    if (!apiKey) {
      setResponse({
        content: null,
        success: false,
        error: 'Please enter an API key'
      });
      return;
    }

    if (!apiKey.startsWith('sk-or-v1-')) {
      setResponse({
        content: null,
        success: false,
        error: 'Invalid API key format. OpenRouter API keys should start with "sk-or-v1-"'
      });
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      console.log('Making API request to OpenRouter...');
      const result = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'WhatsApp Chat Analyzer Test',
          'Origin': window.location.origin
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          model: 'anthropic/claude-2',
          messages: [
            {
              role: 'user',
              content: 'Please respond with a short test message to verify the API is working.'
            }
          ],
          temperature: 0.7,
          max_tokens: 100
        })
      });

      console.log('Response status:', result.status);
      
      if (!result.ok) {
        const errorText = await result.text();
        console.error('API Error Response:', errorText);
        
        let errorMessage: string;
        try {
          const errorData = JSON.parse(errorText);
          if (result.status === 401) {
            errorMessage = 'Invalid API key or authentication failed';
          } else if (result.status === 403) {
            errorMessage = 'Access forbidden. Please check your API key permissions';
          } else if (result.status === 429) {
            errorMessage = 'Rate limit exceeded. Please try again later';
          } else {
            errorMessage = errorData.error?.message || `API request failed with status ${result.status}`;
          }
        } catch {
          errorMessage = errorText || `API request failed with status ${result.status}`;
        }
        
        setResponse({
          content: null,
          success: false,
          error: errorMessage
        });
        return;
      }

      const data = await result.json();
      console.log('API Response:', data);
      
      if (!data.choices?.[0]?.message?.content) {
        setResponse({
          content: null,
          success: false,
          error: 'Invalid response format from AI service'
        });
        return;
      }

      setResponse({
        content: data.choices[0].message.content,
        success: true
      });
    } catch (error) {
      console.error('API Error:', error);
      
      let errorMessage: string;
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        errorMessage = 'Network error: Unable to connect to the API. Please check your internet connection or try using a different browser.';
      } else {
        errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      }
      
      setResponse({
        content: null,
        success: false,
        error: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">OpenRouter API Test</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
            OpenRouter API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your API key (starts with sk-or-v1-)"
          />
          <p className="mt-1 text-sm text-gray-500">
            Your API key should start with 'sk-or-v1-'. Make sure you have sufficient credits in your OpenRouter account.
          </p>
        </div>

        <button
          onClick={testAPI}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Test API'
          )}
        </button>

        {response && (
          <div className={`mt-4 p-4 rounded-md ${response.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Bot className={`w-5 h-5 ${response.success ? 'text-green-500' : 'text-red-500'}`} />
              <h3 className="font-medium">
                {response.success ? 'API Test Successful' : 'API Test Failed'}
              </h3>
            </div>
            {response.success ? (
              <p className="text-gray-700">{response.content}</p>
            ) : (
              <p className="text-red-600">{response.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}