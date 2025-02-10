import 'package:flutter/material.dart';

class UtilsService {
  static void showSnackBar(BuildContext context, String message, {Color? backgroundColor}) {
    final snackBar = SnackBar(
      content: Text(message),
      backgroundColor: backgroundColor ?? Colors.red, // Default color red
    );

    ScaffoldMessenger.of(context).showSnackBar(snackBar);
  }
}