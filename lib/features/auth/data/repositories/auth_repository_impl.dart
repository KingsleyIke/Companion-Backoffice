import 'package:companion/constants/user_roles.dart';
import 'package:companion/features/auth/domain/entities/user_entity.dart';
import 'package:companion/features/auth/domain/entities/auth_result.dart';
import 'package:companion/features/auth/domain/repositories/auth_repository.dart';
import 'package:companion/features/auth/data/datasources/firebase_auth_datasource.dart';

/// Implementation of AuthRepository using Firebase
class AuthRepositoryImpl implements AuthRepository {
  final FirebaseAuthDatasource _datasource;

  AuthRepositoryImpl({required FirebaseAuthDatasource datasource})
      : _datasource = datasource;

  @override
  Future<AuthResult> signUp({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    String? phoneNumber,
    UserRole role = UserRole.user,
    String? createdBy,
  }) async {
    try {
      await _datasource.signUp(
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        phoneNumber: phoneNumber,
        role: role,
        createdBy: createdBy,
      );

      return AuthResult.success(
        message: 'Account created successfully',
        userId: email,
      );
    } catch (e) {
      return AuthResult.failure(
        message: e.toString(),
        exception: e,
      );
    }
  }

  @override
  Future<AuthResult> signIn({
    required String email,
    required String password,
  }) async {
    try {
      await _datasource.signIn(
        email: email,
        password: password,
      );

      return AuthResult.success(
        message: 'Signed in successfully',
      );
    } catch (e) {
      return AuthResult.failure(
        message: e.toString(),
        exception: e,
      );
    }
  }

  @override
  Future<AuthResult> sendPasswordReset({
    required String email,
  }) async {
    try {
      await _datasource.sendPasswordReset(email: email);

      return AuthResult.success(
        message: 'Password reset email sent',
      );
    } catch (e) {
      return AuthResult.failure(
        message: e.toString(),
        exception: e,
      );
    }
  }

  @override
  Future<AuthResult> resetPassword({
    required String code,
    required String newPassword,
  }) async {
    try {
      await _datasource.confirmPasswordReset(
        code: code,
        newPassword: newPassword,
      );

      return AuthResult.success(
        message: 'Password reset successfully',
      );
    } catch (e) {
      return AuthResult.failure(
        message: e.toString(),
        exception: e,
      );
    }
  }

  @override
  Future<AuthResult> signOut() async {
    try {
      await _datasource.signOut();

      return AuthResult.success(
        message: 'Signed out successfully',
      );
    } catch (e) {
      return AuthResult.failure(
        message: e.toString(),
        exception: e,
      );
    }
  }

  @override
  Future<UserEntity?> getCurrentUser() async {
    try {
      final userModel = await _datasource.getCurrentUser();
      return userModel?.toEntity();
    } catch (e) {
      return null;
    }
  }

  @override
  Future<UserEntity?> getUserById(String userId) async {
    try {
      final userModel = await _datasource.getUserById(userId);
      return userModel?.toEntity();
    } catch (e) {
      return null;
    }
  }

  @override
  Future<AuthResult> updateUserProfile({
    required String userId,
    String? firstName,
    String? lastName,
    String? phoneNumber,
  }) async {
    try {
      await _datasource.updateUserProfile(
        userId: userId,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
      );

      return AuthResult.success(
        message: 'Profile updated successfully',
      );
    } catch (e) {
      return AuthResult.failure(
        message: e.toString(),
        exception: e,
      );
    }
  }
}
