/**
 * Connection Status Component
 * 
 * Shows Splitwise connection status and allows connecting.
 */

import React, { useState } from 'react';

interface ConnectionStatusProps {
  isConnected: boolean;
  sessionToken: string;
  onConnect: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  sessionToken,
  onConnect,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 9,
          method: 'tools/call',
          params: {
            name: 'connect_splitwise',
            arguments: {
              session_token: sessionToken,
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
        
        if (result.authorization_url) {
          // Redirect to Splitwise authorization
          window.location.href = result.authorization_url;
        } else if (result.is_connected) {
          // Already connected
          onConnect();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsLoading(false);
    }
  };

  if (isConnected) {
    return (
      <div className="connection-status connected">
        <span className="status-indicator"></span>
        <span className="status-text">Connected</span>
      </div>
    );
  }

  return (
    <div className="connection-status disconnected">
      <button
        onClick={handleConnect}
        disabled={isLoading}
        className="btn-connect"
      >
        {isLoading ? 'Connecting...' : 'Connect Splitwise'}
      </button>
      {error && (
        <div className="connection-error">{error}</div>
      )}
    </div>
  );
};

export default ConnectionStatus;
