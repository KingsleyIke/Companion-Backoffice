// ─────────────────────────────────────────────────────────────────────────────
//  Daily Reading model — mirrors shared-models.ts DailyReading interface
// ─────────────────────────────────────────────────────────────────────────────

enum VestmentColor { white, red, green, violet, rose, black, gold }

extension VestmentColorX on VestmentColor {
  String get label => name[0].toUpperCase() + name.substring(1);

  static VestmentColor fromString(String s) =>
      VestmentColor.values.firstWhere(
        (e) => e.name.toLowerCase() == s.toLowerCase(),
        orElse: () => VestmentColor.green,
      );
}

enum RosaryMystery { joyful, luminous, sorrowful, glorious }

extension RosaryMysteryX on RosaryMystery {
  String get label {
    const labels = {
      RosaryMystery.joyful:   'The Joyful Mysteries',
      RosaryMystery.luminous: 'The Luminous Mysteries',
      RosaryMystery.sorrowful:'The Sorrowful Mysteries',
      RosaryMystery.glorious: 'The Glorious Mysteries',
    };
    return labels[this]!;
  }

  static RosaryMystery fromString(String s) {
    final map = {
      'The Joyful Mysteries':    RosaryMystery.joyful,
      'The Luminous Mysteries':  RosaryMystery.luminous,
      'The Sorrowful Mysteries': RosaryMystery.sorrowful,
      'The Glorious Mysteries':  RosaryMystery.glorious,
    };
    return map[s] ?? RosaryMystery.joyful;
  }
}

enum LiturgyType { ordinary, memorial, feastDay, solemnity, sunday, weekday }

extension LiturgyTypeX on LiturgyType {
  String get label {
    const labels = {
      LiturgyType.ordinary:  'Ordinary Time',
      LiturgyType.memorial:  'Memorial',
      LiturgyType.feastDay:  'Feast Day',
      LiturgyType.solemnity: 'Solemnity',
      LiturgyType.sunday:    'Sunday',
      LiturgyType.weekday:   'Weekday',
    };
    return labels[this]!;
  }

  static LiturgyType fromString(String s) {
    const map = {
      'Ordinary Time': LiturgyType.ordinary,
      'Memorial':      LiturgyType.memorial,
      'Feast Day':     LiturgyType.feastDay,
      'Solemnity':     LiturgyType.solemnity,
      'Sunday':        LiturgyType.sunday,
      'Weekday':       LiturgyType.weekday,
    };
    return map[s] ?? LiturgyType.weekday;
  }
}

enum ReadingStatus { draft, published }

extension ReadingStatusX on ReadingStatus {
  static ReadingStatus fromString(String s) =>
      ReadingStatus.values.firstWhere((e) => e.name == s, orElse: () => ReadingStatus.draft);
}

// ── Sub-models ────────────────────────────────────────────────────────────────

class ReadingEntry {
  final String id;
  final String heading;   // e.g. "First Reading"
  final String ref;       // e.g. "A reading from Isaiah 55:10-11"
  final String title;     // e.g. "The word of the Lord shall not return empty"
  final String text;      // full scripture text
  final String closing;   // e.g. "The word of the Lord."

  const ReadingEntry({
    required this.id,
    required this.heading,
    required this.ref,
    required this.title,
    required this.text,
    required this.closing,
  });

  factory ReadingEntry.fromJson(Map<String, dynamic> json) => ReadingEntry(
    id:      json['id'] as String,
    heading: json['heading'] as String,
    ref:     json['ref'] as String,
    title:   json['title'] as String? ?? '',
    text:    json['text'] as String,
    closing: json['closing'] as String? ?? '',
  );

  Map<String, dynamic> toJson() => {
    'id': id, 'heading': heading, 'ref': ref, 'title': title,
    'text': text, 'closing': closing,
  };

  ReadingEntry copyWith({
    String? id, String? heading, String? ref,
    String? title, String? text, String? closing,
  }) =>
      ReadingEntry(
        id:      id      ?? this.id,
        heading: heading ?? this.heading,
        ref:     ref     ?? this.ref,
        title:   title   ?? this.title,
        text:    text    ?? this.text,
        closing: closing ?? this.closing,
      );
}

class PsalmEntry {
  final String id;
  final String ref;       // e.g. "Psalm 19:8-11"
  final String response;  // Responsory
  final List<String> stanzas;

  const PsalmEntry({
    required this.id,
    required this.ref,
    required this.response,
    required this.stanzas,
  });

  factory PsalmEntry.fromJson(Map<String, dynamic> json) => PsalmEntry(
    id:       json['id'] as String,
    ref:      json['ref'] as String,
    response: json['response'] as String,
    stanzas:  List<String>.from(json['stanzas'] ?? []),
  );

  Map<String, dynamic> toJson() =>
      {'id': id, 'ref': ref, 'response': response, 'stanzas': stanzas};

  PsalmEntry copyWith({
    String? id, String? ref, String? response, List<String>? stanzas,
  }) =>
      PsalmEntry(
        id:       id       ?? this.id,
        ref:      ref      ?? this.ref,
        response: response ?? this.response,
        stanzas:  stanzas  ?? this.stanzas,
      );
}

class GospelAcclamation {
  final String alleluiaText;
  final String ref;
  final String verse;

  const GospelAcclamation({
    required this.alleluiaText,
    required this.ref,
    required this.verse,
  });

  factory GospelAcclamation.fromJson(Map<String, dynamic> json) =>
      GospelAcclamation(
        alleluiaText: json['alleluiaText'] as String? ?? 'Alleluia, alleluia.',
        ref:          json['ref'] as String,
        verse:        json['verse'] as String,
      );

  Map<String, dynamic> toJson() =>
      {'alleluiaText': alleluiaText, 'ref': ref, 'verse': verse};

  GospelAcclamation copyWith({
    String? alleluiaText, String? ref, String? verse,
  }) =>
      GospelAcclamation(
        alleluiaText: alleluiaText ?? this.alleluiaText,
        ref:          ref          ?? this.ref,
        verse:        verse        ?? this.verse,
      );
}

// ── Main model ────────────────────────────────────────────────────────────────

class DailyReading {
  final String id;
  final DateTime date;
  final String dayTitle;
  final LiturgyType liturgyType;
  final VestmentColor vestment;
  final RosaryMystery todaysRosary;

  // Before readings
  final String entranceAntiphon;
  final String collect;

  // Liturgy of the Word
  final ReadingEntry firstReading;
  final PsalmEntry psalm;
  final ReadingEntry? secondReading;       // optional (Sundays/Feasts)
  final GospelAcclamation gospelAcclamation;
  final ReadingEntry gospel;

  // After communion
  final String? prayerAfterCommunion;
  final String todaysReflection;
  final String personalDevotion;

  final ReadingStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;

  const DailyReading({
    required this.id,
    required this.date,
    required this.dayTitle,
    required this.liturgyType,
    required this.vestment,
    required this.todaysRosary,
    required this.entranceAntiphon,
    required this.collect,
    required this.firstReading,
    required this.psalm,
    this.secondReading,
    required this.gospelAcclamation,
    required this.gospel,
    this.prayerAfterCommunion,
    required this.todaysReflection,
    required this.personalDevotion,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory DailyReading.fromJson(Map<String, dynamic> json) => DailyReading(
    id:                   json['id'] as String,
    date:                 DateTime.parse(json['date'] as String),
    dayTitle:             json['dayTitle'] as String,
    liturgyType:          LiturgyTypeX.fromString(json['liturgyType'] as String),
    vestment:             VestmentColorX.fromString(json['vestment'] as String),
    todaysRosary:         RosaryMysteryX.fromString(json['todaysRosary'] as String),
    entranceAntiphon:     json['entranceAntiphon'] as String? ?? '',
    collect:              json['collect'] as String,
    firstReading:         ReadingEntry.fromJson(json['firstReading'] as Map<String, dynamic>),
    psalm:                PsalmEntry.fromJson(json['psalm'] as Map<String, dynamic>),
    secondReading:        json['secondReading'] != null
        ? ReadingEntry.fromJson(json['secondReading'] as Map<String, dynamic>)
        : null,
    gospelAcclamation:    GospelAcclamation.fromJson(json['gospelAcclamation'] as Map<String, dynamic>),
    gospel:               ReadingEntry.fromJson(json['gospel'] as Map<String, dynamic>),
    prayerAfterCommunion: json['prayerAfterCommunion'] as String?,
    todaysReflection:     json['todaysReflection'] as String,
    personalDevotion:     json['personalDevotion'] as String,
    status:               ReadingStatusX.fromString(json['status'] as String),
    createdAt:            DateTime.parse(json['createdAt'] as String),
    updatedAt:            DateTime.parse(json['updatedAt'] as String),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'date': '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}',
    'dayTitle': dayTitle,
    'liturgyType': liturgyType.label,
    'vestment': vestment.label,
    'todaysRosary': todaysRosary.label,
    'entranceAntiphon': entranceAntiphon,
    'collect': collect,
    'firstReading': firstReading.toJson(),
    'psalm': psalm.toJson(),
    'secondReading': secondReading?.toJson(),
    'gospelAcclamation': gospelAcclamation.toJson(),
    'gospel': gospel.toJson(),
    'prayerAfterCommunion': prayerAfterCommunion,
    'todaysReflection': todaysReflection,
    'personalDevotion': personalDevotion,
    'status': status.name,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
  };

  DailyReading copyWith({
    String? id, DateTime? date, String? dayTitle, LiturgyType? liturgyType,
    VestmentColor? vestment, RosaryMystery? todaysRosary,
    String? entranceAntiphon, String? collect,
    ReadingEntry? firstReading, PsalmEntry? psalm, ReadingEntry? secondReading,
    GospelAcclamation? gospelAcclamation, ReadingEntry? gospel,
    String? prayerAfterCommunion, String? todaysReflection, String? personalDevotion,
    ReadingStatus? status, DateTime? createdAt, DateTime? updatedAt,
  }) =>
      DailyReading(
        id:                   id                   ?? this.id,
        date:                 date                 ?? this.date,
        dayTitle:             dayTitle             ?? this.dayTitle,
        liturgyType:          liturgyType          ?? this.liturgyType,
        vestment:             vestment             ?? this.vestment,
        todaysRosary:         todaysRosary         ?? this.todaysRosary,
        entranceAntiphon:     entranceAntiphon     ?? this.entranceAntiphon,
        collect:              collect              ?? this.collect,
        firstReading:         firstReading         ?? this.firstReading,
        psalm:                psalm                ?? this.psalm,
        secondReading:        secondReading        ?? this.secondReading,
        gospelAcclamation:    gospelAcclamation    ?? this.gospelAcclamation,
        gospel:               gospel               ?? this.gospel,
        prayerAfterCommunion: prayerAfterCommunion ?? this.prayerAfterCommunion,
        todaysReflection:     todaysReflection     ?? this.todaysReflection,
        personalDevotion:     personalDevotion     ?? this.personalDevotion,
        status:               status               ?? this.status,
        createdAt:            createdAt            ?? this.createdAt,
        updatedAt:            updatedAt            ?? this.updatedAt,
      );
}
