import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';
import '../../providers/readings_provider.dart';
import '../../models/daily_reading.dart';
import '../../theme/app_theme.dart';
import '../../widgets/shared_widgets.dart';

// ─────────────────────────────────────────────────────────────────────────────

class AddReadingScreen extends StatefulWidget {
  final String? readingId; // null = add, non-null = edit
  const AddReadingScreen({super.key, this.readingId});

  @override
  State<AddReadingScreen> createState() => _AddReadingScreenState();
}

class _AddReadingScreenState extends State<AddReadingScreen> {
  final _uuid = const Uuid();
  bool _initialised = false;

  // ── Core fields ────────────────────────────────────────────────────────────
  late DateTime         _date;
  late LiturgyType      _liturgyType;
  late VestmentColor    _vestment;
  late RosaryMystery    _rosary;
  late ReadingStatus    _status;
  late TextEditingController _dayTitleCtrl;
  late TextEditingController _antiphonCtrl;
  late TextEditingController _collectCtrl;

  // ── First Reading ──────────────────────────────────────────────────────────
  late TextEditingController _fr_refCtrl;
  late TextEditingController _fr_titleCtrl;
  late TextEditingController _fr_textCtrl;
  late TextEditingController _fr_closingCtrl;

  // ── Psalm ──────────────────────────────────────────────────────────────────
  late TextEditingController _ps_refCtrl;
  late TextEditingController _ps_responseCtrl;
  late List<TextEditingController> _ps_stanzaCtrl;

  // ── Second Reading (optional) ──────────────────────────────────────────────
  bool _hasSecondReading = false;
  late TextEditingController _sr_refCtrl;
  late TextEditingController _sr_titleCtrl;
  late TextEditingController _sr_textCtrl;
  late TextEditingController _sr_closingCtrl;

  // ── Gospel Acclamation ────────────────────────────────────────────────────
  late TextEditingController _ga_alleluiaCtrl;
  late TextEditingController _ga_refCtrl;
  late TextEditingController _ga_verseCtrl;

  // ── Gospel ────────────────────────────────────────────────────────────────
  late TextEditingController _g_refCtrl;
  late TextEditingController _g_titleCtrl;
  late TextEditingController _g_textCtrl;
  late TextEditingController _g_closingCtrl;

  // ── After Communion ───────────────────────────────────────────────────────
  late TextEditingController _pacCtrl;
  late TextEditingController _reflectionCtrl;
  late TextEditingController _devotionCtrl;

  bool _saving = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_initialised) {
      _initialised = true;
      _init();
    }
  }

  void _init() {
    DailyReading? r;
    if (widget.readingId != null) {
      r = context.read<ReadingsProvider>().getById(widget.readingId!);
    }

    _date        = r?.date        ?? DateTime.now();
    _liturgyType = r?.liturgyType ?? LiturgyType.weekday;
    _vestment    = r?.vestment    ?? VestmentColor.green;
    _rosary      = r?.todaysRosary?? RosaryMystery.joyful;
    _status      = r?.status      ?? ReadingStatus.draft;

    _dayTitleCtrl = TextEditingController(text: r?.dayTitle ?? '');
    _antiphonCtrl = TextEditingController(text: r?.entranceAntiphon ?? '');
    _collectCtrl  = TextEditingController(text: r?.collect ?? '');

    // First Reading
    _fr_refCtrl     = TextEditingController(text: r?.firstReading.ref ?? '');
    _fr_titleCtrl   = TextEditingController(text: r?.firstReading.title ?? '');
    _fr_textCtrl    = TextEditingController(text: r?.firstReading.text ?? '');
    _fr_closingCtrl = TextEditingController(text: r?.firstReading.closing ?? 'The word of the Lord.');

    // Psalm
    _ps_refCtrl      = TextEditingController(text: r?.psalm.ref ?? '');
    _ps_responseCtrl = TextEditingController(text: r?.psalm.response ?? '');
    _ps_stanzaCtrl   = (r?.psalm.stanzas.isNotEmpty == true)
        ? r!.psalm.stanzas.map((s) => TextEditingController(text: s)).toList()
        : [TextEditingController()];

    // Second Reading
    _hasSecondReading = r?.secondReading != null;
    _sr_refCtrl     = TextEditingController(text: r?.secondReading?.ref ?? '');
    _sr_titleCtrl   = TextEditingController(text: r?.secondReading?.title ?? '');
    _sr_textCtrl    = TextEditingController(text: r?.secondReading?.text ?? '');
    _sr_closingCtrl = TextEditingController(text: r?.secondReading?.closing ?? 'The word of the Lord.');

    // Gospel Acclamation
    _ga_alleluiaCtrl = TextEditingController(text: r?.gospelAcclamation.alleluiaText ?? 'Alleluia, alleluia.');
    _ga_refCtrl      = TextEditingController(text: r?.gospelAcclamation.ref ?? '');
    _ga_verseCtrl    = TextEditingController(text: r?.gospelAcclamation.verse ?? '');

    // Gospel
    _g_refCtrl     = TextEditingController(text: r?.gospel.ref ?? '');
    _g_titleCtrl   = TextEditingController(text: r?.gospel.title ?? '');
    _g_textCtrl    = TextEditingController(text: r?.gospel.text ?? '');
    _g_closingCtrl = TextEditingController(text: r?.gospel.closing ?? 'The Gospel of the Lord.');

    // After Communion
    _pacCtrl        = TextEditingController(text: r?.prayerAfterCommunion ?? '');
    _reflectionCtrl = TextEditingController(text: r?.todaysReflection ?? '');
    _devotionCtrl   = TextEditingController(text: r?.personalDevotion ?? '');
  }

  @override
  void dispose() {
    for (final c in [
      _dayTitleCtrl, _antiphonCtrl, _collectCtrl,
      _fr_refCtrl, _fr_titleCtrl, _fr_textCtrl, _fr_closingCtrl,
      _ps_refCtrl, _ps_responseCtrl,
      _sr_refCtrl, _sr_titleCtrl, _sr_textCtrl, _sr_closingCtrl,
      _ga_alleluiaCtrl, _ga_refCtrl, _ga_verseCtrl,
      _g_refCtrl, _g_titleCtrl, _g_textCtrl, _g_closingCtrl,
      _pacCtrl, _reflectionCtrl, _devotionCtrl,
    ]) { c.dispose(); }
    for (final c in _ps_stanzaCtrl) { c.dispose(); }
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    await Future.delayed(const Duration(milliseconds: 300));

    final provider = context.read<ReadingsProvider>();
    final id       = widget.readingId ?? _uuid.v4();
    final now      = DateTime.now();

    final reading = DailyReading(
      id:           id,
      date:         _date,
      dayTitle:     _dayTitleCtrl.text.trim(),
      liturgyType:  _liturgyType,
      vestment:     _vestment,
      todaysRosary: _rosary,
      entranceAntiphon: _antiphonCtrl.text.trim(),
      collect:      _collectCtrl.text.trim(),
      firstReading: ReadingEntry(
        id:      '${id}_fr',
        heading: 'First Reading',
        ref:     _fr_refCtrl.text.trim(),
        title:   _fr_titleCtrl.text.trim(),
        text:    _fr_textCtrl.text.trim(),
        closing: _fr_closingCtrl.text.trim(),
      ),
      psalm: PsalmEntry(
        id:       '${id}_ps',
        ref:      _ps_refCtrl.text.trim(),
        response: _ps_responseCtrl.text.trim(),
        stanzas:  _ps_stanzaCtrl.map((c) => c.text.trim()).where((s) => s.isNotEmpty).toList(),
      ),
      secondReading: _hasSecondReading ? ReadingEntry(
        id:      '${id}_sr',
        heading: 'Second Reading',
        ref:     _sr_refCtrl.text.trim(),
        title:   _sr_titleCtrl.text.trim(),
        text:    _sr_textCtrl.text.trim(),
        closing: _sr_closingCtrl.text.trim(),
      ) : null,
      gospelAcclamation: GospelAcclamation(
        alleluiaText: _ga_alleluiaCtrl.text.trim(),
        ref:          _ga_refCtrl.text.trim(),
        verse:        _ga_verseCtrl.text.trim(),
      ),
      gospel: ReadingEntry(
        id:      '${id}_g',
        heading: 'Gospel',
        ref:     _g_refCtrl.text.trim(),
        title:   _g_titleCtrl.text.trim(),
        text:    _g_textCtrl.text.trim(),
        closing: _g_closingCtrl.text.trim(),
      ),
      prayerAfterCommunion: _pacCtrl.text.trim().isEmpty ? null : _pacCtrl.text.trim(),
      todaysReflection: _reflectionCtrl.text.trim(),
      personalDevotion: _devotionCtrl.text.trim(),
      status:    _status,
      createdAt: widget.readingId != null
          ? (provider.getById(widget.readingId!)?.createdAt ?? now)
          : now,
      updatedAt: now,
    );

    if (widget.readingId != null) {
      provider.updateReading(reading);
    } else {
      provider.addReading(reading);
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Reading saved successfully.'),
            backgroundColor: AppColors.success),
      );
      context.go('/readings');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.readingId != null;

    return Column(
      children: [
        PageHeader(
          title: isEditing ? 'Edit Reading' : 'Add Reading',
          subtitle: isEditing ? 'Update liturgical day data' : 'Enter all fields for this liturgical day',
          actions: [
            OutlinedButton(
              style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.white, side: const BorderSide(color: Colors.white54)),
              onPressed: () => context.go('/readings'),
              child: const Text('Cancel'),
            ),
          ],
        ),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 860),
              child: Column(
                children: [
                  _buildDayIdentity(),
                  _buildBeforeReadings(),
                  _buildFirstReading(),
                  _buildPsalm(),
                  _buildSecondReadingToggle(),
                  if (_hasSecondReading) _buildSecondReading(),
                  _buildGospelAcclamation(),
                  _buildGospel(),
                  _buildAfterCommunion(),
                  _buildStatusAndSubmit(),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  // ── Section builders ──────────────────────────────────────────────────────

  Widget _buildDayIdentity() {
    const vestColors = {
      VestmentColor.white:  Color(0xFFBDBDBD),
      VestmentColor.red:    Color(0xFFC62828),
      VestmentColor.green:  Color(0xFF2E7D32),
      VestmentColor.violet: Color(0xFF6A1B9A),
      VestmentColor.rose:   Color(0xFFAD1457),
      VestmentColor.black:  Color(0xFF212121),
      VestmentColor.gold:   Color(0xFFF57F17),
    };

    return SectionCard(
      title: 'Liturgical Day',
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: FieldLabel(
                  label: 'Date',
                  required: true,
                  child: InkWell(
                    onTap: () async {
                      final d = await showDatePicker(
                        context: context,
                        initialDate: _date,
                        firstDate: DateTime(2020),
                        lastDate: DateTime(2030),
                      );
                      if (d != null) setState(() => _date = d);
                    },
                    child: InputDecorator(
                      decoration: const InputDecoration(
                          suffixIcon: Icon(Icons.calendar_today_outlined, size: 16)),
                      child: Text(
                          '${_date.day.toString().padLeft(2,'0')}/'
                          '${_date.month.toString().padLeft(2,'0')}/'
                          '${_date.year}',
                          style: const TextStyle(fontSize: 14)),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: FieldLabel(
                  label: 'Liturgy Type',
                  required: true,
                  child: DropdownButtonFormField<LiturgyType>(
                    value: _liturgyType,
                    decoration: const InputDecoration(isDense: true),
                    items: LiturgyType.values.map((t) =>
                        DropdownMenuItem(value: t, child: Text(t.label, style: const TextStyle(fontSize: 13)))
                    ).toList(),
                    onChanged: (v) => setState(() => _liturgyType = v!),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          FieldLabel(
            label: 'Day Title',
            required: true,
            child: TextField(controller: _dayTitleCtrl,
                decoration: const InputDecoration(hintText: 'e.g. Second Sunday of Lent')),
          ),
          const SizedBox(height: 14),
          FieldLabel(
            label: 'Vestment Colour',
            required: true,
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: VestmentColor.values.map((v) {
                final c = vestColors[v]!;
                final selected = _vestment == v;
                return GestureDetector(
                  onTap: () => setState(() => _vestment = v),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      border: Border.all(
                          color: selected ? c : AppColors.border,
                          width: selected ? 2 : 1),
                      borderRadius: BorderRadius.circular(20),
                      color: selected ? c.withOpacity(0.12) : Colors.transparent,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(width: 10, height: 10,
                            decoration: BoxDecoration(color: c, shape: BoxShape.circle)),
                        const SizedBox(width: 6),
                        Text(v.label,
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600,
                                color: selected ? c : AppColors.textSecondary)),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 14),
          FieldLabel(
            label: "Today's Rosary",
            required: true,
            child: DropdownButtonFormField<RosaryMystery>(
              value: _rosary,
              decoration: const InputDecoration(isDense: true),
              items: RosaryMystery.values.map((m) =>
                  DropdownMenuItem(value: m, child: Text(m.label, style: const TextStyle(fontSize: 13)))
              ).toList(),
              onChanged: (v) => setState(() => _rosary = v!),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBeforeReadings() => SectionCard(
        collapsible: true,
        title: 'Before the Readings',
        child: Column(children: [
          FieldLabel(
            label: 'Entrance Antiphon',
            child: TextField(
              controller: _antiphonCtrl,
              maxLines: 3,
              decoration: const InputDecoration(hintText: '"My heart has said of you..."'),
            ),
          ),
          const SizedBox(height: 14),
          FieldLabel(
            label: 'Collect (Opening Prayer)',
            required: true,
            child: TextField(
              controller: _collectCtrl,
              maxLines: 4,
              decoration: const InputDecoration(hintText: 'O God, who…'),
            ),
          ),
        ]),
      );

  Widget _buildFirstReading() => SectionCard(
        collapsible: true,
        title: 'First Reading',
        child: _readingFields(
            refCtrl: _fr_refCtrl, titleCtrl: _fr_titleCtrl,
            textCtrl: _fr_textCtrl, closingCtrl: _fr_closingCtrl),
      );

  Widget _buildPsalm() => SectionCard(
        collapsible: true,
        title: 'Responsorial Psalm',
        child: Column(children: [
          Row(children: [
            Expanded(child: FieldLabel(label: 'Psalm Reference', required: true,
                child: TextField(controller: _ps_refCtrl,
                    decoration: const InputDecoration(hintText: 'e.g. Psalm 27:1, 7-8')))),
            const SizedBox(width: 14),
            Expanded(child: FieldLabel(label: 'Response / Responsory', required: true,
                child: TextField(controller: _ps_responseCtrl,
                    decoration: const InputDecoration(hintText: 'The Lord is my light…')))),
          ]),
          const SizedBox(height: 14),
          FieldLabel(
            label: 'Stanzas',
            child: Column(children: [
              ..._ps_stanzaCtrl.asMap().entries.map((e) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(children: [
                  Expanded(child: TextField(
                    controller: e.value,
                    maxLines: 3,
                    decoration: InputDecoration(
                        hintText: 'Stanza ${e.key + 1}',
                        isDense: true),
                  )),
                  const SizedBox(width: 6),
                  if (_ps_stanzaCtrl.length > 1)
                    IconButton(
                      icon: const Icon(Icons.remove_circle_outline, color: AppColors.error, size: 18),
                      onPressed: () => setState(() {
                        _ps_stanzaCtrl[e.key].dispose();
                        _ps_stanzaCtrl.removeAt(e.key);
                      }),
                    ),
                ]),
              )),
              Align(
                alignment: Alignment.centerLeft,
                child: TextButton.icon(
                  onPressed: () => setState(() => _ps_stanzaCtrl.add(TextEditingController())),
                  icon: const Icon(Icons.add, size: 14),
                  label: const Text('Add Stanza', style: TextStyle(fontSize: 12)),
                ),
              ),
            ]),
          ),
        ]),
      );

  Widget _buildSecondReadingToggle() => Card(
        margin: const EdgeInsets.only(bottom: 16),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(children: [
            const Expanded(child: Text('Second Reading',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700))),
            Text(_hasSecondReading ? 'Included (Sundays & Feasts)' : 'Not included (weekday)',
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            const SizedBox(width: 12),
            Switch(
              value: _hasSecondReading,
              activeColor: AppColors.primary,
              onChanged: (v) => setState(() => _hasSecondReading = v),
            ),
          ]),
        ),
      );

  Widget _buildSecondReading() => SectionCard(
        collapsible: false,
        title: 'Second Reading',
        child: _readingFields(
            refCtrl: _sr_refCtrl, titleCtrl: _sr_titleCtrl,
            textCtrl: _sr_textCtrl, closingCtrl: _sr_closingCtrl),
      );

  Widget _buildGospelAcclamation() => SectionCard(
        collapsible: true,
        title: 'Gospel Acclamation',
        child: Column(children: [
          FieldLabel(label: 'Alleluia Text',
              child: TextField(controller: _ga_alleluiaCtrl,
                  decoration: const InputDecoration(hintText: 'Alleluia, alleluia.'))),
          const SizedBox(height: 14),
          Row(children: [
            Expanded(child: FieldLabel(label: 'Scripture Reference', required: true,
                child: TextField(controller: _ga_refCtrl,
                    decoration: const InputDecoration(hintText: 'e.g. John 3:16')))),
            const SizedBox(width: 14),
            Expanded(child: FieldLabel(label: 'Verse', required: true,
                child: TextField(controller: _ga_verseCtrl, maxLines: 2,
                    decoration: const InputDecoration(hintText: 'Acclamation verse…')))),
          ]),
        ]),
      );

  Widget _buildGospel() => SectionCard(
        collapsible: true,
        title: 'Gospel',
        child: _readingFields(
            refCtrl: _g_refCtrl, titleCtrl: _g_titleCtrl,
            textCtrl: _g_textCtrl, closingCtrl: _g_closingCtrl,
            closingHint: 'The Gospel of the Lord.'),
      );

  Widget _buildAfterCommunion() => SectionCard(
        collapsible: true,
        title: 'After Communion & Reflection',
        child: Column(children: [
          FieldLabel(label: 'Prayer After Communion',
              child: TextField(controller: _pacCtrl, maxLines: 3,
                  decoration: const InputDecoration(hintText: 'We pray, O Lord…'))),
          const SizedBox(height: 14),
          FieldLabel(label: "Today's Reflection", required: true,
              child: TextField(controller: _reflectionCtrl, maxLines: 5,
                  decoration: const InputDecoration(hintText: 'Reflection text…'))),
          const SizedBox(height: 14),
          FieldLabel(label: 'Personal Devotion',
              child: TextField(controller: _devotionCtrl, maxLines: 3,
                  decoration: const InputDecoration(hintText: 'Spend 10 minutes in quiet prayer…'))),
        ]),
      );

  Widget _buildStatusAndSubmit() => Card(
        margin: const EdgeInsets.only(bottom: 16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(children: [
            const Text('Status:', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
            const SizedBox(width: 12),
            ...ReadingStatus.values.map((s) => Padding(
              padding: const EdgeInsets.only(right: 8),
              child: ChoiceChip(
                label: Text(s.name, style: const TextStyle(fontSize: 12)),
                selected: _status == s,
                selectedColor: AppColors.primarySurface,
                onSelected: (_) => setState(() => _status = s),
              ),
            )),
            const Spacer(),
            OutlinedButton(
              onPressed: () => context.go('/readings'),
              child: const Text('Cancel'),
            ),
            const SizedBox(width: 12),
            ElevatedButton.icon(
              onPressed: _saving ? null : _save,
              icon: _saving
                  ? const SizedBox(width: 16, height: 16,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.save_outlined, size: 16),
              label: Text(_saving ? 'Saving…' : 'Save Reading'),
            ),
          ]),
        ),
      );

  Widget _readingFields({
    required TextEditingController refCtrl,
    required TextEditingController titleCtrl,
    required TextEditingController textCtrl,
    required TextEditingController closingCtrl,
    String closingHint = 'The word of the Lord.',
  }) =>
      Column(children: [
        FieldLabel(label: 'Scripture Reference', required: true,
            child: TextField(controller: refCtrl,
                decoration: const InputDecoration(
                    hintText: 'e.g. A reading from the Book of Genesis (Gen 15:5-12)'))),
        const SizedBox(height: 14),
        FieldLabel(label: 'Reading Title',
            child: TextField(controller: titleCtrl,
                decoration: const InputDecoration(hintText: 'e.g. The covenant God made with Abraham'))),
        const SizedBox(height: 14),
        FieldLabel(label: 'Scripture Text', required: true,
            child: TextField(controller: textCtrl, maxLines: 6,
                decoration: const InputDecoration(hintText: 'Full scripture text…'))),
        const SizedBox(height: 14),
        FieldLabel(label: 'Closing',
            child: TextField(controller: closingCtrl,
                decoration: InputDecoration(hintText: closingHint))),
      ]);
}
