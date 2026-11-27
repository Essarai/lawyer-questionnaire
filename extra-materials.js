state.extraMaterials ||= {files:[],description:''};
titles[4]='补充材料';subtitles[4]='上传其他有助于了解你的材料，并补充内容说明。';
if(state.extraMaterials.description){
 if(state.extraMaterials.files.length===1&&!state.extraMaterials.files[0].description)state.extraMaterials.files[0].description=state.extraMaterials.description;
 else state.extraMaterials.previousDescription=state.extraMaterials.description;
 delete state.extraMaterials.description;
}
function extraMaterialsPage(){
 const m=state.extraMaterials;
 return box('上传补充材料',`<p class="small muted">可上传多个文件，每个文件不超过 25 MB。为每个文件分别填写内容描述。</p><div class="extra-material-upload"><input id="extra-material-files" aria-label="上传补充材料" type="file" multiple onchange="uploadExtraMaterials(this)"></div><div id="extra-material-status" role="status"></div>${m.files.length?`<ul class="extra-material-list per-file-materials">${m.files.map((f,i)=>`<li><div class="material-file-header"><div><strong>${esc(f.name)}</strong><small>${Math.max(1,Math.round(f.size/1024))} KB</small></div><div><button onclick="downloadExtraMaterial('${f.id}')">下载</button><button onclick="removeExtraMaterial('${f.id}')">移除</button></div></div>${field('extraMaterials.files.'+i+'.description','内容描述',{type:'textarea',placeholder:'说明这个文件的内容、用途，以及需要重点关注的信息。'})}</li>`).join('')}</ul>`:'<p class="small muted">尚未上传补充材料，上传后可逐个填写描述。</p>'}`);
}
let materialDbPromise;
function materialDb(){return materialDbPromise ||= new Promise((resolve,reject)=>{const request=indexedDB.open('lawyer-extra-materials',1);request.onupgradeneeded=()=>request.result.createObjectStore('files',{keyPath:'id'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(Error('无法保存文件，请检查浏览器存储空间。'));});}
async function materialStore(mode,operation){const db=await materialDb();return new Promise((resolve,reject)=>{const transaction=db.transaction('files',mode);const request=operation(transaction.objectStore('files'));let result;request.onsuccess=()=>{result=request.result;};transaction.oncomplete=()=>resolve(result);transaction.onerror=()=>reject(Error('文件保存失败，请重试。'));transaction.onabort=()=>reject(Error('文件保存失败，请重试。'));});}
async function uploadExtraMaterials(input){
 const files=Array.from(input.files);input.disabled=true;const status=$('#extra-material-status');if(status)status.textContent='正在保存文件…';
 try{for(const file of files){if(file.size>25*1024*1024)throw Error(file.name+' 超过 25 MB，请压缩或拆分后重试。');const id=uid();await materialStore('readwrite',store=>store.put({id,file}));state.extraMaterials.files.push({id,name:file.name,size:file.size,type:file.type,description:''});}changed();toast('补充材料已保存');}
 catch(error){save();render();toast(error.message);}finally{input.disabled=false;}
}
async function downloadExtraMaterial(id){try{const item=await materialStore('readonly',store=>store.get(id));if(!item)throw Error('当前浏览器中未找到该文件，请重新上传。');const url=URL.createObjectURL(item.file);const a=document.createElement('a');a.href=url;a.download=item.file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){toast(error.message);}}
async function removeExtraMaterial(id){try{await materialStore('readwrite',store=>store.delete(id));state.extraMaterials.files=state.extraMaterials.files.filter(f=>f.id!==id);changed();}catch(error){toast(error.message);}}
const portraitBeforeExtraMaterials=portraitBody;
portraitBody=function(p){const m=p.input.extraMaterials;return portraitBeforeExtraMaterials(p)+(m?.files.length?portraitSection('补充材料',4,m.files.map(f=>portraitRows([['文件',f.name],['内容描述',f.description]])).join('')):'');};
