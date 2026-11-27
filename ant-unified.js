// Use the bundled Ant Design 5 components and one shared token configuration.
Object.assign(questionnaireTheme.token,{colorPrimary:'#1677ff',colorBorder:'#d9d9d9',colorText:'rgba(0,0,0,0.88)',colorTextSecondary:'rgba(0,0,0,0.65)',colorTextPlaceholder:'rgba(0,0,0,0.25)',borderRadius:6,controlHeight:40,fontSize:14});
const unifiedRoots=[];
function mountAntControls(){
 const controls=[...document.querySelectorAll('#content input:not([class*="ant-"]), #content textarea:not([class*="ant-"]), #content select:not([class*="ant-"])')].filter(el=>!el.closest('[data-choice],[data-links],.ant-select,.ant-picker,.ant-input-number,.ant-checkbox-wrapper,.ant-radio-wrapper,[data-ant-mounted]'));
 for(const el of controls){
  if(el.type==='file'||el.type==='hidden')continue;
  const host=document.createElement('span');host.dataset.antMounted='';host.className='ant-control-host';
  const id=el.id,originalInput=el.oninput,originalChange=el.onchange;
  const callback=(value,event,kind='input')=>{
   if(el.type==='checkbox'||el.type==='radio')el.checked=value;else el.value=value??'';
   const handler=kind==='change'?originalChange:originalInput;
   if(handler)handler.call(el,event||new Event(kind));
   if(kind==='input'&&originalChange&&el.tagName!=='TEXTAREA')originalChange.call(el,new Event('change'));
  };
  const shared={id,'aria-label':el.getAttribute('aria-label')||el.closest('.field')?.querySelector('label')?.textContent,placeholder:el.placeholder,disabled:el.disabled,style:{width:'100%'}};
  let control;
  if(el.tagName==='SELECT')control=h(antd.Select,{...shared,defaultValue:el.value||undefined,placeholder:'请选择',options:[...el.options].filter(o=>o.value).map(o=>({value:o.value,label:o.textContent,disabled:o.disabled})),onChange:value=>callback(value,null,'change'),getPopupContainer:node=>node.parentElement});
  else if(el.tagName==='TEXTAREA')control=h(antd.Input.TextArea,{...shared,defaultValue:el.value,autoSize:{minRows:Number(el.dataset.minRows)||4},onChange:e=>callback(e.target.value,e)});
  else if(el.type==='month')control=h(antd.DatePicker,{...shared,picker:'month',format:'YYYY-MM',placeholder:'请选择年月',defaultValue:el.value?dayjs(el.value):null,onChange:(_,value)=>callback(value,null,originalInput?'input':'change')});
  else if(el.type==='checkbox'||el.type==='radio')control=h(antd.Checkbox,{id,defaultChecked:el.checked,onChange:e=>callback(e.target.checked,e,'change')});
  else if(el.type==='number')control=h(antd.InputNumber,{...shared,defaultValue:el.value===''?null:Number(el.value),min:el.min===''?undefined:Number(el.min),onChange:value=>callback(value,null)});
  else control=h(antd.Input,{...shared,type:el.type||'text',defaultValue:el.value,onChange:e=>callback(e.target.value,e)});
  el.replaceWith(host);const root=ReactDOM.createRoot(host);unifiedRoots.push(root);ReactDOM.flushSync(()=>root.render(h(antd.ConfigProvider,{theme:questionnaireTheme},control)));
 }
}
// Native action handlers remain in place; their appearance uses Ant's generated button styles.
let antStyleHash='';
const styleProbe=document.createElement('div');styleProbe.id='ant-style-probe';styleProbe.style.cssText='position:fixed;left:-10000px;top:0;pointer-events:none';document.body.append(styleProbe);
ReactDOM.createRoot(styleProbe).render(h(antd.ConfigProvider,{theme:questionnaireTheme},h('div',null,h(antd.Button,null,'按钮'),h(antd.Button,{type:'primary'},'主要按钮'),h(antd.Button,{danger:true},'删除'),h(antd.Input),h(antd.Tag,null,'标签'))));
function unifyAntAppearance(){
 antStyleHash ||= [...(styleProbe.querySelector('button')?.classList||[])].find(x=>x.startsWith('css-'))||'';
 document.querySelectorAll('button:not(.ant-btn)').forEach(button=>{
  if(button.closest('#ant-style-probe'))return;
  button.classList.add('ant-btn');if(antStyleHash)button.classList.add(antStyleHash);
  const text=button.textContent.trim(),primary=button.classList.contains('primary');
  const quiet=button.matches('.nav,.career-toggle,.product-drag,.product-card-main,.legal-delete-domain,.product-delete,.back-board');
  button.classList.add(primary?'ant-btn-primary':quiet?'ant-btn-text':'ant-btn-default');
  if(/^删除/.test(text))button.classList.add('ant-btn-dangerous');
 });
 document.querySelectorAll('.badge:not(.ant-tag)').forEach(tag=>{tag.classList.add('ant-tag','ant-tag-blue');if(antStyleHash)tag.classList.add(antStyleHash);});
}
const renderBeforeUnifiedAnt=render;
render=function(){for(const root of unifiedRoots.splice(0))root.unmount();renderBeforeUnifiedAnt();mountAntControls();unifyAntAppearance();};
const antMutationObserver=new MutationObserver(()=>unifyAntAppearance());
antMutationObserver.observe(document.body,{childList:true,subtree:true});
toast=function(message){antd.message.info(message);};
render();
