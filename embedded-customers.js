
function ensureProductTargets() {
  let dirty=false;
  for(const a of state.businessAreas) {
    const used=new Set();
    for(const p of a.products) {
      const bindings=p.audiences||[];
      const old=bindings.map(b=>a.profiles.find(x=>x.id===b.profileId)).filter(Boolean);
      if(bindings.length===1 && old.length===1 && !used.has(old[0].id)) {used.add(old[0].id);continue;}
      const pr=newProfile();
      for(const key of ['name','types','identities','scene','request','worry','ideal'])
        pr[key]=[...new Set(old.map(x=>answerText(x[key])).filter(Boolean))].join('\n');
      pr.questions=[...new Set(old.flatMap(x=>x.questions||[]).filter(Boolean))];
      if(!pr.questions.length)pr.questions=[''];
      a.profiles.push(pr);used.add(pr.id);
      p.audiences=[{profileId:pr.id,note:[...new Set(bindings.map(combinedCustomerNote).filter(Boolean))].join('\n')}];
      dirty=true;
    }
  }
  if(dirty)save();
}

titles[2]='服务产品';subtitles[2]='点击具体产品，填写服务内容和对应的用户画像。';
productCustomers=function(a,p,ai,pi){
  const idx=a.profiles.findIndex(x=>x.id===p.audiences[0].profileId),path=`businessAreas.${ai}.profiles.${idx}`;
  const q=(key,label,required=false)=>field(path+'.'+key,label,{type:'textarea',required});
  return field(path+'.name','用户画像名称',{placeholder:'例如：遭遇违法解除的员工'})+q('types','在这项法律业务中，你主要为哪些类型的客户提供服务？',true)+
    q('identities','回想过去实际接触过的这类客户，他们通常有哪些共同特征？',true)+
    q('scene','他们遇到什么情况会来找你？',true)+
    q('request','这些客户找到你之后，真正希望解决什么问题，或者实现什么结果？',true)+
    q('worry','客户最担心什么？')+
    customerQuotesInput(path)+
    q('ideal','在过去接触过的客户中，哪些类型的客户是你未来希望更多服务的？为什么？')+
    field(`businessAreas.${ai}.products.${pi}.audiences.0.note`,'针对这类客户使用这项服务的情况，还有哪些你认为值得特别说明的事情？',{type:'textarea'});
};

const productPageBeforeEmbedded=businessPage;
businessPage=function(){ensureProductTargets();return productPageBeforeEmbedded();};
const boardBeforeEmbedded=businessBoard;
businessBoard=function(){const root=document.createElement('div');root.innerHTML=boardBeforeEmbedded();root.querySelector('#board-profile')?.remove();root.querySelector('.board-counts')?.remove();root.querySelector('.entity-columns')?.classList.add('products-only');root.querySelectorAll('.entity-relations').forEach(el=>el.remove());return root.innerHTML;};
const editorBeforeEmbedded=productEditor;
productEditor=function(a,p,ai,pi){return editorBeforeEmbedded(a,p,ai,pi).replace('用户画像 · '+p.audiences.length,'用户画像');};
const duplicateBeforeEmbedded=duplicateProduct;
duplicateProduct=function(ai,pi){const a=state.businessAreas[ai],p=JSON.parse(JSON.stringify(a.products[pi]));p.id=uid();p.name+='（副本）';p.core=false;a.products.push(p);ensureProductTargets();Object.assign(mapView,{area:a.id,product:p.id,profile:'',tab:'service'});changed();toast('已复制产品及用户画像');};
editProduct=function(id,tab='service'){const a=state.businessAreas.find(a=>a.products.some(p=>p.id===id));if(!a)return;Object.assign(mapView,{area:a.id,product:id,profile:'',tab:tab==='profile'?'customers':tab});go(2,true);};
ensureProductTargets();

let draggingProduct=null;
function reorderProduct(ai,from,to){
 const a=state.businessAreas[ai];if(!a||from===to||!a.products[from]||!a.products[to])return;
 const old=a.products.map(p=>p.id);const [p]=a.products.splice(from,1);a.products.splice(to,0,p);
 const remapped={};for(const [key,value] of Object.entries(state.sources||{})){
  const match=/^businessAreas\.(\d+)\.products\.(\d+)(\..*)?$/.exec(key);
  if(!match||Number(match[1])!==ai)continue;
  const index=a.products.findIndex(p=>p.id===old[Number(match[2])]);
  if(index>=0)remapped[`businessAreas.${ai}.products.${index}${match[3]||''}`]=value;
  delete state.sources[key];
 }
 Object.assign(state.sources,remapped);a.products.forEach((p,i)=>p.priority=i+1);changed();toast('产品优先级已保存');
}
function startProductDrag(event,ai,pi){draggingProduct={ai,pi};event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',state.businessAreas[ai].products[pi].id);event.currentTarget.closest('article').classList.add('dragging');}
function overProduct(event,ai){if(draggingProduct?.ai!==ai)return;event.preventDefault();event.dataTransfer.dropEffect='move';}
function dropProduct(event,ai,pi){event.preventDefault();if(draggingProduct?.ai===ai)reorderProduct(ai,draggingProduct.pi,pi);draggingProduct=null;}
function productSortKey(event,ai,pi){if(!['ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();const to=pi+(event.key==='ArrowUp'?-1:1);reorderProduct(ai,pi,to);requestAnimationFrame(()=>document.querySelector(`[data-sort-area="${ai}"][data-sort-index="${Math.max(0,Math.min(to,state.businessAreas[ai].products.length-1))}"]`)?.focus());}

const cardBeforeSorting=boardCard;
boardCard=function(a,ai,p,pi,product){if(!product)return cardBeforeSorting(a,ai,p,pi,product);return `<article class="entity-card sortable-product" data-product-area="${ai}" data-product-index="${pi}">
 <button class="product-drag" data-sort-area="${ai}" data-sort-index="${pi}" aria-label="拖动排序 ${esc(p.name)}，或使用上下方向键" title="拖动排序 · 上下方向键也可调整" onpointerdown="beginCardSort(event,${ai},${pi})" onkeydown="productSortKey(event,${ai},${pi})"><span aria-hidden="true">⠿</span></button>
 <span class="product-rank" aria-label="优先级 ${pi+1}">${String(pi+1).padStart(2,'0')}</span>
 <button class="product-card-main" onclick="openProductCard(${ai},${pi})"><strong>${esc(p.name||'未命名产品')}${pi===0?'<em class="product-priority-label">优先</em>':''}</strong><span>${esc(p.services||p.issues||'点击补充服务内容与用户画像')}</span></button>
 <button class="product-delete" onclick="removeEntry('businessAreas.${ai}.products',${pi})" aria-label="删除产品 ${esc(p.name)}">删除</button></article>`;};
productGroup=function(a,ai){return `<section class="product-group"><div class="direction-head"><h3>${esc(a.path)} <small>${a.products.length} 款产品</small></h3><button class="board-add" onclick="newEntityDialog('product',${ai})">＋ 添加产品</button></div><p class="sort-guidance small muted">按优先级排列 · 拖动左侧手柄调整，点击产品编辑</p><div class="product-sort-list">${a.products.map((p,pi)=>boardCard(a,ai,p,pi,true)).join('')}</div></section>`;};
function beginCardSort(event,ai,pi){
 if(event.button!==0)return;
 const handle=event.currentTarget,card=handle.closest('article');const startY=event.clientY;let target=pi,active=false;
 handle.setPointerCapture(event.pointerId);
 function clear(){document.querySelectorAll('.sort-drop-before,.sort-drop-after').forEach(el=>el.classList.remove('sort-drop-before','sort-drop-after'));}
 function move(e){if(!active&&Math.abs(e.clientY-startY)<5)return;active=true;card.classList.add('is-sorting');document.body.classList.add('sorting-products');clear();
 const under=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-product-index]');
 if(under&&Number(under.dataset.productArea)===ai){target=Number(under.dataset.productIndex);if(target!==pi)under.classList.add(target>pi?'sort-drop-after':'sort-drop-before');}
 if(e.clientY<80)window.scrollBy(0,-18);else if(e.clientY>innerHeight-100)window.scrollBy(0,18);
 }
 function finish(e){handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',finish);handle.removeEventListener('pointercancel',finish);clear();card.classList.remove('is-sorting');document.body.classList.remove('sorting-products');if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId);if(e.type!=='pointercancel'&&active&&target!==pi)reorderProduct(ai,pi,target);}
 handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',finish);
}

function customerQuotesInput(path){const key=path+'.questions',value=get(key);return `<div class="field"><label for="customer-quotes">回想你平时接待这类客户的场景，他们最经常问你哪些问题？请尽量还原客户的原话。</label><textarea id="customer-quotes" placeholder="可填写多个问题，每行一个。" oninput="put('${key}',this.value.split('\\n'))">${esc(Array.isArray(value)?value.join('\n'):value||'')}</textarea></div>`;}
const editorBeforeSimplifying=productEditor;
productEditor=function(a,p,ai,pi){const root=document.createElement('div');root.innerHTML=editorBeforeSimplifying(a,p,ai,pi);root.querySelector('.flow-core')?.remove();root.querySelector('[id^="manage-"]')?.remove();return root.innerHTML;};

// Specific matters no longer appear as a separate question.
const mapIssuesBeforeRemovingMatters=mapIssues;
mapIssues=function(){return mapIssuesBeforeRemovingMatters().filter(issue=>!issue.text.endsWith('：选择业务事项'));};
