import 'package:companion/providers/approvals_provider.dart';
import 'package:companion/providers/auth_provider.dart';
import 'package:companion/providers/parish_provider.dart';
import 'package:companion/providers/readings_provider.dart';
import 'package:companion/providers/users_provider.dart';
import 'package:companion/router/app_router.dart';
import 'package:companion/theme/app_theme.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

    // Initialize Firebase
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  runApp(const CatholicCompanionBackOffice());
}

class CatholicCompanionBackOffice extends StatelessWidget {
  const CatholicCompanionBackOffice({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ParishProvider()),
        ChangeNotifierProvider(create: (_) => ReadingsProvider()),
        ChangeNotifierProvider(create: (_) => UsersProvider()),
        ChangeNotifierProvider(create: (_) => ApprovalsProvider()),
      ],
      child: Builder(
        builder: (context) {
          final authProvider = context.watch<AuthProvider>();
          return MaterialApp.router(
            title: 'CC Back Office',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            routerConfig: AppRouter.router(authProvider),
          );
        },
      ),
    );
  }
}
