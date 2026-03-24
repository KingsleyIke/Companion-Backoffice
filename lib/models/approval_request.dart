enum ApprovalType {
  parishInfo,
  massTimes,
  announcements,
  activities,
  contacts,
  gallery,
}

extension ApprovalTypeX on ApprovalType {
  String get label {
    const labels = {
      ApprovalType.parishInfo:    'Parish Information',
      ApprovalType.massTimes:     'Mass Times',
      ApprovalType.announcements: 'Church Announcements',
      ApprovalType.activities:    'Church Activities',
      ApprovalType.contacts:      'Parish Contacts',
      ApprovalType.gallery:       'Gallery',
    };
    return labels[this]!;
  }

  String get key {
    const keys = {
      ApprovalType.parishInfo:    'parish_info',
      ApprovalType.massTimes:     'mass_times',
      ApprovalType.announcements: 'announcements',
      ApprovalType.activities:    'activities',
      ApprovalType.contacts:      'contacts',
      ApprovalType.gallery:       'gallery',
    };
    return keys[this]!;
  }

  static ApprovalType fromString(String s) {
    const map = {
      'parish_info':    ApprovalType.parishInfo,
      'mass_times':     ApprovalType.massTimes,
      'announcements':  ApprovalType.announcements,
      'activities':     ApprovalType.activities,
      'contacts':       ApprovalType.contacts,
      'gallery':        ApprovalType.gallery,
    };
    return map[s] ?? ApprovalType.parishInfo;
  }
}

enum ApprovalStatus { pending, approved, rejected }

extension ApprovalStatusX on ApprovalStatus {
  static ApprovalStatus fromString(String s) =>
      ApprovalStatus.values.firstWhere((e) => e.name == s, orElse: () => ApprovalStatus.pending);
}

class ChangeEntry {
  final dynamic oldValue;
  final dynamic newValue;

  const ChangeEntry({required this.oldValue, required this.newValue});

  factory ChangeEntry.fromJson(Map<String, dynamic> json) =>
      ChangeEntry(oldValue: json['old'], newValue: json['new']);

  Map<String, dynamic> toJson() => {'old': oldValue, 'new': newValue};
}

class ApprovalRequest {
  final String id;
  final String parishId;
  final String parishName;
  final String contributorId;
  final String contributorName;
  final String contributorEmail;
  final ApprovalType type;
  final Map<String, ChangeEntry> changes;
  final ApprovalStatus status;
  final String? reviewedBy;
  final String? reviewNote;
  final DateTime submittedAt;
  final DateTime? reviewedAt;

  const ApprovalRequest({
    required this.id,
    required this.parishId,
    required this.parishName,
    required this.contributorId,
    required this.contributorName,
    required this.contributorEmail,
    required this.type,
    required this.changes,
    required this.status,
    this.reviewedBy,
    this.reviewNote,
    required this.submittedAt,
    this.reviewedAt,
  });

  factory ApprovalRequest.fromJson(Map<String, dynamic> json) => ApprovalRequest(
    id:               json['id'] as String,
    parishId:         json['parishId'] as String,
    parishName:       json['parishName'] as String,
    contributorId:    json['contributorId'] as String,
    contributorName:  json['contributorName'] as String,
    contributorEmail: json['contributorEmail'] as String,
    type:             ApprovalTypeX.fromString(json['type'] as String),
    changes:          (json['changes'] as Map<String, dynamic>).map(
      (k, v) => MapEntry(k, ChangeEntry.fromJson(v as Map<String, dynamic>)),
    ),
    status:           ApprovalStatusX.fromString(json['status'] as String),
    reviewedBy:       json['reviewedBy'] as String?,
    reviewNote:       json['reviewNote'] as String?,
    submittedAt:      DateTime.parse(json['submittedAt'] as String),
    reviewedAt:       json['reviewedAt'] != null
        ? DateTime.parse(json['reviewedAt'] as String)
        : null,
  );

  Map<String, dynamic> toJson() => {
    'id': id, 'parishId': parishId, 'parishName': parishName,
    'contributorId': contributorId, 'contributorName': contributorName,
    'contributorEmail': contributorEmail, 'type': type.key,
    'changes': changes.map((k, v) => MapEntry(k, v.toJson())),
    'status': status.name, 'reviewedBy': reviewedBy, 'reviewNote': reviewNote,
    'submittedAt': submittedAt.toIso8601String(),
    'reviewedAt': reviewedAt?.toIso8601String(),
  };

  ApprovalRequest copyWith({
    ApprovalStatus? status,
    String? reviewedBy,
    String? reviewNote,
    DateTime? reviewedAt,
  }) =>
      ApprovalRequest(
        id: id, parishId: parishId, parishName: parishName,
        contributorId: contributorId, contributorName: contributorName,
        contributorEmail: contributorEmail, type: type, changes: changes,
        status:      status      ?? this.status,
        reviewedBy:  reviewedBy  ?? this.reviewedBy,
        reviewNote:  reviewNote  ?? this.reviewNote,
        submittedAt: submittedAt,
        reviewedAt:  reviewedAt  ?? this.reviewedAt,
      );
}
