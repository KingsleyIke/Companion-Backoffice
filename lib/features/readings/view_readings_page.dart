import 'package:flutter/material.dart';
import 'models/reading.dart';
import 'repositories/reading_repository.dart';
import 'package:companion/features/shared/widgets/app_drawer.dart';
import 'package:companion/features/readings/add_reading_page.dart';

class ViewReadingsPage extends StatefulWidget {
  const ViewReadingsPage({Key? key}) : super(key: key);

  @override
  State<ViewReadingsPage> createState() => _ViewReadingsPageState();
}

class _ViewReadingsPageState extends State<ViewReadingsPage> {
  late final ReadingRepository _repository;
  List<Reading> _readings = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _repository = ReadingRepository();
    _fetchReadings();
  }

  Future<void> _fetchReadings() async {
    setState(() { _loading = true; _error = null; });
    try {
      _readings = await _repository.getReadings();
    } catch (e) {
      _error = e.toString();
    }
    setState(() { _loading = false; });
  }

  Future<void> _deleteReading(String id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Reading'),
        content: const Text('Are you sure you want to delete this reading? This action cannot be undone.'),
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
      await _repository.deleteReading(id);
      _fetchReadings();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error deleting: $e')),
      );
    }
  }

  void _editReading(Reading reading) async {
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => AddReadingPage(initialReading: reading),
      ),
    );
    _fetchReadings();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('View Readings')),
      body: Row(
        children: [
          const AppDrawer(),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(child: Text('Error: $_error'))
                    : ListView.builder(
                        itemCount: _readings.length,
                        itemBuilder: (context, index) {
                          final reading = _readings[index];
                          return Card(
                            margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 12),
                            child: ListTile(
                              title: Text(reading.dayTitle),
                              subtitle: Text(reading.date?.toLocal().toString().split(' ')[0] ?? ''),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.edit, color: Colors.blue),
                                    onPressed: () => _editReading(reading),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.delete, color: Colors.red),
                                    onPressed: () => _deleteReading(reading.id!),
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
    );
  }
}
