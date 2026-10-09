import 'package:speech_to_text/speech_to_text.dart';
import 'package:speech_to_text/speech_recognition_error.dart';
import 'package:permission_handler/permission_handler.dart';

enum VoiceErrorType {
  permissionDenied,
  permissionPermanentlyDenied,
  unavailable,
  noSpeech,
  networkError,
  recognitionError,
  localeUnavailable,
}

class VoiceError {
  final VoiceErrorType type;
  final String message;
  const VoiceError(this.type, this.message);
}

class VoiceInitResult {
  final bool success;
  final String? errorMessage;
  final List<LocaleName> availableLocales;
  const VoiceInitResult({
    required this.success,
    this.errorMessage,
    this.availableLocales = const [],
  });
}

class VoiceService {
  final SpeechToText _speech = SpeechToText();
  bool _initialized = false;
  List<LocaleName> _availableLocales = [];
  String _lastRecognizedWords = '';
  
  void Function(VoiceError)? _currentOnError;
  void Function()? _currentOnDone;

  bool get isInitialized => _initialized && _speech.isAvailable;
  List<LocaleName> get availableLocales => _availableLocales;
  String get lastRecognizedWords => _lastRecognizedWords;

  Future<VoiceInitResult> initialize() async {
    try {
      // 1. Check microphone permission
      var status = await Permission.microphone.status;
      if (status.isPermanentlyDenied) {
        return const VoiceInitResult(
          success: false,
          errorMessage: 'Microphone permission is permanently denied. Please enable in App Settings.',
        );
      }
      if (!status.isGranted) {
        status = await Permission.microphone.request();
        if (status.isPermanentlyDenied) {
          return const VoiceInitResult(
            success: false,
            errorMessage: 'Microphone permission is permanently denied. Please enable in App Settings.',
          );
        }
        if (!status.isGranted) {
          return const VoiceInitResult(
            success: false,
            errorMessage: 'Microphone permission was denied. Please allow microphone access to speak.',
          );
        }
      }

      // 2. Initialize SpeechToText engine
      _initialized = await _speech.initialize(
        onError: (error) {
          if (_currentOnError != null) {
            _handleSpeechError(error, _currentOnError!);
          }
        },
        onStatus: (status) {
          if (status == 'done' || status == 'notListening') {
            _currentOnDone?.call();
          }
        },
        debugLogging: false,
      );

      if (_initialized) {
        _availableLocales = await _speech.locales();
      }

      return VoiceInitResult(
        success: _initialized,
        availableLocales: _availableLocales,
        errorMessage: _initialized ? null : 'Speech recognition is not available or disabled on this device.',
      );
    } catch (e) {
      _initialized = false;
      return VoiceInitResult(
        success: false,
        errorMessage: 'Failed to initialize speech recognition: $e',
      );
    }
  }

  /// Returns the best available BCP-47 locale on this device for the requested app language.
  String getBestLocale(String appLangCode) {
    if (_availableLocales.isEmpty) {
      if (appLangCode == 'te') return 'te-IN';
      if (appLangCode == 'hi') return 'hi-IN';
      return 'en-IN';
    }

    final normalizedPreferred = <String>[];
    if (appLangCode == 'te') {
      normalizedPreferred.addAll(['te-in', 'te_in', 'te']);
    } else if (appLangCode == 'hi') {
      normalizedPreferred.addAll(['hi-in', 'hi_in', 'hi']);
    } else {
      normalizedPreferred.addAll(['en-in', 'en_in', 'en-us', 'en_us', 'en']);
    }

    // Try exact match in device locales
    for (final pref in normalizedPreferred) {
      for (final loc in _availableLocales) {
        final locId = loc.localeId.toLowerCase().replaceAll('_', '-');
        if (locId == pref || locId.startsWith('$pref-')) {
          return loc.localeId;
        }
      }
    }

    // Fallback: try en-IN
    for (final loc in _availableLocales) {
      final locId = loc.localeId.toLowerCase().replaceAll('_', '-');
      if (locId.contains('en-in') || locId.contains('en-us')) {
        return loc.localeId;
      }
    }

    // Safe fallback to first available or standard code
    if (_availableLocales.isNotEmpty) {
      return _availableLocales.first.localeId;
    }
    return appLangCode == 'te' ? 'te-IN' : (appLangCode == 'hi' ? 'hi-IN' : 'en-IN');
  }

  Future<void> startListening({
    required String localeId,
    required void Function(String partial) onPartial,
    required void Function(String final_) onFinal,
    required void Function(VoiceError error) onError,
    void Function()? onDone,
  }) async {
    _currentOnError = onError;
    _currentOnDone = onDone;
    _lastRecognizedWords = '';
    
    // Auto-initialize if not ready
    if (!_initialized || !_speech.isAvailable) {
      final res = await initialize();
      if (!res.success) {
        onError(VoiceError(VoiceErrorType.unavailable, res.errorMessage ?? 'Speech recognition not ready'));
        return;
      }
    }
    
    // Explicit microphone check
    final status = await Permission.microphone.status;
    if (!status.isGranted) {
      final req = await Permission.microphone.request();
      if (!req.isGranted) {
        onError(const VoiceError(VoiceErrorType.permissionDenied, 'Microphone permission denied'));
        return;
      }
    }

    try {
      await _speech.listen(
        listenOptions: SpeechListenOptions(
          localeId: localeId,
          listenMode: ListenMode.dictation,
          partialResults: true,
          cancelOnError: false,
          listenFor: const Duration(seconds: 45),
          pauseFor: const Duration(seconds: 4),
        ),
        onResult: (result) {
          _lastRecognizedWords = result.recognizedWords;
          if (result.finalResult) {
            onFinal(result.recognizedWords);
          } else {
            onPartial(result.recognizedWords);
          }
        },
      );
    } catch (e) {
      onError(VoiceError(VoiceErrorType.recognitionError, 'Speech listen error: $e'));
    }
  }

  Future<void> stopListening() async {
    try {
      await _speech.stop();
    } catch (_) {}
  }

  Future<void> cancel() async {
    try {
      await _speech.cancel();
    } catch (_) {}
  }

  void _handleSpeechError(SpeechRecognitionError error, void Function(VoiceError) callback) {
    VoiceErrorType type;
    switch (error.errorMsg) {
      case 'error_no_match':
      case 'error_speech_timeout':
        type = VoiceErrorType.noSpeech;
        break;
      case 'error_network':
      case 'error_network_timeout':
        type = VoiceErrorType.networkError;
        break;
      case 'error_audio':
        type = VoiceErrorType.permissionDenied;
        break;
      default:
        type = VoiceErrorType.recognitionError;
    }
    callback(VoiceError(type, error.errorMsg));
  }
}

final voiceService = VoiceService();
