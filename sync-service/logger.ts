// Logger utility for sync operations
export class Logger {
  private static formatTimestamp(): string {
    return new Date().toISOString();
  }

  static info(message: string, data?: any) {
    console.log(`[${this.formatTimestamp()}] ℹ️  INFO: ${message}`);
    if (data) {
      console.log('   Data:', JSON.stringify(data, null, 2));
    }
  }

  static success(message: string, data?: any) {
    console.log(`[${this.formatTimestamp()}] ✅ SUCCESS: ${message}`);
    if (data) {
      console.log('   Data:', JSON.stringify(data, null, 2));
    }
  }

  static error(message: string, error?: any) {
    console.error(`[${this.formatTimestamp()}] ❌ ERROR: ${message}`);
    if (error) {
      console.error('   Error:', error.message || error);
      if (error.stack) {
        console.error('   Stack:', error.stack);
      }
    }
  }

  static warn(message: string, data?: any) {
    console.warn(`[${this.formatTimestamp()}] ⚠️  WARNING: ${message}`);
    if (data) {
      console.warn('   Data:', JSON.stringify(data, null, 2));
    }
  }

  static separator() {
    console.log('\n' + '='.repeat(80) + '\n');
  }
}
