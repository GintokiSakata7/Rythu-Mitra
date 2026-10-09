import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/language_provider.dart';
import '../../localization/app_strings.dart';
import '../home/home_screen.dart';


class LanguageScreen extends StatefulWidget {
  const LanguageScreen({super.key});

  @override
  State<LanguageScreen> createState() => _LanguageScreenState();
}

class _LanguageScreenState extends State<LanguageScreen> {
  String? _selected;

  final List<Map<String, String>> _languages = const [
    {
      'code': 'te',
      'native': 'తెలుగు',
      'english': 'Telugu',
      'subtitle': 'మాట్లాడటానికి ఈ భాషను ఎంచుకోండి',
      'flag': '🌾',
    },
    {
      'code': 'hi',
      'native': 'हिन्दी',
      'english': 'Hindi',
      'subtitle': 'इस भाषा में बात करें',
      'flag': '🇮🇳',
    },
    {
      'code': 'en',
      'native': 'English',
      'english': 'English',
      'subtitle': 'Continue in English',
      'flag': '🗣️',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.warmCream,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 32),
              // Header
              const Icon(Icons.agriculture_rounded,
                  color: AppTheme.forestGreen, size: 48),
              const SizedBox(height: 20),
              const Text(
                'RythuMitra',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.forestGreen,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Select Your Language / భాషను ఎంచుకోండి / भाषा चुनें',
                style: TextStyle(fontSize: 14, color: Colors.black54, height: 1.4),
              ),
              const SizedBox(height: 40),

              // Language Cards
              Expanded(
                child: ListView.separated(
                  itemCount: _languages.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 16),
                  itemBuilder: (context, i) {
                    final lang = _languages[i];
                    final isSelected = _selected == lang['code'];
                    return GestureDetector(
                      onTap: () => setState(() => _selected = lang['code']),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppTheme.forestGreen
                              : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSelected
                                ? AppTheme.forestGreen
                                : const Color(0xFFE0E0E0),
                            width: 2,
                          ),
                          boxShadow: isSelected
                              ? [
                                  BoxShadow(
                                    color: AppTheme.forestGreen.withValues(alpha: 0.3),
                                    blurRadius: 12,
                                    offset: const Offset(0, 4),
                                  )
                                ]
                              : [
                                  const BoxShadow(
                                    color: Color(0x0A000000),
                                    blurRadius: 8,
                                    offset: Offset(0, 2),
                                  )
                                ],
                        ),
                        child: Row(
                          children: [
                            Text(lang['flag']!, style: const TextStyle(fontSize: 36)),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    lang['native']!,
                                    style: TextStyle(
                                      fontSize: 24,
                                      fontWeight: FontWeight.bold,
                                      color: isSelected
                                          ? Colors.white
                                          : AppTheme.forestGreen,
                                    ),
                                  ),
                                  Text(
                                    lang['subtitle']!,
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: isSelected
                                          ? Colors.white70
                                          : Colors.black45,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            if (isSelected)
                              const Icon(Icons.check_circle,
                                  color: Colors.white, size: 28),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 24),
              // Continue button
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _selected == null
                      ? null
                      : () async {
                          await context
                              .read<LanguageProvider>()
                              .setLanguage(_selected!);
                          if (!context.mounted) return;
                          
                          Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const HomeScreen(),
                            ),
                          );
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.harvestGold,
                    foregroundColor: Colors.black87,
                    disabledBackgroundColor: Colors.grey.shade300,
                  ),
                  child: Text(
                    _selected != null
                        ? AppStrings.get('continue_btn', _selected!)
                        : 'Continue',
                    style: const TextStyle(
                        fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
