import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:companion/features/auth/data/models/user_model.dart';
import 'package:companion/constants/user_roles.dart';

/// Firebase datasource for authentication
class FirebaseAuthDatasource {
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  /// Sign up new user
  Future<FirebaseAuthDatasource> signUp({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    String? phoneNumber,
  }) async {
    try {
      // Create Firebase Auth user
      final userCredential = await _firebaseAuth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      final userId = userCredential.user!.uid;
      print('[FirebaseAuthDatasource] Created Firebase Auth user: $userId');

      // Create user document in Firestore with default Super Admin role
      final userModel = UserModel(
        id: userId,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNumber: phoneNumber,
        role: UserRole.superAdmin,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      print('[FirebaseAuthDatasource] Writing user to Firestore: ${userModel.toJson()}');
      try {
        await _firestore.collection('users').doc(userId).set(userModel.toJson());
        print('[FirebaseAuthDatasource] User successfully written to Firestore');
      } catch (firestoreError) {
        print('[FirebaseAuthDatasource] FIRESTORE WRITE ERROR: $firestoreError');
        throw Exception('Failed to save user to Firestore: $firestoreError');
      }

      return this;
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    } catch (e) {
      throw Exception('Sign up failed: $e');
    }
  }

  /// Sign in user
  Future<void> signIn({
    required String email,
    required String password,
  }) async {
    try {
      await _firebaseAuth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    } catch (e) {
      throw Exception('Sign in failed: $e');
    }
  }

  /// Send password reset email
  Future<void> sendPasswordReset({
    required String email,
  }) async {
    try {
      await _firebaseAuth.sendPasswordResetEmail(email: email);
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    } catch (e) {
      throw Exception('Failed to send password reset email: $e');
    }
  }

  /// Confirm password reset
  Future<void> confirmPasswordReset({
    required String code,
    required String newPassword,
  }) async {
    try {
      await _firebaseAuth.confirmPasswordReset(
        code: code,
        newPassword: newPassword,
      );
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    } catch (e) {
      throw Exception('Failed to reset password: $e');
    }
  }

  /// Sign out
  Future<void> signOut() async {
    try {
      await _firebaseAuth.signOut();
    } catch (e) {
      throw Exception('Sign out failed: $e');
    }
  }

  /// Get current user
  Future<UserModel?> getCurrentUser() async {
    try {
      final user = _firebaseAuth.currentUser;
      print('[FirebaseAuthDatasource] Getting current user, Firebase Auth user: ${user?.uid}');
      if (user == null) return null;

      print('[FirebaseAuthDatasource] Querying Firestore for user with UID: ${user.uid}');
      final doc = await _firestore.collection('users').doc(user.uid).get();
      print('[FirebaseAuthDatasource] Document exists: ${doc.exists}, Data: ${doc.data()}');
      if (!doc.exists) {
        print('[FirebaseAuthDatasource] Document does not exist in Firestore!');
        return null;
      }

      final userModel = UserModel.fromJson(doc.data()!, doc.id);
      print('[FirebaseAuthDatasource] Successfully retrieved user from Firestore: ${userModel.email}');
      return userModel;
    } catch (e) {
      print('[FirebaseAuthDatasource] Error in getCurrentUser: $e');
      throw Exception('Failed to get current user: $e');
    }
  }

  /// Get user by ID
  Future<UserModel?> getUserById(String userId) async {
    try {
      final doc = await _firestore.collection('users').doc(userId).get();
      if (!doc.exists) return null;

      return UserModel.fromJson(doc.data()!, doc.id);
    } catch (e) {
      throw Exception('Failed to get user: $e');
    }
  }

  /// Update user profile in Firestore
  Future<void> updateUserProfile({
    required String userId,
    String? firstName,
    String? lastName,
    String? phoneNumber,
  }) async {
    try {
      final updates = <String, dynamic>{
        'updatedAt': DateTime.now().toIso8601String(),
      };

      if (firstName != null) updates['firstName'] = firstName;
      if (lastName != null) updates['lastName'] = lastName;
      if (phoneNumber != null) updates['phoneNumber'] = phoneNumber;

      await _firestore.collection('users').doc(userId).update(updates);
    } catch (e) {
      throw Exception('Failed to update user profile: $e');
    }
  }

  /// Handle Firebase Auth exceptions
  String _handleAuthException(FirebaseAuthException e) {
    switch (e.code) {
      case 'weak-password':
        return 'The password provided is too weak.';
      case 'email-already-in-use':
        return 'An account with this email already exists.';
      case 'invalid-email':
        return 'The email address is not valid.';
      case 'user-disabled':
        return 'The user account has been disabled.';
      case 'user-not-found':
        return 'No user account found with this email.';
      case 'wrong-password':
        return 'The password is incorrect.';
      case 'too-many-requests':
        return 'Too many login attempts. Please try again later.';
      case 'operation-not-allowed':
        return 'Email/password accounts are not enabled.';
      case 'invalid-credential':
        return 'Invalid email or password.';
      default:
        return 'Authentication failed: ${e.message}';
    }
  }
}
