import { PGlite } from '@electric-sql/pglite';
import { seed } from './data';
import type { Exercise } from './course';
export async function createDatabase(setup='') { const db=new PGlite(); await db.waitReady; await db.exec(seed); if(setup) await db.exec(setup); return db; }
export type Result = { fields:{name:string;dataTypeID:number}[]; rows:Record<string,unknown>[]; affectedRows?:number };
export function equivalent(a:Result,b:Result,ordered=false) {
 if(JSON.stringify(a.fields.map(f=>f.name))!==JSON.stringify(b.fields.map(f=>f.name))) return false;
 const encode=(r:Record<string,unknown>,fields:Result['fields'])=>JSON.stringify(fields.map(f=>r[f.name]));
 const ar=a.rows.map(r=>encode(r,a.fields)),br=b.rows.map(r=>encode(r,b.fields));
 if(!ordered){ar.sort();br.sort();} return JSON.stringify(ar)===JSON.stringify(br);
}
export async function checkExercise(ex:Exercise,sql:string) {
 const actual=await createDatabase(ex.setup); let expected:PGlite|undefined;
 try {
  expected=await createDatabase(ex.setup);
  const a=await actual.exec(sql) as Result[];
  const b=await expected.exec(ex.solution) as Result[];
  const av=ex.verify?await actual.exec(ex.verify) as Result[]:a.slice(-1);
  const bv=ex.verify?await expected.exec(ex.verify) as Result[]:b.slice(-1);
  const passed=av.length>0 && av.length===bv.length && av.every((r,i)=>equivalent(r,bv[i],ex.verify?true:ex.ordered));
  return {passed,message:passed?'Správně! Úloha je splněná.':'Výsledek zatím neodpovídá zadání. Zkontrolujte názvy a pořadí sloupců, podmínky, počet řádků a případné řazení.'};
 } finally {await actual.close();await expected?.close();}
}
