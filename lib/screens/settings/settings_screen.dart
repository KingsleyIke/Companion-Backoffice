import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/bo_user.dart';
import '../../theme/app_theme.dart';
import '../../widgets/shared_widgets.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.currentUser;

    return Column(
      children: [
        const PageHeader(
          title: 'Settings',
          subtitle: 'Account preferences and system configuration',
        ),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 680),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Profile card
                  _ProfileCard(user: user),
                  const SizedBox(height: 16),

                  // App info
                  SectionCard(
                    title: 'Application',
                    child: Column(children: [
                      _SettingRow(
                        icon: Icons.info_outline,
                        label: 'Version',
                        value: '1.0.0 (build 1)',
                      ),
                      _SettingRow(
                        icon: Icons.church_outlined,
                        label: 'App',
                        value: 'Catholic Companion — Back Office',
                      ),
                      _SettingRow(
                        icon: Icons.shield_outlined,
                        label: 'Role',
                        value: user?.role.label ?? '—',
                      ),
                    ]),
                  ),
                  const SizedBox(height: 16),

                  // Data management
                  SectionCard(
                    title: 'Data Management',
                    child: Column(children: [
                      _ActionRow(
                        icon: Icons.download_outlined,
                        label: 'Export Parishes as JSON',
                        subtitle: 'Download all parish data',
                        onTap: () => _showComingSoon(context),
                      ),
                      _ActionRow(
                        icon: Icons.download_outlined,
                        label: 'Export Readings as JSON',
                        subtitle: 'Download all readings data',
                        onTap: () => _showComingSoon(context),
                      ),
                      _ActionRow(
                        icon: Icons.refresh_outlined,
                        label: 'Sync with Remote',
                        subtitle: 'Push local changes to server',
                        onTap: () => _showComingSoon(context),
                      ),
                    ]),
                  ),
                  const SizedBox(height: 16),

                  // Danger zone
                  SectionCard(
                    title: 'Session',
                    child: _ActionRow(
                      icon: Icons.logout,
                      label: 'Sign Out',
                      subtitle: 'End your current session',
                      iconColor: AppColors.error,
                      onTap: () async {
                        final ok = await showConfirmDialog(context,
                          title: 'Sign Out',
                          message: 'Are you sure you want to sign out?',
                          confirmLabel: 'Sign Out',
                        );
                        if (ok && context.mounted) {
                          context.read<AuthProvider>().logout();
                        }
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  void _showComingSoon(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('This feature requires a Supabase connection.'),
          backgroundColor: AppColors.primary),
    );
  }
}

class _ProfileCard extends StatelessWidget {
  final BOUser? user;
  const _ProfileCard({required this.user});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            CircleAvatar(
              radius: 32,
              backgroundColor: AppColors.primaryLight,
              child: Text(user?.initials ?? '?',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800,
                      color: AppColors.primary)),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(user?.fullName ?? 'Guest',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 4),
                  Text(user?.email ?? '',
                      style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                  if (user?.phone?.isNotEmpty == true)
                    Text(user!.phone!,
                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(user?.role.label ?? '',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700,
                            color: AppColors.primary)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SettingRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _SettingRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Row(children: [
          Icon(icon, size: 18, color: AppColors.textSecondary),
          const SizedBox(width: 12),
          Expanded(child: Text(label,
              style: const TextStyle(fontSize: 13, color: AppColors.textPrimary))),
          Text(value,
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary,
                  fontWeight: FontWeight.w600)),
        ]),
      );
}

class _ActionRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;
  final VoidCallback onTap;
  final Color iconColor;
  const _ActionRow({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.onTap,
    this.iconColor = AppColors.primary,
  });

  @override
  Widget build(BuildContext context) => InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 10),
          child: Row(children: [
            Icon(icon, size: 18, color: iconColor),
            const SizedBox(width: 12),
            Expanded(child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: TextStyle(fontSize: 13,
                    color: iconColor == AppColors.error ? AppColors.error : AppColors.textPrimary,
                    fontWeight: FontWeight.w600)),
                Text(subtitle,
                    style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
              ],
            )),
            const Icon(Icons.chevron_right, size: 16, color: AppColors.textHint),
          ]),
        ),
      );
}
