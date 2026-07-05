'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { flag, calcPoints, calcPointsBreakdown, computeStandings, getRoundAwards, ALL_COUNTRIES, AVATAR_EMOJIS, ADMIN_PASSWORD } from '../lib/game';

// ── CSS ───────────────────────────────────────────────────────────────────────
const BALL_IMG = "/ball.png";
const TROPHY_IMG = "/trophy.png";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --pitch:#0a3d1f;--pitch-mid:#0d5229;--pitch-light:#147a3b;
  --gold:#f5c518;--gold-dim:#c9a214;--gold-bg:#2d2200;
  --silver:#b8c0cc;--bronze:#c8732a;
  --red-bg:#2d0f0f;--red-border:#7f1d1d;
  --green:#4ade80;--green-bg:#0f3d1c;--green-border:#166534;
  --blue:#818cf8;--blue-bg:#1a1a2e;--blue-border:#3730a3;
  --lime:#a3e635;--lime-bg:#1e2d0f;--lime-border:#365314;
  --bg:#060f0a;--surface:#0e2518;--surface2:#142d1e;--surface3:#1a3826;
  --border:#1e4730;--text:#e8f5ec;--text-dim:#7da98a;--text-muted:#3d6b4f;
  --radius:14px;--radius-sm:8px;
}
html,body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
.app{max-width:430px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column}
.topbar{background:linear-gradient(135deg,var(--pitch),var(--pitch-mid));padding:16px 20px 12px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100}
.logo{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:1.5px;color:var(--gold)}
.logo span{color:var(--text)}
.topbar-r{display:flex;align-items:center;gap:8px}
.btn-icon{background:var(--surface3);border:1px solid var(--border);color:var(--text);width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px}
.btn-icon.on{background:var(--gold-bg);border-color:var(--gold-dim)}
.bottom-nav{background:var(--surface);border-top:1px solid var(--border);display:grid;grid-template-columns:repeat(4,1fr);position:sticky;bottom:0;z-index:100}
.nav-item{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px 4px 8px;cursor:pointer;color:var(--text-muted);font-size:10px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;border:none;background:none;gap:4px}
.nav-item.active{color:var(--gold)}
.nav-icon{font-size:20px;line-height:1}
.scroll{flex:1;overflow-y:auto;padding:16px 16px 100px;-webkit-overflow-scrolling:touch}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:12px}
.ch{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.ct{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:1px;color:var(--gold)}
.hero{background:linear-gradient(135deg,var(--pitch),#052211);border-radius:var(--radius);padding:20px;margin-bottom:12px;text-align:center;position:relative;overflow:hidden;border:1px solid var(--border)}
.hero::before{content:'⚽';position:absolute;font-size:140px;opacity:.04;bottom:-30px;right:-30px;pointer-events:none}
.ht{font-family:'Bebas Neue',sans-serif;font-size:32px;letter-spacing:3px;color:var(--gold);line-height:1}
.hs{font-size:13px;color:var(--text-dim);margin-top:4px}
.lbi{display:flex;align-items:center;gap:12px;padding:12px;border-radius:var(--radius-sm);margin-bottom:6px}
.lbi.r1{background:linear-gradient(135deg,#2d2200,#1a1400);border:1px solid #7a5c00}
.lbi.r2{background:linear-gradient(135deg,#1a1f24,#0e1316);border:1px solid #4a5568}
.lbi.r3{background:linear-gradient(135deg,#1f1208,#110a04);border:1px solid #6b3a1f}
.lbi.ro{background:var(--surface2);border:1px solid var(--border)}
.lbi.me{outline:1.5px solid var(--gold)}
.rb{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;flex-shrink:0}
.r1 .rb{background:var(--gold);color:#000}
.r2 .rb{background:var(--silver);color:#000}
.r3 .rb{background:var(--bronze);color:#fff}
.ro .rb{background:var(--surface3);color:var(--text-dim)}
.pav{font-size:26px;line-height:1;flex-shrink:0}
.pi{flex:1;min-width:0}
.pn{font-weight:700;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ps{font-size:11px;color:var(--text-dim);margin-top:2px;display:flex;gap:8px;flex-wrap:wrap}
.pbig{font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--gold);line-height:1;flex-shrink:0;text-align:right}
.plbl{font-size:10px;color:var(--text-muted);text-align:right;font-weight:600}
.sparkline{display:flex;align-items:flex-end;gap:2px;height:22px;margin-top:4px}
.sb{border-radius:2px 2px 0 0;min-width:7px;background:var(--pitch-light)}
.sb.hi{background:var(--gold)}
.mc{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px;margin-bottom:10px}
.mt{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px}
.mte{display:flex;flex-direction:column;align-items:center;gap:4px}
.mte.home{align-items:flex-end}
.mte.away{align-items:flex-start}
.mfl{font-size:34px;line-height:1}
.mn{font-size:11px;font-weight:600;color:var(--text-dim);text-align:center;max-width:84px;line-height:1.2}
.msb{display:flex;flex-direction:column;align-items:center;gap:2px}
.ms{font-family:'Bebas Neue',sans-serif;font-size:30px;letter-spacing:3px;color:var(--text);line-height:1}
.mvs{font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--text-muted);letter-spacing:1px}
.pill{display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap}
.pe{background:var(--green-bg);color:var(--green);border:1px solid var(--green-border)}
.psi{background:var(--lime-bg);color:var(--lime);border:1px solid var(--lime-border)}
.pm{background:var(--red-bg);color:#f87171;border:1px solid var(--red-border)}
.pp{background:var(--blue-bg);color:var(--blue);border:1px solid var(--blue-border)}
.pno{background:#1a1a1a;color:#6b7280;border:1px solid #374151}
.ppt{background:var(--gold-bg);color:var(--gold);border:1px solid var(--gold-dim)}
.po{background:var(--green-bg);color:var(--green);border:1px solid var(--green-border)}
.pcl{background:var(--red-bg);color:#f87171;border:1px solid var(--red-border)}
.pdn{background:var(--blue-bg);color:var(--blue);border:1px solid var(--blue-border)}
.btn{width:100%;padding:14px;background:linear-gradient(135deg,var(--gold),var(--gold-dim));color:#000;border:none;border-radius:var(--radius-sm);font-weight:800;font-size:15px;cursor:pointer;letter-spacing:.5px}
.btn:disabled{opacity:.4;cursor:not-allowed}
.btn2{padding:10px 18px;background:var(--surface3);color:var(--text);border:1px solid var(--border);border-radius:var(--radius-sm);font-weight:600;font-size:13px;cursor:pointer}
.btnd{padding:10px 18px;background:var(--red-bg);color:#f87171;border:1px solid var(--red-border);border-radius:var(--radius-sm);font-weight:600;font-size:13px;cursor:pointer}
.btng{padding:8px 14px;background:none;color:var(--text-dim);border:1px solid var(--border);border-radius:var(--radius-sm);font-weight:600;font-size:12px;cursor:pointer}
.tabs{display:flex;gap:4px;background:var(--surface2);border-radius:10px;padding:4px;margin-bottom:16px}
.tab{flex:1;padding:8px;border:none;border-radius:8px;background:none;color:var(--text-muted);font-weight:700;font-size:12px;cursor:pointer}
.tab.active{background:var(--pitch);color:var(--gold)}
.sec{font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:2px;color:var(--text-dim);margin-bottom:10px;display:flex;align-items:center;gap:8px}
.sec::after{content:'';flex:1;height:1px;background:var(--border)}
.dvd{height:1px;background:var(--border);margin:14px 0}
.awr{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
.awc{border-radius:var(--radius);padding:14px;display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center}
.awc.mvp{background:linear-gradient(135deg,#2d2200,#1a1400);border:1px solid var(--gold-dim)}
.awc.wst{background:linear-gradient(135deg,#2d0f0f,#1a0707);border:1px solid var(--red-border)}
.awc.hwk{background:linear-gradient(135deg,#0f1a2d,#060f1a);border:1px solid #1e3a5f}
.awi{font-size:28px}
.awl{font-size:9px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-dim)}
.awn{font-weight:800;font-size:14px;line-height:1.2}
.awp{font-family:'Bebas Neue',sans-serif;font-size:22px}
.awc.mvp .awp{color:var(--gold)}
.awc.wst .awp{color:#f87171}
.awc.hwk .awp{color:#60a5fa}
.fi{width:100%;padding:12px 14px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:15px;outline:none}
.fi:focus{border-color:var(--gold)}
.fl{display:block;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text-dim);margin-bottom:6px}
.fs{width:100%;padding:10px 12px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:13px;outline:none;appearance:none;cursor:pointer}
.ag{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:8px}
.ao{font-size:24px;width:100%;aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:10px;cursor:pointer;background:var(--surface2);border:2px solid transparent}
.ao.sel{border-color:var(--gold);background:var(--gold-bg)}
.ov{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:200;display:flex;align-items:flex-end;justify-content:center}
.modal{background:var(--surface);border:1px solid var(--border);border-top-left-radius:var(--radius);border-top-right-radius:var(--radius);padding:20px;width:100%;max-width:430px;max-height:88vh;overflow-y:auto;animation:su .25s ease}
@keyframes su{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
.mtit{font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--gold);letter-spacing:1px;margin-bottom:16px}
.mhdl{width:40px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 16px}
.toast{position:fixed;top:80px;left:50%;transform:translateX(-50%);background:var(--pitch-light);color:var(--gold);padding:12px 24px;border-radius:30px;font-weight:700;font-size:14px;z-index:300;border:1px solid var(--gold-dim);animation:ti .3s ease,to .3s ease 2.2s forwards;white-space:nowrap;max-width:90vw;text-align:center;pointer-events:none}
@keyframes ti{from{opacity:0;top:60px}to{opacity:1;top:80px}}
@keyframes to{from{opacity:1}to{opacity:0}}
.cw{position:fixed;inset:0;pointer-events:none;z-index:999}
.cp{position:absolute;width:8px;height:8px;border-radius:2px;animation:cf linear forwards}
@keyframes cf{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}
.cd{display:flex;gap:6px;justify-content:center;margin-top:8px}
.cdb{background:var(--surface3);border-radius:8px;padding:5px 10px;text-align:center;min-width:50px}
.cdn{font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--gold);line-height:1}
.cdl{font-size:9px;color:var(--text-muted);font-weight:700;letter-spacing:1px;text-transform:uppercase}
.stpr{display:flex;align-items:center;gap:6px}
.stb{width:30px;height:30px;border-radius:50%;border:1px solid var(--border);background:var(--surface3);color:var(--text);font-size:18px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-weight:700;flex-shrink:0}
.stv{font-family:'Bebas Neue',sans-serif;font-size:24px;min-width:26px;text-align:center}
.adms{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:12px}
.cmprow{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:var(--surface2);margin-bottom:4px}
.cmpn{flex:1;font-size:13px;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}
.sbox{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:14px 10px;text-align:center}
.snum{font-family:'Bebas Neue',sans-serif;font-size:26px;color:var(--gold)}
.slbl{font-size:10px;color:var(--text-muted);font-weight:700;letter-spacing:.5px;text-transform:uppercase;margin-top:2px}
.pb{height:6px;background:var(--surface3);border-radius:3px;overflow:hidden;margin-top:4px}
.pf{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--pitch-light),var(--gold))}
.dbk{display:flex;align-items:center;gap:8px;margin-bottom:16px;cursor:pointer;color:var(--text-dim);font-size:14px;font-weight:600}
.bttbl{width:100%;border-collapse:collapse;font-size:12px}
.bttbl th{color:var(--text-muted);font-size:10px;letter-spacing:1px;text-transform:uppercase;padding:6px 8px;border-bottom:1px solid var(--border);text-align:center;font-weight:700}
.bttbl td{padding:8px;text-align:center;border-bottom:1px solid var(--surface3)}
.bttbl tr:last-child td{border-bottom:none}
.bts{font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--text-dim)}
.bts.ex{color:var(--gold)}
.bts.si{color:var(--lime)}
.prsent{text-align:center;padding:10px;background:var(--green-bg);border:1px solid var(--green-border);border-radius:var(--radius-sm);color:var(--green);font-weight:700;font-size:13px;margin-top:8px}
.empty{text-align:center;padding:40px 20px;color:var(--text-muted)}
.ei{font-size:48px;margin-bottom:12px}
.spinner{display:inline-block;width:20px;height:20px;border:2px solid var(--border);border-top-color:var(--gold);border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
input[type="datetime-local"]{color-scheme:dark}
.fg{margin-bottom:14px}
`;

// ── MINI COMPONENTS ────────────────────────────────────────────────────────────

function Confetti({ active }) {
  if (!active) return null;
  const pieces = Array.from({length:35}, (_,i) => ({
    id:i, left:Math.random()*100, dur:1.4+Math.random()*1.6, delay:Math.random()*.9,
    color:["#f5c518","#4ade80","#818cf8","#f87171","#fff","#fb923c","#a3e635"][Math.floor(Math.random()*7)],
  }));
  return (
    <div className="cw">
      {pieces.map(p => <div key={p.id} className="cp" style={{left:`${p.left}%`,background:p.color,animationDuration:`${p.dur}s`,animationDelay:`${p.delay}s`}}/>)}
    </div>
  );
}

function Countdown({ targetTime }) {
  const [diff, setDiff] = useState(Math.max(0, targetTime - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setDiff(Math.max(0, targetTime - Date.now())), 1000);
    return () => clearInterval(t);
  }, [targetTime]);
  if (diff <= 0) return <span style={{color:"#e63946",fontSize:12,fontWeight:700}}>⛔ PORRAS CERRADAS</span>;
  const d=Math.floor(diff/864e5), h=Math.floor((diff%864e5)/36e5), m=Math.floor((diff%36e5)/6e4), s=Math.floor((diff%6e4)/1e3);
  return (
    <div className="cd">
      {d > 0 && <div className="cdb"><div className="cdn">{d}</div><div className="cdl">días</div></div>}
      <div className="cdb"><div className="cdn">{String(h).padStart(2,"0")}</div><div className="cdl">horas</div></div>
      <div className="cdb"><div className="cdn">{String(m).padStart(2,"0")}</div><div className="cdl">min</div></div>
      <div className="cdb"><div className="cdn">{String(s).padStart(2,"0")}</div><div className="cdl">seg</div></div>
    </div>
  );
}

function Sparkline({ data }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  return (
    <div className="sparkline">
      {data.map((v,i) => <div key={i} className={`sb${v === Math.max(...data) ? " hi" : ""}`} style={{height:`${Math.max(4,(v/max)*22)}px`}}/>)}
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('home');
  const [players, setPlayers] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showIntro, setShowIntro] = useState(false); // se activa en useEffect
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const [modal, setModal] = useState(null);
  const [detailRoundId, setDetailRoundId] = useState(null);
  const [selectedRoundId, setSelectedRoundId] = useState(null);
  const [adminPass, setAdminPass] = useState('');
  const [newPlayer, setNewPlayer] = useState({name:'', avatar:'⚽'});
  const [betDraft, setBetDraft] = useState({});
  const [penaltyDraft, setPenaltyDraft] = useState({});  // { matchId: 'home_team' | 'away_team' }
  const [resultsDraft, setResultsDraft] = useState({});
  const [newRoundName, setNewRoundName] = useState('');
  const [newRoundTime, setNewRoundTime] = useState('');
  const [newRoundMatches, setNewRoundMatches] = useState([]);
  const [newMatchHome, setNewMatchHome] = useState('España');
  const [newMatchAway, setNewMatchAway] = useState('Alemania');
  const [newMatchKnockout, setNewMatchKnockout] = useState(false);
  const [adminTab, setAdminTab] = useState('rounds');
  const [adminBetRoundId, setAdminBetRoundId] = useState(null);
  const [adminBetPlayerId, setAdminBetPlayerId] = useState(null);
  const [adminBetDraft, setAdminBetDraft] = useState({});
  const [adminBetPenaltyDraft, setAdminBetPenaltyDraft] = useState({});
  const [savingAdminBet, setSavingAdminBet] = useState(false);
  const toastTimer = useRef(null);
  const [savingBet, setSavingBet] = useState(false);

  // ── LOAD DATA ──────────────────────────────────────────────────────────────
  const loadAll = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const [{ data: ps }, { data: rs }, { data: ms }] = await Promise.all([
        supabase.from('players').select('*').order('created_at'),
        supabase.from('rounds').select('*').order('created_at'),
        supabase.from('matches').select('*').order('position'),
      ]);
      // Traer apuestas paginadas de 1000 en 1000 hasta tenerlas todas
      let allBets = [];
      let from = 0;
      const PAGE = 1000;
      while (true) {
        const { data: page } = await supabase.from('bets').select('*').range(from, from + PAGE - 1);
        if (!page || page.length === 0) break;
        allBets = allBets.concat(page);
        if (page.length < PAGE) break;
        from += PAGE;
      }
      setPlayers(ps || []);
      setRounds((rs || []).map(r => ({...r, matches: (ms || []).filter(m => m.round_id === r.id)})));
      setBets(allBets);
      console.log(`loadAll: ${(ps||[]).length} players, ${allBets.length} bets, ${(ms||[]).length} matches`);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const isFirstVisit = typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('wp_intro_seen');
    loadAll().then(() => {
      if (isFirstVisit) {
        setShowIntro(true);
        sessionStorage.setItem('wp_intro_seen', '1');
        setTimeout(() => setShowIntro(false), 3200);
      }
    });
    // Restore session
    try {
      const p = localStorage.getItem('mundial_player');
      if (p) setCurrentPlayer(JSON.parse(p));
    } catch {}
    // Real-time: refresh every 15s when tab visible
    const interval = setInterval(() => { if (!document.hidden) loadAll(true); }, 15000);
    return () => clearInterval(interval);
  }, [loadAll]);

  // ── REAL-TIME via Supabase ─────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase.channel('mundial_realtime')
      .on('postgres_changes', {event:'*', schema:'public'}, () => loadAll(true))
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [loadAll]);

  const showToast = msg => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2500);
  };
  const boom = () => { setConfetti(true); setTimeout(() => setConfetti(false), 3000); };

  // ── COMPUTED ───────────────────────────────────────────────────────────────
  const allMatches = rounds.flatMap(r => r.matches || []);
  const standings = computeStandings(players, rounds, allMatches, bets);
  const sorted = [...players].sort((a,b) => (standings[b.id]?.pts||0) - (standings[a.id]?.pts||0));
  const maxPts = sorted[0] ? standings[sorted[0].id]?.pts || 0 : 0;
  const doneRounds = rounds.filter(r => r.results_entered);

  const isOpen = r => new Date(r.start_time) > new Date() && !r.closed;
  const myBetsForRound = roundId => currentPlayer ? bets.filter(b => b.player_id === currentPlayer.id && b.round_id === roundId) : [];
  const hasBet = r => myBetsForRound(r.id).length > 0;
  const canBet = r => isOpen(r) && currentPlayer && !hasBet(r);

  // ── ACTIONS ────────────────────────────────────────────────────────────────
const handleRegister = async () => {
  const name = newPlayer.name.trim();

  if (!name) return showToast('Escribe un nombre');

  // Buscar si ya existe
  const { data: existingPlayer } = await supabase
    .from('players')
    .select('*')
    .eq('name', name)
    .maybeSingle();

  // Si existe, iniciar sesión con ese jugador
  if (existingPlayer) {
    setCurrentPlayer(existingPlayer);
    localStorage.setItem('mundial_player', JSON.stringify(existingPlayer));

    setModal(null);
    setNewPlayer({ name: '', avatar: '⚽' });

    await loadAll(true);
    showToast(`¡Bienvenido de nuevo ${existingPlayer.avatar} ${existingPlayer.name}!`);
    return;
  }

  // Si no existe, crearlo
  const { data, error } = await supabase
    .from('players')
    .insert({
      name,
      avatar: newPlayer.avatar
    })
    .select()
    .single();

  if (error) return showToast(error.message);

  setCurrentPlayer(data);
  localStorage.setItem('mundial_player', JSON.stringify(data));

  setModal(null);
  setNewPlayer({ name: '', avatar: '⚽' });

  await loadAll(true);
  boom();
  showToast(`¡Bienvenido ${data.avatar} ${data.name}!`);
};

  const handleAdminLogin = () => {
    if (adminPass === ADMIN_PASSWORD) {
      setIsAdmin(true); setModal(null); setAdminPass(''); setTab('admin');
      showToast('🔧 Modo admin activado');
    } else showToast('Contraseña incorrecta');
  };

    const handleSaveBet = async () => {
    if (!currentPlayer || !selectedRoundId) return;
    if (savingBet) return;
    setSavingBet(true);
    const round = rounds.find(r => r.id === selectedRoundId);
    if (!round || !isOpen(round)) return showToast('La jornada ya está cerrada');
    const allFilled = round.matches.every(m => betDraft[m.id] !== undefined && betDraft[m.id].home !== undefined && betDraft[m.id].away !== undefined);
    if (!allFilled) return showToast('Rellena todos los marcadores');
    const rows = round.matches.map(m => {
      const betH = betDraft[m.id].home;
      const betA = betDraft[m.id].away;
      const isDraw = betH === betA;
      const penWinner = (m.is_knockout && isDraw) ? (penaltyDraft[m.id] || null) : null;
      return {
        player_id: currentPlayer.id, round_id: round.id,
        match_id: m.id, home_bet: betH, away_bet: betA,
        penalty_winner: penWinner,
      };
    });
    // Borrar porras anteriores de este jugador en esta jornada, luego insertar de nuevo
    const matchIds = rows.map(r => r.match_id);
    const { error: delError } = await supabase.from('bets')
      .delete()
      .eq('player_id', currentPlayer.id)
      .eq('round_id', round.id)
      .in('match_id', matchIds);
    console.log('DELETE result:', delError);
    if (delError) { setSavingBet(false); return showToast('Error al limpiar porra anterior: ' + delError.message); }
    const { error, data } = await supabase.from('bets').insert(rows).select();
    console.log('INSERT result:', JSON.stringify({ error, data, rows }));
    if (error) { setSavingBet(false); return showToast('Error: ' + error.message); }
    await loadAll(true); setModal(null); boom(); showToast('✅ ¡Porra guardada!');
    setSavingBet(false);
  };

  const handleAddRound = async () => {
    if (!newRoundName.trim() || !newRoundTime || newRoundMatches.length === 0)
      return showToast('Rellena nombre, fecha y añade partidos');
    const { data: round, error: re } = await supabase.from('rounds').insert({name:newRoundName.trim(), start_time:new Date(newRoundTime).toISOString()}).select().single();
    if (re) return showToast(re.message);
    const matchRows = newRoundMatches.map((m,i) => ({round_id:round.id, home_team:m.home, away_team:m.away, position:i, is_knockout:m.is_knockout||false}));
    const { error: me } = await supabase.from('matches').insert(matchRows);
    if (me) return showToast(me.message);
    setNewRoundName(''); setNewRoundTime(''); setNewRoundMatches([]);
    await loadAll(true); showToast('✅ Jornada creada');
  };

  const handleEnterResults = async roundId => {
    const round = rounds.find(r => r.id === roundId);
    if (!round) return;
    for (const m of round.matches) {
      const dr = resultsDraft[m.id];
      if (dr !== undefined) {
        const homeScore = Number(dr.home||0);
        const awayScore = Number(dr.away||0);
        const isDraw = homeScore === awayScore;
        const penWinner = (m.is_knockout && isDraw) ? (dr.penalty_winner || null) : null;
        const { error } = await supabase.from('matches').update({
          home_score: homeScore,
          away_score: awayScore,
          played: true,
          penalty_winner: penWinner,
        }).eq('id', m.id);
        if (error) return showToast(error.message);
      }
    }
    const { error } = await supabase.from('rounds').update({closed:true, results_entered:true}).eq('id', roundId);
    if (error) return showToast(error.message);
    await loadAll(true); boom(); showToast('🏆 ¡Resultados guardados!');
  };

  const handleDeleteRound = async (round) => {
    if (!confirm(`¿Eliminar ${round.name}?`)) return;
    await supabase.from('rounds').delete().eq('id', round.id);
    await loadAll(true); showToast('Jornada eliminada');
  };

  const handleDeletePlayer = async (p) => {
    if (!confirm(`¿Eliminar a ${p.name}?`)) return;
    await supabase.from('players').delete().eq('id', p.id);
    if (currentPlayer?.id === p.id) { setCurrentPlayer(null); localStorage.removeItem('mundial_player'); }
    await loadAll(true); showToast(`${p.name} eliminado`);
  };

  const handleResetAll = async () => {
    if (!confirm('⚠️ ¿Borrar TODOS los datos? Jugadores, jornadas y porras. Irreversible.')) return;
    await supabase.from('bets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('rounds').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('players').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    setCurrentPlayer(null); localStorage.removeItem('mundial_player');
    setIsAdmin(false); await loadAll(); showToast('♻️ Juego reiniciado');
  };

  // ── LOADING SCREEN ─────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'radial-gradient(circle at 50% 30%, #0d2818 0%, #060f0a 70%)',flexDirection:'column',gap:8,overflow:'hidden',position:'relative'}}>
      <style>{css}</style>
      <style>{`
        @keyframes wcBounce {
          0%   { transform: translateY(0) rotate(0deg); }
          25%  { transform: translateY(-70px) rotate(180deg); }
          50%  { transform: translateY(0) rotate(360deg); }
          60%  { transform: translateY(0) rotate(360deg) scaleX(1.15) scaleY(0.85); }
          70%  { transform: translateY(-20px) rotate(420deg) scaleX(1) scaleY(1); }
          100% { transform: translateY(0) rotate(540deg); }
        }
        @keyframes wcShadow {
          0%,100% { transform: scaleX(1); opacity: .35; }
          25%,75% { transform: scaleX(.5); opacity: .12; }
          50%     { transform: scaleX(1); opacity: .35; }
        }
        @keyframes wcGlow {
          0%,100% { text-shadow: 0 0 12px rgba(245,197,24,.5), 0 0 24px rgba(245,197,24,.25); }
          50%     { text-shadow: 0 0 24px rgba(245,197,24,.9), 0 0 48px rgba(245,197,24,.5); }
        }
        @keyframes wcDots {
          0%,20%  { opacity: 0; }
          50%     { opacity: 1; }
          100%    { opacity: 0; }
        }
        @keyframes wcFlagSpin {
          0%   { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes wcFloat {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-8px); }
        }
        @keyframes wcBarFill {
          0%   { width: 0%; }
          50%  { width: 75%; }
          100% { width: 100%; }
        }
        @keyframes wcConfetti {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          100% { transform: translateY(420px) rotate(540deg); opacity: 0; }
        }
        .wc-confetti span {
          position: absolute; top: 0; font-size: 14px;
          animation: wcConfetti 3.2s linear infinite;
        }
      `}</style>

      <div className="wc-confetti" style={{position:'absolute',inset:0,pointerEvents:'none'}}>
        <span style={{left:'8%',animationDelay:'0s'}}>🎉</span>
        <span style={{left:'22%',animationDelay:'.6s'}}>⚽</span>
        <span style={{left:'40%',animationDelay:'1.3s'}}>🏆</span>
        <span style={{left:'58%',animationDelay:'.3s'}}>🎊</span>
        <span style={{left:'74%',animationDelay:'1.8s'}}>⚽</span>
        <span style={{left:'90%',animationDelay:'.9s'}}>🥅</span>
      </div>

      <div style={{display:'flex',gap:14,marginBottom:6,animation:'wcFloat 2.4s ease-in-out infinite'}}>
        <span style={{fontSize:26}}>🇪🇸</span>
        <span style={{fontSize:26,animationDelay:'.3s'}}>🇧🇷</span>
        <span style={{fontSize:26,animationDelay:'.6s'}}>🇩🇪</span>
        <span style={{fontSize:26,animationDelay:'.9s'}}>🇦🇷</span>
      </div>

      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:30,letterSpacing:4,color:'#f5c518',animation:'wcGlow 1.6s ease-in-out infinite',marginBottom:18}}>
        🏆 MUNDIAL PORRAS
      </div>

      <div style={{position:'relative',width:90,height:120,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end'}}>
        <div style={{fontSize:48,animation:'wcBounce 1.1s cubic-bezier(.5,0,.5,1) infinite'}}>⚽</div>
        <div style={{width:54,height:10,borderRadius:'50%',background:'#000',animation:'wcShadow 1.1s ease-in-out infinite',marginTop:4}}/>
      </div>

      <div style={{fontFamily:'sans-serif',fontSize:16,color:'#f5c518',letterSpacing:3,marginTop:22,display:'flex',alignItems:'center',gap:2}}>
        CARGANDO
        <span style={{display:'inline-flex'}}>
          <span style={{animation:'wcDots 1.4s infinite',animationDelay:'0s'}}>.</span>
          <span style={{animation:'wcDots 1.4s infinite',animationDelay:'.2s'}}>.</span>
          <span style={{animation:'wcDots 1.4s infinite',animationDelay:'.4s'}}>.</span>
        </span>
      </div>

      <div style={{width:160,height:5,background:'rgba(255,255,255,.08)',borderRadius:99,marginTop:14,overflow:'hidden'}}>
        <div style={{height:'100%',background:'linear-gradient(90deg,#f5c518,#ffe27a)',borderRadius:99,animation:'wcBarFill 1.8s ease-in-out infinite'}}/>
      </div>
    </div>
  );

  // ── INTRO SCREEN ───────────────────────────────────────────────────────────
  if (showIntro) {
    return (
      <div style={{position:'fixed',inset:0,background:'#060f0a',zIndex:9999,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
        <style>{css}</style>
        <style>{`
          @keyframes introBg {
            0%   { opacity:0; transform:scale(1.08); }
            100% { opacity:1; transform:scale(1); }
          }
          @keyframes introFadeOut {
            0%,75% { opacity:1; }
            100%   { opacity:0; }
          }
          @keyframes introGrassSlide {
            0%   { transform:translateY(100%); }
            40%  { transform:translateY(0%); }
            85%  { transform:translateY(0%); }
            100% { transform:translateY(-100%); }
          }
          @keyframes introBallDrop {
            0%   { transform:translateY(-160px) rotate(0deg); opacity:0; }
            30%  { opacity:1; }
            50%  { transform:translateY(0px) rotate(320deg); }
            58%  { transform:translateY(-22px) rotate(370deg) scaleY(1); }
            64%  { transform:translateY(0px) rotate(400deg) scaleX(1.2) scaleY(0.8); }
            70%  { transform:translateY(-10px) rotate(430deg); }
            76%  { transform:translateY(0px) rotate(450deg); }
            85%  { transform:translateY(0px) rotate(450deg); opacity:1; }
            100% { transform:translateY(-10px) rotate(450deg); opacity:0; }
          }
          @keyframes introShadowDrop {
            0%   { transform:scaleX(0.1); opacity:0; }
            50%  { transform:scaleX(1); opacity:0.4; }
            58%  { transform:scaleX(1.3); opacity:0.2; }
            64%  { transform:scaleX(0.8); opacity:0.5; }
            76%  { transform:scaleX(1); opacity:0.4; }
            85%  { transform:scaleX(1); opacity:0.4; }
            100% { opacity:0; }
          }
          @keyframes introTitleIn {
            0%   { opacity:0; transform:translateY(30px) scale(.9); letter-spacing:12px; }
            100% { opacity:1; transform:translateY(0) scale(1); letter-spacing:4px; }
          }
          @keyframes introSubIn {
            0%   { opacity:0; transform:translateY(16px); }
            100% { opacity:1; transform:translateY(0); }
          }
          @keyframes introTrophyPulse {
            0%,100% { transform:scale(1) rotate(-4deg); filter:drop-shadow(0 0 6px rgba(245,197,24,.4)); }
            50%     { transform:scale(1.12) rotate(4deg); filter:drop-shadow(0 0 20px rgba(245,197,24,.9)); }
          }
          @keyframes introLineGrow {
            0%   { transform:scaleX(0); }
            100% { transform:scaleX(1); }
          }
          @keyframes introFlagWave {
            0%   { opacity:0; transform:translateY(12px); }
            100% { opacity:1; transform:translateY(0); }
          }
          @keyframes introFlare {
            0%,100% { opacity:0; transform:scale(.6); }
            50%     { opacity:.18; transform:scale(1); }
          }
          @keyframes introWholeFadeOut {
            0%,80% { opacity:1; }
            100%   { opacity:0; }
          }
          .intro-wrap {
            animation: introWholeFadeOut 3.2s ease forwards;
            width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative;
          }
          .intro-grass {
            position:absolute; bottom:0; left:0; right:0; height:38%;
            background:linear-gradient(180deg,#0d5229 0%,#0a3d1f 60%,#072e16 100%);
            animation: introGrassSlide 3.2s cubic-bezier(.4,0,.2,1) forwards;
          }
          .intro-grass::before {
            content:''; position:absolute; top:0; left:0; right:0; height:3px;
            background:repeating-linear-gradient(90deg,#f5c518 0px,#f5c518 40px,transparent 40px,transparent 80px);
            opacity:.35;
          }
          .intro-flare {
            position:absolute; width:500px; height:500px; border-radius:50%;
            background:radial-gradient(circle,rgba(245,197,24,.12) 0%,transparent 70%);
            animation:introFlare 3.2s ease-in-out infinite;
          }
          .intro-ball {
            font-size:72px; line-height:1;
            animation:introBallDrop 3.2s cubic-bezier(.4,0,.2,1) forwards;
            position:relative; z-index:2;
          }
          .intro-ball-shadow {
            width:70px; height:12px; border-radius:50%;
            background:rgba(0,0,0,.5);
            margin-top:-4px; margin-bottom:24px;
            animation:introShadowDrop 3.2s cubic-bezier(.4,0,.2,1) forwards;
          }
          .intro-trophy {
            font-size:52px;
            animation:introTrophyPulse 1.2s ease-in-out infinite, introSubIn .5s .9s ease both;
            opacity:0;
          }
          .intro-title {
            font-family:'Bebas Neue',sans-serif;
            font-size:42px;
            color:#f5c518;
            animation:introTitleIn .7s .7s cubic-bezier(.2,0,0,1) both;
            opacity:0;
            text-align:center;
            line-height:1;
          }
          .intro-title span { color:#e8f5ec; }
          .intro-line {
            width:180px; height:2px; border-radius:1px;
            background:linear-gradient(90deg,transparent,#f5c518,transparent);
            margin:10px auto;
            animation:introLineGrow .6s .9s cubic-bezier(.4,0,.2,1) both;
            transform-origin:center;
          }
          .intro-sub {
            font-family:'Inter',sans-serif;
            font-size:11px; font-weight:700; letter-spacing:4px;
            color:#7da98a; text-transform:uppercase;
            animation:introSubIn .5s 1s ease both; opacity:0;
          }
          .intro-flags {
            display:flex; gap:10px; margin-top:18px;
          }
          .intro-flags span {
            font-size:24px;
            opacity:0;
          }
          .intro-flags span:nth-child(1){animation:introFlagWave .4s 1.2s ease both}
          .intro-flags span:nth-child(2){animation:introFlagWave .4s 1.35s ease both}
          .intro-flags span:nth-child(3){animation:introFlagWave .4s 1.5s ease both}
          .intro-flags span:nth-child(4){animation:introFlagWave .4s 1.65s ease both}
          .intro-flags span:nth-child(5){animation:introFlagWave .4s 1.8s ease both}
          .intro-flags span:nth-child(6){animation:introFlagWave .4s 1.95s ease both}
        `}</style>
        <div className="intro-wrap">
          <div className="intro-flare"/>
          <div className="intro-grass"/>
          <div style={{position:'relative',zIndex:3,display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div className="intro-ball"><img src={BALL_IMG} alt="ball" style={{width:100,height:100,objectFit:"contain",display:"block"}}/></div>
            <div className="intro-ball-shadow"/>
            <div className="intro-trophy"><img src={TROPHY_IMG} alt="trophy" style={{width:110,height:"auto",objectFit:"contain",display:"block"}}/></div>
            <div className="intro-title">MUNDIAL<br/><span>PORRAS</span></div>
            <div className="intro-line"/>
            <div className="intro-sub">WORLD CUP 2026</div>
            <div className="intro-flags">
              <span>🇪🇸</span><span>🇧🇷</span><span>🇩🇪</span><span>🇦🇷</span><span>🇫🇷</span><span>🇵🇹</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── HOME ──────────────────────────────────────────────────────────────────
  const renderHome = () => {
    const nextRound = rounds.find(r => !r.results_entered);
    const lastDone = [...rounds].reverse().find(r => r.results_entered);
    const awards = lastDone ? getRoundAwards(lastDone, lastDone.matches||[], players, bets) : null;
    const myPos = currentPlayer ? sorted.findIndex(p => p.id === currentPlayer.id) + 1 : null;
    const mySt = currentPlayer ? standings[currentPlayer.id] : null;

    return (
      <>
        <div className="hero">
          <div className="ht">🏆 MUNDIAL PORRAS</div>
          <div className="hs">{currentPlayer ? `${currentPlayer.avatar} ${currentPlayer.name} · #${myPos} de ${players.length}` : 'Regístrate y compite'}</div>
          {mySt && <div style={{marginTop:8,display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
            <span className="pill ppt">🏆 {mySt.pts} pts</span>
            <span className="pill pe">🎯 {mySt.exact} exactos</span>
            <span className="pill pdn">👑 {mySt.mvps} MVP</span>
          </div>}
        </div>

        {players.length === 0 && !currentPlayer && (
          <div className="card" style={{textAlign:'center',padding:'28px 20px'}}>
            <div style={{fontSize:48,marginBottom:12}}>👥</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:'var(--gold)',marginBottom:8}}>SIN JUGADORES AÚN</div>
            <div style={{fontSize:13,color:'var(--text-dim)',marginBottom:16,lineHeight:1.5}}>Comparte la URL con tus amigos y que cada uno se registre.</div>
            <button className="btn" onClick={() => setModal('register')}>⚽ Registrarme</button>
          </div>
        )}

        {rounds.length === 0 && (
          <div className="card" style={{textAlign:'center',padding:'24px 20px'}}>
            <div style={{fontSize:36,marginBottom:8}}>📅</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:'var(--gold)',marginBottom:6}}>SIN JORNADAS</div>
            <div style={{fontSize:12,color:'var(--text-dim)',lineHeight:1.5}}>El admin debe crear las jornadas. Pulsa 🔑 arriba.</div>
          </div>
        )}

        {sorted.length > 0 && (
          <>
            <div className="sec">🥇 CLASIFICACIÓN</div>
            {sorted.slice(0,3).map((p,i) => {
              const st = standings[p.id];
              const cls = i===0?'r1':i===1?'r2':'r3';
              return (
                <div key={p.id} className={`lbi ${cls}${currentPlayer?.id===p.id?' me':''}`} onClick={() => setTab('standings')} style={{cursor:'pointer'}}>
                  <div className="rb">{['🥇','🥈','🥉'][i]}</div>
                  <div className="pav">{p.avatar}</div>
                  <div className="pi">
                    <div className="pn">{p.name}{currentPlayer?.id===p.id?' (tú)':''}</div>
                    <div className="ps"><span>🎯 {st?.exact||0}</span><span>✅ {st?.sign||0}</span><span>👑 {st?.mvps||0} MVP</span></div>
                    <Sparkline data={st?.history?.map(h=>h.pts)||[]}/>
                  </div>
                  <div><div className="pbig">{st?.pts||0}</div><div className="plbl">PTS</div></div>
                </div>
              );
            })}
            {players.length > 3 && <div style={{textAlign:'center',marginBottom:14}}><button className="btng" onClick={() => setTab('standings')}>Ver tabla completa →</button></div>}
          </>
        )}

        {nextRound && (
          <>
            <div className="sec" style={{marginTop:4}}>⚡ PRÓXIMA JORNADA</div>
            <div className="card">
              <div className="ch">
                <div className="ct">{nextRound.name}</div>
                {isOpen(nextRound) ? <span className="pill po">ABIERTA</span> : <span className="pill pcl">CERRADA</span>}
              </div>
              {isOpen(nextRound) && <Countdown targetTime={new Date(nextRound.start_time).getTime()}/>}
              <div style={{marginTop:12}}>
                {(nextRound.matches||[]).map(m => (
                  <div key={m.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--surface3)'}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:22}}>{flag(m.home_team)}</span><span style={{fontSize:12,fontWeight:600,color:'var(--text-dim)'}}>{m.home_team}</span></div>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                      <span style={{fontFamily:"'Bebas Neue',sans-serif",color:'var(--text-muted)',fontSize:14}}>VS</span>
                      {m.is_knockout && <span style={{fontSize:8,color:'var(--gold)',fontWeight:800,letterSpacing:1}}>🏆ELIM</span>}
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:12,fontWeight:600,color:'var(--text-dim)'}}>{m.away_team}</span><span style={{fontSize:22}}>{flag(m.away_team)}</span></div>
                  </div>
                ))}
              </div>
              {canBet(nextRound) && <button className="btn" style={{marginTop:12}} onClick={() => { setSelectedRoundId(nextRound.id); setBetDraft({}); setModal('bet'); }}>⚽ Hacer mi porra</button>}
              {hasBet(nextRound) && <div className="prsent">✅ Porra enviada — ¡Buena suerte!</div>}
              {!currentPlayer && <button className="btn" style={{marginTop:12}} onClick={() => setModal('register')}>⚽ Unirse</button>}
            </div>
          </>
        )}

        {awards && lastDone && (
          <>
            <div className="sec" style={{marginTop:4}}>🎖️ {lastDone.name.toUpperCase()} — PREMIOS</div>
            <div className="awr">
              <div className="awc mvp">
                <div className="awi">👑</div><div className="awl">MVP Jornada</div>
                <div className="awn">{awards.mvp.avatar} {awards.mvp.name}</div>
                <div className="awp">{awards.stats[awards.mvp.id]?.pts||0} pts</div>
                <div style={{fontSize:10,color:'var(--text-muted)'}}>🎯 {awards.stats[awards.mvp.id]?.exact||0} exactos</div>
              </div>
              <div className="awc wst">
                <div className="awi">🤦</div><div className="awl">Peor porra</div>
                <div className="awn">{awards.worst.avatar} {awards.worst.name}</div>
                <div className="awp">{awards.stats[awards.worst.id]?.pts||0} pts</div>
                <div style={{fontSize:10,color:'var(--text-muted)'}}>😬 Mala suerte</div>
              </div>
            </div>
            {awards.hawk && awards.stats[awards.hawk.id]?.exact > 0 && (
              <div className="awr" style={{gridTemplateColumns:'1fr'}}>
                <div className="awc hwk">
                  <div className="awi">🔮</div><div className="awl">Ojo de Halcón</div>
                  <div className="awn">{awards.hawk.avatar} {awards.hawk.name}</div>
                  <div className="awp">{awards.stats[awards.hawk.id].exact} exacto{awards.stats[awards.hawk.id].exact>1?'s':''}</div>
                </div>
              </div>
            )}
            <button className="btng" style={{width:'100%',marginBottom:12}} onClick={() => { setDetailRoundId(lastDone.id); setTab('rounds'); }}>
              Ver porras completas de {lastDone.name} →
            </button>
          </>
        )}

        {!currentPlayer && <button className="btn" style={{marginTop:8}} onClick={() => setModal('register')}>⚽ Unirse al mundial</button>}
      </>
    );
  };

  // ── STANDINGS ─────────────────────────────────────────────────────────────
  const renderStandings = () => (
    <>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div className="ct" style={{fontSize:22}}>🏆 CLASIFICACIÓN</div>
        <span style={{fontSize:12,color:'var(--text-muted)'}}>{doneRounds.length} jornada{doneRounds.length!==1?'s':''}</span>
      </div>
      {players.length === 0 && <div className="empty"><div className="ei">👥</div><p>Sin jugadores aún</p></div>}
      {sorted.map((p,i) => {
        const st = standings[p.id];
        const cls = i===0?'r1':i===1?'r2':i===2?'r3':'ro';
        const isMe = currentPlayer?.id === p.id;
        return (
          <div key={p.id} className={`lbi ${cls}${isMe?' me':''}`}>
            <div className="rb">{i+1}</div>
            <div className="pav">{p.avatar}</div>
            <div className="pi">
              <div className="pn">{p.name}{isMe?' (tú)':''}</div>
              <div className="ps"><span>🎯 {st?.exact||0} exactos</span><span>✅ {st?.sign||0} signos</span><span>👑 {st?.mvps||0} MVP</span></div>
              <div className="pb"><div className="pf" style={{width:maxPts>0?`${((st?.pts||0)/maxPts)*100}%`:'0%'}}/></div>
              <Sparkline data={st?.history?.map(h=>h.pts)||[]}/>
            </div>
            <div><div className="pbig">{st?.pts||0}</div><div className="plbl">PTS</div><div style={{fontSize:10,color:'var(--text-muted)',textAlign:'right'}}>{st?.rounds||0} jorns</div></div>
          </div>
        );
      })}
      {doneRounds.length > 0 && (
        <>
          <div className="sec" style={{marginTop:8}}>🏅 HALL OF FAME</div>
          {[{icon:'👑',label:'Más MVPs',key:'mvps'},{icon:'🎯',label:'Más exactos',key:'exact'},{icon:'📊',label:'Más puntos',key:'pts'}].map(({icon,label,key}) => {
            const winner = sorted.slice().sort((a,b)=>(standings[b.id]?.[key]||0)-(standings[a.id]?.[key]||0))[0];
            if (!winner) return null;
            return (
              <div key={key} className="cmprow">
                <span style={{fontSize:20}}>{icon}</span>
                <span style={{fontSize:11,color:'var(--text-muted)',width:90,flexShrink:0}}>{label}</span>
                <span style={{fontSize:18,flexShrink:0}}>{winner.avatar}</span>
                <span className="cmpn">{winner.name}</span>
                <span className="pill ppt">{standings[winner.id]?.[key]||0}</span>
              </div>
            );
          })}
        </>
      )}
    </>
  );

  // ── ROUND DETAIL ──────────────────────────────────────────────────────────
  const renderRoundDetail = round => {
    const roundBets = bets.filter(b => b.round_id === round.id);
    const awards = getRoundAwards(round, round.matches||[], players, roundBets);
    const roundStats = {};
    players.forEach(p => { roundStats[p.id] = {pts:0,exact:0,participated:false}; });
    (round.matches||[]).forEach(m => {
      if (!m.played) return;
      players.forEach(p => {
        const b = roundBets.find(b2 => b2.player_id===p.id && b2.match_id===m.id);
        if (!b) return;
        roundStats[p.id].participated = true;
        const pts = calcPoints(b, m);
        roundStats[p.id].pts += pts;
        if (pts>=4) roundStats[p.id].exact++;
      });
    });
    const sortedPlayers = [...players].sort((a,b) => roundStats[b.id].pts - roundStats[a.id].pts);

    return (
      <>
        <div className="dbk" onClick={() => setDetailRoundId(null)}>← Volver a jornadas</div>
        <div className="ct" style={{fontSize:22,marginBottom:4}}>{round.name}</div>
        <div style={{marginBottom:16,display:'flex',gap:8,flexWrap:'wrap'}}>
          {round.results_entered ? <span className="pill pdn">FINALIZADA</span> : <span className="pill po">EN CURSO</span>}
          <span style={{fontSize:12,color:'var(--text-muted)'}}>{(round.matches||[]).length} partidos</span>
        </div>

        <div className="sec">RESULTADOS</div>
        {(round.matches||[]).map(m => (
          <div key={m.id} className="mc" style={{marginBottom:8}}>
            <div className="mt">
              <div className="mte home"><div className="mfl">{flag(m.home_team)}</div><div className="mn">{m.home_team}</div></div>
              <div className="msb">
                {m.is_knockout && <div style={{fontSize:9,color:'var(--gold)',fontWeight:800,letterSpacing:1,textAlign:'center',marginBottom:2}}>🏆ELIM</div>}
                {m.played ? <div style={{textAlign:'center'}}><div className="ms">{m.home_score}<span style={{color:'var(--text-muted)',marginInline:2}}>·</span>{m.away_score}</div>{m.penalty_winner&&<div style={{fontSize:9,color:'var(--gold)',fontWeight:800,letterSpacing:0.5,marginTop:2}}>🥅 {flag(m.penalty_winner)}{m.penalty_winner}</div>}</div> : <div className="mvs">VS</div>}
              </div>
              <div className="mte away"><div className="mfl">{flag(m.away_team)}</div><div className="mn">{m.away_team}</div></div>
            </div>
          </div>
        ))}

        {awards && (
          <>
            <div className="sec" style={{marginTop:4}}>🎖️ PREMIOS</div>
            <div className="awr">
              <div className="awc mvp">
                <div className="awi">👑</div><div className="awl">MVP</div>
                <div className="awn">{awards.mvp.avatar} {awards.mvp.name}</div>
                <div className="awp">{awards.stats[awards.mvp.id]?.pts||0} pts</div>
              </div>
              <div className="awc wst">
                <div className="awi">🤦</div><div className="awl">Peor porra</div>
                <div className="awn">{awards.worst.avatar} {awards.worst.name}</div>
                <div className="awp">{awards.stats[awards.worst.id]?.pts||0} pts</div>
              </div>
            </div>
          </>
        )}

        {round.results_entered && (
          <>
            <div className="sec" style={{marginTop:4}}>📊 PORRAS DE TODOS</div>
            <div className="card" style={{padding:'12px 8px',overflowX:'auto'}}>
              <table className="bttbl" style={{minWidth:'100%'}}>
                <thead>
                  <tr>
                    <th style={{textAlign:'left'}}>Jugador</th>
                    {(round.matches||[]).map(m => <th key={m.id}>{flag(m.home_team)}{flag(m.away_team)}</th>)}
                    <th>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayers.map(p => {
                    const st = roundStats[p.id];
                    return (
                      <tr key={p.id}>
                        <td><div style={{display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap'}}><span>{p.avatar}</span><span style={{fontSize:13,fontWeight:600,maxWidth:70,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</span></div></td>
                        {(round.matches||[]).map(m => {
                          const b = roundBets.find(b2 => b2.player_id===p.id && b2.match_id===m.id);
                          const pts = b ? calcPoints(b, m) : null;
                          return (
                            <td key={m.id}>
                              {b ? (
                                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:1}}>
                                  <span className={`bts${pts>=6?' ex':pts===4?' ex':pts===2?' si':''}`}>{b.home_bet}-{b.away_bet}</span>
                                  {b.penalty_winner && <span style={{fontSize:8,color:'var(--gold)'}}>🥅{flag(b.penalty_winner)}</span>}
                                  {pts===6 && <span style={{fontSize:8,color:'var(--gold)',fontWeight:800}}>+6</span>}
                                </div>
                              ) : <span style={{color:'var(--text-muted)'}}>—</span>}
                            </td>
                          );
                        })}
                        <td><span className="pill ppt">{st?.pts||0}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{fontSize:11,color:'var(--text-muted)',textAlign:'center',marginBottom:12}}>🟡 Exacto +4 · 🟢 Signo +2 · 🏆 Signo+Pen +4 · Exacto+Pen +6</div>
          </>
        )}
      </>
    );
  };

  // ── ROUNDS ────────────────────────────────────────────────────────────────
  const renderRounds = () => {
    if (detailRoundId) {
      const round = rounds.find(r => r.id === detailRoundId);
      if (round) return renderRoundDetail(round);
      setDetailRoundId(null);
    }
    return (
      <>
        <div className="ct" style={{fontSize:22,marginBottom:16}}>📅 JORNADAS</div>
        {rounds.length === 0 && <div className="empty"><div className="ei">📅</div><p>Sin jornadas todavía.</p></div>}
        {[...rounds].reverse().map(r => {
          const myRoundBets = myBetsForRound(r.id);
          const open = isOpen(r);
          const awards = r.results_entered ? getRoundAwards(r, r.matches||[], players, bets.filter(b=>b.round_id===r.id)) : null;
          return (
            <div key={r.id} className="card">
              <div className="ch">
                <div className="ct">{r.name}</div>
                {r.results_entered ? <span className="pill pdn">FINAL</span> : open ? <span className="pill po">ABIERTA</span> : <span className="pill pcl">CERRADA</span>}
              </div>
              {open && <div style={{marginBottom:12}}><Countdown targetTime={new Date(r.start_time).getTime()}/></div>}
              {(r.matches||[]).map(m => {
                const b = myRoundBets.find(b2 => b2.match_id === m.id);
                const pts = b && m.played ? calcPoints(b, m) : null;
                return (
                  <div key={m.id} className="mc">
                    <div className="mt">
                      <div className="mte home"><div className="mfl">{flag(m.home_team)}</div><div className="mn">{m.home_team}</div></div>
                      <div className="msb">
                        {m.is_knockout && !m.played && <div style={{fontSize:8,color:'var(--gold)',fontWeight:800,letterSpacing:1,textAlign:'center',marginBottom:2}}>🏆ELIM</div>}
                        {m.played ? <div style={{textAlign:'center'}}>{m.is_knockout&&<div style={{fontSize:8,color:'var(--gold)',fontWeight:800,letterSpacing:1,marginBottom:2}}>🏆</div>}<div className="ms">{m.home_score}<span style={{color:'var(--text-muted)',marginInline:2}}>·</span>{m.away_score}</div>{m.penalty_winner&&<div style={{fontSize:9,color:'var(--gold)',fontWeight:800,marginTop:2}}>🥅{flag(m.penalty_winner)}</div>}</div> : <div className="mvs">VS</div>}
                      </div>
                      <div className="mte away"><div className="mfl">{flag(m.away_team)}</div><div className="mn">{m.away_team}</div></div>
                    </div>
                    {b && (
                      <div style={{marginTop:8,display:'flex',alignItems:'center',justifyContent:'center',gap:8,flexWrap:'wrap'}}>
                        <span style={{fontSize:11,color:'var(--text-muted)'}}>Mi porra:</span>
                        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:pts===6?'var(--gold)':pts===4?'var(--gold)':pts===2?'var(--lime)':'var(--text-dim)'}}>{b.home_bet} – {b.away_bet}</span>
                        {b.penalty_winner && <span style={{fontSize:11,color:'var(--gold)'}}>🥅 {flag(b.penalty_winner)}{b.penalty_winner}</span>}
                        {pts===6 && <span className="pill pe">🏆 EXACTO+PEN +6</span>}
                        {pts===4 && pts<6 && <span className="pill pe">🎯 EXACTO +4</span>}
                        {pts===2 && <span className="pill psi">✅ SIGNO +2</span>}
                        {pts===1 && <span className="pill pm">❌ FALLO +1</span>}
                      </div>
                    )}
                    {currentPlayer && !b && r.results_entered && <div style={{marginTop:6,textAlign:'center'}}><span className="pill pno">No participaste · 0 pts</span></div>}
                  </div>
                );
              })}
              {awards && (
                <>
                  <div className="dvd"/>
                  <div className="awr">
                    <div className="awc mvp"><div className="awi">👑</div><div className="awl">MVP</div><div className="awn">{awards.mvp.avatar} {awards.mvp.name}</div><div className="awp">{awards.stats[awards.mvp.id]?.pts||0} pts</div></div>
                    <div className="awc wst"><div className="awi">🤦</div><div className="awl">Peor porra</div><div className="awn">{awards.worst.avatar} {awards.worst.name}</div><div className="awp">{awards.stats[awards.worst.id]?.pts||0} pts</div></div>
                  </div>
                  <button className="btng" style={{width:'100%',marginBottom:4}} onClick={() => setDetailRoundId(r.id)}>Ver porras de todos →</button>
                </>
              )}
              {canBet(r) && <button className="btn" style={{marginTop:8}} onClick={() => { setSelectedRoundId(r.id); setBetDraft({}); setModal('bet'); }}>⚽ Hacer mi porra</button>}
              {currentPlayer && hasBet(r) && !r.results_entered && <div className="prsent">✅ Porra guardada — ¡Suerte!</div>}
            </div>
          );
        })}
      </>
    );
  };

  // ── PROFILE ───────────────────────────────────────────────────────────────
  const renderProfile = () => {
    if (!currentPlayer) return (
      <div className="empty" style={{marginTop:40}}>
        <div className="ei">👤</div><p>No estás registrado</p>
        <div style={{marginTop:16}}><button className="btn" onClick={() => setModal('register')}>⚽ Unirse</button></div>
      </div>
    );
    const st = standings[currentPlayer.id];
    const rank = sorted.findIndex(p => p.id === currentPlayer.id) + 1;
    const myHistory = st?.history || [];
    const avg = myHistory.length > 0 ? (myHistory.reduce((a,h)=>a+h.pts,0)/myHistory.length).toFixed(1) : '0';

    return (
      <>
        <div className="hero">
          <div style={{fontSize:56}}>{currentPlayer.avatar}</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:30,color:'var(--gold)',marginTop:4}}>{currentPlayer.name}</div>
          <div style={{color:'var(--text-dim)',fontSize:13}}>#{rank} de {players.length} jugadores</div>
        </div>
        <div className="sg">
          {[{l:'Puntos',v:st?.pts||0,i:'🏆'},{l:'Exactos',v:st?.exact||0,i:'🎯'},{l:'Signos',v:st?.sign||0,i:'✅'},
            {l:'MVPs',v:st?.mvps||0,i:'👑'},{l:'Avg/jorn',v:avg,i:'📊'},{l:'Particip.',v:`${st?.rounds||0}/${doneRounds.length}`,i:'📅'}].map(({l,v,i}) => (
            <div key={l} className="sbox"><div style={{fontSize:22}}>{i}</div><div className="snum">{v}</div><div className="slbl">{l}</div></div>
          ))}
        </div>
        {myHistory.length > 0 && (
          <>
            <div className="sec">EVOLUCIÓN</div>
            <div className="card" style={{padding:'12px 16px'}}>
              <div style={{display:'flex',alignItems:'flex-end',gap:6,height:60}}>
                {myHistory.map((h,i) => {
                  const maxH = Math.max(...myHistory.map(x=>x.pts), 1);
                  return (
                    <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                      <div style={{width:'100%',height:`${Math.max(8,(h.pts/maxH)*60)}px`,background:h.pts===Math.max(...myHistory.map(x=>x.pts))?'var(--gold)':'var(--pitch-light)',borderRadius:'4px 4px 0 0'}}/>
                      <div style={{fontSize:9,color:'var(--text-muted)',textAlign:'center'}}>{h.roundName.replace('Jornada ','J')}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
        <div className="sec">MIS PORRAS</div>
        {rounds.map(r => {
          const myRoundBets = myBetsForRound(r.id);
          const roundStats = standings[currentPlayer.id];
          const myPts = r.results_entered ? (myHistory.find(h=>h.roundName===r.name)?.pts ?? null) : null;
          return (
            <div key={r.id} className="card" style={{padding:'12px 14px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <span style={{fontWeight:700,fontSize:14}}>{r.name}</span>
                {r.results_entered && myPts !== null ? <span className="pill ppt">+{myPts} pts</span>
                  : myRoundBets.length > 0 ? <span className="pill pp">Enviada</span>
                  : <span className="pill pno">No participó</span>}
              </div>
              {myRoundBets.map(b => {
                const m = (r.matches||[]).find(m2 => m2.id === b.match_id);
                if (!m) return null;
                const pts = m.played ? calcPoints(b, m) : null;
                return (
                  <div key={b.id} style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,fontSize:13}}>
                    <span>{flag(m.home_team)}</span>
                    <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:pts>=4?'var(--gold)':pts===2?'var(--lime)':'var(--text-dim)'}}>{b.home_bet}–{b.away_bet}</span>
                    {b.penalty_winner && <span style={{fontSize:10,color:'var(--gold)'}}>🥅{flag(b.penalty_winner)}</span>}
                    <span>{flag(m.away_team)}</span>
                    <span style={{flex:1,fontSize:11,color:'var(--text-dim)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.home_team} vs {m.away_team}</span>
                    {pts===6 && <span className="pill pe" style={{fontSize:10}}>🏆+6</span>}
                    {pts===4 && pts<6 && <span className="pill pe" style={{fontSize:10}}>🎯+4</span>}
                    {pts===2 && <span className="pill psi" style={{fontSize:10}}>✅+2</span>}
                    {pts===1 && <span className="pill pm" style={{fontSize:10}}>❌+1</span>}
                  </div>
                );
              })}
            </div>
          );
        })}
        <button className="btnd" style={{width:'100%',marginTop:8}} onClick={() => { setCurrentPlayer(null); localStorage.removeItem('mundial_player'); showToast('Sesión cerrada'); }}>Cerrar sesión</button>
      </>
    );
  };

  // ── ADMIN SAVE BET ────────────────────────────────────────────────────────
  const handleSaveAdminBet = async () => {
    if (savingAdminBet) return;
    const round = rounds.find(r => r.id === adminBetRoundId);
    const player = players.find(p => p.id === adminBetPlayerId);
    if (!round || !player) return;
    const allFilled = (round.matches||[]).every(m => adminBetDraft[m.id]?.home !== undefined && adminBetDraft[m.id]?.away !== undefined);
    if (!allFilled) return showToast('Rellena todos los marcadores');
    setSavingAdminBet(true);
    const rows = round.matches.map(m => {
      const betH = adminBetDraft[m.id].home;
      const betA = adminBetDraft[m.id].away;
      const isDraw = betH === betA;
      const penWinner = (m.is_knockout && isDraw) ? (adminBetPenaltyDraft[m.id] || null) : null;
      return { player_id: player.id, round_id: round.id, match_id: m.id, home_bet: betH, away_bet: betA, penalty_winner: penWinner };
    });
    const matchIds = rows.map(r => r.match_id);
    const { error: delError } = await supabase.from('bets').delete().eq('player_id', player.id).eq('round_id', round.id).in('match_id', matchIds);
    if (delError) { setSavingAdminBet(false); return showToast('Error: ' + delError.message); }
    const { error } = await supabase.from('bets').insert(rows);
    if (error) { setSavingAdminBet(false); return showToast('Error: ' + error.message); }
    await loadAll(true);
    setSavingAdminBet(false);
    setAdminBetPlayerId(null);
    setAdminBetDraft({});
    setAdminBetPenaltyDraft({});
    showToast('✅ Porra de ' + player.name + ' guardada');
  };

  // ── ADMIN ─────────────────────────────────────────────────────────────────
  const renderAdmin = () => {
    if (!isAdmin) return (
      <div className="empty" style={{marginTop:40}}>
        <div className="ei">🔑</div><p>Accede con la contraseña de admin</p>
        <div style={{marginTop:16}}><button className="btn" onClick={() => setModal('adminlogin')}>Entrar como Admin</button></div>
      </div>
    );
    return (
      <>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <div className="ct" style={{fontSize:20}}>🔧 ADMIN</div>
          <div style={{display:'flex',gap:6}}>
            {refreshing && <div className="spinner"/>}
            <button className="btnd" onClick={() => { setIsAdmin(false); showToast('Admin desconectado'); }}>Salir</button>
          </div>
        </div>
        <div className="tabs">
          {[['rounds','📅 Jornadas'],['results','⚽ Resultados'],['bets','🖊️ Porras'],['players','👥 Jugadores']].map(([k,l]) => (
            <button key={k} className={`tab${adminTab===k?' active':''}`} onClick={() => setAdminTab(k)}>{l}</button>
          ))}
        </div>

        {adminTab === 'rounds' && (
          <>
            <div className="sec">CREAR JORNADA</div>
            <div className="adms">
              <div className="fg"><label className="fl">Nombre</label><input className="fi" placeholder="Jornada 1 · Fase de grupos" value={newRoundName} onChange={e=>setNewRoundName(e.target.value)}/></div>
              <div className="fg"><label className="fl">Inicio (cierre de porras)</label><input className="fi" type="datetime-local" value={newRoundTime} onChange={e=>setNewRoundTime(e.target.value)}/></div>
              <div className="sec" style={{fontSize:12}}>PARTIDOS ({newRoundMatches.length})</div>
              {newRoundMatches.map((m,i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,padding:'8px',background:'var(--surface3)',borderRadius:8}}>
                  <span style={{fontSize:18}}>{flag(m.home)}</span>
                  <span style={{fontSize:12,fontWeight:600,flex:1}}>{m.home}</span>
                  <span style={{color:'var(--text-muted)',fontSize:11,fontWeight:700}}>VS</span>
                  <span style={{fontSize:12,fontWeight:600,flex:1,textAlign:'right'}}>{m.away}</span>
                  <span style={{fontSize:18}}>{flag(m.away)}</span>
                  {m.is_knockout && <span style={{fontSize:10,background:'var(--gold-dim)',color:'var(--gold)',padding:'2px 6px',borderRadius:4,fontWeight:700}}>🏆</span>}
                  <button style={{width:24,height:24,borderRadius:'50%',border:'1px solid var(--red-border)',background:'var(--red-bg)',color:'#f87171',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setNewRoundMatches(newRoundMatches.filter((_,j)=>j!==i))}>×</button>
                </div>
              ))}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                <div><label className="fl" style={{fontSize:10}}>Local</label><select className="fs" value={newMatchHome} onChange={e=>setNewMatchHome(e.target.value)}>{ALL_COUNTRIES.map(c=><option key={c} value={c}>{flag(c)} {c}</option>)}</select></div>
                <div><label className="fl" style={{fontSize:10}}>Visitante</label><select className="fs" value={newMatchAway} onChange={e=>setNewMatchAway(e.target.value)}>{ALL_COUNTRIES.map(c=><option key={c} value={c}>{flag(c)} {c}</option>)}</select></div>
              </div>
              <label style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,cursor:'pointer',fontSize:13,color:'var(--text-dim)'}}>
                <input type="checkbox" checked={newMatchKnockout} onChange={e=>setNewMatchKnockout(e.target.checked)} style={{width:16,height:16,accentColor:'var(--gold)'}}/>
                <span>🏆 Eliminatoria <span style={{color:'var(--text-muted)',fontSize:11}}>(puede ir a penaltis si empate)</span></span>
              </label>
              <button className="btn2" style={{width:'100%',marginBottom:10}} onClick={() => { if(newMatchHome===newMatchAway) return showToast('Elige equipos distintos'); setNewRoundMatches([...newRoundMatches,{home:newMatchHome,away:newMatchAway,is_knockout:newMatchKnockout}]); setNewMatchKnockout(false); }}>+ Añadir partido</button>
              <button className="btn" onClick={handleAddRound}>✅ Crear jornada</button>
            </div>
            <div className="sec">JORNADAS</div>
            {rounds.map(r => (
              <div key={r.id} className="adms">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <span style={{fontWeight:700}}>{r.name}</span>
                  {r.results_entered?<span className="pill pdn">FINAL</span>:isOpen(r)?<span className="pill po">ABIERTA</span>:<span className="pill pcl">CERRADA</span>}
                </div>
                <div style={{fontSize:12,color:'var(--text-dim)',marginBottom:8}}>
                  {new Date(r.start_time).toLocaleString('es-ES',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}
                  {' · '}{(r.matches||[]).length} partidos
                  {' · '}{players.filter(p=>bets.some(b=>b.player_id===p.id&&b.round_id===r.id)).length}/{players.length} porras
                </div>
                {(r.matches||[]).map(m => (
                  <div key={m.id} style={{fontSize:12,padding:'3px 0',display:'flex',alignItems:'center',gap:6,color:'var(--text-dim)'}}>
                    {flag(m.home_team)} {m.home_team} vs {m.away_team} {flag(m.away_team)}
                    {m.played && <span className="pill ppt" style={{fontSize:10}}>{m.home_score}–{m.away_score}</span>}
                  </div>
                ))}
                <div style={{display:'flex',gap:6,marginTop:10}}>
                  {!r.results_entered && (
                    <button className="btn2" style={{flex:1,padding:'8px'}} onClick={() => {
                      const draft = {};
                      (r.matches||[]).forEach(m => { draft[m.id] = {home:m.home_score||0, away:m.away_score||0}; });
                      setResultsDraft(draft); setAdminTab('results');
                    }}>⚽ Resultados</button>
                  )}
                  <button className="btnd" style={{flex:1,padding:'8px'}} onClick={() => handleDeleteRound(r)}>Eliminar</button>
                </div>
              </div>
            ))}
          </>
        )}

        {adminTab === 'results' && (
          <>
            <div className="sec">INTRODUCIR RESULTADOS</div>
            {rounds.filter(r=>!r.results_entered).length===0 && <div className="empty"><div className="ei">✅</div><p>Todas las jornadas tienen resultados</p></div>}
            {rounds.filter(r=>!r.results_entered).map(r => (
              <div key={r.id} className="adms">
                <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>
                  {r.name} <span style={{fontSize:11,color:'var(--text-dim)'}}>{players.filter(p=>bets.some(b=>b.player_id===p.id&&b.round_id===r.id)).length} porras</span>
                </div>
                {(r.matches||[]).map(m => {
                  const dr = resultsDraft[m.id] || {home:0,away:0};
                  const setDr = (side,val) => setResultsDraft({...resultsDraft,[m.id]:{...dr,[side]:Math.max(0,val)}});
                  const setDrPenalty = (team) => setResultsDraft({...resultsDraft,[m.id]:{...dr,penalty_winner:team}});
                  const drIsDraw = (dr.home||0) === (dr.away||0);
                  const showAdminPenalty = m.is_knockout && drIsDraw;
                  return (
                    <div key={m.id} style={{marginBottom:14,padding:'12px',background:'var(--surface3)',borderRadius:8}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                        <div style={{display:'flex',alignItems:'center',gap:6,fontSize:13,fontWeight:600}}><span style={{fontSize:24}}>{flag(m.home_team)}</span>{m.home_team}</div>
                        <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                          <span style={{color:'var(--text-muted)',fontWeight:700}}>VS</span>
                          {m.is_knockout && <span style={{fontSize:9,color:'var(--gold)',fontWeight:800,letterSpacing:1}}>🏆ELIM</span>}
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:6,fontSize:13,fontWeight:600}}>{m.away_team}<span style={{fontSize:24}}>{flag(m.away_team)}</span></div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12}}>
                        <div className="stpr">
                          <button className="stb" onClick={()=>setDr('home',(dr.home||0)-1)}>−</button>
                          <span className="stv">{dr.home||0}</span>
                          <button className="stb" onClick={()=>setDr('home',(dr.home||0)+1)}>+</button>
                        </div>
                        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:'var(--text-muted)'}}>–</span>
                        <div className="stpr">
                          <button className="stb" onClick={()=>setDr('away',(dr.away||0)-1)}>−</button>
                          <span className="stv">{dr.away||0}</span>
                          <button className="stb" onClick={()=>setDr('away',(dr.away||0)+1)}>+</button>
                        </div>
                      </div>
                      {showAdminPenalty && (
                        <div style={{marginTop:10,padding:'10px',background:'rgba(245,197,24,0.08)',borderRadius:8,border:'1px solid var(--gold-dim)'}}>
                          <div style={{fontSize:10,fontWeight:800,letterSpacing:1,color:'var(--gold)',marginBottom:8,textAlign:'center'}}>🥅 GANADOR EN PENALTIS</div>
                          <div style={{display:'flex',gap:8}}>
                            <button onClick={()=>setDrPenalty(m.home_team)} style={{flex:1,padding:'7px 4px',borderRadius:8,border:`2px solid ${dr.penalty_winner===m.home_team?'var(--gold)':'var(--border)'}`,background:dr.penalty_winner===m.home_team?'rgba(245,197,24,0.15)':'var(--surface2)',color:dr.penalty_winner===m.home_team?'var(--gold)':'var(--text-dim)',cursor:'pointer',fontSize:11,fontWeight:700}}>
                              {flag(m.home_team)} {m.home_team}
                            </button>
                            <button onClick={()=>setDrPenalty(m.away_team)} style={{flex:1,padding:'7px 4px',borderRadius:8,border:`2px solid ${dr.penalty_winner===m.away_team?'var(--gold)':'var(--border)'}`,background:dr.penalty_winner===m.away_team?'rgba(245,197,24,0.15)':'var(--surface2)',color:dr.penalty_winner===m.away_team?'var(--gold)':'var(--text-dim)',cursor:'pointer',fontSize:11,fontWeight:700}}>
                              {flag(m.away_team)} {m.away_team}
                            </button>
                          </div>
                        </div>
                      )}
                      <div style={{marginTop:10,borderTop:'1px solid var(--border)',paddingTop:8}}>
                        <div style={{fontSize:10,color:'var(--text-muted)',marginBottom:6,fontWeight:700,letterSpacing:1}}>PREVIEW PUNTOS</div>
                        {players.filter(p=>bets.some(b=>b.player_id===p.id&&b.match_id===m.id)).map(p => {
                          const b = bets.find(b2=>b2.player_id===p.id&&b2.match_id===m.id);
                          const fakeMatch = {home_score:dr.home||0,away_score:dr.away||0,is_knockout:m.is_knockout,penalty_winner:showAdminPenalty?dr.penalty_winner:null};
                          const pts = calcPoints(b, fakeMatch);
                          const bd = calcPointsBreakdown(b, fakeMatch);
                          return (
                            <div key={p.id} style={{display:'flex',alignItems:'center',gap:6,marginBottom:3,fontSize:12}}>
                              <span>{p.avatar}</span>
                              <span style={{flex:1,fontWeight:600}}>{p.name}</span>
                              <span style={{color:'var(--text-dim)'}}>{b.home_bet}–{b.away_bet}{b.penalty_winner?<span style={{color:'var(--gold)',fontSize:10}}> 🥅{flag(b.penalty_winner)}</span>:null}</span>
                              {pts===6&&<span className="pill pe" style={{fontSize:10}}>🏆+6</span>}
                              {pts===4&&pts<6&&<span className="pill pe" style={{fontSize:10}}>🎯+4</span>}
                              {pts===2&&<span className="pill psi" style={{fontSize:10}}>✅+2</span>}
                              {pts===1&&<span className="pill pm" style={{fontSize:10}}>❌+1</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <button className="btn" onClick={() => handleEnterResults(r.id)}>🏆 Guardar resultados de {r.name}</button>
              </div>
            ))}
          </>
        )}

        {adminTab === 'bets' && (() => {
          const round = adminBetRoundId ? rounds.find(r => r.id === adminBetRoundId) : null;
          const player = adminBetPlayerId ? players.find(p => p.id === adminBetPlayerId) : null;
          return (
            <>
              <div className="sec">SELECCIONA JORNADA</div>
              <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:16}}>
                {rounds.map(r => (
                  <button key={r.id} onClick={() => { setAdminBetRoundId(r.id); setAdminBetPlayerId(null); setAdminBetDraft({}); setAdminBetPenaltyDraft({}); }}
                    style={{padding:'10px 14px',borderRadius:8,border:`2px solid ${adminBetRoundId===r.id?'var(--gold)':'var(--border)'}`,background:adminBetRoundId===r.id?'rgba(245,197,24,.1)':'var(--surface3)',color:adminBetRoundId===r.id?'var(--gold)':'var(--text)',cursor:'pointer',textAlign:'left',fontWeight:600,fontSize:13}}>
                    {r.name} {r.closed&&<span style={{fontSize:10,color:'var(--text-muted)'}}>· cerrada</span>}
                  </button>
                ))}
              </div>
              {round && (<>
                <div className="sec">SELECCIONA JUGADOR</div>
                <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:16}}>
                  {players.map(p => {
                    const hasBet = bets.some(b => b.player_id===p.id && b.round_id===round.id);
                    return (
                      <button key={p.id} onClick={() => {
                        setAdminBetPlayerId(p.id);
                        // Pre-fill with existing bet if any
                        const draft = {};
                        const penDraft = {};
                        round.matches.forEach(m => {
                          const b = bets.find(b2 => b2.player_id===p.id && b2.match_id===m.id);
                          if (b) { draft[m.id] = {home:b.home_bet, away:b.away_bet}; if(b.penalty_winner) penDraft[m.id]=b.penalty_winner; }
                          else { draft[m.id] = {home:0, away:0}; }
                        });
                        setAdminBetDraft(draft);
                        setAdminBetPenaltyDraft(penDraft);
                      }}
                        style={{padding:'10px 14px',borderRadius:8,border:`2px solid ${adminBetPlayerId===p.id?'var(--gold)':'var(--border)'}`,background:adminBetPlayerId===p.id?'rgba(245,197,24,.1)':'var(--surface3)',color:adminBetPlayerId===p.id?'var(--gold)':'var(--text)',cursor:'pointer',textAlign:'left',display:'flex',alignItems:'center',gap:10}}>
                        <span style={{fontSize:22}}>{p.avatar}</span>
                        <span style={{fontWeight:700,flex:1}}>{p.name}</span>
                        {hasBet ? <span style={{fontSize:10,color:'var(--lime)',fontWeight:700}}>✅ Ya tiene porra</span> : <span style={{fontSize:10,color:'var(--text-muted)'}}>Sin porra</span>}
                      </button>
                    );
                  })}
                </div>
              </>)}
              {round && player && (<>
                <div className="sec" style={{color:'var(--gold)'}}>✏️ EDITANDO PORRA DE {player.name.toUpperCase()}</div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:12,padding:'8px 12px',background:'var(--surface2)',borderRadius:8}}>
                  Jornada: <b style={{color:'var(--text)'}}>{round.name}</b> {round.closed && <span style={{color:'#f87171'}}>· Jornada cerrada (edición manual de admin)</span>}
                </div>
                {round.matches.map(m => {
                  const hVal = adminBetDraft[m.id]?.home;
                  const aVal = adminBetDraft[m.id]?.away;
                  const setScore = (side, val) => setAdminBetDraft(prev => ({...prev, [m.id]: {...(prev[m.id]||{}), [side]: Math.max(0,val)}}));
                  const isDraw = hVal !== undefined && aVal !== undefined && hVal === aVal;
                  const showPenalty = m.is_knockout && isDraw;
                  const selPenalty = adminBetPenaltyDraft[m.id];
                  // Preview points if match played
                  const pts = m.played ? calcPoints({home_bet:hVal||0,away_bet:aVal||0,penalty_winner:selPenalty||null}, m) : null;
                  return (
                    <div key={m.id} className="mc" style={{marginBottom:10}}>
                      <div className="mt">
                        <div className="mte home"><div className="mfl">{flag(m.home_team)}</div><div className="mn">{m.home_team}</div></div>
                        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                          {m.played ? <div className="ms" style={{fontSize:16}}>{m.home_score}·{m.away_score}</div> : <div className="mvs">VS</div>}
                          {pts!==null && <span style={{fontSize:10,fontWeight:800,color:pts>=4?'var(--gold)':pts===2?'var(--lime)':'#f87171'}}>{pts>=6?'🏆':pts>=4?'🎯':pts===2?'✅':'❌'}+{pts}</span>}
                        </div>
                        <div className="mte away"><div className="mfl">{flag(m.away_team)}</div><div className="mn">{m.away_team}</div></div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:16,marginTop:12,paddingTop:12,borderTop:'1px solid var(--border)'}}>
                        <div className="stpr">
                          <button className="stb" onClick={()=>setScore('home',(hVal||0)-1)}>−</button>
                          <span className="stv">{hVal!==undefined?hVal:0}</span>
                          <button className="stb" onClick={()=>setScore('home',(hVal||0)+1)}>+</button>
                        </div>
                        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:'var(--text-muted)'}}>–</span>
                        <div className="stpr">
                          <button className="stb" onClick={()=>setScore('away',(aVal||0)-1)}>−</button>
                          <span className="stv">{aVal!==undefined?aVal:0}</span>
                          <button className="stb" onClick={()=>setScore('away',(aVal||0)+1)}>+</button>
                        </div>
                      </div>
                      {showPenalty && (
                        <div style={{marginTop:10,padding:'10px',background:'rgba(245,197,24,0.08)',borderRadius:8,border:'1px solid var(--gold-dim)'}}>
                          <div style={{fontSize:10,fontWeight:800,letterSpacing:1,color:'var(--gold)',marginBottom:8,textAlign:'center'}}>🥅 ¿QUIÉN GANA EN PENALTIS?</div>
                          <div style={{display:'flex',gap:8}}>
                            <button onClick={()=>setAdminBetPenaltyDraft(p=>({...p,[m.id]:m.home_team}))} style={{flex:1,padding:'7px 4px',borderRadius:8,border:`2px solid ${selPenalty===m.home_team?'var(--gold)':'var(--border)'}`,background:selPenalty===m.home_team?'rgba(245,197,24,0.15)':'var(--surface2)',color:selPenalty===m.home_team?'var(--gold)':'var(--text-dim)',cursor:'pointer',fontSize:11,fontWeight:700}}>
                              {flag(m.home_team)} {m.home_team}
                            </button>
                            <button onClick={()=>setAdminBetPenaltyDraft(p=>({...p,[m.id]:m.away_team}))} style={{flex:1,padding:'7px 4px',borderRadius:8,border:`2px solid ${selPenalty===m.away_team?'var(--gold)':'var(--border)'}`,background:selPenalty===m.away_team?'rgba(245,197,24,0.15)':'var(--surface2)',color:selPenalty===m.away_team?'var(--gold)':'var(--text-dim)',cursor:'pointer',fontSize:11,fontWeight:700}}>
                              {flag(m.away_team)} {m.away_team}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <button className="btn" style={{width:'100%',marginTop:4}} onClick={handleSaveAdminBet} disabled={savingAdminBet}>
                  {savingAdminBet ? 'Guardando...' : `✅ Guardar porra de ${player.name}`}
                </button>
              </>)}
              {rounds.length===0 && <div className="empty"><div className="ei">📅</div><p>No hay jornadas</p></div>}
            </>
          );
        })()}

        {adminTab === 'players' && (
          <>
            <button className="btnd" style={{width:'100%',padding:'12px',borderRadius:8,marginBottom:12,fontWeight:700}} onClick={handleResetAll}>♻️ Reiniciar juego completo</button>
            <div className="sec">JUGADORES ({players.length})</div>
            {players.length === 0 && <div className="empty"><div className="ei">👥</div><p>Sin jugadores</p></div>}
            {sorted.map((p,i) => (
              <div key={p.id} className="cmprow">
                <span style={{fontSize:11,color:'var(--text-muted)',width:20,flexShrink:0}}>#{i+1}</span>
                <span style={{fontSize:22,flexShrink:0}}>{p.avatar}</span>
                <span className="cmpn">{p.name}</span>
                <span className="pill ppt">{standings[p.id]?.pts||0} pts</span>
                <button className="btnd" style={{padding:'4px 8px',fontSize:11}} onClick={() => handleDeletePlayer(p)}>×</button>
              </div>
            ))}
          </>
        )}
      </>
    );
  };

  // ── BET MODAL ─────────────────────────────────────────────────────────────
  const renderBetModal = () => {
    const round = rounds.find(r => r.id === selectedRoundId);
    if (!round) return null;
    const allFilled = (round.matches||[]).every(m => betDraft[m.id] && betDraft[m.id].home !== undefined && betDraft[m.id].away !== undefined);
    const setScore = (matchId, side, val) => setBetDraft({...betDraft, [matchId]: {...(betDraft[matchId]||{}), [side]: Math.max(0,val)}});
    const setPenalty = (matchId, team) => setPenaltyDraft(prev => ({...prev, [matchId]: team}));
    const hasKnockout = (round.matches||[]).some(m => m.is_knockout);
    return (
      <div className="ov" onClick={e => e.target===e.currentTarget && setModal(null)}>
        <div className="modal">
          <div className="mhdl"/>
          <div className="mtit">⚽ {round.name} — Tu porra</div>
          <div style={{fontSize:12,color:'var(--text-dim)',marginBottom:10}}>Cierra: {new Date(round.start_time).toLocaleString('es-ES',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
          <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:14,background:'var(--surface2)',padding:'8px 12px',borderRadius:8}}>
            🎯 Exacto +4 · ✅ Signo 1X2 +2 · Participas +1
            {hasKnockout && <span> · 🏆 Signo+Penaltis +4 · Exacto+Penaltis +6</span>}
          </div>
          {(round.matches||[]).map(m => {
            const hVal = betDraft[m.id]?.home;
            const aVal = betDraft[m.id]?.away;
            const isDraw = hVal !== undefined && aVal !== undefined && hVal === aVal;
            const showPenalty = m.is_knockout && isDraw;
            const selPenalty = penaltyDraft[m.id];
            return (
              <div key={m.id} className="mc" style={{marginBottom:10}}>
                <div className="mt">
                  <div className="mte home"><div className="mfl">{flag(m.home_team)}</div><div className="mn">{m.home_team}</div></div>
                  {m.is_knockout ? <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}><div className="mvs">VS</div><span style={{fontSize:9,color:'var(--gold)',fontWeight:800,letterSpacing:1}}>🏆ELIM</span></div> : <div className="mvs">VS</div>}
                  <div className="mte away"><div className="mfl">{flag(m.away_team)}</div><div className="mn">{m.away_team}</div></div>
                </div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:16,marginTop:12,paddingTop:12,borderTop:'1px solid var(--border)'}}>
                  <div className="stpr">
                    <button className="stb" onClick={()=>setScore(m.id,'home',(hVal||0)-1)}>−</button>
                    <span className="stv" style={{minWidth:32,textAlign:'center'}}>{hVal !== undefined ? hVal : <span style={{color:'var(--text-muted)'}}>—</span>}</span>
                    <button className="stb" onClick={()=>setScore(m.id,'home',(hVal||0)+1)}>+</button>
                  </div>
                  <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:'var(--text-muted)'}}>–</span>
                  <div className="stpr">
                    <button className="stb" onClick={()=>setScore(m.id,'away',(aVal||0)-1)}>−</button>
                    <span className="stv" style={{minWidth:32,textAlign:'center'}}>{aVal !== undefined ? aVal : <span style={{color:'var(--text-muted)'}}>—</span>}</span>
                    <button className="stb" onClick={()=>setScore(m.id,'away',(aVal||0)+1)}>+</button>
                  </div>
                </div>
                {showPenalty && (
                  <div style={{marginTop:10,padding:'10px',background:'rgba(245,197,24,0.08)',borderRadius:8,border:'1px solid var(--gold-dim)'}}>
                    <div style={{fontSize:10,fontWeight:800,letterSpacing:1,color:'var(--gold)',marginBottom:8,textAlign:'center'}}>🥅 ¿QUIÉN GANA EN PENALTIS?</div>
                    <div style={{display:'flex',gap:8}}>
                      <button onClick={()=>setPenalty(m.id, m.home_team)} style={{flex:1,padding:'8px 4px',borderRadius:8,border:`2px solid ${selPenalty===m.home_team?'var(--gold)':'var(--border)'}`,background:selPenalty===m.home_team?'rgba(245,197,24,0.15)':'var(--surface3)',color:selPenalty===m.home_team?'var(--gold)':'var(--text-dim)',cursor:'pointer',fontSize:12,fontWeight:700,transition:'all .15s'}}>
                        {flag(m.home_team)} {m.home_team}
                      </button>
                      <button onClick={()=>setPenalty(m.id, m.away_team)} style={{flex:1,padding:'8px 4px',borderRadius:8,border:`2px solid ${selPenalty===m.away_team?'var(--gold)':'var(--border)'}`,background:selPenalty===m.away_team?'rgba(245,197,24,0.15)':'var(--surface3)',color:selPenalty===m.away_team?'var(--gold)':'var(--text-dim)',cursor:'pointer',fontSize:12,fontWeight:700,transition:'all .15s'}}>
                        {flag(m.away_team)} {m.away_team}
                      </button>
                    </div>
                    {!selPenalty && <div style={{fontSize:10,color:'var(--text-muted)',marginTop:6,textAlign:'center'}}>Opcional — +2 pts si aciertas</div>}
                  </div>
                )}
              </div>
            );
          })}
          <div style={{display:'flex',gap:8,marginTop:4}}>
            <button className="btn2" style={{flexShrink:0}} onClick={()=>setModal(null)}>Cancelar</button>
            <button className="btn" onClick={handleSaveBet} disabled={!allFilled || savingBet}>
            {savingBet ? 'Guardando...' : allFilled ? '✅ Guardar porra' : 'Rellena todos'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <Confetti active={confetti}/>
      {toastMsg && <div className="toast">{toastMsg}</div>}

      <div className="app">
        <div className="topbar">
          <div className="logo">MUNDIAL<span> PORRAS</span> 🏆</div>
          <div className="topbar-r">
            {refreshing && <div className="spinner"/>}
            {!currentPlayer && <button className="btn-icon" onClick={()=>setModal('register')}>👤</button>}
            {currentPlayer && <div style={{fontSize:22,cursor:'pointer'}} onClick={()=>setTab('profile')}>{currentPlayer.avatar}</div>}
            <button className={`btn-icon${isAdmin?' on':''}`} onClick={()=>isAdmin?setTab('admin'):setModal('adminlogin')}>{isAdmin?'🔧':'🔑'}</button>
          </div>
        </div>

        <div className="scroll">
          {tab==='home' && renderHome()}
          {tab==='rounds' && renderRounds()}
          {tab==='standings' && renderStandings()}
          {tab==='profile' && renderProfile()}
          {tab==='admin' && renderAdmin()}
        </div>

        <nav className="bottom-nav">
          {[{id:'home',icon:'🏠',lbl:'Inicio'},{id:'rounds',icon:'📅',lbl:'Jornadas'},{id:'standings',icon:'🏆',lbl:'Tabla'},{id:'profile',icon:'👤',lbl:'Perfil'}].map(n => (
            <button key={n.id} className={`nav-item${tab===n.id?' active':''}`} onClick={()=>{setTab(n.id);if(n.id!=='rounds')setDetailRoundId(null)}}>
              <span className="nav-icon">{n.icon}</span>{n.lbl}
            </button>
          ))}
        </nav>
      </div>

{modal==='register' && (
  <div className="ov" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
    <div className="modal">
      <div className="mhdl"/>
      <div className="mtit">⚽ Entrar al mundial</div>

      <div className="fg">
        <label className="fl">Tu nombre</label>
        <input
          className="fi"
          placeholder="¿Cómo te llamas?"
          value={newPlayer.name}
          onChange={e=>setNewPlayer({...newPlayer,name:e.target.value})}
          onKeyDown={e=>e.key==='Enter'&&handleRegister()}
        />
      </div>

      <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:12}}>
        Si ya participabas, recuperarás automáticamente tu perfil.
        Si es tu primera vez, se creará uno nuevo.
      </div>

      <button className="btn" onClick={handleRegister}>
        🚀 Continuar
      </button>
    </div>
  </div>
)}

      {modal==='adminlogin' && (
        <div className="ov" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal">
            <div className="mhdl"/>
            <div className="mtit">🔑 Acceso Admin</div>
            <div className="fg"><label className="fl">Contraseña</label><input className="fi" type="password" placeholder="••••••••" value={adminPass} onChange={e=>setAdminPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAdminLogin()}/></div>
            <button className="btn" onClick={handleAdminLogin}>Entrar</button>
          </div>
        </div>
      )}

      {modal==='bet' && renderBetModal()}
    </>
  );
}