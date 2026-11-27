// Document text is processed locally. Classification is conservative and reviewable.
pdfjsLib.GlobalWorkerOptions.workerSrc='vendor/pdf.worker.min.js';
function chooseCareerDocument(index){
 const input=document.createElement('input');input.type='file';input.accept='.docx,.pdf';
 input.onchange=()=>{if(input.files[0])importCareerDocument(index,input.files[0]);};input.click();
}
function careerCases(job,index){
 const entries=state.supplement.cases.map((c,i)=>({c,i})).filter(({c})=>job.id&&c.jobId===job.id);
 return `<section class="career-cases"><div class="row"><h3>案例库</h3><button type="button" onclick="chooseCareerDocument(${index})">上传案例材料</button></div><p class="small muted">上传 Word（.docx）或文字型 PDF，识别后核对案例信息。每份材料建立一个案例。</p>${entries.map(({i})=>caseCard(i)).join('')||'<div class="case-upload-empty"><strong>从一份案例材料开始</strong><p>上传后自动读取文字，整理已有信息，再由你核对补充。</p></div>'}</section>`;
}
function extractCaseFields(text,filename){
 const c=newCase();c.name=filename.replace(/\.(docx|pdf)$/i,'');c.files=[filename];
 const labels={name:['案例名称','事项名称','案件名称','标题'],type:['事项类型','案件类型','诉讼或非诉事项类型'],domain:['法律领域','所属法律领域','事项所属法律领域'],industry:['涉及行业','行业'],client:['客户类型','委托人类型'],situation:['客户处境','客户现状','客户背景'],trigger:['触发事件','需求触发事件','案发经过'],background:['委托背景','委托经过'],goal:['补充说明','处理结果','案件结果','其他补充']};
 const map=new Map(Object.entries(labels).flatMap(([key,names])=>names.map(label=>[label,key])));
 let current=null;const matched=new Set();
 for(const line of text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean)){
  const m=/^(?:[一二三四五六七八九十\d]+[、.．)）]\s*)?([^：:]{2,18})[：:]\s*(.*)$/.exec(line);
  if(m&&map.has(m[1])){current=map.get(m[1]);c[current]=m[2];matched.add(current);}
  else if(map.has(line)){current=map.get(line);c[current]='';matched.add(current);}
  else if(current)c[current]+=(c[current]?'\n':'')+line;
 }
 c.sourceText=text;c.extractedFields=[...matched];c.importedAt=new Date().toISOString();
 return c;
}
async function readCaseDocument(file){
 if(file.size>25*1024*1024)throw Error('文件超过 25 MB，请压缩或拆分后重试。');
 const bytes=await file.arrayBuffer();
 if(/\.docx$/i.test(file.name)){const result=await mammoth.extractRawText({arrayBuffer:bytes});return result.value;}
 if(/\.pdf$/i.test(file.name)){
  const loading=pdfjsLib.getDocument({data:new Uint8Array(bytes),isEvalSupported:false});
  const pdf=await loading.promise;try{const pages=[];for(let i=1;i<=pdf.numPages;i++){
   const content=await (await pdf.getPage(i)).getTextContent();let text='';
   for(const item of content.items)text+=item.str+(item.hasEOL?'\n':' ');pages.push(text);
  }return pages.join('\n\n');}finally{await pdf.destroy();}
 }
 throw Error('请选择 Word（.docx）或 PDF 文件。旧版 .doc 请先另存为 .docx。');
}
async function importCareerDocument(index,file){
 const dlg=$('#modal');dlg.innerHTML='<h2>正在识别案例材料</h2><p role="status">读取文件并整理案例信息，请稍候…</p>';dlg.showModal();
 try{
  const text=(await readCaseDocument(file)).trim();if(text.replace(/\s/g,'').length<10)throw Error('未读取到足够文字。扫描版或图片 PDF 需要先进行 OCR 文字识别，请转换后重新上传。');
  if(!state.jobs.length){editingCareerJob=newCareerJob();state.jobs.push(editingCareerJob);}
  const job=state.jobs[index];if(!job)throw Error('未找到这段职业经历，请重新打开后上传。');job.id ||= uid();
  const c=extractCaseFields(text,file.name);c.jobId=job.id;state.supplement.cases.push(c);editingCareerJob=job;
  dlg.close();changed();requestAnimationFrame(()=>document.getElementById('imported-case-'+c.id)?.scrollIntoView({block:'start'}));
  toast('材料已读取，请核对识别结果');
 }catch(error){dlg.innerHTML=`<h2>暂时无法识别这份材料</h2><p role="alert">${esc(error.message||'文件读取失败，请检查文件是否损坏或加密。')}</p><div class="editor-actions"><button onclick="document.querySelector('#modal').close()">关闭</button><button class="primary" id="retryCaseUpload">重新上传</button></div>`;$('#retryCaseUpload').onclick=()=>{dlg.close();chooseCareerDocument(index);};}
}
const caseCardBeforeImport=caseCard;
caseCard=function(i){
 const c=state.supplement.cases[i],root=document.createElement('div');root.innerHTML=caseCardBeforeImport(i);
 root.querySelector('.knowledge-attachments')?.remove();
 if(c.sourceText){const section=root.querySelector('.section-body');section?.insertAdjacentHTML('afterbegin',`<div class="case-import-notice" id="imported-case-${c.id}"><strong>材料已读取 · 请核对</strong><p>${esc(c.files?.[0]||'案例材料')} · 已匹配 ${c.extractedFields?.length||0} 个字段。仅回填原文中明确标注的信息，其余请结合原文补充。</p><details><summary>查看材料原文</summary><pre>${esc(c.sourceText)}</pre></details></div>`);}
 return root.innerHTML;
};
let demoSocialPlatform='抖音';
function openSocialAuthorization(platform='抖音'){
 demoSocialPlatform=platform;const dlg=$('#modal');
 const qr=qrcode(0,'M');qr.addData('DEMO ONLY: '+platform+' authorization prototype. No real account connection.');qr.make();
 dlg.innerHTML=`<div class="social-auth"><span class="badge">原型演示</span><h2>扫码授权自媒体账号</h2><p>选择平台后，使用对应 App 扫码授权。</p><div class="social-platforms">${['抖音','小红书','视频号','公众号','B站','快手'].map(name=>`<button aria-pressed="${name===platform}" onclick="switchSocialPlatform('${name}')">${name}</button>`).join('')}</div><div class="social-qr">${qr.createSvgTag(5,12)}</div><strong>使用${esc(platform)}扫码</strong><p class="small muted">演示二维码，不会连接真实平台或获取账号信息。</p><div class="editor-actions"><button onclick="document.querySelector('#modal').close()">取消</button><button class="primary" onclick="simulateSocialAuthorization()">模拟授权成功</button></div></div>`;
 dlg.showModal();
}
function switchSocialPlatform(platform){$('#modal').close();openSocialAuthorization(platform);}
function simulateSocialAuthorization(){
 const platform=demoSocialPlatform;
 if(!state.accounts.some(a=>a.authorizationDemo&&a.platforms[0]===platform)){
  const a=newAccount();a.platforms=[platform];a.authorizationDemo=true;state.accounts.push(a);
 }
 $('#modal').close();changed();toast('已完成演示授权');
}
accountPage=function(){return box('自媒体账号授权','<p class="small muted">通过扫码连接自媒体账号，账号管理在独立的管理页面进行。</p><button class="primary" onclick="openSocialAuthorization()">添加自媒体账号</button>'+`<div class="social-connected">${state.accounts.filter(a=>a.link||a.authorizationDemo).map(a=>`<span class="social-account-badge">${esc(accountTitle(a))}<small>${a.authorizationDemo?'演示已连接':'已记录'}</small></span>`).join('')}</div>`);};
render();
