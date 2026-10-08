import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/config/app_config.dart';
import '../../localization/app_strings.dart';
import '../../providers/language_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final langProv = context.watch<LanguageProvider>();
    final s = (String k) => AppStrings.get(k, langProv.langCode);

    return Scaffold(
      backgroundColor: AppTheme.warmCream,
      appBar: AppBar(title: Text(s('profile'))),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Header
          Center(
            child: Column(
              children: [
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: AppTheme.forestGreen.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.person, size: 60, color: AppTheme.forestGreen),
                ),
                const SizedBox(height: 16),
                Text(
                  '${s('welcome')}, ${s('farmer')}',
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          const SizedBox(height: 48),

          // Settings
          const Text('Settings', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
          const SizedBox(height: 12),
          
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE0E0E0)),
            ),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.language, color: AppTheme.forestGreen),
                  title: Text(s('language_settings')),
                  trailing: DropdownButton<String>(
                    value: langProv.langCode,
                    underline: const SizedBox(),
                    items: const [
                      DropdownMenuItem(value: 'en', child: Text('English')),
                      DropdownMenuItem(value: 'te', child: Text('తెలుగు')),
                      DropdownMenuItem(value: 'hi', child: Text('हिन्दी')),
                    ],
                    onChanged: (v) {
                      if (v != null) langProv.setLanguage(v);
                    },
                  ),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.link, color: AppTheme.forestGreen),
                  title: Text(s('backend_url')),
                  subtitle: const Text(AppConfig.baseUrl),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),

          // About
          const Text('About', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
          const SizedBox(height: 12),
          
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE0E0E0)),
            ),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.info_outline, color: AppTheme.forestGreen),
                  title: Text(s('about')),
                  subtitle: const Text('Smart agricultural marketplace'),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.system_update, color: AppTheme.forestGreen),
                  title: Text(s('version')),
                  subtitle: const Text(AppConfig.appVersion),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
