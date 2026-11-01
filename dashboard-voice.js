/* dashboard-voice.js — SAMPLE live voice for the production dashboard (dashboard-voice-sample.html only).
   Patterns copied from voice-core.js (silent start, iPhone audio unlock, quiet caps 15 min / 2 min silence, local learning store).
   Edge function: dashboard-voice-session (OpenAI Realtime gpt-realtime-2.1-mini, voice marin, gpt-4o-mini-transcribe).
   The AI only PROPOSES. Every write shows a confirm card first and runs in the browser with the user's own session (RLS):
   - Salesmen: new jobs + edit requests -> pending_job_changes (status pending) for Randy/Sam to approve. Own jobs only.
   - Randy/Sam (manager()): job stage status/dates + summary note (jobs update + job_activity, same as the job form),
     payments -> the job's Payment Schedule (the [AGB-PAY] tag in jobs.notes, saved with paySaveDrawer = "Save payments"),
     "ready to close out" -> opens the job's existing Close-out box (never closes it). */
(function(){
const $=id=>document.getElementById(id);
const FN='dashboard-voice-session', MAX_TOTAL=900, MAX_IDLE=120, STILL_THERE=80;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isMgr=()=>{try{return !!manager()}catch(e){return false}};
const me=()=>{try{return profile||null}catch(e){return null}};
const uk=s=>String(s||'').trim().toLowerCase();
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
let css=`.dv{margin:0 0 12px;background:#0b1220;border:1px solid #1e3a5f;border-radius:16px;padding:12px;color:#e4e4e7;box-sizing:border-box;max-width:100%}
.dv *{box-sizing:border-box}.dv-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.dv-mic{min-height:48px;padding:0 18px;border-radius:999px;background:#2563eb;color:#fff;font-weight:800;font-size:16px;border:0;cursor:pointer}
.dv-mic.live{background:#dc2626;animation:dvp 1.4s infinite}@keyframes dvp{50%{box-shadow:0 0 0 8px rgba(220,38,38,.25)}}
.dv-timer{font-size:11px;color:#71717a;font-variant-numeric:tabular-nums}.dv-hint{font-size:12px;color:#a1a1aa;flex:1 1 200px;min-width:0}
.dv-status{font-size:12px;color:#a1a1aa;margin:8px 0 6px;line-height:1.4}
.dv-type{display:flex;gap:6px}.dv-type input{flex:1;min-width:0;min-height:44px;background:#18181b;border:1px solid #3f3f46;border-radius:12px;color:#fff;padding:0 10px;font-size:16px}
.dv-btn{min-height:44px;padding:0 14px;border-radius:12px;background:#27272a;border:1px solid #52525b;color:#f4f4f5;font-size:14px;cursor:pointer}
.dv-say{display:flex;gap:8px;font-size:14px;line-height:1.4;background:#052e16;border:1px solid #166534;border-radius:12px;padding:8px 10px;margin:6px 0;overflow-wrap:anywhere}
.dv-say.talking b{color:#86efac}.dv-heard{font-size:12px;color:#93c5fd;margin:4px 0;overflow-wrap:anywhere}
.dv-log{margin-top:8px;font-size:12px;max-height:110px;overflow:auto;background:#09090b;border-radius:10px;padding:6px 8px;line-height:1.45}.dv-log .u{color:#93c5fd}.dv-log .a{color:#86efac}
.dv-card{margin-top:10px;background:#111827;border:1px solid #334155;border-radius:14px;padding:10px;overflow-wrap:anywhere}
.dv-card h4{margin:0 0 6px;font-size:14px;color:#fff}.dv-card .k{color:#a1a1aa;font-size:12px}.dv-card ul{margin:4px 0 0 18px;padding:0;font-size:13px}
.dv-acts{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}.dv-ok{flex:1 1 140px;min-height:46px;border-radius:12px;background:#16a34a;color:#fff;font-weight:800;font-size:15px;border:0;cursor:pointer}
.dv-no{flex:0 1 120px;min-height:46px;border-radius:12px;background:#3f3f46;color:#fff;border:0;font-size:15px;cursor:pointer}
.dv-pick{display:block;width:100%;text-align:left;margin-top:6px;min-height:42px;border-radius:10px;background:#1f2937;color:#fff;border:1px solid #374151;padding:6px 10px;font-size:14px;cursor:pointer}
.dv-warn{display:block;width:100%;margin:4px 0;min-height:40px;border-radius:10px;background:#7f1d1d;color:#fff;border:0;font-size:13px;padding:6px 10px;text-align:left}
.dv-pend .rowbox{overflow-wrap:anywhere}.dv-flash{outline:3px solid #f59e0b;outline-offset:3px;border-radius:12px;transition:outline-color 2s}`;
css+='\n/* fixed-size transcript boxes (sample pages only for now: html.agbv-fixbox) — text scrolls inside, the page never moves */\n.agbv-fixbox #dvSay{height:88px;overflow-y:auto;overflow-anchor:none;align-items:flex-start}.agbv-fixbox #dvSay[hidden]{display:flex;visibility:hidden}\n.agbv-fixbox #dvHeard{height:34px;overflow-y:auto;overflow-anchor:none}.agbv-fixbox #dvHeard[hidden]{display:block;visibility:hidden}\n.agbv-fixbox #dvLog{height:120px;max-height:120px;overflow-y:auto;overflow-anchor:none}.agbv-fixbox #dvLog[hidden]{display:block;visibility:hidden}\n@media(min-width:900px){.agbv-fixbox #dvSay{height:72px}.agbv-fixbox #dvLog{height:140px;max-height:140px}}\n';
if(/sample/i.test(location.pathname)) document.documentElement.classList.add('agbv-fixbox');
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

/* ---------- UI ---------- */
function mount(){ if($('dvPanel')) return; const main=$('appMain'), stats=$('stats'); if(!main||!stats) return;
  const d=document.createElement('div'); d.id='dvPanel'; d.className='dv';
  d.innerHTML='<div class="dv-top"><button type="button" class="dv-mic" id="dvMic"><span id="dvMicTxt">🎤 Talk</span></button><span class="dv-timer" id="dvTimer" hidden>0:00</span><span class="dv-hint" id="dvHint"></span></div>'
   +'<div class="dv-status" id="dvStatus">Tap Talk and speak. Nothing is saved until you tap Confirm.</div>'
   +'<div class="dv-say" id="dvSay" hidden><b>AI:</b> <span id="dvSayTxt"></span></div><div class="dv-heard" id="dvHeard" hidden></div>'
   +'<div class="dv-type"><input id="dvText" placeholder="…or type it (e.g. how is Smith going?)" autocomplete="off"><button type="button" class="dv-btn" id="dvSend">Send</button></div>'
   +'<div id="dvCards"></div><div class="dv-log" id="dvLog" hidden></div>';
  main.insertBefore(d,stats);
  const p=document.createElement('div'); p.id='dvPending'; p.className='card hidden dv-pend'; p.style.marginBottom='12px';
  p.innerHTML='<h3 class="split"><span id="dvPendTitle">Voice requests</span><span id="dvPendCount" class="pill yellow">0</span></h3><div id="dvPendList" class="list"></div>';
  main.insertBefore(p,stats.nextSibling);
  $('dvMic').onclick=()=>live()||pc?stop('Voice stopped.'):start();
  $('dvSend').onclick=()=>sendText(); $('dvText').onkeydown=e=>{ if(e.key==='Enter') sendText(); };
  hint(); }
function hint(){ const h=$('dvHint'); if(!h) return; h.textContent=isMgr()?'Status, notes, payments, close-out — or ask how a job is going. (“Hey dashboard” optional)':'Describe a new job or a change to the basics (name, address, phone, price, deposit, size, hold), or ask how your jobs are going. Randy or Sam approve. (“Hey dashboard” optional)'; }
function stat(t){ const s=$('dvStatus'); if(s) s.textContent=t; }
function log(c,t){ const L=$('dvLog'); L.hidden=false; const d=document.createElement('div'); d.className=c; d.textContent=(c==='u'?'You: ':'Helper: ')+t; L.appendChild(d); L.scrollTop=L.scrollHeight; }
function sayLine(t){ const el=$('dvSay'); el.hidden=false; $('dvSayTxt').textContent=t; el.scrollTop=el.scrollHeight; }
function heard(t){ const h=$('dvHeard'); h.hidden=false; h.textContent='What I heard: “'+t+'”'; h.scrollTop=h.scrollHeight; }

/* ---------- jobs + scope ---------- */
// Same rule as RLS "authorized read jobs": managers see all; everyone else only salesman_username = their username.
function scoped(){ let all=[]; try{ all=(jobs||[]).filter(j=>!j.deleted_at); }catch(e){} const p=me(); if(!p) return [];
  return isMgr()?all:all.filter(j=>uk(j.salesman_username)===uk(p.username)); }
const LKEY='agbVoiceLearned:dashboard';
function learned(){ try{ return JSON.parse(localStorage.getItem(LKEY)||'[]'); }catch(e){ return []; } }
function learn(heardQ,j){ if(!heardQ||!j) return; const a=learned().filter(r=>uk(r.heard)!==uk(heardQ)); a.push({heard:String(heardQ),job_id:j.id,to_value:j.customer,user:(me()||{}).username||'',created_at:new Date().toISOString()}); try{ localStorage.setItem(LKEY,JSON.stringify(a.slice(-100))); }catch(e){} }
function learnedText(){ return learned().slice(-40).map(r=>'"'+r.heard+'" -> job '+r.to_value).join('\n'); }
/* shared fuzzy/phonetic, open-by-default search (voice-jobsearch.js); scope = scoped() (salesman: own jobs only; RLS too) */
let lastSearch=null, curSrch=null;
if(!window.AGBJobSearch&&!document.getElementById('agbJobSearchJs')){ const sc=document.createElement('script'); sc.id='agbJobSearchJs'; sc.src='voice-jobsearch.js?v=20261031b'; document.head.appendChild(sc); }
const isOpenJob=j=>{ try{ return status(j)!=='Completed'; }catch(e){ return !j.completed_date; } };
function findJobs(q,srch){ const L=scoped(); const t=uk(q||'').trim();
  const hit=t&&learned().find(r=>uk(r.heard)===t); if(hit&&!((srch||curSrch||{}).scope)){ const j=L.find(x=>x.id===hit.job_id); if(j){ lastSearch={jobs:[j],close:[],say:'Found '+jobLabel(j)+'.'}; return [j]; } }
  if(!window.AGBJobSearch){ lastSearch=null; return []; }
  lastSearch=AGBJobSearch.search(L,Object.assign({},srch||curSrch||{},{query:q||''}),{isOpen:isOpenJob}); return lastSearch.jobs; }
const jobLabel=j=>(j.customer||'Job')+' — '+(j.address||'')+(j.city?', '+j.city:'');

/* stage catalog read from the real job form controls so the AI only uses values the dashboard accepts */
const STAGE_IDS=['permit_status','permit_date','demo_status','scheduled_demo','demo_date','concrete_status','concrete_scheduled','concrete_poured','carpentry_status','carpentry_scheduled','built_date','electric_status','electric_date','inspection_status','inspection_date','extras_status','extras_scheduled','completed_date','hold_status','hold_reason'];
function stageCatalog(){ return STAGE_IDS.map(id=>{ const el=$('f_'+id); if(!el) return null;
  if(el.tagName==='SELECT') return id+' | '+Array.from(el.options).map(o=>o.value).filter(v=>v!=='').join('; ');
  return id+' | '+(el.type==='date'?'YYYY-MM-DD':el.type==='checkbox'?'true/false':'text'); }).filter(Boolean).join('\n'); }
function cleanFields(f){ const out={}, bad=[]; Object.entries(f||{}).forEach(([k,v])=>{ k=String(k).replace(/^f_/,''); const el=$('f_'+k);
  if(!STAGE_IDS.includes(k)||!el){ bad.push(k); return; } v=String(v==null?'':v).trim();
  if(el.tagName==='SELECT'){ const o=Array.from(el.options).find(o=>uk(o.value)===uk(v)||uk(o.textContent)===uk(v)); if(!o){ bad.push(k+'='+v); return; } out[k]=o.value; }
  else if(el.type==='date'){ if(!/^\d{4}-\d{2}-\d{2}$/.test(v)){ bad.push(k+'='+v); return; } out[k]=v; }
  else if(el.type==='checkbox'||k==='hold_status'){ out[k]=/^(true|yes|1|on)$/i.test(v); }
  else out[k]=v.slice(0,300); }); return {out,bad}; }
const plainKey=k=>k.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());

/* ---------- confirm cards ---------- */
let cardSeq=0;
function card(html,onOk,okTxt){ const id='dvc'+(++cardSeq); const d=document.createElement('div'); d.className='dv-card'; d.id=id;
  d.innerHTML=html+(onOk?'<div class="dv-acts"><button type="button" class="dv-ok">'+esc(okTxt||'Confirm')+'</button><button type="button" class="dv-no">Cancel</button></div>':'<div class="dv-acts"><button type="button" class="dv-no">Dismiss</button></div>');
  $('dvCards').appendChild(d);
  const ok=d.querySelector('.dv-ok'); if(ok) ok.onclick=async()=>{ ok.disabled=true; ok.textContent='Saving…'; try{ const r=await onOk(); d.innerHTML='<div class="k">✔ '+esc(r||'Done')+'</div>'; tell(r||'Done'); setTimeout(()=>d.remove(),6000); }catch(e){ ok.disabled=false; ok.textContent=okTxt||'Confirm'; stat('Not saved: '+(e.message||e)); } };
  d.querySelector('.dv-no').onclick=()=>{ d.remove(); stat('Cancelled — nothing saved.'); };
  d.scrollIntoView({block:'nearest'}); return d; }
function tell(t){ stat(t); if(live()) send({type:'conversation.item.create',item:{type:'message',role:'user',content:[{type:'input_text',text:'(App result, say it in a few words: '+t+')'}]}}),send({type:'response.create'}); }
/* resolve a spoken job reference to exactly one job: pick list when several */
function withJob(q,fn,srch){ const L=findJobs(q,srch); if(!L.length){ const C=lastSearch?[...(lastSearch.close||[]),...(lastSearch.closedMatches||[])]:[];
    if(C.length){ const d=card('<h4>Did you mean…?</h4><div class="k">No exact match for “'+esc(q||'')+'”.</div>'+C.map((j,i)=>'<button type="button" class="dv-pick" data-i="'+i+'">'+esc(jobLabel(j))+'</button>').join(''));
      d.querySelectorAll('.dv-pick').forEach(b=>b.onclick=()=>{ const j=C[+b.dataset.i]; learn(q,j); d.remove(); fn(j); }); return {found:0,did_you_mean:C.map(jobLabel),say:lastSearch.say}; }
    card('<h4>No job found for “'+esc(q||'')+'”</h4><div class="k">'+esc(lastSearch&&lastSearch.say||'')+' '+(isMgr()?'Try the customer name, street or city.':'You can only look up your own jobs.')+'</div>'); return {found:0,say:lastSearch&&lastSearch.say}; }
  if(L.length===1){ fn(L[0]); return {found:1,job:jobLabel(L[0]),say:lastSearch&&lastSearch.say}; }
  const d=card('<h4>Which job did you mean?</h4>'+L.map((j,i)=>'<button type="button" class="dv-pick" data-i="'+i+'">'+esc(jobLabel(j))+'</button>').join(''));
  d.querySelectorAll('.dv-pick').forEach(b=>b.onclick=()=>{ const j=L[+b.dataset.i]; learn(q,j); d.remove(); fn(j); });
  return {found:L.length,matches:L.map(jobLabel),say:lastSearch&&lastSearch.say}; }

async function uid(){ const {data:{user}}=await sb.auth.getUser(); if(!user) throw new Error('not signed in'); return user.id; }
async function activity(job_id,action,details){ try{ await sb.from('job_activity').insert({job_id,actor_id:await uid(),action,details}); }catch(e){} }

/* --- salesman: new job -> pending --- */
function proposeNew(a){ const p=me(); if(!p) return {error:'not signed in'};
  const pay={customer:a.customer||'',address:a.address||'',city:a.city||'',phone:a.phone||'',email:a.email||'',price:a.price!=null&&a.price!==''?Number(a.price):null,garage_size:a.garage_size||'',notes:a.notes||'',heard:a.heard||''};
  const rows=[['Customer',pay.customer],['Address',[pay.address,pay.city].filter(Boolean).join(', ')],['Phone',pay.phone],['Email',pay.email],['Price',pay.price!=null?'$'+pay.price.toLocaleString():''],['Garage',pay.garage_size],['Notes',pay.notes]].filter(r=>r[1]);
  card('<h4>New job → pending approval</h4><div class="k">Goes to Randy or Sam as PENDING. Nothing is added to the job list until they approve.</div><ul>'+rows.map(r=>'<li><b>'+esc(r[0])+':</b> '+esc(r[1])+'</li>').join('')+'</ul>',
    async()=>{ const {error}=await sb.from('pending_job_changes').insert({kind:'new_job',job_id:null,payload:pay,requested_by:await uid(),salesman_username:p.username,status:'pending'}); if(error) throw error; await loadPending(); return 'Sent to Randy and Sam for approval.'; },'Send for approval');
  return {shown:'confirm card',say:'Check the card and tap Send for approval.'}; }
/* --- salesman: edit request on OWN job -> pending --- */
function requestEdit(a){ const p=me(); return withJob(a.query,j=>{
  if(!isMgr()&&uk(j.salesman_username)!==uk(p.username)){ card('<h4>Not your job</h4>'); return; }
  let {out}=cleanFields(a.fields); let extra='', basics={}; if(!isMgr()){ /* salesmen: basics only (same list as the Add Job front page) */
    const B=['customer','address','city','zip','phone','price','deposit','hold_status','garage_size'], drop=[];
    Object.entries(a.fields||{}).forEach(([k,v])=>{ k=String(k).replace(/^f_/,''); v=String(v==null?'':v).trim().slice(0,200); if(!v) return;
      if(B.includes(k)){ if(k==='price'||k==='deposit'){ const n=Number(v.replace(/[$,\s]/g,'')); if(isFinite(n)) basics[k]=n; else drop.push(plainKey(k)+' → '+v); } else basics[k]=v; } else drop.push(plainKey(k)+' → '+v); });
    out={}; if(drop.length) extra=' (not a salesman field — Randy/Sam decide: '+drop.join('; ')+')'; Object.entries(basics).forEach(([k,v])=>out[k]=v); }
  const pay={request:(String(a.request||'')+extra).slice(0,1000),fields:out,basics,heard:a.heard||'',source:'voice'};
  card('<h4>Edit request → pending approval</h4><div class="k">'+esc(jobLabel(j))+'</div><ul><li>'+esc(pay.request)+'</li>'+Object.entries(out).map(([k,v])=>'<li>'+esc(plainKey(k))+' → '+esc(v)+'</li>').join('')+'</ul><div class="k">The job does not change until Randy or Sam approve.</div>',
    async()=>{ const {error}=await sb.from('pending_job_changes').insert({kind:'edit',job_id:j.id,payload:pay,requested_by:await uid(),salesman_username:p.username,status:'pending'}); if(error) throw error; await loadPending(); return 'Edit request sent to Randy and Sam.'; },'Send for approval'); }); }
/* --- manager: status/dates/note --- */
function updateJob(a){ if(!isMgr()) return {error:'Only Randy or Sam can change a job. Ask for an edit request instead.'};
  return withJob(a.query,j=>{ const {out,bad}=cleanFields(a.fields); const note=String(a.note||'').trim();
    if(!Object.keys(out).length&&!note){ card('<h4>Nothing to change</h4><div class="k">'+(bad.length?'Not understood: '+esc(bad.join(', ')):'')+'</div>'); return; }
    card('<h4>Update job</h4><div class="k">'+esc(jobLabel(j))+'</div><ul>'+Object.entries(out).map(([k,v])=>'<li>'+esc(plainKey(k))+': '+esc(j[k]==null||j[k]===''?'—':j[k])+' → <b>'+esc(v)+'</b></li>').join('')+(note?'<li>Note: '+esc(note)+'</li>':'')+'</ul>'+(bad.length?'<div class="k">Ignored (not a dashboard value): '+esc(bad.join(', '))+'</div>':''),
      async()=>{ const patch={...out}; if(note){ const who=(DISPLAY[uk(me().username)]||me().username); const base=String(j.notes||'').trim(); patch.notes=withProfitTag((base?base+'\n\n':'')+'['+today()+' '+who+'] '+note,j); }
        const {error}=await sb.from('jobs').update(patch).eq('id',j.id); if(error) throw error; Object.assign(j,patch.notes?parseProfitTag({...j,...patch}):patch);
        await activity(j.id,'Job updated by voice',{changes:out,note:note||undefined}); try{ await refresh(); }catch(e){} return 'Saved to '+j.customer+'.'; }); }); }
/* --- manager: payment -> the job's Payment Schedule (same save path as the drawer's "Save payments") --- */
function recordPayment(a){ if(!isMgr()) return {error:'Only Randy or Sam record payments.'};
  const amt=Number(String(a.amount==null?'':a.amount).replace(/[^0-9.]/g,'')); if(!(amt>0)) return {error:'need an amount'};
  return withJob(a.query,j=>{ const rows=(j._pay&&j._pay.length)?j._pay:[]; const stage=String(a.stage||'').trim()||'Payment';
    const r=rows.find(x=>uk(x.stage)===uk(stage)); const date=/^\d{4}-\d{2}-\d{2}$/.test(a.paid_date||'')?a.paid_date:today(); const method=String(a.method||'').slice(0,40);
    const what=r&&!r.paid?('Mark “'+r.stage+'” paid'+(r.amount!=null&&r.amount!==''&&Number(r.amount)!==amt?' (schedule said $'+Number(r.amount).toLocaleString()+')':'')):r&&r.paid?('“'+r.stage+'” is already paid — add a new paid row'):'Add a paid “'+stage+'” row';
    card('<h4>Record payment</h4><div class="k">'+esc(jobLabel(j))+'</div><ul><li><b>$'+amt.toLocaleString()+'</b> collected'+(method?' by '+esc(method):'')+' on '+esc(date)+'</li><li>'+esc(what)+'</li></ul><div class="k">Saved on the job’s Payment Schedule (same as “Save payments”).</div>',
      async()=>{ await openDrawer(j.id); await waitFor(()=>typeof PAY!=='undefined'&&PAY.payDrawerHost&&$('payDrawerHost'),4000);
        const R=PAY.payDrawerHost.rows; let row=R.find(x=>uk(x.stage)===uk(stage)&&!x.paid);
        if(!row){ row={stage:R.some(x=>uk(x.stage)===uk(stage))?stage+' (additional)':stage,amount:'',percent:'',due:'',paid:false,paid_date:'',method:''}; R.push(row); }
        Object.assign(row,{amount:amt,paid:true,paid_date:date,method:method||row.method||''}); payRender('payDrawerHost');
        window.__agbAutoPay=true; try{ await paySaveDrawer(j.id); } finally{ window.__agbAutoPay=false; }
        await activity(j.id,'Payment recorded by voice',{stage:row.stage,amount:amt,method,paid_date:date});
        flash(document.querySelector('#payDrawerHost')); return '$'+amt.toLocaleString()+' saved to '+j.customer+' payments.'; },'Save payment'); }); }
function waitFor(f,ms){ return new Promise(res=>{ const t0=Date.now(); (function k(){ let v=null; try{ v=f(); }catch(e){} if(v||Date.now()-t0>ms) return res(v); setTimeout(k,80); })(); }); }
function flash(el){ if(!el) return; el=el.closest('.card')||el; el.scrollIntoView({block:'center',behavior:'smooth'}); el.classList.add('dv-flash'); setTimeout(()=>el.classList.remove('dv-flash'),3500); }
/* --- manager: ready to close out -> show existing close-out box (never closes) --- */
function openCloseout(a){ if(!isMgr()) return {error:'Only Randy or Sam close out jobs.'};
  return withJob(a.query,async j=>{ await openDrawer(j.id); const box=await waitFor(()=>$('jcCloseBox')||$('jcCard'),4000);
    if(box){ flash(box); stat('Close-out options for '+j.customer+' are open — review costs, then tap Close Job yourself.'); }
    else stat('Opened '+j.customer+'. Close-out is in Job Costs & Commission (Randy/Sam only).'); }); }
/* --- read-only status --- */
async function jobStatus(q,srch){ const L=findJobs(q,srch); const say=lastSearch&&lastSearch.say;
  if(!L.length) return {found:0,say:say||(isMgr()?'No job found.':'No job found for this salesman.'),did_you_mean:lastSearch?[...(lastSearch.close||[]),...(lastSearch.closedMatches||[])].map(jobLabel):[]};
  if(L.length>1) return {found:L.length,matches:L.map(jobLabel),say}; const j=L[0];
  if(!isMgr()&&uk(j.salesman_username)!==uk((me()||{}).username)) return {found:0};
  return {found:1,today:today(),say,record:await fullRecord(j)}; }
/* whole job in plain labeled text: fields, payments/balance, crews, paperwork, notes, job summary, linked estimate */
async function fullRecord(j){ const x={display:u=>DISPLAY[uk(u)]};
  try{ x.overall=status(j); }catch(e){}
  try{ x.crews=(CA||[]).filter(c=>c.job_id===j.id); }catch(e){}
  try{ x.docs=(documents||[]).filter(d=>d.job_id===j.id).map(d=>[d.doc_type,d.file_name].filter(Boolean).join(': ')); }catch(e){}
  try{ x.summary=['Last complete: '+lastComplete(j)].concat(typeof nextStep==='function'?['Next: '+nextStep(j)]:[]).join('; '); }catch(e){}
  try{ if(isMgr()||uk(j.salesman_username)===uk((me()||{}).username)){ let r=typeof jcFindEstimate==='function'?await jcFindEstimate(j):null;
      if(!r&&typeof latestEstimateForJob==='function'){ const e=latestEstimateForJob(j); if(e) r={e:await fetchFullEstimateRecord(e.id)||e,how:'same customer/address'}; }
      if(r&&r.e) x.estimate=AGBJobSearch.estimate(r.e,(r.how||'matched')+(r.ask?' — not confirmed, say so':'')); } }catch(e){}
  return AGBJobSearch.describe(j,x); }


/* ---------- pending list (approve / reject) ---------- */
let pend=[];
async function loadPending(){ try{ const {data,error}=await sb.from('pending_job_changes').select('*').order('created_at',{ascending:false}).limit(100); if(!error) pend=data||[]; }catch(e){} renderPending(); }
function renderPending(){ const box=$('dvPending'); if(!box) return; const p=me(); if(!p){ box.classList.add('hidden'); return; } const mgr=isMgr();
  const L=mgr?pend.filter(r=>r.status==='pending'):pend.filter(r=>uk(r.salesman_username)===uk(p.username)).slice(0,10);
  box.classList.toggle('hidden',!L.length); $('dvPendTitle').textContent=mgr?'🕓 Waiting for approval (voice + Add Job)':'My requests to Randy / Sam'; $('dvPendCount').textContent=mgr?L.length:L.filter(r=>r.status==='pending').length;
  $('dvPendList').innerHTML=L.map(r=>{ const j=r.job_id?(jobs||[]).find(x=>x.id===r.job_id):null, pl=r.payload||{};
    const title=r.kind==='new_job'?'New job — '+(pl.customer||'(no name)'):'Edit — '+(j?j.customer:'job');
    const body=r.kind==='new_job'?[[pl.address,pl.city].filter(Boolean).join(', '),pl.phone,pl.garage_size,pl.price!=null?'$'+Number(pl.price).toLocaleString():'',pl.notes].filter(Boolean).join(' • '):[pl.request,...Object.entries(pl.fields||{}).map(([k,v])=>plainKey(k)+' → '+v)].filter(Boolean).join(' • ');
    const pill=r.status==='pending'?'<span class="pill yellow">pending</span>':r.status==='approved'?'<span class="pill green">approved</span>':'<span class="pill red">rejected</span>';
    return '<div class="rowbox"><div class="split" style="flex-wrap:wrap;gap:8px"><div style="min-width:0;flex:1 1 220px"><strong>'+esc(title)+'</strong> '+pill+'<div class="sub">'+esc((DISPLAY[uk(r.salesman_username)]||r.salesman_username)+' • '+String(r.created_at||'').slice(0,10))+'</div><div style="margin-top:6px;white-space:pre-wrap">'+esc(body)+'</div></div>'
      +(mgr&&r.status==='pending'?'<div style="display:flex;gap:6px;flex-wrap:wrap">'+(['add-job','job-form'].includes(pl.source)&&typeof window.ajReview==='function'?'<button class="btn primary sm" data-rv="'+r.id+'">Review &amp; approve</button>':'<button class="btn primary sm" data-ap="'+r.id+'">Approve</button>')+'<button class="btn light sm" data-rj="'+r.id+'">Reject</button>'+(r.job_id?'<button class="btn light sm" data-vj="'+r.job_id+'">View Job</button>':'')+'</div>':'')+'</div></div>'; }).join('');
  $('dvPendList').querySelectorAll('[data-ap]').forEach(b=>b.onclick=()=>approve(b.dataset.ap,b));
  $('dvPendList').querySelectorAll('[data-rv]').forEach(b=>b.onclick=()=>window.ajReview(b.dataset.rv,pend));
  $('dvPendList').querySelectorAll('[data-rj]').forEach(b=>b.onclick=()=>reject(b.dataset.rj));
  $('dvPendList').querySelectorAll('[data-vj]').forEach(b=>b.onclick=()=>openDrawer(b.dataset.vj)); }
async function approve(id,btn){ if(!isMgr()) return; const r=pend.find(x=>x.id===id); if(!r) return; const pl=r.payload||{}; const user=await uid(); if(btn) btn.disabled=true;
  try{ if(r.kind==='new_job'){ // same record shape as approveRequest() for a salesman turn-in
      const rec={customer:pl.customer||'(voice job)',salesman_username:r.salesman_username,sold_date:today(),address:pl.address||'',city:pl.city||'',phone:pl.phone||'',garage_size:pl.garage_size||'',demolition_required:true,demo_status:'Pending',extras_required:false,extras_status:'N/A',permit_status:'Not Submitted',price:pl.price,deposit_status:'Pending',notes:pl.notes?'Sales voice request notes: '+pl.notes:'',created_by:user};
      const {data:j,error}=await sb.from('jobs').insert(rec).select().single(); if(error) throw error;
      await activity(j.id,'Voice job request approved',{pending_id:id});
      await mark(id,'approved',user); try{ await refresh(); }catch(e){} if(j&&j.id) try{ openJobForm(j.id); }catch(e){}
    } else { const j=(jobs||[]).find(x=>x.id===r.job_id); if(!j) throw new Error('job not found');
      const B=['customer','address','city','zip','phone','price','deposit','hold_status','garage_size']; const out={}; /* salesman requests: basics only */ Object.entries(pl.basics||{}).forEach(([k,v])=>{ if(B.includes(k)) out[k]=v; }); const who=DISPLAY[uk(r.salesman_username)]||r.salesman_username;
      const patch={...out}; if(pl.request) patch.notes=withProfitTag((String(j.notes||'').trim()?String(j.notes).trim()+'\n\n':'')+'['+who+' voice request approved] '+pl.request,j);
      const {error}=await sb.from('jobs').update(patch).eq('id',j.id); if(error) throw error;
      await activity(j.id,'Salesman voice edit approved',{pending_id:id,changes:out,request:pl.request});
      await mark(id,'approved',user); try{ await refresh(); }catch(e){} }
  }catch(e){ if(btn) btn.disabled=false; alert('Not approved: '+(e.message||e)); return; }
  await loadPending(); }
async function reject(id){ if(!isMgr()||!confirm('Reject this voice request?')) return; await mark(id,'rejected',await uid()); await loadPending(); }
async function mark(id,s,user){ const {error}=await sb.from('pending_job_changes').update({status:s,reviewed_by:user,reviewed_at:new Date().toISOString()}).eq('id',id).eq('status','pending'); if(error) throw error; }

/* ---------- tool dispatch (shared by live voice + typed) ---------- */
function runTool(name,a){ const p=runTool0(name,a); Promise.resolve(p).finally(()=>{curSrch=null;}); return p; }
function runTool0(name,a){ a=a||{}; curSrch=a.search&&typeof a.search==='object'?a.search:null;
  if(name==='get_job_status') return jobStatus(a.query,curSrch);
  if(name==='propose_new_job') return proposeNew(a);
  if(name==='request_job_edit') return requestEdit(a);
  if(name==='update_job') return updateJob(a);
  if(name==='record_payment') return recordPayment(a);
  if(name==='open_closeout') return openCloseout(a);
  if(name==='finish'){ setTimeout(()=>stop('Done.'),1500); return {ok:true}; }
  return {error:'unknown tool'}; }
function speakStatus(r){ if(!r||r.found===0) return r&&r.say||'No job found.'; if(r.matches) return r.say||('Which one: '+r.matches.join('; ')+'?');
  const rec=String(r.record||''), g=k=>{ const m=rec.match(new RegExp('^'+k+': (.*)$','m')); return m?m[1]:''; };
  return [g('Customer')+(g('Overall stage')?' ('+g('Overall stage')+')':''),['Permit status','Demo status','Concrete status','Carpentry status','Electric status','Inspection status'].map(k=>g(k)?k.replace(' status','').toLowerCase()+' '+g(k):'').filter(Boolean).join(', ')].filter(Boolean).join(': ')+'.'; }

/* ---------- edge function ---------- */
async function callFn(body){ const s=await sb.auth.getSession(); const t=s&&s.data&&s.data.session&&s.data.session.access_token;
  const r=await fetch(SB_URL+'/functions/v1/'+FN,{method:'POST',headers:{'Content-Type':'application/json',apikey:SB_KEY,...(t?{Authorization:'Bearer '+t}:{})},body:JSON.stringify(body)});
  const d=await r.json().catch(()=>({})); if(!r.ok||d.error) throw new Error(d.error||d.message||('HTTP '+r.status)); return d; }
const ctx=()=>({role:isMgr()?'manager':'salesman',catalog:stageCatalog(),learned:learnedText(),today:today()});
const WAKE=/^\s*(hey|hi|okay|ok)[,\s]+(dashboard|dash board|dashbored)[,.!\s]*/i;

async function sendText(txt){ txt=(txt||$('dvText').value||'').replace(WAKE,'').trim(); if(!txt) return; $('dvText').value=''; log('u',txt); heard(txt);
  if(live()){ say(txt); return; } stat('Reading…');
  try{ const d=await callFn({mode:'text',...ctx(),transcript:txt}); window.dvLastText=d; let spoken=d.say||'';
    for(const c of d.calls||[]){ const r=await runTool(c.name,c.args); if(c.name==='get_job_status') spoken=speakStatus(r); else if(r&&r.error) spoken=r.error; }
    if(spoken){ sayLine(spoken); log('a',spoken); } stat((d.calls||[]).some(c=>c.name!=='get_job_status')?'Check the card below — nothing is saved until you confirm.':'Ready.'); }
  catch(e){ stat('Could not read that ('+(e.message||e)+').'); } }

/* ---------- live voice (patterns from voice-core.js) ---------- */
const SILENT='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
let pc=null,dc=null,mic=null,audio=null,actx=null,t0=0,userAct=0,tick=null,aiTalking=false,stillAsked=false,sayBuf='',sayNew=true,playChk=null;
function unlockAudio(){ try{ if(navigator.audioSession) navigator.audioSession.type='play-and-record'; }catch(e){}
  if(!audio){ audio=document.createElement('audio'); audio.id='dvAudio'; audio.style.cssText='position:absolute;width:1px;height:1px;opacity:0;pointer-events:none'; document.body.appendChild(audio); }
  audio.autoplay=true; audio.muted=false; audio.setAttribute('playsinline',''); audio.setAttribute('webkit-playsinline','');
  try{ audio.srcObject=null; audio.src=SILENT; audio.play().catch(()=>{}); }catch(e){}
  try{ const AC=window.AudioContext||window.webkitAudioContext; if(AC){ actx=actx||new AC(); actx.resume&&actx.resume(); const b=actx.createBuffer(1,1,22050),s=actx.createBufferSource(); s.buffer=b; s.connect(actx.destination); s.start(0); } }catch(e){} }
function playRemote(s){ try{ audio.removeAttribute('src'); }catch(e){} audio.srcObject=s; const p=audio.play(); if(p&&p.catch) p.catch(soundWarn); }
function soundWarn(){ let w=$('dvSoundWarn'); if(!w){ w=document.createElement('button'); w.type='button'; w.id='dvSoundWarn'; w.className='dv-warn'; w.onclick=()=>{ unlockAudio(); if(pc){ const r=pc.getReceivers().find(x=>x.track&&x.track.kind==='audio'); if(r) playRemote(new MediaStream([r.track])); } w.hidden=true; }; $('dvSay').after(w); }
  w.textContent="Can't play sound — check volume / Silent switch, then tap here."; w.hidden=false; }
function setTalking(on){ if(aiTalking&&!on) aiStopAt=Date.now(); aiTalking=on; $('dvSay').classList.toggle('talking',on); if(live()) stat(on?'AI talking… (just keep talking to interrupt)':'Listening…');
  if(on){ clearTimeout(playChk); const a0=audio?audio.currentTime:0; playChk=setTimeout(()=>{ if(aiTalking&&audio&&(audio.paused||audio.currentTime<=a0)) soundWarn(); },1500); } }
const live=()=>!!(dc&&dc.readyState==='open');
function send(o){ if(live()) dc.send(JSON.stringify(o)); }
function say(t){ send({type:'conversation.item.create',item:{type:'message',role:'user',content:[{type:'input_text',text:t}]}}); send({type:'response.create'}); userAct=Date.now(); }
async function start(){ if(!navigator.mediaDevices||!window.RTCPeerConnection){ stat('Live voice is not supported here — type below.'); return; }
  $('dvMic').disabled=true; stat('Listening…'); unlockAudio();
  try{ mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:false,channelCount:1}});
    const tok=await callFn({mode:'realtime',...ctx()});
    pc=new RTCPeerConnection(); pc.ontrack=e=>playRemote(e.streams[0]||new MediaStream([e.track])); pc.addTrack(mic.getTracks()[0],mic);
    dc=pc.createDataChannel('oai-events'); dc.onmessage=e=>{ try{ onEvent(JSON.parse(e.data)); }catch(x){} };
    dc.onopen=()=>{ stat('Listening…'); stillAsked=false; userAct=Date.now(); }; /* silent start: no greeting */
    pc.onconnectionstatechange=()=>{ const st=pc&&pc.connectionState; if(st==='failed'||st==='closed') stop('Voice ended (connection lost). Tap Talk to keep going.'); else if(st==='disconnected') setTimeout(()=>{ if(pc&&pc.connectionState==='disconnected') stop('Voice ended (connection lost). Tap Talk to keep going.'); },10000); };
    const offer=await pc.createOffer(); await pc.setLocalDescription(offer);
    const r=await fetch('https://api.openai.com/v1/realtime/calls',{method:'POST',body:offer.sdp,headers:{Authorization:'Bearer '+tok.value,'Content-Type':'application/sdp'}});
    if(!r.ok) throw new Error('Voice connect failed ('+r.status+')'); await pc.setRemoteDescription({type:'answer',sdp:await r.text()});
    t0=userAct=Date.now(); $('dvMic').classList.add('live'); $('dvMicTxt').textContent='End'; $('dvTimer').hidden=false; tick=setInterval(timer,1000); timer();
  }catch(e){ stop(); stat('Voice did not start ('+(e.message||e)+'). Type below instead.'); } finally{ $('dvMic').disabled=false; } }
function timer(){ const s=Math.floor((Date.now()-t0)/1000), idle=aiTalking?0:(Date.now()-userAct)/1000; $('dvTimer').textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
  if(s>=MAX_TOTAL) stop('Voice ended (15 min limit). Tap Talk to keep going.'); else if(idle>MAX_IDLE) stop('Voice ended after 2 minutes of silence.');
  else if(idle>STILL_THERE&&!stillAsked){ stillAsked=true; stat('Still there? (voice ends after 2 min of quiet)'); } }
function stop(msg){ clearInterval(tick); tick=null; try{ dc&&dc.close(); }catch(e){} try{ pc&&pc.close(); }catch(e){} try{ mic&&mic.getTracks().forEach(t=>t.stop()); }catch(e){}
  dc=pc=mic=null; aiTalking=false; clearTimeout(playChk); const m=$('dvMic'); if(m){ m.classList.remove('live'); $('dvMicTxt').textContent='🎤 Talk'; $('dvTimer').hidden=true; } if(msg) stat(msg); }
let lastUserTxt='', lastAiTxt='', aiStopAt=0;
/* BARGE-IN FIX (2026-10-31): the AI's own voice leaks from the speaker into the mic, gets transcribed as a full sentence and
   was treated as the user interrupting. Echo = most words of the transcript are words the AI is saying / just said. */
const ewords=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(w=>w.length>1);
function isEcho(t){ if(!aiTalking&&Date.now()-aiStopAt>2500) return false; const w=ewords(t); if(!w.length) return true; const ref=new Set(ewords(sayBuf+' '+lastAiTxt)); if(!ref.size) return false;
  return w.filter(x=>ref.has(x)).length/w.length>=0.6; }
/* while the AI talks only a real sentence of the USER cuts it off: 3+ non-filler words (or a number), not echo */
function bargeOk(t){ if(isEcho(t)) return false; const w=ewords(t).filter(x=>!/^(uh+|um+|mm+|hmm+|ah+|oh+|ok|okay|yeah|yep|yes|no|huh|right|sure|thanks|thank|you|bye|so|well|like)$/.test(x)); return w.length>=3||w.some(x=>/\d/.test(x)); }
/* Background noise often transcribes as nothing, a filler ("uh", "mm"), or a stock phrase ("Thank you.", "Bye.") — never act on those
   (okay/yeah only count right after a question once the AI has finished speaking, or with a confirm/pick card on screen; filler never interrupts the AI). */
function pendingQuestion(){ return !aiTalking&&(/\?\s*$/.test(lastAiTxt)||!!document.querySelector('#dvCards .dv-card .dv-ok,#dvCards .dv-pick')); }
function realSpeech(t){ const s=String(t||'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').trim(); if(!s) return false;
  if(/^(uh+|um+|mm+|hmm+|ah+|oh+|you|bye|thank you|thanks|thanks for watching|okay|ok|yeah|huh)( (uh+|um+|you|bye|thank you))*$/.test(s)&&!pendingQuestion()) return false;
  lastUserTxt=t; return true; }
const DONE_RE=/\b(done|that'?s (it|all)|that is (it|all)|finished|all set|we'?re good|end (it|the conversation)|stop)\b/i;
function onEvent(ev){ const t=ev.type;
  if(t==='input_audio_buffer.speech_started'){ if(!aiTalking) stat('Hearing you…'); }
  else if(t==='input_audio_buffer.speech_stopped'){ if(!aiTalking) stat('Listening…'); }
  else if(t==='output_audio_buffer.started') setTalking(true);
  else if(t==='output_audio_buffer.stopped'||t==='output_audio_buffer.cleared') setTalking(false);
  else if(t==='response.output_audio_transcript.delta'&&ev.delta){ if(sayNew){ sayBuf=''; sayNew=false; } sayBuf+=ev.delta; sayLine(sayBuf); }
  else if(t==='response.output_audio_transcript.done'&&ev.transcript){ lastAiTxt=ev.transcript; log('a',ev.transcript); sayLine(ev.transcript); sayNew=true; }
  else if(t==='conversation.item.input_audio_transcription.completed'&&ev.transcript){ const tx=ev.transcript.replace(WAKE,''); if(isEcho(tx)){ window.dvEchoIgnored=(window.dvEchoIgnored||0)+1; return; } if(!realSpeech(tx)) return;
    if(aiTalking&&!bargeOk(tx)) return; userAct=Date.now(); stillAsked=false;
    if(aiTalking){ send({type:'response.cancel'}); send({type:'output_audio_buffer.clear'}); setTalking(false); } send({type:'response.create'}); log('u',tx); heard(tx); }
  else if(t==='conversation.item.input_audio_transcription.failed'){ /* usually noise: ignore quietly */ }
  else if(t==='response.function_call_arguments.done'){ let a={}; try{ a=JSON.parse(ev.arguments||'{}'); }catch(e){}
    if(ev.name==='finish'&&!DONE_RE.test(lastUserTxt)){ send({type:'conversation.item.create',item:{type:'function_call_output',call_id:ev.call_id,output:'He did not say he is done. Keep listening silently.'}}); return; }
    Promise.resolve().then(()=>runTool(ev.name,a)).catch(e=>({error:String(e.message||e)})).then(r=>{
      const out=ev.name==='get_job_status'?r:Object.assign({note:'Nothing saved yet. A confirm card is on screen; tell the user to check it and tap the button.'},r||{});
      send({type:'conversation.item.create',item:{type:'function_call_output',call_id:ev.call_id,output:JSON.stringify(out).slice(0,4000)}}); send({type:'response.create'}); }); }
  else if(t==='error') stat('Voice error: '+((ev.error&&ev.error.message)||'')); }

/* ---------- boot: mount once the dashboard has a profile ---------- */
function boot(){ const p=me(); if(!p||!$('appMain')||$('appMain').classList.contains('hidden')) return false; mount(); hint(); loadPending(); return true; }
const iv=setInterval(()=>{ if(boot()) clearInterval(iv); },500);
try{ const o=window.renderAll; if(typeof o==='function') window.renderAll=renderAll=function(){ const r=o.apply(this,arguments); try{ renderPending(); hint(); }catch(e){} return r; }; }catch(e){}
window.AGBDashVoice={sendText,runTool,findJobs,jobStatus,loadPending,approve,reject,_state:()=>({pend}),stop,
  /* offline test hook: fake data channel, feed events */ _sim:()=>{ window.dvSent=[]; dc={readyState:'open',send:m=>window.dvSent.push(JSON.parse(m)),close(){}}; t0=userAct=Date.now(); return onEvent; }};
})();
