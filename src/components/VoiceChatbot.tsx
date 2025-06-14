import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceChatbotProps {
  language: string;
}

const BigPulseCircle = ({ active }: { active: boolean }) => (
  <AnimatePresence>
    {active && (
      <motion.span
        className="pointer-events-none fixed inset-0 flex items-center justify-center z-30"
        initial={{ scale: 1, opacity: 0.85 }}
        animate={{ scale: [1, 1.42, 1], opacity: [0.92, 0.75, 0.92] }}
        exit={{ scale: 1, opacity: 0.5 }}
        transition={{
          repeat: Infinity,
          duration: 1.48,
          repeatType: "loop",
          ease: "easeInOut"
        }}
        style={{
          left: 0, right: 0, top: 0, bottom: 0,
          pointerEvents: 'none',
          zIndex: 30,
          position: 'fixed' as const,
        }}
      >
        <span
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "radial-gradient(circle at 48% 52%, #fff 15%, #D8B4F8 44%, #C084FC 80%, #A78BFA 99%)",
            boxShadow:
              "0 0 50px 14px #C084FC99, 0 0 80px 32px #A78BFA66, 0 0 0 40px #FFF3",
            filter: "brightness(1.18) blur(3px)",
            opacity: 1,
            zIndex: 31,
          }}
          className="animate-pulseLavender"
        />
      </motion.span>
    )}
  </AnimatePresence>
);

const VoiceChatbot: React.FC<VoiceChatbotProps> = ({ language }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Array<{
    type: 'user' | 'ai';
    content: string;
    confidence?: string;
    suggestion?: string;
  }>>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const translations = {
    hindi: {
      placeholder: "अपने लक्षण बताएं या माइक दबाकर बोलें...",
      listening: "सुन रहा हूं...",
      processing: "जवाब तैयार कर रहा हूं...",
      send: "भेजें",
      speakResponse: "जवाब सुनें",
      stopSpeaking: "बंद करें",
      confidence: "विश्वसनीयता",
      suggestion: "सुझाव"
    },
    english: {
      placeholder: "Describe your symptoms or tap mic to speak...",
      listening: "Listening...",
      processing: "Processing response...",
      send: "Send",
      speakResponse: "Speak Response",
      stopSpeaking: "Stop",
      confidence: "Confidence",
      suggestion: "Suggestion"
    }
  };

  const t = translations[language];

  // Mock Gemini API call
  const callGeminiAPI = async (symptomText: string) => {
    // In real implementation, this would call Gemini API
    // For demo, returning mock responses
    const mockResponses = {
      hindi: {
        fever: {
          response: "लगता है आपको वायरल बुखार हो सकता है। आराम करें और पानी पिएं। अगर 2 दिन में आराम न मिले तो डॉक्टर से मिलें।",
          confidence: "80%",
          suggestion: "rest"
        },
        headache: {
          response: "सिरदर्द के कई कारण हो सकते हैं। पानी पिएं, आराम करें। अगर दर्द बना रहे तो डॉक्टर से सलाह लें।",
          confidence: "70%",
          suggestion: "doctor"
        }
      },
      english: {
        fever: {
          response: "It seems like you might have a viral fever. Rest and drink plenty of water. If no relief in 2 days, consult a doctor.",
          confidence: "80%",
          suggestion: "rest"
        },
        headache: {
          response: "Headaches can have multiple causes. Drink water, rest well. If pain persists, consult a doctor.",
          confidence: "70%",
          suggestion: "doctor"
        }
      }
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerText = symptomText.toLowerCase();
    if (lowerText.includes('fever') || lowerText.includes('बुखार')) {
      return mockResponses[language].fever;
    } else if (lowerText.includes('headache') || lowerText.includes('सिरदर्द')) {
      return mockResponses[language].headache;
    } else {
      return {
        response: language === 'hindi' 
          ? "मैं आपकी समस्या समझ गया हूं। कृपया अधिक जानकारी दें या डॉक्टर से सलाह लें।"
          : "I understand your concern. Please provide more details or consult a doctor for proper diagnosis.",
        confidence: "60%",
        suggestion: "doctor"
      };
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { type: 'user' as const, content: inputText };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await callGeminiAPI(inputText);
      
      const aiMessage = {
        type: 'ai' as const,
        content: response.response,
        confidence: response.confidence,
        suggestion: response.suggestion
      };

      setMessages(prev => [...prev, aiMessage]);

      // Save to backend API (mock call)
      await saveHealthChatData({
        symptom_input: inputText,
        ai_response: response.response,
        confidence_score: response.confidence,
        suggestion_type: response.suggestion,
        language_selected: language
      });

      setInputText('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveHealthChatData = async (data: any) => {
    try {
      // In real implementation, use environment variable for API URL
      const apiUrl = import.meta.env.VITE_API_URL || '/api/save-healthchat';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Health chat data saved:', result);
    } catch (error) {
      console.error('Failed to save health chat data:', error);
      // Don't throw error to user, just log it
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: "Not Supported",
        description: "Speech synthesis is not supported in your browser.",
        variant: "destructive"
      });
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hindi' ? 'hi-IN' : 'en-US';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        toast({
          title: "Error",
          description: "Failed to speak text. Please try again.",
          variant: "destructive"
        });
      };
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
      toast({
        title: "Error",
        description: "Failed to speak text. Please try again.",
        variant: "destructive"
      });
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      try {
        speechSynthesis.cancel();
        setIsSpeaking(false);
      } catch (error) {
        console.error('Error stopping speech:', error);
      }
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = language === 'hindi' ? 'hi-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
      };

      recognition.start();
    } else {
      toast({
        title: "Not Supported",
        description: "Speech recognition not supported in this browser",
        variant: "destructive"
      });
    }
  };

  // --- COLORS ---
  // We'll use several layers for the pulse: 
  // - #C084FC (lavender)
  // - #A78BFA (dark lavender)
  // - #E0E7FF (highlight/white center)

  // --- PULSE CIRCLE COMPONENT ---
  // Make the circle very big, bright, and colorful

  return (
    <div className="space-y-4 relative px-2 sm:px-4 w-full max-w-full">
      {/* --- New: Centered Box above Textarea --- */}
      <div className="w-full flex justify-center relative z-30">
        <div className="w-full flex flex-col items-center">
          <div className="w-full flex justify-center">
            <Card className="rounded-2xl shadow-lg-glass bg-white/90 w-full max-w-xs sm:max-w-sm md:max-w-lg mb-2">
              <CardContent className="flex items-center justify-center px-3 py-4 md:p-7 min-h-[80px] md:min-h-[108px]">
                <div className="flex items-center justify-center w-20 h-20 md:w-[96px] md:h-[96px] relative overflow-hidden">
                  <BigPulseCircle active={true} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Messages / main prompt area */}
      <div className="max-h-[40vh] sm:max-h-[48vh] md:max-h-96 overflow-y-auto space-y-4 relative z-40 px-1">
        {/* Show prompt/mic ONLY if NO messages and not listening/speaking (hide when listening/speaking) */}
        {messages.length === 0 && !isListening && !isSpeaking && (
          <div className="text-center py-8 md:py-16 relative flex flex-col items-center justify-center">
            <div
              className="relative flex items-center justify-center mb-3 w-full"
              style={{ minHeight: 120 }}
            >
              <span
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "100%",
                  background:
                    "radial-gradient(circle at 48% 52%, #fff 14%, #D8B4F8 42%, #C084FC 76%, #A78BFA 98%)",
                  boxShadow:
                    "0 0 30px 6px #C084FC44, 0 0 36px 8px #A78BFA44, 0 0 0 12px #FFF4",
                  filter: "brightness(1.07) blur(1px)",
                  zIndex: 1,
                  opacity: 0.93,
                  position: "absolute" as const,
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
              <span className="relative z-10 lavender-pulse flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20">
                <Mic className="w-10 h-10 sm:w-14 sm:h-14 text-primary font-extrabold drop-shadow-lg" />
              </span>
            </div>
            <p className="font-mono text-primary text-xl md:text-2xl font-heading relative z-10 px-2">
              {language === "hindi"
                ? "अपने स्वास्थ्य संबंधी प्रश्न पूछें"
                : "Ask your health-related questions"}
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <Card
            key={index}
            className={`${
              message.type === "user"
                ? "ml-auto bg-primary text-white max-w-[86vw] sm:max-w-sm md:max-w-md font-heading rounded-2xl shadow-lg-glass"
                : "mr-auto bg-white/80 text-foreground max-w-[96vw] sm:max-w-md md:max-w-lg font-mono rounded-2xl shadow-lg-glass"
            }`}
          >
            <CardContent className="p-3 md:p-4">
              <p className="text-base md:text-lg mb-2 font-heading break-words">{message.content}</p>

              {message.type === "ai" && (
                <div className="space-y-2 font-mono">
                  {message.confidence && (
                    <Badge variant="secondary" className="text-xs">
                      {t.confidence}: {message.confidence}
                    </Badge>
                  )}

                  {message.suggestion && (
                    <Badge
                      variant={
                        message.suggestion === "emergency" ? "destructive" : "default"
                      }
                      className="text-xs ml-2"
                    >
                      {t.suggestion}: {message.suggestion}
                    </Badge>
                  )}

                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => speakText(message.content)}
                      disabled={isSpeaking}
                      className="font-heading"
                    >
                      <Volume2 className="w-3 h-3 mr-1 text-primary font-bold" />
                      {t.speakResponse}
                    </Button>

                    {isSpeaking && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={stopSpeaking}
                        className="font-heading"
                      >
                        <VolumeX className="w-3 h-3 mr-1 text-primary font-bold" />
                        {t.stopSpeaking}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {isLoading && (
          <Card className="mr-auto bg-gray-50 max-w-[95vw] sm:max-w-sm md:max-w-lg">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600">{t.processing}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Input + mic/send */}
      <div className="flex flex-col xs:flex-row gap-2 relative z-30 items-center justify-center w-full" style={{ minHeight: 80 }}>
        {(isListening || isSpeaking) && (
          <span
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 1 }}
          >
            <BigPulseCircle active={true} />
          </span>
        )}

        <div className="flex-1 w-full">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.placeholder}
            className="min-h-[42px] md:min-h-[60px] resize-none font-mono glass-input text-base"
            onKeyPress={(e) =>
              e.key === "Enter" && !e.shiftKey && handleSendMessage()
            }
          />
        </div>

        <div className="flex flex-row gap-2 w-full xs:w-auto justify-end">
          <Button
            onClick={isListening ? undefined : startListening}
            disabled={isListening}
            variant={isListening ? "default" : "outline"}
            className={`h-12 w-12 md:h-[60px] md:w-16 rounded-2xl font-heading ${
              isListening ? "bg-primary" : ""
            }`}
            aria-label={isListening ? t.stopSpeaking : t.speakResponse}
          >
            {isListening ? (
              <MicOff className="w-5 h-5 text-primary font-bold" />
            ) : (
              <Mic className="w-5 h-5 text-primary font-bold" />
            )}
          </Button>

          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="h-12 w-12 md:h-[60px] md:w-16 rounded-2xl font-heading bg-primary text-white font-bold"
            aria-label={t.send}
          >
            <Send className="w-5 h-5 text-white font-bold" />
          </Button>
        </div>
      </div>
      {isListening && (
        <div className="text-center relative z-30 pt-1">
          <Badge variant="destructive" className="animate-pulse font-mono">
            {t.listening}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default VoiceChatbot;
