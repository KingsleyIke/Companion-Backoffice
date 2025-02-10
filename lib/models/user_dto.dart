import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:companion/models/roles.dart';

class UserDto {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String phone;
  final String gender;
  final String approvedBy;
  final int contributionPoints;
  final String profilePicUrl;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Role role;
  final bool isActive;

  UserDto({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.phone,
    required this.gender,
    required this.approvedBy,
    required this.contributionPoints,
    required this.profilePicUrl,
    required this.createdAt,
    required this.updatedAt,
    required this.role,
    required this.isActive,
  });

  // Convert Firestore data to UserDto
  factory UserDto.fromMap(String id, Map<String, dynamic> map) {
    return UserDto(
      id: id,
      firstName: map['firstName'] ?? '',
      lastName: map['lastName'] ?? '',
      email: map['email'] ?? '',
      phone: map['phone'] ?? '',
      gender: map['gender'] ?? '',
      approvedBy: map['approvedBy'] ?? '',
      contributionPoints: map['contributionPoints'] ?? 0,
      profilePicUrl: map['profilePicUrl'] ?? '',
      createdAt: (map['createdAt'] as Timestamp).toDate(),
      updatedAt: (map['updatedAt'] as Timestamp).toDate(),
      role: map['role'] ?? 'USER',
      isActive: map['isActive'] ?? true,
    );
  }

  // Convert UserDto to Firestore data
  Map<String, dynamic> toMap() {
    return {
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'phone': phone,
      'gender': gender,
      'approvedBy': approvedBy,
      'contributionPoints': contributionPoints,
      'profilePicUrl': profilePicUrl,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'role': role,
      'isActive': isActive,
    };
  }
}