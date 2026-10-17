import type { DataSourceOptions } from 'typeorm';

import { AdminPasswordReset } from './lib/admin/admin-password-reset.entity';
import { AdminSession } from './lib/admin/admin-session.entity';
import { AdminUser } from './lib/admin/admin-user.entity';
import { AuditLog } from './lib/audit-log.entity';
import { Country } from './lib/church/country.entity';
import { Deanery } from './lib/church/deanery.entity';
import { DioceseInterest } from './lib/church/diocese-interest.entity';
import { Diocese } from './lib/church/diocese.entity';
import { EcclesiasticalProvince } from './lib/church/ecclesiastical-province.entity';
import { Institution } from './lib/church/institution.entity';
import { MassSchedule } from './lib/church/mass-schedule.entity';
import { ParishActivity } from './lib/church/parish-activity.entity';
import { ParishContact } from './lib/church/parish-contact.entity';
import { ParishGalleryAlbum } from './lib/church/parish-gallery-album.entity';
import { ParishGalleryItem } from './lib/church/parish-gallery-item.entity';
import { ParishSocialLink } from './lib/church/parish-social-link.entity';
import { Parish } from './lib/church/parish.entity';
import { ReligiousInstitute } from './lib/church/religious-institute.entity';
import { MediaAsset } from './lib/media/media-asset.entity';
import { SubmissionAttachment } from './lib/submissions/submission-attachment.entity';
import { Submission } from './lib/submissions/submission.entity';
import { AppUser } from './lib/users/app-user.entity';
import { ContributorProfile } from './lib/users/contributor-profile.entity';
import { Device } from './lib/users/device.entity';

export * from './lib/admin/admin-password-reset.entity';
export * from './lib/admin/admin-session.entity';
export * from './lib/admin/admin-user.entity';
export * from './lib/audit-log.entity';
export * from './lib/base.entity';
export * from './lib/church/country.entity';
export * from './lib/church/deanery.entity';
export * from './lib/church/diocese-interest.entity';
export * from './lib/church/diocese.entity';
export * from './lib/church/ecclesiastical-province.entity';
export * from './lib/church/institution.entity';
export * from './lib/church/mass-schedule.entity';
export * from './lib/church/parish-activity.entity';
export * from './lib/church/parish-contact.entity';
export * from './lib/church/parish-gallery-album.entity';
export * from './lib/church/parish-gallery-item.entity';
export * from './lib/church/parish-social-link.entity';
export * from './lib/church/parish.entity';
export * from './lib/church/religious-institute.entity';
export * from './lib/media/media-asset.entity';
export * from './lib/record-status';
export * from './lib/submissions/submission-attachment.entity';
export * from './lib/submissions/submission.entity';
export * from './lib/users/app-user.entity';
export * from './lib/users/contributor-profile.entity';
export * from './lib/users/device.entity';

export const ENTITIES: NonNullable<DataSourceOptions['entities']> = [
  Country,
  EcclesiasticalProvince,
  Diocese,
  Deanery,
  ReligiousInstitute,
  Institution,
  Parish,
  MassSchedule,
  ParishContact,
  ParishActivity,
  AdminUser,
  AdminSession,
  AdminPasswordReset,
  AuditLog,
  MediaAsset,
  ParishGalleryAlbum,
  ParishGalleryItem,
  ParishSocialLink,
  AppUser,
  Device,
  DioceseInterest,
  ContributorProfile,
  Submission,
  SubmissionAttachment,
];
