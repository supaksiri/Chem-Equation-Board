import {Canvas} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {Suspense} from 'react';
import type {Element,MoleculeKey} from '../chemistry/mass';
import {MOLECULES} from '../chemistry/mass';
const COLORS:Record<Element,string>={H:'#e8f4ff',C:'#475c7d',N:'#6d80ff',O:'#ff6a77'};
function Sphere({pos,color,r=0.33}:{pos:[number,number,number];color:string;r?:number}){return <mesh position={pos}><sphereGeometry args={[r,28,20]}/><meshStandardMaterial color={color} metalness={.08} roughness={.23}/></mesh>}
function Bond({a,b}:{a:[number,number,number];b:[number,number,number]}){
 const mid:[number,number,number]=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];const len=Math.hypot(dx,dy,dz);const dir=new THREE.Vector3(dx,dy,dz).normalize();const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dir);
 return <mesh position={mid} quaternion={q}><cylinderGeometry args={[.075,.075,len,12]}/><meshStandardMaterial color="#a5c1df" roughness={.34}/></mesh>
}
import * as THREE from 'three';
const POS:Record<MoleculeKey,{el:Element;pos:[number,number,number]}[]>={
 H2:[{el:'H',pos:[-.5,0,0]},{el:'H',pos:[.5,0,0]}],
 O2:[{el:'O',pos:[-.55,0,0]},{el:'O',pos:[.55,0,0]}],
 H2O:[{el:'O',pos:[0,.2,0]},{el:'H',pos:[-.9,-.55,0]},{el:'H',pos:[.9,-.55,0]}],
 CO2:[{el:'O',pos:[-1.5,0,0]},{el:'C',pos:[0,0,0]},{el:'O',pos:[1.5,0,0]}],
 CO:[{el:'C',pos:[-.6,0,0]},{el:'O',pos:[.6,0,0]}],
 NH3:[{el:'N',pos:[0,.35,0]},{el:'H',pos:[-1,-.5,0]},{el:'H',pos:[1,-.5,0]},{el:'H',pos:[0,-.5,1]}],
 CH4:[{el:'C',pos:[0,0,0]},{el:'H',pos:[1,1,1]},{el:'H',pos:[-1,-1,1]},{el:'H',pos:[-1,1,-1]},{el:'H',pos:[1,-1,-1]}],
 H2O2:[{el:'O',pos:[-.6,0,0]},{el:'O',pos:[.6,0,0]},{el:'H',pos:[-1.2,.6,-.65]},{el:'H',pos:[1.2,-.6,-.65]}]
};
export function MoleculeScene({target,added}:{target:MoleculeKey;added:Partial<Record<Element,number>>}){
 const counters:Partial<Record<Element,number>>={};
 const selected=POS[target].map((a,i)=>({ ...a,index:i })).filter(a=>{const used=counters[a.el]??0;counters[a.el]=used+1;return used<(added[a.el]??0)});
 const bonds=target==='H2O2'?[[0,1],[0,2],[1,3]]:POS[target].length===2?[[0,1]]:POS[target].map((_,i)=>[0,i]).slice(1);
 return <div className="science-canvas"><Canvas camera={{position:[0,1.5,6],fov:43}} gl={{antialias:true}}><color attach="background" args={['#10243c']}/><ambientLight intensity={1.2}/><directionalLight position={[4,6,5]} intensity={2.6}/><pointLight position={[-4,-3,2]} color="#6be7ff" intensity={30}/><Suspense fallback={null}><group>{selected.map(a=><Sphere key={a.index} pos={a.pos} color={COLORS[a.el]} r={a.el==='H'?.27:.4}/>)}{bonds.filter(([i,j])=>selected.some(a=>a.index===i)&&selected.some(a=>a.index===j)).map(([i,j])=><Bond key={`${i}-${j}`} a={POS[target][i].pos} b={POS[target][j].pos}/>)}</group></Suspense><OrbitControls enablePan={false} minDistance={3} maxDistance={12}/></Canvas><div className="scene-watermark">3D GUIDED ASSEMBLY · {MOLECULES[target].shape}</div></div>
}
export function ScaleScene({left,right,leftCount,rightCount,reference=false}:{left:number;right:number;leftCount:number;rightCount:number;reference?:boolean}){
 const angle=Math.max(-.23,Math.min(.23,(left-right)/Math.max(1,left,right)*.7));
 const beads=(count:number,x:number,color:string)=>Array.from({length:count},(_,i)=>{
  const layer=Math.floor(i/8),slot=i%8, theta=slot*Math.PI*2/8+layer*.38;
  const radius=layer===0?.43:.31;
  return <Sphere key={i} pos={[x+Math.cos(theta)*radius,-.59+layer*.30,Math.sin(theta)*radius]} color={color} r={.125}/>;
 });
 return <div className="science-canvas"><Canvas camera={{position:[0,2.7,7.4],fov:42}}><color attach="background" args={['#10243c']}/><ambientLight intensity={1.2}/><directionalLight position={[4,6,4]} intensity={3}/><mesh position={[0,-2.2,0]}><cylinderGeometry args={[1.2,1.4,.3,40]}/><meshStandardMaterial color="#839dbd" metalness={.65} roughness={.3}/></mesh><mesh position={[0,-.65,0]}><cylinderGeometry args={[.12,.2,3,20]}/><meshStandardMaterial color="#91bedc" metalness={.65} roughness={.3}/></mesh><group rotation={[0,0,angle]}><mesh position={[0,.8,0]}><boxGeometry args={[5.1,.13,.18]}/><meshStandardMaterial color="#9ccbe8" metalness={.7} roughness={.25}/></mesh>{[-2.2,2.2].map((x,i)=><group key={x}><mesh position={[x,0,0]}><cylinderGeometry args={[.025,.025,1.6,10]}/><meshStandardMaterial color="#d5e9f5"/></mesh><mesh position={[x,-.85,0]}><cylinderGeometry args={[.87,.75,.14,36]}/><meshStandardMaterial color={i===0?'#5bcbdf':'#a08aff'} metalness={.45} roughness={.27}/></mesh>{beads(i===0?leftCount:rightCount,x,i===0?'#65daf4':reference?'#ffd88e':'#b39cff')}</group>)}</group><OrbitControls enablePan={false} minDistance={5} maxDistance={12}/></Canvas><div className="scene-watermark">หนึ่งเม็ด = หนึ่งอะตอมจำลอง{reference?' หรือหนึ่งหน่วยมวลอ้างอิง':''} · เม็ดมีขนาดคงที่ · ไม่ใช่เครื่องชั่งจริง</div></div>;
}
export function ReactorScene({heavy}:{heavy:number}){
 const pts=Array.from({length:80},(_,i)=>{const y=(i%10)*.22-1;const turn=i*2.39996;const r=.2+Math.sqrt((i%17)/17)*1.05;return {pos:[Math.cos(turn)*r,y,Math.sin(turn)*r] as [number,number,number],heavy:i<Math.round(heavy*.8)};});
 return <div className="science-canvas"><Canvas camera={{position:[3.6,2.6,6],fov:42}}><color attach="background" args={['#10243c']}/><ambientLight intensity={1.3}/><directionalLight position={[4,5,4]} intensity={2}/><mesh><cylinderGeometry args={[1.35,1.35,3.3,48,1,true]}/><meshPhysicalMaterial color="#a3d7e9" transparent opacity={.14} roughness={.07} metalness={.08} side={THREE.DoubleSide}/></mesh><mesh position={[0,-1.65,0]}><cylinderGeometry args={[1.4,1.4,.13,48]}/><meshStandardMaterial color="#8ab9ce" metalness={.8}/></mesh>{pts.map((p,i)=><Sphere key={i} pos={p.pos} color={p.heavy?'#a991ff':'#45d7dc'} r={.1}/>)}<OrbitControls enablePan={false} minDistance={4} maxDistance={11}/></Canvas><div className="scene-watermark">80 จุดแทนสัดส่วนตัวอย่าง · ไม่ใช่ขนาดหรือการจัดตัวจริง</div></div>
}
