let resumeImportBusy=false,resumeImportError='';
const resumeBaseLabels={name:['姓名'],display:['对外展示称呼','对外称呼'],role:['角色身份','执业身份'],firm:['所在律所','律师事务所'],years:['执业年限'],qualification:['职业资格','执业资格'],city:['所在城市','执业城市','现居城市','现居地'],languages:['可使用语言','语言能力','工作语言'],school:['毕业院校','毕业学校'],degree:['学历','最高学历'],major:['所学专业','专业'],cross:['复合学科背景'],certification:['专业认证'],otherQualification:['其他行业资格'],social:['社会职务'],association:['行业协会任职'],honors:['奖项与荣誉','奖项荣誉','荣誉'],books:['公开著作','著作'],motivation:['选择律师的原因'],personalTags:['个人标签']};
function resumeYearBucket(value){if(['未满3年','3年至未满5年','5年及以上'].includes(value))return value;const number=Number((value.match(/\d+(?:\.\d+)?/)||[])[0]);if(!Number.isFinite(number))return '';return number<3?'未满3年':number<5?'3年至未满5年':'5年及以上';}
function parseResumeText(text){
 const labels=new Map(Object.entries(resumeBaseLabels).flatMap(([key,values])=>values.map(label=>[label,key])));
 const base={},jobs=[];let currentJob=null,section='',active='';
 const jobLabels={任职机构:'organization',工作单位:'organization',单位名称:'organization',担任岗位:'position',担任的岗位:'position',职位:'position',岗位:'position',任职时间:'time',工作时间:'time',主要职责:'responsibility',工作职责:'responsibility',工作内容:'responsibility'};
 for(const raw of text.split(/\r?\n/)){
  const line=raw.replace(/\t/g,' ').trim();if(!line)continue;
  if(/^(工作经历|职业经历|任职经历|工作经验|教育背景|教育经历|专业技能|个人简介|基本信息)[：:]?$/.test(line)){section=line.replace(/[：:]$/,'');active='';currentJob=null;continue;}
  const m=/^([^：:]{1,14})[：:]\s*(.*)$/.exec(line);
  if(m&&labels.has(m[1])){const key=labels.get(m[1]);if(m[2])base[key]=m[2].trim();active='';continue;}
  if(m&&jobLabels[m[1]]){
   const key=jobLabels[m[1]];
   if(!currentJob||(key==='organization'&&currentJob.organization)){currentJob=newCareerJob();jobs.push(currentJob);}
   currentJob[key]=m[2];active=key==='responsibility'?'responsibility':'';continue;
  }
  if(/工作经历|职业经历|任职经历|工作经验/.test(section)){
   const dated=/^((?:19|20)\d{2}(?:年(?:\d{1,2}月)?|[./-]\d{1,2})?\s*(?:至|到|—|–|－|-|~)\s*(?:(?:19|20)\d{2}(?:年(?:\d{1,2}月)?|[./-]\d{1,2})?|至今|今|现在))\s*[|｜,，]?\s*(.*)$/.exec(line);
   if(dated){currentJob=newCareerJob();currentJob.time=dated[1];const rest=dated[2].split(/\s*[|｜]\s*|\s{2,}/).filter(Boolean);currentJob.organization=rest[0]||'';currentJob.position=rest[1]||'';jobs.push(currentJob);active='responsibility';continue;}
   if(currentJob&&active==='responsibility'&&!m){currentJob.responsibility+=(currentJob.responsibility?'\n':'')+line;continue;}
  }
  if(/教育背景|教育经历/.test(section)&&/大学|学院/.test(line)){
   base.school ||= (line.match(/[\u4e00-\u9fa5A-Za-z]+(?:大学|学院)/)||[])[0]||'';
   base.degree ||= (line.match(/博士|硕士|本科|大专/)||[])[0]||'';
   const major=line.split(/[|｜\s]+/).find(part=>/^(?:[^|｜\s]{0,15})(?:法学|法律|管理|经济学|工程|专业)$/.test(part));if(major)base.major ||= major;
  }
 }
 const firstLines=text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).slice(0,3);
 if(!base.name){const nameLine=firstLines.find(line=>/^[\u4e00-\u9fa5]{2,4}$/.test(line)&&!['个人简历','简历','基本信息','教育背景','工作经历'].includes(line));if(nameLine)base.name=nameLine;}
 if(base.role==='专职律师')base.role='职业律师';if(base.role&&!['个人律师','职业律师','合伙人','兼职律师'].includes(base.role))delete base.role;
 if(base.years){const normalized=resumeYearBucket(base.years);if(normalized)base.years=normalized;else delete base.years;}
 if(base.languages)base.languages=base.languages.split(/[、,，;；\s]+/).filter(Boolean);
 if(base.city){const valid=Object.values(regionCities||{}).flat().find(city=>city===base.city||base.city.startsWith(city));if(valid)base.city=valid;else delete base.city;}
 for(const key of Object.keys(base))if(!answerText(base[key]).trim())delete base[key];
 return {base,jobs:jobs.filter(j=>j.organization||j.position||j.responsibility)};
}
function resumeFieldLabel(key){return resumeBaseLabels[key]?.[0]||key;}
function applyResumeSuggestion(key){const suggestion=state.resumeImport?.suggestions?.find(x=>x.key===key);if(!suggestion)return;put('base.'+key,suggestion.value);state.resumeImport.suggestions=state.resumeImport.suggestions.filter(x=>x.key!==key);save();render();}
async function uploadResume(input){
 const file=input.files[0];if(!file||resumeImportBusy)return;
 resumeImportBusy=true;resumeImportError='';render();
 try{
  const text=(await readCaseDocument(file)).trim();if(text.replace(/\s/g,'').length<10)throw Error('没有读取到足够文字。扫描版 PDF 请先做文字识别，再上传。');
  const parsed=parseResumeText(text),id=uid();await materialStore('readwrite',store=>store.put({id,file}));
  const previous=state.resumeImport,filled=[],suggestions=[];
  for(const [key,value]of Object.entries(parsed.base)){
   if(!answerText(state.base[key]).trim()){state.base[key]=value;state.sources['base.'+key]='简历识别';filled.push(key);}
   else if(answerText(state.base[key])!==answerText(value))suggestions.push({key,value});
  }
  let added=0;
  for(const job of parsed.jobs){if(!state.jobs.some(j=>j.organization===job.organization&&j.position===job.position&&j.time===job.time)){state.jobs.push({...job,resumeImportId:id});added++;}}
  state.resumeImport={id,name:file.name,size:file.size,text,filled,suggestions,addedJobs:added,importedAt:new Date().toISOString()};
  state.confirmed=null;save();if(previous?.id)await materialStore('readwrite',store=>store.delete(previous.id));
  toast(`简历已读取，补充 ${filled.length} 项信息、${added} 段职业经历`);
 }catch(error){resumeImportError=error.message||'简历读取失败，请重新上传。';}
 finally{resumeImportBusy=false;render();}
}
const identityBeforeResumeImport=identityPage;
identityPage=function(){
 const root=document.createElement('div');root.innerHTML=identityBeforeResumeImport();if(collectionDetail)return root.innerHTML;
 const panel=root.querySelector('.identity-panel');if(!panel)return root.innerHTML;
 const data=state.resumeImport,section=document.createElement('section');section.className='resume-import-section';
 section.innerHTML=`<div class="style-field-heading"><h2>上传简历 <small>选填</small></h2><button class="primary" type="button" ${resumeImportBusy?'disabled':''} onclick="document.getElementById('resume-file').click()">${resumeImportBusy?'正在解析…':data?'重新上传简历':'上传简历'}</button></div><input id="resume-file" type="file" accept=".docx,.pdf" hidden style="display:none" onchange="uploadResume(this)"><p class="small muted">上传 Word（.docx）或文字型 PDF，自动补充可识别的基础信息、教育背景与职业经历，已有填写内容会保留。</p>${resumeImportBusy?'<p class="resume-status" role="status">正在读取简历并整理信息…</p>':''}${resumeImportError?`<p class="resume-error" role="alert">${esc(resumeImportError)}</p>`:''}${data?`<div class="resume-result"><strong>${esc(data.name)}</strong><p class="small muted">已补充 ${data.filled.length} 项信息、${data.addedJobs} 段职业经历。请核对识别结果。</p>${data.suggestions.length?`<details><summary>另有 ${data.suggestions.length} 项与已有内容不同</summary>${data.suggestions.map(s=>`<div class="resume-suggestion"><div><span>${esc(resumeFieldLabel(s.key))}</span><p>${esc(answerText(s.value))}</p></div><button type="button" onclick="applyResumeSuggestion('${s.key}')">采用此项</button></div>`).join('')}</details>`:''}<details><summary>查看简历原文</summary><pre>${esc(data.text)}</pre></details></div>`:''}`;
 panel.prepend(section);return root.innerHTML;
};
render();
