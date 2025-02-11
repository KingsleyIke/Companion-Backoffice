import 'package:flutter/material.dart';

class NavigationService {
  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  // Navigate to a new page
  Future<void> navigateTo(String routeName) async {
    await navigatorKey.currentState?.pushNamed(routeName);
  }

  Future<void> navigateToWithArgs(String routeName, Object arguments) async {
    await navigatorKey.currentState?.pushNamed(routeName, arguments: arguments);
  }
  // Replace current page with a new page
  Future<void> replaceWith(String routeName) async {
    await navigatorKey.currentState?.pushReplacementNamed(routeName);
  }

  // Go back to the previous page
  void goBack() {
    navigatorKey.currentState?.pop();
  }

  // Clear the entire navigation stack and navigate to a page
  Future<void> clearStackAndNavigateTo(String routeName) async {
    await navigatorKey.currentState?.pushNamedAndRemoveUntil(routeName, (route) => false);
  }
}