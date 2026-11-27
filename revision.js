// Keep stable page IDs and stored answers while consolidating the visible workflow.
titles[2]='法律服务'; titles[3]='达人风格';
subtitles[2]='选择未来重点发展的法律业务，按优先级完善法律服务与用户画像。';
subtitles[3]='上传表达材料，添加自媒体账号，补充表达边界与达人参考。';
const visiblePages=[0,1,2,3,4,6];
state.jobs.forEach(j=>j.id ||= uid());
state.expression.files ||= [];
const originalNewCareerJob=newCareerJob;
newCareerJob=function(){return {...originalNewCareerJob(),id:uid()};};
// Existing cases remain available for assignment rather than guessing an employer.
function addCareerCase(index){
 if(!state.jobs.length){editingCareerJob=newCareerJob();state.jobs.push(editingCareerJob);}
 const job=state.jobs[index];job.id ||= uid();
 const c=newCase();c.jobId=job.id;state.supplement.cases.push(c);editingCareerJob=job;changed();
}
function careerCases(job,index){
 const cases=state.supplement.cases.map((c,i)=>({c,i})).filter(({c})=>job.id&&c.jobId===job.id);
 return `<section class="career-cases"><div class="row"><h3>案例库</h3><button type="button" onclick="addCareerCase(${index})">添加案例</button></div>${cases.map(({i})=>caseCard(i)).join('')||'<p class="small muted">为这段职业经历添加代表案例，可添加多个。</p>'}</section>`;
}
const originalCareerEntry=careerEntry;
careerEntry=function(job,index,open){return originalCareerEntry(job,index,open).replace('<button type="button" class="career-delete"',careerCases(job,index)+'<button type="button" class="career-delete"');};
const originalCareerPage=careerPage;
careerPage=function(){
 const unassigned=state.supplement.cases.map((c,i)=>({c,i})).filter(({c})=>!state.jobs.some(j=>j.id&&j.id===c.jobId));
 return originalCareerPage()+(unassigned.length?box('待归属案例', '<p class="small muted">已有案例已保留，请选择对应的职业经历。</p>'+unassigned.map(({c,i})=>`<div class="field"><label>${esc(c.name||'未命名案例')} · 所属职业经历</label><select aria-label="案例所属职业经历" onchange="put('supplement.cases.${i}.jobId',this.value);render()"><option value="">请选择</option>${state.jobs.map((j,n)=>`<option value="${esc(j.id)}">${esc(jobHeading(j,n))}</option>`).join('')}</select></div>${caseCard(i)}`).join('')):'');
};
const originalBoard=businessBoard;
businessBoard=function(){
 const root=document.createElement('div');root.innerHTML=originalBoard();
 root.querySelector('#board-settings')?.remove();
 const heading=root.querySelector('.entity-head .board-add');if(heading)heading.remove();
 return box('业务发展方向',mapDirection())+root.innerHTML+`<section id="board-settings" class="card section-body"><h2>接案偏好与限制</h2>${boardSettings()}</section>`;
};
boardSettings=function(){return field('global.exclude','有哪些类型的案件、法律事务或委托，即使客户主动找到你，你也通常不会承接？',{type:'textarea',placeholder:'选填，可补充不承接的案件、法律事务或委托。'});};
openBoardSettings=function(inputId='f_businessAreas_input'){const target=document.getElementById(inputId)||document.getElementById('board-settings');target?.scrollIntoView({block:'center'});target?.focus();};
function addStyleFiles(input){put('expression.files',[...new Set([...state.expression.files,...Array.from(input.files,f=>f.name)])]);render();}
expressionLatest=function(){
 const upload=box('文件上传',`<label for="style-files">上传自我介绍、音视频或其他表达材料</label><input id="style-files" type="file" multiple onchange="addStyleFiles(this)"><p class="small muted">原型仅记录文件名，不上传或保存文件内容。</p>${state.expression.files.map((name,i)=>`<div class="row"><span>${esc(name)}</span><button onclick="state.expression.files.splice(${i},1);changed()">移除</button></div>`).join('')}`+field('expression.links','参考链接',{type:'textarea'}));
 return upload+`<section class="style-accounts"><h2>自媒体账号</h2>${accountPage()}</section>`+box('表达边界',field('expression.taboo','有哪些话题，即使与你的专业领域或职业经历有关，你也不希望在公开平台讨论？',{type:'textarea',placeholder:'没有额外限制可填“暂无”。'}))+box('达人参考',field('expression.liked','偏好达人链接',{type:'textarea'})+field('expression.disliked','不偏好的达人或内容链接',{type:'textarea'}));
};
const originalGo=go;
go=function(i,...args){originalGo(i===5?1:i,...args);};
nextPage=function(){if(page===3){generatePortrait();return;}if(page===6){if(!state.portrait||portraitStale())generatePortrait();else confirmPortrait();return;}go(visiblePages[visiblePages.indexOf(page)+1]);};
const originalRenderRevision=render;
function serviceVocabulary(root){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
 while(node=walker.nextNode())node.textContent=node.textContent.replaceAll('服务产品','法律服务').replaceAll('产品','服务').replaceAll('款服务','项服务').replaceAll('通用接案边界','接案偏好与限制');
 root.querySelectorAll('.product-delete').forEach(b=>{b.textContent='删除服务';b.setAttribute('aria-label','删除服务');});
}
render=function(){
 if(page===5)page=1;
 originalRenderRevision();
 $('#nav').innerHTML=visiblePages.map((id,i)=>`<button class="nav ${page===id?'active':''}" onclick="go(${id})">${id===6?'':String(i+1).padStart(2,'0')+'. '}${titles[id]}</button>`).join('');
 $('#step').textContent=page===6?'问卷结果':`步骤 ${visiblePages.indexOf(page)+1} / 5`;
 const prev=$('#prev'),next=$('#next');
 if(page!==2||mapView.tab==='board'){
 prev.disabled=page===0;prev.textContent=page===6?'返回问卷':'上一步';prev.onclick=()=>go(page===6?4:visiblePages[visiblePages.indexOf(page)-1]);
 next.onclick=()=>nextPage();if(page===4){next.textContent=state.portrait?'更新画像':'生成画像';next.disabled=false;}
 }
 if(page===2||page===6)serviceVocabulary($('#content'));
};
// Group the generated portrait using the same visible questionnaire modules.
const originalPortraitBody=portraitBody;
portraitBody=function(p){
 const root=document.createElement('div');root.innerHTML=originalPortraitBody(p);
 const sections=[...root.children],s=p.input;
 sections[0]?.querySelector('.section-body')?.insertAdjacentHTML('beforeend',portraitRows([['人生地图补充',s.base.lifeSupplement]]));
 const style=sections[3];if(style){style.querySelector('h2').textContent='达人风格';style.querySelector('.section-body').insertAdjacentHTML('beforeend',portraitRows([['上传材料',s.expression.files]])+(sections[4]?.querySelector('.section-body')?.innerHTML||''));}
 sections[4]?.remove();sections[5]?.remove();
 const career=sections[1]?.querySelector('.section-body');
 if(career){career.innerHTML=s.jobs.map((j,i)=>`<h3>${esc(jobHeading(j,i))}</h3>${portraitRows([['任职机构',j.organization],['岗位',j.position],['任职时间',j.time],['主要职责',j.responsibility],['印象深刻的事或人',j.moment],['补充',j.supplement]])}<h4>案例库</h4>${(s.supplement.cases||[]).filter(c=>j.id&&c.jobId===j.id).map(c=>portraitRows([['案例名称',c.name],['事项类型',c.type],['法律领域',c.domain],['涉及行业',c.industry],['客户类型',c.client],['客户处境',c.situation],['触发事件',c.trigger],['委托背景',c.background],['补充',c.goal],['附件',c.files]])).join('')||'<p class="muted">尚未添加案例</p>'}`).join('');
 const pending=s.supplement.cases.filter(c=>!s.jobs.some(j=>j.id&&j.id===c.jobId));if(pending.length)career.insertAdjacentHTML('beforeend','<h4>待归属案例</h4>'+pending.map(c=>portraitRows([['案例名称',c.name],['委托背景',c.background]])).join(''));}
 serviceVocabulary(root);return root.innerHTML;
};
const originalDialog=newEntityDialog;
newEntityDialog=function(...args){originalDialog(...args);serviceVocabulary($('#modal'));};
// Style collects account identity only; operational metrics are retired from the form.
accountPage=function(){
 return '<div class="page-action-bar"><button class="primary" onclick="openAccountEditor()">添加自媒体账号</button></div>'+state.accounts.map((a,i)=>{
  const url=webAddress(a.link);
  return box(esc(accountTitle(a)),`<div class="row account-link-row"><span>${url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(a.link)}</a>`:esc(a.link||'尚未填写账号链接')}</span><div class="record-actions"><button onclick="openAccountEditor(${i})">编辑账号</button><button class="action-delete" onclick="removeEntry('accounts',${i})">删除账号</button></div></div>`);
 }).join('');
};
consultationLinksSummary=function(input){return (input.accounts||[]).map(a=>`<div class="portrait-area"><h3>${esc(accountTitle(a))}</h3>${portraitRows([['账号主页',a.link]])}</div>`).join('')||'<p class="muted">尚未添加账号</p>';};
invalidWorkField=function(){return null;};
// Primary domains own services; each service records its secondary domain.
function migratePrimaryDomains(){
 if(state.domainStructure===2&&!state.businessAreas.some(a=>a.path.includes(' / ')))return;
 const areas=[],mapping=[];
 state.businessAreas.forEach((a,ai)=>{
  const [primary,...rest]=a.path.split(' / ');let target=areas.find(x=>x.path===primary);
  if(!target){target={...a,path:primary,products:[],profiles:[]};areas.push(target);}
  const dest=areas.indexOf(target),po=target.products.length,pr=target.profiles.length;
  a.products.forEach(p=>{p.secondaryDomain ||= rest.join(' / ');target.products.push(p);});
  target.profiles.push(...a.profiles);target.items=[...new Set([...target.items,...a.items])];
  mapping[ai]={dest,po,pr};
 });
 const sources={};for(const [key,value] of Object.entries(state.sources||{})){
  const m=/^businessAreas\.(\d+)(?:\.(products|profiles)\.(\d+))?(.*)$/.exec(key);
  if(!m){sources[key]=value;continue;}const move=mapping[+m[1]];
  if(move)sources[`businessAreas.${move.dest}${m[2]?'.'+m[2]+'.'+(+m[3]+(m[2]==='products'?move.po:move.pr)):''}${m[4]}`]=value;
 }
 state.sources=sources;state.businessAreas=areas;state.domainStructure=2;
}
prepareCatalog=function(){};
migratePrimaryDomains();
function secondaryOptions(a,current=''){
 const options=[...new Set([...(business.find(g=>g.name===a.path)?.items||[]),current].filter(Boolean))];
 return options.map(name=>`<option value="${esc(name)}" ${name===current?'selected':''}>${esc(name)}</option>`).join('');
}
function createBusinessDomain(){
 const dlg=$('#modal');
 dlg.innerHTML=`<form class="choice-form"><h2>创建业务领域</h2><label>一级业务领域<select name="primary" required><option value="">请选择一级领域</option>${business.filter(g=>!state.businessAreas.some(a=>a.path===g.name)).map(g=>`<option>${esc(g.name)}</option>`).join('')}</select></label><div class="editor-actions"><button type="button">取消</button><button class="primary">创建领域</button></div></form>`;
 const form=dlg.querySelector('form');form.querySelector('[type=button]').onclick=()=>dlg.close();
 form.onsubmit=e=>{e.preventDefault();const primary=form.elements.primary.value;if(!primary)return;state.businessAreas.push(newArea(primary));dlg.close();mapView.tab='board';changed();};dlg.showModal();
}
newEntityDialog=function(type,ai,pi){
 if(type!=='product'){originalDialog(type,ai,pi);return;}
 if(ai===undefined){createBusinessDomain();return;}
 const a=state.businessAreas[ai],dlg=$('#modal');
 dlg.innerHTML=`<form class="choice-form"><h2>创建法律服务</h2><p class="muted">一级业务领域：${esc(a.path)}</p><label>二级业务领域<select name="secondary" required><option value="">请选择二级领域</option>${secondaryOptions(a)}</select></label><label>服务名称<input name="name" required placeholder="例如：劳动争议仲裁代理"></label><div class="editor-actions"><button type="button">取消</button><button class="primary">创建服务</button></div></form>`;
 const form=dlg.querySelector('form');form.querySelector('[type=button]').onclick=()=>dlg.close();
 form.onsubmit=e=>{e.preventDefault();const name=form.elements.name.value.trim(),secondary=form.elements.secondary.value;if(!name||!secondary)return;dlg.close();addMapProduct(ai,name);state.businessAreas[ai].products.at(-1).secondaryDomain=secondary;changed();};dlg.showModal();
};
businessBoard=function(){
 const count=state.businessAreas.reduce((n,a)=>n+a.products.length,0);
 return `<section id="map-step-title" tabindex="-1" class="entity-board"><div class="entity-head"><h2>法律服务 <small>${count}</small></h2><button class="primary" onclick="createBusinessDomain()">创建业务领域</button></div>${state.businessAreas.map((a,ai)=>`<section class="product-group"><div class="direction-head"><h3>${esc(a.path)} <small>${a.products.length} 项服务</small></h3><button class="board-add" onclick="newEntityDialog('product',${ai})">创建法律服务</button></div><div class="product-sort-list">${a.products.map((p,pi)=>boardCard(a,ai,p,pi,true).replace('<strong>',`<span class="small muted">${esc(p.secondaryDomain||'待选择二级领域')}</span><strong>`)).join('')||'<p class="board-empty">还没有法律服务，点击“创建法律服务”选择二级领域并完善内容。</p>'}</div></section>`).join('')||'<p class="board-empty">先创建一级业务领域，再在领域下创建法律服务。</p>'}</section>`+box('接案目标与偏好',field('global.consultations','您希望每月通过自媒体获得多少有效咨询？',{type:'select',options:['暂无明确目标','1—5','6—10','11—30','31以上']})+`<div id="board-settings">${boardSettings()}</div>`);
};
const editorBeforeSecondary=productEditor;
productEditor=function(a,p,ai,pi){return `<div class="field"><label>二级业务领域 <span class="required">必填</span></label><select aria-label="二级业务领域" onchange="put('businessAreas.${ai}.products.${pi}.secondaryDomain',this.value)"><option value="">请选择二级领域</option>${secondaryOptions(a,p.secondaryDomain)}</select></div>`+editorBeforeSecondary(a,p,ai,pi);};
const validationBeforePrimary=validate;
validate=function(){return validationBeforePrimary().map(issue=>({...issue,text:issue.text.replace('二级业务领域','业务领域')})).concat(state.businessAreas.flatMap(a=>a.products.filter(p=>!p.secondaryDomain).map(p=>({page:2,text:p.name+'：选择二级业务领域',productId:p.id,gap:'二级业务领域'}))));};
subtitles[2]='先创建业务领域，再选择二级领域，完善法律服务与用户画像。';
// Provide a stable deletion action in both the service list and the service editor.
function deleteLegalService(ai,id){
 const a=state.businessAreas[ai],p=a?.products.find(p=>p.id===id);if(!p)return;
 const dlg=$('#modal');dlg.innerHTML=`<h2>删除法律服务？</h2><p>确定删除“${esc(p.name)}”及其服务配置？</p><div class="row"><button type="button" id="cancelServiceDelete">取消</button><button type="button" class="primary" id="confirmServiceDelete">删除服务</button></div>`;
 $('#cancelServiceDelete').onclick=()=>dlg.close();
 $('#confirmServiceDelete').onclick=()=>{
  const index=a.products.findIndex(p=>p.id===id);if(index<0)return;
  a.products.splice(index,1);
  const sources={};for(const [key,value] of Object.entries(state.sources||{})){
   const m=/^businessAreas\.(\d+)\.products\.(\d+)(.*)$/.exec(key);
   if(!m||+m[1]!==ai){sources[key]=value;continue;}
   if(+m[2]!==index)sources[`businessAreas.${ai}.products.${+m[2]>index?+m[2]-1:+m[2]}${m[3]}`]=value;
  }state.sources=sources;
  if(mapView.product===id){mapView.product='';mapView.tab='board';}
  dlg.close();changed();toast('法律服务已删除');
 };dlg.showModal();
}
const cardBeforeDeleteFix=boardCard;
boardCard=function(a,ai,p,pi,product){const root=document.createElement('div');root.innerHTML=cardBeforeDeleteFix(a,ai,p,pi,product);if(product){const b=root.querySelector('.product-delete');b?.setAttribute('onclick',`deleteLegalService(${ai},'${p.id}')`);}return root.innerHTML;};
const editorBeforeDeleteFix=productEditor;
productEditor=function(a,p,ai,pi){return `<div class="editor-actions"><button type="button" class="action-delete" onclick="deleteLegalService(${ai},'${p.id}')">删除服务</button></div>`+editorBeforeDeleteFix(a,p,ai,pi);};
const validationBeforeOptionalExclude=validate;
validate=function(){return validationBeforeOptionalExclude().filter(issue=>issue.text!=='不承接范围');};
const portraitBeforeReferenceRename=portraitBody;
portraitBody=function(p){return portraitBeforeReferenceRename(p).replaceAll('表达参考链接','参考链接');};
function deleteBusinessDomain(id){
 const a=state.businessAreas.find(a=>a.id===id);if(!a)return;
 const dlg=$('#modal');dlg.innerHTML=`<h2>删除业务领域？</h2><p>将删除“${esc(a.path)}”及其中的 ${a.products.length} 项法律服务、客户画像和填写内容。</p><div class="editor-actions"><button id="cancelDomainDelete">取消</button><button class="primary" id="confirmDomainDelete">删除领域</button></div>`;
 $('#cancelDomainDelete').onclick=()=>dlg.close();$('#confirmDomainDelete').onclick=()=>{
  const index=state.businessAreas.findIndex(a=>a.id===id);if(index<0)return;
  state.businessAreas.splice(index,1);
  const sources={};for(const [key,value] of Object.entries(state.sources||{})){
   const m=/^businessAreas\.(\d+)(.*)$/.exec(key);
   if(!m){sources[key]=value;continue;}if(+m[1]!==index)sources[`businessAreas.${+m[1]>index?+m[1]-1:+m[1]}${m[2]}`]=value;
  }state.sources=sources;if(mapView.area===id)Object.assign(mapView,{area:'',product:'',profile:'',tab:'board'});
  dlg.close();changed();toast('业务领域已删除');
 };dlg.showModal();
}
productEditor=function(a,p,ai,pi){const root=document.createElement('div');root.innerHTML=editorBeforeDeleteFix(a,p,ai,pi);root.querySelectorAll('button').forEach(b=>{if(b.textContent.trim()==='删除产品'||b.textContent.trim()==='删除服务')b.remove();});return root.innerHTML;};
businessBoard=function(){
 const count=state.businessAreas.reduce((n,a)=>n+a.products.length,0);
 return `<div class="legal-workspace"><section id="map-step-title" tabindex="-1"><div class="legal-toolbar"><div><span class="legal-eyebrow">我的法律业务</span><h2>业务领域与服务</h2><p>按领域整理服务，点击服务填写内容、客户画像与收费。</p></div><button class="primary" onclick="createBusinessDomain()">＋ 创建业务领域</button></div><div class="legal-summary"><span><strong>${state.businessAreas.length}</strong> 个业务领域</span><span><strong>${count}</strong> 项法律服务</span><span class="legal-summary-hint">服务按组内优先级排列，可拖动调整</span></div><div class="legal-domains">${state.businessAreas.map((a,ai)=>`<section class="legal-domain"><header class="legal-domain-header"><div class="legal-domain-identity"><span class="legal-domain-number">${String(ai+1).padStart(2,'0')}</span><div><h3>${esc(a.path)}</h3><p>一级领域 <span>·</span> ${a.products.length} 项法律服务</p></div></div><div class="legal-domain-actions"><button class="legal-create-service" onclick="newEntityDialog('product',${ai})">＋ 创建服务</button><button class="legal-delete-domain" onclick="deleteBusinessDomain('${a.id}')">删除领域</button></div></header><div class="legal-services">${a.products.length?`<div class="legal-list-caption"><span>优先级 / 服务</span><span>操作</span></div><div class="product-sort-list">${a.products.map((p,pi)=>boardCard(a,ai,p,pi,true).replace('<strong>',`<span class="legal-secondary">${esc(p.secondaryDomain||'待选择二级领域')}</span><strong>`).replace('</button>\n <button class="product-delete"','</button>\n <button class="product-delete"')).join('')}</div>`:`<div class="legal-empty"><strong>开始创建这个领域的第一项服务</strong><p>选择二级领域，填写服务名称，再逐步完善服务内容。</p></div>`}</div></section>`).join('')||'<div class="legal-empty legal-domain"><strong>从一个擅长的业务领域开始</strong><p>先选择一级领域，再创建具体的法律服务。</p></div>'}</div></section><section class="legal-preferences"><div class="legal-preference-heading"><span class="legal-eyebrow">整体接案设置</span><h2>接案目标与偏好</h2><p>适用于所有业务领域，可根据实际情况选填。</p></div><div class="legal-preference-fields">${field('global.consultations','您希望每月通过自媒体获得多少有效咨询？',{type:'select',options:['暂无明确目标','1—5','6—10','11—30','31以上']})}<div id="board-settings">${boardSettings()}</div></div></section></div>`;
};
subtitles[2]='整理你的业务领域与法律服务，让专业方向一目了然。';
// Start a new service directly in the complete editor.
newEntityDialog=function(type,ai,pi){
 if(type!=='product'){originalDialog(type,ai,pi);return;}
 if(ai===undefined){createBusinessDomain();return;}
 addMapProduct(ai,'');
 requestAnimationFrame(()=>document.querySelector('select[aria-label="二级业务领域"]')?.focus({preventScroll:true}));
};
// One continuous form follows the order in which a service is defined.
productEditor=function(a,p,ai,pi){
 const path=`businessAreas.${ai}.products.${pi}`;
 const block=(number,title,body)=>`<section class="service-form-section"><div class="service-form-heading"><span>${number}</span><h3>${title}</h3></div><div class="service-form-fields">${body}</div></section>`;
 const basics=field(path+'.name','服务名称',{required:true,onInput:'renameBoardEntity'})+`<div class="field"><label>二级业务领域 <span class="required">必填</span></label><select aria-label="二级业务领域" onchange="put('${path}.secondaryDomain',this.value)"><option value="">请选择二级领域</option>${secondaryOptions(a,p.secondaryDomain)}</select></div>`;
 const content=field(path+'.issues','客户遇到什么问题时会用到这项服务？',{type:'textarea',required:true})+field(path+'.services','你会为客户具体做哪些事？',{type:'textarea',required:true});
 const customers=productCustomers(a,p,ai,pi).replaceAll('用户画像名称','目标用户名称').replaceAll('用户画像','目标用户');
 return '<div class="continuous-service-form">'+block('01','基本信息',basics)+block('02','服务内容',content)+block('03','目标用户',customers)+block('04','收费方式',billingUI(ai,pi))+block('05','承接条件',field(path+'.conditions','这项服务有额外承接条件吗？',{type:'textarea',placeholder:'选填，例如涉案金额、案件阶段、地域或其他限制。'}))+'<p class="service-form-saved">填写内容自动保存，完成后返回服务列表。</p></div>';
};
const vocabularyBeforeTargetUsers=serviceVocabulary;
serviceVocabulary=function(root){vocabularyBeforeTargetUsers(root);const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode())node.textContent=node.textContent.replaceAll('用户画像','目标用户').replaceAll('客户画像','目标用户');};
save();render();
