# Firebase Configuration Guide

## Prerequisites
- Firebase project created and linked to Flutter app
- `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) already configured

## Step 1: Enable Authentication

### In Firebase Console:
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Optional: Enable **Email link sign-in** for password-less auth
4. Set up SMTP relay for password reset emails (optional but recommended)

## Step 2: Configure Firestore

### Create Firestore Database:
1. Go to **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode** or **Start in test mode**
4. Choose your region
5. Click **Create**

### Create Users Collection:
```
Collection: users
Document Structure:
{
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: string (values: superAdmin, admin, contributor, user)
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Step 3: Set Up Security Rules

### For Development (Test Mode):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all operations (for testing only)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### For Production (Recommended):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own document
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow create: if request.auth.uid == userId 
        && request.resource.data.role == 'superAdmin';
      allow update: if request.auth.uid == userId
        && request.resource.data.role == request.auth.token.role;
      allow delete: if false; // Never delete users directly
    }
    
    // Admin operations (for future use)
    match /admin/{document=**} {
      allow read, write: if request.auth.token.role == 'superAdmin';
    }
  }
}
```

### For Admin Management (Advanced):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth.token.role in ['superAdmin', 'admin'];
    }
    
    function isOwner() {
      return request.auth.uid == resource.data.createdBy;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth.uid == userId || isAdmin();
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId || isAdmin();
      allow delete: if isAdmin();
    }
  }
}
```

## Step 4: Set Custom Claims (Optional but Recommended)

### For RBAC (Role-Based Access Control):
Use Firebase Admin SDK in Cloud Functions to set custom claims:

```javascript
// Cloud Function to set user role
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

exports.setUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const { userId, role } = data;
  
  try {
    await admin.auth().setCustomUserClaims(userId, { role });
    await admin.firestore().collection("users").doc(userId).update({
      role: role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});
```

## Step 5: Configure Password Reset Email

### In Firebase Console:
1. Go to **Authentication** → **Templates** → **Password reset**
2. Customize the email template:
   - Subject: "Reset your Companion password"
   - Custom domain (optional)
   - Email content

### Example Template:
```html
<p>Hello [USER_EMAIL],</p>

<p>We received a request to reset your Companion account password.</p>

<p>To reset your password, click the link below:</p>

<p><a href="[LINK]">Reset Password</a></p>

<p>This link expires in 1 hour.</p>

<p>If you didn't request this, please ignore this email.</p>

<p>Best regards,<br>The Companion Team</p>
```

## Step 6: Enable Firestore Indexes (Optional)

For complex queries, create indexes:

### Go to Firestore → Indexes
Create index if needed for:
- User queries by email
- User queries by role
- Sorting by createdAt

The app currently doesn't require special indexes for basic queries.

## Step 7: Set Up Backups (Recommended)

### Enable Automated Backups:
1. Go to **Firestore Database** → **Backups**
2. Enable **Cloud Backup Service**
3. Set retention policy (default: 14 days)

## Step 8: Configure App Settings

Ensure your Flutter app has proper Firebase initialization:

### pubspec.yaml
```yaml
dependencies:
  firebase_core: ^2.24.0
  firebase_auth: ^4.10.0
  cloud_firestore: ^4.13.0
  provider: ^6.0.0
```

Already configured in your project! ✓

## Troubleshooting

### Issue: "Permission denied" errors in Firestore
**Solution**: Check security rules match your app's operation:
- Users creating accounts should be allowed
- Users reading their own data should be allowed

### Issue: Password reset emails not arriving
**Solution**:
1. Check spam/junk folder
2. Verify email template is configured
3. Test with different email providers
4. Check Firebase quota limits

### Issue: User data not saving to Firestore
**Solution**:
1. Verify security rules allow write operations
2. Check Firestore is properly initialized
3. Verify user has permission to write to `users` collection
4. Check network connectivity

### Issue: Auth state not persisting
**Solution**:
1. Firebase Auth stores tokens locally automatically
2. On app restart, use `FirebaseAuth.instance.currentUser` to check auth state
3. Implement auth state listener for navigation

## Monitoring

### Monitor Your App:
1. Go to **Analytics Dashboard**
2. Track authentication events:
   - Sign up rate
   - Sign in failures
   - Password resets
3. Set up alerts for suspicious activity

### Check Logs:
- **Authentication Log**: Shows all auth events with timestamps and details
- **Firestore Logs**: Monitor read/write operations and errors

## Next Steps

1. ✅ Authentication system is ready
2. Deploy to Firebase Hosting for web
3. Build and test on iOS/Android
4. Monitor user authentication metrics
5. Plan for advanced features (2FA, social login, etc.)

## Useful Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security)
- [Flutter Firebase Setup](https://firebase.flutter.dev/)
- [Firebase Best Practices](https://firebase.google.com/docs/best-practices)
