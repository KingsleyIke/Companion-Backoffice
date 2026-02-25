# Firebase Authentication Integration

## Overview
Complete Firebase authentication system has been implemented with proper Clean Architecture following domain/data/presentation layers.

## Architecture

### Domain Layer
- **Entities**:
  - `UserEntity` - Core user domain model
  - `AuthResult` - Result wrapper for auth operations
  
- **Repositories** (Abstract):
  - `AuthRepository` - Interface defining all auth operations

### Data Layer
- **Datasources**:
  - `FirebaseAuthDatasource` - Handles all Firebase Auth & Firestore operations

- **Models**:
  - `UserModel` - Data model with JSON serialization for Firestore

- **Repositories** (Implementation):
  - `AuthRepositoryImpl` - Implements AuthRepository using Firebase

### Service Layer
- `AuthService` - Singleton service providing access to repositories

### Presentation Layer
- **Providers**:
  - `AuthProvider` - State management using Provider pattern
  
- **Screens**:
  - `LoginScreen` - Web entry point
  - `SignUpScreen` - Account creation
  - `ForgotPasswordScreen` - Password reset
  - `SplashScreen` - Mobile entry point
  - `HomeScreen` - Post-authentication

## Features Implemented

### 1. Sign Up / Registration
```dart
final authProvider = context.read<AuthProvider>();
final success = await authProvider.signUp(
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'password123',
  phoneNumber: '+1234567890', // Optional
);
```

**What happens:**
- Creates Firebase Auth user with email/password
- Saves user profile to Firestore with:
  - First Name (required)
  - Last Name (required)
  - Email (required)
  - Phone Number (optional)
  - **Default Role: Super Admin** ✓
  - Created/Updated timestamps

### 2. Sign In / Login
```dart
final success = await authProvider.signIn(
  email: 'john@example.com',
  password: 'password123',
);
```

**What happens:**
- Authenticates with Firebase Auth
- Fetches user data from Firestore
- Sets `isAuthenticated` = true
- Navigates to Home screen

### 3. Password Reset
```dart
// Step 1: Send reset email
final success = await authProvider.sendPasswordReset(
  email: 'john@example.com',
);

// Step 2: User receives email with reset link
// Step 3: User clicks link and follows Firebase's password reset flow
```

**What happens:**
- Firebase sends password reset email
- User clicks link in email
- Firebase handles password reset confirmation
- User can log in with new password

### 4. Sign Out
```dart
await authProvider.signOut();
```

**What happens:**
- Signs out from Firebase Auth
- Clears user data
- Navigates to login screen

## Error Handling

All Firebase Auth errors are caught and converted to user-friendly messages:

| Error Code | Message |
|-----------|---------|
| weak-password | The password provided is too weak |
| email-already-in-use | An account with this email already exists |
| invalid-email | The email address is not valid |
| user-disabled | The user account has been disabled |
| user-not-found | No user account found with this email |
| wrong-password | The password is incorrect |
| too-many-requests | Too many login attempts. Please try again later |
| invalid-credential | Invalid email or password |

## State Management

### AuthProvider Properties
- `currentUser` - Currently logged-in user entity
- `isAuthenticated` - Boolean flag for auth state
- `isLoading` - Loading state during operations
- `errorMessage` - Last error message

### Usage in Widgets
```dart
// Read-only access
final user = context.read<AuthProvider>().currentUser;

// Listen and rebuild
Consumer<AuthProvider>(
  builder: (context, authProvider, _) {
    if (authProvider.isLoading) return LoadingWidget();
    return Text(authProvider.currentUser?.fullName ?? 'Guest');
  },
)
```

## Firestore Database Structure

### Users Collection
```
users/
  {userId}/
    {
      firstName: string (required)
      lastName: string (required)
      email: string (required)
      phoneNumber: string (optional)
      role: string (default: "superAdmin")
      createdAt: timestamp
      updatedAt: timestamp
    }
```

## User Roles
Defined in `lib/constants/user_roles.dart`:
- `SuperAdmin` - Default role on signup
- `Admin` - Administrative access
- `Contributor` - Content creation access
- `User` - Basic user access

Role can be changed later via:
```dart
// TODO: Add role management features
```

## Navigation

All auth screens properly route through AppRouter:

| Route | Screen | Access |
|-------|--------|--------|
| `/splash` | SplashScreen | Mobile only |
| `/login` | LoginScreen | Web entry point |
| `/signup` | SignUpScreen | Create account |
| `/forgot-password` | ForgotPasswordScreen | Reset password |
| `/home` | HomeScreen | After authentication |

## Platform-Specific Entry Points

- **Web**: Starts at `/login` screen
- **Mobile**: Starts at `/splash` screen, then navigates based on auth state

## File Structure
```
lib/
├── core/
│   ├── services/
│   │   └── auth_service.dart
│   └── utils/
│       └── platform_detector.dart
├── features/
│   └── auth/
│       ├── domain/
│       │   ├── entities/
│       │   │   ├── user_entity.dart
│       │   │   └── auth_result.dart
│       │   └── repositories/
│       │       └── auth_repository.dart
│       ├── data/
│       │   ├── datasources/
│       │   │   └── firebase_auth_datasource.dart
│       │   ├── models/
│       │   │   └── user_model.dart
│       │   └── repositories/
│       │       └── auth_repository_impl.dart
│       └── presentation/
│           ├── providers/
│           │   └── auth_provider.dart
│           ├── login_screen.dart
│           ├── signup_screen.dart
│           └── forgot_password_screen.dart
└── navigation/
    └── app_router.dart
```

## Testing the Features

### 1. Test Sign Up
1. Go to login screen (web) or splash → login
2. Click "Create one"
3. Fill in all required fields
4. Sign up - user created with Super Admin role
5. Automatically navigated to home
6. Check Firestore: `users/{userId}` should contain user data

### 2. Test Sign In
1. Go to login screen
2. Enter registered email and password
3. Sign in successful - navigated to home
4. Check AuthProvider state - user data populated

### 3. Test Forgot Password
1. On login screen, click "Forgot Password?"
2. Enter email address
3. Firebase sends reset email
4. User clicks link in email
5. Firebase's reset flow completes
6. User logs in with new password

### 4. Test Error Handling
- Try signing up with existing email
- Try signing in with wrong password
- Try weak password
- Check error messages display properly

## Future Enhancements

- [ ] Add email verification
- [ ] Add phone number verification
- [ ] Add role-based access control (RBAC) middleware
- [ ] Add user profile editing
- [ ] Add account deactivation
- [ ] Add login with Google/Apple
- [ ] Add two-factor authentication (2FA)
- [ ] Add session management
- [ ] Add refresh token handling
- [ ] Add analytics tracking for auth events

## Important Notes

✅ **Completed:**
- Firebase Auth integration
- Firestore user data persistence
- Clean Architecture implementation
- Error handling and user feedback
- Platform-specific entry points
- Provider-based state management
- Password reset functionality

⚠️ **To Configure:**
1. Ensure Firebase is properly initialized in `google-services.json` (Android)
2. Ensure Firebase is properly initialized in `GoogleService-Info.plist` (iOS)
3. Enable Email/Password authentication in Firebase Console
4. Set up Firestore security rules for user access
5. Configure password reset email template in Firebase Console

## Example Usage

```dart
// In any widget
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        if (authProvider.isLoading) {
          return Center(child: CircularProgressIndicator());
        }
        
        if (!authProvider.isAuthenticated) {
          return Text('Please log in');
        }
        
        return Column(
          children: [
            Text('Welcome, ${authProvider.currentUser?.fullName}'),
            Text('Email: ${authProvider.currentUser?.email}'),
            Text('Role: ${authProvider.currentUser?.role.displayName}'),
            ElevatedButton(
              onPressed: () => authProvider.signOut(),
              child: Text('Logout'),
            ),
          ],
        );
      },
    );
  }
}
```
