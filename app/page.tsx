'use client';

import { useChat } from '@ai-sdk/react';
import { useMemo, useRef, useState, useEffect } from 'react';

// Christmas hints removed as requested

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat();
  const [isSending, setIsSending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [santaKey, setSantaKey] = useState(0);
  const [snowflakes, setSnowflakes] = useState<Array<{ i: number; left: number; delay: number; duration: number; size: number; opacity: number }>>([]);

  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const flakes = Array.from({ length: 60 }).map((_, i) => {
      const left = Math.random() * 100;
      const delay = Math.random() * 8;
      const duration = 6 + Math.random() * 8;
      const size = 3 + Math.round(Math.random() * 5);
      const opacity = 0.5 + Math.random() * 0.5;
      return { i, left, delay, duration, size, opacity };
    });
    setSnowflakes(flakes);
  }, []);

  function playJingle() {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const notes = [880, 1174, 988, 1318];
      notes.forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        o.connect(g); g.connect(ctx.destination);
        const start = now + idx * 0.08; const end = start + 0.18;
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(0.3, start + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, end);
        o.start(start); o.stop(end + 0.02);
      });
    } catch {}
  }

  const rendered = useMemo(() => (
    messages.map(message => (
      <div key={message.id} className="py-2">
        <div className={(message.role === 'user' ? 'msg msg-user' : 'msg msg-assistant')}>
          <div className="whitespace-pre-wrap">
            {message.parts.map((part, i) => {
              switch (part.type) {
                case 'text':
                  return <div key={`${message.id}-${i}`}>{part.text}</div>;
                default:
                  return null;
              }
            })}
          </div>
        </div>
      </div>
    ))
  ), [messages]);

  // Trend click removed

  return (
    <div className="min-h-screen w-full bg-red-holiday">
      {mounted && (
        <>
          <img key={santaKey} src="/santa-sleigh.svg" alt="Santa sleigh" className="santa-sleigh santa-run" />
          <div className="snow-layer">s
            {snowflakes.map(s => (
              <div key={s.i} className="snowflake" style={{ left: `${s.left}vw`, width: `${s.size}px`, height: `${s.size}px`, opacity: s.opacity, animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s` }} />
            ))}
          </div>
        </>
      )}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="flex items-center justify-between py-4">
          <h1 className="mag-title rl-accent text-xs tracking-widest">Celebrate Christmas with Santa</h1>
          <div className="mag-serif text-2xl md:text-3xl text-white">Ho Ho Ho</div>
        </header>

        <div className="grid grid-cols-1 gap-6 items-stretch">
          <section className="panel-float edge-gradient chat-panel-xmastree p-4 md:p-6 flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-9rem)] w-full">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="mag-serif text-xl text-white">Santa’s Chat</h2>
              <span className="text-xs text-white/60">Santas Helper Elves are here</span>
            </div>
            <div ref={listRef} className="flex-1 overflow-y-auto pt-3">
              {rendered}
            </div>
            <form
              onSubmit={async e => {
                e.preventDefault();
                const text = input.trim();
                if (!text) return;
                try {
                  setIsSending(true);
                  playJingle();
                  setSantaKey(k => k + 1);
                  await sendMessage({ text });
                  setInput('');
                  playJingle();
                } finally {
                  setIsSending(false);
                }
              }}
              className="pt-3"
            >
              <div className="flex gap-2">
                <input
                  className="flex-1 px-4 py-3 rounded-lg bg-white/90 text-zinc-900 placeholder-zinc-600 outline-none border border-white/40"
                  placeholder="Ask Santa for a gift, a wish, or a song..."
                  value={input}
                  onChange={e => setInput(e.currentTarget.value)}
                />
                <button
                  type="submit"
                  className={`px-4 py-3 rounded-lg bg-white text-zinc-900 border border-white/40 hover:bg-white inline-flex items-center gap-2 ${isSending ? '' : ''}`}
                  disabled={isSending}
                >
                  <span role="img" aria-label="elf">🧝‍♀️</span>
                  {isSending ? 'Sending…' : 'Send'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}