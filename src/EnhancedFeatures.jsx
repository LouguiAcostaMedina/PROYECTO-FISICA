import React, { useMemo, useState } from "react";
import { Check, Copy, FolderOpen, Save, Share2, Sparkles } from "lucide-react";
import { fmt, rcCurve, rcTransient } from "./physics";

export const UNIT_GLOSSARIES = {
  electric: [
    ["nC", "nanoculombio: 10⁻⁹ C"],
    ["N/C", "newton por culombio"],
    ["V", "voltio: potencial eléctrico"],
    ["cm", "centímetro: 10⁻² m"],
  ],
  capacitor: [
    ["nF", "nanofaradio: 10⁻⁹ F"],
    ["nC", "nanoculombio: 10⁻⁹ C"],
    ["nJ", "nanojulio: 10⁻⁹ J"],
    ["εᵣ", "permitividad relativa"],
  ],
  circuits: [
    ["Ω", "ohmio: resistencia"],
    ["A", "amperio: corriente"],
    ["V", "voltio: tensión"],
    ["W", "vatio: potencia"],
  ],
  magnet: [
    ["µT", "microtesla: 10⁻⁶ T"],
    ["A·m²", "momento dipolar"],
    ["A", "amperio: corriente"],
    ["cm", "centímetro: 10⁻² m"],
  ],
  lorentz: [
    ["mT", "militesla: 10⁻³ T"],
    ["km/s", "kilómetros por segundo"],
    ["µs", "microsegundo: 10⁻⁶ s"],
    ["q/m", "carga entre masa"],
  ],
};

export function UnitGlossary({ type }) {
  return (
    <div className="unit-glossary panel">
      <div className="unit-glossary-title">
        <Sparkles size={15} />
        <div>
          <strong>Unidades de esta vista</strong>
          <span>Referencia rápida</span>
        </div>
      </div>
      <div className="unit-chip-grid">
        {UNIT_GLOSSARIES[type].map(([unit, text]) => (
          <div className="unit-chip" key={unit}>
            <b>{unit}</b>
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const particleCopy = {
  electric:
    "Los electrones (−) responden en sentido opuesto al campo; los protones (+), en el mismo sentido.",
  capacitor:
    "Los electrones se acumulan en la placa negativa; los núcleos del material permanecen ligados.",
  circuits:
    "La corriente convencional va de + a −; los electrones del metal derivan en sentido contrario.",
  magnet:
    "Cargas en movimiento producen campo magnético. Los electrones del conductor generan la corriente.",
  lorentz:
    "La carga determina la desviación: electrón y protón se curvan en sentidos opuestos; el neutrón no.",
};
export function ParticleMotion({ type }) {
  return (
    <div className={`particle-lab panel particle-${type}`}>
      <div className="particle-stage" aria-label="Modelo animado de partículas">
        <div className="nucleus">
          <i className="proton">p+</i>
          <i className="neutron">n⁰</i>
        </div>
        <div className="electron-orbit">
          <i className="electron">e−</i>
        </div>
        <div className="electron-stream">
          {[0, 1, 2, 3, 4].map((i) => (
            <i key={i} style={{ "--i": i }}>
              e−
            </i>
          ))}
        </div>
      </div>
      <div className="particle-copy">
        <span className="eyebrow">MODELO MICROSCÓPICO ANIMADO</span>
        <h3>Electrones, protones y neutrones</h3>
        <p>{particleCopy[type]}</p>
        <div className="particle-legend">
          <span>
            <i className="mini electron" /> Electrón: −e
          </span>
          <span>
            <i className="mini proton" /> Protón: +e
          </span>
          <span>
            <i className="mini neutron" /> Neutrón: 0
          </span>
        </div>
      </div>
    </div>
  );
}

export function ConfigActions({ onSave, onLoad, onShare, status }) {
  return (
    <div className="config-actions">
      <button onClick={onSave}>
        <Save size={15} /> Guardar
      </button>
      <button onClick={onLoad}>
        <FolderOpen size={15} /> Cargar
      </button>
      <button onClick={onShare}>
        <Share2 size={15} /> Compartir
      </button>
      {status && (
        <span>
          <Check size={13} />
          {status}
        </span>
      )}
    </div>
  );
}

export function RCPanel() {
  const [rc, setRc] = useState({
    source: 12,
    resistance: 10000,
    capacitance: 100,
    time: 1,
    mode: "charge",
  });
  const result = useMemo(() => rcTransient(rc), [rc]);
  const curve = useMemo(
    () => rcCurve(rc),
    [rc.source, rc.resistance, rc.capacitance, rc.mode],
  );
  const maxTime = curve.at(-1)?.time || 1,
    maxV = Math.max(1, rc.source);
  const points = curve
    .map(
      (p) =>
        `${40 + (p.time / maxTime) * 600},${240 - (p.voltage / maxV) * 190}`,
    )
    .join(" ");
  const x = 40 + (Math.min(rc.time, maxTime) / maxTime) * 600,
    y = 240 - (result.voltage / maxV) * 190;
  const set = (key, value) => setRc((p) => ({ ...p, [key]: value }));
  return (
    <div className="panel rc-panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">NUEVO · TRANSITORIO RC</span>
          <h3>Carga y descarga de un capacitor</h3>
        </div>
        <div className="segmented">
          <button
            className={rc.mode === "charge" ? "active" : ""}
            onClick={() => set("mode", "charge")}
          >
            Carga
          </button>
          <button
            className={rc.mode === "discharge" ? "active" : ""}
            onClick={() => set("mode", "discharge")}
          >
            Descarga
          </button>
        </div>
      </div>
      <div className="rc-grid">
        <div className="rc-plot">
          <svg
            viewBox="0 0 680 280"
            role="img"
            aria-label="Curva de voltaje del capacitor"
          >
            <rect width="680" height="280" rx="12" fill="#0e1a2b" />
            <path
              d="M40 30V240H650"
              stroke="#7088a5"
              strokeWidth="2"
              fill="none"
            />
            <polyline
              points={points}
              fill="none"
              stroke="#a992ff"
              strokeWidth="4"
            />
            <line
              x1={x}
              y1="35"
              x2={x}
              y2="240"
              stroke="#f1c67b"
              strokeDasharray="5 5"
            />
            <circle cx={x} cy={y} r="8" fill="#f1c67b" />
            <text x="48" y="24" fill="#aabbd0" fontSize="13">
              Vc (V)
            </text>
            <text x="568" y="265" fill="#aabbd0" fontSize="13">
              tiempo (ms)
            </text>
          </svg>
          <div className="rc-results">
            <span>
              <b>{fmt(result.voltage)}</b> Vc (V)
            </span>
            <span>
              <b>{fmt(result.current * 1e3)}</b> I (mA)
            </span>
            <span>
              <b>{fmt(result.tau * 1e3)}</b> τ (ms)
            </span>
            <span>
              <b>{fmt(result.percent, 1)}%</b> de la fuente
            </span>
          </div>
        </div>
        <div className="rc-controls">
          <label>
            Fuente <span>{fmt(rc.source)} V</span>
            <input
              type="range"
              min="1"
              max="48"
              value={rc.source}
              onChange={(e) => set("source", +e.target.value)}
            />
          </label>
          <label>
            Resistencia <span>{fmt(rc.resistance)} Ω</span>
            <input
              type="range"
              min="100"
              max="50000"
              step="100"
              value={rc.resistance}
              onChange={(e) => set("resistance", +e.target.value)}
            />
          </label>
          <label>
            Capacitancia <span>{fmt(rc.capacitance)} nF</span>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={rc.capacitance}
              onChange={(e) => set("capacitance", +e.target.value)}
            />
          </label>
          <label>
            Tiempo <span>{fmt(rc.time)} ms</span>
            <input
              type="range"
              min="0"
              max={Math.max(1, maxTime)}
              step={maxTime / 100}
              value={Math.min(rc.time, maxTime)}
              onChange={(e) => set("time", +e.target.value)}
            />
          </label>
          <p>
            τ = RC. A 1τ el capacitor alcanza 63,2% en carga; a 5τ supera 99%.
          </p>
        </div>
      </div>
    </div>
  );
}
