'use client';

/**
 * OAuth Success Page
 * 
 * Shown after successful Splitwise connection
 */

import { useSearchParams } from 'next/navigation';

export default function Home() {
  const searchParams = useSearchParams();
  const isConnected = searchParams.get('splitwise') === 'connected';
  const isError = searchParams.get('splitwise') === 'error';
  const userName = searchParams.get('user');
  const errorMessage = searchParams.get('message');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 mx-4">
        {isConnected && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Connected Successfully!
              </h1>
              <p className="text-lg text-gray-600">
                Welcome, {userName || 'there'}! 👋
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800 font-medium mb-2">
                ✅ Your Splitwise account is now connected
              </p>
              <p className="text-sm text-green-700">
                You can now add expenses, check balances, and manage your groups directly from ChatGPT!
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                What you can do now:
              </h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>"Add €50 for groceries to my group"</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>"Show my spending this month"</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>"What are my groups?"</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>"Set my default group to bonitos"</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.close()}
              className="w-full bg-green-600 text-white rounded-lg py-3 px-4 font-medium hover:bg-green-700 transition-colors"
            >
              Return to ChatGPT
            </button>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              You can close this window and go back to ChatGPT
            </p>
          </>
        )}

        {isError && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Connection Failed
              </h1>
              <p className="text-gray-600">
                Something went wrong
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 font-medium mb-1">
                Error:
              </p>
              <p className="text-sm text-red-700">
                {errorMessage || 'Unable to connect to Splitwise'}
              </p>
            </div>

            <button
              onClick={() => window.close()}
              className="w-full bg-gray-600 text-white rounded-lg py-3 px-4 font-medium hover:bg-gray-700 transition-colors"
            >
              Close Window
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Go back to ChatGPT and try again
            </p>
          </>
        )}

        {!isConnected && !isError && (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Splitwise ChatGPT App
              </h1>
              <p className="text-gray-600 mb-6">
                Manage your Splitwise expenses from ChatGPT
              </p>
              <p className="text-sm text-gray-500">
                Go to ChatGPT and say: <br/>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                  "Register me with email: your@email.com"
                </span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
