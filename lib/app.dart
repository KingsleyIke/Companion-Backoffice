import 'package:flutter/material.dart';
import 'package:companion/navigation/app_router.dart';

class CompanionApp extends StatelessWidget {
  const CompanionApp({Key? key}) : super(key: key);

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
      // Use light theme only for now
      themeMode: ThemeMode.light,
      initialRoute: AppRouter.getInitialRoute(),
      onGenerateRoute: AppRouter.generateRoute,
      onUnknownRoute: AppRouter.unknownRoute,
      debugShowCheckedModeBanner: false,
    );
  }
}
