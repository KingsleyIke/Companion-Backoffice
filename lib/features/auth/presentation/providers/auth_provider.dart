import 'package:flutter/foundation.dart';
import 'package:companion/features/auth/domain/entities/user_entity.dart';
import 'package:companion/features/auth/domain/repositories/auth_repository.dart';
import 'package:companion/core/services/auth_service.dart';
import 'package:companion/constants/user_roles.dart';

/// Authentication provider for managing auth state
class AuthProvider extends ChangeNotifier {
  final AuthRepository _repository = AuthService().repository;

  UserEntity? _currentUser;
  bool _isLoading = false;
  bool _isAuthenticated = false;
  String? _errorMessage;

  // Getters
  UserEntity? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  String? get errorMessage => _errorMessage;

  /// Constructor - initializes auth state on startup
  AuthProvider() {
    _initializeAuthState();
  }

  /// Initialize auth state by checking if user is already logged in
  Future<void> _initializeAuthState() async {
    try {
      final user = await _repository.getCurrentUser();
      if (user != null) {
        _currentUser = user;
        _isAuthenticated = true;
        notifyListeners();
      }
    } catch (e) {
      // Silently fail - user is just not authenticated yet
    }
  }

  /// Sign up a new user
  Future<bool> signUp({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    String? phoneNumber,
    UserRole role = UserRole.user,
    String? createdBy,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _repository.signUp(
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        phoneNumber: phoneNumber,
        role: role,
        createdBy: createdBy,
      );

      if (result.success) {
        _isAuthenticated = true;
        // Fetch and set current user
        try {
          _currentUser = await _repository.getCurrentUser();
        } catch (e) {
          // Silently continue
        }
        return true;
      } else {
        _errorMessage = result.message ?? 'Sign up failed';
        return false;
      }
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Sign in user
  Future<bool> signIn({
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _repository.signIn(
        email: email,
        password: password,
      );

      if (result.success) {
        _isAuthenticated = true;
        // Fetch and set current user
        try {
          _currentUser = await _repository.getCurrentUser();
        } catch (e) {
          // Silently continue
        }
        return true;
      } else {
        _errorMessage = result.message ?? 'Sign in failed';
        return false;
      }
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Send password reset email
  Future<bool> sendPasswordReset({
    required String email,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _repository.sendPasswordReset(email: email);

      if (result.success) {
        _isLoading = false;
        _errorMessage = null;
        notifyListeners();
        return true;
      } else {
        _errorMessage = result.message ?? 'Failed to send reset email';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Reset password with code
  Future<bool> resetPassword({
    required String code,
    required String newPassword,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _repository.resetPassword(
        code: code,
        newPassword: newPassword,
      );

      if (result.success) {
        _isLoading = false;
        _errorMessage = null;
        notifyListeners();
        return true;
      } else {
        _errorMessage = result.message ?? 'Failed to reset password';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Sign out
  Future<void> signOut() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _repository.signOut();
      _currentUser = null;
      _isAuthenticated = false;
      _errorMessage = null;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
