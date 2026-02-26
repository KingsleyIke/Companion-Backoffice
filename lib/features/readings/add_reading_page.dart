import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'models/reading.dart';
import 'repositories/reading_repository.dart';
import 'viewmodels/add_reading_viewmodel.dart';
import 'package:companion/features/shared/widgets/app_drawer.dart';

class AddReadingPage extends StatelessWidget {
  final Reading? initialReading;
  const AddReadingPage({Key? key, this.initialReading}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AddReadingViewModel(ReadingRepository()),
      child: _AddReadingForm(initialReading: initialReading),
    );
  }
}

class _AddReadingForm extends StatefulWidget {
  final Reading? initialReading;
  const _AddReadingForm({Key? key, this.initialReading}) : super(key: key);

  @override
  State<_AddReadingForm> createState() => _AddReadingFormState();
}

class _AddReadingFormState extends State<_AddReadingForm> {
  final _formKey = GlobalKey<FormState>();
  DateTime? _selectedDate;
  final TextEditingController _dayTitleController = TextEditingController();
  String? _vestment;
  String? _rosaryMystery;
  final TextEditingController _collectController = TextEditingController();
  final List<Map<String, String>> _readings = [];
  final TextEditingController _reflectionController = TextEditingController();
  final TextEditingController _devotionController = TextEditingController();

  void _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
    );
    if (picked != null) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  void _addReading() async {
    final titleController = TextEditingController();
    final headingController = TextEditingController();
    final bookController = TextEditingController();
    final textController = TextEditingController();
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Reading'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: titleController,
                decoration: const InputDecoration(
                  labelText: 'Title',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: headingController,
                decoration: const InputDecoration(
                  labelText: 'Heading',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: bookController,
                decoration: const InputDecoration(
                  labelText: 'Book of the Bible',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: textController,
                maxLines: 5,
                decoration: const InputDecoration(
                  labelText: 'Reading Text',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (titleController.text.isNotEmpty && headingController.text.isNotEmpty && bookController.text.isNotEmpty && textController.text.isNotEmpty) {
                setState(() {
                  _readings.add({
                    'title': titleController.text,
                    'heading': headingController.text,
                    'book': bookController.text,
                    'text': textController.text,
                  });
                });
                Navigator.pop(context);
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  void _editReading(int index) {
    final titleController = TextEditingController(text: _readings[index]['title']);
    final headingController = TextEditingController(text: _readings[index]['heading']);
    final bookController = TextEditingController(text: _readings[index]['book']);
    final textController = TextEditingController(text: _readings[index]['text']);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Reading'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: titleController,
                decoration: const InputDecoration(
                  labelText: 'Title',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: headingController,
                decoration: const InputDecoration(
                  labelText: 'Heading',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: bookController,
                decoration: const InputDecoration(
                  labelText: 'Book of the Bible',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: textController,
                maxLines: 5,
                decoration: const InputDecoration(
                  labelText: 'Reading Text',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _readings[index] = {
                  'title': titleController.text,
                  'heading': headingController.text,
                  'book': bookController.text,
                  'text': textController.text,
                };
              });
              Navigator.pop(context);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _deleteReading(int index) {
    setState(() {
      _readings.removeAt(index);
    });
  }

  Future<void> _saveReading() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    final reading = Reading(
      id: widget.initialReading?.id,
      date: _selectedDate,
      dayTitle: _dayTitleController.text,
      vestment: _vestment ?? '',
      rosaryMystery: _rosaryMystery ?? '',
      collect: _collectController.text,
      readings: List<Map<String, String>>.from(_readings),
      reflection: _reflectionController.text,
      devotion: _devotionController.text,
      createdAt: DateTime.now(),
    );
    final viewModel = context.read<AddReadingViewModel>();
    if (reading.id != null) {
      await viewModel.updateReading(reading);
    } else {
      await viewModel.addReading(reading);
    }
    if (viewModel.error == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(reading.id != null ? 'Reading updated!' : 'Reading saved to database!')),
      );
      setState(() {
        _selectedDate = null;
        _dayTitleController.clear();
        _vestment = null;
        _rosaryMystery = null;
        _collectController.clear();
        _readings.clear();
        _reflectionController.clear();
        _devotionController.clear();
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error saving reading: ${viewModel.error}')),
      );
    }
  }

  @override
  void initState() {
    super.initState();
    if (widget.initialReading != null) {
      final r = widget.initialReading!;
      _selectedDate = r.date;
      _dayTitleController.text = r.dayTitle;
      _vestment = r.vestment;
      _rosaryMystery = r.rosaryMystery;
      _collectController.text = r.collect;
      _readings.clear();
      _readings.addAll(r.readings);
      _reflectionController.text = r.reflection;
      _devotionController.text = r.devotion;
    }
  }

  @override
  void dispose() {
    _dayTitleController.dispose();
    _collectController.dispose();
    _reflectionController.dispose();
    _devotionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Add Reading'),
      ),
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
                    // Date Picker
                    Row(
                      children: [
                        Expanded(
                          child: InkWell(
                            onTap: _pickDate,
                            child: InputDecorator(
                              decoration: const InputDecoration(
                                labelText: 'Date',
                                border: OutlineInputBorder(),
                              ),
                              child: Text(
                                _selectedDate != null
                                    ? '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}'
                                    : 'Select date',
                                style: TextStyle(
                                  color: _selectedDate != null ? Colors.black87 : Colors.grey[600],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Day Title
                    TextFormField(
                      controller: _dayTitleController,
                      decoration: const InputDecoration(
                        labelText: 'Day Title',
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) => value == null || value.isEmpty ? 'Enter day title' : null,
                    ),
                    const SizedBox(height: 16),
                    // Vestment Dropdown
                    DropdownButtonFormField<String>(
                      value: _vestment,
                      decoration: const InputDecoration(
                        labelText: 'Vestment',
                        border: OutlineInputBorder(),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'Green', child: Text('Green')),
                        DropdownMenuItem(value: 'Red', child: Text('Red')),
                        DropdownMenuItem(value: 'Violet', child: Text('Violet')),
                        DropdownMenuItem(value: 'White', child: Text('White')),
                      ],
                      onChanged: (value) => setState(() => _vestment = value),
                      validator: (value) => value == null || value.isEmpty ? 'Select vestment' : null,
                    ),
                    const SizedBox(height: 16),
                    // Rosary Mystery Dropdown
                    DropdownButtonFormField<String>(
                      value: _rosaryMystery,
                      decoration: const InputDecoration(
                        labelText: "Today's Rosary",
                        border: OutlineInputBorder(),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'The joyful mystery', child: Text('The joyful mystery')),
                        DropdownMenuItem(value: 'The Sorrowful mystery', child: Text('The Sorrowful mystery')),
                        DropdownMenuItem(value: 'The Glorious mystery', child: Text('The Glorious mystery')),
                        DropdownMenuItem(value: 'The Luminous mystery', child: Text('The Luminous mystery')),
                      ],
                      onChanged: (value) => setState(() => _rosaryMystery = value),
                      validator: (value) => value == null || value.isEmpty ? 'Select rosary mystery' : null,
                    ),
                    const SizedBox(height: 16),
                    // Collect
                    TextFormField(
                      controller: _collectController,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        labelText: 'Collect',
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) => value == null || value.isEmpty ? 'Enter collect' : null,
                    ),
                    const SizedBox(height: 16),
                    // Readings List
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Readings', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        ElevatedButton.icon(
                          onPressed: _addReading,
                          icon: const Icon(Icons.add),
                          label: const Text('Add Reading'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ..._readings.asMap().entries.map((entry) {
                      final index = entry.key;
                      final reading = entry.value;
                      return Card(
                        margin: const EdgeInsets.symmetric(vertical: 4),
                        child: ListTile(
                          title: Text(reading['title'] ?? ''),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Heading: ${reading['heading'] ?? ''}'),
                              Text('Book: ${reading['book'] ?? ''}'),
                              const SizedBox(height: 4),
                              Text(reading['text'] ?? ''),
                            ],
                          ),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.edit, color: Colors.blue),
                                onPressed: () {
                                  _editReading(index);
                                },
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete, color: Colors.red),
                                onPressed: () {
                                  _deleteReading(index);
                                },
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                    const SizedBox(height: 16),
                    // Today's Reflection
                    TextFormField(
                      controller: _reflectionController,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        labelText: "Today's Reflection",
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) => value == null || value.isEmpty ? 'Enter today\'s reflection' : null,
                    ),
                    const SizedBox(height: 16),
                    // Personal Devotion
                    TextFormField(
                      controller: _devotionController,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        labelText: 'Personal Devotion',
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) => value == null || value.isEmpty ? 'Enter personal devotion' : null,
                    ),
                    const SizedBox(height: 24),
                    // Submit Button
                    Center(
                      child: ElevatedButton(
                        onPressed: () {
                          _saveReading();
                        },
                        child: const Text('Save Reading'),
                      ),
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
