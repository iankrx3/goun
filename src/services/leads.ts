import { supabase } from '../lib/supabase';
import { saveLocalLead, type LocalLead } from '../lib/localLeadStore';

export interface SaveLeadInput {
  email: string;
  tripDate: string | null;
  category: string | null;
  concerns: string[];
  vibes: string[];
  topTreatmentId: string | null;
}

// §02-9 — persists the "Consultation Card" email-capture form. Saves the lead for future
// manual/automated follow-up; does not itself send anything (no email service is wired up).
export async function saveLead(input: SaveLeadInput): Promise<void> {
  if (supabase) {
    try {
      const { error } = await supabase.from('quiz_leads').insert({
        email: input.email,
        trip_date: input.tripDate,
        category: input.category,
        concerns: input.concerns,
        vibes: input.vibes,
        top_treatment_id: input.topTreatmentId,
      });
      if (error) throw error;
      return;
    } catch {
      // fall through to local fallback (Supabase write failed, or table doesn't exist yet)
    }
  }

  const lead: LocalLead = {
    id: `local-${crypto.randomUUID()}`,
    email: input.email,
    tripDate: input.tripDate,
    category: input.category,
    concerns: input.concerns,
    vibes: input.vibes,
    topTreatmentId: input.topTreatmentId,
    createdAt: new Date().toISOString(),
  };
  saveLocalLead(lead);
}
