import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../services/navigation_service.dart';

class DashboardPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final navigationService = Provider.of<NavigationService>(context);

    return Scaffold(
      body: Row(
        children: [
          Container(
            width: 250,
            color: Colors.blue,
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                // Drawer Header
                Container(
                  height: 250.0, // Fixed height for the header
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
                          backgroundImage: AssetImage(
                              'assets/images/app_icon.png'), // Replace with your image asset
                        ),
                        SizedBox(height: 10),
                        Text(
                          'John Doe',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                          ),
                        ),
                        Text(
                          'johndoe@example.com',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Drawer Items
                ListTile(
                  leading: Icon(Icons.home, color: Colors.white),
                  title:
                      Text('Parishes', style: TextStyle(color: Colors.white)),
                  onTap: () {
                    // Handle Home navigation
                  },
                ),
                ListTile(
                  leading: Icon(Icons.person, color: Colors.white),
                  title: Text('Users', style: TextStyle(color: Colors.white)),
                  onTap: () {
                    // Handle Profile navigation
                  },
                ),
                ListTile(
                  leading: Icon(Icons.settings, color: Colors.white),
                  title: Text('Create User',
                      style: TextStyle(color: Colors.white)),
                  onTap: () {
                    // Handle Settings navigation
                  },
                ),
                ListTile(
                  leading: Icon(Icons.settings, color: Colors.white),
                  title:
                      Text('Add Parish', style: TextStyle(color: Colors.white)),
                  onTap: () {
                    // Handle Settings navigation
                  },
                ),
                ListTile(
                  leading: Icon(Icons.settings, color: Colors.white),
                  title: Text('Add Readings',
                      style: TextStyle(color: Colors.white)),
                  onTap: () {
                    // Handle Settings navigation
                  },
                ),
                ListTile(
                  leading: Icon(Icons.settings, color: Colors.white),
                  title: Text('Edit Readings',
                      style: TextStyle(color: Colors.white)),
                  onTap: () {
                    // Handle Settings navigation
                  },
                ),
                Divider(color: Colors.white70),
                ListTile(
                  leading: Icon(Icons.logout, color: Colors.white),
                  title: Text('Logout', style: TextStyle(color: Colors.white)),
                  onTap: () {
                    // Handle Logout
                  },
                ),
              ],
            ),
          ),

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
                            'Welcome Back, John!!',
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
                                        child:
                                            Center(child: Text('Add Parish')),
                                      ),
                                    ),
                                    Expanded(
                                      child: Card(
                                        margin: EdgeInsets.all(8),
                                        child:
                                            Center(child: Text('Edit Parish')),
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
