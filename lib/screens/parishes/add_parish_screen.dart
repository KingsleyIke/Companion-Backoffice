import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';
import '../../providers/parish_provider.dart';
import '../../models/parish.dart';
import '../../data/mock_data.dart';
import '../../theme/app_theme.dart';
import '../../widgets/shared_widgets.dart';

class AddParishScreen extends StatefulWidget {
  final String? parishId;
  const AddParishScreen({super.key, this.parishId});

  @override
  State<AddParishScreen> createState() => _AddParishScreenState();
}

class _AddParishScreenState extends State<AddParishScreen> {
  final _uuid          = const Uuid();
  bool  _initialised   = false;

  // ── Basic details ──────────────────────────────────────────────────────────
  late String       _country;
  late String       _arch;
  late String       _deanery;
  late ParishStatus _status;
  late TextEditingController _nameCtrl;
  late TextEditingController _addressCtrl;
  late TextEditingController _latCtrl;
  late TextEditingController _lngCtrl;
  late TextEditingController _phoneCtrl;
  late TextEditingController _emailCtrl;
  late TextEditingController _websiteCtrl;

  // ── Socials ────────────────────────────────────────────────────────────────
  late List<ParishSocial> _socials;
  final _socialPlatformCtrl = TextEditingController();
  final _socialUrlCtrl      = TextEditingController();

  // ── Mass times ─────────────────────────────────────────────────────────────
  late List<TextEditingController> _sundayCtrl;
  late List<WeekdayMassRow>        _weekdayRows;
  late List<TextEditingController> _holyDayCtrl;

  // ── Contacts ───────────────────────────────────────────────────────────────
  late List<_ContactRow> _contactRows;

  // ── Pastoral team ──────────────────────────────────────────────────────────
  late List<_PastoralRow> _pastoralRows;

  // ── Activities ─────────────────────────────────────────────────────────────
  late List<_ActivityRow> _activityRows;

  // ── Announcements ──────────────────────────────────────────────────────────
  late List<_AnnouncementRow> _announcementRows;

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
    Parish? p;
    if (widget.parishId != null) {
      p = context.read<ParishProvider>().getById(widget.parishId!);
    }

    _country = p?.country    ?? '';
    _arch    = p?.archdiocese?? '';
    _deanery = p?.deanery    ?? '';
    _status  = p?.status     ?? ParishStatus.pending;

    _nameCtrl    = TextEditingController(text: p?.name ?? '');
    _addressCtrl = TextEditingController(text: p?.address ?? '');
    _latCtrl     = TextEditingController(text: p?.latitude ?? '');
    _lngCtrl     = TextEditingController(text: p?.longitude ?? '');
    _phoneCtrl   = TextEditingController(text: p?.phone ?? '');
    _emailCtrl   = TextEditingController(text: p?.email ?? '');
    _websiteCtrl = TextEditingController(text: p?.website ?? '');

    _socials     = List.from(p?.socials ?? []);

    final mt = p?.massTimes;
    _sundayCtrl  = (mt?.sundayMasses ?? []).map((s) => TextEditingController(text: s)).toList();
    if (_sundayCtrl.isEmpty) _sundayCtrl.add(TextEditingController());
    _weekdayRows = (mt?.weekdayMasses ?? []).map((w) => WeekdayMassRow.fromModel(w)).toList();
    if (_weekdayRows.isEmpty) _weekdayRows.add(WeekdayMassRow.empty());
    _holyDayCtrl = (mt?.holyDayMasses ?? []).map((s) => TextEditingController(text: s)).toList();

    _contactRows      = (p?.contacts     ?? []).map(_ContactRow.fromModel).toList();
    _pastoralRows     = (p?.pastoralTeam ?? []).map(_PastoralRow.fromModel).toList();
    _activityRows     = (p?.activities   ?? []).map(_ActivityRow.fromModel).toList();
    _announcementRows = (p?.announcements?? []).map(_AnnouncementRow.fromModel).toList();
  }

  @override
  void dispose() {
    for (final c in [_nameCtrl, _addressCtrl, _latCtrl, _lngCtrl,
          _phoneCtrl, _emailCtrl, _websiteCtrl,
          _socialPlatformCtrl, _socialUrlCtrl]) { c.dispose(); }
    for (final c in [..._sundayCtrl, ..._holyDayCtrl]) { c.dispose(); }
    for (final r in _weekdayRows)      { r.dispose(); }
    for (final r in _contactRows)      { r.dispose(); }
    for (final r in _pastoralRows)     { r.dispose(); }
    for (final r in _activityRows)     { r.dispose(); }
    for (final r in _announcementRows) { r.dispose(); }
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    await Future.delayed(const Duration(milliseconds: 300));
    final provider = context.read<ParishProvider>();
    final id  = widget.parishId ?? _uuid.v4();
    final now = DateTime.now();

    final parish = Parish(
      id:          id,
      country:     _country,
      archdiocese: _arch,
      deanery:     _deanery,
      name:        _nameCtrl.text.trim(),
      address:     _addressCtrl.text.trim(),
      latitude:    _latCtrl.text.trim(),
      longitude:   _lngCtrl.text.trim(),
      phone:       _phoneCtrl.text.trim(),
      email:       _emailCtrl.text.trim(),
      website:     _websiteCtrl.text.trim(),
      socials:     _socials,
      massTimes: MassTimes(
        sundayMasses:  _sundayCtrl.map((c) => c.text.trim()).where((s) => s.isNotEmpty).toList(),
        weekdayMasses: _weekdayRows.map((r) => r.toModel()).where((w) => w.day.isNotEmpty).toList(),
        holyDayMasses: _holyDayCtrl.map((c) => c.text.trim()).where((s) => s.isNotEmpty).toList(),
      ),
      contacts:     _contactRows.asMap().entries
          .map((e) => e.value.toModel(_uuid.v4())).toList(),
      pastoralTeam: _pastoralRows.asMap().entries
          .map((e) => e.value.toModel(_uuid.v4())).toList(),
      activities:   _activityRows.asMap().entries
          .map((e) => e.value.toModel(_uuid.v4())).toList(),
      announcements: _announcementRows.asMap().entries
          .map((e) => e.value.toModel(_uuid.v4())).toList(),
      gallery:        const [],
      uploadedImages: const [],
      status:    _status,
      createdAt: widget.parishId != null
          ? (provider.getById(widget.parishId!)?.createdAt ?? now)
          : now,
      updatedAt: now,
    );

    if (widget.parishId != null) {
      provider.updateParish(parish);
    } else {
      provider.addParish(parish);
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Parish saved successfully.'),
            backgroundColor: AppColors.success),
      );
      context.go('/parishes');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        PageHeader(
          title: widget.parishId != null ? 'Edit Parish' : 'Add Parish',
          subtitle: widget.parishId != null
              ? 'Update parish information' : 'Fill in all parish details',
          actions: [
            OutlinedButton(
              style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.white,
                  side: const BorderSide(color: Colors.white54)),
              onPressed: () => context.go('/parishes'),
              child: const Text('Cancel'),
            ),
          ],
        ),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 860),
              child: Column(children: [
                _buildBasicDetails(),
                _buildMassTimes(),
                _buildContacts(),
                _buildPastoralTeam(),
                _buildActivities(),
                _buildAnnouncements(),
                _buildStatusAndSubmit(),
              ]),
            ),
          ),
        ),
      ],
    );
  }

  // ── Basic details ─────────────────────────────────────────────────────────
  Widget _buildBasicDetails() {
    final archs  = archdioceses[_country] ?? [];
    final deans  = deaneries[_arch] ?? [];

    return SectionCard(
      title: 'Parish Details',
      child: Column(children: [
        Row(children: [
          Expanded(child: FieldLabel(label: 'Country', required: true,
              child: DropdownButtonFormField<String>(
                value: _country.isEmpty ? null : _country,
                decoration: const InputDecoration(isDense: true),
                hint: const Text('Select country', style: TextStyle(fontSize: 13)),
                items: countries.map((c) => DropdownMenuItem(value: c,
                    child: Text(c, style: const TextStyle(fontSize: 13)))).toList(),
                onChanged: (v) => setState(() { _country = v!; _arch = ''; _deanery = ''; }),
              ))),
          const SizedBox(width: 14),
          Expanded(child: FieldLabel(label: 'Archdiocese / Diocese', required: true,
              child: DropdownButtonFormField<String>(
                value: _arch.isEmpty ? null : _arch,
                decoration: const InputDecoration(isDense: true),
                hint: const Text('Select archdiocese', style: TextStyle(fontSize: 13)),
                items: archs.map((a) => DropdownMenuItem(value: a,
                    child: Text(a, style: const TextStyle(fontSize: 13)))).toList(),
                onChanged: (v) => setState(() { _arch = v!; _deanery = ''; }),
              ))),
        ]),
        const SizedBox(height: 14),
        Row(children: [
          Expanded(child: FieldLabel(label: 'Deanery',
              child: DropdownButtonFormField<String>(
                value: _deanery.isEmpty ? null : _deanery,
                decoration: const InputDecoration(isDense: true),
                hint: const Text('Select deanery', style: TextStyle(fontSize: 13)),
                items: deans.map((d) => DropdownMenuItem(value: d,
                    child: Text(d, style: const TextStyle(fontSize: 13)))).toList(),
                onChanged: (v) => setState(() => _deanery = v!),
              ))),
          const SizedBox(width: 14),
          Expanded(child: FieldLabel(label: 'Parish Name', required: true,
              child: TextField(controller: _nameCtrl,
                  decoration: const InputDecoration(hintText: 'e.g. Christ the King Catholic Church')))),
        ]),
        const SizedBox(height: 14),
        FieldLabel(label: 'Address',
            child: TextField(controller: _addressCtrl,
                decoration: const InputDecoration(hintText: '1 Church Road, Festac Town, Lagos'))),
        const SizedBox(height: 14),
        Row(children: [
          Expanded(child: FieldLabel(label: 'Latitude',
              child: TextField(controller: _latCtrl,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(hintText: '6.4646')))),
          const SizedBox(width: 14),
          Expanded(child: FieldLabel(label: 'Longitude',
              child: TextField(controller: _lngCtrl,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(hintText: '3.2942')))),
        ]),
        const SizedBox(height: 14),
        Row(children: [
          Expanded(child: FieldLabel(label: 'Phone',
              child: TextField(controller: _phoneCtrl,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(hintText: '08012345678')))),
          const SizedBox(width: 14),
          Expanded(child: FieldLabel(label: 'Email',
              child: TextField(controller: _emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(hintText: 'parish@diocese.org')))),
        ]),
        const SizedBox(height: 14),
        FieldLabel(label: 'Website',
            child: TextField(controller: _websiteCtrl,
                keyboardType: TextInputType.url,
                decoration: const InputDecoration(hintText: 'https://parish.org'))),
        const SizedBox(height: 16),

        // Socials
        _SectionSubtitle('Social Media'),
        Row(children: [
          Expanded(child: TextField(controller: _socialPlatformCtrl,
              decoration: const InputDecoration(hintText: 'Platform (e.g. Instagram)', isDense: true))),
          const SizedBox(width: 8),
          Expanded(child: TextField(controller: _socialUrlCtrl,
              decoration: const InputDecoration(hintText: 'Handle / URL', isDense: true))),
          const SizedBox(width: 8),
          ElevatedButton(
            onPressed: () {
              if (_socialPlatformCtrl.text.isEmpty || _socialUrlCtrl.text.isEmpty) return;
              setState(() {
                _socials.add(ParishSocial(
                    platform: _socialPlatformCtrl.text.trim(),
                    url: _socialUrlCtrl.text.trim()));
                _socialPlatformCtrl.clear();
                _socialUrlCtrl.clear();
              });
            },
            child: const Text('Add'),
          ),
        ]),
        if (_socials.isNotEmpty) ...[
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _socials.asMap().entries.map((e) => Chip(
              label: Text('${e.value.platform}: ${e.value.url}',
                  style: const TextStyle(fontSize: 12)),
              deleteIcon: const Icon(Icons.close, size: 14),
              onDeleted: () => setState(() => _socials.removeAt(e.key)),
            )).toList(),
          ),
        ],
      ]),
    );
  }

  // ── Mass Times ────────────────────────────────────────────────────────────
  Widget _buildMassTimes() => SectionCard(
        collapsible: true,
        title: 'Mass Times',
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          _SectionSubtitle('Sunday Masses'),
          ..._sundayCtrl.asMap().entries.map((e) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(children: [
              SizedBox(width: 160, child: TextField(
                controller: e.value,
                decoration: InputDecoration(hintText: 'e.g. 6:30am', isDense: true,
                    labelText: 'Mass ${e.key + 1}'),
              )),
              const SizedBox(width: 6),
              if (_sundayCtrl.length > 1)
                IconButton(icon: const Icon(Icons.remove_circle_outline,
                    color: AppColors.error, size: 18),
                  onPressed: () => setState(() {
                    _sundayCtrl[e.key].dispose(); _sundayCtrl.removeAt(e.key);
                  }),
                ),
            ]),
          )),
          TextButton.icon(
            onPressed: () => setState(() => _sundayCtrl.add(TextEditingController())),
            icon: const Icon(Icons.add, size: 14),
            label: const Text('Add Sunday Mass', style: TextStyle(fontSize: 12)),
          ),
          const SizedBox(height: 12),
          _SectionSubtitle('Weekday Masses'),
          ..._weekdayRows.asMap().entries.map((e) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(children: [
              SizedBox(width: 140, child: TextField(
                controller: e.value.dayCtrl,
                decoration: const InputDecoration(hintText: 'Day(s) e.g. Mon & Fri', isDense: true),
              )),
              const SizedBox(width: 8),
              Expanded(child: Wrap(
                spacing: 8,
                children: [
                  ...e.value.timeCtrl.asMap().entries.map((t) => SizedBox(
                    width: 90,
                    child: TextField(controller: t.value,
                        decoration: InputDecoration(
                            hintText: '6:30am',
                            isDense: true,
                            suffixIcon: t.key > 0 ? GestureDetector(
                              onTap: () => setState(() {
                                e.value.timeCtrl[t.key].dispose();
                                e.value.timeCtrl.removeAt(t.key);
                              }),
                              child: const Icon(Icons.close, size: 14),
                            ) : null)),
                  )),
                  IconButton(
                    icon: const Icon(Icons.add_circle_outline, size: 18, color: AppColors.primary),
                    onPressed: () => setState(() => e.value.timeCtrl.add(TextEditingController())),
                    tooltip: 'Add time',
                  ),
                ],
              )),
              if (_weekdayRows.length > 1)
                IconButton(icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 18),
                  onPressed: () => setState(() {
                    _weekdayRows[e.key].dispose(); _weekdayRows.removeAt(e.key);
                  }),
                ),
            ]),
          )),
          TextButton.icon(
            onPressed: () => setState(() => _weekdayRows.add(WeekdayMassRow.empty())),
            icon: const Icon(Icons.add, size: 14),
            label: const Text('Add Weekday Row', style: TextStyle(fontSize: 12)),
          ),
          const SizedBox(height: 12),
          _SectionSubtitle('Holy Day Masses (Optional)'),
          Wrap(spacing: 8, runSpacing: 8, children: [
            ..._holyDayCtrl.asMap().entries.map((e) => SizedBox(
              width: 120,
              child: TextField(
                controller: e.value,
                decoration: InputDecoration(
                    hintText: '10:00am',
                    isDense: true,
                    suffixIcon: GestureDetector(
                      onTap: () => setState(() {
                        _holyDayCtrl[e.key].dispose(); _holyDayCtrl.removeAt(e.key);
                      }),
                      child: const Icon(Icons.close, size: 14),
                    )),
              ),
            )),
            IconButton(
              icon: const Icon(Icons.add_circle_outline, size: 18, color: AppColors.primary),
              onPressed: () => setState(() => _holyDayCtrl.add(TextEditingController())),
              tooltip: 'Add holy day time',
            ),
          ]),
        ]),
      );

  // ── Contacts ───────────────────────────────────────────────────────────────
  Widget _buildContacts() => SectionCard(
        collapsible: true,
        title: 'Parish Contacts',
        headerActions: [
          TextButton.icon(
            onPressed: () => setState(() => _contactRows.add(_ContactRow.empty())),
            icon: const Icon(Icons.add, size: 14),
            label: const Text('Add Contact', style: TextStyle(fontSize: 12)),
          ),
        ],
        child: Column(children: [
          if (_contactRows.isEmpty)
            const _EmptyHint('No contacts yet. Click "Add Contact" to begin.'),
          ..._contactRows.asMap().entries.map((e) => _ContactCard(
            row: e.value,
            onRemove: () => setState(() {
              _contactRows[e.key].dispose(); _contactRows.removeAt(e.key);
            }),
            onChanged: () => setState(() {}),
          )),
        ]),
      );

  // ── Pastoral Team ─────────────────────────────────────────────────────────
  Widget _buildPastoralTeam() => SectionCard(
        collapsible: true,
        title: 'Pastoral Team',
        headerActions: [
          TextButton.icon(
            onPressed: () => setState(() => _pastoralRows.add(_PastoralRow.empty())),
            icon: const Icon(Icons.add, size: 14),
            label: const Text('Add Member', style: TextStyle(fontSize: 12)),
          ),
        ],
        child: Column(children: [
          if (_pastoralRows.isEmpty)
            const _EmptyHint('No pastoral team members yet.'),
          ..._pastoralRows.asMap().entries.map((e) => _PastoralCard(
            row: e.value,
            onRemove: () => setState(() {
              _pastoralRows[e.key].dispose(); _pastoralRows.removeAt(e.key);
            }),
          )),
        ]),
      );

  // ── Activities ─────────────────────────────────────────────────────────────
  Widget _buildActivities() => SectionCard(
        collapsible: true,
        title: 'Church Activities',
        headerActions: [
          TextButton.icon(
            onPressed: () => setState(() => _activityRows.add(_ActivityRow.empty())),
            icon: const Icon(Icons.add, size: 14),
            label: const Text('Add Activity', style: TextStyle(fontSize: 12)),
          ),
        ],
        child: Column(children: [
          if (_activityRows.isEmpty)
            const _EmptyHint('No activities yet.'),
          ..._activityRows.asMap().entries.map((e) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(children: [
              Expanded(child: TextField(controller: e.value.nameCtrl,
                  decoration: const InputDecoration(hintText: 'Activity name (e.g. Confession)', isDense: true))),
              const SizedBox(width: 8),
              Expanded(child: TextField(controller: e.value.timeCtrl,
                  decoration: const InputDecoration(hintText: 'Time (e.g. Saturday: 8:30am)', isDense: true))),
              const SizedBox(width: 4),
              IconButton(icon: const Icon(Icons.remove_circle_outline, color: AppColors.error, size: 18),
                onPressed: () => setState(() {
                  _activityRows[e.key].dispose(); _activityRows.removeAt(e.key);
                }),
              ),
            ]),
          )),
        ]),
      );

  // ── Announcements ──────────────────────────────────────────────────────────
  Widget _buildAnnouncements() => SectionCard(
        collapsible: true,
        title: 'Church Announcements',
        headerActions: [
          TextButton.icon(
            onPressed: () => setState(() => _announcementRows.add(_AnnouncementRow.empty())),
            icon: const Icon(Icons.add, size: 14),
            label: const Text('Add Announcement', style: TextStyle(fontSize: 12)),
          ),
        ],
        child: Column(children: [
          if (_announcementRows.isEmpty)
            const _EmptyHint('No announcements yet.'),
          ..._announcementRows.asMap().entries.map((e) => Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(children: [
              Row(children: [
                Expanded(child: TextField(controller: e.value.titleCtrl,
                    decoration: const InputDecoration(hintText: 'Title (e.g. Confession)', isDense: true),
                    style: const TextStyle(fontWeight: FontWeight.w600))),
                IconButton(icon: const Icon(Icons.remove_circle_outline, color: AppColors.error, size: 18),
                  onPressed: () => setState(() {
                    _announcementRows[e.key].dispose(); _announcementRows.removeAt(e.key);
                  }),
                ),
              ]),
              const SizedBox(height: 8),
              TextField(controller: e.value.bodyCtrl, maxLines: 3,
                  decoration: const InputDecoration(
                      hintText: 'Full announcement text shown to app users…',
                      isDense: true)),
            ]),
          )),
        ]),
      );

  Widget _buildStatusAndSubmit() => Card(
        margin: const EdgeInsets.only(bottom: 16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(children: [
            const Text('Status:', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
            const SizedBox(width: 12),
            ...ParishStatus.values.map((s) => Padding(
              padding: const EdgeInsets.only(right: 8),
              child: ChoiceChip(
                label: Text(s.label, style: const TextStyle(fontSize: 12)),
                selected: _status == s,
                selectedColor: AppColors.primarySurface,
                onSelected: (_) => setState(() => _status = s),
              ),
            )),
            const Spacer(),
            OutlinedButton(onPressed: () => context.go('/parishes'),
                child: const Text('Cancel')),
            const SizedBox(width: 12),
            ElevatedButton.icon(
              onPressed: _saving ? null : _save,
              icon: _saving
                  ? const SizedBox(width: 16, height: 16,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.save_outlined, size: 16),
              label: Text(_saving ? 'Saving…' : 'Save Parish'),
            ),
          ]),
        ),
      );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Row helpers with controllers
// ─────────────────────────────────────────────────────────────────────────────

class WeekdayMassRow {
  final TextEditingController dayCtrl;
  final List<TextEditingController> timeCtrl;

  WeekdayMassRow({required this.dayCtrl, required this.timeCtrl});

  factory WeekdayMassRow.empty() =>
      WeekdayMassRow(dayCtrl: TextEditingController(), timeCtrl: [TextEditingController()]);

  factory WeekdayMassRow.fromModel(WeekdayMass w) => WeekdayMassRow(
    dayCtrl:  TextEditingController(text: w.day),
    timeCtrl: w.times.map((t) => TextEditingController(text: t)).toList(),
  );

  WeekdayMass toModel() => WeekdayMass(
    day:   dayCtrl.text.trim(),
    times: timeCtrl.map((c) => c.text.trim()).where((s) => s.isNotEmpty).toList(),
  );

  void dispose() {
    dayCtrl.dispose();
    for (final c in timeCtrl) { c.dispose(); }
  }
}

class _ContactRow {
  final TextEditingController roleCtrl;
  final TextEditingController nameCtrl;
  final TextEditingController phoneCtrl;
  final TextEditingController emailCtrl;

  _ContactRow({required this.roleCtrl, required this.nameCtrl,
      required this.phoneCtrl, required this.emailCtrl});

  factory _ContactRow.empty() => _ContactRow(
    roleCtrl: TextEditingController(), nameCtrl: TextEditingController(),
    phoneCtrl: TextEditingController(), emailCtrl: TextEditingController());

  factory _ContactRow.fromModel(ParishContact c) => _ContactRow(
    roleCtrl: TextEditingController(text: c.role),
    nameCtrl: TextEditingController(text: c.name),
    phoneCtrl: TextEditingController(text: c.phone),
    emailCtrl: TextEditingController(text: c.email ?? ''));

  ParishContact toModel(String id) => ParishContact(
    id: id,
    role:  roleCtrl.text.trim(),
    name:  nameCtrl.text.trim(),
    phone: phoneCtrl.text.trim(),
    email: emailCtrl.text.trim().isEmpty ? null : emailCtrl.text.trim(),
  );

  void dispose() {
    roleCtrl.dispose(); nameCtrl.dispose(); phoneCtrl.dispose(); emailCtrl.dispose();
  }
}

class _PastoralRow {
  final TextEditingController nameCtrl;
  final TextEditingController roleCtrl;
  final TextEditingController phoneCtrl;

  _PastoralRow({required this.nameCtrl, required this.roleCtrl, required this.phoneCtrl});

  factory _PastoralRow.empty() => _PastoralRow(
    nameCtrl: TextEditingController(), roleCtrl: TextEditingController(),
    phoneCtrl: TextEditingController());

  factory _PastoralRow.fromModel(PastoralTeamMember m) => _PastoralRow(
    nameCtrl: TextEditingController(text: m.name),
    roleCtrl: TextEditingController(text: m.role),
    phoneCtrl: TextEditingController(text: m.phone ?? ''));

  PastoralTeamMember toModel(String id) => PastoralTeamMember(
    id: id,
    name:  nameCtrl.text.trim(),
    role:  roleCtrl.text.trim(),
    phone: phoneCtrl.text.trim().isEmpty ? null : phoneCtrl.text.trim(),
  );

  void dispose() { nameCtrl.dispose(); roleCtrl.dispose(); phoneCtrl.dispose(); }
}

class _ActivityRow {
  final TextEditingController nameCtrl;
  final TextEditingController timeCtrl;

  _ActivityRow({required this.nameCtrl, required this.timeCtrl});

  factory _ActivityRow.empty() =>
      _ActivityRow(nameCtrl: TextEditingController(), timeCtrl: TextEditingController());

  factory _ActivityRow.fromModel(ParishActivity a) =>
      _ActivityRow(nameCtrl: TextEditingController(text: a.name),
          timeCtrl: TextEditingController(text: a.time));

  ParishActivity toModel(String id) => ParishActivity(
      id: id, name: nameCtrl.text.trim(), time: timeCtrl.text.trim());

  void dispose() { nameCtrl.dispose(); timeCtrl.dispose(); }
}

class _AnnouncementRow {
  final TextEditingController titleCtrl;
  final TextEditingController bodyCtrl;

  _AnnouncementRow({required this.titleCtrl, required this.bodyCtrl});

  factory _AnnouncementRow.empty() =>
      _AnnouncementRow(titleCtrl: TextEditingController(), bodyCtrl: TextEditingController());

  factory _AnnouncementRow.fromModel(ParishAnnouncement a) =>
      _AnnouncementRow(titleCtrl: TextEditingController(text: a.title),
          bodyCtrl: TextEditingController(text: a.body));

  ParishAnnouncement toModel(String id) =>
      ParishAnnouncement(id: id, title: titleCtrl.text.trim(), body: bodyCtrl.text.trim());

  void dispose() { titleCtrl.dispose(); bodyCtrl.dispose(); }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Sub-widgets
// ─────────────────────────────────────────────────────────────────────────────

class _SectionSubtitle extends StatelessWidget {
  final String text;
  const _SectionSubtitle(this.text);

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text(text,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700,
                color: AppColors.textSecondary, letterSpacing: 0.5)),
      );
}

class _EmptyHint extends StatelessWidget {
  final String text;
  const _EmptyHint(this.text);

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Center(child: Text(text,
            style: const TextStyle(fontSize: 12, color: AppColors.textHint))),
      );
}

class _ContactCard extends StatelessWidget {
  final _ContactRow row;
  final VoidCallback onRemove;
  final VoidCallback onChanged;
  const _ContactCard({required this.row, required this.onRemove, required this.onChanged});

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(children: [
          Row(children: [
            Expanded(child: TextField(controller: row.roleCtrl,
                decoration: const InputDecoration(labelText: 'Role', hintText: 'e.g. Parish Priest', isDense: true))),
            const SizedBox(width: 8),
            Expanded(child: TextField(controller: row.nameCtrl,
                decoration: const InputDecoration(labelText: 'Full Name', hintText: 'Rev. Fr John Doe', isDense: true))),
            const SizedBox(width: 4),
            IconButton(icon: const Icon(Icons.remove_circle_outline, color: AppColors.error, size: 18),
                onPressed: onRemove),
          ]),
          const SizedBox(height: 8),
          Row(children: [
            Expanded(child: TextField(controller: row.phoneCtrl,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'Phone', hintText: '08012345678', isDense: true))),
            const SizedBox(width: 8),
            Expanded(child: TextField(controller: row.emailCtrl,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(labelText: 'Email (optional)', hintText: 'priest@parish.ng', isDense: true))),
          ]),
        ]),
      );
}

class _PastoralCard extends StatelessWidget {
  final _PastoralRow row;
  final VoidCallback onRemove;
  const _PastoralCard({required this.row, required this.onRemove});

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(children: [
          Expanded(child: TextField(controller: row.nameCtrl,
              decoration: const InputDecoration(labelText: 'Name', isDense: true))),
          const SizedBox(width: 8),
          Expanded(child: TextField(controller: row.roleCtrl,
              decoration: const InputDecoration(labelText: 'Role / Title', isDense: true))),
          const SizedBox(width: 8),
          SizedBox(width: 140, child: TextField(controller: row.phoneCtrl,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: 'Phone (opt.)', isDense: true))),
          const SizedBox(width: 4),
          IconButton(icon: const Icon(Icons.remove_circle_outline, color: AppColors.error, size: 18),
              onPressed: onRemove),
        ]),
      );
}
