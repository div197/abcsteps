#!/usr/bin/env node

/**
 * 🕉️ ABCSteps Vivek - Production Readiness Test Suite
 * TURYAM State Verification & System Health Check
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test results collector
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function test(name, condition, details = '') {
  if (condition) {
    log(`✅ ${name}`, 'green');
    testResults.passed++;
  } else {
    log(`❌ ${name}`, 'red');
    if (details) log(`   ${details}`, 'yellow');
    testResults.failed++;
    testResults.errors.push(name);
  }
}

async function runTests() {
  log('\n🕉️ ABCSteps Vivek - Production Readiness Test Suite', 'cyan');
  log('═══════════════════════════════════════════════════════', 'cyan');

  // Test 1: Environment Configuration
  log('\n📋 Testing Environment Configuration...', 'blue');
  
  // Check .env.example exists and is complete
  const envExampleExists = fs.existsSync('.env.example');
  test('Environment example file exists', envExampleExists);
  
  if (envExampleExists) {
    const envContent = fs.readFileSync('.env.example', 'utf8');
    test('Contains OpenRouter API key config', envContent.includes('OPENROUTER_API_KEY'));
    test('Contains database URL config', envContent.includes('DATABASE_URL'));
    test('Contains auth secret config', envContent.includes('BETTER_AUTH_SECRET'));
    test('Contains Google OAuth config', envContent.includes('GOOGLE_CLIENT_ID'));
    test('No hardcoded secrets in example', !envContent.includes('sk-or-') && !envContent.includes('gsk_') && !envContent.includes('claude-'));
  }

  // Check .gitignore protects secrets
  const gitignoreExists = fs.existsSync('.gitignore');
  test('Gitignore file exists', gitignoreExists);
  
  if (gitignoreExists) {
    const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
    test('Gitignore protects .env files', gitignoreContent.includes('.env'));
  }

  // Test 2: TURYAM State Implementation
  log('\n🧠 Testing TURYAM State Implementation...', 'blue');
  
  // Check unified provider exists
  const unifiedProviderExists = fs.existsSync('ai/providers-unified.ts');
  test('Unified provider file exists', unifiedProviderExists);
  
  if (unifiedProviderExists) {
    const providerContent = fs.readFileSync('ai/providers-unified.ts', 'utf8');
    test('Contains TURYAM models', providerContent.includes('turyamModels'));
    test('Contains optimal model selection', providerContent.includes('selectOptimalModel'));
    test('Contains educational task classification', providerContent.includes('classifyEducationalTask'));
    test('Uses OpenRouter for all models', providerContent.includes('openrouter('));
  }

  // Test main provider file
  const mainProviderExists = fs.existsSync('ai/providers.ts');
  test('Main provider file exists', mainProviderExists);
  
  if (mainProviderExists) {
    const mainProviderContent = fs.readFileSync('ai/providers.ts', 'utf8');
    test('Imports unified provider', mainProviderContent.includes('providers-unified'));
    test('Exports vivek provider', mainProviderContent.includes('export { vivek }'));
    test('No direct API imports', !mainProviderContent.includes('@ai-sdk/openai'));
  }

  // Test 3: API Route Implementation
  log('\n🔄 Testing API Route Implementation...', 'blue');
  
  const searchRouteExists = fs.existsSync('app/api/search/route.ts');
  test('Search API route exists', searchRouteExists);
  
  if (searchRouteExists) {
    const routeContent = fs.readFileSync('app/api/search/route.ts', 'utf8');
    test('Uses unified providers', routeContent.includes('selectOptimalModel'));
    test('Implements TURYAM routing', routeContent.includes('TURYAM State'));
    test('No broken Trimurti references', !routeContent.includes('getTrimurtiRouter().getLanguageModel'));
    test('Uses classifyEducationalTask', routeContent.includes('classifyEducationalTask'));
  }

  // Test 4: Model Configuration
  log('\n⚡ Testing Model Configuration...', 'blue');
  
  if (unifiedProviderExists) {
    const providerContent = fs.readFileSync('ai/providers-unified.ts', 'utf8');
    test('Primary model configured', providerContent.includes('gemini-2.5-flash-lite-preview-06-17'));
    test('Secondary model configured', providerContent.includes('gemini-2.0-flash-001'));
    test('Pro model configured', providerContent.includes('gemini-2.5-pro'));
    test('Free unlimited flags set', providerContent.includes('freeUnlimited: true'));
  }

  // Test 5: Database Schema
  log('\n🗄️ Testing Database Schema...', 'blue');
  
  const schemaExists = fs.existsSync('lib/db/schema.ts');
  test('Database schema exists', schemaExists);
  
  if (schemaExists) {
    const schemaContent = fs.readFileSync('lib/db/schema.ts', 'utf8');
    test('User table defined', schemaContent.includes('export const user'));
    test('Chat table defined', schemaContent.includes('export const chat'));
    test('Message table defined', schemaContent.includes('export const message'));
    test('Subscription table defined', schemaContent.includes('export const subscription'));
  }

  // Test 6: Build Configuration
  log('\n🏗️ Testing Build Configuration...', 'blue');
  
  const packageJsonExists = fs.existsSync('package.json');
  test('Package.json exists', packageJsonExists);
  
  if (packageJsonExists) {
    const packageContent = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    test('Has build script', packageContent.scripts && packageContent.scripts.build);
    test('Has development script', packageContent.scripts && packageContent.scripts.dev);
    test('Has Next.js dependency', packageContent.dependencies && packageContent.dependencies.next);
    test('Has AI SDK dependencies', packageContent.dependencies && packageContent.dependencies.ai);
  }

  // Test 7: Environment Schema Validation
  log('\n🔐 Testing Environment Schema...', 'blue');
  
  const envSchemaExists = fs.existsSync('env/server.ts');
  test('Environment schema exists', envSchemaExists);
  
  if (envSchemaExists) {
    const envSchemaContent = fs.readFileSync('env/server.ts', 'utf8');
    test('Validates OpenRouter API key', envSchemaContent.includes('OPENROUTER_API_KEY'));
    test('Validates database URL', envSchemaContent.includes('DATABASE_URL'));
    test('Validates auth secret', envSchemaContent.includes('BETTER_AUTH_SECRET'));
    test('Uses zod validation', envSchemaContent.includes('z.string()'));
  }

  // Test Results Summary
  log('\n📊 Test Results Summary', 'cyan');
  log('═══════════════════════════', 'cyan');
  log(`✅ Passed: ${testResults.passed}`, 'green');
  log(`❌ Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
  
  const totalTests = testResults.passed + testResults.failed;
  const successRate = Math.round((testResults.passed / totalTests) * 100);
  
  log(`📈 Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 80 ? 'yellow' : 'red');

  if (testResults.failed > 0) {
    log('\n🚨 Failed Tests:', 'red');
    testResults.errors.forEach(error => log(`   • ${error}`, 'yellow'));
  }

  // Production Readiness Assessment
  log('\n🎯 Production Readiness Assessment', 'magenta');
  log('═══════════════════════════════════', 'magenta');
  
  if (successRate >= 95) {
    log('🚀 PRODUCTION READY! All systems green.', 'green');
    log('🕉️ TURYAM state achieved. Ready for thousands of students.', 'cyan');
  } else if (successRate >= 85) {
    log('⚠️  ALMOST READY! Minor issues need fixing.', 'yellow');
  } else {
    log('🔧 NOT READY! Critical issues must be resolved.', 'red');
  }

  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run the test suite
runTests().catch(error => {
  log(`\n💥 Test runner crashed: ${error.message}`, 'red');
  process.exit(1);
});