import { createVitestConfig } from '../../../vitest.base.config';

export default createVitestConfig({ coverageDir: 'coverage/libs/shared/world-viewer', coverageExclude: ['**/*.mock.ts'] });
