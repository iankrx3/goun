import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import type { BeautyCategory, MatchResult, Place, QuizAnswers } from '../types';
import { categoryMeta } from '../data/mock';
import { budgetOptions, downtimeOptions, tripLengthOptions, vibePairs, whatOptions } from '../data/quiz';
import { ModeSelect } from '../components/quiz/ModeSelect';
import { CategoryRadial } from '../components/quiz/CategoryRadial';
import { PairChoice } from '../components/quiz/PairChoice';
import { AITransition } from '../components/quiz/AITransition';
import { ResultCard } from '../components/explore/ResultCard';
import { ProductCommerce } from '../components/explore/ProductCommerce';
import { EmailCaptureCard } from '../components/explore/EmailCaptureCard';
import { SponsoredPlaceCard } from '../components/place/SponsoredPlaceCard';
import { getMatches, placesForCategory } from '../services/match';
import { fetchPlaces } from '../services/places';
import { hasCreatripListing } from '../lib/creatrip';
import { buildPickQuote } from '../lib/pickCopy';

type Step = 'home' | 'category' | 'area' | 'what' | 'vibe' | 'constraints' | 'transition' | 'results';

const TREATMENT_CATEGORIES: BeautyCategory[] = ['skin', 'face'];

const emptyAnswers: QuizAnswers = {
  category: null,
  concerns: [],
  vibes: [],
  downtime: null,
  resultTiming: null,
  budget: null,
  tripLength: null,
};

const stepTransition = { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const };

const StepMotion: React.FC<{ stepKey: string; className?: string; children: React.ReactNode }> = ({
  stepKey,
  className,
  children,
}) => (
  <motion.div
    key={stepKey}
    initial={{ opacity: 0, x: 24 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -24 }}
    transition={stepTransition}
    className={className}
  >
    {children}
  </motion.div>
);

export default function ExplorePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('home');
  const [answers, setAnswers] = useState<QuizAnswers>(emptyAnswers);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [sponsoredPlace, setSponsoredPlace] = useState<Place | null>(null);

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
      // Pair 2 (Fast Results vs Long-term) doubles as the old standalone "result timing" question.
      const resultTiming =
        pairIndex === 1 ? (/fast results/i.test(value) ? 'asap' : 'long-term') : prev.resultTiming;
      return { ...prev, vibes, resultTiming };
    });
  };

  const handlePick = async () => {
    setStep('transition');
  };

  const handleTransitionDone = async () => {
    const matches = await getMatches(answers);
    setResults(matches);

    const matchedPlaceIds = new Set(matches.map((m) => m.place.id));
    const allPlaces = await fetchPlaces();
    const sponsored = placesForCategory(allPlaces, answers.category)
      .filter((p) => hasCreatripListing(p) && !matchedPlaceIds.has(p.id))
      .sort((a, b) => b.rating - a.rating)[0];
    setSponsoredPlace(sponsored ?? null);

    setStep('results');
  };

  const restart = () => {
    setAnswers(emptyAnswers);
    setResults([]);
    setSponsoredPlace(null);
    setStep('home');
  };

  return (
    <div className="mx-auto max-w-xl overflow-hidden px-4 py-8 sm:py-14">
      <AnimatePresence mode="wait">
        {step === 'home' && (
          <StepMotion stepKey="home" className="space-y-8 text-center">
            <div>
              <h1 className="font-display text-3xl font-semibold leading-tight text-miyeon-main sm:text-4xl">
                You know Korean beauty
                <br />
                treatments are good.
                <br />
                You just don't know
                <br />
                which one you need.
              </h1>
              <p className="mx-auto mt-4 max-w-sm text-sm text-miyeon-main/60">
                3 questions. 30 seconds.
                <br />
                Find your personalized Korean beauty match.
              </p>
              <p className="mt-3 text-xs font-semibold text-miyeon-sub1">Used by 1,200+ travelers</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setStep('category')}
              className="rounded-full bg-miyeon-sub1 px-8 py-3.5 text-sm font-bold text-white shadow-sm shadow-miyeon-sub1/30"
            >
              Find My Match →
            </motion.button>
          </StepMotion>
        )}

        {step === 'category' && (
          <StepMotion stepKey="category" className="space-y-6">
            <BackButton onClick={() => setStep('home')} />
            <div className="text-center">
              <h2 className="font-display text-2xl text-miyeon-main">What are you here for?</h2>
              <p className="mt-1 text-xs text-miyeon-main/60">Pick one to get started.</p>
            </div>
            <ModeSelect onSelectTreatments={() => setStep('area')} />
          </StepMotion>
        )}

        {step === 'area' && (
          <StepMotion stepKey="area" className="space-y-8 text-center">
            <BackButton onClick={() => setStep('category')} />
            <div>
              <h2 className="font-display text-2xl text-miyeon-main">Miyeon starts asking.</h2>
              <p className="mt-1 text-xs text-miyeon-main/60">Where should we start?</p>
            </div>
            <CategoryRadial categories={TREATMENT_CATEGORIES} centerLabel="✨" onSelect={selectCategory} />
          </StepMotion>
        )}

        {step === 'what' && answers.category && (
          <StepMotion stepKey="what">
            <QuizShell
              title="Tell Miyeon what you're looking for."
              subtitle={`${categoryMeta[answers.category].icon} ${categoryMeta[answers.category].label} · pick as many as apply`}
              onBack={() => setStep('area')}
              onNext={() => setStep('vibe')}
              nextDisabled={answers.concerns.length === 0}
            >
              <div className="flex flex-wrap gap-2">
                {whatOptions[answers.category].map((opt, i) => (
                  <motion.button
                    key={opt}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleConcern(opt)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      answers.concerns.includes(opt)
                        ? 'border-miyeon-sub1 bg-miyeon-sub1 text-white'
                        : 'border-miyeon-neutral bg-white text-miyeon-main hover:border-miyeon-sub1/50'
                    }`}
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>
            </QuizShell>
          </StepMotion>
        )}

        {step === 'vibe' && answers.category && (
          <StepMotion stepKey="vibe">
            <QuizShell
              title="Which feels more like you?"
              subtitle="Choose one from each pair."
              onBack={() => setStep('what')}
              onNext={() => setStep('constraints')}
              nextDisabled={answers.vibes.filter(Boolean).length < vibePairs[answers.category].length}
            >
              <div className="space-y-5">
                {vibePairs[answers.category].map((pair, i) => (
                  <PairChoice key={i} pair={pair} value={answers.vibes[i]} onChange={(v) => setVibe(i, v)} />
                ))}
              </div>
            </QuizShell>
          </StepMotion>
        )}

        {step === 'constraints' && (
          <StepMotion stepKey="constraints">
            <QuizShell
              title="The practical bit."
              subtitle="Last one. Promise."
              onBack={() => setStep('vibe')}
              onNext={handlePick}
              nextLabel="PICK"
              nextDisabled={!answers.tripLength || !answers.downtime || !answers.budget}
            >
              <div className="space-y-5">
                <ConstraintGroup label="🗓 How long are you in Korea?">
                  {tripLengthOptions.map((opt) => (
                    <ChoiceChip
                      key={opt.id}
                      active={answers.tripLength === opt.id}
                      label={opt.label}
                      onClick={() => setAnswers((p) => ({ ...p, tripLength: opt.id }))}
                    />
                  ))}
                </ConstraintGroup>
                <ConstraintGroup label="🕐 How much downtime can you afford?">
                  {downtimeOptions.map((opt) => (
                    <ChoiceChip
                      key={opt.id}
                      active={answers.downtime === opt.id}
                      label={opt.label}
                      onClick={() => setAnswers((p) => ({ ...p, downtime: opt.id }))}
                    />
                  ))}
                </ConstraintGroup>
                <ConstraintGroup label="💰 Budget per treatment">
                  {budgetOptions.map((opt) => (
                    <ChoiceChip
                      key={opt.id}
                      active={answers.budget === opt.id}
                      label={opt.label}
                      onClick={() => setAnswers((p) => ({ ...p, budget: opt.id }))}
                    />
                  ))}
                </ConstraintGroup>
              </div>
            </QuizShell>
          </StepMotion>
        )}

        {step === 'transition' && <AITransition key="transition" onDone={handleTransitionDone} />}

        {step === 'results' && (
          <StepMotion stepKey="results" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl text-miyeon-main">Miyeon's Picks</h2>
                <p className="text-xs text-miyeon-main/60">Based on your goals, preferences & trip.</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={restart}
                className="text-xs font-semibold text-miyeon-main/60 hover:text-miyeon-sub1"
              >
                Start over
              </motion.button>
            </div>
            {results.length === 0 ? (
              <p className="text-sm text-miyeon-main/60">
                No matches yet — try widening your constraints and pick again.
              </p>
            ) : (
              <>
                {sponsoredPlace && (
                  <SponsoredPlaceCard place={sponsoredPlace} onView={(p) => navigate(`/place/${p.id}`)} />
                )}
                <div className="space-y-4">
                  {results.map((r, i) => (
                    <ResultCard
                      key={r.treatment.id}
                      result={r}
                      rank={(i + 1) as 1 | 2 | 3}
                      quote={i === 0 ? buildPickQuote(answers) : undefined}
                    />
                  ))}
                </div>
                <ProductCommerce concerns={answers.concerns} />
                <EmailCaptureCard answers={answers} topTreatmentId={results[0]?.treatment.id ?? null} />
              </>
            )}
          </StepMotion>
        )}
      </AnimatePresence>
    </div>
  );
}

const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <motion.button
    whileHover={{ x: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex items-center gap-1 text-xs font-semibold text-miyeon-main/60"
  >
    <ChevronLeft className="h-3.5 w-3.5" /> Back
  </motion.button>
);

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
    <BackButton onClick={onBack} />
    <div>
      <h2 className="font-display text-2xl text-miyeon-main">{title}</h2>
      <p className="mt-1 text-xs text-miyeon-main/60">{subtitle}</p>
    </div>
    {children}
    <motion.button
      whileHover={nextDisabled ? undefined : { scale: 1.02 }}
      whileTap={nextDisabled ? undefined : { scale: 0.97 }}
      onClick={onNext}
      disabled={nextDisabled}
      className="w-full rounded-full bg-miyeon-sub1 py-3.5 text-sm font-bold text-white shadow-sm shadow-miyeon-sub1/30 disabled:opacity-30"
    >
      {nextLabel}
    </motion.button>
  </div>
);

const ConstraintGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <p className="mb-2 text-xs font-semibold text-miyeon-main/70">{label}</p>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

const ChoiceChip: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({ active, label, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
      active ? 'border-miyeon-sub1 bg-miyeon-sub1 text-white' : 'border-miyeon-neutral bg-white text-miyeon-main hover:border-miyeon-sub1/50'
    }`}
  >
    {label}
  </motion.button>
);
