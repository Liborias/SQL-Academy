/** Original, deterministic teaching data. No external download or personal data. */
export const seed = `
CREATE TABLE language(language_id integer PRIMARY KEY, name text NOT NULL);
INSERT INTO language VALUES (1,'Angličtina'),(2,'Čeština'),(3,'Francouzština');
CREATE TABLE category(category_id integer PRIMARY KEY,name text NOT NULL);
INSERT INTO category VALUES(1,'Dobrodružný'),(2,'Dokument'),(3,'Komedie');
CREATE TABLE film(film_id integer PRIMARY KEY,title text NOT NULL,description text,release_year integer,length integer CHECK(length>0),rental_rate numeric(5,2),replacement_cost numeric(6,2),rating text,language_id integer REFERENCES language);
INSERT INTO film VALUES
(1,'Cesta na sever','Výprava za polární září',2020,95,2.99,18.99,'PG',2),
(2,'Tichý oceán','Život pod hladinou',2021,52,1.99,15.99,'G',1),
(3,'Poslední vlak','Tajemství nočního expresu',2019,125,4.99,24.99,'R',1),
(4,'Kavárna na rohu','Setkání, která mění život',2022,95,2.99,19.99,'PG',2),
(5,'Město zítřka','Architektura budoucnosti',2021,48,0.99,12.99,'G',1),
(6,'Dlouhá noc','Příběh jednoho pátrání',2023,140,4.99,29.99,'R',1),
(7,'Letní dopisy','Prázdninové nedorozumění',2020,88,2.99,17.99,'PG',3),
(8,'Za obzorem','Expedice do neznáma',2024,110,3.99,22.99,'PG-13',1),
(9,'Malý svět','Dobrodružství v zahradě',2024,48,0.99,11.99,'G',2),
(10,'Beze slov','Příběh beze jmen',2018,72,1.99,14.99,'PG',NULL);
CREATE TABLE film_category(film_id integer REFERENCES film,category_id integer REFERENCES category,PRIMARY KEY(film_id,category_id));
INSERT INTO film_category VALUES(1,1),(2,2),(3,1),(4,3),(5,2),(6,1),(7,3),(8,1),(9,2),(10,2);
CREATE TABLE customer(customer_id integer PRIMARY KEY,first_name text,last_name text,email text UNIQUE,city text,active boolean);
INSERT INTO customer VALUES(1,'Anna','Nováková','anna@example.test','Praha',true),(2,'Petr','Svoboda','petr@example.test','Brno',true),(3,'Eva','Dvořáková','eva@example.test','Praha',false),(4,'Jan','Novák','jan@example.test','Olomouc',true),(5,'Lucie','Černá',NULL,'Brno',true),(6,'Adam','Veselý','adam@example.test','Plzeň',false);
CREATE TABLE staff(staff_id integer PRIMARY KEY,first_name text,store_id integer);
INSERT INTO staff VALUES(1,'Tereza',1),(2,'Martin',2);
CREATE TABLE payment(payment_id integer PRIMARY KEY,customer_id integer REFERENCES customer,staff_id integer REFERENCES staff,amount numeric(7,2) NOT NULL,payment_date timestamp NOT NULL);
INSERT INTO payment VALUES(1,1,1,9.98,'2024-02-14 10:00'),(2,1,1,4.99,'2024-02-15 12:00'),(3,2,2,2.99,'2024-02-15 18:30'),(4,3,1,0,'2024-02-16 00:00'),(5,4,2,12.99,'2024-03-04 09:15'),(6,2,1,4.99,'2024-03-05 16:00'),(7,5,2,1.99,'2024-03-10 14:00'),(8,1,2,3.99,'2024-04-01 08:00'),(9,4,1,7.99,'2024-04-03 11:00'),(10,5,2,2.99,'2024-04-10 19:00');
CREATE TABLE inventory(inventory_id integer PRIMARY KEY,film_id integer REFERENCES film,store_id integer);
INSERT INTO inventory VALUES(1,1,1),(2,1,2),(3,2,1),(4,3,2),(5,4,1),(6,5,2),(7,6,1),(8,7,2),(9,8,1);
CREATE TABLE actor(actor_id integer PRIMARY KEY,first_name text,last_name text);
INSERT INTO actor VALUES(1,'Klára','Malá'),(2,'Tomáš','Horák'),(3,'Marie','Bílá');
CREATE TABLE film_actor(film_id integer REFERENCES film,actor_id integer REFERENCES actor,PRIMARY KEY(film_id,actor_id));
INSERT INTO film_actor VALUES(1,1),(1,2),(3,2),(4,1),(4,3),(6,2),(7,3),(8,1);
CREATE TABLE student(student_id serial PRIMARY KEY,username varchar(50) UNIQUE NOT NULL,email text UNIQUE NOT NULL,age smallint CHECK(age>=11),created_on timestamp DEFAULT '2024-09-01',last_login timestamp);
INSERT INTO student(username,email,age) VALUES('anna','anna@academy.test',16),('petr','petr@academy.test',18),('eva','eva@academy.test',17);
CREATE TABLE house(house_id serial PRIMARY KEY,house_name text UNIQUE NOT NULL);
INSERT INTO house(house_name) VALUES('Badatelé'),('Tvůrci');
CREATE TABLE student_house(student_id integer REFERENCES student,house_id integer REFERENCES house,PRIMARY KEY(student_id,house_id));
INSERT INTO student_house VALUES(1,1),(2,2);
`;
export const tables: Record<string, string> = {
film:'film_id · title · description · release_year · length · rental_rate · replacement_cost · rating · language_id → language',
customer:'customer_id · first_name · last_name · email (může být NULL) · city · active (boolean)',
payment:'payment_id · customer_id → customer · staff_id → staff · amount · payment_date',
staff:'staff_id · first_name · store_id', language:'language_id · name', category:'category_id · name',film_category:'film_id → film · category_id → category',inventory:'inventory_id · film_id → film · store_id',actor:'actor_id · first_name · last_name',film_actor:'film_id → film · actor_id → actor',student:'student_id (serial) · username · email · age · created_on · last_login',house:'house_id (serial) · house_name',student_house:'student_id → student · house_id → house'};
