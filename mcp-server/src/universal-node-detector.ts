import os from 'os';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Universal Node.js executable detection for MCP servers
 * Eliminates false positive PATH detection issues across all platforms
 */
export class UniversalNodeDetector {
  private platform: string;
  private arch: string;
  private homedir: string;
  private debug: boolean;
  private cache: Map<string, string | null>;

  constructor(options: { debug?: boolean } = {}) {
    this.platform = os.platform();
    this.arch = os.arch();
    this.homedir = os.homedir();
    this.debug = options.debug || false;
    this.cache = new Map();
    
    this.log('Initialized Universal Node Detector for platform:', this.platform);
  }

  log(...args: any[]) {
    if (this.debug) {
      console.error('[UniversalNodeDetector]', ...args);
    }
  }

  /**
   * Get comprehensive fallback paths for Node.js installations
   */
  private getFallbackPaths(executable: string): string[] {
    const paths: string[] = [];
    
    if (this.platform === 'win32') {
      // Windows paths - including spaces in "Program Files"
      paths.push(
        `C:\\Program Files\\nodejs\\${executable}.exe`,
        `C:\\Program Files\\nodejs\\${executable}.cmd`,
        `C:\\Program Files (x86)\\nodejs\\${executable}.exe`, 
        `C:\\Program Files (x86)\\nodejs\\${executable}.cmd`,
        path.join(this.homedir, 'AppData', 'Local', 'Programs', 'node', `${executable}.exe`),
        `C:\\nodejs\\${executable}.exe`,
        `C:\\tools\\nodejs\\${executable}.exe`
      );
    } else if (this.platform === 'darwin') {
      // macOS paths
      paths.push(
        `/usr/local/bin/${executable}`,
        `/opt/homebrew/bin/${executable}`,
        `/usr/bin/${executable}`,
        path.join(this.homedir, '.nvm/versions/node/*/bin', executable)
      );
    } else {
      // Linux/Unix paths
      paths.push(
        `/usr/bin/${executable}`,
        `/usr/local/bin/${executable}`,
        `/opt/node/bin/${executable}`,
        path.join(this.homedir, '.nvm/versions/node/*/bin', executable)
      );
    }
    
    return paths;
  }

  /**
   * Safe command execution with proper path quoting
   */
  private async safeExec(command: string, args: string[] = []): Promise<{
    success: boolean;
    stdout: string;
    stderr: string;
  }> {
    return new Promise((resolve) => {
      try {
        const child = spawn(command, args, {
          stdio: ['ignore', 'pipe', 'pipe'],
          shell: this.platform === 'win32'
        });
        
        let stdout = '';
        let stderr = '';
        
        child.stdout?.on('data', (data) => {
          stdout += data.toString();
        });
        
        child.stderr?.on('data', (data) => {
          stderr += data.toString();
        });
        
        child.on('close', (code) => {
          resolve({
            success: code === 0,
            stdout: stdout.trim(),
            stderr: stderr.trim()
          });
        });
        
        child.on('error', (error) => {
          resolve({
            success: false,
            stdout: '',
            stderr: error.message
          });
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          child.kill();
          resolve({ success: false, stdout: '', stderr: 'Timeout' });
        }, 5000);
        
      } catch (error) {
        resolve({ 
          success: false, 
          stdout: '', 
          stderr: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  }

  /**
   * Check if file exists asynchronously
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Detect Node.js executable with comprehensive fallback
   */
  async detectNode(): Promise<string | null> {
    if (this.cache.has('node')) {
      return this.cache.get('node') || null;
    }

    this.log('Starting Node.js detection...');

    // Method 1: Try 'where' or 'which' command
    const whereCmd = this.platform === 'win32' ? 'where' : 'which';
    const whereResult = await this.safeExec(whereCmd, ['node']);
    
    if (whereResult.success && whereResult.stdout) {
      const firstPath = whereResult.stdout.split('\n')[0].trim();
      if (await this.fileExists(firstPath)) {
        this.log('Found Node.js via PATH:', firstPath);
        this.cache.set('node', firstPath);
        return firstPath;
      }
    }

    this.log('PATH detection failed, trying fallback paths...');

    // Method 2: Try fallback paths
    const fallbackPaths = this.getFallbackPaths('node');
    for (const testPath of fallbackPaths) {
      if (await this.fileExists(testPath)) {
        this.log('Found Node.js via fallback:', testPath);
        this.cache.set('node', testPath);
        return testPath;
      }
    }

    this.log('Node.js not found in any location');
    this.cache.set('node', null);
    return null;
  }

  /**
   * Detect npm executable
   */
  async detectNpm(): Promise<string | null> {
    if (this.cache.has('npm')) {
      return this.cache.get('npm') || null;
    }

    this.log('Starting npm detection...');

    // Method 1: Try PATH
    const whereCmd = this.platform === 'win32' ? 'where' : 'which';
    const whereResult = await this.safeExec(whereCmd, ['npm']);
    
    if (whereResult.success && whereResult.stdout) {
      const firstPath = whereResult.stdout.split('\n')[0].trim();
      if (await this.fileExists(firstPath)) {
        this.log('Found npm via PATH:', firstPath);
        this.cache.set('npm', firstPath);
        return firstPath;
      }
    }

    // Method 2: Try fallback paths
    const fallbackPaths = this.getFallbackPaths('npm');
    for (const testPath of fallbackPaths) {
      if (await this.fileExists(testPath)) {
        this.log('Found npm via fallback:', testPath);
        this.cache.set('npm', testPath);
        return testPath;
      }
    }

    this.log('npm not found in any location');
    this.cache.set('npm', null);
    return null;
  }

  /**
   * Detect npx executable
   */
  async detectNpx(): Promise<string | null> {
    if (this.cache.has('npx')) {
      return this.cache.get('npx') || null;
    }

    this.log('Starting npx detection...');

    // Method 1: Try PATH
    const whereCmd = this.platform === 'win32' ? 'where' : 'which';
    const whereResult = await this.safeExec(whereCmd, ['npx']);
    
    if (whereResult.success && whereResult.stdout) {
      const firstPath = whereResult.stdout.split('\n')[0].trim();
      if (await this.fileExists(firstPath)) {
        this.log('Found npx via PATH:', firstPath);
        this.cache.set('npx', firstPath);
        return firstPath;
      }
    }

    // Method 2: Try fallback paths
    const fallbackPaths = this.getFallbackPaths('npx');
    for (const testPath of fallbackPaths) {
      if (await this.fileExists(testPath)) {
        this.log('Found npx via fallback:', testPath);
        this.cache.set('npx', testPath);
        return testPath;
      }
    }

    this.log('npx not found in any location');
    this.cache.set('npx', null);
    return null;
  }

  /**
   * Detect Remotion binary
   */
  async detectRemotionBinary(): Promise<string | null> {
    if (this.cache.has('remotion')) {
      return this.cache.get('remotion') || null;
    }

    this.log('Starting Remotion detection...');

    // Try global installation first
    const npxPath = await this.detectNpx();
    if (npxPath) {
      this.cache.set('remotion', `${npxPath} remotion`);
      return `${npxPath} remotion`;
    }

    this.cache.set('remotion', null);
    return null;
  }

  /**
   * Get quoted path for Windows compatibility
   */
  getQuotedPath(execPath: string): string {
    if (this.platform === 'win32' && execPath.includes(' ')) {
      return `"${execPath}"`;
    }
    return execPath;
  }

  /**
   * Generic executable detection
   */
  async detectGeneric(name: string): Promise<string | null> {
    const cacheKey = `generic_${name}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) || null;
    }

    this.log(`Starting ${name} detection...`);

    // Try PATH detection
    const whereCmd = this.platform === 'win32' ? 'where' : 'which';
    const whereResult = await this.safeExec(whereCmd, [name]);
    
    if (whereResult.success && whereResult.stdout) {
      const firstPath = whereResult.stdout.split('\n')[0].trim();
      if (await this.fileExists(firstPath)) {
        this.log(`Found ${name} via PATH:`, firstPath);
        this.cache.set(cacheKey, firstPath);
        return firstPath;
      }
    }

    this.log(`${name} not found`);
    this.cache.set(cacheKey, null);
    return null;
  }
}