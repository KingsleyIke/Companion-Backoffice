import 'package:flutter/material.dart';
import 'package:companion/navigation/app_router.dart';
import 'dart:html' as html;
import 'package:firebase_auth/firebase_auth.dart';

/// Observer to sync browser URL with route changes
class UrlSyncObserver extends NavigatorObserver {
  @override
  void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) {
    _updateUrl(route);
  }

  @override
  void didPop(Route<dynamic> route, Route<dynamic>? previousRoute) {
    if (previousRoute != null) {
      _updateUrl(previousRoute);
    }
  }

  @override
  void didRemove(Route<dynamic> route, Route<dynamic>? previousRoute) {
    if (previousRoute != null) {
      _updateUrl(previousRoute);
    }
  }

  @override
  void didReplace({Route<dynamic>? newRoute, Route<dynamic>? oldRoute}) {
    if (newRoute != null) {
      _updateUrl(newRoute);
    }
  }

  void _updateUrl(Route<dynamic> route) {
    if (route.settings.name != null && route.settings.name!.isNotEmpty) {
      final routeName = route.settings.name!;
      final url = routeName.startsWith('/') ? routeName : '/$routeName';
      
      // Only update if URL is different from current
      final currentUrl = html.window.location.href;
      if (!currentUrl.contains(url.replaceFirst('/', ''))) {
        try {
          // Use replaceState with a small delay to avoid conflicts with Flutter's internal history
          Future.microtask(() {
            html.window.history.replaceState(null, '', url);
          });
        } catch (e) {
          // Silently handle any history state errors
        }
      }
    }
  }
}

class CompanionApp extends StatefulWidget {
  const CompanionApp({Key? key}) : super(key: key);

  @override
  State<CompanionApp> createState() => _CompanionAppState();
}

class _CompanionAppState extends State<CompanionApp> {
  final GlobalKey<NavigatorState> _navigatorKey = GlobalKey<NavigatorState>();

  @override
  void initState() {
    super.initState();
    // Listen to browser popstate events (back button, URL changes)
    html.window.onPopState.listen((event) {
      _handleUrlChange();
    });
    
    // Also listen for manual URL changes
    html.window.onHashChange.listen((event) {
      _handleUrlChange();
    });
  }

  void _handleUrlChange() {
    final path = Uri.parse(html.window.location.href).path;
    // Remove leading slash and base path if present
    String route = path.replaceAll(RegExp(r'^/?'), '/');
    
    // Check if user is authenticated using Firebase Auth (most reliable method)
    final isAuthenticated = FirebaseAuth.instance.currentUser != null;
    
    // List of protected routes that require authentication
    const protectedRoutes = ['home', 'dashboard', 'create-account'];
    const publicRoutes = ['login', 'signup', 'forgot-password', 'splash'];
    
    // Check if trying to access protected route without authentication
    bool isProtectedRoute = protectedRoutes.any((route_name) => route.contains(route_name));
    
    if (isProtectedRoute && !isAuthenticated) {
      // Not authenticated but trying to access protected route - redirect to login
      _navigatorKey.currentState?.pushReplacementNamed(AppRouter.loginRoute);
      return;
    }
    
    // Handle common routes
    if (route.contains('login')) {
      _navigatorKey.currentState?.pushReplacementNamed(AppRouter.loginRoute);
    } else if (route.contains('home') || route.contains('dashboard')) {
      _navigatorKey.currentState?.pushReplacementNamed(AppRouter.homeRoute);
    } else if (route.contains('signup')) {
      _navigatorKey.currentState?.pushReplacementNamed(AppRouter.signupRoute);
    } else if (route.contains('create-account')) {
      _navigatorKey.currentState?.pushReplacementNamed(AppRouter.createAccountRoute);
    } else if (route.contains('forgot-password')) {
      _navigatorKey.currentState?.pushReplacementNamed(AppRouter.forgotPasswordRoute);
    } else if (route.contains('splash')) {
      _navigatorKey.currentState?.pushReplacementNamed(AppRouter.splashRoute);
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Companion',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        appBarTheme: AppBarTheme(
          elevation: 0,
          backgroundColor: Colors.blue[700],
        ),
      ),
      darkTheme: ThemeData.dark(useMaterial3: true),
      // Use light theme only for now
      themeMode: ThemeMode.light,
      initialRoute: AppRouter.getInitialRoute(),
      onGenerateRoute: AppRouter.generateRoute,
      onUnknownRoute: AppRouter.unknownRoute,
      navigatorKey: _navigatorKey,
      navigatorObservers: [
        UrlSyncObserver(),
      ],
      debugShowCheckedModeBanner: false,
    );
  }
}
