import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../screens/login/login_screen.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/parishes/parishes_screen.dart';
import '../screens/parishes/add_parish_screen.dart';
import '../screens/readings/readings_screen.dart';
import '../screens/readings/add_reading_screen.dart';
import '../screens/users/users_screen.dart';
import '../screens/approvals/approvals_screen.dart';
import '../screens/settings/settings_screen.dart';
import '../widgets/bo_scaffold.dart';

class AppRoutes {
  static const login      = '/login';
  static const dashboard  = '/dashboard';
  static const parishes   = '/parishes';
  static const addParish  = '/parishes/add';
  static const editParish = '/parishes/edit/:id';
  static const readings   = '/readings';
  static const addReading = '/readings/add';
  static const editReading= '/readings/edit/:id';
  static const users      = '/users';
  static const approvals  = '/approvals';
  static const settings   = '/settings';
}

class AppRouter {
  static GoRouter router(AuthProvider authProvider) => GoRouter(
    initialLocation: AppRoutes.dashboard,
    debugLogDiagnostics: false,

    // ── Auth redirect ──────────────────────────────────────────────────────
    redirect: (context, state) {
      final loggedIn  = authProvider.isLoggedIn;
      final onLogin   = state.matchedLocation == AppRoutes.login;
      if (!loggedIn && !onLogin) return AppRoutes.login;
      if (loggedIn  &&  onLogin) return AppRoutes.dashboard;
      return null;
    },

    refreshListenable: authProvider,

    routes: [
      // ── Login (no shell) ─────────────────────────────────────────────────
      GoRoute(
        path: AppRoutes.login,
        builder: (_, __) => const LoginScreen(),
      ),

      // ── Shell with sidebar ───────────────────────────────────────────────
      ShellRoute(
        builder: (context, state, child) => BOScaffold(child: child),
        routes: [
          GoRoute(
            path: AppRoutes.dashboard,
            builder: (_, __) => const DashboardScreen(),
          ),

          // Parishes
          GoRoute(
            path: AppRoutes.parishes,
            builder: (_, __) => const ParishesScreen(),
          ),
          GoRoute(
            path: AppRoutes.addParish,
            builder: (_, __) => const AddParishScreen(),
          ),
          GoRoute(
            path: AppRoutes.editParish,
            builder: (_, state) => AddParishScreen(
              parishId: state.pathParameters['id'],
            ),
          ),

          // Readings
          GoRoute(
            path: AppRoutes.readings,
            builder: (_, __) => const ReadingsScreen(),
          ),
          GoRoute(
            path: AppRoutes.addReading,
            builder: (_, __) => const AddReadingScreen(),
          ),
          GoRoute(
            path: AppRoutes.editReading,
            builder: (_, state) => AddReadingScreen(
              readingId: state.pathParameters['id'],
            ),
          ),

          // Users
          GoRoute(
            path: AppRoutes.users,
            builder: (_, __) => const UsersScreen(),
          ),

          // Approvals
          GoRoute(
            path: AppRoutes.approvals,
            builder: (_, __) => const ApprovalsScreen(),
          ),

          // Settings
          GoRoute(
            path: AppRoutes.settings,
            builder: (_, __) => const SettingsScreen(),
          ),
        ],
      ),
    ],

    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            Text('Page not found: ${state.uri}',
                style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => context.go(AppRoutes.dashboard),
              child: const Text('Go to Dashboard'),
            ),
          ],
        ),
      ),
    ),
  );
}
