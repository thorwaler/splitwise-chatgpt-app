/**
 * Main Widget Component
 * 
 * Entry point for the Splitwise ChatGPT widget.
 * Manages global widget state and renders appropriate components.
 */

import React, { useState, useEffect } from 'react';
import ExpenseForm from './components/ExpenseForm';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import SettingsPanel from './components/SettingsPanel';
import PaymentGate from './components/PaymentGate';
import ConnectionStatus from './components/ConnectionStatus';

export interface WidgetState {
  sessionToken: string | null;
  email: string | null;
  isConnectedToSplitwise: boolean;
  paymentStatus: 'free' | 'paid';
  messageCount: number;
  messagesRemaining: number;
  defaultGroupId?: number;
  defaultSplitType?: string;
}

const Widget: React.FC = () => {
  const [state, setState] = useState<WidgetState>({
    sessionToken: null,
    email: null,
    isConnectedToSplitwise: false,
    paymentStatus: 'free',
    messageCount: 0,
    messagesRemaining: 3,
  });

  const [currentView, setCurrentView] = useState<'expense' | 'analytics' | 'settings'>('expense');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize widget state
  useEffect(() => {
    initializeWidget();
  }, []);

  /**
   * Initialize widget - check for existing session or register new user
   */
  const initializeWidget = async () => {
    try {
      setIsLoading(true);
      
      // Check for existing session token in localStorage
      const savedToken = localStorage.getItem('splitwise_session_token');
      const savedEmail = localStorage.getItem('splitwise_email');

      if (savedToken) {
        // Verify existing session
        await loadUserState(savedToken);
      } else if (savedEmail) {
        // Re-register with saved email
        await registerUser(savedEmail);
      } else {
        // New user - will need to register
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Widget initialization error:', err);
      setError('Failed to initialize widget');
      setIsLoading(false);
    }
  };

  /**
   * Register or login user
   */
  const registerUser = async (email: string) => {
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      
      // Save to localStorage
      localStorage.setItem('splitwise_session_token', data.session_token);
      localStorage.setItem('splitwise_email', email);

      // Update widget state
      setState(prev => ({
        ...prev,
        sessionToken: data.session_token,
        email: email,
        paymentStatus: data.usage.payment_status,
        messageCount: data.usage.message_count,
        messagesRemaining: data.usage.messages_remaining,
        isConnectedToSplitwise: data.user.splitwise_connected || false,
        defaultGroupId: data.user.default_group_id,
        defaultSplitType: data.user.default_split_type,
      }));

      setIsLoading(false);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register user');
      setIsLoading(false);
    }
  };

  /**
   * Load user state from server
   */
  const loadUserState = async (sessionToken: string) => {
    try {
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      if (!response.ok) {
        // Invalid token - clear and restart
        localStorage.removeItem('splitwise_session_token');
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      setState(prev => ({
        ...prev,
        sessionToken: sessionToken,
        email: data.user.email,
        paymentStatus: data.usage.payment_status,
        messageCount: data.usage.message_count,
        messagesRemaining: data.usage.messages_remaining,
        isConnectedToSplitwise: data.user.splitwise_connected || false,
        defaultGroupId: data.user.default_group_id,
        defaultSplitType: data.user.default_split_type,
      }));

      setIsLoading(false);
    } catch (err) {
      console.error('Load state error:', err);
      setIsLoading(false);
    }
  };

  /**
   * Update widget state
   */
  const updateState = (updates: Partial<WidgetState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  /**
   * Refresh user state
   */
  const refreshState = async () => {
    if (state.sessionToken) {
      await loadUserState(state.sessionToken);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="widget-container loading">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // Show registration if no session
  if (!state.sessionToken) {
    return (
      <div className="widget-container registration">
        <h2>Welcome to Splitwise for ChatGPT</h2>
        <p>Track expenses naturally through conversation</p>
        <EmailRegistration onRegister={registerUser} />
      </div>
    );
  }

  // Show payment gate if required
  if (state.messagesRemaining === 0 && state.paymentStatus === 'free') {
    return (
      <PaymentGate
        sessionToken={state.sessionToken}
        onPaymentComplete={refreshState}
      />
    );
  }

  return (
    <div className="widget-container">
      {/* Header */}
      <div className="widget-header">
        <h2>Splitwise</h2>
        <ConnectionStatus
          isConnected={state.isConnectedToSplitwise}
          sessionToken={state.sessionToken}
          onConnect={refreshState}
        />
      </div>

      {/* Usage indicator */}
      {state.paymentStatus === 'free' && (
        <div className="usage-indicator">
          <p>
            {state.messagesRemaining} free message{state.messagesRemaining !== 1 ? 's' : ''} remaining
          </p>
          {state.messagesRemaining <= 1 && (
            <button onClick={() => setCurrentView('settings')}>
              Upgrade for $0.99
            </button>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="widget-nav">
        <button
          className={currentView === 'expense' ? 'active' : ''}
          onClick={() => setCurrentView('expense')}
        >
          Add Expense
        </button>
        <button
          className={currentView === 'analytics' ? 'active' : ''}
          onClick={() => setCurrentView('analytics')}
        >
          Analytics
        </button>
        <button
          className={currentView === 'settings' ? 'active' : ''}
          onClick={() => setCurrentView('settings')}
        >
          Settings
        </button>
      </div>

      {/* Content */}
      <div className="widget-content">
        {currentView === 'expense' && (
          <ExpenseForm
            sessionToken={state.sessionToken}
            defaultGroupId={state.defaultGroupId}
            isConnected={state.isConnectedToSplitwise}
            onExpenseAdded={refreshState}
          />
        )}
        
        {currentView === 'analytics' && (
          <AnalyticsDashboard
            sessionToken={state.sessionToken}
            isConnected={state.isConnectedToSplitwise}
          />
        )}
        
        {currentView === 'settings' && (
          <SettingsPanel
            state={state}
            onUpdate={updateState}
            onRefresh={refreshState}
          />
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="widget-error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
    </div>
  );
};

/**
 * Email Registration Component
 */
const EmailRegistration: React.FC<{ onRegister: (email: string) => void }> = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValid(emailRegex.test(email));
  }, [email]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onRegister(email);
    }
  };

  return (
    <form className="email-registration" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" disabled={!isValid}>
        Get Started
      </button>
      <p className="privacy-note">
        Your email is used only for account recovery
      </p>
    </form>
  );
};

export default Widget;
