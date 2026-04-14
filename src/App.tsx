import { useState, useRef, useEffect, ChangeEvent } from 'react';
import SketchCanvas from './components/SketchCanvas';
import { RenderMode } from './types';

function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [effectMode, setEffectMode] = useState<RenderMode>(0);
  const [isReady, setIsReady] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Phase 3: Start Experience & Audio
  const startExperience = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play blocked", e));
      setIsMuted(false);
    }
    setHasStarted(true);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch(e => console.log("Audio play blocked", e));
        setIsMuted(false);
      } else {
        audioRef.current.pause();
        setIsMuted(true);
      }
    }
  };

  // Clean up old URLs
  useEffect(() => {
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setIsMenuOpen(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const UIContent = (
    <>
      <div className="mode-group">
        <div className="label-small">Renderer</div>
        {(['ascii', 'dots', 'pixel'] as const).map((mode, index) => (
          <button
            key={mode}
            className={`text-btn ${effectMode === index ? 'active' : ''}`}
            onClick={() => { setEffectMode(index as RenderMode); setIsMenuOpen(false); }}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="mode-group">
        <div className="label-small">Actions</div>
        <button className="text-btn" onClick={handleUploadClick}>
          Upload Photo
        </button>
        <button className="text-btn" onClick={toggleMute}>
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>
    </>
  );

  return (
    <div className="app-container">
      <SketchCanvas 
        imageSrc={imageSrc} 
        effectMode={effectMode}
        onReady={(ready) => setIsReady(ready)}
        hasStarted={hasStarted}
      />

      <audio ref={audioRef} src="/music.mp3" loop />

      {/* Start UI Overlay (Shown after loading, before art) */}
      <div className={`enter-overlay ${isReady && !hasStarted ? 'visible' : ''}`}>
        <button className="start-btn" onClick={startExperience}>
          [ ENTER ]
        </button>
      </div>

      {/* Modern UI Overlay (Main Controls) */}
      <div className={`ui-overlay ${!hasStarted ? 'hidden' : ''}`}>
        
        <div className="controls-panel-desktop">
          {UIContent}
        </div>

        <button className="hamburger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '×' : '☰'}
        </button>

        <div className={`mobile-drawer ${isMenuOpen ? 'open' : ''}`}>
          {UIContent}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden-input"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

export default App;
