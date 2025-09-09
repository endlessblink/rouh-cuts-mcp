/**
 * Cross-platform executable finder with robust PATH resolution
 * Based on Perplexity research: Fixes ENOENT and PATH inheritance issues
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

export interface ExecutableLocation {
  command: string;
  fullPath: string;
  version?: string;
}

/**
 * Find executable across all platforms with fallback to common installation paths
 */
export function findExecutable(command: string): ExecutableLocation {
  const isWindows = process.platform === 'win32';
  const findCommand = isWindows ? 'where' : 'which';
  
  try {
    // First, try standard PATH resolution
    const result = execSync(`${findCommand} ${command}`, { 
      encoding: 'utf8',
      env: process.env,
      timeout: 5000
    }).trim();
    
    // On Windows, 'where' returns all matches, take the first one
    const fullPath = isWindows ? result.split('\n')[0] : result;
    
    // Verify the path exists and is executable
    if (fs.existsSync(fullPath)) {
      return {
        command,
        fullPath,
        version: getVersion(fullPath, command)
      };
    }
  } catch (error) {
    // PATH resolution failed, try common installation directories
    console.error(`PATH lookup failed for ${command}, trying fallback paths...`);
  }
  
  // Fallback to common installation paths
  const commonPaths = getCommonPaths(command);
  
  for (const candidatePath of commonPaths) {
    if (fs.existsSync(candidatePath)) {
      try {
        // Test if executable works
        const version = getVersion(candidatePath, command);
        return {
          command,
          fullPath: candidatePath,
          version
        };
      } catch (error) {
        // This path exists but doesn't work, continue
        continue;
      }
    }
  }
  
  throw new Error(`${command} not found in PATH or common installation locations. Please ensure ${command} is installed and accessible.`);
}

function getCommonPaths(command: string): string[] {
  const isWindows = process.platform === 'win32';
  const isMac = process.platform === 'darwin';
  
  if (isWindows) {
    const extensions = ['.exe', '.cmd', '.bat'];
    const basePaths = [
      'C:\\Program Files\\nodejs\\',
      'C:\\nodejs\\',
      'C:\\Users\\' + os.userInfo().username + '\\AppData\\Roaming\\npm\\',
      process.env.APPDATA + '\\npm\\',
      process.env.LOCALAPPDATA + '\\npm\\'
    ].filter(Boolean);
    
    return basePaths.flatMap(basePath => 
      extensions.map(ext => path.join(basePath, command + ext))
    );
  } else {
    // macOS and Linux
    const basePaths = [
      '/usr/local/bin/',
      '/usr/bin/',
      '/bin/',
      '/opt/homebrew/bin/',  // macOS Homebrew on Apple Silicon
      '/home/linuxbrew/.linuxbrew/bin/',  // Linux Homebrew
      process.env.HOME + '/.local/bin/',
      process.env.HOME + '/bin/',
      ...(isMac ? ['/usr/local/bin/', '/opt/local/bin/'] : [])
    ].filter(Boolean);
    
    return basePaths.map(basePath => path.join(basePath, command));
  }
}

function getVersion(executablePath: string, command: string): string | undefined {
  try {
    const result = execSync(`"${executablePath}" --version`, {
      encoding: 'utf8',
      timeout: 3000,
      env: process.env
    }).trim();
    
    return result;
  } catch (error) {
    // Some executables might not support --version
    return undefined;
  }
}

/**
 * Create environment with proper PATH inheritance
 */
export function createInheritedEnvironment(additionalEnv: Record<string, string> = {}): Record<string, string> {
  return {
    ...process.env,  // Inherit all environment variables - CRITICAL for PATH
    npm_config_loglevel: 'error',  // Suppress npm noise
    npm_config_progress: 'false',  // Disable progress bars
    CI: 'true',  // Suppress interactive prompts
    ...additionalEnv
  };
}

/**
 * Validate that all required executables are available
 */
export function validateEnvironment(): { valid: boolean; missing: string[]; found: ExecutableLocation[] } {
  const requiredExecutables = ['node', 'npm', 'npx'];
  const found: ExecutableLocation[] = [];
  const missing: string[] = [];
  
  for (const executable of requiredExecutables) {
    try {
      const location = findExecutable(executable);
      found.push(location);
    } catch (error) {
      missing.push(executable);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
    found
  };
}
