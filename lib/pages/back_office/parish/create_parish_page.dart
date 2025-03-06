
import 'package:flutter/material.dart';

// import '../app_drawer.dart';

// class CreateParishPage extends StatelessWidget {
//
//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//         body: Row(
//           children: [
//             AppDrawer(),
//             Expanded(
//               child: Row(
//
//               ),
//             )
//           ],
//         )
//     );
//   }

// }

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:image_picker/image_picker.dart';

class CreateParishPage extends StatefulWidget {
  @override
  _CreateParishPageState createState() => _CreateParishPageState();
}

class _CreateParishPageState extends State<CreateParishPage> {
  String? selectedCountry;
  String? selectedDiocese;
  String? selectedDeanery;

  List<DocumentSnapshot> countries = [];
  List<DocumentSnapshot> dioceses = [];
  List<DocumentSnapshot> deaneries = [];

  TextEditingController nameController = TextEditingController();
  TextEditingController addressController = TextEditingController();
  TextEditingController aboutController = TextEditingController();

  String? _imageUrl;
  String? filePath;

  @override
  void initState() {
    super.initState();
    fetchCountries();
  }

  Future<void> fetchCountries() async {
    var snapshot = await FirebaseFirestore.instance.collection('countries').get();
    setState(() {
      countries = snapshot.docs;
    });
  }

  Future<void> fetchDioceses(String countryId) async {
    var snapshot = await FirebaseFirestore.instance
        .collection('dioceses')
        .where('countryId', isEqualTo: countryId)
        .get();
    setState(() {
      dioceses = snapshot.docs;
      selectedDiocese = null;
      selectedDeanery = null;
      deaneries = [];
    });
  }

  Future<void> fetchDeaneries(String dioceseId) async {
    var snapshot = await FirebaseFirestore.instance
        .collection('deaneries')
        .where('dioceseId', isEqualTo: dioceseId)
        .get();
    setState(() {
      deaneries = snapshot.docs;
      selectedDeanery = null;
    });
  }

  Future<void> pickImage() async {
    final pickedFile = await ImagePicker().pickImage(source: ImageSource.gallery);

    if (pickedFile != null) {
      setState(() {
        filePath = pickedFile.path;
      });
    }
  }

  Future<void> uploadImage() async {
    if (filePath == null) return;

    try {
      String fileName = "parishes/${DateTime.now().millisecondsSinceEpoch}.jpg";
      Reference storageRef = FirebaseStorage.instance.ref().child(fileName);
      UploadTask uploadTask = storageRef.putString(filePath!);
      TaskSnapshot snapshot = await uploadTask;

      String downloadUrl = await snapshot.ref.getDownloadURL();
      setState(() {
        _imageUrl = downloadUrl;
      });

      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Image uploaded successfully"))
      );
    } catch (e) {
      print(" Error $e");
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Image upload failed: $e"))
      );
    }
  }

  Future<void> saveParish() async {
    if (selectedDeanery == null ||
        nameController.text.isEmpty ||
        addressController.text.isEmpty ||
        aboutController.text.isEmpty ||
        _imageUrl == null) {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Please fill all fields and upload an image")));
      return;
    }

    await FirebaseFirestore.instance.collection('parishes').add({
      'name': nameController.text,
      'address': addressController.text,
      'about': aboutController.text,
      'deaneryId': selectedDeanery,
      'imageUrl': _imageUrl,
      'createdAt' : DateTime.now(),
      'createdBY' : "",
      'approved' : true
    });

    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text("Parish created successfully!")));
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Create Parish")),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              DropdownButton<String>(
                hint: Text("Select Country"),
                value: selectedCountry,
                isExpanded: true,
                items: countries.map((doc) {
                  return DropdownMenuItem<String>(
                    value: doc.id,
                    child: Text(doc['name']),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    selectedCountry = value;
                  });
                  fetchDioceses(value!);
                },
              ),
              SizedBox(height: 10),
              DropdownButton<String>(
                hint: Text("Select Diocese"),
                value: selectedDiocese,
                isExpanded: true,
                items: dioceses.map((doc) {
                  return DropdownMenuItem<String>(
                    value: doc.id,
                    child: Text(doc['name']),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    selectedDiocese = value;
                  });
                  fetchDeaneries(value!);
                },
              ),
              SizedBox(height: 10),
              DropdownButton<String>(
                hint: Text("Select Deanery"),
                value: selectedDeanery,
                isExpanded: true,
                items: deaneries.map((doc) {
                  return DropdownMenuItem<String>(
                    value: doc.id,
                    child: Text(doc['name']),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    selectedDeanery = value;
                  });
                },
              ),
              SizedBox(height: 10),
              TextField(
                controller: nameController,
                decoration: InputDecoration(labelText: "Parish Name"),
              ),
              TextField(
                controller: addressController,
                decoration: InputDecoration(labelText: "Address"),
              ),
              TextField(
                controller: aboutController,
                decoration: InputDecoration(labelText: "About"),
              ),
              SizedBox(height: 20),

              // Image Picker and Upload Button
              Center(
                child: Column(
                  children: [
                    filePath != null
                        ? Image.network(filePath!, height: 150)
                        : Icon(Icons.image, size: 100, color: Colors.grey),
                    SizedBox(height: 10),
                    ElevatedButton(
                      onPressed: pickImage,
                      child: Text("Pick Image"),
                    ),
                    SizedBox(height: 10),
                    ElevatedButton(
                      onPressed: uploadImage,
                      child: Text("Upload Image"),
                    ),
                  ],
                ),
              ),

              SizedBox(height: 20),
              ElevatedButton(
                onPressed: saveParish,
                child: Text("Create Parish"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
