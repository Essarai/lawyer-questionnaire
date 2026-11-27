// Keep related cases visually subordinate to the career record that owns them.
const careerBeforeHierarchyRefinement=careerPage;
careerPage=function(){
 const root=document.createElement('div');root.innerHTML=careerBeforeHierarchyRefinement();
 if(!collectionDetail)root.querySelectorAll('.card>.section-body').forEach(body=>{
  const heading=body.querySelector('.collection-section-heading');
  if(!heading||!heading.textContent.includes('相关案例'))return;
  body.classList.add('career-related-container');
  const panel=document.createElement('div');panel.className='related-cases-panel';
  while(body.firstChild)panel.append(body.firstChild);body.append(panel);
  heading.classList.add('related-cases-heading');heading.querySelector('h3')?.classList.add('related-cases-title');
  const upload=heading.querySelector('button');if(upload){upload.classList.add('related-case-upload');upload.textContent='添加案例';upload.setAttribute('aria-label','添加案例');}
  panel.querySelectorAll('.collection-list-row').forEach(row=>row.classList.add('related-case-row'));
 });return root.innerHTML;
};
const deleteBeforeUnifiedWording=deleteLegalService;
deleteLegalService=function(...args){deleteBeforeUnifiedWording(...args);const button=$('#confirmServiceDelete');if(button)button.textContent='删除';};
const consistencyBeforeHierarchy=consistentManagementActions;
consistentManagementActions=function(){
 consistencyBeforeHierarchy();
 document.querySelectorAll('.product-delete').forEach(b=>{b.textContent='删除';b.classList.add('row-delete-action');});
 document.querySelectorAll('.collection-row-actions button').forEach(b=>{
  b.classList.add('row-management-action','ant-btn-text');b.classList.remove('ant-btn-default');
 });
 document.querySelectorAll('.related-case-upload').forEach(b=>{
  b.classList.remove('primary','management-create','ant-btn-primary','ant-btn-default');b.classList.add('ant-btn-link');
 });
 document.querySelectorAll('button[onclick^="openCollectionDetail(\'material\'"]').forEach(b=>{b.textContent='编辑';b.classList.add('row-management-action','ant-btn-text');b.classList.remove('ant-btn-default');});
 document.querySelectorAll('.back-board').forEach(b=>b.textContent='返回列表');
 if(page===2&&mapView.tab!=='board'){$('#prev').textContent='返回列表';$('#next').textContent='完成并返回列表';}
};
render();
