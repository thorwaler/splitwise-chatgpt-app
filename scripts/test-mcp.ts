/**
 * MCP Server Test Script
 * 
 * Tests all MCP server endpoints and tools.
 * 
 * Run with: tsx scripts/test-mcp.ts
 */

const BASE_URL = process.env.MCP_URL || 'http://localhost:3000';

interface TestResult {
  test: string;
  passed: boolean;
  error?: string;
  response?: any;
}

const results: TestResult[] = [];

/**
 * Make JSON-RPC request
 */
async function rpcCall(method: string, params?: any) {
  const response = await fetch(`${BASE_URL}/api/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    }),
  });
  
  return response.json();
}

/**
 * Test: Server Info
 */
async function testServerInfo() {
  console.log('🧪 Testing: Server Info (GET /api/mcp)');
  
  try {
    const response = await fetch(`${BASE_URL}/api/mcp`);
    const data = await response.json();
    
    const passed = data.name === 'Splitwise ChatGPT MCP Server';
    results.push({
      test: 'Server Info',
      passed,
      response: data,
    });
    
    console.log(passed ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    results.push({
      test: 'Server Info',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.log('❌ FAIL');
  }
}

/**
 * Test: Initialize
 */
async function testInitialize() {
  console.log('🧪 Testing: Initialize');
  
  try {
    const data = await rpcCall('initialize', {
      protocolVersion: '2024-11-05',
      clientInfo: { name: 'test-client', version: '1.0.0' },
    });
    
    const passed = data.result?.serverInfo?.name === 'Splitwise ChatGPT MCP Server';
    results.push({
      test: 'Initialize',
      passed,
      response: data,
    });
    
    console.log(passed ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    results.push({
      test: 'Initialize',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.log('❌ FAIL');
  }
}

/**
 * Test: Tools List
 */
async function testToolsList() {
  console.log('🧪 Testing: Tools List');
  
  try {
    const data = await rpcCall('tools/list');
    
    const expectedTools = [
      'connect_splitwise',
      'add_expense',
      'get_groups',
      'get_categories',
      'set_defaults',
      'get_expense_analytics',
      'check_payment_status',
      'initiate_payment',
      'verify_payment',
    ];
    
    const toolNames = data.result?.tools?.map((t: any) => t.name) || [];
    const passed = expectedTools.every(tool => toolNames.includes(tool));
    
    results.push({
      test: 'Tools List',
      passed,
      response: {
        expected: expectedTools.length,
        found: toolNames.length,
        tools: toolNames,
      },
    });
    
    console.log(passed ? '✅ PASS' : '❌ FAIL');
    console.log(`   Found ${toolNames.length}/9 expected tools`);
  } catch (error) {
    results.push({
      test: 'Tools List',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.log('❌ FAIL');
  }
}

/**
 * Test: Resources List
 */
async function testResourcesList() {
  console.log('🧪 Testing: Resources List');
  
  try {
    const data = await rpcCall('resources/list');
    
    const resources = data.result?.resources || [];
    const hasWidget = resources.some((r: any) => r.uri === 'splitwise://widget');
    
    results.push({
      test: 'Resources List',
      passed: hasWidget,
      response: resources,
    });
    
    console.log(hasWidget ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    results.push({
      test: 'Resources List',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.log('❌ FAIL');
  }
}

/**
 * Test: Widget Resource
 */
async function testWidgetResource() {
  console.log('🧪 Testing: Widget Resource');
  
  try {
    const response = await fetch(`${BASE_URL}/api/mcp?resource=widget`);
    const html = await response.text();
    
    const passed = html.includes('<!DOCTYPE html>') && html.includes('Splitwise');
    
    results.push({
      test: 'Widget Resource',
      passed,
      response: { size: html.length, hasDoctype: html.includes('<!DOCTYPE html>') },
    });
    
    console.log(passed ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    results.push({
      test: 'Widget Resource',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.log('❌ FAIL');
  }
}

/**
 * Test: Invalid Method
 */
async function testInvalidMethod() {
  console.log('🧪 Testing: Invalid Method (should fail gracefully)');
  
  try {
    const data = await rpcCall('invalid/method');
    
    const passed = !!data.error && data.error.code === -32601;
    
    results.push({
      test: 'Invalid Method',
      passed,
      response: data,
    });
    
    console.log(passed ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    results.push({
      test: 'Invalid Method',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.log('❌ FAIL');
  }
}

/**
 * Test: Tool Call (without valid session - should return error)
 */
async function testToolCallNoAuth() {
  console.log('🧪 Testing: Tool Call without auth (should fail gracefully)');
  
  try {
    const data = await rpcCall('tools/call', {
      name: 'get_groups',
      arguments: { session_token: 'invalid' },
    });
    
    // Should get a result with error message, not a JSON-RPC error
    const resultText = data.result?.content?.[0]?.text;
    const result = resultText ? JSON.parse(resultText) : null;
    const passed = result?.isError === true || result?.message?.includes('token');
    
    results.push({
      test: 'Tool Call No Auth',
      passed,
      response: result,
    });
    
    console.log(passed ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    results.push({
      test: 'Tool Call No Auth',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.log('❌ FAIL');
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log(`
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  MCP Server Test Suite                                       │
│  Testing: ${BASE_URL}                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
`);

  await testServerInfo();
  await testInitialize();
  await testToolsList();
  await testResourcesList();
  await testWidgetResource();
  await testInvalidMethod();
  await testToolCallNoAuth();

  // Summary
  console.log(`
┌─────────────────────────────────────────────────────────────┐
│  Test Results                                                 │
└─────────────────────────────────────────────────────────────┘
`);

  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(r => {
    console.log(`${r.passed ? '✅' : '❌'} ${r.test}`);
    if (r.error) {
      console.log(`   Error: ${r.error}`);
    }
  });

  console.log(`
┌─────────────────────────────────────────────────────────────┐
│  Summary: ${passed}/${total} tests passed                                    │
└─────────────────────────────────────────────────────────────┘
`);

  if (passed === total) {
    console.log('🎉 All tests passed!\n');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
