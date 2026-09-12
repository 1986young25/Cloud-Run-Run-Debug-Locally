
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GeneratedVideo } from '../types';

const VideoPanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        // @ts-ignore
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        // Fallback for dev environments if needed
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      // Assume success as per instructions to avoid race conditions
      setHasKey(true);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setProgressMessage('Submitting request to Veo 3.1...');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      const messages = [
        'Interpreting cinematic direction...',
        'Generating keyframes...',
        'Synthesizing temporal consistency...',
        'Rendering final motion paths...',
        'Finalizing MP4 stream...'
      ];
      let msgIdx = 0;

      while (!operation.done) {
        setProgressMessage(messages[msgIdx % messages.length]);
        msgIdx++;
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const fetchUrl = `${downloadLink}&key=${process.env.API_KEY}`;
        setVideos(prev => [{
          id: Date.now().toString(),
          url: fetchUrl,
          prompt,
          status: 'completed',
          timestamp: Date.now()
        }, ...prev]);
        setPrompt('');
      }
    } catch (error: any) {
      console.error('Video generation failed', error);
      if (error.message?.includes('Requested entity was not found')) {
        setHasKey(false);
      }
    } finally {
      setIsGenerating(false);
      setProgressMessage('');
    }
  };

  if (!hasKey) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-950/50">
        <div className="max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-10 shadow-2xl">
          <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">API Key Required</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Veo video generation requires a paid Google Cloud project. Please select an authorized API key to access this laboratory.
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-500/20"
          >
            Select API Key
          </button>
          <p className="mt-6 text-xs text-gray-500">
            For more details, visit the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">billing documentation</a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className="w-full md:w-80 p-6 border-b md:border-b-0 md:border-r border-gray-800 overflow-y-auto space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 text-center md:text-left">Video Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A neon hologram of a cat driving at top speed through a futuristic highway..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm text-white focus:border-blue-500 focus:ring-0 min-h-[150px] resize-none"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all ${
            !prompt.trim() || isGenerating
              ? 'bg-gray-800 text-gray-500'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-500/20'
          }`}
        >
          {isGenerating ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span>{isGenerating ? 'Synthesizing...' : 'Create Video'}</span>
        </button>

        {isGenerating && (
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl animate-pulse">
            <p className="text-xs text-indigo-400 font-medium text-center">{progressMessage}</p>
          </div>
        )}
      </div>

      <div className="flex-1 p-8 overflow-y-auto bg-gray-950/20">
        {videos.length === 0 && !isGenerating ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-40 text-center">
            <div className="w-24 h-24 mb-6 border-2 border-dashed border-gray-700 rounded-3xl flex items-center justify-center">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Dream in Motion</h3>
            <p className="max-w-sm">Describe a scene and Veo will bring it to life with high-definition temporal consistency.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {isGenerating && (
              <div className="aspect-video bg-gray-900 border border-gray-800 rounded-3xl flex flex-col items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent"></div>
                <div className="relative z-10 text-center p-8">
                  <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-lg font-bold text-white mb-2">Rendering Masterpiece</p>
                  <p className="text-sm text-gray-500">Video generation typically takes 1-2 minutes.</p>
                </div>
              </div>
            )}
            {videos.map(vid => (
              <div key={vid.id} className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl group">
                <div className="aspect-video relative bg-black">
                  <video src={vid.url} controls className="w-full h-full object-contain" />
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-300 font-medium italic mb-4">"{vid.prompt}"</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">HD 720p • 16:9 • MP4</span>
                    <a 
                      href={vid.url} 
                      download 
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      DOWNLOAD
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPanel;
