import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { Place } from '../../types';
import { groundPlaceInfo, isGeminiAvailable, type GroundedPlaceInfo } from '../../services/gemini';

/**
 * "Get latest info" — an opt-in (not automatic) lookup so a Gemini call only
 * happens when someone actually wants it. Hidden entirely when GEMINI_API_KEY
 * isn't configured, matching the fail-silent pattern used by the KTO badges.
 */
export const GroundedInfo: React.FC<{ place: Place }> = ({ place }) => {
  const [available, setAvailable] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [info, setInfo] = useState<GroundedPlaceInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    isGeminiAvailable().then((ok) => {
      if (!cancelled) setAvailable(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setStatus('idle');
    setInfo(null);
  }, [place.id]);

  if (!available) return null;

  const handleFetch = async () => {
    setStatus('loading');
    const result = await groundPlaceInfo(place);
    if (!result) {
      setStatus('error');
      return;
    }
    setInfo(result);
    setStatus('done');
  };

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-miyeon-main">Latest info</h3>

      {status === 'idle' && (
        <button
          onClick={handleFetch}
          className="flex items-center gap-1.5 rounded-full border border-miyeon-neutral px-3.5 py-1.5 text-xs font-semibold text-miyeon-main hover:border-miyeon-sub1/50"
        >
          <Sparkles className="h-3.5 w-3.5" /> Get latest info
        </button>
      )}

      {status === 'loading' && <p className="text-xs text-miyeon-main/60">Searching…</p>}

      {status === 'error' && <p className="text-xs text-miyeon-main/60">Couldn't find anything new right now.</p>}

      {status === 'done' && info && (
        <div className="space-y-2 rounded-2xl border border-miyeon-neutral bg-white p-3">
          <p className="text-sm text-miyeon-main/80">{info.summary}</p>
          {info.sources.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {info.sources.map((source) => (
                <a
                  key={source.uri}
                  href={source.uri}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-miyeon-main/50 underline hover:text-miyeon-sub1"
                >
                  {source.title || source.uri}
                </a>
              ))}
            </div>
          )}
          <p className="text-[10px] text-miyeon-main/40">AI-generated from Google Search — verify before you go.</p>
        </div>
      )}
    </section>
  );
};
