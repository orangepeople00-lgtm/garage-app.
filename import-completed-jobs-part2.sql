-- AGB import of completed past jobs from Google My Maps export (part 2 of 2). Safe to run more than once.
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
('Harold Hansan','7414 N Sheridan Rd','Chicago','wally','2019-10-03'::date,42.0165792,-87.6656356,'7414 N Sheridan Rd, Chicago, IL  60626, United States
Rep:Wally
ZIP 60626 | My Maps title: Harold Hansan
[AGB-IMPORT:mymaps-2026-10-15]'),
('Helana Tsoukalas','4810 S Indiana Ave','Chicago','luis','2019-10-31'::date,41.8070873,-87.6215068,'4810 S Indiana Ave, Chicago, IL  60615, United States
Rep:Luis
ZIP 60615 | My Maps title: Helana Tsoukalas
[AGB-IMPORT:mymaps-2026-10-15]'),
('Heracio Serna','110 Valley Dr','Bolingbrook','sam','2019-07-30'::date,41.6970005,-88.0955695,'110 Valley Dr, Bolingbrook, IL  60440, United States
Rep:Sam
ZIP 60440 | My Maps title: Heracio Serna
[AGB-IMPORT:mymaps-2026-10-15]'),
('Home','8831 W 99th Pl','Palos Hills','unassigned','2020-05-05'::date,41.7097104,-87.8389002,'8831 W 99th Pl, Palos Hills, IL  60465, United States
ZIP 60465 | My Maps title: Home
[AGB-IMPORT:mymaps-2026-10-15]'),
('Ignacio Silva','5324 S Millard Ave','Chicago','aman','2019-05-20'::date,41.7961878,-87.7149411,'5324 S Millard Ave, Chicago, IL  60632, United States
Rep:Aman
ZIP 60632 | My Maps title: Ignacio Silva
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jake Wasilewski','314 Washington St','Glenview','sam','2019-08-04'::date,42.061348,-87.8074808,'314 Washington St, Glenview, IL  60025, United States
Rep:Sam
ZIP 60025 | My Maps title: Jake Wasilewski
[AGB-IMPORT:mymaps-2026-10-15]'),
('James Durkin','24366 S Pine Ridge Dr E','Monee','sam','2019-09-22'::date,41.4444501,-87.7991451,'24366 S Pine Ridge Dr E, Monee, IL  60449, United States
Rep:Sam
ZIP 60449 | My Maps title: James Durkin
[AGB-IMPORT:mymaps-2026-10-15]'),
('James Li','1829 W Wellington Ave','Chicago','wally','2019-03-14'::date,41.9357582,-87.6747811,'1829 W Wellington Ave, Chicago, IL  60657, United States
Rep:Wally
ZIP 60657 | My Maps title: James Li
[AGB-IMPORT:mymaps-2026-10-15]'),
('James Shrum','1633 S 58th Ave','Cicero','wally','2019-05-22'::date,41.8568921,-87.7686203,'1633 S 58th Ave, Cicero, IL  60804, United States
Rep:Wally
ZIP 60804 | My Maps title: James Shrum
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jason Derosas','5121 N Kilbourn Ave','Chicago','luis','2019-09-24'::date,41.974266,-87.7402939,'5121 N Kilbourn Ave, Chicago, IL  60630, United States
Rep:Luis
ZIP 60630 | My Maps title: Jason Derosas
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jason Moekimann','417 South Humphrey Avenue','Oak Park','wally','2019-02-08'::date,41.881453,-87.77668,'417 South Humphrey Avenue, Oak Park, IL, USA
Rep:Wally
My Maps title: Jason Moekimann
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jeff McGovern','9055 Fairlane Dr','Bridgeview','aman','2019-05-25'::date,41.7268282,-87.7947188,'9055 Fairlane Dr, Bridgeview, IL  60455, United States
Rep:Aman
ZIP 60455 | My Maps title: Jeff McGovern
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jeff Park','2222 W Farragut Ave','Chicago','wally','2019-04-23'::date,41.9770693,-87.685321,'2222 W Farragut Ave, Chicago, IL  60625, United States
Rep:Wally
ZIP 60625 | My Maps title: Jeff Park
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jeff Scialabba','1633 S Prospect Ave','Park Ridge','wally','2019-04-20'::date,41.9896782,-87.8324817,'1633 S Prospect Ave, Park Ridge, IL  60068, United States
Rep:Wally
ZIP 60068 | My Maps title: Jeff Scialabba
[AGB-IMPORT:mymaps-2026-10-15]'),
('Joanna Barros','5840 West Berenice Avenue','Chicago','wally','2019-02-02'::date,41.950549,-87.773433,'5840 West Berenice Avenue, Chicago, IL, USA
Rep:Wally
My Maps title: Joanna Barros
[AGB-IMPORT:mymaps-2026-10-15]'),
('Joel Norwoods','3903 N Oriole Ave','Chicago','tom','2019-04-23'::date,41.9508664,-87.8167135,'3903 N Oriole Ave, Chicago, IL  60634, United States
Rep:Tom
ZIP 60634 | My Maps title: Joel Norwoods
[AGB-IMPORT:mymaps-2026-10-15]'),
('John Davis','2959 N Washtenaw Ave','Chicago','wally','2019-03-07'::date,41.9356399,-87.6949923,'2959 N Washtenaw Ave, Chicago, IL  60618, United States
Rep:Wally
ZIP 60618 | My Maps title: John Davis
[AGB-IMPORT:mymaps-2026-10-15]'),
('John Dewitt','11027 S Washtenaw Ave','Chicago','tom','2019-04-20'::date,41.6927255,-87.6882583,'11027 S Washtenaw Ave, Chicago, IL  60655, United States
Rep:Tom
ZIP 60655 | My Maps title: John Dewitt
[AGB-IMPORT:mymaps-2026-10-15]'),
('John Mcgeown','5659 N Ridge Ave','Chicago','luis','2019-03-31'::date,41.9849543,-87.6618513,'5659 N Ridge Ave, Chicago, IL  60660, United States
Rep:Luis
ZIP 60660 | My Maps title: John Mcgeown
[AGB-IMPORT:mymaps-2026-10-15]'),
('John Mulligan','3806 N Albany Ave','Chicago','rich','2019-10-21'::date,41.9505729,-87.705757,'3806 N Albany Ave, Chicago, IL  60618, United States
Rep:Rich
ZIP 60618 | My Maps title: John Mulligan
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jonathon Negror','4322 W Henderson St','Chicago','wally','2019-03-09'::date,41.9419188,-87.7355853,'4322 W Henderson St, Chicago, IL  60641, United States
Rep:Wally
ZIP 60641 | My Maps title: Jonathon Negror
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jorge Rios','1834 S 57th Ct','Cicero','wally','2019-04-15'::date,41.8552169,-87.7680562,'1834 S 57th Ct, Cicero, IL  60804, United States
Rep:Wally
ZIP 60804 | My Maps title: Jorge Rios
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jose Rojas','1441 Park Ave','North Chicago','luis','2019-08-02'::date,42.3329367,-87.8403265,'1441 Park Ave, North Chicago, IL  60064, United States
Rep:Luis
ZIP 60064 | My Maps title: Jose Rojas
[AGB-IMPORT:mymaps-2026-10-15]'),
('Joseph Dickman','6074 N Newburg Ave','Chicago','luis','2019-08-19'::date,41.9912152,-87.7925855,'6074 N Newburg Ave, Chicago, IL  60631, United States
Rep:Luis
ZIP 60631 | My Maps title: Joseph Dickman
[AGB-IMPORT:mymaps-2026-10-15]'),
('Joseph Waksanski','7N024 Valley Rd','Roselle','sam','2019-07-20'::date,41.9765704,-88.087549,'7N024 Valley Rd, Roselle, IL  60172, United States
Rep:Sam
ZIP 60172 | My Maps title: Joseph Waksanski
[AGB-IMPORT:mymaps-2026-10-15]'),
('Josh Ippel','5224 N La Crosse Ave','Chicago','luis','2019-08-03'::date,41.976082,-87.7495677,'5224 N La Crosse Ave, Chicago, IL  60630, United States
Rep:Luis
ZIP 60630 | My Maps title: Josh Ippel
[AGB-IMPORT:mymaps-2026-10-15]'),
('Juan Hurtado','7000 w 167th st Tinley Park',null,'sam','2019-03-04'::date,41.588078613463765,-87.78981283307076,'7000 w 167th st Tinley Park
Rep: Sam
My Maps title: Juan Hurtado
[AGB-IMPORT:mymaps-2026-10-15]'),
('Julio Flores','3526 W Pierce Ave','Chicago','luis','2019-05-29'::date,41.9093022,-87.7154742,'3526 W Pierce Ave, Chicago, IL  60651, United States
Rep:Luis
ZIP 60651 | My Maps title: Julio Flores
[AGB-IMPORT:mymaps-2026-10-15]'),
('Kaitlyn Palmieri','2559 N Elm St','River Grove','sam','2019-03-21'::date,41.9261663,-87.8512288,'2559 N Elm St, River Grove, IL  60171, United States
Rep:Sam
ZIP 60171 | My Maps title: Kaitlyn Palmieri
[AGB-IMPORT:mymaps-2026-10-15]'),
('Kevin Cunningham','7705 W Hortense Ave','Chicago','wally','2019-10-31'::date,41.9957506,-87.8193058,'7705 W Hortense Ave, Chicago, IL  60631, United States
Rep:Wally
ZIP 60631 | My Maps title: Kevin Cunningham
[AGB-IMPORT:mymaps-2026-10-15]'),
('Kevin Lukwinski','9030 W 23rd Pl','Riverside','sam','2019-09-25'::date,41.8470048,-87.8486889,'9030 W 23rd Pl, Riverside, IL  60546, United States
Rep:Sam
ZIP 60546 | My Maps title: Kevin Lukwinski
[AGB-IMPORT:mymaps-2026-10-15]'),
('Kevin Lynn','6615 W Imlay St','Chicago','wally','2019-04-07'::date,41.9989505,-87.7929857,'6615 W Imlay St, Chicago, IL  60631, United States
Rep: Wally
ZIP 60631 | My Maps title: Kevin Lynn
[AGB-IMPORT:mymaps-2026-10-15]'),
('Kirstin Survoy','1831 W Summerdale Ave','Chicago','bill','2019-03-29'::date,41.9786373,-87.6760948,'1831 W Summerdale Ave, Chicago, IL  60640, United States
Rep:Bill
ZIP 60640 | My Maps title: Kirstin Survoy
[AGB-IMPORT:mymaps-2026-10-15]'),
('Kristen Williams','5811 N Rockwell St','Chicago','wally','2019-09-17'::date,41.9871613,-87.6941496,'5811 N Rockwell St, Chicago, IL  60659, United States
Rep:Wally
ZIP 60659 | My Maps title: Kristen Williams
[AGB-IMPORT:mymaps-2026-10-15]'),
('Levarn Robinson','1214 S Loomis St','Chicago','luis','2019-07-09'::date,41.865836284922274,-87.66174985332222,'1214 S Loomis St, Chicago, IL  60608, United States
Rep:Luis
ZIP 60608 | My Maps title: Levarn Robinson
[AGB-IMPORT:mymaps-2026-10-15]'),
('Lottie Bell','2281 N Clybourn Ave','Chicago','wally','2019-10-22'::date,41.9234115,-87.6665532,'2281 N Clybourn Ave, Chicago, IL  60614, United States
Rep: Wally
ZIP 60614 | My Maps title: Lottie Bell
[AGB-IMPORT:mymaps-2026-10-15]'),
('Luis Ostiguin','2653 S Drake Ave','Chicago','luis','2019-05-11'::date,41.8428656,-87.7132809,'2653 S Drake Ave, Chicago, IL  60623, United States
Rep:Luis
ZIP 60623 | My Maps title: Luis Ostiguin
[AGB-IMPORT:mymaps-2026-10-15]'),
('Lydia Megrove','464 Mulberry Ln','Wood Dale','sam','2019-09-29'::date,41.9514262,-87.9626111,'464 Mulberry Ln, Wood Dale, IL  60191, United States
Rep:Sam
ZIP 60191 | My Maps title: Lydia Megrove
[AGB-IMPORT:mymaps-2026-10-15]'),
('Mantas Vansevas','231 W Circle Dr','New Lenox','sam','2019-04-28'::date,41.5103148,-87.9155372,'231 W Circle Dr, New Lenox, IL  60451, United States
Rep:Sam
ZIP 60451 | My Maps title: Mantas Vansevas
[AGB-IMPORT:mymaps-2026-10-15]'),
('Maria Sanchez','5236 W 24th St','Cicero','wally','2019-06-20'::date,41.8477271,-87.7557675,'5236 W 24th St, Cicero, IL  60804, United States
Rep:Wally
ZIP 60804 | My Maps title: Maria Sanchez
[AGB-IMPORT:mymaps-2026-10-15]'),
('Martha Ottenborn','3051 S Homan Ave','Chicago','luis','2019-05-27'::date,41.8374828,-87.7094756,'3051 S Homan Ave, Chicago, IL  60623, United States
Rep:Luis
ZIP 60623 | My Maps title: Martha Ottenborn
[AGB-IMPORT:mymaps-2026-10-15]'),
('Martin Davila','2732 S Kildare Ave','Chicago','luis','2019-10-31'::date,41.8412881,-87.7320207,'2732 S Kildare Ave, Chicago, IL  60623, United States
Rep:Luis
ZIP 60623 | My Maps title: Martin Davila
[AGB-IMPORT:mymaps-2026-10-15]'),
('Maureen Brewer','5763 N Kerbs Ave','Chicago','wally','2019-08-10'::date,41.9854296,-87.7418569,'5763 N Kerbs Ave, Chicago, IL  60646, United States
Rep:Wally
ZIP 60646 | My Maps title: Maureen Brewer
[AGB-IMPORT:mymaps-2026-10-15]'),
('Michael Scapardine','10801 S Troy St','Chicago','wally','2019-09-16'::date,41.69694,-87.6996148,'10801 S Troy St, Chicago, IL  60655, United States
Rep:Wally
ZIP 60655 | My Maps title: Michael Scapardine
[AGB-IMPORT:mymaps-2026-10-15]'),
('Micheal Fleishman','4050 W 57th Pl','Chicago','tom','2019-04-23'::date,41.7888404,-87.725051,'4050 W 57th Pl, Chicago, IL  60629, United States
Rep:Tom
ZIP 60629 | My Maps title: Micheal Fleishman
[AGB-IMPORT:mymaps-2026-10-15]'),
('Micheal Viclehr','401 S Maple Ave','Oak Park','wally','2019-09-25'::date,41.8812657,-87.8042156,'401 S Maple Ave, Oak Park, IL  60302, United States
Rep:Wally
ZIP 60302 | My Maps title: Micheal Viclehr
[AGB-IMPORT:mymaps-2026-10-15]'),
('Michele Nelson','4029 W Eddy St','Chicago','wally','2019-10-01'::date,41.9454223,-87.7286078,'4029 W Eddy St, Chicago, IL  60641, United States
Rep:Wally
ZIP 60641 | My Maps title: Michele Nelson
[AGB-IMPORT:mymaps-2026-10-15]'),
('Miguel Vargas','4854 N Austin Ave','Chicago','wally','2019-07-10'::date,41.9691883,-87.7785856,'4854 N Austin Ave, Chicago, IL  60630, United States
Rep:Wally
ZIP 60630 | My Maps title: Miguel Vargas
[AGB-IMPORT:mymaps-2026-10-15]'),
('Mike Ball','10230 S Talman Ave','Chicago','sam','2019-07-24'::date,41.7071917,-87.6881033,'10230 S Talman Ave, Chicago, IL  60655, United States
Rep:Sam
ZIP 60655 | My Maps title: Mike Ball
[AGB-IMPORT:mymaps-2026-10-15]'),
('Misuk Son','824 N Belmont Ave','Arlington Heights','wally','2019-09-12'::date,42.0928627,-87.9783139,'824 N Belmont Ave, Arlington Heights, IL  60004, United States
Rep:Wally
ZIP 60004 | My Maps title: Misuk Son
[AGB-IMPORT:mymaps-2026-10-15]'),
('Nelson Vega','318 N Sixth Ave','Maywood','wally','2019-09-28'::date,41.8906619,-87.8407633,'318 N Sixth Ave, Maywood, IL  60153, United States
Rep:Wally
ZIP 60153 | My Maps title: Nelson Vega
[AGB-IMPORT:mymaps-2026-10-15]'),
('Nicholette Moore','12333 S Wentworth Ave','Chicago','luis','2019-05-04'::date,41.67004455142621,-87.62699919188103,'12333 S Wentworth Ave, Chicago, IL  60628, United States
Rep:Luis
ZIP 60628 | My Maps title: Nicholette Moore
[AGB-IMPORT:mymaps-2026-10-15]'),
('Nina Szidon','4723 N Karlov Ave','Chicago','luis','2019-05-29'::date,41.9663252,-87.7301352,'4723 N Karlov Ave, Chicago, IL  60630, United States
Rep:Luis
ZIP 60630 | My Maps title: Nina Szidon
[AGB-IMPORT:mymaps-2026-10-15]'),
('Norbert Mika','2247 W Giddings St','Chicago','sam','2019-04-29'::date,41.9675288,-87.6858542,'2247 W Giddings St, Chicago, IL  60625, United States
Rep:Sam
ZIP 60625 | My Maps title: Norbert Mika
[AGB-IMPORT:mymaps-2026-10-15]'),
('Norbert Mika','2251 W Giddings St','Chicago','sam','2019-04-29'::date,41.9675239,-87.6859651,'2251 W Giddings St, Chicago, IL  60625, United States
Rep:Sam
ZIP 60625 | My Maps title: Norbert Mika
[AGB-IMPORT:mymaps-2026-10-15]'),
('North 74th Avenue','North 74th Avenue',null,'unassigned','2019-08-12'::date,41.916402,-87.810901,'Carmen Ferinandes
My Maps title: North 74th Avenue
[AGB-IMPORT:mymaps-2026-10-15]'),
('North Thatcher Road','North Thatcher Road',null,'unassigned','2019-08-12'::date,41.961238,-87.832974,'Riadh Hanabodi
My Maps title: North Thatcher Road
[AGB-IMPORT:mymaps-2026-10-15]'),
('Oga Re Cap LLC','2415 N Ridgeway Ave','Chicago','luis','2019-12-19'::date,41.9251194,-87.7203838,'2415 N Ridgeway Ave, Chicago, IL  60647, United States
Rep:Luis
ZIP 60647 | My Maps title: Oga Re Cap LLC
[AGB-IMPORT:mymaps-2026-10-15]'),
('Patrick Williams','7815 W Bryn Mawr Ave','Chicago','wally','2019-11-06'::date,41.98115,-87.8225181,'7815 W Bryn Mawr Ave, Chicago, IL  60631, United States
Rep:Wally
ZIP 60631 | My Maps title: Patrick Williams
[AGB-IMPORT:mymaps-2026-10-15]'),
('Paul Edgar','4443 N Richmond St','Chicago','wally','2019-10-12'::date,41.9624859,-87.7018706,'4443 N Richmond St, Chicago, IL  60625, United States
Rep:Wally
ZIP 60625 | My Maps title: Paul Edgar
[AGB-IMPORT:mymaps-2026-10-15]'),
('Rachel Vogel','2021 W Touhy Ave','Chicago','bill','2020-08-15'::date,42.0123195,-87.6811822,'2021 W Touhy Ave, Chicago, IL  60645, United States
Rep:Bill
ZIP 60645 | My Maps title: Rachel Vogel
[AGB-IMPORT:mymaps-2026-10-15]'),
('Ralph Sprague','3030 N 77th Ave','Elmwood Park','wally','2019-12-14'::date,41.9353922,-87.8192192,'3030 N 77th Ave, Elmwood Park, IL  60707, United States
Rep:Wally
ZIP 60707 | My Maps title: Ralph Sprague
[AGB-IMPORT:mymaps-2026-10-15]'),
('Rashawn Cox','1395 Freeland Ave','Calumet City','aman','2019-05-30'::date,41.5940733,-87.5343271,'1395 Freeland Ave, Calumet City, IL  60409, United States

Rep:Aman
ZIP 60409 | My Maps title: Rashawn Cox
[AGB-IMPORT:mymaps-2026-10-15]'),
('Raven Krupa','5912 N Talman Ave','Chicago','sam','2019-03-10'::date,41.9890729,-87.6959632,'5912 N Talman Ave, Chicago, IL  60659, United States
Rep:Sam
ZIP 60659 | My Maps title: Raven Krupa
[AGB-IMPORT:mymaps-2026-10-15]'),
('Ray Hermez','9318 Lockwood Ave','Skokie','wally','2019-07-23'::date,42.0504895,-87.7593424,'9318 Lockwood Ave, Skokie, IL  60077, United States
Rep:Wally
ZIP 60077 | My Maps title: Ray Hermez
[AGB-IMPORT:mymaps-2026-10-15]'),
('Ray Sullivan','612 W 47th Pl','Chicago','sam','2019-10-20'::date,41.8082264,-87.6412545,'612 W 47th Pl, Chicago, IL  60609, United States
Rep:Sam
ZIP 60609 | My Maps title: Ray Sullivan
[AGB-IMPORT:mymaps-2026-10-15]'),
('Ray Sullivan','626 W 48th Pl','Chicago','sam','2019-10-20'::date,41.8063968,-87.6417326,'626 W 48th Pl, Chicago, IL  60609, United States
Rep:Sam
ZIP 60609 | My Maps title: Ray Sullivan
[AGB-IMPORT:mymaps-2026-10-15]'),
('Ricardo Cuellar','410 Abe St','Joliet','sam','2019-03-02'::date,41.5325128,-88.0627347,'410 Abe St, Joliet, IL  60432, United States
Rep:Sam
ZIP 60432 | My Maps title: Ricardo Cuellar
[AGB-IMPORT:mymaps-2026-10-15]'),
('Ricardo Cuellar','410 Abe Street','Joliet','sam','2019-03-02'::date,41.5319107,-88.0629324,'410 Abe Street, Joliet, IL, USA
Rep:Sam
My Maps title: Ricardo Cuellar
[AGB-IMPORT:mymaps-2026-10-15]'),
('Robert Heremanas','1116 Clarence Ave','Oak Park','wally','2019-03-12'::date,41.8682032,-87.7899077,'1116 Clarence Ave, Oak Park, IL  60304, United States
Rep:Wally
ZIP 60304 | My Maps title: Robert Heremanas
[AGB-IMPORT:mymaps-2026-10-15]'),
('Robert Rialmo','6922 N Oleander Ave','Chicago','wally','2019-03-31'::date,42.0067493,-87.8154081,'6922 N Oleander Ave, Chicago, IL  60631, United States
Rep:Wally
ZIP 60631 | My Maps title: Robert Rialmo
[AGB-IMPORT:mymaps-2026-10-15]'),
('Rod Kingzette','5921 Electric Ave','Berkeley','tom','2019-05-20'::date,41.8821844,-87.9164871,'5921 Electric Ave, Berkeley, IL  60163, United States
Rep:Tom
ZIP 60163 | My Maps title: Rod Kingzette
[AGB-IMPORT:mymaps-2026-10-15]'),
('Rosemary Campuzano','2849 N Long Ave','Chicago','wally','2019-10-01'::date,41.9327945,-87.7610994,'2849 N Long Ave, Chicago, IL  60641, United States
Rep:Wally
ZIP 60641 | My Maps title: Rosemary Campuzano
[AGB-IMPORT:mymaps-2026-10-15]'),
('Rosie Cardenas','615 S Menard Ave','Chicago','wally','2019-08-17'::date,41.86986231032576,-87.76914618995036,'615 S Menard Ave, Chicago, IL  60644, United States
Rep:Wally
ZIP 60644 | My Maps title: Rosie Cardenas
[AGB-IMPORT:mymaps-2026-10-15]'),
('Roy Salinas','7342 S Albany Ave','Chicago','tom','2019-08-17'::date,41.7594853,-87.7004779,'7342 S Albany Ave, Chicago, IL  60629, United States
Rep:Tom
ZIP 60629 | My Maps title: Roy Salinas
[AGB-IMPORT:mymaps-2026-10-15]'),
('Salvatore Alaimo','7280 W Palatine Ave','Chicago','wally','2019-08-02'::date,41.9956129,-87.8099015,'7280 W Palatine Ave, Chicago, IL  60631, United States
Rep:Wally
ZIP 60631 | My Maps title: Salvatore Alaimo
[AGB-IMPORT:mymaps-2026-10-15]'),
('Sandra Arroyo','826 N Kildare Ave','Chicago','luis','2019-10-03'::date,41.8960973,-87.7337807,'826 N Kildare Ave, Chicago, IL  60651, United States
Rep:Luis
ZIP 60651 | My Maps title: Sandra Arroyo
[AGB-IMPORT:mymaps-2026-10-15]'),
('Sandra Gallo','4925 N Orange Ave','Norridge','wally','2019-04-13'::date,41.969342,-87.8234751,'4925 N Orange Ave, Norridge, IL  60706, United States
Rep:Wally
ZIP 60706 | My Maps title: Sandra Gallo
[AGB-IMPORT:mymaps-2026-10-15]'),
('Santiago Correa','5435 S Long Ave','Chicago','wally','2019-05-15'::date,41.7935832,-87.7571377,'5435 S Long Ave, Chicago, IL  60638, United States
Rep:Wally
ZIP 60638 | My Maps title: Santiago Correa
[AGB-IMPORT:mymaps-2026-10-15]'),
('Sara Byerly','2311 W Cullom Ave','Chicago','wally','2019-04-30'::date,41.9593084,-87.6867583,'2311 W Cullom Ave, Chicago, IL  60618, United States
Rep:Wally
ZIP 60618 | My Maps title: Sara Byerly
[AGB-IMPORT:mymaps-2026-10-15]'),
('Sarah Bruce','2156 W Sunnyside Ave','Chicago','wally','2019-09-14'::date,41.9634037,-87.6828708,'2156 W Sunnyside Ave, Chicago, IL  60625, United States
Rep:Wally
ZIP 60625 | My Maps title: Sarah Bruce
[AGB-IMPORT:mymaps-2026-10-15]'),
('Sharon Williams','120 N Lotus Ave','Chicago','luis','2019-04-03'::date,41.88278052305515,-87.76183694680127,'120 N Lotus Ave, Chicago, IL  60644, United States
Rep:Luis
ZIP 60644 | My Maps title: Sharon Williams
[AGB-IMPORT:mymaps-2026-10-15]'),
('Shenay Mccaray','6038 S Champlain Ave','Chicago','sam','2019-03-13'::date,41.7846178,-87.6099324,'6038 S Champlain Ave, Chicago, IL  60637, United States
Rep: Sam
20X20 Owners Concrete
ZIP 60637 | My Maps title: Shenay Mccaray
[AGB-IMPORT:mymaps-2026-10-15]'),
('Silvia Scwentor','1660 W 102nd St','Chicago','wally','2019-09-11'::date,41.7085178,-87.6646377,'1660 W 102nd St, Chicago, IL  60643, United States
Rep:Wally
ZIP 60643 | My Maps title: Silvia Scwentor
[AGB-IMPORT:mymaps-2026-10-15]'),
('SNG Investments','12408 S Orchard Ave','Alsip','sam','2019-10-08'::date,41.6669705,-87.7325187,'12408 S Orchard Ave, Alsip, IL  60803, United States
Rep:Sam
ZIP 60803 | My Maps title: SNG Investments
[AGB-IMPORT:mymaps-2026-10-15]'),
('Soledad Rodriguez','2400 S Karlov Ave','Chicago','tom','2019-09-06'::date,41.8477593,-87.726543,'2400 S Karlov Ave, Chicago, IL  60623, United States
Rep:Tom
ZIP 60623 | My Maps title: Soledad Rodriguez
[AGB-IMPORT:mymaps-2026-10-15]'),
('South 57th Court','South 57th Court',null,'unassigned','2019-08-12'::date,41.826868,-87.766894,'Vicki Delgado
My Maps title: South 57th Court
[AGB-IMPORT:mymaps-2026-10-15]'),
('St Thomas Church Of Indiana','6099 N Northcott Ave','Chicago','bill','2019-03-11'::date,41.9925294,-87.8030632,'6099 N Northcott Ave, Chicago, IL  60631, United States
Rep:Bill
ZIP 60631 | My Maps title: St Thomas Church Of Indiana
[AGB-IMPORT:mymaps-2026-10-15]'),
('Stephanie Sullavin','1616 Thelin Ct','Evanston','tom','2019-04-10'::date,42.0418216,-87.6952406,'1616 Thelin Ct, Evanston, IL  60201, United States
Rep:Tom
ZIP 60201 | My Maps title: Stephanie Sullavin
[AGB-IMPORT:mymaps-2026-10-15]'),
('Stephen Ishmael','1834 W Warner Ave','Chicago','wally','2019-05-22'::date,41.9571383,-87.6756795,'1834 W Warner Ave, Chicago, IL  60613, United States
Rep:Wally
ZIP 60613 | My Maps title: Stephen Ishmael
[AGB-IMPORT:mymaps-2026-10-15]'),
('Steve Montrose','2948 W Touhy Ave','Chicago','rich','2019-07-02'::date,42.0122003,-87.7041149,'2948 W Touhy Ave, Chicago, IL  60645, United States
Rep:Rich
ZIP 60645 | My Maps title: Steve Montrose
[AGB-IMPORT:mymaps-2026-10-15]'),
('Steve Valasco','5154 S Oak Park Ave','Chicago','wally','2019-04-22'::date,41.7979255,-87.792012,'5154 S Oak Park Ave, Chicago, IL  60638, United States
Rep:Wally
ZIP 60638 | My Maps title: Steve Valasco
[AGB-IMPORT:mymaps-2026-10-15]'),
('Steven Kalensky','2153 W Wilson Ave','Chicago','wally','2019-05-03'::date,41.9648241,-87.6827996,'2153 W Wilson Ave, Chicago, IL  60625, United States
Rep:Wally
ZIP 60625 | My Maps title: Steven Kalensky
[AGB-IMPORT:mymaps-2026-10-15]'),
('Steven Xu','274 Columbia Ave','Des Plaines','sam','2019-04-14'::date,42.0476063,-87.9169173,'274 Columbia Ave, Des Plaines, IL  60016, United States
Rep:Sam
ZIP 60016 | My Maps title: Steven Xu
[AGB-IMPORT:mymaps-2026-10-15]'),
('Tan Quoc Tran','2635 W Summerdale Ave','Chicago','wally','2019-08-12'::date,41.978382,-87.6955155,'2635 W Summerdale Ave, Chicago, IL  60625, United States
Rep:Wally
ZIP 60625 | My Maps title: Tan Quoc Tran
[AGB-IMPORT:mymaps-2026-10-15]'),
('Terrance Lyles','7143 S Michigan Ave','Chicago','wally','2019-07-15'::date,41.7643687,-87.6213171,'7143 S Michigan Ave, Chicago, IL  60619, United States
Rep:Wally
ZIP 60619 | My Maps title: Terrance Lyles
[AGB-IMPORT:mymaps-2026-10-15]'),
('Theresa Kellog','14606 Clifton Park Ave','Midlothian','sam','2019-09-14'::date,41.6272447,-87.7072413,'14606 Clifton Park Ave, Midlothian, IL  60445, United States
Rep:Sam
ZIP 60445 | My Maps title: Theresa Kellog
[AGB-IMPORT:mymaps-2026-10-15]'),
('Tom Gazda','810 Glenshire Road','Northfield Township','sam','2019-02-16'::date,42.070524,-87.838546,'810 Glenshire Road, Northfield Township, IL, USA
Rep: Sam
My Maps title: Tom Gazda
[AGB-IMPORT:mymaps-2026-10-15]'),
('Tyrese Montgomery','3840 W Huron St','Chicago','aman','2019-07-18'::date,41.893811,-87.7227998,'3840 W Huron St, Chicago, IL  60624, United States
Rep:Aman
ZIP 60624 | My Maps title: Tyrese Montgomery
[AGB-IMPORT:mymaps-2026-10-15]'),
('Vincent Finneran','2143 Ewing Ave','Evanston','wally','2019-01-05'::date,42.057022,-87.712693,'2143 Ewing Ave, Evanston, IL, USA
Rep: Wally
My Maps title: Vincent Finneran
[AGB-IMPORT:mymaps-2026-10-15]'),
('William Brown','2915 N Allen Ave','Chicago','wally','2019-10-26'::date,41.9342107,-87.7146911,'2915 N Allen Ave, Chicago, IL  60618, United States
Rep:Wally
ZIP 60618 | My Maps title: William Brown
[AGB-IMPORT:mymaps-2026-10-15]'),
('William McKinney','3101 Gilead Ave','Zion','wally','2019-05-28'::date,42.4389662,-87.8432711,'3101 Gilead Ave, Zion, IL  60099, United States
Rep:Wally
ZIP 60099 | My Maps title: William McKinney
[AGB-IMPORT:mymaps-2026-10-15]'),
('William McMahon','4651 N Paulina St','Chicago','wally','2019-08-22'::date,41.9667546,-87.6706029,'4651 N Paulina St, Chicago, IL  60640, United States
Rep:Wally
ZIP 60640 | My Maps title: William McMahon
[AGB-IMPORT:mymaps-2026-10-15]'),
('William Zamorski','4948 W Cullom Ave','Chicago','sam','2019-04-10'::date,41.9590436,-87.7517996,'4948 W Cullom Ave, Chicago, IL  60641, United States
Rep:Sam
ZIP 60641 | My Maps title: William Zamorski
[AGB-IMPORT:mymaps-2026-10-15]'),
('Yolanda Rangel','11525 S Avenue J','Chicago','wally','2019-05-11'::date,41.6856467,-87.5337729,'11525 S Avenue J, Chicago, IL  60617, United States
Rep:Wally
ZIP 60617 | My Maps title: Yolanda Rangel
[AGB-IMPORT:mymaps-2026-10-15]'),
('Adam Fryer','2220 W Farragut Ave','Chicago','tomaz','2020-08-18'::date,41.9770739,-87.6852295,'2220 W Farragut Ave, Chicago, IL  60625, United States
Rep:Tomaz
ZIP 60625 | My Maps folder: 2020 Sales | My Maps title: Adam Fryer
[AGB-IMPORT:mymaps-2026-10-15]'),
('Adam Fryer','2559 W Argyle St','Chicago','tomaz','2020-06-22'::date,41.9716432,-87.6929535,'2559 W Argyle St, Chicago, IL  60625, United States
Rep:Tomaz
ZIP 60625 | My Maps folder: 2020 Sales | My Maps title: Adam Fryer
[AGB-IMPORT:mymaps-2026-10-15]'),
('Alco Construction','2734 N Troy St','Chicago','sam','2020-12-18'::date,41.9312404,-87.7064594,'2734 N Troy St, Chicago, IL  60647, United States
Rep:Sam
ZIP 60647 | My Maps folder: 2020 Sales | My Maps title: Alco Construction
[AGB-IMPORT:mymaps-2026-10-15]'),
('Alejandra Carillo','115 S 12th Ave','Maywood','sam','2020-07-12'::date,41.8874278,-87.8476031,'115 S 12th Ave, Maywood, IL  60153, United States
Rep:Sam
ZIP 60153 | My Maps folder: 2020 Sales | My Maps title: Alejandra Carillo
[AGB-IMPORT:mymaps-2026-10-15]'),
('Alex Torres','2501 N East Brook Rd','Elmwood Park','wally','2020-10-09'::date,41.9251545,-87.8247729,'2501 N East Brook Rd, Elmwood Park, IL  60707, United States
Rep: Wally
ZIP 60707 | My Maps folder: 2020 Sales | My Maps title: Alex Torres
[AGB-IMPORT:mymaps-2026-10-15]'),
('Alison Kahn','4142 N Bell Ave','Chicago','wally','2020-07-28'::date,41.9571846,-87.6851771,'4142 N Bell Ave, Chicago, IL  60618, United States
Rep:Wally
ZIP 60618 | My Maps folder: 2020 Sales | My Maps title: Alison Kahn
[AGB-IMPORT:mymaps-2026-10-15]'),
('Alysia Hamlet','1918 N Nashville Ave','Chicago','tomaz','2020-09-28'::date,41.9151358,-87.7903665,'1918 N Nashville Ave, Chicago, IL  60707, United States
Rep: Tomaz
ZIP 60707 | My Maps folder: 2020 Sales | My Maps title: Alysia Hamlet
[AGB-IMPORT:mymaps-2026-10-15]'),
('Amanda Scampini','1850 N Whipple St','Chicago','wally','2020-09-16'::date,41.9152672,-87.70429,'1850 N Whipple St, Chicago, IL  60647, United States
Rep:Wally
ZIP 60647 | My Maps folder: 2020 Sales | My Maps title: Amanda Scampini
[AGB-IMPORT:mymaps-2026-10-15]'),
('Andre Durer','5442 W Ferdinand St','Chicago','wally','2020-08-20'::date,41.8893272,-87.7622227,'5442 W Ferdinand St, Chicago, IL  60644, United States
Rep:Wally
ZIP 60644 | My Maps folder: 2020 Sales | My Maps title: Andre Durer
[AGB-IMPORT:mymaps-2026-10-15]'),
('Angela Young','7321 S Harvard Ave','Chicago','wally','2020-04-30'::date,41.7610523,-87.6330589,'7321 S Harvard Ave, Chicago, IL  60621, United States
Rep:Wally
ZIP 60621 | My Maps folder: 2020 Sales | My Maps title: Angela Young
[AGB-IMPORT:mymaps-2026-10-15]'),
('Anthony Tenca','2605 Elder Ln','Franklin Park','sam','2020-06-02'::date,41.9259977,-87.87028,'2605 Elder Ln, Franklin Park, IL  60131, United States
Rep:Sam
ZIP 60131 | My Maps folder: 2020 Sales | My Maps title: Anthony Tenca
[AGB-IMPORT:mymaps-2026-10-15]'),
('Antonio Prieto','8718 Springfield Ave','Skokie','wally','2020-05-05'::date,42.0395794,-87.7256939,'8718 Springfield Ave, Skokie, IL  60076, United States
Rep:Wally
ZIP 60076 | My Maps folder: 2020 Sales | My Maps title: Antonio Prieto
[AGB-IMPORT:mymaps-2026-10-15]'),
('Arthur Barrios','8235 44th St','Lyons','sam','2020-06-23'::date,41.81112,-87.8273657,'8235 44th St, Lyons, IL  60534, United States
Rep:Sam
ZIP 60534 | My Maps folder: 2020 Sales | My Maps title: Arthur Barrios
[AGB-IMPORT:mymaps-2026-10-15]'),
('Arthur Johnson','5656 S Artesian Ave','Chicago','luis','2020-07-21'::date,41.7907445,-87.6854638,'5656 S Artesian Ave, Chicago, IL  60629, United States
Rep:Luis
ZIP 60629 | My Maps folder: 2020 Sales | My Maps title: Arthur Johnson
[AGB-IMPORT:mymaps-2026-10-15]'),
('Barbara Molden','4339 W Augusta Blvd','Chicago','sam','2020-07-22'::date,41.8986689,-87.7351692,'4339 W Augusta Blvd, Chicago, IL  60651, United States
Rep:Sam
ZIP 60651 | My Maps folder: 2020 Sales | My Maps title: Barbara Molden
[AGB-IMPORT:mymaps-2026-10-15]'),
('Baylee Cabrera','1913 W Cuyler Ave','Chicago','tomaz','2020-10-09'::date,41.9549257,-87.6769881,'1913 W Cuyler Ave, Chicago, IL  60613, United States
Rep:Tomaz
ZIP 60613 | My Maps folder: 2020 Sales | My Maps title: Baylee Cabrera
[AGB-IMPORT:mymaps-2026-10-15]'),
('Bela Gallagher','8319 Central Ave','Morton Grove','wally','2020-08-29'::date,42.032564,-87.7665618,'8319 Central Ave, Morton Grove, IL  60053, United States
Rep:wally
ZIP 60053 | My Maps folder: 2020 Sales | My Maps title: Bela Gallagher
[AGB-IMPORT:mymaps-2026-10-15]'),
('Beth Beeler','431 Essex Rd','Kenilworth','sam','2020-05-31'::date,42.0899435,-87.7143868,'431 Essex Rd, Kenilworth, IL  60043, United States
Rep:Sam
ZIP 60043 | My Maps folder: 2020 Sales | My Maps title: Beth Beeler
[AGB-IMPORT:mymaps-2026-10-15]'),
('Bethany Smoklarek','471 Selborne Rd','Riverside','wally','2020-09-24'::date,41.8419108,-87.812567,'471 Selborne Rd, Riverside, IL  60546, United States
Rep:Wally
ZIP 60546 | My Maps folder: 2020 Sales | My Maps title: Bethany Smoklarek
[AGB-IMPORT:mymaps-2026-10-15]'),
('Bill Austin','5034 N Major Ave','Chicago','sam','2020-05-26'::date,41.9733302,-87.7712583,'5034 N Major Ave, Chicago, IL  60630, United States
Rep:Sam
ZIP 60630 | My Maps folder: 2020 Sales | My Maps title: Bill Austin
[AGB-IMPORT:mymaps-2026-10-15]'),
('Billy Kirkland','446 W 107th St','Chicago','sam','2020-07-13'::date,41.6999475,-87.6349086,'446 W 107th St, Chicago, IL  60628, United States
Rep:Sam
ZIP 60628 | My Maps folder: 2020 Sales | My Maps title: Billy Kirkland
[AGB-IMPORT:mymaps-2026-10-15]'),
('Bob Graham','4221 N Keeler Ave','Chicago','sam','2020-07-07'::date,41.9579796,-87.7322393,'4221 N Keeler Ave, Chicago, IL  60641, United States
Rep:Sam
ZIP 60641 | My Maps folder: 2020 Sales | My Maps title: Bob Graham
[AGB-IMPORT:mymaps-2026-10-15]'),
('Brenda Blackmon','2004 Joppa Ave','Zion','wally','2020-09-28'::date,42.4585621,-87.8535768,'2004 Joppa Ave, Zion, IL  60099, United States
Rep:Wally
ZIP 60099 | My Maps folder: 2020 Sales | My Maps title: Brenda Blackmon
[AGB-IMPORT:mymaps-2026-10-15]'),
('Carlos Marquez','4253 S Francisco Ave','Chicago','luis','2020-08-05'::date,41.8157427,-87.6966124,'4253 S Francisco Ave, Chicago, IL  60632, United States
Rep:Luis
ZIP 60632 | My Maps folder: 2020 Sales | My Maps title: Carlos Marquez
[AGB-IMPORT:mymaps-2026-10-15]'),
('Carol McClain','2531 W Superior St','Chicago','wally','2020-09-15'::date,41.8945816,-87.6905358,'2531 W Superior St, Chicago, IL  60612, United States
Rep:Wally
ZIP 60612 | My Maps folder: 2020 Sales | My Maps title: Carol McClain
[AGB-IMPORT:mymaps-2026-10-15]'),
('Chris Howard','539 S Swain Ave','Elmhurst','wally','2020-10-14'::date,41.8840853,-87.9468779,'539 S Swain Ave, Elmhurst, IL  60126, United States
Rep:Wally
ZIP 60126 | My Maps folder: 2020 Sales | My Maps title: Chris Howard
[AGB-IMPORT:mymaps-2026-10-15]'),
('Chris Klescewski','6N405 Baker Dr','Itasca','sam','2020-04-29'::date,41.970741,-88.0360647,'6N405 Baker Dr, Itasca, IL  60143, United States
Rep:Sam
ZIP 60143 | My Maps folder: 2020 Sales | My Maps title: Chris Klescewski
[AGB-IMPORT:mymaps-2026-10-15]'),
('Chuck Pupkiewicz','449 Huntsbridge Rd','Matteson','sam','2020-08-20'::date,41.4945266,-87.774233,'449 Huntsbridge Rd, Matteson, IL  60443, United States
Rep:Sam
ZIP 60443 | My Maps folder: 2020 Sales | My Maps title: Chuck Pupkiewicz
[AGB-IMPORT:mymaps-2026-10-15]'),
('Corey Williams','14613 Myrtle Ave','Harvey','sam','2020-08-22'::date,41.6238896,-87.6520716,'14613 Myrtle Ave, Harvey, IL  60426, United States
Rep:Sam
ZIP 60426 | My Maps folder: 2020 Sales | My Maps title: Corey Williams
[AGB-IMPORT:mymaps-2026-10-15]'),
('Daniel Nieto','5401 S Lockwood Ave','Chicago','wally','2020-07-21'::date,41.7945242,-87.7547465,'5401 S Lockwood Ave, Chicago, IL  60638, United States
Rep:Wally
ZIP 60638 | My Maps folder: 2020 Sales | My Maps title: Daniel Nieto
[AGB-IMPORT:mymaps-2026-10-15]'),
('Daphne Pinkney','5900 W Walton St','Chicago','wally','2020-09-15'::date,41.8977116,-87.7725763,'5900 W Walton St, Chicago, IL  60651, United States
Rep:Wally
ZIP 60651 | My Maps folder: 2020 Sales | My Maps title: Daphne Pinkney
[AGB-IMPORT:mymaps-2026-10-15]'),
('David Gonzales','15026 Tripp Ave','Midlothian','sam','2020-08-02'::date,41.6189867,-87.7238598,'15026 Tripp Ave, Midlothian, IL  60445, United States
Rep:Sam
ZIP 60445 | My Maps folder: 2020 Sales | My Maps title: David Gonzales
[AGB-IMPORT:mymaps-2026-10-15]'),
('David Smith','14745 Wabash Ave','Dolton','sam','2020-07-25'::date,41.6264335,-87.6204783,'14745 Wabash Ave, Dolton, IL  60419, United States
Rep:Sam
ZIP 60419 | My Maps folder: 2020 Sales | My Maps title: David Smith
[AGB-IMPORT:mymaps-2026-10-15]'),
('Deena Hibbett','15565 Rose Dr','South Holland','sam','2020-09-12'::date,41.6122932,-87.6006586,'15565 Rose Dr, South Holland, IL  60473, United States
Rep:Sam
ZIP 60473 | My Maps folder: 2020 Sales | My Maps title: Deena Hibbett
[AGB-IMPORT:mymaps-2026-10-15]'),
('Denesha Ballard','7536 S Langley Ave','Chicago','luis','2020-06-16'::date,41.7574082,-87.6080716,'7536 S Langley Ave, Chicago, IL  60619, United States
Rep:Luis
ZIP 60619 | My Maps folder: 2020 Sales | My Maps title: Denesha Ballard
[AGB-IMPORT:mymaps-2026-10-15]'),
('Dengel Deleon','3840 Lombard Ave','Berwyn','luis','2020-08-04'::date,41.8219887,-87.7780699,'3840 Lombard Ave, Berwyn, IL  60402, United States
Rep:luis
ZIP 60402 | My Maps folder: 2020 Sales | My Maps title: Dengel Deleon
[AGB-IMPORT:mymaps-2026-10-15]'),
('Diana Vargas','4925 S Maplewood Ave','Chicago','luis','2020-07-25'::date,41.803929,-87.6876942,'4925 S Maplewood Ave, Chicago, IL  60632, United States
Rep:Luis
ZIP 60632 | My Maps folder: 2020 Sales | My Maps title: Diana Vargas
[AGB-IMPORT:mymaps-2026-10-15]'),
('Dick Fawkes','13526 S Leclaire Ave','Crestwood','sam','2020-05-22'::date,41.6388651,-87.7442269,'13526 S Leclaire Ave, Crestwood, IL  60445, United States
Rep:Sam
ZIP 60445 | My Maps folder: 2020 Sales | My Maps title: Dick Fawkes
[AGB-IMPORT:mymaps-2026-10-15]'),
('DLC PROPERTIES','16515 Hermitage Ave','Markham','sam','2020-08-04'::date,41.589523,-87.6592088,'16515 Hermitage Ave, Markham, IL  60428, United States
Rep:Sam
ZIP 60428 | My Maps folder: 2020 Sales | My Maps title: DLC PROPERTIES
[AGB-IMPORT:mymaps-2026-10-15]'),
('Dolores D’Angelo','3825 S 60th Ct Cicero',null,'wally','2020-01-27'::date,41.8222379,-87.7738207,'3825 S 60th Ct Cicero Illinois
Rep:Wally
My Maps folder: 2020 Sales | My Maps title: Dolores D’Angelo
[AGB-IMPORT:mymaps-2026-10-15]'),
('Donna Greer','329 N Cedar Ave','Wood Dale','wally','2020-02-17'::date,41.964835,-87.9729087,'329 N Cedar Ave, Wood Dale, IL  60191, United States
Rep:Wally
ZIP 60191 | My Maps folder: 2020 Sales | My Maps title: Donna Greer
[AGB-IMPORT:mymaps-2026-10-15]'),
('Douglas Yamate','6661 N Octavia Ave','Chicago','wally','2020-07-09'::date,42.0020054,-87.8088927,'6661 N Octavia Ave, Chicago, IL  60631, United States
Rep:Wally
ZIP 60631 | My Maps folder: 2020 Sales | My Maps title: Douglas Yamate
[AGB-IMPORT:mymaps-2026-10-15]'),
('Edgar Calderon','7061 W Barry Ave','Chicago','wally','2020-02-01'::date,41.9362502,-87.8034654,'7061 W Barry Ave, Chicago, IL  60634, United States
Rep:Wally
ZIP 60634 | My Maps folder: 2020 Sales | My Maps title: Edgar Calderon
[AGB-IMPORT:mymaps-2026-10-15]'),
('Eladio Robles','1900 Joppa Ave','Zion','wally','2020-05-07'::date,42.4606611,-87.853565,'1900 Joppa Ave, Zion, IL  60099, United States
Rep:Wally
ZIP 60099 | My Maps folder: 2020 Sales | My Maps title: Eladio Robles
[AGB-IMPORT:mymaps-2026-10-15]'),
('Erik Villapando','7110 W 64th St','Chicago','aman','2020-05-01'::date,41.7757906,-87.7988751,'7110 W 64th St, Chicago, IL  60638, United States
Rep:Aman
ZIP 60638 | My Maps folder: 2020 Sales | My Maps title: Erik Villapando
[AGB-IMPORT:mymaps-2026-10-15]'),
('Erika Cardenas','13143 S Burley Ave','Chicago','tomaz','2020-08-14'::date,41.6560343,-87.5444957,'13143 S Burley Ave, Chicago, IL  60633, United States
Rep:Tomaz
ZIP 60633 | My Maps folder: 2020 Sales | My Maps title: Erika Cardenas
[AGB-IMPORT:mymaps-2026-10-15]'),
('Everardo Diaz','4925 S Kolin Ave','Chicago','luis','2020-05-22'::date,41.8033313,-87.7317746,'4925 S Kolin Ave, Chicago, IL  60632, United States
Rep:Luid
ZIP 60632 | Original rep: Luid | My Maps folder: 2020 Sales | My Maps title: Everardo Diaz
[AGB-IMPORT:mymaps-2026-10-15]'),
('Fares Marajda','4427 N La Crosse Ave','Chicago','wally','2020-09-03'::date,41.9616084,-87.7484941,'4427 N La Crosse Ave, Chicago, IL  60630, United States
Rep:Wally
ZIP 60630 | My Maps folder: 2020 Sales | My Maps title: Fares Marajda
[AGB-IMPORT:mymaps-2026-10-15]'),
('Fernando Gaston','5801 S Kilbourn Ave','Chicago','tomaz','2020-08-11'::date,41.7875048,-87.7349821,'5801 S Kilbourn Ave, Chicago, IL  60629, United States
Rep:Tomaz
ZIP 60629 | My Maps folder: 2020 Sales | My Maps title: Fernando Gaston
[AGB-IMPORT:mymaps-2026-10-15]'),
('Frank Walker','1903 Carmel Blvd','Zion','wally','2020-04-20'::date,42.4369507,-87.8379001,'1903 Carmel Blvd, Zion, IL  60099, United States
Rep: Wally
ZIP 60099 | My Maps folder: 2020 Sales | My Maps title: Frank Walker
[AGB-IMPORT:mymaps-2026-10-15]'),
('Gabriel Ruvalcaba','5810 S New England Ave','Chicago','aman','2020-06-13'::date,41.7862149,-87.7940608,'5810 S New England Ave, Chicago, IL  60638, United States
Rep:Aman
ZIP 60638 | My Maps folder: 2020 Sales | My Maps title: Gabriel Ruvalcaba
[AGB-IMPORT:mymaps-2026-10-15]'),
('Giovanno Dimarco','10904 S Lawndale Ave','Chicago','aman','2020-06-13'::date,41.6948029,-87.7134964,'10904 S Lawndale Ave, Chicago, IL  60655, United States
Rep:Aman
ZIP 60655 | My Maps folder: 2020 Sales | My Maps title: Giovanno Dimarco
[AGB-IMPORT:mymaps-2026-10-15]'),
('Gustavo Suarez','4715 N Lawndale Ave','Chicago','tomaz','2020-06-19'::date,41.966996,-87.7203648,'4715 N Lawndale Ave, Chicago, IL  60625, United States
Rep:Tomaz
ZIP 60625 | My Maps folder: 2020 Sales | My Maps title: Gustavo Suarez
[AGB-IMPORT:mymaps-2026-10-15]'),
('Harry Thomas','2235 W Superior St','Chicago','wally','2020-07-27'::date,41.8946898,-87.6833722,'2235 W Superior St, Chicago, IL  60612, United States
Rep:Wally
ZIP 60612 | My Maps folder: 2020 Sales | My Maps title: Harry Thomas
[AGB-IMPORT:mymaps-2026-10-15]'),
('Hazel Derdan','8934 S Essex Ave','Chicago','luis','2020-09-10'::date,41.7325376,-87.5637273,'8934 S Essex Ave, Chicago, IL  60617, United States
Rep:Luis
ZIP 60617 | My Maps folder: 2020 Sales | My Maps title: Hazel Derdan
[AGB-IMPORT:mymaps-2026-10-15]'),
('Hector Alvarado','4331 N Paulina St','Chicago','wally','2020-09-02'::date,41.9607194,-87.6704825,'4331 N Paulina St, Chicago, IL  60613, United States
Rep:Wally
ZIP 60613 | My Maps folder: 2020 Sales | My Maps title: Hector Alvarado
[AGB-IMPORT:mymaps-2026-10-15]'),
('Helen Buchanan','341 Polk Ave','Carpentersville','luis','2020-05-21'::date,42.1128564,-88.2501879,'341 Polk Ave, Carpentersville, IL  60110, United States
Rep:Luis
ZIP 60110 | My Maps folder: 2020 Sales | My Maps title: Helen Buchanan
[AGB-IMPORT:mymaps-2026-10-15]'),
('Home Crafters Realty','5706 S Kolmar Ave','Chicago','wally','2020-09-17'::date,41.7891443,-87.7367922,'5706 S Kolmar Ave, Chicago, IL  60629, United States
Rep:Wally
ZIP 60629 | My Maps folder: 2020 Sales | My Maps title: Home Crafters Realty
[AGB-IMPORT:mymaps-2026-10-15]'),
('Horacio Zuniga','1803 S 57th Ct','Cicero','luis','2020-08-01'::date,41.8562176,-87.7673769,'1803 S 57th Ct, Cicero, IL  60804, United States
Rep:Luis
ZIP 60804 | My Maps folder: 2020 Sales | My Maps title: Horacio Zuniga
[AGB-IMPORT:mymaps-2026-10-15]'),
('Igbal Bachcha','4824 N Keeler Ave','Chicago','wally','2020-06-24'::date,41.9689517,-87.733299,'4824 N Keeler Ave, Chicago, IL  60630, United States
Rep:Wally
ZIP 60630 | My Maps folder: 2020 Sales | My Maps title: Igbal Bachcha
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jacquelin Maldonado','3006 Martin Ln','Rolling Meadows','wally','2020-03-27'::date,42.0759655,-88.0188624,'3006 Martin Ln, Rolling Meadows, IL  60008, United States
Rep: Wally
ZIP 60008 | My Maps folder: 2020 Sales | My Maps title: Jacquelin Maldonado
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jane Neifield','2547 W Jarvis Ave','Chicago','wally','2020-05-04'::date,42.0156183,-87.6944141,'2547 W Jarvis Ave, Chicago, IL  60645, United States
Rep: Wally
ZIP 60645 | My Maps folder: 2020 Sales | My Maps title: Jane Neifield
[AGB-IMPORT:mymaps-2026-10-15]'),
('Janette Carbajol','4633 Riverside Ave','Lyons','sam','2020-10-21'::date,41.8064188,-87.8299409,'4633 Riverside Ave, Lyons, IL  60534, United States
Rep:Sam
ZIP 60534 | My Maps folder: 2020 Sales | My Maps title: Janette Carbajol
[AGB-IMPORT:mymaps-2026-10-15]'),
('Janis McCoy','536 S Ridgeland Ave','Oak Park','wally','2020-06-03'::date,41.8785231,-87.7840844,'536 S Ridgeland Ave, Oak Park, IL  60304, United States
Rep:Wally
ZIP 60304 | My Maps folder: 2020 Sales | My Maps title: Janis McCoy
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jay Whitehouse','4109 N Monticello Ave','Chicago','luis','2020-12-02'::date,41.9559765,-87.718714,'4109 N Monticello Ave, Chicago, IL  60618, United States
Rep:Luis
ZIP 60618 | My Maps folder: 2020 Sales | My Maps title: Jay Whitehouse
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jeffrey James','8224 44th Pl','Lyons','sam','2020-06-23'::date,41.810602,-87.8268416,'8224 44th Pl, Lyons, IL  60534, United States
Rep:Sam
ZIP 60534 | My Maps folder: 2020 Sales | My Maps title: Jeffrey James
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jenna Goebig','1910 W Eddy St','Chicago','wally','2020-10-08'::date,41.9461907,-87.6766563,'1910 W Eddy St, Chicago, IL  60657, United States
Rep:Wally
ZIP 60657 | My Maps folder: 2020 Sales | My Maps title: Jenna Goebig
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jennifer Malone','2424 S Tenth Ave','Broadview','sam','2020-07-07'::date,41.8596273,-87.8445764,'2424 S Tenth Ave, Broadview, IL  60155, United States
Rep:Sam
ZIP 60155 | My Maps folder: 2020 Sales | My Maps title: Jennifer Malone
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jennifer Ricks','809 N Marion St','Oak Park','wally','2020-05-30'::date,41.9001325,-87.8041655,'809 N Marion St, Oak Park, IL  60302, United States
Rep:Wally
ZIP 60302 | My Maps folder: 2020 Sales | My Maps title: Jennifer Ricks
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jeremy Carter','3841 N Pioneer Ave','Chicago','wally','2020-05-16'::date,41.9497367,-87.8314363,'3841 N Pioneer Ave, Chicago, IL  60634, United States
Rep:Wally
ZIP 60634 | My Maps folder: 2020 Sales | My Maps title: Jeremy Carter
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jeremy Doeken','2125 Sherman Ave','Evanston','tom','2020-07-10'::date,42.056521,-87.6813137,'2125 Sherman Ave, Evanston, IL  60201, United States
Rep:Tom
ZIP 60201 | My Maps folder: 2020 Sales | My Maps title: Jeremy Doeken
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jessica Guha','2049 W Churchill St','Chicago','wally','2020-08-03'::date,41.9145182,-87.678807,'2049 W Churchill St, Chicago, IL  60647, United States
Rep:Wally
ZIP 60647 | My Maps folder: 2020 Sales | My Maps title: Jessica Guha
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jesus Montemayor','4113 N McVicker Ave','Chicago','wally','2020-05-13'::date,41.9553367,-87.7778228,'4113 N McVicker Ave, Chicago, IL  60634, United States
Rep:Wally
ZIP 60634 | My Maps folder: 2020 Sales | My Maps title: Jesus Montemayor
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jevon Hill','2552 W 81st Pl','Chicago','luis','2020-06-22'::date,41.7457309,-87.6873329,'2552 W 81st Pl, Chicago, IL  60652, United States
Rep:Luis
ZIP 60652 | My Maps folder: 2020 Sales | My Maps title: Jevon Hill
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jim Nathan','3939 N Seeley Ave','Chicago','tom','2020-10-13'::date,41.9534916,-87.6796544,'3939 N Seeley Ave, Chicago, IL  60618, United States
Rep:Tom
ZIP 60618 | My Maps folder: 2020 Sales | My Maps title: Jim Nathan
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jim Segredo','5708 S Nashville Ave','Chicago','wally','2020-09-03'::date,41.7882246,-87.7868399,'5708 S Nashville Ave, Chicago, IL  60638, United States
Rep:Wally
ZIP 60638 | My Maps folder: 2020 Sales | My Maps title: Jim Segredo
[AGB-IMPORT:mymaps-2026-10-15]'),
('John Chen','3433 S Bell Ave','Chicago','wally','2020-06-16'::date,41.831164,-87.6811425,'3433 S Bell Ave, Chicago, IL  60608, United States
Rep:Wally
ZIP 60608 | My Maps folder: 2020 Sales | My Maps title: John Chen
[AGB-IMPORT:mymaps-2026-10-15]'),
('John Cherry','5401 N Melvina Ave','Chicago','wally','2020-09-29'::date,41.9794193,-87.7832888,'5401 N Melvina Ave, Chicago, IL  60630, United States
Rep:Wally
ZIP 60630 | My Maps folder: 2020 Sales | My Maps title: John Cherry
[AGB-IMPORT:mymaps-2026-10-15]'),
('John Klebba','547 William St','River Forest','wally','2020-08-11'::date,41.890128,-87.8095354,'547 William St, River Forest, IL  60305, United States
Rep:Wally
ZIP 60305 | My Maps folder: 2020 Sales | My Maps title: John Klebba
[AGB-IMPORT:mymaps-2026-10-15]'),
('John Lutz','548 W 43rd Pl','Chicago','sam','2020-04-25'::date,41.8155771,-87.6403183,'548 W 43rd Pl, Chicago, IL  60609, United States
Rep:Sam
ZIP 60609 | My Maps folder: 2020 Sales | My Maps title: John Lutz
[AGB-IMPORT:mymaps-2026-10-15]'),
('John Wilcoxon','4N241 N Seventh Ave','Addison','sam','2020-06-16'::date,41.9385136,-88.0127865,'4N241 N Seventh Ave, Addison, IL  60101, United States
Rep:Sam
ZIP 60101 | My Maps folder: 2020 Sales | My Maps title: John Wilcoxon
[AGB-IMPORT:mymaps-2026-10-15]'),
('Johnnie Wade','624 E 101st Pl','Chicago','tomaz','2020-09-25'::date,41.7103266,-87.607954,'624 E 101st Pl, Chicago, IL  60628, United States
Rep:Tomaz
ZIP 60628 | My Maps folder: 2020 Sales | My Maps title: Johnnie Wade
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jonathon Fine','3444 W Drummond Pl','Chicago','wally','2020-08-03'::date,41.9294212,-87.7140124,'3444 W Drummond Pl, Chicago, IL  60647, United States
Rep:Wally
ZIP 60647 | My Maps folder: 2020 Sales | My Maps title: Jonathon Fine
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jose Cobos','2938 N Fairfield Ave','Chicago','tomaz','2020-06-16'::date,41.9350895,-87.6967415,'2938 N Fairfield Ave, Chicago, IL  60618, United States
Rep:Tomaz
ZIP 60618 | My Maps folder: 2020 Sales | My Maps title: Jose Cobos
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jose Garcia','3922 W 69th Pl','Chicago','luis','2020-05-27'::date,41.7670605,-87.7210036,'3922 W 69th Pl, Chicago, IL  60629, United States
Rep: Luis
ZIP 60629 | My Maps folder: 2020 Sales | My Maps title: Jose Garcia
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jose Lopez','5552 S Kostner Ave','Chicago','luis','2020-07-20'::date,41.791532,-87.7331871,'5552 S Kostner Ave, Chicago, IL  60629, United States
Rep:Luis
ZIP 60629 | My Maps folder: 2020 Sales | My Maps title: Jose Lopez
[AGB-IMPORT:mymaps-2026-10-15]'),
('Jose Tanon','1818 N Tripp Ave','Chicago','luis','2020-10-02'::date,41.9141491,-87.7328479,'1818 N Tripp Ave, Chicago, IL  60639, United States
Rep:Luis
ZIP 60639 | My Maps folder: 2020 Sales | My Maps title: Jose Tanon
[AGB-IMPORT:mymaps-2026-10-15]'),
('Julie Mayne','650 Florence Ave','Evanston','tom','2020-02-21'::date,42.0302754,-87.6950286,'650 Florence Ave, Evanston, IL  60202, United States
Rep:Tom
ZIP 60202 | My Maps folder: 2020 Sales | My Maps title: Julie Mayne
[AGB-IMPORT:mymaps-2026-10-15]'),
('Julie Parisi','5525 N Sayre Ave','Chicago','wally','2020-09-23'::date,41.9817665,-87.8008837,'5525 N Sayre Ave, Chicago, IL  60656, United States
Rep:Wally
ZIP 60656 | My Maps folder: 2020 Sales | My Maps title: Julie Parisi
[AGB-IMPORT:mymaps-2026-10-15]'),
('Kathy Feingold','2704 Bryant Ave','Evanston','tom','2020-06-25'::date,42.0666557,-87.6883648,'2704 Bryant Ave, Evanston, IL  60201, United States
Rep:Tom
ZIP 60201 | My Maps folder: 2020 Sales | My Maps title: Kathy Feingold
[AGB-IMPORT:mymaps-2026-10-15]'),
('Katrina Mcenerney','11211 S Trumbull Ave','Chicago','sam','2020-09-01'::date,41.6892484,-87.7065416,'11211 S Trumbull Ave, Chicago, IL  60655, United States
Rep:Sam
ZIP 60655 | My Maps folder: 2020 Sales | My Maps title: Katrina Mcenerney
[AGB-IMPORT:mymaps-2026-10-15]'),
('Keith Iverson','4931 N Winchester Ave','Chicago','wally','2020-10-01'::date,41.9715487,-87.6774562,'4931 N Winchester Ave, Chicago, IL  60640, United States
Rep:Wally
ZIP 60640 | My Maps folder: 2020 Sales | My Maps title: Keith Iverson
[AGB-IMPORT:mymaps-2026-10-15]'),
('Kristine Guerrero','4036 N Kimball Ave','Chicago','luis','2020-09-10'::date,41.9550029,-87.7132222,'4036 N Kimball Ave, Chicago, IL  60618, United States
Rep:Luis
ZIP 60618 | My Maps folder: 2020 Sales | My Maps title: Kristine Guerrero
[AGB-IMPORT:mymaps-2026-10-15]'),
('Kurt Longoria','5336 W Winona St','Chicago','wally','2020-09-22'::date,41.974479,-87.7616984,'5336 W Winona St, Chicago, IL  60630, United States
Rep:Wally
ZIP 60630 | My Maps folder: 2020 Sales | My Maps title: Kurt Longoria
[AGB-IMPORT:mymaps-2026-10-15]'),
('Kyle Loy','406 W Avery St','Elmhurst','wally','2020-06-08'::date,41.8634763,-87.954802,'406 W Avery St, Elmhurst, IL  60126, United States
Rep:Wally
ZIP 60126 | My Maps folder: 2020 Sales | My Maps title: Kyle Loy
[AGB-IMPORT:mymaps-2026-10-15]'),
('Lalaine Monterrey','3616 N Francisco Ave','Chicago','tom','2020-06-24'::date,41.9472075,-87.700758,'3616 N Francisco Ave, Chicago, IL  60618, United States
Rep:Tom
ZIP 60618 | My Maps folder: 2020 Sales | My Maps title: Lalaine Monterrey
[AGB-IMPORT:mymaps-2026-10-15]'),
('Laura Gonzales','5806 N Moody Ave','Chicago','wally','2020-07-20'::date,41.9868432,-87.7811362,'5806 N Moody Ave, Chicago, IL  60646, United States
Rep:Wally
ZIP 60646 | My Maps folder: 2020 Sales | My Maps title: Laura Gonzales
[AGB-IMPORT:mymaps-2026-10-15]'),
('Laura Rodriguez','466 Fremont St','Elgin','luis','2020-06-06'::date,42.0454569,-88.2723221,'466 Fremont St, Elgin, IL  60120, United States
Rep:Luis
ZIP 60120 | My Maps folder: 2020 Sales | My Maps title: Laura Rodriguez
[AGB-IMPORT:mymaps-2026-10-15]'),
('Laura Tuttle','7340 Lake St','Morton Grove','wally','2020-06-17'::date,42.0454006,-87.810341,'7340 Lake St, Morton Grove, IL  60053, United States
Rep:Wally
ZIP 60053 | My Maps folder: 2020 Sales | My Maps title: Laura Tuttle
[AGB-IMPORT:mymaps-2026-10-15]'),
('Lawannah Hammond','10522 S Aberdeen St','Chicago','sam','2020-05-21'::date,41.7024939,-87.649764,'10522 S Aberdeen St, Chicago, IL  60643, United States
Rep:Sam
ZIP 60643 | My Maps folder: 2020 Sales | My Maps title: Lawannah Hammond
[AGB-IMPORT:mymaps-2026-10-15]'),
('Lawrence Bell','8200 S Dante Ave','Chicago','sam','2020-05-28'::date,41.7458365,-87.589594,'8200 S Dante Ave, Chicago, IL  60619, United States
Rep:Sam
ZIP 60619 | My Maps folder: 2020 Sales | My Maps title: Lawrence Bell
[AGB-IMPORT:mymaps-2026-10-15]'),
('Leland Young','10335 S Union Ave','Chicago','wally','2020-07-29'::date,41.7059258,-87.6400932,'10335 S Union Ave, Chicago, IL  60628, United States
Rep:Wally
ZIP 60628 | My Maps folder: 2020 Sales | My Maps title: Leland Young
[AGB-IMPORT:mymaps-2026-10-15]'),
('Leonard Lee','9320 S Homan Ave','Evergreen Park','sam','2020-06-14'::date,41.7235288,-87.7070717,'9320 S Homan Ave, Evergreen Park, IL  60805, United States
Rep:Sam
ZIP 60805 | My Maps folder: 2020 Sales | My Maps title: Leonard Lee
[AGB-IMPORT:mymaps-2026-10-15]'),
('Leonel Alba','4521 S Drake Ave','Chicago','wally','2021-06-14'::date,41.8110085,-87.7122173,'4521 S Drake Ave, Chicago, IL  60632, United States
Rep:Wally
ZIP 60632 | My Maps folder: 2020 Sales | My Maps title: Leonel Alba
[AGB-IMPORT:mymaps-2026-10-15]'),
('Lina Haramis','1898 S Fairview Ave','Park Ridge','wally','2020-10-08'::date,41.9872459,-87.834256,'1898 S Fairview Ave, Park Ridge, IL  60068, United States
Rep:Wally
ZIP 60068 | My Maps folder: 2020 Sales | My Maps title: Lina Haramis
[AGB-IMPORT:mymaps-2026-10-15]'),
('Lindsay Szeto','5814 W Addison St','Chicago','wally','2020-06-22'::date,41.9460195,-87.7723507,'5814 W Addison St, Chicago, IL  60634, United States
Rep:Wally
ZIP 60634 | My Maps folder: 2020 Sales | My Maps title: Lindsay Szeto
[AGB-IMPORT:mymaps-2026-10-15]'),
('Luis Pina','5232 State Rd','Burbank','wally','2020-07-04'::date,41.7522276,-87.7530664,'5232 State Rd, Burbank, IL  60459, United States
Rep:Wally
ZIP 60459 | My Maps folder: 2020 Sales | My Maps title: Luis Pina
[AGB-IMPORT:mymaps-2026-10-15]'),
('Luis Survey','1624 Hyde Park Ave','Waukegan','wally','2020-09-27'::date,42.3664813,-87.8525915,'1624 Hyde Park Ave, Waukegan, IL  60085, United States
Rep:Wally
ZIP 60085 | My Maps folder: 2020 Sales | My Maps title: Luis Survey
[AGB-IMPORT:mymaps-2026-10-15]'),
('Luz Anaguano','5308 W George St','Chicago','luis','2020-01-26'::date,41.9334162,-87.7593902,'5308 W George St, Chicago, IL  60641, United States
Rep:Luis
ZIP 60641 | My Maps folder: 2020 Sales | My Maps title: Luz Anaguano
[AGB-IMPORT:mymaps-2026-10-15]'),
('Manop Arunrung','1428 S 58th Ave','Cicero','wally','2020-06-27'::date,41.8608228,-87.7694364,'1428 S 58th Ave, Cicero, IL  60804, United States
Rep:Wally
ZIP 60804 | My Maps folder: 2020 Sales | My Maps title: Manop Arunrung
[AGB-IMPORT:mymaps-2026-10-15]'),
('Margaret Omongdale','7915 S Wabash Ave','Chicago','tomaz','2020-10-19'::date,41.7504674,-87.6226182,'7915 S Wabash Ave, Chicago, IL  60619, United States
Rep:Tomaz
ZIP 60619 | My Maps folder: 2020 Sales | My Maps title: Margaret Omongdale
[AGB-IMPORT:mymaps-2026-10-15]'),
('Maria Delgado','6055 S Komensky Ave','Chicago','luis','2020-02-07'::date,41.7824974,-87.7238042,'6055 S Komensky Ave, Chicago, IL  60629, United States
Rep:Luis
ZIP 60629 | My Maps folder: 2020 Sales | My Maps title: Maria Delgado
[AGB-IMPORT:mymaps-2026-10-15]'),
('Maria Palamar','2946 N Parkside Ave','Chicago','unassigned','2020-05-25'::date,41.9344475,-87.7678609,'2946 N Parkside Ave, Chicago, IL  60634, United States
ZIP 60634 | My Maps folder: 2020 Sales | My Maps title: Maria Palamar
[AGB-IMPORT:mymaps-2026-10-15]'),
('Marisol Barajos','3858 W Wabansia Ave','Chicago','wally','2020-07-20'::date,41.9119058,-87.7237852,'3858 W Wabansia Ave, Chicago, IL  60647, United States
Rep:Wally
ZIP 60647 | My Maps folder: 2020 Sales | My Maps title: Marisol Barajos
[AGB-IMPORT:mymaps-2026-10-15]'),
('Mark Conrad','8936 S 50th Ave','Oak Lawn','sam','2020-09-12'::date,41.7294635,-87.7462574,'8936 S 50th Ave, Oak Lawn, IL  60453, United States
Rep:Sam
ZIP 60453 | My Maps folder: 2020 Sales | My Maps title: Mark Conrad
[AGB-IMPORT:mymaps-2026-10-15]'),
('Mark Greenbaum','3343 N Troy St','Chicago','sam','2020-08-25'::date,41.9422797,-87.7062387,'3343 N Troy St, Chicago, IL  60618, United States
Rep:Sam
ZIP 60618 | My Maps folder: 2020 Sales | My Maps title: Mark Greenbaum
[AGB-IMPORT:mymaps-2026-10-15]'),
('Mark Hoendervogt','5123 W Wilson Ave','Chicago','wally','2020-06-16'::date,41.9640335,-87.7559018,'5123 W Wilson Ave, Chicago, IL  60630, United States
Rep:Wally
ZIP 60630 | My Maps folder: 2020 Sales | My Maps title: Mark Hoendervogt
[AGB-IMPORT:mymaps-2026-10-15]'),
('Mark Jones','4322 N Richmond St','Chicago','wally','2020-09-04'::date,41.9601238,-87.7023714,'4322 N Richmond St, Chicago, IL  60618, United States
Rep:Wally
ZIP 60618 | My Maps folder: 2020 Sales | My Maps title: Mark Jones
[AGB-IMPORT:mymaps-2026-10-15]'),
('Marvin Brandt','5700 W Leland Ave','Chicago','wally','2020-05-06'::date,41.9661291,-87.7700319,'5700 W Leland Ave, Chicago, IL  60630, United States
Rep:Wally
ZIP 60630 | My Maps folder: 2020 Sales | My Maps title: Marvin Brandt
[AGB-IMPORT:mymaps-2026-10-15]'),
('Mary Greer','1146 N Parkside Ave','Chicago','luis','2020-11-17'::date,41.90165,-87.7671225,'1146 N Parkside Ave, Chicago, IL  60651, United States
Rep:Luis
ZIP 60651 | My Maps folder: 2020 Sales | My Maps title: Mary Greer
[AGB-IMPORT:mymaps-2026-10-15]'),
('Mary Hughes','4511 N Meade Ave','Chicago','tomaz','2020-06-25'::date,41.9625165,-87.7792431,'4511 N Meade Ave, Chicago, IL  60630, United States
Rep:Tomaz
ZIP 60630 | My Maps folder: 2020 Sales | My Maps title: Mary Hughes
[AGB-IMPORT:mymaps-2026-10-15]'),
('Mary Neal','1535 S Lawndale Ave','Chicago','tomas','2020-06-01'::date,41.8597149,-87.7174206,'1535 S Lawndale Ave, Chicago, IL  60623, United States
Rep:Tomas
ZIP 60623 | My Maps folder: 2020 Sales | My Maps title: Mary Neal
[AGB-IMPORT:mymaps-2026-10-15]'),
('Matt Giles','1331 Dobson St','Evanston','wally','2020-08-22'::date,42.020554,-87.6917024,'1331 Dobson St, Evanston, IL  60202, United States
Rep:Wally
ZIP 60202 | My Maps folder: 2020 Sales | My Maps title: Matt Giles
[AGB-IMPORT:mymaps-2026-10-15]'),
('Matthew Carter','1124 N Perry Dr','Palatine','sam','2020-06-09'::date,42.1307654,-88.0617473,'1124 N Perry Dr, Palatine, IL  60067, United States
Rep:Sam
ZIP 60067 | My Maps folder: 2020 Sales | My Maps title: Matthew Carter
[AGB-IMPORT:mymaps-2026-10-15]'),
('Matthew Pryor','1239 W Glenlake Ave','Chicago','wally','2020-01-08'::date,41.9925128,-87.6619818,'1239 W Glenlake Ave, Chicago, IL  60660, United States
Rep:Wally
ZIP 60660 | My Maps folder: 2020 Sales | My Maps title: Matthew Pryor
[AGB-IMPORT:mymaps-2026-10-15]'),
('Melvin Wilson','14911 Lincoln Ave','Dolton','sam','2020-07-19'::date,41.6242843,-87.5843658,'14911 Lincoln Ave, Dolton, IL  60419, United States
Rep:Sam
ZIP 60419 | My Maps folder: 2020 Sales | My Maps title: Melvin Wilson
[AGB-IMPORT:mymaps-2026-10-15]'),
('Michael Frerker','4915 N Bell Ave','Chicago','wally','2020-07-07'::date,41.9710111,-87.6850383,'4915 N Bell Ave, Chicago, IL  60625, United States
Rep:Wally
ZIP 60625 | My Maps folder: 2020 Sales | My Maps title: Michael Frerker
[AGB-IMPORT:mymaps-2026-10-15]'),
('Michael Kostrzewa','3909 N Oriole Ave','Chicago','wally','2020-05-13'::date,41.9510356,-87.8167169,'3909 N Oriole Ave, Chicago, IL  60634, United States
Rep:Wally
ZIP 60634 | My Maps folder: 2020 Sales | My Maps title: Michael Kostrzewa
[AGB-IMPORT:mymaps-2026-10-15]'),
('Micheal Mercado','3554 W 59th Pl','Chicago','wally','2020-04-18'::date,41.785404,-87.7127263,'3554 W 59th Pl, Chicago, IL  60629, United States
Rep:Wally
ZIP 60629 | My Maps folder: 2020 Sales | My Maps title: Micheal Mercado
[AGB-IMPORT:mymaps-2026-10-15]'),
('Micheal Papa','5959 Canfield Rd','Chicago','sam','2020-08-29'::date,41.9886074,-87.8224793,'5959 Canfield Rd, Chicago, IL  60631, United States
Rep:Sam
ZIP 60631 | My Maps folder: 2020 Sales | My Maps title: Micheal Papa
[AGB-IMPORT:mymaps-2026-10-15]'),
('Mike Brown','4815 W Addison St','Chicago','luis','2020-03-27'::date,41.9459348,-87.7478238,'4815 W Addison St, Chicago, IL  60641, United States
Rep:Luis
ZIP 60641 | My Maps folder: 2020 Sales | My Maps title: Mike Brown
[AGB-IMPORT:mymaps-2026-10-15]'),
('Mildred Watson','11418 S Racine Ave','Chicago','luis','2020-08-26'::date,41.6861352,-87.652204,'11418 S Racine Ave, Chicago, IL  60643, United States
Rep:Luis
ZIP 60643 | My Maps folder: 2020 Sales | My Maps title: Mildred Watson
[AGB-IMPORT:mymaps-2026-10-15]'),
('Miriam Montanez','2921 N Lotus Ave','Chicago','tomaz','2020-07-10'::date,41.9338041,-87.7623491,'2921 N Lotus Ave, Chicago, IL  60641, United States
Rep:Tomaz
ZIP 60641 | My Maps folder: 2020 Sales | My Maps title: Miriam Montanez
[AGB-IMPORT:mymaps-2026-10-15]'),
('Miriam Solis','2301 Choctaw Rd','Waukegan','wally','2020-08-15'::date,42.3877153,-87.861417,'2301 Choctaw Rd, Waukegan, IL  60087, United States
Rep:Wally
ZIP 60087 | My Maps folder: 2020 Sales | My Maps title: Miriam Solis
[AGB-IMPORT:mymaps-2026-10-15]'),
('Mizener Construction','1445 W Cullom Ave','Chicago','sam','2020-04-20'::date,41.9595917,-87.6661502,'1445 W Cullom Ave, Chicago, IL  60613, United States
Rep:Sam
ZIP 60613 | My Maps folder: 2020 Sales | My Maps title: Mizener Construction
[AGB-IMPORT:mymaps-2026-10-15]'),
('Moises Hernandez','1517 Grove Ave','Berwyn','tom','2020-07-25'::date,41.8589628,-87.7945868,'1517 Grove Ave, Berwyn, IL  60402, United States
Rep:Tom
ZIP 60402 | My Maps folder: 2020 Sales | My Maps title: Moises Hernandez
[AGB-IMPORT:mymaps-2026-10-15]'),
('Morgan Barber','10216 S Sawyer Ave','Evergreen Park','sam','2020-07-27'::date,41.7072736,-87.7028639,'10216 S Sawyer Ave, Evergreen Park, IL  60805, United States
Rep:Sam
ZIP 60805 | My Maps folder: 2020 Sales | My Maps title: Morgan Barber
[AGB-IMPORT:mymaps-2026-10-15]'),
('Nancy Sugano','1528 N Leavitt St','Chicago','luis','2020-04-30'::date,41.9094898,-87.6826078,'1528 N Leavitt St, Chicago, IL  60622, United States
Rep:Luis
ZIP 60622 | My Maps folder: 2020 Sales | My Maps title: Nancy Sugano
[AGB-IMPORT:mymaps-2026-10-15]'),
('Nathan Tomlinson','3123 W Homer St','Chicago','wally','2020-09-20'::date,41.9163169,-87.7062054,'3123 W Homer St, Chicago, IL  60647, United States
Rep:Wally
ZIP 60647 | My Maps folder: 2020 Sales | My Maps title: Nathan Tomlinson
[AGB-IMPORT:mymaps-2026-10-15]'),
('Nawal Isa','1617 S 57th Ct','Cicero','wally','2020-06-14'::date,41.8574459,-87.7674076,'1617 S 57th Ct, Cicero, IL  60804, United States
Rep: Wally
ZIP 60804 | My Maps folder: 2020 Sales | My Maps title: Nawal Isa
[AGB-IMPORT:mymaps-2026-10-15]'),
('Neil J Vincent','1505 W Sherwin Ave','Chicago','wally','2020-02-15'::date,42.0147178,-87.6684176,'1505 W Sherwin Ave, Chicago, IL  60626, United States
Rep:Wally
ZIP 60626 | My Maps folder: 2020 Sales | My Maps title: Neil J Vincent
[AGB-IMPORT:mymaps-2026-10-15]'),
('Nguyen Nguyen','6548 N Spokane Ave','Chicago','wally','2020-05-05'::date,41.9997445,-87.7590537,'6548 N Spokane Ave, Chicago, IL  60646, United States
Rep:Wally
ZIP 60646 | My Maps folder: 2020 Sales | My Maps title: Nguyen Nguyen
[AGB-IMPORT:mymaps-2026-10-15]'),
('Nikit Taylor','101 Hickory Ave','Streamwood','wally','2020-07-22'::date,42.0232208,-88.1793309,'101 Hickory Ave, Streamwood, IL  60107, United States
Rep:Wally
ZIP 60107 | My Maps folder: 2020 Sales | My Maps title: Nikit Taylor
[AGB-IMPORT:mymaps-2026-10-15]'),
('OW2 Construction','6822 S Artesian Ave','Chicago','luis','2020-07-08'::date,41.769378,-87.684832,'6822 S Artesian Ave, Chicago, IL  60629, United States
Rep:Luis
ZIP 60629 | My Maps folder: 2020 Sales | My Maps title: OW2 Construction
[AGB-IMPORT:mymaps-2026-10-15]'),
('Ow2 Construction','8235 S Cornell Ave','Chicago','luis','2020-06-16'::date,41.7450084,-87.5838794,'8235 S Cornell Ave, Chicago, IL  60617, United States
Rep:Luis
ZIP 60617 | My Maps folder: 2020 Sales | My Maps title: Ow2 Construction
[AGB-IMPORT:mymaps-2026-10-15]'),
('Patricio Gutierrez','3518 N Rutherford Ave','Chicago','wally','2020-09-26'::date,41.9442105,-87.7949989,'3518 N Rutherford Ave, Chicago, IL  60634, United States
Rep:Wally
ZIP 60634 | My Maps folder: 2020 Sales | My Maps title: Patricio Gutierrez
[AGB-IMPORT:mymaps-2026-10-15]'),
('Paul Adams','1821 N Keeler Ave','Chicago','luis','2020-09-13'::date,41.9142398,-87.7310883,'1821 N Keeler Ave, Chicago, IL  60639, United States
Rep:Luis
ZIP 60639 | My Maps folder: 2020 Sales | My Maps title: Paul Adams
[AGB-IMPORT:mymaps-2026-10-15]'),
('Paul Smyles','7701 S Peoria St','Chicago','wally','2020-04-30'::date,41.7541197,-87.64621,'7701 S Peoria St, Chicago, IL  60620, United States
Rep:Wally
ZIP 60620 | My Maps folder: 2020 Sales | My Maps title: Paul Smyles
[AGB-IMPORT:mymaps-2026-10-15]'),
('Peter Kitowsi','6036 W Sherwin Ave','Chicago','wally','2020-06-04'::date,42.0152089,-87.7786461,'6036 W Sherwin Ave, Chicago, IL  60646, United States
Rep:Wally
ZIP 60646 | My Maps folder: 2020 Sales | My Maps title: Peter Kitowsi
[AGB-IMPORT:mymaps-2026-10-15]'),
('Peter Mixan','10129 S Trumbull Ave','Evergreen Park','sam','2020-07-07'::date,41.7088592,-87.7072342,'10129 S Trumbull Ave, Evergreen Park, IL  60805, United States
Rep:Sam
ZIP 60805 | My Maps folder: 2020 Sales | My Maps title: Peter Mixan
[AGB-IMPORT:mymaps-2026-10-15]'),
('Phil Carlson','4537 N Troy St','Chicago','tom','2020-07-03'::date,41.9641307,-87.706827,'4537 N Troy St, Chicago, IL  60625, United States
Rep:Tom
ZIP 60625 | My Maps folder: 2020 Sales | My Maps title: Phil Carlson
[AGB-IMPORT:mymaps-2026-10-15]'),
('Phylliss Biakatas','2751 W Carmen Ave','Chicago','tom','2020-07-11'::date,41.9737869,-87.6983503,'2751 W Carmen Ave, Chicago, IL  60625, United States
Rep:Tom
ZIP 60625 | My Maps folder: 2020 Sales | My Maps title: Phylliss Biakatas
[AGB-IMPORT:mymaps-2026-10-15]'),
('Princella Jeffries','5941 W Erie St','Chicago','tomaz','2020-11-30'::date,41.8916477,-87.7737903,'5941 W Erie St, Chicago, IL  60644, United States
Rep:Tomaz
ZIP 60644 | My Maps folder: 2020 Sales | My Maps title: Princella Jeffries
[AGB-IMPORT:mymaps-2026-10-15]'),
('Rick Franklin','2705 Lancaster Dr','Joliet','sam','2020-08-30'::date,41.5233277,-88.011251,'2705 Lancaster Dr, Joliet, IL  60433, United States
Rep:Sam
ZIP 60433 | My Maps folder: 2020 Sales | My Maps title: Rick Franklin
[AGB-IMPORT:mymaps-2026-10-15]'),
('Rick Santana','3722 W Sunnyside Ave','Chicago','sam','2020-06-06'::date,41.963032,-87.7215157,'3722 W Sunnyside Ave, Chicago, IL  60625, United States
Rep: Sam
ZIP 60625 | My Maps folder: 2020 Sales | My Maps title: Rick Santana
[AGB-IMPORT:mymaps-2026-10-15]'),
('Rick Santora','3722 W Sunnyside Ave','Chicago','sam','2020-06-08'::date,41.963032,-87.7215157,'3722 W Sunnyside Ave, Chicago, IL  60625, United States
Rep:Sam
ZIP 60625 | My Maps folder: 2020 Sales | My Maps title: Rick Santora
[AGB-IMPORT:mymaps-2026-10-15]'),
('Robert Jenkins','3143 W Lexington St','Chicago','luis','2020-06-01'::date,41.8716747,-87.7051293,'3143 W Lexington St, Chicago, IL  60612, United States
Rep:Luis
ZIP 60612 | My Maps folder: 2020 Sales | My Maps title: Robert Jenkins
[AGB-IMPORT:mymaps-2026-10-15]'),
('Robert Mable','6843 S Evans Ave','Chicago','aman','2020-05-01'::date,41.7700277,-87.6067113,'6843 S Evans Ave, Chicago, IL  60637, United States
Rep:Aman
ZIP 60637 | My Maps folder: 2020 Sales | My Maps title: Robert Mable
[AGB-IMPORT:mymaps-2026-10-15]'),
('Robert Palmore','1533 N Menard Ave','Chicago','wally','2020-07-08'::date,41.908494,-87.770412,'1533 N Menard Ave, Chicago, IL  60651, United States
Rep:Wally
ZIP 60651 | My Maps folder: 2020 Sales | My Maps title: Robert Palmore
[AGB-IMPORT:mymaps-2026-10-15]'),
('Rosa Magalanes','2016 Hebron Ave','Zion','wally','2020-08-15'::date,42.4581124,-87.8466737,'2016 Hebron Ave, Zion, IL  60099, United States
Rep:Wally
ZIP 60099 | My Maps folder: 2020 Sales | My Maps title: Rosa Magalanes
[AGB-IMPORT:mymaps-2026-10-15]'),
('Rosemary Barnett','133 S Mayfield Ave','Chicago','tom','2020-10-13'::date,41.8780996,-87.771,'133 S Mayfield Ave, Chicago, IL  60644, United States
Rep:Tom
ZIP 60644 | My Maps folder: 2020 Sales | My Maps title: Rosemary Barnett
[AGB-IMPORT:mymaps-2026-10-15]'),
('Sajich Ljubica','2246 W Leland Ave','Chicago','sam','2020-10-07'::date,41.9670465,-87.6858233,'2246 W Leland Ave, Chicago, IL  60625, United States
Rep:Sam
ZIP 60625 | My Maps folder: 2020 Sales | My Maps title: Sajich Ljubica
[AGB-IMPORT:mymaps-2026-10-15]'),
('Salvador Estrada','16312 Dobson Ave','South Holland','sam','2020-07-28'::date,41.5986406,-87.5923804,'16312 Dobson Ave, South Holland, IL  60473, United States
Rep:Sam
ZIP 60473 | My Maps folder: 2020 Sales | My Maps title: Salvador Estrada
[AGB-IMPORT:mymaps-2026-10-15]'),
('Samer Customer','1643 W 33rd Pl','Chicago','sam','2020-05-17'::date,41.8329759,-87.6672109,'1643 W 33rd Pl, Chicago, IL  60608, United States
Rep: Sam
ZIP 60608 | My Maps folder: 2020 Sales | My Maps title: Samer Customer
[AGB-IMPORT:mymaps-2026-10-15]'),
('Scott Bowers','4445 N Albany Ave','Chicago','wally','2020-10-14'::date,41.9625485,-87.7055653,'4445 N Albany Ave, Chicago, IL  60625, United States
Rep:Wally
ZIP 60625 | My Maps folder: 2020 Sales | My Maps title: Scott Bowers
[AGB-IMPORT:mymaps-2026-10-15]'),
('Seab Sterling','12545 S Racine Ave','Calumet Park','sam','2020-04-14'::date,41.665923,-87.6511009,'12545 S Racine Ave, Calumet Park, IL  60827, United States
Rep:Sam
ZIP 60827 | My Maps folder: 2020 Sales | My Maps title: Seab Sterling
[AGB-IMPORT:mymaps-2026-10-15]'),
('Sean Robinson','407 Yates Ave','Calumet City','sam','2020-08-11'::date,41.6250417,-87.563669,'407 Yates Ave, Calumet City, IL  60409, United States
Rep:Sam
ZIP 60409 | My Maps folder: 2020 Sales | My Maps title: Sean Robinson
[AGB-IMPORT:mymaps-2026-10-15]'),
('Sharif Awad','6130 W Cornelia Ave','Chicago','wally','2020-07-13'::date,41.9441096,-87.7801544,'6130 W Cornelia Ave, Chicago, IL  60634, United States
Rep:Wally
ZIP 60634 | My Maps folder: 2020 Sales | My Maps title: Sharif Awad
[AGB-IMPORT:mymaps-2026-10-15]'),
('Shimming Mei','4513 S Talman Ave','Chicago','sam','2020-10-10'::date,41.8115381,-87.6903806,'4513 S Talman Ave, Chicago, IL  60632, United States
Rep:Sam
ZIP 60632 | My Maps folder: 2020 Sales | My Maps title: Shimming Mei
[AGB-IMPORT:mymaps-2026-10-15]'),
('Suad Tanovic','5642 N Francisco Ave','Chicago','luis','2020-05-22'::date,41.9843697,-87.7019144,'5642 N Francisco Ave, Chicago, IL  60659, United States
Rep:Luis
ZIP 60659 | My Maps folder: 2020 Sales | My Maps title: Suad Tanovic
[AGB-IMPORT:mymaps-2026-10-15]'),
('Susan Frcka','5843 N Talman Ave','Chicago','unassigned','2020-04-29'::date,41.9880588,-87.6953786,'5843 N Talman Ave, Chicago, IL  60659, United States
ZIP 60659 | My Maps folder: 2020 Sales | My Maps title: Susan Frcka
[AGB-IMPORT:mymaps-2026-10-15]'),
('Susan Lessi','5044 N Major Ave','Chicago','tom','2020-06-24'::date,41.9735749,-87.7712102,'5044 N Major Ave, Chicago, IL  60630, United States
Rep:Tom
ZIP 60630 | My Maps folder: 2020 Sales | My Maps title: Susan Lessi
[AGB-IMPORT:mymaps-2026-10-15]'),
('Szabo','15000 Keeler Ave','Midlothian','sam','2020-10-13'::date,41.6197667,-87.722992,'15000 Keeler Ave, Midlothian, IL  60445, United States
Rep:Sam
ZIP 60445 | My Maps folder: 2020 Sales | My Maps title: Szabo
[AGB-IMPORT:mymaps-2026-10-15]'),
('Tenisha Simmons','1938 N Nashville Ave','Chicago','luis','2020-06-08'::date,41.9156834,-87.7903978,'1938 N Nashville Ave, Chicago, IL  60707, United States
Rep:Luis
ZIP 60707 | My Maps folder: 2020 Sales | My Maps title: Tenisha Simmons
[AGB-IMPORT:mymaps-2026-10-15]'),
('Terry Dwyer','6723 N Greenview Ave','Chicago','tomaz','2020-09-14'::date,42.0043237,-87.6678473,'6723 N Greenview Ave, Chicago, IL  60626, United States
Rep:Tomaz
ZIP 60626 | My Maps folder: 2020 Sales | My Maps title: Terry Dwyer
[AGB-IMPORT:mymaps-2026-10-15]'),
('Thadius Young','2345 S 12th Ave','Broadview','aman','2020-05-04'::date,41.8607233,-87.8464352,'2345 S 12th Ave, Broadview, IL  60155, United States
Rep:Aman
ZIP 60155 | My Maps folder: 2020 Sales | My Maps title: Thadius Young
[AGB-IMPORT:mymaps-2026-10-15]'),
('Thomas Miller','3103 N 77th Ave','Elmwood Park','wally','2020-08-12'::date,41.9363239,-87.8185593,'3103 N 77th Ave, Elmwood Park, IL  60707, United States
Rep:Wally
ZIP 60707 | My Maps folder: 2020 Sales | My Maps title: Thomas Miller
[AGB-IMPORT:mymaps-2026-10-15]'),
('Tony Rizzo','525 S Park Rd','La Grange','wally','2020-07-21'::date,41.8038592,-87.8801152,'525 S Park Rd, La Grange, IL  60525, United States
Rep:Wally
ZIP 60525 | My Maps folder: 2020 Sales | My Maps title: Tony Rizzo
[AGB-IMPORT:mymaps-2026-10-15]'),
('Troy Beebe','5526 N Artesian Ave','Chicago','wally','2020-02-22'::date,41.9821866,-87.6909009,'5526 N Artesian Ave, Chicago, IL  60625, United States
Rep:Wally
ZIP 60625 | My Maps folder: 2020 Sales | My Maps title: Troy Beebe
[AGB-IMPORT:mymaps-2026-10-15]'),
('Valerie Khan','1031 Mapleton Ave','Oak Park','wally','2020-05-30'::date,41.9049366,-87.7818509,'1031 Mapleton Ave, Oak Park, IL  60302, United States
Rep:Wally
ZIP 60302 | My Maps folder: 2020 Sales | My Maps title: Valerie Khan
[AGB-IMPORT:mymaps-2026-10-15]'),
('Victor Martinez','2043 Maple St','Des Plaines','sam','2020-06-03'::date,42.0162512,-87.8792869,'2043 Maple St, Des Plaines, IL  60018, United States
Rep:Sam
ZIP 60018 | My Maps folder: 2020 Sales | My Maps title: Victor Martinez
[AGB-IMPORT:mymaps-2026-10-15]'),
('Violet Clark','5139 S University Ave','Chicago','tomaz','2020-08-20'::date,41.8011937,-87.5978689,'5139 S University Ave, Chicago, IL  60615, United States
Rep:Tomaz
ZIP 60615 | My Maps folder: 2020 Sales | My Maps title: Violet Clark
[AGB-IMPORT:mymaps-2026-10-15]'),
('Walter Harris','20061 Terrace Ave','Lynwood','sam','2020-08-18'::date,41.5313241,-87.556095,'20061 Terrace Ave, Lynwood, IL  60411, United States
Rep:Sam
ZIP 60411 | My Maps folder: 2020 Sales | My Maps title: Walter Harris
[AGB-IMPORT:mymaps-2026-10-15]'),
('William Cuardrado','13045 S Escanaba Ave','Chicago','luis','2020-01-30'::date,41.6578343,-87.5529618,'13045 S Escanaba Ave, Chicago, IL  60633, United States
Rep:Luis
ZIP 60633 | My Maps folder: 2020 Sales | My Maps title: William Cuardrado
[AGB-IMPORT:mymaps-2026-10-15]'),
('William Figueroa','2249 N Monitor Ave','Chicago','tomaz','2020-07-06'::date,41.9213297,-87.771707,'2249 N Monitor Ave, Chicago, IL  60639, United States
Rep:Tomaz
ZIP 60639 | My Maps folder: 2020 Sales | My Maps title: William Figueroa
[AGB-IMPORT:mymaps-2026-10-15]'),
('Yaslian Li','1853 W 35th St','Chicago','tomaz','2020-08-13'::date,41.8302323,-87.6724987,'1853 W 35th St, Chicago, IL  60609, United State
Rep:Tomaz
ZIP 60609 | My Maps folder: 2020 Sales | My Maps title: Yaslian Li
[AGB-IMPORT:mymaps-2026-10-15]'),
('Zachery Pietz','5313 N Mobile Ave','Chicago','sam','2020-05-18'::date,41.9779266,-87.7847997,'5313 N Mobile Ave, Chicago, IL  60630, United States
Rep:Sam
ZIP 60630 | My Maps folder: 2020 Sales | My Maps title: Zachery Pietz
[AGB-IMPORT:mymaps-2026-10-15]')
) as v(customer,address,city,salesman,d,lat,lng,notes)
where not exists (select 1 from public.jobs j where j.notes like '%AGB-IMPORT:mymaps-2026-10-15%'
  and j.customer=v.customer and j.latitude=v.lat and j.longitude=v.lng);
commit;
-- Check: select count(*) from public.jobs where notes like '%AGB-IMPORT:mymaps-2026-10-15%';  -- expect 585 after all parts
