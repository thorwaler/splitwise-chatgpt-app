export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Splitwise ChatGPT App</h1>
      <p style={{ fontSize: '1.1rem', color: '#666' }}>
        Manage your Splitwise expenses through natural conversation with ChatGPT.
      </p>

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0 }}>✨ Features</h2>
        <ul>
          <li>Add expenses via natural language</li>
          <li>Auto-match categories from conversation</li>
          <li>View spending analytics</li>
          <li>Set defaults for quick entry</li>
          <li>Connect with your Splitwise account</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#e8f5e9', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0 }}>💰 Pricing</h2>
        <p style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>
          <strong>$0.99</strong> <span style={{ textDecoration: 'line-through', color: '#999' }}>$9.99</span>
          <span style={{ marginLeft: '0.5rem', color: '#4caf50', fontWeight: 'bold' }}>90% OFF!</span>
        </p>
        <p>One-time payment • Lifetime access • 3 free messages to try</p>
      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fff3e0', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0 }}>🚀 Getting Started</h2>
        <ol>
          <li>Open ChatGPT and enable Developer Mode</li>
          <li>Add the Splitwise connector with your MCP endpoint</li>
          <li>Start chatting: "Add $50 for groceries to my roommates group"</li>
        </ol>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>API Endpoints</h2>
        <ul style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
          <li><strong>POST /api/mcp</strong> - MCP JSON-RPC endpoint</li>
          <li><strong>POST /api/user</strong> - User registration</li>
          <li><strong>GET /api/user</strong> - Get user info</li>
          <li><strong>POST /api/stripe/webhook</strong> - Payment webhooks</li>
        </ul>
      </div>

      <div style={{ marginTop: '3rem', padding: '1rem', borderTop: '1px solid #ddd', color: '#666', fontSize: '0.9rem' }}>
        <p>Built with Next.js • MCP Server • Upstash Redis • Stripe</p>
      </div>
    </main>
  );
}
