import React, { useEffect, useRef } from 'react';

export default function Globe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;

    const dots: { lat: number; lng: number }[] = [];
    for (let lat = -80; lat <= 80; lat += 12) {
      const radiusAtLat = Math.cos((lat * Math.PI) / 180);
      const count = Math.max(6, Math.floor(28 * radiusAtLat));
      for (let i = 0; i < count; i++) {
        dots.push({ lat, lng: (360 / count) * i });
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const radius = Math.min(width, height) * 0.4;
      const cx = width / 2;
      const cy = height / 2;

      rotation += 0.006;

      // Draw background outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(13, 93, 58, 0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw glowing atmosphere halo
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius * 1.15);
      grad.addColorStop(0, 'rgba(217, 119, 6, 0.1)');
      grad.addColorStop(0.5, 'rgba(13, 93, 58, 0.08)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // Draw longitude grid lines
      for (let lng = 0; lng < 360; lng += 30) {
        const radLng = ((lng + rotation * 50) * Math.PI) / 180;
        ctx.beginPath();
        for (let lat = -90; lat <= 90; lat += 5) {
          const radLat = (lat * Math.PI) / 180;
          const x = cx + radius * Math.cos(radLat) * Math.sin(radLng);
          const y = cy - radius * Math.sin(radLat);
          const z = radius * Math.cos(radLat) * Math.cos(radLng);
          if (z > 0) {
            if (lat === -90) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.strokeStyle = 'rgba(13, 93, 58, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw latitude grid lines
      for (let lat = -60; lat <= 60; lat += 30) {
        const radLat = (lat * Math.PI) / 180;
        const rLat = radius * Math.cos(radLat);
        const y = cy - radius * Math.sin(radLat);
        ctx.beginPath();
        for (let lng = 0; lng <= 360; lng += 10) {
          const radLng = ((lng + rotation * 50) * Math.PI) / 180;
          const x = cx + rLat * Math.sin(radLng);
          const z = rLat * Math.cos(radLng);
          if (z > 0) {
            ctx.lineTo(x, y);
          } else {
            ctx.moveTo(x, y);
          }
        }
        ctx.strokeStyle = 'rgba(217, 119, 6, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw dots
      dots.forEach(d => {
        const radLat = (d.lat * Math.PI) / 180;
        const radLng = ((d.lng + rotation * 40) * Math.PI) / 180;
        const x = cx + radius * Math.cos(radLat) * Math.sin(radLng);
        const y = cy - radius * Math.sin(radLat);
        const z = radius * Math.cos(radLat) * Math.cos(radLng);

        if (z > 0) {
          const alpha = (z / radius) * 0.85 + 0.15;
          const isGold = (Math.sin(d.lat + d.lng) > 0.3);

          ctx.beginPath();
          ctx.arc(x, y, isGold ? 2.5 : 2, 0, Math.PI * 2);
          ctx.fillStyle = isGold
            ? `rgba(217, 119, 6, ${alpha})`
            : `rgba(13, 93, 58, ${alpha})`;
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`relative w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] lg:w-[560px] lg:h-[560px] flex items-center justify-center ${className || ''}`}>
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
