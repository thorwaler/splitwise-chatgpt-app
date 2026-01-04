'use client';

/**
 * OAuth Success Page
 * 
 * Shown after successful Splitwise connection
 */

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PageContent() {
  const searchParams = useSearchParams();
  const isConnected = searchParams.get('splitwise') === 'connected';
  const isError = searchParams.get('splitwise') === 'error';
  const userName = searchParams.get('user');
  const errorMessage = searchParams.get('message');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {isConnected && (
          <div className="flex flex-col items-center">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <svg 
                className="w-10 h-10 text-green-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Connected Successfully!
            </h1>
            
            {/* Welcome Message */}
            <p className="text-lg text-gray-600 mb-6 text-center">
              Welcome, {userName || 'there'}! 👋
            </p>

            {/* Status Box */}
            <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800 font-medium mb-2">
                ✅ Your Splitwise account is now connected
              </p>
              <p className="text-sm text-green-700">
                You can now add expenses, check balances, and manage your groups directly from ChatGPT!
              </p>
            </div>

            {/* What you can do */}
            <div className="w-full mb-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                What you can do now:
              </h2>
              <div className="space-y-2">
                <div className="flex items-start text-sm text-gray-600">
                  <span className="text-green-600 mr-2 flex-shrink-0">•</span>
                  <span>"Add €50 for groceries to my group"</span>
                </div>
                <div className="flex items-start text-sm text-gray-600">
                  <span className="text-green-600 mr-2 flex-shrink-0">•</span>
                  <span>"Show my spending this month"</span>
                </div>
                <div className="flex items-start text-sm text-gray-600">
                  <span className="text-green-600 mr-2 flex-shrink-0">•</span>
                  <span>"What are my groups?"</span>
                </div>
                <div className="flex items-start text-sm text-gray-600">
                  <span className="text-green-600 mr-2 flex-shrink-0">•</span>
                  <span>"Set my default group to bonitos"</span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => window.close()}
              className="w-full bg-green-600 text-white rounded-lg py-3 px-4 font-medium hover:bg-green-700 transition-colors mb-3"
            >
              Return to ChatGPT
            </button>
            
            {/* Help Text */}
            <p className="text-xs text-gray-500 text-center">
              You can close this window and go back to ChatGPT
            </p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center">
            {/* Error Icon */}
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
              <svg 
                className="w-10 h-10 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Connection Failed
            </h1>
            
            {/* Error Message */}
            <p className="text-gray-600 mb-6 text-center">
              Something went wrong
            </p>

            {/* Error Box */}
            <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 font-medium mb-1">
                Error:
              </p>
              <p className="text-sm text-red-700">
                {errorMessage || 'Unable to connect to Splitwise'}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => window.close()}
              className="w-full bg-gray-600 text-white rounded-lg py-3 px-4 font-medium hover:bg-gray-700 transition-colors mb-3"
            >
              Close Window
            </button>

            {/* Help Text */}
            <p className="text-xs text-gray-500 text-center">
              Go back to ChatGPT and try again
            </p>
          </div>
        )}

        {!isConnected && !isError && (
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Splitwise ChatGPT App
            </h1>
            <p className="text-gray-600 mb-6">
              Manage your Splitwise expenses from ChatGPT
            </p>
            <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">
                To get started:
              </p>
              <p className="text-sm text-blue-700 mb-2">
                Go to ChatGPT and say:
              </p>
              <span className="inline-block font-mono text-sm bg-white px-3 py-2 rounded border border-blue-200">
                "Register me with email: your@email.com"
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PageContent />
    </Suspense>
  );
}
