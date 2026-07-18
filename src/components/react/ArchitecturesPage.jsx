import React from 'react';

// ArchitecturesPage — terminal-aesthetic architecture case studies.
// Split-slider view (draggable handle) + side-by-side view.
// Two-level tabs: company → project.

const ARCH_COLORS = {
  bg: '#f6f4ee',
  panel: '#fbfaf5',
  ink: '#1a1d20',
  dim: '#5a6066',
  faint: '#b9bcc0',
  rule: '#d9d6cc',
  accent: '#1a7f37',
  red: '#cf222e',
  amber: '#9a6700',
  blue: '#0969a3',
  purple: '#8250df',
  pink: '#d83b9a',
  white: '#fff',
};

const NODE_STYLES = {
  source: { fill: '#fff',    stroke: '#1a1d20', dash: null,  text: '#1a1d20' },
  mq:     { fill: '#fff8e4', stroke: '#9a6700', dash: null,  text: '#5a4700' },
  mono:   { fill: '#fbe7e4', stroke: '#cf222e', dash: null,  text: '#6a1a15' },
  hot:    { fill: '#e4f2e9', stroke: '#1a7f37', dash: null,  text: '#0a4a1f' },
  cold:   { fill: '#e7eef5', stroke: '#0969a3', dash: '4 4', text: '#0a3a60' },
  orch:   { fill: '#f0e7f5', stroke: '#8250df', dash: null,  text: '#3a1f5a' },
  db:     { fill: '#fff',    stroke: '#1a1d20', dash: '6 3', text: '#1a1d20' },
  viz:    { fill: '#fef2f8', stroke: '#d83b9a', dash: null,  text: '#5a1a3a' },
};

const TONE_COLORS = {
  red:    { value: '#cf222e', label: '#6a1a15' },
  green:  { value: '#1a7f37', label: '#0a4a1f' },
  accent: { value: '#1a1d20', label: '#5a6066' },
};

// ── ArchDiagram ──────────────────────────────────────────────────────────────
function ArchDiagram({ data, lang, highlightId, setHighlightId }) {
  if (!data) return null;
  const byId = Object.fromEntries(data.nodes.map(n => [n.id, n]));

  const edgePath = (from, to) => {
    const x1 = from.x + from.w, y1 = from.y + from.h / 2;
    const x2 = to.x,             y2 = to.y + to.h / 2;
    if (Math.abs(y1 - y2) < 2) return `M${x1},${y1} L${x2},${y2}`;
    const mid = x1 + (x2 - x1) / 2;
    return `M${x1},${y1} L${mid},${y1} L${mid},${y2} L${x2},${y2}`;
  };

  const smartPath = (from, to) => {
    const sx = from.x + from.w / 2;
    if (to.x >= sx) return edgePath(from, to);
    // Target is to the left — route around
    const x1 = from.x, y1 = from.y + from.h / 2;
    const x2 = to.x + to.w, y2 = to.y + to.h / 2;
    const mid = Math.min(x1, x2) - 30;
    return `M${x1},${y1} L${mid},${y1} L${mid},${y2} L${x2},${y2}`;
  };

  return (
    <svg viewBox="0 0 1000 560" width="100%" height="100%" style={{ display: 'block' }}>
      <defs>
        <pattern id="arch-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke={ARCH_COLORS.rule} strokeWidth="0.4" opacity="0.5" />
        </pattern>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={ARCH_COLORS.faint} />
        </marker>
        <marker id="arrow-hot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={ARCH_COLORS.accent} />
        </marker>
        <marker id="arrow-hl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={ARCH_COLORS.ink} />
        </marker>
      </defs>

      <rect width="1000" height="560" fill={ARCH_COLORS.bg} />
      <rect width="1000" height="560" fill="url(#arch-grid)" />

      {/* Edges */}
      {data.edges.map((e, i) => {
        const f = byId[e.from], t = byId[e.to];
        if (!f || !t) return null;
        const isHot = e.kind === 'hot';
        const isHl = highlightId && (e.from === highlightId || e.to === highlightId);
        const dim  = highlightId && !isHl;
        const stroke = isHl ? ARCH_COLORS.ink : isHot ? ARCH_COLORS.accent : ARCH_COLORS.dim;
        const marker = isHl ? 'url(#arrow-hl)' : isHot ? 'url(#arrow-hot)' : 'url(#arrow)';
        return (
          <g key={i} opacity={dim ? 0.1 : 1}>
            <path
              d={smartPath(f, t)}
              fill="none"
              stroke={stroke}
              strokeWidth={isHot || isHl ? 2 : 1.2}
              strokeDasharray={e.kind === 'archive' ? '5 4' : null}
              markerEnd={marker}
            />
            {e.label && (
              <text
                x={(f.x + f.w + t.x) / 2}
                y={(f.y + f.h / 2 + t.y + t.h / 2) / 2 - 5}
                textAnchor="middle"
                fontFamily="'JetBrains Mono', monospace"
                fontSize="10"
                fill={isHl ? ARCH_COLORS.ink : ARCH_COLORS.dim}
              >{e.label}</text>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {data.nodes.map((n, i) => {
        const st = NODE_STYLES[n.kind] || NODE_STYLES.source;
        const isHl = highlightId === n.id;
        const dim  = highlightId && !isHl &&
          !data.edges.some(e => (e.from === highlightId && e.to === n.id) || (e.to === highlightId && e.from === n.id));
        return (
          <g
            key={i}
            opacity={dim ? 0.18 : 1}
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHighlightId && setHighlightId(n.id)}
            onMouseLeave={() => setHighlightId && setHighlightId(null)}
          >
            <rect
              x={n.x} y={n.y} width={n.w} height={n.h}
              fill={st.fill}
              stroke={isHl ? ARCH_COLORS.ink : st.stroke}
              strokeWidth={isHl ? 2.5 : 1.5}
              strokeDasharray={st.dash}
            />
            {n.emoji && (
              <text x={n.x + 10} y={n.y + 16}
                fontFamily="'JetBrains Mono', monospace" fontSize="11" fill={ARCH_COLORS.dim}
              >{n.emoji}</text>
            )}
            <text
              x={n.x + n.w / 2}
              y={n.y + (n.subtitle ? n.h / 2 - 2 : n.h / 2 + 4)}
              textAnchor="middle"
              fontFamily="'JetBrains Mono', monospace"
              fontSize="12" fontWeight="600"
              fill={st.text}
            >{n.label}</text>
            {n.subtitle && (
              <text
                x={n.x + n.w / 2} y={n.y + n.h / 2 + 14}
                textAnchor="middle"
                fontFamily="'JetBrains Mono', monospace"
                fontSize="10" fill={ARCH_COLORS.dim}
              >{n.subtitle}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── SplitView ────────────────────────────────────────────────────────────────
function SplitView({ caseData, lang }) {
  const [split, setSplit] = React.useState(50);
  const [dragging, setDragging] = React.useState(false);
  const containerRef = React.useRef(null);
  const [hlBefore, setHlBefore] = React.useState(null);
  const [hlAfter, setHlAfter]   = React.useState(null);

  const onPointerDown = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  React.useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const pct = ((clientX - rect.left) / rect.width) * 100;
      setSplit(Math.max(5, Math.min(95, pct)));
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging]);

  const beforeLabel = caseData.before.label[lang] || caseData.before.label.fr;
  const afterLabel  = caseData.after.label[lang]  || caseData.after.label.fr;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Diagram area */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          userSelect: dragging ? 'none' : 'auto',
          cursor: dragging ? 'col-resize' : 'auto',
        }}
      >
        {/* BEFORE — clipped to LEFT portion */}
        <div style={{
          position: 'absolute', inset: 0,
          clipPath: `inset(0 ${100 - split}% 0 0)`,
        }}>
          <ArchDiagram data={caseData.before} lang={lang} highlightId={hlBefore} setHighlightId={setHlBefore} />
        </div>

        {/* AFTER — clipped to RIGHT portion */}
        <div style={{
          position: 'absolute', inset: 0,
          clipPath: `inset(0 0 0 ${split}%)`,
        }}>
          <ArchDiagram data={caseData.after} lang={lang} highlightId={hlAfter} setHighlightId={setHlAfter} />
        </div>

        {/* Before label */}
        <div style={{
          position: 'absolute', top: 10, left: 14,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, fontWeight: 600,
          color: '#fff', background: ARCH_COLORS.red,
          padding: '2px 8px', letterSpacing: '0.5px',
          pointerEvents: 'none', zIndex: 5,
        }}>
          AVANT · {beforeLabel}
        </div>

        {/* After label */}
        <div style={{
          position: 'absolute', top: 10, right: 14,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, fontWeight: 600,
          color: '#fff', background: ARCH_COLORS.accent,
          padding: '2px 8px', letterSpacing: '0.5px',
          pointerEvents: 'none', zIndex: 5,
        }}>
          APRÈS · {afterLabel}
        </div>

        {/* Drag handle */}
        <div
          onMouseDown={onPointerDown}
          onTouchStart={onPointerDown}
          style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${split}%`,
            transform: 'translateX(-50%)',
            width: 28,
            cursor: 'col-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <div style={{
            position: 'absolute', top: 0, bottom: 0, left: '50%',
            width: 2, background: ARCH_COLORS.ink,
            transform: 'translateX(-50%)',
          }} />
          <div style={{
            position: 'relative',
            width: 28, height: 28,
            background: ARCH_COLORS.ink,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13, fontWeight: 700,
            flexShrink: 0,
          }}>⇔</div>
        </div>
      </div>

      {/* Notes row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: `1px solid ${ARCH_COLORS.rule}` }}>
        <NotesPanel notes={caseData.before.notes} lang={lang} tone="red" side="before" />
        <NotesPanel notes={caseData.after.notes}  lang={lang} tone="green" side="after" />
      </div>
    </div>
  );
}

// ── SideView ─────────────────────────────────────────────────────────────────
function SideView({ caseData, lang }) {
  const [hlBefore, setHlBefore] = React.useState(null);
  const [hlAfter, setHlAfter]   = React.useState(null);
  const beforeLabel = caseData.before.label[lang] || caseData.before.label.fr;
  const afterLabel  = caseData.after.label[lang]  || caseData.after.label.fr;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, position: 'relative', borderRight: `1px solid ${ARCH_COLORS.rule}` }}>
          <div style={{
            position: 'absolute', top: 10, left: 14, zIndex: 2,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, fontWeight: 600,
            color: '#fff', background: ARCH_COLORS.red,
            padding: '2px 8px', letterSpacing: '0.5px',
          }}>AVANT · {beforeLabel}</div>
          <ArchDiagram data={caseData.before} lang={lang} highlightId={hlBefore} setHighlightId={setHlBefore} />
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 10, right: 14, zIndex: 2,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, fontWeight: 600,
            color: '#fff', background: ARCH_COLORS.accent,
            padding: '2px 8px', letterSpacing: '0.5px',
          }}>APRÈS · {afterLabel}</div>
          <ArchDiagram data={caseData.after} lang={lang} highlightId={hlAfter} setHighlightId={setHlAfter} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: `1px solid ${ARCH_COLORS.rule}` }}>
        <NotesPanel notes={caseData.before.notes} lang={lang} tone="red" side="before" />
        <NotesPanel notes={caseData.after.notes}  lang={lang} tone="green" side="after" />
      </div>
    </div>
  );
}

// ── NotesPanel ────────────────────────────────────────────────────────────────
function NotesPanel({ notes, lang, tone, side }) {
  const color = tone === 'red' ? ARCH_COLORS.red : ARCH_COLORS.accent;
  return (
    <div style={{
      padding: '10px 16px',
      borderRight: side === 'before' ? `1px solid ${ARCH_COLORS.rule}` : 'none',
      background: ARCH_COLORS.panel,
    }}>
      {notes.map((n, i) => (
        <div key={i} style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, color: ARCH_COLORS.dim,
          marginBottom: 3,
          display: 'flex', alignItems: 'flex-start', gap: 6,
        }}>
          <span style={{ color, flexShrink: 0, marginTop: 1 }}>{tone === 'red' ? '✕' : '✓'}</span>
          {n[lang] || n.fr}
        </div>
      ))}
    </div>
  );
}

// ── Legend ───────────────────────────────────────────────────────────────────
const LEGEND_ITEMS = [
  { kind: 'source', label: 'Source / Client' },
  { kind: 'mq',     label: 'Broker / LB / CDN' },
  { kind: 'hot',    label: 'Hot path / PaaS' },
  { kind: 'cold',   label: 'Cold / Archive' },
  { kind: 'orch',   label: 'Orchestration' },
  { kind: 'mono',   label: 'Monolith / Legacy' },
  { kind: 'db',     label: 'Database / Store' },
  { kind: 'viz',    label: 'Observability' },
];

function Legend() {
  return (
    <div style={{
      padding: '10px 16px 18px',
      borderTop: `1px solid ${ARCH_COLORS.rule}`,
      background: ARCH_COLORS.panel,
      display: 'flex',
      flexWrap: 'wrap',
      gap: '7px 18px',
    }}>
      {LEGEND_ITEMS.map(item => {
        const st = NODE_STYLES[item.kind];
        return (
          <div key={item.kind} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10, color: ARCH_COLORS.dim,
          }}>
            <svg width="16" height="12" style={{ flexShrink: 0 }}>
              <rect x="1" y="1" width="14" height="10"
                fill={st.fill} stroke={st.stroke}
                strokeWidth="1.5" strokeDasharray={st.dash || undefined}
              />
            </svg>
            {item.label}
          </div>
        );
      })}
    </div>
  );
}

// ── Main ArchitecturesPage ───────────────────────────────────────────────────
export default function ArchitecturesPage({ lang = 'fr', data }) {
  const companies = data?.companies || [];
  const [activeCompanyIdx, setActiveCompanyIdx] = React.useState(0);
  const [activeCaseIdx, setActiveCaseIdx] = React.useState(0);
  const [viewMode, setViewMode] = React.useState('split');

  const company = companies[activeCompanyIdx];
  const cases = company?.cases || [];
  const activeCase = cases[activeCaseIdx] || cases[0];

  const isFr = lang === 'fr';
  const T = {
    split: isFr ? 'Comparaison' : 'Compare',
    side:  isFr ? 'Côte à côte' : 'Side by side',
    view:  isFr ? 'VUE' : 'VIEW',
  };

  const handleCompanyClick = (idx) => {
    setActiveCompanyIdx(idx);
    setActiveCaseIdx(0);
  };

  if (!company || !activeCase) return null;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%',
      background: ARCH_COLORS.bg,
      fontFamily: "'JetBrains Mono', monospace",
      overflow: 'hidden',
    }}>

      {/* ── Company tabs (level 1) ── */}
      <div style={{
        display: 'flex', alignItems: 'stretch',
        borderBottom: `1px solid ${ARCH_COLORS.rule}`,
        background: ARCH_COLORS.panel,
        flexShrink: 0,
        overflowX: 'auto',
      }}>
        {companies.map((co, i) => {
          const isActive = i === activeCompanyIdx;
          return (
            <button key={co.id} onClick={() => handleCompanyClick(i)} style={{
              background: isActive ? ARCH_COLORS.bg : 'transparent',
              border: 'none',
              borderRight: `1px solid ${ARCH_COLORS.rule}`,
              borderBottom: isActive ? `2px solid ${ARCH_COLORS.accent}` : '2px solid transparent',
              padding: '10px 22px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 13, fontWeight: isActive ? 700 : 500,
              color: isActive ? ARCH_COLORS.ink : ARCH_COLORS.dim,
              whiteSpace: 'nowrap',
            }}>{co.label}</button>
          );
        })}

        <div style={{ flex: 1 }} />

        {/* View toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '0 16px',
          borderLeft: `1px solid ${ARCH_COLORS.rule}`,
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 10, color: ARCH_COLORS.dim, letterSpacing: '1px' }}>{T.view}</span>
          <div style={{ display: 'flex', border: `1px solid ${ARCH_COLORS.rule}`, background: '#fff' }}>
            {[{ id: 'split', label: T.split }, { id: 'side', label: T.side }].map(v => (
              <button key={v.id} onClick={() => setViewMode(v.id)} style={{
                background: viewMode === v.id ? ARCH_COLORS.accent : 'transparent',
                border: 'none',
                color: viewMode === v.id ? '#fff' : ARCH_COLORS.dim,
                padding: '5px 12px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 11, fontWeight: viewMode === v.id ? 700 : 400,
                letterSpacing: '0.5px',
              }}>{v.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Project sub-tabs (level 2) ── */}
      {cases.length > 1 && (
        <div style={{
          display: 'flex', alignItems: 'stretch',
          borderBottom: `1px solid ${ARCH_COLORS.rule}`,
          background: '#faf9f4',
          flexShrink: 0,
          overflowX: 'auto',
        }}>
          {cases.map((c, i) => {
            const isActive = i === activeCaseIdx;
            return (
              <button key={c.id} onClick={() => setActiveCaseIdx(i)} style={{
                background: isActive ? ARCH_COLORS.bg : 'transparent',
                border: 'none',
                borderRight: `1px solid ${ARCH_COLORS.rule}`,
                borderBottom: isActive ? `2px solid ${ARCH_COLORS.accent}` : '2px solid transparent',
                padding: '7px 18px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 12, fontWeight: isActive ? 600 : 400,
                color: isActive ? ARCH_COLORS.ink : ARCH_COLORS.dim,
                whiteSpace: 'nowrap',
              }}>
                {c.kind[lang] || c.kind.fr}
                <span style={{ marginLeft: 8, fontSize: 10, color: ARCH_COLORS.faint }}>{c.year}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Hero row ── */}
      <div style={{
        padding: '12px 20px',
        borderBottom: `1px solid ${ARCH_COLORS.rule}`,
        background: ARCH_COLORS.panel,
        display: 'flex', alignItems: 'center', gap: 32,
        flexShrink: 0, flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{
            fontSize: 10, color: ARCH_COLORS.dim,
            letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 4,
          }}>
            ➜ ~/cv/arch/{activeCase.id}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: ARCH_COLORS.ink, lineHeight: 1.3 }}>
            {activeCase.title[lang] || activeCase.title.fr}
          </div>
          <div style={{ fontSize: 11, color: ARCH_COLORS.dim, marginTop: 4 }}>
            {activeCase.tagline[lang] || activeCase.tagline.fr}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
          {activeCase.metrics.map((m, i) => {
            const c = TONE_COLORS[m.tone] || TONE_COLORS.accent;
            return (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: c.value, lineHeight: 1 }}>{m.value}</div>
                <div style={{ fontSize: 9, color: c.label, letterSpacing: '1.5px', marginTop: 3 }}>
                  {m.label[lang] || m.label.fr}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Diagram area ── */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {viewMode === 'split' ? (
          <SplitView caseData={activeCase} lang={lang} key={activeCase.id + '-split'} />
        ) : (
          <SideView caseData={activeCase} lang={lang} key={activeCase.id + '-side'} />
        )}
      </div>

      {/* ── Legend ── */}
      <Legend />
    </div>
  );
}
