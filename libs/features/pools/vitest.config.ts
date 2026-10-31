import { createVitestConfig } from '../../../vitest.base.config';

export default createVitestConfig({ coverageDir: 'coverage/libs/features/pools', coverageExclude: ['**/*.testing.ts'] });
