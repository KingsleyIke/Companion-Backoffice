import 'package:companion/models/user_dto.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../services/navigation_service.dart';
import '../../services/user_service.dart';


class AppDrawer extends StatelessWidget {
  final UserDto userData;

const AppDrawer({Key? key, required this.userData}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 250,
      color: Colors.blue,
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          // Drawer Header
          Container(
            height: 250.0,
            child: DrawerHeader(
              decoration: BoxDecoration(
                color: Colors.blue.shade700,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Row(
                    children: [
                      Image.asset(
                        'assets/images/app_icon_no_bg.png',
                        width: 60,
                      ),
                      SizedBox(width: 8.0),
                      Text(
                        'MyCompanion',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      )
                    ],
                  ),
                  CircleAvatar(
                    radius: 30,
                    backgroundImage: AssetImage('assets/images/app_icon.png'),
                  ),
                  SizedBox(height: 10),
                  Text(
                    '${userData.firstName} ${userData.lastName}',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                    ),
                  ),
                  Text(
                    '${userData.email}',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Drawer Items with Navigation
          _buildDrawerItem(context, Icons.home, "Parishes", "/parishes"),
          _buildDrawerItem(context, Icons.person, "Users", "/users"),
          _buildDrawerItem(context, Icons.settings, "Create User", "/createUser"),
          _buildDrawerItem(context, Icons.settings, "Add Parish", "/addParish"),
          _buildDrawerItem(context, Icons.settings, "Add Readings", "/addReadings"),
          _buildDrawerItem(context, Icons.settings, "Edit Readings", "/editReadings"),
          Divider(color: Colors.white70),
          _buildDrawerItem(context, Icons.logout, "Logout", "/logout", logout: true),
        ],
      ),
    );
  }

  Widget _buildDrawerItem(BuildContext context, IconData icon, String title, String route, {bool logout = false}) {
    return ListTile(
      leading: Icon(icon, color: Colors.white),
      title: Text(title, style: TextStyle(color: Colors.white)),
      onTap: () {
        if (logout) {
          _handleLogout(context); // Call the logout function
        } else {
          final navigationService = Provider.of<NavigationService>(context, listen: false);
          navigationService.navigateTo(route);
        }
      },
    );
  }

  void _handleLogout(BuildContext context) {
    // Show confirmation dialog before logging out
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text("Logout"),
        content: Text("Are you sure you want to log out?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context), // Close the dialog
            child: Text("Cancel"),
          ),
          TextButton(
            onPressed: () {
              // Perform logout logic (clear user session, etc.)
              Navigator.pushReplacementNamed(context, "/");
              _performLogout();

              // Navigate to the login page and remove all previous routes
              Navigator.pushNamedAndRemoveUntil(context, "/login", (route) => false);
            },
            child: Text("Logout"),
          ),
        ],
      ),
    );
  }
}

void _performLogout() {
  final userService = UserService();
  userService.logout();

}
