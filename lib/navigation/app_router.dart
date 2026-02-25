import 'package:flutter/material.dart';
import 'package:companion/core/utils/platform_detector.dart';
import 'package:companion/features/splash/presentation/splash_screen.dart';
import 'package:companion/features/auth/presentation/login_screen.dart';
import 'package:companion/features/auth/presentation/signup_screen.dart';
import 'package:companion/features/auth/presentation/forgot_password_screen.dart';
import 'package:companion/features/home/presentation/home_screen.dart';

class AppRouter {
  static const String splashRoute = '/splash';
  static const String loginRoute = '/login';
  static const String signupRoute = '/signup';
  static const String forgotPasswordRoute = '/forgot-password';
  static const String homeRoute = '/home';

  /// Returns the initial route based on platform
  static String getInitialRoute() {
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
