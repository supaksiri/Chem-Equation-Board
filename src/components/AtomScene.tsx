import {useMemo, useRef} from 'react';
import {Canvas, useFrame} from '@react-three/fiber';
import {OrbitControls, Float, Stars} from '@react-three/drei';
import * as THREE from 'three';
import type {Atom} from '../chemistry/atom';

type Particle={kind:'p'|'n';position:[number,number,number]};
/** Deterministic Fibonacci sphere packing for a readable *schematic* nucleus, not literal nuclear geometry. */
function positions(a:Atom):Particle[]{
 const count=a.p+a.n;const particles:Particle[]=[];
 if(!count)return particles;
 const kinds:Array<'p'|'n'>=[];let p=a.p,n=a.n;
 while(p||n){if(p){kinds.push('p');p--;}if(n){kinds.push('n');n--;}}
 const radius=Math.max(.22,Math.cbrt(count)*.29);
 for(let i=0;i<count;i++){
  const t=(i+.5)/count;const phi=Math.acos(1-2*t);const theta=Math.PI*(3-Math.sqrt(5))*i;
  const r=radius*Math.cbrt(t)*1.5;
  particles.push({kind:kinds[i],position:[r*Math.sin(phi)*Math.cos(theta),r*Math.cos(phi),r*Math.sin(phi)*Math.sin(theta)]});
 }
 return particles;
}
function Nucleus({atom,highlight}: {atom:Atom;highlight:boolean}){
 const mesh=useRef<THREE.Group>(null);
 const ps=useMemo(()=>positions(atom),[atom.p,atom.n]);
 useFrame(({clock})=>{if(mesh.current)mesh.current.rotation.y=clock.elapsedTime*.075;});
 return <group ref={mesh}>{ps.map((particle,i)=><mesh position={particle.position} key={`${particle.kind}-${i}`} castShadow>
 <sphereGeometry args={[.26,20,16]}/>
 <meshPhysicalMaterial color={particle.kind==='p'?'#ff6e7b':'#6196fe'} metalness={.15} roughness={.24} clearcoat={.65} emissive={particle.kind==='p'?'#9e142b':'#214aab'} emissiveIntensity={highlight&&particle.kind==='n'?.28:.11}/>
 </mesh>)}</group>;
}
function Cloud({electrons}:{electrons:number}){
 const cloud=useRef<THREE.Mesh>(null);
 useFrame(({clock})=>{if(cloud.current)cloud.current.rotation.y=clock.elapsedTime*.045;});
 if(!electrons)return null;
 const r=2.05+Math.min(electrons/20,1)*.20;
 return <group>
  <mesh ref={cloud}><sphereGeometry args={[r,48,32]}/><meshBasicMaterial color="#66cfff" transparent opacity={.073} side={THREE.DoubleSide} depthWrite={false}/></mesh>
  <mesh rotation={[.25,0,.25]}><torusGeometry args={[r*.94,.009,5,160]}/><meshBasicMaterial color="#70dfff" transparent opacity={.35}/></mesh>
  <mesh rotation={[1.10,0,-.32]}><torusGeometry args={[r*.91,.008,5,160]}/><meshBasicMaterial color="#a397ff" transparent opacity={.28}/></mesh>
  <mesh rotation={[2.03,0,.21]}><torusGeometry args={[r*.89,.008,5,160]}/><meshBasicMaterial color="#60edd5" transparent opacity={.2}/></mesh>
 </group>;
}
function Stage({atom,highlight,motion}:{atom:Atom;highlight:boolean;motion:boolean}){
 return <>
 <ambientLight intensity={1.2}/><hemisphereLight args={['#a8eaff','#11274b',1.9]}/>
 <directionalLight position={[5,8,7]} intensity={2.8} color="#edfbff"/>
 <pointLight position={[-4,0,-3]} intensity={38} distance={15} color="#2bcefa"/>
 <pointLight position={[3,-4,2]} intensity={24} distance={12} color="#987dff"/>
 <Stars radius={70} depth={25} count={450} factor={1.2} fade speed={motion ? 0.4 : 0}/>
 <Float speed={motion ? 0.6 : 0} rotationIntensity={0} floatIntensity={motion ? 0.12 : 0}>
  <Nucleus atom={atom} highlight={highlight}/><Cloud electrons={atom.e}/>
 </Float>
 <OrbitControls enablePan={false} enableDamping minDistance={3.3} maxDistance={9.2} minPolarAngle={.2} maxPolarAngle={Math.PI-.2}/>
 </>;
}
export default function AtomScene({atom,highlight=false,motion=true}:{atom:Atom;highlight?:boolean;motion?:boolean}){
 return <div className="atom-canvas" aria-label={`แบบจำลองสามมิติ: ${atom.p} โปรตอน ${atom.n} นิวตรอน ${atom.e} อิเล็กตรอน`} role="img">
 <Canvas camera={{position:[4.8,2.5,5.4],fov:45}} dpr={[1,1.6]} gl={{alpha:true,antialias:true,powerPreference:'high-performance'}} fallback={<div className="webgl-fallback">ไม่รองรับ WebGL กรุณาใช้ตัวควบคุมและดูค่าอนุภาคด้านขวา</div>}>
 <Stage atom={atom} highlight={highlight} motion={motion}/>
 </Canvas>
 <div className="stage-corner">3D INTERACTIVE · SCHEMATIC</div>
 <div className="stage-hint">↻ ลากหมุน • เลื่อนเพื่อซูม</div>
 </div>;
}
