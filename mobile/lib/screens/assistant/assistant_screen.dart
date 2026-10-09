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
  bool _isDetectingLocation = false;
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

  Future<void> _addBotMessage(String text) async {
    setState(() {
      _messages.insert(0, {'isBot': true, 'text': text});
    });
    await _speak(text);
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
          final l = context.read<LanguageProvider>().langCode;
          _addBotMessage(l == 'te' 
              ? "క్షమించండి, నాకు అర్థం కాలేదు. దయచేసి మళ్ళీ మాట్లాడండి." 
              : l == 'hi' 
                  ? "क्षमा करें, मैं समझ नहीं पाया। कृपया पुनः प्रयास करें।" 
                  : "Sorry, I didn't catch that. Please try again.");
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
        await _addBotMessage(lang == 'te' ? "కొనుగోలుదారుల నెట్‌వర్క్‌ని తెరుస్తున్నాను..." : lang == 'hi' ? "खरीदार नेटवर्क खोल रहा हूँ..." : "Navigating to the Buyer Network...");
        await Future.delayed(const Duration(seconds: 1));
        if (mounted) Navigator.push(context, MaterialPageRoute(builder: (_) => const BuyerListScreen()));
      } else if (intent.type == IntentType.postDemand) {
        await _addBotMessage(lang == 'te' ? "డిమాండ్ స్క్రీన్‌ని తెరుస్తున్నాను..." : lang == 'hi' ? "डिमांड स्क्रीन खोल रहा हूँ..." : "Opening Post Demand screen...");
        await Future.delayed(const Duration(seconds: 1));
        if (mounted) Navigator.push(context, MaterialPageRoute(builder: (_) => const PostDemandScreen()));
      } else if (intent.type == IntentType.showProfile) {
        await _addBotMessage(lang == 'te' ? "ప్రొఫైల్ తెరుస్తున్నాను..." : lang == 'hi' ? "प्रोफाइल खोल रहा हूँ..." : "Opening profile...");
        await Future.delayed(const Duration(seconds: 1));
        if (mounted) Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileScreen()));
      } else if (intent.type == IntentType.showNotifications) {
        await _addBotMessage(lang == 'te' ? "నోటిఫికేషన్‌లు తెరుస్తున్నాను..." : lang == 'hi' ? "नोटिफिकेशन खोल रहा हूँ..." : "Opening notifications...");
        await Future.delayed(const Duration(seconds: 1));
        if (mounted) Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen()));
      } else if (intent.type == IntentType.openSettings) {
        await _addBotMessage(lang == 'te' ? "సెట్టింగ్‌లు తెరుస్తున్నాను..." : lang == 'hi' ? "सेटिंग्स खोल रहा हूँ..." : "Opening settings...");
        await Future.delayed(const Duration(seconds: 1));
        if (mounted) Navigator.push(context, MaterialPageRoute(builder: (_) => const SettingsScreen()));
      } else {
        // Handle conversational intents
        final lower = text.toLowerCase().trim();
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
        } else if (manager.step == ConvStep.needLocation && intent.rawText.trim().isNotEmpty) {
          // The user provided a town name! Let's find its latitude and longitude!
          await _addBotMessage(lang == 'te' ? "లొకేషన్ వెతుకుతున్నాను..." : lang == 'hi' ? "स्थान खोज रहा हूँ..." : "Locating ${intent.rawText.trim()}...");
          final loc = await locationService.getLocationFromAddress(intent.rawText.trim());
          if (loc != null) {
            manager.setLocationFromText(loc.displayName ?? intent.rawText.trim(), lat: loc.lat, lng: loc.lng);
          } else {
            manager.setLocationFromText(intent.rawText.trim());
          }
        }

        final nextQuestion = manager.processIntent(intent, lang);
        
        if (nextQuestion != null) {
          await _addBotMessage(nextQuestion);
        } else if (manager.isReadyToSearch) {
          await _addBotMessage(manager.confirmationMessage(lang));
          await Future.delayed(const Duration(seconds: 2));
          if (mounted) {
            final req = manager.buildRequest(lang);
            manager.reset();
            Navigator.push(context, MaterialPageRoute(builder: (_) => SearchAnimationScreen(request: req, fromVoice: true)));
          }
        } else {
          await _addBotMessage(lang == 'te' ? "దయచేసి మీరు ఏ పంట అమ్ముతున్నారో చెప్పండి." : lang == 'hi' ? "कृपया बताएं कि आप कौन सी फसल बेचना चाहते हैं।" : "I am RythuMitra assistant. Just say 'I have tomato to sell'.");
        }
      }
    } catch (e) {
      final l = context.read<LanguageProvider>().langCode;
      await _addBotMessage(l == 'te' 
          ? "క్షమించండి, పొరపాటు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి." 
          : l == 'hi' 
              ? "क्षमा करें, कोई त्रुटि हुई। कृपया पुनः प्रयास करें।" 
              : "Sorry, I encountered an error. Please try again.");
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  Future<void> _useGpsLocation() async {
    if (_isDetectingLocation) return;
    setState(() => _isDetectingLocation = true);

    final lang = context.read<LanguageProvider>().langCode;
    final manager = context.read<ConversationManager>();

    _addBotMessage(lang == 'te'
        ? "లొకేషన్ తీసుకుంటున్నాను... దయచేసి వేచి ఉండండి."
        : (lang == 'hi'
            ? "स्थान प्राप्त कर रहा हूँ... कृपया प्रतीक्षा करें।"
            : "Detecting your live GPS location..."));

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
        _addBotMessage(detectedMsg);

        // Advance to next conversation question
        final nextQuestion = manager.processIntent(
          AssistantIntent(type: IntentType.findBestPrice, useGps: true, locationText: placeName),
          lang,
        );

        if (nextQuestion != null) {
          await _addBotMessage(nextQuestion);
        } else if (manager.isReadyToSearch) {
          await _addBotMessage(manager.confirmationMessage(lang));
          await Future.delayed(const Duration(seconds: 2));
          if (mounted) {
            final req = manager.buildRequest(lang);
            manager.reset();
            Navigator.push(context, MaterialPageRoute(builder: (_) => SearchAnimationScreen(request: req, fromVoice: true)));
          }
        }
      } else if (loc.error != null) {
        if (loc.error!.type == LocationErrorType.gpsDisabled) {
          _showGpsDisabledDialog(lang);
          await _addBotMessage(lang == 'te'
              ? "మీ ఫోన్ GPS ఆఫ్‌లో ఉంది. దయచేసి సెట్టింగ్స్‌లో ఆన్ చేయండి."
              : (lang == 'hi'
                  ? "आपके फोन का GPS बंद है। कृपया सेटिंग्स में इसे चालू करें।"
                  : "Device GPS is turned off. Please turn it on in settings."));
        } else if (loc.error!.type == LocationErrorType.permissionPermanentlyDenied ||
            loc.error!.type == LocationErrorType.permissionDenied) {
          _showPermissionDialog(lang);
          await _addBotMessage(lang == 'te'
              ? "లొకేషన్ అనుమతి అవసరం. దయచేసి యాప్ సెట్టింగ్స్‌లో అనుమతించండి."
              : (lang == 'hi'
                  ? "स्थान अनुमति आवश्यक है। कृपया ऐप सेटिंग्स में अनुमति दें।"
                  : "Location permission is required to detect nearby mandis."));
        } else {
          await _addBotMessage(loc.error!.message);
        }
      }
    } catch (e) {
      await _addBotMessage(lang == 'te'
          ? "లొకేషన్ పొందడంలో లోపం జరిగింది. దయచేసి మీ ఊరి పేరు టైప్ చేయండి."
          : "Could not fetch GPS. Please type your town or district name.");
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
        title: Text(lang == 'te' ? 'లొకేషన్ అనుమతి కావాలి' : (lang == 'hi' ? 'स्थान अनुमति चाहिए' : 'Location Permission Needed')),
        content: Text(lang == 'te'
            ? 'రైతు మిత్ర యాప్‌కు మీ సమీప మార్కెట్లను కనుగొనడానికి లొకేషన్ అనుమతి ఇవ్వండి.'
            : (lang == 'hi'
                ? 'निकटतम मंडियों को खोजने के लिए कृपया ऐप को स्थान अनुमति दें।'
                : 'Please grant location permission in App Settings so RythuMitra can find your closest mandis.')),
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
            child: Text(lang == 'te' ? 'యాప్ సెట్టింగ్స్' : 'App Settings'),
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

  Widget _buildQuickChip(String label, VoidCallback onTap) {
    return ActionChip(
      label: Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
      backgroundColor: Colors.grey.shade100,
      side: BorderSide(color: Colors.grey.shade300),
      onPressed: onTap,
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
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Flexible(
                          child: Text(
                            msg['text'],
                            style: const TextStyle(fontSize: 15, color: Colors.black87),
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
            padding: const EdgeInsets.all(16).copyWith(bottom: 28),
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
                        margin: const EdgeInsets.only(bottom: 16),
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
                                  padding: const EdgeInsets.symmetric(vertical: 14),
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
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ] else if (manager.usingGps && manager.locationText != null) ...[
                      Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.green.shade50,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.green.shade300),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.check_circle, size: 16, color: Colors.green),
                            const SizedBox(width: 6),
                            Flexible(
                              child: Text(
                                "📍 ${manager.locationText} (${manager.lat?.toStringAsFixed(2)}, ${manager.lng?.toStringAsFixed(2)})",
                                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.green.shade800),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(width: 8),
                            InkWell(
                              onTap: _useGpsLocation,
                              child: Text(
                                lang == 'te' ? 'మార్చు' : (lang == 'hi' ? 'बदलें' : 'Change'),
                                style: const TextStyle(fontSize: 12, color: Colors.blue, fontWeight: FontWeight.bold),
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
                                lang == 'te' ? "లేదు (అద్దె వాహనం)" : (lang == 'hi' ? "नहीं (किराया वाहन)" : "No (Need Transport)"),
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
                        },
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
                    const SizedBox(height: 20),
                    
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
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
