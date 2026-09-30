'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  ExternalLink,
  Info,
  AlertTriangle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Model } from '@/types';

interface ModelViewerProps {
  model: Model;
}

export function ModelViewer({ model }: ModelViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const runnerUrl = `/api/models/${model.id}/runner`;

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // PostMessage protocol listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate event data
      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'MODEL_READY') {
        setIsLoading(false);
        setHasError(false);
      } else if (event.data.type === 'MODEL_ERROR') {
        setIsLoading(false);
        setHasError(true);
        setErrorMessage(event.data.error || 'Mô hình gặp lỗi khi đang chạy');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Fallback timeout in case model does not emit MODEL_READY
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [iframeKey]);

  const handleReload = () => {
    setIsLoading(true);
    setHasError(false);
    setIframeKey((prev) => prev + 1);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  };

  const handleOpenSeparately = () => {
    window.open(runnerUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-700/60 shadow-xl transition-all ${
        isFullscreen ? 'w-screen h-screen rounded-none border-none' : 'w-full h-[620px] max-h-[85vh]'
      }`}
    >
      {/* Top Viewer Control Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/90 backdrop-blur border-b border-slate-700 text-slate-200 select-none z-20">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium text-slate-300 truncate max-w-[200px] sm:max-w-md">
            {model.title}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-750 px-2 py-0.5 rounded border border-slate-700">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Sandboxed Runtime
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleReload}
            title="Tải lại mô hình (↻)"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenSeparately}
            title="Mở riêng trong tab mới (↗)"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình (⛶)'}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors ml-1"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Runner Area */}
      <div className="relative flex-1 w-full h-full bg-slate-950 overflow-hidden">
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm text-white">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-sm font-semibold tracking-wide">Đang khởi chạy mô hình tương tác...</p>
            <p className="text-xs text-slate-400 mt-1">Đang thiết lập môi trường Sandbox an toàn</p>
          </div>
        )}

        {/* Error Overlay */}
        {hasError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900 p-6 text-center text-white">
            <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
            <h3 className="text-base font-semibold">Không thể tải mô hình</h3>
            <p className="text-xs text-slate-400 max-w-md mt-1 mb-4">
              {errorMessage || 'Mô hình gặp lỗi trong quá trình thực thi hoặc tài nguyên chưa sẵn sàng.'}
            </p>
            <button
              onClick={handleReload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Sandboxed Iframe: Zero access to parent cookies, storage, or credentials! */}
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={runnerUrl}
          title={model.title}
          sandbox="allow-scripts allow-forms allow-downloads allow-pointer-lock"
          className="w-full h-full border-0 bg-white"
          onLoad={() => {
            // Give 400ms for scripts inside to initialize
            setTimeout(() => setIsLoading(false), 400);
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      </div>
    </div>
  );
}
