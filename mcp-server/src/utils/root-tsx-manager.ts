/**
 * Root.tsx Corruption Prevention & Auto-Repair System
 * Prevents duplicate imports, malformed compositions, and file corruption
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import writeFileAtomic from 'write-file-atomic';

interface ComponentEntry {
  name: string;
  path: string;
  duration: number;
  width: number;
  height: number;
}

export class RootTsxManager {
  private readonly rootTsxPath: string;
  private readonly componentsDir: string;

  constructor(projectPath: string) {
    this.rootTsxPath = path.join(projectPath, 'src', 'Root.tsx');
    this.componentsDir = path.join(projectPath, 'src', 'components');
  }

  /**
   * Auto-fix corrupted Root.tsx by scanning filesystem and regenerating clean content
   */
  async repairRootTsx(): Promise<{ success: boolean; message: string; componentsFound: number }> {
    try {
      console.log('🔧 Analyzing Root.tsx for corruption...');
      
      // Scan existing components from filesystem (corruption-proof)
      const existingComponents = await this.scanExistingComponents();
      
      // Generate clean Root.tsx content
      const cleanContent = this.generateCleanRootTsx(existingComponents);
      
      // Atomic write to prevent corruption during write operation
      await this.atomicWrite(this.rootTsxPath, cleanContent);
      
      console.log(`✅ Root.tsx repaired with ${existingComponents.length} components`);
      
      return {
        success: true,
        message: `Root.tsx automatically repaired with ${existingComponents.length} valid components`,
        componentsFound: existingComponents.length
      };
      
    } catch (error) {
      console.error('❌ Root.tsx repair failed:', error);
      return {
        success: false,
        message: `Repair failed: ${(error as Error).message}`,
        componentsFound: 0
      };
    }
  }

  /**
   * Create component with automatic Root.tsx management (corruption prevention)
   */
  async addComponentSafely(componentName: string, componentCode: string, options: Partial<ComponentEntry>): Promise<void> {
    // Ensure components directory exists
    await fs.mkdir(this.componentsDir, { recursive: true });
    
    // First, create the component file atomically
    const componentPath = path.join(this.componentsDir, `${componentName}.tsx`);
    await this.atomicWrite(componentPath, componentCode);
    
    // Then, update Root.tsx with automatic deduplication
    await this.updateRootTsxSafely(componentName, {
      name: componentName,
      path: `./components/${componentName}`,
      duration: options.duration || 90,
      width: options.width || 1920,
      height: options.height || 1080
    });
  }

  /**
   * Safe Root.tsx updates with built-in deduplication
   */
  private async updateRootTsxSafely(newComponentName: string, options: ComponentEntry): Promise<void> {
    // Read current components from filesystem (handles corruption automatically)
    const existingComponents = await this.scanExistingComponents();
    
    // Add new component with automatic deduplication
    const updatedComponents = this.deduplicateComponents([
      ...existingComponents,
      options
    ]);
    
    // Generate clean content
    const cleanContent = this.generateCleanRootTsx(updatedComponents);
    
    // Atomic write to prevent corruption
    await this.atomicWrite(this.rootTsxPath, cleanContent);
    
    console.log(`✅ Root.tsx updated safely with component: ${newComponentName}`);
  }

  /**
   * Scan filesystem for actual components (corruption-proof approach)
   */
  private async scanExistingComponents(): Promise<ComponentEntry[]> {
    const components: ComponentEntry[] = [];
    
    try {
      await fs.access(this.componentsDir);
      const files = await fs.readdir(this.componentsDir);
      
      for (const file of files) {
        if (file.endsWith('.tsx') && file !== 'index.tsx') {
          const componentName = file.replace('.tsx', '');
          const componentPath = path.join(this.componentsDir, file);
          
          // Verify file is readable and not corrupted
          try {
            const stats = await fs.stat(componentPath);
            if (stats.isFile() && stats.size > 0) {
              // Read component file to extract metadata (basic approach)
              const content = await fs.readFile(componentPath, 'utf8');
              
              components.push({
                name: componentName,
                path: `./components/${componentName}`,
                duration: this.extractDurationFromCode(content) || 90,
                width: 1920, // Default, could be enhanced to read from component
                height: 1080 // Default, could be enhanced to read from component
              });
            }
          } catch (error) {
            console.warn(`⚠️ Skipping corrupted component file: ${componentName} (${(error as Error).message})`);
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Components directory not found, starting fresh');
    }
    
    console.log(`📊 Found ${components.length} valid components in filesystem`);
    return components;
  }

  /**
   * Remove duplicates based on component name (prevents accumulation)
   */
  private deduplicateComponents(components: ComponentEntry[]): ComponentEntry[] {
    const seen = new Set<string>();
    const deduplicated = components.filter(component => {
      if (seen.has(component.name)) {
        console.log(`🔄 Removing duplicate component: ${component.name}`);
        return false;
      }
      seen.add(component.name);
      return true;
    });
    
    console.log(`🧹 Deduplicated: ${components.length} → ${deduplicated.length} components`);
    return deduplicated;
  }

  /**
   * Generate clean, valid Root.tsx content
   */
  private generateCleanRootTsx(components: ComponentEntry[]): string {
    // Generate imports (sorted for consistency)
    const sortedComponents = components.sort((a, b) => a.name.localeCompare(b.name));
    const imports = sortedComponents
      .map(comp => `import ${comp.name} from '${comp.path}';`)
      .join('\n');

    // Generate compositions (sorted for consistency)
    const compositions = sortedComponents
      .map(comp => `      <Composition
        id="${comp.name}"
        component={${comp.name}}
        durationInFrames={${comp.duration}}
        fps={30}
        width={${comp.width}}
        height={${comp.height}}
      />`)
      .join('\n');

    // Return clean, properly formatted Root.tsx
    return `import { Composition } from 'remotion';
${imports}

export const RemotionRoot: React.FC = () => {
  return (
    <>
${compositions}
    </>
  );
};
`;
  }

  /**
   * Atomic file write to prevent corruption during write operations
   */
  private async atomicWrite(filePath: string, content: string): Promise<void> {
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    // Use atomic write to prevent file corruption
    return new Promise<void>((resolve, reject) => {
      writeFileAtomic(filePath, content, { encoding: 'utf8' }, (error: any) => {
        if (error) {
          reject(new Error(`Atomic write failed for ${filePath}: ${error.message}`));
        } else {
          console.log(`📝 Atomic write successful: ${filePath}`);
          resolve();
        }
      });
    });
  }

  /**
   * Validate Root.tsx health and detect corruption patterns
   */
  async validateRootTsx(): Promise<{ isHealthy: boolean; issues: string[]; componentsFound: number }> {
    const issues: string[] = [];
    let componentsFound = 0;

    try {
      // Check if Root.tsx exists
      const rootExists = await fs.access(this.rootTsxPath).then(() => true).catch(() => false);
      if (!rootExists) {
        issues.push('Root.tsx file missing');
        return { isHealthy: false, issues, componentsFound };
      }

      // Read and analyze content
      const content = await fs.readFile(this.rootTsxPath, 'utf8');
      
      // Check for duplicate imports
      const importLines = content.match(/^import .* from ['"][^'"]*['"];$/gm) || [];
      const uniqueImports = new Set(importLines);
      if (importLines.length > uniqueImports.size) {
        issues.push(`${importLines.length - uniqueImports.size} duplicate import statements found`);
      }

      // Check for duplicate composition IDs
      const compositionIds = (content.match(/id=["']([^"']+)["']/g) || [])
        .map(match => match.match(/id=["']([^"']+)["']/)?.[1])
        .filter(Boolean);
      const uniqueIds = new Set(compositionIds);
      if (compositionIds.length > uniqueIds.size) {
        issues.push(`${compositionIds.length - uniqueIds.size} duplicate composition IDs found`);
      }

      // Check for malformed syntax
      if (content.includes('undefined') && content.includes('component={')) {
        issues.push('Undefined component references detected');
      }

      // Count actual filesystem components
      const fsComponents = await this.scanExistingComponents();
      componentsFound = fsComponents.length;

      // Check if Root.tsx has more compositions than filesystem components
      if (compositionIds.length > componentsFound * 2) {
        issues.push('Excessive composition entries compared to filesystem components');
      }

    } catch (error) {
      issues.push(`Validation error: ${(error as Error).message}`);
    }

    return {
      isHealthy: issues.length === 0,
      issues,
      componentsFound
    };
  }

  /**
   * Extract duration from component code (basic regex approach)
   */
  private extractDurationFromCode(code: string): number | null {
    // Look for common duration patterns in component code
    const durationMatch = code.match(/durationInFrames[:\s=]+(\d+)/i);
    if (durationMatch) {
      return parseInt(durationMatch[1], 10);
    }

    // Default duration if not specified
    return null;
  }

  /**
   * Get Root.tsx file path for external access
   */
  getRootTsxPath(): string {
    return this.rootTsxPath;
  }

  /**
   * Get components directory path for external access
   */
  getComponentsDir(): string {
    return this.componentsDir;
  }
}