import type { AdminRole } from '@companion/entities';

// Who may do what, in one place (task 1.1.6). Diocese admins are further limited to their own
// diocese in the query layer: see diocese-scope.ts.

export const SUPER_ADMIN_ONLY: readonly AdminRole[] = ['super_admin'];

// Rollout console, app settings, modules and notification topics.
export const PLATFORM_ADMINS: readonly AdminRole[] = ['super_admin', 'admin'];

// Dioceses, deaneries, parishes and everything beneath them, including imports.
export const DIRECTORY_EDITORS: readonly AdminRole[] = ['super_admin', 'admin', 'diocese_admin'];

// Submissions and contributor applications.
export const SUBMISSION_REVIEWERS: readonly AdminRole[] = DIRECTORY_EDITORS;

// Readings, the Ordo, saints and national content collections: country-wide, not per diocese.
export const LITURGY_EDITORS: readonly AdminRole[] = ['super_admin', 'admin', 'content_editor'];

// Content collections, including diocese-specific devotions (content_collection.diocese_id).
export const DEVOTION_EDITORS: readonly AdminRole[] = [
  'super_admin',
  'admin',
  'diocese_admin',
  'content_editor',
];
