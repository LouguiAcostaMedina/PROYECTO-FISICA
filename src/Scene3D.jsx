import React, { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Line, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { fieldAt, fieldLines } from './physics'

function potentialSurface(charges, level) {
  const n = 23, lo = -4, step = 8 / (n - 1)
  const values = new Float32Array(n*n*n)
  const index = (x,y,z) => (z*n+y)*n+x
  for(let z=0;z<n;z++) for(let y=0;y<n;y++) for(let x=0;x<n;x++) values[index(x,y,z)] = fieldAt(charges,lo+x*step,lo+y*step,lo+z*step).v
  const tetra = [[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]]
  const edges = [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]]
  const positions=[]
  for(let z=0;z<n-1;z++) for(let y=0;y<n-1;y++) for(let x=0;x<n-1;x++) {
    const xyz=[[x,y,z],[x+1,y,z],[x+1,y+1,z],[x,y+1,z],[x,y,z+1],[x+1,y,z+1],[x+1,y+1,z+1],[x,y+1,z+1]]
    const v=xyz.map(([a,b,c])=>values[index(a,b,c)])
    if(Math.min(...v)>level||Math.max(...v)<level)continue
    for(const ids of tetra){
      const hits=[]
      for(const [ia,ib] of edges){const a=ids[ia],b=ids[ib];if((v[a]<level)===(v[b]<level))continue
        const t=(level-v[a])/(v[b]-v[a]);hits.push([0,1,2].map(k=>lo+(xyz[a][k]+t*(xyz[b][k]-xyz[a][k]))*step))}
      if(hits.length===3) positions.push(...hits.flat())
      if(hits.length===4) positions.push(...hits[0],...hits[1],...hits[2],...hits[0],...hits[2],...hits[3])
    }
  }
  const geometry=new THREE.BufferGeometry()
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3))
  geometry.computeVertexNormals()
  return geometry
}

function ElectricScene({ charges, showLines, showSurfaces }) {
  const paths = useMemo(() => fieldLines(charges, 10), [charges])
  const surfaces=useMemo(()=>showSurfaces?[{level:200,color:'#ff6f91'},{level:-200,color:'#62bdff'}].map(s=>({...s,geometry:potentialSurface(charges,s.level)})):[],[charges,showSurfaces])
  return <>
    {showLines && paths.map((path,i) => <Line key={i} points={path.map(([x,y])=>[x,y,0])} color="#75d8ff" transparent opacity={.7} lineWidth={1.35}/>)}
    {surfaces.map(s=><mesh key={s.level} geometry={s.geometry}><meshStandardMaterial color={s.color} transparent opacity={.17} side={THREE.DoubleSide} depthWrite={false}/></mesh>)}
    {charges.map((c,i)=><group key={c.id || i} position={[c.x,c.y,c.z||0]}>
      <mesh><sphereGeometry args={[.24,24,24]}/><meshStandardMaterial color={c.q>=0?'#ff758d':'#69c6ff'} emissive={c.q>=0?'#901532':'#125782'} emissiveIntensity={.38}/></mesh>
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
  </>
}
function MagneticScene({ mode, current }) {
  return mode === 'wire' ? <>
    <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.1,.1,5,24]}/><meshStandardMaterial color="#d4b47b" metalness={.6} roughness={.25}/></mesh>
    {[.6,1,1.45,1.9,2.35].map((r,i)=><React.Fragment key={i}>
      <Line points={Array.from({length:101},(_,j)=>[r*Math.cos(j*2*Math.PI/100),r*Math.sin(j*2*Math.PI/100),0])} color={i%2?'#ae91ff':'#6dcfff'} transparent opacity={.8} lineWidth={1.6}/>
      <mesh position={[r*Math.cos(.7),r*Math.sin(.7),0]} rotation={[0,0,.7+(current<0?Math.PI:0)]}><coneGeometry args={[.09,.22,12]}/><meshStandardMaterial color={i%2?'#ae91ff':'#6dcfff'} emissive="#274b7e" emissiveIntensity={.3}/></mesh>
    </React.Fragment>)}
  </> : <>
    <mesh position={[-.68,0,0]}><boxGeometry args={[1.35,.6,.65]}/><meshStandardMaterial color="#ff6d83" metalness={.18}/></mesh>
    <mesh position={[.68,0,0]}><boxGeometry args={[1.35,.6,.65]}/><meshStandardMaterial color="#65baff" metalness={.18}/></mesh>
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
export default function Scene3D({ kind, charges=[], showLines=true, showSurfaces=true, area=100, distance=2, er=1, magnetMode='dipole', current=5, path=[] }) {
  return <div className="scene3d" aria-label="Visualización interactiva tridimensional">
    <Canvas camera={{position:[0,-7,8],fov:45}} dpr={[1,1.7]} gl={{antialias:true}}>
      <color attach="background" args={['#0b1324']}/>
      <ambientLight intensity={1.5}/><directionalLight position={[4,7,8]} intensity={2}/><pointLight position={[-4,-3,5]} color="#a782ff" intensity={35}/>
      <Grid infiniteGrid sectionColor="#25405b" cellColor="#182a40" sectionThickness={.8} cellThickness={.45} fadeDistance={26} fadeStrength={2} rotation={[Math.PI/2,0,0]}/>
      {kind==='electric' && <ElectricScene charges={charges} showLines={showLines} showSurfaces={showSurfaces}/>}
      {kind==='capacitor' && <CapacitorScene area={area} distance={distance} er={er}/>}
      {kind==='magnet' && <MagneticScene mode={magnetMode} current={current}/>}
      {kind==='trajectory' && <TrajectoryScene path={path}/>}
      <OrbitControls enableDamping minDistance={3} maxDistance={22}/>
    </Canvas>
    <div className="canvas-hint">Arrastra para rotar · Desliza para acercar</div>
  </div>
}
