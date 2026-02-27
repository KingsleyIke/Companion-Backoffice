import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/parish.dart';

class ParishRepository {
  final _countries = FirebaseFirestore.instance.collection('countries');

  Future<List<String>> getCountries() async {
    final snapshot = await _countries.get();
    return snapshot.docs.map((doc) => doc.id).toList();
  }

  Future<List<String>> getArchdioceses(String countryId) async {
    final archdioceses = await _countries.doc(countryId).collection('archdioceses').get();
    return archdioceses.docs.map((doc) => doc.id).toList();
  }

  Future<List<String>> getDeaneries(String countryId, String archdioceseId) async {
    final deaneries = await _countries.doc(countryId)
      .collection('archdioceses').doc(archdioceseId)
      .collection('deaneries').get();
    return deaneries.docs.map((doc) => doc.id).toList();
  }

  Future<List<Parish>> getParishes(String countryId, String archdioceseId, String deaneryId) async {
    final parishes = await _countries.doc(countryId)
      .collection('archdioceses').doc(archdioceseId)
      .collection('deaneries').doc(deaneryId)
      .collection('parishes').get();
    return parishes.docs.map((doc) => Parish.fromJson(doc.data(), id: doc.id)).toList();
  }

  Future<void> addParish(String countryId, String archdioceseId, String deaneryId, Parish parish) async {
    await _countries.doc(countryId)
      .collection('archdioceses').doc(archdioceseId)
      .collection('deaneries').doc(deaneryId)
      .collection('parishes').add(parish.toJson());
  }

  Future<void> updateParish(String countryId, String archdioceseId, String deaneryId, Parish parish) async {
    if (parish.id == null) return;
    await _countries.doc(countryId)
      .collection('archdioceses').doc(archdioceseId)
      .collection('deaneries').doc(deaneryId)
      .collection('parishes').doc(parish.id)
      .update(parish.toJson());
  }

  Future<void> deleteParish(String countryId, String archdioceseId, String deaneryId, String parishId) async {
    await _countries.doc(countryId)
      .collection('archdioceses').doc(archdioceseId)
      .collection('deaneries').doc(deaneryId)
      .collection('parishes').doc(parishId).delete();
  }
}
