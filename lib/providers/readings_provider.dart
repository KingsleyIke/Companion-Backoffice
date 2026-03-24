import 'package:flutter/foundation.dart';
import '../models/daily_reading.dart';
import '../data/mock_data.dart';

class ReadingsProvider extends ChangeNotifier {
  List<DailyReading> _readings = List.from(mockReadings);
  String _statusFilter = ''; // '', 'published', 'draft'
  String _searchQuery  = '';

  List<DailyReading> get readings     => _readings;
  String get statusFilter             => _statusFilter;
  String get searchQuery              => _searchQuery;

  List<DailyReading> get filtered {
    return _readings.where((r) {
      final q = _searchQuery.toLowerCase();
      final matchSearch = q.isEmpty ||
          r.dayTitle.toLowerCase().contains(q) ||
          r.date.toString().contains(q);
      final matchStatus = _statusFilter.isEmpty || r.status.name == _statusFilter;
      return matchSearch && matchStatus;
    }).toList()
      ..sort((a, b) => b.date.compareTo(a.date));
  }

  int get publishedCount => _readings.where((r) => r.status == ReadingStatus.published).length;
  int get draftCount     => _readings.where((r) => r.status == ReadingStatus.draft).length;

  void setStatusFilter(String s) { _statusFilter = s; notifyListeners(); }
  void setSearch(String q)       { _searchQuery = q;  notifyListeners(); }
  void clearFilters()            { _statusFilter = _searchQuery = ''; notifyListeners(); }

  DailyReading? getById(String id) =>
      _readings.where((r) => r.id == id).firstOrNull;

  void addReading(DailyReading r) {
    _readings = [..._readings, r];
    notifyListeners();
  }

  void updateReading(DailyReading r) {
    _readings = _readings.map((e) => e.id == r.id ? r : e).toList();
    notifyListeners();
  }

  void deleteReading(String id) {
    _readings = _readings.where((r) => r.id != id).toList();
    notifyListeners();
  }
}
