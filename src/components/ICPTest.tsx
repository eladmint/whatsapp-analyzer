import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Loader, LogIn, LogOut } from 'lucide-react';
import { icpService } from '../utils/icp';

interface ICPTestResult {
  success: boolean;
  canisterId?: string;
  error?: string;
}

export function ICPTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<ICPTestResult | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    initializeICP();
  }, []);

  const initializeICP = async () => {
    try {
      await icpService.init();
      const authStatus = await icpService.isAuthenticated();
      setIsAuthenticated(authStatus);
    } catch (error) {
      console.error('Failed to initialize ICP:', error);
    } finally {
      setInitializing(false);
    }
  };

  const handleLogin = async () => {
    try {
      await icpService.login();
      setIsAuthenticated(await icpService.isAuthenticated());
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await icpService.logout();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setResult(null);

    try {
      // Test saving and retrieving data
      const testData = JSON.stringify({ test: 'Hello ICP!' });
      await icpService.saveChat(testData);
      const retrieved = await icpService.getChat();

      if (retrieved === testData) {
        setResult({
          success: true,
          canisterId: 'Test successful - Data saved and retrieved'
        });
      } else {
        throw new Error('Data verification failed');
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to ICP'
      });
    } finally {
      setTesting(false);
    }
  };

  if (initializing) {
    return (
      <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2">Initializing ICP connection...</span>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-blue-500" />
        <h2 className="text-2xl font-semibold">ICP Integration Test</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="text-gray-700">
            Status: {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
          </span>
          <button
            onClick={isAuthenticated ? handleLogout : handleLogin}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            {isAuthenticated ? (
              <>
                <LogOut className="w-4 h-4" />
                Logout
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Login with Internet Identity
              </>
            )}
          </button>
        </div>

        <button
          onClick={testConnection}
          disabled={testing || !isAuthenticated}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {testing ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Testing Connection...
            </>
          ) : (
            'Test ICP Connection'
          )}
        </button>

        {result && (
          <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <h3 className="font-medium">
                {result.success ? 'Connection Successful' : 'Connection Failed'}
              </h3>
            </div>
            {result.success ? (
              <p className="text-gray-700">{result.canisterId}</p>
            ) : (
              <p className="text-red-600">{result.error}</p>
            )}
          </div>
        )}

        <div className="mt-6 border-t pt-4">
          <h3 className="font-medium mb-2">Test Details:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>Verifies ICP network connectivity</li>
            <li>Tests authentication with Internet Identity</li>
            <li>Validates canister data operations</li>
            <li>Tests data persistence</li>
          </ul>
        </div>
      </div>
    </div>
  );
}