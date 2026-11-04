import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { sql, PostgreSQL } from '@codemirror/lang-sql';
import { lessons } from './course';
import { guides, workedExamples } from './teaching';
import { tables } from './data';
import type { Result } from './engine';
import { toCSV } from './csv';
import './style.css';
const $=<T extends HTMLElement=HTMLElement>(s:string)=>document.querySelector<T>(s)!;
const escape=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
type Progress={version:1;done:string[];drafts:Record<string,string>};
const empty=():Progress=>({version:1,done:[],drafts:{}});
let progress:Progress=empty(),storageWarning='';
try{const p=JSON.parse(localStorage.getItem('sql-akademie-v1')||'null');if(validProgress(p))progress=p;}catch{storageWarning='Ukládání v tomto prohlížeči není dostupné. Použijte export postupu.';}
function validProgress(p:unknown):p is Progress {if(!p||typeof p!=='object')return false;const v=p as Progress;return v.version===1&&Array.isArray(v.done)&&v.done.every(x=>typeof x==='string')&&!!v.drafts&&typeof v.drafts==='object'&&!Array.isArray(v.drafts)&&Object.values(v.drafts).every(x=>typeof x==='string');}
function save(){try{localStorage.setItem('sql-akademie-v1',JSON.stringify(progress));}catch{storageWarning='Postup se nedaří uložit. Použijte Export postupu.';$('#storage').textContent=storageWarning;}}
type LessonMode = 'examples' | 'practice';
let mode:LessonMode='examples';
let li=0,ei=0,hint=0,view:EditorView,busy=false,results:Result[]=[],generation=0;
const key=()=>lessons[li].id+':'+(mode==='examples'?'example':ei);
let worker:Worker,seq=0;const pending=new Map<number,{resolve:(v:any)=>void;reject:(e:Error)=>void;timer:ReturnType<typeof setTimeout>}>();
function startWorker(){worker=new Worker(new URL('./worker.ts',import.meta.url),{type:'module'});worker.onmessage=({data})=>{const p=pending.get(data.id);if(!p)return;clearTimeout(p.timer);pending.delete(data.id);data.error?p.reject(new Error(data.error)):p.resolve(data.result);};worker.onerror=()=>resetWorker('Databázi se nepodařilo spustit. Zkuste Obnovit data nebo stránku načíst znovu.');}
function resetWorker(message:string){worker.terminate();for(const p of pending.values()){clearTimeout(p.timer);p.reject(new Error(message));}pending.clear();startWorker();}
function rpc(method:string,args:unknown={}):Promise<any>{return new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>resetWorker('Operace trvala příliš dlouho. Klikněte na Obnovit data a zkuste jednodušší dotaz.'),method==='check'?45000:30000);pending.set(id,{resolve,reject,timer});worker.postMessage({id,method,args});});}
startWorker();
$('#app').innerHTML=`<header><a class="brand" href="#prvni-dotaz"><span class="brand-icon">S<span>Q</span>L</span><span>SQL Akademie<small>PostgreSQL přímo v prohlížeči</small></span></a><div class="header-actions"><button id="export-progress">Export postupu</button><label class="button" for="import-progress">Import postupu</label><input hidden type="file" id="import-progress" accept="application/json,.json"></div></header><div class="layout"><aside><div class="course-intro"><span class="eyebrow">OD DOTAZU K DATABÁZI</span><h2>Vaše cesta k SQL</h2><p>31 lekcí · 62 úloh · vlastním tempem</p><div class="progress-track"><div id="progress-bar"></div></div><p id="progress-label"></p></div><nav aria-label="Lekce kurzu" id="nav"></nav><p class="aside-note">Bez účtu a bez instalace. Postup se ukládá pouze v tomto prohlížeči; přenos mezi zařízeními umožňuje export.</p></aside><main><div class="lesson-heading"><div><span id="module" class="eyebrow"></span><h1 id="title"></h1></div><span class="lesson-number" id="lesson-number"></span></div><p id="storage" role="status"></p><section class="theory" aria-labelledby="theory-heading"><span class="eyebrow">VÝKLAD</span><h2 id="theory-heading">1. Nejdřív porozumějte příkazům</h2><p id="goal" class="learning-goal"></p><p id="theory"></p><dl id="concepts"></dl><h3 class="syntax-label">Jak se příkaz zapisuje</h3><pre id="syntax"></pre><p class="syntax-note">Jde o obecný vzor. Konkrétní spustitelné dotazy najdete v příkladech níže.</p></section><section class="worked-examples" aria-labelledby="examples-heading"><span class="eyebrow">VEDENÉ PŘÍKLADY</span><h2 id="examples-heading">2. Projděte si příklady</h2><p>Každý příklad si můžete vložit do editoru, spustit a upravit. Při vložení se obnoví data, takže začínáte vždy od stejného stavu. Příklady se nehodnotí.</p><div id="examples"></div></section><section class="workspace"><div class="workspace-top"><h2 id="workspace-title">Cvičiště pro příklady</h2><button id="practice-mode" class="check">Přejít na úlohy →</button></div><div id="exercise-tabs" role="group" aria-label="Úlohy lekce" hidden></div><p id="study-note">Teď si ukázku vyzkoušejte. Až jí porozumíte, přejděte k samostatným úlohám.</p><div class="task" id="task" hidden><span class="eyebrow" id="exercise-number"></span><h3 id="exercise-title"></h3><p id="prompt"></p></div><div class="editor-label"><label id="sql-label">Váš SQL dotaz</label><span>Ctrl / ⌘ + Enter spustí dotaz</span></div><div id="editor"></div><div class="toolbar"><button class="primary" id="run">▶ Spustit</button><button class="check" id="check" hidden>Zkontrolovat řešení</button><button id="reset">Obnovit data</button><span id="db-status" role="status"></span></div><div id="feedback" role="status" aria-live="polite"></div><div class="help" id="exercise-help" hidden><button id="hint">Nápověda</button><button id="solution">Zobrazit řešení</button><p id="hint-text"></p><pre id="solution-text" hidden></pre></div><div class="result-header"><h3>Výsledek dotazu</h3><button id="csv" disabled>Stáhnout CSV</button></div><div id="results" aria-live="polite"><p class="empty">Spusťte svůj první dotaz. Výsledek se objeví tady.</p></div></section><details class="database" open><summary>Prohlížeč databáze a nástroje</summary><p>Kliknutím na tabulku načtete prvních 50 řádků. Dotaz se vloží do editoru.</p><div id="tables"></div><details><summary>Mapa vztahů</summary><pre>customer ──&lt; payment &gt;── staff
film ──&lt; inventory
film &gt;── language
film ──&lt; film_category &gt;── category
film ──&lt; film_actor &gt;── actor
student ──&lt; student_house &gt;── house</pre><p>Symbol ──&lt; znamená „jeden k více“. Konkrétní spojovací sloupce najdete u tabulek výše.</p></details><details><summary>Import CSV</summary><p>UTF-8, čárka jako oddělovač, první řádek obsahuje unikátní názvy sloupců. Nejvýše 1000 řádků / 500 kB. Vytvoří nebo nahradí tabulku csv_import; všechny hodnoty jsou text. Změny zůstávají jen v aktuálním cvičišti.</p><input type="file" id="import-csv" accept=".csv,text/csv"></details></details><details class="cheatsheet"><summary>Tahák SQL</summary><pre>SELECT sloupce FROM tabulka
JOIN druha ON tabulka.id = druha.odkaz
WHERE podmínka
GROUP BY sloupce
HAVING podmínka_na_agregaci
ORDER BY sloupce ASC / DESC
LIMIT počet;

COUNT(*) · SUM(x) · AVG(x) · MIN(x) · MAX(x)
IS NULL · COALESCE(x, náhrada) · NULLIF(x, 0)
BEGIN; … COMMIT;  /  ROLLBACK;</pre></details><div class="lesson-controls"><button id="prev">← Předchozí</button><button id="next">Další lekce →</button></div><footer>Vlastní výuková data · PGlite / PostgreSQL · <a href="https://www.youtube.com/playlist?list=PLQ8x_VWW6Akv0gs9Fsrp69IOfX8hmREXp" target="_blank" rel="noopener noreferrer">Doplňující videa k učebnici ↗</a><p>Kurz vychází z témat dodané učebnice „SQL kurz“. Texty, úlohy a data jsou nově připravené. Stav databáze se při změně úlohy obnoví. Odevzdaný dotaz se hodnotí na čerstvých datech.</p></footer></main></div>`;
$('#storage').textContent=storageWarning;
view=new EditorView({state:EditorState.create({doc:'',extensions:[basicSetup,sql({dialect:PostgreSQL,schema:Object.fromEntries(Object.entries(tables).map(([k,v])=>[k,v.split(' · ').map(s=>s.split(' ')[0])]))}),EditorView.contentAttributes.of({'aria-label':'SQL editor',spellcheck:'false'}),EditorView.updateListener.of(u=>{if(u.docChanged){progress.drafts[key()]=u.state.doc.toString();save();}})]}),parent:$('#editor')});
function setSQL(value:string){view.dispatch({changes:{from:0,to:view.state.doc.length,insert:value}});}
function nav(){const total=lessons.reduce((n,l)=>n+l.exercises.length,0),done=progress.done.filter(k=>lessons.some(l=>l.exercises.some((_,i)=>k===l.id+':'+i))).length;$('#progress-label').textContent=`${done} z ${total} úloh hotovo`;$('#progress-bar').style.width=`${100*done/total}%`;let module='';$('#nav').innerHTML=lessons.map((l,i)=>{const heading=l.module!==module?`<h3>${escape(l.module)}</h3>`:'';module=l.module;const complete=l.exercises.every((_,j)=>progress.done.includes(l.id+':'+j));return heading+`<a href="#${l.id}" ${i===li?'aria-current="page"':''}><span>${String(i+1).padStart(2,'0')}</span>${escape(l.title)}<b aria-label="${complete?'Dokončeno':'Nedokončeno'}">${complete?'✓':''}</b></a>`;}).join('');}
function feedback(text:string,type=''){const el=$('#feedback');el.textContent=text;el.className=type;}
function lock(value:boolean){
  busy=value;
  for(const id of ['run','check','reset','hint','solution']) $<HTMLButtonElement>('#'+id).disabled=value;
  document.querySelectorAll<HTMLButtonElement>('[data-example]').forEach(button=>button.disabled=value);
  $<HTMLInputElement>('#import-csv').disabled=value;
  $('#db-status').textContent=value?'Databáze pracuje…':'Připraveno · soukromé cvičiště';
}
async function initialize(){const g=++generation;lock(true);feedback('Připravuji výchozí data…');try{await rpc('init',{setup:mode==='practice'?lessons[li].exercises[ei].setup:undefined});if(g===generation)feedback('Databáze připravena. Můžete experimentovat.');}catch(e){if(g===generation)feedback(String((e as Error).message),'error');}finally{if(g===generation)lock(false);}}
function displayMode(){
  const practicing=mode==='practice';
  $('#workspace-title').textContent=practicing?'3. Samostatné úlohy':'Cvičiště pro příklady';
  $('#practice-mode').textContent=practicing?'← Zpět k příkladům':'Přejít na úlohy →';
  for(const selector of ['#exercise-tabs','#task','#check','#exercise-help']) $(selector).hidden=!practicing;
  $('#study-note').hidden=practicing;
  $('#sql-label').textContent=practicing?'Vaše řešení úlohy':'SQL editor pro zkoušení příkladů';
}
function render(){
  const lesson=lessons[li],ex=lesson.exercises[ei],guide=guides[lesson.id];
  hint=0;
  $('#module').textContent=lesson.module;
  $('#title').textContent=lesson.title;
  $('#lesson-number').textContent=`${li+1} / ${lessons.length}`;
  $('#goal').textContent=guide.goal;
  $('#theory').textContent=lesson.theory;
  $('#concepts').innerHTML=guide.concepts.map(c=>`<div><dt><code>${escape(c.command)}</code></dt><dd>${escape(c.explanation)}</dd></div>`).join('');
  $('#syntax').textContent=guide.syntax;
  $('#examples').innerHTML=workedExamples(lesson).map((ex,i)=>`<article class="worked-example"><div class="example-label"><span>PŘÍKLAD ${i+1}</span><button ${i===0?'id="copy-example"':''} data-example="${i}">Vložit do editoru</button></div><h3>${escape(ex.title)}</h3><pre>${escape(ex.sql)}</pre><h4>Jak dotaz funguje</h4><ol>${ex.steps.map(step=>`<li>${escape(step)}</li>`).join('')}</ol><p class="expected-result"><strong>Co uvidíte:</strong> ${escape(ex.outcome)}</p></article>`).join('');
  document.querySelectorAll<HTMLButtonElement>('[data-example]').forEach(button=>button.onclick=()=>copyExample(Number(button.dataset.example)));
  $('#exercise-number').textContent=`ÚLOHA ${ei+1} ZE ${lesson.exercises.length}`;
  $('#exercise-title').textContent=ex.title;
  $('#prompt').textContent=ex.prompt;
  $('#hint-text').textContent='';
  $('#solution-text').hidden=true;
  $('#solution-text').textContent=ex.solution;
  $('#exercise-tabs').innerHTML=lesson.exercises.map((_,i)=>`<button data-ex="${i}" aria-pressed="${i===ei}">${progress.done.includes(lesson.id+':'+i)?'✓ ':''}Úloha ${i+1}</button>`).join('');
  $('#exercise-tabs').querySelectorAll<HTMLButtonElement>('button').forEach(button=>button.onclick=()=>{location.hash=`${lesson.id}/${Number(button.dataset.ex)+1}`;});
  displayMode();
  setSQL(progress.drafts[key()]??(mode==='examples'?lesson.example:ex.starter??'-- Napište své řešení zde\n'));
  clearResults();
  nav();
  $<HTMLButtonElement>('#prev').disabled=li===0;
  $<HTMLButtonElement>('#next').disabled=li===lessons.length-1;
  void initialize();
}
function clearResults(){
  results=[];
  $('#results').innerHTML='<p class="empty">Zatím žádný výsledek. Zkuste tlačítko Spustit.</p>';
  $<HTMLButtonElement>('#csv').disabled=true;
}
function copyExample(index:number){
  if(busy)return;
  mode='examples';
  history.replaceState(null,'',`#${lessons[li].id}`);
  displayMode();
  setSQL(workedExamples(lessons[li])[index].sql);
  clearResults();
  void initialize();
  view.focus();
  $('.workspace').scrollIntoView({block:'start'});
}
function route(){
  const previousLesson=li;
  const [slug,index]=location.hash.slice(1).split('/');
  const found=lessons.findIndex(l=>l.id===slug);
  li=found<0?0:found;
  mode=index?'practice':'examples';
  ei=Math.min(Math.max(Math.trunc(Number(index)||1)-1,0),lessons[li].exercises.length-1);
  render();
  if(previousLesson!==li) $('.lesson-heading').scrollIntoView({block:'start'});
}
async function run(){if(busy)return;lock(true);const g=generation;feedback('Spouštím dotaz…');try{const data:Result[]=await rpc('run',{sql:view.state.doc.toString()});if(g!==generation)return;results=data;$('#results').innerHTML=data.map((r,i)=>r.fields.length?`<div class="result-caption">Výsledek ${i+1} · ${r.rows.length} řádků${r.rows.length>200?' · zobrazeno prvních 200':''}</div><div class="table-scroll"><table><thead><tr>${r.fields.map(f=>`<th scope="col">${escape(f.name)}</th>`).join('')}</tr></thead><tbody>${r.rows.slice(0,200).map(row=>`<tr>${r.fields.map(f=>`<td>${row[f.name]===null?'<span class="null">NULL</span>':escape(row[f.name] instanceof Date?(row[f.name] as Date).toISOString():row[f.name])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:`<p class="result-caption">Příkaz dokončen · změněno ${r.affectedRows??0} řádků.</p>`).join('')||'<p class="empty">Dotaz nevrátil žádný výsledek.</p>';$<HTMLButtonElement>('#csv').disabled=!data.some(r=>r.fields.length);feedback(mode==='practice'?'Dotaz proveden. Správnost úlohy ověří tlačítko Zkontrolovat řešení.':'Příklad proveden. Porovnejte výsledek s vysvětlením, zkuste dotaz upravit nebo přejděte na úlohy.');}catch(e){if(g===generation)feedback((e as Error).message,'error');}finally{if(g===generation)lock(false);}}
$('#run').onclick=()=>void run();$('#reset').onclick=()=>{results=[];$('#results').innerHTML='<p class="empty">Data se obnovují. Editor zůstává zachovaný.</p>';$<HTMLButtonElement>('#csv').disabled=true;void initialize();};
$('#check').onclick=async()=>{if(busy||mode!=='practice')return;const g=generation,k=key(),sql=view.state.doc.toString();lock(true);feedback('Kontroluji na čerstvé kopii dat…');try{const r=await rpc('check',{lesson:li,exercise:ei,sql});if(g!==generation)return;if(r.passed){if(!progress.done.includes(k))progress.done.push(k);save();nav();}feedback(r.message,r.passed?'success':'error');}catch(e){if(g===generation)feedback((e as Error).message,'error');}finally{if(g===generation)lock(false);}};
$('#practice-mode').onclick=()=>{location.hash=mode==='examples'?lessons[li].id+'/1':lessons[li].id;};
$('#hint').onclick=()=>{const hints=lessons[li].exercises[ei].hints;$('#hint-text').textContent=hints[Math.min(hint++,hints.length-1)];};
$('#solution').onclick=()=>{$('#solution-text').hidden=!$('#solution-text').hidden;};
$('#prev').onclick=()=>{if(li>0)location.hash=lessons[li-1].id;};$('#next').onclick=()=>{if(li<lessons.length-1)location.hash=lessons[li+1].id;};
$('#tables').innerHTML=Object.entries(tables).map(([name,columns])=>`<div class="schema-row"><button data-table="${name}">${name}</button><span>${escape(columns)}</span></div>`).join('');
$('#tables').querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.onclick=()=>{if(busy)return;setSQL(`SELECT * FROM ${b.dataset.table} LIMIT 50;`);void run();});
function download(name:string,text:string,type:string){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('#csv').onclick=()=>{const r=results.filter(r=>r.fields.length).at(-1);if(r)download('sql-vysledek.csv',toCSV(r.fields,r.rows),'text/csv;charset=utf-8');};
$('#export-progress').onclick=()=>download('sql-akademie-postup.json',JSON.stringify(progress,null,2),'application/json');
$<HTMLInputElement>('#import-progress').onchange=async ev=>{const input=ev.target as HTMLInputElement;try{const f=input.files?.[0];if(!f)return;if(f.size>2000000)throw new Error('Soubor postupu je příliš velký.');const p=JSON.parse(await f.text());if(!validProgress(p))throw new Error('Neplatný formát zálohy postupu.');progress={version:1,done:[...new Set([...progress.done,...p.done])],drafts:{...progress.drafts,...p.drafts}};save();render();}catch(e){feedback((e as Error).message,'error');}finally{input.value='';}};
$<HTMLInputElement>('#import-csv').onchange=async ev=>{const input=ev.target as HTMLInputElement;const f=input.files?.[0];if(!f)return;if(f.size>500000){feedback('CSV může mít nejvýše 500 kB.','error');input.value='';return;}lock(true);const g=generation;try{const n=await rpc('csv',{text:await f.text()});if(g===generation){setSQL('SELECT * FROM csv_import;');feedback(`Načteno ${n} řádků do csv_import. Klikněte na Spustit.`,'success');}}catch(e){if(g===generation)feedback((e as Error).message,'error');}finally{if(g===generation)lock(false);input.value='';}};
document.addEventListener('keydown',ev=>{if((ev.ctrlKey||ev.metaKey)&&ev.key==='Enter'){ev.preventDefault();void run();}});window.addEventListener('hashchange',route);route();
