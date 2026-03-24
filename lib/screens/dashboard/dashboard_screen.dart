import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/parish_provider.dart';
import '../../providers/readings_provider.dart';
import '../../providers/users_provider.dart';
import '../../providers/approvals_provider.dart';
import '../../models/approval_request.dart';
import '../../router/app_router.dart';
import '../../theme/app_theme.dart';
import '../../widgets/shared_widgets.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth      = context.watch<AuthProvider>();
    final parishes  = context.watch<ParishProvider>();
    final readings  = context.watch<ReadingsProvider>();
    final users     = context.watch<UsersProvider>();
    final approvals = context.watch<ApprovalsProvider>();

    final now = DateTime.now();
    final greeting = now.hour < 12 ? 'Good morning' : now.hour < 17 ? 'Good afternoon' : 'Good evening';

    return Column(
      children: [
        // ── Header ────────────────────────────────────────────────────────────
        PageHeader(
          title: '$greeting, ${auth.currentUser?.firstName ?? 'Admin'}',
          subtitle: 'Here\'s what\'s happening today — ${_fmtDate(now)}',
        ),

        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [

                // ── Stat cards ───────────────────────────────────────────────
                LayoutBuilder(builder: (_, c) {
                  final cols = c.maxWidth > 900 ? 4 : c.maxWidth > 600 ? 2 : 1;
                  return GridView.count(
                    crossAxisCount: cols,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 14,
                    mainAxisSpacing: 14,
                    childAspectRatio: 1.6,
                    children: [
                      StatCard(
                        label: 'Total Parishes',
                        value: '${parishes.parishes.length}',
                        icon: Icons.location_city_outlined,
                        color: AppColors.primary,
                        onTap: () => context.go(AppRoutes.parishes),
                      ),
                      StatCard(
                        label: 'Readings Published',
                        value: '${readings.publishedCount}',
                        icon: Icons.menu_book_outlined,
                        color: AppColors.success,
                        onTap: () => context.go(AppRoutes.readings),
                      ),
                      StatCard(
                        label: 'Pending Approvals',
                        value: '${approvals.pendingCount}',
                        icon: Icons.pending_actions_outlined,
                        color: approvals.pendingCount > 0 ? AppColors.warning : AppColors.success,
                        onTap: () => context.go(AppRoutes.approvals),
                      ),
                      StatCard(
                        label: 'Total Users',
                        value: '${users.users.length}',
                        icon: Icons.people_outline,
                        color: AppColors.info,
                        onTap: () => context.go(AppRoutes.users),
                      ),
                    ],
                  );
                }),

                const SizedBox(height: 24),

                // ── Body columns ─────────────────────────────────────────────
                LayoutBuilder(builder: (_, c) {
                  if (c.maxWidth > 800) {
                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(child: _PendingApprovals(approvals: approvals)),
                        const SizedBox(width: 16),
                        SizedBox(width: 280, child: _QuickLinks()),
                      ],
                    );
                  }
                  return Column(
                    children: [
                      _PendingApprovals(approvals: approvals),
                      const SizedBox(height: 16),
                      _QuickLinks(),
                    ],
                  );
                }),
              ],
            ),
          ),
        ),
      ],
    );
  }

  String _fmtDate(DateTime d) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun',
                    'Jul','Aug','Sep','Oct','Nov','Dec'];
    const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return '${days[d.weekday % 7]}, ${months[d.month - 1]} ${d.day}, ${d.year}';
  }
}

// ── Pending Approvals widget ──────────────────────────────────────────────────
class _PendingApprovals extends StatelessWidget {
  final ApprovalsProvider approvals;
  const _PendingApprovals({required this.approvals});

  @override
  Widget build(BuildContext context) {
    final pending = approvals.approvals
        .where((a) => a.status == ApprovalStatus.pending)
        .take(5)
        .toList();

    return SectionCard(
      title: 'Pending Approvals (${approvals.pendingCount})',
      headerActions: [
        TextButton(
          onPressed: () => context.go(AppRoutes.approvals),
          child: const Text('View all', style: TextStyle(fontSize: 12)),
        ),
      ],
      child: pending.isEmpty
          ? const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: Center(
                child: Column(
                  children: [
                    Icon(Icons.check_circle_outline, size: 40, color: AppColors.success),
                    SizedBox(height: 8),
                    Text('All caught up!',
                        style: TextStyle(color: AppColors.success, fontWeight: FontWeight.w600)),
                    Text('No pending approvals.',
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  ],
                ),
              ),
            )
          : Column(
              children: pending.map((a) => _ApprovalRow(a: a)).toList(),
            ),
    );
  }
}

class _ApprovalRow extends StatelessWidget {
  final ApprovalRequest a;
  const _ApprovalRow({required this.a});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => context.go(AppRoutes.approvals),
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Row(
          children: [
            Container(
              width: 36, height: 36,
              decoration: BoxDecoration(
                color: AppColors.warningLight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.pending_actions, color: AppColors.warning, size: 18),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(a.parishName,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                      overflow: TextOverflow.ellipsis),
                  Text('${a.type.label} · ${a.contributorName}',
                      style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                ],
              ),
            ),
            Text(_timeAgo(a.submittedAt),
                style: const TextStyle(fontSize: 10, color: AppColors.textHint)),
          ],
        ),
      ),
    );
  }

  String _timeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inDays > 0)   return '${diff.inDays}d ago';
    if (diff.inHours > 0)  return '${diff.inHours}h ago';
    return '${diff.inMinutes}m ago';
  }
}

// ── Quick Links widget ────────────────────────────────────────────────────────
class _QuickLinks extends StatelessWidget {
  const _QuickLinks();

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      title: 'Quick Actions',
      child: Column(
        children: [
          _QuickLink(
            icon: Icons.add_location_alt_outlined,
            label: 'Add New Parish',
            color: AppColors.primary,
            onTap: () => context.go(AppRoutes.addParish),
          ),
          _QuickLink(
            icon: Icons.post_add_outlined,
            label: 'Add Reading',
            color: AppColors.success,
            onTap: () => context.go(AppRoutes.addReading),
          ),
          _QuickLink(
            icon: Icons.check_circle_outline,
            label: 'Review Approvals',
            color: AppColors.warning,
            onTap: () => context.go(AppRoutes.approvals),
          ),
          _QuickLink(
            icon: Icons.person_add_outlined,
            label: 'Manage Users',
            color: AppColors.info,
            onTap: () => context.go(AppRoutes.users),
          ),
        ],
      ),
    );
  }
}

class _QuickLink extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _QuickLink({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Row(
          children: [
            Container(
              width: 34, height: 34,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 18),
            ),
            const SizedBox(width: 12),
            Expanded(child: Text(label,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500))),
            const Icon(Icons.chevron_right, size: 16, color: AppColors.textHint),
          ],
        ),
      ),
    );
  }
}
