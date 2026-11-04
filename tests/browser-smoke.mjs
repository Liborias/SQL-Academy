import { chromium,expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
try {
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.COURSE_URL||'http://localhost:4173');
 const run=page.getByRole('button',{name:'▶ Spustit',exact:true});
 await expect(run).toBeEnabled({timeout:60000});
 const editor=page.locator('.cm-content');
 await editor.fill('SELECT * FROM film;');await page.locator('#check').click();await expect(page.locator('#feedback')).toContainText('neodpovídá',{timeout:60000});
 await editor.fill('SELECT * FROM customer;');await run.click();await expect(page.locator('#results table tbody tr')).toHaveCount(6);
 await page.locator('#check').click();await expect(page.locator('#feedback')).toContainText('Správně!',{timeout:60000});await expect(page.locator('#progress-label')).toHaveText('1 z 62 úloh hotovo');
 const csvDownload=page.waitForEvent('download');await page.locator('#csv').click();const csv=await csvDownload;expect(await readFile(await csv.path(),'utf8')).toContain('Nováková');
 const progressDownload=page.waitForEvent('download');await page.locator('#export-progress').click();const backup=await progressDownload;const progress=JSON.parse(await readFile(await backup.path(),'utf8'));expect(progress.done).toContain('prvni-dotaz:0');
 await page.reload();await expect(run).toBeEnabled({timeout:60000});await expect(editor).toContainText('SELECT * FROM customer;');await expect(page.locator('#progress-label')).toHaveText('1 z 62 úloh hotovo');
 await page.locator('button[data-ex="1"]').click();await expect(run).toBeEnabled({timeout:60000});await page.locator('#hint').click();await expect(page.locator('#hint-text')).not.toBeEmpty();await page.locator('#solution').click();await expect(page.locator('#solution-text')).toBeVisible();
 await page.getByText('Import CSV',{exact:true}).click();await page.locator('#import-csv').setInputFiles({name:'test.csv',mimeType:'text/csv',buffer:Buffer.from('jmeno,mesto\nŽofie,Praha\nAdam,Brno\n')});await expect(page.locator('#feedback')).toContainText('Načteno 2 řádků',{timeout:60000});await run.click();await expect(page.locator('#results table tbody tr')).toHaveCount(2);await expect(page.locator('#results')).toContainText('Žofie');
 await page.locator('#import-progress').setInputFiles({name:'progress.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(progress))});await expect(run).toBeEnabled({timeout:60000});
 await page.evaluate(()=>location.hash='rollup/1');await expect(page.locator('#title')).toHaveText('Mezisoučty ROLLUP');await expect(run).toBeEnabled({timeout:60000});await page.locator('#copy-example').click();await run.click();await expect(page.locator('#results table tbody tr')).toHaveCount(3);await page.locator('#check').click();await expect(page.locator('#feedback')).toContainText('Správně!',{timeout:60000});
 await page.setViewportSize({width:390,height:844});await expect(page.locator('#title')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'/tmp/sql-course-mobile.png',fullPage:true});
 expect(errors).toEqual([]);console.log('Browser smoke passed: real WASM queries, wrong/correct grading, CSV, progress persistence/import/export, navigation, ROLLUP, mobile layout.');
 await context.close();
} finally {await browser.close();}
