#!/usr/bin/env node

/**
 * 🕉️ ABCSteps Vivek - Divine Security Audit Engine
 * Steps 73-90: Ultimate Security Excellence
 * Comprehensive security analysis and hardening
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Step 73 - Uttara Bhadrapada: Back Legs of Cosmic Protection
class SecurityAudit {
  constructor() {
    this.vulnerabilities = [];
    this.recommendations = [];
    this.securityScore = 0;
  }

  // Step 74-76 - Revati: Wealth of Divine Security
  async auditEnvironmentSecurity() {
    console.log('🔐 Auditing Environment Security...');
    
    const findings = [];
    
    // Check .env file protection
    if (fs.existsSync('.env')) {
      findings.push({
        type: 'WARNING',
        issue: '.env file exists in repository',
        recommendation: 'Move to .env.local and add to .gitignore'
      });
    }
    
    // Check .gitignore protection
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    const protectedPatterns = ['.env', '*.env', '.env.*'];
    
    protectedPatterns.forEach(pattern => {
      if (!gitignore.includes(pattern)) {
        findings.push({
          type: 'CRITICAL',
          issue: `Missing .gitignore protection for ${pattern}`,
          recommendation: `Add ${pattern} to .gitignore`
        });
      }
    });
    
    // Check environment variables in .env.example
    if (fs.existsSync('.env.example')) {
      const envExample = fs.readFileSync('.env.example', 'utf8');
      const secretPatterns = [
        /sk-[a-zA-Z0-9]{20,}/,  // API keys
        /[a-f0-9]{32,}/,        // Hashes/secrets
        /postgres:\/\/.*:.*@/   // DB URLs with credentials
      ];
      
      secretPatterns.forEach(pattern => {
        if (pattern.test(envExample)) {
          findings.push({
            type: 'CRITICAL',
            issue: 'Potential secret found in .env.example',
            recommendation: 'Remove actual secrets from example file'
          });
        }
      });
    }
    
    return findings;
  }

  // Step 77-81 - Ashwini: Divine Speed in Vulnerability Detection
  async auditCodeSecurity() {
    console.log('🛡️ Auditing Code Security...');
    
    const findings = [];
    const codeFiles = this.getCodeFiles();
    
    for (const filePath of codeFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for hardcoded secrets
      const secretPatterns = [
        { pattern: /sk-[a-zA-Z0-9]{20,}/, name: 'OpenAI/OpenRouter API Key' },
        { pattern: /AIza[a-zA-Z0-9]{35}/, name: 'Google API Key' },
        { pattern: /pk_[a-zA-Z0-9]{50,}/, name: 'Stripe Key' },
        { pattern: /[a-f0-9]{64}/, name: 'SHA-256 Hash' }
      ];
      
      secretPatterns.forEach(({ pattern, name }) => {
        if (pattern.test(content)) {
          findings.push({
            type: 'CRITICAL',
            file: filePath,
            issue: `Hardcoded ${name} detected`,
            recommendation: 'Move to environment variables'
          });
        }
      });
      
      // Check for SQL injection vulnerabilities
      const sqlPatterns = [
        /\\$\\{.*\\}/,  // Template literals in SQL
        /["']\\s*\\+\\s*.*\\+\\s*["']/  // String concatenation
      ];
      
      if (filePath.includes('.ts') || filePath.includes('.js')) {
        sqlPatterns.forEach(pattern => {
          if (pattern.test(content)) {
            findings.push({
              type: 'HIGH',
              file: filePath,
              issue: 'Potential SQL injection vulnerability',
              recommendation: 'Use parameterized queries'
            });
          }
        });
      }
      
      // Check for XSS vulnerabilities
      if (content.includes('dangerouslySetInnerHTML')) {
        findings.push({
          type: 'HIGH',
          file: filePath,
          issue: 'Potential XSS vulnerability',
          recommendation: 'Sanitize HTML content'
        });
      }
    }
    
    return findings;
  }

  // Step 82-85 - Bharani: Bearer of Security Transformation
  async auditDependencySecurity() {
    console.log('📦 Auditing Dependency Security...');
    
    const findings = [];
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check for known vulnerable packages
    const vulnerablePackages = [
      'lodash',  // Often has security issues
      'moment',  // Deprecated, use date-fns
      'request', // Deprecated
      'node-uuid' // Use uuid instead
    ];
    
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    
    vulnerablePackages.forEach(pkg => {
      if (allDeps[pkg]) {
        findings.push({
          type: 'WARNING',
          issue: `Potentially vulnerable package: ${pkg}`,
          recommendation: `Consider replacing with secure alternative`
        });
      }
    });
    
    // Check for outdated critical security packages
    const securityPackages = [
      '@vercel/edge-config',
      '@vercel/functions',
      'better-auth',
      'next'
    ];
    
    return findings;
  }

  // Step 86-90 - Krittika: Cutting Edge Security Measures
  async auditAPISecurityHeaders() {
    console.log('🔒 Auditing API Security Headers...');
    
    const findings = [];
    const apiFiles = this.getAPIFiles();
    
    for (const filePath of apiFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for security headers
      const requiredHeaders = [
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Strict-Transport-Security'
      ];
      
      const hasSecurityHeaders = requiredHeaders.some(header => 
        content.includes(header)
      );
      
      if (!hasSecurityHeaders) {
        findings.push({
          type: 'MEDIUM',
          file: filePath,
          issue: 'Missing security headers',
          recommendation: 'Add security headers to API responses'
        });
      }
      
      // Check for rate limiting
      if (!content.includes('rate') && !content.includes('limit')) {
        findings.push({
          type: 'MEDIUM',
          file: filePath,
          issue: 'No rate limiting detected',
          recommendation: 'Implement rate limiting for API endpoints'
        });
      }
    }
    
    return findings;
  }

  // Step 91-95 - Helper Methods for Divine File Discovery
  getCodeFiles() {
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const directories = ['app', 'lib', 'components', 'ai'];
    
    const files = [];
    
    directories.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.walkDirectory(dir, extensions, files);
      }
    });
    
    return files;
  }

  getAPIFiles() {
    const files = [];
    const apiDir = 'app/api';
    
    if (fs.existsSync(apiDir)) {
      this.walkDirectory(apiDir, ['.ts', '.js'], files);
    }
    
    return files;
  }

  walkDirectory(dir, extensions, files) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.walkDirectory(fullPath, extensions, files);
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  }

  // Step 96-99 - Security Score Calculation
  calculateSecurityScore(allFindings) {
    let score = 100;
    
    allFindings.forEach(finding => {
      switch (finding.type) {
        case 'CRITICAL':
          score -= 25;
          break;
        case 'HIGH':
          score -= 15;
          break;
        case 'MEDIUM':
          score -= 10;
          break;
        case 'WARNING':
          score -= 5;
          break;
      }
    });
    
    return Math.max(0, score);
  }

  // Step 100-105 - Main Security Audit Execution
  async runCompleteAudit() {
    console.log('\\n🕉️ ABCSteps Vivek - Divine Security Audit');
    console.log('═════════════════════════════════════════');
    
    const allFindings = [];
    
    // Run all security audits
    const envFindings = await this.auditEnvironmentSecurity();
    const codeFindings = await this.auditCodeSecurity();
    const depFindings = await this.auditDependencySecurity();
    const apiFindings = await this.auditAPISecurityHeaders();
    
    allFindings.push(...envFindings, ...codeFindings, ...depFindings, ...apiFindings);
    
    // Calculate security score
    const securityScore = this.calculateSecurityScore(allFindings);
    
    // Group findings by severity
    const grouped = allFindings.reduce((acc, finding) => {
      acc[finding.type] = acc[finding.type] || [];
      acc[finding.type].push(finding);
      return acc;
    }, {});
    
    // Display results
    console.log('\\n🛡️ Security Audit Results');
    console.log('═══════════════════════');
    console.log(`🔢 Security Score: ${securityScore}/100`);
    console.log(`📊 Total Issues: ${allFindings.length}`);
    
    Object.entries(grouped).forEach(([severity, findings]) => {
      console.log(`\\n${this.getSeverityIcon(severity)} ${severity} (${findings.length})`);
      findings.forEach(finding => {
        console.log(`  • ${finding.issue}`);
        if (finding.file) console.log(`    File: ${finding.file}`);
        console.log(`    Fix: ${finding.recommendation}`);
      });
    });
    
    // Security assessment
    console.log('\\n🎯 Security Assessment');
    console.log('═════════════════════');
    
    if (securityScore >= 90) {
      console.log('🟢 EXCELLENT: Enterprise-grade security achieved');
    } else if (securityScore >= 75) {
      console.log('🟡 GOOD: Strong security with minor improvements needed');
    } else if (securityScore >= 50) {
      console.log('🟠 FAIR: Moderate security, several issues to address');
    } else {
      console.log('🔴 POOR: Significant security vulnerabilities detected');
    }
    
    console.log('\\n🕉️ Divine Protection Analysis Complete');
    
    return {
      score: securityScore,
      findings: allFindings,
      grouped
    };
  }

  getSeverityIcon(severity) {
    const icons = {
      'CRITICAL': '🚨',
      'HIGH': '⚠️',
      'MEDIUM': '⚡',
      'WARNING': '💡'
    };
    return icons[severity] || '📝';
  }
}

// Export for integration
module.exports = { SecurityAudit };

// CLI execution
if (require.main === module) {
  const audit = new SecurityAudit();
  
  audit.runCompleteAudit()
    .then(result => {
      process.exit(result.score >= 75 ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Security audit crashed:', error);
      process.exit(1);
    });
}