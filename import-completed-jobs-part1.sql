-- AGB import of completed past jobs from Google My Maps export (part 1 of 2). Safe to run more than once.
-- Run in Supabase > SQL Editor. Requires jobs.latitude / jobs.longitude (already added).
-- UNDO (removes every imported row, all parts):
--   delete from public.jobs where notes like '%AGB-IMPORT:mymaps-2026-10-15%';
begin;
insert into public.jobs (customer,address,city,salesman_username,sold_date,completed_date,latitude,longitude,notes,
  permit_status,demolition_required,demo_status,concrete_status,carpentry_status,electric_status,extras_required,extras_status,
  inspection_status,final_payment,deposit_status,hold_status,price,deposit,priority,created_by)
select v.customer,v.address,v.city,v.salesman,v.d,v.d,v.lat,v.lng,v.notes,
  'N/A',false,'N/A','N/A','Garage Built','Not Included',false,'N/A','Passed','Paid','Received',false,0,0,'Normal',
  coalesce((select user_id from public.staff_profiles where lower(username)='ramsey' limit 1),auth.uid())
from (values
('Micheal Mass','7438 N Oriole Ave','Chicago','wally','2019-06-01'::date,42.0162464,-87.8166352,'7438 N Oriole Ave, Chicago, IL  60631, United States
Rep:Wally
ZIP 60631 | My Maps title: Micheal Mass
[AGB-IMPORT:mymaps-2026-10-15]'),
('Marc Schellhorn','1S522 Stillwell Rd',null,'wally','2023-10-31'::date,41.8513077,-87.9637485,'Rep Wally
January Sales
Customer: Schellhorn, Marc
My Maps title: 1S522 Stillwell Rd
[AGB-IMPORT:mymaps-2026-10-15]'),
('Steven Larson','04N525 Foxfield Dr',null,'unassigned','2019-08-05'::date,41.932795,-88.439097,'Steven Larson
My Maps title: 04N525 Foxfield Dr
[AGB-IMPORT:mymaps-2026-10-15]'),
('Elizabeth Heidkamp','10 Lincoln Ct',null,'wally','2023-10-31'::date,41.8794042,-88.0221145,'Rep: Wally
May Sales
Customer: Heidkamp, Elizabeth
My Maps title: 10 Lincoln Ct
[AGB-IMPORT:mymaps-2026-10-15]'),
('Bill Kubovy','40W490 Harper Dr Hampshire',null,'unassigned','2019-08-12'::date,42.092073,-88.403643,'Bill Kubovy
My Maps title: 40W490 Harper Dr Hampshire
[AGB-IMPORT:mymaps-2026-10-15]'),
('Ryan Steinback','104 S William St',null,'tomaz','2023-10-31'::date,42.0640651,-87.9287995,'Rep Tomaz
February Sales
Customer: Steinback, Ryan
My Maps title: 104 S William St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jordan Carrie','121 N Karlov Ave',null,'matt','2023-10-31'::date,41.8827335,-87.7279219,'Rep: Matt
April Sales
Customer: Jordan Carrie
My Maps title: 121 N Karlov Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Douglas Gregory','125 Stonegate Rd',null,'wally','2023-10-31'::date,41.8427767,-87.8724925,'Rep Wally
March Sales
Customer: Gregory, Douglas
My Maps title: 125 Stonegate Rd
[AGB-IMPORT:mymaps-2026-10-15]'),
('Karen Hall','135 S Blanchard St Wheaton',null,'sam','2019-06-24'::date,41.8651013,-88.08749999999999,'Repair/Refurbish Job 
Rep. Sam  
Customer Karen Hall
My Maps title: 135 S Blanchard St Wheaton
[AGB-IMPORT:mymaps-2026-10-15]'),
('Nicholas Brown','245 E Wilson St',null,'wally','2023-10-31'::date,41.8786721,-87.9332657,'Rep: Wally
April Sales
Customer: Brown, Nicholas
My Maps title: 245 E Wilson St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Mario Godoy','278 N Indiana St',null,'wally','2023-10-31'::date,41.9054273,-87.9356415,'Rep Wally
February Sales
Customer: Godoy, Mario
My Maps title: 278 N Indiana St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Gary Brandt','309 South Taylor Avenue',null,'unassigned','2019-08-12'::date,41.883524,-87.778401,'Gary Brandt
My Maps title: 309 South Taylor Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Sylvia Wang','312 Asbury Ave',null,'unassigned','2019-08-12'::date,42.023688,-87.690374,'Sylvia Wang
My Maps title: 312 Asbury Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Maggie Makimovich','340 E North St Manhattan',null,'tom','2019-06-24'::date,41.4249713,-87.9825382,'20X22 Gable Brownwood Roof Storm Royal Siding      Rep Tom     
    Customer      Maggie Makimovich
My Maps title: 340 E North St Manhattan
[AGB-IMPORT:mymaps-2026-10-15]'),
('Rachel Watson','428 South Arlington Heights Road',null,'unassigned','2019-08-05'::date,42.076382,-87.980816,'Rachel Watson
My Maps title: 428 South Arlington Heights Road
[AGB-IMPORT:mymaps-2026-10-15]'),
('Beth Klicker','517 South Prindle Avenue',null,'unassigned','2019-08-05'::date,42.074773,-87.958387,'Beth Klicker
My Maps title: 517 South Prindle Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Enrique Vega','526 S Second St',null,'sam','2023-10-31'::date,42.0921231,-88.278934,'Rep: Sam
May Sales
Customer: Vega, Enrique
My Maps title: 526 S Second St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Evelyn Bradley','567 Ingraham Ave',null,'sam','2023-10-31'::date,41.6194676,-87.5284496,'Rep: Sam
April Sales
Customer: Bradley, Evelyn
My Maps title: 567 Ingraham Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Luis Arcos','604 N Leclaire Ave',null,'unassigned','2019-08-05'::date,41.891559,-87.753387,'Luis Arcos
22X22 HIP, ALMOND SIDING, BROWN ROOF
My Maps title: 604 N Leclaire Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Steven Viduna','727 Rogers Rd',null,'wally','2023-10-31'::date,41.6569446,-88.0898264,'Rep Wally
February Sales
Customer: Viduna, Steven
My Maps title: 727 Rogers Rd
[AGB-IMPORT:mymaps-2026-10-15]'),
('Spencer Jones','729 N Pine Ave',null,'unassigned','2019-08-12'::date,41.89389,-87.763112,'Spencer Jones
My Maps title: 729 N Pine Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Raul Sanchez','732 S Kilbourn Ave',null,'unassigned','2019-08-12'::date,41.87139,-87.738162,'22X22 Hip Compass Siding Estate Grey Roof
Raul Sanchez
My Maps title: 732 S Kilbourn Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Ronita Mestas','736 N La Grange Rd',null,'wally','2023-10-31'::date,41.8283933,-87.873268,'January Sales
Rep:Wally
Customer: Mestas,Ronita
My Maps title: 736 N La Grange Rd
[AGB-IMPORT:mymaps-2026-10-15]'),
('Gt Alternatives','841 N Latrobe Ave',null,'unassigned','2019-08-12'::date,41.896151,-87.75651,'20X20 Hip Gray Siding Party Door
Gt Alternatives
My Maps title: 841 N Latrobe Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Hector Rodriguez','856 Pearson Street',null,'unassigned','2019-08-12'::date,42.037571,-87.888375,'Hector Rodriguez
My Maps title: 856 Pearson Street
[AGB-IMPORT:mymaps-2026-10-15]'),
('Louise Moon','916 South Lyman Avenue',null,'unassigned','2019-08-12'::date,41.872083,-87.776546,'Louise Moon
My Maps title: 916 South Lyman Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Tom Maguire','1005 S Hamilton Ave',null,'unassigned','2019-08-12'::date,41.868874,-87.680017,'Tom Maguire
My Maps title: 1005 S Hamilton Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Frank Alfano','1017 Beloit Avenue',null,'unassigned','2019-08-12'::date,41.867838,-87.811846,'Frank Alfano
My Maps title: 1017 Beloit Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Holly Kruger','1028 North Hayes Avenue',null,'unassigned','2019-08-12'::date,41.904988,-87.778857,'Holly Kruger
My Maps title: 1028 North Hayes Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Shay Durant','1033 S Charlotte St',null,'wally','2023-10-31'::date,41.8656789,-88.0159955,'Rep Wally
March Sales
Customer: Durant, Shay
My Maps title: 1033 S Charlotte St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Mary Lichter','1105 W Webster Ave Chicago',null,'wally','2019-06-24'::date,41.92148219999999,-87.65624220000001,'19X20 Gable Sagebrook Siding Grey Roof
Rep Wally. Customer Mary Lichter
My Maps title: 1105 W Webster Ave Chicago
[AGB-IMPORT:mymaps-2026-10-15]'),
('Maria Espinoza','1136 Suffolk Avenue',null,'unassigned','2019-08-12'::date,41.864215,-87.873019,'Maria Espinoza
My Maps title: 1136 Suffolk Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('High Fidelity','1355 W Walton St',null,'unassigned','2019-08-05'::date,41.898656,-87.661675,'High Fidelity
22X20 HIP, D4 FLINT, BLACK SHINGLES
My Maps title: 1355 W Walton St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Lisa Penn','1432 Hirsch Avenue',null,'unassigned','2019-08-05'::date,41.592669,-87.538576,'Lisa Penn
My Maps title: 1432 Hirsch Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('County Eiland','1432 N Menard Ave',null,'unassigned','2019-08-12'::date,41.90667,-87.771021,'2015 Job
County Eiland
My Maps title: 1432 N Menard Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Michael Viatsas','1440 Wisconsin Avenue',null,'unassigned','2019-08-12'::date,41.859936,-87.801723,'Michael Viatsas
My Maps title: 1440 Wisconsin Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Theresa Powell','1455 Henry Avenue',null,'unassigned','2019-08-12'::date,42.033108,-87.887962,'Theresa Powell
My Maps title: 1455 Henry Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Ofa Stead','1519 N Wicker Park Ave',null,'unassigned','2019-08-12'::date,41.908799,-87.676545,'Ofa Stead
My Maps title: 1519 N Wicker Park Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('PM Homes LLC','1534 N Springfield Ave',null,'unassigned','2019-08-12'::date,41.90916,-87.724422,'PM Homes LLC
My Maps title: 1534 N Springfield Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Margarita Lozano','1535 Grove Avenue',null,'unassigned','2019-08-12'::date,41.858425,-87.79459,'20X22 Hip
Margarita Lozano
My Maps title: 1535 Grove Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Ray Lockhart','1614 N Newcastle Ave',null,'luis','2023-10-31'::date,41.9095546,-87.7962737,'Rep Luis
March Sales
Customer: Lockhart, Ray
My Maps title: 1614 N Newcastle Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Humberto Hernandez','1616 North 39th Avenue',null,'unassigned','2019-08-12'::date,41.90081,-87.881452,'Humberto Hernandez
My Maps title: 1616 North 39th Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Guadalupe Lopez','1647 South Austin Boulevard',null,'unassigned','2019-08-12'::date,41.85646,-87.77357,'Guadalupe Lopez
My Maps title: 1647 South Austin Boulevard
[AGB-IMPORT:mymaps-2026-10-15]'),
('1725 N Oak Park Ave Chicago','1725 N Oak Park Ave Chicago',null,'wally','2019-06-24'::date,41.911642,-87.7945706,'12X24 Hip Beige Siding Desert Tan Roof
Rep Wally
My Maps title: 1725 N Oak Park Ave Chicago
[AGB-IMPORT:mymaps-2026-10-15]'),
('Manuel Prez','1739 N Monitor Ave',null,'luis','2023-10-31'::date,41.9122927,-87.7712811,'Rep: Luis
April Sales
Customer: Prez, Manuel
My Maps title: 1739 N Monitor Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jose Rodriguez','1759 N Latrobe Ave',null,'unassigned','2019-08-12'::date,41.913023,-87.756666,'Jose Rodriguez
My Maps title: 1759 N Latrobe Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Joel Champagne','1800 Laurel Ave',null,'unassigned','2019-08-12'::date,42.050219,-87.70508,'Joel Champagne
My Maps title: 1800 Laurel Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Robert Rossi','1801 Grey Ave',null,'unassigned','2019-08-12'::date,42.050236,-87.702212,'Robert Rossi
My Maps title: 1801 Grey Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Samantha Nickelson','1909 S 19th Ave',null,'tomaz','2023-10-31'::date,41.8688777,-87.855403,'Rep: Tomaz
May Sales
Customer: Nickelson, Samantha
My Maps title: 1909 S 19th Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Michael Gilbert','1919 West Newport Avenue',null,'unassigned','2019-08-12'::date,41.943954,-87.676872,'19X22 Hip D4 Flint Sierra Gray Roof
Michael Gilbert
My Maps title: 1919 West Newport Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Manuel Zarinana','1927 Glenn Dr',null,'unassigned','2019-08-12'::date,42.32394,-87.846085,'Manuel Zarinana
My Maps title: 1927 Glenn Dr
[AGB-IMPORT:mymaps-2026-10-15]'),
('Herlinda Nevarez','1931 W 33rd St',null,'unassigned','2019-08-12'::date,41.833883,-87.674062,'Herlinda Nevarez
My Maps title: 1931 W 33rd St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Leslye Palmer','2006 South 12th Avenue',null,'unassigned','2019-08-12'::date,41.8674678,-87.8473227,'Leslye Palmer
My Maps title: 2006 South 12th Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Concrete Job','2012 W Fletcher St',null,'unassigned','2019-08-12'::date,41.938922,-87.678944,'Concrete Job
Jeff Zinck
My Maps title: 2012 W Fletcher St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Moises Almiduvar','2021 N Kildare Ave',null,'unassigned','2019-08-12'::date,41.917736,-87.73357,'Moises Almiduvar
My Maps title: 2021 N Kildare Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Russell Marren','2047 N Kedvale Ave',null,'unassigned','2019-08-12'::date,41.918507,-87.729923,'Russell Marren
My Maps title: 2047 N Kedvale Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('David Fischer','2114 N Monitor Ave',null,'unassigned','2019-08-12'::date,41.918481,-87.772235,'David Fischer
My Maps title: 2114 N Monitor Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Puran Saini','2125 W Greenleaf Ave',null,'unassigned','2019-08-05'::date,42.009699,-87.685113,'Puran Saini
22X20 HIP
My Maps title: 2125 W Greenleaf Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('2127 Lemont LLC','2127 W le Moyne St',null,'wally','2023-10-31'::date,41.9079543,-87.6809232,'Rep: Wally
April Sales
Customer: 2127 Lemont LLC
My Maps title: 2127 W le Moyne St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Joseph Serna','2205 Mayfair Avenue',null,'unassigned','2019-08-12'::date,41.848024,-87.891294,'Joseph Serna
My Maps title: 2205 Mayfair Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Maureen Obrien','2224 W Argyle St',null,'unassigned','2019-08-05'::date,41.972558,-87.685188,'Maureen Obrien 
18X20 HIP, D4 MIST, TEAK ARCH SHINGLES
My Maps title: 2224 W Argyle St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Steven Mankowski','2233 W Carmen Ave',null,'unassigned','2019-08-12'::date,41.973748,-87.68556,'Steven Mankowski
My Maps title: 2233 W Carmen Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Juan Santiago','2256 North Lavergne Avenue',null,'unassigned','2019-08-12'::date,41.922153,-87.751426,'Juan Santiago
My Maps title: 2256 North Lavergne Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jorge Figueroa','2309 Jethro Ave',null,'unassigned','2019-08-12'::date,42.453438,-87.850189,'Jorge Figueroa
My Maps title: 2309 Jethro Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Gustava Del Toro','2332 N 74th Ct Elmwood Park',null,'wally','2019-06-24'::date,41.9228919,-87.8126187,'Repair/Refurbish Job
Rep. Wally 
Customer Gustava Del Toro
My Maps title: 2332 N 74th Ct Elmwood Park
[AGB-IMPORT:mymaps-2026-10-15]'),
('Joseph Guzman','2415 W Fletcher St',null,'wally','2023-10-31'::date,41.9383038,-87.6887141,'Rep:Wally
January Sales
Customer: Guzman, Joseph
My Maps title: 2415 W Fletcher St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Andre Villa','2510 N Francisco Ave',null,'unassigned','2019-08-12'::date,41.927037,-87.700287,'Andre Villa
My Maps title: 2510 N Francisco Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Alco Construction','2523 N Talman Ave',null,'unassigned','2019-08-12'::date,41.927415,-87.693496,'Alco Construction
My Maps title: 2523 N Talman Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Patrick Nwanah','2633 W Jerome St',null,'unassigned','2019-08-12'::date,42.018242,-87.696261,'Patrick Nwanah
My Maps title: 2633 W Jerome St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Adrian Najera JR','2638 N Austin Ave',null,'unassigned','2019-08-05'::date,41.928674,-87.776239,'Adrian Najera JR
20X20 HIP, ARCH TEAK ROOF, TAN SIDING
My Maps title: 2638 N Austin Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Ladisa Philip','2645 N Austin Ave',null,'unassigned','2019-08-12'::date,41.928827,-87.775543,'Ladisa Philip
My Maps title: 2645 N Austin Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('2743 N Troy St','2743 N Troy St','Chicago','bill','2019-06-19'::date,41.9314996,-87.705884,'2743 N Troy St, Chicago, IL  60647, United States
Rep:Bill
ZIP 60647 | My Maps title: 2743 N Troy St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Tillman Griffin','2815 West 100th Place',null,'unassigned','2019-08-12'::date,41.710603,-87.692384,'14X28 Gable 4/12 Briarwood Siding Desert Tan Roof
Tillman Griffin
My Maps title: 2815 West 100th Place
[AGB-IMPORT:mymaps-2026-10-15]'),
('Alco Construction','2824 N Spaulding Ave',null,'unassigned','2019-08-05'::date,41.932789,-87.71024,'Alco Construction
22X20 HIP
My Maps title: 2824 N Spaulding Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Alfreda Barrera','2835 N Kenneth Ave',null,'unassigned','2019-08-12'::date,41.932693,-87.737711,'Alfreda Barrera
My Maps title: 2835 N Kenneth Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Tristian Hummel','2852 N Albany Ave',null,'unassigned','2019-08-05'::date,41.933615,-87.705378,'Tristian Hummel 
19X23 GABLE CEMENT BOARD, FIRE RATED GARAGE
My Maps title: 2852 N Albany Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Michael Ochoa','2920 N Sayre Ave',null,'tomas','2023-10-31'::date,41.9332937,-87.8013184,'Rep: Tomas
April Sales
Customer: Ochoa, Michael
My Maps title: 2920 N Sayre Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Also Construction','2933 N Spaulding Ave',null,'unassigned','2019-08-05'::date,41.934892,-87.709595,'Also Construction
20X20 HIP
My Maps title: 2933 N Spaulding Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Shasha Jiang','2939 S Emerald Ave',null,'unassigned','2019-08-12'::date,41.840568,-87.644773,'20X22 Hip D4 Grey Brownwood Shingles
Shasha Jiang
My Maps title: 2939 S Emerald Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Alco Construction','2942 N Seeley Ave',null,'unassigned','2019-08-12'::date,41.935382,-87.679797,'20X20 Hip 18’ Doot 6/12 Pitch
Alco Construction
My Maps title: 2942 N Seeley Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Geraldine Strzepek','2943 N Marmora Ave',null,'unassigned','2019-08-12'::date,41.934297,-87.773298,'20X20 Gable 20X8 Rear ERP D4 White Sierra Grey Roof
Geraldine Strzepek
My Maps title: 2943 N Marmora Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Julianna Davis','3004 W Warren Blvd Chicago',null,'wally','2019-06-24'::date,41.8821353,-87.7015706,'Repair/Refurbish 
Rep Wally. Customer Julianna Davis
My Maps title: 3004 W Warren Blvd Chicago
[AGB-IMPORT:mymaps-2026-10-15]'),
('Eduardo Rodriguez','3011 61Th St',null,'unassigned','2019-08-12'::date,42.330342,-87.870853,'Eduardo Rodriguez
My Maps title: 3011 61Th St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Steve Jones','3014 W Walnut St Chicago',null,'wally','2019-06-24'::date,41.885655899999996,-87.7019524,'20X24 Gable , D4 Flint , Party Door
Rep. Wally 
Customer Steve Jones
My Maps title: 3014 W Walnut St Chicago
[AGB-IMPORT:mymaps-2026-10-15]'),
('Maria Bernal-Prez','3025 N Christiana Ave',null,'unassigned','2019-08-12'::date,41.936494,-87.71085,'Repair Job
Maria Bernal-Prez
My Maps title: 3025 N Christiana Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Tom Jarvis','3031 N Kilbourn Ave',null,'unassigned','2019-08-12'::date,41.936246,-87.739057,'Tom Jarvis
My Maps title: 3031 N Kilbourn Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Quyen Lang','3036 Sunnydale Avenue',null,'unassigned','2019-08-12'::date,41.848022,-87.859875,'Quyen Lang
My Maps title: 3036 Sunnydale Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Reynaldo Dionisio','3037 Sunset Lane',null,'unassigned','2019-08-12'::date,41.934223,-87.877256,'Reynaldo Dionisio
My Maps title: 3037 Sunset Lane
[AGB-IMPORT:mymaps-2026-10-15]'),
('Oscar Garcia','3040 Dora Street',null,'unassigned','2019-08-12'::date,41.934254,-87.880239,'Oscar Garcia
My Maps title: 3040 Dora Street
[AGB-IMPORT:mymaps-2026-10-15]'),
('Hector Fraguso','3223 N Ozark Ave',null,'unassigned','2019-08-12'::date,41.938656,-87.819867,'Hector Fraguso
My Maps title: 3223 N Ozark Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Kim Sisney','3229 W 84th Pl',null,'unassigned','2019-08-12'::date,41.739483,-87.703289,'24X20 Hip Desert Tan Roof Clay Siding
Kim Sisney
My Maps title: 3229 W 84th Pl
[AGB-IMPORT:mymaps-2026-10-15]'),
('Tom Wergzyn','3320 Hayes St',null,'unassigned','2019-08-12'::date,42.05687,-87.726694,'Tom Wergzyn
My Maps title: 3320 Hayes St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Cesar Figueroa','3335 W 62nd Pl',null,'unassigned','2019-08-12'::date,41.779583,-87.706958,'30X20 Reverse Gable Flint Siding Black Roof
Cesar Figueroa
My Maps title: 3335 W 62nd Pl
[AGB-IMPORT:mymaps-2026-10-15]'),
('Adrian Zepeda','3411 N Overhill Ave Chicago',null,'wally','2019-06-24'::date,41.9417185,-87.8188394,'22X22 Hip 
Rep. Wally 
Customer Adrian Zepeda
My Maps title: 3411 N Overhill Ave Chicago
[AGB-IMPORT:mymaps-2026-10-15]'),
('Andy Khorshid','3423 N Oakley Ave',null,'unassigned','2019-08-12'::date,41.943874,-87.685407,'19X20 Hip D4 Cream Desert Tan Roof 
Andy Khorshid
My Maps title: 3423 N Oakley Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Sam Smith','3425 N Bosworth Ave',null,'wally','2023-10-31'::date,41.9441776,-87.6672829,'Rep Wally
February Sales
Customer: Smith, Sam
My Maps title: 3425 N Bosworth Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Krystyna Walenski','3444 N Oconto Ave',null,'unassigned','2019-08-12'::date,41.942859,-87.808495,'Krystyna Walenski
My Maps title: 3444 N Oconto Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Mutjab Adross','3447 Park Ave',null,'tom','2023-10-31'::date,41.8278021,-87.8487201,'Rep Tom Milas 
March Sales
Customer: Adross, Mutjab
My Maps title: 3447 Park Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Laura Williams','3469 N Kedzie Ave',null,'matt','2023-10-31'::date,41.9447747,-87.7074962,'Rep: Matt
May Sales
Customer: Williams, Laura
My Maps title: 3469 N Kedzie Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('John Schweitzer','3544 Mccormick Avenue',null,'unassigned','2019-08-12'::date,41.826413,-87.837168,'John Schweitzer
My Maps title: 3544 Mccormick Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Kimberly Li','3547 S Hamilton Ave',null,'unassigned','2019-08-12'::date,41.829005,-87.678559,'Kimberly Li
My Maps title: 3547 S Hamilton Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Adriann Anderson','3622 S Wallace St',null,'unassigned','2019-08-12'::date,41.828278,-87.641525,'Adriann Anderson
My Maps title: 3622 S Wallace St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Nicholas Fawell','3634 N Damen Ave',null,'unassigned','2023-10-31'::date,41.9479432,-87.6788585,'Rep: 
May Sales
Customer: Fawell, Nicholas
My Maps title: 3634 N Damen Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('John Madden','3639 W 57th St',null,'unassigned','2019-08-12'::date,41.789447,-87.714985,'John Madden
My Maps title: 3639 W 57th St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Deidra Suber','3655 S Dr Martin Luther King Jr Dr',null,'unassigned','2019-08-12'::date,41.827714,-87.616491,'13X20 Gable Basic Garage D4 Wedgewood
Deidra Suber
My Maps title: 3655 S Dr Martin Luther King Jr Dr
[AGB-IMPORT:mymaps-2026-10-15]'),
('Lashawn Hill','3701 W 81st St',null,'unassigned','2019-08-12'::date,41.7457,-87.714687,'Lashawn Hill
My Maps title: 3701 W 81st St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jonathan Caruso','3701 West Mclean Avenue',null,'unassigned','2019-08-05'::date,41.917982,-87.719397,'Jonathan Caruso
22X20 GABLE, D4 MIST, DESERT TAN ROOF
My Maps title: 3701 West Mclean Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Carlos Paredes','3713 W Wabansia Ave',null,'unassigned','2019-08-12'::date,41.911529,-87.719672,'20X20 Hip Tan Siding Brown Shingles
Carlos Paredes
My Maps title: 3713 W Wabansia Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Martin Svanascini','3714 W 71st St',null,'unassigned','2019-08-05'::date,41.76446,-87.715697,'Martin Svanascini
20X20 HIP, BROWNWOOD ROOF, TAN SIDING
My Maps title: 3714 W 71st St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Stemper Kyle','3719 N Marshfield Ave',null,'wally','2023-10-31'::date,41.9494472,-87.6698672,'Rep: Wally
April Sales
Customer: Stemper Kyle
My Maps title: 3719 N Marshfield Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Anthony Bosse','3724 W Palmer St',null,'unassigned','2019-08-12'::date,41.921172,-87.720426,'Anthony Bosse
My Maps title: 3724 W Palmer St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Micaela Guzman','3791 W Pippin St',null,'unassigned','2019-08-05'::date,41.753365,-87.717906,'Micaela Guzman
20X22 GABLE, TAN SIDING, FULL LOFT
My Maps title: 3791 W Pippin St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Gallo Julian','3839 Kirk St',null,'wally','2023-10-31'::date,42.0242817,-87.7249795,'Rep Wally
April Sales
Customer: Gallo Julian
My Maps title: 3839 Kirk St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Armando Rodrigues','3849 N Richmond St',null,'wally','2023-10-31'::date,41.9517598,-87.7015634,'Rep Wally
January Sales
Customer: Rodrigues, Armando
My Maps title: 3849 N Richmond St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jim Sugrue','3851 N Bell Ave',null,'unassigned','2019-08-05'::date,41.951967,-87.68441,'Jim Sugrue 
21X24 HIP, D4 BEIGE, GRAY SHINGLES
My Maps title: 3851 N Bell Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Gus Difranco','3905 N Whipple St Chicago',null,'bill','2019-06-24'::date,41.9523538,-87.7040696,'20X22 Hip Black Shingles Pewter Siding
Rep Bill. Customer Gus Difranco
My Maps title: 3905 N Whipple St Chicago
[AGB-IMPORT:mymaps-2026-10-15]'),
('3925 W 58th Pl, Near South Side','3925 W 58th Pl, Near South Side','Chicago','unassigned','2019-08-05'::date,41.786613,-87.721584,'3925 W 58th Pl, Near South Side, Chicago, IL, USA
My Maps title: 3925 W 58th Pl
[AGB-IMPORT:mymaps-2026-10-15]'),
('Greg Williams','4021 N Troy St',null,'wally','2023-10-31'::date,41.9546588,-87.7065213,'Rep: Wally
April Sales
Customer: Williams, Greg
My Maps title: 4021 N Troy St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Robert Roman','4028 Center Ave',null,'sam','2023-10-31'::date,41.8178976,-87.8167647,'Rep: Sam
May Sales
Customer: Roman, Robert
My Maps title: 4028 Center Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Don Brugdon','4115 N Cumberland Ave',null,'unassigned','2019-08-05'::date,41.954362,-87.836316,'Don Brugdon
REPAIR/REFURBISH EXISTING GARAGE
My Maps title: 4115 N Cumberland Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Dave Garcia','4118 N Sacramento Ave',null,'tom','2023-10-31'::date,41.9563944,-87.7034677,'Rep Tom Milan
March Sales
Customer: Garcia, Dave
My Maps title: 4118 N Sacramento Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('June Miller','4227 149th St',null,'sam','2023-10-31'::date,41.6214947,-87.7235401,'Rep: Sam
April Sales
Customer: Miller, June
My Maps title: 4227 149th St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Leonel Alba','4311 South Saint Louis Avenue',null,'unassigned','2019-08-12'::date,41.814979,-87.711142,'Leonel Alba
My Maps title: 4311 South Saint Louis Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Roberto Mendez','4410 S Troy St',null,'aman','2023-10-31'::date,41.8131972,-87.703192,'Rep: Aman
April Sales
Customer: Mendez, Roberto
My Maps title: 4410 S Troy St
[AGB-IMPORT:mymaps-2026-10-15]'),
('4427 S Campbell Ave','4427 S Campbell Ave','Chicago','luis','2019-07-03'::date,41.8130044,-87.6867724,'4427 S Campbell Ave, Chicago, IL  60632, United States
Rep:Luis
ZIP 60632 | My Maps title: 4427 S Campbell Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Matthew Bremer','4429 N Harding Ave',null,'matt','2023-10-31'::date,41.9618293,-87.7263517,'Rep: Matt
May Sales
Customer: Bremer, Matthew
My Maps title: 4429 N Harding Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Aaron Durnbaugh','4444 N Artesian Ave',null,'wally','2023-10-31'::date,41.9626442,-87.6902188,'Rep Wally
January Sales
Customer: Durnbaugh, Aaron
My Maps title: 4444 N Artesian Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Stacey Ladan','4500 Blanchan Avenue',null,'unassigned','2019-08-05'::date,41.808777,-87.858677,'Stacey Ladan
My Maps title: 4500 Blanchan Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Tracy Black','4510 S Oakenwald Ave',null,'unassigned','2019-08-05'::date,41.813439,-87.595285,'Tracy Black
Financing
My Maps title: 4510 S Oakenwald Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Marek Sieminiec','4535 N Monitor Ave',null,'unassigned','2019-08-12'::date,41.963297,-87.773103,'20X20 Hip Desert Tan Roof D4 White
Marek Sieminiec
My Maps title: 4535 N Monitor Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jennifer Gardner','4538 W 89th Pl Hometown',null,'tom','2019-06-24'::date,41.72875619999999,-87.735826,'18X20 Hip, Gaf Arch Shakewood Roof ,D4 Mist Siding.      Rep. Tom 
Customer Jennifer Gardner
My Maps title: 4538 W 89th Pl Hometown
[AGB-IMPORT:mymaps-2026-10-15]'),
('Yennis Hurtado','4539 Grove Ave Berwyn',null,'aman','2019-06-24'::date,41.809337799999994,-87.79306249999999,'Finance
Rep Aman.  Customer Yennis Hurtado
My Maps title: 4539 Grove Ave Berwyn
[AGB-IMPORT:mymaps-2026-10-15]'),
('Dochee','4601 S Calumet Ave',null,'unassigned','2019-08-12'::date,41.810965,-87.617939,'Dochee
My Maps title: 4601 S Calumet Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Dochee','4603 South Calumet Avenue',null,'unassigned','2019-08-12'::date,41.8109338,-87.6181969,'Dochee
My Maps title: 4603 South Calumet Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Dochee','4605 South Calumet Avenue',null,'unassigned','2019-08-12'::date,41.8109065,-87.6181962,'19X22 Hip Black Roof Dutchlap Clay Siding
Dochee
My Maps title: 4605 South Calumet Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Dochee','4607 South Calumet Avenue',null,'unassigned','2019-08-12'::date,41.8108792,-87.6181955,'18X22 Hip
Dochee
My Maps title: 4607 South Calumet Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jose Sanchez','4621 W Altgeld St',null,'unassigned','2019-08-05'::date,41.925954,-87.742617,'Jose Sanchez
8/27/18
My Maps title: 4621 W Altgeld St
[AGB-IMPORT:mymaps-2026-10-15]'),
('GT Alternative','4627 S St Lawrence Ave',null,'unassigned','2019-08-05'::date,41.810469,-87.611127,'GT Alternative 
14X20 HIP, DRIFTWOOD ROOF, D4 GRAY 
SIDING
My Maps title: 4627 S St Lawrence Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Matthew Dixon','4630 W Montana St',null,'matt','2023-10-31'::date,41.9254884,-87.742943,'Rep: Matt
May Sales
Customer: Dixon, Matthew
My Maps title: 4630 W Montana St
[AGB-IMPORT:mymaps-2026-10-15]'),
('4639 W 84th Pl','4639 W 84th Pl','Chicago','unassigned','2020-04-20'::date,41.7385294,-87.737689,'4639 W 84th Pl, Chicago, IL  60652, United States
ZIP 60652 | My Maps title: 4639 W 84th Pl
[AGB-IMPORT:mymaps-2026-10-15]'),
('Edwin Faland','4645 Ozanam Avenue',null,'unassigned','2019-08-12'::date,41.96465,-87.821601,'Edwin Faland
My Maps title: 4645 Ozanam Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Lee Franceschi','4710 W Schubert Ave',null,'unassigned','2019-08-12'::date,41.929822,-87.744563,'20X20 Hip Desert Tan Roof 6’ ERP
Lee Franceschi
My Maps title: 4710 W Schubert Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Estella Guadalupe','4801 Ozark Avenue',null,'unassigned','2019-08-12'::date,41.967145,-87.820215,'Estella Guadalupe
My Maps title: 4801 Ozark Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Shardon Builders','4821 W Argyle St',null,'unassigned','2019-08-05'::date,41.971411,-87.748787,'Shardon Builders
20X20 Hip
My Maps title: 4821 W Argyle St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Densie Boske','4824 N Newcastle Ave',null,'unassigned','2019-08-12'::date,41.969111,-87.798049,'Densie Boske
My Maps title: 4824 N Newcastle Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Javier Flores','4842 West Berenice Avenue',null,'unassigned','2019-08-12'::date,41.9506602,-87.7488805,'Javier Flores
My Maps title: 4842 West Berenice Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Saleh Mohammed','4858 N Kilbourn Ave',null,'unassigned','2019-08-12'::date,41.969752,-87.741209,'18X22 Hip Desert Tan Roof Cream Siding
Saleh Mohammed
My Maps title: 4858 N Kilbourn Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Ernesto Rodriguez','4915 W Oakdale Ave',null,'unassigned','2019-08-12'::date,41.933974,-87.749835,'20X23 Hip Flint Siding White Corners
Ernesto Rodriguez
My Maps title: 4915 W Oakdale Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Nancy Goldberger','4920 Howard Street',null,'unassigned','2019-08-05'::date,42.019299,-87.751049,'Nancy Goldberger
20X20 GABLE, BEIGE SIDING, BROWNWOOD SHINGLES
My Maps title: 4920 Howard Street
[AGB-IMPORT:mymaps-2026-10-15]'),
('Richard Austin','4926 West 106th Place',null,'unassigned','2019-08-05'::date,41.699354,-87.743864,'Richard Austin 
22X20 HIP, BROWNWOOD ROOF, BRIAIRWOOD SIDING
My Maps title: 4926 West 106th Place
[AGB-IMPORT:mymaps-2026-10-15]'),
('Benjamin Pacheco','4951 W George St',null,'unassigned','2019-08-12'::date,41.933046,-87.751133,'22X20 Hip Roof 6’ Rear Patio Briarwood Siding
Benjamin Pacheco
My Maps title: 4951 W George St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Michael Arone','5038 W Fletcher St Chicago',null,'wally','2019-06-24'::date,41.93805820000001,-87.7533253,'Rep Wally 
Customer Michael Arone
My Maps title: 5038 W Fletcher St Chicago
[AGB-IMPORT:mymaps-2026-10-15]'),
('Robert Zettl','5042 W Windsor Ave',null,'matt','2023-10-31'::date,41.9636041,-87.7542239,'Rep: Matt
May Sales
Customer: Zettl, Robert
My Maps title: 5042 W Windsor Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Suhel Patel','5134 N St Louis Ave',null,'unassigned','2019-08-05'::date,41.974898,-87.716343,'Suhel Patel
22X20 HIP, D4 FLINT, BLACK SHINGLES
My Maps title: 5134 N St Louis Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Karen Bradley','5143 Coyle Avenue',null,'unassigned','2019-08-12'::date,42.007093,-87.757062,'Karen Bradley
My Maps title: 5143 Coyle Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Forrest Downey','5150 N Lovejoy Ave',null,'wally','2023-10-31'::date,41.9744634,-87.7655291,'Rep Wally
January Sales
Customer: Downey, Forrest
My Maps title: 5150 N Lovejoy Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jean Atley','5218 N La Crosse Ave',null,'unassigned','2019-08-12'::date,41.975919,-87.749679,'Jean Atley
My Maps title: 5218 N La Crosse Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Barbara Quinn','5231 W Quincy St',null,'unassigned','2019-08-05'::date,41.877296,-87.756219,'Barbara Quinn
24X22 HIP, 8'' PARTY DOOR, ALMOND SIDING, AUTUMN BROWN
My Maps title: 5231 W Quincy St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Laura Edge','5239 N Normandy Ave',null,'unassigned','2019-08-12'::date,41.97679,-87.793566,'Repair/Refurbish House-Addition
Laura Edge
My Maps title: 5239 N Normandy Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Pedro Reyes','5239 S Moody Ave',null,'unassigned','2019-08-12'::date,41.796843,-87.775502,'Pedro Reyes
My Maps title: 5239 S Moody Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Tamakisha Meeks','5306 W Ferdinand St',null,'tomaz','2023-10-31'::date,41.8891129,-87.7581773,'Rep Tomaz
March Sales
Customer: Meeks, Tamakisha
My Maps title: 5306 W Ferdinand St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Helix Construction','5321 N Sawyer Ave',null,'unassigned','2019-08-12'::date,41.978276,-87.709612,'Helix Construction
My Maps title: 5321 N Sawyer Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Luiz Vazquez','5323 W Drummond Pl',null,'unassigned','2019-08-12'::date,41.928385,-87.759725,'Luiz Vazquez
My Maps title: 5323 W Drummond Pl
[AGB-IMPORT:mymaps-2026-10-15]'),
('Gregory D Kling','5340 N Nottingham Ave',null,'unassigned','2019-08-05'::date,41.97836,-87.803876,'Gregory D Kling 
23X25 REV GABLE, 24" LP EAST WALL, PEWTER SIDING
My Maps title: 5340 N Nottingham Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Anwar Roji','5361 N Luna Ave',null,'unassigned','2019-08-12'::date,41.979118,-87.766849,'Anwar Roji
My Maps title: 5361 N Luna Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Timothy Barrett','5441 North Paulina Street',null,'unassigned','2019-08-05'::date,41.980992,-87.671949,'Timothy Barrett
19X20 GABLE, FULL LOFT, CUSTOM GARAGE
My Maps title: 5441 North Paulina Street
[AGB-IMPORT:mymaps-2026-10-15]'),
('Sheila Adams','5442 W Adams St',null,'unassigned','2019-08-12'::date,41.878659,-87.761241,'Repair Job
Sheila Adams
My Maps title: 5442 W Adams St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Angela Schuler','5449 N Natchez Ave',null,'unassigned','2019-08-12'::date,41.980716,-87.788643,'Angela Schuler
My Maps title: 5449 N Natchez Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Shawn Satherke','5454 W Pensacola Ave',null,'unassigned','2019-08-12'::date,41.959873,-87.764469,'Shawn Satherke
My Maps title: 5454 W Pensacola Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Dan rhodes','5620 N Kolmar Ave',null,'unassigned','2019-08-12'::date,41.983324,-87.742299,'22X22 Gable Onyx Black roof Flint siding
Dan rhodes
My Maps title: 5620 N Kolmar Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Hector Ocosto','5634 W School St',null,'unassigned','2019-08-12'::date,41.940654,-87.767934,'20X20 Gable Autumn Brown Cream Siding 
Hector Ocosto
My Maps title: 5634 W School St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Always Home LLC','5737 N Merrimac Ave',null,'unassigned','2019-08-12'::date,41.985833,-87.783697,'Always Home LLC
My Maps title: 5737 N Merrimac Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Lana & Calvin Miyagawa','5772 N Ridge Ave',null,'unassigned','2019-08-12'::date,41.986772,-87.665755,'Lana & Calvin Miyagawa
My Maps title: 5772 N Ridge Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Yamane Development','5814 N Melvina Ave',null,'unassigned','2019-08-05'::date,41.986992,-87.783162,'Yamane Development
24X22 HIP, PARTY DOOR, BAYOU BLUE SIDING
My Maps title: 5814 N Melvina Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Bruce Nagel','5828 S Neva Ave',null,'unassigned','2019-08-05'::date,41.785646,-87.800367,'Bruce Nagel
28X21 HIP, 5'' SIDE PATIO, FULL LOFT
My Maps title: 5828 S Neva Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Steven Kravetz','5911 W Fitch Ave',null,'unassigned','2019-08-12'::date,42.010733,-87.774704,'Steven Kravetz
My Maps title: 5911 W Fitch Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Eric Chung','5933 N Knox Ave',null,'unassigned','2019-08-12'::date,41.988714,-87.744616,'Eric Chung
My Maps title: 5933 N Knox Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Mary Luzader','5978 N Manton Ave',null,'unassigned','2019-08-05'::date,41.989589,-87.775641,'Mary Luzader
REPAIR JOB QUALIFIES FOR BONUS
My Maps title: 5978 N Manton Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Patrick Flaherty','6004 W Berenice Ave Chicago',null,'sam','2019-06-24'::date,41.95056699999999,-87.776945,'20X20 Hip Chateau Green Roof Storm Royal Siding
Rep Sam.  Customer Patrick Flaherty
My Maps title: 6004 W Berenice Ave Chicago
[AGB-IMPORT:mymaps-2026-10-15]'),
('Viktoria Kontos','6026 N Christiana Ave',null,'wally','2023-10-31'::date,41.9910933,-87.7131088,'Rep: Wally
May Sales
Customer: Kontos, Viktoria
My Maps title: 6026 N Christiana Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Neil Boyd','6129 W Roscoe St',null,'unassigned','2019-08-05'::date,41.941813,-87.779971,'Neil Boyd
My Maps title: 6129 W Roscoe St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Peggy Korus','6135 W Roscoe St',null,'unassigned','2019-08-12'::date,41.94181,-87.780209,'Peggy Korus
My Maps title: 6135 W Roscoe St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Make Dirnberger','6161 N Nagle Ave',null,'unassigned','2019-08-12'::date,41.993055,-87.787202,'2
Make Dirnberger
My Maps title: 6161 N Nagle Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Kelli Hutton','6228 M Magnolia Ave',null,'unassigned','2019-08-05'::date,41.995407,-87.662072,'Kelli Hutton
20X20 GABLE 6/12, TAN SIDING, DRFITWOOD SHINGLES 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 
STEVEN LARRSON	4 N 525 FOX FIELD DR	CAMPTON HILLS
My Maps title: 6228 M Magnolia Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Sharon Barcham','6348 W Cuyler Ave',null,'unassigned','2019-08-12'::date,41.9541,-87.786093,'Repair/Refurbish Shingles
Sharon Barcham
My Maps title: 6348 W Cuyler Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Ezra Mccann','6401 S Ingleside Ave',null,'unassigned','2019-08-12'::date,41.778531,-87.601284,'Ezra Mccann
My Maps title: 6401 S Ingleside Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Susan McDonald','6430 N Sayre Ave',null,'wally','2023-10-31'::date,41.9988742,-87.8015364,'Rep Wally
February Sales
Customer: McDonald, Susan
My Maps title: 6430 N Sayre Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Young Ji','6522 North Spaulding Avenue',null,'unassigned','2019-08-12'::date,41.999886,-87.712236,'Young Ji
My Maps title: 6522 North Spaulding Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Helen Roundtree','6537 S Artesian Ave',null,'unassigned','2019-08-05'::date,41.774497,-87.684395,'Helen Roundtree
18X20 HIP, CHATEAU GREEN ROOF, MENARDS SIDING	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 
STEVEN LARRSON	4 N 525 FOX FIELD DR	CAMPTON HILLS
My Maps title: 6537 S Artesian Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Joseph Clayton','6631 S Justine St',null,'unassigned','2019-08-05'::date,41.773079,-87.662474,'Joseph Clayton
20X22 HIP, QUARRY GREY ROOF, HARBOR BLUE SIDING
My Maps title: 6631 S Justine St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Nathan Roseberry','6632 N Onarga Ave',null,'wally','2023-10-31'::date,42.0007546,-87.8108216,'Rep Wally
January Sales
Customer: Roseberry, Nathan
My Maps title: 6632 N Onarga Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Nathan Roseberry','6632 N Onarga Ave',null,'unassigned','2019-08-12'::date,42.000631,-87.810971,'Repair
Nathan Roseberry
My Maps title: 6632 N Onarga Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Kyle Zaremba','6733 N Odell Ave',null,'wally','2023-10-31'::date,42.0035837,-87.8100972,'Rep: Wally
April Sales
Customer: Zaremba, Kyle
My Maps title: 6733 N Odell Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Rory Williams','6954 S Parnell Ave',null,'unassigned','2019-08-12'::date,41.767373,-87.638767,'Rory Williams
My Maps title: 6954 S Parnell Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Dennis Vavra','7043 W 63rd Pl',null,'wally','2023-10-31'::date,41.7762901,-87.7976174,'Rep: Wally
May Sales
Customer: Vavra, Dennis
My Maps title: 7043 W 63rd Pl
[AGB-IMPORT:mymaps-2026-10-15]'),
('David Szczeparsh','7112 Church Street',null,'unassigned','2019-08-05'::date,42.048285,-87.804156,'David Szczeparsh
My Maps title: 7112 Church Street
[AGB-IMPORT:mymaps-2026-10-15]'),
('McMillian Raymond','7131 S Champlain Ave',null,'matt','2023-10-31'::date,41.7648752,-87.6089286,'Rep Matt
March Sales
Customer: McMillian Raymond
My Maps title: 7131 S Champlain Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Micheal Taylor','7300 S Evans Ave',null,'unassigned','2019-08-12'::date,41.76205,-87.60707,'Micheal Taylor
My Maps title: 7300 S Evans Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Samantha Franklin','7304 S Lafayette Ave Chicago',null,'wally','2019-06-24'::date,41.761580599999995,-87.6267555,'20X22 Hip D4 Wedgwood Estate Grey Roof
Rep Wally Customer Samantha Franklin
My Maps title: 7304 S Lafayette Ave Chicago
[AGB-IMPORT:mymaps-2026-10-15]'),
('Matthew Parrilli','7418 N Sheridan Rd',null,'wally','2023-10-31'::date,42.0167363,-87.6656953,'Rep: Wally
April Sales
Customer: Parrilli, Matthew
My Maps title: 7418 N Sheridan Rd
[AGB-IMPORT:mymaps-2026-10-15]'),
('James Schnier','7444 N Osceola Ave',null,'wally','2023-10-31'::date,42.0165342,-87.812967,'Rep:Wally
January Sales
Customer: Schnier,James
My Maps title: 7444 N Osceola Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Donna Devereux','7444 West Winona Street',null,'unassigned','2019-08-12'::date,41.973704,-87.813799,'Donna Devereux
My Maps title: 7444 West Winona Street
[AGB-IMPORT:mymaps-2026-10-15]'),
('Dave Novak','7451 173rd Pl Tinley Park',null,'aman','2019-06-24'::date,41.575439599999996,-87.8004436,'Rep Aman.  Customer Dave Novak
My Maps title: 7451 173rd Pl Tinley Park
[AGB-IMPORT:mymaps-2026-10-15]'),
('Christian Dumatol','7511 N Oakley Ave',null,'wally','2023-10-31'::date,42.0177576,-87.6874596,'Rep: Wally
April Sales
Customer: Dumatol, Christian
My Maps title: 7511 N Oakley Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('7548 North Ozark Avenue','7548 North Ozark Avenue',null,'unassigned','2019-08-12'::date,42.018247,-87.820908,'22X20 Hip Almond Siding Brownwood Roof

Z
My Maps title: 7548 North Ozark Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Michael Hynes','7624 W Gregory St Chicago',null,'wally','2019-06-24'::date,41.9808215,-87.8179371,'30X20 Reverse Gable 2 Party Door Clay Siding
Rep Wally         Customer Michael Hynes
My Maps title: 7624 W Gregory St Chicago
[AGB-IMPORT:mymaps-2026-10-15]'),
('Ahmedunisa Khan','7628 Kenton Avenue',null,'unassigned','2019-08-12'::date,42.019949,-87.743149,'Repair/Refurbish Job Qualifies for bonus
Ahmedunisa Khan
My Maps title: 7628 Kenton Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Roderick Pierce Sr','7640 S Wood St',null,'unassigned','2019-08-05'::date,41.754559,-87.66876,'Roderick Pierce Sr
22X22 HIP, DUTCHLAP ALMOND, RED & WHITE ROOF	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 	 
LUIS ARCOS	604 N LECLAIRE	CHICAGO
My Maps title: 7640 S Wood St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Rosie Johnson','7651 S Maplewood Ave',null,'matt','2023-10-31'::date,41.7538646,-87.6863601,'Rep Matt
March Sales
Customer: Johnson, Rosie
My Maps title: 7651 S Maplewood Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Joey Halperin','7705 S Loomis Blvd',null,'unassigned','2019-08-12'::date,41.753771,-87.658238,'20X20 Hip Desert Tan Roof Clay Siding
Joey Halperin
My Maps title: 7705 S Loomis Blvd
[AGB-IMPORT:mymaps-2026-10-15]'),
('Tamika Arnett','7816 S May St Chicago',null,'sam','2019-06-24'::date,41.7517797,-87.6528915,'Financing 
Rep Sam.   Customer Tamika Arnett
My Maps title: 7816 S May St Chicago
[AGB-IMPORT:mymaps-2026-10-15]'),
('Lynn Garner','8022 S Dobson Ave',null,'unassigned','2019-08-12'::date,41.748797,-87.599404,'Lynn Garner
My Maps title: 8022 S Dobson Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Tony Thomas','8334 Kedvale Avenue',null,'unassigned','2019-08-12'::date,42.03274,-87.731939,'Tony Thomas
My Maps title: 8334 Kedvale Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Meghan Williams','8734 Avers Avenue',null,'unassigned','2019-08-12'::date,42.040039,-87.724462,'40X20 Hip 2 16’ Doors 3 Tab Desert Tan Roof
Meghan Williams
My Maps title: 8734 Avers Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Charlie Foreman','8921 S Marshfield Ave',null,'tomaz','2023-10-31'::date,41.7314011,-87.6638636,'Rep: Tomaz
May Sales
Customer: Foreman, Charlie
My Maps title: 8921 S Marshfield Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Joey Halperin','9016 S Woodlawn Ave',null,'unassigned','2019-08-12'::date,41.730728,-87.595339,'Joey Halperin
My Maps title: 9016 S Woodlawn Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Fabiano Diaz','9100 W 147th St Orland Park',null,'wally','2019-06-24'::date,41.623644,-87.8414878,'24X22 , Driftwood Roof, Tan Siding Rep. Wally
Customer Fabiano Diaz
My Maps title: 9100 W 147th St Orland Park
[AGB-IMPORT:mymaps-2026-10-15]'),
('Cindy Ji','9154 S Marshfield Ave',null,'unassigned','2019-08-12'::date,41.726861,-87.664382,'Cindy Ji
My Maps title: 9154 S Marshfield Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Micheal Roundtree','9324 S Merrill Ave',null,'matt','2023-10-31'::date,41.7253418,-87.5720528,'Rep: Matt
April Sales
Customer: Roundtree, Micheal
My Maps title: 9324 S Merrill Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('MIKE KLEINHAUS','9420 South Utica Avenue',null,'unassigned','2019-08-05'::date,41.72173,-87.698406,'MIKE KLEINHAUS
My Maps title: 9420 South Utica Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Chris Johnson','9623 South Sacramento Avenue',null,'unassigned','2019-08-12'::date,41.718215,-87.696491,'Chris Johnson
My Maps title: 9623 South Sacramento Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Karen Brown','9631 S Bell Ave Chicago',null,'sam','2019-06-24'::date,41.718233,-87.677999,'Repair/Refurbish
Rep Sam  Customer Karen Brown
My Maps title: 9631 S Bell Ave Chicago
[AGB-IMPORT:mymaps-2026-10-15]'),
('Joanne Crocker','10014 S La Salle St',null,'matt','2023-10-31'::date,41.712046,-87.6275117,'Rep: Matt
April Sales
Customer: Crocker, Joanne
My Maps title: 10014 S La Salle St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Dorothy Lux','10017 South Central Park Avenue',null,'unassigned','2019-08-12'::date,41.710799,-87.710932,'Dorothy Lux
My Maps title: 10017 South Central Park Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Maggie Nash','10621 S Union Ave',null,'unassigned','2019-08-12'::date,41.700856,-87.639877,'23X24 Hip 6’ Rear Patio Roof Shadow Siding Desert Tan
Maggie Nash
My Maps title: 10621 S Union Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jose Chavez','11250 S Avenue G',null,'unassigned','2019-08-05'::date,41.690321,-87.532019,'Jose Chavez
My Maps title: 11250 S Avenue G
[AGB-IMPORT:mymaps-2026-10-15]'),
('Joseph Gibbons','11335 South Saint Lawrence Avenue',null,'unassigned','2019-08-05'::date,41.688102,-87.608042,'Joseph Gibbons
12X28 GABLE, CEMENT BOARD, FIRECODE
My Maps title: 11335 South Saint Lawrence Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Ray Vaughn','11723 S Throop St',null,'unassigned','2019-08-12'::date,41.680592,-87.653835,'Ray Vaughn
My Maps title: 11723 S Throop St
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jeremy Hughes','12825 S Bishop St',null,'sam','2023-10-31'::date,41.6601673,-87.656796,'Rep: Sam
May Sales
Customer: Hughes, Jeremy
My Maps title: 12825 S Bishop St
[AGB-IMPORT:mymaps-2026-10-15]'),
('LILLIE NABORS','17135 Westview Avenue',null,'unassigned','2019-08-05'::date,41.584066,-87.628176,'LILLIE NABORS
South Holland
My Maps title: 17135 Westview Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Clint Yonkers','18094 Jason Ln',null,'wally','2023-10-31'::date,41.5662175,-87.573074,'Rep: Wally
April Sales
Customer: Yonkers, Clint
My Maps title: 18094 Jason Ln
[AGB-IMPORT:mymaps-2026-10-15]'),
('Vernon Reed','18941 Anthony Avenue',null,'unassigned','2019-08-05'::date,41.544581,-87.724798,'Vernon Reed
My Maps title: 18941 Anthony Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('Maha Reyes','24070 W Rose Ave',null,'sam','2023-10-31'::date,42.2295521,-88.1035302,'Rep: Sam
May Sales
Customer: Reyes, Maha
My Maps title: 24070 W Rose Ave
[AGB-IMPORT:mymaps-2026-10-15]'),
('Aaron Brown','2216 W Leland Ave','Chicago','sam','2019-06-12'::date,41.9670642,-87.6847192,'2216 W Leland Ave, Chicago, IL  60625, United States
Rep:Sam
ZIP 60625 | My Maps title: Aaron Brown
[AGB-IMPORT:mymaps-2026-10-15]'),
('Aaron Purser','1440 N Elk Grove Ave','Chicago','wally','2019-11-11'::date,41.9090269,-87.6740776,'1440 N Elk Grove Ave, Chicago, IL  60622, United States
Rep:Wally
ZIP 60622 | My Maps title: Aaron Purser
[AGB-IMPORT:mymaps-2026-10-15]'),
('Alena Centi','2625 W Foster Ave','Chicago','luis','2019-03-23'::date,41.9756458,-87.6950681,'2625 W Foster Ave, Chicago, IL  60625, United States
Rep:Luis
ZIP 60625 | My Maps title: Alena Centi
[AGB-IMPORT:mymaps-2026-10-15]'),
('Allison Daley','2030 West Pensacola Avenue','Chicago','wally','2019-02-21'::date,41.960383,-87.691484,'2030 West Pensacola Avenue, Chicago, IL, USA
Rep: Wally
My Maps title: Allison Daley
[AGB-IMPORT:mymaps-2026-10-15]'),
('Ana Tat','8207 Keating Ave','Skokie','bill','2019-03-31'::date,42.0301699,-87.7458337,'8207 Keating Ave, Skokie, IL  60076, United States
Rep:Bill
ZIP 60076 | My Maps title: Ana Tat
[AGB-IMPORT:mymaps-2026-10-15]'),
('Ankit Shah','818 S Kenilworth Ave','Oak Park','wally','2019-12-17'::date,41.8747866,-87.7968773,'818 S Kenilworth Ave, Oak Park, IL  60304, United States
Rep:Wally
ZIP 60304 | My Maps title: Ankit Shah
[AGB-IMPORT:mymaps-2026-10-15]'),
('Anne Sachs','1467 E Forest Ave','Des Plaines','wally','2019-10-10'::date,42.0275273,-87.8873106,'1467 E Forest Ave, Des Plaines, IL  60018, United States
Rep:Wally
ZIP 60018 | My Maps title: Anne Sachs
[AGB-IMPORT:mymaps-2026-10-15]'),
('Anthony Garoppolo','323 S Walnut Ave','Arlington Heights','wally','2019-03-02'::date,42.0774653,-87.9887742,'323 S Walnut Ave, Arlington Heights, IL  60005, United States
Rep:Wally
ZIP 60005 | My Maps title: Anthony Garoppolo
[AGB-IMPORT:mymaps-2026-10-15]'),
('Antonio Rendon','2863 S Keeley St','Chicago','wally','2019-08-01'::date,41.841416,-87.6540213,'2863 S Keeley St, Chicago, IL  60608, United States
Rep:Wally
ZIP 60608 | My Maps title: Antonio Rendon
[AGB-IMPORT:mymaps-2026-10-15]'),
('Armando Barajos','10751 S Albany Ave','Chicago','aman','2019-07-30'::date,41.6973994,-87.6984132,'10751 S Albany Ave, Chicago, IL  60655, United States
Rep: Aman
ZIP 60655 | My Maps title: Armando Barajos
[AGB-IMPORT:mymaps-2026-10-15]'),
('Arthur Bennet Jr','7330 S Maryland Ave','Chicago','luis','2019-03-20'::date,41.7612856,-87.604457,'7330 S Maryland Ave, Chicago, IL  60619, United States
Rep:Luis
Repair Job
ZIP 60619 | My Maps title: Arthur Bennet Jr
[AGB-IMPORT:mymaps-2026-10-15]'),
('Avila Nelson','4585 North Meade Avenue','Chicago','wally','2019-02-25'::date,41.964534,-87.779338,'4585 North Meade Avenue, Chicago, IL, USA
Rep: Wally
My Maps title: Avila Nelson
[AGB-IMPORT:mymaps-2026-10-15]'),
('Bill Lenzen','109 Orchard St','Round Lake','sam','2019-04-07'::date,42.3506717,-88.0903634,'109 Orchard St, Round Lake, IL  60073, United States
Rep:Sam
ZIP 60073 | My Maps title: Bill Lenzen
[AGB-IMPORT:mymaps-2026-10-15]'),
('Bob Glabas','6413 W Sunnyside Ave','Harwood Heights','sam','2019-05-29'::date,41.9617778,-87.7875421,'6413 W Sunnyside Ave, Harwood Heights, IL  60706, United States
Rep:Sam
ZIP 60706 | My Maps title: Bob Glabas
[AGB-IMPORT:mymaps-2026-10-15]'),
('Brian Piejko','10230 S Artesian Ave','Chicago','sam','2019-09-15'::date,41.7072506,-87.6832109,'10230 S Artesian Ave, Chicago, IL  60655, United States
Rep:Sam
ZIP 60655 | My Maps title: Brian Piejko
[AGB-IMPORT:mymaps-2026-10-15]'),
('Brian Wiggins','3617 S Giles Ave','Chicago','wally','2019-08-04'::date,41.828704,-87.6189946,'3617 S Giles Ave, Chicago, IL  60653, United States
Rep:Wally
ZIP 60653 | My Maps title: Brian Wiggins
[AGB-IMPORT:mymaps-2026-10-15]'),
('Carlos Rodriguez','133 W Glengate Ave','Chicago Heights','sam','2019-04-14'::date,41.5238165,-87.6468208,'133 W Glengate Ave, Chicago Heights, IL  60411, United States
Rep:Sam
ZIP 60411 | My Maps title: Carlos Rodriguez
[AGB-IMPORT:mymaps-2026-10-15]'),
('Carole Baker','5110 N Mulligan Ave','Chicago','luis','2019-07-10'::date,41.9742183,-87.7869672,'5110 N Mulligan Ave, Chicago, IL  60630, United States
Rep: Luis
ZIP 60630 | My Maps title: Carole Baker
[AGB-IMPORT:mymaps-2026-10-15]'),
('Catherine Bucco','124 W Devon Ave','Roselle','aman','2019-07-28'::date,41.9908545,-88.0842612,'124 W Devon Ave, Roselle, IL  60172, United States
Rep:Aman
ZIP 60172 | My Maps title: Catherine Bucco
[AGB-IMPORT:mymaps-2026-10-15]'),
('Cathy Mendelsohn','1020 N Haddow Ave','Arlington Heights','wally','2019-03-06'::date,42.0952734,-87.9770548,'1020 N Haddow Ave, Arlington Heights, IL  60004, United States
Rep:Wally
ZIP 60004 | My Maps title: Cathy Mendelsohn
[AGB-IMPORT:mymaps-2026-10-15]'),
('Cesar Acuna','4439 S Sacramento Ave','Chicago','luis','2019-05-21'::date,41.8125369,-87.6989422,'4439 S Sacramento Ave, Chicago, IL  60632, United States
Rep:Luis
ZIP 60632 | My Maps title: Cesar Acuna
[AGB-IMPORT:mymaps-2026-10-15]'),
('Charles Miller','3117 N Natoma Ave','Chicago','wally','2019-04-18'::date,41.9369816,-87.7917328,'3117 N Natoma Ave, Chicago, IL  60634, United States
Rep:Wally
ZIP 60634 | My Maps title: Charles Miller
[AGB-IMPORT:mymaps-2026-10-15]'),
('Cherly Lewis','600 Paxton Ave','Calumet City','tom','2019-09-16'::date,41.6181457,-87.5690074,'600 Paxton Ave, Calumet City, IL  60409, United States
Rep:Tom
ZIP 60409 | My Maps title: Cherly Lewis
[AGB-IMPORT:mymaps-2026-10-15]'),
('Chris Gillian','10725 S Morgan St','Chicago','sam','2019-05-12'::date,41.6987824,-87.6471304,'10725 S Morgan St, Chicago, IL  60643, United States
Rep: Sam
ZIP 60643 | My Maps title: Chris Gillian
[AGB-IMPORT:mymaps-2026-10-15]'),
('Christian Moder','1043 N Lombard Ave','Oak Park','wally','2019-11-30'::date,41.9054144,-87.7806348,'1043 N Lombard Ave, Oak Park, IL  60302, United States
Rep:Wally
ZIP 60302 | My Maps title: Christian Moder
[AGB-IMPORT:mymaps-2026-10-15]'),
('Christopher Bermudez','5537 W Henderson St','Chicago','wally','2019-11-27'::date,41.9411056,-87.7656368,'5537 W Henderson St, Chicago, IL  60641, United States
Rep:Wally
ZIP 60641 | My Maps title: Christopher Bermudez
[AGB-IMPORT:mymaps-2026-10-15]'),
('Christopher Weihs','3006 Gilead Ave','Zion','wally','2019-04-24'::date,42.4404634,-87.8440323,'3006 Gilead Ave, Zion, IL  60099, United States
Rep:Wally
ZIP 60099 | My Maps title: Christopher Weihs
[AGB-IMPORT:mymaps-2026-10-15]'),
('Christopher Weihs','3013 Ezra Ave','Zion','wally','2019-04-04'::date,42.4401183,-87.8372148,'3013 Ezra Ave, Zion, IL  60099, United States
Rep: Wally
ZIP 60099 | My Maps title: Christopher Weihs
[AGB-IMPORT:mymaps-2026-10-15]'),
('Chun KWong','626 W 48th Pl','Chicago','wally','2019-06-29'::date,41.8063968,-87.6417326,'626 W 48th Pl, Chicago, IL  60609, United States
Rep: Wally
ZIP 60609 | My Maps title: Chun KWong
[AGB-IMPORT:mymaps-2026-10-15]'),
('Claudia Miller','4411 S Richmond St','Chicago','wally','2019-11-12'::date,41.8132574,-87.6977677,'4411 S Richmond St, Chicago, IL  60632, United States
Rep:Wally
ZIP 60632 | My Maps title: Claudia Miller
[AGB-IMPORT:mymaps-2026-10-15]'),
('Coliis Underwood','15032 Wabash Ave','South Holland','sam','2019-09-30'::date,41.621747,-87.6161452,'15032 Wabash Ave, South Holland, IL  60473, United States
Rep:Sam
ZIP 60473 | My Maps title: Coliis Underwood
[AGB-IMPORT:mymaps-2026-10-15]'),
('Cy Oldham','3505 N Marshfield Ave','Chicago','sam','2019-10-07'::date,41.9453959,-87.6698063,'3505 N Marshfield Ave, Chicago, IL  60657, United States
Rep:Sam
ZIP 60657 | My Maps title: Cy Oldham
[AGB-IMPORT:mymaps-2026-10-15]'),
('Cynthia Carter','2034 Collett Ln','Flossmoor','sam','2019-11-04'::date,41.5489732,-87.6666238,'2034 Collett Ln, Flossmoor, IL  60422, United States
Rep:Sam
ZIP 60422 | My Maps title: Cynthia Carter
[AGB-IMPORT:mymaps-2026-10-15]'),
('Dan Smith','6217 N Paulina St','Chicago','sam','2019-06-08'::date,41.9949788,-87.6716248,'6217 N Paulina St, Chicago, IL  60660, United States
Rep: Sam
ZIP 60660 | My Maps title: Dan Smith
[AGB-IMPORT:mymaps-2026-10-15]'),
('Daniel Griffin','3914 W 102nd Pl','Chicago','wally','2019-09-24'::date,41.7066922,-87.7192134,'3914 W 102nd Pl, Chicago, IL  60655, United States
Rep:Wally
ZIP 60655 | My Maps title: Daniel Griffin
[AGB-IMPORT:mymaps-2026-10-15]'),
('Daniel Harkins','2574 W 119th St','Chicago','wally','2019-10-16'::date,41.6774522,-87.6859442,'2574 W 119th St, Chicago, IL  60655, United States
Rep:Wally
ZIP 60655 | My Maps title: Daniel Harkins
[AGB-IMPORT:mymaps-2026-10-15]'),
('David Adams','839 S Clinton Ave','Oak Park','wally','2019-05-05'::date,41.8739801,-87.7990399,'839 S Clinton Ave, Oak Park, IL  60304, United States
Rep:Wally
ZIP 60304 | My Maps title: David Adams
[AGB-IMPORT:mymaps-2026-10-15]'),
('David Cherry','2556 W 119th St','Chicago','wally','2019-12-24'::date,41.6774855,-87.6854208,'2556 W 119th St, Chicago, IL  60655, United States
Rep:Wally
ZIP 60655 | My Maps title: David Cherry
[AGB-IMPORT:mymaps-2026-10-15]'),
('David Jirasko','3046 N 78th Ave','Elmwood Park','wally','2019-04-29'::date,41.9358936,-87.8216876,'3046 N 78th Ave, Elmwood Park, IL  60707, United States
Rep:Wally
ZIP 60707 | My Maps title: David Jirasko
[AGB-IMPORT:mymaps-2026-10-15]'),
('David Witter','4417 N Laporte Ave','Chicago','luis','2019-08-09'::date,41.9612137,-87.7509252,'4417 N Laporte Ave, Chicago, IL  60630, United States
Rep:Luis
ZIP 60630 | My Maps title: David Witter
[AGB-IMPORT:mymaps-2026-10-15]'),
('Dean Tate','282 Yates Ave','Calumet City','sam','2019-10-12'::date,41.6292875,-87.5643016,'282 Yates Ave, Calumet City, IL  60409, United States
Rep:Sam
ZIP 60409 | My Maps title: Dean Tate
[AGB-IMPORT:mymaps-2026-10-15]'),
('Diana Kenworthy','4929 N Leavitt St','Chicago','sam','2019-05-20'::date,41.9713873,-87.6838957,'4929 N Leavitt St, Chicago, IL  60625, United States
Rep:Sam
ZIP 60625 | My Maps title: Diana Kenworthy
[AGB-IMPORT:mymaps-2026-10-15]'),
('Dorita Hayes','10604 S Dr Martin Luther King Jr Dr','Chicago','wally','2019-11-08'::date,41.7015925,-87.6139046,'10604 S Dr Martin Luther King Jr Dr, Chicago, IL  60628, United States
Rep:Wally
ZIP 60628 | My Maps title: Dorita Hayes
[AGB-IMPORT:mymaps-2026-10-15]'),
('Dragan Sutic','4849 N McVicker Ave','Chicago','sam','2019-03-27'::date,41.9699215,-87.7792539,'4849 N McVicker Ave, Chicago, IL  60630, United States
Rep:Sam
ZIP 60630 | My Maps title: Dragan Sutic
[AGB-IMPORT:mymaps-2026-10-15]'),
('Edgar Medley','352 E 87th Pl','Chicago','luis','2019-06-24'::date,41.7352306,-87.6155837,'352 E 87th Pl, Chicago, IL  60619, United States
Rep:Luis
ZIP 60619 | My Maps title: Edgar Medley
[AGB-IMPORT:mymaps-2026-10-15]'),
('Edward Lowenbaum','3929 N Lowell Ave','Chicago','wally','2019-08-06'::date,41.952616,-87.736498,'3929 N Lowell Ave, Chicago, IL  60641, United States
Rep:Wally
ZIP 60641 | My Maps title: Edward Lowenbaum
[AGB-IMPORT:mymaps-2026-10-15]'),
('Eric Pearson','6616 W Schreiber Ave','Chicago','sam','2019-03-07'::date,41.9984333,-87.7930945,'6616 W Schreiber Ave, Chicago, IL  60631, United States
Rep:Sam
ZIP 60631 | My Maps title: Eric Pearson
[AGB-IMPORT:mymaps-2026-10-15]'),
('Erik Schmidt','8715 W Herrick Ave','River Grove','sam','2019-04-07'::date,41.9244241,-87.8433599,'8715 W Herrick Ave, River Grove, IL  60171, United States
Rep:Sam
ZIP 60171 | My Maps title: Erik Schmidt
[AGB-IMPORT:mymaps-2026-10-15]'),
('Esmeralda Melchor','4639 W 84th Pl','Chicago','wally','2019-05-22'::date,41.7385294,-87.737689,'4639 W 84th Pl, Chicago, IL  60652, United States
Rep:Wally
ZIP 60652 | My Maps title: Esmeralda Melchor
[AGB-IMPORT:mymaps-2026-10-15]'),
('Etlingh Rodriguez','5412 N Luna Ave','Chicago','luis','2019-04-18'::date,41.9797301,-87.767449,'5412 N Luna Ave, Chicago, IL  60630, United States
Rep:Luis
ZIP 60630 | My Maps title: Etlingh Rodriguez
[AGB-IMPORT:mymaps-2026-10-15]'),
('Robert Scoltes','Ewing Avenue Evanston',null,'tom','2019-06-24'::date,42.0554312,-87.71297539999999,'20X20 Hip Dutchman Pewter Sierra Grey Roof
Rep Tom.   Customer Robert Scoltes
My Maps title: Ewing Avenue Evanston
[AGB-IMPORT:mymaps-2026-10-15]'),
('Felicia Sewell','1416 S Avers Ave','Chicago','wally','2019-07-11'::date,41.86181659706813,-87.72159504674195,'1416 S Avers Ave, Chicago, IL  60623, United States
Rep:Wally
ZIP 60623 | My Maps title: Felicia Sewell
[AGB-IMPORT:mymaps-2026-10-15]'),
('Frank Weissert','2683 Stewart Ave','Evanston','tom','2019-09-03'::date,42.0667142,-87.7043943,'2683 Stewart Ave, Evanston, IL  60201, United States
Rep:Tom
ZIP 60201 | My Maps title: Frank Weissert
[AGB-IMPORT:mymaps-2026-10-15]'),
('Fred Urcliales','4176 W Fletcher St','Chicago','wally','2019-08-13'::date,41.9383184,-87.7326003,'4176 W Fletcher St, Chicago, IL  60641, United States
Rep:Wally
ZIP 60641 | My Maps title: Fred Urcliales
[AGB-IMPORT:mymaps-2026-10-15]'),
('Fugiang Chen','3431 S Hermitage Ave','Chicago','wally','2019-09-04'::date,41.8313389,-87.6689236,'3431 S Hermitage Ave, Chicago, IL  60608, United States
Rep:Wally
ZIP 60608 | My Maps title: Fugiang Chen
[AGB-IMPORT:mymaps-2026-10-15]'),
('Gary Frelich','6N075 Papworth St','Bloomingdale','sam','2019-03-31'::date,41.9620682,-88.1124643,'6N075 Papworth St, Bloomingdale, IL  60172, United States
Rep:Sam
ZIP 60172 | My Maps title: Gary Frelich
[AGB-IMPORT:mymaps-2026-10-15]'),
('Gary Wegner','1118 N 11th Ave','Melrose Park','tom','2019-03-21'::date,41.8977769,-87.8474378,'1118 N 11th Ave, Melrose Park, IL  60160, United States
Rep:Tom
Repair Job
ZIP 60160 | My Maps title: Gary Wegner
[AGB-IMPORT:mymaps-2026-10-15]'),
('Grady Shipp','16335 S Lexington Dr','Plainfield','sam','2019-04-16'::date,41.5857584,-88.1942954,'16335 S Lexington Dr, Plainfield, IL  60586, United States
Rep:Sam
ZIP 60586 | My Maps title: Grady Shipp
[AGB-IMPORT:mymaps-2026-10-15]'),
('Gus Chamopoulos','5536 N Mason Ave','Chicago','wally','2019-05-08'::date,41.9822003,-87.7771181,'5536 N Mason Ave, Chicago, IL  60630, United States
Rep:Wally
ZIP 60630 | My Maps title: Gus Chamopoulos
[AGB-IMPORT:mymaps-2026-10-15]'),
('Gustavo Franco','1440 Hull Ave','Westchester','sam','2019-03-10'::date,41.8585636,-87.876379,'1440 Hull Ave, Westchester, IL  60154, United States
Rep:Sam
ZIP 60154 | My Maps title: Gustavo Franco
[AGB-IMPORT:mymaps-2026-10-15]')
) as v(customer,address,city,salesman,d,lat,lng,notes)
where not exists (select 1 from public.jobs j where j.notes like '%AGB-IMPORT:mymaps-2026-10-15%'
  and j.customer=v.customer and j.latitude=v.lat and j.longitude=v.lng);
commit;
-- Check: select count(*) from public.jobs where notes like '%AGB-IMPORT:mymaps-2026-10-15%';  -- expect 585 after all parts
