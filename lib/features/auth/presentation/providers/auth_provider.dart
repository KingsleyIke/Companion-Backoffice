import 'package:flutter/foundation.dart';
import 'package:companion/features/auth/domain/entities/user_entity.dart';
import 'package:companion/features/auth/domain/repositories/auth_repository.dart';
import 'package:companion/core/services/auth_service.dart';

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

  /// Sign up a new user
  Future<bool> signUp({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    String? phoneNumber,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      print('[AuthProvider] Signing up user: $email');
      final result = await _repository.signUp(
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        phoneNumber: phoneNumber,
      );

      print('[AuthProvider] Sign up result: ${result.success}');
      
      if (result.success) {
        _isAuthenticated = true;
        // Fetch and set current user
        try {
          _currentUser = await _repository.getCurrentUser();
          print('[AuthProvider] Current user fetched: ${_currentUser?.email}');
        } catch (e) {
          print('[AuthProvider] Error fetching user: $e');
        }
        return true;
      } else {
        _errorMessage = result.message ?? 'Sign up failed';
        print('[AuthProvider] Sign up failed: $_errorMessage');
        return false;
      }
    } catch (e) {
      _errorMessage = e.toString();
      print('[AuthProvider] Sign up exception: $e');
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
      print('[AuthProvider] Signing in with email: $email');
      final result = await _repository.signIn(
        email: email,
        password: password,
      );

      print('[AuthProvider] Sign in result: ${result.success}');
      
      if (result.success) {
        _isAuthenticated = true;
        // Fetch and set current user
        try {
          _currentUser = await _repository.getCurrentUser();
          print('[AuthProvider] Current user fetched: ${_currentUser?.email}');
        } catch (e) {
          print('[AuthProvider] Error fetching user: $e');
        }
        return true;
      } else {
        _errorMessage = result.message ?? 'Sign in failed';
        print('[AuthProvider] Sign in failed: $_errorMessage');
        return false;
      }
    } catch (e) {
      _errorMessage = e.toString();
      print('[AuthProvider] Sign in exception: $e');
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
