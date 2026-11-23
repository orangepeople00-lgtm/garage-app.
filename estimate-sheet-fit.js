/* Estimate sheet print/PDF fit v2: keep the full sheet (especially the price
   and footer) inside a 0.5in safe inset on Letter paper so browser print
   margins and printer unprintable areas cannot clip the total. Long sheets
   scale down to one page until 0.70, then break to a second page without
   splitting the total box. This installer always wins over older baked-in
   Download PDF functions in saved History sheets, and captures the sheet
   inside the viewport so a short laptop popup cannot clip the price. */
(function(global){
  var SAFE_MARGIN = 0.5; // inches
  var MIN_FIT = 0.70;
  var AGB_SHEET_FIT_V = '2';

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
    sheet.querySelectorAll('.notes-panel,.left,.right').forEach(function(el){
      el.style.setProperty('overflow','visible','important');
      el.style.setProperty('max-height','none','important');
    });
    void sheet.offsetHeight;
  }

  function fitSheetToOnePrintedPage(){
    var sheet=document.querySelector('.sheet');
    if(!sheet) return;
    clearSheetPrintScale();
    installPrintCss(document);
    var pg=pageSize();
    var ppi=pxPerIn(document);
    unclampSheet(sheet, pg);
    var maxW=pg.w-2*SAFE_MARGIN, maxH=pg.h-2*SAFE_MARGIN;
    var hIn=Math.max(sheet.scrollHeight, sheet.getBoundingClientRect().height)/ppi;
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

  async function downloadEstimatePdf(){
    var sheet=document.querySelector('.sheet');
    if(!sheet) return;
    var filename=(document.title||'Absolute Garage Builders Estimate').replace(/[\\/:*?"<>|]+/g,'-')+'.pdf';
    var exportHost=null;
    var prevHtmlOverflow='';
    var prevBodyOverflow='';
    var prevScrollX=0, prevScrollY=0;
    var isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    var canvasScale=isIOS?1.5:2;
    try{
      var tries=0;
      while(typeof global.html2pdf!=='function' && tries<40){
        await new Promise(function(r){setTimeout(r,100);});
        tries++;
      }
      if(typeof global.html2pdf!=='function') throw new Error('PDF library did not load.');

      exportHost=document.createElement('div');
      exportHost.id='pdfExportHost';
      exportHost.style.cssText='position:absolute;left:0;top:0;background:#fff;overflow:visible;z-index:2147483646;';
      document.body.appendChild(exportHost);

      var clone=sheet.cloneNode(true);
      clone.id='pdfExportSheet';
      clone.querySelectorAll('.no-print, .noprint, .rs-nophoto-bar, .rs-optnote-off, .sheet-row-remove, .sheet-row-add, .sheet-row-tools, .sheet-add-row, .sheet-note-add-bar, .actions, .sheet-ai-panel').forEach(function(el){
        try{ el.remove(); }catch(_){}
      });
      var pg=pageSize();
      clone.style.setProperty('width',pg.w+'in','important');
      clone.style.setProperty('min-width',pg.w+'in','important');
      clone.style.setProperty('max-width','none','important');
      clone.style.setProperty('height','auto','important');
      clone.style.setProperty('min-height',pg.h+'in','important');
      clone.style.setProperty('max-height','none','important');
      clone.style.setProperty('overflow','visible','important');
      clone.style.setProperty('margin','0','important');
      clone.style.transform='';
      try{ clone.style.zoom=''; }catch(_){}
      exportHost.appendChild(clone);

      var main=clone.querySelector('.main');
      if(main){
        main.style.setProperty('height','auto','important');
        main.style.setProperty('min-height','0','important');
        main.style.setProperty('overflow','visible','important');
      }
      clone.querySelectorAll('.left,.right,.notes-panel,.notes,.total-box,.footer').forEach(function(el){
        el.style.setProperty('height','auto','important');
        el.style.setProperty('max-height','none','important');
        el.style.setProperty('overflow','visible','important');
      });

      var imgs=[].slice.call(clone.querySelectorAll('img'));
      await Promise.all(imgs.map(async function(img){
        try{
          var src=img.getAttribute('src')||'';
          if(!src || src.indexOf('data:')===0) return;
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
          } else {
            img.crossOrigin='anonymous';
          }
        }catch(_){
          try{ img.crossOrigin='anonymous'; }catch(__){}
        }
      }));
      await new Promise(function(resolve){requestAnimationFrame(function(){requestAnimationFrame(resolve);});});

      var ppi=pxPerIn(document);
      var rect=clone.getBoundingClientRect();
      var fullWidth=Math.ceil(Math.max(
        rect.width, clone.scrollWidth||0,
        Math.max.apply(null, [0].concat([].slice.call(clone.querySelectorAll('*')).map(function(el){
          try{ return el.getBoundingClientRect().right-rect.left; }catch(_){ return 0; }
        })))
      ));
      var fullHeight=Math.ceil(Math.max(
        rect.height, clone.scrollHeight||0,
        Math.max.apply(null, [0].concat([].slice.call(clone.querySelectorAll('*')).map(function(el){
          try{ return el.getBoundingClientRect().bottom-rect.top; }catch(_){ return 0; }
        })))
      ));
      var pad=Math.round(0.08*ppi);
      var footer=clone.querySelector('.footer');
      var total=clone.querySelector('.total-box');
      if(footer){
        var fb=footer.getBoundingClientRect().bottom-rect.top;
        if(fb+pad>fullHeight) fullHeight=Math.ceil(fb+pad);
      }else if(total){
        var tb=total.getBoundingClientRect().bottom-rect.top;
        if(tb+pad>fullHeight) fullHeight=Math.ceil(tb+pad);
      }
      fullHeight=Math.ceil(fullHeight+pad);
      exportHost.style.width=fullWidth+'px';
      exportHost.style.height=fullHeight+'px';

      // Keep the clone in the viewport during capture. html2canvas otherwise
      // clips a full letter sheet to a short popup (window.open 1000x1000).
      prevHtmlOverflow=document.documentElement.style.overflow;
      prevBodyOverflow=document.body.style.overflow;
      prevScrollX=window.scrollX||0;
      prevScrollY=window.scrollY||0;
      document.documentElement.style.overflow='visible';
      document.body.style.overflow='visible';
      window.scrollTo(0,0);
      var crect=clone.getBoundingClientRect();

      var worker=global.html2pdf().set({
        margin:0,
        image:{type:'jpeg', quality:0.92},
        html2canvas:{
          scale:canvasScale, useCORS:true, allowTaint:false, backgroundColor:'#ffffff',
          logging:false, scrollX:-crect.left, scrollY:-crect.top, x:0, y:0,
          width:fullWidth, height:fullHeight, windowWidth:fullWidth, windowHeight:fullHeight
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
      var widthIn=fullWidth/ppi, heightIn=fullHeight/ppi;
      if(!widthIn || !heightIn){ widthIn=canvas.width/(canvasScale*ppi/2||96); heightIn=canvas.height/(canvasScale*ppi/2||96); }
      var fit=Math.min(maxW/widthIn, maxH/heightIn);

      var pdf=await worker.toPdf().get('pdf');
      var count=pdf.internal.getNumberOfPages();
      while(count>1){ pdf.deletePage(count); count--; }

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
        var scaleY=canvas.height/fullHeight;
        var keepTop=total ? (total.getBoundingClientRect().top-cloneRect.top)*scaleY : canvas.height;
        var keepBottom=footer ? (footer.getBoundingClientRect().bottom-cloneRect.top)*scaleY : (total? (total.getBoundingClientRect().bottom-cloneRect.top)*scaleY : canvas.height);
        var y0=0, first=true;
        while(y0<canvas.height-0.5){
          var y1=Math.min(canvas.height, y0+sliceCanvasPx);
          if(y0<keepTop && y1>keepTop && y1<keepBottom){ y1=keepTop; }
          if(y0>=keepTop && y0<keepBottom){ y1=Math.max(y1, keepBottom); }
          var sliceH=Math.max(1, y1-y0);
          var slice=document.createElement('canvas');
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
      try{
        document.documentElement.style.overflow=prevHtmlOverflow;
        document.body.style.overflow=prevBodyOverflow;
        window.scrollTo(prevScrollX, prevScrollY);
      }catch(_){}
      if(exportHost && exportHost.parentNode) exportHost.parentNode.removeChild(exportHost);
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
