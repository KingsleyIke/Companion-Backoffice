import 'package:flutter/material.dart';
import '../widgets/mobile_drawer.dart';
import '../widgets/home_card.dart';

class MobileHomePage extends StatelessWidget {
  const MobileHomePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Home'),
      ),
      drawer: const MobileDrawer(),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: GridView.count(
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          children: const [
            HomeCard(
              title: 'Readings',
              icon: Icons.book,
              route: '/view-readings',
            ),
            HomeCard(
              title: 'Parishes',
              icon: Icons.church,
              route: '/view-parishes',
            ),
            HomeCard(
              title: 'Events',
              icon: Icons.event,
              route: '/events',
            ),
            HomeCard(
              title: 'Profile',
              icon: Icons.person,
              route: '/profile',
            ),
            HomeCard(
              title: 'Settings',
              icon: Icons.settings,
              route: '/settings',
            ),
          ],
        ),
      ),
    );
  }
}
