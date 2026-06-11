import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data: rounds, error: re } = await supabase.from('rounds').select('*').order('created_at');
    if (re) return res.status(500).json({ error: re.message });
    const { data: matches, error: me } = await supabase.from('matches').select('*').order('position');
    if (me) return res.status(500).json({ error: me.message });
    const result = rounds.map(r => ({
      ...r,
      matches: matches.filter(m => m.round_id === r.id),
    }));
    return res.json(result);
  }

  if (req.method === 'POST') {
    const { name, start_time, matches } = req.body;
    if (!name || !start_time || !matches || matches.length === 0)
      return res.status(400).json({ error: 'Faltan datos' });

    const { data: round, error: re } = await supabase.from('rounds').insert({ name, start_time }).select().single();
    if (re) return res.status(500).json({ error: re.message });

    const matchRows = matches.map((m, i) => ({
      round_id: round.id, home_team: m.home, away_team: m.away, position: i,
    }));
    const { error: me } = await supabase.from('matches').insert(matchRows);
    if (me) return res.status(500).json({ error: me.message });

    return res.json({ ok: true, id: round.id });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const { error } = await supabase.from('rounds').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  res.status(405).end();
}
