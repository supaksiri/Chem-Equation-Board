export type Progress={completed:string[];attempts:{date:string;score:number;total:number;scope:string}[]};
const KEY='atomverse-v4-progress';
export const emptyProgress=():Progress=>({completed:[],attempts:[]});
export function loadProgress():Progress{try{const data=JSON.parse(localStorage.getItem(KEY)||'null');if(data&&Array.isArray(data.completed)&&Array.isArray(data.attempts))return data;}catch{}return emptyProgress();}
export function saveProgress(data:Progress){try{localStorage.setItem(KEY,JSON.stringify(data));}catch{/* storage may be blocked */}}
