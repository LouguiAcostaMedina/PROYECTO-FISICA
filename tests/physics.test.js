import assert from 'node:assert/strict'
import { capacitor, circuit, fieldAt, lorentzPath, metalResistance, wireField, EPS0, MU0 } from '../src/physics.js'

const near = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= 1e-15 + tolerance * Math.abs(expected), `${actual} ≠ ${expected}`)

const dipole = [{x:-1,y:0,q:2},{x:1,y:0,q:-2}]
const e = fieldAt(dipole,0,0)
near(e.v,0,1e-6)
assert.ok(e.ex>0)
near(e.ey,0)

const cap = capacitor({area:100,distance:1,er:1,voltage:10})
near(cap.C,EPS0*.01/.001)
near(cap.Q,cap.C*10)
near(cap.U,.5*cap.C*100)

for (const mode of ['series','parallel','mixed']) {
  const c = circuit({mode,source:12,r1:10,r2:20,r3:30})
  near(c.rows.reduce((sum,row)=>sum+row.p,0),c.P)
  near(c.I,12/c.Req)
}
near(circuit({mode:'series',source:12,r1:10,r2:20,r3:30}).Req,60)
near(circuit({mode:'parallel',source:12,r1:10,r2:20,r3:30}).Req,1/(.1+.05+1/30))
near(circuit({mode:'mixed',source:12,r1:10,r2:20,r3:30}).Req,22)

near(wireField(5,2),MU0*5/(2*Math.PI*.02))
near(metalResistance(1.68e-8,1,1),1.68e-8/(Math.PI*(.0005)**2))
const path = lorentzPath({electric:0,magnetic:0,vx:10,vy:0,ratio:1,duration:2})
near(path.at(-1).x,2,.001)
near(path.at(-1).y,0)
console.log('Verificaciones físicas: OK')
