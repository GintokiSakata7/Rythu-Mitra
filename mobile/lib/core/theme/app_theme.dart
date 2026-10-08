import 'package:flutter/material.dart';

class AppTheme {
  // Brand Colors
  static const Color forestGreen = Color(0xFF1B5E20);
  static const Color leafGreen = Color(0xFF388E3C);
  static const Color lightGreen = Color(0xFF81C784);
  static const Color harvestGold = Color(0xFFF9A825);
  static const Color warmCream = Color(0xFFFFF8E1);
  static const Color offWhite = Color(0xFFF5F5F0);
  static const Color softBrown = Color(0xFF795548);
  static const Color successGreen = Color(0xFF2E7D32);
  static const Color dangerRed = Color(0xFFE53935);
  static const Color cardSurface = Color(0xFFFFFFFF);
  static const Color subtleBorder = Color(0xFFE8F5E9);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: const ColorScheme(
        brightness: Brightness.light,
        primary: forestGreen,
        onPrimary: Colors.white,
        primaryContainer: Color(0xFFE8F5E9),
        onPrimaryContainer: forestGreen,
        secondary: harvestGold,
        onSecondary: Colors.black87,
        secondaryContainer: Color(0xFFFFF9C4),
        onSecondaryContainer: Color(0xFF795548),
        surface: warmCream,
        onSurface: Color(0xFF1C1C1C),
        error: dangerRed,
        onError: Colors.white,
        outline: Color(0xFFBDBDBD),
        shadow: Color(0x1A000000),
        surfaceContainerHighest: Color(0xFFEEEEEE),
        onSurfaceVariant: Color(0xFF5D5D5D),
      ),
      scaffoldBackgroundColor: warmCream,
      appBarTheme: const AppBarTheme(
        backgroundColor: forestGreen,
        foregroundColor: Colors.white,
        centerTitle: false,
        elevation: 0,
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: forestGreen,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 56),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          elevation: 2,
        ),
      ),
      cardTheme: CardThemeData(
        color: cardSurface,
        elevation: 2,
        shadowColor: const Color(0x14000000),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        margin: const EdgeInsets.symmetric(vertical: 6),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: forestGreen, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: const Color(0xFFE8F5E9),
        selectedColor: forestGreen,
        labelStyle: const TextStyle(fontSize: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: forestGreen,
        unselectedItemColor: Color(0xFF9E9E9E),
        type: BottomNavigationBarType.fixed,
        elevation: 12,
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: forestGreen,
        brightness: Brightness.dark,
      ),
    );
  }
}
