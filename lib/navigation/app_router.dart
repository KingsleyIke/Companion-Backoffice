import 'package:companion/features/readings/add_reading_page.dart';
import 'package:companion/features/readings/view_readings_page.dart';
import 'package:flutter/material.dart';
import 'package:companion/core/utils/platform_detector.dart';
import 'package:companion/features/splash/presentation/splash_screen.dart';
import 'package:companion/features/auth/presentation/login_screen.dart';
import 'package:companion/features/auth/presentation/signup_screen.dart';
import 'package:companion/features/auth/presentation/forgot_password_screen.dart';
import 'package:companion/features/auth/presentation/all_users_screen.dart';
import 'package:companion/features/home/presentation/home_screen.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'dart:html' as html;

class AppRouter {
  static const String splashRoute = '/splash';
  static const String loginRoute = '/login';
  static const String signupRoute = '/signup';
  static const String createAccountRoute = '/create-account';
  static const String forgotPasswordRoute = '/forgot-password';
  static const String allUsersRoute = '/all-users';
  static const String homeRoute = '/home';
  static const String addReadingRoute = '/add-reading';
  static const String viewReadingsRoute = '/view-readings';

  /// Returns the initial route based on platform, authentication state, and current URL
  static String getInitialRoute() {
    // Check if user is already authenticated in Firebase
    final currentUser = FirebaseAuth.instance.currentUser;
    
    // Get the current URL path from browser (Flask Web URL syncing uses path: /home, /create-account, etc.)
    final currentUrl = html.window.location.href;
    
    // Parse the requested route from the URL
    String? requestedRoute;
    if (currentUrl.contains('/login')) {
      requestedRoute = loginRoute;
    } else if (currentUrl.contains('/signup')) {
      requestedRoute = signupRoute;
    } else if (currentUrl.contains('/forgot-password')) {
      requestedRoute = forgotPasswordRoute;
    } else if (currentUrl.contains('/home') || currentUrl.contains('/dashboard')) {
      requestedRoute = homeRoute;
    } else if (currentUrl.contains('/create-account')) {
      requestedRoute = createAccountRoute;
    } else if (currentUrl.contains('/all-users')) {
      requestedRoute = allUsersRoute;
    } else if (currentUrl.contains('/splash')) {
      requestedRoute = splashRoute;
    } else if (currentUrl.contains('/add-reading')) {
      requestedRoute = addReadingRoute;
    } else if (currentUrl.contains('/view-readings')) {
      requestedRoute = viewReadingsRoute;
    }
    
    // List of public routes (accessible without authentication)
    const publicRoutes = [loginRoute, signupRoute, forgotPasswordRoute, splashRoute];
    
    // List of protected routes (requires authentication)
    const protectedRoutes = [homeRoute, createAccountRoute, allUsersRoute];
    
    // If user is authenticated
    if (currentUser != null) {
      // If they requested a valid route, let them access it
      if (requestedRoute != null) {
        return requestedRoute;
      }
      // Otherwise default to home
      return homeRoute;
    }
    
    // User is not authenticated
    // If they requested a public route, allow it
    if (requestedRoute != null && publicRoutes.contains(requestedRoute)) {
      return requestedRoute;
    }
    
    // If they requested a protected route or unknown route, redirect to login on web, splash on mobile
    if (PlatformDetector.isWeb) {
      return loginRoute;
    } else {
      return splashRoute;
    }
  }

  /// Generates routes for the app
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case splashRoute:
        return MaterialPageRoute(
          builder: (_) => const SplashScreen(),
          settings: settings,
        );

      case loginRoute:
        return MaterialPageRoute(
          builder: (_) => const LoginScreen(),
          settings: settings,
        );

      case signupRoute:
        return MaterialPageRoute(
          builder: (_) => const SignUpScreen(),
          settings: settings,
        );

      case createAccountRoute:
        return MaterialPageRoute(
          builder: (_) => const SignUpScreen(),
          settings: settings,
        );

      case forgotPasswordRoute:
        return MaterialPageRoute(
          builder: (_) => const ForgotPasswordScreen(),
          settings: settings,
        );

      case allUsersRoute:
        return MaterialPageRoute(
          builder: (_) => const AllUsersScreen(),
          settings: settings,
        );

      case homeRoute:
        return MaterialPageRoute(
          builder: (_) => const HomeScreen(),
          settings: settings,
        );

      case addReadingRoute:
        return MaterialPageRoute(
          builder: (_) => const AddReadingPage(),
          settings: settings,
        );

      case viewReadingsRoute:
        return MaterialPageRoute(
          builder: (_) => const ViewReadingsPage(),
          settings: settings,
        );

      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(
              child: Text('No route defined for ${settings.name}'),
            ),
          ),
          settings: settings,
        );
    }
  }

  /// Unknown route handler
  static Route<dynamic> unknownRoute(RouteSettings settings) {
    return MaterialPageRoute(
      builder: (_) => Scaffold(
        appBar: AppBar(title: const Text('Error')),
        body: Center(
          child: Text('No route defined for ${settings.name}'),
        ),
      ),
      settings: settings,
    );
  }
}
