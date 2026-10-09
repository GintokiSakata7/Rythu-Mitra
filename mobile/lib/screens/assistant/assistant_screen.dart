import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../localization/app_strings.dart';
import '../../providers/language_provider.dart';
import '../../models/app_models.dart';
import '../../voice/voice_service.dart';
import '../../voice/intent_engine.dart';
import '../../voice/conversation_manager.dart';
import '../../location/location_service.dart';
import '../search/search_animation_screen.dart';
import '../buyers/buyer_list_screen.dart';
import '../demand/post_demand_screen.dart';
import '../profile/profile_screen.dart';
import '../notifications/notifications_screen.dart';
import '../settings/settings_screen.dart';
import 'package:flutter_tts/flutter_tts.dart';

class AssistantScreen extends StatefulWidget {
  const AssistantScreen({super.key});

  @override
  State<AssistantScreen> createState() => _AssistantScreenState();
}

class _AssistantScreenState extends State<AssistantScreen> with SingleTickerProviderStateMixin {
  final _tts = FlutterTts();
  final _textCtrl = TextEditingController();
  final List<Map<String, dynamic>> _messages = [];

  bool _isListening = false;
  bool _isProcessing = false;
  String _partialText = '';
  
  late AnimationController _pulseCtrl;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);

    _initVoice();
  }

  Future<void> _initVoice() async {
    await _tts.awaitSpeakCompletion(true);
    await _tts.setSpeechRate(0.5);
    await _tts.setVolume(1.0);
    await _tts.setPitch(1.0);

    if (!voiceService.isInitialized) {
      await voiceService.initialize();
    }

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final lang = context.read<LanguageProvider>().langCode;
      final greeting = lang == 'te' 
          ? "నమస్కారం! నేను రైతు మిత్ర. మీకు ఏం సహాయం కావాలి?" 
          : (lang == 'hi' ? "नमस्कार! मैं ऋतु मित्र हूँ। मैं आपकी क्या मदद कर सकता हूँ?" : "Hello! I am Rythu Mitra. What can I help you with?");
      _addBotMessage(greeting);
      context.read<ConversationManager>().reset();
    });
  }

  Future<void> _speak(String text) async {
    if (!mounted) return;
    final lang = context.read<LanguageProvider>().langCode;
    String ttsLang = 'en-US';
    if (lang == 'te') ttsLang = 'te-IN';
    if (lang == 'hi') ttsLang = 'hi-IN';

    try {
      final res = await _tts.setLanguage(ttsLang);
      if (res != 1 && res != true) {
        await _tts.setLanguage('en-IN');
      }
      await _tts.speak(text);
    } catch (e) {
      try {
        await _tts.setLanguage('en-IN');
        await _tts.speak(text);
      } catch (_) {}
    }
  }

  void _addBotMessage(String text) {
    setState(() {
      _messages.insert(0, {'isBot': true, 'text': text});
    });
    _speak(text);
  }

  void _addUserMessage(String text) {
    setState(() {
      _messages.insert(0, {'isBot': false, 'text': text});
    });
  }

  void _startListening() async {
    final lang = context.read<LanguageProvider>().langCode;
    final locale = voiceService.getBestLocale(lang);
    
    if (locale == null) {
      _showErrorDialog(
        lang == 'te' ? "వాయిస్ సపోర్ట్ లేదు" : (lang == 'hi' ? "आवाज़ का समर्थन नहीं" : "Speech Not Available"),
        lang == 'te' ? "ఈ పరికరంలో వాయిస్ రికగ్నిషన్ పనిచేయడం లేదు. దయచేసి టైప్ చేయండి." : (lang == 'hi' ? "इस डिवाइस पर स्पीच रिकग्निशन उपलब्ध नहीं है। कृपया टाइप करें।" : "Speech recognition is not available on this device. Please type instead."),
      );
      return;
    }

    setState(() {
      _isListening = true;
      _partialText = '';
    });

    await voiceService.startListening(
      localeId: locale,
      onPartial: (partial) {
        if (mounted) setState(() => _partialText = partial);
      },
      onFinal: (finalText) {
        if (mounted) {
          setState(() {
            _isListening = false;
            _partialText = '';
          });
          _processInput(finalText);
        }
      },
      onError: (error) {
        if (mounted) {
          setState(() {
            _isListening = false;
            _partialText = '';
          });
          _addBotMessage("Sorry, I didn't catch that. Please try again.");
        }
      },
      onDone: () {
        if (mounted && _isListening) {
          setState(() {
            _isListening = false;
          });
        }
      },
    );
  }

  void _stopListening() async {
    if (_isListening) {
      await voiceService.stopListening();
    }
  }

  Future<void> _processInput(String text) async {
    if (text.isEmpty) return;
    _addUserMessage(text);
    setState(() => _isProcessing = true);

    try {
      final lang = context.read<LanguageProvider>().langCode;
      final intent = intentEngine.extractLocal(text, lang);
      final manager = context.read<ConversationManager>();

      // Handle direct navigation intents
      if (intent.type == IntentType.searchBuyers) {
        _addBotMessage(lang == 'te' ? "కొనుగోలుదారుల నెట్‌వర్క్‌ని తెరుస్తున్నాను..." : lang == 'hi' ? "खरीदार नेटवर्क खोल रहा हूँ..." : "Navigating to the Buyer Network...");
        await Future.delayed(const Duration(seconds: 1));
        if (mounted) Navigator.push(context, MaterialPageRoute(builder: (_) => const BuyerListScreen()));
      } else if (intent.type == IntentType.postDemand) {
        _addBotMessage(lang == 'te' ? "డిమాండ్ స్క్రీన్‌ని తెరుస్తున్నాను..." : lang == 'hi' ? "डिमांड स्क्रीन खोल रहा हूँ..." : "Opening Post Demand screen...");
        await Future.delayed(const Duration(seconds: 1));
        if (mounted) Navigator.push(context, MaterialPageRoute(builder: (_) => const PostDemandScreen()));
      } else if (intent.type == IntentType.showProfile) {
        _addBotMessage("Opening profile...");
        await Future.delayed(const Duration(seconds: 1));
        if (mounted) Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileScreen()));
      } else if (intent.type == IntentType.showNotifications) {
        _addBotMessage("Opening notifications...");
        await Future.delayed(const Duration(seconds: 1));
        if (mounted) Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen()));
      } else if (intent.type == IntentType.openSettings) {
        _addBotMessage("Opening settings...");
        await Future.delayed(const Duration(seconds: 1));
        if (mounted) Navigator.push(context, MaterialPageRoute(builder: (_) => const SettingsScreen()));
      } else {
        // Handle conversational intents
        if (intent.useGps == true) {
          _addBotMessage(lang == 'te' ? "లొకేషన్ తీసుకుంటున్నాను..." : lang == 'hi' ? "स्थान प्राप्त कर रहा हूँ..." : "Fetching your location...");
          final loc = await locationService.getCurrentLocation();
          if (loc.result != null) {
            manager.setGpsLocation(loc.result!.lat, loc.result!.lng, loc.result!.displayName ?? 'Current Location');
          } else {
            _addBotMessage(loc.error?.message ?? "Could not get location. Using Nalgonda as default.");
            manager.setGpsLocation(17.05, 79.27, 'Nalgonda');
          }
        } else if (manager.step == ConvStep.needLocation && intent.rawText.trim().isNotEmpty) {
          // The user provided a town name! Let's find its latitude and longitude!
          _addBotMessage(lang == 'te' ? "లొకేషన్ వెతుకుతున్నాను..." : lang == 'hi' ? "स्थान खोज रहा हूँ..." : "Locating ${intent.rawText.trim()}...");
          final loc = await locationService.getLocationFromAddress(intent.rawText.trim());
          if (loc != null) {
             manager.setGpsLocation(loc.lat, loc.lng, loc.displayName ?? intent.rawText.trim());
          } else {
             // Fallback to Nalgonda if geocoding fails
             manager.setGpsLocation(17.05, 79.27, intent.rawText.trim());
          }
        }

        final nextQuestion = manager.processIntent(intent, lang);
        
        if (nextQuestion != null) {
          _addBotMessage(nextQuestion);
        } else if (manager.isReadyToSearch) {
          _addBotMessage(manager.confirmationMessage(lang));
          await Future.delayed(const Duration(seconds: 2));
          if (mounted) {
            final req = manager.buildRequest(lang);
            manager.reset();
            Navigator.push(context, MaterialPageRoute(builder: (_) => SearchAnimationScreen(request: req)));
          }
        } else {
          _addBotMessage(lang == 'te' ? "దయచేసి మీరు ఏ పంట అమ్ముతున్నారో చెప్పండి." : lang == 'hi' ? "कृपया बताएं कि आप कौन सी फसल बेचना चाहते हैं।" : "I am RythuMitra assistant. Just say 'I have tomato to sell'.");
        }
      }
    } catch (e) {
      _addBotMessage("Sorry, I encountered an error. Please try again.");
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  void _showErrorDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('OK'),
          )
        ],
      ),
    );
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    _tts.stop();
    _textCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>().langCode;
    final s = (String k) => AppStrings.get(k, lang);

    return Scaffold(
      backgroundColor: AppTheme.warmCream,
      appBar: AppBar(
        title: Text(s('voice_assistant')),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Center(
              child: Text(
                lang.toUpperCase(),
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          )
        ],
      ),
      body: Column(
        children: [
          // Chat area
          Expanded(
            child: ListView.builder(
              reverse: true,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, i) {
                final msg = _messages[i];
                final isBot = msg['isBot'] as bool;
                
                return Align(
                  alignment: isBot ? Alignment.centerLeft : Alignment.centerRight,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    constraints: BoxConstraints(
                      maxWidth: MediaQuery.of(context).size.width * 0.75,
                    ),
                    decoration: BoxDecoration(
                      color: isBot ? Colors.white : AppTheme.harvestGold,
                      borderRadius: BorderRadius.circular(16).copyWith(
                        bottomLeft: isBot ? const Radius.circular(0) : const Radius.circular(16),
                        bottomRight: !isBot ? const Radius.circular(0) : const Radius.circular(16),
                      ),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x0A000000),
                          blurRadius: 4,
                          offset: Offset(0, 2),
                        )
                      ],
                    ),
                    child: Text(
                      msg['text'],
                      style: const TextStyle(fontSize: 15, color: Colors.black87),
                    ),
                  ),
                );
              },
            ),
          ),
          
          if (_partialText.isNotEmpty)
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(_partialText, style: const TextStyle(color: Colors.grey, fontStyle: FontStyle.italic)),
            ),

          if (_isProcessing)
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Text(s('processing'), style: const TextStyle(color: Colors.grey)),
            ),

          // Input area
          Container(
            padding: const EdgeInsets.all(16).copyWith(bottom: 32),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(24),
                topRight: Radius.circular(24),
              ),
              boxShadow: [
                BoxShadow(
                  color: Color(0x1A000000),
                  blurRadius: 16,
                  offset: Offset(0, -4),
                )
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Big Voice Orb
                GestureDetector(
                  onTap: () {
                    if (_isListening) {
                      _stopListening();
                    } else {
                      _startListening();
                    }
                  },
                  child: AnimatedBuilder(
                    animation: _pulseCtrl,
                    builder: (context, child) {
                      final scale = _isListening ? 1.0 + (_pulseCtrl.value * 0.2) : 1.0;
                      final shadow = _isListening ? 20.0 + (_pulseCtrl.value * 10) : 8.0;
                      
                      return Transform.scale(
                        scale: scale,
                        child: Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: _isListening ? AppTheme.dangerRed : AppTheme.forestGreen,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: (_isListening ? AppTheme.dangerRed : AppTheme.forestGreen)
                                    .withValues(alpha: 0.4),
                                blurRadius: shadow,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Icon(
                            _isListening ? Icons.mic : Icons.mic_none,
                            color: Colors.white,
                            size: 40,
                          ),
                        ),
                      );
                    }
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  _isListening ? s('listening') : s('speak_now'),
                  style: TextStyle(
                    fontSize: 14, 
                    fontWeight: FontWeight.bold,
                    color: _isListening ? AppTheme.dangerRed : Colors.black54,
                  ),
                ),
                const SizedBox(height: 24),
                
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _textCtrl,
                        decoration: InputDecoration(
                          hintText: s('type_here'),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(24),
                            borderSide: BorderSide.none,
                          ),
                          filled: true,
                          fillColor: const Color(0xFFF5F5F5),
                        ),
                        onSubmitted: (text) {
                          _textCtrl.clear();
                          _processInput(text);
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      decoration: const BoxDecoration(
                        color: AppTheme.harvestGold,
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.send, color: Colors.black87),
                        onPressed: () {
                          final text = _textCtrl.text;
                          _textCtrl.clear();
                          _processInput(text);
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
