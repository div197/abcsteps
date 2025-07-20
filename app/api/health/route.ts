import { NextResponse } from 'next/server';

// 🕉️ Divine Health Check Endpoint
export async function GET() {
  try {
    // Step 66: Divine Health Check with TURYAM state monitoring
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: 'ABCSteps Vivek Learning Platform',
      turyamState: 'active',
      version: process.env.npm_package_version || '1.0.0',
      sanskrit: 'सर्वं स्वस्थं' // Everything is well
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'System check failed',
        sanskrit: 'कष्टं जातं' // Trouble has arisen
      },
      { status: 503 }
    );
  }
}