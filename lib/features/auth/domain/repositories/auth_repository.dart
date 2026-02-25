import 'package:companion/features/auth/domain/entities/user_entity.dart';
import 'package:companion/features/auth/domain/entities/auth_result.dart';

/// Abstract repository for authentication operations
abstract class AuthRepository {
  /// Sign up with email and password
  Future<AuthResult> signUp({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    String? phoneNumber,
  });

  /// Sign in with email and password
  Future<AuthResult> signIn({
    required String email,
    required String password,
  });

  /// Send password reset email
  Future<AuthResult> sendPasswordReset({
    required String email,
  });

  /// Reset password with code
  Future<AuthResult> resetPassword({
    required String code,
    required String newPassword,
  });

  /// Sign out
  Future<AuthResult> signOut();

  /// Get current user
  Future<UserEntity?> getCurrentUser();

  /// Get user by ID
  Future<UserEntity?> getUserById(String userId);

  /// Update user profile
  Future<AuthResult> updateUserProfile({
    required String userId,
    String? firstName,
    String? lastName,
    String? phoneNumber,
  });
}
