# Development Quick Reference

## Common Tasks

### Adding a New Feature

1. **Create the feature directory structure:**
```bash
lib/features/YOUR_FEATURE/
├── presentation/
│   ├── YOUR_FEATURE_screen.dart
│   └── widgets/
├── domain/
│   └── (entities, repositories, usecases)
└── data/
    └── (models, datasources, repositories)
```

2. **Create the screen:**
```dart
import 'package:flutter/material.dart';

class YourFeatureScreen extends StatelessWidget {
  const YourFeatureScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Your Feature')),
      body: const Center(child: Text('Your content here')),
    );
  }
}
```

3. **Add route to AppRouter:**
```dart
// In lib/navigation/app_router.dart
case '/your-feature':
  return MaterialPageRoute(builder: (_) => const YourFeatureScreen());
```

### Adding State Management (Provider)

1. **Create your provider:**
```dart
import 'package:flutter/foundation.dart';

class YourProvider extends ChangeNotifier {
  String? _data;
  
  String? get data => _data;
  
  void updateData(String newData) {
    _data = newData;
    notifyListeners();
  }
}
```

2. **Add to MultiProvider in main.dart:**
```dart
MultiProvider(
  providers: [
    ChangeNotifierProvider(create: (_) => YourProvider()),
  ],
  child: const CompanionApp(),
)
```

3. **Use in widgets:**
```dart
// Read only
final data = context.read<YourProvider>().data;

// Watch for changes
Consumer<YourProvider>(
  builder: (context, provider, child) {
    return Text(provider.data ?? 'No data');
  },
)
```

### Working with Responsive Design

```dart
// Mobile/Web layout detection
final isMobileLayout = MediaQuery.of(context).size.width < 600;

// Or use PlatformDetector
if (PlatformDetector.isWeb) {
  // Web-specific code
} else {
  // Mobile-specific code
}
```

### Creating Custom Widgets

Place reusable widgets in `lib/core/widgets/`:

```dart
// lib/core/widgets/custom_button.dart
import 'package:flutter/material.dart';

class CustomButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;

  const CustomButton({
    required this.label,
    required this.onPressed,
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.blue[700],
        padding: const EdgeInsets.symmetric(vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
    );
  }
}
```

### Adding Firebase Features

**Authentication Example:**
```dart
import 'package:firebase_auth/firebase_auth.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  
  Future<UserCredential?> loginWithEmail(String email, String password) async {
    try {
      return await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
    } catch (e) {
      print('Login error: $e');
      return null;
    }
  }
  
  Future<void> logout() async {
    await _auth.signOut();
  }
}
```

**Firestore Example:**
```dart
import 'package:cloud_firestore/cloud_firestore.dart';

class FirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  
  Future<void> saveUser(String userId, Map<String, dynamic> data) async {
    await _firestore.collection('users').doc(userId).set(data);
  }
  
  Future<DocumentSnapshot> getUser(String userId) async {
    return await _firestore.collection('users').doc(userId).get();
  }
}
```

### Navigation Examples

```dart
// Simple navigation
Navigator.pushNamed(context, AppRouter.homeRoute);

// With arguments
Navigator.pushNamed(context, AppRouter.homeRoute, arguments: {'userId': '123'});

// Replace current screen (good for splash → home)
Navigator.pushReplacementNamed(context, AppRouter.homeRoute);

// Pop to previous screen
Navigator.pop(context);

// Pop and return data
Navigator.pop(context, 'return_value');
```

### Debugging Tips

1. **Check platform detection:**
```dart
print('Platform: ${PlatformDetector.platformName}');
print('Is Web: ${PlatformDetector.isWeb}');
```

2. **View route transitions:**
Enable debug mode in MaterialApp - already enabled in app.dart

3. **Check provider state:**
```dart
Future.delayed(Duration(seconds: 1), () {
  print(context.read<YourProvider>().data);
});
```

## Common Dependencies

These are already available in pubspec.yaml:
- `firebase_core` - Firebase initialization
- `firebase_auth` - Authentication
- `cloud_firestore` - Realtime database
- `firebase_storage` - Cloud storage
- `provider` - State management
- `firebase_analytics` - Analytics

## Testing

```bash
# Run tests
flutter test

# Run with coverage
flutter test --coverage

# Run specific test file
flutter test test/widget_test.dart
```

## Build Commands

```bash
# Release build
flutter build apk          # Android
flutter build ios          # iOS
flutter build web          # Web

# Profile/Debug builds
flutter run --release
flutter run --profile
flutter run --debug
```
