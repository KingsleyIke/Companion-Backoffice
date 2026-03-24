import 'package:flutter/foundation.dart';
import '../models/approval_request.dart';
import '../data/mock_data.dart';

class ApprovalsProvider extends ChangeNotifier {
  List<ApprovalRequest> _approvals = List.from(mockApprovals);
  String _statusFilter = 'pending';
  String _typeFilter   = '';

  List<ApprovalRequest> get approvals  => _approvals;
  String get statusFilter              => _statusFilter;
  String get typeFilter                => _typeFilter;

  List<ApprovalRequest> get filtered => _approvals.where((a) {
    final matchStatus = _statusFilter.isEmpty || a.status.name == _statusFilter;
    final matchType   = _typeFilter.isEmpty   || a.type.key    == _typeFilter;
    return matchStatus && matchType;
  }).toList()
    ..sort((a, b) => b.submittedAt.compareTo(a.submittedAt));

  int get pendingCount  => _approvals.where((a) => a.status == ApprovalStatus.pending).length;
  int get approvedCount => _approvals.where((a) => a.status == ApprovalStatus.approved).length;
  int get rejectedCount => _approvals.where((a) => a.status == ApprovalStatus.rejected).length;

  void setStatusFilter(String s) { _statusFilter = s; notifyListeners(); }
  void setTypeFilter(String t)   { _typeFilter = t;   notifyListeners(); }
  void clearFilters()            { _statusFilter = _typeFilter = ''; notifyListeners(); }

  void approve(String id, {required String reviewedBy, String? note}) {
    _approvals = _approvals.map((a) => a.id == id
        ? a.copyWith(
            status:     ApprovalStatus.approved,
            reviewedBy: reviewedBy,
            reviewNote: note,
            reviewedAt: DateTime.now(),
          )
        : a).toList();
    notifyListeners();
  }

  void reject(String id, {required String reviewedBy, required String note}) {
    _approvals = _approvals.map((a) => a.id == id
        ? a.copyWith(
            status:     ApprovalStatus.rejected,
            reviewedBy: reviewedBy,
            reviewNote: note,
            reviewedAt: DateTime.now(),
          )
        : a).toList();
    notifyListeners();
  }
}
