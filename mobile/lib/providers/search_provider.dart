import 'package:flutter/foundation.dart';
import '../models/app_models.dart';
import '../services/recommendation_service.dart';

enum SearchState { idle, searching, done, error }

class SearchProvider extends ChangeNotifier {
  SearchState _state = SearchState.idle;
  OptimizationResult? _result;
  String _errorMessage = '';
  RecommendationRequest? _lastRequest;

  SearchState get state => _state;
  OptimizationResult? get result => _result;
  String get errorMessage => _errorMessage;
  RecommendationRequest? get lastRequest => _lastRequest;

  Future<void> runSearch(RecommendationRequest request) async {
    _state = SearchState.searching;
    _errorMessage = '';
    _lastRequest = request;
    notifyListeners();

    try {
      final result = await recommendationService.getRecommendation(request);
      _result = result;
      _state = SearchState.done;
    } catch (e) {
      _errorMessage = e.toString();
      _state = SearchState.error;
    }
    notifyListeners();
  }

  void reset() {
    _state = SearchState.idle;
    _result = null;
    _errorMessage = '';
    _lastRequest = null;
    notifyListeners();
  }
}
