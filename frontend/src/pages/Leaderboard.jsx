import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSound from '../hooks/useSound';
import './Leaderboard.css';

const INITIAL_SHOW = 5;
const LOAD_MORE    = 5;

/* ── Animated score counter ── */
function CountUp({ target, duration = 1100, delay = 0 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let start = null;
      const step = ts => {
        if (!start) start = ts;
        const p    = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        setVal(Math.round(ease * target));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(t);
  }, [target, duration, delay]);
  return <>{val}</>;
}

const TIERS      = ['gold', 'cyan', 'magenta'];
const MEDALS     = ['🥇', '🥈', '🥉'];
const RANK_LABEL = ['CHAMPION', 'RUNNER·UP', '#3'];

export default function Leaderboard() {
  const [entries,      setEntries]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [visibleCount, setVisibleCount] = useState(INITIAL_SHOW);
  const [activeRow,    setActiveRow]    = useState(0);
  const [revealed,     setRevealed]     = useState(false);
  const navigate = useNavigate();

  const { play: playClick } = useSound('/sounds/click.mp3', { volume: 0.6 });
  const { play: playHover } = useSound('/sounds/hover.mp3', { volume: 0.4 });

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => { setEntries(data); setLoading(false); setTimeout(() => setRevealed(true), 60); })
      .catch(() => { setLoading(false); setRevealed(true); });
  }, []);

  useEffect(() => {
    const len = Math.max(0, Math.min(entries.length, visibleCount) - 3);
    if (!len) return;
    const iv = setInterval(() => setActiveRow(p => (p + 1) % len), 2100);
    return () => clearInterval(iv);
  }, [entries.length, visibleCount]);

  const getResult = r => {
    if (r === 'win')  return { label: 'VICTORY', cls: 'hf-win' };
    if (r === 'loss') return { label: 'DEFEAT',  cls: 'hf-loss' };
    return                  { label: 'DRAW',     cls: 'hf-tie' };
  };

  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  const visible = entries.slice(0, visibleCount);
  const hasMore = visibleCount < entries.length;
  const remain  = entries.length - visibleCount;

  return (
    <div className="page-wrapper">
      <div className="hf-shell">



        {/* Corner brackets */}
        <span className="hf-corner hf-corner--tl" />
        <span className="hf-corner hf-corner--tr" />
        <span className="hf-corner hf-corner--bl" />
        <span className="hf-corner hf-corner--br" />

        {/* Vertical side strips */}
        <div className="hf-strip hf-strip--l">ARENA·SECTOR·7·ENCRYPTED·AEP·COMMAND·UPLINK·LIVE·</div>
        <div className="hf-strip hf-strip--r">NEURAL·LINK·COMBAT·RECORDS·GLOBAL·STANDINGS·CLASSIFIED·</div>

        {/* ── HEADER ── */}
        <header className={`hf-header${revealed ? ' hf-header--in' : ''}`}>

          <div className="hf-header__eyebrow">
            <span className="hf-header__dot" />
            <span className="hf-header__tag">GLOBAL STANDINGS</span>
            {entries.length > 0 && <span className="hf-header__count">// {entries.length} RECORDS</span>}
          </div>

          {/* Spectrum rainbow bar */}
          <div className="hf-spectrum" />

          {/* Title with chromatic split */}
          <div className="hf-title-wrap">
            <div className="hf-title-ghost hf-title-ghost--c">HALL OF FAME</div>
            <div className="hf-title-ghost hf-title-ghost--m">HALL OF FAME</div>
            <h1 className="hf-title">HALL <em>OF</em> FAME</h1>
          </div>

          <p className="hf-header__sub">NEURAL LINK // COMBAT RECORDS // CLASSIFIED</p>

          <div className="hf-header__rule">
            <span className="hf-header__rule-line" />
            <span className="hf-header__rule-glyph">◆</span>
            <span className="hf-header__rule-line" />
          </div>

        </header>

        {/* ── CONTENT ── */}
        <main className="hf-body">

          {loading && (
            <div className="hf-loading">
              <div className="hf-loading__rig">
                <div className="hf-loading__ring" style={{ '--sz':'72px','--clr':'var(--hf-cyan)',   '--dur':'2s' }} />
                <div className="hf-loading__ring" style={{ '--sz':'54px','--clr':'var(--hf-magenta)','--dur':'2.6s','--rev':'1' }} />
                <div className="hf-loading__ring" style={{ '--sz':'38px','--clr':'var(--hf-gold)',   '--dur':'1.8s' }} />
                <div className="hf-loading__core" />
              </div>
              <p className="hf-loading__label">SYNCING COMBAT DATA...</p>
            </div>
          )}

          {!loading && entries.length === 0 && (
            <div className="hf-empty">
              <div className="hf-empty__glyph">◎</div>
              <p className="hf-empty__text">NO NEURAL LINKS ESTABLISHED YET</p>
              <button className="hf-btn hf-btn--primary"
                onClick={() => { playClick(); navigate('/categories'); }}
                onMouseEnter={playHover}>⚔ INITIALIZE PROTOCOL</button>
            </div>
          )}

          {!loading && entries.length > 0 && (<>

            {/* TOP 3 CARDS */}
            <div className="hf-podium">
              {visible.slice(0, 3).map((e, i) => {
                const tier = TIERS[i];
                const res  = getResult(e.result);
                return (
                  <div key={e.id}
                    className={`hf-card hf-card--${tier}${revealed ? ' hf-card--in' : ''}`}
                    style={{ '--delay': `${i * 0.13}s` }}
                    onMouseEnter={playHover}>

                    {/* Animated border */}
                    <div className="hf-card__border" />
                    {/* Top glow bar */}
                    <div className="hf-card__topglow" />
                    {/* Big rank watermark */}
                    <div className="hf-card__wm">{String(i + 1).padStart(2, '0')}</div>

                    {/* Rank badge */}
                    <div className="hf-card__badge">
                      <span className="hf-card__medal">{MEDALS[i]}</span>
                      <span className="hf-card__rank-lbl">{RANK_LABEL[i]}</span>
                    </div>

                    {/* Name */}
                    <div className="hf-card__name">{e.player}</div>

                    {/* Score */}
                    <div className="hf-card__score-area">
                      <div className="hf-card__score">
                        <CountUp target={e.score} duration={800 + i * 180} delay={300 + i * 130} />
                      </div>
                      <div className="hf-card__pts">POINTS</div>
                    </div>

                    <div className="hf-card__sep" />

                    {/* Meta */}
                    <div className="hf-card__meta">
                      <div className="hf-card__meta-pair">
                        <span className="hf-card__meta-k">STATUS</span>
                        <span className={`hf-result ${res.cls}`}>{res.label}</span>
                      </div>
                      <div className="hf-card__meta-pair">
                        <span className="hf-card__meta-k">SECTOR</span>
                        <span className="hf-card__meta-v">{e.category?.toUpperCase() || 'CORE'}</span>
                      </div>
                    </div>

                    <div className="hf-card__foot">vs {e.opponent} · {fmt(e.date)}</div>

                    {/* Corner ticks */}
                    <span className="hf-ck hf-ck--tl" /><span className="hf-ck hf-ck--tr" />
                    <span className="hf-ck hf-ck--bl" /><span className="hf-ck hf-ck--br" />
                  </div>
                );
              })}
            </div>

            {/* HUD TABLE — rank 4+ */}
            {visible.length > 3 && (
              <div className={`hf-table${revealed ? ' hf-table--in' : ''}`}>
                <div className="hf-table__head">
                  <div className="hf-th" style={{ '--w': '52px' }}>RNK</div>
                  <div className="hf-th" style={{ '--w': '1fr' }}>OPERATIVE</div>
                  <div className="hf-th hf-th--hide-sm" style={{ '--w': '110px' }}>SECTOR</div>
                  <div className="hf-th hf-th--hide-md" style={{ '--w': '140px' }}>OPPONENT</div>
                  <div className="hf-th" style={{ '--w': '90px' }}>STATUS</div>
                  <div className="hf-th" style={{ '--w': '80px' }}>PTS</div>
                </div>

                {visible.slice(3).map((e, idx) => {
                  const i   = idx + 3;
                  const res = getResult(e.result);
                  const lit = activeRow === idx;
                  return (
                    <div key={e.id}
                      className={`hf-row${lit ? ' hf-row--lit' : ''}`}
                      style={{ '--delay': `${idx * 0.045}s` }}
                      onMouseEnter={() => { setActiveRow(idx); playHover(); }}>
                      <div className="hf-row__bar" />
                      <div className="hf-row__scan" />

                      <div className="hf-td" style={{ '--w': '52px' }}>
                        <span className="hf-row__num">#{i + 1}</span>
                      </div>
                      <div className="hf-td" style={{ '--w': '1fr' }}>
                        <span className="hf-row__name">{e.player}</span>
                      </div>
                      <div className="hf-td hf-td--hide-sm" style={{ '--w': '110px' }}>
                        <span className="hf-row__cat">{e.category?.toUpperCase() || 'CORE'}</span>
                      </div>
                      <div className="hf-td hf-td--hide-md" style={{ '--w': '140px' }}>
                        <span className="hf-row__vs">vs {e.opponent}</span>
                      </div>
                      <div className="hf-td" style={{ '--w': '90px' }}>
                        <span className={`hf-result hf-result--sm ${res.cls}`}>{res.label}</span>
                      </div>
                      <div className="hf-td hf-td--score" style={{ '--w': '80px' }}>
                        <span className="hf-row__score">{e.score}</span>
                        <span className="hf-row__pts">PTS</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Load more */}
            {hasMore && (
              <button className="hf-more"
                onClick={() => { playClick(); setVisibleCount(p => p + LOAD_MORE); }}
                onMouseEnter={playHover}>
                <span className="hf-more__arrow">↓</span>
                <span className="hf-more__lbl">DECRYPT {Math.min(remain, LOAD_MORE)} MORE RECORDS</span>
                <span className="hf-more__count">{remain} REMAINING</span>
              </button>
            )}

            {!hasMore && entries.length > INITIAL_SHOW && (
              <div className="hf-end">
                <span className="hf-end__line" />
                <span className="hf-end__glyph">◆ ALL RECORDS DECRYPTED ◆</span>
                <span className="hf-end__line" />
              </div>
            )}
          </>)}
        </main>

        {/* ── FOOTER ── */}
        <footer className="hf-footer">
          <button className="hf-btn hf-btn--ghost"
            onMouseEnter={playHover} onClick={() => { playClick(); navigate('/'); }}>
            ← RETURN TO BASE
          </button>
          <button className="hf-btn hf-btn--primary"
            onMouseEnter={playHover} onClick={() => { playClick(); navigate('/categories'); }}>
            ⚔ RE-LINK
          </button>
        </footer>

      </div>
    </div>
  );
}