export const K = 8.9875517923e9
export const EPS0 = 8.8541878128e-12
export const MU0 = 4 * Math.PI * 1e-7

export const DIELECTRICS = [
  { name: 'Vacío', er: 1, note: 'Referencia fundamental' },
  { name: 'Aire', er: 1.0006, note: 'Aprox. a 20 °C' },
  { name: 'Papel', er: 3.5, note: 'Valor típico: 2–4' },
  { name: 'Vidrio', er: 5, note: 'Valor típico: 4–10' },
  { name: 'Mica', er: 6, note: 'Valor típico: 5–7' },
  { name: 'Cerámica', er: 10, note: 'Varía según composición' },
]
export const METALS = [
  { name: 'Plata', rho: 1.59e-8, color: '#cbd5e1' },
  { name: 'Cobre', rho: 1.68e-8, color: '#f2a06a' },
  { name: 'Oro', rho: 2.44e-8, color: '#eac766' },
  { name: 'Aluminio', rho: 2.65e-8, color: '#95b8d8' },
  { name: 'Tungsteno', rho: 5.6e-8, color: '#a4a7bd' },
  { name: 'Hierro', rho: 9.71e-8, color: '#9ea8bd' },
  { name: 'Níquel', rho: 6.99e-8, color: '#b4c4c8' },
  { name: 'Platino', rho: 1.06e-7, color: '#d3d8e0' },
]
export const fmt = (n, digits = 3) => {
  if (!Number.isFinite(n)) return '—'
  if (n === 0) return '0'
  const a = Math.abs(n)
  return (a >= 1e5 || a < 0.001 ? n.toExponential(2) : new Intl.NumberFormat('es-PE', { maximumFractionDigits: digits }).format(n))
}
export function fieldAt(charges, x, y, z = 0) {
  let ex = 0, ey = 0, ez = 0, v = 0
  for (const c of charges) {
    const dx = (x - c.x) * .01, dy = (y - c.y) * .01, dz = (z - (c.z || 0)) * .01
    const r2 = Math.max(dx * dx + dy * dy + dz * dz, 1e-8)
    const r = Math.sqrt(r2), q = c.q * 1e-9
    const f = K * q / (r2 * r)
    ex += f * dx; ey += f * dy; ez += f * dz; v += K * q / r
  }
  return { ex, ey, ez, v, magnitude: Math.hypot(ex, ey, ez) }
}
export function fieldLines(charges, count = 12) {
  const lines = []
  const sources = charges.filter(c => c.q > 0).length ? charges.filter(c => c.q > 0) : charges.filter(c => c.q < 0)
  for (const c of sources) {
    for (let j = 0; j < count; j++) {
      const a = 2 * Math.PI * j / count
      let x = c.x + .2 * Math.cos(a), y = c.y + .2 * Math.sin(a)
      const points = [[x, y]]
      for (let i = 0; i < 270; i++) {
        const e = fieldAt(charges, x, y)
        const length = Math.hypot(e.ex, e.ey) || 1
        const h = .065
        const direction = c.q > 0 ? 1 : -1
        x += direction * h * e.ex / length; y += direction * h * e.ey / length
        points.push([x, y])
        if (Math.abs(x) > 6 || Math.abs(y) > 4.5 || charges.some(t => t.q * direction < 0 && Math.hypot(x - t.x, y - t.y) < .18)) break
      }
      lines.push(points)
    }
  }
  return lines
}
export function contours(charges, width = 72, height = 52) {
  const result = []
  const levels = [-1200, -600, -300, -150, -75, 75, 150, 300, 600, 1200]
  const grid = Array.from({ length: height + 1 }, (_, j) => Array.from({ length: width + 1 }, (_, i) => fieldAt(charges, -6 + i * 12 / width, -4.5 + j * 9 / height).v))
  for (const level of levels) {
    const segments = []
    for (let j = 0; j < height; j++) for (let i = 0; i < width; i++) {
      const x = -6 + i * 12 / width, y = -4.5 + j * 9 / height, dx = 12 / width, dy = 9 / height
      const vals = [grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]]
      const corners = [[x,y],[x+dx,y],[x+dx,y+dy],[x,y+dy]]
      const hit = []
      for (let k = 0; k < 4; k++) {
        const next = (k + 1) % 4
        if ((vals[k] < level) !== (vals[next] < level)) {
          const t = (level - vals[k]) / (vals[next] - vals[k])
          hit.push([corners[k][0] + t * (corners[next][0] - corners[k][0]), corners[k][1] + t * (corners[next][1] - corners[k][1])])
        }
      }
      if (hit.length === 2) segments.push(hit)
      if (hit.length === 4) { segments.push([hit[0], hit[1]], [hit[2], hit[3]]) }
    }
    result.push({ level, segments })
  }
  return result
}
export function capacitor({ area, distance, er, voltage }) {
  const A = Math.max(area, .001) * 1e-4, d = Math.max(distance, .001) * 1e-3
  const C = EPS0 * er * A / d
  return { C, Q: C * voltage, U: .5 * C * voltage ** 2, E: voltage / d }
}
export function circuit({ mode, source, r1, r2, r3 }) {
  const a = Math.max(.001, +r1), b = Math.max(.001, +r2), c = Math.max(.001, +r3), V = +source
  const Req = mode === 'series' ? a + b + c : mode === 'parallel' ? 1 / (1/a + 1/b + 1/c) : a + b*c/(b+c)
  const I = V / Req
  const rows = mode === 'series' ? [a,b,c].map((r,i) => ({ name: `R${i+1}`, r, i: I, v: I*r })) : mode === 'parallel' ? [a,b,c].map((r,i) => ({ name: `R${i+1}`, r, i: V/r, v: V })) : [
    { name:'R1', r:a, i:I, v:I*a },
    { name:'R2', r:b, i:(V-I*a)/b, v:V-I*a },
    { name:'R3', r:c, i:(V-I*a)/c, v:V-I*a },
  ]
  return { Req, I, P: V * I, rows: rows.map(row => ({ ...row, p: row.i * row.v })) }
}
export function lorentzPath({ electric, magnetic, vx, vy, ratio, duration, angle = 0 }) {
  // SI: E in V/m, B in mT, v in km/s, q/m in 10⁶ C/kg, t in µs.
  const B = magnetic * 1e-3, qm = ratio * 1e6, E = electric, dt = duration * 1e-6 / 600
  let state = [0, 0, vx * 1e3, vy * 1e3]
  const derivative = ([, , ux, uy]) => [ux, uy, qm * (E * Math.cos(angle) + uy * B), qm * (E * Math.sin(angle) - ux * B)]
  const add = (s, k, h) => s.map((v,i) => v + k[i] * h)
  const points = []
  for (let n = 0; n <= 600; n++) {
    if (n % 3 === 0) points.push({ x: state[0] * 100, y: state[1] * 100, t: n * dt * 1e6, speed: Math.hypot(state[2], state[3]) })
    const k1 = derivative(state), k2 = derivative(add(state,k1,dt/2)), k3 = derivative(add(state,k2,dt/2)), k4 = derivative(add(state,k3,dt))
    state = state.map((v,i) => v + dt * (k1[i]+2*k2[i]+2*k3[i]+k4[i])/6)
  }
  return points
}
export function wireField(current, radiusCm) { return MU0 * current / (2 * Math.PI * Math.max(radiusCm, .001) * .01) }
export function metalResistance(rho, length, diameterMm) { return rho * length / (Math.PI * (Math.max(diameterMm, .001) * 1e-3 / 2) ** 2) }
