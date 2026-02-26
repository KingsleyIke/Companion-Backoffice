import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart' hide AuthProvider;
import 'package:companion/constants/user_roles.dart';
import 'package:companion/features/shared/widgets/app_drawer.dart';
  final TextEditingController _searchController = TextEditingController();
class _SummaryCard extends StatelessWidget {
  final String title;
  final int count;
  final Color color;
  final IconData icon;
  final bool large;
  const _SummaryCard({
    required this.title,
    required this.count,
    required this.color,
    required this.icon,
    this.large = false,
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      color: color.withOpacity(0.1),
      elevation: 0,
      child: Container(
        height: large ? 110 : null,
        padding: EdgeInsets.symmetric(horizontal: large ? 0 : 18, vertical: large ? 0 : 14),
        alignment: Alignment.center,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: large ? 40 : 28),
            const SizedBox(width: 18),
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: color,
                    fontSize: large ? 20 : 16,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  count.toString(),
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: large ? 32 : 18,
                    color: color,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Screen to display all users and allow editing (admin only)
class AllUsersScreen extends StatefulWidget {
  const AllUsersScreen({Key? key}) : super(key: key);

  @override
  State<AllUsersScreen> createState() => _AllUsersScreenState();
}

class _AllUsersScreenState extends State<AllUsersScreen> {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;
  String _searchQuery = '';
  String? _roleFilter;

  void _showDeleteDialog(BuildContext context, String userId, Map<String, dynamic> userData) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete User'),
        content: Text('Are you sure you want to delete user "${userData['firstName'] ?? ''} ${userData['lastName'] ?? ''}"? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red[700]),
            onPressed: () async {
              try {
                await _firestore.collection('users').doc(userId).delete();
                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('User deleted successfully'),
                      duration: Duration(seconds: 2),
                    ),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Error deleting user: $e'),
                      duration: const Duration(seconds: 2),
                    ),
                  );
                }
              }
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('All Users'),
        backgroundColor: Colors.blue[700],
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
      body: Row(
        children: [
          const AppDrawer(),
          Expanded(
            child: StreamBuilder<QuerySnapshot>(
              stream: _firestore.collection('users').orderBy('createdAt', descending: true).snapshots(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                  return const Center(child: Text('No users found'));
                }
                var users = snapshot.data!.docs;
                // Apply search filter
                if (_searchQuery.isNotEmpty) {
                  users = users.where((doc) {
                    final data = doc.data() as Map<String, dynamic>;
                    final name = ((data['firstName'] ?? '') + ' ' + (data['lastName'] ?? '')).toLowerCase();
                    final email = (data['email'] ?? '').toLowerCase();
                    final phone = (data['phoneNumber'] ?? '').toLowerCase();
                    return name.contains(_searchQuery.toLowerCase()) ||
                        email.contains(_searchQuery.toLowerCase()) ||
                        phone.contains(_searchQuery.toLowerCase());
                  }).toList();
                }
                // Apply role filter
                if (_roleFilter != null && _roleFilter!.isNotEmpty) {
                  users = users.where((doc) {
                    final data = doc.data() as Map<String, dynamic>;
                    return data['role'] == _roleFilter;
                  }).toList();
                }
                // Calculate summary counts
                int totalUsers = users.length;
                int adminUsers = users.where((doc) {
                  final role = (doc.data() as Map<String, dynamic>)['role'];
                  return role == 'admin' || role == 'superAdmin';
                }).length;
                int contributors = users.where((doc) {
                  final role = (doc.data() as Map<String, dynamic>)['role'];
                  return role == 'contributor';
                }).length;
                int normalUsers = users.where((doc) {
                  final role = (doc.data() as Map<String, dynamic>)['role'];
                  return role == 'user';
                }).length;

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Summary cards row
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Row(
                        children: [
                          Expanded(
                            child: _SummaryCard(
                              title: 'Total Users',
                              count: totalUsers,
                              color: Colors.blue[700]!,
                              icon: Icons.people,
                              large: true,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _SummaryCard(
                              title: 'Admins',
                              count: adminUsers,
                              color: Colors.orange[700]!,
                              icon: Icons.admin_panel_settings,
                              large: true,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _SummaryCard(
                              title: 'Contributors',
                              count: contributors,
                              color: Colors.green[700]!,
                              icon: Icons.volunteer_activism,
                              large: true,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _SummaryCard(
                              title: 'Users',
                              count: normalUsers,
                              color: Colors.grey[700]!,
                              icon: Icons.person,
                              large: true,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Search and filter row
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Center(
                        child: ConstrainedBox(
                          constraints: const BoxConstraints(maxWidth: 600),
                          child: Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  controller: _searchController,
                                  decoration: InputDecoration(
                                    hintText: 'Search users...',
                                    prefixIcon: const Icon(Icons.search),
                                    suffixIcon: _searchController.text.isNotEmpty
                                        ? IconButton(
                                            icon: const Icon(Icons.clear),
                                            onPressed: () {
                                              _searchController.clear();
                                              setState(() {
                                                _searchQuery = '';
                                              });
                                            },
                                          )
                                        : null,
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 12),
                                  ),
                                  onChanged: (value) {
                                    setState(() {
                                      _searchQuery = value;
                                    });
                                  },
                                ),
                              ),
                              const SizedBox(width: 12),
                              DropdownButton<String>(
                                value: _roleFilter,
                                hint: const Text('Filter by role'),
                                items: [
                                  const DropdownMenuItem(value: '', child: Text('All Roles')),
                                  ...UserRole.values.map((role) => DropdownMenuItem(
                                        value: role.name,
                                        child: Text(role.displayName),
                                      )),
                                ],
                                onChanged: (value) {
                                  setState(() {
                                    _roleFilter = value != null && value.isNotEmpty ? value : null;
                                  });
                                },
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    // DataTable section
                    Expanded(
                      child: LayoutBuilder(
                        builder: (context, constraints) {
                          return SingleChildScrollView(
                              scrollDirection: Axis.horizontal,
                              child: ConstrainedBox(
                                constraints: BoxConstraints(minWidth: constraints.maxWidth),
                                child: DataTable(
                                  columnSpacing: 24,
                                  dataRowMinHeight: 56,
                                  dataRowMaxHeight: 56,
                                  columns: const [
                                    DataColumn(label: Text('S/N')),
                                    DataColumn(label: Text('Name')),
                                    DataColumn(label: Text('Email')),
                                    DataColumn(label: Text('Phone Number')),
                                    DataColumn(label: Text('Role')),
                                    DataColumn(label: Text('Date Created')),
                                    DataColumn(label: Text('Action')),
                                  ],
                          rows: List.generate(users.length, (index) {
                            final userDoc = users[index];
                            final userData = userDoc.data() as Map<String, dynamic>;
                            final firstName = (userData['firstName'] ?? '').toString();
                            final lastName = (userData['lastName'] ?? '').toString();
                            final email = (userData['email'] ?? '').toString();
                            final phone = (userData['phoneNumber'] ?? '').toString();
                            final role = (userData['role'] ?? 'user').toString();
                            final createdAtRaw = userData['createdAt'];
                            final userId = userDoc.id;
                            DateTime? createdDate;
                            if (createdAtRaw != null && createdAtRaw is String && createdAtRaw.isNotEmpty) {
                              try {
                                createdDate = DateTime.parse(createdAtRaw);
                              } catch (_) {}
                            }
                            return DataRow(cells: [
                              DataCell(Text((index + 1).toString())),
                              DataCell(Text('$firstName $lastName')),
                              DataCell(Text(email)),
                              DataCell(Text(phone)),
                              DataCell(
                                Chip(
                                  label: Text(role),
                                  backgroundColor: role == 'superAdmin'
                                      ? Colors.red[300]
                                      : role == 'admin'
                                          ? Colors.orange[300]
                                          : role == 'contributor'
                                              ? Colors.green[300]
                                              : Colors.grey[300],
                                ),
                              ),
                              DataCell(Text(createdDate != null ? '${createdDate.day}/${createdDate.month}/${createdDate.year}' : 'N/A')),
                              DataCell(
                                PopupMenuButton<String>(
                                  onSelected: (value) {
                                    if (value == 'edit') {
                                      _showEditDialog(context, userId, userData);
                                    } else if (value == 'delete') {
                                      _showDeleteDialog(context, userId, userData);
                                    }
                                  },
                                  itemBuilder: (context) => [
                                    const PopupMenuItem(
                                      value: 'edit',
                                      child: Text('Edit'),
                                    ),
                                    const PopupMenuItem(
                                      value: 'delete',
                                      child: Text('Delete'),
                                    ),
                                  ],
                                  child: const Icon(Icons.more_vert),
                                ),
                              ),
                            ]);
                          }),
                        ),
                      ),
                    )  ;
              }
                      )
                    ),
                  ]
                );
                },),
          ),
        ],
      ),
       );
       }

  void _showEditDialog(
      BuildContext context, String userId, Map<String, dynamic> userData) {
    final firstNameController =
        TextEditingController(text: userData['firstName'] as String? ?? '');
    final lastNameController =
        TextEditingController(text: userData['lastName'] as String? ?? '');
    final phoneController =
        TextEditingController(text: userData['phoneNumber'] as String? ?? '');
    String selectedRole = userData['role'] as String? ?? 'user';

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit User'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: firstNameController,
                decoration: const InputDecoration(
                  labelText: 'First Name',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: lastNameController,
                decoration: const InputDecoration(
                  labelText: 'Last Name',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: phoneController,
                decoration: const InputDecoration(
                  labelText: 'Phone',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                readOnly: true,
                decoration: InputDecoration(
                  labelText: 'Email',
                  hintText: userData['email'] as String? ?? 'N/A',
                  border: const OutlineInputBorder(),
                  enabled: false,
                ),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: selectedRole,
                decoration: const InputDecoration(
                  labelText: 'Role',
                  border: OutlineInputBorder(),
                ),
                items: UserRole.values.map((role) {
                  return DropdownMenuItem(
                    value: role.name,
                    child: Text(role.displayName),
                  );
                }).toList(),
                onChanged: (value) {
                  selectedRole = value ?? 'user';
                },
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              try {
                // Update user in Firestore
                await _firestore.collection('users').doc(userId).update({
                  'firstName': firstNameController.text,
                  'lastName': lastNameController.text,
                  'phoneNumber': phoneController.text,
                  'role': selectedRole,
                  'updatedAt': DateTime.now().toIso8601String(),
                  'updatedBy': _auth.currentUser?.uid,
                });

                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('User updated successfully'),
                      duration: Duration(seconds: 2),
                    ),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Error updating user: $e'),
                      duration: const Duration(seconds: 2),
                    ),
                  );
                }
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }
}
