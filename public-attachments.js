state.base.publicAttachments ||= [];
const backgroundBeforeAttachments=backgroundFields;
backgroundFields=function(){
 const root=document.createElement('div');root.innerHTML=backgroundBeforeAttachments();
 const section=[...root.querySelectorAll('details')].find(d=>d.querySelector('summary')?.textContent==='公开任职、荣誉与作品');
 section?.querySelector('.identity-grid')?.insertAdjacentHTML('beforeend',`<div class="field public-attachments public-attachment-field"><label>附件</label><div class="public-attachment-picker"><button class="primary" onclick="document.getElementById('public-attachment-files').click()">添加附件</button></div><input id="public-attachment-files" type="file" multiple hidden style="display:none" onchange="uploadPublicAttachments(this)">${state.base.publicAttachments.map(f=>`<div class="collection-list-row"><span>${esc(f.name)}</span><div class="collection-row-actions"><button onclick="downloadExtraMaterial('${f.id}')">下载</button><button onclick="removePublicAttachment('${f.id}')">移除</button></div></div>`).join('')}</div>`);
 return root.innerHTML;
};
async function uploadPublicAttachments(input){
 input.disabled=true;
 try{for(const file of Array.from(input.files)){
  if(file.size>25*1024*1024)throw Error(file.name+' 超过 25 MB，请压缩后重试。');
  const id=uid();await materialStore('readwrite',store=>store.put({id,file}));state.base.publicAttachments.push({id,name:file.name,size:file.size,type:file.type});
 }changed();toast('附件已保存');}catch(error){save();render();toast(error.message);}finally{input.disabled=false;}
}
async function removePublicAttachment(id){try{await materialStore('readwrite',store=>store.delete(id));state.base.publicAttachments=state.base.publicAttachments.filter(f=>f.id!==id);changed();}catch(error){toast(error.message);}}
const portraitBeforePublicAttachments=portraitBody;
portraitBody=function(p){return portraitBeforePublicAttachments(p)+(p.input.base.publicAttachments?.length?portraitSection('公开任职、荣誉与作品附件',0,portraitRows([['附件',p.input.base.publicAttachments.map(f=>f.name)]])):'');};
render();
