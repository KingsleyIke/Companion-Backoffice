import 'package:companion/models/bo_user.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/approvals_provider.dart';
import '../router/app_router.dart';
import '../theme/app_theme.dart';

class BOScaffold extends StatelessWidget {
  final Widget child;
  const BOScaffold({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width >= 1000;
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Row(
        children: [
          // ── Sidebar (permanent on wide, drawer on mobile) ─────────────────
          if (isWide) const _Sidebar(),
          // ── Content ───────────────────────────────────────────────────────
          Expanded(child: child),
        ],
      ),
      // Mobile drawer
      drawer: isWide ? null : const Drawer(child: _Sidebar()),
    );
  }
}

class _Sidebar extends StatelessWidget {
  const _Sidebar();

  @override
  Widget build(BuildContext context) {
    final location  = GoRouterState.of(context).uri.toString();
    final auth      = context.read<AuthProvider>();
    final user      = auth.currentUser;
    final approvals = context.watch<ApprovalsProvider>();

    return Container(
      width: 230,
      color: AppColors.sidebarBg,
      child: Column(
        children: [
          // ── Logo / App name ──────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.fromLTRB(20, 48, 20, 20),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                CircleAvatar(
                  radius: 25,
                  backgroundColor: Colors.white24,
                  child: Text(user?.initials ?? '?',
                      style: const TextStyle(color: Colors.white,
                          fontSize: 18, fontWeight: FontWeight.w700)),
                ),
                const SizedBox(height: 10),
                Text(user?.fullName ?? 'Admin User',
                    style: TextStyle(color: Colors.white, fontSize: 13,
                        fontWeight: FontWeight.w700)),
                Text(user?.email ?? '',
                    style: TextStyle(color: Colors.white54, fontSize: 10)),
              ],
            ),
          ),

          const Divider(color: Colors.white12, height: 1),
          const SizedBox(height: 8),

          // ── Nav items ────────────────────────────────────────────────────
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              children: [
                _NavItem(icon: Icons.dashboard_outlined,   label: 'Dashboard',  route: AppRoutes.dashboard,  location: location),
                _ExpandableNavItem( icon: Icons.people_outline, label: 'Users', location: location, children: [
                  _SubNavItem( 
                    label: 'All Users',
                    route: AppRoutes.users,
                    location: location,
                    ),
                    _SubNavItem(
                      label: 'Create New User',
                      route: AppRoutes.createUser,
                      location: location,
                      ),
                      ],
                      ),
                _ExpandableNavItem(icon: Icons.location_city_outlined, label: 'Parishes',   location: location, children: [
                  _SubNavItem(
                    label: 'All Parishes',
                    route: AppRoutes.parishes,
                    location: location,
                    ),
                    _SubNavItem(
                      label: 'Add New Parish',
                      route: AppRoutes.addParish,
                      location: location,
                      ),
                ],),
                _ExpandableNavItem(icon: Icons.menu_book_outlined,   label: 'Readings',   location: location, children: [
                  _SubNavItem(
                    label: 'All Readings',
                    route: AppRoutes.readings,
                    location: location,
                    ),
                    _SubNavItem(
                      label: 'Add New Reading',
                      route: AppRoutes.addReading,
                      location: location,
                      ),
                ]),
                _NavItem(
                  icon: Icons.check_circle_outline, label: 'Approvals',
                  route: AppRoutes.approvals, location: location,
                  badge: approvals.pendingCount > 0 ? approvals.pendingCount : null,
                ),
                const SizedBox(height: 8),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  child: Text('SYSTEM',
                      style: TextStyle(color: Colors.white38, fontSize: 9,
                          fontWeight: FontWeight.w700, letterSpacing: 1.2)),
                ),
                _NavItem(icon: Icons.settings_outlined, label: 'Settings', route: AppRoutes.settings, location: location),
              ],
            ),
          ),

          const Divider(color: Colors.white12, height: 1),

          // ── User footer ──────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                InkWell(
                  borderRadius: BorderRadius.circular(8),
                  onTap: () {
                    context.read<AuthProvider>().logout();
                    context.go(AppRoutes.login);
                  },
                  child: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.logout, color: AppColors.sidebarText, size: 18),
                        SizedBox(width: 6),
                        Text('Sign out',
                            style: TextStyle(color: AppColors.sidebarText, fontSize: 14)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String route;
  final String location;
  final int? badge;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.route,
    required this.location,
    this.badge,
  });

  bool get isActive => location.startsWith(route);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 2),
      child: Material(
        color: isActive ? Colors.white.withOpacity(0.15) : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
        child: InkWell(
          borderRadius: BorderRadius.circular(8),
          onTap: () => context.go(route),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: Row(
              children: [
                Icon(icon, color: isActive ? Colors.white : Colors.white60, size: 18),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(label,
                      style: TextStyle(
                        color: isActive ? Colors.white : Colors.white70,
                        fontSize: 13,
                        fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                      )),
                ),
                if (badge != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.error,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text('$badge',
                        style: const TextStyle(color: Colors.white,
                            fontSize: 10, fontWeight: FontWeight.w700)),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ExpandableNavItem extends StatefulWidget {
  final IconData icon;
  final String label;
  final String location;
  final List<Widget> children;

  const _ExpandableNavItem({
    required this.icon,
    required this.label,
    required this.location,
    required this.children,
  });

  @override
  State<_ExpandableNavItem> createState() => _ExpandableNavItemState();
}

class _ExpandableNavItemState extends State<_ExpandableNavItem> {
  bool isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(8),
            onTap: () {
              setState(() => isExpanded = !isExpanded);
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              child: Row(
                children: [
                  Icon(widget.icon, color: Colors.white60, size: 18),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(widget.label,
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 13,
                        )),
                  ),
                  Icon(
                    isExpanded
                        ? Icons.keyboard_arrow_up
                        : Icons.keyboard_arrow_down,
                    color: Colors.white54,
                    size: 18,
                  ),
                ],
              ),
            ),
          ),
        ),

        // Children (dropdown)
        if (isExpanded)
          Padding(
            padding: const EdgeInsets.only(left: 20),
            child: Column(children: widget.children),
          ),
      ],
    );
  }
}

class _SubNavItem extends StatelessWidget {
  final String label;
  final String route;
  final String location;

  const _SubNavItem({
    required this.label,
    required this.route,
    required this.location,
  });

  bool get isActive => location.startsWith(route);

  @override
  Widget build(BuildContext context) {
    return Material(
      color: isActive ? Colors.white.withOpacity(0.1) : Colors.transparent,
      borderRadius: BorderRadius.circular(6),
      child: InkWell(
        borderRadius: BorderRadius.circular(6),
        onTap: () => context.go(route),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            children: [
              const SizedBox(width: 28), // indent
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    color: isActive ? Colors.white : Colors.white60,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
