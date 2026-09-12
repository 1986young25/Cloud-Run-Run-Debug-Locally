
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GeneratedImage } from '../types';

const ImagePanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1:1');

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          }
        },
      });

      let foundImageUrl = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          foundImageUrl = `data:image/png;base64,${base64EncodeString}`;
          break;
        }
      }

      if (foundImageUrl) {
        const newImg: GeneratedImage = {
          id: Date.now().toString(),
          url: foundImageUrl,
          prompt,
          timestamp: Date.now()
        };
        setImages(prev => [newImg, ...prev]);
        setPrompt('');
      }
    } catch (error) {
      console.error('Image generation failed', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className="w-full md:w-80 p-6 border-b md:border-b-0 md:border-r border-gray-800 overflow-y-auto space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A vibrant cyberpunk cityscape at dusk..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm text-white focus:border-blue-500 focus:ring-0 min-h-[120px] resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Aspect Ratio</label>
          <div className="grid grid-cols-3 gap-2">
            {['1:1', '4:3', '16:9', '3:4', '9:16'].map(ratio => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`text-xs py-2 rounded-lg border transition-all ${
                  aspectRatio === ratio 
                    ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
            !prompt.trim() || isGenerating
              ? 'bg-gray-800 text-gray-500'
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-500/20'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Envisioning...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.641.32a2 2 0 01-2.08 0l-.641-.32a6 6 0 00-3.86-.517l-2.387.477a2 2 0 00-1.022.547l-1.012 1.012a2 2 0 00-.586 1.414V21a1 1 0 001 1h16a1 1 0 001-1v-4.159a2 2 0 00-.586-1.414l-1.012-1.012z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.998 3.101c.253.111.455.31.57.559l.542 1.18c.084.18.25.312.447.354l1.28.27c.504.107.708.736.41 1.134l-.94 1.25c-.145.195-.197.444-.143.684l.354 1.58c.11.492-.41.87-.853.64l-1.42-.74a1.008 1.008 0 00-.936 0l-1.42.74c-.443.23-.963-.148-.853-.64l.354-1.58c.054-.24.002-.49-.143-.684l-.94-1.25c-.298-.398-.094-1.027.41-1.134l1.28-.27c.197-.042.363-.174.447-.354l.542-1.18c.115-.25.317-.448.57-.559a.75.75 0 01.594 0z" />
              </svg>
              <span>Generate Image</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {images.length === 0 && !isGenerating ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50 text-center">
            <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xl font-medium">Your masterpieces will appear here</p>
            <p className="max-w-xs mt-2">Enter a prompt on the left to start generating high-quality visual art.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isGenerating && (
              <div className="aspect-square bg-gray-800 border border-gray-700 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-medium text-gray-400">Gemini is sketching your idea...</p>
              </div>
            )}
            {images.map(img => (
              <div key={img.id} className="group relative rounded-2xl overflow-hidden border border-gray-800 bg-gray-900 shadow-lg">
                <img src={img.url} alt={img.prompt} className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                  <p className="text-xs text-white line-clamp-2">{img.prompt}</p>
                  <button className="mt-3 text-[10px] bg-white/10 hover:bg-white/20 backdrop-blur-md py-1.5 px-3 rounded-lg font-bold w-fit">DOWNLOAD HD</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePanel;
