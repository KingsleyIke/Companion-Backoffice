import 'package:companion/features/auth/presentation/providers/auth_provider.dart';
import 'package:companion/navigation/app_router.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../theme/app_theme.dart';
import 'package:go_router/go_router.dart';



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

    return Container(
      width: 230,
      color: AppColors.sidebarBg,
      child: Column(
        children: [
          // ── Logo / App name ──────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.fromLTRB(20, 48, 20, 20),
            child: Row(
              children: [
                Container(
                  width: 36, height: 36,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.church, color: Colors.white, size: 20),
                ),
                const SizedBox(width: 10),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('CC Back Office',
                          style: TextStyle(color: Colors.white, fontSize: 13,
                              fontWeight: FontWeight.w700)),
                      Text('Admin Panel',
                          style: TextStyle(color: Colors.white54, fontSize: 10)),
                    ],
                  ),
                ),
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
                _NavItem(icon: Icons.dashboard_outlined,   label: 'Dashboard',  route: AppRouter.homeRoute,  location: location),
                _NavItem(icon: Icons.location_city_outlined, label: 'Parishes',   route: AppRouter.viewParishesRoute,   location: location),
                _NavItem(icon: Icons.menu_book_outlined,   label: 'Readings',   route: AppRouter.viewReadingsRoute,   location: location),
                _NavItem(icon: Icons.people_outline,       label: 'Users',      route: AppRouter.allUsersRoute,      location: location),
                const SizedBox(height: 8),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  child: Text('SYSTEM',
                      style: TextStyle(color: Colors.white38, fontSize: 9,
                          fontWeight: FontWeight.w700, letterSpacing: 1.2)),
                ),
                // _NavItem(icon: Icons.settings_outlined, label: 'Settings', route: '/settings', location: location),
              ],
            ),
          ),

          const Divider(color: Colors.white12, height: 1),

          // ── User footer ──────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 17,
                  backgroundColor: Colors.white24,
                  child: Text(
                    _getInitials(user?.firstName ?? '', user?.lastName ?? ''),
                    style: const TextStyle(color: Colors.white,
                        fontSize: 12, fontWeight: FontWeight.w700)),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user?.fullName ?? '',
                          style: const TextStyle(color: Colors.white,
                              fontSize: 12, fontWeight: FontWeight.w600),
                          overflow: TextOverflow.ellipsis),
                      Text(user?.role.displayName ?? '',
                          style: const TextStyle(color: Colors.white54, fontSize: 10)),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.logout, color: Colors.white54, size: 18),
                  onPressed: () async {
                    await context.read<AuthProvider>().signOut();
                    if (context.mounted) {
                      context.go(AppRouter.loginRoute);
                    }
                  },
                  tooltip: 'Sign out',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getInitials(String firstName, String lastName) {
    String initials = '';
    if (firstName.isNotEmpty) {
      initials += firstName[0].toUpperCase();
    }
    if (lastName.isNotEmpty) {
      initials += lastName[0].toUpperCase();
    }
    return initials.isEmpty ? '?' : initials;
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String route;
  final String location;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.route,
    required this.location,
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
              ],
            ),
          ),
        ),
      ),
    );
  }
}
