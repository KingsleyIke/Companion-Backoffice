enum UserRole {
  superAdmin('Super Admin'),
  admin('Admin'),
  contributor('Contributor'),
  user('User');

  final String displayName;

  const UserRole(this.displayName);
}
