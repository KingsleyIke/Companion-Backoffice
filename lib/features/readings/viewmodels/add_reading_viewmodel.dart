import 'package:flutter/material.dart';
import '../models/reading.dart';
import '../repositories/reading_repository.dart';

class AddReadingViewModel extends ChangeNotifier {
  final ReadingRepository _repository;
  bool _isLoading = false;
  String? _error;

  AddReadingViewModel(this._repository);

  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> addReading(Reading reading) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      await _repository.addReading(reading);
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> updateReading(Reading reading) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      await _repository.updateReading(reading);
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }
}
