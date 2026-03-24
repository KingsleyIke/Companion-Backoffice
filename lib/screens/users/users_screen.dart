import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';
import '../../providers/users_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/bo_user.dart';
import '../../theme/app_theme.dart';
import '../../widgets/shared_widgets.dart';

class UsersScreen extends StatelessWidget {
  const UsersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider  = context.watch<UsersProvider>();
    final auth      = context.watch<AuthProvider>();
    final list      = provider.filtered;
    final canManage = auth.isAdmin;

    return Column(
      children: [
        PageHeader(
          title: 'Users',
          subtitle: '${provider.users.length} total · ${provider.adminCount} admins · ${provider.contributorCount} contributors',
          actions: [
            if (canManage)
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white, foregroundColor: AppColors.primary),
                onPressed: () => _showUserDialog(context),
                icon: const Icon(Icons.person_add_outlined, size: 16),
                label: const Text('Add User'),
              ),
          ],
        ),

        // ── Filter bar ─────────────────────────────────────────────────────
        Container(
          color: AppColors.surface,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Row(
            children: [
              SizedBox(
                width: 240,
                child: TextField(
                  onChanged: provider.setSearch,
                  decoration: InputDecoration(
                    hintText: 'Search users…',
                    prefixIcon: const Icon(Icons.search, size: 18),
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(vertical: 10),
                    suffixIcon: provider.searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, size: 16),
                            onPressed: () => provider.setSearch(''))
                        : null,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              ...['', 'user', 'contributor', 'admin', 'superAdmin'].map((r) => Padding(
                padding: const EdgeInsets.only(right: 6),
                child: _RoleChip(
                  label: r.isEmpty ? 'All' : UserRole.values
                      .firstWhere((u) => u.name == r, orElse: () => UserRole.user).label,
                  value: r,
                  current: provider.roleFilter,
                  onTap: provider.setRoleFilter,
                ),
              )),
            ],
          ),
        ),

        // ── User list ──────────────────────────────────────────────────────
        Expanded(
          child: list.isEmpty
              ? EmptyState(
                  icon: Icons.people_outline,
                  message: 'No users found.',
                  actionLabel: canManage ? 'Add User' : null,
                  onAction: canManage ? () => _showUserDialog(context) : null,
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(20),
                  itemCount: list.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (_, i) => _UserCard(
                    user: list[i],
                    canManage: canManage,
                    currentUserId: auth.currentUser?.id ?? '',
                  ),
                ),
        ),
      ],
    );
  }

  void _showUserDialog(BuildContext context, [BOUser? user]) {
    showDialog(
      context: context,
      builder: (_) => _UserDialog(user: user),
    );
  }
}

// ── Role filter chip ──────────────────────────────────────────────────────────
class _RoleChip extends StatelessWidget {
  final String label;
  final String value;
  final String current;
  final ValueChanged<String> onTap;
  const _RoleChip({required this.label, required this.value,
      required this.current, required this.onTap});

  bool get selected => current == value;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onTap(value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary : AppColors.background,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: selected ? AppColors.primary : AppColors.border),
        ),
        child: Text(label,
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600,
                color: selected ? Colors.white : AppColors.textSecondary)),
      ),
    );
  }
}

// ── User card ─────────────────────────────────────────────────────────────────
class _UserCard extends StatelessWidget {
  final BOUser user;
  final bool canManage;
  final String currentUserId;
  const _UserCard({required this.user, required this.canManage, required this.currentUserId});

  @override
  Widget build(BuildContext context) {
    final provider = context.read<UsersProvider>();
    final isSelf   = user.id == currentUserId;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            // Avatar
            CircleAvatar(
              radius: 22,
              backgroundColor: _roleColor(user.role).withOpacity(0.15),
              child: Text(user.initials,
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700,
                      color: _roleColor(user.role))),
            ),
            const SizedBox(width: 14),

            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    Text(user.fullName,
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                    if (isSelf) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Text('You',
                            style: TextStyle(fontSize: 10, color: AppColors.primary,
                                fontWeight: FontWeight.w700)),
                      ),
                    ],
                  ]),
                  const SizedBox(height: 2),
                  Text(user.email,
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  if (user.phone?.isNotEmpty == true)
                    Text(user.phone!,
                        style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                ],
              ),
            ),

            // Role badge
            _roleBadge(user.role),
            const SizedBox(width: 12),

            // Actions
            if (canManage && !isSelf) ...[
              PopupMenuButton<UserRole>(
                tooltip: 'Change role',
                icon: const Icon(Icons.swap_horiz_outlined, size: 18, color: AppColors.primary),
                itemBuilder: (_) => UserRole.values
                    .where((r) => r != user.role)
                    .map((r) => PopupMenuItem(value: r, child: Text(r.label)))
                    .toList(),
                onSelected: (role) => provider.updateRole(user.id, role),
              ),
              IconButton(
                icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.error),
                onPressed: () async {
                  final ok = await showConfirmDialog(context,
                      title: 'Remove User',
                      message: 'Remove ${user.fullName} from the system?');
                  if (ok) provider.deleteUser(user.id);
                },
                tooltip: 'Delete',
              ),
            ],
          ],
        ),
      ),
    );
  }

  Color _roleColor(UserRole r) {
    switch (r) {
      case UserRole.superAdmin:  return AppColors.error;
      case UserRole.admin:       return AppColors.primary;
      case UserRole.contributor: return AppColors.success;
      case UserRole.user:        return AppColors.textSecondary;
    }
  }

  Widget _roleBadge(UserRole r) {
    final color = _roleColor(r);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(r.label,
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: color)),
    );
  }
}

// ── Add / Edit user dialog ────────────────────────────────────────────────────
class _UserDialog extends StatefulWidget {
  final BOUser? user;
  const _UserDialog({this.user});

  @override
  State<_UserDialog> createState() => _UserDialogState();
}

class _UserDialogState extends State<_UserDialog> {
  final _uuid      = const Uuid();
  final _firstCtrl = TextEditingController();
  final _lastCtrl  = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  UserRole _role   = UserRole.user;

  @override
  void initState() {
    super.initState();
    if (widget.user != null) {
      _firstCtrl.text = widget.user!.firstName;
      _lastCtrl.text  = widget.user!.lastName;
      _emailCtrl.text = widget.user!.email;
      _phoneCtrl.text = widget.user!.phone ?? '';
      _role           = widget.user!.role;
    }
  }

  @override
  void dispose() {
    _firstCtrl.dispose(); _lastCtrl.dispose();
    _emailCtrl.dispose(); _phoneCtrl.dispose();
    super.dispose();
  }

  void _submit() {
    final provider = context.read<UsersProvider>();
    final user = BOUser(
      id:        widget.user?.id ?? _uuid.v4(),
      firstName: _firstCtrl.text.trim(),
      lastName:  _lastCtrl.text.trim(),
      email:     _emailCtrl.text.trim(),
      phone:     _phoneCtrl.text.trim().isEmpty ? null : _phoneCtrl.text.trim(),
      role:      _role,
      createdAt: widget.user?.createdAt ?? DateTime.now(),
    );
    if (widget.user != null) {
      provider.updateUser(user);
    } else {
      provider.addUser(user);
    }
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.user != null ? 'Edit User' : 'Add User'),
      content: SizedBox(
        width: 400,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(children: [
              Expanded(child: TextField(controller: _firstCtrl,
                  decoration: const InputDecoration(labelText: 'First Name'))),
              const SizedBox(width: 12),
              Expanded(child: TextField(controller: _lastCtrl,
                  decoration: const InputDecoration(labelText: 'Last Name'))),
            ]),
            const SizedBox(height: 12),
            TextField(controller: _emailCtrl, keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(labelText: 'Email')),
            const SizedBox(height: 12),
            TextField(controller: _phoneCtrl, keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'Phone (optional)')),
            const SizedBox(height: 12),
            DropdownButtonFormField<UserRole>(
              value: _role,
              decoration: const InputDecoration(labelText: 'Role'),
              items: UserRole.values
                  .map((r) => DropdownMenuItem(value: r, child: Text(r.label)))
                  .toList(),
              onChanged: (v) => setState(() => _role = v!),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        ElevatedButton(onPressed: _submit,
            child: Text(widget.user != null ? 'Update' : 'Add User')),
      ],
    );
  }
}
