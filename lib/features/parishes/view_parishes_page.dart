import 'package:flutter/material.dart';
import 'models/parish.dart';
import 'repositories/parish_repository.dart';
import 'package:companion/features/shared/widgets/app_drawer.dart';

class ViewParishesPage extends StatefulWidget {
  const ViewParishesPage({Key? key}) : super(key: key);

  @override
  State<ViewParishesPage> createState() => _ViewParishesPageState();
}

class _ViewParishesPageState extends State<ViewParishesPage> {
  final ParishRepository _repository = ParishRepository();
  List<Parish> _parishes = [];
  bool _loading = true;
  String? _error;
  String? _selectedCountry;
  String? _selectedArchdiocese;
  String? _selectedDeanery;

  // Example prepopulated data
  final Map<String, List<String>> _countryArchdioceses = {
    'Nigeria': ['Lagos', 'Abuja'],
    'Ghana': ['Accra', 'Kumasi'],
  };
  final Map<String, List<String>> _archdioceseDeaneries = {
    'Lagos': ['Ikeja', 'Badagry'],
    'Abuja': ['Gwagwalada', 'Kubwa'],
    'Accra': ['Osu', 'Kaneshie'],
    'Kumasi': ['Bantama', 'Asokwa'],
  };

  List<String> get _countries => _countryArchdioceses.keys.toList();
  List<String> get _archdioceses => _selectedCountry != null ? _countryArchdioceses[_selectedCountry!] ?? [] : [];
  List<String> get _deaneries => _selectedArchdiocese != null ? _archdioceseDeaneries[_selectedArchdiocese!] ?? [] : [];

  @override
  void initState() {
    super.initState();
    _fetchParishes();
  }

  Future<void> _fetchParishes() async {
    setState(() { _loading = true; _error = null; });
    try {
      if (_selectedCountry != null && _selectedArchdiocese != null && _selectedDeanery != null) {
        _parishes = await _repository.getParishes(_selectedCountry!, _selectedArchdiocese!, _selectedDeanery!);
      } else {
        _parishes = [];
      }
    } catch (e) {
      _error = e.toString();
    }
    setState(() { _loading = false; });
  }

  Future<void> _deleteParish(Parish parish) async {
    if (_selectedCountry == null || _selectedArchdiocese == null || _selectedDeanery == null || parish.id == null) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Parish'),
        content: const Text('Are you sure you want to delete this parish?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await _repository.deleteParish(_selectedCountry!, _selectedArchdiocese!, _selectedDeanery!, parish.id!);
      _fetchParishes();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error deleting: $e')),
      );
    }
  }

  void _editParish(Parish parish) {
    // TODO: Implement edit dialog or navigation to edit page
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Edit not implemented')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('View Parishes')),
      body: Row(
        children: [
          const AppDrawer(),
          Expanded(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: _selectedCountry,
                          decoration: const InputDecoration(labelText: 'Country', border: OutlineInputBorder()),
                          items: _countries.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                          onChanged: (v) => setState(() {
                            _selectedCountry = v;
                            _selectedArchdiocese = null;
                            _selectedDeanery = null;
                            _fetchParishes();
                          }),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: _selectedArchdiocese,
                          decoration: const InputDecoration(labelText: 'Archdiocese/Diocese', border: OutlineInputBorder()),
                          items: _archdioceses.map((a) => DropdownMenuItem(value: a, child: Text(a))).toList(),
                          onChanged: (v) => setState(() {
                            _selectedArchdiocese = v;
                            _selectedDeanery = null;
                            _fetchParishes();
                          }),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: _selectedDeanery,
                          decoration: const InputDecoration(labelText: 'Deanery', border: OutlineInputBorder()),
                          items: _deaneries.map((d) => DropdownMenuItem(value: d, child: Text(d))).toList(),
                          onChanged: (v) => setState(() {
                            _selectedDeanery = v;
                            _fetchParishes();
                          }),
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: _loading
                      ? const Center(child: CircularProgressIndicator())
                      : _error != null
                          ? Center(child: Text('Error: $_error'))
                          : ListView.builder(
                            itemCount: _parishes.length,
                            itemBuilder: (context, index) {
                              final parish = _parishes[index];
                              return Card(
                                margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 12),
                                child: ListTile(
                                  title: Text(parish.name),
                                  subtitle: Text('${parish.country} - ${parish.archdiocese} - ${parish.deanery}'),
                                  trailing: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      IconButton(
                                        icon: const Icon(Icons.edit, color: Colors.blue),
                                        onPressed: () => _editParish(parish),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.delete, color: Colors.red),
                                        onPressed: () => _deleteParish(parish),
                                      ),
                                    ],
                                  ),
                                  onTap: () {},
                                ),
                              );
                            },
                          ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
