const mbtiTypes = ['ISTJ','ISFJ','INFJ','INTJ','ISTP','ISFP','INFP','INTP','ESTP','ESFP','ENFP','ENTP','ESTJ','ESFJ','ENFJ','ENTJ','未测过 / 不确定'];
function combinedCustomerNote(binding) {
  if (typeof binding.note === 'string') return binding.note;
  return [['客户所处阶段',binding.stage],['付费意愿',binding.willingness],['特定服务需求',binding.needs]]
    .filter(([,v])=>v?.trim()).map(([label,v])=>label+'：'+v).join('\n');
}

function migrateCoverage() {
  if (state.answerRevision >= 3) return;
  const b=state.base, methods=state.global.remote || [];
  const scope=b.scope || '', specified=(b.specified||[]).map(r=>({...r,city:r.city||'*'}));
  const local=methods.includes('仅本地服务'), online=methods.includes('异地线上咨询'), travel=methods.includes('异地线下办理');
  // Older drafts used one range for all channels. Only transfer a range when the channel is known.
  const offlineScope=travel && scope!=='local' ? scope : local && scope==='local' ? 'local' : travel ? 'remote' : '';
  const onlineScope=online && !travel && !local && scope!=='local' ? scope : online ? 'remote' : '';
  const range=s=>({scope:s,regions:s==='specified'?specified.map(r=>({...r})):[]});
  b.coverage={offline:range(offlineScope),online:range(onlineScope)};
  if (methods.includes('异地委托代理')) b.remoteMandate='接受';
  state.archivedAnswers ||= {};
  state.archivedAnswers.coverage={scope,specified:b.specified||[],methods:[...methods]};
  state.archivedAnswers.unique=state.unique;
  delete state.unique; delete b.scope; delete b.specified; delete state.global.remote;
  for(const area of state.businessAreas) for(const product of area.products) for(const binding of product.audiences){
    binding.note=combinedCustomerNote(binding);
    delete binding.stage; delete binding.willingness; delete binding.needs;
  }
  for(const key of Object.keys(state.sources)) {
    if (/^unique$|^global\.remote$|^base\.(specified|scope)(\.|$)|\.audiences\.\d+\.(stage|willingness|needs)$/.test(key)) delete state.sources[key];
  }
  state.answerRevision=3;
}

function exclusionText(global) {
  if (!Array.isArray(global.exclude)) return String(global.exclude || '');
  if (global.exclude.includes('暂无额外限制')) return '暂无额外限制';
  const selections=global.exclude.filter(Boolean);
  if (!selections.length) return '';
  return [...new Set([...selections,global.excludeDetail?.trim()].filter(Boolean))].join('\n');
}

function migratePracticePreferences() {
  if (state.answerRevision>=4) return;
  state.global.exclude=exclusionText(state.global);
  delete state.global.excludeDetail;
  delete state.priorityConfirmed;
  delete state.sources.priorityConfirmed;
  delete state.sources['global.excludeDetail'];
  state.answerRevision=4;
}

function simplifyLocation(){
  if (state.answerRevision >= 5) return;
  const b=state.base, offline=b.coverage?.offline, policy=b.outsidePolicy;
  if (b.city && !b.province) {
    const matches=Object.keys(regionCities).filter(province=>regionCities[province].includes(b.city));
    if (matches.length===1) b.province=matches[0];
  }
  let response='';
  if (offline?.scope==='nationwide') response='接受';
  else if (offline?.scope==='remote' || ['可赴外地办理，逐案评估','可全程远程办理时考虑'].includes(policy)) response='视案件情况而定';
  else if (offline?.scope==='local' && policy==='原则上不承接') response='暂不接受';
  b.outOfTown=response;
  state.archivedAnswers ||= {};
  state.archivedAnswers.practiceLocation={coverage:b.coverage,remoteMandate:b.remoteMandate,outsidePolicy:policy,travelTerms:b.travelTerms};
  for(const key of ['coverage','remoteMandate','outsidePolicy','travelTerms']) delete b[key];
  for(const key of Object.keys(state.sources)) if(/^base\.(coverage|remoteMandate|outsidePolicy|travelTerms)(\.|$)/.test(key)) delete state.sources[key];
  state.answerRevision=5;
}
serviceRegion = function () {
  const b=state.base;
  return '所在城市：'+(b.city||'未填写')+'；异地办案：'+(b.outOfTown||'待填写');
};
migrateCoverage();
migratePracticePreferences();
simplifyLocation();
