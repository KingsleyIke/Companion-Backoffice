// lib/firebase_options.dart

import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart';

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
      case TargetPlatform.windows:
      case TargetPlatform.linux:
      case TargetPlatform.fuchsia:
      default:
        return web;
    }
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyDE1lO-wYJ4HLIqC_Vl-G7yqvIZXF3C560',
    appId: '1:1058395630595:ios:5d9aaf93fb8184c2e87236',
    messagingSenderId: '1058395630595',
    projectId: 'mycompanion-f584d',
    storageBucket: 'mycompanion-f584d.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyB90768OULFbc1Zmsm5tnlYTEb2W_CmddA',
    appId: '1:1058395630595:ios:5d9aaf93fb8184c2e87236',
    messagingSenderId: '1058395630595',
    projectId: 'mycompanion-f584d',
    storageBucket: 'mycompanion-f584d.firebasestorage.app',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    iosBundleId: 'com.heztech.companion',
  );

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: "AIzaSyBaZQy060uvtcFdfQhEuIHVZfXHrJx59ec",
    appId: "1:1058395630595:web:57c679eaa43a7208e87236",
    messagingSenderId: '1058395630595',
    projectId: "mycompanion-f584d",
    authDomain: "mycompanion-f584d.firebaseapp.com",
    storageBucket: "mycompanion-f584d.firebasestorage.app",
  );
}
