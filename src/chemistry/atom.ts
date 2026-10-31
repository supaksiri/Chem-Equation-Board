/** Scientific core: independent of UI, 3D scene and React. */
export type Atom = Readonly<{p:number;n:number;e:number}>;
export type ElementData = Readonly<{symbol:string;th:string;en:string}>;
export const ELEMENTS: readonly ElementData[] = [
 {symbol:'—',th:'ไม่มีธาตุ',en:'None'},{symbol:'H',th:'ไฮโดรเจน',en:'Hydrogen'},
 {symbol:'He',th:'ฮีเลียม',en:'Helium'},{symbol:'Li',th:'ลิเทียม',en:'Lithium'},
 {symbol:'Be',th:'เบริลเลียม',en:'Beryllium'},{symbol:'B',th:'โบรอน',en:'Boron'},
 {symbol:'C',th:'คาร์บอน',en:'Carbon'},{symbol:'N',th:'ไนโตรเจน',en:'Nitrogen'},
 {symbol:'O',th:'ออกซิเจน',en:'Oxygen'},{symbol:'F',th:'ฟลูออรีน',en:'Fluorine'},
 {symbol:'Ne',th:'นีออน',en:'Neon'},{symbol:'Na',th:'โซเดียม',en:'Sodium'},
 {symbol:'Mg',th:'แมกนีเซียม',en:'Magnesium'},{symbol:'Al',th:'อะลูมิเนียม',en:'Aluminium'},
 {symbol:'Si',th:'ซิลิคอน',en:'Silicon'},{symbol:'P',th:'ฟอสฟอรัส',en:'Phosphorus'},
 {symbol:'S',th:'กำมะถัน',en:'Sulfur'},{symbol:'Cl',th:'คลอรีน',en:'Chlorine'},
 {symbol:'Ar',th:'อาร์กอน',en:'Argon'},{symbol:'K',th:'โพแทสเซียม',en:'Potassium'},
 {symbol:'Ca',th:'แคลเซียม',en:'Calcium'}
] as const;
export const MAX_PARTICLES = 40;
export const ISOTOPE_MASS_U: Readonly<Record<string,number>> = {
  '1-0':1.00782503223,'1-1':2.01410177812,'1-2':3.01604928199,
  '2-1':3.0160293201,'2-2':4.00260325413,
  '3-3':6.0151228874,'3-4':7.0160034366,
  '5-5':10.01293695,'5-6':11.00930536,
  '6-6':12,'6-7':13.00335483507,'6-8':14.0032419884,
  '7-7':14.00307400443,'7-8':15.00010889888,
  '8-8':15.99491461957,'8-9':16.9991317565,'8-10':17.99915961286,
  '9-10':18.99840316273,'10-10':19.9924401762,
  '11-12':22.9897692820,'12-12':23.985041697,
  '13-14':26.98153853,'14-14':27.97692653465,
  '15-16':30.97376199842,'16-16':31.9720711744,
  '17-18':34.968852682,'17-20':36.965902602,
  '18-22':39.9623831237,'19-20':38.9637064864,'20-20':39.962590863
};
export const PRESETS: ReadonlyArray<{name:string;atom:Atom}> = [
 {name:'C-12',atom:{p:6,n:6,e:6}}, {name:'C-13',atom:{p:6,n:7,e:6}},
 {name:'H-1',atom:{p:1,n:0,e:1}}, {name:'H-2',atom:{p:1,n:1,e:1}},
 {name:'O-16',atom:{p:8,n:8,e:8}}, {name:'Cl-35',atom:{p:17,n:18,e:17}},
 {name:'Cl-37',atom:{p:17,n:20,e:17}}
];
export function validAtom(a:Atom):boolean { return [a.p,a.n,a.e].every(v=>Number.isInteger(v)&&v>=0&&v<=MAX_PARTICLES)&&a.p>0&&a.p<ELEMENTS.length; }
export function adjust(a:Atom,k:keyof Atom,d:number):Atom {
 const v=Math.max(0,Math.min(MAX_PARTICLES,a[k]+d));
 const next={...a,[k]:v};
 return next.p>0&&next.p<ELEMENTS.length?next:a;
}
export function addParticle(a:Atom,k:keyof Atom):Atom{return adjust(a,k,1)}
export function describe(a:Atom){
 const el=ELEMENTS[a.p]??ELEMENTS[0];
 const exact=ISOTOPE_MASS_U[`${a.p}-${a.n}`];
 return {symbol:el.symbol,th:el.th,en:el.en,Z:a.p,A:a.p+a.n,charge:a.p-a.e,isotope:`${el.symbol}-${a.p+a.n}`,massU:exact??null,known:exact!==undefined};
}
export function formatCharge(value:number):string {return value===0?'เป็นกลาง':value>0?`${value}+`:`${-value}−`}
export function isSameIsotope(a:Atom,b:Atom):boolean{return a.p===b.p&&a.n===b.n;}
export function atomicDifference(a:Atom,b:Atom){return {p:b.p-a.p,n:b.n-a.n,e:b.e-a.e,A:(b.p+b.n)-(a.p+a.n)};}
export type Mission = Readonly<{id:string;label:string;description:string;hint:string;check:(a:Atom,b:Atom)=>boolean}>;
export const MISSIONS:ReadonlyArray<Mission> = [
 {id:'carbon13',label:'ค้นหา C-13',description:'ทำให้อะตอม A เป็นคาร์บอน-13',hint:'คาร์บอนต้องมี 6 โปรตอน ลองเปลี่ยนนิวตรอน',check:a=>a.p===6&&a.n===7},
 {id:'ions',label:'ความลับของประจุ',description:'ทำให้อะตอม A มีประจุ +1 โดยยังเป็นคาร์บอน',hint:'ประจุเกี่ยวข้องกับจำนวนอิเล็กตรอน',check:a=>a.p===6&&a.e===5},
 {id:'twins',label:'พี่น้องไอโซโทป',description:'ทำให้ A และ B เป็นไอโซโทปต่างกันของธาตุเดียวกัน',hint:'โปรตอนเท่ากัน แต่นิวตรอนต้องต่างกัน',check:(a,b)=>a.p===b.p&&a.n!==b.n},
 {id:'c12c13',label:'จับคู่คาร์บอน',description:'สร้าง C-12 ที่ A และ C-13 ที่ B',hint:'ทั้งคู่มีโปรตอน 6 ตัว และมีนิวตรอน 6 กับ 7 ตัว',check:(a,b)=>a.p===6&&a.n===6&&b.p===6&&b.n===7},
 {id:'isotopeheavy',label:'เพิ่มเลขมวล',description:'สร้าง A และ B ที่โปรตอนเท่ากัน แต่เลขมวล B มากกว่า A เท่ากับ 2',hint:'เปลี่ยนจำนวนนิวตรอนของ B โดยไม่เปลี่ยนโปรตอน',check:(a,b)=>a.p===b.p&&b.p+b.n===a.p+a.n+2}
];
