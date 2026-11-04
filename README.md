# SQL Akademie

Český interaktivní kurz PostgreSQL: **31 lekcí, 62 automaticky ověřovaných úloh, 8 modulů**. Student potřebuje pouze moderní prohlížeč. PostgreSQL běží lokálně prostřednictvím [PGlite](https://github.com/electric-sql/pglite), SQL editor používá CodeMirror. Žádné přihlášení ani databázový server.

## Obsah

1. Začínáme: první dotaz, editor, komentáře.
2. Vybíráme data: DISTINCT, COUNT, WHERE, AND/OR, ORDER BY, LIMIT, BETWEEN, IN, LIKE/ILIKE, NULL.
3. Souhrny: agregace, GROUP BY, HAVING, aliasy.
4. Propojujeme tabulky: INNER/LEFT/FULL JOIN, vztahy M:N, UNION/UNION ALL.
5. Funkce v praxi: datumy, EXTRACT, TO_CHAR, textové funkce, výpočty, přetypování.
6. Složitější otázky: poddotazy, EXISTS, self join.
7. Vlastní databáze: typy, klíče, CREATE, INSERT, UPDATE, DELETE, RETURNING, ALTER, CHECK, transakce.
8. Závěrečná praxe: CASE, NULLIF, pohledy, CSV, ROLLUP, závěrečný projekt.

Každá lekce postupuje od výkladu k příkladům a teprve potom k samostatným úlohám:

1. Cíl lekce, vysvětlení nových příkazů a obecný vzor zápisu.
2. Alespoň dva vedené příklady (v první lekci tři), každý s rozborem a očekávaným výsledkem. Celkem 63 příkladů; každý má vlastní tlačítko pro vložení do editoru.
3. Dvě samostatné úlohy s kontrolou, nápovědami a řešením. Student na ně přechází tlačítkem „Přejít na úlohy“.

Lekce se běžně otevírají v režimu příkladů. Příklady se nehodnotí a jejich SQL editor má samostatně uložený koncept, takže nepoškodí rozpracované řešení úlohy. Vložení příkladu obnoví výchozí databázi, aby šlo opakovat i příkazy měnící schéma nebo data. Přímé odkazy na úlohy (`#prvni-dotaz/1`) fungují i nadále.

Dále je k dispozici mapa vztahů, prohlížeč tabulek, SQL tahák, export výsledků a import CSV do vlastní tabulky.

Témata navazují na uživatelem dodanou učebnici „SQL kurz“ s 102 číslovanými videočástmi. Instalaci a ovládání PgAdminu nahrazuje práce v prohlížeči. Výklady, zadání a malá deterministická databáze jsou nově vytvořené. Obsahuje fiktivní filmy, zákazníky a studijní skupiny; nevyžaduje stahování původní databáze dvdrental ani externích tabulek. Odkaz na původní doplňující videa je v aplikaci; jejich zhlédnutí není podmínkou.

## Spuštění pro vývojáře

Ověřeno s Node.js 24 a npm 11:

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

`npm test` spouští testy přes `node:test` s TypeScript loaderem. Všech 63 vedených příkladů a 62 referenčních řešení se vykoná proti skutečnému PGlite, včetně kontrol změn schématu a dat. U příkladů se ověřují také uvedené počty výsledných řádků. Testují se i chybná řešení, řazení, duplicity, NULL a CSV. Testy jsou záměrně sekvenční a mohou trvat několik minut kvůli vytváření izolovaných databází. V `tests/browser-smoke.mjs` je doplňující kontrola sestavené aplikace přes Playwright: ověřuje i pořadí výklad–příklady–úlohy a oddělené ukládání rozepsaných dotazů. Po spuštění preview ji lze provést příkazem `node tests/browser-smoke.mjs`. Vyžaduje Chromium (`npx playwright install chromium`, případně proměnná `CHROMIUM_PATH` k místnímu prohlížeči).

Pro další cloudové úlohy používejte existující checkout; není třeba vytvářet worktree. Závislosti mohou být již připravené, běžící server je však nutné po obnovení prostředí spustit znovu.

## Publikace na GitHub Pages

V repozitáři otevřete **Settings → Pages → Build and deployment → Source: GitHub Actions**. Potom spusťte workflow **Test and publish course** přes **Actions → Run workflow** (nebo proveďte další push do main).

Workflow nejprve provede testy a produkční build, potom publikuje `dist`. GitHub zobrazí skutečnou adresu po úspěšném nasazení. Dokud Pages nejsou zapnuté, může část deploy skončit chybou. Stejnou složku `dist` lze publikovat na libovolný statický hosting. Relativní cesty podporují i umístění pod `/SQL-Academy/`.

## Jak kurz pracuje

- Hlavní SQL databáze žije v paměti samostatného Web Workeru. Změna úlohy či „Obnovit data“ vytvoří výchozí databázi. Rozpracovaný SQL dotaz zůstává zachovaný. Vlastní změny dat se přes obnovení stránky neuchovávají.
- Hotové úlohy a rozepsané dotazy se ukládají do localStorage. Pro přenos či zálohu slouží JSON export/import; import sloučí splněné úlohy a nahradí odpovídající rozepsané dotazy. Vymazání dat prohlížeče bez zálohy postup odstraní.
- Kontrola provádí odevzdaný SQL dotaz na čerstvé databázi a porovnává výsledek s referencí. Kontroluje názvy a pořadí sloupců, hodnoty i četnost duplicit. Pořadí řádků vyžaduje pouze tam, kde je součástí zadání. DDL/DML úlohy porovnávají také cílové schéma nebo stav cílové tabulky. Správný výsledek lze dosáhnout více způsoby; kontrola nevynucuje konkrétní syntaxi řešení.
- Výsledková tabulka zobrazuje prvních 200 řádků, export CSV obsahuje všechny řádky posledního tabulkového výsledku. Import CSV (UTF-8, čárka, hlavička, max. 1000 řádků / 500 kB) nahradí `csv_import` a používá textové sloupce.
- PGlite a aplikace jsou součástí sestavení; nepoužívají externí fonty, CDN ani analytiku. První načtení vyžaduje připojení; offline instalace/PWA zatím není součástí kurzu. Odkazy na videa vedou na YouTube.
- Při dlouhém dotazu worker skončí po 30 sekundách (kontrola po 45 s); potom je potřeba obnovit data. PGlite podporuje jednu místní relaci, nikoli správu více serverových databází.
- Jde o samostudium. Řešení a hodnocení jsou v klientovi, nikoli zabezpečené zkoušení. Neobsahuje účty, synchronizaci, přehled učitele nebo certifikáty.

## Úpravy obsahu

- `src/course.ts`: moduly, výklady, ukázky a zadání. Každá úloha má řešení, nápovědy a případně `ordered`, `setup` nebo `verify` pro kontrolu databázového stavu.
- `src/teaching.ts`: výukové cíle, vysvětlení příkazů a rozebrané příklady s očekávanými výsledky pro všechny lekce.
- `src/data.ts`: výchozí SQL databáze a popisy tabulek.
- `src/engine.ts`: spouštění a kontrola řešení.
- `src/worker.ts`: izolovaný databázový proces a CSV import.
- `src/main.ts`, `src/style.css`: rozhraní a místní postup.

Po úpravě dat nebo zadání vždy spusťte testy; očekávané výsledky vycházejí z aktuálních referenčních dotazů.
