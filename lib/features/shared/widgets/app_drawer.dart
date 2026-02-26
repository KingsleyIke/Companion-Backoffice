import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:companion/features/auth/presentation/providers/auth_provider.dart';
import 'package:companion/navigation/app_router.dart';
import 'package:companion/constants/user_roles.dart';

/// Reusable sidebar drawer for authenticated users
class AppDrawer extends StatelessWidget {
  const AppDrawer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        final userName = authProvider.currentUser?.firstName ?? 'User';
        final isAdmin = authProvider.currentUser?.role == UserRole.admin ||
            authProvider.currentUser?.role == UserRole.superAdmin;

        return Container(
          width: 250,
          color: Colors.grey[900],
          child: Column(
            children: [
              // User Info Section
              Container(
                padding: const EdgeInsets.all(16),
                color: Colors.blue[700],
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CircleAvatar(
                      radius: 40,
                      backgroundColor: Colors.blue[600],
                      child: Text(
                        (authProvider.currentUser?.firstName ?? 'U')[0]
                            .toUpperCase(),
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      '$userName ${authProvider.currentUser?.lastName ?? ""}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      authProvider.currentUser?.email ?? '',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              // Navigation Items
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(8),
                  children: [
                    // Dashboard Item
                    ListTile(
                      leading: const Icon(Icons.dashboard, color: Colors.white70),
                      title: const Text(
                        'Dashboard',
                        style: TextStyle(color: Colors.white),
                      ),
                      onTap: () {
                        Navigator.of(context)
                            .pushReplacementNamed(AppRouter.homeRoute);
                      },
                      hoverColor: Colors.blue[700],
                    ),
                    // Users Item (Admin Only)
                    if (isAdmin)
                      ExpansionTile(
                        leading:
                            const Icon(Icons.people, color: Colors.white70),
                        title: const Text(
                          'Users',
                          style: TextStyle(color: Colors.white),
                        ),
                        collapsedBackgroundColor: Colors.transparent,
                        backgroundColor: Colors.transparent,
                        textColor: Colors.white,
                        iconColor: Colors.white70,
                        collapsedIconColor: Colors.white70,
                        children: [
                          Padding(
                            padding: const EdgeInsets.only(left: 16.0),
                            child: ListTile(
                              leading: const Icon(Icons.person_add,
                                  color: Colors.white70, size: 20),
                              title: const Text(
                                'Create New User',
                                style: TextStyle(color: Colors.white),
                              ),
                              onTap: () {
                                Navigator.of(context)
                                    .pushNamed(AppRouter.createAccountRoute);
                              },
                              hoverColor: Colors.blue[700],
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.only(left: 16.0),
                            child: ListTile(
                              leading: const Icon(Icons.list,
                                  color: Colors.white70, size: 20),
                              title: const Text(
                                'All Users',
                                style: TextStyle(color: Colors.white),
                              ),
                              onTap: () {
                                Navigator.of(context)
                                    .pushNamed(AppRouter.allUsersRoute);
                              },
                              hoverColor: Colors.blue[700],
                            ),
                          ),
                        ],
                      ),
                    
                    // Readings ExpansionTile
                    ExpansionTile(
                      leading: const Icon(Icons.library_books, color: Colors.white70),
                      title: const Text(
                        'Readings',
                        style: TextStyle(color: Colors.white),
                      ),
                      collapsedBackgroundColor: Colors.transparent,
                      backgroundColor: Colors.transparent,
                      textColor: Colors.white,
                      iconColor: Colors.white70,
                      collapsedIconColor: Colors.white70,
                      children: [
                        Padding(
                          padding: const EdgeInsets.only(left: 16.0),
                          child: ListTile(
                            leading: const Icon(Icons.add, color: Colors.white70, size: 20),
                            title: const Text(
                              'Add Reading',
                              style: TextStyle(color: Colors.white),
                            ),
                            onTap: () {
                              Navigator.of(context).pushNamed('/add-reading');
                            },
                            hoverColor: Colors.blue[700],
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(left: 16.0),
                          child: ListTile(
                            leading: const Icon(Icons.list, color: Colors.white70, size: 20),
                            title: const Text(
                              'View Readings',
                              style: TextStyle(color: Colors.white),
                            ),
                            onTap: () {
                              // TODO: Implement navigation to View Readings page
                              // Navigator.of(context).pushNamed(AppRouter.viewReadingsRoute);
                            },
                            hoverColor: Colors.blue[700],
                          ),
                        ),
                      ],
                    ),
                    // Parishes Item
                    ListTile(
                      leading:
                          const Icon(Icons.location_city, color: Colors.white70),
                      title: const Text(
                        'Parishes',
                        style: TextStyle(color: Colors.white),
                      ),
                      onTap: () {},
                      hoverColor: Colors.blue[700],
                    ),
                    // Prayers Item
                    ListTile(
                      leading: const Icon(Icons.favorite, color: Colors.white70),
                      title: const Text(
                        'Prayers',
                        style: TextStyle(color: Colors.white),
                      ),
                      onTap: () {},
                      hoverColor: Colors.blue[700],
                    ),
                    // Approvals Item
                    ListTile(
                      leading: const Icon(Icons.check_circle,
                          color: Colors.white70),
                      title: const Text(
                        'Approvals',
                        style: TextStyle(color: Colors.white),
                      ),
                      onTap: () {},
                      hoverColor: Colors.blue[700],
                    ),
                    // Settings Item
                    ListTile(
                      leading: const Icon(Icons.settings, color: Colors.white70),
                      title: const Text(
                        'Settings',
                        style: TextStyle(color: Colors.white),
                      ),
                      onTap: () {},
                      hoverColor: Colors.blue[700],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
