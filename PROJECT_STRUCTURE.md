# Project Structure Documentation

## Overview
The Companion project is a cross-platform Flutter application with platform-specific entry points:
- **Web**: Displays login screen on startup
- **Mobile (iOS/Android)**: Displays splash screen on startup

## Folder Structure

```
lib/
├── main.dart                 # Application entry point with Firebase setup
├── app.dart                  # AppWidget configuration
│
├── config/                   # Configuration and setup
│   └── (Future: Firebase config, app settings)
│
├── constants/                # Constants and enums
│   └── (Future: App constants, error codes)
│
├── core/                     # Core utilities and services
│   ├── services/             # Business logic services
│   │   └── (Future: Auth service, API clients, storage)
│   ├── utils/                # Utility functions
│   │   └── platform_detector.dart  # Platform detection utility
│   └── widgets/              # Reusable UI widgets
│       └── (Future: Custom widgets, common components)
│
├── features/                 # Feature-specific code (Clean Architecture)
│   ├── auth/                 # Authentication feature
│   │   ├── presentation/
│   │   │   └── login_screen.dart
│   │   ├── domain/           # (Future: Use cases, entities)
│   │   └── data/             # (Future: Repositories, models)
│   │
│   ├── splash/               # Splash screen feature (mobile only)
│   │   ├── presentation/
│   │   │   └── splash_screen.dart
│   │   ├── domain/           # (Future: Splash logic)
│   │   └── data/             # (Future: Splash repository)
│   │
│   └── home/                 # Home screen feature
│       ├── presentation/
│       │   └── home_screen.dart
│       ├── domain/           # (Future: Home use cases)
│       └── data/             # (Future: Home data)
│
└── navigation/               # Routing and navigation
    └── app_router.dart       # Route definitions and generation
```

## Platform Detection

The `PlatformDetector` utility is used to determine the current platform:

```dart
import 'package:companion/core/utils/platform_detector.dart';

// Static methods available:
PlatformDetector.isWeb       // true if running on web
PlatformDetector.isMobile    // true if running on mobile
PlatformDetector.isIOS       // true if running on iOS
PlatformDetector.isAndroid   // true if running on Android
PlatformDetector.platformName // String: 'web', 'android', 'ios', etc.
```

## Navigation

The `AppRouter` handles all route navigation:

### Available Routes
- `AppRouter.splashRoute` - `/splash` (Mobile only)
- `AppRouter.loginRoute` - `/login` (Web default)
- `AppRouter.homeRoute` - `/home` (Post-auth)

### Usage
```dart
// Navigation example
Navigator.of(context).pushNamed(AppRouter.homeRoute);
Navigator.of(context).pushReplacementNamed(AppRouter.loginRoute);
```

## Adding New Features

### 1. Create Feature Structure
```
features/your_feature/
├── presentation/
│   ├── pages/
│   ├── widgets/
│   └── controllers/ (if using GetX) or blocs/
├── domain/
│   ├── entities/
│   ├── repositories/
│   └── usecases/
└── data/
    ├── datasources/
    ├── models/
    └── repositories/
```

### 2. Add to AppRouter
```dart
// In lib/navigation/app_router.dart
case yourFeatureRoute:
  return MaterialPageRoute(builder: (_) => const YourFeatureScreen());
```

### 3. Add StateManagement
- Add provider to `main.dart` in the `MultiProvider` list
- Example: `ChangeNotifierProvider(create: (_) => YourProvider())`

## State Management Setup

The project is configured with `Provider` for state management. To add a new provider:

1. Create your provider class in the appropriate feature folder
2. Add it to the `MultiProvider` list in `main.dart`:
   ```dart
   MultiProvider(
     providers: [
       ChangeNotifierProvider(create: (_) => YourProvider()),
     ],
     child: const CompanionApp(),
   )
   ```

## Firebase Integration

Firebase is already initialized in `main.dart`. Available packages:
- `firebase_core` - Core functionality
- `firebase_auth` - Authentication
- `cloud_firestore` - Database
- `firebase_storage` - File storage
- `firebase_analytics` - Analytics

## Next Steps

### Phase 1: Core Auth
- [ ] Implement Firebase Authentication
- [ ] Create signup screen
- [ ] Add password reset flow
- [ ] Implement session management

### Phase 2: Data & Services
- [ ] Create Firestore repositories
- [ ] Implement data models
- [ ] Set up API clients if needed
- [ ] Create business logic services

### Phase 3: UI/UX Polish
- [ ] Create reusable widgets in `core/widgets`
- [ ] Implement theme customization
- [ ] Add animations and transitions
- [ ] Create error handling screens

### Phase 4: Features
- [ ] Add more feature modules
- [ ] Implement offline support
- [ ] Add push notifications
- [ ] Create user profiles

## Important Notes

- ✅ Platform detection is automatic and handled in `AppRouter.getInitialRoute()`
- ✅ Firebase initialization happens before the app launches
- ✅ Provider state management is ready to use
- ⚠️ TODO markers indicate features that need implementation
- 📝 All screens support responsive design with breakpoints

## Running the App

```bash
# Run on mobile (iOS)
flutter run -d iphone

# Run on mobile (Android)
flutter run -d android

# Run on web
flutter run -d chrome
```

## File Structure Best Practices

1. **Keep files small** - Aim for <300 lines per file
2. **Use meaningful names** - File and class names should be descriptive
3. **Organize by feature** - Group related code together
4. **Separate concerns** - Keep UI, business logic, and data separate
5. **Use constants** - Avoid magic strings/numbers
