import 'package:flutter/material.dart';
import 'package:companion/core/utils/platform_detector.dart';
import 'package:companion/features/splash/presentation/splash_screen.dart';
import 'package:companion/features/auth/presentation/login_screen.dart';
import 'package:companion/features/auth/presentation/signup_screen.dart';
import 'package:companion/features/auth/presentation/forgot_password_screen.dart';
import 'package:companion/features/home/presentation/home_screen.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'dart:html' as html;

class AppRouter {
  static const String splashRoute = '/splash';
  static const String loginRoute = '/login';
  static const String signupRoute = '/signup';
  static const String createAccountRoute = '/create-account';
  static const String forgotPasswordRoute = '/forgot-password';
  static const String homeRoute = '/home';

  /// Returns the initial route based on platform, authentication state, and current URL
  static String getInitialRoute() {
    // Check if user is already authenticated in Firebase
    final currentUser = FirebaseAuth.instance.currentUser;
    
    // Get the current URL path from browser
    final currentPath = Uri.parse(html.window.location.href).path;
    
    // Parse the requested route from the URL
    String? requestedRoute;
    if (currentPath.contains('login')) {
      requestedRoute = loginRoute;
    } else if (currentPath.contains('signup')) {
      requestedRoute = signupRoute;
    } else if (currentPath.contains('forgot-password')) {
      requestedRoute = forgotPasswordRoute;
    } else if (currentPath.contains('home') || currentPath.contains('dashboard')) {
      requestedRoute = homeRoute;
    } else if (currentPath.contains('create-account')) {
      requestedRoute = createAccountRoute;
    } else if (currentPath.contains('splash')) {
      requestedRoute = splashRoute;
    }
    
    // List of public routes (accessible without authentication)
    const publicRoutes = [loginRoute, signupRoute, forgotPasswordRoute, splashRoute];
    
    // List of protected routes (requires authentication)
    const protectedRoutes = [homeRoute, createAccountRoute];
    
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
        return MaterialPageRoute(builder: (_) => const SplashScreen());

      case loginRoute:
        return MaterialPageRoute(builder: (_) => const LoginScreen());

      case signupRoute:
        return MaterialPageRoute(builder: (_) => const SignUpScreen());

      case createAccountRoute:
        return MaterialPageRoute(builder: (_) => const SignUpScreen());

      case forgotPasswordRoute:
        return MaterialPageRoute(builder: (_) => const ForgotPasswordScreen());

      case homeRoute:
        return MaterialPageRoute(builder: (_) => const HomeScreen());

      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(
              child: Text('No route defined for ${settings.name}'),
            ),
          ),
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
    );
  }
}
