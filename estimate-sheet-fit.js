/* Estimate sheet print/PDF fit v3: keep the full sheet (especially the price
   and footer) inside a 0.6in safe inset on Letter paper. Download PDF captures
   the sheet in a dedicated iframe at letter width, unclamped from the 11in
   overflow:hidden styles, so a short laptop popup or History iframe cannot
   clip the total. PDFs are built on a blank jsPDF page (the html2pdf default
   page, which fills the letter and clips the price, is discarded). */
(function(global){
  var SAFE_MARGIN = 0.6; // inches — a little more than a typical 0.5in printer margin
  var MIN_FIT = 0.70;
  var AGB_SHEET_FIT_V = '3';

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

  function unclampCss(pg){
    pg=pg||pageSize();
    return (
      'html,body{margin:0!important;padding:0!important;width:'+pg.w+'in!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;background:#fff!important;}'+
      '.sheet,#pdfExportSheet{width:'+pg.w+'in!important;min-width:'+pg.w+'in!important;max-width:none!important;height:auto!important;min-height:'+pg.h+'in!important;max-height:none!important;overflow:visible!important;margin:0!important;transform:none!important;box-shadow:none!important;}'+
      '.main,.left,.right,.notes-panel,.notes,.total-box,.total-price,.total-label,.footer{height:auto!important;max-height:none!important;overflow:visible!important;}'+
      '.footer{margin-top:10px!important;flex:0 0 auto!important;position:relative!important;top:auto!important;bottom:auto!important;}'+
      '.actions,.estimate-assistant,.no-print,.noprint,.sheet-ai-panel{display:none!important;}'
    );
  }

  function applyUnclamp(doc, pg){
    if(!doc) return;
    var st=doc.getElementById('agbPdfUnclamp');
    if(!st){
      st=doc.createElement('style');
      st.id='agbPdfUnclamp';
      (doc.head||doc.documentElement).appendChild(st);
    }
    st.textContent=unclampCss(pg);
  }

  function installPrintCss(doc){
    doc=doc||document;
    var st=doc.getElementById('agbSheetPrintFit');
    if(!st){
      st=doc.createElement('style');
      st.id='agbSheetPrintFit';
      (doc.head||doc.documentElement).appendChild(st);
    }
    st.textContent=
      '@page{size:Letter;margin:0 !important;}'+
      '@media print{'+
        'html,body,html body{width:auto!important;height:auto!important;min-height:0!important;max-height:none!important;margin:0!important;padding:0!important;overflow:visible!important;background:#fff!important;}'+
        '#agbPrintFitWrap{display:block;margin:0 auto;background:#fff;overflow:hidden;page-break-inside:avoid!important;break-inside:avoid!important;page-break-after:avoid!important;page-break-before:avoid!important;}'+
        'html.agb-print-multipage #agbPrintFitWrap{overflow:visible!important;height:auto!important;page-break-inside:auto!important;break-inside:auto!important;page-break-after:auto!important;}'+
        'html body .sheet,.sheet{overflow:visible!important;max-height:none!important;height:auto!important;}'+
        'html body .main,.main{overflow:visible!important;max-height:none!important;height:auto!important;}'+
        'html body .notes-panel,.notes-panel,html body .left,html body .right{overflow:visible!important;max-height:none!important;}'+
        'html body .total-box,.total-box,html body .footer,.footer{break-inside:avoid!important;page-break-inside:avoid!important;overflow:visible!important;}'+
        'html.agb-print-multipage .footer{break-before:avoid!important;page-break-before:avoid!important;}'+
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
    try{ document.documentElement.classList.remove('agb-print-multipage'); }catch(_){}
  }

  function unclampSheet(sheet, pg){
    sheet.style.setProperty('height','auto','important');
    sheet.style.setProperty('min-height',pg.h+'in','important');
    sheet.style.setProperty('max-height','none','important');
    sheet.style.setProperty('overflow','visible','important');
    sheet.style.setProperty('width',pg.w+'in','important');
    var main=sheet.querySelector('.main');
    if(main){
      main.style.setProperty('overflow','visible','important');
      main.style.setProperty('max-height','none','important');
      main.style.setProperty('height','auto','important');
    }
    sheet.querySelectorAll('.notes-panel,.left,.right,.total-box,.footer').forEach(function(el){
      el.style.setProperty('overflow','visible','important');
      el.style.setProperty('max-height','none','important');
    });
    var footer=sheet.querySelector('.footer');
    if(footer){
      footer.style.setProperty('margin-top','10px','important');
      footer.style.setProperty('flex','0 0 auto','important');
      footer.style.setProperty('position','relative','important');
    }
    void sheet.offsetHeight;
  }

  function fitSheetToOnePrintedPage(){
    var sheet=document.querySelector('.sheet');
    if(!sheet) return;
    clearSheetPrintScale();
    installPrintCss(document);
    var pg=pageSize();
    var ppi=pxPerIn(document);
    applyUnclamp(document, pg);
    unclampSheet(sheet, pg);
    var maxW=pg.w-2*SAFE_MARGIN, maxH=pg.h-2*SAFE_MARGIN;
    var hIn=Math.max(sheet.scrollHeight, sheet.getBoundingClientRect().height)/ppi;
    var footer=sheet.querySelector('.footer');
    if(footer){
      var fb=(footer.getBoundingClientRect().bottom-sheet.getBoundingClientRect().top)/ppi;
      if(fb>hIn) hIn=fb;
    }
    if(!(hIn>0)) hIn=pg.h;
    var fit=Math.min(maxW/pg.w, maxH/hIn, 1);

    var wrap=document.createElement('div');
    wrap.id='agbPrintFitWrap';
    sheet.parentNode.insertBefore(wrap, sheet);
    wrap.appendChild(sheet);

    if(fit<MIN_FIT){
      document.documentElement.classList.add('agb-print-multipage');
      var sw=Math.min(maxW/pg.w, 1);
      wrap.style.width=pg.w+'in';
      wrap.style.height='auto';
      wrap.style.overflow='visible';
      sheet.style.transformOrigin='top left';
      sheet.style.transform='translate('+SAFE_MARGIN+'in,'+SAFE_MARGIN+'in) scale('+sw+')';
      sheet.style.marginBottom=((sw-1)*hIn*ppi+SAFE_MARGIN*ppi)+'px';
      return;
    }

    wrap.style.width=pg.w+'in';
    wrap.style.height=pg.h+'in';
    var tx=SAFE_MARGIN, ty=(pg.h-hIn*fit)/2;
    if(ty<SAFE_MARGIN) ty=SAFE_MARGIN;
    sheet.style.transformOrigin='top left';
    sheet.style.transform='translate('+tx+'in,'+ty+'in) scale('+fit+')';
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
        if(n.id==='agbPdfUnclamp' || n.id==='agbSheetPrintFit') continue;
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

  function measureSheet(sheet){
    var rect=sheet.getBoundingClientRect();
    var ppi=pxPerIn(sheet.ownerDocument);
    var width=Math.ceil(Math.max(rect.width, sheet.scrollWidth||0, ppi*8.5));
    var height=Math.ceil(Math.max(rect.height, sheet.scrollHeight||0));
    var nodes=sheet.querySelectorAll('*');
    for(var i=0;i<nodes.length;i++){
      try{
        var r=nodes[i].getBoundingClientRect();
        var b=r.bottom-rect.top;
        var right=r.right-rect.left;
        if(b>height) height=b;
        if(right>width) width=right;
      }catch(_){}
    }
    var total=sheet.querySelector('.total-box');
    var footer=sheet.querySelector('.footer');
    var pad=Math.round(0.12*ppi);
    if(footer){
      var fb=footer.getBoundingClientRect().bottom-rect.top;
      if(fb+pad>height) height=fb+pad;
    }
    if(total){
      var tb=total.getBoundingClientRect().bottom-rect.top;
      if(tb+pad>height) height=tb+pad;
    }
    return {width:Math.ceil(width), height:Math.ceil(height+pad), ppi:ppi, total:total, footer:footer, rect:rect};
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
    idoc.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Estimate PDF</title></head><body style="margin:0;background:#fff"></body></html>');
    idoc.close();
    copyStyles(srcDoc, idoc);
    applyUnclamp(idoc, pg);
    var clone=sheet.cloneNode(true);
    clone.id='pdfExportSheet';
    clone.querySelectorAll('.no-print, .noprint, .rs-nophoto-bar, .rs-optnote-off, .sheet-row-remove, .sheet-row-add, .sheet-row-tools, .sheet-add-row, .sheet-note-add-bar, .actions, .sheet-ai-panel').forEach(function(el){
      try{ el.remove(); }catch(_){}
    });
    clone.querySelectorAll('[contenteditable]').forEach(function(el){
      try{ el.removeAttribute('contenteditable'); }catch(_){}
    });
    (idoc.body||idoc.documentElement).appendChild(idoc.adoptNode ? idoc.adoptNode(clone) : clone);
    applyUnclamp(idoc, pg);
    unclampSheet(idoc.querySelector('.sheet')||idoc.getElementById('pdfExportSheet'), pg);
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
      iframe=buildCaptureIframe(sheet, pg);
      var idoc=iframe.contentDocument;
      var clone=idoc.querySelector('.sheet')||idoc.getElementById('pdfExportSheet');
      if(!clone) throw new Error('Estimate could not be rendered.');

      await waitImages(idoc);
      await new Promise(function(resolve){requestAnimationFrame(function(){requestAnimationFrame(resolve);});});

      var meas=measureSheet(clone);
      iframe.style.width=meas.width+'px';
      iframe.style.height=meas.height+'px';
      if(idoc.documentElement){
        idoc.documentElement.style.height=meas.height+'px';
        idoc.body.style.height=meas.height+'px';
        idoc.body.style.overflow='visible';
      }
      void clone.offsetHeight;
      meas=measureSheet(clone);
      iframe.style.height=meas.height+'px';

      var crect=clone.getBoundingClientRect();
      var worker=global.html2pdf().set({
        margin:0,
        image:{type:'jpeg', quality:0.92},
        html2canvas:{
          scale:canvasScale, useCORS:true, allowTaint:false, backgroundColor:'#ffffff',
          logging:false, scrollX:-crect.left, scrollY:-crect.top, x:0, y:0,
          width:meas.width, height:meas.height, windowWidth:meas.width, windowHeight:meas.height,
          onclone:function(doc){
            applyUnclamp(doc, pg);
            var sh=doc.querySelector('.sheet')||doc.getElementById('pdfExportSheet');
            if(sh) unclampSheet(sh, pg);
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
      var widthIn=meas.width/meas.ppi, heightIn=meas.height/meas.ppi;
      if(!widthIn || !heightIn){ widthIn=pageW; heightIn=canvas.height/canvas.width*pageW; }
      var fit=Math.min(maxW/widthIn, maxH/heightIn);

      var pdf=await blankPdf(worker, pg);
      function fillPage(){
        pdf.setFillColor(255,255,255);
        pdf.rect(0,0,pageW,pageH,'F');
      }

      if(fit>=MIN_FIT){
        var drawW=widthIn*fit, drawH=heightIn*fit;
        var x=(pageW-drawW)/2, y=(pageH-drawH)/2;
        if(y<margin) y=margin;
        if(x<margin) x=margin;
        fillPage();
        pdf.addImage(imgData, 'JPEG', x, y, drawW, drawH, undefined, 'FAST');
      }else{
        var s=Math.min(maxW/widthIn, 1);
        var pxPerInC=canvas.height/heightIn;
        var sliceCanvasPx=maxH/s*pxPerInC;
        var cloneRect=clone.getBoundingClientRect();
        var scaleY=canvas.height/meas.height;
        var total=clone.querySelector('.total-box');
        var footer=clone.querySelector('.footer');
        var keepTop=total ? (total.getBoundingClientRect().top-cloneRect.top)*scaleY : canvas.height;
        var keepBottom=footer ? (footer.getBoundingClientRect().bottom-cloneRect.top)*scaleY : (total? (total.getBoundingClientRect().bottom-cloneRect.top)*scaleY : canvas.height);
        var y0=0, first=true;
        while(y0<canvas.height-0.5){
          var y1=Math.min(canvas.height, y0+sliceCanvasPx);
          if(y0<keepTop && y1>keepTop && y1<keepBottom){ y1=keepTop; }
          if(y0>=keepTop && y0<keepBottom){ y1=Math.max(y1, keepBottom); }
          var sliceH=Math.max(1, y1-y0);
          var slice=idoc.createElement('canvas');
          slice.width=canvas.width;
          slice.height=Math.ceil(sliceH);
          slice.getContext('2d').drawImage(canvas, 0, y0, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
          var sliceImg=slice.toDataURL('image/jpeg', 0.92);
          var drawW=widthIn*s;
          var drawH=(sliceH/canvas.height)*heightIn*s;
          if(!first && typeof pdf.addPage==='function') pdf.addPage('letter', pg.orient);
          first=false;
          fillPage();
          pdf.addImage(sliceImg, 'JPEG', (pageW-drawW)/2, margin, drawW, drawH, undefined, 'FAST');
          y0=y1;
        }
      }
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
