import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/approvals_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/approval_request.dart';
import '../../theme/app_theme.dart';
import '../../widgets/shared_widgets.dart';

class ApprovalsScreen extends StatelessWidget {
  const ApprovalsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ApprovalsProvider>();
    final list     = provider.filtered;

    return Column(
      children: [
        PageHeader(
          title: 'Approval Requests',
          subtitle: '${provider.pendingCount} pending · ${provider.approvedCount} approved · ${provider.rejectedCount} rejected',
        ),

        // ── Filter bar ─────────────────────────────────────────────────────
        Container(
          color: AppColors.surface,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Wrap(spacing: 8, runSpacing: 8, crossAxisAlignment: WrapCrossAlignment.center, children: [
            const Text('Status:', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            ...['pending', 'approved', 'rejected', ''].map((s) => _FilterChip(
              label: s.isEmpty ? 'All' : s[0].toUpperCase() + s.substring(1),
              value: s,
              current: provider.statusFilter,
              onTap: provider.setStatusFilter,
              activeColor: s == 'pending'  ? AppColors.warning
                         : s == 'approved' ? AppColors.success
                         : s == 'rejected' ? AppColors.error
                         : AppColors.primary,
            )),
            const SizedBox(width: 8),
            const Text('Type:', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            _FilterChip(label: 'All', value: '', current: provider.typeFilter, onTap: provider.setTypeFilter),
            ...ApprovalType.values.map((t) => _FilterChip(
              label: t.label,
              value: t.key,
              current: provider.typeFilter,
              onTap: provider.setTypeFilter,
            )),
          ]),
        ),

        // ── List ───────────────────────────────────────────────────────────
        Expanded(
          child: list.isEmpty
              ? EmptyState(
                  icon: Icons.check_circle_outline,
                  message: provider.statusFilter == 'pending'
                      ? 'No pending approvals.\nAll caught up!'
                      : 'No approvals match the current filter.',
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(20),
                  itemCount: list.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (_, i) => _ApprovalCard(approval: list[i]),
                ),
        ),
      ],
    );
  }
}

// ── Filter chip ───────────────────────────────────────────────────────────────
class _FilterChip extends StatelessWidget {
  final String label;
  final String value;
  final String current;
  final ValueChanged<String> onTap;
  final Color activeColor;

  const _FilterChip({
    required this.label,
    required this.value,
    required this.current,
    required this.onTap,
    this.activeColor = AppColors.primary,
  });

  bool get selected => current == value;

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: () => onTap(value),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: selected ? activeColor : AppColors.background,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: selected ? activeColor : AppColors.border),
          ),
          child: Text(label,
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600,
                  color: selected ? Colors.white : AppColors.textSecondary)),
        ),
      );
}

// ── Approval card ─────────────────────────────────────────────────────────────
class _ApprovalCard extends StatelessWidget {
  final ApprovalRequest approval;
  const _ApprovalCard({required this.approval});

  @override
  Widget build(BuildContext context) {
    final isPending = approval.status == ApprovalStatus.pending;
    final auth      = context.read<AuthProvider>();

    return Card(
      child: ExpansionTile(
        leading: _statusIcon(approval.status),
        title: Text(approval.parishName,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('${approval.type.label} · by ${approval.contributorName}',
                style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
            Text(_fmtDate(approval.submittedAt),
                style: const TextStyle(fontSize: 10, color: AppColors.textHint)),
          ],
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _statusBadge(approval.status),
            const SizedBox(width: 4),
            const Icon(Icons.expand_more, size: 18, color: AppColors.textSecondary),
          ],
        ),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Divider(),

                // Contributor info
                _InfoRow('Contributor', approval.contributorName),
                _InfoRow('Email', approval.contributorEmail),
                _InfoRow('Type', approval.type.label),
                _InfoRow('Submitted', _fmtDateTime(approval.submittedAt)),
                if (approval.reviewedBy != null)
                  _InfoRow('Reviewed by', approval.reviewedBy!),
                if (approval.reviewNote != null)
                  _InfoRow('Review note', approval.reviewNote!),
                if (approval.reviewedAt != null)
                  _InfoRow('Reviewed at', _fmtDateTime(approval.reviewedAt!)),

                const SizedBox(height: 12),

                // Changes
                const Text('Proposed Changes',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700,
                        color: AppColors.textSecondary)),
                const SizedBox(height: 6),
                ...approval.changes.entries.map((e) => Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(e.key,
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700,
                              color: AppColors.textSecondary, letterSpacing: 0.5)),
                      const SizedBox(height: 6),
                      Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Expanded(child: _ChangeBox(
                          label: 'Before',
                          value: e.value.oldValue?.toString() ?? '(empty)',
                          color: AppColors.errorLight,
                          textColor: AppColors.error,
                        )),
                        const SizedBox(width: 8),
                        const Icon(Icons.arrow_forward, size: 16, color: AppColors.textSecondary),
                        const SizedBox(width: 8),
                        Expanded(child: _ChangeBox(
                          label: 'After',
                          value: e.value.newValue?.toString() ?? '(empty)',
                          color: AppColors.successLight,
                          textColor: AppColors.success,
                        )),
                      ]),
                    ],
                  ),
                )),

                // Action buttons
                if (isPending && auth.isAdmin) ...[
                  const SizedBox(height: 8),
                  Row(children: [
                    Expanded(child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.error,
                          side: const BorderSide(color: AppColors.error)),
                      onPressed: () => _showRejectDialog(context),
                      icon: const Icon(Icons.cancel_outlined, size: 16),
                      label: const Text('Reject'),
                    )),
                    const SizedBox(width: 12),
                    Expanded(child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.success),
                      onPressed: () {
                        final reviewer = auth.currentUser?.fullName ?? 'Admin';
                        context.read<ApprovalsProvider>().approve(
                          approval.id,
                          reviewedBy: reviewer,
                          note: 'Changes verified and approved.',
                        );
                      },
                      icon: const Icon(Icons.check_circle_outline, size: 16),
                      label: const Text('Approve'),
                    )),
                  ]),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showRejectDialog(BuildContext context) {
    final noteCtrl = TextEditingController();
    final auth = context.read<AuthProvider>();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Reject Request'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Please provide a reason for rejection:',
                style: TextStyle(fontSize: 13)),
            const SizedBox(height: 12),
            TextField(
              controller: noteCtrl,
              maxLines: 3,
              decoration: const InputDecoration(
                  hintText: 'Could not verify the information provided…'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () {
              final reviewer = auth.currentUser?.fullName ?? 'Admin';
              context.read<ApprovalsProvider>().reject(
                approval.id,
                reviewedBy: reviewer,
                note: noteCtrl.text.trim(),
              );
              Navigator.pop(ctx);
            },
            child: const Text('Reject'),
          ),
        ],
      ),
    );
  }

  Widget _statusIcon(ApprovalStatus s) {
    switch (s) {
      case ApprovalStatus.pending:  return const Icon(Icons.pending_actions, color: AppColors.warning);
      case ApprovalStatus.approved: return const Icon(Icons.check_circle, color: AppColors.success);
      case ApprovalStatus.rejected: return const Icon(Icons.cancel, color: AppColors.error);
    }
  }

  Widget _statusBadge(ApprovalStatus s) {
    switch (s) {
      case ApprovalStatus.pending:  return StatusBadge.pending();
      case ApprovalStatus.approved: return StatusBadge.approved();
      case ApprovalStatus.rejected: return StatusBadge.rejected();
    }
  }

  String _fmtDate(DateTime d) {
    const m = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return '${d.day} ${m[d.month]} ${d.year}';
  }

  String _fmtDateTime(DateTime d) {
    const m = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return '${d.day} ${m[d.month]} ${d.year} ${d.hour.toString().padLeft(2,'0')}:${d.minute.toString().padLeft(2,'0')}';
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  const _InfoRow(this.label, this.value);

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 3),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          SizedBox(width: 100,
              child: Text(label,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary))),
          Expanded(child: Text(value,
              style: const TextStyle(fontSize: 12, color: AppColors.textPrimary))),
        ]),
      );
}

class _ChangeBox extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  final Color textColor;
  const _ChangeBox({required this.label, required this.value, required this.color, required this.textColor});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(6)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: textColor)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(fontSize: 12), maxLines: 5, overflow: TextOverflow.ellipsis),
        ]),
      );
}
