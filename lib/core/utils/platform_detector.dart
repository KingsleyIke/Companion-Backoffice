import 'package:flutter/foundation.dart';

class PlatformDetector {
  /// Check if the app is running on web
  static bool get isWeb => kIsWeb;

  /// Check if the app is running on mobile (iOS or Android)
  static bool get isMobile => !kIsWeb;

  /// Check if the app is running on iOS
  static bool get isIOS => !kIsWeb && defaultTargetPlatform == TargetPlatform.iOS;

  /// Check if the app is running on Android
  static bool get isAndroid => !kIsWeb && defaultTargetPlatform == TargetPlatform.android;

  /// Get the current platform name
  static String get platformName {
    if (kIsWeb) return 'web';
    return defaultTargetPlatform.toString().split('.').last;
  }
}
