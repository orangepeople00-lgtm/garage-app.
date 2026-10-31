/* repair-voice.js — SAMPLE live voice for the repair estimator (repair-voice-sample.html only; repair.html is unchanged).
   Reuses voice-core.js read-only (silent start, live fill, "What I set" card, sound-alike learning on this device, scoped
   read-only job status, near-field NR / low-eagerness semantic VAD / reply only after a real transcript, explicit "done",
   10 s disconnect grace, mic AGC mono). Edge function: repair-voice-session (same OpenAI Realtime settings as the estimator).
   Repair rows live in S.items (no fixed inputs), so this file adds hidden PROXY controls voice-core can fill:
     vx_on_<item>     include the repair row (checkbox)          -> S.items[id].on (same as tapping the row)
     vx_price_<item>  line price $ the salesman SAID (customer price; converted to internal cost at the current profit %)
     vx_cond_<n>      condition checklist rating                  -> S.cond
     vx_x1_* / vx_x2_* two custom extra lines (description, $, included vs option)
   Real controls are filled directly: customer fields, size, roof, pitch, f_<item>_<field>, m_<item> (included/option),
   ad_<item> (extra bullet lines), damageNotes, profitMode/profitValue, insuranceJob, exampleTag, photoCount, showPill. */
(function(){
const $=id=>document.getElementById(id);
const OPT_RE=/^vx_/;
/* ---------- proxies ---------- */
function proxies(){ if($('vxProxies')) return; const box=document.createElement('div'); box.id='vxProxies'; box.hidden=true; box.setAttribute('aria-hidden','true');
  let h='';
  ITEMS.forEach(it=>{ h+='<input type="checkbox" id="vx_on_'+it.id+'"><input type="number" id="vx_price_'+it.id+'">'; });
  CONDITIONS.forEach((c,i)=>{ h+='<select id="vx_cond_'+i+'">'+['—','Good','Fair','Poor','Replace'].map(o=>'<option>'+o+'</option>').join('')+'</select>'; });
  [1,2].forEach(k=>{ h+='<input type="text" id="vx_x'+k+'_desc"><input type="number" id="vx_x'+k+'_amt"><select id="vx_x'+k+'_disp"><option value="included">Included in price (internal cost)</option><option value="option">Option (customer price, not in total)</option></select>'; });
  box.innerHTML=h; document.body.appendChild(box);
  ITEMS.forEach(it=>{
    $('vx_on_'+it.id).addEventListener('change',e=>{ const on=e.target.checked; if(S.items[it.id].on!==on){ S.items[it.id].on=on; const r=$('it_'+it.id); if(r) r.classList.toggle('on',on); calc(); } });
    $('vx_price_'+it.id).addEventListener('change',e=>{ const v=parseFloat(e.target.value); S.items[it.id].vprice=Number.isFinite(v)&&v>0?v:null; calc(); }); });
  CONDITIONS.forEach((c,i)=>$('vx_cond_'+i).addEventListener('change',e=>{ if(e.target.value==='—') delete S.cond[c]; else S.cond[c]=e.target.value; renderCond(); saveDraft(); }));
  [1,2].forEach(k=>['desc','amt','disp'].forEach(f=>$('vx_x'+k+'_'+f).addEventListener('change',()=>syncExtra(k)))); }
/* keep proxies in step with the real state (manual taps, New, loaded estimates) */
function syncProxies(){ if(!$('vxProxies')) return; ITEMS.forEach(it=>{ const st=S.items[it.id]; $('vx_on_'+it.id).checked=!!st.on; $('vx_price_'+it.id).value=st.vprice||''; });
  CONDITIONS.forEach((c,i)=>{ $('vx_cond_'+i).value=S.cond[c]||'—'; }); }
function syncExtra(k){ const d=$('vx_x'+k+'_desc').value.trim(), a=$('vx_x'+k+'_amt').value, disp=$('vx_x'+k+'_disp').value; let i=S.extras.findIndex(e=>e._voice===k);
  if(!d&&!a){ if(i>=0) S.extras.splice(i,1); } else { if(i<0){ S.extras.push({desc:'',cost:'',disp:'included',_voice:k}); i=S.extras.length-1; } Object.assign(S.extras[i],{desc:d,cost:a,disp}); }
  renderExtras(); calc(); }

/* ---------- per-line price the salesman SAID: wrap each row's cost so the row's internal cost = price / (1 + profit%) ---------- */
function markup(){ const m=$('profitMode').value, v=parseFloat($('profitValue').value)||0; return m==='percent'?1+v/100:1.2475; }
ITEMS.forEach(it=>{ const orig=it.cost; it.cost=function(f,c){ const st=S.items[it.id]; if(st&&st.vprice>0){ const k='__vp_'+it.id; PRICES[k]={label:it.cat+' (price set by salesman)',unit:'job',price:Math.round(st.vprice/markup()*100)/100}; return [[it.cat+' — salesman price $'+Math.round(st.vprice).toLocaleString(),1,k]]; } return orig.apply(this,arguments); }; });

/* ---------- field list for voice-core (id, plain label). Order = fill order. ---------- */
function fields(){ const F=[['salesman','Salesman'],['customerName','Customer name'],['customerPhone','Customer phone'],['customerEmail','Customer email'],['customerAddress','Street address'],['customerCity','City, State ZIP (e.g. "Oak Lawn, IL 60453")'],
  ['gW','Existing garage width ft'],['gD','Existing garage depth ft'],['roofStyle','Roof style'],['pitch','Roof pitch'],['showPill','Show size/roof pill on sheet'],
  ['insuranceJob','Insurance job (sheet says it is for insurance)'],['photoCount','Pictures on the sheet'],['exampleTag','"Example photo" tag on sheet picture'],
  ['damageNotes','Internal damage notes (what he SAW on site; not printed)'],['profitMode','Price by (total = pinned Total Project Price)'],['profitValue','Profit % / profit $ / total $ depending on profitMode']];
  ITEMS.forEach(it=>{ F.push(['vx_on_'+it.id,'INCLUDE repair: '+it.cat]);
    it.f.forEach(x=>F.push(['f_'+it.id+'_'+x.k,it.cat+' — '+x.l]));
    F.push(['m_'+it.id,it.cat+' — on sheet as']); F.push(['ad_'+it.id,it.cat+' — extra sheet bullet lines (separate with ;)']);
    if(!it.permit) F.push(['vx_price_'+it.id,it.cat+' — line CUSTOMER (total) PRICE $ (only when he says a dollar amount for this line)']); });
  CONDITIONS.forEach((c,i)=>F.push(['vx_cond_'+i,'Condition checklist: '+c]));
  [1,2].forEach(k=>{ F.push(['vx_x'+k+'_desc','Custom extra '+k+' description (work not in the list)']); F.push(['vx_x'+k+'_amt','Custom extra '+k+' $ (only if said)']); F.push(['vx_x'+k+'_disp','Custom extra '+k+' type']); });
  return F; }

/* ---------- contact normalizing (same rules as the estimator voice) ---------- */
function normPhone(v){ const W={zero:0,oh:0,o:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9};
  let s=String(v||'').toLowerCase().replace(/\b(zero|oh|one|two|three|four|five|six|seven|eight|nine)\b/g,m=>W[m]);
  s=s.replace(/double (\d)/g,'$1$1').replace(/triple (\d)/g,'$1$1$1'); let d=s.replace(/\D/g,''); if(d.length===11&&d[0]==='1') d=d.slice(1);
  return d.length===10?'('+d.slice(0,3)+') '+d.slice(3,6)+'-'+d.slice(6):(d.length===7?d.slice(0,3)+'-'+d.slice(3):''); }
function normEmail(v){ let s=String(v||'').trim().toLowerCase().replace(/^(email|e-mail)( is| address is)?\s*/,'');
  s=s.replace(/\s+at\s+/g,'@').replace(/\s+dot\s+/g,'.').replace(/\s*(underscore)\s*/g,'_').replace(/\s*(dash|hyphen)\s*/g,'-').replace(/\s+/g,'');
  if(/@(gmail|yahoo|hotmail|outlook|aol|icloud|comcast|att|sbcglobal|live|msn|me)$/.test(s)) s+=/@(att|comcast|sbcglobal)$/.test(s)?'.net':'.com';
  return /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/.test(s)?s:''; }
const APPEND=['damageNotes'].concat(ITEMS.map(it=>'ad_'+it.id));
const MONEY_SAID=/(\$\s*\d|\d\s*(dollars?|bucks|k\b|grand|thousand|hundred)|\b(dollars?|bucks|grand|thousand|hundred)\b)/i;
function guard(f){
  if(f.id==='customerPhone'){ const v=normPhone(f.value); if(!v) return false; f.value=v; }
  if(f.id==='customerEmail'){ const v=normEmail(f.value); if(!v) return false; f.value=v; }
  /* notes are ADDED to what is there, never replace it */
  if(APPEND.includes(f.id)){ const el=$(f.id), cur=(el&&el.value)||'', add=String(f.value||'').trim(); if(!add) return false; if(cur.includes(add)) return false; f.value=cur?cur.replace(/\s+$/,'')+(f.id==='damageNotes'?'\n':'; ')+add:add; }
  /* prices only when a dollar amount was actually spoken */
  if((/^vx_price_/.test(f.id)||/^vx_x\d_amt$/.test(f.id)||f.id==='f_permit_fee'||(f.id==='profitValue'&&$('profitMode').value!=='percent'))&&f.heard&&!MONEY_SAID.test(f.heard)&&!/\d{3,}/.test(f.heard)) return false;
  return true; }
/* a value set for a row's field turns that row on (unless he said to leave it off) */
function autoOn(props){ let ch=false; ITEMS.forEach(it=>{ const any=Object.keys(props).some(k=>props[k].on&&(k.startsWith('f_'+it.id+'_')||k==='vx_price_'+it.id||k==='m_'+it.id||k==='ad_'+it.id));
    const p=props['vx_on_'+it.id]; if(any&&!p&&!S.items[it.id].on){ S.items[it.id].on=true; const r=$('it_'+it.id); if(r) r.classList.add('on'); ch=true; } }); if(ch) calc(); syncProxies(); }

/* ---------- READ-ONLY price answers (computes with the page's own compute(); nothing is changed) ---------- */
function priceInfo(q){ q=q||{}; const R0=compute(); const out={project_price:R0.total,project_price_text:'$'+R0.total.toLocaleString(),price_table:'EXAMPLE prices unless changed in Settings',
    lines:R0.rows.map(r=>r.cat+' (internal $'+Math.round(r.cost)+')').slice(0,30), options:R0.opts.map(o=>o.cat+' $'+o.price)};
  const ch=(q.changes||[]).filter(c=>c&&c.id); if(!ch.length) return out;
  const snap=JSON.stringify(S), dom=[];
  try{ ch.forEach(c=>{ let m;
      if((m=String(c.id).match(/^vx_on_(.+)$/))&&S.items[m[1]]) S.items[m[1]].on=/^(true|yes|1|on)$/i.test(c.value);
      else if((m=String(c.id).match(/^vx_price_(.+)$/))&&S.items[m[1]]) S.items[m[1]].vprice=parseFloat(c.value)||null;
      else if((m=String(c.id).match(/^f_(.+?)_([a-z]+)$/))&&S.items[m[1]]){ S.items[m[1]].f[m[2]]=c.value; }
      else if($(c.id)){ dom.push([c.id,$(c.id).value]); $(c.id).value=c.value; } });
    const R1=compute(); out.with_change_price=R1.total; out.difference=R1.total-R0.total;
    out.difference_text=(out.difference>=0?'Adds $':'Saves $')+Math.abs(out.difference).toLocaleString()+' to the customer price; new total $'+R1.total.toLocaleString()+'.';
  }catch(e){ out.error='Could not price that ('+(e.message||e)+')'; }
  finally{ S=JSON.parse(snap); dom.forEach(([id,v])=>$(id).value=v); calc(); }
  return out; }

/* ---------- spoken phone/email always land (same as the estimator) ---------- */
function extraParse(t){ const out=[], s=String(t||'');
  const pm=s.match(/(?:number|phone|cell)\b[^0-9a-z]{0,12}(?:is\s*)?((?:\(?\d[\d\s().\-]{6,16}\d)|(?:(?:zero|oh|one|two|three|four|five|six|seven|eight|nine|\d)[\s,\-]*){7,11})/i);
  if(pm){ const v=normPhone(pm[1]); if(v) out.push({id:'customerPhone',value:v,heard:pm[0].trim()}); }
  const em=s.match(/e-?mail(?: address)?(?: is)?\s+([a-z0-9._\-]+(?:\s+(?:dot|underscore|dash)\s+[a-z0-9]+)*\s*(?:@|\bat\b)\s*[a-z0-9\-]+(?:\s*(?:\.|\bdot\b)\s*[a-z]{2,})*)/i);
  if(em){ const v=normEmail(em[1]); if(v) out.push({id:'customerEmail',value:v,heard:em[0].trim()}); }
  const d=dims(s); if(d){ if(d.w) out.push({id:'gW',value:String(d.w),heard:d.heard}); if(d.d) out.push({id:'gD',value:String(d.d),heard:d.heard}); }
  return out; }
/* "20 by 22", "twenty two by twenty four", "22 wide" -> existing garage size (width first) */
const NW={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40};
function dims(t){ const s=String(t).toLowerCase().replace(/\b(twenty|thirty|forty)[\s-]+(one|two|three|four|five|six|seven|eight|nine)\b/g,(m,a,b)=>String(NW[a]+NW[b])).replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty)\b/g,m=>String(NW[m])).replace(/\b(feet|foot|ft)\b|['’]/g,' ');
  let m, r={}; if((m=s.match(/\b(\d{2}(?:\.5)?)\s*(?:x|×|by|bye|buy)\s*(\d{2}(?:\.5)?)\b/))){ r.w=+m[1]; r.d=+m[2]; r.heard=m[0]; }
  else { if((m=s.match(/\b(\d{2}(?:\.5)?)\s*(?:wide|width)\b/))){ r.w=+m[1]; r.heard=m[0]; } if((m=s.match(/\b(\d{2}(?:\.5)?)\s*(?:deep|depth|long)\b/))){ r.d=+m[1]; r.heard=(r.heard?r.heard+', ':'')+m[0]; } }
  /* only when it is about the garage, not a door size like 16 by 7 / 9x7 */
  if(r.w&&r.d&&(r.w<10||r.d<10)) return null; if(/door|window/.test(s)&&r.w&&r.d&&r.d<=8) return null;
  ['w','d'].forEach(k=>{ if(r[k]!=null&&(r[k]<10||r[k]>60)) delete r[k]; }); return (r.w||r.d)?r:null; }

function boot(){ proxies(); syncProxies();
  window.agbVoice=AGBVoiceCore.create({ page:'repair', fnName:'repair-voice-session', fields:fields(),
    extraCatalog:['NOTE: item rows are OFF until included. Setting any f_<item>_* / line price turns that row on. Defaults shown are the standard for anything not mentioned.'],
    guard, extraParse, priceInfo,
    hideOnCard:['profitMode'], linked:{profitValue:['profitMode']},
    itemLabel:(id,p)=>{ if(/^vx_price_/.test(id)) return (ITEMS.find(i=>'vx_price_'+i.id===id)||{}).cat+' — customer price $'+Number(p.v).toLocaleString()+' (total for this line)'; if(id==='profitValue'&&$('profitMode').value==='total') return 'Total set to $'+Number(p.v).toLocaleString(); return null; },
    afterCommit:autoOn, afterFill:()=>{ try{ calc(); }catch(e){} } }); }
/* manual changes (row taps, New, loaded estimates) keep the proxies in step */
const oc=window.calc; window.calc=calc=function(){ const r=oc.apply(this,arguments); try{ syncProxies(); }catch(e){} return r; };
window.AGBRepairVoice={dims,extraParse,fields,priceInfo,syncProxies,normPhone,normEmail};
boot();
})();
