import { createVitestConfig } from '../../vitest.base.config';

export default createVitestConfig({
  coverageDir: 'coverage/apps/keira',
  tsconfig: './src/tsconfig.spec.json',
  coverageExclude: [
    'apps/keira/src/app/config/**',
    'apps/keira/src/app/constants/**',
    'apps/keira/src/app/shared/services/electron.service.ts',
    'apps/keira/src/app/shared/types/**',
    'apps/keira/src/app/shared/testing/**',
  ],
});
