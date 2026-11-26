// 2026-11-24 questionnaire schema. Independent storage preserves earlier versions.
const LATEST_KEY='lawyer-questionnaire-20261124';
const newProduct=()=>({id:uid(),serviceName:'',domains:[],domainOther:'',items:[''],name:'',selected:[],delivery:'',type:'',target:'',questions:[''],feeType:'',feeMin:'',feeMax:'',currency:'CNY',feePrivate:false});
const newCase=()=>({id:uid(),name:'',type:'',domain:'',industry:'',client:'',situation:'',trigger:'',background:'',goal:'',files:[]});
const newAccount=()=>({id:uid(),platforms:[],otherPlatform:'',link:'',started:'',startedUnknown:false,stats:{},interest:'',bounce:'',bounceUnknown:false,highConsultation:'',period:'近30天',fetchedAt:null});
state={version:'2026-11-24',base:{},experience:[],jobs:[],story:'',method:'',workflow:'',unique:'',global:{future:[],futureOther:'',consultations:'',remote:'',exclude:[],excludeDetail:''},products:[newProduct()],expression:{links:'',spoken:'',intonation:'',structure:'',taboo:'',liked:'',disliked:''},accounts:[newAccount()],supplement:{links:'',files:[],cases:[]},confirmed:null};
try{const saved=JSON.parse(localStorage.getItem(LATEST_KEY)||'null');if(saved?.version===state.version)state=saved}catch{}
titles.splice(0,titles.length,'个人与执业信息','职业经历','业务和产品地图','个人表达与内容偏好','账号与获客表现','案例库','确认画像');
subtitles.splice(0,subtitles.length,'填写基本身份、所在城市和异地接案意向。','记录任职经历、主要职责，以及印象深刻的事或人。本板块均为选填。','确定业务优先级，为每款产品配置服务、客户与收费。','提供表达参考、偏好达人和不偏好的内容链接。','按账号记录平台表现；获取功能均为模拟。','记录代表事项与背景信息，可添加多个案例。','检查必填信息，一次确认整份画像。');
save=function(){try{localStorage.setItem(LATEST_KEY,JSON.stringify(state));$('#saveState').textContent='已自动保存'}catch{$('#saveState').textContent='保存不可用，请导出备份'}};
const domains=['婚姻家事','劳动人事','公司商事','刑事','知识产权','建设工程','其他'];
function latestChecks(path,label,options,required=false){return checks(path,label,options,required)}
function selectFuture(el){let a=state.global.future;if(el.checked&&a.length>=3){el.checked=false;toast('最多选择 3 个重点领域');return}const next=el.checked?[...a,el.value]:a.filter(x=>x!==el.value);state.products.forEach(p=>{if(!p.serviceName&&!p.name&&p.domains.join('|')===a.join('|'))p.domains=[...next]});put('global.future',next);render()}
function moveFuture(i,d){const a=[...state.global.future];[a[i],a[i+d]]=[a[i+d],a[i]];put('global.future',a);render()}
function backgroundFields(){return `<details class="identity-fold"><summary>教育与专业资质</summary><div class="identity-grid">${[['school','毕业院校'],['degree','学历'],['major','所学专业'],['cross','复合学科背景'],['certification','专业认证'],['otherQualification','其他行业资格']].map(([k,n])=>field('base.'+k,n)).join('')}</div></details><details class="identity-fold"><summary>公开任职、荣誉与作品</summary><div class="identity-grid">${[['social','社会职务'],['association','行业协会任职'],['honors','奖项与荣誉'],['books','公开著作'],['courses','公开课程链接'],['talks','公开演讲链接'],['interviews','媒体采访链接']].map(([k,n])=>field('base.'+k,n)).join('')}</div></details>`}
function existingExperience(){return '<details class="identity-fold"><summary>执业领域</summary>'+state.experience.map((e,i)=>`<div class="nested"><div class="grid2">${field('experience.'+i+'.domain','执业领域',{type:'select',options:domains})}${e.domain==='其他'?field('experience.'+i+'.other','其他执业领域'):''}${field('experience.'+i+'.years','该领域执业年限',{type:'select',options:['未满1年','1—3年','3—5年','5年以上','不确定']})}${field('experience.'+i+'.share','该领域业务占比',{type:'select',options:['0—20%','21—40%','41—60%','61—80%','81—100%','不确定']})}</div><button onclick="removeEntry('experience',${i})">删除此项</button></div>`).join('')+'<button onclick="addExperience()">添加执业领域</button></details>'}
function identityPage(){const req={required:true};return box('基础身份',`<div class="grid2">${field('base.name','姓名',req)}${field('base.display','对外展示称呼',{...req,placeholder:'例如：张律师'})}${field('base.status','执业状态',{...req,type:'select',options:['正常执业','暂停执业','已注销执业','其他']})}${field('base.firm','所在律所',req)}${field('base.role','角色身份')}${field('base.years','执业年限',{...req,type:'select',options:['未满3年','3年至未满5年','5年及以上']})}${field('base.qualification','职业资格',req)}</div>${state.base.status==='其他'?field('base.statusOther','其他执业状态'):''}`)+box('服务范围',field('base.city','所在城市',req)+checks('base.regions','可服务地区',['所在城市','所在省份','跨省可服务','指定地区','其他'],true)+((state.base.regions||[]).some(x=>['指定地区','其他'].includes(x))?field('base.regionOther','具体服务地区'):'')+checks('base.languages','可使用语言',['普通话','英语','粤语','其他方言或语言'])+((state.base.languages||[]).includes('其他方言或语言')?field('base.languageOther','其他方言或语言'):''))+existingExperience()+backgroundFields()}
let editingCareerJob;
if (location.hash === '#career') page = 1;

function newCareerJob() {
  return { time: '', organization: '', position: '', responsibility: '', moment: '', supplement: '' };
}
function shiftCareerSources(removedIndex) {
  const sources = state.sources || {};
  const remaining = {};
  for (const [key, source] of Object.entries(sources)) {
    const match = /^jobs\.(\d+)(\..+)?$/.exec(key);
    if (!match || Number(match[1]) < removedIndex) continue;
    delete sources[key];
    if (Number(match[1]) > removedIndex) remaining['jobs.' + (Number(match[1])-1) + (match[2] || '')] = source;
  }
  Object.assign(sources, remaining);
}
function saveCareerField(path,value) {
  if (!state.jobs.length) {
    editingCareerJob = newCareerJob();
    state.jobs.push(editingCareerJob);
    document.getElementById('career-toggle-0').disabled = false;
    document.querySelector('.career-delete').hidden = false;
    document.querySelector('.career-add').hidden = false;
  }
  put(path,value);
}

function jobHeading(job, index) {
  return job.organization?.trim() || job.position?.trim() || '第 ' + (index + 1) + ' 段任职经历';
}
function jobPeriodAndRole(job) {
  return [job.time?.trim(), job.organization?.trim() && job.position?.trim()].filter(Boolean).join(' · ');
}
function updateJobHeading(index) {
  const job = state.jobs[index];
  const button = document.getElementById('career-toggle-' + index);
  button.querySelector('strong').textContent = jobHeading(job, index);
  button.querySelector('small').textContent = jobPeriodAndRole(job);
}
function toggleCareerJob(index) {
  const button = document.getElementById('career-toggle-' + index);
  editingCareerJob = button.getAttribute('aria-expanded') === 'true' ? null : state.jobs[index];
  render();
  document.getElementById('career-toggle-' + index).focus();
}
function addCareerJob() {
  editingCareerJob = newCareerJob();
  const index = state.jobs.push(editingCareerJob) - 1;
  changed();
  document.getElementById('f_jobs_' + index + '_organization_input').focus();
}
function careerEntry(job, index, open) {
  const path = 'jobs.' + index;
  const heading = `<h3><button type="button" class="career-toggle" id="career-toggle-${index}"
    aria-expanded="${open}" aria-controls="career-entry-${index}" ${state.jobs.length?'':'disabled'} onclick="toggleCareerJob(${index})">
    <span><strong>${esc(jobHeading(job,index))}</strong><small>${esc(jobPeriodAndRole(job))}</small></span></button></h3>`;
  const input = {onInput:'saveCareerField'};
  const basics = field(path + '.organization','任职机构',{...input,placeholder:'例如：某律师事务所或某公司'}) +
    field(path + '.position','担任的岗位',{...input,placeholder:'例如：律师、法务经理'}) +
    field(path + '.time','任职时间',{...input,placeholder:'例如：2021 年至今'});
  const work = field(path + '.responsibility','这段经历里，你主要负责什么？',
    {...input,type:'textarea',placeholder:'例如：为企业审查劳动合同，并代理劳动争议案件。'});
  const moment = field(path + '.moment','回顾这段经历，有没有哪件事情让你特别有成就感，或者至今仍然印象深刻？有没有哪个人也让你印象深刻？',
    {...input,type:'textarea',placeholder:'可以写当时发生了什么、你做了什么，或那个人说过什么、做过什么，以及这些经历对你的影响。'});
  const supplement = field(path + '.supplement','你还有什么想补充的吗？',{...input,type:'textarea'});
  return `<article class="career-entry"><div class="career-entry-header">${heading}<button type="button" class="career-delete" ${state.jobs.length?'':'hidden'} onclick="removeEntry('jobs',${index})">删除这段经历</button></div><div id="career-entry-${index}" class="career-entry-body" ${open?'':'hidden'}>
    <div class="career-job-facts" oninput="updateJobHeading(${index})">${basics}</div>${work}${moment}${supplement}
    </div></article>`;
}
function careerPage() {
  const jobs = state.jobs;
  if (editingCareerJob !== null && !jobs.includes(editingCareerJob)) editingCareerJob = jobs[0];
  const entries = jobs.length ? jobs.map((job,i)=>careerEntry(job,i,job===editingCareerJob)).join('') : careerEntry(newCareerJob(),0,true);
  return `<div class="career-panel">
    <section aria-labelledby="career-history"><h2 id="career-history">任职经历</h2>
      <p class="career-guidance">可以从最近的一份工作写起。律所、企业法务和转行前的经历都可以写。</p>
      ${entries}<button type="button" class="career-add" ${jobs.length?'':'hidden'} onclick="addCareerJob()">再加一段经历</button>
    </section>
    ${state.careerSupplement?.trim()?`<section><h2>旧版板块补充</h2><p style="white-space:pre-line">${esc(state.careerSupplement)}</p></section>`:''}</div>`;
}
function direction(){return box('业务方向和目标',`<div class="field"><label>未来重点发展领域<span class="required">最多 3 项 · 必填</span></label><div class="options">${domains.map(x=>`<label class="option"><input type="checkbox" value="${esc(x)}" ${state.global.future.includes(x)?'checked':''} onchange="selectFuture(this)">${x}</label>`).join('')}</div></div>${state.global.future.includes('其他')?field('global.futureOther','其他发展领域'):''}${state.global.future.length?'<h3>优先级</h3>'+state.global.future.map((x,i)=>`<div class="row" style="justify-content:flex-start;margin:8px 0"><span>${i+1}. ${esc(x)}</span><button ${i===0?'disabled':''} onclick="moveFuture(${i},-1)">上移</button><button ${i===state.global.future.length-1?'disabled':''} onclick="moveFuture(${i},1)">下移</button></div>`).join(''):''}${field('global.consultations','期望每月有效咨询量',{type:'select',options:['0—5','6—10','11—30','30以上','暂不确定']})}${field('global.remote','是否接受异地办案',{required:true,type:'select',options:['仅接受本地办理','接受异地线上咨询','接受异地委托但视事项决定是否到场','接受异地线下办理']})}${checks('global.exclude','明确不承接的业务或事项',['非主营领域','特定案件类型','超出服务地区','超出办理能力','其他','暂无额外限制'],true)}${state.global.exclude.length&&!state.global.exclude.includes('暂无额外限制')?field('global.excludeDetail','具体不承接的事项',{type:'textarea'}):''}`)}
function rows(path,label,placeholder){const a=get(path)||[];return `<div class="field"><label>${label}</label>${a.map((v,i)=>`<div class="row" style="margin:8px 0"><input type="text" aria-label="${esc(label)} ${i+1}" value="${esc(v)}" placeholder="${esc(placeholder)}" oninput="put('${path}.${i}',this.value)" onchange="render()"><button onclick="removeList('${path}',${i})">删除</button></div>`).join('')}<button onclick="get('${path}').push('');changed()">添加一条</button></div>`}
function removeList(path,i){get(path).splice(i,1);if(/^products\.\d+\.items$/.test(path)){const p=state.products[Number(path.split('.')[1])];p.selected=p.selected.filter(x=>x!==i).map(x=>x>i?x-1:x)}changed()}
function selectProductItem(i,j,on){const p=state.products[i];p.selected=on?[...p.selected,j]:p.selected.filter(x=>x!==j);changed()}
function latestProduct(i){const p=state.products[i],path='products.'+i;const options=[...new Set([...state.global.future,...domains,...p.domains])];return box(`产品 ${i+1}`,`<div class="grid2">${field(path+'.serviceName','服务名称',{required:true,placeholder:'例如：劳动争议解决'})}${field(path+'.name','产品名称',{required:true,placeholder:'例如：劳动者劳动仲裁代理'})}</div>${checks(path+'.domains','所属服务领域',options,true)}${p.domains.includes('其他')?field(path+'.domainOther','其他服务领域'):''}${rows(path+'.items','希望承接的具体服务事项 · 必填','例如：劳动仲裁代理')}<div class="field"><label>产品服务<span class="required">必填</span></label><div class="options">${p.items.map((x,j)=>x.trim()?`<label class="option"><input type="checkbox" ${p.selected.includes(j)?'checked':''} onchange="selectProductItem(${i},${j},this.checked)">${esc(x)}</label>`:'').join('')||'<span class="small muted">填写服务事项后，在这里选择实际提供的服务。</span>'}</div></div>${field(path+'.delivery','补充交付内容',{placeholder:'咨询、代理、文书、专项审查等'})}${field(path+'.type','产品类型',{type:'select',options:['法律咨询','诉讼／仲裁代理','非诉专项','常年法律顾问','文书／审查服务','其他']})}${field(path+'.target','目标客户',{type:'textarea',placeholder:'描述这款产品希望服务的客户。'})}${rows(path+'.questions','Q7. 客户高频问题：3—5 个带来客资的选题','填写选题或确实带来咨询的客户问题')}<details style="margin-top:20px"><summary>收费区间 · 选填</summary><label class="option"><input type="checkbox" ${p.feePrivate?'checked':''} onchange="put('${path}.feePrivate',this.checked);render()">不便透露</label>${!p.feePrivate?field(path+'.feeType','计费方式',{type:'select',options:['按件','按阶段','按小时','固定顾问费','其他']})+`<div class="grid2">${field(path+'.feeMin','最低金额',{type:'number'})}${field(path+'.feeMax','最高金额',{type:'number'})}${field(path+'.currency','币种')}</div>`:''}</details><button class="danger" style="margin-top:22px" onclick="removeEntry('products',${i})">删除产品</button>`)}
function businessPage(){return direction()+state.products.map((_,i)=>latestProduct(i)).join('')+'<button class="primary" onclick="addLatestProduct()">添加产品</button>'}
function addLatestProduct(){const p=newProduct();p.domains=[...state.global.future];state.products.push(p);changed()}
function expressionLatest(){return box('表达特征 · 可选',field('expression.links','用于分析的音视频或内容链接',{type:'textarea',placeholder:'可提供自我介绍等内容，每行一个链接。'})+'<button onclick="simulateExpression()">模拟分析表达特征</button>'+`<div class="grid2" style="margin-top:18px">${field('expression.spoken','口语化程度')}${field('expression.intonation','语调变化程度')}${field('expression.structure','内容结构化程度')}</div>`)+box('表达禁区',field('expression.taboo','不讨论的话题',{required:true,type:'textarea',placeholder:'例如：未公开案件、客户或机构、争议话题；没有额外限制可填写“暂无额外限制”。'}))+box('达人参考 · 选填',field('expression.liked','偏好达人链接',{type:'textarea',placeholder:'每行一个链接'})+field('expression.disliked','不偏好的达人或内容链接',{type:'textarea',placeholder:'每行一个链接'}))}
function simulateExpression(){if(!state.expression.links.trim()){toast('请先填写参考链接');return}for(const [k,v] of Object.entries({spoken:'较口语化（模拟）',intonation:'变化适中（模拟）',structure:'层次清晰（模拟）'}))if(!state.expression[k])state.expression[k]=v;changed();toast('已填入模拟分析结果，未读取链接')}
const statsFields=[['fans','粉丝规模'],['frequency','内容更新频率'],['attributes','粉丝属性'],['activity','受众活跃特征'],['interaction','互动行为'],['themes','历史作品主题'],['origin','观众来源'],['views','播放量'],['comments','评论量'],['likes','点赞量'],['favorites','收藏量'],['shares','分享量'],['highViews','高播放内容'],['highEngagement','高互动内容'],['watchTime','平均观看时长'],['unfollow','脱粉率'],['follow','吸粉率'],['related','相关内容']];
function accountPage(){return '<div class="badge">所有平台数据均为 Mock，可修改；未获取的数据留空</div>'+state.accounts.map((a,i)=>{const p='accounts.'+i;return box('账号 '+(i+1),checks(p+'.platforms','运营平台',['小红书','抖音','视频号','公众号','B站','快手','其他'])+(a.platforms.includes('其他')?field(p+'.otherPlatform','其他平台'):'')+field(p+'.link','账号或平台链接',{placeholder:'提供用于模拟获取的链接'})+field(p+'.period','统计周期',{placeholder:'例如：近30天'})+`<button onclick="simulateAccount(${i})">模拟获取账号数据</button><div class="field"><label>账号运营时间</label><label class="option"><input type="checkbox" ${a.startedUnknown?'checked':''} onchange="put('${p}.startedUnknown',this.checked);render()">不清楚</label>${!a.startedUnknown?field(p+'.started','首次正式运营年月',{type:'month'}):''}</div><h3>账号与受众</h3><div class="grid2">${statsFields.slice(0,4).map(([k,n])=>field(p+'.stats.'+k,n)).join('')}</div>${field(p+'.interest','受众兴趣',{type:'textarea',placeholder:'可填写常关注的主题，不知道可注明或跳过。'})}<h3>内容表现</h3><div class="grid2">${statsFields.slice(4).map(([k,n])=>field(p+'.stats.'+k,n,{type:['themes','highViews','highEngagement','related'].includes(k)?'textarea':'text'})).join('')}</div><div class="field"><label>5S跳出率</label><label class="option"><input type="checkbox" ${a.bounceUnknown?'checked':''} onchange="put('${p}.bounceUnknown',this.checked);render()">不知道</label>${!a.bounceUnknown?field(p+'.bounce','百分比（0—100）',{type:'number'}):''}</div>${field(p+'.highConsultation','高咨询内容',{type:'textarea',placeholder:'填写确实带来咨询的作品链接或标题；不知道可注明。'})}<button onclick="removeEntry('accounts',${i})">删除账号</button>`)}).join('')+'<button onclick="state.accounts.push(newAccount());changed()">添加账号</button>'}
function simulateAccount(i){const a=state.accounts[i];if(!a.link.trim()||!a.platforms.length){toast('请先选择平台并填写链接');return}const mock={fans:'3,280',frequency:'每周 3 条',attributes:'30—45岁；上海为主；平台推荐来源（模拟）',activity:'19:00—22:00活跃（模拟）',interaction:'评论提问与收藏为主（模拟）',themes:'劳动争议、咨询准备清单',origin:'平台推荐 65%；搜索 25%；其他 10%（模拟）',views:'26,800',comments:'184',likes:'676',favorites:'246',shares:'118',highViews:'示例作品：第一次咨询需要准备什么',highEngagement:'示例作品：企业用工常见问题',watchTime:'28 秒',unfollow:'1.2%（模拟口径）',follow:'2.8%（模拟口径）',related:'示例关联内容：劳动合同问答'};for(const [k,v] of Object.entries(mock))if(!a.stats[k])a.stats[k]=v;a.fetchedAt=new Date().toISOString();changed();toast('已填入模拟数据，未连接真实平台')}
function supplementPage(){return (state.supplement.cases.length?state.supplement.cases.map((c,i)=>caseCard(i)).join(''):box('案例库','<p class="muted">尚未添加案例。可以记录一件有代表性的法律事项。</p>'))+'<button class="primary" onclick="state.supplement.cases.push(newCase());changed()">添加案例</button>'}

function caseCard(i){const c=state.supplement.cases[i],p='supplement.cases.'+i;return box('案例 '+(i+1),`<input type="file" multiple onchange="put('${p}.files',Array.from(this.files).map(f=>f.name));render()"><p class="small muted">仅记录文件名；可模拟解析，也可直接填写。</p><button onclick="simulateCase(${i})">模拟解析案例材料</button><div class="grid2" style="margin-top:16px">${field(p+'.name','事项名称或内部标识')}${field(p+'.type','诉讼或非诉事项类型')}${field(p+'.domain','事项所属法律领域')}${field(p+'.industry','涉及行业')}${field(p+'.client','客户类型')}</div><h3>事项背景</h3>${field(p+'.situation','在这件事情发生时，客户处于什么样的生活、工作或经营状态？',{type:'textarea',placeholder:'例如：客户当时的家庭生活、工作岗位、收入来源，或企业的经营状况。'})}${field(p+'.trigger','具体发生了什么事情，让客户意识到自己需要寻求律师帮助？',{type:'textarea',placeholder:'请写明发生了什么、何时发生，以及是否有必须尽快处理的期限。例如：收到解除通知，或收到法院传票。'})}${field(p+'.background','委托你之前，客户尝试过哪些解决办法？为什么最终委托你？',{type:'textarea',placeholder:'例如：曾自行协商或投诉，但未解决；经朋友介绍，决定委托你处理。'})}${field(p+'.goal','还有什么补充的？',{type:'textarea',placeholder:'选填，补充前面未提及的重要信息。'})}<button onclick="removeEntry('supplement.cases',${i})">删除案例</button>`)}
function simulateCase(i){const c=state.supplement.cases[i];const mock={name:'示例：企业用工咨询',type:'非诉咨询',domain:'劳动人事',industry:'制造业',client:'中小企业负责人',situation:'正在与员工协商离职（虚构）',trigger:'双方对补偿方案产生分歧（虚构）',background:'自行沟通未达成一致，转而寻求律师协助（虚构）'};Object.entries(mock).forEach(([k,v])=>{if(!c[k])c[k]=v});changed();toast('已填入虚构案例示例；未解析文件')}
validate=function(){const out=[],add=(page,text)=>out.push({page,text});for(const [k,n] of [['name','姓名'],['display','对外展示称呼'],['status','执业状态'],['firm','所在律所'],['years','执业年限'],['qualification','职业资格'],['city','所在城市']])if(!state.base[k]?.trim())add(0,n);if(!state.base.regions?.length)add(0,'可服务地区');if(!state.global.future.length)add(2,'未来重点发展领域');if(state.global.future.length>3)add(2,'发展领域最多3项');if(state.global.future.includes('其他')&&!state.global.futureOther.trim())add(2,'其他发展领域');if(!state.global.remote)add(2,'异地办案偏好');if(!state.global.exclude.length)add(2,'不承接范围');if(!state.products.length)add(2,'至少一款产品');state.products.forEach((p,i)=>{const n='产品 '+(i+1);if(!p.serviceName.trim())add(2,n+'服务名称');if(!p.name.trim())add(2,n+'名称');if(!p.domains.length)add(2,n+'所属服务领域');if(!p.items.some(x=>x.trim()))add(2,n+'具体服务事项');if(!p.selected.some(j=>p.items[j]?.trim()))add(2,n+'产品服务');if(!p.feePrivate&&p.feeMin!==''&&p.feeMax!==''&&Number(p.feeMin)>Number(p.feeMax))add(2,n+'收费下限不能高于上限')});if(!state.expression.taboo.trim())add(3,'不讨论的话题');state.accounts.forEach((a,i)=>{if(!a.bounceUnknown&&a.bounce!==''&&(Number(a.bounce)<0||Number(a.bounce)>100))add(4,'账号 '+(i+1)+'的5S跳出率须为0—100')});return out};
review=function(){const issues=validate();return `<div class="statusbox">${state.confirmed?'画像已确认':issues.length?'还有 '+issues.length+' 项必填或格式问题':'必填信息已完整，可以确认画像'}</div>${issues.length?box('需要补充',issues.map(x=>`<div class="row summary-row"><span>${esc(x.text)}</span><button onclick="go(${x.page})">去填写</button></div>`).join('')):''}${box('律师与业务',`<p>${esc(state.base.name||'未填写姓名')} · ${esc(state.base.firm||'未填写律所')}</p><p>发展方向：${state.global.future.map(esc).join('、')||'未填写'}</p>`)}${box('产品配置',state.products.map(p=>`<div class="summary-row"><h3>${esc(p.name||'未命名产品')}</h3><p>${esc(p.serviceName||'未填写服务名称')} · ${esc(p.target||'目标客户未填写')}</p><p>${p.selected.map(j=>esc(p.items[j]||'')).join('、')}</p></div>`).join(''))}<p class="small muted">原型仅本地保存，模拟数据不会上传。所有答案可导出。</p>`};
go=function(i){if(i<0||i>=titles.length)return;page=i;render();scrollTo(0,0)};
nextPage=function(){if(page<6){go(page+1);return}if(validate().length){render();toast('请先补齐必填信息');return}state.confirmed=new Date().toISOString();save();render();toast('画像已统一确认')};
let renderedPage;
render=function(){const opened=renderedPage===page?[...document.querySelectorAll('#content details')].map((d,i)=>d.open?i:-1):[];renderedPage=page;$('#nav').innerHTML=titles.map((t,i)=>`<button class="nav ${page===i?'active':''}" onclick="go(${i})">${i<6?'0'+(i+1)+'. ':''}${t}</button>`).join('');$('#title').textContent=titles[page];$('#subtitle').textContent=subtitles[page];$('#crumb').textContent='画像问卷 / '+titles[page];$('#step').textContent=`步骤 ${page+1} / ${titles.length}`;$('#content').innerHTML=[identityPage,careerPage,businessPage,expressionLatest,accountPage,supplementPage,review][page]();document.querySelectorAll('details').forEach((d,i)=>d.open=opened.includes(i));$('#prev').disabled=page===0;$('#next').textContent=page===6?(state.confirmed?'画像已确认':'确认画像'):'下一步';$('#next').disabled=page===6&&!!state.confirmed};
exportAnswers=function(){const copy=JSON.parse(JSON.stringify(state));copy.products.forEach(p=>p.selectedServices=p.selected.map(i=>p.items[i]).filter(Boolean));const u=URL.createObjectURL(new Blob([JSON.stringify({exportedAt:new Date().toISOString(),...copy},null,2)],{type:'application/json;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download='律师画像问卷_20261124.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
