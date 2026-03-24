enum UserRole { user, contributor, admin, superAdmin }

extension UserRoleX on UserRole {
  String get label {
    const labels = {
      UserRole.user:        'User',
      UserRole.contributor: 'Contributor',
      UserRole.admin:       'Admin',
      UserRole.superAdmin:  'Super Admin',
    };
    return labels[this]!;
  }

  static UserRole fromString(String s) =>
      UserRole.values.firstWhere((e) => e.name == s, orElse: () => UserRole.user);
}

class BOUser {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String? phone;
  final UserRole role;
  final DateTime createdAt;

  const BOUser({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.phone,
    required this.role,
    required this.createdAt,
  });

  String get fullName => '$firstName $lastName';
  String get initials => '${firstName[0]}${lastName[0]}'.toUpperCase();

  factory BOUser.fromJson(Map<String, dynamic> json) => BOUser(
    id:        json['id'] as String,
    firstName: json['firstName'] as String,
    lastName:  json['lastName'] as String,
    email:     json['email'] as String,
    phone:     json['phone'] as String?,
    role:      UserRoleX.fromString(json['role'] as String),
    createdAt: DateTime.parse(json['createdAt'] as String),
  );

  Map<String, dynamic> toJson() => {
    'id': id, 'firstName': firstName, 'lastName': lastName,
    'email': email, 'phone': phone, 'role': role.name,
    'createdAt': createdAt.toIso8601String(),
  };

  BOUser copyWith({
    String? id, String? firstName, String? lastName, String? email,
    String? phone, UserRole? role, DateTime? createdAt,
  }) =>
      BOUser(
        id:        id        ?? this.id,
        firstName: firstName ?? this.firstName,
        lastName:  lastName  ?? this.lastName,
        email:     email     ?? this.email,
        phone:     phone     ?? this.phone,
        role:      role      ?? this.role,
        createdAt: createdAt ?? this.createdAt,
      );
}
