import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, Mic, Send, X, Bot, User, CheckCircle2, 
  ChevronUp, ChevronDown, Wrench, ArrowUpRight, Volume2, VolumeX
} from 'lucide-react';
import { processAgentQuery, type AgentContext, type AgentResponse } from '../../services/aiAgentService';

interface CampusAICopilotProps {
  context: AgentContext;
  isVisible: boolean;
  setIsVisible: (v: boolean) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  actionTaken?: AgentResponse['actionTaken'];
  timestamp: string;
}

export default function CampusAICopilot({ context, isVisible, setIsVisible }: CampusAICopilotProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: "Hello! I am your **Campus AI Copilot**. Press **'Z' twice** anytime to toggle me. Ask me about equipment health, due dates, certifications, or ask me to dispatch work orders.",
      timestamp: 'Just now',
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastKeyPressTime = useRef<number>(0);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize SpeechSynthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Text-to-Speech function
  const speakText = useCallback((text: string) => {
    if (!isTTSEnabled || !synthRef.current) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    // Strip markdown formatting for clean speech
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/[-•]\s/g, '')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();

    // Split long text into chunks (speechSynthesis has limits)
    const maxChunkSize = 200;
    const sentences = cleanText.split(/(?<=[.!?])\s+/);
    let chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + ' ' + sentence).length > maxChunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk = currentChunk ? currentChunk + ' ' + sentence : sentence;
      }
    }
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    // Speak each chunk
    for (const chunk of chunks) {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      utterance.lang = 'en-US';
      
      // Try to pick a good voice
      const voices = synthRef.current?.getVoices() || [];
      const preferredVoice = voices.find(v => 
        v.name.includes('Google') && v.lang.startsWith('en')
      ) || voices.find(v => 
        v.lang.startsWith('en-US') && !v.name.includes('Zira')
      ) || voices.find(v => 
        v.lang.startsWith('en')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      synthRef.current?.speak(utterance);
    }
  }, [isTTSEnabled]);

  // 1. Double-tap 'Z' key listener to toggle visibility and start listening
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'z' || e.key === 'Z') {
        const now = Date.now();
        if (now - lastKeyPressTime.current < 400) {
          // Double-press detected
          e.preventDefault();
          setIsVisible(!isVisible);
          if (!isVisible) {
            // Automatically activate voice listening when opened via double-Z
            setTimeout(() => startVoiceRecognition(), 200);
          } else {
            stopVoiceRecognition();
            synthRef.current?.cancel();
          }
        }
        lastKeyPressTime.current = now;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, setIsVisible]);

  // 2. Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript.trim()) {
          handleSendMessage(transcript);
        }
      };

      recognitionRef.current = recognition;
    }
  }, [context]);

  // Auto-scroll messages
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);

  const startVoiceRecognition = () => {
    if (recognitionRef.current && !isListening) {
      // Stop any ongoing TTS so mic doesn't pick up the AI's own voice
      synthRef.current?.cancel();
      try {
        recognitionRef.current.start();
      } catch {
        // already started
      }
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  };

  const handleToggleVoice = () => {
    if (isListening) {
      stopVoiceRecognition();
    } else {
      startVoiceRecognition();
    }
  };

  const handleWorkOrderClick = (workOrderDetails: any) => {
    // Navigate to the fire extinguisher panel so the user sees the work order
    if (context.setViewMode) context.setViewMode('classroom');
    if (context.setActiveAsset) context.setActiveAsset('fireExtinguisher');
  };

  const handleSendMessage = async (queryText?: string) => {
    const query = (queryText || inputText).trim();
    if (!query || isProcessing) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: timeStr,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      const response = await processAgentQuery(query, context);
      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: response.text,
        actionTaken: response.actionTaken,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, agentMsg]);

      // Speak the response aloud via TTS
      speakText(response.text);
    } catch {
      const errorMsg = 'Encountered a temporary communication issue with the diagnostics service.';
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'agent',
          text: errorMsg,
          timestamp: 'Now',
        },
      ]);
      speakText(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  // If hidden, don't render anything (the pill is now in the BottomBar)
  if (!isVisible) {
    return null;
  }

  const latestMessage = messages[messages.length - 1];

  return (
    <div className={`ai-dynamic-island ${isExpanded ? 'island-expanded' : 'island-pill'}`}>
      {/* 1. Dynamic Island Compact Pill View */}
      <div 
        className="ai-island-header" 
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <div className="ai-island-left">
          <div className={`ai-orb ${isListening ? 'listening' : isProcessing ? 'thinking' : ''}`}>
            <Sparkles size={14} color="#fff" />
          </div>
          <div className="ai-status-text">
            <strong className="ai-brand-title">CAMPUS AI</strong>
            <span className="ai-live-sub">
              {isListening 
                ? 'Listening to voice...' 
                : isProcessing 
                ? 'Analyzing campus telemetry...' 
                : latestMessage?.sender === 'agent' && !isExpanded
                ? latestMessage.text.replace(/[*_#]/g, '').slice(0, 52) + '...'
                : "Active • Double-press 'Z'"}
            </span>
          </div>
        </div>

        <div className="ai-island-actions" onClick={e => e.stopPropagation()}>
          {/* TTS Toggle Button */}
          <button 
            className={`ai-pill-btn ${isTTSEnabled ? 'tts-active' : ''}`}
            onClick={() => {
              setIsTTSEnabled(prev => !prev);
              if (isTTSEnabled) synthRef.current?.cancel();
            }}
            title={isTTSEnabled ? 'Mute voice responses' : 'Enable voice responses'}
          >
            {isTTSEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>

          {/* Voice Input Button */}
          <button 
            className={`ai-pill-btn ${isListening ? 'active-mic' : ''}`}
            onClick={handleToggleVoice}
            title={isListening ? 'Stop listening' : 'Start speaking'}
          >
            {isListening ? <Mic size={14} color="#ff453a" /> : <Mic size={14} />}
          </button>

          {/* Expand/Collapse Toggle */}
          <button 
            className="ai-pill-btn" 
            onClick={() => setIsExpanded(prev => !prev)}
            title={isExpanded ? 'Minimize' : 'Expand conversation'}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>

          {/* Close Island Button */}
          <button 
            className="ai-pill-btn close" 
            onClick={() => {
              setIsVisible(false);
              stopVoiceRecognition();
              synthRef.current?.cancel();
            }}
            title="Dismiss widget"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* 2. Expanded Minimalist Chat Tray (Non-blocking compact height) */}
      {isExpanded && (
        <div className="ai-island-expanded-tray">
          {/* Suggestion Chips */}
          <div className="ai-quick-chips">
            <button 
              className="ai-chip"
              onClick={() => handleSendMessage('When is the next inspection for the fire extinguisher?')}
            >
              📅 Next inspection?
            </button>
            <button 
              className="ai-chip"
              onClick={() => handleSendMessage('What is the current health and anomaly status?')}
            >
              🛡️ Anomaly check
            </button>
            <button 
              className="ai-chip"
              onClick={() => handleSendMessage('Create a high priority work order for valve pressure leakage')}
            >
              ⚠️ Create work order
            </button>
            <button 
              className="ai-chip"
              onClick={() => handleSendMessage('Fly camera to Classroom 101 fire extinguisher')}
            >
              🎯 Focus in 3D
            </button>
          </div>

          {/* Conversation Stream */}
          <div className="ai-messages-scroll">
            {messages.map(msg => (
              <div key={msg.id} className={`ai-msg-row ${msg.sender}`}>
                <div className="ai-msg-avatar">
                  {msg.sender === 'agent' ? <Bot size={13} color="#2997ff" /> : <User size={13} color="#fff" />}
                </div>
                <div className="ai-msg-bubble">
                  <div className="ai-msg-text">
                    {msg.text.split('\n').map((line, i) => (
                      <p key={i} style={{ margin: line ? '2px 0' : '4px 0' }}>
                        {line}
                      </p>
                    ))}
                  </div>

                  {/* Action feedback card - clickable if work order was created */}
                  {msg.actionTaken && (
                    <div 
                      className={`ai-action-card ${msg.actionTaken.type === 'WORK_ORDER_CREATED' ? 'ai-action-clickable' : ''}`}
                      onClick={() => {
                        if (msg.actionTaken?.type === 'WORK_ORDER_CREATED') {
                          handleWorkOrderClick(msg.actionTaken.details);
                        }
                      }}
                    >
                      <div className="ai-action-header">
                        {msg.actionTaken.type === 'WORK_ORDER_CREATED' ? (
                          <Wrench size={13} color="#ff9f0a" />
                        ) : msg.actionTaken.type === 'NAVIGATE' ? (
                          <ArrowUpRight size={13} color="#2997ff" />
                        ) : (
                          <CheckCircle2 size={13} color="#34c759" />
                        )}
                        <span>{msg.actionTaken.summary}</span>
                        {msg.actionTaken.type === 'WORK_ORDER_CREATED' && (
                          <ArrowUpRight size={11} color="#86868b" style={{ marginLeft: 'auto' }} />
                        )}
                      </div>
                      {msg.actionTaken.details && (
                        <div className="ai-action-sub">
                          {msg.actionTaken.type === 'WORK_ORDER_CREATED' 
                            ? `Tap to view work order • ${msg.actionTaken.details.priority} Priority`
                            : `Logged into compliance ledger: ${msg.actionTaken.details.title}`
                          }
                        </div>
                      )}
                    </div>
                  )}

                  <span className="ai-msg-time">{msg.timestamp}</span>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="ai-msg-row agent">
                <div className="ai-msg-avatar">
                  <Bot size={13} color="#2997ff" />
                </div>
                <div className="ai-msg-bubble thinking-bubble">
                  <div className="ai-dot-wave">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form 
            className="ai-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input 
              type="text"
              className="ai-text-input"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask about dates, certifications, anomalies, or create work order..."
            />
            <button 
              type="submit" 
              className="ai-send-btn" 
              disabled={!inputText.trim() || isProcessing}
            >
              <Send size={13} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
