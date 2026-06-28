export const COUNTRY_FLAGS = {
  // CONMEBOL (6)
  "Argentina":      "🇦🇷",
  "Brasil":         "🇧🇷",
  "Colombia":       "🇨🇴",
  "Ecuador":        "🇪🇨",
  "Paraguay":       "🇵🇾",
  "Uruguay":        "🇺🇾",
  // UEFA (16)
  "Alemania":       "🇩🇪",
  "Austria":        "🇦🇹",
  "Bélgica":        "🇧🇪",
  "Bosnia":         "🇧🇦",
  "Croacia":        "🇭🇷",
  "Escocia":        "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "España":         "🇪🇸",
  "Francia":        "🇫🇷",
  "Inglaterra":     "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Noruega":        "🇳🇴",
  "Países Bajos":   "🇳🇱",
  "Portugal":       "🇵🇹",
  "Rep. Checa":     "🇨🇿",
  "Suecia":         "🇸🇪",
  "Suiza":          "🇨🇭",
  "Turquía":        "🇹🇷",
  // CONCACAF (6)
  "Canadá":         "🇨🇦",
  "Curazao":        "🇨🇼",
  "Estados Unidos": "🇺🇸",
  "Haití":          "🇭🇹",
  "México":         "🇲🇽",
  "Panamá":         "🇵🇦",
  // CAF - África (9)
  "Argelia":        "🇩🇿",
  "Cabo Verde":     "🇨🇻",
  "Costa de Marfil":"🇨🇮",
  "Egipto":         "🇪🇬",
  "Ghana":          "🇬🇭",
  "Marruecos":      "🇲🇦",
  "RD Congo":       "🇨🇩",
  "Senegal":        "🇸🇳",
  "Sudáfrica":      "🇿🇦",
  "Túnez":          "🇹🇳",
  // AFC - Asia (8)
  "Arabia Saudí":   "🇸🇦",
  "Australia":      "🇦🇺",
  "Corea del Sur":  "🇰🇷",
  "Irak":           "🇮🇶",
  "Irán":           "🇮🇷",
  "Japón":          "🇯🇵",
  "Jordania":       "🇯🇴",
  "Qatar":          "🇶🇦",
  "Uzbekistán":     "🇺🇿",
  // OFC - Oceanía (1)
  "Nueva Zelanda":  "🇳🇿",
};

export const ALL_COUNTRIES = Object.keys(COUNTRY_FLAGS).sort();
export const AVATAR_EMOJIS = ["⚽","🏆","🥅","👟","🥇","🎯","🔥","⭐","🦁","🐯","🦊","🐺","🦅","🐉","🦈","🐆","🎪","🧠","💎","🌟"];
export const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin1234";

export const flag = c => COUNTRY_FLAGS[c] || "🏳️";

export function calcPoints(bet, match) {
  if (!bet || match.home_score === null || match.home_score === undefined) return 0;

  const isExact = bet.home_bet === match.home_score && bet.away_bet === match.away_score;
  const isDraw = match.home_score === match.away_score;
  const betIsDraw = bet.home_bet === bet.away_bet;
  const signMatch = Math.sign(bet.home_bet - bet.away_bet) === Math.sign(match.home_score - match.away_score);

  // Partido de eliminatoria con empate real → puede haber penaltis
  if (match.is_knockout && isDraw && match.penalty_winner) {
    const penaltyCorrect = bet.penalty_winner && bet.penalty_winner === match.penalty_winner;
    if (isExact && penaltyCorrect) return 6;  // resultado exacto + acertó penaltis
    if (isExact) return 4;                    // resultado exacto sin acertar penaltis
    if (betIsDraw && penaltyCorrect) return 4; // acertó signo (empate) + penaltis
    if (betIsDraw) return 2;                   // solo acertó signo (empate)
    return 1;                                  // falló el signo
  }

  // Partido normal (o eliminatoria sin empate / sin penalty_winner introducido)
  if (isExact) return 4;
  if (signMatch) return 2;
  return 1;
}

// Descripción de puntos para mostrar en UI
export function calcPointsBreakdown(bet, match) {
  if (!bet || match.home_score === null || match.home_score === undefined) return null;
  const pts = calcPoints(bet, match);
  const isDraw = match.home_score === match.away_score;
  const betIsDraw = bet.home_bet === bet.away_bet;
  const isExact = bet.home_bet === match.home_score && bet.away_bet === match.away_score;
  const penaltyCorrect = match.is_knockout && isDraw && match.penalty_winner && bet.penalty_winner === match.penalty_winner;

  if (pts === 6) return { pts, label: '🎯 Exacto + Penaltis' };
  if (pts === 4 && isExact) return { pts, label: '🎯 Exacto' };
  if (pts === 4 && penaltyCorrect) return { pts, label: '✅ Empate + Penaltis' };
  if (pts === 2) return { pts, label: '✅ Signo' };
  return { pts, label: '❌ Fallo' };
}

export function computeStandings(players, rounds, matches, bets) {
  const stats = {};
  players.forEach(p => { stats[p.id] = {pts:0, exact:0, sign:0, rounds:0, mvps:0, worsts:0, history:[]}; });

  rounds.filter(r => r.results_entered).forEach(r => {
    const roundMatches = matches.filter(m => m.round_id === r.id);
    const roundStats = {};
    players.forEach(p => { roundStats[p.id] = {pts:0, exact:0, sign:0, participated:false}; });

    roundMatches.forEach(m => {
      if (!m.played) return;
      players.forEach(p => {
        const bet = bets.find(b => b.player_id === p.id && b.match_id === m.id);
        if (!bet) return;
        roundStats[p.id].participated = true;
        const pts = calcPoints(bet, m);
        roundStats[p.id].pts += pts;
        if (pts >= 4) roundStats[p.id].exact++;
        else if (pts === 2) roundStats[p.id].sign++;
      });
    });

    const participated = players
      .filter(p => roundStats[p.id].participated)
      .sort((a, b) => roundStats[b.id].pts - roundStats[a.id].pts);

    players.forEach(p => {
      stats[p.id].pts    += roundStats[p.id].pts;
      stats[p.id].exact  += roundStats[p.id].exact;
      stats[p.id].sign   += roundStats[p.id].sign;
      if (roundStats[p.id].participated) stats[p.id].rounds++;
      stats[p.id].history.push({ roundName: r.name, pts: roundStats[p.id].pts });
    });

    if (participated.length > 0) stats[participated[0].id].mvps++;
    if (participated.length > 1) stats[participated[participated.length - 1].id].worsts++;
  });

  return stats;
}

export function getRoundAwards(round, roundMatches, players, bets) {
  if (!round.results_entered) return null;
  const stats = {};
  players.forEach(p => { stats[p.id] = {pts:0, exact:0, participated:false}; });

  roundMatches.forEach(m => {
    if (!m.played) return;
    players.forEach(p => {
      const bet = bets.find(b => b.player_id === p.id && b.match_id === m.id);
      if (!bet) return;
      stats[p.id].participated = true;
      const pts = calcPoints(bet, m);
      stats[p.id].pts += pts;
      if (pts >= 4) stats[p.id].exact++;
    });
  });

  const part = players
    .filter(p => stats[p.id].participated)
    .sort((a, b) => stats[b.id].pts - stats[a.id].pts);

  if (part.length === 0) return null;

  return {
    mvp:   part[0],
    worst: part[part.length - 1],
    hawk:  [...part].sort((a, b) => stats[b.id].exact - stats[a.id].exact)[0],
    stats,
  };
}
