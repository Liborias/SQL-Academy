export interface WorkedExample {
  title: string;
  sql: string;
  steps: string[];
  outcome: string;
  expectedRows?: number;
}

export interface LessonGuide {
  goal: string;
  concepts: { command: string; explanation: string }[];
  syntax: string;
  example: Omit<WorkedExample, 'sql'>;
  furtherExamples: WorkedExample[];
}

export function workedExamples(lesson: { id: string; example: string }): WorkedExample[] {
  const guide = guides[lesson.id];
  return [{ ...guide.example, sql: lesson.example }, ...guide.furtherExamples];
}

// Every lesson teaches its vocabulary before asking learners to solve an exercise.
export const guides: Record<string, LessonGuide> = {
  'prvni-dotaz': {
    goal: 'Dokážete přečíst jednoduchý SQL dotaz a sami vybrat celou tabulku i jednotlivé sloupce.',
    concepts: [
      { command: 'Tabulka, řádek, sloupec', explanation: 'Tabulku si představte jako list v tabulkovém procesoru. V tabulce film je jeden řádek jeden film. Sloupce title (název), description (popis) a length (délka v minutách) popisují jeho vlastnosti.' },
      { command: 'SELECT', explanation: 'Říká databázi, které sloupce chcete zobrazit. Například SELECT title vybere sloupec s názvy filmů. Samotný výběr dat původní tabulku nemění.' },
      { command: 'FROM', explanation: 'Určuje, ze které tabulky data čteme. FROM film znamená z tabulky film; FROM customer by znamenalo z tabulky zákazníků.' },
      { command: '* a čárka', explanation: 'Hvězdička za SELECT znamená všechny sloupce. Pokud chcete jen některé, vypište jejich názvy a oddělte je čárkou. Pořadí názvů určuje pořadí sloupců ve výsledku.' },
      { command: ';', explanation: 'Středník ukončuje příkaz. Klíčová slova budeme pro přehlednost psát velkými písmeny. Dotaz můžete rozdělit na více řádků; jeho význam se tím nezmění.' },
    ],
    syntax: 'SELECT sloupec1, sloupec2\nFROM tabulka;',
    example: { title: 'Prohlédneme si celou tabulku filmů', steps: ['SELECT oznamuje, že chceme číst data.', '* vybírá všechny sloupce tabulky.', 'FROM film určuje, že zdrojem jsou filmy.', 'Klikněte na Vložit do editoru a potom na Spustit. Všimněte si názvů sloupců ve výsledku.'], outcome: 'Zobrazí se 10 filmů se všemi 9 sloupci. Jedním z nich je Cesta na sever.', expectedRows: 10 },
    furtherExamples: [
      { title: 'Zajímají nás jen názvy', sql: 'SELECT title\nFROM film;', steps: ['Hvězdičku jsme nahradili názvem title.', 'Tabulka film zůstává stejná. Počet filmů se nezmění, vybíráme pouze méně sloupců.'], outcome: 'Výsledek má jeden sloupec title a 10 řádků.', expectedRows: 10 },
      { title: 'Vybereme dva sloupce', sql: 'SELECT title, length\nFROM film;', steps: ['Za SELECT jsou dva názvy oddělené čárkou.', 'Ve výsledku bude nejprve název a potom délka filmu.', 'Zkuste v editoru pořadí obrátit na length, title a dotaz znovu spustit.'], outcome: 'Uvidíte 10 filmů ve dvou sloupcích. Film Cesta na sever má délku 95 minut.', expectedRows: 10 },
    ],
  },
  komentare: {
    goal: 'Zvládnete do dotazu napsat poznámku a spustit celý příkaz v editoru.',
    concepts: [
      { command: '-- poznámka', explanation: 'Dva spojovníky zahajují komentář do konce aktuálního řádku. Databáze ho při vykonávání přeskočí.' },
      { command: '/* poznámka */', explanation: 'Tato dvojice značek ohraničuje komentář, který může zabírat více řádků.' },
      { command: 'Spustit a Zkontrolovat řešení', explanation: 'Spustit provede celý obsah editoru a ukáže výsledek. V příkladech jen experimentujete. Teprve v samostatných úlohách se používá kontrola správnosti.' },
    ],
    syntax: '-- Co zjišťujeme?\nSELECT sloupce FROM tabulka;',
    example: { title: 'Komentář před dotazem', steps: ['První řádek vysvětluje záměr a není SQL příkazem.', 'Druhý řádek přečte tabulku zaměstnanců staff.'], outcome: 'Zobrazí se 2 zaměstnanci. Text komentáře se ve výsledku neobjeví.', expectedRows: 2 },
    furtherExamples: [{ title: 'Poznámka na více řádků', sql: '/* Filmový katalog:\n   vybíráme pouze názvy. */\nSELECT title FROM film;', steps: ['Komentář končí až značkou */.', 'Za ním následuje obvyklý SELECT. Zkuste změnit jen text poznámky.'], outcome: 'Výsledkem je stále 10 názvů filmů.', expectedRows: 10 }],
  },
  distinct: {
    goal: 'Rozlišíte seznam různých hodnot, počet řádků a počet vyplněných hodnot.',
    concepts: [
      { command: 'DISTINCT', explanation: 'Za SELECT odstraňuje stejné řádky výsledku. Několik filmů stejného ratingu tak vytvoří jen jednu položku seznamu.' },
      { command: 'COUNT(*) a COUNT(sloupec)', explanation: 'COUNT(*) počítá všechny řádky. COUNT(email) počítá jen řádky s vyplněným emailem; chybějící hodnota NULL se nezapočítá.' },
      { command: 'COUNT(DISTINCT sloupec) a AS', explanation: 'COUNT(DISTINCT rating) počítá různé ratingy. AS dává výslednému sloupci vlastní jméno, například AS pocet. Nemění přitom zdrojovou tabulku.' },
    ],
    syntax: 'SELECT DISTINCT sloupec FROM tabulka;\nSELECT COUNT(sloupec) AS pocet FROM tabulka;',
    example: { title: 'Které ratingy nabízíme?', steps: ['SELECT čte rating každého filmu.', 'DISTINCT ponechá každý rating jen jednou.'], outcome: 'Vzniknou 4 řádky: ratingy G, PG, PG-13 a R; jejich pořadí není zaručené.', expectedRows: 4 },
    furtherExamples: [{ title: 'Řádky a vyplněné hodnoty', sql: 'SELECT COUNT(*) AS zakaznici,\n       COUNT(email) AS vyplnene_emaily,\n       COUNT(DISTINCT city) AS mesta\nFROM customer;', steps: ['Všechny tři výpočty čtou stejnou tabulku.', 'COUNT(email) vynechá Lucii, protože její email je NULL.', 'Aliasy pojmenují tři výsledné sloupce.'], outcome: 'Jeden řádek obsahuje 6 zákazníků, 5 vyplněných emailů a 4 různá města.', expectedRows: 1 }],
  },
  where: {
    goal: 'Vyberete řádky podle textové, číselné nebo logické podmínky.',
    concepts: [
      { command: 'WHERE', explanation: 'Patří za FROM a ponechá jen řádky, pro které je podmínka pravdivá. Výběr sloupců a výběr řádků jsou dvě různá rozhodnutí.' },
      { command: '=, <>, <, >, <=, >=', explanation: '= znamená rovnost a <> nerovnost. Zápis >= zahrnuje hraniční hodnotu: alespoň 100 minut znamená length >= 100.' },
      { command: "'text', číslo, true a false", explanation: 'Textové hodnoty uzavírejte do jednoduchých uvozovek. Čísla a logické hodnoty true (ano) nebo false (ne) pište bez uvozovek.' },
    ],
    syntax: 'SELECT sloupce FROM tabulka\nWHERE sloupec operátor hodnota;',
    example: { title: 'Filmy s ratingem R', steps: ['FROM film vybere zdrojovou tabulku.', "WHERE rating = 'R' ponechá jen filmy se zadaným ratingem.", 'SELECT title zobrazí pouze jejich názvy.'], outcome: 'Uvidíte Poslední vlak a Dlouhá noc.', expectedRows: 2 },
    furtherExamples: [{ title: 'Číselný filtr', sql: 'SELECT title, length\nFROM film\nWHERE length < 60;', steps: ['Porovnáváme číselnou délku s číslem 60.', 'Hodnota 60 by už podmínku nesplnila.'], outcome: 'Zobrazí se 3 filmy kratší než hodina.', expectedRows: 3 }],
  },
  'and-or': {
    goal: 'Spojíte několik podmínek a pomocí závorek vyjádříte, co patří k sobě.',
    concepts: [
      { command: 'AND', explanation: 'Řádek musí splnit podmínku vlevo i vpravo. Použijte ho pro požadavky „a zároveň“.' },
      { command: 'OR a NOT', explanation: 'OR připouští alespoň jednu z možností. NOT podmínku obrací: NOT active vybere neaktivní zákazníky.' },
      { command: '(podmínky)', explanation: 'AND se vyhodnocuje před OR. Závorkami například určíme, že aktivita je povinná pro zákazníky z obou vybraných měst.' },
    ],
    syntax: 'SELECT sloupce FROM tabulka\nWHERE podmínka1 AND (podmínka2 OR podmínka3);',
    example: { title: 'Dvě podmínky současně', steps: ['První podmínka požaduje rating PG.', 'Druhá navíc délku pod 100 minut. Samotné splnění jedné nestačí.'], outcome: 'Podmínkám vyhovují 4 filmy.', expectedRows: 4 },
    furtherExamples: [{ title: 'Jedna ze dvou možností', sql: "SELECT title, rating\nFROM film\nWHERE rating = 'R' OR rating = 'PG-13';", steps: ['Každý film může vyhovět levé nebo pravé podmínce.', 'Filmy s ostatními ratingy se nezobrazí.'], outcome: 'Uvidíte 3 filmy s ratingy R nebo PG-13.', expectedRows: 3 }],
  },
  razeni: {
    goal: 'Seřadíte výsledek a spolehlivě vyberete několik prvních řádků.',
    concepts: [
      { command: 'ORDER BY, ASC, DESC', explanation: 'ORDER BY určuje sloupce pro řazení. ASC řadí od nejmenšího k největšímu a je výchozí; DESC řadí obráceně.' },
      { command: 'Další klíč řazení', explanation: 'Pokud se první hodnoty shodují, rozhoduje další sloupec za čárkou. Jedinečné film_id na konci zajistí jednoznačné pořadí.' },
      { command: 'LIMIT', explanation: 'Omezuje počet vrácených řádků až po řazení. LIMIT bez ORDER BY neurčuje, které konkrétní řádky dostanete.' },
    ],
    syntax: 'SELECT sloupce FROM tabulka\nORDER BY sloupec DESC, id ASC\nLIMIT počet;',
    example: { title: 'Tři nejkratší filmy', steps: ['ORDER BY length seřadí délky vzestupně.', 'Při stejné délce rozhodne film_id.', 'LIMIT 3 ponechá první tři řádky seřazeného výsledku.'], outcome: 'Město zítřka (48), Malý svět (48) a Tichý oceán (52 minut), právě v tomto pořadí.', expectedRows: 3 },
    furtherExamples: [{ title: 'Nejdelší film', sql: 'SELECT title, length\nFROM film\nORDER BY length DESC, film_id\nLIMIT 1;', steps: ['DESC přesune největší délku na začátek.', 'LIMIT 1 vybere jediný film.'], outcome: 'Dlouhá noc má 140 minut.', expectedRows: 1 }],
  },
  'between-in': {
    goal: 'Vyjádříte rozsah hodnot, seznam možností i období zahrnující celé dny.',
    concepts: [
      { command: 'BETWEEN dolní AND horní', explanation: 'Zahrnuje oba konce intervalu. Délka BETWEEN 80 AND 100 tedy může být i přesně 80 nebo 100.' },
      { command: 'IN (...) a NOT IN (...)', explanation: 'IN porovnává s několika hodnotami ze seznamu. NOT IN je vylučuje. Jednotlivé hodnoty oddělujte čárkami.' },
      { command: '>= začátek AND < konec', explanation: 'U data s časem označuje samotné datum půlnoc. Celý den bezpečně zahrnete od jeho půlnoci včetně do půlnoci následujícího dne bez ní.' },
    ],
    syntax: "WHERE délka BETWEEN 80 AND 100\nWHERE rating IN ('G', 'PG')",
    example: { title: 'Filmy dlouhé 80 až 100 minut', steps: ['BETWEEN nahrazuje dvě porovnání spojená AND.', 'Obě mezní délky se počítají do výsledku.'], outcome: 'Vyhoví 3 filmy s délkami 95, 95 a 88 minut.', expectedRows: 3 },
    furtherExamples: [{ title: 'Celý patnáctý únor', sql: "SELECT payment_id, payment_date\nFROM payment\nWHERE payment_date >= '2024-02-15'\n  AND payment_date < '2024-02-16';", steps: ['Dolní mez zahrnuje půlnoc 15. února.', 'Horní mez vylučuje půlnoc 16. února i vše pozdější.'], outcome: 'Zobrazí se platby 2 a 3 z 15. února, nikoli platba 4 z následující půlnoci.', expectedRows: 2 }],
  },
  like: {
    goal: 'Najdete text podle jeho části nebo začátku a zvolíte citlivost na velikost písmen.',
    concepts: [
      { command: 'LIKE a ILIKE', explanation: 'LIKE porovnává se vzorem a rozlišuje velká a malá písmena. PostgreSQL ILIKE je při porovnání nerozlišuje.' },
      { command: '%', explanation: 'Nahrazuje libovolný počet znaků včetně žádného. Vzor a% hledá začátek, %a konec a %a% výskyt kdekoli.' },
      { command: '_', explanation: 'Podtržítko zastupuje právě jeden znak. Vzor _a% požaduje a na druhém místě.' },
    ],
    syntax: "SELECT sloupce FROM tabulka\nWHERE textový_sloupec ILIKE '%hledaný text%';",
    example: { title: 'Slovo uvnitř názvu', steps: ['Procenta dovolí další znaky před noc i za ním.', 'ILIKE nerozlišuje velikost písmen.'], outcome: 'Zobrazí se Dlouhá noc.', expectedRows: 1 },
    furtherExamples: [{ title: 'Příjmení začínající na Nov', sql: "SELECT first_name, last_name\nFROM customer\nWHERE last_name LIKE 'Nov%';", steps: ['Vzor začíná přesnými znaky Nov.', 'Procento dovolí libovolné pokračování příjmení.'], outcome: 'Najdete Annu Novákovou a Jana Nováka.', expectedRows: 2 }],
  },
  null: {
    goal: 'Rozpoznáte chybějící hodnoty a připravíte za ně čitelnou náhradu.',
    concepts: [
      { command: 'NULL', explanation: 'Znamená chybějící nebo neznámou hodnotu. Není to číslo 0 ani prázdný text.' },
      { command: 'IS NULL a IS NOT NULL', explanation: 'Tyto výrazy hledají chybějící nebo vyplněnou hodnotu. Zápis email = NULL správný test nenahradí.' },
      { command: 'COALESCE(a, b)', explanation: 'Vrátí první hodnotu, která není NULL. COALESCE(email, náhradní_text) mění jen zobrazení výsledku, nikoli data v tabulce.' },
    ],
    syntax: "SELECT COALESCE(sloupec, 'náhrada') AS název\nFROM tabulka;",
    example: { title: 'Komu chybí email?', steps: ['WHERE email IS NULL vyhledá nevyplněné kontakty.', 'SELECT first_name zobrazí jméno takového zákazníka.'], outcome: 'Jediným výsledkem je Lucie.', expectedRows: 1 },
    furtherExamples: [{ title: 'Náhradní popis hodnoty', sql: "SELECT title, COALESCE(description, 'Bez popisu') AS popis\nFROM film;", steps: ['U vyplněného popisu zůstane původní text.', 'Kdyby description chybělo, zobrazil by se text Bez popisu. Zkuste COALESCE(NULL, \'Bez popisu\') v samostatném SELECT.'], outcome: 'Všech 10 filmů má popis, proto zůstává původní obsah.', expectedRows: 10 }],
  },
  agregace: {
    goal: 'Spočítáte souhrn celé tabulky a výsledné sloupce srozumitelně pojmenujete.',
    concepts: [
      { command: 'SUM a AVG', explanation: 'SUM sečte číselné hodnoty, AVG vypočítá průměr. Bez GROUP BY se celá tabulka shrne do jednoho řádku.' },
      { command: 'MIN a MAX', explanation: 'MIN vybere nejnižší a MAX nejvyšší hodnotu. Více funkcí můžete použít vedle sebe za SELECT.' },
      { command: 'ROUND(výraz, místa)', explanation: 'Zaokrouhlí desetinnou hodnotu na daný počet míst. Závorky lze vnořit: nejprve se spočítá vnitřní AVG, potom vnější ROUND.' },
    ],
    syntax: 'SELECT SUM(sloupec) AS soucet, AVG(sloupec) AS prumer\nFROM tabulka;',
    example: { title: 'Průměrná platba', steps: ['AVG(amount) vypočítá průměr všech deseti plateb.', 'ROUND(..., 2) zaokrouhlí výsledek.', 'AS prumer pojmenuje výsledný sloupec.'], outcome: 'Výsledek je jeden řádek s průměrem 5.29.', expectedRows: 1 },
    furtherExamples: [{ title: 'Nejnižší a nejvyšší půjčovné', sql: 'SELECT MIN(rental_rate) AS nejlevnejsi,\n       MAX(rental_rate) AS nejdrazsi\nFROM film;', steps: ['Obě funkce zpracují stejný sloupec.', 'Čárka odděluje dvě výsledné hodnoty.'], outcome: 'Nejnižší půjčovné je 0.99, nejvyšší 4.99.', expectedRows: 1 }],
  },
  'group-by': {
    goal: 'Vytvoříte jeden souhrnný řádek pro každou skupinu dat.',
    concepts: [
      { command: 'GROUP BY', explanation: 'Řádky se stejnými hodnotami uvedených sloupců zařadí do stejné skupiny. Agregace se pak počítají pro každou skupinu zvlášť.' },
      { command: 'Skupina a agregace', explanation: 'Ve výsledku obvykle uvádíme klíč skupiny a její souhrn. Samostatný další sloupec bez seskupení nebo agregace databáze nemůže jednoznačně vybrat.' },
      { command: 'COUNT(DISTINCT ...)', explanation: 'V payment je řádkem platba, nikoli zákazník. Počet zákazníků v každé skupině proto spočítáme přes různé customer_id.' },
    ],
    syntax: 'SELECT skupina, COUNT(*) AS pocet\nFROM tabulka\nGROUP BY skupina;',
    example: { title: 'Kolik filmů má každý rating?', steps: ['GROUP BY rating rozdělí filmy podle ratingu.', 'COUNT(*) spočítá řádky v každé z těchto skupin.'], outcome: 'Vzniknou 4 skupiny: G má 3 filmy, PG 4, PG-13 1 a R 2.', expectedRows: 4 },
    furtherExamples: [{ title: 'Zákazníci podle měst', sql: 'SELECT city, COUNT(*) AS pocet\nFROM customer\nGROUP BY city\nORDER BY city;', steps: ['Každé město vytvoří jednu skupinu.', 'ORDER BY seřadí až hotové souhrnné řádky.'], outcome: 'Brno a Praha mají po 2 zákaznících, Olomouc a Plzeň po jednom.', expectedRows: 4 }],
  },
  having: {
    goal: 'Rozlišíte podmínku pro jednotlivý řádek od podmínky pro celou skupinu.',
    concepts: [
      { command: 'WHERE před GROUP BY', explanation: 'Nejprve vyřadí jednotlivé záznamy. Například nulové platby se vůbec nedostanou do součtů.' },
      { command: 'HAVING po GROUP BY', explanation: 'Vyřazuje skupiny podle jejich souhrnu. Do HAVING patří například SUM(amount) > 10 nebo COUNT(*) >= 2.' },
      { command: 'Alias v ORDER BY', explanation: 'Hotový souhrnný sloupec můžete řadit podle jeho aliasu. Ve WHERE se alias právě vytvářený v SELECT ještě použít nedá.' },
    ],
    syntax: 'SELECT skupina, SUM(hodnota) AS soucet\nFROM tabulka\nGROUP BY skupina\nHAVING SUM(hodnota) > mez;',
    example: { title: 'Skupiny s dostatečnou útratou', steps: ['Nejdříve seskupíme platby podle customer_id.', 'SUM(amount) spočítá útratu každého zákazníka.', 'HAVING ponechá jen útraty přes 10.'], outcome: 'Vyhoví zákazníci 1 a 4.', expectedRows: 2 },
    furtherExamples: [{ title: 'Souhrn po vyloučení nulových plateb', sql: 'SELECT staff_id, COUNT(*) AS pocet\nFROM payment\nWHERE amount > 0\nGROUP BY staff_id\nHAVING COUNT(*) >= 5;', steps: ['WHERE vyřadí nulovou platbu ještě před počítáním.', 'HAVING ponechá zaměstnance s alespoň pěti zbývajícími platbami.'], outcome: 'Zůstane zaměstnanec 2 s pěti platbami.', expectedRows: 1 }],
  },
  'inner-join': {
    goal: 'Propojíte dva zdroje podle společného klíče a vysvětlíte, odkud pochází každý sloupec.',
    concepts: [
      { command: 'JOIN (INNER JOIN)', explanation: 'Spojí řádky dvou tabulek, pokud si podle podmínky odpovídají. Záznam bez protějšku se do výsledku nedostane.' },
      { command: 'ON levá.klíč = pravá.odkaz', explanation: 'Určuje podmínku propojení. customer.customer_id odpovídá payment.customer_id: platba odkazuje na konkrétního zákazníka.' },
      { command: 'customer c a c.first_name', explanation: 'c je krátký alias tabulky, nikoli další tabulka. Prefix před tečkou určuje původ sloupce a rozlišuje shodné názvy.' },
    ],
    syntax: 'SELECT a.sloupec, b.sloupec\nFROM tabulka_a a\nJOIN tabulka_b b ON a.id = b.odkaz;',
    example: { title: 'Ke každé platbě jméno zákazníka', steps: ['customer dostane alias c a payment alias p.', 'ON porovná ID zákazníka na obou stranách.', 'Jméno se může opakovat, protože zákazník mohl platit vícekrát.'], outcome: 'Vznikne 10 řádků, jeden pro každou platbu.', expectedRows: 10 },
    furtherExamples: [{ title: 'Kdo zpracoval platbu?', sql: 'SELECT p.payment_id, s.first_name, p.amount\nFROM payment p\nJOIN staff s ON p.staff_id = s.staff_id;', steps: ['Tentokrát propojujeme pomocí staff_id.', 'Ze staff bereme jméno a z payment ID i částku.'], outcome: 'Každá z 10 plateb dostane jméno Tereza nebo Martin.', expectedRows: 10 }],
  },
  'vice-tabulek': {
    goal: 'Projdete vazební tabulkou a sestavíte spojení tří tabulek.',
    concepts: [
      { command: 'Vztah M:N', explanation: 'Jeden film může mít více herců a jeden herec hrát ve více filmech. Dvojice jejich ID jsou uložené v samostatné tabulce film_actor.' },
      { command: 'Řetězení JOIN', explanation: 'První JOIN připojí vazební tabulku, druhý dohledá samotného herce nebo kategorii. Každé spojení má vlastní ON.' },
      { command: 'Počet řádků po spojení', explanation: 'Jeden film se objeví jednou za každé odpovídající propojení. Při počítání proto nejdřív rozhodněte, zda počítáte propojení nebo různé filmy.' },
    ],
    syntax: 'FROM film f\nJOIN film_actor fa ON f.film_id = fa.film_id\nJOIN actor a ON a.actor_id = fa.actor_id',
    example: { title: 'Od filmu ke kategorii', steps: ['film_category propojuje ID filmu a kategorie.', 'Druhý JOIN dohledá název kategorie v category.'], outcome: 'V tomto souboru má každý z 10 filmů jednu přiřazenou kategorii.', expectedRows: 10 },
    furtherExamples: [{ title: 'Ve kterých filmech hraje Klára?', sql: "SELECT f.title, a.first_name\nFROM actor a\nJOIN film_actor fa ON a.actor_id = fa.actor_id\nJOIN film f ON f.film_id = fa.film_id\nWHERE a.first_name = 'Klára';", steps: ['Začínáme u herců a přes film_actor se dostaneme k filmům.', 'WHERE ponechá jen propojení pro Kláru.'], outcome: 'Klára hraje ve filmech Cesta na sever, Kavárna na rohu a Za obzorem.', expectedRows: 3 }],
  },
  'outer-join': {
    goal: 'Najdete záznamy bez odpovídajícího protějšku a neztratíte je při spojování.',
    concepts: [
      { command: 'LEFT JOIN', explanation: 'Zachová každý řádek levé tabulky. Pokud pravá strana chybí, její sloupce budou NULL.' },
      { command: 'FULL JOIN', explanation: 'Kromě všech levých řádků zachová i pravé řádky bez protějšku. Hodí se pro hledání nespárovaných záznamů na obou stranách.' },
      { command: 'WHERE pravá.id IS NULL', explanation: 'Po spojení tak najdete chybějící pravý záznam. Testujte primární klíč, který je u skutečného záznamu vždy vyplněný.' },
    ],
    syntax: 'FROM levá l\nLEFT JOIN pravá p ON l.id = p.odkaz\nWHERE p.id IS NULL',
    example: { title: 'Filmy bez kusu ve skladu', steps: ['LEFT JOIN nejprve zachová všechny filmy.', 'Filmy bez inventory dostanou na pravé straně NULL.', 'WHERE ponechá právě tyto chybějící kusy.'], outcome: 'Bez skladového kusu jsou Malý svět a Beze slov.', expectedRows: 2 },
    furtherExamples: [{ title: 'Všechny filmy, i bez jazyka', sql: 'SELECT f.title, l.name\nFROM film f\nLEFT JOIN language l ON f.language_id = l.language_id;', steps: ['Levá tabulka film určuje záznamy, které chceme zachovat.', 'Chybějící jazyk nezpůsobí vyřazení filmu.'], outcome: 'Vrátí se všech 10 filmů. Beze slov má ve sloupci name NULL.', expectedRows: 10 }],
  },
  union: {
    goal: 'Složíte dva výsledky pod sebe a rozhodnete, zda zachovat duplicity.',
    concepts: [
      { command: 'UNION', explanation: 'Skládá řádky výsledků pod sebe a odstraní stejné řádky. Oba SELECT musí mít stejný počet sloupců se slučitelnými typy.' },
      { command: 'UNION ALL', explanation: 'Neodstraňuje duplicity. Pokud stejný seznam připojíte dvakrát, každý jeho řádek se ve výsledku objeví dvakrát.' },
      { command: 'Názvy výsledných sloupců', explanation: 'Pocházejí z prvního SELECT. Chcete-li seřadit celý složený výsledek, dejte ORDER BY až na konec.' },
    ],
    syntax: 'SELECT sloupec FROM tabulka_a\nUNION\nSELECT sloupec FROM tabulka_b;',
    example: { title: 'Jména zákazníků i zaměstnanců', steps: ['První SELECT dodá jména zákazníků.', 'Druhý přidá jména zaměstnanců do stejného sloupce.', 'UNION by případné stejné jméno ponechal pouze jednou.'], outcome: 'V našich datech je všech 8 jmen různých.', expectedRows: 8 },
    furtherExamples: [{ title: 'Rozdíl při zachování duplicit', sql: 'SELECT city FROM customer\nUNION ALL\nSELECT city FROM customer;', steps: ['Oba SELECT vracejí stejných šest zákaznických měst.', 'UNION ALL je složí bez odstraňování duplicit. Zkuste ALL vymazat a porovnejte počet.'], outcome: 'S ALL dostanete 12 řádků, bez ALL jen 4 různá města.', expectedRows: 12 }],
  },
  datum: {
    goal: 'Získáte části data a převedete datum do podoby vhodné pro zobrazení.',
    concepts: [
      { command: 'EXTRACT(část FROM datum)', explanation: 'Vrátí číselnou část data: YEAR rok, MONTH měsíc nebo DAY den v měsíci. Stejný výraz lze použít při seskupování.' },
      { command: 'TO_CHAR(datum, formát)', explanation: 'Převádí datum na text podle masky. DD označuje den, MM měsíc a YYYY čtyřciferný rok. Formátovací maska patří do uvozovek.' },
      { command: 'CURRENT_DATE, NOW(), AGE()', explanation: 'CURRENT_DATE vrací dnešní datum, NOW() aktuální okamžik a AGE porovnává časové okamžiky jako interval. V pevných úlohách pracujeme se zadanými daty.' },
    ],
    syntax: "SELECT EXTRACT(MONTH FROM datum),\n       TO_CHAR(datum, 'DD.MM.YYYY')\nFROM tabulka;",
    example: { title: 'Měsíc každé platby', steps: ['EXTRACT vybere pouze měsíc z payment_date.', 'AS mesic pojmenuje číselný výsledek.'], outcome: 'Deset plateb má číslo měsíce 2, 3 nebo 4.', expectedRows: 10 },
    furtherExamples: [{ title: 'Rok a měsíc jako text', sql: "SELECT payment_id, TO_CHAR(payment_date, 'YYYY-MM') AS obdobi\nFROM payment;", steps: ['YYYY zachová celý rok a MM dvouciferný měsíc.', 'Pomlčka se přenese přímo do výsledného textu.'], outcome: 'Sloupec obdobi obsahuje například 2024-02 nebo 2024-03.', expectedRows: 10 }],
  },
  text: {
    goal: 'Sestavíte nový text z několika sloupců a upravíte jeho podobu.',
    concepts: [
      { command: '||', explanation: 'Spojuje textové hodnoty. Mezeru mezi jmény je nutné přidat samostatně jako text v uvozovkách.' },
      { command: 'LOWER a UPPER', explanation: 'LOWER převede písmena na malá, UPPER na velká. Funkce se zapisují s hodnotou v závorkách.' },
      { command: 'LEFT(text, počet) a LENGTH(text)', explanation: 'LEFT vybere první znaky, LENGTH spočítá jejich počet. Při spojování může NULL způsobit NULL celého výrazu; náhradu poskytne COALESCE.' },
    ],
    syntax: "SELECT LOWER(sloupec), LEFT(sloupec, 3),\n       sloupec || ' text'\nFROM tabulka;",
    example: { title: 'Celé jméno v jednom sloupci', steps: ['První || spojí jméno s mezerou.', 'Druhý || přidá příjmení. AS cele_jmeno dá novému sloupci název.'], outcome: 'Zobrazí se 6 celých jmen, například Anna Nováková.', expectedRows: 6 },
    furtherExamples: [{ title: 'Krátký název a počet znaků', sql: 'SELECT UPPER(LEFT(title, 3)) AS zkratka,\n       LENGTH(title) AS znaku\nFROM film;', steps: ['Vnitřní LEFT vybere první tři znaky názvu.', 'Vnější UPPER je převede na velká písmena.', 'LENGTH počítá znaky původního názvu.'], outcome: 'Cesta na sever má zkratku CES a 14 znaků včetně mezer.', expectedRows: 10 }],
  },
  vypocty: {
    goal: 'Vypočítáte novou hodnotu a rozlišíte číselný výpočet od změny datového typu.',
    concepts: [
      { command: '+, -, *, /, %', explanation: 'Sčítají, odčítají, násobí, dělí a počítají zbytek po dělení. V SQL číslech zapisujte desetinnou tečku, nikoli čárku.' },
      { command: 'CAST(hodnota AS typ) a ::typ', explanation: 'Oba zápisy převádějí datový typ, například číslo na text nebo celé číslo na numeric. Neplatný převod, třeba textu six na integer, vyvolá chybu.' },
      { command: 'Dělení a ROUND', explanation: 'Dvě celá čísla se dělí celočíselně: 5 / 2 vrací 2. Pro 2.5 převeďte alespoň jeden operand na numeric. ROUND potom může zaokrouhlit počet desetinných míst.' },
    ],
    syntax: 'SELECT ROUND(cena / jiná_cena, 2) AS pomer\nFROM tabulka;',
    example: { title: 'Poměr ceny náhrady a půjčovného', steps: ['Pro každý film se replacement_cost vydělí rental_rate.', 'ROUND výsledek zaokrouhlí na dvě desetinná místa.'], outcome: 'U každého z 10 filmů vznikne nový sloupec pomer.', expectedRows: 10 },
    furtherExamples: [{ title: 'Celé číslo, desetinné číslo a text', sql: "SELECT 5 / 2 AS cele_deleni,\n       5::numeric / 2 AS desetinne_deleni,\n       CAST(5 AS text) AS textovy_kod;", steps: ['Tento SELECT počítá přímo s hodnotami, proto nepotřebuje FROM.', 'Převod na numeric zachová desetinnou část podílu.', 'Poslední výraz vrátí text, přestože se zobrazuje stejně jako číslo 5.'], outcome: 'Jeden řádek s hodnotami 2, 2.5 a textem 5.', expectedRows: 1 }],
  },
  subquery: {
    goal: 'Použijete výsledek jiného dotazu jako podmínku a ověříte existenci souvisejících dat.',
    concepts: [
      { command: '(SELECT ...)', explanation: 'Poddotaz je dotaz uvnitř jiného dotazu. Pro porovnání pomocí > musí v tomto příkladu vrátit jednu hodnotu, třeba průměr.' },
      { command: 'EXISTS', explanation: 'Vrací pravdu, pokud poddotaz najde alespoň jeden řádek. Nezáleží na tom, jaké sloupce vrací; obvykle píšeme SELECT 1.' },
      { command: 'Korelovaný poddotaz', explanation: 'Odkazuje na právě zpracovávaný řádek vnějšího dotazu. Pro každého zákazníka tak zkontrolujeme jeho vlastní platby.' },
    ],
    syntax: 'SELECT sloupce FROM tabulka\nWHERE hodnota > (SELECT AVG(hodnota) FROM tabulka);',
    example: { title: 'Filmy delší než průměr', steps: ['Vnitřní SELECT spočítá průměr délky všech filmů: 87.3 minuty.', 'Vnější dotaz ponechá délky přísně větší než tento průměr.'], outcome: 'Nadprůměrnou délku má 6 filmů.', expectedRows: 6 },
    furtherExamples: [{ title: 'Zaměstnanci s nějakou platbou', sql: 'SELECT s.staff_id, s.first_name\nFROM staff s\nWHERE EXISTS (\n  SELECT 1 FROM payment p WHERE p.staff_id = s.staff_id\n);', steps: ['Vnější dotaz prochází zaměstnance.', 'Vnitřní dotaz pro každého hledá alespoň jednu odpovídající platbu.', 'Zaměstnanec se vrátí jen jednou bez ohledu na počet plateb.'], outcome: 'Podmínku splňují Tereza i Martin.', expectedRows: 2 }],
  },
  'self-join': {
    goal: 'Porovnáte řádky stejné tabulky a vyhnete se opakovaným dvojicím.',
    concepts: [
      { command: 'film a JOIN film b', explanation: 'Jednu fyzickou tabulku použijeme ve dvou rolích. Aliasy a a b rozlišují první a druhý řádek porovnání.' },
      { command: 'a.length = b.length', explanation: 'Spojovací podmínkou nemusí být jen cizí klíč. Zde hledáme dva filmy se stejnou délkou.' },
      { command: 'a.film_id < b.film_id', explanation: 'Vyloučí spojení filmu se sebou. Současně ponechá jen jednu orientaci dvojice, takže A–B a B–A nebudou dva výsledky.' },
    ],
    syntax: 'FROM tabulka a JOIN tabulka b\nON a.vlastnost = b.vlastnost AND a.id < b.id',
    example: { title: 'Dvojice se stejnou délkou', steps: ['Stejné délky mohou mít různé filmy.', 'Menší ID na levé straně zamezí opakování dvojic.'], outcome: 'Najdou se dvě dvojice: Cesta na sever / Kavárna na rohu a Město zítřka / Malý svět.', expectedRows: 2 },
    furtherExamples: [{ title: 'Dva zákazníci téhož města', sql: 'SELECT a.first_name AS prvni, b.first_name AS druhy, a.city\nFROM customer a\nJOIN customer b ON a.city = b.city AND a.customer_id < b.customer_id;', steps: ['Role a a b tentokrát označují dva zákazníky.', 'Výsledkem nejsou zákazníci, ale jejich neopakované dvojice.'], outcome: 'Vznikne dvojice Anna / Eva z Prahy a Petr / Lucie z Brna.', expectedRows: 2 }],
  },
  create: {
    goal: 'Navrhnete novou tabulku s datovými typy a pravidly pro její hodnoty.',
    concepts: [
      { command: 'CREATE TABLE a datové typy', explanation: 'Vytvoří prázdnou tabulku. Do závorek píšeme jméno a typ každého sloupce: integer pro celá čísla, text pro text a numeric pro přesná desetinná čísla.' },
      { command: 'PRIMARY KEY, NOT NULL, UNIQUE', explanation: 'Primární klíč jednoznačně určuje řádek a nesmí být NULL. NOT NULL vyžaduje vyplnění, UNIQUE zakazuje stejné hodnoty. Tyto požadavky patří za typ sloupce.' },
      { command: 'serial', explanation: 'Připraví celočíselný sloupec s automaticky generovanou výchozí hodnotou. Při vkládání pak ID nemusíte zadávat ručně.' },
    ],
    syntax: 'CREATE TABLE název (\n  id integer PRIMARY KEY,\n  obsah text NOT NULL\n);',
    example: { title: 'Nová tabulka klubů', steps: ['CREATE TABLE club vytvoří tabulku s názvem club.', 'club_id bude automaticky číslovaný primární klíč.', 'name musí být vyplněný text.'], outcome: 'Příkaz dokončí vytvoření prázdné tabulky; sám nevypisuje datové řádky.' },
    furtherExamples: [{ title: 'Textový primární klíč', sql: 'CREATE TABLE course_catalog (\n  code text PRIMARY KEY,\n  title text NOT NULL,\n  fee numeric\n);\nSELECT * FROM course_catalog;', steps: ['Kód kurzu je textový klíč, nemusí být číslo.', 'Jednotlivé sloupce oddělují čárky; za posledním už čárka není.', 'Následný SELECT prohlédne právě vytvořenou tabulku.'], outcome: 'Výsledek má sloupce code, title a fee a zatím žádný řádek.', expectedRows: 0 }],
  },
  insert: {
    goal: 'Vložíte nový řádek a propojíte existující záznamy pomocí cizích klíčů.',
    concepts: [
      { command: 'INSERT INTO tabulka (sloupce)', explanation: 'Uvádí, kam zapisujeme a které sloupce budeme vyplňovat. Existující řádky se tím nemění.' },
      { command: 'VALUES (...)', explanation: 'Hodnoty musí odpovídat pořadí vypsaných sloupců. Text patří do uvozovek; více řádků lze oddělit čárkami.' },
      { command: 'Výchozí hodnota a REFERENCES', explanation: 'Vynechaný serial sloupec si vygeneruje ID. Cizí klíč student_id nebo house_id ve student_house musí odkazovat na existující záznam příslušné tabulky.' },
    ],
    syntax: "INSERT INTO tabulka (sloupec1, sloupec2)\nVALUES ('text', číslo);",
    example: { title: 'Přidáme skupinu Objevitelé', steps: ['Vkládáme pouze house_name.', 'house_id dostane automaticky další ID, zde 3.'], outcome: 'Přibude jeden záznam. Pro zobrazení zkuste za příkaz připsat SELECT * FROM house;.' },
    furtherExamples: [{ title: 'Nový student s vlastním emailem', sql: "INSERT INTO student (username, email, age)\nVALUES ('karel', 'karel@academy.test', 20);\nSELECT student_id, username, age FROM student;", steps: ['Hodnoty navazují na username, email a age v tomto pořadí.', 'ID ani vytvoření účtu nevyplňujeme; tabulka pro ně má výchozí hodnoty.', 'SELECT ukáže původní i nový záznam.'], outcome: 'Studenti jsou nyní čtyři; Karel dostane student_id 4.', expectedRows: 4 }],
  },
  'update-delete': {
    goal: 'Změníte nebo odstraníte konkrétní řádky a zobrazíte, čeho se úprava týkala.',
    concepts: [
      { command: 'UPDATE ... SET', explanation: 'UPDATE určuje tabulku a SET nové hodnoty sloupců. Například SET age = age + 1 zvýší původní věk o jeden.' },
      { command: 'DELETE FROM ... WHERE', explanation: 'Odstraňuje celé vybrané řádky. WHERE u UPDATE i DELETE určuje, kterých se změna týká. Bez něj se změna provede ve všech řádcích.' },
      { command: 'RETURNING', explanation: 'Za změnou vypíše určené sloupce změněných nebo smazaných řádků. Před změnou si výběr můžete ověřit pomocí SELECT se stejným WHERE.' },
    ],
    syntax: 'UPDATE tabulka SET sloupec = hodnota\nWHERE podmínka RETURNING sloupce;',
    example: { title: 'Změníme věk jednoho studenta', steps: ['WHERE username vybere jen Petra.', 'SET age = 20 změní jeho věk.', 'RETURNING ukáže ID a nový věk.'], outcome: 'Zobrazí se jeden změněný řádek: student_id 2 a age 20.', expectedRows: 1 },
    furtherExamples: [{ title: 'Odstraníme konkrétní členství', sql: 'DELETE FROM student_house\nWHERE student_id = 1 AND house_id = 1\nRETURNING student_id, house_id;', steps: ['Pracujeme jen s vazební tabulkou členství.', 'Obě podmínky určí jednu konkrétní dvojici.', 'Samotný student i skupina zůstávají v databázi.'], outcome: 'RETURNING vypíše odstraněnou dvojici 1, 1.', expectedRows: 1 }],
  },
  alter: {
    goal: 'Upravíte strukturu existující tabulky a odlišíte ji od změny hodnot v řádcích.',
    concepts: [
      { command: 'ALTER TABLE ... ADD COLUMN', explanation: 'Přidá nový sloupec do existující tabulky. Bez výchozí hodnoty budou jeho hodnoty ve starých řádcích NULL.' },
      { command: 'RENAME COLUMN ... TO ...', explanation: 'Změní jméno sloupce. Jeho hodnoty přitom zachová. ALTER TABLE ... RENAME TO mění název celé tabulky.' },
      { command: 'DROP TABLE IF EXISTS', explanation: 'Odstraní tabulku včetně dat. IF EXISTS zabrání chybě, pokud tabulka neexistuje. Na rozdíl od DELETE tedy mění i strukturu databáze.' },
    ],
    syntax: 'ALTER TABLE tabulka ADD COLUMN sloupec typ;\nALTER TABLE tabulka RENAME COLUMN starý TO nový;',
    example: { title: 'Přidáme přezdívku', steps: ['ALTER TABLE student vybere existující tabulku.', 'ADD COLUMN nickname text vytvoří nový textový sloupec.'], outcome: 'Zůstanou stejní studenti; nový sloupec nickname je zatím NULL.' },
    furtherExamples: [{ title: 'Srozumitelnější název sloupce', sql: 'ALTER TABLE student RENAME COLUMN age TO vek;\nSELECT student_id, vek FROM student;', steps: ['Přejmenujeme age na vek.', 'V následném SELECT už musíme použít nový název.'], outcome: 'Tři původní věky zůstávají zachované ve sloupci vek.', expectedRows: 3 }],
  },
  constraints: {
    goal: 'Ochráníte data pravidlem CHECK a vyzkoušíte změnu, kterou lze vrátit.',
    concepts: [
      { command: 'CHECK (podmínka)', explanation: 'Omezuje přípustné hodnoty. CHECK (age >= 11) brání nižšímu věku; samo o sobě ale nezakazuje NULL. Pro povinné vyplnění je potřeba i NOT NULL.' },
      { command: 'ADD CONSTRAINT název', explanation: 'Za ALTER TABLE přidá pojmenované omezení. Databáze zkontroluje existující data a pravidlo pak platí i pro další změny.' },
      { command: 'BEGIN, COMMIT, ROLLBACK', explanation: 'BEGIN zahájí transakci. COMMIT její změny potvrdí; ROLLBACK je vrátí. Změny jsou jedním celkem, nikoli nezávislými potvrzenými kroky.' },
    ],
    syntax: 'BEGIN;\nUPDATE tabulka SET sloupec = hodnota;\nROLLBACK; -- nebo COMMIT pro potvrzení',
    example: { title: 'Změnu vyzkoušíme a vrátíme', steps: ['BEGIN otevře transakci.', 'UPDATE dočasně zvýší věk všech studentů.', 'ROLLBACK obnoví původní hodnoty.'], outcome: 'Anna, Petr a Eva zůstávají ve věku 16, 18 a 17 let.' },
    furtherExamples: [{ title: 'Zakážeme záporné náklady na náhradu', sql: 'ALTER TABLE film\nADD CONSTRAINT nezaporna_nahrada\nCHECK (replacement_cost >= 0);', steps: ['Pojmenování nezaporna_nahrada pomůže pravidlo později najít.', 'CHECK nedovolí zápornou replacement_cost.', 'Zkuste potom změnit replacement_cost jednoho filmu na -1; databáze změnu odmítne.'], outcome: 'Pravidlo se přidá, protože současná data podmínku splňují.' }],
  },
  case: {
    goal: 'Vytvoříte odvozený sloupec s různými hodnotami podle podmínky.',
    concepts: [
      { command: 'CASE WHEN ... THEN ...', explanation: 'Postupně testuje podmínky. Vrátí hodnotu za THEN první splněné podmínky.' },
      { command: 'ELSE ... END', explanation: 'ELSE pokrývá zbytek případů; pokud chybí, může výsledkem být NULL. END výraz uzavírá. AS pak pojmenuje celý nový sloupec.' },
      { command: 'SUM(CASE ...)', explanation: 'Pokud CASE vrátí pro vybrané řádky 1 a pro ostatní 0, SUM tyto jedničky sečte. Tak vznikne podmíněný počet.' },
    ],
    syntax: "SELECT CASE WHEN podmínka THEN 'ano'\n            ELSE 'ne' END AS výsledek\nFROM tabulka;",
    example: { title: 'Rozdělíme filmy podle délky', steps: ['Délka pod 60 minut dostane označení krátký.', 'Každý jiný film dostane označení celovečerní.'], outcome: 'Vznikne 10 řádků; 3 filmy jsou označené jako krátký.', expectedRows: 10 },
    furtherExamples: [{ title: 'Spočítáme krátké filmy', sql: 'SELECT SUM(CASE WHEN length < 60 THEN 1 ELSE 0 END) AS kratke\nFROM film;', steps: ['Vnitřní CASE přiřadí každému filmu 1 nebo 0.', 'Vnější SUM všechny hodnoty sečte.'], outcome: 'Výsledný počet kratke je 3.', expectedRows: 1 }],
  },
  nullif: {
    goal: 'Ošetříte nulového jmenovatele a zvolíte smysluplný výsledek pro neznámý podíl.',
    concepts: [
      { command: 'NULLIF(a, b)', explanation: 'Když se a rovná b, vrátí NULL; jinak vrátí a. NULLIF(amount, 0) tedy změní pouze nulu na NULL.' },
      { command: 'Dělení hodnotou NULL', explanation: 'Nevyvolá chybu dělení nulou, ale vrátí NULL. To vyjadřuje, že daný podíl není určený.' },
      { command: 'NULLIF a COALESCE', explanation: 'NULLIF může vyrobit NULL z konkrétní hodnoty; COALESCE naopak poskytne náhradu za NULL. Nahrazení neznámého podílu nulou má smysl jen tehdy, když to odpovídá zadání.' },
    ],
    syntax: 'SELECT čitatel::numeric / NULLIF(jmenovatel, 0) AS podil;',
    example: { title: 'Bezpečné dělení nulou', steps: ['NULLIF(0, 0) vrátí NULL, protože hodnoty jsou stejné.', '10 děleno NULL vrátí NULL, nikoli chybu.'], outcome: 'Jeden řádek se sloupcem podil obsahujícím NULL.', expectedRows: 1 },
    furtherExamples: [{ title: 'Když se hodnoty neshodují', sql: 'SELECT NULLIF(12, 0) AS zachovano,\n       NULLIF(0, 0) AS nahrazeno;', steps: ['První výraz ponechá 12, protože se nerovná nule.', 'Druhý nahradí nulu hodnotou NULL.'], outcome: 'zachovano je 12 a nahrazeno je NULL.', expectedRows: 1 }],
  },
  view: {
    goal: 'Uložíte definici dotazu jako pohled a znovu ji použijete při čtení dat.',
    concepts: [
      { command: 'CREATE VIEW název AS SELECT ...', explanation: 'Ukládá pojmenovanou definici dotazu. Pohled není samostatná kopie řádků; při čtení znovu vyhodnocuje svůj dotaz nad aktuálními daty.' },
      { command: 'SELECT ... FROM pohled', explanation: 'Pohled lze při čtení používat podobně jako tabulku. Má ale jen sloupce uvedené v jeho definici.' },
      { command: 'CREATE OR REPLACE VIEW a DROP VIEW', explanation: 'První příkaz upraví definici v povolených mezích, druhý pohled odstraní. Zdrojové tabulky a jejich data zůstávají zachované.' },
    ],
    syntax: 'CREATE VIEW název AS\nSELECT sloupce FROM tabulka;\nSELECT * FROM název;',
    example: { title: 'Uložíme si přehled cen', steps: ['CREATE VIEW vytvoří pohled film_prices.', 'Jeho definice vybírá pouze title a rental_rate.'], outcome: 'Pohled je připravený. Prohlédnete ho příkazem SELECT * FROM film_prices;.' },
    furtherExamples: [{ title: 'Vytvoření i použití pohledu', sql: "CREATE VIEW g_films AS\nSELECT title, length FROM film WHERE rating = 'G';\nSELECT * FROM g_films;", steps: ['První příkaz uloží dotaz vybírající rating G.', 'Druhý příkaz čte již z pohledu g_films.', 'Výsledek můžete stáhnout tlačítkem Stáhnout CSV.'], outcome: 'Pohled vrátí 3 filmy s jejich délkou.', expectedRows: 3 }],
  },
  rollup: {
    goal: 'Do jednoho výsledku přidáte souhrnné řádky a rozpoznáte je pomocí GROUPING.',
    concepts: [
      { command: 'GROUP BY ROLLUP(a)', explanation: 'Vytvoří běžné skupiny podle a a přidá celkový součet. ROLLUP(a, b) navíc vytvoří mezisoučty za a.' },
      { command: 'GROUPING(a)', explanation: 'Vrací 1, pokud jde o souhrnný řádek, v němž se a neseskupovalo. Pro běžnou skupinu vrací 0.' },
      { command: 'NULL v souhrnu', explanation: 'Souhrnný řádek má u neseskupovaného sloupce NULL. Protože NULL může být i skutečná hodnota dat, rozlišíme tyto případy pomocí GROUPING.' },
    ],
    syntax: 'SELECT skupina, SUM(hodnota), GROUPING(skupina)\nFROM tabulka\nGROUP BY ROLLUP(skupina);',
    example: { title: 'Tržby zaměstnanců i celé půjčovny', steps: ['SUM vypočítá tržby pro každé staff_id.', 'ROLLUP navíc přidá celkový součet všech plateb.', 'GROUPING označí celkový součet hodnotou 1.'], outcome: 'Dva řádky patří zaměstnancům a třetí je celkový součet 52.90.', expectedRows: 3 },
    furtherExamples: [{ title: 'Součet výpůjčních cen po ratingu', sql: 'SELECT rating, SUM(rental_rate) AS soucet,\n       GROUPING(rating) AS souhrn\nFROM film\nGROUP BY ROLLUP(rating);', steps: ['Čtyři ratingy vytvoří čtyři běžné skupiny.', 'Pátý řádek shrne všechny filmy a má souhrn = 1.'], outcome: 'Pět řádků včetně celkového součtu 28.90.', expectedRows: 5 }],
  },
  projekt: {
    goal: 'Samostatně rozložíte praktickou otázku na výběr dat, spojení, souhrn a prezentaci výsledku.',
    concepts: [
      { command: '1. Zdroj a vztahy', explanation: 'Nejdřív si řekněte, co znamená jeden řádek výsledku. Pro tržby po městech potřebujete city z customer a amount z payment, propojené přes customer_id.' },
      { command: '2. Filtrace a souhrn', explanation: 'WHERE omezuje jednotlivé záznamy, GROUP BY určuje skupiny a HAVING stanovuje podmínky pro jejich výsledné součty.' },
      { command: '3. Kontrola a řazení', explanation: 'Ověřte chybějící záznamy, počet řádků a zda spojení nenásobí platby. Nakonec zvolte aliasy a jednoznačné ORDER BY odpovídající zadání.' },
    ],
    syntax: 'SELECT skupina, SUM(hodnota) AS soucet\nFROM zdroj JOIN další ON podmínka\nGROUP BY skupina\nHAVING SUM(hodnota) > mez\nORDER BY soucet DESC;',
    example: { title: 'Rozbor: tržby podle měst', steps: ['JOIN připojí ke každé platbě město zákazníka.', 'GROUP BY c.city sjednotí platby ze stejného města.', 'SUM(p.amount) spočítá městské tržby; město bez plateb se při INNER JOIN nevrátí.'], outcome: 'Praha má tržby 18.96, Brno 12.96 a Olomouc 20.98.', expectedRows: 3 },
    furtherExamples: [{ title: 'Rozbor: náročnější zákaznický přehled', sql: 'SELECT c.city, COUNT(DISTINCT c.customer_id) AS platici,\n       SUM(p.amount) AS trzby\nFROM customer c JOIN payment p ON c.customer_id = p.customer_id\nWHERE p.amount > 0\nGROUP BY c.city\nHAVING SUM(p.amount) > 15\nORDER BY trzby DESC, c.city;', steps: ['WHERE vyřadí nulovou platbu před agregací.', 'COUNT DISTINCT počítá zákazníky, nikoli jejich platby.', 'HAVING ponechá města s tržbami přes 15 a ORDER BY je seřadí.'], outcome: 'Olomouc (20.98) a Praha (18.96); v každém městě jeden zákazník s kladnou platbou.', expectedRows: 2 }],
  },
};
