// The report uses saved answers only. Missing evidence remains explicitly missing.
let reportTab='assets',reportClientId='';
function reportText(value){const text=answerText(value).trim();return /^(暂无|无|未填写|暂无额外限制)$/.test(text)?'':text;}
function reportIsDemo(c){return !!c.isMock||/^mock[-_]/i.test(c.id||'')||/虚构|示例/.test(c.name||'');}
function portraitReportData(input){
 const b=input.base||{},areas=input.businessAreas||[],jobs=input.jobs||[];
 const services=areas.flatMap(a=>a.products.map(p=>({a,p})));
 const users=services.flatMap(({a,p})=>(p.audiences||[]).map(binding=>({pr:a.profiles.find(pr=>pr.id===binding.profileId),p,a}))).filter(x=>x.pr);
 const seen=new Set();const clients=users.filter(x=>{if(seen.has(x.pr.id))return false;seen.add(x.pr.id);return true;});
 const primary=services.find(({p})=>reportText(p.services)&&users.some(u=>u.p.id===p.id&&reportText(u.pr.scene)&&reportText(u.pr.request)))||services.find(({p})=>reportText(p.services))||services[0];
 const demos=(input.supplement?.cases||[]).filter(reportIsDemo),realCases=(input.supplement?.cases||[]).filter(c=>!reportIsDemo(c));
 const name=b.display||b.name||'你的';
 const direction=primary?.p.secondaryDomain||primary?.a.path;
 const target=primary?users.find(u=>u.p.id===primary.p.id):null;
 const position=primary?`围绕${direction||'已配置的法律业务'}，以${primary.p.name||'该项法律服务'}为切入点${reportText(target?.pr.types)?'，重点回应'+portraitLead(target.pr.types,65)+'的法律需求':''}。`:'目前先以法律服务者形成初步定位，具体方向随服务和目标用户信息补充后更新。';
 return {b,jobs,areas,services,clients,primary,target,demos,realCases,name,position};
}
function reportFact(label,value,fallback='尚未提供'){return `<div class="report-fact"><h3>${esc(label)}</h3><p${reportText(value)?'':' class="report-empty"'}>${esc(reportText(value)||fallback)}</p></div>`;}
function reportAssets(d,detailed){
 const b=d.b,serviceNames=d.services.map(({p})=>p.name).filter(Boolean);
 const experience=d.jobs.filter(j=>reportText(j.organization)||reportText(j.responsibility)).map(j=>[j.organization,j.position,j.time,j.responsibility].filter(Boolean).join(' · '));
 const qualifications=[b.school,b.degree,b.major,b.qualification,b.certification,b.cross].filter(reportText);
 const assetFacts=reportFact('专业能力线索',serviceNames.join('、'))+reportFact('经历优势',experience.length?experience.map(x=>portraitLead(x,180)).join('\n'):'')+reportFact('职业背景',[b.firm,b.role,b.years?b.years+'执业经验':'',...qualifications].filter(reportText).join(' · '))+reportFact('被认可的特质',b.recognizedTraits,'尚未提供客户或同事评价。个人标签作为自我描述展示，不直接视为外部认可。');
 const differences=[];
 if(d.primary?.p.services)differences.push({title:'从具体服务提炼专业表达',body:'可围绕“'+(d.primary.p.name||'已配置服务')+'”展开：'+portraitLead(d.primary.p.services,180),source:'依据：法律服务内容'});
 if(d.jobs.some(j=>reportText(j.responsibility)))differences.push({title:'用经历支撑专业视角',body:portraitLead(d.jobs.find(j=>reportText(j.responsibility)).responsibility,180),source:'依据：职业经历中的主要职责'});
 if(d.target?.pr.scene)differences.push({title:'以客户的具体处境作为切口',body:portraitLead(d.target.pr.scene,180),source:'依据：目标用户的求助场景'});
 return `<div class="report-panel-title"><h2>把你的经历，整理成可表达的专业资产</h2><p>根据专业背景、职业经历、法律服务和相关材料提炼。</p></div><div class="report-position"><span class="report-kicker">初步人设定位 · 系统提炼</span><h2>${esc(d.position)}</h2>${b.motivation?`<p>职业叙事线索：${esc(portraitLead(b.motivation,180))}</p>`:''}</div><div class="report-asset-grid">${assetFacts}</div>${reportText(b.personalTags)?`<div class="report-self-description"><h3>你希望表达的个人特质</h3><p>${esc(b.personalTags)}</p><small>来自个人标签，属于自我描述。</small></div>`:''}<div class="report-subsection"><h3>可以优先表达的差异化</h3>${differences.length?differences.map(x=>`<div class="report-difference"><strong>${esc(x.title)}</strong><p>${esc(x.body)}</p><small>${esc(x.source)} · 属于表达建议</small></div>`).join(''):'<p class="report-empty">目前信息较少，先保留初步定位，后续结合具体经历与服务进一步提炼。</p>'}</div>${detailed?`<div class="report-subsection"><h3>资质、作品与材料依据</h3>${portraitRows([['社会职务',b.social],['行业协会任职',b.association],['奖项与荣誉',b.honors],['公开著作',b.books],['公开课程链接',b.courses],['公开演讲链接',b.talks],['媒体采访链接',b.interviews],['附件',b.publicAttachments?.map(f=>f.name)]])}</div>`:''}${d.demos.length?'<p class="report-note">演示案例未作为真实专业能力或成果的依据。</p>':''}`;
}
function reportServices(d,detailed){
 const rows=d.services.map(({a,p})=>{
 const profiles=(p.audiences||[]).map(binding=>a.profiles.find(pr=>pr.id===binding.profileId)).filter(Boolean);
 const price=reportText(p.feeRange)||(p.priceMode&&p.priceMode!=='暂不明确'?priceLabel(p):'');
 return `<tr><td><strong>${esc(p.name||'未命名服务')}</strong><small>${esc([a.path,p.secondaryDomain].filter(Boolean).join(' / '))}</small>${p.services?`<small>${esc(portraitLead(p.services,130))}</small>`:''}</td><td>${price?esc(price):'<span class="report-empty">尚未提供</span>'}</td><td>${esc([...new Set(profiles.map(pr=>reportText(pr.types)||reportText(pr.name)).filter(Boolean))].join('；')||'尚未提供')}</td><td><span class="report-empty">尚未提供</span><small>未采集成交记录与客户来源</small></td></tr>`;
 }).join('');
 return `<div class="report-panel-title"><h2>你的法律服务产品地图</h2><p>整理服务、价格与对应客户；缺少的成交和获客数据保留为空。</p></div>${rows?`<div class="report-table-scroll"><table class="report-service-table"><thead><tr><th>法律服务</th><th>收费区间</th><th>客户类型</th><th>现有成交 / 获客</th></tr></thead><tbody>${rows}</tbody></table></div>`:'<div class="report-empty-state">尚未配置法律服务，可返回问卷逐步补充。</div>'}<div class="report-neutral-note"><h3>当前可用于哪些判断？</h3><p>${d.services.length?'可以看清当前配置的服务内容、收费范围和目标客户。由于尚未采集实际成交、业务来源和转化数据，暂不判断哪项服务的获客表现更好。':'服务、收费与客户信息补充后，会在这里形成对应关系。'}</p></div>${detailed?d.services.map(({p})=>p.conditions?`<div class="report-subsection"><h3>${esc(p.name||'法律服务')} · 承接条件</h3><p>${esc(p.conditions)}</p></div>`:'').join(''):''}`;
}
function reportClients(d,detailed){
 const selected=d.clients.find(x=>x.pr.id===reportClientId)||d.clients[0];if(selected)reportClientId=selected.pr.id;
 const primary=d.primary;
 const recommendation=primary?'初步建议以「'+(primary.p.secondaryDomain||primary.p.name||primary.a.path)+'」作为重点沟通方向':'重点业务方向随填写内容逐步形成';
 const basis=[];
 if(primary){basis.push('已配置服务：'+(primary.p.name||'未命名服务'));if(d.target?.pr.scene)basis.push('已填写客户求助场景');if(d.target?.pr.request)basis.push('已填写客户核心诉求');}
 const recommendationText=primary?'可先围绕“'+(primary.p.name||'该项服务')+'”明确服务内容与对应客户需求。该建议优先参考当前填写顺序与信息完整度，尚不代表业务能力或市场机会排名。':'可以先从你愿意承接、能够描述清楚服务内容的业务开始，再结合真实经历和客户反馈调整重点。';
 let profile='';
 if(selected){const {pr,p}=selected;
 const heading=pr.name||portraitLead(pr.types,60)||'已填写的目标用户';
 const questions=(Array.isArray(pr.questions)?pr.questions:[]).filter(q=>reportText(q));
 profile=`<div class="report-profile-grid"><aside class="report-client-summary"><span class="report-client-symbol" aria-hidden="true">客</span><h3>${esc(heading)}</h3><p>${esc(portraitLead(pr.types,160)||'客户类型尚未提供')}</p><dl><div><dt>对应服务</dt><dd>${esc(p.name||'未命名服务')}</dd></div><div><dt>共同特征</dt><dd>${esc(portraitLead(pr.identities,180)||'尚未提供')}</dd></div></dl></aside><div class="report-client-needs">${reportFact('什么情况会来找你',pr.scene)}${reportFact('最担心什么',pr.worry)}${reportFact('真正希望获得的结果',pr.request)}</div></div>${questions.length?`<div class="report-subsection"><h3>客户经常问的问题</h3><div class="report-question-tags">${questions.map(q=>`<span>${esc(q)}</span>`).join('')}</div><small>来自问卷填写的客户原话。</small></div>`:''}${detailed?`<div class="report-subsection"><h3>期望服务的客户与补充说明</h3>${portraitRows([['希望更多服务的客户',pr.ideal],['客户使用服务的补充',p.audiences?.[0]?.note]])}</div>`:''}`;
 }else profile='<div class="report-empty-state">尚未填写目标用户信息，先展示已有业务方向，客户画像会随填写内容更新。</div>';
 return `<div class="report-panel-title"><h2>建议从哪里开始，重点服务谁？</h2><p>结合当前服务配置、经历线索与已填写的客户需求形成初步建议。</p></div><div class="report-recommendation"><span class="report-kicker">初步发展建议</span><h2>${esc(recommendation)}</h2><p>${esc(recommendationText)}</p>${basis.length?`<div class="report-basis">${basis.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:''}</div><h3>重点客户画像</h3><div class="report-client-switch">${d.clients.map(({pr,p})=>`<button type="button" class="ant-btn report-client-choice ${selected?.pr.id===pr.id?'is-active':''}" aria-pressed="${selected?.pr.id===pr.id}" onclick="selectReportClient('${pr.id}')">${esc(pr.name||portraitLead(pr.types,45)||p.name||'目标用户')}</button>`).join('')}</div>${profile}<p class="report-note">客户特征依据填写内容整理，不推定年龄、收入或成交率。真实客户与期望客户尚未明确区分，发展建议仍需结合实际承接情况核对。</p>`;
}
function selectReportTab(tab){reportTab=tab;render();}
function selectReportClient(id){const y=scrollY;reportClientId=id;render();scrollTo(0,y);}
review=function(){
 const p=ensurePreliminaryPortrait(),d=portraitReportData(p.input),ready=Date.now()>=Date.parse(p.readyAt);
 const time=new Date(p.readyAt).toLocaleTimeString('zh-CN',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hour12:false});
 const contents=reportTab==='services'?reportServices(d,detailedPortraitOpen):reportTab==='clients'?reportClients(d,detailedPortraitOpen):reportAssets(d,detailedPortraitOpen);
 const tabs=[['assets','专属律师 IP 资产卡'],['services','法律服务产品地图'],['clients','业务定位与精准客户画像']];
 return `<div class="lawyer-report"><div class="report-hero"><div><h2>${esc(d.name)}${d.name==='你的'?'专属律师画像':'的专属律师画像'}</h2><p>${esc([d.b.city,d.b.years?'执业'+d.b.years:'',...d.areas.map(a=>a.path)].filter(Boolean).join(' · ')||'根据已填写的问卷与材料整理')}</p></div><span class="badge">${detailedPortraitOpen?'详细画像':'初步画像'}</span></div><section class="portrait-ready-notice report-ready"><div><strong>${detailedPortraitOpen?'当前查看详细画像':ready?'详细画像已可查看':'详细画像预计 '+time+' 可查看'}</strong><small>${ready?'根据当前问卷生成，可继续补充资料。':'原型演示：约 10 分钟后开放详细视图。'}</small></div>${detailedPortraitOpen?'<button onclick="detailedPortraitOpen=false;render()">返回初步画像</button>':ready?'<button class="primary" onclick="openDetailedPortrait()">查看详细画像</button>':'<span class="report-preparing">详细画像准备中</span>'}</section><div class="report-paper"><nav class="report-tabs" role="tablist" aria-label="律师画像板块">${tabs.map(([key,title])=>`<button type="button" class="ant-btn ant-btn-text report-tab" role="tab" id="report-tab-${key}" aria-selected="${reportTab===key}" aria-controls="report-active-panel" onclick="selectReportTab('${key}')">${title}</button>`).join('')}</nav><section class="report-panel" id="report-active-panel" role="tabpanel" aria-labelledby="report-tab-${reportTab}">${contents}</section></div><div class="report-footer"><span>根据问卷与材料整理 · 可随填写更新</span><span>已填信息与系统建议分别展示</span></div></div>`;
};
// Report headings retain the terminology approved for these three sections.
const vocabularyBeforeReport=serviceVocabulary;
serviceVocabulary=function(root){if(root.querySelector('.lawyer-report'))return;vocabularyBeforeReport(root);};
subtitles[6]='整理专业资产、法律服务与目标客户，形成业务发展的初步方向。';
render();
