// Read current answers directly; viewing the overview never generates a portrait.
function ipAnswer(value){
 if(Array.isArray(value))return value.map(ipAnswer).filter(Boolean).join('\n');
 return typeof value==='string'||typeof value==='number'?String(value).trim():'';
}
function ipRows(items){
 const filled=items.map(([label,value])=>[label,ipAnswer(value)]).filter(([,value])=>value);
 return filled.length?`<dl class="ip-overview-fields">${filled.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`:'';
}
function ipGroup(title,body){return body?`<div class="ip-overview-group"><h3>${esc(title)}</h3>${body}</div>`:'';}
function ipEmpty(label){return `<p class="ip-overview-empty">${esc(label)}</p>`;}
function ipSection(title,index,body){return `<section class="ip-overview-section" id="ip-overview-${index}"><div class="ip-overview-heading"><h2>${esc(title)}</h2><button type="button" class="ant-btn ant-btn-text" onclick="go(${index})" aria-label="编辑${esc(title)}">编辑</button></div>${body||ipEmpty('尚未填写')}</section>`;}
function ipFiles(files){return ipAnswer((files||[]).map(f=>typeof f==='string'?f:f.name));}
function ipIdentityOverview(){
 const b=state.base;
 const basics=ipRows([
  ['简历',state.resumeImport?.name],['姓名',b.name],['对外展示称呼',b.display],['角色身份',b.role],
  ['所在律所',b.role==='个人律师'?'':b.firm],['执业年限',b.years],['职业资格',b.qualification],['MBTI',b.mbti],
  ['可使用语言',b.languages],['其他方言或语言',b.languages?.includes('其他方言或语言')?b.languageOther:'']
 ]);
 const locations=ipRows([['所在城市',b.city],['是否接受异地办案？',b.outOfTown]]);
 const practice=(state.experience||[]).map(e=>ipRows([['执业领域',e.domain==='其他'?e.other:e.domain],['该领域执业年限',e.years]])).filter(Boolean).join('');
 const education=ipRows([['毕业院校',b.school],['学历',b.degree],['所学专业',b.major],['复合学科背景',b.cross],['专业认证',b.certification],['其他行业资格',b.otherQualification]]);
 const publicWorks=ipRows([['社会职务',b.social],['行业协会任职',b.association],['奖项与荣誉',b.honors],['公开著作',b.books],['公开课程链接',b.courses],['公开演讲链接',b.talks],['媒体采访链接',b.interviews],['附件',ipFiles(b.publicAttachments)]]);
 const life=ipRows([['当初是什么原因让你选择成为一名律师？',b.motivation],['可以用哪些标签形容你？',b.personalTags],['有什么补充吗？',b.lifeSupplement]]);
 return ipGroup('基础信息',basics)+ipGroup('执业与接案地点',locations)+ipGroup('执业领域',practice)+ipGroup('教育与专业资质',education)+ipGroup('公开任职、荣誉与作品',publicWorks)+ipGroup('人生地图',life);
}
function ipCaseOverview(c){
 return `<details class="ip-overview-case"><summary>${esc(c.name||'未命名案例')}${c.isMock?'<span class="ip-overview-demo">示例</span>':''}</summary>${ipRows([
  ['案例名称',c.name],['诉讼或非诉事项类型',c.type],['事项所属法律领域',c.domain],['涉及行业',c.industry],['客户类型',c.client],
  ['在这件事情发生时，客户处于什么样的生活、工作或经营状态？',c.situation],
  ['具体发生了什么事情，让客户意识到自己需要寻求律师帮助？',c.trigger],
  ['委托你之前，客户尝试过哪些解决办法？为什么最终委托你？',c.background],['还有什么补充的？',c.goal],['案例材料',ipFiles(c.files)]
 ])}${c.sourceText?`<details class="ip-overview-source"><summary>材料原文</summary><pre>${esc(c.sourceText)}</pre></details>`:''}</details>`;
}
function ipCareerOverview(){
 const jobs=state.jobs||[],cases=state.supplement?.cases||[];
 const histories=jobs.map((j,i)=>{
  const fields=ipRows([['任职机构',j.organization],['担任的岗位',j.position],['任职时间',j.time],['这段经历里，你主要负责什么？',j.responsibility],['回顾这段经历，有没有哪件事情/哪个人让你印象深刻',j.moment],['你还有什么想补充的吗？',j.supplement]]);
  const related=cases.filter(c=>c.jobId===j.id);
  return ipGroup(jobHeading(j,i),fields+(related.length?`<div class="ip-overview-related"><h4>相关案例 <span>${related.length}</span></h4>${related.map(ipCaseOverview).join('')}</div>`:'' )||ipEmpty('尚未填写经历内容'));
 }).join('');
 const unassigned=cases.filter(c=>!jobs.some(j=>j.id===c.jobId));
 return histories+ipGroup('待归属案例',unassigned.map(ipCaseOverview).join(''));
}
function ipServiceOverview(a,p){
 const fields=ipRows([['服务名称',p.name],['场景',p.services],['收费区间',p.feeRange],['这项服务有哪些额外承接条件？',p.conditions],['此前填写的法律问题',p.issues]]);
 const clients=(p.audiences||[]).map(binding=>{
  const pr=(a.profiles||[]).find(pr=>pr.id===binding.profileId);if(!pr)return '';
  return ipRows([['目标客户',pr.types],['客户需求',pr.scene],['目标用户名称',pr.name],['这类客户通常有哪些共同特征？',clientIdentityText(pr)],['客户最担心什么？',pr.worry],['客户经常问的问题',pr.questions],['你希望更多服务哪类客户？为什么？',pr.ideal],['关于这类客户，还有什么值得补充？',binding.note]]);
 }).join('');
 return `<div class="ip-overview-service"><h4>${esc(p.name||'未命名服务')}</h4>${fields||clients?fields+clients:ipEmpty('尚未填写服务内容')}</div>`;
}
function ipLegalOverview(){
 const areas=(state.businessAreas||[]).map(a=>ipGroup(a.path,ipRows([['二级业务领域',a.selectedSecondaryDomains]])+(a.products||[]).map(p=>ipServiceOverview(a,p)).join('')||ipEmpty('尚未创建法律服务'))).join('');
 return areas+ipGroup('接案目标与偏好',ipRows([['您希望每月通过自媒体获得多少有效咨询？',state.global?.consultations],['有哪些类型的案件、法律事务或委托，即使客户主动找到你，你也通常不会承接？',state.global?.exclude]]));
}
function ipStyleOverview(){
 const e=state.expression||{},accounts=(state.accounts||[]).filter(a=>a.link||a.authorizationDemo);
 const accountInfo=accounts.map(a=>ipRows([['自媒体账号',accountTitle(a)],['账号链接',a.link],['授权状态',a.authorizationDemo?'演示已连接':'']])).join('');
 return ipGroup('账号与参考素材',accountInfo+ipRows([['自我介绍、音视频或其他表达材料',ipFiles(e.files)],['参考链接',e.links]]))+ipGroup('表达偏好与边界',ipRows([['偏好达人链接',e.liked],['不偏好达人链接',e.disliked],['有哪些话题，即使与你的专业领域或职业经历有关，你也不希望在公开平台讨论？',e.taboo]]));
}
function ipMaterialsOverview(){
 return (state.extraMaterials?.files||[]).map(f=>ipGroup(f.name,ipRows([['文件',f.name],['内容描述',f.description]]))).join('');
}
review=function(){return `<div class="ip-overview">${ipSection('个人与执业信息',0,ipIdentityOverview())}${ipSection('职业经历',1,ipCareerOverview())}${ipSection('法律服务',2,ipLegalOverview())}${ipSection('达人风格',3,ipStyleOverview())}${ipSection('补充材料',4,ipMaterialsOverview())}</div>`;};
const vocabularyBeforeIpOverview=serviceVocabulary;
serviceVocabulary=function(root){if(!root.querySelector('.ip-overview'))vocabularyBeforeIpOverview(root);};
titles[6]='IP定位';
subtitles[6]='已填写信息总览';
nextPage=function(){if(page===6)return;go(visiblePages[visiblePages.indexOf(page)+1]);};
let ipNavigationExpanded=true;
try{ipNavigationExpanded=sessionStorage.getItem('kalu-ip-navigation-expanded')!=='false';}catch{}
function syncIpNavigation(){
 const trigger=document.querySelector('#nav .product-nav-current'),children=$('#ip-positioning-nav');
 if(!trigger||!children)return;
 trigger.setAttribute('aria-expanded',String(ipNavigationExpanded));
 children.hidden=!ipNavigationExpanded;
}
function toggleIpNavigation(){
 ipNavigationExpanded=!ipNavigationExpanded;
 try{sessionStorage.setItem('kalu-ip-navigation-expanded',String(ipNavigationExpanded));}catch{}
 syncIpNavigation();
}
const renderBeforeIpOverview=render;
render=function(){
 renderBeforeIpOverview();
 const nav=$('#nav');
 const trigger=nav.querySelector('.product-nav-current');
 if(trigger){
  trigger.setAttribute('onclick','toggleIpNavigation()');
  const arrow=document.createElement('span');arrow.className='ip-navigation-arrow';arrow.setAttribute('aria-hidden','true');trigger.append(arrow);
 }
 syncIpNavigation();
 const overviewLink=nav.querySelector('.product-nav-children button:last-child');
 if(overviewLink)overviewLink.textContent='填写总览';
 $('#crumb').textContent='IP定位 / '+titles[page];
 if(page===4&&!collectionDetail){const next=$('#next');next.textContent='查看总览';next.disabled=false;next.onclick=()=>go(6);}
 if(page===6){
  $('#step').textContent='填写总览';
  $('#next').hidden=true;
  const prev=$('#prev');prev.textContent='返回填写';prev.disabled=false;prev.onclick=()=>go(4);
  document.querySelector('.bottom .muted').textContent='当前浏览器自动保存';
 }
};
render();
