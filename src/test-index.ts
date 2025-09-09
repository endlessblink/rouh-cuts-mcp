import { registerRoot } from 'remotion';
import TestRoot from './TestRoot';

/**
 * Test Remotion entry point with simple components
 * This should work without any import/export issues
 */
registerRoot(TestRoot);