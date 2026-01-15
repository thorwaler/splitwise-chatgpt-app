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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {isConnected && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-10 text-center">
              {/* Success Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg">
                <svg 
                  className="w-8 h-8 text-emerald-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={3} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
              
              {/* Title */}
              <h1 className="text-3xl font-bold text-white mb-2">
                All Set!
              </h1>
              <p className="text-emerald-50 text-lg">
                Welcome, {userName || 'there'}! 👋
              </p>
            </div>

            {/* Content Section */}
            <div className="px-8 py-8">
              {/* Status Message */}
              <div className="flex items-start space-x-3 mb-6 p-4 bg-emerald-50 rounded-xl">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-emerald-900 text-sm">
                    Your Splitwise account is connected
                  </p>
                  <p className="text-emerald-700 text-sm mt-1">
                    You can now manage expenses directly from ChatGPT
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">
                  Try these commands:
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-emerald-500 mr-2">→</span>
                    <code className="font-mono">"Add €50 for groceries"</code>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-emerald-500 mr-2">→</span>
                    <code className="font-mono">"Show my spending this month"</code>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-emerald-500 mr-2">→</span>
                    <code className="font-mono">"What are my groups?"</code>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  // Attempt to close the window
                  window.close();
                  // If window.close() didn't work (window still open after 100ms),
                  // show a message
                  setTimeout(() => {
                    if (!window.closed) {
                      alert('Please close this tab manually to return to ChatGPT');
                    }
                  }, 100);
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Return to ChatGPT
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                You can close this window anytime
              </p>
            </div>
          </div>
        )}

        {isError && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-red-500 to-rose-500 px-8 py-10 text-center">
              {/* Error Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg">
                <svg 
                  className="w-8 h-8 text-red-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={3} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </div>
              
              {/* Title */}
              <h1 className="text-3xl font-bold text-white mb-2">
                Connection Failed
              </h1>
              <p className="text-red-50 text-lg">
                Something went wrong
              </p>
            </div>

            {/* Content Section */}
            <div className="px-8 py-8">
              {/* Error Message */}
              <div className="flex items-start space-x-3 mb-6 p-4 bg-red-50 rounded-xl">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-red-900 text-sm">
                    Unable to connect
                  </p>
                  <p className="text-red-700 text-sm mt-1">
                    {errorMessage || 'Unable to connect to Splitwise. Please try again.'}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => window.close()}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Close Window
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                Go back to ChatGPT and try again
              </p>
            </div>
          </div>
        )}

        {!isConnected && !isError && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-10 text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                Splitwise ChatGPT App
              </h1>
              <p className="text-blue-50 text-lg">
                Manage expenses from ChatGPT
              </p>
            </div>

            {/* Content Section */}
            <div className="px-8 py-8">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-blue-900 text-sm mb-2">
                    To get started:
                  </p>
                  <p className="text-blue-700 text-sm mb-3">
                    Go to ChatGPT and say:
                  </p>
                  <div className="bg-white rounded-lg px-3 py-2 border border-blue-200">
                    <code className="text-sm font-mono text-gray-700">
                      "Register me with email: your@email.com"
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with Legal Links */}
      <footer className="mt-12 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm">
            <a 
              href="/privacy"
              className="text-gray-600 hover:text-emerald-600 transition-colors font-medium"
            >
              Privacy Policy
            </a>
            <span className="hidden sm:inline text-gray-400">•</span>
            <a 
              href="/terms"
              className="text-gray-600 hover:text-emerald-600 transition-colors font-medium"
            >
              Terms of Service
            </a>
            <span className="hidden sm:inline text-gray-400">•</span>
            <a 
              href="mailto:andreas@ammp.io"
              className="text-gray-600 hover:text-emerald-600 transition-colors font-medium"
            >
              Contact
            </a>
          </div>
          <p className="text-center text-gray-500 text-xs mt-4">
            © 2026 Splitwise Synch. Not affiliated with Splitwise, Inc.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <PageContent />
    </Suspense>
  );
}
