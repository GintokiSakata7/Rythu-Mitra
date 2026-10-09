import 'package:flutter/foundation.dart';
import '../models/app_models.dart';

class DemandService extends ChangeNotifier {
  final List<DemandModel> _demands = [];

  List<DemandModel> get demands => List.unmodifiable(_demands);

  void addDemand({
    required String crop,
    required int quantityKg,
    required double expectedPrice,
    required String grade,
    required String harvestDate,
    required String notes,
    required bool canDeliver,
  }) {
    _demands.insert(
      0,
      DemandModel(
        id: 'DEM-${DateTime.now().millisecondsSinceEpoch}',
        crop: crop,
        quantityKg: quantityKg,
        expectedPrice: expectedPrice,
        grade: grade,
        harvestDate: harvestDate,
        notes: notes,
        canDeliver: canDeliver,
        status: 'Active',
      ),
    );
    notifyListeners();
  }

  void updateDemand(String id, {
    required String crop,
    required int quantityKg,
    required double expectedPrice,
    required String grade,
    required String harvestDate,
    required String notes,
    required bool canDeliver,
  }) {
    final index = _demands.indexWhere((d) => d.id == id);
    if (index >= 0) {
      _demands[index] = DemandModel(
        id: id,
        crop: crop,
        quantityKg: quantityKg,
        expectedPrice: expectedPrice,
        grade: grade,
        harvestDate: harvestDate,
        notes: notes,
        canDeliver: canDeliver,
        status: _demands[index].status,
      );
      notifyListeners();
    }
  }

  void deleteDemand(String id) {
    _demands.removeWhere((d) => d.id == id);
    notifyListeners();
  }
}

final demandService = DemandService();
