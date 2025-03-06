import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'dart:html' as html; // Import for web-specific storage

class UserPreferences {
  static Future<void> saveUserData(Map<String, dynamic> userData) async {
    String dataString = jsonEncode(userData);

    if (kIsWeb) {
      // Use localStorage for web
      _saveToWebStorage('userData', dataString);
    } else {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('userData', dataString);
    }
  }

  static Future<Map<String, dynamic>?> getUserData() async {
    String? userDataString;

    if (kIsWeb) {
      // Get from localStorage
      userDataString = _getFromWebStorage('userData');
    } else {
      final prefs = await SharedPreferences.getInstance();
      userDataString = prefs.getString('userData');
    }

    if (userDataString != null) {
      return jsonDecode(userDataString);
    }
    return null;
  }

  static Future<void> clearUserData() async {
    if (kIsWeb) {
      _removeFromWebStorage('userData');
    } else {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('userData');
    }
  }

  // Web storage methods
  static void _saveToWebStorage(String key, String value) {
    if (kIsWeb) {
      html.window.localStorage[key] = value;
    }
  }

  static String? _getFromWebStorage(String key) {
    return kIsWeb ? html.window.localStorage[key] : null;
  }

  static void _removeFromWebStorage(String key) {
    if (kIsWeb) {
      html.window.localStorage.remove(key);
    }
  }
}
