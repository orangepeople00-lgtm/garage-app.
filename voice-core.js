/* voice-core.js — shared live-voice helper (SAMPLE). Used by estimator.html; repair.html can reuse with its own field list.
   AGBVoiceCore.create({page, fields:[[id,label]...], extraCatalog:[...], fillDoors(list), afterFill(), fnName}) -> controller.
   Expects the page to have the #agbVoice panel markup, garageSb, GARAGE_SB_URL, GARAGE_SB_KEY. */
(function(){var st=document.createElement('style');st.textContent=".agbv{margin:0 0 16px;background:#0b1220;border:1px solid #1e3a5f;border-radius:16px;padding:12px;color:#e4e4e7;max-width:100%;box-sizing:border-box}\n.agbv *{box-sizing:border-box}\n.agbv-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap}\n.agbv-mic{min-height:48px;padding:0 18px;border-radius:999px;background:#2563eb;color:#fff;font-weight:800;font-size:16px;border:0}\n.agbv-mic.live{background:#dc2626;animation:agbvp 1.4s infinite}\n@keyframes agbvp{50%{box-shadow:0 0 0 8px rgba(220,38,38,.25)}}\n.agbv-timer{font-size:11px;color:#71717a;font-variant-numeric:tabular-nums}\n.agbv-status{font-size:12px;color:#a1a1aa;margin:8px 0 6px;line-height:1.4}\n.agbv-type{display:flex;gap:6px}\n.agbv-type input{flex:1;min-width:0;min-height:44px;background:#18181b;border:1px solid #3f3f46;border-radius:12px;color:#fff;padding:0 10px;font-size:16px}\n.agbv-btn{min-height:44px;padding:0 14px;border-radius:12px;background:#27272a;border:1px solid #52525b;color:#f4f4f5;font-size:14px}\n.agbv-log{margin-top:8px;font-size:12px;max-height:120px;overflow:auto;background:#09090b;border-radius:10px;padding:6px 8px;line-height:1.45}\n.agbv-log .u{color:#93c5fd}.agbv-log .a{color:#86efac}\n.agbv-card{margin-top:10px;background:#111827;border:1px solid #334155;border-radius:14px;padding:10px}\n.agbv-h{font-weight:800;font-size:14px;margin-bottom:6px}.agbv-sub{font-weight:400;color:#a1a1aa;font-size:12px}\n.agbv-item{display:grid;grid-template-columns:28px minmax(0,1fr) minmax(0,1.2fr);gap:6px;align-items:center;padding:5px 0;border-top:1px solid #1f2937;font-size:13px}\n.agbv-item input[type=checkbox]{width:22px;height:22px}\n.agbv-item select,.agbv-item input[type=text]{width:100%;min-height:38px;background:#18181b;border:1px solid #3f3f46;border-radius:10px;color:#fff;font-size:14px;padding:0 6px}\n.agbv-q{margin-top:8px;padding:8px;background:#422006;border:1px solid #a16207;border-radius:12px;font-size:13px}\n.agbv-q .opts{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}\n.agbv-q button{min-height:40px;padding:0 12px;border-radius:999px;background:#fbbf24;color:#000;font-weight:700;border:0;font-size:14px}\n.agbv-heard{font-size:12px;color:#93c5fd;background:#0b1220;border-radius:8px;padding:5px 8px;margin-bottom:6px;line-height:1.35;overflow-wrap:anywhere}\n.agbv-say{display:flex;gap:8px;align-items:flex-start;font-size:14px;line-height:1.4;color:#e4e4e7;background:#052e16;border:1px solid #166534;border-radius:12px;padding:8px 10px;margin:6px 0}\n.agbv-eq{display:inline-flex;gap:2px;align-items:flex-end;height:16px;margin-top:2px;flex:none}.agbv-eq i{width:3px;height:4px;background:#86efac;border-radius:2px}\n.agbv-say.talking .agbv-eq i{animation:agbveq .7s infinite ease-in-out}.agbv-say.talking .agbv-eq i:nth-child(2){animation-delay:.15s}.agbv-say.talking .agbv-eq i:nth-child(3){animation-delay:.3s}\n@keyframes agbveq{50%{height:16px}}\n.agbv-warn{display:block;width:100%;margin:4px 0;min-height:40px;border-radius:10px;background:#7f1d1d;color:#fff;border:0;font-size:13px;padding:6px 10px;text-align:left}\n.agbv-unk{margin-top:6px;font-size:12px;color:#fca5a5}\n.agbv-actions{display:flex;gap:8px;margin-top:10px}\n.agbv-fill{flex:1;min-height:48px;border-radius:12px;background:#16a34a;color:#fff;font-weight:800;font-size:16px;border:0}\n";document.head.appendChild(st);})();
/* fixed-size transcript boxes (html.agbv-fixbox) — text scrolls inside, the page never moves */
(function(){ document.documentElement.classList.add('agbv-fixbox'); var st=document.createElement('style'); st.textContent='.agbv-say[hidden]{display:none}.agbv-fixbox #agbvSay{height:88px;overflow-y:auto;overflow-anchor:none}.agbv-fixbox.agbv-on #agbvSay[hidden]{display:flex;visibility:hidden}.agbv-fixbox #agbvLog{height:120px;max-height:120px;overflow-y:auto;overflow-anchor:none}.agbv-fixbox.agbv-on #agbvLog[hidden]{display:block;visibility:hidden}.agbv-fixbox #agbvHeard{max-height:34px;overflow-y:auto;overflow-anchor:none}@media(min-width:900px){.agbv-fixbox #agbvSay{height:72px}.agbv-fixbox #agbvLog{height:140px;max-height:140px}}'; document.head.appendChild(st); })();

/* SAMPLE voice-estimate (branch voice-estimate-sample). Talks to OpenAI Realtime via an ephemeral key minted by the
   Supabase function estimate-voice-session. Proposals go to the summary card; values go straight into the real controls (live fill)
   and fires their normal input/change events, so prices/city rules/AI prompt/sheet update like manual entry. */
window.AGBVoiceCore={create:function(cfg){
  const $=id=>document.getElementById(id);
  const FN=cfg.fnName||'estimate-voice-session';
  const MAX_TOTAL=900, MAX_IDLE=120, STILL_THERE=80; // seconds: quiet safety caps (15 min total, 2 min silence)
  // id, plain label. Order = fill order (city first so city rules apply, parents before children).
  /* Field list = hand-tuned cfg.fields + cfg.autoFields() (schema scraped from the page, so new calculator controls and
     dynamically built rows are covered automatically). Refreshed before every catalog/apply/commit/render. */
  let FIELDS=cfg.fields, LABEL=Object.fromEntries(FIELDS);
  function refreshFields(){ let auto=[]; try{ auto=cfg.autoFields?cfg.autoFields(cfg.fields)||[]:[]; }catch(e){} const seen=new Set(cfg.fields.map(f=>f[0]));
    FIELDS=cfg.fields.concat(auto.filter(f=>f&&f[0]&&!seen.has(f[0])&&seen.add(f[0]))); LABEL=Object.fromEntries(FIELDS); }
  /* Spoken value -> option: exact value/label first, then every spoken word must appear in the option label.
     One match fills silently; several = ambiguous (ask which, naming the real options). */
  function fuzzyOpt(el,v){ const toks=String(v||'').toLowerCase().replace(/[^a-z0-9.\/' ]/g,' ').split(/\s+/).filter(t=>t&&!/^(the|a|an|door|color|colour|please|with|of)$/.test(t));
    if(!toks.length) return {one:null,many:[]}; const o=optsOf(el).filter(x=>x[0]!==''); const hit=o.filter(x=>{ const L=(x[1]+' '+x[0]).toLowerCase(); return toks.every(t=>L.includes(t)); });
    if(hit.length===1) return {one:hit[0][0],many:[]}; return {one:null,many:hit}; }
  let props={}, doors=null, questions=[], unknown=[];
  let heardSpeech=false, sayBuf='', sayNew=true; let pc=null, dc=null, mic=null, audio=null, t0=0, lastAct=0, tick=null, usage={sessions:0,in_audio:0,in_text:0,in_cached:0,out_audio:0,out_text:0};

  function optsOf(el){ return Array.from(el.options||[]).filter(o=>!o.disabled).map(o=>[o.value,o.textContent.trim()]); }
  function kindOf(el){ if(!el) return null; if(el.tagName==='SELECT') return 'select'; if(el.type==='checkbox') return 'bool'; if(el.type==='number'||el.type==='range') return 'number'; return 'text'; }
  function catalog(){ refreshFields();
    const lines=[];
    FIELDS.forEach(([id,lab])=>{ const el=$(id), k=kindOf(el); if(!k) return;
      let a=k==='bool'?'true/false':k==='number'?('number'+(el.min?(' min '+el.min):'')+(el.max?(' max '+el.max):'')):k==='text'?'text':optsOf(el).map(o=>o[0]===o[1]?o[0]:o[0]+'='+o[1].replace(/\s*\(\+?\$[^)]*\)/g,'')).join('; ');
      lines.push(id+' | '+lab+' | '+a); });
    ((typeof cfg.extraCatalog==='function'?cfg.extraCatalog():cfg.extraCatalog)||[]).forEach(l=>lines.push(l));
    return lines.join('\n');
  }
  function current(){ return FIELDS.map(([id])=>{ const el=$(id),k=kindOf(el); if(!k) return ''; return id+'='+(k==='bool'?el.checked:el.value); }).filter(Boolean).join(', '); }
  function norm(id,v){ const el=$(id),k=kindOf(el); if(!k) return null; v=String(v==null?'':v).trim(); if(k==='select'&&v.includes('=')) v=v.split('=')[0].trim();
    if(k==='bool'){ if(/^(true|yes|1|on|checked)$/i.test(v)) return true; if(/^(false|no|0|off)$/i.test(v)) return false; return null; }
    if(k==='number'){ const n=Number(v.replace(/[^0-9.\-]/g,'')); return isFinite(n)&&v!==''?n:null; }
    if(k==='select'){ const o=optsOf(el), lv=v.toLowerCase(); const m=o.find(x=>x[0].toLowerCase()===lv)||o.find(x=>x[1].toLowerCase()===lv)||o.find(x=>x[1].toLowerCase().replace(/,\s*il$/,'')===lv)||o.find(x=>x[1].toLowerCase().replace(/\s*\(.*\)\s*$/,'')===lv); if(m) return m[0]; const fz=fuzzyOpt(el,v); return fz.one; }
    return v||null; }
  function plain(id,v){ const el=$(id),k=kindOf(el); if(k==='bool') return v?'Yes':'No'; if(k==='select'){ const o=optsOf(el).find(x=>x[0]===String(v)); return o?o[1]:v; } return String(v); }

  function apply(a){ // from set_estimate_fields
    let pre=[]; try{ pre=cfg.preApply?(cfg.preApply(a)||[]):[]; }catch(e){}
    refreshFields(); const ambig=[]; const noteTxt=String(a.notes||window._agbLastNote||'').toLowerCase();
    if(a.notes) addNote(a.notes,a.notes);
    const asked=new Set((a.questions||[]).map(q=>q&&q.fieldId));
    (a.fields||[]).forEach(f=>{ if(f&&f.id==='additionalEstimateNotes'&&a.notes) return; if(f&&f.id!=='additionalEstimateNotes'&&noteTxt&&f.heard&&noteTxt.includes(String(f.heard).toLowerCase().trim())) return; if(asked.has(f.id)&&(/^(none|)$/i.test(String(f.value||'').trim())||!(cfg.keepAsked||[]).includes(f.id))){ const pv=norm(f.id,f.value); if(pv!==null&&!/^(none|)$/i.test(String(f.value||'').trim())) pending[f.id]=pv; return; } if(cfg.guard&&cfg.guard(f,a)===false) return;
      const v=norm(f.id,f.value); if(v===null){ const el=$(f.id); if(el&&kindOf(el)==='select'){ const fz=fuzzyOpt(el,f.value); if(fz.many.length>1){ ambig.push({fieldId:f.id,question:'Which '+String(LABEL[f.id]||f.id).replace(/\s*\(.*$/,'').toLowerCase()+' — '+fz.many.slice(0,8).map(x=>x[1].replace(/\s*\(\+?\$[^)]*\)/g,'')).join(', ')+'?',options:fz.many.slice(0,9).map(x=>x[1])}); return; } } if(f.id) unknown.push(f.id+': '+f.value); return; } props[f.id]={v,on:true,heard:f.heard||'',orig:v}; });
    if(Array.isArray(a.side_doors)) doors={list:a.side_doors.filter(d=>d&&d.type&&d.wall),on:true};
    if(Array.isArray(a.questions)||ambig.length) questions=(a.questions||[]).filter(q=>q&&q.question).map(q=>({fieldId:q.fieldId,question:q.question,options:(q.options||[]).slice(0,9)})).concat(ambig.filter(x=>!(a.questions||[]).some(q=>q&&q.fieldId===x.fieldId)));
    pre.forEach(q=>{ questions=questions.filter(x=>x.fieldId!==q.fieldId); questions.push(q); });
    a._ambig=ambig;
    (a.unknownPhrases||[]).forEach(p=>unknown.push(p));
    // answered questions drop off
    questions=questions.filter(q=>asked.has(q.fieldId)||!(props[q.fieldId]&&a.fields&&a.fields.some(f=>f.id===q.fieldId)));
    render();
  }
  function doorTxt(d){ return ({service:'Service door',french:'French doors',party:'Party door'}[d.type]||d.type)+' — '+d.wall+(d.style==='fullview'?' (full view)':''); }
  /* LIVE FILL: every understood value goes straight into the real calculator control (normal input/change events) so the
     price updates while he talks. prevVals keeps each control's value from before voice touched it, so unchecking reverts it. */
  let prevVals={}, doorsPrev=null, doorsApplied=false;
  function curVal(id){ const el=$(id); if(!el) return undefined; return kindOf(el)==='bool'?el.checked:el.value; }
  function commit(){ refreshFields(); let changed=false; Object.entries(cfg.linked||{}).forEach(([lead,deps])=>{ if(props[lead]) deps.forEach(d=>{ if(props[d]) props[d].on=props[lead].on; }); });
    FIELDS.forEach(([id])=>{ if(props[id]&&!(id in prevVals)) prevVals[id]=curVal(id); });
    FIELDS.forEach(([id])=>{ const p=props[id]; if(!p) return;
      const want=p.on?p.v:prevVals[id]; const before=curVal(id); setEl(id,want); if(String(curVal(id))!==String(before)) changed=true; });
    if(doors&&cfg.fillDoors){ const sj=$('sideDoorsJson'); if(doorsPrev===null) doorsPrev=sj?sj.value:'';
      if(doors.on&&!doorsApplied){ cfg.fillDoors(doors.list); doorsApplied=true; changed=true; }
      else if(!doors.on&&doorsApplied){ if(sj){ sj.value=doorsPrev; try{ agbDoorsToggle(); }catch(e){} } doorsApplied=false; changed=true; } }
    if(changed){ try{ cfg.afterFill&&cfg.afterFill(); }catch(e){} } try{ cfg.afterCommit&&cfg.afterCommit(props,doors); }catch(e){} }
  function render(){ commit();
    const ids=FIELDS.map(f=>f[0]).filter(id=>props[id]&&!(cfg.hideOnCard||[]).includes(id));
    $('agbvCard').hidden=!(ids.length||doors||questions.length||unknown.length||heardTxt);
    $('agbvItems').innerHTML=ids.map(id=>{ const p=props[id], el=$(id), k=kindOf(el);
      let ed=k==='select'?'<select data-ed="'+id+'">'+optsOf(el).map(o=>'<option value="'+esc(o[0])+'"'+(o[0]===String(p.v)?' selected':'')+'>'+esc(o[1])+'</option>').join('')+'</select>'
        :k==='bool'?'<select data-ed="'+id+'"><option value="true"'+(p.v?' selected':'')+'>Yes</option><option value="false"'+(!p.v?' selected':'')+'>No</option></select>'
        :'<input type="text" data-ed="'+id+'" value="'+esc(p.v)+'">';
      return '<label class="agbv-item"><input type="checkbox" data-on="'+id+'"'+(p.on?' checked':'')+'><span>'+esc((cfg.itemLabel&&cfg.itemLabel(id,p,prevVals[id]))||LABEL[id])+(p.heard?'<br><i style="color:#a1a1aa;font-size:11px">heard as “'+esc(p.heard)+'”</i>':'')+'</span>'+ed+'</label>'; }).join('')
      +(doors?'<label class="agbv-item"><input type="checkbox" data-on="__doors"'+(doors.on?' checked':'')+'><span>Side/rear doors</span><span>'+(doors.list.length?doors.list.map(doorTxt).map(esc).join('<br>'):'None')+'</span></label>':'');
    $('agbvQs').innerHTML=questions.map((q,i)=>'<div class="agbv-q">'+esc(q.question)+'<div class="opts">'+q.options.map((o,j)=>'<button type="button" data-q="'+i+'" data-o="'+j+'">'+esc(o)+'</button>').join('')+'</div></div>').join('');
    $('agbvUnknown').hidden=!unknown.length; $('agbvUnknown').textContent=unknown.length?'Not understood: '+unknown.join('; '):'';
    $('agbvItems').querySelectorAll('[data-on]').forEach(c=>c.onchange=()=>{ if(c.dataset.on==='__doors') doors.on=c.checked; else { const p=props[c.dataset.on]; p.on=c.checked; if(!c.checked) learn(c.dataset.on,p,'(not this)'); } render(); });
    $('agbvItems').querySelectorAll('[data-ed]').forEach(c=>c.onchange=()=>{ const v=norm(c.dataset.ed,c.value); if(v!==null){ const p=props[c.dataset.ed]; p.v=v; learn(c.dataset.ed,p,v); } });
    $('agbvQs').querySelectorAll('button').forEach(b=>b.onclick=()=>answer(Number(b.dataset.q),Number(b.dataset.o)));
  }
  /* LEARNING HOOK (sample): corrections stay on this device in localStorage 'agbVoiceLearned'. Record shape matches a
     future Supabase table (e.g. voice_learned_terms: heard, field_id, from_value, to_value, salesman, created_at) — no DB yet. */
  const LKEY='agbVoiceLearned:'+(cfg.page||'estimator');
  function learned(){ try{ return JSON.parse(localStorage.getItem(LKEY)||'[]'); }catch(e){ return []; } }
  function learn(id,p,to){ if(!p||String(p.orig)===String(to)) return; const a=learned();
    a.push({heard:p.heard||'',field_id:id,from_value:String(p.orig),to_value:String(to),salesman:($('salesman')||{}).value||'',created_at:new Date().toISOString()});
    try{ localStorage.setItem(LKEY,JSON.stringify(a.slice(-100))); }catch(e){} }
  function learnedText(){ return learned().filter(r=>r.heard).slice(-40).map(r=>'"'+r.heard+'" -> '+r.field_id+'='+r.to_value+(r.to_value==='(not this)'?' (do NOT map to '+r.from_value+')':'')).join('\n'); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function answer(i,j){ const q=questions[i]; if(!q) return; const o=q.options[j]; const v=norm(q.fieldId,o);
    questions.splice(i,1);
    if(v!==null){ props[q.fieldId]={v,on:true}; }
    if(live()) say(q.question+' Answer: '+o); else if(v===null) sendText(q.question+' '+o);
    render(); }
  function log(cls,t){ const L=$('agbvLog'); L.hidden=false; document.documentElement.classList.add('agbv-on'); const d=document.createElement('div'); d.className=cls; d.textContent=(cls==='u'?'You: ':'Helper: ')+t; L.appendChild(d); L.scrollTop=L.scrollHeight; }
  function status(t){ $('agbvStatus').textContent=t; }

  async function callFn(body){
    const sb=(typeof garageSb!=='undefined')?garageSb:null;
    if(sb&&sb.functions&&sb.functions.invoke){ const r=await sb.functions.invoke(FN,{body}); if(!r.error&&r.data) { if(r.data.error) throw new Error(r.data.error); return r.data; } }
    const headers={'Content-Type':'application/json',apikey:GARAGE_SB_KEY};
    try{ const s=await sb.auth.getSession(); const t=s&&s.data&&s.data.session&&s.data.session.access_token; if(t) headers.Authorization='Bearer '+t; }catch(e){}
    const r=await fetch(GARAGE_SB_URL+'/functions/v1/'+FN,{method:'POST',headers,body:JSON.stringify(body)}); const d=await r.json().catch(()=>({}));
    if(!r.ok||d.error) throw new Error(d.error||d.message||('HTTP '+r.status)); return d; }

  /* Spoken/typed garage size -> width/depth (width first). Works on transcripts, so a size always lands on the card. */
  const NUMW={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50};
  function words2num(t){ return String(t).toLowerCase().replace(/\b(twenty|thirty|forty|fifty)[\s-]+(one|two|three|four|five|six|seven|eight|nine)\b/g,(m,a,b)=>String(NUMW[a]+NUMW[b]))
      .replace(/\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty)\b/g,m=>String(NUMW[m])); }
  function parseDims(t){ const s=words2num(t).replace(/[′’']/g,' ').replace(/\b(feet|foot|ft)\b/g,' '); let m, r={};
    if((m=s.match(/\b(\d{2}(?:\.5)?)\s*(?:x|×|by|bye|buy|times)\s*(\d{2}(?:\.5)?)\b/))){ r.w=+m[1]; r.d=+m[2]; r.heard=m[0]; }
    else { if((m=s.match(/\b(\d{2}(?:\.5)?)\s*(?:wide|width|across)\b/))||(m=s.match(/\bwidth\s*(?:of|is)?\s*(\d{2}(?:\.5)?)\b/))){ r.w=+m[1]; r.heard=m[0]; }
      if((m=s.match(/\b(\d{2}(?:\.5)?)\s*(?:deep|depth|long)\b/))||(m=s.match(/\bdepth\s*(?:of|is)?\s*(\d{2}(?:\.5)?)\b/))){ r.d=+m[1]; r.heard=(r.heard?r.heard+', ':'')+m[0]; } }
    ['w','d'].forEach(k=>{ if(r[k]!=null&&(r[k]<8||r[k]>60)) delete r[k]; }); return (r.w!=null||r.d!=null)?r:null; }
  function setDim(id,cid,n,heard){ const el=$(id); if(!el) return; const opt=optsOf(el).some(o=>o[0]===String(n));
    if(opt){ props[id]={v:String(n),on:true,heard,orig:String(n)}; delete props[cid]; }
    else if($(cid)&&optsOf(el).some(o=>o[0]==='custom')){ props[id]={v:'custom',on:true,heard,orig:'custom'}; props[cid]={v:n,on:true,heard,orig:n}; } }
  function extraFromSpeech(t){ if(!cfg.extraParse) return false; const list=cfg.extraParse(t)||[]; list.forEach(f=>{ const v=norm(f.id,f.value); if(v!==null) props[f.id]={v,on:true,heard:f.heard||t,orig:v}; questions=questions.filter(q=>q.fieldId!==f.id); }); return list.length>0; }
  function dimsFromSpeech(t){ if(!cfg.dims) return false; const r=parseDims(t); if(!r) return false; const [W,D,CW,CD]=cfg.dims;
    if(r.w!=null) setDim(W,CW,r.w,r.heard); if(r.d!=null) setDim(D,CD,r.d,r.heard);
    questions=questions.filter(q=>!((r.w!=null&&(q.fieldId===W||q.fieldId===CW))||(r.d!=null&&(q.fieldId===D||q.fieldId===CD))));
    delete pending[W]; delete pending[D]; return true; }
  let pending={}, heardTxt='';
  function heard(t){ heardTxt=t; let h=$('agbvHeard'); if(!h){ h=document.createElement('div'); h.id='agbvHeard'; h.className='agbv-heard'; $('agbvCard').insertBefore(h,$('agbvCard').firstChild); }
    h.textContent='What I heard: “'+t+'”'; }
  function voicedYes(t){ if(!/^\s*(yes|yeah|yep|yup|correct|right|that'?s right|sure|ok(ay)?|confirm(ed)?)\b/i.test(t)) return false;
    const q=questions[0]; if(!q) return false; let v=pending[q.fieldId]; if(v==null&&props[q.fieldId]) v=props[q.fieldId].v;
    if(v==null){ const o=(q.options||[]).find(x=>!/^(no|yes)$/i.test(x)&&norm(q.fieldId,x)!==null); if(o) v=norm(q.fieldId,o); }
    if(v==null) return false; props[q.fieldId]=Object.assign(props[q.fieldId]||{orig:v},{v,on:true,heard:t}); delete pending[q.fieldId]; questions.shift(); return true; }
  /* iPhone Safari: unlock playback inside the tap, keep the element in the DOM, ask for play-and-record routing (speaker). */
  const SILENT='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
  let actx=null, aiTalking=false, playChk=null, stillAsked=false, userAct=0;
  function unlockAudio(){
    try{ if(navigator.audioSession) navigator.audioSession.type='play-and-record'; }catch(e){}
    if(!audio){ audio=document.createElement('audio'); audio.id='agbvAudio'; audio.style.cssText='position:absolute;width:1px;height:1px;opacity:0;pointer-events:none'; document.body.appendChild(audio); }
    audio.autoplay=true; audio.muted=false; audio.volume=1; audio.setAttribute('playsinline',''); audio.setAttribute('webkit-playsinline','');
    try{ audio.srcObject=null; audio.src=SILENT; audio.play().catch(()=>{}); }catch(e){}
    try{ const AC=window.AudioContext||window.webkitAudioContext; if(AC){ actx=actx||new AC(); actx.resume&&actx.resume(); const b=actx.createBuffer(1,1,22050), src=actx.createBufferSource(); src.buffer=b; src.connect(actx.destination); src.start(0); } }catch(e){}
  }
  function playRemote(stream){ try{ audio.removeAttribute('src'); }catch(e){} audio.srcObject=stream; audio.muted=false; const p=audio.play(); if(p&&p.catch) p.catch(()=>soundWarn()); }
  function soundWarn(){ let w=$('agbvSoundWarn'); if(!w){ w=document.createElement('button'); w.type='button'; w.id='agbvSoundWarn'; w.className='agbv-warn';
      w.onclick=()=>{ unlockAudio(); if(pc){ const r=pc.getReceivers().find(x=>x.track&&x.track.kind==='audio'); if(r) playRemote(new MediaStream([r.track])); } w.hidden=true; };
      $('agbvSay').after(w); }
    w.textContent="Can't play sound — check volume / Silent switch, then tap here. (You can still read what the helper says above.)"; w.hidden=false; }
  function sayLine(txt,final){ const el=$('agbvSay'); if(!el) return; el.hidden=false; document.documentElement.classList.add('agbv-on'); $('agbvSayTxt').textContent=txt; el.scrollTop=el.scrollHeight; }
  function setTalking(on){ if(aiTalking&&!on) aiStopAt=Date.now(); aiTalking=on; const el=$('agbvSay'); if(el) el.classList.toggle('talking',on);
    if(live()) status(on?'AI talking… (just keep talking to interrupt)':'Listening…');
    if(on){ clearTimeout(playChk); const t0a=audio?audio.currentTime:0; playChk=setTimeout(()=>{ if(aiTalking&&audio&&(audio.paused||audio.currentTime<=t0a)) soundWarn(); else { const w=$('agbvSoundWarn'); if(w) w.hidden=true; } window.agbVoiceAudio={paused:audio.paused,currentTime:audio.currentTime,start:t0a}; },1500); } }
  function ensureSayUI(){ if($('agbvSay')) return; const d=document.createElement('div'); d.id='agbvSay'; d.className='agbv-say'; d.hidden=true;
    d.innerHTML='<span class="agbv-eq"><i></i><i></i><i></i></span><span><b>AI:</b> <span id="agbvSayTxt"></span></span>'; $('agbvStatus').after(d); }
  let lastBd='', bdT=null;
  function pushBreakdown(){ if(!live()||!cfg.breakdown){ clearInterval(bdT); return; } const b=cfg.breakdown(); if(!b||b===lastBd) return; lastBd=b; send({type:'conversation.item.create',item:{type:'message',role:'system',content:[{type:'input_text',text:'CURRENT ESTIMATE (replaces earlier): '+b}]}}); }
  function live(){ return !!(dc&&dc.readyState==='open'); }
  function send(o){ if(live()) dc.send(JSON.stringify(o)); }
  function say(text){ send({type:'conversation.item.create',item:{type:'message',role:'user',content:[{type:'input_text',text}]}}); send({type:'response.create'}); lastAct=Date.now(); }

  async function start(){
    if(!navigator.mediaDevices||!window.RTCPeerConnection){ status('Live voice is not supported in this browser — type the job below.'); return; }
    $('agbvMic').disabled=true; status('Listening…');
    unlockAudio(); // must run inside the Talk tap (iPhone)
    try{
      mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:false,channelCount:1}});
      const tok=await callFn({mode:'realtime',page:cfg.page||'',catalog:catalog(),current:current(),knowledge:(cfg.knowledgePack?cfg.knowledgePack():''),breakdown:(cfg.breakdown?cfg.breakdown():''),learned:learnedText()});
      pc=new RTCPeerConnection();
      pc.ontrack=e=>{ playRemote(e.streams[0]||new MediaStream([e.track])); };
      pc.addTrack(mic.getTracks()[0],mic);
      dc=pc.createDataChannel('oai-events'); dc.onmessage=e=>{ try{ onEvent(JSON.parse(e.data)); }catch(x){} };
      dc.onopen=()=>{ lastBd=cfg.breakdown?cfg.breakdown():''; clearInterval(bdT); bdT=setInterval(pushBreakdown,2500); ensureSayUI(); status('Listening…'); heardSpeech=false; stillAsked=false; userAct=Date.now(); /* silent start: no greeting, no response.create */
        if(Object.keys(props).length) send({type:'conversation.item.create',item:{type:'message',role:'user',content:[{type:'input_text',text:'(Context, do not reply: already set '+JSON.stringify(Object.fromEntries(Object.entries(props).map(([k,p])=>[k,p.v])))+')'}]}});
        setTimeout(()=>{ if(live()&&!heardSpeech) status('Listening… (not hearing anything yet — check mic permission: aA → Website Settings → Microphone)'); },15000); };
      pc.onconnectionstatechange=()=>{ const st=pc&&pc.connectionState; if(st==='failed'||st==='closed') stop('Voice ended (connection lost). Tap Talk to keep going — the list is kept.'); else if(st==='disconnected') setTimeout(()=>{ if(pc&&pc.connectionState==='disconnected') stop('Voice ended (connection lost). Tap Talk to keep going — the list is kept.'); },10000); };
      const offer=await pc.createOffer(); await pc.setLocalDescription(offer);
      const r=await fetch('https://api.openai.com/v1/realtime/calls',{method:'POST',body:offer.sdp,headers:{Authorization:'Bearer '+tok.value,'Content-Type':'application/sdp'}});
      if(!r.ok) throw new Error('Voice connect failed ('+r.status+')');
      await pc.setRemoteDescription({type:'answer',sdp:await r.text()});
      usage.sessions++; t0=lastAct=Date.now(); $('agbvMic').classList.add('live'); $('agbvMicTxt').textContent='End conversation'; $('agbvTimer').hidden=false; userAct=Date.now();
      tick=setInterval(timer,1000); timer();
    }catch(e){ stop(); status('Voice did not start ('+(e.message||e)+'). Type the job below instead.'); }
    finally{ $('agbvMic').disabled=false; }
  }
  function timer(){ const s=Math.floor((Date.now()-t0)/1000), idle=aiTalking?0:(Date.now()-userAct)/1000;
    $('agbvTimer').textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
    if(s>=MAX_TOTAL) stop('Voice ended (15 min safety limit). Tap Talk to keep going — the list is kept.');
    else if(idle>MAX_IDLE) stop('Voice ended after 2 minutes of silence. Tap Talk to keep going — the list is kept.');
    else if(idle>STILL_THERE&&!stillAsked){ stillAsked=true; status('Still there? (voice ends after 2 min of quiet)'); } }
  let lastUserTxt='', aiStopAt=0, lastAiTxt='';
  /* BARGE-IN FIX (2026-10-31): the AI's own voice leaking into the mic was transcribed as a sentence and cancelled the reply.
     Echo = most words of the transcript are words the AI is saying / just said; ignored. Only a real user sentence cuts it off. */
  const ewords=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(w=>w.length>1);
  function isEcho(t){ if(!aiTalking&&Date.now()-aiStopAt>2500) return false; const w=ewords(t); if(!w.length) return true; const ref=new Set(ewords((sayBuf||'')+' '+lastAiTxt)); if(!ref.size) return false;
    return w.filter(x=>ref.has(x)).length/w.length>=0.6; }
  function bargeOk(t){ if(isEcho(t)) return false; const w=ewords(t).filter(x=>!/^(uh+|um+|mm+|hmm+|ah+|oh+|ok|okay|yeah|yep|yes|no|huh|right|sure|thanks|thank|you|bye|so|well|like)$/.test(x)); return w.length>=3||w.some(x=>/\d/.test(x)); }
  /* Background noise often transcribes as nothing, a filler ("uh", "mm"), or a stock phrase ("Thank you.", "Bye.") — never act on those. */
  let aiAskedAt=0;
  /* Noise/filler never interrupts the AI. While it talks, only a real utterance (2+ words or a number) counts.
     Short "yes/okay/no" count only as an answer after the AI (or the card) asked something and the AI has finished. */
  function realSpeech(t){ const s=String(t||'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim(); if(!s) return false;
    const words=s.split(' '), noise=/^((uh+|um+|mm+|hmm+|ah+|oh+|huh|you|bye|thank you|thanks|thanks for watching)\s*)+$/.test(s),
      short=/^((yes|yeah|yep|no|nope|okay|ok|sure|right|correct)\s*)+$/.test(s);
    if(noise) return false;
    if(aiTalking&&(short||(words.length<2&&!/\d/.test(s)))) return false;
    if(short&&!((questions||[]).length||Date.now()-aiAskedAt<30000)) return false;
    lastUserTxt=t; window._agbLastUtter=t; heardSpeech=true; return true; }
  /* Local safety-net parsing of one utterance: open card questions, note text (kept apart so it never sets fields),
     spoken sizes, contact info, price phrases. The AI's set_estimate_fields stays primary. */
  function localParse(txt,dims){ const ns=cfg.splitNote?cfg.splitNote(txt):null; window._agbLastNote=ns&&ns.note?ns.note:''; const body=ns?ns.before:txt;
    answerFromSpeech(body); if(dims!==false) dimsFromSpeech(body); extraFromSpeech(body); if(ns&&ns.note) addNote(ns.note,ns.heard); }
  function addNote(n,h){ const f={id:'additionalEstimateNotes',value:String(n||'').trim(),heard:h||n}; if(!f.value||!$(f.id)) return; if(cfg.guard&&cfg.guard(f,{})===false) return; props[f.id]={v:f.value,on:true,heard:f.heard,orig:f.value}; }
  function answerFromSpeech(t){ const N=x=>String(x||'').toLowerCase().replace(/\(\+?\$[^)]*\)/g,'').replace(/\bby\b/g,'x').replace(/[^a-z0-9]/g,''); const T=N(t); if(!T) return;
    for(let i=questions.length-1;i>=0;i--){ const q=questions[i]; if(!q.fieldId||!q.options||!q.options.length) continue; const hit=q.options.map((o,j)=>[N(o),j]).filter(([o])=>o&&T.includes(o)); if(hit.length===1) answer(i,hit[0][1]); } }
  function stop(msg){ clearInterval(tick); tick=null; window.agbVoiceDebug={heardSpeech,heard:heardTxt,at:new Date().toISOString()};
    try{ dc&&dc.close(); }catch(e){} try{ pc&&pc.close(); }catch(e){} try{ mic&&mic.getTracks().forEach(t=>t.stop()); }catch(e){}
    dc=pc=mic=null; aiTalking=false; clearTimeout(playChk); const sy=$('agbvSay'); if(sy) sy.classList.remove('talking'); $('agbvMic').classList.remove('live'); $('agbvMicTxt').textContent='Talk with the helper'; $('agbvTimer').hidden=true;
    if(msg) status(msg); }
  function onEvent(ev){
    const t=ev.type;
    if(t==='input_audio_buffer.speech_started'){ if(!aiTalking) status('Hearing you…'); }
    else if(t==='output_audio_buffer.started'||t==='response.output_audio.delta'&&!aiTalking) setTalking(true);
    else if(t==='output_audio_buffer.stopped'||t==='output_audio_buffer.cleared') setTalking(false);
    else if(t==='response.output_audio_transcript.delta'&&ev.delta){ if(!sayBuf||sayNew){ sayBuf=''; sayNew=false; } sayBuf+=ev.delta; sayLine(sayBuf); }
    else if(t==='input_audio_buffer.speech_stopped'){ if(!aiTalking) status('Listening…'); }
    else if(t==='conversation.item.input_audio_transcription.completed'&&ev.transcript) { if(isEcho(ev.transcript)){ window.agbEchoIgnored=(window.agbEchoIgnored||0)+1; return; } if(!realSpeech(ev.transcript)) return; if(aiTalking&&!bargeOk(ev.transcript)) return; lastAct=userAct=Date.now(); stillAsked=false; if(aiTalking){ send({type:'response.cancel'}); send({type:'output_audio_buffer.clear'}); setTalking(false); } send({type:'response.create'}); status('Listening… (updating estimate)'); log('u',ev.transcript); lastAct=Date.now(); heardSpeech=true; heard(ev.transcript); voicedYes(ev.transcript); localParse(ev.transcript); render(); }
    else if(t==='conversation.item.input_audio_transcription.failed'){ /* usually noise: ignore quietly */ }
    else if(t==='response.output_audio_transcript.done'&&ev.transcript){ lastAiTxt=ev.transcript; if(/\?\s*$/.test(ev.transcript)) aiAskedAt=Date.now(); log('a',ev.transcript); sayLine(ev.transcript,true); sayNew=true; }
    else if(t==='response.function_call_arguments.done'){
      let a={}; try{ a=JSON.parse(ev.arguments||'{}'); }catch(e){}
      if(ev.name==='get_price_info'||ev.name==='get_city_info'||ev.name==='web_lookup'||ev.name==='search_page_info'){ status(ev.name==='web_lookup'?'Looking that up…':'Checking…');
        const reply=r=>{ send({type:'conversation.item.create',item:{type:'function_call_output',call_id:ev.call_id,output:JSON.stringify(r).slice(0,3000)}}); send({type:'response.create'}); };
        Promise.resolve().then(()=>ev.name==='get_price_info'?(cfg.priceInfo?cfg.priceInfo(a):{error:'no pricing on this page'}):ev.name==='get_city_info'?(cfg.cityInfo?cfg.cityInfo(a.city):{error:'no city data'}):ev.name==='search_page_info'?(cfg.searchInfo?cfg.searchInfo(a.query):{error:'no page search'}):callFn({mode:'web',question:a.question}).then(d=>({answer:d.answer,source:'web (general info)'})))
          .catch(e=>({error:String(e.message||e)})).then(reply); return; }
      if(ev.name==='get_job_status'){ status('Looking up job…'); jobStatus(a.query,a.search).catch(e=>({error:String(e.message||e)})).then(r=>{ send({type:'conversation.item.create',item:{type:'function_call_output',call_id:ev.call_id,output:JSON.stringify(r).slice(0,4000)}}); send({type:'response.create'}); status('Listening…'); }); return; }
      if(ev.name==='finish_estimate'&&!/\b(done|that'?s (it|all)|that is (it|all)|finished|all set|we'?re good|end (it|the conversation)|stop)\b/i.test(lastUserTxt)){ send({type:'conversation.item.create',item:{type:'function_call_output',call_id:ev.call_id,output:'He did not say he is done. Keep listening silently.'}}); return; }
      if(ev.name==='finish_estimate'){ send({type:'conversation.item.create',item:{type:'function_call_output',call_id:ev.call_id,output:'all set; everything is already on the estimate'}}); setTimeout(()=>stop('All set — everything you said is on the estimate. Fix anything in the list below, or tap Talk to add more.'),2500); return; }
      apply(a); const needQ=(a.questions||[]).length>0||(a.unknownPhrases||[]).length>0||(a._ambig||[]).length>0;
      send({type:'conversation.item.create',item:{type:'function_call_output',call_id:ev.call_id,output:needQ?('set; now ask your one short question out loud'+((a._ambig||[]).length?(': '+a._ambig.map(x=>x.question).join(' ')):'')):'set on the estimate; stay silent'}});
      if(needQ) send({type:'response.create'}); /* otherwise stay silent and keep listening */
    }
    if(t==='response.done'&&ev.response&&ev.response.status&&ev.response.status!=='completed'){ window.agbVoiceLastBad=ev.response.status_details; status('Helper reply was cut off ('+ev.response.status+') — say it again or type it.'); }
    else if(t==='response.done'&&ev.response&&ev.response.usage){ const u=ev.response.usage, i=u.input_token_details||{}, o=u.output_token_details||{}, c=i.cached_tokens_details||{};
      usage.in_audio+=(i.audio_tokens||0); usage.in_text+=(i.text_tokens||0); usage.in_cached_audio=(usage.in_cached_audio||0)+(c.audio_tokens||0); usage.in_cached_text=(usage.in_cached_text||0)+(c.text_tokens||0);
      usage.out_audio+=(o.audio_tokens||0); usage.out_text+=(o.text_tokens||0); usage.cost=cost(); window.agbVoiceUsage=usage; }
    else if(t==='error') status('Voice error: '+((ev.error&&ev.error.message)||''));
  }
  function cost(){ const u=usage, ca=u.in_cached_audio||0, ct=u.in_cached_text||0; // gpt-realtime-2.1-mini $/1M
    return ((u.in_audio-ca)*10+ca*0.3+(u.in_text-ct)*0.6+ct*0.06+u.out_audio*20+u.out_text*2.4)/1e6; }


  /* READ-ONLY job status. Mirrors the dashboard/RLS rule: owner & business_manager see all jobs; everyone else only rows
     where jobs.salesman_username = their staff_profiles.username. Filter is applied in the query (RLS "authorized read jobs"
     enforces the same on the server). JOB_SCOPE is the hook to change the rule later. No writes. */
  const JOB_SCOPE=me=>['owner','business_manager'].includes(me.role)?null:me.username;
  /* shared search (voice-jobsearch.js): fuzzy/phonetic names, street/house no./city, status filters, OPEN jobs by default */
  function needSearchLib(){ if(window.AGBJobSearch) return Promise.resolve(); return new Promise(res=>{ let sc=document.getElementById('agbJobSearchJs');
    if(!sc){ sc=document.createElement('script'); sc.id='agbJobSearchJs'; sc.src='voice-jobsearch.js?v=20261031b'; document.head.appendChild(sc); }
    sc.addEventListener('load',()=>res()); sc.addEventListener('error',()=>res()); setTimeout(res,4000); }); }
  needSearchLib();
  async function jobStatus(q,srch){
    const sb=(typeof garageSb!=='undefined')?garageSb:null; if(!sb||!sb.auth) return {error:'database not available'};
    const {data:{user}={}}=await sb.auth.getUser(); if(!user) return {error:'salesman is not signed in'};
    const {data:me}=await sb.from('staff_profiles').select('username,role').eq('id',user.id).maybeSingle(); if(!me||!me.username) return {error:'no staff profile'};
    await needSearchLib(); if(!window.AGBJobSearch) return {error:'search not loaded'};
    let qy=sb.from('jobs').select('*').is('deleted_at',null).order('sold_date',{ascending:false}).limit(1500);
    const scope=JOB_SCOPE(me); if(scope) qy=qy.eq('salesman_username',scope); /* scope in the query + RLS */
    const {data:all,error}=await qy; if(error) return {error:error.message};
    const r=AGBJobSearch.search(all||[],Object.assign({},srch&&typeof srch==='object'?srch:{},{query:String(q||'').slice(0,120)}));
    if(!r.jobs.length) return {found:0,say:r.say,did_you_mean:[...r.close,...(r.closedMatches||[])].map(AGBJobSearch.label)};
    if(r.jobs.length>1) return {found:r.jobs.length,say:r.say,matches:r.jobs.map(AGBJobSearch.label)};
    const j=r.jobs[0]; const ids=[j.id];
    const [{data:ca},{data:act},{data:docs}]=await Promise.all([
      sb.from('crew_assignments').select('stage,crew,sched_date,show_up_time,notes').in('job_id',ids).order('sched_date',{ascending:true}).limit(10),
      sb.from('job_activity').select('action,created_at').in('job_id',ids).order('created_at',{ascending:false}).limit(5),
      sb.from('job_documents').select('doc_type,file_name').in('job_id',ids).limit(20)]);
    let est=null, how='';
    try{ const cols='id,customer,address,city,garage_size,roof_type,wall_height,siding,estimate_price,created_at,calc:estimate_snapshot->calculator_state,sold:estimate_snapshot->sold,enotes:estimate_snapshot->notes,fpp:estimate_snapshot->final_project_price,sjob:estimate_snapshot->job_id';
      const link=(String(j.notes||'').match(/\[AGB-ESTLINK:([^\]\s]+)\]/)||[])[1];
      if(link){ const {data}=await sb.from('estimate_history').select(cols).eq('id',link).maybeSingle(); if(data){ est=data; how='linked to this job'; } }
      if(!est){ const last=String(j.customer||'').trim().split(/\s+/).pop(); if(last&&last.length>1){ const {data}=await sb.from('estimate_history').select(cols).ilike('customer','%'+last.replace(/[%,()*\\]/g,'')+'%').order('created_at',{ascending:false}).limit(10);
        const N=AGBJobSearch.norm; const num=x=>(N(x).match(/\d+/)||[''])[0];
        const byJob=(data||[]).find(e=>String(e.sjob||(e.sold&&e.sold.job_id)||'')===String(j.id));
        const byAddr=(data||[]).find(e=>num(e.address)&&num(e.address)===num(j.address));
        if(byJob){ est=byJob; how='linked to this job'; } else if(byAddr){ est=byAddr; how='same customer name and house number'; } } } }catch(e){}
    if(est) est.estimate_snapshot={calculator_state:est.calc||{},sold:est.sold||null,notes:est.enotes||'',final_project_price:est.fpp||null};
    const rec=AGBJobSearch.describe(j,{crews:ca||[],docs:(docs||[]).map(d=>[d.doc_type,d.file_name].filter(Boolean).join(': ')),activity:(act||[]).map(a=>String(a.created_at||'').slice(0,10)+' '+a.action),estimate:est?AGBJobSearch.estimate(est,how):''});
    return {found:1,today:new Date().toISOString().slice(0,10),say:r.say,record:rec};
  }
  async function sendText(txt){
    txt=txt||$('agbvText').value.trim(); if(!txt) return; $('agbvText').value='';
    if(live()){ log('u',txt); heard(txt); voicedYes(txt); localParse(txt); render(); say(txt); return; }
    status('Reading…');
    window._agbLastUtter=txt;
    try{ const d=await callFn({mode:'text',page:cfg.page||'',catalog:catalog(),current:current(),knowledge:(cfg.knowledgePack?cfg.knowledgePack():''),breakdown:(cfg.breakdown?cfg.breakdown():''),learned:learnedText(),transcript:txt}); window.agbVoiceLastText=d; heard(txt); voicedYes(txt); const ns0=cfg.splitNote?cfg.splitNote(txt):null; window._agbLastNote=(d.notes||(ns0&&ns0.note)||''); apply(d); const W=(cfg.dims||[])[0]; const hadNote=!!d.notes; localParse(txt,!(d.fields||[]).some(f=>f.id===W)); if(hadNote&&ns0&&ns0.note&&props.additionalEstimateNotes){}  answerTyped(d); render(); status(questions.length?'Answer the questions below — everything else is already on the estimate.':'Set on the estimate — uncheck anything that is wrong.'); }
    catch(e){ status('Could not read that ('+(e.message||e)+').'); }
  }
  async function answerTyped(d){ if(!d) return; let parts=[];
    if(d.price_check&&cfg.priceInfo){ const r=cfg.priceInfo(d.price_check); window.agbVoicePrice=r; parts.push(r.error?r.error:r.difference_text!=null?(r.difference_text):('Current project price '+r.project_price_text)); }
    if(d.city_check&&cfg.cityInfo){ const r=cfg.cityInfo(d.city_check); window.agbVoiceCity=r; parts.push(r.error||((r.notes||'')+(r.code_year?' Code year '+r.code_year+'.':'')).slice(0,400)); }
    if(d.answer) parts.push(d.answer);
    if(d.web_query){ try{ const w=await callFn({mode:'web',question:d.web_query}); window.agbVoiceWeb=w; if(w.answer) parts.push('General info: '+w.answer); }catch(e){ parts.push('Web lookup failed.'); } }
    if(parts.length){ ensureSayUI(); sayLine(parts.join(' ')); window.agbVoiceAnswer=parts.join(' '); } }
  function setEl(id,v){ const el=$(id); if(!el) return; const k=kindOf(el);
    if(k==='bool'){ if(el.checked===!!v) return; el.checked=!!v; } else { if(String(el.value)===String(v)) return; el.value=String(v); }
    el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); }
  function reset(){ props={}; doors=null; questions=[]; unknown=[]; pending={}; heardTxt=''; prevVals={}; doorsPrev=null; doorsApplied=false; const h=$('agbvHeard'); if(h) h.remove(); render(); }
  function fill(){ /* "Done": values are already on the estimate; just close the list */ if(live()) stop('Done — everything is on the estimate.'); else status('Done — everything is on the estimate.'); reset(); }
  function clear(){ /* "Undo all": revert every control voice changed */ Object.keys(props).forEach(id=>props[id].on=false); if(doors) doors.on=false; commit(); status('Undid everything voice set.'); reset(); }
  return {toggle:()=>live()||pc?stop('Voice stopped.'):start(), sendText, fill, clear, catalog, _apply:apply, learned, _jobStatus:jobStatus, _state:()=>({props,doors,questions,unknown}), usage:()=>usage, /* offline test hook: fake data channel, feed events */ _pushBreakdown:pushBreakdown, _priceInfo:q=>cfg.priceInfo?cfg.priceInfo(q):null, _sim:()=>{ window.agbVoiceSent=[]; dc={readyState:'open',send:m=>window.agbVoiceSent.push(JSON.parse(m)),close(){}}; return onEvent; }};
}};
