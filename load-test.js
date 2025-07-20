#!/usr/bin/env node

/**
 * 🕉️ ABCSteps Vivek - Load Testing for TURYAM State
 * Simulates concurrent student interactions to test scalability
 */

const http = require('http');
const https = require('https');

// Configuration
const LOAD_TEST_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  concurrent: 50, // Concurrent requests
  requests: 200,  // Total requests
  timeout: 30000, // 30 second timeout
};

// Sample educational queries for load testing
const EDUCATIONAL_QUERIES = [
  "Explain photosynthesis in simple terms",
  "What is the Pythagorean theorem?", 
  "Help me understand Newton's laws",
  "Translate 'education' to Hindi",
  "What is the weather like today?",
  "Solve: 2x + 5 = 15",
  "Explain the water cycle",
  "What is the capital of India?",
  "Help me with basic algebra",
  "Explain cellular respiration"
];

// Create a mock request payload
function createTestPayload(query) {
  return {
    messages: [
      {
        id: `msg-${Date.now()}-${Math.random()}`,
        role: 'user',
        content: query,
        parts: [{ type: 'text', value: query }]
      }
    ],
    model: 'turyam-primary',
    group: 'chat',
    timezone: 'Asia/Kolkata',
    id: `chat-${Date.now()}-${Math.random()}`,
    selectedVisibilityType: 'public'
  };
}

// Simulate a single request
function simulateRequest(query, requestId) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const payload = JSON.stringify(createTestPayload(query));
    
    const options = {
      hostname: LOAD_TEST_CONFIG.baseUrl.includes('localhost') ? 'localhost' : new URL(LOAD_TEST_CONFIG.baseUrl).hostname,
      port: LOAD_TEST_CONFIG.baseUrl.includes('localhost') ? 3000 : 443,
      path: '/api/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': 'ABCSteps-LoadTest/1.0'
      },
      timeout: LOAD_TEST_CONFIG.timeout
    };

    const client = LOAD_TEST_CONFIG.baseUrl.includes('https') ? https : http;
    
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        resolve({
          requestId,
          query,
          statusCode: res.statusCode,
          responseTime,
          success: res.statusCode < 400,
          size: data.length
        });
      });
    });

    req.on('error', (error) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      resolve({
        requestId,
        query,
        statusCode: 0,
        responseTime,
        success: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      resolve({
        requestId,
        query,
        statusCode: 0,
        responseTime,
        success: false,
        error: 'Request timeout'
      });
    });

    req.write(payload);
    req.end();
  });
}

// Run concurrent batch of requests
async function runBatch(batchSize, batchNumber) {
  console.log(`📦 Running batch ${batchNumber} (${batchSize} requests)...`);
  
  const promises = [];
  for (let i = 0; i < batchSize; i++) {
    const query = EDUCATIONAL_QUERIES[Math.floor(Math.random() * EDUCATIONAL_QUERIES.length)];
    const requestId = `batch-${batchNumber}-req-${i}`;
    promises.push(simulateRequest(query, requestId));
  }
  
  const results = await Promise.all(promises);
  const successful = results.filter(r => r.success).length;
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  
  console.log(`  ✅ Batch ${batchNumber}: ${successful}/${batchSize} successful, avg ${avgResponseTime.toFixed(0)}ms`);
  
  return results;
}

// Main load test function
async function runLoadTest() {
  console.log('\n🕉️ ABCSteps Vivek - Load Test Suite');
  console.log('═══════════════════════════════════');
  console.log(`🎯 Target: ${LOAD_TEST_CONFIG.baseUrl}`);
  console.log(`📊 Concurrent: ${LOAD_TEST_CONFIG.concurrent}`);
  console.log(`📈 Total Requests: ${LOAD_TEST_CONFIG.requests}`);
  console.log(`⏱️  Timeout: ${LOAD_TEST_CONFIG.timeout}ms`);
  console.log('');

  const startTime = Date.now();
  const allResults = [];
  
  // Calculate number of batches
  const batches = Math.ceil(LOAD_TEST_CONFIG.requests / LOAD_TEST_CONFIG.concurrent);
  
  for (let batch = 1; batch <= batches; batch++) {
    const batchSize = Math.min(
      LOAD_TEST_CONFIG.concurrent, 
      LOAD_TEST_CONFIG.requests - ((batch - 1) * LOAD_TEST_CONFIG.concurrent)
    );
    
    const batchResults = await runBatch(batchSize, batch);
    allResults.push(...batchResults);
    
    // Brief pause between batches to avoid overwhelming
    if (batch < batches) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  // Calculate statistics
  const successful = allResults.filter(r => r.success).length;
  const failed = allResults.length - successful;
  const successRate = (successful / allResults.length) * 100;
  const avgResponseTime = allResults
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.responseTime, 0) / successful;
  const requestsPerSecond = (allResults.length / totalTime) * 1000;
  
  // Display results
  console.log('\n📊 Load Test Results');
  console.log('═══════════════════');
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`⚡ Avg Response Time: ${avgResponseTime.toFixed(0)}ms`);
  console.log(`🚀 Requests/Second: ${requestsPerSecond.toFixed(1)}`);
  console.log(`⏱️  Total Time: ${(totalTime / 1000).toFixed(1)}s`);
  
  // Assessment
  console.log('\n🎯 Performance Assessment');
  console.log('═════════════════════════');
  
  if (successRate >= 95) {
    console.log('🟢 EXCELLENT: High availability achieved');
  } else if (successRate >= 90) {
    console.log('🟡 GOOD: Acceptable performance with room for improvement');
  } else {
    console.log('🔴 NEEDS IMPROVEMENT: Performance issues detected');
  }
  
  if (avgResponseTime <= 2000) {
    console.log('🟢 EXCELLENT: Fast response times');
  } else if (avgResponseTime <= 5000) {
    console.log('🟡 GOOD: Acceptable response times');
  } else {
    console.log('🔴 SLOW: Response times need optimization');
  }
  
  console.log('\n🕉️ TURYAM State Load Test Complete');
  
  return {
    successful,
    failed,
    successRate,
    avgResponseTime,
    requestsPerSecond,
    totalTime
  };
}

// Only run if called directly
if (require.main === module) {
  runLoadTest()
    .then(results => {
      process.exit(results.successRate >= 90 ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Load test crashed:', error.message);
      process.exit(1);
    });
}

module.exports = { runLoadTest };