
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';

const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Determine if we should use geolocation for grounding
      let userLocation = null;
      if (input.toLowerCase().includes('near') || input.toLowerCase().includes('around') || input.toLowerCase().includes('restaurants')) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => 
            navigator.geolocation.getCurrentPosition(res, rej)
          );
          userLocation = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          };
        } catch (e) {
          console.warn('Geolocation not allowed or failed');
        }
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: input,
        config: {
          tools: userLocation ? [{ googleMaps: {} }, { googleSearch: {} }] : [{ googleSearch: {} }],
          ...(userLocation && {
            toolConfig: {
              retrievalConfig: { latLng: userLocation }
            }
          })
        },
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const urls = groundingChunks.map(chunk => {
        if (chunk.web) return { uri: chunk.web.uri, title: chunk.web.title };
        if (chunk.maps) return { uri: chunk.maps.uri, title: chunk.maps.title };
        return null;
      }).filter(Boolean) as Array<{ uri: string; title: string }>;

      const modelMsg: ChatMessage = {
        role: 'model',
        text: response.text || 'No response',
        timestamp: Date.now(),
        groundingUrls: urls.length > 0 ? urls : undefined
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        role: 'model',
        text: 'Error generating response. Please try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pb-24 pr-2"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-xl font-medium">Lumina Intelligence</p>
            <p className="text-sm">Start a conversation with complex reasoning and search grounding</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-3xl px-6 py-4 shadow-sm border ${
              msg.role === 'user' 
                ? 'bg-blue-600 border-blue-500 text-white' 
                : 'bg-gray-800 border-gray-700 text-gray-100'
            }`}>
              <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                {msg.text}
              </div>
              
              {msg.groundingUrls && (
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">Grounding Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingUrls.map((link, idx) => (
                      <a 
                        key={idx} 
                        href={link.uri} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs bg-gray-900 border border-gray-700 hover:border-blue-500/50 text-blue-400 py-1 px-3 rounded-full transition-colors truncate max-w-[200px]"
                      >
                        {link.title || link.uri}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 rounded-3xl px-6 py-4 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-xs text-gray-400 font-medium">Gemini is thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 pointer-events-none">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-2 shadow-2xl pointer-events-auto flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask anything (e.g. 'What's the weather like in Tokyo?' or 'Show me nearby cafes')"
            className="flex-1 bg-transparent border-0 ring-0 focus:ring-0 text-white p-3 min-h-[50px] max-h-40 overflow-y-auto resize-none"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-xl transition-all ${
              !input.trim() || isLoading 
                ? 'bg-gray-800 text-gray-600' 
                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
