import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { round_id, results } = req.body;
  // results: [{ match_id, home_score, away_score }]

  for (const r of results) {
    const { error } = await supabase.from('matches')
      .update({ home_score: r.home_score, away_score: r.away_score, played: true })
      .eq('id', r.match_id);
    if (error) return res.status(500).json({ error: error.message });
  }

  const { error } = await supabase.from('rounds')
    .update({ closed: true, results_entered: true })
    .eq('id', round_id);
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ ok: true });
}
