import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:speech_to_text/speech_to_text.dart';
import '../../core/theme/app_theme.dart';
import '../../localization/app_strings.dart';
import '../../providers/language_provider.dart';
import '../../providers/search_provider.dart';
import '../../models/app_models.dart';
import '../../services/api_service.dart';
import '../search/search_animation_screen.dart';

class AssistantScreen extends StatefulWidget {
  const AssistantScreen({super.key});

  @override
  State<AssistantScreen> createState() => _AssistantScreenState();
}

class _AssistantScreenState extends State<AssistantScreen>
    with SingleTickerProviderStateMixin {
  final _speech = SpeechToText();
  final _textCtrl = TextEditingController();
  final List<Map<String, dynamic>> _messages = [];

  bool _isListening = false;
  bool _speechEnabled = false;
  bool _isProcessing = false;
  late AnimationController _pulseCtrl;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);

    _initSpeech();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _addBotMessage("Namaskaram! What crop do you have to sell today, and how much?");
    });
  }

  Future<void> _initSpeech() async {
    _speechEnabled = await _speech.initialize();
    setState(() {});
  }

  void _startListening() async {
    if (!_speechEnabled) return;
    await _speech.listen(onResult: (result) {
      if (result.finalResult) {
        _textCtrl.text = result.recognizedWords;
        _sendMessage();
      }
    });
    setState(() => _isListening = true);
  }

  void _stopListening() async {
    await _speech.stop();
    setState(() => _isListening = false);
  }

  void _addBotMessage(String text) {
    setState(() {
      _messages.insert(0, {'isBot': true, 'text': text});
    });
  }

  void _addUserMessage(String text) {
    setState(() {
      _messages.insert(0, {'isBot': false, 'text': text});
    });
  }

  Future<void> _sendMessage() async {
    final text = _textCtrl.text.trim();
    if (text.isEmpty) return;
    _textCtrl.clear();
    
    _addUserMessage(text);
    setState(() => _isProcessing = true);

    try {
      final lang = context.read<LanguageProvider>().langCode;
      
      final response = await apiService.post('/ai/parse-harvest', {
        'text': text,
        'language': lang,
      });
      
      final data = response['parsed'] ?? {};
      
      if (data['isComplete'] == true) {
        _addBotMessage("Great! I have all the details. I will now search for the best market for ${data['quantityKg']} kg of ${data['crop']}.");
        
        await Future.delayed(const Duration(seconds: 2));
        
        if (!mounted) return;
        final req = RecommendationRequest(
          crop: data['crop'],
          quantityKg: data['quantityKg'],
          latitude: 17.38,
          longitude: 78.48,
          locationText: data['location'] ?? 'Unknown',
          hasTransport: data['hasTransport'] ?? true,
          language: lang,
        );
        
        Navigator.push(context, MaterialPageRoute(
          builder: (_) => SearchAnimationScreen(request: req),
        ));
      } else {
        _addBotMessage(data['followUpQuestion'] ?? "Can you provide the missing details (Crop, Quantity, Location, Transport)?");
      }
      
    } catch (e) {
      _addBotMessage("Sorry, I had trouble understanding that. Please try typing it out or use the Find Best Option wizard instead.");
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    _speech.cancel();
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
                      style: TextStyle(
                        fontSize: 15,
                        color: isBot ? Colors.black87 : Colors.black87,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          
          if (_isProcessing)
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: Text('AI is thinking...', style: TextStyle(color: Colors.grey)),
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
                  onTapDown: (_) => _startListening(),
                  onTapUp: (_) => _stopListening(),
                  onTapCancel: () => _stopListening(),
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
                        onSubmitted: (_) => _sendMessage(),
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
                        onPressed: _sendMessage,
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
