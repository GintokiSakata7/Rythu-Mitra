import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../localization/app_strings.dart';
import '../../providers/language_provider.dart';

class MyDemandsScreen extends StatelessWidget {
  const MyDemandsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>().langCode;
    final s = (String k) => AppStrings.get(k, lang);

    return Scaffold(
      backgroundColor: AppTheme.warmCream,
      appBar: AppBar(title: Text(s('my_demands'))),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inbox, size: 64, color: Colors.grey.shade400),
            const SizedBox(height: 16),
            Text(
              s('no_demands'),
              style: TextStyle(color: Colors.grey.shade600, fontSize: 16),
            ),
          ],
        ),
      ),
    );
  }
}
