# Splitwise ChatGPT App

A ChatGPT App that integrates with Splitwise to manage expenses, track spending, and provide analytics - all through natural conversation.

## Features

- 🔐 **Secure Authentication**: Email-based registration with JWT session tokens
- 💰 **Payment Gating**: 3 free messages, then one-time payment ($0.99 - 90% OFF!)
- 📊 **Expense Management**: Add expenses to Splitwise via natural language
- 📈 **Analytics**: View spending trends, category breakdowns, and budget insights
- ⚙️ **Smart Defaults**: Set default groups and split types
- 🎯 **Category Matching**: Auto-suggests Splitwise categories from conversation context

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **MCP Server**: Model Context Protocol for ChatGPT integration
- **Database**: Upstash Redis (serverless)
- **Payments**: Stripe
- **OAuth**: Splitwise API integration
- **UI**: React with TypeScript
- **Deployment**: Vercel

## Project Status

### ✅ Phase 1: Foundation & Setup (COMPLETED)

- [x] Project structure created
- [x] Dependencies installed
- [x] Environment variables configured
- [x] Redis database schema designed
- [x] Core libraries implemented:
  - Database helper (Redis CRUD operations)
  - Authentication & session management (JWT)
  - Encryption utilities (for Splitwise tokens)
  - Usage tracking (message limits)

### 🚧 Phase 2: User Management & Payment System (NEXT)

- User registration flow
- Payment gating logic
- Stripe integration

## Installation

### Prerequisites

- Node.js 18+
- Upstash Redis account
- Stripe account
- Splitwise developer app

### Setup

1. **Clone and install dependencies**:
   ```bash
   cd splitwise-app
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

   Fill in the required values:
   - `UPSTASH_REDIS_REST_URL` - From Upstash dashboard
   - `UPSTASH_REDIS_REST_TOKEN` - From Upstash dashboard
   - `STRIPE_SECRET_KEY` - From Stripe dashboard
   - `STRIPE_PUBLISHABLE_KEY` - From Stripe dashboard
   - `SPLITWISE_CLIENT_ID` - From Splitwise app settings
   - `SPLITWISE_CLIENT_SECRET` - From Splitwise app settings
   - `JWT_SECRET` - Generate a random 32+ character string
   - `ENCRYPTION_KEY` - Generate a random 32+ character string

3. **Run development server**:
   ```bash
   npm run dev
   ```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ChatGPT Interface                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    MCP Server (Next.js)                      │
│  • Splitwise OAuth & API Integration                        │
│  • Expense Management Tools                                 │
│  • Analytics Tools                                          │
│  • User Management                                          │
│  • Payment Gating                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  React Widget (Skybridge)                    │
│  • Expense Entry Form                                        │
│  • Analytics Dashboard                                       │
│  • Payment Gate UI                                           │
│  • Settings Panel                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  • Splitwise API (OAuth + REST)                             │
│  • Stripe (Payment Processing)                              │
│  • Upstash Redis (User Data)                                │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema (Redis)

### User Data
```
Key: user:{session_token}
Type: Hash
Fields:
  - id: UUID
  - email: string
  - session_token: JWT
  - created_at: ISO timestamp
  - splitwise_user_id: string (optional)
  - splitwise_access_token: encrypted string (optional)
  - splitwise_refresh_token: encrypted string (optional)
  - default_group_id: string (optional)
  - default_split_type: string (optional)
  - payment_status: 'free' | 'paid'
  - message_count: integer
  - paid_at: ISO timestamp (optional)
```

### Email Mapping
```
Key: email:{email}
Type: String
Value: session_token
```

### Payment Records
```
Key: payment:{payment_intent_id}
Type: Hash
Fields:
  - payment_intent_id: string
  - user_session_token: string
  - amount: number (in cents)
  - status: 'pending' | 'completed' | 'failed'
  - created_at: ISO timestamp
```

### Usage Logs
```
Key: usage:{session_token}:{date}
Type: List
Items: JSON objects with {tool_name, timestamp}
TTL: 30 days
```

## Core Libraries

### Database (`src/server/lib/database.ts`)
- User CRUD operations
- Payment tracking
- Usage logging
- Message count management
- Splitwise category caching

### Authentication (`src/server/lib/auth.ts`)
- JWT token generation and verification
- User registration
- Session management
- Email validation

### Encryption (`src/server/lib/encryption.ts`)
- AES encryption for Splitwise tokens
- Secure token storage
- Hash generation

### Usage Tracking (`src/server/lib/usage.ts`)
- Message limit enforcement
- Tool usage categorization
- Free vs paid user logic
- Usage summaries

## Usage Limits

### Free Tier (3 Messages)
- Counted operations:
  - `add_expense`
  - `set_defaults`
  - `create_payment`

- Free operations (unlimited):
  - `get_groups`
  - `get_categories`
  - `get_expense_analytics`
  - `get_budget_status`
  - `check_payment_status`
  - `connect_splitwise`

### Paid Tier ($0.99 one-time)
- Unlimited access to all tools
- Lifetime access

## Security

- **Encryption**: All Splitwise tokens encrypted with AES-256
- **JWT**: Secure session tokens with 1-year expiration
- **Rate Limiting**: Usage tracking prevents abuse
- **Environment Variables**: All secrets stored securely
- **CORS**: Proper headers for ChatGPT integration

## Development

### Project Structure
```
splitwise-app/
├── app/                      # Next.js App Router
│   └── api/                  # API routes
│       ├── mcp/              # MCP endpoint
│       ├── auth/             # OAuth handlers
│       ├── stripe/           # Payment webhooks
│       └── user/             # User management
├── src/
│   ├── server/
│   │   ├── lib/              # Core libraries ✅
│   │   │   ├── database.ts
│   │   │   ├── auth.ts
│   │   │   ├── encryption.ts
│   │   │   └── usage.ts
│   │   └── tools/            # MCP tools (next phase)
│   └── web/                  # React widget (next phase)
├── scripts/
│   └── build-widget.ts
├── public/
│   └── widget.html           # Generated widget
└── .env                      # Environment variables
```

### Commands

```bash
# Development
npm run dev              # Next.js dev server (Vercel)
npm run dev:local        # Local MCP server with ngrok

# Build
npm run build            # Build Next.js app
npm run build:widget     # Build React widget

# Production
npm start                # Start production server
```

## Next Steps

See `tasks/todo.md` for the complete implementation plan.

### Phase 2: User Management & Payment System
- User registration flow with email
- Payment gate enforcement
- Stripe checkout integration
- Webhook handling

### Phase 3: Splitwise Integration
- OAuth flow implementation
- Splitwise API client
- Expense management tools
- Category matching

### Phase 4: Widget Development
- Expense form component
- Analytics dashboard
- Payment gate UI
- Settings panel

## Contributing

This is a personal project for ChatGPT App development. Feel free to fork and adapt for your own use.

## License

MIT

## Support

For issues or questions, please refer to the documentation in `/context` folder.
