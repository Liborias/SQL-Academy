export function parseCSV(text:string):string[][] {
 text=text.replace(/^\uFEFF/,'');const rows:string[][]=[];let row:string[]=[],value='',quoted=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(c==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++;}else if(quoted||!value)quoted=!quoted;else throw new Error('Neplatné uvozovky v CSV.');}
  else if(c===','&&!quoted){row.push(value);value='';}
  else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(value);rows.push(row);row=[];value='';}
  else value+=c;
 }
 if(quoted)throw new Error('Neuzavřené uvozovky v CSV.');
 if(value||row.length){row.push(value);rows.push(row);}
 if(!rows.length||!rows[0].length||rows[0].some(h=>!h.trim())||new Set(rows[0]).size!==rows[0].length)throw new Error('CSV potřebuje neprázdnou hlavičku s unikátními názvy.');
 if(rows.length>1001)throw new Error('Import je omezen na 1000 datových řádků.');
 if(rows.some(r=>r.length!==rows[0].length))throw new Error('Všechny řádky musí mít stejný počet sloupců. Oddělovačem je čárka.');
 return rows;
}
export const toCSV=(fields:{name:string}[],rows:Record<string,unknown>[])=>'\uFEFF'+[fields.map(f=>f.name),...rows.map(r=>fields.map(f=>r[f.name]))].map(row=>row.map(x=>'"'+String(x??'').replaceAll('"','""')+'"').join(',')).join('\r\n');
