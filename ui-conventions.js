// Shared vocabulary, action hierarchy and placement for currently rendered pages.
function actionToolbar(buttons){const bar=document.createElement('div');bar.className='page-action-bar';buttons.forEach(b=>bar.append(b));return bar;}
const renderBeforeConventions=render;
render=function(){
 renderBeforeConventions();
 const content=document.getElementById('content'),prev=document.getElementById('prev'),next=document.getElementById('next');
 prev.textContent='上一步';
 if(page<5)next.textContent='下一步';
 if(page===2&&mapView.tab!=='board'){
  prev.onclick=()=>visitMapStep('board');prev.disabled=false;
  next.textContent='完成';next.onclick=()=>visitMapStep('board');
 }
 // One primary add action at the top of each collection page.
 if(page===4){
  const add=content.querySelector('button[onclick="openAccountEditor()"]');
  if(add){const old=add.closest('.card');add.textContent='添加账号';content.prepend(actionToolbar([add]));old?.remove();}
  content.querySelectorAll('button[onclick^="removeEntry(\'accounts\'"]').forEach(b=>{
   const card=b.closest('.card');const row=card?.querySelector('.account-link-row');if(row){let actions=row.querySelector('.record-actions');if(!actions){actions=document.createElement('div');actions.className='record-actions';const edit=row.querySelector('button');if(edit)actions.append(edit);row.append(actions);}actions.append(b);}
  });
 }
 if(page===5){const bar=content.querySelector('.management-bar');bar?.classList.add('page-action-bar');}
 if(page===1){const add=content.querySelector('.career-add');if(add){add.textContent='添加任职经历';add.classList.add('primary');if(!add.hidden)content.prepend(actionToolbar([add]));}}
 content.querySelectorAll('button').forEach(b=>{
  if(b.children.length)return;
  const text=b.textContent.trim();
  if(/^[＋+]\s*/.test(text))b.textContent=text.replace(/^[＋+]\s*/,'');
  const label=b.textContent.trim();
  if(/^删除/.test(label))b.classList.add('action-delete');
  else if(/^移除/.test(label))b.classList.add('action-remove');
  else if(/^编辑/.test(label))b.classList.add('action-edit');
  else if(/^添加/.test(label)&&!b.classList.contains('primary'))b.classList.add('action-add-secondary');
 });
};
