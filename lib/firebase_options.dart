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
    apiKey: 'AIzaSyD992oyq7o-bQ3gKPl82iVM61DdSDvwm0U',
    appId: '1:664671225920:android:4b8659080d1aa5824ff7a5',
    messagingSenderId: '664671225920',
    projectId: 'catholic-companion',
    storageBucket: 'catholic-companion.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyB90768OULFbc1Zmsm5tnlYTEb2W_CmddA',
    appId: '1:664671225920:ios:5d9aaf93fb8184c2e87236',
    messagingSenderId: '664671225920',
    projectId: 'catholic-companion',
    storageBucket: 'catholic-companion.firebasestorage.app',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    iosBundleId: 'com.heztech.companion',
  );

  static const FirebaseOptions web = FirebaseOptions(
    // apiKey: "AIzaSyBaZQy060uvtcFdfQhEuIHVZfXHrJx59ec",
    // appId: "1:1058395630595:web:57c679eaa43a7208e87236",
    // messagingSenderId: '1058395630595',
    // projectId: "mycompanion-f584d",
    // authDomain: "mycompanion-f584d.firebaseapp.com",
    // storageBucket: "mycompanion-f584d.firebasestorage.app",

    apiKey: "AIzaSyBcba4t8DB9mm9Rk236PnhshQ3vfqhKofc",
    authDomain: "catholic-companion.firebaseapp.com",
    projectId: "catholic-companion",
    storageBucket: "catholic-companion.firebasestorage.app",
    messagingSenderId: "664671225920",
    appId: "1:664671225920:web:56d8737d47a54aa24ff7a5",
    measurementId: "G-9HSHDSCKPD"
  );
}
