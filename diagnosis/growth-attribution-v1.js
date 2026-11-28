/* First-party measurement only; no raw query, content, or token is stored. */
(() => {
  if (location.hostname !== 'shandongai.cn' || navigator.doNotTrack === '1') return;
  try { if (localStorage.getItem('so_measurement_optout') === '1') return; } catch {}
  const params = new URLSearchParams(location.search);
  let internal = params.get('measurement') === 'internal';
  try { if (internal) sessionStorage.setItem('so_measurement_internal','1'); internal = internal || sessionStorage.getItem('so_measurement_internal') === '1'; } catch {}
  const campaign = ['zhihu','toutiao','douyin'].includes(params.get('utm_source')) ? params.get('utm_source') : null;
  let ready = false, previousToken = '', binding = false;
  async function bind() {
    if (!ready || binding) return;
    let token = ''; try { token = JSON.parse(localStorage.getItem('auth-session') || '{}').token || ''; } catch {}
    if (!token || token === previousToken) return;
    binding = true;
    try { const r = await fetch('/api/growth/bind',{method:'POST',credentials:'same-origin',headers:{Authorization:'Bearer '+token}}); if (r.ok) previousToken=token; } catch {} finally { binding=false; }
  }
  async function landing() {
    try { const r = await fetch('/api/growth/landing',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:location.pathname,referrer:(()=>{try{return new URL(document.referrer).origin;}catch{return '';}})(),campaign,internal})}); ready=r.ok; if (ready) await bind(); } catch {}
  }
  landing();
  window.addEventListener('storage',bind);
  window.addEventListener('focus',bind);
  // Existing SPA stores successful login in localStorage; no auth interception.
  setInterval(()=>{if(document.visibilityState==='visible') bind();},5000);
})();
