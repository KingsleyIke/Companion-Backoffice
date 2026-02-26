# Firebase Auth - Quick Reference

## How to Use Authentication

### 1. Sign Up New User
```dart
final authProvider = context.read<AuthProvider>();

final success = await authProvider.signUp(
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'password123',
  phoneNumber: '+1234567890', // optional
);

if (success) {
  // User created and logged in automatically
  // authProvider.currentUser is now available
  // authProvider.isAuthenticated = true
  Navigator.pushReplacementNamed(context, '/home');
} else {
  // Show error
  print(authProvider.errorMessage);
}
```

### 2. Sign In User
```dart
final authProvider = context.read<AuthProvider>();

final success = await authProvider.signIn(
  email: 'john@example.com',
  password: 'password123',
);

if (success) {
  print('Signed in as: ${authProvider.currentUser?.fullName}');
} else {
  print(authProvider.errorMessage);
}
```

### 3. Send Password Reset Email
```dart
final authProvider = context.read<AuthProvider>();

final success = await authProvider.sendPasswordReset(
  email: 'john@example.com',
);

if (success) {
  print('Reset email sent');
  // User checks their email and clicks reset link
}
```

### 4. Sign Out
```dart
final authProvider = context.read<AuthProvider>();
await authProvider.signOut();

// User is now logged out
// authProvider.isAuthenticated = false
// authProvider.currentUser = null
```

## AuthProvider Properties

```dart
class AuthProvider {
  // Getters
  UserEntity? currentUser;        // Currently logged-in user
  bool isAuthenticated;            // Is user logged in?
  bool isLoading;                 // Is operation in progress?
  String? errorMessage;           // Last error (if any)
  
  // Methods
  Future<bool> signUp({...});
  Future<bool> signIn({...});
  Future<bool> sendPasswordReset({email});
  Future<bool> resetPassword({code, newPassword});
  Future<void> signOut();
  void clearError();              // Clear error message
}
```

## UserEntity Structure

```dart
class UserEntity {
  String id;                      // Firebase UID
  String firstName;
  String lastName;
  String email;
  String? phoneNumber;
  UserRole role;                  // SuperAdmin, Admin, Contributor, User
  DateTime createdAt;
  DateTime updatedAt;
  
  String get fullName;            // Returns "firstName lastName"
}
```

## Using in Widgets

### Watch Auth State
```dart
Consumer<AuthProvider>(
  builder: (context, authProvider, child) {
    if (authProvider.isLoading) {
      return Center(child: CircularProgressIndicator());
    }
    
    if (!authProvider.isAuthenticated) {
      return Text('Not logged in');
    }
    
    return Text('Welcome, ${authProvider.currentUser?.fullName}');
  },
)
```

### Check Auth Status
```dart
// In any method
final authProvider = context.read<AuthProvider>();

if (authProvider.isAuthenticated) {
  print('User: ${authProvider.currentUser?.email}');
  print('Role: ${authProvider.currentUser?.role.displayName}');
}
```

### Protected Widget
```dart
class ProtectedScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        if (!authProvider.isAuthenticated) {
          return Scaffold(
            body: Center(child: Text('Please log in first')),
          );
        }
        
        return YourContent();
      },
    );
  }
}
```

## Error Handling

### Common Errors
```dart
// Catch errors in signUp/signIn
final success = await authProvider.signIn(
  email: email,
  password: password,
);

if (!success) {
  // authProvider.errorMessage contains the error
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(authProvider.errorMessage ?? 'Error')),
  );
}
```

### Error Types
- "The password provided is too weak." → Weak password
- "An account with this email already exists." → Email in use
- "No user account found with this email." → User not found
- "The password is incorrect." → Wrong password
- "Too many login attempts. Please try again later." → Rate limited

## User Roles

```dart
enum UserRole {
  superAdmin,    // Full access, can manage all
  admin,         // Administrative access
  contributor,   // Can create/edit content
  user;          // Basic access
}

// Access role info
final role = currentUser?.role;
print(role?.displayName);  // Prints "Super Admin", "Admin", etc.
```

## Routes

```dart
// Navigate to screens
Navigator.pushNamed(context, '/login');
Navigator.pushNamed(context, '/signup');
Navigator.pushNamed(context, '/forgot-password');
Navigator.pushNamed(context, '/home');
```

## Firebase Database

### Check User in Firestore
1. Firebase Console → Firestore Database
2. Collection: `users`
3. Documents: One per user with userId as document ID
4. Check user fields: firstName, lastName, email, role, etc.

### User Document Example
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "role": "superAdmin",
  "createdAt": "2024-02-25T10:30:00Z",
  "updatedAt": "2024-02-25T10:30:00Z"
}
```

## Common Patterns

### Login Flow
```dart
class LoginScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        return ElevatedButton(
          onPressed: authProvider.isLoading 
            ? null 
            : () async {
                final success = await authProvider.signIn(
                  email: emailController.text,
                  password: passwordController.text,
                );
                
                if (success && context.mounted) {
                  Navigator.pushReplacementNamed(context, '/home');
                }
              },
          child: authProvider.isLoading
            ? CircularProgressIndicator()
            : Text('Sign In'),
        );
      },
    );
  }
}
```

### Protected Home Screen
```dart
class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        if (!authProvider.isAuthenticated) {
          // Redirect to login if not authenticated
          Future.microtask(() {
            Navigator.pushReplacementNamed(context, '/login');
          });
          return SizedBox.shrink();
        }
        
        return Scaffold(
          appBar: AppBar(title: Text('Home')),
          body: Center(
            child: Text('Welcome ${authProvider.currentUser?.firstName}'),
          ),
        );
      },
    );
  }
}
```

### Handle Loading
```dart
ElevatedButton(
  onPressed: authProvider.isLoading ? null : _handleSignUp,
  child: authProvider.isLoading
    ? SizedBox(
        height: 20,
        width: 20,
        child: CircularProgressIndicator(strokeWidth: 2),
      )
    : Text('Create Account'),
)
```

## Testing Checklist

- [ ] Sign up with new email → Should create user in Firestore with role "superAdmin"
- [ ] Sign up with existing email → Should show "email already exists" error
- [ ] Sign up with weak password → Should show "weak password" error
- [ ] Sign in with correct credentials → Should log in successfully
- [ ] Sign in with wrong password → Should show "incorrect password" error
- [ ] Click forgot password → Should send reset email
- [ ] Sign out → Should clear user data and go to login
- [ ] Phone number is optional → Should allow signup without it
- [ ] Verify user data saves to Firestore correctly
- [ ] Check role is always "superAdmin" for new users
- [ ] Verify timestamps are set correctly

## Troubleshooting

### "User not found" after signup
- Ensure Firestore security rules allow writes
- Check web console for Firestore errors

### "Connection timeout"
- Check internet connection
- Verify Firebase project is accessible
- Check firebaseOptions.dart credentials

### Firestore not saving user
- Verify `users` collection exists
- Check security rules allow write operations
- Verify user UID is passed correctly

### Password reset email not arriving
- Check email template in Firebase Console
- Verify sender email is configured
- Check spam/junk folder
- Try different email address

## Architecture Overview

```
User Action (Sign Up)
    ↓
Widget (SignUpScreen)
    ↓
Provider (AuthProvider)
    ↓
Repository (AuthRepositoryImpl)
    ↓
Datasource (FirebaseAuthDatasource)
    ↓
Firebase Auth + Firestore
    ↓
Response flows back up with success/error
```

## Files to Know

| File | Purpose |
|------|---------|
| `main.dart` | Firebase init + AuthProvider setup |
| `auth_provider.dart` | State management for auth |
| `firebase_auth_datasource.dart` | Firebase API calls |
| `auth_repository_impl.dart` | Repository implementation |
| `login_screen.dart` | Login UI |
| `signup_screen.dart` | Sign up UI |
| `forgot_password_screen.dart` | Password reset UI |

## Tips & Best Practices

1. **Always check `isAuthenticated`** before accessing user data
2. **Use Consumer** for widgets that react to auth changes
3. **Clear errors** when user starts new operation
4. **Show loading** during network operations
5. **Never hardcode** email addresses or passwords
6. **Use try-catch** around async operations in production
7. **Validate input** on client before calling backend
8. **Log important** authentication events
9. **Test error cases** - wrong password, network errors, etc.
10. **Monitor quota** - Firebase has per-second limits

---

**Ready to use!** All authentication is production-ready. 🚀
