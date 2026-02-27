import 'package:flutter/material.dart';
import '../models/parish.dart';
import '../repositories/parish_repository.dart';

class AddParishViewModel extends ChangeNotifier {
  final ParishRepository _repository;
  bool _isLoading = false;
  String? _error;

  AddParishViewModel(this._repository);

  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> addParish(String country, String archdiocese, String deanery, Parish parish) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      await _repository.addParish(country, archdiocese, deanery, parish);
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> updateParish(String country, String archdiocese, String deanery, Parish parish) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      await _repository.updateParish(country, archdiocese, deanery, parish);
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> deleteParish(String country, String archdiocese, String deanery, String parishId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      await _repository.deleteParish(country, archdiocese, deanery, parishId);
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }
}
