function createAction(label,action){return `<button type="button" class="primary management-create" onclick="${action}">${label}</button>`;}
const boardBeforeActionConsistency=businessBoard;
businessBoard=function(){const root=document.createElement('div');root.innerHTML=boardBeforeActionConsistency();const toolbar=root.querySelector('.legal-toolbar');if(toolbar)toolbar.outerHTML=`<div class="collection-section-heading module-management-heading"><h2>业务领域与服务</h2>${createAction('创建业务领域','createBusinessDomain()')}</div>`;return root.innerHTML;};
const materialsBeforeActionConsistency=extraMaterialsPage;
extraMaterialsPage=function(){
 const root=document.createElement('div');root.innerHTML=materialsBeforeActionConsistency();if(collectionDetail?.kind==='material')return root.innerHTML;
 const input=root.querySelector('#extra-material-files');if(input){input.hidden=true;input.style.display='none';root.querySelector('.extra-material-upload')?.replaceWith(input);}
 const head=root.querySelector('.card-head');if(head)head.remove();
 return `<div class="collection-section-heading module-management-heading"><h2>补充材料</h2>${createAction('上传文件',"document.getElementById('extra-material-files').click()")}</div>`+root.innerHTML;
};
function consistentManagementActions(){
 // Main and nested collection headers share one alignment and button treatment.
 document.querySelectorAll('#content .collection-section-heading').forEach(row=>row.classList.add('management-heading'));
 document.querySelectorAll('#content button').forEach(button=>{
  const label=button.textContent.trim();
  if(!/^(创建|添加|上传)/.test(label)||label==='添加链接')return;
  if(button.closest('.business-editor')||collectionDetail)return;
  button.classList.add('primary','management-create');button.classList.remove('ant-btn-default','ant-btn-text');button.classList.add('ant-btn-primary');
 });
 if(page===3){
  const upload=document.getElementById('style-files');
  if(upload){const card=upload.closest('.card'),head=card?.querySelector('.card-head');if(head&&!head.querySelector('.management-create')){head.classList.add('management-heading');head.insertAdjacentHTML('beforeend',createAction('上传文件',"document.getElementById('style-files').click()"));upload.hidden=true;upload.style.display='none';}}
  const add=document.querySelector('button[onclick="openSocialAuthorization()"]');
  if(add){const head=add.closest('.card')?.querySelector('.card-head');if(head){head.classList.add('management-heading');head.append(add);}}
 }
 document.querySelectorAll('#content .legal-domain-actions .legal-create-service').forEach(button=>{button.classList.add('primary','management-create','ant-btn-primary');button.classList.remove('ant-btn-default','ant-btn-text');});
 unifyAntAppearance();
}
const renderBeforeActionConsistency=render;
render=function(){renderBeforeActionConsistency();consistentManagementActions();};
render();
