import 'package:companion/pages/back_office/app_drawer.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/user_dto.dart';
import '../../services/navigation_service.dart';
import '../../services/user_service.dart';

class DashboardPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final UserDto userDto = ModalRoute.of(context)!.settings.arguments as UserDto;
    final navigationService = Provider.of<NavigationService>(context, listen: false);

    return Scaffold(
      body: Row(
        children: [
          AppDrawer(),
          // Layout will go here
          Expanded(
            child: Column(
              children: [
                // Row 1: 20% of the screen height
                Container(
                  height: MediaQuery.of(context).size.height * 0.1,
                  padding: EdgeInsets.all(10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Welcome Back, ${userDto.firstName}!!',
                            style: TextStyle(
                                fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            'You can view all pending approvals and make updates here',
                            style: TextStyle(fontSize: 14),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: Icon(Icons.logout),
                        onPressed: () {
                          // Handle logout action
                          _handleLogout(context);
                        },
                      ),
                    ],
                  ),
                ),

                // Row 2: 60% of the screen height
                Container(
                  height: MediaQuery.of(context).size.height * 0.5,
                  child: Row(
                    children: [
                      // First Card takes full width (Expanded ensures it uses available space)
                      Expanded(
                        flex: 3,
                        child: Card(
                          margin: EdgeInsets.all(8),
                          child: Center(
                              child: Text(
                            'All Parishes',
                          )),
                        ),
                      ),
                      // Column with stacked Cards 2 and 3
                      Container(
                        width: MediaQuery.of(context).size.width * 0.35,
                        child: Column(
                          children: [
                            Expanded(
                              child: Card(
                                margin: EdgeInsets.all(8),
                                child: Center(
                                    child:
                                        Text('Approve parish announcements')),
                              ),
                            ),
                            Expanded(
                              child: Card(
                                margin: EdgeInsets.all(8),
                                child: Center(
                                    child:
                                        Text('Approve parish update request')),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Row 3: 40% of the screen height
                Expanded(
                  child: Container(
                    height: MediaQuery.of(context).size.height * 0.4,
                    child: Row(
                      children: [
                        // Column 1
                        Expanded(
                          child: Card(
                            margin: EdgeInsets.all(8),
                            child: Center(child: Text('Approve new parish')),
                          ),
                        ),
                        // Column 2
                        Expanded(
                          child: Column(
                            children: [
                              Expanded(
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Card(
                                        margin: EdgeInsets.all(8),
                                        child: InkWell(
                                          onTap: () {
                                            navigationService.navigateTo("/addParish");
                                          },
                                          child: Center(child: Text('Add Parish')),
                                        )
                                      ),
                                    ),
                                    Expanded(
                                      child: Card(
                                        margin: EdgeInsets.all(8),
                                        child: InkWell (
                                          onTap: () {
                                            navigationService.navigateTo("/parishes/more");
                                          },
                                          child: Center(child: Text('More')),
                                        )
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Expanded(
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Card(
                                        margin: EdgeInsets.all(8),
                                        child:
                                            Center(child: Text('Add Reading')),
                                      ),
                                    ),
                                    Expanded(
                                      child: Card(
                                        margin: EdgeInsets.all(8),
                                        child:
                                            Center(child: Text('Edit Reading')),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Expanded(
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Card(
                                        margin: EdgeInsets.all(8),
                                        child:
                                            Center(child: Text('Add Prayers')),
                                      ),
                                    ),
                                    Expanded(
                                      child: Card(
                                        margin: EdgeInsets.all(8),
                                        child:
                                            Center(child: Text('Edit Prayers')),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        // Column 3
                        Expanded(
                          child: Card(
                            margin: EdgeInsets.all(8),
                            child: Center(child: Text('Approve new parish')),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
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

void _performLogout() {
  final userService = UserService();
  userService.logout();

}
