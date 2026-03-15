// Database connection managers
import mysql from 'mysql2/promise';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';
import { Logger } from './logger';

export class DatabaseConnections {
  private static mysqlConnection: mysql.Connection | null = null;
  private static supabaseClient: SupabaseClient | null = null;

  // Get MySQL Connection
  static async getMySQLConnection(): Promise<mysql.Connection> {
    try {
      if (!this.mysqlConnection) {
        Logger.info('Establishing MySQL connection to ShamSoft database...');
        this.mysqlConnection = await mysql.createConnection({
          host: config.mysql.host,
          port: config.mysql.port,
          user: config.mysql.user,
          password: config.mysql.password,
          database: config.mysql.database,
        });
        Logger.success('MySQL connection established');
      }
      return this.mysqlConnection;
    } catch (error) {
      Logger.error('Failed to connect to MySQL', error);
      throw error;
    }
  }

  // Get Supabase Client
  static getSupabaseClient(): SupabaseClient {
    try {
      if (!this.supabaseClient) {
        Logger.info('Initializing Supabase client...');
        this.supabaseClient = createClient(
          config.supabase.url,
          config.supabase.serviceKey
        );
        Logger.success('Supabase client initialized');
      }
      return this.supabaseClient;
    } catch (error) {
      Logger.error('Failed to initialize Supabase client', error);
      throw error;
    }
  }

  // Test connections
  static async testConnections(): Promise<boolean> {
    let mysqlOk = false;
    let supabaseOk = false;

    // Test MySQL
    try {
      const conn = await this.getMySQLConnection();
      await conn.ping();
      Logger.success('MySQL connection test passed');
      mysqlOk = true;
    } catch (error) {
      Logger.error('MySQL connection test failed', error);
    }

    // Test Supabase
    try {
      const supabase = this.getSupabaseClient();
      const { error } = await supabase.from('rooms').select('count').limit(1);
      if (error) throw error;
      Logger.success('Supabase connection test passed');
      supabaseOk = true;
    } catch (error) {
      Logger.error('Supabase connection test failed', error);
    }

    return mysqlOk && supabaseOk;
  }

  // Close connections
  static async closeConnections(): Promise<void> {
    if (this.mysqlConnection) {
      await this.mysqlConnection.end();
      this.mysqlConnection = null;
      Logger.info('MySQL connection closed');
    }
  }
}
