
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { decode, encode, decodeAudioData } from '../utils/audio';
import { TranscriptionItem } from '../types';

const LivePanel: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptionBufferRef = useRef({ user: '', model: '' });

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close?.();
      sessionRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setIsActive(false);
  }, []);

  const startSession = async () => {
    try {
      setError(null);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            setIsActive(true);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              transcriptionBufferRef.current.user += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
              transcriptionBufferRef.current.model += message.serverContent.outputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              const { user, model } = transcriptionBufferRef.current;
              setTranscriptions(prev => [...prev, 
                { role: 'user', text: user },
                { role: 'model', text: model }
              ]);
              transcriptionBufferRef.current = { user: '', model: '' };
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              source.onended = () => sourcesRef.current.delete(source);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live error:', e);
            setError('Session encounter an error. Please try again.');
            stopSession();
          },
          onclose: () => {
            console.log('Session closed');
            setIsActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: 'You are Lumina, a wise and friendly AI voice assistant. Keep responses concise and human-like.'
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not start voice session.');
      setIsActive(false);
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, [stopSession]);

  return (
    <div className="h-full flex flex-col items-center p-8 bg-gray-950/20">
      <div className="w-full max-w-4xl h-full flex flex-col">
        
        <div className="flex-1 flex flex-col items-center justify-center relative py-12">
          <div className={`w-48 h-48 rounded-full flex items-center justify-center relative transition-all duration-700 ${isActive ? 'bg-blue-600/20 scale-110 shadow-[0_0_80px_rgba(37,99,235,0.3)]' : 'bg-gray-800'}`}>
            <div className={`absolute inset-0 rounded-full border-2 border-blue-500/30 ${isActive ? 'animate-ping' : ''}`}></div>
            <div className={`absolute inset-4 rounded-full border border-blue-400/20 ${isActive ? 'animate-pulse' : ''}`}></div>
            <svg 
              className={`w-20 h-20 transition-colors duration-500 ${isActive ? 'text-blue-500' : 'text-gray-600'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>

          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">{isActive ? 'Lumina is listening...' : 'Ready to Talk?'}</h2>
            <p className="text-gray-500 max-w-sm mx-auto">
              {isActive ? 'Speak naturally. Lumina will respond instantly with high-fidelity audio.' : 'Tap the button below to start a real-time conversation.'}
            </p>
          </div>

          <div className="mt-12">
            {!isActive ? (
              <button
                onClick={startSession}
                className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
              >
                <div className="w-3 h-3 bg-white rounded-full"></div>
                Start Conversation
              </button>
            ) : (
              <button
                onClick={stopSession}
                className="bg-red-600/10 border border-red-500/50 hover:bg-red-600/20 text-red-500 px-10 py-4 rounded-full font-bold transition-all active:scale-95"
              >
                End Session
              </button>
            )}
          </div>

          {error && <p className="mt-4 text-red-400 text-sm bg-red-400/10 py-2 px-4 rounded-lg border border-red-400/20">{error}</p>}
        </div>

        <div className="h-64 mt-6 bg-gray-900/50 rounded-3xl border border-gray-800 p-6 flex flex-col shadow-inner">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Live Transcription</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 scroll-smooth">
            {transcriptions.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-gray-600 italic">No activity yet. Audio transcripts will stream here.</p>
              </div>
            )}
            {transcriptions.map((t, idx) => (
              <div key={idx} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-xs ${t.role === 'user' ? 'bg-blue-600/20 text-blue-300 border border-blue-500/20' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                  <span className="font-bold opacity-50 mr-2 uppercase text-[9px]">{t.role}:</span>
                  {t.text}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LivePanel;
