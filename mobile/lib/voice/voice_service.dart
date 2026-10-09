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
  
  void Function(VoiceError)? _currentOnError;
  void Function()? _currentOnDone;

  bool get isInitialized => _initialized;
  List<LocaleName> get availableLocales => _availableLocales;

  Future<VoiceInitResult> initialize() async {
    // Check microphone permission first
    final status = await Permission.microphone.status;
    if (status.isPermanentlyDenied) {
      return const VoiceInitResult(
        success: false,
        errorMessage: 'Microphone permission permanently denied. Please enable in app settings.',
      );
    }
    if (status.isDenied) {
      final result = await Permission.microphone.request();
      if (result.isDenied || result.isPermanentlyDenied) {
        return VoiceInitResult(
          success: false,
          errorMessage: result.isPermanentlyDenied
              ? 'Microphone permission permanently denied.'
              : 'Microphone permission denied.',
        );
      }
    }

    try {
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
        errorMessage: _initialized ? null : 'Speech recognition not available on this device.',
      );
    } catch (e) {
      return VoiceInitResult(
        success: false,
        errorMessage: 'Failed to initialize speech recognition: $e',
      );
    }
  }

  /// Returns the best available BCP-47 locale for the given app language code.
  /// Returns null if none of the preferred locales are available on this device.
  String? getBestLocale(String appLangCode) {
    if (appLangCode == 'te') return 'te-IN';
    if (appLangCode == 'hi') return 'hi-IN';
    return 'en-IN'; // Default to Indian English
  }

  /// Whether the selected app language has speech recognition support
  bool isLocaleAvailable(String appLangCode) {
    return getBestLocale(appLangCode) != null;
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
    
    if (!_initialized) {
      onError(const VoiceError(VoiceErrorType.unavailable, 'Speech not initialized'));
      return;
    }
    
    // Explicitly request microphone permission
    final status = await Permission.microphone.request();
    if (status != PermissionStatus.granted) {
      onError(const VoiceError(VoiceErrorType.permissionDenied, 'Microphone permission denied'));
      return;
    }

    await _speech.listen(
      listenOptions: SpeechListenOptions(
        localeId: localeId,
        listenMode: ListenMode.confirmation,
        partialResults: true,
        cancelOnError: true,
        listenFor: const Duration(seconds: 45),
        pauseFor: const Duration(seconds: 5),
      ),
      onResult: (result) {
        if (result.finalResult) {
          onFinal(result.recognizedWords);
        } else {
          onPartial(result.recognizedWords);
        }
      },
    );
  }

  Future<void> stopListening() async {
    await _speech.stop();
  }

  Future<void> cancel() async {
    await _speech.cancel();
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
