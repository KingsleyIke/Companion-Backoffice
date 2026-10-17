// `pnpm test:db`: every project's database specs, against an already-migrated database.
module.exports = {
  projects: ['<rootDir>/libs/common/jest.db.config.cts', '<rootDir>/apps/api/jest.db.config.cts'],
};
