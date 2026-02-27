import 'package:companion/features/parishes/parish_location_constants.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'models/parish.dart';
import 'repositories/parish_repository.dart';
import 'viewmodels/add_parish_viewmodel.dart';
import 'package:companion/features/shared/widgets/app_drawer.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:image_picker/image_picker.dart';

class AddParishPage extends StatelessWidget {
  final Parish? parish;
  const AddParishPage({Key? key, this.parish}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AddParishViewModel(ParishRepository()),
      child: _AddParishForm(parish: parish),
    );
  }
}

class _AddParishForm extends StatefulWidget {
  final Parish? parish;
  const _AddParishForm({Key? key, this.parish}) : super(key: key);

  @override
  State<_AddParishForm> createState() => _AddParishFormState();
}

class _AddParishFormState extends State<_AddParishForm> {
      @override
      void initState() {
        super.initState();
        final parish = widget.parish;
        if (parish != null) {
          _selectedCountry = parish.country;
          _selectedArchdiocese = parish.archdiocese;
          _selectedDeanery = parish.deanery;
          _nameController.text = parish.name;
          _addressController.text = parish.address;
          _websiteController.text = parish.website ?? '';
          _latitudeController.text = parish.latitude?.toString() ?? '';
          _longitudeController.text = parish.longitude?.toString() ?? '';
          _imageUrls = List<String>.from(parish.images ?? []);
          // Prepopulate socials, team, announcements, activities, gallery if needed
          // ...
        }
      }
    bool _isUploadingImage = false;
    bool _isSaving = false;
  final _formKey = GlobalKey<FormState>();
  String? _selectedCountry;
  String? _selectedArchdiocese;
  String? _selectedDeanery;
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();
  final TextEditingController _websiteController = TextEditingController();
  List<String> _imageUrls = [];
  // Socials
  final Map<String, String> _socials = {};
  // Location
  final TextEditingController _latitudeController = TextEditingController();
  final TextEditingController _longitudeController = TextEditingController();
  // Pastoral Team
  final List<Map<String, String>> _pastoralTeam = [];
  // Announcements
  final List<Map<String, String>> _announcements = [];
  // Activities
  final List<Map<String, String>> _activities = [];
  // Gallery
  final List<Map<String, dynamic>> _gallery = [];

  // Gallery image picker
  Future<void> _pickGalleryImages() async {
    setState(() => _isUploadingImage = true);
    final picker = ImagePicker();
    final pickedFiles = await picker.pickMultiImage();
    if (pickedFiles.isEmpty) {
      setState(() => _isUploadingImage = false);
      return;
    }
    final storage = FirebaseStorage.instance;
    List<String> galleryImageUrls = [];
    for (final file in pickedFiles) {
      final ref = storage.ref().child('parish_gallery/${file.name}');
      await ref.putData(await file.readAsBytes());
      final url = await ref.getDownloadURL();
      galleryImageUrls.add(url);
    }
    setState(() {
      _gallery.add({
        'title': '',
        'text': '',
        'images': galleryImageUrls,
        'names': pickedFiles.map((f) => f.name).toList(),
        'previews': galleryImageUrls,
      });
      _isUploadingImage = false;
    });
  }

  Future<void> _pickAndUploadImages() async {
    setState(() => _isUploadingImage = true);
    final picker = ImagePicker();
    final pickedFiles = await picker.pickMultiImage();
    if (pickedFiles.isEmpty) {
      setState(() => _isUploadingImage = false);
      return;
    }
    final storage = FirebaseStorage.instance;
    for (final file in pickedFiles) {
      final ref = storage.ref().child('parish_images/${DateTime.now().millisecondsSinceEpoch}_${file.name}');
      await ref.putData(await file.readAsBytes());
      final url = await ref.getDownloadURL();
      setState(() {
        _imageUrls.add(url);
      });
    }
    setState(() => _isUploadingImage = false);
  }

  Future<void> _saveParish() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() => _isSaving = true);
    final country = _selectedCountry!;
    final archdiocese = _selectedArchdiocese!;
    final deanery = _selectedDeanery!;
    final parish = Parish(
      id: widget.parish?.id, // preserve id for update
      country: country,
      archdiocese: archdiocese,
      deanery: deanery,
      name: _nameController.text,
      address: _addressController.text,
      images: _imageUrls,
      website: _websiteController.text,
      socials: _socials,
      latitude: double.tryParse(_latitudeController.text),
      longitude: double.tryParse(_longitudeController.text),
      pastoralTeam: _pastoralTeam.map((e) => ParishPastoralTeamMember(
        name: e['name'] ?? '',
        role: e['role'] ?? '',
        phone: e['phone'] ?? '',
      )).toList(),
      announcements: _announcements.map((e) => ParishAnnouncement(
        title: e['title'] ?? '',
        text: e['text'] ?? '',
      )).toList(),
      activities: _activities.map((e) => ParishActivity(
        title: e['title'] ?? '',
        text: e['text'] ?? '',
      )).toList(),
      gallery: _gallery.map((e) => ParishGalleryItem(
        title: e['title'] ?? '',
        text: e['text'] ?? '',
        images: List<String>.from(e['images'] ?? []),
      )).toList(),
    );
    final viewModel = context.read<AddParishViewModel>();
    if (widget.parish != null) {
      await viewModel.updateParish(country, archdiocese, deanery, parish);
    } else {
      await viewModel.addParish(country, archdiocese, deanery, parish);
    }
    if (viewModel.error == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(widget.parish != null ? 'Parish updated!' : 'Parish saved to database!')),
      );
      if (widget.parish != null) {
        Navigator.pop(context, true); // signal update
        return;
      }
      setState(() {
        _nameController.clear();
        _addressController.clear();
        _websiteController.clear();
        _latitudeController.clear();
        _longitudeController.clear();
        _imageUrls.clear();
        _socials.clear();
        _pastoralTeam.clear();
        _announcements.clear();
        _activities.clear();
        _gallery.clear();
        _isSaving = false;
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error saving parish: ${viewModel.error}')),
      );
      setState(() => _isSaving = false);
    }
  }

  // Use shared constants for country/archdiocese/deanery
  static const countryArchdioceses = kCountryArchdioceses;
  static const archdioceseDeaneries = kArchdioceseDeaneries;

  List<String> get _countries => countryArchdioceses.keys.toList();
  List<String> get _archdioceses => _selectedCountry != null ? countryArchdioceses[_selectedCountry!] ?? [] : [];
  List<String> get _deaneries => _selectedArchdiocese != null ? archdioceseDeaneries[_selectedArchdiocese!] ?? [] : [];

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [ 
        Scaffold(
          appBar: AppBar(title: const Text('Add Parish')),
          body: Row(
            children: [
              const AppDrawer(),
              Expanded(
                child: Container(
                  color: Colors.grey[100],
                  child: Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 1500),
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 8),
                        child: Form(
                          key: _formKey,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                          const Text('Parish Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.stretch,
                                  children: [
                                    Card(
                                elevation: 2,
                                margin: const EdgeInsets.only(bottom: 20),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                child: Padding(
                                  padding: const EdgeInsets.all(20),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const SizedBox(height: 26),
                                      DropdownButtonFormField<String>(
                                        value: _selectedCountry,
                                        decoration: const InputDecoration(labelText: 'Country', border: OutlineInputBorder()),
                                        items: _countries.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                                        onChanged: (v) => setState(() {
                                          _selectedCountry = v;
                                          _selectedArchdiocese = null;
                                          _selectedDeanery = null;
                                        }),
                                        validator: (v) => v == null || v.isEmpty ? 'Select country' : null,
                                      ),
                                      const SizedBox(height: 36),
                                      DropdownButtonFormField<String>(
                                        value: _selectedDeanery,
                                        decoration: const InputDecoration(labelText: 'Deanery', border: OutlineInputBorder()),
                                        items: _deaneries.map((d) => DropdownMenuItem(value: d, child: Text(d))).toList(),
                                        onChanged: (v) => setState(() => _selectedDeanery = v),
                                        validator: (v) => v == null || v.isEmpty ? 'Select deanery' : null,
                                      ),
                                      const SizedBox(height: 36),
                                      TextFormField(
                                        controller: _nameController,
                                        decoration: const InputDecoration(labelText: 'Parish Name', border: OutlineInputBorder()),
                                        validator: (v) => v == null || v.isEmpty ? 'Enter parish name' : null,
                                      ),
                                      const SizedBox(height: 36),
                                      Row(
                                        children: [
                                          Expanded(
                                            child: TextFormField(
                                              controller: _latitudeController,
                                              decoration: const InputDecoration(labelText: 'Latitude', border: OutlineInputBorder()),
                                              keyboardType: TextInputType.numberWithOptions(decimal: true),
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: TextFormField(
                                              controller: _longitudeController,
                                              decoration: const InputDecoration(labelText: 'Longitude', border: OutlineInputBorder()),
                                              keyboardType: TextInputType.numberWithOptions(decimal: true),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 16),
                                      // TextFormField(
                                      //   controller: _websiteController,
                                      //   decoration: const InputDecoration(labelText: 'Parish Website (optional)', border: OutlineInputBorder()),
                                      // ),
                                      // const SizedBox(height: 16),
                                      // Socials
                                      const SizedBox(height: 24),
                                      const Divider(),
                                      const Text('Socials', style: TextStyle(fontWeight: FontWeight.bold)),
                                      const SizedBox(height: 8),
                                      Row(
                                        children: [
                                          const Text('Socials:'),
                                          const SizedBox(width: 8),
                                          ElevatedButton(
                                            onPressed: () async {
                                              final result = await showDialog<Map<String, String>>(
                                                context: context,
                                                builder: (context) {
                                                  String? selected;
                                                  final controller = TextEditingController();
                                                  return AlertDialog(
                                                    title: const Text('Add Social'),
                                                    content: Column(
                                                      mainAxisSize: MainAxisSize.min,
                                                      children: [
                                                        DropdownButtonFormField<String>(
                                                          value: selected,
                                                          items: ['Facebook', 'Instagram', 'YouTube', 'X'].map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                                                          onChanged: (v) => selected = v,
                                                          decoration: const InputDecoration(labelText: 'Type'),
                                                        ),
                                                        TextFormField(
                                                          controller: controller,
                                                          decoration: const InputDecoration(labelText: 'Handle'),
                                                        ),
                                                      ],
                                                    ),
                                                    actions: [
                                                      TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                                                      ElevatedButton(
                                                        onPressed: () {
                                                          if (selected != null && controller.text.isNotEmpty) {
                                                            Navigator.pop(context, {selected!: controller.text});
                                                          }
                                                        },
                                                        child: const Text('Add'),
                                                      ),
                                                    ],
                                                  );
                                                },
                                              );
                                              if (result != null && result.isNotEmpty) {
                                                setState(() => _socials.addAll(result));
                                              }
                                            },
                                            child: const Text('Add Social'),
                                          ),
                                          const SizedBox(width: 8),
                                          ..._socials.entries.map((e) => Padding(
                                            padding: const EdgeInsets.only(right: 4.0),
                                            child: InputChip(
                                              label: Text('${e.key}: ${e.value}'),
                                              onDeleted: () => setState(() => _socials.remove(e.key)),
                                              onPressed: () async {
                                                final controller = TextEditingController(text: e.value);
                                                final result = await showDialog<String>(
                                                  context: context,
                                                  builder: (context) => AlertDialog(
                                                    title: Text('Edit ${e.key}'),
                                                    content: TextFormField(controller: controller, decoration: const InputDecoration(labelText: 'Handle')),
                                                    actions: [
                                                      TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                                                      ElevatedButton(
                                                        onPressed: () => Navigator.pop(context, controller.text),
                                                        child: const Text('Save'),
                                                      ),
                                                    ],
                                                  ),
                                                );
                                                if (result != null && result.isNotEmpty) setState(() => _socials[e.key] = result);
                                              },
                                            ),
                                          )),
                                        ],
                                      ),
                                      const SizedBox(height: 24),
                                      const Divider(),
                                      const Text('Announcements', style: TextStyle(fontWeight: FontWeight.bold)),
                                      const SizedBox(height: 8),
                                      Row(
                                        children: [
                                          const Text('Announcements:'),
                                          const SizedBox(width: 8),
                                          ElevatedButton(
                                            onPressed: () async {
                                              final result = await showDialog<Map<String, String>>(
                                                context: context,
                                                builder: (context) {
                                                  final titleController = TextEditingController();
                                                  final textController = TextEditingController();
                                                  return AlertDialog(
                                                    title: const Text('Add Announcement'),
                                                    content: Column(
                                                      mainAxisSize: MainAxisSize.min,
                                                      children: [
                                                        TextFormField(controller: titleController, decoration: const InputDecoration(labelText: 'Title')),
                                                        TextFormField(controller: textController, decoration: const InputDecoration(labelText: 'Text')),
                                                      ],
                                                    ),
                                                    actions: [
                                                      TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                                                      ElevatedButton(
                                                        onPressed: () {
                                                          if (titleController.text.isNotEmpty) {
                                                            Navigator.pop(context, {
                                                              'title': titleController.text,
                                                              'text': textController.text,
                                                            });
                                                          }
                                                        },
                                                        child: const Text('Add'),
                                                      ),
                                                    ],
                                                  );
                                                },
                                              );
                                              if (result != null) setState(() => _announcements.add(result));
                                            },
                                            child: const Text('Add Announcement'),
                                          ),
                                          const SizedBox(width: 8),
                                          ..._announcements.asMap().entries.map((entry) => Padding(
                                            padding: const EdgeInsets.only(right: 4.0),
                                            child: InputChip(
                                              label: Text(entry.value['title'] ?? ''),
                                              onDeleted: () => setState(() => _announcements.removeAt(entry.key)),
                                              onPressed: () async {
                                                final titleController = TextEditingController(text: entry.value['title']);
                                                final textController = TextEditingController(text: entry.value['text']);
                                                final result = await showDialog<Map<String, String>>(
                                                  context: context,
                                                  builder: (context) => AlertDialog(
                                                    title: const Text('Edit Announcement'),
                                                    content: Column(
                                                      mainAxisSize: MainAxisSize.min,
                                                      children: [
                                                        TextFormField(controller: titleController, decoration: const InputDecoration(labelText: 'Title')),
                                                        TextFormField(controller: textController, decoration: const InputDecoration(labelText: 'Text')),
                                                      ],
                                                    ),
                                                    actions: [
                                                      TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                                                      ElevatedButton(
                                                        onPressed: () => Navigator.pop(context, {
                                                          'title': titleController.text,
                                                          'text': textController.text,
                                                        }),
                                                        child: const Text('Save'),
                                                      ),
                                                    ],
                                                  ),
                                                );
                                                if (result != null) setState(() => _announcements[entry.key] = result);
                                              },
                                            ),
                                          )),
                                        ],
                                      ),
                                      const SizedBox(height: 24),
                                      const Divider(),
                                      const Text('Uploaded Images', style: TextStyle(fontWeight: FontWeight.bold)),
                                      const SizedBox(height: 8),
                                      ElevatedButton.icon(
                                        onPressed: _isUploadingImage ? null : _pickAndUploadImages,
                                        icon: const Icon(Icons.upload),
                                        label: const Text('Upload Images'),
                                        style: ElevatedButton.styleFrom(
                                          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                                        ),
                                      ),
                                      const SizedBox(height: 12),
                                      SizedBox(
                                        height: 100,
                                        child: SingleChildScrollView(
                                          scrollDirection: Axis.horizontal,
                                          child: Row(
                                            children: _imageUrls.asMap().entries.map((entry) => Container(
                                              margin: const EdgeInsets.only(right: 8),
                                              child: Stack(
                                                alignment: Alignment.topRight,
                                                children: [
                                                  Image.network(entry.value, width: 80, height: 80),
                                                  IconButton(
                                                    icon: const Icon(Icons.cancel, size: 18, color: Colors.red),
                                                    onPressed: () => setState(() => _imageUrls.removeAt(entry.key)),
                                                  ),
                                                ],
                                              ),
                                            )).toList(),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                                  ],

                                ),
                              ),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.stretch,
                                  children: [
                                    Card(
                                elevation: 2,
                                margin: const EdgeInsets.only(bottom: 20),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                child: Padding(
                                  padding: const EdgeInsets.all(20),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const SizedBox(height: 26),
                                      DropdownButtonFormField<String>(
                                        value: _selectedArchdiocese,
                                        decoration: const InputDecoration(labelText: 'Archdiocese/Diocese', border: OutlineInputBorder()),
                                        items: _archdioceses.map((a) => DropdownMenuItem(value: a, child: Text(a))).toList(),
                                        onChanged: (v) => setState(() {
                                          _selectedArchdiocese = v;
                                          _selectedDeanery = null;
                                        }),
                                        validator: (v) => v == null || v.isEmpty ? 'Select archdiocese/diocese' : null,
                                      ),
                                      const SizedBox(height: 36),
                                      TextFormField(
                                        controller: _nameController,
                                        decoration: const InputDecoration(labelText: 'Parish Name', border: OutlineInputBorder()),
                                        validator: (v) => v == null || v.isEmpty ? 'Enter parish name' : null,
                                      ),
                                      const SizedBox(height: 36),
                                      TextFormField(
                                        controller: _addressController,
                                        decoration: const InputDecoration(labelText: 'Address', border: OutlineInputBorder()),
                                        validator: (v) => v == null || v.isEmpty ? 'Enter address' : null,
                                      ),
                                      const SizedBox(height: 36),
                                      // Row(
                                      //   children: [
                                      //     Expanded(
                                      //       child: TextFormField(
                                      //         controller: _latitudeController,
                                      //         decoration: const InputDecoration(labelText: 'Latitude', border: OutlineInputBorder()),
                                      //         keyboardType: TextInputType.numberWithOptions(decimal: true),
                                      //       ),
                                      //     ),
                                      //     const SizedBox(width: 8),
                                      //     Expanded(
                                      //       child: TextFormField(
                                      //         controller: _longitudeController,
                                      //         decoration: const InputDecoration(labelText: 'Longitude', border: OutlineInputBorder()),
                                      //         keyboardType: TextInputType.numberWithOptions(decimal: true),
                                      //       ),
                                      //     ),
                                      //   ],
                                      // ),
                                      // const SizedBox(height: 16),
                                      TextFormField(
                                        controller: _websiteController,
                                        decoration: const InputDecoration(labelText: 'Parish Website (optional)', border: OutlineInputBorder()),
                                      ),
                                      const SizedBox(height: 16),
                                      const SizedBox(height: 24),
                                      const Divider(),
                                      const Text('Pastoral Team', style: TextStyle(fontWeight: FontWeight.bold)),
                                      const SizedBox(height: 8),
                                      Row(
                                        children: [
                                          const Text('Pastoral Team:'),
                                          const SizedBox(width: 8),
                                          ElevatedButton(
                                            onPressed: () async {
                                              final result = await showDialog<Map<String, String>>(
                                                context: context,
                                                builder: (context) {
                                                  final nameController = TextEditingController();
                                                  final roleController = TextEditingController();
                                                  final phoneController = TextEditingController();
                                                  return AlertDialog(
                                                    title: const Text('Add Pastoral Team Member'),
                                                    content: Column(
                                                      mainAxisSize: MainAxisSize.min,
                                                      children: [
                                                        TextFormField(controller: nameController, decoration: const InputDecoration(labelText: 'Name')),
                                                        TextFormField(controller: roleController, decoration: const InputDecoration(labelText: 'Role')),
                                                        TextFormField(controller: phoneController, decoration: const InputDecoration(labelText: 'Phone')),
                                                      ],
                                                    ),
                                                    actions: [
                                                      TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                                                      ElevatedButton(
                                                        onPressed: () {
                                                          if (nameController.text.isNotEmpty) {
                                                            Navigator.pop(context, {
                                                              'name': nameController.text,
                                                              'role': roleController.text,
                                                              'phone': phoneController.text,
                                                            });
                                                          }
                                                        },
                                                        child: const Text('Add'),
                                                      ),
                                                    ],
                                                  );
                                                },
                                              );
                                              if (result != null) setState(() => _pastoralTeam.add(result));
                                            },
                                            child: const Text('Add Member'),
                                          ),
                                          const SizedBox(width: 8),
                                          ..._pastoralTeam.asMap().entries.map((entry) => Padding(
                                            padding: const EdgeInsets.only(right: 4.0),
                                            child: InputChip(
                                              label: Text(entry.value['name'] ?? ''),
                                              onDeleted: () => setState(() => _pastoralTeam.removeAt(entry.key)),
                                              onPressed: () async {
                                                final nameController = TextEditingController(text: entry.value['name']);
                                                final roleController = TextEditingController(text: entry.value['role']);
                                                final phoneController = TextEditingController(text: entry.value['phone']);
                                                final result = await showDialog<Map<String, String>>(
                                                  context: context,
                                                  builder: (context) => AlertDialog(
                                                    title: const Text('Edit Pastoral Team Member'),
                                                    content: Column(
                                                      mainAxisSize: MainAxisSize.min,
                                                      children: [
                                                        TextFormField(controller: nameController, decoration: const InputDecoration(labelText: 'Name')),
                                                        TextFormField(controller: roleController, decoration: const InputDecoration(labelText: 'Role')),
                                                        TextFormField(controller: phoneController, decoration: const InputDecoration(labelText: 'Phone')),
                                                      ],
                                                    ),
                                                    actions: [
                                                      TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                                                      ElevatedButton(
                                                        onPressed: () => Navigator.pop(context, {
                                                          'name': nameController.text,
                                                          'role': roleController.text,
                                                          'phone': phoneController.text,
                                                        }),
                                                        child: const Text('Save'),
                                                      ),
                                                    ],
                                                  ),
                                                );
                                                if (result != null) setState(() => _pastoralTeam[entry.key] = result);
                                              },
                                            ),
                                          )),
                                        ],
                                      ),
                                      const SizedBox(height: 24),
                                      const Divider(),
                                      const Text('Activities', style: TextStyle(fontWeight: FontWeight.bold)),
                                      const SizedBox(height: 8),
                                      Row(
                                        children: [
                                          const Text('Activities:'),
                                          const SizedBox(width: 8),
                                          ElevatedButton(
                                            onPressed: () async {
                                              final result = await showDialog<Map<String, String>>(
                                                context: context,
                                                builder: (context) {
                                                  final titleController = TextEditingController();
                                                  final textController = TextEditingController();
                                                  return AlertDialog(
                                                    title: const Text('Add Activity'),
                                                    content: Column(
                                                      mainAxisSize: MainAxisSize.min,
                                                      children: [
                                                        TextFormField(controller: titleController, decoration: const InputDecoration(labelText: 'Title')),
                                                        TextFormField(controller: textController, decoration: const InputDecoration(labelText: 'Text')),
                                                      ],
                                                    ),
                                                    actions: [
                                                      TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                                                      ElevatedButton(
                                                        onPressed: () {
                                                          if (titleController.text.isNotEmpty) {
                                                            Navigator.pop(context, {
                                                              'title': titleController.text,
                                                              'text': textController.text,
                                                            });
                                                          }
                                                        },
                                                        child: const Text('Add'),
                                                      ),
                                                    ],
                                                  );
                                                },
                                              );
                                              if (result != null) setState(() => _activities.add(result));
                                            },
                                            child: const Text('Add Activity'),
                                          ),
                                          const SizedBox(width: 8),
                                          ..._activities.asMap().entries.map((entry) => Padding(
                                            padding: const EdgeInsets.only(right: 4.0),
                                            child: InputChip(
                                              label: Text(entry.value['title'] ?? ''),
                                              onDeleted: () => setState(() => _activities.removeAt(entry.key)),
                                              onPressed: () async {
                                                final titleController = TextEditingController(text: entry.value['title']);
                                                final textController = TextEditingController(text: entry.value['text']);
                                                final result = await showDialog<Map<String, String>>(
                                                  context: context,
                                                  builder: (context) => AlertDialog(
                                                    title: const Text('Edit Activity'),
                                                    content: Column(
                                                      mainAxisSize: MainAxisSize.min,
                                                      children: [
                                                        TextFormField(controller: titleController, decoration: const InputDecoration(labelText: 'Title')),
                                                        TextFormField(controller: textController, decoration: const InputDecoration(labelText: 'Text')),
                                                      ],
                                                    ),
                                                    actions: [
                                                      TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                                                      ElevatedButton(
                                                        onPressed: () => Navigator.pop(context, {
                                                          'title': titleController.text,
                                                          'text': textController.text,
                                                        }),
                                                        child: const Text('Save'),
                                                      ),
                                                    ],
                                                  ),
                                                );
                                                if (result != null) setState(() => _activities[entry.key] = result);
                                              },
                                            ),
                                          )),
                                        ],
                                      ),
                                      const SizedBox(height: 24),
                                      const Divider(),
                                      const Text('Gallery Items', style: TextStyle(fontWeight: FontWeight.bold)),
                                      const SizedBox(height: 8),
                                      Row(
                                        children: [
                                          const Text('Gallery Items:'),
                                          const SizedBox(width: 8),
                                          ElevatedButton(
                                            onPressed: () async {
                                              final result = await showDialog<Map<String, dynamic>>(
                                                context: context,
                                                builder: (context) {
                                                  final titleController = TextEditingController();
                                                  final textController = TextEditingController();
                                                  List<String> images = [];
                                                  bool isUploading = false;
                                                  return StatefulBuilder(
                                                    builder: (context, setModalState) => Stack(
                                                      children: [
                                                        AlertDialog(
                                                          title: const Text('Add Gallery Item'),
                                                          content: Column(
                                                            mainAxisSize: MainAxisSize.min,
                                                            children: [
                                                              TextFormField(controller: titleController, decoration: const InputDecoration(labelText: 'Title')),
                                                              TextFormField(controller: textController, decoration: const InputDecoration(labelText: 'Text')),
                                                              ElevatedButton(
                                                                onPressed: () async {
                                                                  setModalState(() => isUploading = true);
                                                                  final picker = ImagePicker();
                                                                  final picked = await picker.pickMultiImage();
                                                                  if (picked.isNotEmpty) {
                                                                    final storage = FirebaseStorage.instance;
                                                                    for (final file in picked) {
                                                                      final ref = storage.ref().child('parish_gallery_item/${file.name}');
                                                                      await ref.putData(await file.readAsBytes());
                                                                      final url = await ref.getDownloadURL();
                                                                      images.add(url);
                                                                    }
                                                                  }
                                                                  setModalState(() => isUploading = false);
                                                                },
                                                                child: const Text('Add Images'),
                                                              ),
                                                              Wrap(
                                                                children: images.map((url) => Image.network(url, width: 60, height: 60)).toList(),
                                                              ),
                                                            ],
                                                          ),
                                                          actions: [
                                                            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                                                            ElevatedButton(
                                                              onPressed: () {
                                                                if (titleController.text.isNotEmpty) {
                                                                  Navigator.pop(context, {
                                                                    'title': titleController.text,
                                                                    'text': textController.text,
                                                                    'images': images,
                                                                  });
                                                                }
                                                              },
                                                              child: const Text('Add'),
                                                            ),
                                                          ],
                                                        ),
                                                        if (isUploading)
                                                          Positioned.fill(
                                                            child: Container(
                                                              color: Colors.black.withOpacity(0.3),
                                                              child: const Center(child: CircularProgressIndicator()),
                                                            ),
                                                          ),
                                                      ],
                                                    ),
                                                  );
                                                },
                                              );
                                              if (result != null) setState(() => _gallery.add(result));
                                            },
                                            child: const Text('Add Gallery Item'),
                                          ),
                                          const SizedBox(width: 8),
                                          ..._gallery.asMap().entries.map((entry) => Padding(
                                            padding: const EdgeInsets.only(right: 4.0),
                                            child: InputChip(
                                              label: Text(entry.value['title'] ?? ''),
                                              onDeleted: () => setState(() => _gallery.removeAt(entry.key)),
                                              onPressed: () async {
                                                final titleController = TextEditingController(text: entry.value['title']);
                                                final textController = TextEditingController(text: entry.value['text']);
                                                // For images, just show count and allow removal
                                                final result = await showDialog<Map<String, dynamic>>(
                                                  context: context,
                                                  builder: (context) => AlertDialog(
                                                    title: const Text('Edit Gallery Item'),
                                                    content: Column(
                                                      mainAxisSize: MainAxisSize.min,
                                                      children: [
                                                        TextFormField(controller: titleController, decoration: const InputDecoration(labelText: 'Title')),
                                                        TextFormField(controller: textController, decoration: const InputDecoration(labelText: 'Text')),
                                                        if ((entry.value['images'] as List?)?.isNotEmpty ?? false)
                                                          Wrap(
                                                            children: (entry.value['images'] as List<String>).asMap().entries.map((imgEntry) => Stack(
                                                              alignment: Alignment.topRight,
                                                              children: [
                                                                Image.network(imgEntry.value, width: 60, height: 60),
                                                                IconButton(
                                                                  icon: const Icon(Icons.cancel, size: 18, color: Colors.red),
                                                                  onPressed: () {
                                                                    entry.value['images'].removeAt(imgEntry.key);
                                                                    (context as Element).markNeedsBuild();
                                                                  },
                                                                ),
                                                              ],
                                                            )).toList(),
                                                          ),
                                                      ],
                                                    ),
                                                    actions: [
                                                      TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                                                      ElevatedButton(
                                                        onPressed: () => Navigator.pop(context, {
                                                          'title': titleController.text,
                                                          'text': textController.text,
                                                          'images': entry.value['images'],
                                                        }),
                                                        child: const Text('Save'),
                                                      ),
                                                    ],
                                                  ),
                                                );
                                                if (result != null) setState(() => _gallery[entry.key] = result);
                                              },
                                            ),
                                          )),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                                  ],
                                  
                                )
                              ),
                            ],
                            ),
                            
                            const SizedBox(height: 32),
                          Align(
                            alignment: Alignment.center,
                            child: SizedBox(
                              width: 220,
                              child: ElevatedButton(
                                onPressed: _isSaving ? null : _saveParish,
                                style: ElevatedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 18),
                                  textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                child: const Text('Save Parish'),
                              ),
                            ),
                          ),
                            ],
                          ),
                      ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
        ),
        ),
        if (_isUploadingImage || _isSaving)
          Container(
            color: Colors.black.withOpacity(0.4),
            child: const Center(
              child: CircularProgressIndicator(),
            ),
          ),
      ],
    );
  }
}
