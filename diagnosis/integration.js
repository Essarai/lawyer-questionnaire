// Integrate recovered report content into Kalyu's existing product shell.
(()=>{
 const unavailableLabels=new Set(['加入对比','去创作工作台','去创作工作台 Beta','一键生成小红书发布包']);
 function sync(){
  document.documentElement.classList.remove('dark');
  for(const el of document.querySelectorAll('#root a,#root button')){
   if(el.hasAttribute('data-kalu-unavailable'))continue;
   const href=el.getAttribute('href')||'';
   const label=el.textContent.trim().replace(/\s+/g,' ');
   const route=href.startsWith('#/')?href.slice(1):'';
   if((route&&!route.startsWith('/dna/')&&route!='/library')||unavailableLabels.has(label)){
    el.setAttribute('data-kalu-unavailable','true');el.setAttribute('aria-disabled','true');el.setAttribute('title','暂未接入');
    if(el.tagName==='BUTTON')el.disabled=true;
    else{el.removeAttribute('href');el.setAttribute('role','link');el.tabIndex=0;}
   }
  }
 }
 const start=()=>{sync();new MutationObserver(sync).observe(document.getElementById('root'),{childList:true,subtree:true});};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
