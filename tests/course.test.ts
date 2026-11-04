import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from '../src/course';
import { createDatabase,checkExercise,equivalent } from '../src/engine';
import { parseCSV,toCSV } from '../src/csv';
import { guides, workedExamples } from '../src/teaching';
test('31 lessons, 62 unique exercises and all reference queries execute',async()=>{
 assert.equal(lessons.length,31);assert.equal(new Set(lessons.map(l=>l.id)).size,31);assert.equal(lessons.flatMap(l=>l.exercises).length,62);
 const db=await createDatabase();
 try{for(const l of lessons){
 assert(guides[l.id],`Missing teaching guide for ${l.id}`);
 assert(workedExamples(l).length>=2,`Not enough worked examples for ${l.id}`);
 for(const example of workedExamples(l)){
  await db.exec('BEGIN;');
  try{
   const results=await db.exec(example.sql);
   if(example.expectedRows!==undefined) assert.equal(results.at(-1)?.rows.length,example.expectedRows,`${l.id}: ${example.title}`);
  }finally{await db.exec('ROLLBACK;');}
 }
 for(const ex of l.exercises){console.log('Checking',l.id,ex.title);const r=await checkExercise(ex,ex.solution);assert.equal(r.passed,true,`${l.id}: ${ex.title}`);}}
 }finally{await db.close();}
});
test('first lesson explains SELECT/FROM and demonstrates whole tables and selected columns',async()=>{
 const db=await createDatabase();
 try{
  const examples=workedExamples(lessons[0]);
  assert.equal(examples.length,3);
  const results=await Promise.all(examples.map(ex=>db.query(ex.sql)));
  assert.deepEqual(results.map(r=>r.fields.map(f=>f.name)),[
   ['film_id','title','description','release_year','length','rental_rate','replacement_cost','rating','language_id'],
   ['title'],['title','length'],
  ]);
  assert(results.every(r=>r.rows.length===10));
  assert(guides['prvni-dotaz'].concepts.some(c=>c.command==='SELECT'));
  assert(guides['prvni-dotaz'].concepts.some(c=>c.command==='FROM'));
 }finally{await db.close();}
});
test('grader rejects wrong rows, names, ordering and duplicate counts',()=>{
 const r=(rows:unknown[])=>({fields:[{name:'x',dataTypeID:23}],rows:rows.map(x=>({x}))});
 assert(equivalent(r([1,2]),r([2,1])));assert(!equivalent(r([1,2]),r([2,1]),true));assert(!equivalent(r([1,1]),r([1])));assert(!equivalent(r([null]),r([0])));assert(!equivalent(r([1]),{fields:[{name:'y',dataTypeID:23}],rows:[{y:1}]}));
});
test('grader rejects incorrect SELECT, missing UPDATE and wrong CREATE',async()=>{
 assert.equal((await checkExercise(lessons[0].exercises[0],'SELECT * FROM film')).passed,false);
 assert.equal((await checkExercise(lessons.find(l=>l.id==='update-delete')!.exercises[0],'SELECT 1')).passed,false);
 assert.equal((await checkExercise(lessons.find(l=>l.id==='create')!.exercises[0],'CREATE TABLE note(note_id text,body text)')).passed,false);
});
test('CSV handles commas, quotes, UTF8, CRLF, multiline fields and rejects malformed rows',()=>{
 const fields=[{name:'jmeno'},{name:'text'}],rows=[{jmeno:'Žofie',text:'a,"b"\nc'}];
 assert.deepEqual(parseCSV(toCSV(fields,rows)),[['jmeno','text'],['Žofie','a,"b"\nc']]);
 assert.throws(()=>parseCSV('a,a\n1,2'));assert.throws(()=>parseCSV('a,b\n1'));assert.throws(()=>parseCSV('a\n"oops'));
});
