// Practice areas are short repeatable fields and stay within the identity form.
existingExperience=function(){
 return `<div class="collection-section-heading"><h3>执业领域</h3><button onclick="addExperience()">添加执业领域</button></div><div class="inline-practice-list">${state.experience.map((e,i)=>`<div class="inline-practice-row"><div class="inline-practice-fields"><div class="inline-practice-domain">${field('experience.'+i+'.domain','执业领域',{type:'select',options:domains})}${e.domain==='其他'?field('experience.'+i+'.other','其他执业领域'):''}</div>${field('experience.'+i+'.years','该领域执业年限',{type:'select',options:['未满1年','1—3年','3—5年','5年以上','不确定']})}</div><button class="inline-practice-delete" onclick="removeEntry('experience',${i})">删除</button></div>`).join('')||'<p class="small muted">尚未添加执业领域。</p>'}</div>`;
};
addExperience=function(){
 const y=window.scrollY;state.experience.push({domain:'',years:''});collectionDetail=null;changed();window.scrollTo(0,y);
 const field=document.getElementById('f_experience_'+(state.experience.length-1)+'_domain_input');field?.focus({preventScroll:true});
};
if(collectionDetail?.kind==='experience')collectionDetail=null;
render();
