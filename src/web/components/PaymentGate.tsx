/**
 * Payment Gate Component
 * 
 * Displayed when user has exhausted free messages and needs to upgrade.
 */

import React, { useState } from 'react';

interface PaymentGateProps {
  sessionToken: string;
  onPaymentComplete: () => void;
}

const PaymentGate: React.FC<PaymentGateProps> = ({
  sessionToken,
  onPaymentComplete,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 8,
          method: 'tools/call',
          params: {
            name: 'initiate_payment',
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
        
        if (result.checkout_url) {
          // Open Stripe checkout
          window.location.href = result.checkout_url;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
      setIsLoading(false);
    }
  };

  return (
    <div className="payment-gate">
      <div className="payment-gate-content">
        <h2>You've Used Your Free Messages!</h2>
        
        <p className="payment-gate-description">
          You've used all 3 free messages. Upgrade to continue tracking expenses with unlimited access.
        </p>

        <div className="pricing-card">
          <div className="pricing-header">
            <span className="price-label">One-time payment</span>
            <div className="price-display">
              <span className="current-price">$0.99</span>
              <span className="original-price">$9.99</span>
            </div>
            <span className="discount-badge">90% OFF - Limited Time!</span>
          </div>

          <div className="pricing-features">
            <h4>What You Get:</h4>
            <ul>
              <li>✅ Unlimited expense tracking</li>
              <li>✅ Lifetime access (no recurring fees)</li>
              <li>✅ Full analytics & insights</li>
              <li>✅ All future features included</li>
            </ul>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="btn-upgrade-large"
          >
            {isLoading ? 'Redirecting to Checkout...' : 'Upgrade for $0.99'}
          </button>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <p className="payment-security">
            🔒 Secure payment via Stripe
          </p>
        </div>

        <div className="payment-gate-footer">
          <p>
            Questions? <a href="mailto:support@example.com">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentGate;
