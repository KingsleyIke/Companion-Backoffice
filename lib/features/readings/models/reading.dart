class Reading {
  final String? id;
  final DateTime? date;
  final String dayTitle;
  final String vestment;
  final String rosaryMystery;
  final String collect;
  final List<Map<String, String>> readings;
  final String reflection;
  final String devotion;
  final DateTime? createdAt;

  Reading({
    this.id,
    this.date,
    required this.dayTitle,
    required this.vestment,
    required this.rosaryMystery,
    required this.collect,
    required this.readings,
    required this.reflection,
    required this.devotion,
    this.createdAt,
  });

  Map<String, dynamic> toJson() => {
        'date': date?.toIso8601String(),
        'dayTitle': dayTitle,
        'vestment': vestment,
        'rosaryMystery': rosaryMystery,
        'collect': collect,
        'readings': readings,
        'reflection': reflection,
        'devotion': devotion,
        'createdAt': createdAt?.toIso8601String(),
      };

  factory Reading.fromJson(Map<String, dynamic> json, {String? id}) => Reading(
        id: id,
        date: json['date'] != null ? DateTime.tryParse(json['date']) : null,
        dayTitle: json['dayTitle'] ?? '',
        vestment: json['vestment'] ?? '',
        rosaryMystery: json['rosaryMystery'] ?? '',
        collect: json['collect'] ?? '',
        readings: (json['readings'] as List?)?.map((e) => Map<String, String>.from(e)).toList() ?? [],
        reflection: json['reflection'] ?? '',
        devotion: json['devotion'] ?? '',
        createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
      );
}
