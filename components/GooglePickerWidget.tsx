import React, { useState, useEffect } from 'react';
import { getCachedAccessToken, signInWithGoogleWorkspace, initAuth } from '../utils/firebase';
import { FileSearch, LogIn } from 'lucide-react';
import { User } from 'firebase/auth';

export const GooglePickerWidget: React.FC = () => {
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [pickedFile, setPickedFile] = useState<{ name: string; url: string } | null>(null);

  useEffect(() => {
    initAuth(
      (user, token) => setNeedsAuth(false),
      () => setNeedsAuth(true)
    );
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await signInWithGoogleWorkspace();
      if (result) {
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const openPicker = async () => {
    const token = getCachedAccessToken();
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    if (!window.google || !window.google.picker) {
      // Ensure the API is loaded
      window.gapi.load('picker', () => {
        showPicker(token);
      });
    } else {
      showPicker(token);
    }
  };

  const showPicker = (token: string) => {
    const pickerOrigin =
      window.location.ancestorOrigins &&
      window.location.ancestorOrigins.length > 0
        ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
        : window.location.origin;

    const picker = new window.google.picker.PickerBuilder()
      .addView(window.google.picker.ViewId.DOCS)
      .setOAuthToken(token)
      .setCallback((data: any) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const file = data.docs[0];
          setPickedFile({
            name: file.name,
            url: file.url,
          });
        }
      })
      .setOrigin(pickerOrigin)
      .build();
    
    picker.setVisible(true);
  };

  return (
    <div className="bg-gray-900/50 border border-amber-500/20 p-6 rounded-2xl flex flex-col items-start gap-4">
      <div className="flex items-center gap-3">
        <FileSearch className="text-amber-500 w-6 h-6" />
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Workspace Document Integration</h3>
          <p className="text-[10px] text-gray-500 font-mono">Link Fiduciary Assets from Google Drive</p>
        </div>
      </div>

      {needsAuth ? (
        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-bold transition-all"
        >
          <LogIn className="w-4 h-4" />
          {isLoggingIn ? 'Authenticating...' : 'Sign in with Google Workspace'}
        </button>
      ) : (
        <button
          onClick={openPicker}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-400 rounded-lg text-sm font-bold transition-all"
        >
          <FileSearch className="w-4 h-4" />
          Browse Google Drive Files
        </button>
      )}

      {pickedFile && (
        <div className="mt-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl w-full">
          <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mb-1">Asset Linked Successfully</p>
          <p className="text-xs text-white truncate"><span className="text-gray-500">File:</span> {pickedFile.name}</p>
        </div>
      )}
    </div>
  );
};
