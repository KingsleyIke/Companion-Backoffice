import 'package:flutter/foundation.dart';
import '../models/parish.dart';
import '../data/mock_data.dart';

class ParishProvider extends ChangeNotifier {
  List<Parish> _parishes = List.from(mockParishes);
  String _searchQuery    = '';
  String _countryFilter  = '';
  String _archFilter     = '';
  String _deaneryFilter  = '';

  List<Parish> get parishes    => _parishes;
  String get searchQuery       => _searchQuery;
  String get countryFilter     => _countryFilter;
  String get archFilter        => _archFilter;
  String get deaneryFilter     => _deaneryFilter;

  List<Parish> get filtered => _parishes.where((p) {
    final q = _searchQuery.toLowerCase();
    final matchSearch  = q.isEmpty || p.name.toLowerCase().contains(q) || p.address.toLowerCase().contains(q);
    final matchCountry = _countryFilter.isEmpty  || p.country    == _countryFilter;
    final matchArch    = _archFilter.isEmpty     || p.archdiocese == _archFilter;
    final matchDeanery = _deaneryFilter.isEmpty  || p.deanery    == _deaneryFilter;
    return matchSearch && matchCountry && matchArch && matchDeanery;
  }).toList();

  int get activeCount  => _parishes.where((p) => p.status == ParishStatus.active).length;
  int get pendingCount => _parishes.where((p) => p.status == ParishStatus.pending).length;

  void setSearch(String q)  { _searchQuery = q;    notifyListeners(); }
  void setCountry(String c) { _countryFilter = c;  notifyListeners(); }
  void setArch(String a)    { _archFilter = a;     notifyListeners(); }
  void setDeanery(String d) { _deaneryFilter = d;  notifyListeners(); }
  void clearFilters()       {
    _searchQuery = _countryFilter = _archFilter = _deaneryFilter = '';
    notifyListeners();
  }

  Parish? getById(String id) =>
      _parishes.where((p) => p.id == id).firstOrNull;

  void addParish(Parish p) {
    _parishes = [..._parishes, p];
    notifyListeners();
  }

  void updateParish(Parish p) {
    _parishes = _parishes.map((e) => e.id == p.id ? p : e).toList();
    notifyListeners();
  }

  void deleteParish(String id) {
    _parishes = _parishes.where((p) => p.id != id).toList();
    notifyListeners();
  }
}
