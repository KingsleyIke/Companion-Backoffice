import 'package:flutter/foundation.dart';
import '../models/bo_user.dart';
import '../data/mock_data.dart';

class AuthProvider extends ChangeNotifier {
  BOUser? _currentUser;
  bool _isLoading = false;
  String? _error;

  BOUser? get currentUser => _currentUser;
  bool get isLoggedIn     => _currentUser != null;
  bool get isLoading      => _isLoading;
  String? get error       => _error;
  bool get isAdmin        => _currentUser?.role == UserRole.admin || isSuperAdmin;
  bool get isSuperAdmin   => _currentUser?.role == UserRole.superAdmin;

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 800));

    // Mock auth: accept any user from mock data with password 'Admin1234!'
    final user = mockUsers.where((u) => u.email == email).firstOrNull;

    if (user != null && password == 'Admin1234!') {
      _currentUser = user;
      _isLoading   = false;
      notifyListeners();
      return true;
    } else {
      _error     = 'Invalid email or password.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  void logout() {
    _currentUser = null;
    notifyListeners();
  }
}
