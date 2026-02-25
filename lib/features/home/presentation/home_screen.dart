import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:companion/features/auth/presentation/providers/auth_provider.dart';
import 'package:companion/navigation/app_router.dart';
import 'package:companion/constants/user_roles.dart';

/// Home screen displayed after successful authentication
class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        final isAdmin = authProvider.currentUser?.role == UserRole.admin ||
            authProvider.currentUser?.role == UserRole.superAdmin;
        
        // If not admin, show unauthorized page
        if (!isAdmin) {
          return Scaffold(
            appBar: AppBar(
              title: const Text('Companion'),
              backgroundColor: Colors.blue[700],
              elevation: 0,
            ),
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.lock,
                    size: 80,
                    color: Colors.red[700],
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'Access Denied',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.red[700],
                        ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Only administrators can access this page.',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: Colors.grey[600],
                        ),
                  ),
                  const SizedBox(height: 30),
                  ElevatedButton.icon(
                    onPressed: () async {
                      await authProvider.signOut();
                      if (context.mounted) {
                        Navigator.of(context)
                            .pushReplacementNamed(AppRouter.loginRoute);
                      }
                    },
                    icon: const Icon(Icons.logout),
                    label: const Text('Logout'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue[700],
                      padding: const EdgeInsets.symmetric(
                        horizontal: 32,
                        vertical: 16,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        }
        
        final userName = authProvider.currentUser?.firstName ?? 'User';

        return Scaffold(
          appBar: AppBar(
            title: Text('Welcome, $userName!'),
            backgroundColor: Colors.blue[700],
            elevation: 0,
            automaticallyImplyLeading: false,
            actions: [
              // Profile Icon
              IconButton(
                icon: const Icon(Icons.person),
                onPressed: () {
                  _showProfileDialog(context, authProvider);
                },
                tooltip: 'Profile',
              ),
              // Logout Icon
              IconButton(
                icon: const Icon(Icons.logout),
                onPressed: () {
                  _showLogoutDialog(context, authProvider);
                },
                tooltip: 'Logout',
              ),
              const SizedBox(width: 8),
            ],
          ),
          body: Row(
            children: [
              // Left Sidebar Drawer
              Container(
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
                            onTap: () {},
                            hoverColor: Colors.blue[700],
                          ),
                          // Users Item (Admin Only)
                          if (isAdmin)
                            ListTile(
                              leading: const Icon(Icons.people, color: Colors.white70),
                              title: const Text(
                                'Users',
                                style: TextStyle(color: Colors.white),
                              ),
                              onTap: () {
                                Navigator.of(context)
                                    .pushNamed(AppRouter.createAccountRoute);
                              },
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
                          // const Divider(color: Colors.white24, height: 24),
                          // Readings Item
                          ListTile(
                            leading: const Icon(Icons.library_books, color: Colors.white70),
                            title: const Text(
                              'Readings',
                              style: TextStyle(color: Colors.white),
                            ),
                            onTap: () {},
                            hoverColor: Colors.blue[700],
                          ),
                          // Parishes Item
                          ListTile(
                            leading: const Icon(Icons.location_city, color: Colors.white70),
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
                            leading: const Icon(Icons.check_circle, color: Colors.white70),
                            title: const Text(
                              'Approvals',
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
              ),
              // Main Content Area
              Expanded(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.home,
                        size: 80,
                        color: Colors.blue[700],
                      ),
                      const SizedBox(height: 20),
                      Text(
                        '$userName, Welcome to Your Dashboard!',
                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Colors.blue[700],
                            ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'Role: ${authProvider.currentUser?.role.displayName ?? "Unknown"}',
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              color: Colors.grey[600],
                            ),
                      ),
                      const SizedBox(height: 30),
                      // Create Account Button - Only for Admins
                      if (isAdmin)
                        ElevatedButton.icon(
                          onPressed: () {
                            Navigator.of(context)
                                .pushNamed(AppRouter.createAccountRoute);
                          },
                          icon: const Icon(Icons.person_add),
                          label: const Text('Create New Account'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green[600],
                            padding: const EdgeInsets.symmetric(
                              horizontal: 32,
                              vertical: 16,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showLogoutDialog(BuildContext context, AuthProvider authProvider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              await authProvider.signOut();
              if (context.mounted) {
                Navigator.of(context)
                    .pushReplacementNamed(AppRouter.loginRoute);
              }
            },
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }

  void _showProfileDialog(BuildContext context, AuthProvider authProvider) {
    final firstNameController = TextEditingController(
      text: authProvider.currentUser?.firstName ?? '',
    );
    final lastNameController = TextEditingController(
      text: authProvider.currentUser?.lastName ?? '',
    );
    final phoneController = TextEditingController(
      text: authProvider.currentUser?.phoneNumber ?? '',
    );

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('User Profile'),
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
                  hintText: authProvider.currentUser?.email ?? 'N/A',
                  border: const OutlineInputBorder(),
                  enabled: false,
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                readOnly: true,
                decoration: InputDecoration(
                  labelText: 'Role',
                  hintText: authProvider.currentUser?.role.displayName ?? 'N/A',
                  border: const OutlineInputBorder(),
                  enabled: false,
                ),
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
            onPressed: () {
              // TODO: Save profile changes (would need to add a method to authProvider)
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Profile update feature coming soon'),
                  duration: Duration(seconds: 2),
                ),
              );
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }
}
