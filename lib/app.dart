import 'package:flutter/material.dart';
import 'package:companion/navigation/app_router.dart';
import 'package:firebase_auth/firebase_auth.dart';

/// Observer to sync browser URL with route changes


class CompanionApp extends StatefulWidget {
  const CompanionApp({Key? key}) : super(key: key);

  @override
  State<CompanionApp> createState() => _CompanionAppState();
}

class _CompanionAppState extends State<CompanionApp> {
  final GlobalKey<NavigatorState> _navigatorKey = GlobalKey<NavigatorState>();



  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Companion',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        appBarTheme: AppBarTheme(
          elevation: 0,
          backgroundColor: Colors.blue[700],
        ),
      ),
      darkTheme: ThemeData.dark(useMaterial3: true),
      themeMode: ThemeMode.light,
      initialRoute: AppRouter.getInitialRoute(),
      onGenerateRoute: AppRouter.generateRoute,
      onUnknownRoute: AppRouter.unknownRoute,
      navigatorKey: _navigatorKey,
      debugShowCheckedModeBanner: false,
    );
  }
}
