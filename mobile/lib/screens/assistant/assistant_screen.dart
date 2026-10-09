import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../localization/app_strings.dart';
import '../../providers/language_provider.dart';
import '../../providers/location_provider.dart';
import '../../voice/voice_service.dart';
import '../../voice/intent_engine.dart';
import '../../voice/conversation_manager.dart';
import '../../location/location_service.dart';
import '../search/search_animation_screen.dart';
import '../trends/trends_screen.dart';
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
  bool _isDetectingLocation = false;
  String _partialText = '';
  
  late AnimationController _pulseCtrl;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);

    _initVoice();
  }

  Future<void> _initVoice() async {
    try {
      await _tts.awaitSpeakCompletion(false);
      await _tts.setSpeechRate(0.48);
      await _tts.setVolume(1.0);
      await _tts.setPitch(1.0);
    } catch (_) {}

    // Initialize Speech To Text engine in background
    if (!voiceService.isInitialized) {
      await voiceService.initialize();
    }

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final lang = context.read<LanguageProvider>().langCode;
      final manager = context.read<ConversationManager>();
      final locProv = context.read<LocationProvider>();

      manager.reset();
      // If user's device location was already obtained on startup, pre-seed it
      if (locProv.hasLocation) {
        manager.setGpsLocation(locProv.latitude, locProv.longitude, locProv.displayName);
      }

      final greeting = lang == 'te' 
          ? "నమస్కారం! నేను రైతు మిత్ర. మీ పంట వివరాలు మాట్లాడండి లేదా కింద ఉన్న బటన్లను నొక్కండి." 
          : (lang == 'hi' 
              ? "नमस्कार! मैं ऋतु मित्र हूँ। अपनी फसल का नाम बोलें या नीचे दिए गए विकल्प चुनें।" 
              : "Hello! I am Rythu Mitra. Speak what crop you want to sell, or tap below.");
      
      _addBotMessage(greeting);
    });
  }

  Future<void> _speak(String text) async {
    if (!mounted) return;
    final lang = context.read<LanguageProvider>().langCode;
    String ttsLang = 'en-IN';
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

  Future<void> _addBotMessage(String text) async {
    if (!mounted) return;
    setState(() {
      _messages.insert(0, {'isBot': true, 'text': text});
    });
    _speak(text);
  }

  void _addUserMessage(String text) {
    if (!mounted) return;
    setState(() {
      _messages.insert(0, {'isBot': false, 'text': text});
    });
  }

  void _startListening() async {
    // 1. Immediately stop any active speech audio so mic isn't blocked
    try {
      await _tts.stop();
    } catch (_) {}
    if (!mounted) return;

    final lang = context.read<LanguageProvider>().langCode;

    // 2. Ensure speech engine is initialized and mic permission is granted
    if (!voiceService.isInitialized) {
      final initRes = await voiceService.initialize();
      if (!initRes.success || !voiceService.isInitialized) {
        if (!mounted) return;
        if (initRes.errorMessage?.contains('permanently') == true) {
          _showPermissionDialog(lang);
        } else {
          _showErrorDialog(
            lang == 'te' ? "మైక్రోఫోన్ అనుమతి అవసరం" : (lang == 'hi' ? "माइक अनुमति आवश्यक" : "Microphone Access Required"),
            initRes.errorMessage ?? (lang == 'te' ? "వాయిస్ అసిస్టెంట్ వాడటానికి దయచేసి మైక్ అనుమతించండి." : "Please allow microphone access to speak with RythuMitra."),
          );
        }
        return;
      }
    }

    final locale = voiceService.getBestLocale(lang);

    setState(() {
      _isListening = true;
      _partialText = '';
    });

    await voiceService.startListening(
      localeId: locale,
      onPartial: (partial) {
        if (mounted && _isListening) {
          setState(() => _partialText = partial);
        }
      },
      onFinal: (finalText) {
        if (mounted) {
          setState(() {
            _isListening = false;
            _partialText = '';
          });
          if (finalText.trim().isNotEmpty) {
            _processInput(finalText.trim());
          }
        }
      },
      onError: (error) {
        if (mounted) {
          final captured = _partialText.trim();
          setState(() {
            _isListening = false;
            _partialText = '';
          });

          // If words were captured before error/timeout, process them!
          if (captured.isNotEmpty) {
            _processInput(captured);
            return;
          }

          final l = context.read<LanguageProvider>().langCode;
          _addBotMessage(l == 'te' 
              ? "వాయిస్ సరిగ్గా వినబడలేదు. దయచేసి మళ్ళీ మైక్ నొక్కి మాట్లాడండి లేదా కింద టైప్ చేయండి." 
              : (l == 'hi' 
                  ? "आवाज़ स्पष्ट नहीं मिली। कृपया पुनः माइक दबाएं या नीचे लिखें।" 
                  : "Could not hear clearly. Please tap the mic and try again, or type below."));
        }
      },
      onDone: () {
        if (mounted && _isListening) {
          final captured = _partialText.trim();
          setState(() {
            _isListening = false;
            _partialText = '';
          });
          // Natural speech completion: process whatever was said!
          if (captured.isNotEmpty) {
            _processInput(captured);
          }
        }
      },
    );
  }

  void _stopListening() async {
    if (_isListening) {
      final captured = _partialText.trim();
      setState(() {
        _isListening = false;
        _partialText = '';
      });
      await voiceService.stopListening();
      if (captured.isNotEmpty) {
        _processInput(captured);
      }
    }
  }

  Future<void> _processInput(String text) async {
    final clean = text.trim();
    if (clean.isEmpty) return;

    // Immediately stop TTS
    try {
      await _tts.stop();
    } catch (_) {}
    if (!mounted) return;

    _addUserMessage(clean);
    setState(() => _isProcessing = true);

    try {
      final lang = context.read<LanguageProvider>().langCode;
      final intent = intentEngine.extractLocal(clean, lang);
      final manager = context.read<ConversationManager>();

      // 1. Direct App Navigation Intents
      if (intent.type == IntentType.searchBuyers) {
        await _addBotMessage(lang == 'te' ? "కొనుగోలుదారుల నెట్‌వర్క్‌ని తెరుస్తున్నాను..." : (lang == 'hi' ? "खरीदार नेटवर्क खोल रहा हूँ..." : "Opening the Buyer Network..."));
        await Future.delayed(const Duration(milliseconds: 600));
        if (mounted) Navigator.push(context, MaterialPageRoute(builder: (_) => const BuyerListScreen()));
        return;
      }
      
      if (intent.type == IntentType.postDemand) {
        await _addBotMessage(lang == 'te' ? "డిమాండ్ పోస్ట్ స్క్రీన్‌ని తెరుస్తున్నాను..." : (lang == 'hi' ? "डिमांड स्क्रीन खोल रहा हूँ..." : "Opening Post Demand screen..."));
        await Future.delayed(const Duration(milliseconds: 600));
        if (mounted) Navigator.push(context, MaterialPageRoute(builder: (_) => const PostDemandScreen()));
        return;
      }

      if (intent.type == IntentType.showPrices) {
        final crop = intent.crop ?? 'Tomato';
        await _addBotMessage(lang == 'te' 
            ? "$crop మార్కెట్ ట్రెండ్స్ మరియు ధరలు చూపిస్తున్నాను..." 
            : (lang == 'hi' ? "$crop के बाज़ार भाव दिखा रहा हूँ..." : "Showing current APMC market trends and prices for $crop..."));
        await Future.delayed(const Duration(milliseconds: 600));
        if (mounted) Navigator.push(context, MaterialPageRoute(builder: (_) => const TrendsScreen()));
        return;
      }

      if (intent.type == IntentType.showProfile) {
        await _addBotMessage(lang == 'te' ? "రైతు ప్రొఫైల్ తెరుస్తున్నాను..." : "Opening your profile...");
        await Future.delayed(const Duration(milliseconds: 600));
        if (mounted) Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileScreen()));
        return;
      }

      if (intent.type == IntentType.showNotifications) {
        await _addBotMessage(lang == 'te' ? "నోటిఫికేషన్‌లు తెరుస్తున్నాను..." : "Opening notifications...");
        await Future.delayed(const Duration(milliseconds: 600));
        if (mounted) Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen()));
        return;
      }

      if (intent.type == IntentType.openSettings) {
        await _addBotMessage(lang == 'te' ? "సెట్టింగ్‌లు తెరుస్తున్నాను..." : "Opening settings...");
        await Future.delayed(const Duration(milliseconds: 600));
        if (mounted) Navigator.push(context, MaterialPageRoute(builder: (_) => const SettingsScreen()));
        return;
      }

      if (intent.type == IntentType.help) {
        await _addBotMessage(lang == 'te'
            ? "నేను రైతు మిత్ర అసిస్టెంట్! మీరు ఇలా మాట్లాడవచ్చు:\n• 'నా దగ్గర 20 క్వింటాళ్ళ టమాటా ఉంది వరంగల్‌లో'\n• 'ఉల్లిపాయకు ఉత్తమ మార్కెట్ వెతుకు'\n• 'టమాటా మార్కెట్ ధరలు చూపించు'\n• 'కొనుగోలుదారులను చూపించు'\n• '📍 నా GPS లొకేషన్'"
            : (lang == 'hi'
                ? "मैं ऋतु मित्र असिस्टेंट हूँ! आप कह सकते हैं:\n• 'मेरे पास 20 क्विंटल टमाटर है वारंगल में'\n• 'टमाटर के बाज़ार भाव दिखाओ'\n• 'खरीदार नेटवर्क दिखाओ'\n• '📍 मेरी GPS लोकेशन'"
                : "I am RythuMitra Assistant! You can say:\n• 'I have 20 quintals of Tomato in Warangal'\n• 'Find best market for Onion'\n• 'Show market prices'\n• 'Show buyers'\n• '📍 Use my GPS location'"));
        return;
      }

      // 2. Handle GPS Trigger Words
      final lower = clean.toLowerCase();
      final isGpsPrompt = intent.useGps == true ||
          lower == 'gps' ||
          lower == 'location' ||
          lower.contains('gps') ||
          lower.contains('లొకేషన్') ||
          lower.contains('లోకేషన్') ||
          lower.contains('స్థానం') ||
          lower.contains('लोकेशन');

      if (isGpsPrompt) {
        await _useGpsLocation();
        return;
      }

      // 3. Conversational Pipeline
      if (manager.step == ConvStep.needLocation && clean.isNotEmpty) {
        // Town provided directly
        manager.setLocationFromText(clean);
      }

      final nextQuestion = manager.processIntent(intent, lang);
      
      if (nextQuestion != null) {
        await _addBotMessage(nextQuestion);
      } else if (manager.isReadyToSearch) {
        await _addBotMessage(manager.confirmationMessage(lang));
        await Future.delayed(const Duration(milliseconds: 1400));
        if (mounted) {
          final req = manager.buildRequest(lang);
          manager.reset();
          Navigator.push(context, MaterialPageRoute(builder: (_) => SearchAnimationScreen(request: req, fromVoice: true)));
        }
      } else {
        await _addBotMessage(lang == 'te' 
            ? "దయచేసి మీరు ఏ పంట అమ్ముతున్నారో చెప్పండి. (ఉదా: 'నా దగ్గర 10 క్వింటాళ్ళ టమాటా ఉంది')" 
            : (lang == 'hi' 
                ? "कृपया बताएं कि आप कौन सी फसल बेचना चाहते हैं। (जैसे: '10 क्विंटल टमाटर')" 
                : "Please tell me which crop you want to sell. (e.g. 'I have 10 quintals of Tomato')"));
      }
    } catch (e) {
      if (!mounted) return;
      final l = context.read<LanguageProvider>().langCode;
      await _addBotMessage(l == 'te' 
          ? "క్షమించండి, ప్రక్రియలో లోపం జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి." 
          : "Sorry, an unexpected error occurred. Please try again.");
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  Future<void> _useGpsLocation() async {
    if (_isDetectingLocation) return;
    setState(() => _isDetectingLocation = true);

    final lang = context.read<LanguageProvider>().langCode;
    final manager = context.read<ConversationManager>();

    await _addBotMessage(lang == 'te'
        ? "మీ GPS లొకేషన్ గుర్తిస్తున్నాను... దయచేసి వేచి ఉండండి."
        : (lang == 'hi'
            ? "GPS स्थान प्राप्त कर रहा हूँ... कृपया प्रतीक्षा करें।"
            : "Acquiring your live GPS coordinates..."));

    try {
      final loc = await locationService.getCurrentLocation();
      if (!mounted) return;

      if (loc.result != null) {
        final res = loc.result!;
        final placeName = res.displayName ?? '${res.lat.toStringAsFixed(2)}, ${res.lng.toStringAsFixed(2)}';
        manager.setGpsLocation(res.lat, res.lng, placeName);

        final detectedMsg = lang == 'te'
            ? "మీ లొకేషన్ గుర్తించబడింది: $placeName"
            : (lang == 'hi'
                ? "आपका स्थान मिल गया: $placeName"
                : "Location confirmed: $placeName");
        await _addBotMessage(detectedMsg);

        // Advance conversation
        final nextQuestion = manager.processIntent(
          AssistantIntent(
            type: IntentType.findBestMarket,
            useGps: true,
            locationText: placeName,
            rawText: 'GPS',
          ),
          lang,
        );

        if (nextQuestion != null) {
          await _addBotMessage(nextQuestion);
        } else if (manager.isReadyToSearch) {
          await _addBotMessage(manager.confirmationMessage(lang));
          await Future.delayed(const Duration(milliseconds: 1400));
          if (mounted) {
            final req = manager.buildRequest(lang);
            manager.reset();
            Navigator.push(context, MaterialPageRoute(builder: (_) => SearchAnimationScreen(request: req, fromVoice: true)));
          }
        }
      } else if (loc.error != null) {
        if (loc.error!.type == LocationErrorType.gpsDisabled) {
          _showGpsDisabledDialog(lang);
        } else if (loc.error!.type == LocationErrorType.permissionPermanentlyDenied ||
            loc.error!.type == LocationErrorType.permissionDenied) {
          _showPermissionDialog(lang);
        } else {
          await _addBotMessage(loc.error!.message);
        }
      }
    } catch (e) {
      await _addBotMessage(lang == 'te'
          ? "GPS పొందడంలో లోపం జరిగింది. దయచేసి మీ ఊరి పేరు చెప్పండి లేదా టైప్ చేయండి."
          : "Could not fetch GPS. Please say or type your town name.");
    } finally {
      if (mounted) setState(() => _isDetectingLocation = false);
    }
  }

  void _showGpsDisabledDialog(String lang) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(lang == 'te' ? 'GPS ఆఫ్‌లో ఉంది' : (lang == 'hi' ? 'GPS बंद है' : 'GPS is Disabled')),
        content: Text(lang == 'te'
            ? 'ఖచ్చితమైన మార్కెట్ ధరలు లెక్కించడానికి దయచేసి మీ ఫోన్ GPS ని ఆన్ చేయండి.'
            : (lang == 'hi'
                ? 'सटीक मंडी मूल्य गणना के लिए कृपया अपने फोन का GPS चालू करें।'
                : 'Please turn on GPS on your device to calculate accurate distances and mandi prices.')),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(lang == 'te' ? 'రద్దు' : 'Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              locationService.openLocationSettings();
            },
            child: Text(lang == 'te' ? 'సెట్టింగ్స్ తెరవండి' : 'Open Settings'),
          ),
        ],
      ),
    );
  }

  void _showPermissionDialog(String lang) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(lang == 'te' ? 'అనుమతి అవసరం' : (lang == 'hi' ? 'अनुमति चाहिए' : 'Permission Required')),
        content: Text(lang == 'te'
            ? 'రైతు మిత్ర యాప్‌కు మైక్ మరియు లొకేషన్ అనుమతులు అవసరం. దయచేసి యాప్ సెట్టింగ్స్‌లో అనుమతించండి.'
            : (lang == 'hi'
                ? 'कृपया ऐप सेटिंग्स में माइक और लोकेशन अनुमति दें।'
                : 'Microphone and Location permissions are needed. Please enable them in App Settings.')),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(lang == 'te' ? 'రద్దు' : 'Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              locationService.openAppSettings();
            },
            child: Text(lang == 'te' ? 'యాప్ సెట్టింగ్స్' : 'Open Settings'),
          ),
        ],
      ),
    );
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

  Widget _buildQuickChip(String label, VoidCallback onTap, {Color? bg, Color? border, Color? textColor}) {
    return ActionChip(
      label: Text(
        label,
        style: TextStyle(
          fontSize: 12.5,
          fontWeight: FontWeight.bold,
          color: textColor ?? Colors.black87,
        ),
      ),
      backgroundColor: bg ?? Colors.grey.shade100,
      side: BorderSide(color: border ?? Colors.grey.shade300),
      onPressed: onTap,
    );
  }

  void _restartSession() {
    _tts.stop();
    final manager = context.read<ConversationManager>();
    manager.reset();
    final locProv = context.read<LocationProvider>();
    if (locProv.hasLocation) {
      manager.setGpsLocation(locProv.latitude, locProv.longitude, locProv.displayName);
    }
    final lang = context.read<LanguageProvider>().langCode;
    setState(() {
      _messages.clear();
      _partialText = '';
      _isListening = false;
    });
    final greeting = lang == 'te' 
        ? "నమస్కారం! సెషన్ రీసెట్ చేయబడింది. మీరు ఏ పంట అమ్మాలనుకుంటున్నారు?" 
        : (lang == 'hi' 
            ? "नमस्ते! नया सत्र शुरू हुआ। आप कौन सी फसल बेचना चाहते हैं?" 
            : "Hello! Session restarted. Which crop would you like to sell?");
    _addBotMessage(greeting);
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
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Restart Conversation',
            onPressed: _restartSession,
          ),
          Padding(
            padding: const EdgeInsets.only(right: 14, left: 4),
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  lang.toUpperCase(),
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                ),
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
                      maxWidth: MediaQuery.of(context).size.width * 0.8,
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
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Flexible(
                          child: Text(
                            msg['text'],
                            style: const TextStyle(fontSize: 14.5, color: Colors.black87, height: 1.35),
                          ),
                        ),
                        if (isBot) ...[
                          const SizedBox(width: 8),
                          GestureDetector(
                            onTap: () => _speak(msg['text']),
                            child: const Icon(Icons.volume_up, size: 18, color: AppTheme.forestGreen),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          
          if (_partialText.isNotEmpty)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white70,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.forestGreen.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.record_voice_over, size: 16, color: AppTheme.forestGreen),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _partialText,
                      style: const TextStyle(color: Colors.black87, fontStyle: FontStyle.italic, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),

          if (_isProcessing)
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.forestGreen),
                  ),
                  const SizedBox(width: 8),
                  Text(s('processing'), style: const TextStyle(color: Colors.grey, fontSize: 12)),
                ],
              ),
            ),

          // Input area
          Container(
            padding: const EdgeInsets.all(16).copyWith(bottom: 24),
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
            child: Consumer<ConversationManager>(
              builder: (context, manager, _) {
                return Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Contextual Action Card based on Conversation Step
                    if (manager.step == ConvStep.needLocation) ...[
                      Container(
                        margin: const EdgeInsets.only(bottom: 14),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF0FDF4),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppTheme.forestGreen, width: 1.5),
                        ),
                        child: Column(
                          children: [
                            Text(
                              lang == 'te'
                                  ? "ఖచ్చితమైన మార్కెట్ లెక్కల కోసం GPS బటన్ నొక్కండి:"
                                  : (lang == 'hi'
                                      ? "सटीक मंडी गणना के लिए GPS बटन दबाएं:"
                                      : "For accurate market calculation, tap GPS button:"),
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.forestGreen,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 10),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppTheme.forestGreen,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 13),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  elevation: 2,
                                ),
                                onPressed: _isDetectingLocation ? null : _useGpsLocation,
                                icon: _isDetectingLocation
                                    ? const SizedBox(
                                        width: 18,
                                        height: 18,
                                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                      )
                                    : const Icon(Icons.my_location, size: 20),
                                label: Text(
                                  _isDetectingLocation
                                      ? (lang == 'te' ? "GPS లొకేషన్ గుర్తిస్తున్నాం..." : "Detecting GPS...")
                                      : (lang == 'te'
                                          ? "📍 నా లొకేషన్ ఉపయోగించు (GPS)"
                                          : (lang == 'hi' ? "📍 मेरा स्थान (GPS)" : "📍 Use My GPS Location")),
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14.5),
                                ),
                              ),
                            ),
                            const SizedBox(height: 8),
                            SingleChildScrollView(
                              scrollDirection: Axis.horizontal,
                              child: Row(
                                children: [
                                  _buildQuickChip("Warangal", () => _processInput("Warangal")),
                                  const SizedBox(width: 6),
                                  _buildQuickChip("Bowenpally", () => _processInput("Bowenpally")),
                                  const SizedBox(width: 6),
                                  _buildQuickChip("Nalgonda", () => _processInput("Nalgonda")),
                                  const SizedBox(width: 6),
                                  _buildQuickChip("Khammam", () => _processInput("Khammam")),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ] else if (manager.locationText != null) ...[
                      Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.green.shade50,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.green.shade300),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.check_circle, size: 15, color: Colors.green),
                            const SizedBox(width: 6),
                            Flexible(
                              child: Text(
                                "📍 ${manager.locationText}",
                                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.green.shade800),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(width: 8),
                            InkWell(
                              onTap: _useGpsLocation,
                              child: Text(
                                lang == 'te' ? 'GPS మార్చు' : 'Change GPS',
                                style: const TextStyle(fontSize: 11.5, color: Colors.blue, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ] else if (manager.step == ConvStep.needTransport) ...[
                      Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            ActionChip(
                              backgroundColor: const Color(0xFFF0FDF4),
                              side: const BorderSide(color: AppTheme.forestGreen),
                              avatar: const Icon(Icons.local_shipping, size: 18, color: AppTheme.forestGreen),
                              label: Text(
                                lang == 'te' ? "అవును (స్వంత వాహనం)" : (lang == 'hi' ? "हाँ (स्वयं वाहन)" : "Yes (Own Vehicle)"),
                                style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.forestGreen),
                              ),
                              onPressed: () => _processInput(lang == 'te' ? "అవును" : "yes"),
                            ),
                            const SizedBox(width: 8),
                            ActionChip(
                              backgroundColor: Colors.orange.shade50,
                              side: BorderSide(color: Colors.orange.shade300),
                              avatar: const Icon(Icons.no_crash, size: 18, color: Colors.deepOrange),
                              label: Text(
                                lang == 'te' ? "లేదు (అద్దె రవాణా)" : (lang == 'hi' ? "नहीं (किराया वाहन)" : "No (Need Transport)"),
                                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.deepOrange),
                              ),
                              onPressed: () => _processInput(lang == 'te' ? "లేదు" : "no"),
                            ),
                          ],
                        ),
                      ),
                    ] else if (manager.step == ConvStep.needCrop) ...[
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: Row(
                            children: [
                              _buildQuickChip("🍅 ${lang == 'te' ? 'టమాట' : 'Tomato'}", () => _processInput("Tomato")),
                              const SizedBox(width: 6),
                              _buildQuickChip("🧅 ${lang == 'te' ? 'ఉల్లి' : 'Onion'}", () => _processInput("Onion")),
                              const SizedBox(width: 6),
                              _buildQuickChip("🌶️ ${lang == 'te' ? 'మిర్చి' : 'Chilli'}", () => _processInput("Chilli")),
                              const SizedBox(width: 6),
                              _buildQuickChip("🌾 ${lang == 'te' ? 'వరి' : 'Paddy'}", () => _processInput("Paddy")),
                              const SizedBox(width: 6),
                              _buildQuickChip("☁️ ${lang == 'te' ? 'పత్తి' : 'Cotton'}", () => _processInput("Cotton")),
                            ],
                          ),
                        ),
                      ),
                    ] else if (manager.step == ConvStep.needQuantity) ...[
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: Row(
                            children: [
                              _buildQuickChip("10 Quintals", () => _processInput("10 quintals")),
                              const SizedBox(width: 6),
                              _buildQuickChip("20 Quintals", () => _processInput("20 quintals")),
                              const SizedBox(width: 6),
                              _buildQuickChip("50 Quintals", () => _processInput("50 quintals")),
                              const SizedBox(width: 6),
                              _buildQuickChip("100 Quintals", () => _processInput("100 quintals")),
                            ],
                          ),
                        ),
                      ),
                    ] else if (manager.step == ConvStep.idle) ...[
                      // Welcome Suggestion Chips
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: Row(
                            children: [
                              _buildQuickChip(
                                "🍅 ${lang == 'te' ? 'టమాట అమ్ము' : 'Sell Tomato'}",
                                () => _processInput("Tomato"),
                                bg: const Color(0xFFF1F8F3),
                                border: const Color(0xFFC8E6C9),
                                textColor: AppTheme.forestGreen,
                              ),
                              const SizedBox(width: 6),
                              _buildQuickChip(
                                "🌾 ${lang == 'te' ? 'వరి అమ్ము' : 'Sell Paddy'}",
                                () => _processInput("Paddy"),
                                bg: const Color(0xFFF1F8F3),
                                border: const Color(0xFFC8E6C9),
                                textColor: AppTheme.forestGreen,
                              ),
                              const SizedBox(width: 6),
                              _buildQuickChip(
                                "📊 ${lang == 'te' ? 'మార్కెట్ ధరలు' : 'Market Prices'}",
                                () => _processInput("Show prices"),
                                bg: Colors.amber.shade50,
                                border: Colors.amber.shade200,
                              ),
                              const SizedBox(width: 6),
                              _buildQuickChip(
                                "🤝 ${lang == 'te' ? 'కొనుగోలుదారులు' : 'Buyers'}",
                                () => _processInput("Show buyers"),
                                bg: Colors.blue.shade50,
                                border: Colors.blue.shade200,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],

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
                          final shadow = _isListening ? 22.0 + (_pulseCtrl.value * 12) : 8.0;
                          
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
                        },
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      _isListening 
                          ? (lang == 'te' ? 'వింటున్నాను... మాట్లాడండి' : (lang == 'hi' ? 'सुन रहा हूँ... बोलिए' : 'Listening... Speak now'))
                          : (lang == 'te' ? 'మాట్లాడటానికి మైక్ నొక్కండి' : (lang == 'hi' ? 'बोलने के लिए माइक दबाएं' : 'Tap mic to speak')),
                      style: TextStyle(
                        fontSize: 13.5, 
                        fontWeight: FontWeight.bold,
                        color: _isListening ? AppTheme.dangerRed : Colors.black54,
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _textCtrl,
                            decoration: InputDecoration(
                              hintText: s('type_here'),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
