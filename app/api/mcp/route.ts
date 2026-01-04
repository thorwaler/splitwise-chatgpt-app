/**
 * MCP Server Endpoint
 * 
 * Main JSON-RPC endpoint for Model Context Protocol.
 * Handles all tool calls from ChatGPT and widget resource serving.
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

// Import all tools
import { registerUserHandler, registerUserTool } from '@/src/server/tools/user/register';
import { connectSplitwiseHandler, connectSplitwiseTool } from '@/src/server/tools/splitwise/connect';
import { addExpenseHandler, addExpenseTool } from '@/src/server/tools/splitwise/addExpense';
import { addExpenseEnhancedHandler, addExpenseEnhancedTool } from '@/src/server/tools/splitwise/addExpenseEnhanced';
import { manageSplitPrefsHandler, manageSplitPrefsTool } from '@/src/server/tools/splitwise/manageSplitPrefs';
import { getGroupsHandler, getGroupsTool } from '@/src/server/tools/splitwise/getGroups';
import { getCategoriesHandler, getCategoriesTool } from '@/src/server/tools/splitwise/getCategories';
import { setDefaultsHandler, setDefaultsTool } from '@/src/server/tools/splitwise/setDefaults';
import { getExpenseAnalyticsHandler, getExpenseAnalyticsTool } from '@/src/server/tools/splitwise/getAnalytics';
import { getAnalyticsEnhancedHandler, getAnalyticsEnhancedTool } from '@/src/server/tools/splitwise/getAnalyticsEnhanced';
import { checkPaymentStatus, checkPaymentStatusTool } from '@/src/server/tools/payment/checkStatus';
import { initiatePayment, initiatePaymentTool } from '@/src/server/tools/payment/initiate';
import { verifyPayment, verifyPaymentTool } from '@/src/server/tools/payment/verify';

// Import error handler
import { formatErrorResponse } from '@/src/server/lib/middleware';

// CORS headers for ChatGPT
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Tool registry
 */
const TOOLS = {
  // User tools
  register_user: {
    handler: registerUserHandler,
    definition: registerUserTool,
  },
  
  // Splitwise tools
  connect_splitwise: {
    handler: connectSplitwiseHandler,
    definition: connectSplitwiseTool,
  },
  add_expense: {
    handler: addExpenseHandler,
    definition: addExpenseTool,
  },
  add_expense_enhanced: {
    handler: addExpenseEnhancedHandler,
    definition: addExpenseEnhancedTool,
  },
  manage_split_preferences: {
    handler: manageSplitPrefsHandler,
    definition: manageSplitPrefsTool,
  },
  get_groups: {
    handler: getGroupsHandler,
    definition: getGroupsTool,
  },
  get_categories: {
    handler: getCategoriesHandler,
    definition: getCategoriesTool,
  },
  set_defaults: {
    handler: setDefaultsHandler,
    definition: setDefaultsTool,
  },
  get_expense_analytics: {
    handler: getExpenseAnalyticsHandler,
    definition: getExpenseAnalyticsTool,
  },
  get_analytics_enhanced: {
    handler: getAnalyticsEnhancedHandler,
    definition: getAnalyticsEnhancedTool,
  },
  
  // Payment tools
  check_payment_status: {
    handler: checkPaymentStatus,
    definition: checkPaymentStatusTool,
  },
  initiate_payment: {
    handler: initiatePayment,
    definition: initiatePaymentTool,
  },
  verify_payment: {
    handler: verifyPayment,
    definition: verifyPaymentTool,
  },
};

/**
 * Handle OPTIONS request (CORS preflight)
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Handle GET request - Server info
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  
  // Serve widget resource
  if (url.searchParams.get('resource') === 'widget') {
    try {
      const widgetHtml = readFileSync(
        join(process.cwd(), 'public/widget.html'),
        'utf-8'
      );
      
      return new NextResponse(widgetHtml, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          ...corsHeaders,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Widget not found. Run npm run build:widget first.' },
        { status: 404, headers: corsHeaders }
      );
    }
  }
  
  // Return server info
  return NextResponse.json(
    {
      name: 'Splitwise ChatGPT MCP Server',
      version: '1.0.0',
      protocol: 'mcp/1.0',
      capabilities: {
        tools: Object.keys(TOOLS),
        resources: ['widget'],
      },
      endpoints: {
        tools: 'POST /api/mcp (method: tools/call, tools/list)',
        resources: 'GET /api/mcp?resource=widget',
      },
    },
    { status: 200, headers: corsHeaders }
  );
}

/**
 * Handle POST request - JSON-RPC
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate JSON-RPC format
    if (!body.jsonrpc || body.jsonrpc !== '2.0') {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id: body.id || null,
          error: {
            code: -32600,
            message: 'Invalid Request: jsonrpc must be "2.0"',
          },
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Handle different methods
    switch (body.method) {
      case 'initialize':
        return handleInitialize(body);
      
      case 'tools/list':
        return handleToolsList(body);
      
      case 'tools/call':
        return await handleToolCall(body);
      
      case 'resources/list':
        return handleResourcesList(body);
      
      case 'resources/read':
        return handleResourceRead(body);
      
      default:
        return NextResponse.json(
          {
            jsonrpc: '2.0',
            id: body.id || null,
            error: {
              code: -32601,
              message: `Method not found: ${body.method}`,
            },
          },
          { status: 404, headers: corsHeaders }
        );
    }
  } catch (error) {
    console.error('MCP Server error:', error);
    
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: 'Parse error',
        },
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Handle initialize method
 */
function handleInitialize(body: any) {
  return NextResponse.json(
    {
      jsonrpc: '2.0',
      id: body.id,
      result: {
        protocolVersion: '2024-11-05',
        serverInfo: {
          name: 'Splitwise ChatGPT MCP Server',
          version: '1.0.0',
        },
        capabilities: {
          tools: {},
          resources: {},
        },
      },
    },
    { status: 200, headers: corsHeaders }
  );
}

/**
 * Handle tools/list method
 */
function handleToolsList(body: any) {
  const tools = Object.entries(TOOLS).map(([name, config]) => ({
    name,
    description: config.definition.description,
    inputSchema: config.definition.inputSchema,
  }));

  return NextResponse.json(
    {
      jsonrpc: '2.0',
      id: body.id,
      result: {
        tools,
      },
    },
    { status: 200, headers: corsHeaders }
  );
}

/**
 * Handle tools/call method
 */
async function handleToolCall(body: any) {
  const { name, arguments: args } = body.params;

  // Validate tool exists
  if (!TOOLS[name as keyof typeof TOOLS]) {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: body.id,
        error: {
          code: -32602,
          message: `Unknown tool: ${name}`,
        },
      },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    // Call the tool handler
    const tool = TOOLS[name as keyof typeof TOOLS];
    const result = await tool.handler(args);

    // Format response as MCP content
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: body.id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error(`Tool ${name} error:`, error);
    
    // Format error response
    const errorResponse = formatErrorResponse(error);
    
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: body.id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(errorResponse, null, 2),
            },
          ],
        },
      },
      { status: 200, headers: corsHeaders }
    );
  }
}

/**
 * Handle resources/list method
 */
function handleResourcesList(body: any) {
  return NextResponse.json(
    {
      jsonrpc: '2.0',
      id: body.id,
      result: {
        resources: [
          {
            uri: 'splitwise://widget',
            name: 'Splitwise Widget',
            description: 'Interactive widget for expense management',
            mimeType: 'text/html',
          },
        ],
      },
    },
    { status: 200, headers: corsHeaders }
  );
}

/**
 * Handle resources/read method
 */
function handleResourceRead(body: any) {
  const { uri } = body.params;

  if (uri === 'splitwise://widget') {
    try {
      const widgetHtml = readFileSync(
        join(process.cwd(), 'public/widget.html'),
        'utf-8'
      );

      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id: body.id,
          result: {
            contents: [
              {
                uri: 'splitwise://widget',
                mimeType: 'text/html',
                text: widgetHtml,
              },
            ],
          },
        },
        { status: 200, headers: corsHeaders }
      );
    } catch (error) {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id: body.id,
          error: {
            code: -32002,
            message: 'Widget not found. Run npm run build:widget first.',
          },
        },
        { status: 404, headers: corsHeaders }
      );
    }
  }

  return NextResponse.json(
    {
      jsonrpc: '2.0',
      id: body.id,
      error: {
        code: -32002,
        message: `Unknown resource: ${uri}`,
      },
    },
    { status: 404, headers: corsHeaders }
  );
}
