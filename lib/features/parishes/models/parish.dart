class ParishPastoralTeamMember {
  final String name;
  final String role;
  final String phone;
  ParishPastoralTeamMember({required this.name, required this.role, required this.phone});
  Map<String, dynamic> toJson() => {'name': name, 'role': role, 'phone': phone};
  factory ParishPastoralTeamMember.fromJson(Map<String, dynamic> json) => ParishPastoralTeamMember(
    name: json['name'] ?? '',
    role: json['role'] ?? '',
    phone: json['phone'] ?? '',
  );
}

class ParishAnnouncement {
  final String title;
  final String text;
  ParishAnnouncement({required this.title, required this.text});
  Map<String, dynamic> toJson() => {'title': title, 'text': text};
  factory ParishAnnouncement.fromJson(Map<String, dynamic> json) => ParishAnnouncement(
    title: json['title'] ?? '',
    text: json['text'] ?? '',
  );
}

class ParishActivity {
  final String title;
  final String text;
  ParishActivity({required this.title, required this.text});
  Map<String, dynamic> toJson() => {'title': title, 'text': text};
  factory ParishActivity.fromJson(Map<String, dynamic> json) => ParishActivity(
    title: json['title'] ?? '',
    text: json['text'] ?? '',
  );
}

class ParishGalleryItem {
  final String title;
  final String text;
  final List<String> images;
  ParishGalleryItem({required this.title, required this.text, required this.images});
  Map<String, dynamic> toJson() => {'title': title, 'text': text, 'images': images};
  factory ParishGalleryItem.fromJson(Map<String, dynamic> json) => ParishGalleryItem(
    title: json['title'] ?? '',
    text: json['text'] ?? '',
    images: List<String>.from(json['images'] ?? []),
  );
}

class Parish {
  final String? id;
  final String country;
  final String archdiocese;
  final String deanery;
  final String name;
  final String address;
  final List<String> images;
  final String? website;
  final Map<String, String>? socials;
  final double? latitude;
  final double? longitude;
  final List<ParishPastoralTeamMember> pastoralTeam;
  final List<ParishAnnouncement> announcements;
  final List<ParishActivity> activities;
  final List<ParishGalleryItem> gallery;

  Parish({
    this.id,
    required this.country,
    required this.archdiocese,
    required this.deanery,
    required this.name,
    required this.address,
    required this.images,
    this.website,
    this.socials,
    this.latitude,
    this.longitude,
    required this.pastoralTeam,
    required this.announcements,
    required this.activities,
    required this.gallery,
  });

  Map<String, dynamic> toJson() => {
    'country': country,
    'archdiocese': archdiocese,
    'deanery': deanery,
    'name': name,
    'address': address,
    'images': images,
    'website': website,
    'socials': socials,
    'latitude': latitude,
    'longitude': longitude,
    'pastoralTeam': pastoralTeam.map((e) => e.toJson()).toList(),
    'announcements': announcements.map((e) => e.toJson()).toList(),
    'activities': activities.map((e) => e.toJson()).toList(),
    'gallery': gallery.map((e) => e.toJson()).toList(),
  };

  factory Parish.fromJson(Map<String, dynamic> json, {String? id}) => Parish(
    id: id,
    country: json['country'] ?? '',
    archdiocese: json['archdiocese'] ?? '',
    deanery: json['deanery'] ?? '',
    name: json['name'] ?? '',
    address: json['address'] ?? '',
    images: List<String>.from(json['images'] ?? []),
    website: json['website'],
    socials: (json['socials'] as Map?)?.map((k, v) => MapEntry(k.toString(), v.toString())),
    latitude: (json['latitude'] as num?)?.toDouble(),
    longitude: (json['longitude'] as num?)?.toDouble(),
    pastoralTeam: (json['pastoralTeam'] as List?)?.map((e) => ParishPastoralTeamMember.fromJson(e)).toList() ?? [],
    announcements: (json['announcements'] as List?)?.map((e) => ParishAnnouncement.fromJson(e)).toList() ?? [],
    activities: (json['activities'] as List?)?.map((e) => ParishActivity.fromJson(e)).toList() ?? [],
    gallery: (json['gallery'] as List?)?.map((e) => ParishGalleryItem.fromJson(e)).toList() ?? [],
  );
}
