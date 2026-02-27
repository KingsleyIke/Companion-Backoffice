import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'models/parish.dart';
import 'repositories/parish_repository.dart';
import 'viewmodels/add_parish_viewmodel.dart';
import 'package:companion/features/shared/widgets/app_drawer.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:image_picker/image_picker.dart';

class AddParishPage extends StatelessWidget {
  const AddParishPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AddParishViewModel(ParishRepository()),
      child: const _AddParishForm(),
    );
  }
}

class _AddParishForm extends StatefulWidget {
  const _AddParishForm({Key? key}) : super(key: key);

  @override
  State<_AddParishForm> createState() => _AddParishFormState();
}

class _AddParishFormState extends State<_AddParishForm> {
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
    final picker = ImagePicker();
    final pickedFiles = await picker.pickMultiImage();
    if (pickedFiles.isEmpty) return;
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
    });
  }

  Future<void> _pickAndUploadImages() async {
    final picker = ImagePicker();
    final pickedFiles = await picker.pickMultiImage();
    if (pickedFiles.isEmpty) return;
    final storage = FirebaseStorage.instance;
    for (final file in pickedFiles) {
      final ref = storage.ref().child('parish_images/${DateTime.now().millisecondsSinceEpoch}_${file.name}');
      await ref.putData(await file.readAsBytes());
      final url = await ref.getDownloadURL();
      setState(() {
        _imageUrls.add(url);
      });
    }
  }

  Future<void> _saveParish() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    final country = _selectedCountry!;
    final archdiocese = _selectedArchdiocese!;
    final deanery = _selectedDeanery!;
    final parish = Parish(
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
    await viewModel.addParish(country, archdiocese, deanery, parish);
    if (viewModel.error == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Parish saved to database!')),
      );
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
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error saving parish: ${viewModel.error}')),
      );
    }
  }

  // Full list of Catholic archdioceses and dioceses in Nigeria and their deaneries
  // (This is a sample; please update with the most current/complete data as needed)
  final Map<String, List<String>> _countryArchdioceses = {
    'Nigeria': [
      'Abuja',
      'Benin City',
      'Calabar',
      'Ibadan',
      'Jos',
      'Kaduna',
      'Lagos',
      'Onitsha',
      'Owerri',
      'Abakaliki',
      'Abeokuta',
      'Ahiara',
      'Awka',
      'Bauchi',
      'Bomadi',
      'Ekiti',
      'Enugu',
      'Gboko',
      'Idah',
      'Ijebu-Ode',
      'Ilorin',
      'Issele-Uku',
      'Jalingo',
      'Kafanchan',
      'Kano',
      'Kontagora',
      'Lafia',
      'Lokoja',
      'Maiduguri',
      'Makurdi',
      'Minna',
      'Nsukka',
      'Ogoja',
      'Okigwe',
      'Orlu',
      'Osogbo',
      'Otukpo',
      'Port Harcourt',
      'Shendam',
      'Sokoto',
      'Uyo',
      'Warri',
      'Yola',
      'Zaria',
    ],
    "Ghana": [
      'Accra',
      'Kumasi',
      'Tamale',
      'Ho',
      'Sunyani',
      'Obuasi',
      'Wa',
      'Yendi',
    ],
  };
  final Map<String, List<String>> _archdioceseDeaneries = {
    'Abuja': [
      'Garki', 'Gwagwalada', 'Kubwa', 'Lugbe', 'Wuse', 'Bwari', 'Karu', 'Kuje', 'Asokoro', 'Gwagwa',
    ],
    'Benin City': [
      'Benin City', 'Uromi', 'Auchi', 'Ekpoma', 'Igueben', 'Irrua', 'Ubiaja',
    ],
    'Calabar': [
      'Calabar', 'Ikot Ekpene', 'Ogoja', 'Uyo', 'Abak', 'Eket', 'Itu',
    ],
    'Ibadan': [
      'Ibadan North', 'Ibadan South', 'Oyo', 'Ogbomoso', 'Ibarapa', 'Oke-Ogun',
    ],
    'Jos': [
      'Jos North', 'Jos South', 'Bukuru', 'Barkin Ladi', 'Pankshin', 'Shendam',
    ],
    'Kaduna': [
      'Kaduna North', 'Kaduna South', 'Zaria', 'Kafanchan', 'Saminaka', 'Kagoro',
    ],
    'Lagos': [
      'Ikeja', 'Badagry', 'Epe', 'Lagos Island', 'Yaba', 'Ikorodu', 'Festac', 'Agege', 'Surulere',
    ],
    'Onitsha': [
      'Onitsha Urban', 'Nnewi', 'Awka', 'Ogidi', 'Otuocha', 'Nnobi', 'Ihiala',
    ],
    'Owerri': [
      'Owerri', 'Orlu', 'Okigwe', 'Mbaise', 'Ngor Okpala', 'Aboh Mbaise',
    ],
  };

  List<String> get _countries => _countryArchdioceses.keys.toList();
  List<String> get _archdioceses => _selectedCountry != null ? _countryArchdioceses[_selectedCountry!] ?? [] : [];
  List<String> get _deaneries => _selectedArchdiocese != null ? _archdioceseDeaneries[_selectedArchdiocese!] ?? [] : [];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Add Parish')),
      body: Row(
        children: [
          const AppDrawer(),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
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
                    const SizedBox(height: 16),
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
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: _selectedDeanery,
                      decoration: const InputDecoration(labelText: 'Deanery', border: OutlineInputBorder()),
                      items: _deaneries.map((d) => DropdownMenuItem(value: d, child: Text(d))).toList(),
                      onChanged: (v) => setState(() => _selectedDeanery = v),
                      validator: (v) => v == null || v.isEmpty ? 'Select deanery' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(labelText: 'Parish Name', border: OutlineInputBorder()),
                      validator: (v) => v == null || v.isEmpty ? 'Enter parish name' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _addressController,
                      decoration: const InputDecoration(labelText: 'Address', border: OutlineInputBorder()),
                      validator: (v) => v == null || v.isEmpty ? 'Enter address' : null,
                    ),
                    const SizedBox(height: 16),
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
                    TextFormField(
                      controller: _websiteController,
                      decoration: const InputDecoration(labelText: 'Parish Website (optional)', border: OutlineInputBorder()),
                    ),
                    const SizedBox(height: 16),
                    // Socials
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
                        ..._socials.entries.map((e) => Chip(label: Text('${e.key}: ${e.value}'))),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Pastoral Team
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
                        ..._pastoralTeam.map((m) => Chip(label: Text(m['name'] ?? ''))),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Announcements
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
                        ..._announcements.map((a) => Chip(label: Text(a['title'] ?? ''))),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Activities
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
                        ..._activities.map((a) => Chip(label: Text(a['title'] ?? ''))),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Gallery Items
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
                                return StatefulBuilder(
                                  builder: (context, setModalState) => AlertDialog(
                                    title: const Text('Add Gallery Item'),
                                    content: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        TextFormField(controller: titleController, decoration: const InputDecoration(labelText: 'Title')),
                                        TextFormField(controller: textController, decoration: const InputDecoration(labelText: 'Text')),
                                        ElevatedButton(
                                          onPressed: () async {
                                            final picker = ImagePicker();
                                            final picked = await picker.pickMultiImage();
                                            if (picked.isNotEmpty) {
                                              final storage = FirebaseStorage.instance;
                                              for (final file in picked) {
                                                final ref = storage.ref().child('parish_gallery_item/${file.name}');
                                                await ref.putData(await file.readAsBytes());
                                                final url = await ref.getDownloadURL();
                                                setModalState(() => images.add(url));
                                              }
                                            }
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
                                );
                              },
                            );
                            if (result != null) setState(() => _gallery.add(result));
                          },
                          child: const Text('Add Gallery Item'),
                        ),
                        const SizedBox(width: 8),
                        ..._gallery.map((g) => Chip(label: Text(g['title'] ?? ''))),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Gallery image picker button
                    ElevatedButton(
                      onPressed: _pickGalleryImages,
                      child: const Text('Add Gallery Images'),
                    ),
                    // Gallery preview
                    ..._gallery.map((galleryItem) => Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if ((galleryItem['previews'] as List?)?.isNotEmpty ?? false)
                          Wrap(
                            children: (galleryItem['previews'] as List<String>).map((url) => Image.network(url, width: 80, height: 80)).toList(),
                          ),
                        if ((galleryItem['names'] as List?)?.isNotEmpty ?? false)
                          Wrap(
                            children: (galleryItem['names'] as List<String>).map((name) => Padding(
                              padding: const EdgeInsets.all(4.0),
                              child: Chip(label: Text(name)),
                            )).toList(),
                          ),
                      ],
                    )),
                    ElevatedButton(
                      onPressed: () {
                        _saveParish();
                      },
                      child: const Text('Save Parish'),
                    ),
                    const SizedBox(height: 16),
                    // Image upload button
                    ElevatedButton(
                      onPressed: _pickAndUploadImages,
                      child: const Text('Upload Images'),
                    ),
                    // Display uploaded images
                    Wrap(
                      children: _imageUrls.map((url) => Image.network(url, width: 80, height: 80)).toList(),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
