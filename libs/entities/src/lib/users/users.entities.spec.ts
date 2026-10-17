import { getMetadataArgsStorage } from 'typeorm';

import { DioceseInterest } from '../church/diocese-interest.entity';
import { Submission } from '../submissions/submission.entity';
import { AppUser } from './app-user.entity';
import { ContributorProfile } from './contributor-profile.entity';
import { Device } from './device.entity';

type EntityClass = new () => object;

describe('user, device and contribution entities', () => {
  const storage = getMetadataArgsStorage();
  const column = (target: EntityClass, propertyName: string) =>
    storage.filterColumns(target).find((c) => c.propertyName === propertyName);
  const checkNames = (target: EntityClass) => storage.filterChecks(target).map((c) => c.name);

  describe('AppUser', () => {
    it('stores emails lowercase so case variants cannot be two accounts', () => {
      expect(column(AppUser, 'email')?.options.unique).toBe(true);
      expect(checkNames(AppUser)).toContain('CHK_app_user_email_lowercase');
    });

    it('requires credentials that match the auth provider', () => {
      expect(checkNames(AppUser)).toContain('CHK_app_user_credentials');
      expect(column(AppUser, 'passwordHash')?.options.select).toBe(false);
    });
  });

  it('lets anonymous devices exist without a user', () => {
    expect(column(Device, 'userId')?.options.nullable).toBe(true);
    expect(column(Device, 'fcmToken')?.options.unique).toBe(true);
  });

  it('allows one unlisted-diocese vote per device', () => {
    const index = storage
      .filterIndices(DioceseInterest)
      .find((i) => i.name === 'UQ_diocese_interest_one_unlisted_per_device');
    expect(index?.unique).toBe(true);
    expect(index?.where).toBe('"diocese_id" IS NULL');
  });

  describe('Submission', () => {
    it('accepts anonymous suggestions from a device but never from nobody', () => {
      expect(column(Submission, 'submitterUserId')?.options.nullable).toBe(true);
      expect(column(Submission, 'submitterDeviceId')?.options.nullable).toBe(true);
      expect(checkNames(Submission)).toContain('CHK_submission_has_submitter');
    });

    it('requires a target for updates and deletes and a reason for rejections', () => {
      expect(checkNames(Submission)).toEqual(
        expect.arrayContaining([
          'CHK_submission_target_for_change',
          'CHK_submission_rejection_reason',
        ]),
      );
    });
  });

  it('requires a reason when a contributor application is rejected', () => {
    expect(checkNames(ContributorProfile)).toContain('CHK_contributor_profile_rejection_reason');
  });
});
