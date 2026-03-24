// ─────────────────────────────────────────────────────────────────────────────
//  Parish model — mirrors the shared-models.ts Parish interface
// ─────────────────────────────────────────────────────────────────────────────

class MassTimes {
  final List<String> sundayMasses;
  final List<WeekdayMass> weekdayMasses;
  final List<String> holyDayMasses;

  const MassTimes({
    this.sundayMasses = const [],
    this.weekdayMasses = const [],
    this.holyDayMasses = const [],
  });

  factory MassTimes.fromJson(Map<String, dynamic> json) => MassTimes(
    sundayMasses:  List<String>.from(json['sundayMasses'] ?? []),
    weekdayMasses: (json['weekdayMasses'] as List? ?? [])
        .map((e) => WeekdayMass.fromJson(e))
        .toList(),
    holyDayMasses: List<String>.from(json['holyDayMasses'] ?? []),
  );

  Map<String, dynamic> toJson() => {
    'sundayMasses':  sundayMasses,
    'weekdayMasses': weekdayMasses.map((e) => e.toJson()).toList(),
    'holyDayMasses': holyDayMasses,
  };

  MassTimes copyWith({
    List<String>? sundayMasses,
    List<WeekdayMass>? weekdayMasses,
    List<String>? holyDayMasses,
  }) =>
      MassTimes(
        sundayMasses:  sundayMasses  ?? this.sundayMasses,
        weekdayMasses: weekdayMasses ?? this.weekdayMasses,
        holyDayMasses: holyDayMasses ?? this.holyDayMasses,
      );
}

class WeekdayMass {
  final String day;
  final List<String> times;

  const WeekdayMass({required this.day, required this.times});

  factory WeekdayMass.fromJson(Map<String, dynamic> json) => WeekdayMass(
    day:   json['day'] as String,
    times: List<String>.from(json['times'] ?? []),
  );

  Map<String, dynamic> toJson() => {'day': day, 'times': times};

  WeekdayMass copyWith({String? day, List<String>? times}) =>
      WeekdayMass(day: day ?? this.day, times: times ?? this.times);
}

class ParishContact {
  final String id;
  final String role;
  final String name;
  final String phone;
  final String? email;

  const ParishContact({
    required this.id,
    required this.role,
    required this.name,
    required this.phone,
    this.email,
  });

  factory ParishContact.fromJson(Map<String, dynamic> json) => ParishContact(
    id:    json['id'] as String,
    role:  json['role'] as String,
    name:  json['name'] as String,
    phone: json['phone'] as String,
    email: json['email'] as String?,
  );

  Map<String, dynamic> toJson() => {
    'id': id, 'role': role, 'name': name, 'phone': phone, 'email': email,
  };

  ParishContact copyWith({
    String? id, String? role, String? name, String? phone, String? email,
  }) =>
      ParishContact(
        id:    id    ?? this.id,
        role:  role  ?? this.role,
        name:  name  ?? this.name,
        phone: phone ?? this.phone,
        email: email ?? this.email,
      );
}

class PastoralTeamMember {
  final String id;
  final String name;
  final String role;
  final String? phone;

  const PastoralTeamMember({
    required this.id,
    required this.name,
    required this.role,
    this.phone,
  });

  factory PastoralTeamMember.fromJson(Map<String, dynamic> json) =>
      PastoralTeamMember(
        id:    json['id'] as String,
        name:  json['name'] as String,
        role:  json['role'] as String,
        phone: json['phone'] as String?,
      );

  Map<String, dynamic> toJson() =>
      {'id': id, 'name': name, 'role': role, 'phone': phone};

  PastoralTeamMember copyWith({
    String? id, String? name, String? role, String? phone,
  }) =>
      PastoralTeamMember(
        id:    id    ?? this.id,
        name:  name  ?? this.name,
        role:  role  ?? this.role,
        phone: phone ?? this.phone,
      );
}

class ParishActivity {
  final String id;
  final String name;
  final String time;

  const ParishActivity({
    required this.id,
    required this.name,
    required this.time,
  });

  factory ParishActivity.fromJson(Map<String, dynamic> json) => ParishActivity(
    id:   json['id'] as String,
    name: json['name'] as String,
    time: json['time'] as String,
  );

  Map<String, dynamic> toJson() => {'id': id, 'name': name, 'time': time};

  ParishActivity copyWith({String? id, String? name, String? time}) =>
      ParishActivity(id: id ?? this.id, name: name ?? this.name, time: time ?? this.time);
}

class ParishAnnouncement {
  final String id;
  final String title;
  final String body;

  const ParishAnnouncement({
    required this.id,
    required this.title,
    required this.body,
  });

  factory ParishAnnouncement.fromJson(Map<String, dynamic> json) =>
      ParishAnnouncement(
        id:    json['id'] as String,
        title: json['title'] as String,
        body:  json['body'] as String,
      );

  Map<String, dynamic> toJson() => {'id': id, 'title': title, 'body': body};

  ParishAnnouncement copyWith({String? id, String? title, String? body}) =>
      ParishAnnouncement(
        id:    id    ?? this.id,
        title: title ?? this.title,
        body:  body  ?? this.body,
      );
}

class ParishSocial {
  final String platform;
  final String url;

  const ParishSocial({required this.platform, required this.url});

  factory ParishSocial.fromJson(Map<String, dynamic> json) =>
      ParishSocial(platform: json['platform'] as String, url: json['url'] as String);

  Map<String, dynamic> toJson() => {'platform': platform, 'url': url};
}

class GalleryAlbum {
  final String id;
  final String title;
  final List<String> images;  // URLs or base64
  final DateTime createdAt;

  const GalleryAlbum({
    required this.id,
    required this.title,
    required this.images,
    required this.createdAt,
  });

  factory GalleryAlbum.fromJson(Map<String, dynamic> json) => GalleryAlbum(
    id:        json['id'] as String,
    title:     json['title'] as String,
    images:    List<String>.from(json['images'] ?? []),
    createdAt: DateTime.parse(json['createdAt'] as String),
  );

  Map<String, dynamic> toJson() => {
    'id': id, 'title': title, 'images': images,
    'createdAt': createdAt.toIso8601String(),
  };

  GalleryAlbum copyWith({
    String? id, String? title, List<String>? images, DateTime? createdAt,
  }) =>
      GalleryAlbum(
        id:        id        ?? this.id,
        title:     title     ?? this.title,
        images:    images    ?? this.images,
        createdAt: createdAt ?? this.createdAt,
      );
}

enum ParishStatus { active, pending, inactive }

extension ParishStatusX on ParishStatus {
  String get label => name;
  static ParishStatus fromString(String s) =>
      ParishStatus.values.firstWhere((e) => e.name == s, orElse: () => ParishStatus.pending);
}

class Parish {
  final String id;
  final String country;
  final String archdiocese;
  final String deanery;
  final String name;
  final String address;
  final String latitude;
  final String longitude;
  final String? phone;
  final String? email;
  final String? website;
  final List<ParishSocial> socials;
  final MassTimes massTimes;
  final List<ParishContact> contacts;
  final List<PastoralTeamMember> pastoralTeam;
  final List<ParishActivity> activities;
  final List<ParishAnnouncement> announcements;
  final List<String> uploadedImages;
  final List<GalleryAlbum> gallery;
  final ParishStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Parish({
    required this.id,
    required this.country,
    required this.archdiocese,
    required this.deanery,
    required this.name,
    required this.address,
    required this.latitude,
    required this.longitude,
    this.phone,
    this.email,
    this.website,
    this.socials        = const [],
    required this.massTimes,
    this.contacts       = const [],
    this.pastoralTeam   = const [],
    this.activities     = const [],
    this.announcements  = const [],
    this.uploadedImages = const [],
    this.gallery        = const [],
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Parish.fromJson(Map<String, dynamic> json) => Parish(
    id:             json['id'] as String,
    country:        json['country'] as String,
    archdiocese:    json['archdiocese'] as String,
    deanery:        json['deanery'] as String,
    name:           json['name'] as String,
    address:        json['address'] as String,
    latitude:       json['latitude'] as String,
    longitude:      json['longitude'] as String,
    phone:          json['phone'] as String?,
    email:          json['email'] as String?,
    website:        json['website'] as String?,
    socials:        (json['socials'] as List? ?? []).map((e) => ParishSocial.fromJson(e)).toList(),
    massTimes:      MassTimes.fromJson(json['massTimes'] as Map<String, dynamic>),
    contacts:       (json['contacts'] as List? ?? []).map((e) => ParishContact.fromJson(e)).toList(),
    pastoralTeam:   (json['pastoralTeam'] as List? ?? []).map((e) => PastoralTeamMember.fromJson(e)).toList(),
    activities:     (json['activities'] as List? ?? []).map((e) => ParishActivity.fromJson(e)).toList(),
    announcements:  (json['announcements'] as List? ?? []).map((e) => ParishAnnouncement.fromJson(e)).toList(),
    uploadedImages: List<String>.from(json['uploadedImages'] ?? []),
    gallery:        (json['gallery'] as List? ?? []).map((e) => GalleryAlbum.fromJson(e)).toList(),
    status:         ParishStatusX.fromString(json['status'] as String),
    createdAt:      DateTime.parse(json['createdAt'] as String),
    updatedAt:      DateTime.parse(json['updatedAt'] as String),
  );

  Map<String, dynamic> toJson() => {
    'id': id, 'country': country, 'archdiocese': archdiocese, 'deanery': deanery,
    'name': name, 'address': address, 'latitude': latitude, 'longitude': longitude,
    'phone': phone, 'email': email, 'website': website,
    'socials': socials.map((e) => e.toJson()).toList(),
    'massTimes': massTimes.toJson(),
    'contacts': contacts.map((e) => e.toJson()).toList(),
    'pastoralTeam': pastoralTeam.map((e) => e.toJson()).toList(),
    'activities': activities.map((e) => e.toJson()).toList(),
    'announcements': announcements.map((e) => e.toJson()).toList(),
    'uploadedImages': uploadedImages,
    'gallery': gallery.map((e) => e.toJson()).toList(),
    'status': status.name,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
  };

  Parish copyWith({
    String? id, String? country, String? archdiocese, String? deanery,
    String? name, String? address, String? latitude, String? longitude,
    String? phone, String? email, String? website,
    List<ParishSocial>? socials, MassTimes? massTimes,
    List<ParishContact>? contacts, List<PastoralTeamMember>? pastoralTeam,
    List<ParishActivity>? activities, List<ParishAnnouncement>? announcements,
    List<String>? uploadedImages, List<GalleryAlbum>? gallery,
    ParishStatus? status, DateTime? createdAt, DateTime? updatedAt,
  }) =>
      Parish(
        id:             id             ?? this.id,
        country:        country        ?? this.country,
        archdiocese:    archdiocese    ?? this.archdiocese,
        deanery:        deanery        ?? this.deanery,
        name:           name           ?? this.name,
        address:        address        ?? this.address,
        latitude:       latitude       ?? this.latitude,
        longitude:      longitude      ?? this.longitude,
        phone:          phone          ?? this.phone,
        email:          email          ?? this.email,
        website:        website        ?? this.website,
        socials:        socials        ?? this.socials,
        massTimes:      massTimes      ?? this.massTimes,
        contacts:       contacts       ?? this.contacts,
        pastoralTeam:   pastoralTeam   ?? this.pastoralTeam,
        activities:     activities     ?? this.activities,
        announcements:  announcements  ?? this.announcements,
        uploadedImages: uploadedImages ?? this.uploadedImages,
        gallery:        gallery        ?? this.gallery,
        status:         status         ?? this.status,
        createdAt:      createdAt      ?? this.createdAt,
        updatedAt:      updatedAt      ?? this.updatedAt,
      );
}
