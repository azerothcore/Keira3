import { createVitestConfig } from '../../../vitest.base.config';

export default createVitestConfig({ coverageDir: 'coverage/libs/shared/wow-data', coverageExclude: ['**/*.mock.ts', '**/*.worker.ts'] });
