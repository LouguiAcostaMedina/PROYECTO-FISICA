import React, { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Grid, Text } from '@react-three/drei'
import * as THREE from 'three'
import { fieldLines } from './physics'

function ElectricScene({ charges, showLines }) {
  const paths = useMemo(() => fieldLines(charges, 10), [charges])
  return <>
    {showLines && paths.map((path,i) => <Line key={i} points={path.map(([x,y])=>[x,y,0])} color="#75d8ff" transparent opacity={.7} lineWidth={1.35}/>)}
    {charges.map((c,i)=><group key={c.id || i} position={[c.x,c.y,c.z||0]}>
      <mesh><sphereGeometry args={[.24,24,24]}/><meshStandardMaterial color={c.q>=0?'#ff758d':'#69c6ff'} emissive={c.q>=0?'#901532':'#125782'} emissiveIntensity={.38}/></mesh>
      <Text position={[0,0,.32]} fontSize={.2} color="white" anchorX="center" anchorY="middle">{c.q>=0?'+':'−'}</Text>
    </group>)}
  </>
}
function CapacitorScene({ area, distance, er }) {
  const side = Math.max(1.3, Math.min(4.4, Math.sqrt(area)/2))
  const gap = Math.max(.45, Math.min(2.8, distance / 2))
  return <>
    {[-1,1].map((s)=><mesh key={s} position={[0,s*gap/2,0]}><boxGeometry args={[side,.08,side]}/><meshStandardMaterial color={s>0?'#ff7b8b':'#5ac6ff'} metalness={.45} roughness={.27}/></mesh>)}
    <mesh position={[0,0,0]}><boxGeometry args={[side*.93,gap*.88,side*.93]}/><meshStandardMaterial color="#9d82ff" transparent opacity={er>1.01?.17:.045} side={THREE.DoubleSide}/></mesh>
    {Array.from({length:7},(_,i)=>{const x=((i%3)-1)*side*.29,z=(Math.floor(i/3)-1)*side*.25;return <Line key={i} points={[[x,gap*.42,z],[x,-gap*.42,z]]} color="#bcadff" transparent opacity={.8}/>})}
    <Text position={[side*.68,gap/2,0]} fontSize={.25} color="#ff8796">+ + +</Text>
    <Text position={[side*.68,-gap/2,0]} fontSize={.25} color="#76d8ff">− − −</Text>
  </>
}
function MagneticScene({ mode, current }) {
  return mode === 'wire' ? <>
    <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.1,.1,5,24]}/><meshStandardMaterial color="#d4b47b" metalness={.6} roughness={.25}/></mesh>
    {[.6,1,1.45,1.9,2.35].map((r,i)=><Line key={i} points={Array.from({length:101},(_,j)=>[r*Math.cos(j*2*Math.PI/100),r*Math.sin(j*2*Math.PI/100),0])} color={i%2?'#ae91ff':'#6dcfff'} transparent opacity={.8} lineWidth={1.6}/>)}
    <Text position={[0,0,1]} fontSize={.3} color="#e5c78b">I {current>=0?'⊙':'⊗'}</Text>
  </> : <>
    <mesh position={[-.68,0,0]}><boxGeometry args={[1.35,.6,.65]}/><meshStandardMaterial color="#ff6d83" metalness={.18}/></mesh>
    <mesh position={[.68,0,0]}><boxGeometry args={[1.35,.6,.65]}/><meshStandardMaterial color="#65baff" metalness={.18}/></mesh>
    <Text position={[-.7,0,.36]} fontSize={.32} color="white">N</Text><Text position={[.7,0,.36]} fontSize={.32} color="white">S</Text>
    {[.65,1,1.45,1.9].map((h,i)=><React.Fragment key={i}>{[-1,1].map(s=><Line key={s} points={Array.from({length:51},(_,j)=>{const t=j/50;return [-1.25+2.5*t,s*(.22+h*Math.sin(Math.PI*t)),0]})} color={i%2?'#a88cff':'#6ccfff'} transparent opacity={.7}/>)}</React.Fragment>)}
  </>
}
function TrajectoryScene({ path }) {
  const points = path.filter((_,i)=>i%2===0).map(p=>[p.x,p.y,0])
  return <>
    {points.length>1 && <Line points={points} color="#9c8aff" lineWidth={3}/>}
    {path.length>0 && <mesh position={[path.at(-1).x,path.at(-1).y,0]}><sphereGeometry args={[.16,20,20]}/><meshStandardMaterial color="#f1c17a" emissive="#b77631" emissiveIntensity={.4}/></mesh>}
    <mesh><sphereGeometry args={[.09,16,16]}/><meshStandardMaterial color="#a8b8ce"/></mesh>
  </>
}
export default function Scene3D({ kind, charges=[], showLines=true, area=100, distance=2, er=1, magnetMode='dipole', current=5, path=[] }) {
  return <div className="scene3d" aria-label="Visualización interactiva tridimensional">
    <Canvas camera={{position:[0,-7,8],fov:45}} dpr={[1,1.7]} gl={{antialias:true}}>
      <color attach="background" args={['#0b1324']}/>
      <ambientLight intensity={1.5}/><directionalLight position={[4,7,8]} intensity={2}/><pointLight position={[-4,-3,5]} color="#a782ff" intensity={35}/>
      <Grid infiniteGrid sectionColor="#25405b" cellColor="#182a40" sectionThickness={.8} cellThickness={.45} fadeDistance={26} fadeStrength={2} rotation={[Math.PI/2,0,0]}/>
      {kind==='electric' && <ElectricScene charges={charges} showLines={showLines}/>}
      {kind==='capacitor' && <CapacitorScene area={area} distance={distance} er={er}/>}
      {kind==='magnet' && <MagneticScene mode={magnetMode} current={current}/>}
      {kind==='trajectory' && <TrajectoryScene path={path}/>}
      <OrbitControls enableDamping minDistance={3} maxDistance={22}/>
    </Canvas>
    <div className="canvas-hint">Arrastra para rotar · Desliza para acercar</div>
  </div>
}
