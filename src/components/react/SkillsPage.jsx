import React, { useState, useMemo, useEffect, useRef, useReducer, useCallback } from 'react';

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg: '#f6f4ee',
  panel: '#fbfaf5',
  ink: '#1a1d20',
  dim: '#5a6066',
  faint: '#b9bcc0',
  border: '#d9d6cc',
  green: '#1a7f37',
  greenDim: 'rgba(26,127,55,0.14)',
  white: '#fff',
  rowHover: '#ece8db',
  rowFocus: '#dff1e2',
};

// ─── i18n ────────────────────────────────────────────────────────────────────
const T = {
  fr: {
    title: 'Graphe des Compétences',
    intro: 'Visualisation interactive de mon parcours. Les nœuds blancs représentent les entreprises et projets, les nœuds colorés les compétences, dimensionnées par durée d\'utilisation.',
    sort_duration: 'Par durée', sort_name: 'A → Z', sort_cat: 'Par catégorie',
    view_graph: 'Graphe', view_list: 'Liste',
    filter: 'Filtrer par catégorie',
    legend: 'Légende',
    total_skills: 'compétences', total_months: 'mois d\'XP cumulés', total_sources: 'sources',
    sort: 'Tri', view: 'Vue',
    skill: 'Compétence', months_col: 'Durée', cat: 'Catégorie', sources_used: 'Utilisée dans',
    company: 'Entreprise', project: 'Projet',
    bigger: 'Plus grand = plus utilisé',
    show_all: 'Tout afficher',
    months: 'mois', skills: 'compétences', stack: 'Stack',
    no_match: 'Aucune compétence ne correspond aux filtres.',
    clear_focus: '× effacer focus',
    help: [
      'Cliquez un nœud pour le focaliser.',
      'Drag & drop sur tous les nœuds — les compétences suivent.',
      'Filtrez par catégorie dans le panneau latéral.',
    ],
    back: '← Retour au CV',
    prompt_cmd: 'skills --graph --interactive',
  },
  en: {
    title: 'Skills Graph',
    intro: 'Interactive visualisation of my career. White nodes are companies and projects; coloured nodes are skills, sized by duration of use.',
    sort_duration: 'By duration', sort_name: 'A → Z', sort_cat: 'By category',
    view_graph: 'Graph', view_list: 'List',
    filter: 'Filter by category',
    legend: 'Legend',
    total_skills: 'skills', total_months: 'cumulated months', total_sources: 'sources',
    sort: 'Sort', view: 'View',
    skill: 'Skill', months_col: 'Months', cat: 'Category', sources_used: 'Used in',
    company: 'Company', project: 'Project',
    bigger: 'Bigger = more used',
    show_all: 'Show all',
    months: 'months', skills: 'skills', stack: 'Stack',
    no_match: 'No skills match the filters.',
    clear_focus: '× clear focus',
    help: [
      'Click any node to focus it.',
      'Drag & drop all nodes — skills follow companies.',
      'Filter by category in the sidebar.',
    ],
    back: '← Back to CV',
    prompt_cmd: 'skills --graph --interactive',
  },
};

// ─── Segmented control ───────────────────────────────────────────────────────
function Seg({ options, value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', border: `1px solid ${C.border}`, background: C.white }}>
      {options.map(o => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          style={{
            background: value === o.v ? C.green : 'transparent',
            border: 'none',
            color: value === o.v ? '#fff' : C.dim,
            padding: '5px 12px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 11,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontWeight: value === o.v ? 700 : 400,
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Force-directed graph ────────────────────────────────────────────────────
function SkillsGraph({ lang, skills, sources, categories, activeCats, focus, setFocus }) {
  const svgRef = useRef(null);
  const [size, setSize] = useState({ w: 800, h: 640 });
  const [, repaint] = useReducer(x => x + 1, 0);

  // Incremented to restart the simulation (e.g. after drag)
  const [simKey, setSimKey] = useState(0);

  // Resize observer
  useEffect(() => {
    if (!svgRef.current) return;
    const el = svgRef.current.parentElement;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: Math.max(400, r.width), h: Math.max(400, r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Build nodes + edges
  const { nodes, edges, byId } = useMemo(() => {
    const visible = skills.filter(s => activeCats.has(s.cat));
    const nodeList = [];
    const byId = new Map();

    sources.forEach(s => {
      const n = { ...s, id: 's:' + s.id, type: 'source', r: 22 };
      nodeList.push(n);
      byId.set(n.id, n);
    });

    visible.forEach(sk => {
      const r = 5 + Math.sqrt(sk.months) * 1.4;
      const n = {
        ...sk,
        id: 'k:' + sk.name,
        type: 'skill',
        r,
        color: categories.find(c => c.id === sk.cat)?.color || '#888',
      };
      nodeList.push(n);
      byId.set(n.id, n);
    });

    const edges = [];
    visible.forEach(sk => {
      sk.used.forEach(srcId => {
        if (byId.has('s:' + srcId)) {
          edges.push({ from: 'k:' + sk.name, to: 's:' + srcId });
        }
      });
    });

    return { nodes: nodeList, edges, byId };
  }, [skills, sources, categories, activeCats]);

  // Physics state — persists across re-renders
  const posRef = useRef(new Map());

  // ── Simulation — restarts whenever nodes/edges/size/simKey change ──────────
  useEffect(() => {
    const pos = posRef.current;
    const cx = size.w / 2, cy = size.h / 2;
    const innerR = Math.min(size.w, size.h) * 0.18;
    const sourceNodes = nodes.filter(n => n.type === 'source');

    // Initialize positions only for new nodes (preserve existing)
    sourceNodes.forEach((n, i) => {
      if (!pos.has(n.id)) {
        const angle = (i / sourceNodes.length) * Math.PI * 2 - Math.PI / 2;
        pos.set(n.id, {
          x: cx + Math.cos(angle) * innerR,
          y: cy + Math.sin(angle) * innerR,
          vx: 0, vy: 0,
          pinned: false,
        });
      }
    });

    nodes.filter(n => n.type === 'skill').forEach(n => {
      if (!pos.has(n.id)) {
        const a = Math.random() * Math.PI * 2;
        const d = innerR + 60 + Math.random() * 160;
        pos.set(n.id, {
          x: cx + Math.cos(a) * d,
          y: cy + Math.sin(a) * d,
          vx: 0, vy: 0,
          pinned: false,
        });
      }
    });

    // Prune removed nodes
    for (const id of [...pos.keys()]) {
      if (!byId.has(id)) pos.delete(id);
    }

    let raf;
    let ticks = 0;

    const tick = () => {
      ticks++;
      const k = 0.022;
      const repelStrength = 900;
      const damping = 0.78;
      const linkDist = 100;
      const pad = 32;

      const arr = [...pos.entries()];

      // Repulsion between all pairs
      for (let i = 0; i < arr.length; i++) {
        const [idA, a] = arr[i];
        if (a.pinned) continue;
        let fx = 0, fy = 0;
        for (let j = 0; j < arr.length; j++) {
          if (i === j) continue;
          const [idB, b] = arr[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy + 0.01;
          const d = Math.sqrt(d2);
          const rb = byId.get(idB)?.r || 10;
          const ra = byId.get(idA)?.r || 10;
          const minDist = ra + rb + 6;
          fx += (dx / d) * (repelStrength / d2);
          fy += (dy / d) * (repelStrength / d2);
          if (d < minDist) {
            const push = (minDist - d) * 0.5;
            fx += (dx / d) * push * 8;
            fy += (dy / d) * push * 8;
          }
        }
        // Weak center gravity
        fx += (cx - a.x) * 0.002;
        fy += (cy - a.y) * 0.002;
        a.vx = (a.vx + fx * 0.01) * damping;
        a.vy = (a.vy + fy * 0.01) * damping;
      }

      // Link spring forces
      for (const e of edges) {
        const a = pos.get(e.from), b = pos.get(e.to);
        if (!a || !b) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
        const diff = (d - linkDist) * k;
        const fx = (dx / d) * diff, fy = (dy / d) * diff;
        if (!a.pinned) { a.vx += fx; a.vy += fy; }
        if (!b.pinned) { b.vx -= fx; b.vy -= fy; }
      }

      // Integrate + bounds
      let totalEnergy = 0;
      for (const [, p] of pos) {
        if (p.pinned) continue;
        p.x = Math.max(pad, Math.min(size.w - pad, p.x + p.vx));
        p.y = Math.max(pad, Math.min(size.h - pad, p.y + p.vy));
        totalEnergy += p.vx * p.vx + p.vy * p.vy;
      }

      repaint();

      // Keep running until the graph fully settles
      if (totalEnergy > 0.05 || ticks < 80) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [nodes, edges, size, byId, simKey]); // simKey triggers restart after drag

  // Hover / focus
  const [hover, setHover] = useState(null);
  const focused = focus || hover;

  const isEdgeLit = e => !focused || e.from === focused || e.to === focused;
  const isNodeLit = n => {
    if (!focused) return true;
    if (n.id === focused) return true;
    return edges.some(e => (e.from === focused && e.to === n.id) || (e.to === focused && e.from === n.id));
  };

  // Drag state
  const dragRef = useRef(null);

  const onPointerDown = useCallback((e, id) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = posRef.current.get(id);
    if (p) p.pinned = true; // freeze during drag
    dragRef.current = { id, moved: false };
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!dragRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const p = posRef.current.get(dragRef.current.id);
    if (p) {
      p.x = e.clientX - rect.left;
      p.y = e.clientY - rect.top;
      p.vx = p.vy = 0;
      dragRef.current.moved = true;
      repaint();
    }
  }, []);

  const onPointerUp = useCallback((e, id) => {
    if (!dragRef.current) return;
    const { id: dragId, moved } = dragRef.current;
    dragRef.current = null;

    const p = posRef.current.get(dragId);
    const n = byId.get(dragId);
    if (p) {
      if (n?.type === 'source') {
        // Companies & projects: stay pinned at new position so skills reorganise around them
        p.pinned = moved;
      } else {
        // Skills: release back into simulation
        p.pinned = false;
      }
    }

    // Restart simulation so skills flow toward new positions
    if (moved) setSimKey(k => k + 1);

    // Click (no move) → toggle focus
    if (!moved) setFocus(prev => prev === dragId ? null : dragId);
  }, [byId, setFocus]);

  return (
    <svg
      ref={svgRef}
      width="100%" height="100%"
      viewBox={`0 0 ${size.w} ${size.h}`}
      style={{ display: 'block', background: C.bg, userSelect: 'none' }}
      onPointerMove={onPointerMove}
    >
      <defs>
        <pattern id="sg-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke={C.border} strokeWidth="0.5" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#sg-grid)" />

      {/* Edges */}
      <g>
        {edges.map((e, i) => {
          const a = posRef.current.get(e.from);
          const b = posRef.current.get(e.to);
          if (!a || !b) return null;
          const lit = isEdgeLit(e);
          const nk = byId.get(e.from);
          return (
            <line
              key={i}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={lit ? (nk?.color || C.green) : C.border}
              strokeWidth={lit ? 1.5 : 0.6}
              opacity={focused && !lit ? 0.06 : (lit ? 0.85 : 0.35)}
            />
          );
        })}
      </g>

      {/* Nodes */}
      <g>
        {nodes.map(n => {
          const p = posRef.current.get(n.id);
          if (!p) return null;
          const lit = isNodeLit(n);
          const isFocused = focused === n.id;

          if (n.type === 'source') {
            const w = 112, h = 38;
            // Projects → dashed border; Companies → solid border
            const isProject = n.kind === 'project';
            return (
              <g
                key={n.id}
                style={{ cursor: 'grab' }}
                onPointerDown={ev => onPointerDown(ev, n.id)}
                onPointerUp={ev => onPointerUp(ev, n.id)}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
              >
                <rect
                  x={p.x - w / 2} y={p.y - h / 2}
                  width={w} height={h}
                  fill={C.white}
                  stroke={isFocused ? C.green : C.ink}
                  strokeWidth={isFocused ? 2.5 : 1.5}
                  strokeDasharray={isProject ? '6 3' : undefined}
                  opacity={lit ? 1 : 0.2}
                />
                <text
                  x={p.x} y={p.y - 3}
                  textAnchor="middle" dominantBaseline="middle"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize={11} fontWeight={600} fill={C.ink}
                  opacity={lit ? 1 : 0.3}
                  pointerEvents="none"
                >{n.label}</text>
                <text
                  x={p.x} y={p.y + 11}
                  textAnchor="middle"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize={8} fill={C.dim}
                  opacity={lit ? 1 : 0.3}
                  pointerEvents="none"
                >{isProject ? '◇' : '◈'} {n.months}mo</text>
              </g>
            );
          }

          // Skill node
          return (
            <g
              key={n.id}
              style={{ cursor: 'grab' }}
              onPointerDown={ev => onPointerDown(ev, n.id)}
              onPointerUp={ev => onPointerUp(ev, n.id)}
              onMouseEnter={() => setHover(n.id)}
              onMouseLeave={() => setHover(null)}
            >
              <circle
                cx={p.x} cy={p.y} r={n.r}
                fill={n.color}
                stroke={isFocused ? C.ink : C.white}
                strokeWidth={isFocused ? 2.5 : 1.5}
                opacity={lit ? 1 : 0.15}
              />
              {(n.r > 10 || isFocused) && (
                <text
                  x={p.x} y={p.y + n.r + 11}
                  textAnchor="middle"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize={10} fontWeight={isFocused ? 700 : 500}
                  fill={C.ink}
                  opacity={lit ? 1 : 0.3}
                  pointerEvents="none"
                >{n.name}</text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// ─── Full page component ─────────────────────────────────────────────────────
export default function SkillsPage({ lang: initialLang, data, cvBase }) {
  const { sources, categories, skills } = data;

  const [sort, setSort] = useState('duration');
  const [view, setView] = useState('graph');
  const [focus, setFocus] = useState(null);
  const [activeCats, setActiveCats] = useState(() => new Set(categories.map(c => c.id)));

  const t = T[initialLang] || T.fr;

  const filtered = useMemo(() => skills.filter(s => activeCats.has(s.cat)), [activeCats, skills]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sort === 'duration') arr.sort((a, b) => b.months - a.months);
    else if (sort === 'name') arr.sort((a, b) => a.name.localeCompare(b.name));
    else arr.sort((a, b) => a.cat.localeCompare(b.cat) || b.months - a.months);
    return arr;
  }, [filtered, sort]);

  const maxMonths = Math.max(...skills.map(s => s.months));
  const totalMonths = filtered.reduce((s, x) => s + x.months, 0);

  const catById = Object.fromEntries(categories.map(c => [c.id, c]));
  const sourceById = Object.fromEntries(sources.map(s => [s.id, s]));

  const allOn = activeCats.size === categories.length;
  const toggleAll = () => setActiveCats(allOn ? new Set() : new Set(categories.map(c => c.id)));
  const toggleCat = id => setActiveCats(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const focusInfo = useMemo(() => {
    if (!focus) return null;
    if (focus.startsWith('s:')) {
      const src = sources.find(x => 's:' + x.id === focus);
      if (!src) return null;
      return { kind: 'source', data: src, skills: skills.filter(k => k.used.includes(src.id)) };
    }
    if (focus.startsWith('k:')) {
      const sk = skills.find(x => 'k:' + x.name === focus);
      if (!sk) return null;
      return { kind: 'skill', data: sk, sources: sources.filter(s => sk.used.includes(s.id)) };
    }
    return null;
  }, [focus, skills, sources]);

  const labelStyle = { color: '#8a8680', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase' };

  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: 'auto auto 1fr',
      height: '100%',             // fill the container set by Astro
      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      background: C.bg,
      color: C.ink,
      minHeight: 0,
    }}>

      {/* Hero */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, padding: '24px 28px 18px', borderBottom: `1px solid ${C.border}`, background: C.panel }}>
        <div>
          <div style={{ color: C.dim, fontSize: 12, marginBottom: 8 }}>
            <span style={{ color: C.green, fontWeight: 600, marginRight: 8 }}>➜</span>
            <span style={{ color: '#0969a3' }}>~/cv</span>{' '}
            <span style={{ color: C.ink }}>{t.prompt_cmd}</span>
          </div>
          <h1 style={{ margin: 0, fontFamily: 'inherit', fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', color: C.ink }}>
            # {t.title}
          </h1>
          <p style={{ margin: '8px 0 0', maxWidth: 560, color: C.dim, fontSize: 13, lineHeight: 1.6 }}>{t.intro}</p>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
          {[
            { n: filtered.length, l: t.total_skills },
            { n: totalMonths, l: t.total_months },
            { n: sources.length, l: t.total_sources },
          ].map(({ n, l }) => (
            <div key={l} style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: C.ink, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>{n}</div>
              <div style={labelStyle}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 18px', borderBottom: `1px solid ${C.border}`, background: C.panel, fontSize: 11, flexWrap: 'wrap' }}>
        <span style={labelStyle}>{t.sort}</span>
        <Seg value={sort} onChange={setSort} options={[
          { v: 'duration', label: t.sort_duration },
          { v: 'name', label: t.sort_name },
          { v: 'cat', label: t.sort_cat },
        ]} />
        <span style={{ ...labelStyle, marginLeft: 12 }}>{t.view}</span>
        <Seg value={view} onChange={setView} options={[
          { v: 'graph', label: t.view_graph },
          { v: 'list', label: t.view_list },
        ]} />
        {focus && (
          <button
            onClick={() => setFocus(null)}
            style={{ marginLeft: 'auto', background: 'none', border: `1px solid ${C.green}`, color: C.green, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}
          >{t.clear_focus}</button>
        )}
      </div>

      {/* Body: sidebar + main — must not overflow */}
      <div style={{ display: 'grid', gridTemplateColumns: '256px 1fr', minHeight: 0, overflow: 'hidden' }}>

        {/* Sidebar */}
        <aside style={{ borderRight: `1px solid ${C.border}`, background: C.panel, overflowY: 'auto', padding: '16px 18px 32px', fontSize: 12 }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', color: C.dim, fontWeight: 600, paddingBottom: 6, borderBottom: `1px solid ${C.border}`, marginBottom: 8 }}>{t.filter}</div>

          <div onClick={toggleAll} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', cursor: 'pointer', fontWeight: 600, color: C.ink }}>
            <input type="checkbox" checked={allOn} readOnly style={{ accentColor: C.green }} />
            <span>{t.show_all}</span>
            <span style={{ marginLeft: 'auto', color: '#8a8a8a', fontSize: 11 }}>{skills.length}</span>
          </div>

          {categories.map(cat => {
            const count = skills.filter(s => s.cat === cat.id).length;
            const on = activeCats.has(cat.id);
            return (
              <div key={cat.id} onClick={() => toggleCat(cat.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0', cursor: 'pointer', color: on ? C.ink : C.faint }}>
                <input type="checkbox" checked={on} readOnly style={{ accentColor: C.green }} />
                <span style={{ width: 10, height: 10, borderRadius: 2, background: cat.color, flexShrink: 0, display: 'inline-block' }} />
                <span>{cat[initialLang]}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#8a8a8a' }}>{count}</span>
              </div>
            );
          })}

          {/* Legend */}
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', color: C.dim, fontWeight: 600, paddingBottom: 6, borderBottom: `1px solid ${C.border}`, margin: '16px 0 8px' }}>{t.legend}</div>

          {/* Company: solid border */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '3px 0', fontSize: 11, color: C.dim }}>
            <svg width="22" height="14" style={{ flexShrink: 0 }}>
              <rect x="1" y="1" width="20" height="12" fill={C.white} stroke={C.ink} strokeWidth="1.5" />
            </svg>
            <span>{t.company} ◈</span>
          </div>
          {/* Project: dashed border */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '3px 0', fontSize: 11, color: C.dim }}>
            <svg width="22" height="14" style={{ flexShrink: 0 }}>
              <rect x="1" y="1" width="20" height="12" fill={C.white} stroke={C.ink} strokeWidth="1.5" strokeDasharray="4 2" />
            </svg>
            <span>{t.project} ◇</span>
          </div>
          {/* Skill: circle */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '3px 0', fontSize: 11, color: C.dim }}>
            <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 7, background: C.green, flexShrink: 0 }} />
            <span>{t.bigger}</span>
          </div>

          {/* Help */}
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', color: C.dim, fontWeight: 600, paddingBottom: 6, borderBottom: `1px solid ${C.border}`, margin: '16px 0 8px' }}>Shortcuts</div>
          {t.help.map((h, i) => (
            <div key={i} style={{ fontSize: 11, color: C.dim, lineHeight: 1.55, marginBottom: 6 }}>
              <span style={{ color: C.green }}>▸</span> {h}
            </div>
          ))}
        </aside>

        {/* Main: graph or list */}
        {view === 'graph' ? (
          <div style={{ position: 'relative', background: C.bg, overflow: 'hidden' }}>
            <SkillsGraph
              lang={initialLang}
              skills={skills}
              sources={sources}
              categories={categories}
              activeCats={activeCats}
              focus={focus}
              setFocus={setFocus}
            />

            {/* Focus panel */}
            {focusInfo && (
              <div style={{ position: 'absolute', top: 16, right: 16, width: 272, background: C.white, border: `1px solid ${C.green}`, padding: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontSize: 12, zIndex: 5 }}>
                <button onClick={() => setFocus(null)} style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: C.dim, fontSize: 14, fontFamily: 'inherit' }}>×</button>
                <div style={{ ...labelStyle, marginBottom: 4 }}>
                  {focusInfo.kind === 'skill' ? t.skill
                    : focusInfo.data.kind === 'company' ? t.company : t.project}
                </div>
                <h4 style={{ margin: '0 0 8px', fontSize: 14, color: C.ink, fontFamily: 'inherit' }}>
                  {focusInfo.kind === 'skill' ? focusInfo.data.name : focusInfo.data.label}
                </h4>

                {focusInfo.kind === 'skill' && (() => {
                  const cat = catById[focusInfo.data.cat];
                  return (
                    <>
                      <div style={{ color: C.dim, marginBottom: 8 }}>
                        <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: cat?.color, verticalAlign: 'middle', marginRight: 6 }} />
                        {cat?.[initialLang]} · <b style={{ color: C.ink }}>{focusInfo.data.months} {t.months}</b>
                      </div>
                      <div style={labelStyle}>{t.sources_used}</div>
                      <ul style={{ margin: '6px 0 0', padding: 0, listStyle: 'none' }}>
                        {focusInfo.sources.map(s => (
                          <li key={s.id} style={{ padding: '3px 0', borderBottom: `1px dashed #e6e2d7`, display: 'flex', justifyContent: 'space-between' }}>
                            <span>{s.label}</span>
                            <span style={{ color: '#8a8a8a' }}>{s.months}mo</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  );
                })()}

                {focusInfo.kind === 'source' && (
                  <>
                    <div style={{ color: C.dim, marginBottom: 8, fontSize: 11 }}>
                      {focusInfo.data.months} {t.months} · {focusInfo.skills.length} {t.skills}
                    </div>
                    <div style={labelStyle}>{t.stack}</div>
                    <ul style={{ margin: '6px 0 0', padding: 0, listStyle: 'none' }}>
                      {[...focusInfo.skills].sort((a, b) => b.months - a.months).map(sk => (
                        <li key={sk.name} style={{ padding: '3px 0', borderBottom: `1px dashed #e6e2d7`, display: 'flex', justifyContent: 'space-between' }}>
                          <span>
                            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: catById[sk.cat]?.color, marginRight: 6 }} />
                            {sk.name}
                          </span>
                          <span style={{ color: '#8a8a8a' }}>{sk.months}mo</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {/* Help overlay — bottom left */}
            <div style={{ position: 'absolute', bottom: 20, left: 16, background: 'rgba(251,250,245,0.92)', border: `1px solid ${C.border}`, padding: '10px 14px', fontSize: 11, color: C.dim, lineHeight: 1.6, maxWidth: 340 }}>
              <div><span style={{ color: C.green }}>$</span> graph.help</div>
              {t.help.map((h, i) => <div key={i}>▸ {h}</div>)}
            </div>
          </div>
        ) : (
          <div style={{ background: C.bg, overflowY: 'auto' }}>
            {/* List header */}
            <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 80px 120px 1fr', gap: 12, padding: '10px 16px 8px', borderBottom: `1px solid ${C.border}`, fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#8a8a8a', background: C.panel, position: 'sticky', top: 0, zIndex: 2 }}>
              <span />
              <span>{t.skill}</span>
              <span style={{ textAlign: 'right' }}>{t.months_col}</span>
              <span>{t.cat}</span>
              <span>{t.sources_used}</span>
            </div>

            {sorted.map(sk => {
              const cat = catById[sk.cat];
              const pct = (sk.months / maxMonths) * 100;
              const id = 'k:' + sk.name;
              const isFocused = focus === id;
              return (
                <div
                  key={sk.name}
                  onClick={() => setFocus(isFocused ? null : id)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '28px 1fr 80px 120px 1fr',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 16px',
                    borderBottom: `1px solid #e6e2d7`,
                    fontSize: 12,
                    cursor: 'pointer',
                    background: isFocused ? C.rowFocus : 'transparent',
                    transition: 'background 80ms',
                  }}
                  onMouseEnter={e => { if (!isFocused) e.currentTarget.style.background = C.rowHover; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isFocused ? C.rowFocus : 'transparent'; }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: cat?.color, display: 'inline-block' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: C.ink }}>{sk.name}</div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                      {sk.used.map(srcId => {
                        const src = sourceById[srcId];
                        return src ? (
                          <span key={srcId} style={{ fontSize: 10, padding: '1px 6px', background: C.white, border: `1px solid ${C.border}`, color: C.ink }}>{src.label}</span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    <b style={{ color: C.ink }}>{sk.months}</b> <span style={{ color: '#8a8a8a', fontSize: 10 }}>mo</span>
                  </div>
                  <div style={{ color: '#8a8a8a', fontSize: 11 }}>{cat?.[initialLang]}</div>
                  <div style={{ height: 6, background: '#e0dbcc', borderRadius: 1, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: pct + '%', background: cat?.color }} />
                  </div>
                </div>
              );
            })}

            {sorted.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: '#8a8a8a' }}>{t.no_match}</div>
            )}

            {/* Bottom padding so last row isn't flush with browser chrome */}
            <div style={{ height: 48 }} />
          </div>
        )}
      </div>
    </div>
  );
}
