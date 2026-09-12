import React, { useRef, useEffect } from 'react';

interface AsciiDitherBackgroundProps {
  logoSrc?: string;
  cellSize?: number;
  tint?: string;
  className?: string;
}

export const AsciiDitherBackground: React.FC<AsciiDitherBackgroundProps> = ({
  logoSrc = '/logo-white.png',
  cellSize = 9,
  tint = '#10b981',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let time = 0;

    // Offscreen Canvas Buffer for Logo Pixel Luminance Sampling
    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });

    const img = new Image();
    img.src = logoSrc;

    let isImageLoaded = false;
    img.onload = () => {
      isImageLoaded = true;
    };

    const resize = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const charSet = " .:-=+*#%@";

    const render = () => {
      time += 0.03;
      ctx.fillStyle = '#092214';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cols = Math.floor(canvas.width / cellSize);
      const rows = Math.floor(canvas.height / cellSize);

      if (isImageLoaded && offscreenCtx) {
        offscreenCanvas.width = cols;
        offscreenCanvas.height = rows;

        // Draw image centered in offscreen buffer with aspect preservation
        offscreenCtx.clearRect(0, 0, cols, rows);
        const imgAspect = img.width / img.height;
        const canvasAspect = cols / rows;

        let drawWidth = cols * 0.45;
        let drawHeight = drawWidth / imgAspect;

        if (drawHeight > rows * 0.45) {
          drawHeight = rows * 0.45;
          drawWidth = drawHeight * imgAspect;
        }

        const drawX = (cols - drawWidth) / 2;
        const drawY = (rows - drawHeight) / 2;

        offscreenCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        const imgData = offscreenCtx.getImageData(0, 0, cols, rows).data;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const index = (r * cols + c) * 4;
            const red = imgData[index];
            const green = imgData[index + 1];
            const blue = imgData[index + 2];
            const alpha = imgData[index + 3];

            const x = c * cellSize;
            const y = r * cellSize;

            // Calculate exact pixel luminance from Logo
            let imgLuminance = 0;
            if (alpha > 20) {
              imgLuminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255 * (alpha / 255);
            }

            // Animated shimmer & wave displacement overlay
            const wave = Math.sin((c * 0.1) + (r * 0.1) - time * 2);
            const shimmer = Math.cos(c * 0.15 + time * 3) * 0.15;
            
            let finalLuminance = imgLuminance;
            if (imgLuminance > 0.05) {
              finalLuminance = Math.max(0, Math.min(1, imgLuminance + shimmer + wave * 0.1));
            } else {
              // Subtle ambient background ASCII grid
              const ambientNoise = (Math.sin(c * 12.9898 + r * 78.233 + time) * 43758.5453) % 1;
              finalLuminance = Math.max(0, Math.min(0.12, (wave + 1) * 0.04 + ambientNoise * 0.03));
            }

            const charIndex = Math.floor(finalLuminance * (charSet.length - 1));
            const char = charSet[charIndex];

            ctx.font = `${cellSize}px monospace`;

            // Color palette mapping: Logo pixels shine with Warm Gold & Mint Emerald
            if (imgLuminance > 0.1) {
              if (finalLuminance > 0.7) {
                ctx.fillStyle = '#ffebc4'; // Warm Gold Highlight for Logo core
              } else {
                ctx.fillStyle = `rgba(16, 185, 129, ${0.6 + finalLuminance * 0.4})`; // Mint Emerald for Logo contours
              }
            } else {
              ctx.fillStyle = `rgba(14, 56, 32, ${finalLuminance * 3})`; // Subtle background grid
            }

            ctx.fillText(char, x, y + cellSize * 0.85);
          }
        }
      }

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameId);
    };
  }, [logoSrc, cellSize, tint]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
};
