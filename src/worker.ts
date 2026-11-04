import { createDatabase, checkExercise } from './engine';
import { lessons } from './course';
import { parseCSV } from './csv';
let db:Awaited<ReturnType<typeof createDatabase>>|undefined;
let queue=Promise.resolve();
self.onmessage=({data})=>{queue=queue.then(async()=>{
 const {id,method,args}=data;
 try{
 let result:unknown;
 if(method==='init'){await db?.close();db=await createDatabase(args?.setup);result=true;}
 else if(method==='run'){if(!db) throw new Error('Databáze není připravená.');result=await db.exec(args.sql);}
 else if(method==='check'){const ex=lessons[args.lesson].exercises[args.exercise];result=await checkExercise(ex,args.sql);}
 else if(method==='csv'){
  if(!db)throw new Error('Databáze není připravená.');
  const rows=parseCSV(args.text);const header=rows.shift()!;
  const quote=(s:string)=>'"'+s.replaceAll('"','""')+'"';
  await db.transaction(async tx=>{
   await tx.exec('DROP TABLE IF EXISTS csv_import; CREATE TABLE csv_import('+header.map(h=>quote(h)+' text').join(',')+');');
   for(const row of rows) await tx.query('INSERT INTO csv_import VALUES('+row.map((_,i)=>'$'+(i+1)).join(',')+')',row);
  }); result=rows.length;
 }
 else throw new Error('Neznámá operace.');
 self.postMessage({id,result});
 }catch(e){self.postMessage({id,error:e instanceof Error?e.message:String(e)});}
}).catch(()=>{});};
