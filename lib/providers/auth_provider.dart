import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/bo_user.dart';

class AuthProvider extends ChangeNotifier {
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  BOUser? _currentUser;
  bool _isLoading = false;
  String? _error;

  BOUser? get currentUser => _currentUser;
  bool get isLoggedIn     => _currentUser != null;
  bool get isLoading      => _isLoading;
  String? get error       => _error;
  bool get isAdmin        => _currentUser?.role == UserRole.admin || isSuperAdmin;
  bool get isSuperAdmin   => _currentUser?.role == UserRole.superAdmin;

  /// Initialize authentication state on app startup
  Future<void> initialize() async {
    try {
      final user = _firebaseAuth.currentUser;
      if (user != null) {
        await _loadUserData(user.uid);
      }
    } catch (e) {
      _error = 'Failed to initialize authentication';
      notifyListeners();
    }
  }

  /// Load user data from Firestore
  Future<void> _loadUserData(String uid) async {
    try {
      final doc = await _firestore.collection('users').doc(uid).get();
      if (doc.exists) {
        _currentUser = BOUser.fromJson({...doc.data()!, 'id': uid});
      } else {
        // Create a basic user if not found in Firestore
        final firebaseUser = _firebaseAuth.currentUser;
        if (firebaseUser != null) {
          _currentUser = BOUser(
            id: uid,
            firstName: firebaseUser.displayName?.split(' ').first ?? 'User',
            lastName: firebaseUser.displayName?.split(' ').skip(1).join(' ') ?? '',
            email: firebaseUser.email ?? '',
            phone: firebaseUser.phoneNumber,
            role: UserRole.user,
            createdAt: firebaseUser.metadata.creationTime ?? DateTime.now(),
          );
        }
      }
    } catch (e) {
      _error = 'Failed to load user data: $e';
    }
    notifyListeners();
  }

  /// Login with email and password
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    _currentUser = null;
    notifyListeners();

    try {
      // Validate inputs
      if (email.isEmpty || password.isEmpty) {
        _error = 'Please enter both email and password';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      final credential = await _firebaseAuth.signInWithEmailAndPassword(
        email: email.trim().toLowerCase(),
        password: password,
      );

      if (credential.user != null) {
        await _loadUserData(credential.user!.uid);
        _isLoading = false;
        _error = null;
        notifyListeners();
        return true;
      }

      _error = 'Login failed. Please try again.';
      _isLoading = false;
      notifyListeners();
      return false;
    } on FirebaseAuthException catch (e) {
      print('🔴 Firebase Auth Error Code: ${e.code}');
      print('🔴 Firebase Auth Error Message: ${e.message}');
      _error = _getAuthErrorMessage(e.code);
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      print('🔴 Unexpected Error: $e');
      _error = 'An unexpected error occurred. Please try again.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Request password reset email
  Future<bool> sendPasswordResetEmail(String email) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _firebaseAuth.sendPasswordResetEmail(
        email: email.trim().toLowerCase(),
      );
      _isLoading = false;
      notifyListeners();
      return true;
    } on FirebaseAuthException catch (e) {
      _error = _getAuthErrorMessage(e.code);
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'Failed to send reset email. Please try again.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Logout the current user
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _firebaseAuth.signOut();
      _currentUser = null;
      _error = null;
    } catch (e) {
      _error = 'Failed to logout. Please try again.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Map Firebase Auth error codes to user-friendly messages
  String _getAuthErrorMessage(String code) {
    switch (code) {
      case 'invalid-email':
      case 'invalid-email-and-password-auth':
        return 'The email address is not valid.';
      case 'user-disabled':
        return 'This user account has been disabled.';
      case 'user-not-found':
        return 'No user found with this email address.';
      case 'wrong-password':
        return 'Invalid email or password.';
      case 'invalid-login-credentials':
      case 'INVALID_LOGIN_CREDENTIALS':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'invalid-credential':
        return 'Invalid credentials. Please verify your email and password.';
      case 'too-many-requests':
        return 'Too many failed login attempts. Please try again later or reset your password.';
      case 'operation-not-allowed':
        return 'Email/password login is not enabled.';
      case 'weak-password':
        return 'The password is too weak. Please use at least 6 characters.';
      case 'email-already-in-use':
        return 'An account with this email already exists.';
      case 'network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'service-disabled':
        return 'The authentication service is temporarily unavailable. Please try again later.';
      default:
        return 'Authentication failed. Please try again.';
    }
  }
}
