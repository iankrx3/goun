import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { BeautyCategory, MatchResult, QuizAnswers } from '../types';
import { categoryMeta } from '../data/mock';
import { budgetOptions, downtimeOptions, otherOptions, resultTimingOptions, vibePairs, whatOptions } from '../data/quiz';
import { CategoryRadial } from '../components/quiz/CategoryRadial';
import { PairChoice } from '../components/quiz/PairChoice';
import { AITransition } from '../components/quiz/AITransition';
import { ResultCard } from '../components/ResultCard';
import { getMatches } from '../services/match';

type Step = 'home' | 'what' | 'vibe' | 'constraints' | 'transition' | 'results';

const emptyAnswers: QuizAnswers = {
  category: null,
  concerns: [],
  vibes: [],
  downtime: null,
  resultTiming: null,
  budget: null,
  other: [],
};

export default function ExplorePage() {
  const [step, setStep] = useState<Step>('home');
  const [answers, setAnswers] = useState<QuizAnswers>(emptyAnswers);
  const [results, setResults] = useState<MatchResult[]>([]);

  const selectCategory = (category: BeautyCategory) => {
    setAnswers({ ...emptyAnswers, category });
    setStep('what');
  };

  const toggleConcern = (concern: string) => {
    setAnswers((prev) => ({
      ...prev,
      concerns: prev.concerns.includes(concern)
        ? prev.concerns.filter((c) => c !== concern)
        : [...prev.concerns, concern],
    }));
  };

  const setVibe = (pairIndex: number, value: string) => {
    setAnswers((prev) => {
      const vibes = [...prev.vibes];
      vibes[pairIndex] = value;
      return { ...prev, vibes };
    });
  };

  const toggleOther = (opt: string) => {
    setAnswers((prev) => ({
      ...prev,
      other: prev.other.includes(opt) ? prev.other.filter((o) => o !== opt) : [...prev.other, opt],
    }));
  };

  const handlePick = async () => {
    setStep('transition');
  };

  const handleTransitionDone = async () => {
    const matches = await getMatches(answers);
    setResults(matches);
    setStep('results');
  };

  const restart = () => {
    setAnswers(emptyAnswers);
    setResults([]);
    setStep('home');
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:py-14">
      {step === 'home' && (
        <div className="space-y-8 text-center">
          <div>
            <h1 className="font-display text-4xl leading-tight text-warm-taupe sm:text-5xl">
              Find your Korean
              <br />
              beauty match.
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm text-warm-taupe/60">
              Tell Goun what you're after — AI narrows thousands of treatments down to 3 that actually fit you.
            </p>
          </div>
          <CategoryRadial onSelect={selectCategory} />
        </div>
      )}

      {step === 'what' && answers.category && (
        <QuizShell
          title="What are you looking for?"
          subtitle={`${categoryMeta[answers.category].icon} ${categoryMeta[answers.category].label} · pick as many as apply`}
          onBack={() => setStep('home')}
          onNext={() => setStep('vibe')}
          nextDisabled={answers.concerns.length === 0}
        >
          <div className="flex flex-wrap gap-2">
            {whatOptions[answers.category].map((opt) => (
              <button
                key={opt}
                onClick={() => toggleConcern(opt)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  answers.concerns.includes(opt)
                    ? 'border-goun-rose bg-goun-rose text-white'
                    : 'border-han-cream bg-white text-warm-taupe hover:border-goun-rose/50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </QuizShell>
      )}

      {step === 'vibe' && answers.category && (
        <QuizShell
          title="Which feels more like you?"
          subtitle="Three quick calls — A or B."
          onBack={() => setStep('what')}
          onNext={() => setStep('constraints')}
          nextDisabled={answers.vibes.filter(Boolean).length < vibePairs[answers.category].length}
        >
          <div className="space-y-4">
            {vibePairs[answers.category].map((pair, i) => (
              <PairChoice key={i} pair={pair} value={answers.vibes[i]} onChange={(v) => setVibe(i, v)} />
            ))}
          </div>
        </QuizShell>
      )}

      {step === 'constraints' && (
        <QuizShell
          title="A few quick constraints"
          subtitle="Helps Goun fit this into your trip."
          onBack={() => setStep('vibe')}
          onNext={handlePick}
          nextLabel="PICK"
          nextDisabled={!answers.downtime || !answers.resultTiming || !answers.budget}
        >
          <div className="space-y-5">
            <ConstraintGroup label="🕐 Downtime">
              {downtimeOptions.map((opt) => (
                <ChoiceChip
                  key={opt.id}
                  active={answers.downtime === opt.id}
                  label={opt.label}
                  onClick={() => setAnswers((p) => ({ ...p, downtime: opt.id }))}
                />
              ))}
            </ConstraintGroup>
            <ConstraintGroup label="⚡ Results">
              {resultTimingOptions.map((opt) => (
                <ChoiceChip
                  key={opt.id}
                  active={answers.resultTiming === opt.id}
                  label={opt.label}
                  onClick={() => setAnswers((p) => ({ ...p, resultTiming: opt.id }))}
                />
              ))}
            </ConstraintGroup>
            <ConstraintGroup label="💰 Budget">
              {budgetOptions.map((opt) => (
                <ChoiceChip
                  key={opt.id}
                  active={answers.budget === opt.id}
                  label={opt.label}
                  onClick={() => setAnswers((p) => ({ ...p, budget: opt.id }))}
                />
              ))}
            </ConstraintGroup>
            <ConstraintGroup label="🌎 Other">
              {otherOptions.map((opt) => (
                <ChoiceChip key={opt} active={answers.other.includes(opt)} label={opt} onClick={() => toggleOther(opt)} />
              ))}
            </ConstraintGroup>
          </div>
        </QuizShell>
      )}

      {step === 'transition' && <AITransition onDone={handleTransitionDone} />}

      {step === 'results' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-warm-taupe">Your best matches</h2>
            <button onClick={restart} className="text-xs font-semibold text-warm-taupe/60 hover:text-goun-rose">
              Start over
            </button>
          </div>
          {results.length === 0 ? (
            <p className="text-sm text-warm-taupe/60">
              No matches yet — try widening your constraints and pick again.
            </p>
          ) : (
            <div className="space-y-4">
              {results.map((r, i) => (
                <ResultCard key={r.treatment.id} result={r} rank={(i + 1) as 1 | 2 | 3} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const QuizShell: React.FC<{
  title: string;
  subtitle: string;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  children: React.ReactNode;
}> = ({ title, subtitle, onBack, onNext, nextLabel = 'Next', nextDisabled, children }) => (
  <div className="space-y-6">
    <button onClick={onBack} className="flex items-center gap-1 text-xs font-semibold text-warm-taupe/60">
      <ChevronLeft className="h-3.5 w-3.5" /> Back
    </button>
    <div>
      <h2 className="font-display text-2xl text-warm-taupe">{title}</h2>
      <p className="mt-1 text-xs text-warm-taupe/60">{subtitle}</p>
    </div>
    {children}
    <button
      onClick={onNext}
      disabled={nextDisabled}
      className="w-full rounded-full bg-goun-rose py-3.5 text-sm font-bold text-white shadow-sm shadow-goun-rose/30 disabled:opacity-30"
    >
      {nextLabel}
    </button>
  </div>
);

const ConstraintGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <p className="mb-2 text-xs font-semibold text-warm-taupe/70">{label}</p>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

const ChoiceChip: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
      active ? 'border-goun-rose bg-goun-rose text-white' : 'border-han-cream bg-white text-warm-taupe hover:border-goun-rose/50'
    }`}
  >
    {label}
  </button>
);
