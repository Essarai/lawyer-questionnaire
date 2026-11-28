// Keep the recovered report application isolated from questionnaire state and styles.
let diagnosisModuleOpen=false;
const renderBeforeDiagnosisModule=render;
render=function(){
 renderBeforeDiagnosisModule();
 const navButtons=[...document.querySelectorAll('#nav button')];
 const entry=navButtons.find(button=>['账号诊断','诊断报告'].includes(button.textContent.trim()));
 if(entry){entry.disabled=false;entry.removeAttribute('title');entry.textContent='诊断报告';entry.onclick=openDiagnosisModule;entry.classList.toggle('active',diagnosisModuleOpen);}
 if(diagnosisModuleOpen)navButtons.forEach(button=>{if(button!==entry)button.classList.remove('active');});
 document.body.classList.toggle('diagnosis-module-open',diagnosisModuleOpen);
};
function openDiagnosisModule(){
 diagnosisModuleOpen=true;
 let host=document.getElementById('diagnosis-module');
 if(!host){host=document.createElement('section');host.id='diagnosis-module';host.innerHTML='<iframe title="DNA诊断报告与报告库" src="diagnosis/index.html#/dna/user-1795072497041"></iframe>';document.body.append(host);}
 render();
}
const goBeforeDiagnosisModule=go;
go=function(...args){diagnosisModuleOpen=false;return goBeforeDiagnosisModule(...args);};
render();
