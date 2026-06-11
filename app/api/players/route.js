import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('players').select('*').order('created_at');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  if (req.method === 'POST') {
    const { name, avatar } = req.body;
    if (!name) return res.status(400).json({ error: 'Nombre requerido' });
    const { data, error } = await supabase.from('players').insert({ name: name.trim(), avatar }).select().single();
    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Ese nombre ya existe' });
      return res.status(500).json({ error: error.message });
    }
    return res.json(data);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const { error } = await supabase.from('players').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  res.status(405).end();
}
