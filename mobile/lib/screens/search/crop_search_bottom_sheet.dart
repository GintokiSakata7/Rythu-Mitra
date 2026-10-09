import 'package:flutter/material.dart';
import '../../core/constants/app_constants.dart';
import '../../core/theme/app_theme.dart';
import '../../localization/app_strings.dart';

class CropSearchBottomSheet extends StatefulWidget {
  final String langCode;

  const CropSearchBottomSheet({super.key, required this.langCode});

  @override
  State<CropSearchBottomSheet> createState() => _CropSearchBottomSheetState();
}

class _CropSearchBottomSheetState extends State<CropSearchBottomSheet> {
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final s = (String k) => AppStrings.get(k, widget.langCode);
    
    // Filter crops
    final filteredCrops = AppConstants.crops.where((crop) {
      if (_searchQuery.isEmpty) return true;
      final term = _searchQuery.toLowerCase();
      final enMatch = crop['en']?.toLowerCase().contains(term) ?? false;
      final teMatch = crop['te']?.toLowerCase().contains(term) ?? false;
      final hiMatch = crop['hi']?.toLowerCase().contains(term) ?? false;
      return enMatch || teMatch || hiMatch;
    }).toList();

    return Container(
      height: MediaQuery.of(context).size.height * 0.8,
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: AppTheme.warmCream,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      child: Column(
        children: [
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.shade400,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            s('select_crop'),
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          TextField(
            autofocus: true,
            decoration: InputDecoration(
              hintText: 'Search crop (e.g. Tomato)...',
              prefixIcon: const Icon(Icons.search),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide.none,
              ),
              filled: true,
              fillColor: Colors.white,
            ),
            onChanged: (val) => setState(() => _searchQuery = val),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: filteredCrops.isEmpty
                ? const Center(child: Text('No crops found'))
                : ListView.builder(
                    itemCount: filteredCrops.length,
                    itemBuilder: (context, i) {
                      final crop = filteredCrops[i];
                      final title = crop[widget.langCode] ?? crop['en']!;
                      
                      return Semantics(
                        button: true,
                        label: 'Select $title',
                        child: Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            leading: Text(crop['emoji']!, style: const TextStyle(fontSize: 24)),
                            title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            tileColor: Colors.white,
                            onTap: () {
                              Navigator.pop(context, crop['id']);
                            },
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
