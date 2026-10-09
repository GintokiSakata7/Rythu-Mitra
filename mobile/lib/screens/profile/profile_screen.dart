import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../localization/app_strings.dart';
import '../../providers/language_provider.dart';
import '../../providers/profile_provider.dart';
import '../settings/settings_screen.dart';
import '../demand/my_demands_screen.dart';
import 'edit_profile_dialog.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final langProv = context.watch<LanguageProvider>();
    final s = (String k) => AppStrings.get(k, langProv.langCode);
    final profile = context.watch<ProfileProvider>();

    final displayLoc = profile.location.isNotEmpty ? profile.location : 'Add Location';
    final preferred = profile.preferredCrops.isNotEmpty 
        ? 'Preferred: ${profile.preferredCrops.join(", ")}'
        : 'Add Preferred Crops';

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
                Stack(
                  alignment: Alignment.bottomRight,
                  children: [
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        color: AppTheme.forestGreen.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                        border: Border.all(color: AppTheme.forestGreen, width: 2),
                      ),
                      child: const Icon(Icons.person, size: 60, color: AppTheme.forestGreen),
                    ),
                    GestureDetector(
                      onTap: () {
                        showDialog(
                          context: context,
                          builder: (_) => const EditProfileDialog(),
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: const BoxDecoration(
                          color: AppTheme.harvestGold,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.edit, size: 16, color: Colors.white),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  profile.name,
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  '📍 $displayLoc',
                  style: const TextStyle(color: Colors.grey, fontSize: 14),
                ),
                if (profile.phone.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    '📞 ${profile.phone}',
                    style: const TextStyle(color: Colors.grey, fontSize: 14),
                  ),
                ],
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.leafGreen.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    preferred,
                    style: TextStyle(color: AppTheme.forestGreen.withValues(alpha: 0.8), fontSize: 12),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 40),

          _buildProfileItem(
            icon: Icons.post_add,
            title: 'My Demands',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MyDemandsScreen())),
          ),
          _buildProfileItem(
            icon: Icons.settings,
            title: 'Settings',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SettingsScreen())),
          ),
          _buildProfileItem(
            icon: Icons.help_outline,
            title: 'Help',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Contact support at 1800-RYTHU-MITRA')));
            },
          ),
          const SizedBox(height: 24),
          _buildProfileItem(
            icon: Icons.logout,
            title: 'Logout',
            textColor: AppTheme.dangerRed,
            onTap: () {
              Navigator.of(context).pushNamedAndRemoveUntil('/', (route) => false);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildProfileItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Color textColor = Colors.black87,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE0E0E0)),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: ListTile(
          leading: Icon(icon, color: textColor == AppTheme.dangerRed ? AppTheme.dangerRed : AppTheme.forestGreen),
          title: Text(title, style: TextStyle(fontWeight: FontWeight.w600, color: textColor)),
          trailing: const Icon(Icons.chevron_right, color: Colors.grey),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          onTap: onTap,
        ),
      ),
    );
  }
}

