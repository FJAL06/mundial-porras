import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('bets').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  if (req.method === 'POST') {
    const { player_id, round_id, bets } = req.body;
    // bets: [{ match_id, home_bet, away_bet }]
    const rows = bets.map(b => ({ player_id, round_id, match_id: b.match_id, home_bet: b.home_bet, away_bet: b.away_bet }));
    const { error } = await supabase.from('bets').insert(rows);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  res.status(405).end();
}
