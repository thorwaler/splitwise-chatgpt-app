/**
 * Settings Panel Component
 * 
 * Manage user settings, defaults, and account.
 */

import React, { useState, useEffect } from 'react';
import { WidgetState } from '../Widget';

interface SettingsPanelProps {
  state: WidgetState;
  onUpdate: (updates: Partial<WidgetState>) => void;
  onRefresh: () => void;
}

interface Group {
  id: number;
  name: string;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  state,
  onUpdate,
  onRefresh,
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(
    state.defaultGroupId
  );
  const [selectedSplitType, setSelectedSplitType] = useState<string>(
    state.defaultSplitType || 'equal'
  );
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (state.isConnectedToSplitwise) {
      loadGroups();
    }
  }, [state.isConnectedToSplitwise]);

  const loadGroups = async () => {
    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 5,
          method: 'tools/call',
          params: {
            name: 'get_groups',
            arguments: { session_token: state.sessionToken },
          },
        }),
      });

      const data = await response.json();
      if (data.result?.content) {
        const result = JSON.parse(data.result.content[0].text);
        setGroups(result.groups);
      }
    } catch (err) {
      console.error('Failed to load groups:', err);
    }
  };

  const handleSaveDefaults = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 6,
          method: 'tools/call',
          params: {
            name: 'set_defaults',
            arguments: {
              session_token: state.sessionToken,
              default_group_id: selectedGroupId,
              default_split_type: selectedSplitType,
            },
          },
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      if (data.result?.content) {
        const result = JSON.parse(data.result.content[0].text);
        
        if (result.isError) {
          throw new Error(result.message);
        }

        setSuccess(result.message);
        onUpdate({
          defaultGroupId: selectedGroupId,
          defaultSplitType: selectedSplitType,
        });
        onRefresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save defaults');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiatePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 7,
          method: 'tools/call',
          params: {
            name: 'initiate_payment',
            arguments: {
              session_token: state.sessionToken,
            },
          },
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      if (data.result?.content) {
        const result = JSON.parse(data.result.content[0].text);
        
        if (result.checkout_url) {
          // Open Stripe checkout in new window
          window.open(result.checkout_url, '_blank');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="settings-panel">
      <h3>Settings</h3>

      {/* Account Info */}
      <section className="settings-section">
        <h4>Account</h4>
        <div className="setting-item">
          <label>Email</label>
          <div className="setting-value">{state.email}</div>
        </div>
        <div className="setting-item">
          <label>Payment Status</label>
          <div className="setting-value">
            {state.paymentStatus === 'paid' ? (
              <span className="badge badge-success">Lifetime Access</span>
            ) : (
              <span className="badge badge-warning">Free Trial</span>
            )}
          </div>
        </div>
        {state.paymentStatus === 'free' && (
          <div className="setting-item">
            <label>Messages Remaining</label>
            <div className="setting-value">{state.messagesRemaining} / 3</div>
          </div>
        )}
      </section>

      {/* Splitwise Connection */}
      <section className="settings-section">
        <h4>Splitwise Connection</h4>
        <div className="setting-item">
          <label>Status</label>
          <div className="setting-value">
            {state.isConnectedToSplitwise ? (
              <span className="badge badge-success">Connected</span>
            ) : (
              <span className="badge badge-error">Not Connected</span>
            )}
          </div>
        </div>
        {!state.isConnectedToSplitwise && (
          <button onClick={onRefresh} className="btn-secondary">
            Connect Splitwise
          </button>
        )}
      </section>

      {/* Default Settings */}
      {state.isConnectedToSplitwise && (
        <section className="settings-section">
          <h4>Default Preferences</h4>
          
          <div className="form-group">
            <label htmlFor="default-group">Default Group</label>
            <select
              id="default-group"
              value={selectedGroupId || ''}
              onChange={(e) => setSelectedGroupId(Number(e.target.value) || undefined)}
            >
              <option value="">No default</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="default-split">Default Split Type</label>
            <select
              id="default-split"
              value={selectedSplitType}
              onChange={(e) => setSelectedSplitType(e.target.value)}
            >
              <option value="equal">Split Equally</option>
              <option value="unequal">Unequal Amounts</option>
              <option value="percentages">Percentages</option>
            </select>
          </div>

          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          {success && (
            <div className="alert alert-success">{success}</div>
          )}

          <button
            onClick={handleSaveDefaults}
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Saving...' : 'Save Defaults'}
          </button>

          <p className="form-note">
            Saving defaults counts as 1 message
          </p>
        </section>
      )}

      {/* Upgrade Section */}
      {state.paymentStatus === 'free' && (
        <section className="settings-section upgrade-section">
          <h4>Upgrade to Lifetime Access</h4>
          
          <div className="pricing-display">
            <div className="price">
              <span className="current-price">$0.99</span>
              <span className="original-price">$9.99</span>
              <span className="discount-badge">90% OFF</span>
            </div>
            <p className="pricing-description">
              One-time payment • Unlimited expenses • Lifetime access
            </p>
          </div>

          <button
            onClick={handleInitiatePayment}
            disabled={isLoading}
            className="btn-upgrade"
          >
            {isLoading ? 'Processing...' : 'Upgrade Now'}
          </button>

          {error && (
            <div className="alert alert-error">{error}</div>
          )}
        </section>
      )}

      {/* Logout */}
      <section className="settings-section">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="btn-danger"
        >
          Logout
        </button>
      </section>
    </div>
  );
};

export default SettingsPanel;
