import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user_dto.dart';

class UserService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Future<UserDto?> createUser(UserDto userDto, String password) async {
    print('Beore try creation');

    try {
      print('Start creation');

      // Create user in Firebase Auth
      UserCredential userCredential = await _auth.createUserWithEmailAndPassword(
        email: userDto.email,
        password: password,
      );

      print('End creation');


      User? user = userCredential.user;
      if (user != null) {
        // Add user to Firestore
        await _firestore.collection('users').doc(user.uid).set(userDto.toMap());
        return userDto;
      }
    } catch (e) {
      print('Error in creation');

      print('Error creating user: $e');
    }
    return null;
  }

  Future<UserDto?> getUser(String userId) async {
    try {
      DocumentSnapshot<Map<String, dynamic>> docSnapshot =
      await _firestore.collection('users').doc(userId).get();

      if (docSnapshot.exists) {
        return UserDto.fromMap(docSnapshot.id, docSnapshot.data()!);
      }
    } catch (e) {
      print('Error fetching user: $e');
    }
    return null;
  }

  Future<void> updateUser(String userId, Map<String, dynamic> updatedFields) async {
    try {
      updatedFields['updatedAt'] = DateTime.now();
      await _firestore.collection('users').doc(userId).update(updatedFields);
    } catch (e) {
      print('Error updating user: $e');
    }
  }

  Future<void> deleteUser(String userId) async {
    try {
      await _auth.currentUser?.delete();
      await _firestore.collection('users').doc(userId).delete();
    } catch (e) {
      print('Error deleting user: $e');
    }
  }

  Future<List<UserDto>> getAllUsers() async {
    try {
      QuerySnapshot<Map<String, dynamic>> querySnapshot =
      await _firestore.collection('users').get();

      return querySnapshot.docs
          .map((doc) => UserDto.fromMap(doc.id, doc.data()))
          .toList();
    } catch (e) {
      print('Error fetching users: $e');
      return [];
    }
  }

  // New login method
  Future<UserDto?> login(String email, String password) async {
    try {
      // Log in using Firebase Auth
      UserCredential userCredential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      User? user = userCredential.user;
      if (user != null) {
        // Fetch the user data from Firestore
        DocumentSnapshot<Map<String, dynamic>> docSnapshot =
        await _firestore.collection('users').doc(user.uid).get();

        if (docSnapshot.exists) {
          return UserDto.fromMap(docSnapshot.id, docSnapshot.data()!);
        }
      }
    } catch (e) {
      print('Error logging in user: $e');
    }
    return null;
  }

  Future<void> logout() async {
    await _auth.signOut();
  }
}
