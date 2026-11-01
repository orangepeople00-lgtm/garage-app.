/* voice-jobsearch.js — shared job lookup + readable job record for every voice helper
   (dashboard-voice.js, voice-core.js used by estimator.html and repair.html).
   - Names: accent-insensitive, sound-alike key (J/G/H, V/B, Z/S, C/K, X->H at start, Gui/Hu->W), Spanish<->English aliases,
     small typo tolerance; "Did you mean …?" close matches instead of "not found".
   - Fields: customer first/last name, house number, street (Ave/Avenue/St/Street… + fuzzy), city, and status filters.
   - Scope: OPEN jobs by default (dashboard rule: status(j)!=='Completed'); closed/all only when asked.
   - Job scope (salesman = own jobs) is applied by the CALLER before search (query filter + RLS). */
(function(){
if(window.AGBJobSearch) return;
const norm=s=>String(s==null?'':s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
const ALIAS={george:'jorge',hose:'jose',joseph:'jose',wan:'juan',john:'juan',jesse:'jesus',hesus:'jesus',xavier:'javier',havier:'javier',william:'guillermo',bill:'guillermo',willy:'guillermo',michael:'miguel',mike:'miguel',peter:'pedro',james:'jaime',hymie:'jaime',joaquin:'joaquin',walkeen:'joaquin',henry:'enrique',anthony:'antonio',tony:'antonio',francis:'francisco',frank:'francisco',paco:'francisco',pancho:'francisco',charles:'carlos',richard:'ricardo',robert:'roberto',albert:'alberto',edward:'eduardo',louis:'luis',lewis:'luis',joe:'jose',pepe:'jose',andrew:'andres',steven:'esteban',stephen:'esteban',gerald:'gerardo',jerry:'gerardo',horhay:'jorge',horhe:'jorge',hulio:'julio',julius:'julio',hector:'hector',ignacio:'ignacio',nacho:'ignacio',yolanda:'yolanda',maria:'maria',mary:'maria'};
function key(w){ w=norm(w).replace(/\s/g,''); if(!w) return ''; if(ALIAS[w]) w=ALIAS[w];
  w=w.replace(/^x/,'h').replace(/^gu(?=[ie])/,'w').replace(/^hu(?=[aeio])/,'w').replace(/^wh/,'w').replace(/ph/g,'f').replace(/ck/g,'k').replace(/qu/g,'k')
     .replace(/g(?=[eiy])/g,'h').replace(/j/g,'h').replace(/c(?=[eiy])/g,'s').replace(/[cq]/g,'k').replace(/z/g,'s').replace(/v/g,'b').replace(/x/g,'ks').replace(/ll/g,'y').replace(/ñ/g,'n');
  const f=w[0]; let r=f+w.slice(1).replace(/[aeiouyhw]/g,''); return r.replace(/(.)\1+/g,'$1'); }
function lev(a,b){ if(a===b) return 0; const m=a.length,n=b.length; if(!m||!n) return m||n; let p=Array.from({length:n+1},(_,i)=>i);
  for(let i=1;i<=m;i++){ const c=[i]; for(let j=1;j<=n;j++) c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1)); p=c; } return p[n]; }
/* how well a spoken word matches a stored word: 3 exact, 2 alias/sound-alike, 1 small typo, 0.5 close (for "did you mean") */
function wscore(q,w){ q=norm(q); w=norm(w); if(!q||!w) return 0; if(q===w) return 3; if(ALIAS[q]===w||ALIAS[w]===q||(ALIAS[q]&&ALIAS[q]===ALIAS[w])) return 2;
  if(/^\d+$/.test(q)||/^\d+$/.test(w)) return 0; const kq=key(q),kw=key(w); if(kq.length>1&&kq===kw) return 2;
  const d=lev(q,w), L=Math.max(q.length,w.length); if(L>=4&&d<=1||L>=8&&d<=2) return 1; if(w.startsWith(q)&&q.length>=4) return 1;
  if(L>=4&&(d<=2||kq.length>=3&&kw.length>=3&&lev(kq,kw)<=1)) return 0.5; return 0; }
const SUFFIX={avenue:'ave',av:'ave',ave:'ave',street:'st',str:'st',st:'st',road:'rd',rd:'rd',drive:'dr',dr:'dr',boulevard:'blvd',blvd:'blvd',lane:'ln',ln:'ln',court:'ct',ct:'ct',place:'pl',pl:'pl',parkway:'pkwy',pkwy:'pkwy',terrace:'ter',ter:'ter',highway:'hwy',hwy:'hwy',circle:'cir',cir:'cir',way:'way',trail:'trl',trl:'trl'};
const DIRS={west:'w',w:'w',east:'e',e:'e',north:'n',n:'n',south:'s',s:'s'};
function addrParts(a){ const t=norm(a).split(' ').filter(Boolean); const num=t.find(x=>/^\d+[a-z]?$/.test(x))||''; const names=t.filter(x=>x!==num&&!SUFFIX[x]&&!DIRS[x]&&!/^(apt|unit)$/.test(x)); return {num,names,suffix:t.map(x=>SUFFIX[x]).filter(Boolean)}; }
/* ---- status vocabulary (dashboard select values) ---- */
const STAGES={permit:'permit_status',demo:'demo_status',demolition:'demo_status',concrete:'concrete_status',slab:'concrete_status',pour:'concrete_status',carpentry:'carpentry_status',framing:'carpentry_status',build:'carpentry_status',electric:'electric_status',electrical:'electric_status',inspection:'inspection_status',extras:'extras_status',gutters:'extras_status'};
const WANT=[ /* loose spoken status -> canonical */
  [/(submit|went in|applied|filed|turned in|sent in|in review|under review)/,'submitted'],[/(waiting|not (yet )?(submitted|in|started|done)|pending|need(s)? to|hasnt|haven t|not filed)/,'pending'],
  [/(approv|issued|got (the )?permit|permit (is )?back|came back)/,'approved'],[/correction|revis|kicked back|reject/,'corrections'],
  [/(schedul|booked|set for|on the calendar|coming up)/,'scheduled'],[/(in progress|started|working|under way|underway|framing now)/,'in progress'],
  [/(poured|done|complete|finished|built|passed|wrapped)/,'complete'],[/fail/,'failed'],[/request/,'requested']];
const VAL={submitted:['Applied/Submitted','Submitted'],pending:['Not Submitted','Pending','Not Requested'],approved:['Approved'],corrections:['Corrections Needed','Failed / Correction'],scheduled:['Scheduled'],'in progress':['In Progress'],complete:['Complete','Poured','Garage Built','Passed'],failed:['Failed / Correction'],requested:['Requested']};
function canonStatus(s){ s=norm(s); if(!s) return ''; for(const [re,c] of WANT) if(re.test(s)) return c; return s; }
function statusOk(j,field,want){ if(field==='hold') return !!j.hold_status===!!want; const c=canonStatus(want); const vals=VAL[c]; const v=String(j[field]||(field==='permit_status'?'Not Submitted':'Pending'));
  return vals?vals.includes(v):norm(v).includes(norm(want)); }
/* ---- scope words (typed-path fallback; the AI normally sends scope itself) ---- */
const CLOSED_RE=/\b(old|older|previous|past|prior|completed?|finished|closed( out)?|done ones?|already (built|done|finished)|we (already )?(built|did|finished)|last (year|month|summer|spring|fall|winter)|history|historical|archived?|from before|back in)\b/;
const ALL_RE=/\b(all|any|every|everything|both|open or closed|any status|whether|ever)\b/;
const OPEN_RE=/\b(open|current|currently|active|working on|in progress|ongoing|going on|running|this week|right now)\b/;
function scopeOf(t){ t=norm(t); return CLOSED_RE.test(t)?'closed':ALL_RE.test(t)?'all':OPEN_RE.test(t)?'open':''; }
const STOP=new Set('the a an job jobs one ones on at in for of to with and or is was were that this my our his her their mr mrs ms miss customer customers house home garage project address street called named where whats what how is it about status update find look up lookup pull show me tell open current active old previous completed closed finished done all any every everything past please hey dashboard which who did we have has had got get there here some those these near by around over we are i you they it s im was been being do does going should'.split(' '));
/* free-text -> structured params (used when the AI only sent "query", and for typed requests) */
function parse(q){ let t=norm(q); const p={scope:scopeOf(t)||'',status:{}}; t=t.replace(new RegExp(CLOSED_RE.source,'g'),' ').replace(new RegExp(ALL_RE.source,'g'),' ').replace(new RegExp(OPEN_RE.source,'g'),' ');
  if(/\bon hold\b|\bhold\b|\bpaused\b/.test(t)){ p.status.hold=true; t=t.replace(/\b(on hold|hold|paused)\b/g,' '); }
  if(/waiting (on|for) (the )?permit/.test(t)){ p.status.permit_status='pending'; t=t.replace(/waiting (on|for) (the )?permit/,' '); }
  t=t.replace(/\b(permit|demo|demolition|concrete|slab|pour|carpentry|framing|build|electric|electrical|inspection|extras|gutters)s?( status)?( (is|was|s|has|have|got|been|went))*((?: \w+){1,3})/g,(m,st)=>{ const c=canonStatus(m.replace(/^\S+/,'')); if(VAL[c]){ p.status[STAGES[st]]=c; return ' '; } return m; });
  const toks=t.split(' ').filter(Boolean); const num=toks.find(x=>/^\d{2,6}[a-z]?$/.test(x)); if(num) p.house_number=num;
  const sfx=toks.findIndex(x=>SUFFIX[x]&&x.length>1); if(sfx>0&&!/^\d/.test(toks[sfx-1])&&!STOP.has(toks[sfx-1])) p.street=toks[sfx-1];
  p.words=toks.filter(x=>x!==num&&!STOP.has(x)&&!SUFFIX[x]&&!DIRS[x]&&!CLOSED_RE.test(x)&&!/^(year|month|ago|week|today|yesterday)$/.test(x)&&x.length>1&&x!==p.street);
  return p; }
function fieldScore(j,p){ /* returns {ok, score, near}: ok = every given field matched */
  const name=norm(j.customer).split(' ').filter(Boolean), A=addrParts(j.address), city=norm(j.city);
  let score=0, near=0, ok=true;
  const bestName=w=>Math.max(0,...name.map(n=>wscore(w,n)));
  const one=(w,arr)=>Math.max(0,...arr.map(x=>wscore(w,x)));
  if(p.name){ norm(p.name).split(' ').filter(w=>w.length>1).forEach(w=>{ const s=bestName(w); if(s>=1) score+=s; else { ok=false; near+=s; } }); }
  if(p.house_number){ if(A.num===norm(p.house_number)) score+=3; else ok=false; }
  if(p.street){ const sw=norm(p.street).split(' ').filter(w=>!SUFFIX[w]&&!DIRS[w]); sw.forEach(w=>{ const s=one(w,A.names); if(s>=1) score+=s; else { ok=false; near+=s; } }); }
  if(p.city){ const s=Math.max(wscore(norm(p.city).replace(/\s/g,''),city.replace(/\s/g,'')),norm(p.city)===city?3:0); if(s>=1) score+=s; else { ok=false; near+=s; } }
  (p.words||[]).forEach(w=>{ const s=Math.max(bestName(w),one(w,A.names),wscore(w,city),...city.split(' ').map(c=>wscore(w,c))); if(s>=1) score+=s; else { ok=false; near+=s; } });
  const st=p.status||{}; for(const [f,v] of Object.entries(st)){ if(v===''||v==null) continue; if(!statusOk(j,f,v)) ok=false; else score+=1; }
  return {ok,score,near:near+score}; }
/* list = already scope-filtered jobs (salesman: own only). params from the AI tool or parse(query). opts.isOpen(j) */
function search(list,params,opts){ opts=opts||{}; params=params||{}; const q=params.query||'';
  const fp=q?parse(q):{status:{},words:[]}; const p=Object.assign({},fp,Object.fromEntries(Object.entries(params).filter(([k,v])=>v!==''&&v!=null&&k!=='query')));
  p.status=Object.assign({},fp.status||{},params.status||{}); if(params.name||params.street||params.city||params.house_number) p.words=(fp.words||[]).filter(w=>![params.name,params.street,params.city].some(x=>x&&norm(x).split(' ').includes(w)));
  const isOpen=opts.isOpen||(j=>!(j.completed_date||(j.inspection_status==='Passed'&&j.final_payment==='Paid')));
  const scope=p.scope==='closed'||p.scope==='all'?p.scope:'open';
  const inScope=j=>scope==='all'||(scope==='open'?isOpen(j):!isOpen(j));
  const any=!!(p.name||p.street||p.city||p.house_number||(p.words||[]).length||Object.keys(p.status).length);
  if(!any) return {jobs:[],close:[],scope,params:p,say:'Tell me a name, street or city.'};
  const sc=list.filter(j=>!j.deleted_at).map(j=>[j,fieldScore(j,p)]);
  const hits=sc.filter(x=>x[1].ok&&inScope(x[0])).sort((a,b)=>b[1].score-a[1].score);
  const top=hits.length?hits[0][1].score:0; let jobs=hits.filter(x=>x[1].score>=top-1).map(x=>x[0]).slice(0,8);
  const other=scope==='open'?sc.filter(x=>x[1].ok&&!inScope(x[0])).map(x=>x[0]):[];
  const close=jobs.length?[]:sc.filter(x=>!x[1].ok&&x[1].near>=0.5&&inScope(x[0])).sort((a,b)=>b[1].near-a[1].near).slice(0,4).map(x=>x[0]);
  const kind=scope==='open'?'open':scope==='closed'?'completed':'';
  let where=p.city?' in '+p.city:p.street?' on '+p.street:'';
  if(!where&&jobs.length&&jobs.every(j=>norm(j.city)===norm(jobs[0].city))&&(p.words||[]).some(w=>wscore(w,norm(jobs[0].city).replace(/\s/g,''))>=1||norm(jobs[0].city).split(' ').some(c=>wscore(w,c)>=1))) where=' in '+jobs[0].city;
  let say; if(jobs.length===1) say='I found 1 '+(kind?kind+' ':'')+'job'+where+': '+label(jobs[0])+'.';
  else if(jobs.length>1) say='I found '+jobs.length+' '+(kind?kind+' ':'')+'jobs'+where+': '+jobs.map(label).join('; ')+'. Which one?';
  else if(close.length) say='I did not find an exact match. Did you mean '+close.map(label).join(', or ')+'?';
  else if(other.length) say='No open job matches, but there '+(other.length>1?'are '+other.length+' completed jobs':'is a completed job')+': '+other.slice(0,3).map(label).join('; ')+'. Want that one?';
  else say='No '+(kind?kind+' ':'')+'job found'+where+'.';
  return {jobs,close,closedMatches:other.slice(0,3),scope,params:p,say}; }
const label=j=>(j.customer||'Job')+' — '+(j.address||'')+(j.city?', '+j.city:'');
/* ---------- full readable job record ---------- */
const money=n=>n==null||n===''||isNaN(Number(n))?'':'$'+Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
const TAGS=/\n*\[AGB-[A-Z-]+:?[^\]]*\]/g;
function payRows(notes){ const m=String(notes||'').match(/\[AGB-PAY:([^\]\s]*)\]/); if(!m) return null; try{ const v=JSON.parse(decodeURIComponent(m[1])); return Array.isArray(v)?v:null; }catch(e){ return null; } }
const LABELS={customer:'Customer',salesman_username:'Salesman',job_number:'Job number',sold_date:'Sold date',address:'Address',city:'City',zip:'ZIP',phone:'Phone',email:'Email',garage_size:'Garage size',price:'Contract price',deposit:'Deposit amount',deposit_status:'Deposit status',deposit_date:'Deposit date',final_payment:'Final payment',
  permit_status:'Permit status',permit_date:'Permit approved date',permit_number:'Permit number',demolition_required:'Demolition required',demo_status:'Demo status',scheduled_demo:'Demo scheduled',demo_date:'Demo done date',demo_time:'Demo time',demo_crew:'Demo crew',
  concrete_status:'Concrete status',concrete_est:'Concrete estimate',concrete_scheduled:'Concrete scheduled',concrete_poured:'Concrete poured date',concrete_time:'Concrete time',concrete_crew:'Concrete crew',
  carpentry_status:'Carpentry status',carpentry_est:'Carpentry estimate',carpentry_scheduled:'Carpentry scheduled',built_date:'Garage built date',carpentry_time:'Carpentry time',carpentry_crew:'Carpentry crew',
  electric_status:'Electric status',electric_date:'Electric date',electric_time:'Electric time',electric_crew:'Electric crew',inspection_status:'Inspection status',inspection_date:'Inspection date',inspection_type:'Inspection type',
  extras_required:'Extras required',extras_status:'Extras/gutters status',extras_scheduled:'Extras scheduled',completed_date:'Completed date',hold_status:'On hold',hold_reason:'Hold reason'};
const SKIP=/^(id|created_by|updated_by|created_at|updated_at|deleted_at|deleted_by|lat|lng|latitude|longitude|geo.*|.*_id|.*token.*|.*json.*|.*snapshot.*|notes)$/;
function describe(j,x){ x=x||{}; const L=[]; const add=(k,v)=>{ if(v==null||v===''||v===false&&!/hold|required/.test(k)) return; L.push(k+': '+v); };
  if(x.overall) add('Overall stage',x.overall);
  Object.keys(LABELS).forEach(k=>{ let v=j[k]; if(v==null||v==='') return; if(k==='price'||k==='deposit'||/_est$/.test(k)) v=money(v); else if(typeof v==='boolean') v=v?'yes':'no'; else if(k==='salesman_username'&&x.display) v=x.display(v)||v; add(LABELS[k],v); });
  Object.entries(j).forEach(([k,v])=>{ if(LABELS[k]||SKIP.test(k)||k.startsWith('_')||v==null||v===''||typeof v==='object') return; add(k.replace(/_/g,' '),String(v).slice(0,120)); });
  const rows=payRows(j.notes); if(rows&&rows.length){ let paid=0,sched=0; const pr=rows.map(r=>{ const a=Number(r.amount)||0; sched+=a; if(r.paid) paid+=a; return (r.stage||'Payment')+' '+(a?money(a):(r.percent?r.percent+'%':''))+(r.paid?' PAID'+(r.paid_date?' '+r.paid_date:'')+(r.method?' by '+r.method:''):' unpaid'+(r.due?' due '+r.due:'')); });
    L.push('Payment schedule: '+pr.join('; ')); L.push('Total paid: '+money(paid)); const price=Number(j.price)||0; if(price) L.push('Balance due: '+money(Math.max(0,price-paid))); }
  else if(Number(j.price)){ const dp=/received|paid/i.test(j.deposit_status||'')?Number(j.deposit)||0:0; L.push('Balance due (contract price minus received deposit; no payment schedule entered): '+money(Math.max(0,Number(j.price)-dp))); }
  if(x.crews&&x.crews.length) L.push('Crew schedule: '+x.crews.map(c=>[c.stage,c.crew,c.sched_date||c.date,c.show_up_time||c.time].filter(Boolean).join(' ')).join('; '));
  if(x.docs&&x.docs.length) L.push('Paperwork on file: '+x.docs.slice(0,12).join('; '));
  if(x.activity&&x.activity.length) L.push('Recent updates: '+x.activity.slice(0,5).join('; '));
  const n=String(j.notes||'').replace(TAGS,'').trim(); if(n) L.push('Notes/updates: '+(n.length>900?'…'+n.slice(-900):n));
  if(x.summary) L.push('Job summary: '+String(x.summary).slice(0,600));
  if(x.estimate) L.push(x.estimate);
  return L.join('\n'); }
/* compact estimate summary (customer-facing specs + prices, never internal cost/profit) */
function estimate(e,how){ if(!e) return ''; const s=e.estimate_snapshot||{}, c=s.calculator_state||{}; const L=[];
  const top=[['Garage',e.garage_size],['Roof',e.roof_type],['Wall height',e.wall_height],['Siding',e.siding],['Estimate price',money(e.estimate_price)],['Sold price',s.sold&&money(s.sold.price)],['Final project price',money(s.final_project_price)]];
  top.forEach(([k,v])=>{ if(v) L.push(k+' '+v); });
  const bad=/cost|profit|margin|internal|commission|html|token|_id$|^id$|photo|image|sig|history|presentation|revision|updates|at$|^last_/i;
  const pick=(o,pre)=>Object.entries(o||{}).forEach(([k,v])=>{ if(bad.test(k)||v==null||v===''||v===false||v==='false'||v==='0'||v===0||v==='none'||v==='None') return; if(typeof v==='object') return; const sv=String(v); if(sv.length>80) return; L.push((pre||'')+k.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/_/g,' ')+' '+(v===true?'yes':sv)); });
  pick(c); ['extras','custom_extras','extra_rows','options','line_items','price_lines'].forEach(k=>{ const a=s[k]; if(Array.isArray(a)) a.slice(0,15).forEach(r=>{ if(r&&typeof r==='object'){ const d=r.description||r.desc||r.name||r.label; const a2=r.price||r.amount||r.customer_price; if(d) L.push('Extra: '+d+(a2?' '+money(a2):'')+(r.option||r.disp==='option'?' (option)':'')); } }); });
  if(s.notes) L.push('Estimate notes '+String(s.notes).slice(0,300));
  const out=L.join('; '); return 'Linked estimate ('+(how||'matched')+', saved '+String(e.created_at||'').slice(0,10)+'): '+(out.length>1600?out.slice(0,1600)+'…':out); }
window.AGBJobSearch={norm,key,lev,wscore,parse,search,describe,estimate,label,canonStatus,scopeOf,payRows};
})();
