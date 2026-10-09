import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/language_provider.dart';
import '../language/language_screen.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>().langCode;

    return Scaffold(
      backgroundColor: AppTheme.warmCream,
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSectionHeader('ACCOUNT'),
          _buildSettingItem(
            icon: Icons.person_outline,
            title: 'Profile',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('You are viewing your profile.')));
            },
          ),
          _buildSettingItem(
            icon: Icons.edit_outlined,
            title: 'Edit Profile',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile edit locked in demo mode')));
            },
          ),
          const SizedBox(height: 24),

          _buildSectionHeader('LANGUAGE'),
          _buildSettingItem(
            icon: Icons.language,
            title: 'App Language',
            subtitle: lang.toUpperCase(),
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const LanguageScreen()));
            },
          ),
          const SizedBox(height: 24),

          _buildSectionHeader('NOTIFICATIONS'),
          _buildSettingSwitch(
            icon: Icons.notifications_active_outlined,
            title: 'Push Notifications',
            value: true,
            onChanged: (val) {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Push Notifications settings updated')));
            },
          ),
          _buildSettingSwitch(
            icon: Icons.price_change_outlined,
            title: 'Market Price Alerts',
            value: true,
            onChanged: (val) {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Market Price Alerts updated')));
            },
          ),
          const SizedBox(height: 24),

          _buildSectionHeader('LOCATION'),
          _buildSettingItem(
            icon: Icons.my_location,
            title: 'Location Permissions',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Location Permissions are managed by your OS')));
            },
          ),
          const SizedBox(height: 24),

          _buildSectionHeader('SUPPORT & LEGAL'),
          _buildSettingItem(
            icon: Icons.help_outline,
            title: 'Help',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Connecting to Help Center...')));
            },
          ),
          _buildSettingItem(
            icon: Icons.contact_support_outlined,
            title: 'Contact Support',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Contacting Support...')));
            },
          ),
          _buildSettingItem(
            icon: Icons.privacy_tip_outlined,
            title: 'Privacy Policy',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Privacy Policy details')));
            },
          ),
          const SizedBox(height: 24),
          
          _buildSectionHeader('DEVELOPER'),
          _buildSettingItem(
            icon: Icons.restore,
            title: 'Reset App Data',
            subtitle: 'Clears saved language and onboarding',
            onTap: () async {
              final prefs = await SharedPreferences.getInstance();
              await prefs.clear();
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('App data reset! Please restart the app.')),
                );
                Navigator.of(context).pushNamedAndRemoveUntil('/', (route) => false);
              }
            },
          ),
          const SizedBox(height: 40),

          const Center(
            child: Text(
              'Version 1.0.0',
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 16, bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          color: AppTheme.forestGreen,
          fontSize: 13,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildSettingItem({
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 2),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Icon(icon, color: AppTheme.forestGreen),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w500)),
        subtitle: subtitle != null ? Text(subtitle, style: const TextStyle(color: Colors.grey)) : null,
        trailing: const Icon(Icons.chevron_right, color: Colors.grey),
        onTap: onTap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  Widget _buildSettingSwitch({
    required IconData icon,
    required String title,
    String? subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 2),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: SwitchListTile(
        activeColor: AppTheme.harvestGold,
        activeTrackColor: AppTheme.forestGreen,
        secondary: Icon(icon, color: AppTheme.forestGreen),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w500)),
        subtitle: subtitle != null ? Text(subtitle, style: const TextStyle(color: Colors.grey)) : null,
        value: value,
        onChanged: onChanged,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
