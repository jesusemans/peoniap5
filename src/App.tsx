import { useState, useRef, useEffect, ChangeEvent, lazy, Suspense } from 'react';
const SketchCanvas = lazy(() => import('./components/SketchCanvas'));
import { RenderMode } from './types';
import Controls from './components/Controls';

function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [effectMode, setEffectMode] = useState<RenderMode>(0);
  const [isReady, setIsReady] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  
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
      // P2: File validation (Type & Size)
      if (!file.type.startsWith('image/')) {
        alert("Please upload an image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File is too large. Please upload an image smaller than 5MB.");
        return;
      }

      if (imageSrc) URL.revokeObjectURL(imageSrc);
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setIsMenuOpen(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAudioError = () => {
    setAudioError("Audio failed to load. Please check your connection.");
    setIsMuted(true);
  };

  return (
    <div className="app-container">
      <Suspense fallback={<div className="canvas-placeholder"></div>}>
        <SketchCanvas 
          imageSrc={imageSrc} 
          effectMode={effectMode}
          onReady={(ready) => setIsReady(ready)}
          hasStarted={hasStarted}
        />
      </Suspense>

      <audio 
        ref={audioRef} 
        src={`${import.meta.env.BASE_URL}music.mp3`} 
        loop 
        onError={handleAudioError}
      />

      {audioError && (
        <div className="audio-error-toast" onClick={() => setAudioError(null)}>
          {audioError} [×]
        </div>
      )}

      {/* Start UI Overlay (Shown after loading, before art) */}
      <div className={`enter-overlay ${isReady && !hasStarted ? 'visible' : ''}`}>
        <button className="start-btn" onClick={startExperience}>
          [ ENTER ]
        </button>
      </div>

      {/* Modern UI Overlay (Main Controls) */}
      <div className={`ui-overlay ${!hasStarted ? 'hidden' : ''}`}>
        
        <div className="controls-panel-desktop">
          <Controls 
            effectMode={effectMode}
            setEffectMode={setEffectMode}
            isMuted={isMuted}
            toggleMute={toggleMute}
            onUploadClick={handleUploadClick}
          />
        </div>

        <button 
          className="hamburger-btn" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
        >
          {isMenuOpen ? '×' : '☰'}
        </button>

        <div className={`mobile-drawer ${isMenuOpen ? 'open' : ''}`}>
          <Controls 
            effectMode={effectMode}
            setEffectMode={setEffectMode}
            isMuted={isMuted}
            toggleMute={toggleMute}
            onUploadClick={handleUploadClick}
            onCloseMenu={() => setIsMenuOpen(false)}
          />
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
