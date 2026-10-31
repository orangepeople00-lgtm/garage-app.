/* morning-briefing.js — SAMPLE spoken morning briefing (morning-briefing-sample.html only; index.html is unchanged).
   Only for owner / business_manager (manager()). Uses the dashboard's own loaded data (read only, nothing is written):
     jobs (refresh(): jobs where deleted_at is null) + the dashboard's own status() / overdue() rules.
   Categories (local date = todayISO()):
     Demos today   : jobs.scheduled_demo = today (demo_status not N/A, job not Completed) — demo_crew, demo_time, demo_status
     Pours today   : jobs.concrete_scheduled = today (concrete_status not N/A, job not Completed) — concrete_crew, concrete_time, concrete_status
     Permits pending: permit_status in Applied/Submitted, Submitted, Corrections Needed (same as the "Permits Pending" tile), job not Completed
     Overdue       : the dashboard's overdue(j): concrete_scheduled / carpentry_scheduled / inspection_date before today and not done (not on hold, not completed)
   Text is built deterministically; it is only READ aloud. Voice: OpenAI TTS via edge function morning-briefing
   (gpt-4o-mini-tts), browser speechSynthesis as fallback. Plays once per day per user (localStorage), Play/Replay + Mute. */
(function(){
const $=id=>document.getElementById(id);
const FN='morning-briefing';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isMgr=()=>{ try{ return !!manager(); }catch(e){ return false; } };
const me=()=>{ try{ return profile||null; }catch(e){ return null; } };
const day=()=>{ try{ return todayISO(); }catch(e){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); } };
const KEY=()=>'agbBriefing:'+((me()||{}).username||'');
const MKEY=()=>'agbBriefingMute:'+((me()||{}).username||'');
const isPhone=()=>/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)||(navigator.maxTouchPoints>1&&/Macintosh/.test(navigator.userAgent));
const css=`.mb{margin:0 0 12px;background:#0b1220;border:1px solid #1e3a5f;border-radius:16px;padding:12px;color:#e4e4e7;box-sizing:border-box;max-width:100%;overflow-wrap:anywhere}
.mb *{box-sizing:border-box}.mb-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mb-h{font-weight:800;font-size:15px;flex:1 1 160px;min-width:0}
.mb-btn{min-height:44px;padding:0 16px;border-radius:999px;border:0;font-weight:800;font-size:15px;cursor:pointer;background:#2563eb;color:#fff}
.mb-btn.sec{background:#27272a;border:1px solid #52525b;color:#f4f4f5;font-weight:600}.mb-btn.playing{background:#16a34a}
.mb-st{font-size:12px;color:#a1a1aa;margin:6px 0}.mb-sec{margin-top:8px;font-size:13px;line-height:1.45}.mb-sec b{color:#fff}
.mb-sec ul{margin:2px 0 0 18px;padding:0}.mb-empty{color:#a1a1aa}.mb-close{margin-left:auto}`;
const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

/* ---------- data (read only) ---------- */
const d10=v=>String(v||'').slice(0,10);
const t12=t=>{ try{ return fmtCrewTime(t); }catch(e){ return ''; } };
const who=j=>(j.customer||'a job')+(j.address?' on '+String(j.address).replace(/^\s*\d+[A-Za-z]?\s+/,'').trim():'');
const alive=j=>{ try{ return status(j)!=='Completed'; }catch(e){ return !j.completed_date; } };
function gather(){ const t=day(); let J=[]; try{ J=(jobs||[]).filter(j=>!j.deleted_at); }catch(e){}
  const demos=J.filter(j=>alive(j)&&d10(j.scheduled_demo)===t&&j.demo_status!=='N/A').map(j=>({j,crew:j.demo_crew||'',time:t12(j.demo_time),done:j.demo_status==='Complete'}));
  const pours=J.filter(j=>alive(j)&&d10(j.concrete_scheduled)===t&&j.concrete_status!=='N/A').map(j=>({j,crew:j.concrete_crew||'',time:t12(j.concrete_time),done:j.concrete_status==='Poured'}));
  const permits=J.filter(j=>alive(j)&&['Applied/Submitted','Submitted','Corrections Needed'].includes(j.permit_status)).map(j=>({j,fix:j.permit_status==='Corrections Needed',since:d10(j.permit_date)}));
  const od=J.filter(j=>{ try{ return overdue(j); }catch(e){ return false; } }).map(j=>{ const r=[];
    if(j.concrete_scheduled&&d10(j.concrete_scheduled)<t&&!['Poured','N/A'].includes(j.concrete_status)) r.push('concrete was set for '+md(j.concrete_scheduled));
    if(j.carpentry_scheduled&&d10(j.carpentry_scheduled)<t&&j.carpentry_status!=='Garage Built') r.push('carpentry was set for '+md(j.carpentry_scheduled));
    if(j.inspection_date&&d10(j.inspection_date)<t&&!['Passed','N/A'].includes(j.inspection_status)) r.push('inspection was set for '+md(j.inspection_date));
    return {j,why:r}; });
  return {t,demos,pours,permits,od,count:J.length}; }
function md(v){ const s=d10(v); const m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/); if(!m) return s; return ['January','February','March','April','May','June','July','August','September','October','November','December'][+m[2]-1]+' '+(+m[3]); }
const list=(a,n)=>a.length<=n?a:a.slice(0,n);
const andJoin=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];
const plural=(n,w)=>n+' '+w+(n===1?'':'s');

/* ---------- deterministic text ---------- */
function build(g){ const name=(()=>{ try{ return DISPLAY[String(me().username).toLowerCase()]||me().username; }catch(e){ return ''; } })();
  const hr=new Date().getHours(), hi=hr<12?'Good morning':hr<17?'Good afternoon':'Good evening';
  const S=[hi+(name?' '+name:'')+'. Here is the briefing for '+new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})+'.'];
  const stg=(x,verb)=>who(x.j)+(x.crew?' with '+x.crew:'')+(x.time?' at '+x.time:'')+(x.done?' ('+verb+')':'');
  S.push(g.demos.length?plural(g.demos.length,'demo')+' today: '+andJoin(list(g.demos,5).map(x=>stg(x,'marked done')))+(g.demos.length>5?', and '+(g.demos.length-5)+' more':'')+'.':'No demos scheduled today.');
  S.push(g.pours.length?plural(g.pours.length,'pour')+' today: '+andJoin(list(g.pours,5).map(x=>stg(x,'marked poured')))+(g.pours.length>5?', and '+(g.pours.length-5)+' more':'')+'.':'No concrete pours scheduled today.');
  if(g.permits.length){ const fix=g.permits.filter(x=>x.fix); S.push(plural(g.permits.length,'permit')+' pending'+(fix.length?', '+fix.length+' with corrections needed: '+andJoin(list(fix,4).map(x=>who(x.j)))+(fix.length>4?' and '+(fix.length-4)+' more':''):'')+'.'); }
  else S.push('No permits pending.');
  S.push(g.od.length?plural(g.od.length,'job')+' overdue: '+andJoin(list(g.od,4).map(x=>who(x.j)+(x.why[0]?', '+x.why[0]:'')))+(g.od.length>4?', and '+(g.od.length-4)+' more':'')+'.':'Nothing overdue.');
  return S.join(' '); }
function html(g){ const row=(x,extra)=>'<li>'+esc(x.j.customer||'Job')+(x.j.address?' — '+esc(x.j.address):'')+(x.j.city?', '+esc(x.j.city):'')+esc(extra||'')+'</li>';
  const sec=(t,a,f,empty)=>'<div class="mb-sec"><b>'+t+' ('+a.length+')</b>'+(a.length?'<ul>'+a.slice(0,12).map(f).join('')+(a.length>12?'<li>… '+(a.length-12)+' more</li>':'')+'</ul>':'<div class="mb-empty">'+empty+'</div>')+'</div>';
  return sec('Demos today',g.demos,x=>row(x,(x.crew?' • '+x.crew:'')+(x.time?' • '+x.time:'')+(x.done?' • done':'')),'No demos scheduled today.')
    +sec('Pours today',g.pours,x=>row(x,(x.crew?' • '+x.crew:'')+(x.time?' • '+x.time:'')+(x.done?' • poured':'')),'No concrete pours scheduled today.')
    +sec('Permits pending',g.permits,x=>row(x,' • '+(x.fix?'Corrections needed':x.j.permit_status)+(x.since?' since '+x.since:'')),'No permits pending.')
    +sec('Overdue',g.od,x=>row(x,x.why.length?' • '+x.why.join('; '):''),'Nothing overdue.'); }

/* ---------- audio ---------- */
let audio=null, blobUrl='', text='', usedTts='', playing=false;
function stat(t){ const s=$('mbStatus'); if(s) s.textContent=t; }
function setBtn(){ const b=$('mbPlay'); if(!b) return; b.textContent=playing?'■ Stop':(localStorage.getItem(KEY())===day()?'↻ Replay briefing':'▶ Play briefing'); b.classList.toggle('playing',playing);
  const m=$('mbMute'); if(m) m.textContent=muted()?'🔇 Muted':'🔊 Sound on'; }
const muted=()=>localStorage.getItem(MKEY())==='1';
function mark(){ try{ localStorage.setItem(KEY(),day()); }catch(e){} }
async function tts(){ if(blobUrl) return blobUrl; const s=await sb.auth.getSession(); const t=s&&s.data&&s.data.session&&s.data.session.access_token;
  const r=await fetch(SB_URL+'/functions/v1/'+FN,{method:'POST',headers:{'Content-Type':'application/json',apikey:SB_KEY,...(t?{Authorization:'Bearer '+t}:{})},body:JSON.stringify({text})});
  if(!r.ok){ let m='HTTP '+r.status; try{ m=(await r.json()).error||m; }catch(e){} throw new Error(m); }
  const b=await r.blob(); if(!/audio/.test(b.type)) throw new Error('no audio'); blobUrl=URL.createObjectURL(b); usedTts='openai'; return blobUrl; }
function speakFallback(){ return new Promise((res,rej)=>{ if(!window.speechSynthesis) return rej(new Error('no speech')); const u=new SpeechSynthesisUtterance(text); u.rate=1.02; u.lang='en-US';
  u.onstart=()=>{ playing=true; usedTts='browser'; mark(); setBtn(); stat('Playing (device voice)…'); }; u.onend=()=>{ playing=false; setBtn(); stat('Done. Tap Replay to hear it again.'); res(); }; u.onerror=e=>{ playing=false; setBtn(); rej(e.error||e); };
  speechSynthesis.cancel(); speechSynthesis.speak(u); }); }
function stopAudio(){ try{ audio&&audio.pause(); }catch(e){} try{ speechSynthesis.cancel(); }catch(e){} playing=false; setBtn(); stat('Stopped.'); }
/* must be called from a tap on iPhone: the audio element is created+unlocked inside the gesture before the network call */
async function play(fromTap){ if(playing) return stopAudio(); if(muted()&&!fromTap){ stat('Muted — the briefing is below. Tap Play to hear it.'); return; }
  if(!audio){ audio=new Audio(); audio.setAttribute('playsinline',''); audio.onended=()=>{ playing=false; setBtn(); stat('Done. Tap Replay to hear it again.'); }; }
  if(fromTap){ try{ audio.src='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA='; audio.play().catch(()=>{}); }catch(e){} }
  stat('Getting the voice ready…');
  try{ const u=await tts(); audio.src=u; audio.muted=false; await audio.play(); playing=true; mark(); setBtn(); stat('Playing…'); }
  catch(e){ window.mbLastErr=String(e&&e.message||e);
    if(e&&e.name==='NotAllowedError'){ stat(isPhone()?'Tap “Play briefing” to hear it (your phone needs a tap first).':'Tap “Play briefing” to hear it.'); setBtn(); return; }
    try{ await speakFallback(); }catch(x){ stat('Could not play sound — read the briefing below.'); setBtn(); } } }

/* ---------- UI ---------- */
function mount(){ if($('mbPanel')||!isMgr()) return false; const main=$('appMain'), stats=$('stats'); if(!main||!stats) return false;
  const d=document.createElement('div'); d.id='mbPanel'; d.className='mb';
  d.innerHTML='<div class="mb-top"><div class="mb-h">☀️ Morning briefing <span class="mb-empty" style="font-weight:400;font-size:12px">sample</span></div><button type="button" class="mb-btn" id="mbPlay">▶ Play briefing</button><button type="button" class="mb-btn sec" id="mbMute">🔊 Sound on</button><button type="button" class="mb-btn sec mb-close" id="mbHide" aria-label="Hide briefing">✕</button></div>'
    +'<div class="mb-st" id="mbStatus"></div><div class="mb-sec" id="mbText"></div><div id="mbList"></div>';
  main.insertBefore(d,stats);
  $('mbPlay').onclick=()=>play(true);
  $('mbMute').onclick=()=>{ try{ localStorage.setItem(MKEY(),muted()?'0':'1'); }catch(e){} if(muted()) stopAudio(); setBtn(); };
  $('mbHide').onclick=()=>{ stopAudio(); d.hidden=true; };
  return true; }
function render(){ const g=gather(); text=build(g); blobUrl=blobUrl&&window._mbText===text?blobUrl:''; window._mbText=text; window.mbBriefing={text,data:{demos:g.demos.length,pours:g.pours.length,permits:g.permits.length,overdue:g.od.length}};
  $('mbText').textContent=text; $('mbList').innerHTML=html(g); setBtn(); }
let booted=false; const t0=Date.now();
function boot(){ if(booted) return true; const p=me(); if(!p||!$('appMain')||$('appMain').classList.contains('hidden')) return false;
  const ss=$('syncState'); if(ss&&!/Connected|blocked|error|fail/i.test(ss.textContent)&&Date.now()-t0<15000) return false; /* wait for refresh() to finish loading jobs */
  booted=true; if(!isMgr()) return true; if(!mount()) return true; render();
  const seen=localStorage.getItem(KEY())===day();
  if(seen){ stat('Already played today. Tap Replay to hear it again.'); }
  else if(muted()){ stat('Muted — the briefing is below.'); }
  else if(isPhone()){ stat('Tap “Play briefing” to hear today’s briefing.'); } /* iPhone Safari: audio needs a tap */
  else play(false);
  return true; }
const iv=setInterval(()=>{ if(boot()) clearInterval(iv); },600);
try{ const o=window.renderAll; if(typeof o==='function') window.renderAll=renderAll=function(){ const r=o.apply(this,arguments); try{ if(booted&&$('mbPanel')&&!playing) render(); }catch(e){} return r; }; }catch(e){}
window.AGBBriefing={gather,build,render,play,stop:stopAudio,_text:()=>text,_used:()=>usedTts};
})();
