import 'package:companion/pages/back_office/app_drawer.dart';
import 'package:flutter/material.dart';

class Parishes extends StatelessWidget {

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          AppDrawer(),
          Expanded(
            child: Row(

            ),
          )
        ],
      )
    );
  }

}