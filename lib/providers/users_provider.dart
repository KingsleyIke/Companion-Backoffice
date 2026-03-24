import 'package:flutter/foundation.dart';
import '../models/bo_user.dart';
import '../data/mock_data.dart';

class UsersProvider extends ChangeNotifier {
  List<BOUser> _users  = List.from(mockUsers);
  String _roleFilter   = '';
  String _searchQuery  = '';

  List<BOUser> get users    => _users;
  String get roleFilter     => _roleFilter;
  String get searchQuery    => _searchQuery;

  List<BOUser> get filtered => _users.where((u) {
    final q = _searchQuery.toLowerCase();
    final matchSearch = q.isEmpty ||
        u.fullName.toLowerCase().contains(q) ||
        u.email.toLowerCase().contains(q);
    final matchRole = _roleFilter.isEmpty || u.role.name == _roleFilter;
    return matchSearch && matchRole;
  }).toList();

  int get adminCount       => _users.where((u) => u.role == UserRole.admin || u.role == UserRole.superAdmin).length;
  int get contributorCount => _users.where((u) => u.role == UserRole.contributor).length;

  void setRoleFilter(String r) { _roleFilter = r;   notifyListeners(); }
  void setSearch(String q)     { _searchQuery = q;  notifyListeners(); }
  void clearFilters()          { _roleFilter = _searchQuery = ''; notifyListeners(); }

  BOUser? getById(String id) =>
      _users.where((u) => u.id == id).firstOrNull;

  void addUser(BOUser u) {
    _users = [..._users, u];
    notifyListeners();
  }

  void updateUser(BOUser u) {
    _users = _users.map((e) => e.id == u.id ? u : e).toList();
    notifyListeners();
  }

  void deleteUser(String id) {
    _users = _users.where((u) => u.id != id).toList();
    notifyListeners();
  }

  void updateRole(String id, UserRole role) {
    _users = _users.map((u) => u.id == id ? u.copyWith(role: role) : u).toList();
    notifyListeners();
  }
}
