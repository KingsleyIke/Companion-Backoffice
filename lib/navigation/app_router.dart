import 'package:companion/features/parishes/add_parish_page.dart';
import 'package:companion/features/parishes/view_parishes_page.dart';
import 'package:companion/features/readings/add_reading_page.dart';
import 'package:companion/features/readings/view_readings_page.dart';
import 'package:flutter/material.dart';
import 'package:companion/features/auth/presentation/login_screen.dart';
import 'package:companion/features/auth/presentation/signup_screen.dart';
import 'package:companion/features/auth/presentation/forgot_password_screen.dart';
import 'package:companion/features/auth/presentation/all_users_screen.dart';
import 'package:companion/features/home/presentation/home_screen.dart';
import 'package:firebase_auth/firebase_auth.dart';

class AppRouter {
    static const String mobileHomeRoute = '/mobile-home';
  static const String splashRoute = '/splash';
  static const String loginRoute = '/login';
  static const String signupRoute = '/signup';
  static const String createAccountRoute = '/create-account';
  static const String forgotPasswordRoute = '/forgot-password';
  static const String allUsersRoute = '/all-users';
  static const String homeRoute = '/home';
  static const String addReadingRoute = '/add-reading';
  static const String viewReadingsRoute = '/view-readings';
  static const String addParishRoute = '/add-parish';
  static const String viewParishesRoute = '/view-parishes';

  /// Returns the initial route based on authentication state
  static String getInitialRoute() {
    final currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser == null) {
      // if (PlatformDetector.isMobile) {
      //   return splashRoute;
      // } else {
        return loginRoute;
      // }
    } else {
      return homeRoute;
    }
  }

  /// Generates routes for the app
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      // case mobileHomeRoute:
      //   return MaterialPageRoute(
      //     builder: (_) => const mobile_home.MobileHomePage(),
      //     settings: settings,
      //   );
      // case splashRoute:
      //   return MaterialPageRoute(
      //     builder: (_) => const SplashScreen(),
      //     settings: settings,
      //   );

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

      case addParishRoute:
        return MaterialPageRoute(
          builder: (_) => const AddParishPage(),
          settings: settings,
        );

      case viewParishesRoute:
        return MaterialPageRoute(
          builder: (_) => const ViewParishesPage(),
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
