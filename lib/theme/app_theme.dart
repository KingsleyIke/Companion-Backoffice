import 'package:flutter/material.dart';

class AppColors {
  // Primary blue — Back Office brand
  static const Color primary        = Color.fromARGB(255, 26, 139, 232);
  static const Color primaryDark    = Color(0xFF1565C0);
  static const Color primaryLight   = Color(0xFFE3F2FD);
  static const Color primarySurface = Color(0xFFBBDEFB);

  // Status colours
  static const Color success        = Color(0xFF43A047);
  static const Color successLight   = Color(0xFFE8F5E9);
  static const Color warning        = Color(0xFFFFB300);
  static const Color warningLight   = Color(0xFFFFF8E1);
  static const Color error          = Color(0xFFE53935);
  static const Color errorLight     = Color(0xFFFFEBEE);
  static const Color info           = Color(0xFF039BE5);
  static const Color infoLight      = Color(0xFFE1F5FE);

  // Vestment colours (for readings)
  static const Color vestWhite      = Color(0xFFEEEEEE);
  static const Color vestRed        = Color(0xFFC62828);
  static const Color vestGreen      = Color(0xFF2E7D32);
  static const Color vestViolet     = Color(0xFF6A1B9A);
  static const Color vestRose       = Color(0xFFAD1457);
  static const Color vestBlack      = Color(0xFF212121);
  static const Color vestGold       = Color(0xFFF57F17);

  // Neutrals
  static const Color background     = Color(0xFFF5F6FA);
  static const Color surface        = Color(0xFFFFFFFF);
  static const Color border         = Color(0xFFE0E0E0);
  static const Color divider        = Color(0xFFF0F0F0);
  static const Color textPrimary    = Color(0xFF1A1A2E);
  static const Color textSecondary  = Color(0xFF6B7280);
  static const Color textHint       = Color(0xFFB0B0B0);
  static const Color sidebarBg     = Color.fromARGB(255, 6, 28, 54);
  static const Color sidebarText   = Color.fromARGB(255, 193, 56, 56);
}

class AppTheme {
  static ThemeData get lightTheme => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: Brightness.light,
      primary: AppColors.primary,
      onPrimary: Colors.white,
      secondary: AppColors.primaryDark,
      surface: AppColors.surface,
      background: AppColors.background,
      error: AppColors.error,
    ),
    scaffoldBackgroundColor: AppColors.background,

    // AppBar
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.primary,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: Colors.white,
        fontSize: 18,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.2,
      ),
    ),

    // Card
    cardTheme: CardThemeData(
      color: AppColors.surface,
      elevation: 1,
      shadowColor: Colors.black.withOpacity(0.06),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: EdgeInsets.zero,
    ),

    // ElevatedButton
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        elevation: 0,
      ),
    ),

    // OutlinedButton
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.primary,
        side: const BorderSide(color: AppColors.primary),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
      ),
    ),

    // TextButton
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.primary,
        textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
      ),
    ),

    // InputDecoration
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.surface,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.primary, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.error),
      ),
      labelStyle: const TextStyle(color: AppColors.textSecondary, fontSize: 14),
      hintStyle: const TextStyle(color: AppColors.textHint, fontSize: 13),
    ),

    // Chip
    chipTheme: ChipThemeData(
      backgroundColor: AppColors.primaryLight,
      labelStyle: const TextStyle(color: AppColors.primary, fontSize: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    ),

    // Divider
    dividerTheme: const DividerThemeData(color: AppColors.divider, thickness: 1),

    // DataTable
    dataTableTheme: const DataTableThemeData(
      headingRowColor: MaterialStatePropertyAll(AppColors.primaryLight),
      headingTextStyle: TextStyle(
        color: AppColors.primary,
        fontWeight: FontWeight.w700,
        fontSize: 13,
      ),
      dataTextStyle: TextStyle(color: AppColors.textPrimary, fontSize: 13),
    ),

    // Typography
    textTheme: const TextTheme(
      headlineLarge:  TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
      headlineMedium: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
      headlineSmall:  TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
      titleLarge:     TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
      titleMedium:    TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
      titleSmall:     TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
      bodyLarge:      TextStyle(fontSize: 15, fontWeight: FontWeight.w400, color: AppColors.textPrimary),
      bodyMedium:     TextStyle(fontSize: 13, fontWeight: FontWeight.w400, color: AppColors.textPrimary),
      bodySmall:      TextStyle(fontSize: 12, fontWeight: FontWeight.w400, color: AppColors.textSecondary),
      labelLarge:     TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
      labelSmall:     TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.textSecondary, letterSpacing: 0.5),
    ),
  );
}
