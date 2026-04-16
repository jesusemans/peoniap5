import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RenderMode } from '../types';
import { useSketch } from '../hooks/useSketch';

interface SketchCanvasProps {
  imageSrc: string | null;
  effectMode: RenderMode;
  onReady: (ready: boolean) => void;
  hasStarted: boolean;
}

const SketchCanvas: React.FC<SketchCanvasProps> = ({ 
  imageSrc, 
  effectMode, 
  onReady, 
  hasStarted 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isP5Ready, setIsP5Ready] = useState(false);
  
  // Phase 3: Synchronized Loading
  const loadingTimerFinished = useRef(false);

  const handleLoadingProgress = useCallback((pct: number) => {
    setProgress(pct);
  }, []);

  const handleReady = useCallback(() => {
    setIsP5Ready(true);
  }, []);

  const { startExperience, updateCustomImage, setEffectMode } = useSketch(
    containerRef,
    handleLoadingProgress,
    handleReady
  );


  useEffect(() => {
    // Start 2.5s minimum loading timer
    const timer = setTimeout(() => {
      loadingTimerFinished.current = true;
      if (isP5Ready) onReady(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [isP5Ready, onReady]);

  // Synchronize start signal
  useEffect(() => {
    if (hasStarted) {
      startExperience();
    }
  }, [hasStarted, startExperience]);

  useEffect(() => {
    updateCustomImage(imageSrc);
  }, [imageSrc, updateCustomImage]);

  useEffect(() => {
    setEffectMode(effectMode);
  }, [effectMode, setEffectMode]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div id="loader" className={hasStarted ? 'fade' : ''}>
        <div className="title">LOADING</div>
        <div className="bar-bg">
          <div 
            className="bar-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="pct">{Math.floor(progress)}%</div>
      </div>
    </div>
  );
};

export default SketchCanvas;
