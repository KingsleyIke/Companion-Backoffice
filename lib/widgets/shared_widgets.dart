import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

// ── Page header ───────────────────────────────────────────────────────────────
class PageHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final List<Widget>? actions;

  const PageHeader({super.key, required this.title, this.subtitle, this.actions});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.primary,
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 20),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(color: Colors.white, fontSize: 20,
                        fontWeight: FontWeight.w700)),
                if (subtitle != null) ...[
                  const SizedBox(height: 2),
                  Text(subtitle!,
                      style: const TextStyle(color: Colors.white70, fontSize: 12)),
                ],
              ],
            ),
          ),
          if (actions != null) ...actions!,
        ],
      ),
    );
  }
}

// ── Stat card ─────────────────────────────────────────────────────────────────
class StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final VoidCallback? onTap;

  const StatCard({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    width: 42, height: 42,
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(icon, color: color, size: 22),
                  ),
                  Icon(Icons.arrow_forward_ios, size: 12, color: Colors.grey.shade400),
                ],
              ),
              const SizedBox(height: 16),
              Text(value,
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: color)),
              const SizedBox(height: 4),
              Text(label,
                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Status badge ──────────────────────────────────────────────────────────────
class StatusBadge extends StatelessWidget {
  final String label;
  final Color bg;
  final Color text;

  const StatusBadge({super.key, required this.label, required this.bg, required this.text});

  factory StatusBadge.active()   => const StatusBadge(label: 'active',   bg: AppColors.successLight, text: AppColors.success);
  factory StatusBadge.pending()  => const StatusBadge(label: 'pending',  bg: AppColors.warningLight, text: AppColors.warning);
  factory StatusBadge.inactive() => StatusBadge(label: 'inactive', bg: Colors.grey.shade100, text: Colors.grey.shade600);
  factory StatusBadge.published()=> const StatusBadge(label: 'published',bg: AppColors.successLight, text: AppColors.success);
  factory StatusBadge.draft()    => const StatusBadge(label: 'draft',    bg: AppColors.warningLight, text: AppColors.warning);
  factory StatusBadge.approved() => const StatusBadge(label: 'approved', bg: AppColors.successLight, text: AppColors.success);
  factory StatusBadge.rejected() => const StatusBadge(label: 'rejected', bg: AppColors.errorLight,   text: AppColors.error);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20)),
      child: Text(label,
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: text)),
    );
  }
}

// ── Section card ──────────────────────────────────────────────────────────────
class SectionCard extends StatelessWidget {
  final String title;
  final Widget child;
  final bool collapsible;
  final List<Widget>? headerActions;

  const SectionCard({
    super.key,
    required this.title,
    required this.child,
    this.collapsible = false,
    this.headerActions,
  });

  @override
  Widget build(BuildContext context) {
    if (collapsible) {
      return _CollapsibleSectionCard(
          title: title, child: child, headerActions: headerActions);
    }
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _Header(title: title, actions: headerActions),
          Padding(padding: const EdgeInsets.fromLTRB(16, 0, 16, 16), child: child),
        ],
      ),
    );
  }
}

class _CollapsibleSectionCard extends StatefulWidget {
  final String title;
  final Widget child;
  final List<Widget>? headerActions;

  const _CollapsibleSectionCard({required this.title, required this.child, this.headerActions});

  @override
  State<_CollapsibleSectionCard> createState() => _CollapsibleSectionCardState();
}

class _CollapsibleSectionCardState extends State<_CollapsibleSectionCard> {
  bool _open = true;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Column(
        children: [
          InkWell(
            borderRadius: BorderRadius.circular(12),
            onTap: () => setState(() => _open = !_open),
            child: _Header(
              title: widget.title,
              actions: [
                ...?widget.headerActions,
                Icon(_open ? Icons.expand_less : Icons.expand_more,
                    color: AppColors.textSecondary, size: 20),
              ],
            ),
          ),
          if (_open)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: widget.child,
            ),
        ],
      ),
    );
  }
}

class _Header extends StatelessWidget {
  final String title;
  final List<Widget>? actions;
  const _Header({required this.title, this.actions});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 14, 12, 14),
      child: Row(
        children: [
          Expanded(
            child: Text(title,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary)),
          ),
          if (actions != null) ...actions!,
        ],
      ),
    );
  }
}

// ── Form field label wrapper ──────────────────────────────────────────────────
class FieldLabel extends StatelessWidget {
  final String label;
  final bool required;
  final Widget child;

  const FieldLabel({super.key, required this.label, required this.child, this.required = false});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        RichText(
          text: TextSpan(
            text: label,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600,
                color: AppColors.textSecondary),
            children: required
                ? [const TextSpan(text: ' *', style: TextStyle(color: AppColors.error))]
                : [],
          ),
        ),
        const SizedBox(height: 6),
        child,
      ],
    );
  }
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
Future<bool> showConfirmDialog(BuildContext context, {
  required String title,
  required String message,
  String confirmLabel  = 'Delete',
  Color confirmColor   = AppColors.error,
}) async {
  return await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: Text(title),
      content: Text(message),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel')),
        ElevatedButton(
          style: ElevatedButton.styleFrom(backgroundColor: confirmColor),
          onPressed: () => Navigator.pop(ctx, true),
          child: Text(confirmLabel),
        ),
      ],
    ),
  ) ?? false;
}

// ── Empty state ───────────────────────────────────────────────────────────────
class EmptyState extends StatelessWidget {
  final IconData icon;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;

  const EmptyState({
    super.key,
    required this.icon,
    required this.message,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 64, color: Colors.grey.shade300),
            const SizedBox(height: 16),
            Text(message,
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 14)),
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 20),
              ElevatedButton(onPressed: onAction, child: Text(actionLabel!)),
            ],
          ],
        ),
      ),
    );
  }
}
