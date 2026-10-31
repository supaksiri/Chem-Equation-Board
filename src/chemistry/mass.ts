/** Reference values: isotopic masses (u), CIAAW/NIST representative values rounded for teaching.
 * Chlorine abundance values below are illustrative, not a claimed natural sample. */
export const U_TO_G = 1.66053906660e-24;
export const MASSES = { 'H-1':1.00782503223,'H-2':2.01410177812,'C-12':12,'C-13':13.00335483507,'O-16':15.99491461957,'Cl-35':34.968852682,'Cl-37':36.965902602 } as const;
export type Isotope=keyof typeof MASSES;
export const massOf=(isotope:Isotope, count:number)=>MASSES[isotope]*count;
export const ratio=(left:number,right:number)=>right===0?null:left/right;
export const average=(masses:readonly number[], percentages:readonly number[])=>{
 if(masses.length!==percentages.length||masses.length===0||masses.some(m=>!Number.isFinite(m)||m<=0)||percentages.some(p=>!Number.isFinite(p)||p<0)||Math.abs(percentages.reduce((a,b)=>a+b,0)-100)>1e-8)throw new Error('Invalid isotope data');
 return masses.reduce((sum,m,i)=>sum+m*percentages[i]/100,0);
};
export const isotopeMix=(heavyPercent:number)=>{
 const heavy=Math.min(100,Math.max(0,heavyPercent));
 return { light:100-heavy,heavy, mass:average([MASSES['Cl-35'],MASSES['Cl-37']],[100-heavy,heavy]) };
};
export type MoleculeKey='H2'|'O2'|'H2O'|'CO2'|'CO'|'NH3'|'CH4'|'H2O2';
export type Element='H'|'C'|'N'|'O';
export const ATOMIC_WEIGHTS:Record<Element,number>={H:1.008,C:12.011,N:14.007,O:15.999};
export const MOLECULES:Record<MoleculeKey,{formula:string;name:string;composition:Partial<Record<Element,number>>;shape:string}>={
 H2:{formula:'H₂',name:'ไฮโดรเจน',composition:{H:2},shape:'เชิงเส้น'},
 O2:{formula:'O₂',name:'ออกซิเจน',composition:{O:2},shape:'เชิงเส้น'},
 H2O:{formula:'H₂O',name:'น้ำ',composition:{H:2,O:1},shape:'งอ'},
 CO2:{formula:'CO₂',name:'คาร์บอนไดออกไซด์',composition:{C:1,O:2},shape:'เชิงเส้น'},
 CO:{formula:'CO',name:'คาร์บอนมอนอกไซด์',composition:{C:1,O:1},shape:'เชิงเส้น'},
 NH3:{formula:'NH₃',name:'แอมโมเนีย',composition:{N:1,H:3},shape:'พีระมิดฐานสามเหลี่ยม'},
 CH4:{formula:'CH₄',name:'มีเทน',composition:{C:1,H:4},shape:'ทรงสี่หน้า'},
 H2O2:{formula:'H₂O₂',name:'ไฮโดรเจนเปอร์ออกไซด์',composition:{H:2,O:2},shape:'ไม่เป็นระนาบ'}
};
export const molecularMass=(key:MoleculeKey)=>Object.entries(MOLECULES[key].composition).reduce((sum,[el,n])=>sum+ATOMIC_WEIGHTS[el as Element]*(n??0),0);
export const isComplete=(key:MoleculeKey,added:Partial<Record<Element,number>>)=>Object.keys(ATOMIC_WEIGHTS).every(k=>(added[k as Element]??0)===(MOLECULES[key].composition[k as Element]??0));
export const canAdd=(key:MoleculeKey,added:Partial<Record<Element,number>>,el:Element)=>(added[el]??0)<(MOLECULES[key].composition[el]??0);
