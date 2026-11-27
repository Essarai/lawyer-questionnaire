// Repeated records are managed from their lists; detail views contain fields only.
let collectionDetail=null;
function openCollectionDetail(kind,id){collectionDetail={kind,id};render();scrollTo(0,0);}
function closeCollectionDetail(){collectionDetail=null;render();scrollTo(0,0);}
const collectionBack=()=>'<div class="page-action-bar"><button onclick="closeCollectionDetail()">返回列表</button></div>';
const listActions=(edit,remove)=>`<div class="collection-row-actions"><button onclick="${edit}">编辑</button><button onclick="${remove}">删除</button></div>`;
function caseListRows(cases){return cases.map(({c,i})=>`<div class="collection-list-row"><div><strong>${esc(c.name||'未命名案例')}</strong><p class="small muted">${esc([c.type,c.domain].filter(Boolean).join(' · ')||'待补充案例信息')}</p></div>${listActions(`openCollectionDetail('case','${c.id}')`,`removeEntry('supplement.cases',${i})`)}</div>`).join('');}
const careerEntryForFields=careerEntry;
const caseCardForFields=caseCard;
careerPage=function(){
 if(collectionDetail?.kind==='job'){
  const i=state.jobs.findIndex(j=>j.id===collectionDetail.id);if(i>=0){const root=document.createElement('div');root.innerHTML=careerEntryForFields(state.jobs[i],i,true);root.querySelector('.career-cases')?.remove();root.querySelector('.career-delete')?.remove();root.querySelector('h3')?.remove();root.querySelector('.career-job-facts')?.removeAttribute('oninput');return collectionBack()+box('职业经历',root.innerHTML);}
 }
 if(collectionDetail?.kind==='case'){
  const i=state.supplement.cases.findIndex(c=>c.id===collectionDetail.id);if(i>=0){const root=document.createElement('div');root.innerHTML=caseCardForFields(i);root.querySelectorAll('button').forEach(b=>{if(/^删除|^添加|^上传|^移除/.test(b.textContent.trim()))b.remove();});return collectionBack()+root.innerHTML;}
 }
 const cards=state.jobs.map((j,i)=>{
  const cases=state.supplement.cases.map((c,index)=>({c,i:index})).filter(({c})=>c.jobId===j.id);
  return `<section class="card"><div class="card-head collection-list-row"><div><h2>${esc(jobHeading(j,i))}</h2><p class="small muted">${esc(jobPeriodAndRole(j)||'任职时间与岗位待补充')}</p></div>${listActions(`openCollectionDetail('job','${j.id}')`,`removeEntry('jobs',${i})`)}</div><div class="section-body"><div class="collection-section-heading"><h3>案例库 <small>${cases.length}</small></h3><button onclick="chooseCareerDocument(${i})">上传案例材料</button></div>${caseListRows(cases)||'<p class="small muted">尚未添加案例。上传 Word 或 PDF 后识别并核对。</p>'}</div></section>`;
 }).join('');
 const unassigned=state.supplement.cases.map((c,i)=>({c,i})).filter(({c})=>!state.jobs.some(j=>j.id===c.jobId));
 return `<div class="collection-section-heading"><h2>职业经历</h2><button class="primary" onclick="addCareerJob()">添加职业经历</button></div>${cards||'<p class="muted">尚未添加职业经历。</p>'}`+(unassigned.length?box('待归属案例',unassigned.map(({c,i})=>`<div class="field"><label>${esc(c.name||'未命名案例')} · 所属职业经历</label><select onchange="put('supplement.cases.${i}.jobId',this.value);render()"><option value="">请选择</option>${state.jobs.map((j,n)=>`<option value="${esc(j.id)}">${esc(jobHeading(j,n))}</option>`).join('')}</select></div>`).join('')+caseListRows(unassigned)):'');
};
addCareerJob=function(){const j=newCareerJob();state.jobs.push(j);editingCareerJob=j;collectionDetail={kind:'job',id:j.id};changed();document.getElementById('f_jobs_'+(state.jobs.length-1)+'_organization_input')?.focus();};
const importBeforeCollection=importCareerDocument;
importCareerDocument=async function(index,file){const ids=new Set(state.supplement.cases.map(c=>c.id));await importBeforeCollection(index,file);const c=state.supplement.cases.find(c=>!ids.has(c.id));if(c)openCollectionDetail('case',c.id);};
const materialsForFields=extraMaterialsPage;
extraMaterialsPage=function(){
 if(collectionDetail?.kind==='material'){
  const i=state.extraMaterials.files.findIndex(f=>f.id===collectionDetail.id);if(i>=0){const f=state.extraMaterials.files[i];return collectionBack()+box(esc(f.name),field('extraMaterials.files.'+i+'.description','内容描述',{type:'textarea',placeholder:'说明这个文件的内容、用途，以及需要重点关注的信息。'}));}
 }
 const root=document.createElement('div');root.innerHTML=materialsForFields();
 root.querySelectorAll('.per-file-materials li').forEach((li,i)=>{
  const f=state.extraMaterials.files[i];li.querySelector('.field')?.remove();
  const actions=li.querySelector('.material-file-header>div:last-child');actions?.insertAdjacentHTML('afterbegin',`<button onclick="openCollectionDetail('material','${f.id}')">填写描述</button>`);
  li.insertAdjacentHTML('beforeend',`<p class="small muted">${esc(portraitLead(f.description,110)||'尚未填写描述')}</p>`);
 });return root.innerHTML;
};
const experienceForFields=existingExperience;
existingExperience=function(){
 if(collectionDetail?.kind==='experience'){
  const i=Number(collectionDetail.id),e=state.experience[i];if(e)return collectionBack()+box('执业领域',field('experience.'+i+'.domain','执业领域',{type:'select',options:domains})+(e.domain==='其他'?field('experience.'+i+'.other','其他执业领域'):'')+field('experience.'+i+'.years','该领域执业年限',{type:'select',options:['未满1年','1—3年','3—5年','5年以上','不确定']})+field('experience.'+i+'.share','该领域业务占比',{type:'select',options:['0—20%','21—40%','41—60%','61—80%','81—100%','不确定']}));
 }
 return `<div class="collection-section-heading"><h3>执业领域</h3><button onclick="addExperience()">添加执业领域</button></div>`+state.experience.map((e,i)=>`<div class="collection-list-row"><div><strong>${esc(e.domain==='其他'?e.other||'其他':e.domain||'未命名领域')}</strong><p class="small muted">${esc([e.years,e.share].filter(Boolean).join(' · '))}</p></div>${listActions(`openCollectionDetail('experience','${i}')`,`removeEntry('experience',${i})`)}</div>`).join('');
};
addExperience=function(){state.experience.push({domain:'',years:'',share:''});collectionDetail={kind:'experience',id:String(state.experience.length-1)};changed();};
const identityBeforeCollection=identityPage;
identityPage=function(){if(collectionDetail?.kind==='experience')return existingExperience();return identityBeforeCollection();};
const goBeforeCollections=go;
go=function(...args){collectionDetail=null;goBeforeCollections(...args);};
const renderBeforeCollections=render;
render=function(){renderBeforeCollections();if(collectionDetail){$('#prev').textContent='返回列表';$('#prev').disabled=false;$('#prev').onclick=closeCollectionDetail;$('#next').hidden=false;$('#next').textContent='完成并返回列表';$('#next').disabled=false;$('#next').onclick=closeCollectionDetail;unifyAntAppearance();}};
render();
