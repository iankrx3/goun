import React from 'react';

interface Mode {
  icon: string;
  title: string;
  subtitle: string;
  comingSoon?: boolean;
}

const MODES: Mode[] = [
  { icon: '💉', title: 'Treatments', subtitle: "Not sure what you need?\nLet Miyeon find your match." },
  { icon: '💇', title: 'Salon', subtitle: 'Know what you want?\nFind your place in Seoul.', comingSoon: true },
  { icon: '🧴', title: 'Products', subtitle: 'Want to bring K-Beauty home?', comingSoon: true },
];

interface ModeSelectProps {
  onSelectTreatments: () => void;
}

// §02 — CATEGORY: what the user is trying to do, not a flat service list.
// Only Treatments is live this pass; Salon/Products are visible but non-interactive.
export const ModeSelect: React.FC<ModeSelectProps> = ({ onSelectTreatments }) => (
  <div className="space-y-3">
    {MODES.map((mode) => {
      const clickable = !mode.comingSoon;
      return (
        <button
          key={mode.title}
          onClick={clickable ? onSelectTreatments : undefined}
          disabled={!clickable}
          className={`flex w-full items-center gap-4 rounded-3xl border p-5 text-left transition-all ${
            clickable
              ? 'border-miyeon-neutral bg-white hover:border-miyeon-sub1/60 hover:shadow-sm'
              : 'border-miyeon-neutral/60 bg-miyeon-neutral/30 cursor-default'
          }`}
        >
          <span className="text-3xl">{mode.icon}</span>
          <span className="flex-1">
            <span className="flex items-center gap-2">
              <span className="text-base font-semibold text-miyeon-main">{mode.title}</span>
              {mode.comingSoon && (
                <span className="rounded-full bg-miyeon-sub2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-miyeon-sub1">
                  Coming soon
                </span>
              )}
            </span>
            <span className="mt-0.5 block whitespace-pre-line text-xs text-miyeon-main/60">{mode.subtitle}</span>
          </span>
        </button>
      );
    })}
  </div>
);
