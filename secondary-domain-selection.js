function selectedSecondaryDomains(a){return [...new Set(a.selectedSecondaryDomains||[])];}
function availableSecondaryDomains(a){return [...new Set([...(business.find(g=>g.name===a.path)?.items||[]),...selectedSecondaryDomains(a),...a.products.flatMap(p=>p.secondaryDomains||[p.secondaryDomain]).filter(Boolean)])].filter(x=>x!=='综合业务（原配置）');}
for(const area of state.businessAreas){
 if(!Array.isArray(area.selectedSecondaryDomains))area.selectedSecondaryDomains=[...new Set(area.products.flatMap(p=>p.secondaryDomains||[p.secondaryDomain]).filter(Boolean))];
}
function toggleSecondaryDomain(ai,name,checked){const a=state.businessAreas[ai];a.selectedSecondaryDomains=checked?[...new Set([...selectedSecondaryDomains(a),name])]:selectedSecondaryDomains(a).filter(x=>x!==name);const y=scrollY;changed();scrollTo(0,y);}
const boardBeforeSecondarySelection=businessBoard;
businessBoard=function(){
 const root=document.createElement('div');root.innerHTML=boardBeforeSecondarySelection();
 root.querySelectorAll('.legal-domain').forEach((section,ai)=>{
  const a=state.businessAreas[ai];if(!a)return;
  const selected=selectedSecondaryDomains(a),all=availableSecondaryDomains(a);
  const panel=document.createElement('section');panel.className='secondary-domain-panel';
  panel.innerHTML=`<div class="secondary-domain-title"><h4>二级业务领域</h4><span>选填，可多选</span></div><div class="secondary-domain-options">${all.map((name,index)=>`<label class="secondary-domain-option"><input id="secondary-${ai}-${index}" type="checkbox" ${selected.includes(name)?'checked':''} aria-label="${esc(name)}" onchange="toggleSecondaryDomain(${ai},this.dataset.domain,this.checked)" data-domain="${esc(name)}"><span>${esc(name)}</span></label>`).join('')||'<p class="small muted">此领域暂无预设二级分类。</p>'}</div>`;
  section.querySelector('.legal-domain-header')?.after(panel);
  const create=section.querySelector('.legal-create-service');if(create){create.disabled=false;create.removeAttribute('title');}
  section.querySelectorAll('.product-card-main .legal-secondary').forEach(label=>label.remove());
  const empty=section.querySelector('.legal-empty p');if(empty)empty.textContent='点击“创建服务”填写服务内容。';
 });return root.innerHTML;
};
newEntityDialog=function(type,ai,pi){
 if(type!=='product'){originalDialog(type,ai,pi);return;}
 if(ai===undefined){createBusinessDomain();return;}
 const a=state.businessAreas[ai],secondary=selectedSecondaryDomains(a);
 const p=newMapProduct('');p.secondaryDomains=[...secondary];p.secondaryDomain=secondary.join('、');p.feeRange='';p.core=!state.businessAreas.some(a=>a.products.some(item=>item.core));
 a.products.push(p);Object.assign(mapView,{area:a.id,product:p.id,profile:'',tab:'service'});changed();scrollTo(0,0);
 requestAnimationFrame(()=>document.getElementById(`f_businessAreas_${ai}_products_${a.products.length-1}_name_input`)?.focus({preventScroll:true}));
};
const serviceEditorBeforeSecondaryContext=productEditor;
productEditor=function(a,p,ai,pi){return `<div class="service-domain-context"><span>所属业务领域</span><p>${esc(a.path)}${p.secondaryDomain?' / '+esc(p.secondaryDomain):''}</p></div>`+serviceEditorBeforeSecondaryContext(a,p,ai,pi);};
const validateBeforeServiceFields=validate;
validate=function(){return validateBeforeServiceFields().filter(issue=>!['客户诉求','二级业务领域'].includes(issue.gap)&&!issue.text.endsWith('：客户诉求'));};
if(state.base.role==='专职律师')state.base.role='职业律师';
else if(state.base.role&&!['个人律师','职业律师','合伙人','兼职律师'].includes(state.base.role)){state.base.previousRole=state.base.role;state.base.role='';}
answerExamples['businessAreas_#_products_#_services']='描述客户需要这项服务时的具体场景，例如收到解除通知、准备签署离职协议等。';
answerExamples['businessAreas_#_profiles_#_types']='描述这项服务主要面向的客户，例如被公司辞退的员工、中小企业负责人。';
answerExamples['businessAreas_#_profiles_#_scene']='说明客户具体需要哪些帮助，例如核对补偿金额、明确维权路径、准备仲裁材料。';
save();render();
