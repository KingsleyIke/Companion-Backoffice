import 'package:companion/constants/user_roles.dart';

/// User entity in the domain layer
class UserEntity {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String? phoneNumber;
  final UserRole role;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? createdBy; // UID of user who created this user
  final String? updatedBy; // UID of user who last updated this user

  UserEntity({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.phoneNumber,
    required this.role,
    required this.createdAt,
    required this.updatedAt,
    this.createdBy,
    this.updatedBy,
  });

  String get fullName => '$firstName $lastName';
}
