const portraitLead=(value,max=150)=>{const text=answerText(value).replace(/\s+/g,' ').trim();return text.length>max?text.slice(0,max)+'…':text;};
function preliminaryPortrait(input){
 const b=input.base,areas=input.businessAreas||[],services=areas.flatMap(a=>a.products.map(p=>({a,p}))),profiles=services.flatMap(({a,p})=>(p.audiences||[]).map(binding=>({profile:a.profiles.find(pr=>pr.id===binding.profileId),service:p.name}))).filter(x=>x.profile);
 const name=b.display||b.name||'这位律师';
 const directions=[...new Set(areas.map(a=>a.path))];
 const mainServices=services.map(({p})=>p.name).filter(Boolean);
 const targetNames=[...new Set(profiles.map(({profile})=>portraitLead(profile.types||profile.name||profile.identities,60)).filter(Boolean))];
 const persona=[`${name}${b.city?'，在'+b.city+'执业':''}${b.years?'，执业年限为'+b.years:''}。`,directions.length?'初步定位为关注'+directions.join('、')+'的法律服务提供者。':'目前先以专业法律服务者作为初步定位。',mainServices.length?'以'+mainServices.slice(0,3).join('、')+'作为服务切入点。':'',b.personalTags?'个人表达可围绕“'+portraitLead(b.personalTags,100)+'”展开。':'',b.motivation?'职业叙事可从选择律师的原因切入：'+portraitLead(b.motivation,130):''].filter(Boolean).join('\n');
 const differences=[];
 const focused=services.find(({p})=>p.services?.trim());
 if(focused)differences.push({title:'把专业方向落到具体服务',text:'围绕“'+focused.p.name+'”，突出'+portraitLead(focused.p.services,180),basis:'来自已填写的服务内容'});
 const job=(input.jobs||[]).find(j=>j.responsibility?.trim());
 if(job)differences.push({title:'从职业经历提炼实践视角',text:(job.organization?'在'+job.organization+'的经历中，':'')+'已记录的主要工作是：'+portraitLead(job.responsibility,180),basis:'来自职业经历'});
 const profile=profiles.find(({profile})=>profile.scene?.trim()||profile.request?.trim());
 if(profile)differences.push({title:'围绕用户的具体处境表达',text:[profile.profile.scene?'典型场景：'+portraitLead(profile.profile.scene,120):'',profile.profile.request?'关注结果：'+portraitLead(profile.profile.request,120):''].filter(Boolean).join('\n'),basis:'来自目标用户的场景与诉求'});
 if(!differences.length)differences.push({title:'核心差异化待进一步提炼',text:'目前依据已填写的专业方向形成初步定位，具体经历与服务特色可在后续画像中进一步展开。',basis:'不推定未填写的能力或成果'});
 const users=profiles.map(({profile,service})=>({name:profile.name||portraitLead(profile.types,70)||'目标用户',type:portraitLead(profile.types||profile.identities,180),scene:portraitLead(profile.scene,200),need:portraitLead(profile.request,200),service}));
 const unique=users.filter((u,i)=>users.findIndex(x=>JSON.stringify(x)===JSON.stringify(u))===i);
 return {name,persona,differences,users:unique,targetSummary:targetNames.length?targetNames.join('；'):'目标用户将随已填写的法律服务和客户信息逐步清晰。'};
}
function ensurePreliminaryPortrait(){
 if(state.portrait?.previewVersion===1&&!portraitStale())return state.portrait;
 const input=portraitInput(),now=Date.now(),preview=preliminaryPortrait(input);
 state.portrait={previewVersion:1,version:(state.portrait?.version||0)+1,generatedAt:new Date(now).toISOString(),readyAt:new Date(now+10*60*1000).toISOString(),input,inputKey:JSON.stringify(input),overview:preview.persona,preview,region:serviceRegion(),confirmedAt:null};
 portraitShowIssues=false;portraitHistory=false;save();return state.portrait;
}
let detailedPortraitOpen=false;
generatePortrait=function(){ensurePreliminaryPortrait();detailedPortraitOpen=false;page=6;render();scrollTo(0,0);};
function openDetailedPortrait(){if(Date.now()<Date.parse(state.portrait.readyAt))return;detailedPortraitOpen=true;render();scrollTo(0,0);}
review=function(){
 const p=ensurePreliminaryPortrait(),data=p.preview,ready=Date.now()>=Date.parse(p.readyAt);
 const time=new Date(p.readyAt).toLocaleTimeString('zh-CN',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hour12:false});
 const minutes=Math.max(1,Math.ceil((Date.parse(p.readyAt)-Date.now())/60000));
 const heading=`<div class="portrait-preview-hero"><span class="badge">初步律师画像</span><h2>${esc(data.name)}的专业定位</h2><p>根据当前填写内容整理，可继续补充问卷并更新画像。</p></div>`;
 if(detailedPortraitOpen&&ready)return heading+'<div class="page-action-bar"><button onclick="detailedPortraitOpen=false;render()">返回初步画像</button></div>'+portraitBody(p);
 return heading+`<section class="portrait-ready-notice"><div><strong>${ready?'详细画像已可查看':'详细画像预计 '+time+' 可查看'}</strong><p>${ready?'可以展开查看完整资料与画像。':'约 '+minutes+' 分钟后，可在本页查看详细画像。'}</p><small>原型演示：10 分钟后开放完整资料视图。</small></div>${ready?'<button class="primary" onclick="openDetailedPortrait()">查看详细画像</button>':'<span class="badge">详细画像准备中</span>'}</section>`+
 box('01 · 人设',`<p class="portrait-preview-copy">${esc(data.persona)}</p>`)+
 box('02 · 核心差异化',data.differences.map(d=>`<div class="portrait-difference"><h3>${esc(d.title)}</h3><p class="portrait-preview-copy">${esc(d.text)}</p><small>${esc(d.basis)}</small></div>`).join(''))+
 box('03 · 目标用户',`<p>${esc(data.targetSummary)}</p>`+data.users.map(u=>`<div class="portrait-target"><h3>${esc(u.name)}</h3>${portraitRows([['用户特征',u.type],['典型场景',u.scene],['核心诉求',u.need],['对应服务',u.service]])}</div>`).join(''));
};
const renderBeforePortraitPreview=render;
render=function(){renderBeforePortraitPreview();if(page===6){const next=$('#next');next.hidden=true;$('#prev').textContent='返回问卷';$('#prev').onclick=()=>go(4);$('#prev').disabled=false;document.querySelector('.bottom .muted').textContent='初步画像根据当前填写内容生成';}else $('#next').hidden=page===4;};
nextPage=function(){const next=visiblePages[visiblePages.indexOf(page)+1];if(next!==undefined)go(next);};
setInterval(()=>{if(page===6&&state.portrait?.readyAt&&Date.now()>=Date.parse(state.portrait.readyAt)&&!detailedPortraitOpen&&!document.querySelector('.portrait-ready-notice button'))render();},15000);
subtitles[6]='根据填写内容，形成初步人设、核心差异化与目标用户。';
render();
