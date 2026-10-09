import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/profile_provider.dart';

class EditProfileDialog extends StatefulWidget {
  const EditProfileDialog({super.key});

  @override
  State<EditProfileDialog> createState() => _EditProfileDialogState();
}

class _EditProfileDialogState extends State<EditProfileDialog> {
  late TextEditingController _nameCtrl;
  late TextEditingController _phoneCtrl;
  late TextEditingController _locCtrl;
  
  String _vehicleType = 'No Vehicle';
  List<String> _crops = [];

  @override
  void initState() {
    super.initState();
    final p = context.read<ProfileProvider>();
    _nameCtrl = TextEditingController(text: p.name);
    _phoneCtrl = TextEditingController(text: p.phone);
    _locCtrl = TextEditingController(text: p.location);
    _vehicleType = p.vehicleType;
    _crops = List.from(p.preferredCrops);
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _locCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Edit Profile'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: _nameCtrl,
              decoration: const InputDecoration(labelText: 'Name', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _phoneCtrl,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: 'Phone', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _locCtrl,
              decoration: const InputDecoration(labelText: 'Location', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 16),
            const Text('Vehicle Type', style: TextStyle(fontWeight: FontWeight.bold)),
            DropdownButton<String>(
              isExpanded: true,
              value: _vehicleType,
              items: ['No Vehicle', 'Own Truck', 'Rented'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
              onChanged: (v) {
                if (v != null) setState(() => _vehicleType = v);
              },
            ),
            const SizedBox(height: 16),
            const Text('Preferred Crops', style: TextStyle(fontWeight: FontWeight.bold)),
            Wrap(
              spacing: 8,
              children: ['Tomato', 'Onion', 'Paddy', 'Chilli', 'Cotton'].map((c) {
                final selected = _crops.contains(c);
                return FilterChip(
                  label: Text(c),
                  selected: selected,
                  selectedColor: AppTheme.harvestGold,
                  onSelected: (val) {
                    setState(() {
                      if (val) _crops.add(c);
                      else _crops.remove(c);
                    });
                  },
                );
              }).toList(),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
        ),
        ElevatedButton(
          onPressed: () {
            context.read<ProfileProvider>().saveProfile(
              newName: _nameCtrl.text.trim(),
              newPhone: _phoneCtrl.text.trim(),
              newLocation: _locCtrl.text.trim(),
              newVehicleType: _vehicleType,
              newPreferredCrops: _crops,
            );
            Navigator.pop(context);
          },
          style: ElevatedButton.styleFrom(backgroundColor: AppTheme.forestGreen, foregroundColor: Colors.white),
          child: const Text('Save'),
        ),
      ],
    );
  }
}
