import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/reading.dart';

class ReadingRepository {
  final _collection = FirebaseFirestore.instance.collection('readings');

  Future<void> addReading(Reading reading) async {
    await _collection.add(reading.toJson());
  }

  Future<List<Reading>> getReadings() async {
    final snapshot = await _collection.orderBy('date', descending: true).get();
    return snapshot.docs
        .map((doc) => Reading.fromJson(doc.data(), id: doc.id))
        .toList();
  }

  Future<void> deleteReading(String id) async {
    await FirebaseFirestore.instance.collection('readings').doc(id).delete();
  }

  Future<void> updateReading(Reading reading) async {
    if (reading.id == null) return;
    await FirebaseFirestore.instance.collection('readings').doc(reading.id).update(reading.toJson());
  }
}
