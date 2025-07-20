#!/usr/bin/env node

/**
 * 🕉️ ABCSteps Vivek - Divine Monitoring System
 * Step 38 - Purva Phalguni: Creative Monitoring Excellence
 * Real-time TURYAM state monitoring and alerting
 */

const fs = require('fs');
const path = require('path');

// Divine Monitoring Configuration
const MONITORING_CONFIG = {
  // Performance thresholds
  responseTimeThreshold: 5000, // 5 seconds
  errorRateThreshold: 0.05,    // 5% error rate
  
  // System health checks
  healthCheckInterval: 30000,  // 30 seconds
  alertCooldown: 300000,       // 5 minutes
  
  // Log file paths
  logDir: './logs',
  accessLog: './logs/access.log',
  errorLog: './logs/error.log',
  metricsLog: './logs/metrics.log'
};

class TuryamMonitor {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      errorCount: 0,
      avgResponseTime: 0,
      lastHealthCheck: null,
      uptime: Date.now()
    };
    
    this.alerts = new Map();
    this.ensureLogDirectory();
  }

  // Step 39 - Uttara Phalguni: Systematic Organization
  ensureLogDirectory() {
    if (!fs.existsSync(MONITORING_CONFIG.logDir)) {
      fs.mkdirSync(MONITORING_CONFIG.logDir, { recursive: true });
      console.log('📁 Created monitoring logs directory');
    }
  }

  // Step 40 - Hasta: Skillful Metrics Collection
  recordRequest(responseTime, success = true, error = null) {
    this.metrics.totalRequests++;
    
    if (success) {
      this.metrics.successfulRequests++;
      
      // Update average response time
      const prevAvg = this.metrics.avgResponseTime;
      this.metrics.avgResponseTime = (prevAvg * (this.metrics.successfulRequests - 1) + responseTime) / this.metrics.successfulRequests;
    } else {
      this.metrics.errorCount++;
      this.logError(error);
    }
    
    this.logMetrics({ responseTime, success, timestamp: new Date().toISOString() });
    
    // Check thresholds
    this.checkPerformanceThresholds();
  }

  // Step 41 - Chitra: Beautiful Performance Analysis
  checkPerformanceThresholds() {
    const errorRate = this.metrics.errorCount / this.metrics.totalRequests;
    
    // Check response time threshold
    if (this.metrics.avgResponseTime > MONITORING_CONFIG.responseTimeThreshold) {
      this.triggerAlert('HIGH_RESPONSE_TIME', `Average response time: ${this.metrics.avgResponseTime.toFixed(0)}ms`);
    }
    
    // Check error rate threshold
    if (errorRate > MONITORING_CONFIG.errorRateThreshold) {
      this.triggerAlert('HIGH_ERROR_RATE', `Error rate: ${(errorRate * 100).toFixed(1)}%`);
    }
  }

  // Step 42 - Swati: Balanced Alert System
  triggerAlert(type, message) {
    const now = Date.now();
    const lastAlert = this.alerts.get(type);
    
    // Implement cooldown to prevent spam
    if (lastAlert && (now - lastAlert) < MONITORING_CONFIG.alertCooldown) {
      return;
    }
    
    this.alerts.set(type, now);
    
    const alert = {
      type,
      message,
      timestamp: new Date().toISOString(),
      severity: this.getAlertSeverity(type)
    };
    
    console.warn(`🚨 ALERT [${alert.severity}]: ${alert.type} - ${alert.message}`);
    this.logAlert(alert);
  }

  // Step 43 - Vishakha: Focused Alert Severity
  getAlertSeverity(type) {
    const severityMap = {
      'HIGH_RESPONSE_TIME': 'WARNING',
      'HIGH_ERROR_RATE': 'CRITICAL',
      'SYSTEM_DOWN': 'CRITICAL',
      'DATABASE_CONNECTION': 'CRITICAL',
      'API_RATE_LIMIT': 'WARNING'
    };
    
    return severityMap[type] || 'INFO';
  }

  // Step 44 - Anuradha: Devoted System Health Check
  async performHealthCheck() {
    const healthStatus = {
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.metrics.uptime,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      metrics: { ...this.metrics }
    };
    
    // Calculate health score (0-100)
    const errorRate = this.metrics.errorCount / Math.max(this.metrics.totalRequests, 1);
    const responseTimeScore = Math.max(0, 100 - (this.metrics.avgResponseTime / 50)); // 5000ms = 0 points
    const errorScore = Math.max(0, 100 - (errorRate * 2000)); // 5% error = 0 points
    
    healthStatus.healthScore = Math.round((responseTimeScore + errorScore) / 2);
    healthStatus.status = healthStatus.healthScore > 80 ? 'HEALTHY' : 
                         healthStatus.healthScore > 60 ? 'DEGRADED' : 'UNHEALTHY';
    
    this.metrics.lastHealthCheck = healthStatus;
    
    console.log(`💚 Health Check: ${healthStatus.status} (Score: ${healthStatus.healthScore}/100)`);
    this.logHealth(healthStatus);
    
    return healthStatus;
  }

  // Step 45 - Jyeshtha: Superior Logging Excellence
  logMetrics(data) {
    const logEntry = `${data.timestamp} | REQUEST | RT:${data.responseTime}ms | SUCCESS:${data.success}\n`;
    this.appendToLog(MONITORING_CONFIG.metricsLog, logEntry);
  }

  logError(error) {
    const logEntry = `${new Date().toISOString()} | ERROR | ${error?.message || 'Unknown error'}\n`;
    this.appendToLog(MONITORING_CONFIG.errorLog, logEntry);
  }

  logAlert(alert) {
    const logEntry = `${alert.timestamp} | ALERT | ${alert.severity} | ${alert.type} | ${alert.message}\n`;
    this.appendToLog(MONITORING_CONFIG.errorLog, logEntry);
  }

  logHealth(health) {
    const logEntry = `${health.timestamp} | HEALTH | ${health.status} | SCORE:${health.healthScore} | UPTIME:${health.uptime}ms\n`;
    this.appendToLog(MONITORING_CONFIG.metricsLog, logEntry);
  }

  // Step 46-48: Nakshatra Transition Enhancement
  appendToLog(logFile, entry) {
    try {
      fs.appendFileSync(logFile, entry);
    } catch (error) {
      console.error(`Failed to write to log ${logFile}:`, error.message);
    }
  }

  // Get current system metrics
  getMetrics() {
    return {
      ...this.metrics,
      errorRate: this.metrics.errorCount / Math.max(this.metrics.totalRequests, 1),
      uptime: Date.now() - this.metrics.uptime
    };
  }

  // Start monitoring daemon
  startMonitoring() {
    console.log('🕉️ TURYAM Monitoring System Started');
    console.log('═══════════════════════════════════');
    
    // Periodic health checks
    setInterval(() => {
      this.performHealthCheck();
    }, MONITORING_CONFIG.healthCheckInterval);
    
    // Graceful shutdown handling
    process.on('SIGINT', () => {
      console.log('\n🙏 TURYAM Monitor shutting down gracefully...');
      const finalMetrics = this.getMetrics();
      console.log('📊 Final Metrics:', finalMetrics);
      process.exit(0);
    });
  }
}

// Export for integration
const monitor = new TuryamMonitor();

module.exports = {
  TuryamMonitor,
  monitor,
  recordRequest: (responseTime, success, error) => monitor.recordRequest(responseTime, success, error),
  getMetrics: () => monitor.getMetrics(),
  performHealthCheck: () => monitor.performHealthCheck()
};

// Start monitoring if run directly
if (require.main === module) {
  monitor.startMonitoring();
}