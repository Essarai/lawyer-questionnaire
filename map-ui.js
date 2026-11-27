// Visual hierarchy and single-choice billing; IDs remain stable while display numbers follow order.
function migrateBilling(){let updated=false;state.businessAreas.forEach(a=>a.products.forEach(p=>{if(p.billingVersion!==2){const old=Array.isArray(p.fees)?p.fees:[];p.feeMethod=old.length===1?old[0]:'';p.feeLegacy=old.length>1?[...old]:[];p.fees=p.feeMethod?[p.feeMethod]:[];p.billingVersion=2;updated=true}}));if(updated){state.confirmed=null;save()}}
function setBilling(ai,pi,value){const p=state.businessAreas[ai].products[pi];p.feeMethod=value;p.fees=value?[value]:[];p.feeLegacy=[];p.billingVersion=2;state.sources[`businessAreas.${ai}.products.${pi}.feeMethod`]='律师填写';changed()}
function billingUI(ai,pi){const p=state.businessAreas[ai].products[pi],path=`businessAreas.${ai}.products.${pi}`;return `${choiceField(path+'.feeMethod','该产品如何收费？',['按次','按小时','按件','按阶段','固定顾问费','其他'],{kind:'billing',multi:false})}${p.feeLegacy?.length?`<p class="small muted">原来选择了 ${p.feeLegacy.map(esc).join('、')}，请选择一种主要收费方式。</p>`:''}${p.feeMethod==='其他'?mf(path+'.feeOther','其他收费方式'):''}${mf(path+'.priceMode','价格形式',{type:'select',options:['暂不明确','固定价格','价格区间','面议','不便透露']})}${p.priceMode==='固定价格'?mf(path+'.fixed','固定价格',{type:'number'}):p.priceMode==='价格区间'?`<div class="grid2">${mf(path+'.min','最低金额',{type:'number'})}${mf(path+'.max','最高金额',{type:'number'})}</div>`:''}${['固定价格','价格区间'].includes(p.priceMode)?mf(path+'.currency','币种'):''}`}
priceLabel=function(p){const method=p.feeMethod==='其他'?p.feeOther:p.feeMethod;const suffix=method?' · '+method:'';if(p.priceMode==='固定价格')return `${p.fixed!==''?p.fixed:'—'} ${p.currency}${suffix}`;if(p.priceMode==='价格区间')return `${p.min!==''?p.min:'—'}—${p.max!==''?p.max:'—'} ${p.currency}${suffix}`;return p.priceMode+suffix};
function answerText(value) {
  return Array.isArray(value) ? value.filter(Boolean).join('、') : String(value || '');
}

function clientIdentityText(profile) {
  if (!Array.isArray(profile.identities)) return answerText(profile.identities);
  return profile.identities.map(value => value === '其他' ? profile.otherIdentity || value : value).join('、');
}

function reviseAnswers() {
  if (state.answerRevision >= 2) return;
  // Keep retired answers separately from the active questionnaire and its export.
  const retired = { story: state.story, careerMoment: state.careerMoment, status: state.base.status, statusOther: state.base.statusOther, features: [] };
  for (const area of state.businessAreas) {
    for (const p of area.products) {
      p.issues = [answerText(p.issues), p.issueNote].filter(Boolean).join('\n');
      p.services = [answerText(p.services), p.serviceNote].filter(Boolean).join('\n');
      delete p.issueNote;
      delete p.serviceNote;
    }
    for (const pr of area.profiles) {
      pr.types = answerText(pr.types);
      pr.identities = clientIdentityText(pr);
      if (pr.features?.length || pr.featureDetail) retired.features.push({ area:area.path, profileId:pr.id, features:pr.features, detail:pr.featureDetail });
      delete pr.otherIdentity;
      delete pr.features;
      delete pr.featureDetail;
    }
  }
  if (state.jobs.length === 1 && state.careerMoment && !state.jobs[0].moment) state.jobs[0].moment = state.careerMoment;
  state.archivedAnswers = retired;
  delete state.base.status;
  delete state.base.statusOther;
  delete state.story;
  delete state.careerMoment;
  for (const key of Object.keys(state.sources)) {
    if (/^base\.status(Other)?$|^(story|careerMoment)$|\.(features|featureDetail|otherIdentity|issueNote|serviceNote)(\.|$)/.test(key)) delete state.sources[key];
  }
  state.answerRevision = 2;
}

const mapView = {tab:'board',area:'',product:'',profile:''};
if (location.hash === '#business') page = 2;
titles[2]='服务产品与用户画像';
subtitles[2]='一个产品可关联多份用户画像，同一份画像也可供多个产品复用。';

function visitMapStep(tab) {
  mapView.tab=tab;
  render();
  document.getElementById('map-step-title')?.focus({preventScroll:true});
  scrollTo(0,0);
}
function openProductCard(ai,pi,tab='service') {
  const a=state.businessAreas[ai];
  Object.assign(mapView,{area:a.id,product:a.products[pi].id,profile:''});
  visitMapStep(tab);
}
function openProfileCard(ai,idx) {
  const a=state.businessAreas[ai];
  Object.assign(mapView,{area:a.id,profile:a.profiles[idx].id,product:''});
  visitMapStep('profile');
}
function selectMapProduct(id) {
  mapView.product=id;
  mapView.tab='service';
  render();
}
function relatedProducts(a,pr) {
  return a.products.filter(p=>p.audiences.some(b=>b.profileId===pr.id));
}
function profileTitle(pr) {
  return pr.name || clientIdentityText(pr) || pr.types || '未命名用户画像';
}
function linkButton(label,action) {
  return `<button type="button" class="relation-link" onclick="${action}">${esc(label)}</button>`;
}
function boardCard(a,ai,item,index,product) {
  const title=product?(item.name||'未命名产品'):profileTitle(item);
  const action=product?`openProductCard(${ai},${index})`:`openProfileCard(${ai},${index})`;
  const related=product?item.audiences.flatMap(b=>{
    const idx=a.profiles.findIndex(pr=>pr.id===b.profileId);
    return idx<0?[]:[linkButton(profileTitle(a.profiles[idx]),`openProfileCard(${ai},${idx})`)];
  }):relatedProducts(a,item).map(p=>linkButton(p.name||'未命名产品',`openProductCard(${ai},${a.products.indexOf(p)})`));
  const summary=product?(item.services||item.issues):(item.scene||item.identities||item.types);
  const context=product?(item.core?'<span>核心产品</span>':''):esc(a.path);
  return `<article class="entity-card">${context?`<div class="entity-context">${context}</div>`:''}
    <h3><button class="entity-title" onclick="${action}">${esc(title)} <span aria-hidden="true">›</span></button></h3>
    ${summary?`<p class="entity-summary">${esc(summary)}</p>`:''}
    <div class="entity-relations"><small>${product?'服务的客户':'关联产品'}</small>
    ${related.length?related.join(''):`<span class="muted">${product?'尚未关联画像':'尚未关联产品'}</span>`}</div></article>`;
}
function saveAreaMatters(ai, input) {
  const items=[...new Set(input.value.split(/\r?\n/).map(line=>line.trim()).filter(Boolean))];
  put('businessAreas.'+ai+'.items',items);
  input.closest('details').querySelector('.matter-count').textContent=items.length+' 项';
}
function appendAreaMatter(ai, select) {
  if (!select.value) return;
  const input=select.closest('details').querySelector('textarea');
  if (!state.businessAreas[ai].items.includes(select.value)) {
    input.value=[...state.businessAreas[ai].items,select.value].join('\n');
    saveAreaMatters(ai,input);
  }
  select.value='';
}
function areaMatters(a,ai) {
  const id='matters-'+ai;
  const options=lib(a).items.map(v=>`<option>${esc(v)}</option>`).join('');
  return `<details class="area-matters" id="items-${esc(a.id)}">
    <summary>希望承接的具体事项 <small class="matter-count">${a.items.length} 项</small></summary>
    <label for="${id}">未来你希望通过自媒体获得哪些具体的法律业务或委托？</label>
    <p class="small muted">请尽量描述具体事项，而不是宽泛的法律领域。例如，不只是劳动纠纷，而是违法辞退赔偿、劳动合同审查、竞业限制纠纷等。每行填写一项。</p>
    <textarea id="${id}" rows="3" placeholder="请尽量描述具体事项，而不是宽泛的法律领域。例如，不只是劳动纠纷，而是违法辞退赔偿、劳动合同审查、竞业限制纠纷等。每行填写一项。" oninput="saveAreaMatters(${ai},this)">${esc(a.items.join('\n'))}</textarea>
    </details>`;
}
function productGroup(a,ai) {
  const cards=a.products.map((p,i)=>boardCard(a,ai,p,i,true)).join('');
  return `<section class="product-group" aria-labelledby="direction-${ai}">
    <div class="direction-head"><h3 id="direction-${ai}">${esc(a.path)} <small>${a.products.length} 款产品</small></h3>
      <button class="board-add" onclick="newEntityDialog('product',${ai})" aria-label="为${esc(a.path)}添加产品">＋ 添加产品</button></div>
    ${areaMatters(a,ai)}${cards}</section>`;
}
function businessBoard() {
  const areas=state.businessAreas;
  const productCount=areas.reduce((count,a)=>count+a.products.length,0);
  const profiles=areas.flatMap((a,ai)=>a.profiles.map((pr,i)=>boardCard(a,ai,pr,i,false)));
  const groups=areas.map(productGroup).join('');
  return `<section id="map-step-title" tabindex="-1" class="entity-board">
    <details class="board-settings" id="board-settings"><summary>业务方向与接案边界</summary>
      <div class="settings-fields flow-editor">${boardSettings()}</div></details>
    <div class="board-counts"><a href="#board-product" onclick="event.preventDefault();document.getElementById('board-product').scrollIntoView()">${productCount} 款产品</a><span>·</span>
    <a href="#board-profile" onclick="event.preventDefault();document.getElementById('board-profile').scrollIntoView()">${profiles.length} 类客户</a></div>
    <div class="entity-columns"><section class="entity-column product" id="board-product">
      <div class="entity-head"><h2>服务产品 <small>${productCount}</small></h2><button class="board-add" onclick="openBoardSettings()">＋ 业务方向</button></div>
      ${groups||'<p class="board-empty">尚未添加业务方向</p><button onclick="newEntityDialog(\'product\')">创建第一款产品</button>'}</section>
      <section class="entity-column profile" id="board-profile"><div class="entity-head"><h2>用户画像 <small>${profiles.length}</small></h2>
      <button class="board-add" onclick="newEntityDialog('profile')">＋ 新增画像</button></div>
      ${profiles.join('')||'<p class="board-empty">尚未添加用户画像</p>'}</section></div></section>`;
}
function newEntityDialog(type,ai,pi) {
  const dlg=document.getElementById('modal'), product=type==='product', fixed=ai!==undefined;
  const areas=state.businessAreas, current=areas[ai], paths=areas.map(a=>a.path);
  const catalog=business.map(g=>{
    const choices=g.items.map(i=>g.name+' / '+i).filter(path=>!paths.includes(path));
    return choices.length?`<optgroup label="${esc(g.name)}">${choices.map(path=>`<option value="${esc(path)}">${esc(path)}</option>`).join('')}</optgroup>`:'';
  }).join('');
  const select=paths.map(path=>`<option ${path===current?.path?'selected':''}>${esc(path)}</option>`).join('');
  dlg.innerHTML=`<form class="choice-form"><h2>添加${product?'产品':'用户画像'}</h2>
    <label>所属业务方向<select name="area" required ${fixed?'disabled':''}>${paths.length?'':'<option value="">请选择业务方向</option>'}${select}${fixed?'':catalog}</select></label>
    <label>${product?'产品名称':'画像名称'}<input name="name" required ${product?'list="product-suggestions"':''} placeholder="${product?'例如：劳动争议仲裁代理':'例如：遭遇违法解除的员工'}" autocomplete="off"></label>
    <datalist id="product-suggestions"></datalist><div class="editor-actions"><button type="button">取消</button><button class="primary">添加</button></div></form>`;
  const form=dlg.querySelector('form'), areaSelect=form.elements.area;
  function suggest() {
    if(product && areaSelect.value) dlg.querySelector('datalist').innerHTML=lib({path:areaSelect.value}).products.map(v=>`<option value="${esc(v)}"></option>`).join('');
  }
  suggest(); areaSelect.onchange=suggest;
  form.querySelector('[type=button]').onclick=()=>dlg.close();
  form.onsubmit=e=>{
    e.preventDefault();
    const name=form.elements.name.value.trim();
    if(!name){form.elements.name.value='';form.elements.name.reportValidity();return;}
    let a=areas.find(a=>a.path===areaSelect.value);
    if(!a){a=newArea(areaSelect.value);areas.push(a);}
    dlg.close();
    if(product){addMapProduct(areas.indexOf(a),name);return;}
    const pr=newProfile();pr.name=name;a.profiles.push(pr);
    if(pi!==undefined) a.products[pi].audiences.push({profileId:pr.id,note:''});
    Object.assign(mapView,{area:a.id,profile:pr.id,product:'',tab:'profile'});
    changed();scrollTo(0,0);
  };
  dlg.showModal();
  (areaSelect.value?form.elements.name:areaSelect).focus();
}
function renameBoardEntity(path,value) {
  put(path,value);
  document.getElementById('map-step-title').textContent=value||'未命名';
}
function mapSelect(label,items,action) {
  if(!items.length) return '';
  return `<label class="entity-select">${label}<select onchange="${action}"><option value="">请选择</option>${items.map(([id,name])=>`<option value="${esc(id)}">${esc(name)}</option>`).join('')}</select></label>`;
}
function productCustomers(a,p,ai,pi) {
  const list=p.audiences.map((b,ci)=>{
    const idx=a.profiles.findIndex(pr=>pr.id===b.profileId);
    if(idx<0) return '';
    const pr=a.profiles[idx], shared=relatedProducts(a,pr).length;
    return `<section class="binding"><h3>${linkButton(profileTitle(pr),`openProfileCard(${ai},${idx})`)}</h3>
      ${field(`businessAreas.${ai}.products.${pi}.audiences.${ci}.note`,'针对这类客户使用这项服务的情况，还有哪些你认为值得特别说明的事情？',{type:'textarea',placeholder:'选填，仅用于本产品与这类客户。'})}
      <div class="editor-actions">${shared>1?`<button onclick="independentProfile(${ai},${pi},${ci})">另存为独立画像</button>`:''}
      <button onclick="detachProfile(${ai},${pi},${ci})">解除关联</button></div></section>`;
  }).join('');
  const available=a.profiles.filter(pr=>!p.audiences.some(b=>b.profileId===pr.id));
  return (list||'<p class="muted">这款产品尚未关联用户画像。</p>')+
    mapSelect('关联已有画像',available.map(pr=>[pr.id,profileTitle(pr)]),`if(this.value)linkProfile(${ai},${pi},this.value)`)+
    `<div class="editor-actions"><button onclick="newEntityDialog('profile',${ai},${pi})">＋ 新建并关联画像</button></div>`+
    `<details id="extract-${esc(p.id)}"><summary>从描述中提取画像</summary>`+
    (p.audiences.length>1?mapSelect('提取到哪份画像',p.audiences.map(b=>[b.profileId,profileTitle(a.profiles.find(pr=>pr.id===b.profileId))]),'mapView.profile=this.value'):'')+
    `<button onclick="mockInterview(${ai},${pi})">模拟提取客户描述</button></details>`;
}
function productEditor(a,p,ai,pi) {
  const path='businessAreas.'+ai+'.products.'+pi;
  const tabs=[['service','产品内容'],['customers','用户画像 · '+p.audiences.length],['terms','收费与条件']];
  const nav=tabs.map(([key,label])=>`<button aria-pressed="${mapView.tab===key}" onclick="visitMapStep('${key}')">${label}</button>`).join('');
  let content;
  if(mapView.tab==='customers') content=productCustomers(a,p,ai,pi);
  else if(mapView.tab==='terms') content=billingUI(ai,pi)+field(path+'.conditions','这款产品有额外承接条件吗？',{type:'textarea'});
  else content=field(path+'.name','产品名称',{required:true,onInput:'renameBoardEntity'})+
    field(path+'.issues','客户遇到什么问题时会用到这项服务？',{type:'textarea',required:true})+
    field(path+'.services','你会为客户具体做哪些事？',{type:'textarea',required:true})+
    `<label class="flow-core"><input type="checkbox" ${p.core?'checked':''} onchange="put('${path}.core',this.checked)"> 核心产品</label>
    <details id="manage-${esc(p.id)}"><summary>管理产品</summary><div class="editor-actions"><button onclick="duplicateProduct(${ai},${pi})">复制产品</button>
    <button onclick="removeEntry('businessAreas.${ai}.products',${pi})">删除产品</button></div></details>`;
  return '<div class="editor-tabs">'+nav+'</div>'+content;
}
function personaEditor(a,pr,ai,idx) {
  const path='businessAreas.'+ai+'.profiles.'+idx;
  const linked=relatedProducts(a,pr), available=a.products.filter(p=>!linked.includes(p));
  const links=linked.map(p=>linkButton(p.name||'未命名产品',`openProductCard(${ai},${a.products.indexOf(p)},'customers')`)).join('');
  const q=(key,label)=>field(path+'.'+key,label,{type:'textarea',required:true});
  return field(path+'.name','画像名称',{onInput:'renameBoardEntity'})+
    '<h3>关联产品</h3><div class="entity-relations">'+(links||'<span class="muted">尚未关联产品</span>')+'</div>'+
    mapSelect('关联本业务方向的产品',available.map(p=>[a.products.indexOf(p),p.name||'未命名产品']),`if(this.value!=='')linkProfile(${ai},Number(this.value),mapView.profile)`)+
    (linked.length>1?`<p class="map-inherited">以下画像资料由这 ${linked.length} 款产品共用。</p>`:'')+
    '<div class="flow-pair">'+q('types','在这项法律业务中，你主要为哪些类型的客户提供服务？')+q('identities','回想过去实际接触过的这类客户，他们通常有哪些共同特征？')+'</div><div class="flow-pair">'+q('scene','他们遇到什么情况会来找你？')+q('request','这些客户找到你之后，真正希望解决什么问题，或者实现什么结果？')+'</div>'+
    `<details id="profile-extra-${esc(pr.id)}"><summary>客户原话与其他补充（选填）</summary>`+
    field(path+'.worry','客户最担心什么？',{type:'textarea'})+rows(path+'.questions','回想你平时接待这类客户的场景，他们最经常问你哪些问题？请尽量还原客户的原话。','可以记录一句客户的原话')+
    field(path+'.ideal','在过去接触过的客户中，哪些类型的客户是你未来希望更多服务的？为什么？',{type:'textarea'})+'</details>';
}
function boardSettings() {
  return '<h3>通用接案边界</h3>'+ 
    field('global.exclude','有哪些类型的案件、法律事务或委托，即使客户主动找到你，你也通常不会承接？',{type:'textarea',required:true,placeholder:'没有额外限制可填“暂无”。'})+
    mapDirection();
}
function openBoardSettings(inputId='f_businessAreas_input') {
  const panel=document.getElementById('board-settings');
  panel.open=true;
  requestAnimationFrame(()=>{
    const target=document.getElementById(inputId)||panel.querySelector('summary');
    target.focus({preventScroll:true});
    target.scrollIntoView({block:'center'});
  });
}
function renderBusinessEditor() {
  prepareCatalog();migrateBilling();
  for (const a of state.businessAreas) {
    const [parent,...parts]=a.path.split(' / '), leaf=parts.join(' / '), group=business.find(g=>g.name===parent);
    if(group&&leaf&&!group.items.includes(leaf)) group.items.push(leaf);
  }
  const ai=state.businessAreas.findIndex(a=>a.id===mapView.area), a=state.businessAreas[ai];
  const pi=a?.products.findIndex(p=>p.id===mapView.product)??-1;
  const idx=a?.profiles.findIndex(pr=>pr.id===mapView.profile)??-1;
  let title, content;
  if(mapView.tab==='profile'&&idx>=0) {title=profileTitle(a.profiles[idx]);content=personaEditor(a,a.profiles[idx],ai,idx);}
  else if(['service','customers','terms'].includes(mapView.tab)&&pi>=0) {title=a.products[pi].name||'未命名产品';content=productEditor(a,a.products[pi],ai,pi);}
  else {mapView.tab='board';return businessBoard();}
  return `<section class="business-editor flow-editor entity-editor"><button class="back-board" onclick="visitMapStep('board')">‹ 产品总览</button>
    <p class="small muted">${esc(a.path)}</p><h2 id="map-step-title" tabindex="-1">${esc(title)}</h2>${content}</section>`;
}
reviseAnswers();
businessPage=renderBusinessEditor;
addMapProduct=function(ai,name) {
  const a=state.businessAreas[ai], p=newMapProduct(name);
  p.core=!state.businessAreas.some(a=>a.products.some(item=>item.core));
  a.products.push(p);
  Object.assign(mapView,{area:a.id,product:p.id,tab:'service',profile:''});
  changed();scrollTo(0,0);
};
editProduct=function(id,tab='service') {
  const a=state.businessAreas.find(a=>a.products.some(p=>p.id===id));
  if(!a)return;
  Object.assign(mapView,{area:a.id,product:id,tab});
  if(tab==='customers' && mapView.profile && a.profiles.some(pr=>pr.id===mapView.profile)) mapView.tab='profile';
  go(2,true);
};
