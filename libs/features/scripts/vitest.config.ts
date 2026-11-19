import { createVitestConfig } from '../../../vitest.base.config';

export default createVitestConfig({ coverageDir: 'coverage/libs/features/scripts', coverageExclude: ['**/*.testing.ts'] });
