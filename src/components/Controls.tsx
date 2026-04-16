import React from 'react';
import { RenderMode } from '../types';

interface ControlsProps {
  effectMode: RenderMode;
  setEffectMode: (mode: RenderMode) => void;
  isMuted: boolean;
  toggleMute: () => void;
  onUploadClick: () => void;
  onCloseMenu?: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  effectMode,
  setEffectMode,
  isMuted,
  toggleMute,
  onUploadClick,
  onCloseMenu
}) => {
  const modes = ['ascii', 'dots', 'pixel', 'all'] as const;

  return (
    <>
      <div className="mode-group">
        <div className="label-small">Renderer</div>
        {modes.map((mode, index) => (
          <button
            key={mode}
            className={`text-btn ${effectMode === index ? 'active' : ''}`}
            onClick={() => { 
              setEffectMode(index as RenderMode); 
              onCloseMenu?.();
            }}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="mode-group">
        <div className="label-small">Actions</div>
        <button 
          className="text-btn" 
          onClick={onUploadClick} 
          aria-label="Upload Photo"
        >
          Upload Photo
        </button>
        <button 
          className="text-btn" 
          onClick={toggleMute} 
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>
    </>
  );
};

export default Controls;
