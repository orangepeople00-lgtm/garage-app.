/* Estimate sheet print/PDF fit v4: capture the designed 8.5x11 professional
   letter sheet (footer and full bottom bar included) and place that exact
   page on Letter paper inside a 0.5in safe inset so printers cannot clip
   the border or footer wording. Do not reflow or restyle the sheet. */
(function(global){
  var SAFE_MARGIN = 0.5; // inches
  var AGB_SHEET_FIT_V = '4';

  function pageSize(){
    var landscape=false;
    try{
      var sh=document.querySelector('.sheet');
      if(sh){
        var cs=getComputedStyle(sh);
        landscape=(parseFloat(cs.width)||0) > (parseFloat(cs.height)||0)+20;
      }
    }catch(_){}
    return landscape ? {w:11,h:8.5,orient:'landscape'} : {w:8.5,h:11,orient:'portrait'};
  }

  function pxPerIn(doc){
    doc=doc||document;
    var d=doc.createElement('div');
    d.style.cssText='position:absolute;left:-9999px;top:0;width:1in;height:1in;margin:0;padding:0;border:0;';
    (doc.body||doc.documentElement).appendChild(d);
    var n=d.getBoundingClientRect().width;
    d.parentNode.removeChild(d);
    return (n>0)?n:96;
  }

  /* Keep the designed letter page: fixed size, footer pinned to the bottom. */
  function designCss(pg){
    return (
      'html,body{margin:0!important;padding:0!important;width:'+pg.w+'in!important;height:'+pg.h+'in!important;min-height:'+pg.h+'in!important;max-height:'+pg.h+'in!important;overflow:hidden!important;background:#fff!important;}'+
      '.sheet,#pdfExportSheet{width:'+pg.w+'in!important;min-width:'+pg.w+'in!important;max-width:'+pg.w+'in!important;height:'+pg.h+'in!important;min-height:'+pg.h+'in!important;max-height:'+pg.h+'in!important;margin:0!important;transform:none!important;box-shadow:none!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;}'+
      '.footer{margin-top:auto!important;flex:0 0 auto!important;position:relative!important;top:auto!important;bottom:auto!important;display:flex!important;}'+
      '.actions,.estimate-assistant,.no-print,.noprint,.sheet-ai-panel{display:none!important;}'
    );
  }

  function applyDesign(doc, pg){
    if(!doc) return;
    var st=doc.getElementById('agbPdfDesign');
    if(!st){
      st=doc.createElement('style');
      st.id='agbPdfDesign';
      (doc.head||doc.documentElement).appendChild(st);
    }
    st.textContent=designCss(pg);
  }

  function installPrintCss(doc){
    doc=doc||document;
    var st=doc.getElementById('agbSheetPrintFit');
    if(!st){
      st=doc.createElement('style');
      st.id='agbSheetPrintFit';
      (doc.head||doc.documentElement).appendChild(st);
    }
    var fit=Math.min((8.5-2*SAFE_MARGIN)/8.5, (11-2*SAFE_MARGIN)/11, 1);
    var pg=pageSize();
    fit=Math.min((pg.w-2*SAFE_MARGIN)/pg.w, (pg.h-2*SAFE_MARGIN)/pg.h, 1);
    st.textContent=
      '@page{size:Letter;margin:0 !important;}'+
      '@media print{'+
        'html,body,html body{width:'+pg.w+'in!important;height:'+pg.h+'in!important;min-height:0!important;max-height:none!important;margin:0!important;padding:0!important;overflow:hidden!important;background:#fff!important;}'+
        '#agbPrintFitWrap{display:block;margin:0 auto;background:#fff;overflow:hidden;width:'+pg.w+'in;height:'+pg.h+'in;page-break-inside:avoid!important;break-inside:avoid!important;}'+
        'html body .sheet,.sheet,html body #agbPrintFitWrap .sheet{'+
          'width:'+pg.w+'in!important;height:'+pg.h+'in!important;min-height:'+pg.h+'in!important;max-height:'+pg.h+'in!important;'+
          'overflow:hidden!important;margin:0!important;'+
          'position:absolute!important;top:0!important;left:0!important;'+
          'transform-origin:top left!important;'+
          'transform:translate('+SAFE_MARGIN+'in,'+SAFE_MARGIN+'in) scale('+fit+') !important;'+
        '}'+
        '.footer{margin-top:auto!important;flex:0 0 auto!important;overflow:visible!important;}'+
        '.actions,.estimate-assistant,.no-print,.sheet-ai-panel{display:none!important;}'+
      '}';
  }

  function unwrapPrintFit(){
    var wrap=document.getElementById('agbPrintFitWrap');
    var sheet=document.querySelector('.sheet');
    if(wrap && sheet && wrap.contains(sheet) && wrap.parentNode){
      wrap.parentNode.insertBefore(sheet, wrap);
      wrap.parentNode.removeChild(wrap);
    }
  }

  function clearSheetPrintScale(){
    unwrapPrintFit();
    var sheet=document.querySelector('.sheet');
    if(!sheet) return;
    sheet.style.transform='';
    sheet.style.transformOrigin='';
    sheet.style.marginBottom='';
    sheet.style.marginRight='';
    sheet.style.position='';
    try{ sheet.style.zoom=''; }catch(_){}
  }

  function restoreDesignSize(sheet, pg){
    sheet.style.setProperty('width',pg.w+'in','important');
    sheet.style.setProperty('height',pg.h+'in','important');
    sheet.style.setProperty('min-height',pg.h+'in','important');
    sheet.style.setProperty('max-height',pg.h+'in','important');
    sheet.style.setProperty('overflow','hidden','important');
    sheet.style.setProperty('margin','0','important');
    sheet.style.transform='';
    try{ sheet.style.zoom=''; }catch(_){}
    var footer=sheet.querySelector('.footer');
    if(footer){
      footer.style.setProperty('margin-top','auto','important');
      footer.style.setProperty('flex','0 0 auto','important');
      footer.style.setProperty('position','relative','important');
      footer.style.setProperty('display','flex','important');
    }
    void sheet.offsetHeight;
  }

  function fitSheetToOnePrintedPage(){
    var sheet=document.querySelector('.sheet');
    if(!sheet) return;
    clearSheetPrintScale();
    installPrintCss(document);
    var pg=pageSize();
    applyDesign(document, pg);
    restoreDesignSize(sheet, pg);
    try{ if(typeof global.agbFitNoPhotoNotes==='function') global.agbFitNoPhotoNotes(document); }catch(_){}
    var fit=Math.min((pg.w-2*SAFE_MARGIN)/pg.w, (pg.h-2*SAFE_MARGIN)/pg.h, 1);
    var wrap=document.createElement('div');
    wrap.id='agbPrintFitWrap';
    sheet.parentNode.insertBefore(wrap, sheet);
    wrap.appendChild(sheet);
    wrap.style.width=pg.w+'in';
    wrap.style.height=pg.h+'in';
    wrap.style.overflow='hidden';
    wrap.style.background='#fff';
    sheet.style.transformOrigin='top left';
    sheet.style.transform='translate('+SAFE_MARGIN+'in,'+SAFE_MARGIN+'in) scale('+fit+')';
  }

  function isDownloadPdfControl(el){
    if(!el || !el.getAttribute) return false;
    var oc=el.getAttribute('onclick')||'';
    if(/downloadEstimatePdf/.test(oc)) return true;
    var label=((el.textContent||'')+' '+(el.getAttribute('aria-label')||'')+' '+(el.id||'')+' '+(el.className||'')).replace(/\s+/g,' ');
    if(/download\s*pdf/i.test(label)) return true;
    if(/\bdownload\b/i.test(el.className||'') && /pdf/i.test(label+oc)) return true;
    return false;
  }

  function bindDownloadButtons(doc){
    doc=doc||document;
    var nodes=doc.querySelectorAll('button, a, input[type="button"], [onclick]');
    for(var i=0;i<nodes.length;i++){
      var el=nodes[i];
      if(!isDownloadPdfControl(el)) continue;
      try{ el.setAttribute('onclick','return false;'); }catch(_){}
      el.onclick=function(ev){
        if(ev){ try{ ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); }catch(_){} }
        downloadEstimatePdf();
        return false;
      };
    }
  }

  function hostDocument(){
    try{
      if(window.frameElement && window.parent && window.parent.document && window.parent.document.body)
        return window.parent.document;
    }catch(_){}
    return document;
  }

  function copyStyles(fromDoc, toDoc){
    var head=toDoc.head||toDoc.documentElement;
    var nodes=fromDoc.querySelectorAll('style, link[rel="stylesheet"]');
    for(var i=0;i<nodes.length;i++){
      try{
        var n=nodes[i];
        if(n.id==='agbPdfUnclamp' || n.id==='agbPdfDesign' || n.id==='agbSheetPrintFit') continue;
        if(n.tagName==='STYLE'){
          var st=toDoc.createElement('style');
          st.textContent=n.textContent||'';
          head.appendChild(st);
        }else if(n.href){
          var ln=toDoc.createElement('link');
          ln.rel='stylesheet';
          ln.href=n.href;
          head.appendChild(ln);
        }
      }catch(_){}
    }
  }

  function buildCaptureIframe(sheet, pg){
    var srcDoc=sheet.ownerDocument||document;
    var hostDoc=hostDocument();
    var iframe=hostDoc.createElement('iframe');
    iframe.id='agbPdfCaptureFrame';
    iframe.setAttribute('aria-hidden','true');
    iframe.style.cssText='position:fixed;left:0;top:0;width:'+pg.w+'in;height:'+pg.h+'in;border:0;opacity:0;pointer-events:none;background:#fff;z-index:2147483646;';
    (hostDoc.body||hostDoc.documentElement).appendChild(iframe);
    var idoc=iframe.contentDocument;
    idoc.open();
    idoc.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Estimate PDF</title></head><body></body></html>');
    idoc.close();
    copyStyles(srcDoc, idoc);
    applyDesign(idoc, pg);
    var clone=sheet.cloneNode(true);
    clone.id='pdfExportSheet';
    clone.querySelectorAll('.no-print, .noprint, .rs-nophoto-bar, .rs-optnote-off, .sheet-row-remove, .sheet-row-add, .sheet-row-tools, .sheet-add-row, .sheet-note-add-bar, .actions, .sheet-ai-panel').forEach(function(el){
      try{ el.remove(); }catch(_){}
    });
    clone.querySelectorAll('[contenteditable]').forEach(function(el){
      try{ el.removeAttribute('contenteditable'); }catch(_){}
    });
    (idoc.body||idoc.documentElement).appendChild(idoc.adoptNode ? idoc.adoptNode(clone) : clone);
    applyDesign(idoc, pg);
    var sh=idoc.querySelector('.sheet')||idoc.getElementById('pdfExportSheet');
    if(sh) restoreDesignSize(sh, pg);
    try{
      if(typeof idoc.defaultView!=='undefined' && srcDoc.defaultView && typeof srcDoc.defaultView.agbFitNoPhotoNotes==='function'){
        srcDoc.defaultView.agbFitNoPhotoNotes(idoc);
      }else if(typeof global.agbFitNoPhotoNotes==='function'){
        global.agbFitNoPhotoNotes(idoc);
      }
    }catch(_){}
    return iframe;
  }

  async function waitImages(doc){
    var imgs=[].slice.call(doc.querySelectorAll('img'));
    await Promise.all(imgs.map(async function(img){
      try{
        var src=img.getAttribute('src')||'';
        if(!src || src.indexOf('data:')===0){
          if(!img.complete){
            await new Promise(function(resolve){
              img.addEventListener('load',resolve,{once:true});
              img.addEventListener('error',resolve,{once:true});
              setTimeout(resolve,2000);
            });
          }
          return;
        }
        if(!img.complete){
          await new Promise(function(resolve){
            img.addEventListener('load',resolve,{once:true});
            img.addEventListener('error',resolve,{once:true});
            setTimeout(resolve,3000);
          });
        }
        var res=await fetch(src,{mode:'cors',credentials:'omit'}).catch(function(){return null;});
        if(res && res.ok){
          var blob=await res.blob();
          var dataUrl=await new Promise(function(resolve,reject){
            var fr=new FileReader();
            fr.onload=function(){resolve(fr.result);};
            fr.onerror=reject;
            fr.readAsDataURL(blob);
          });
          img.setAttribute('src', dataUrl);
          img.crossOrigin='anonymous';
        }else{
          img.crossOrigin='anonymous';
        }
      }catch(_){
        try{ img.crossOrigin='anonymous'; }catch(__){}
      }
    }));
  }

  async function blankPdf(worker, pg){
    var J=(global.jspdf && (global.jspdf.jsPDF||global.jspdf.default)) || global.jsPDF;
    if(typeof J==='function'){
      return new J({unit:'in',format:'letter',orientation:pg.orient,compress:true});
    }
    var pdf=await worker.toPdf().get('pdf');
    if(typeof pdf.addPage==='function') pdf.addPage('letter', pg.orient);
    var n=pdf.internal.getNumberOfPages();
    while(n>1){ pdf.deletePage(1); n--; }
    return pdf;
  }

  async function downloadEstimatePdf(){
    var sheet=document.querySelector('.sheet');
    if(!sheet) return;
    var filename=(document.title||'Absolute Garage Builders Estimate').replace(/[\\/:*?"<>|]+/g,'-')+'.pdf';
    var iframe=null;
    var isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    var canvasScale=isIOS?1.5:2;
    try{
      var tries=0;
      while(typeof global.html2pdf!=='function' && tries<40){
        await new Promise(function(r){setTimeout(r,100);});
        tries++;
      }
      if(typeof global.html2pdf!=='function') throw new Error('PDF library did not load.');

      var pg=pageSize();
      try{ if(typeof global.agbFitNoPhotoNotes==='function') global.agbFitNoPhotoNotes(document); }catch(_){}
      iframe=buildCaptureIframe(sheet, pg);
      var idoc=iframe.contentDocument;
      var clone=idoc.querySelector('.sheet')||idoc.getElementById('pdfExportSheet');
      if(!clone) throw new Error('Estimate could not be rendered.');

      await waitImages(idoc);
      await new Promise(function(resolve){requestAnimationFrame(function(){requestAnimationFrame(resolve);});});
      restoreDesignSize(clone, pg);
      applyDesign(idoc, pg);
      try{ if(typeof global.agbFitNoPhotoNotes==='function') global.agbFitNoPhotoNotes(idoc); }catch(_){}
      void clone.offsetHeight;

      var ppi=pxPerIn(idoc);
      var fullWidth=Math.round(pg.w*ppi);
      var fullHeight=Math.round(pg.h*ppi);
      iframe.style.width=fullWidth+'px';
      iframe.style.height=fullHeight+'px';

      var crect=clone.getBoundingClientRect();
      var worker=global.html2pdf().set({
        margin:0,
        image:{type:'jpeg', quality:0.92},
        html2canvas:{
          scale:canvasScale, useCORS:true, allowTaint:false, backgroundColor:'#ffffff',
          logging:false, scrollX:-crect.left, scrollY:-crect.top, x:0, y:0,
          width:fullWidth, height:fullHeight, windowWidth:fullWidth, windowHeight:fullHeight,
          onclone:function(doc){
            applyDesign(doc, pg);
            var sh=doc.querySelector('.sheet')||doc.getElementById('pdfExportSheet');
            if(sh) restoreDesignSize(sh, pg);
          }
        },
        jsPDF:{unit:'in',format:'letter',orientation:pg.orient,compress:true}
      }).from(clone).toCanvas();

      var canvas=await worker.get('canvas');
      if(!canvas || !canvas.width || !canvas.height) throw new Error('Estimate could not be rendered.');

      var imgData;
      try{ imgData=canvas.toDataURL('image/jpeg', 0.92); }
      catch(e){ imgData=canvas.toDataURL('image/jpeg', 0.85); }
      if(!imgData || imgData.length<1000) throw new Error('Incomplete image capture. Try again or use a computer.');

      var pageW=pg.w, pageH=pg.h, margin=SAFE_MARGIN;
      var maxW=pageW-2*margin, maxH=pageH-2*margin;
      // The capture is the designed letter page. Scale it uniformly into the safe inset.
      var widthIn=pageW, heightIn=pageH;
      var fit=Math.min(maxW/widthIn, maxH/heightIn, 1);
      var drawW=widthIn*fit, drawH=heightIn*fit;
      var x=(pageW-drawW)/2, y=(pageH-drawH)/2;

      var pdf=await blankPdf(worker, pg);
      pdf.setFillColor(255,255,255);
      pdf.rect(0,0,pageW,pageH,'F');
      pdf.addImage(imgData, 'JPEG', x, y, drawW, drawH, undefined, 'FAST');

      if(global.__agbPdfCapture){
        global.__agbPdfResult=pdf.output('datauristring');
        global.__agbPdfPages=pdf.internal.getNumberOfPages();
      }else{
        pdf.save(filename);
      }
    }catch(err){
      console.error('PDF download failed:',err);
      var msg=String(err&&err.message?err.message:err);
      alert('Could not download the estimate PDF. '+(
        /png|corrupt|incomplete|memory|taint/i.test(msg)
          ? 'iPad ran out of memory capturing the sheet. Close other tabs and try again, or download from a computer.'
          : msg
      ));
    }finally{
      if(iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }
  }

  function bindCaptureClick(win, doc){
    if(win.__agbFitClickBound) return;
    win.__agbFitClickBound=true;
    doc.addEventListener('click', function(ev){
      var el=ev.target;
      while(el && el!==doc){
        if(isDownloadPdfControl(el)){
          try{ ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); }catch(_){}
          downloadEstimatePdf();
          return;
        }
        el=el.parentNode;
      }
    }, true);
  }

  function install(win){
    win=win||global;
    var doc=win.document;
    if(!doc) return;
    installPrintCss(doc);
    win.fitSheetToOnePrintedPage=fitSheetToOnePrintedPage;
    win.clearSheetPrintScale=clearSheetPrintScale;
    win.downloadEstimatePdf=downloadEstimatePdf;
    win.__agbSheetFitV=AGB_SHEET_FIT_V;
    try{
      Object.defineProperty(win, 'downloadEstimatePdf', {
        configurable:true, enumerable:true, writable:true, value:downloadEstimatePdf
      });
    }catch(_){
      win.downloadEstimatePdf=downloadEstimatePdf;
    }
    bindDownloadButtons(doc);
    bindCaptureClick(win, doc);
    try{
      win.removeEventListener('beforeprint', fitSheetToOnePrintedPage);
      win.removeEventListener('afterprint', clearSheetPrintScale);
    }catch(_){}
    win.addEventListener('beforeprint', fitSheetToOnePrintedPage);
    win.addEventListener('afterprint', clearSheetPrintScale);
  }

  function scheduleInstall(win){
    function go(){ try{ install(win); }catch(_){} }
    var doc=win.document;
    if(doc && doc.readyState==='loading'){
      doc.addEventListener('DOMContentLoaded', go);
    }else{
      go();
    }
    if(win.addEventListener){
      win.addEventListener('load', go);
    }
    try{
      win.setTimeout(go, 0);
      win.setTimeout(go, 250);
    }catch(_){}
  }

  global.agbInstallEstimateSheetFit=install;
  if(global.document){
    scheduleInstall(global);
  }
})(typeof window!=='undefined'?window:this);
