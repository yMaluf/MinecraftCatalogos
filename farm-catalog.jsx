import { useState, useEffect, useRef } from "react";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap');

  @keyframes float {
    0%,100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }
  @keyframes pulse-glow {
    0%,100% { text-shadow: 0 0 20px rgba(74,222,128,0.6), 0 0 40px rgba(74,222,128,0.3), 3px 3px 0 #1a5a1a; }
    50% { text-shadow: 0 0 30px rgba(74,222,128,0.9), 0 0 60px rgba(74,222,128,0.5), 3px 3px 0 #1a5a1a; }
  }
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes cardEntrance {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes torchFlicker {
    0%,100% { opacity: 1; transform: scaleY(1); }
    25% { opacity: 0.8; transform: scaleY(0.92); }
    75% { opacity: 0.9; transform: scaleY(1.05); }
  }
  @keyframes starTwinkle {
    0%,100% { opacity: 0.15; }
    50% { opacity: 0.8; }
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20% { transform: translateX(-5px); }
    40% { transform: translateX(5px); }
    60% { transform: translateX(-3px); }
    80% { transform: translateX(3px); }
  }
  @keyframes statPop {
    from { transform: scale(0.7); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .farm-card {
    animation: cardEntrance 0.4s ease forwards;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    opacity: 0;
  }
  .farm-card:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 10px 40px rgba(74,222,128,0.12), 0 0 0 1px rgba(74,222,128,0.15) !important;
  }
  .btn-add {
    transition: all 0.2s ease;
  }
  .btn-add:hover {
    background: #1a4a1a !important;
    box-shadow: 0 0 24px rgba(74,222,128,0.45) !important;
    transform: scale(1.04);
  }
  .cat-btn { transition: all 0.15s ease; }
  .cat-btn:hover { filter: brightness(1.3); transform: scale(1.06); }
  .icon-btn { transition: all 0.15s ease; }
  .icon-btn:hover { transform: scale(1.15); filter: brightness(1.5); }
  .torch { animation: torchFlicker 0.6s ease-in-out infinite; display: inline-block; }

  input, textarea, select {
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  input:focus, textarea:focus, select:focus {
    border-color: #4ade80 !important;
    box-shadow: 0 0 14px rgba(74,222,128,0.25) !important;
    outline: none;
  }
  .upload-zone {
    transition: all 0.2s ease;
  }
  .upload-zone:hover {
    border-color: #4ade80 !important;
    background: #0d200d !important;
  }
`;

const CATEGORIAS = ["Todas", "Mob", "Recursos", "Comida", "XP", "Redstone", "Outras"];
const CAT_EMOJI = { Mob: "👾", Recursos: "⛏", Comida: "🌾", XP: "⚗️", Redstone: "🔴", Outras: "🧱", Todas: "🗺" };

const STATUS_CONFIG = {
  "Funcionando": { color: "#4ade80", bg: "#052e16", icon: "✦", label: "ONLINE" },
  "Quebrada":    { color: "#f87171", bg: "#2d0000", icon: "✖", label: "OFFLINE" },
  "Em construção": { color: "#facc15", bg: "#1c1400", icon: "◈", label: "WIP" },
};

const defaultFarms = [
  { id: 1, nome: "Farm de Iron Golem", tipo: "Mob",     coords: "X: 120, Y: 64, Z: -340", status: "Funcionando",    notas: "Produz ~1000 iron/h. Requer 4 aldeias linkadas.", img: null },
  { id: 2, nome: "Farm de Trigo",      tipo: "Comida",  coords: "X: 0, Y: 70, Z: 200",    status: "Funcionando",    notas: "Automática com villager fazendeiro.", img: null },
  { id: 3, nome: "Farm de Blaze",      tipo: "XP",      coords: "X: -880, Y: 53, Z: 440", status: "Quebrada",       notas: "Spawner bugado após update. Precisa de reforma.", img: null },
];

let nextId = 4;

function Stars() {
  const stars = Array.from({ length: 35 }, (_, i) => ({
    left: `${(i * 37 + 11) % 100}%`,
    top:  `${(i * 53 + 7)  % 65}%`,
    delay: `${(i * 0.4) % 3}s`,
    dur:   `${1.5 + (i % 3) * 0.7}s`,
    size:  i % 5 === 0 ? 3 : 2,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: s.left, top: s.top,
          width: s.size, height: s.size, borderRadius: "50%", background: "white",
          animation: `starTwinkle ${s.dur} ease-in-out infinite`,
          animationDelay: s.delay,
        }} />
      ))}
    </div>
  );
}

function ImageUpload({ value, onChange }) {
  const ref = useRef();
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", color: "#4a7a5a", fontSize: 10, letterSpacing: "0.1em", marginBottom: 6, fontFamily: "'Press Start 2P', monospace" }}>IMAGEM DA FARM</label>
      <div
        className="upload-zone"
        onClick={() => ref.current.click()}
        style={{
          width: "100%", height: value ? 150 : 80, borderRadius: 8,
          border: `2px dashed ${value ? "#4ade80" : "#1e3a1e"}`,
          background: value ? "#060e06" : "#0a180a",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", overflow: "hidden", position: "relative",
          boxSizing: "border-box",
        }}
      >
        {value
          ? <img src={value} alt="farm preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ color: "#2a5a2a", fontFamily: "'VT323', monospace", fontSize: 20 }}>
              📷 CLIQUE PARA ADICIONAR IMAGEM
            </span>
        }
      </div>
      {value && (
        <button onClick={() => onChange(null)} style={{
          marginTop: 4, background: "transparent", border: "none",
          color: "#8a3a3a", fontSize: 15, cursor: "pointer",
          fontFamily: "'VT323', monospace",
        }}>✕ remover imagem</button>
      )}
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
    </div>
  );
}

export default function FarmCatalog() {
  const [farms, setFarms] = useState(defaultFarms);
  const [categoria, setCategoria] = useState("Todas");
  const [busca, setBusca] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ nome: "", tipo: "Outras", coords: "", status: "Funcionando", notas: "", img: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [expandedImg, setExpandedImg] = useState(null);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const filtradas = farms.filter(f => {
    const matchCat = categoria === "Todas" || f.tipo === categoria;
    const matchBusca = f.nome.toLowerCase().includes(busca.toLowerCase()) || f.notas.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  function openAdd() { setForm({ nome: "", tipo: "Outras", coords: "", status: "Funcionando", notas: "", img: null }); setModal("add"); }
  function openEdit(farm) { setForm({ ...farm }); setModal("edit"); }
  function salvar() {
    if (!form.nome.trim()) return;
    if (modal === "add") setFarms(p => [...p, { ...form, id: nextId++ }]);
    else setFarms(p => p.map(f => f.id === form.id ? { ...form } : f));
    setModal(null);
  }
  function deletar(id) { setFarms(p => p.filter(f => f.id !== id)); setConfirmDelete(null); }

  const counts = { total: farms.length, online: farms.filter(f => f.status === "Funcionando").length, broken: farms.filter(f => f.status === "Quebrada").length, wip: farms.filter(f => f.status === "Em construção").length };

  return (
    <>
      <style>{STYLE}</style>
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #060e06 0%, #0b1a0b 60%, #060e06 100%)",
        color: "#e4f0e4",
        fontFamily: "'VT323', monospace",
        position: "relative", overflow: "hidden",
      }}>
        <Stars />
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)" }} />
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: `linear-gradient(rgba(74,222,128,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.025) 1px, transparent 1px)`,
          backgroundSize: "32px 32px" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 980, margin: "0 auto", padding: "32px 16px" }}>

          {/* Header */}
          <div style={{
            textAlign: "center", marginBottom: 36,
            opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(-20px)",
            transition: "all 0.6s ease",
          }}>
            <div style={{ fontSize: 52, marginBottom: 8, animation: "float 3s ease-in-out infinite", display: "inline-block" }}>⛏️</div>
            <h1 style={{
              margin: "0 0 8px",
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "clamp(13px, 2.8vw, 22px)",
              color: "#4ade80",
              animation: "pulse-glow 2.5s ease-in-out infinite",
              lineHeight: 1.5,
            }}>FARM CATALOG</h1>
            <div style={{ color: "#3a7a4a", fontSize: 22, letterSpacing: "0.12em" }}>
              <span className="torch">🔥</span>{" "}MEU MUNDO MINECRAFT{" "}<span className="torch" style={{ animationDelay: "0.4s" }}>🔥</span>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 28,
            opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease 0.2s",
          }}>
            {[
              { label: "TOTAL",   val: counts.total,  color: "#60a5fa", icon: "📦" },
              { label: "ONLINE",  val: counts.online, color: "#4ade80", icon: "✦" },
              { label: "OFFLINE", val: counts.broken, color: "#f87171", icon: "✖" },
              { label: "WIP",     val: counts.wip,    color: "#facc15", icon: "◈" },
            ].map((s, i) => (
              <div key={s.label} style={{
                background: `${s.color}0a`,
                border: `1px solid ${s.color}30`,
                borderRadius: 10, padding: "14px 8px", textAlign: "center",
                animation: `statPop 0.4s cubic-bezier(.34,1.56,.64,1) ${0.3 + i * 0.08}s both`,
              }}>
                <div style={{ fontSize: 24, marginBottom: 2 }}>{s.icon}</div>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 20, color: s.color, textShadow: `0 0 12px ${s.color}77` }}>{s.val}</div>
                <div style={{ fontSize: 13, color: "#3a6a3a", letterSpacing: "0.1em", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div style={{
            display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center",
            opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease 0.35s",
          }}>
            <input
              value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="🔍 BUSCAR FARM..."
              style={{
                background: "#0a180a", border: "1px solid #1e3a1e", borderRadius: 6,
                color: "#c0ddc0", padding: "10px 14px", fontSize: 20,
                flex: 1, minWidth: 160, fontFamily: "'VT323', monospace",
              }}
            />
            <button onClick={openAdd} className="btn-add" style={{
              background: "#0d2a0d", border: "2px solid #4ade80", color: "#4ade80",
              borderRadius: 6, padding: "10px 20px", cursor: "pointer",
              fontFamily: "'Press Start 2P', monospace", fontSize: 9,
              textShadow: "0 0 8px rgba(74,222,128,0.5)", whiteSpace: "nowrap",
            }}>+ NOVA FARM</button>
          </div>

          {/* Categories */}
          <div style={{
            display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap",
            opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease 0.45s",
          }}>
            {CATEGORIAS.map(c => (
              <button key={c} onClick={() => setCategoria(c)} className="cat-btn" style={{
                background: categoria === c ? "#1a3a1a" : "#0a150a",
                border: `1px solid ${categoria === c ? "#4ade80" : "#1a2e1a"}`,
                color: categoria === c ? "#4ade80" : "#3a6a3a",
                borderRadius: 20, padding: "6px 14px", fontSize: 18, cursor: "pointer",
                fontFamily: "'VT323', monospace",
                boxShadow: categoria === c ? "0 0 14px rgba(74,222,128,0.2)" : "none",
              }}>{CAT_EMOJI[c]} {c}</button>
            ))}
          </div>

          {/* Farm grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {filtradas.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#2a4a2a", padding: "60px 0" }}>
                <div style={{ fontSize: 44, marginBottom: 10 }}>😶</div>
                <div style={{ fontSize: 22, fontFamily: "'VT323', monospace" }}>NENHUMA FARM ENCONTRADA</div>
                <div style={{ fontSize: 16, color: "#1a3a1a", marginTop: 4 }}>adicione uma nova!</div>
              </div>
            )}

            {filtradas.map((farm, idx) => {
              const st = STATUS_CONFIG[farm.status];
              return (
                <div key={farm.id} className="farm-card" style={{
                  background: "#0a150a",
                  border: "1px solid #1a2e1a",
                  borderTop: `3px solid ${st.color}`,
                  borderRadius: 10, overflow: "hidden",
                  animationDelay: `${idx * 0.07}s`,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                }}>
                  {/* Image area */}
                  {farm.img ? (
                    <div onClick={() => setExpandedImg(farm.img)} style={{
                      cursor: "zoom-in", height: 150, overflow: "hidden", position: "relative",
                    }}>
                      <img src={farm.img} alt={farm.nome} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, #0a150a)" }} />
                      <div style={{
                        position: "absolute", top: 8, right: 8,
                        background: "rgba(0,0,0,0.6)", borderRadius: 4, padding: "2px 6px",
                        fontSize: 11, color: "#aaa",
                      }}>🔍</div>
                    </div>
                  ) : (
                    <div style={{
                      height: 64, display: "flex", alignItems: "center", justifyContent: "center",
                      background: `${st.color}07`, borderBottom: "1px solid #1a2e1a", fontSize: 36,
                    }}>{CAT_EMOJI[farm.tipo]}</div>
                  )}

                  <div style={{ padding: "14px 16px" }}>
                    {/* Name row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: "#c0e8c0", lineHeight: 1.6, flex: 1 }}>
                        {farm.nome}
                      </div>
                      <span style={{
                        background: st.bg, border: `1px solid ${st.color}44`,
                        color: st.color, fontSize: 13, padding: "3px 8px", borderRadius: 4,
                        whiteSpace: "nowrap", boxShadow: `0 0 8px ${st.color}33`,
                      }}>{st.icon} {st.label}</span>
                    </div>

                    <span style={{
                      display: "inline-block", background: "#0c1e0c", border: "1px solid #1a3a1a",
                      color: "#4a9a5a", fontSize: 14, padding: "2px 10px", borderRadius: 12, marginBottom: 8,
                    }}>{CAT_EMOJI[farm.tipo]} {farm.tipo}</span>

                    {farm.coords && (
                      <div style={{
                        color: "#4a7a5a", fontSize: 16, marginBottom: 6,
                        background: "#060e06", borderRadius: 4, padding: "4px 8px", border: "1px solid #0e1e0e",
                      }}>📍 {farm.coords}</div>
                    )}

                    {farm.notas && (
                      <div style={{ color: "#5a8a5a", fontSize: 16, lineHeight: 1.4, marginBottom: 10 }}>
                        {farm.notas}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button onClick={() => openEdit(farm)} className="icon-btn" style={{
                        background: "#0d1a0d", border: "1px solid #1e3a1e", color: "#4a9a6a",
                        borderRadius: 6, padding: "6px 12px", cursor: "pointer",
                        fontSize: 16, fontFamily: "'VT323', monospace",
                      }}>✎ EDITAR</button>
                      <button onClick={() => setConfirmDelete(farm.id)} className="icon-btn" style={{
                        background: "#150808", border: "1px solid #3a1a1a", color: "#9a5a5a",
                        borderRadius: 6, padding: "6px 10px", cursor: "pointer",
                        fontSize: 16, fontFamily: "'VT323', monospace",
                      }}>✕</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal add/edit */}
        {modal && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, padding: 16,
          }} onClick={e => e.target === e.currentTarget && setModal(null)}>
            <div style={{
              background: "#0a150a", border: "2px solid #2a4a2a", borderRadius: 12,
              padding: 24, width: "100%", maxWidth: 480,
              boxShadow: "0 0 80px rgba(74,222,128,0.12)",
              animation: "fadeSlideIn 0.25s ease",
              maxHeight: "90vh", overflowY: "auto",
            }}>
              <h2 style={{
                margin: "0 0 20px", color: "#4ade80",
                fontFamily: "'Press Start 2P', monospace", fontSize: 11,
                textShadow: "0 0 12px rgba(74,222,128,0.5)",
              }}>{modal === "add" ? "✦ NOVA FARM" : "✎ EDITAR FARM"}</h2>

              <ImageUpload value={form.img} onChange={v => setForm(f => ({ ...f, img: v }))} />

              {[
                { label: "NOME DA FARM", key: "nome", placeholder: "Ex: Farm de Blaze" },
                { label: "COORDENADAS",  key: "coords", placeholder: "X: 0, Y: 64, Z: 0" },
              ].map(({ label, key, placeholder }) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", color: "#4a7a5a", fontSize: 10, letterSpacing: "0.1em", marginBottom: 5, fontFamily: "'Press Start 2P', monospace" }}>{label}</label>
                  <input
                    value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{
                      width: "100%", background: "#060e06", border: "1px solid #1e3a1e",
                      borderRadius: 6, color: "#c0e0c0", padding: "10px 12px",
                      fontSize: 19, boxSizing: "border-box", fontFamily: "'VT323', monospace",
                    }}
                  />
                </div>
              ))}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                {[
                  { label: "CATEGORIA", key: "tipo",   opts: CATEGORIAS.filter(c => c !== "Todas") },
                  { label: "STATUS",    key: "status", opts: Object.keys(STATUS_CONFIG) },
                ].map(({ label, key, opts }) => (
                  <div key={key}>
                    <label style={{ display: "block", color: "#4a7a5a", fontSize: 10, letterSpacing: "0.1em", marginBottom: 5, fontFamily: "'Press Start 2P', monospace" }}>{label}</label>
                    <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{
                      width: "100%", background: "#060e06", border: "1px solid #1e3a1e",
                      borderRadius: 6, color: "#c0e0c0", padding: "10px 12px",
                      fontSize: 18, fontFamily: "'VT323', monospace",
                    }}>
                      {opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", color: "#4a7a5a", fontSize: 10, letterSpacing: "0.1em", marginBottom: 5, fontFamily: "'Press Start 2P', monospace" }}>OBSERVAÇÕES</label>
                <textarea
                  value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                  placeholder="Detalhes sobre a farm..." rows={3}
                  style={{
                    width: "100%", background: "#060e06", border: "1px solid #1e3a1e",
                    borderRadius: 6, color: "#c0e0c0", padding: "10px 12px",
                    fontSize: 18, resize: "vertical", boxSizing: "border-box",
                    fontFamily: "'VT323', monospace",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setModal(null)} style={{
                  background: "transparent", border: "1px solid #1e3a1e", color: "#4a6a4a",
                  borderRadius: 6, padding: "10px 18px", cursor: "pointer",
                  fontSize: 17, fontFamily: "'VT323', monospace",
                }}>CANCELAR</button>
                <button onClick={salvar} className="btn-add" style={{
                  background: "#0d2a0d", border: "2px solid #4ade80", color: "#4ade80",
                  borderRadius: 6, padding: "10px 24px", cursor: "pointer",
                  fontSize: 17, fontFamily: "'VT323', monospace", fontWeight: 700,
                }}>SALVAR ✦</button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm delete */}
        {confirmDelete && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, padding: 16,
          }}>
            <div style={{
              background: "#120505", border: "2px solid #5a1a1a", borderRadius: 12,
              padding: 28, maxWidth: 320, textAlign: "center",
              animation: "shake 0.35s ease, fadeSlideIn 0.2s ease",
              boxShadow: "0 0 50px rgba(248,113,113,0.15)",
            }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>💀</div>
              <p style={{ color: "#f87171", marginBottom: 6, fontSize: 22, fontFamily: "'VT323', monospace", lineHeight: 1.4 }}>
                TEM CERTEZA?
              </p>
              <p style={{ color: "#7a3a3a", fontSize: 17, marginBottom: 20, fontFamily: "'VT323', monospace" }}>
                essa farm vai pro void...
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button onClick={() => setConfirmDelete(null)} style={{
                  background: "#0a100a", border: "1px solid #2a3a2a", color: "#4a7a4a",
                  borderRadius: 6, padding: "10px 18px", cursor: "pointer",
                  fontSize: 17, fontFamily: "'VT323', monospace",
                }}>CANCELAR</button>
                <button onClick={() => deletar(confirmDelete)} style={{
                  background: "#2d0000", border: "2px solid #f87171", color: "#f87171",
                  borderRadius: 6, padding: "10px 18px", cursor: "pointer",
                  fontSize: 17, fontFamily: "'VT323', monospace",
                  boxShadow: "0 0 14px rgba(248,113,113,0.3)",
                }}>DELETAR 💣</button>
              </div>
            </div>
          </div>
        )}

        {/* Expanded image */}
        {expandedImg && (
          <div onClick={() => setExpandedImg(null)} style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.96)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 200, cursor: "zoom-out", padding: 20,
          }}>
            <img src={expandedImg} alt="farm ampliada" style={{
              maxWidth: "90vw", maxHeight: "90vh", borderRadius: 8,
              border: "2px solid #2a4a2a",
              boxShadow: "0 0 80px rgba(74,222,128,0.2)",
              animation: "fadeSlideIn 0.2s ease",
            }} />
          </div>
        )}
      </div>
    </>
  );
}
