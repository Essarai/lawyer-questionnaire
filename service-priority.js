function serviceShortField(path,label,settings={}){return field(path,label,settings).replace('<textarea ','<textarea data-min-rows="2" ');}
productEditor=function(a,p,ai,pi){
 const path=`businessAreas.${ai}.products.${pi}`;
 const idx=a.profiles.findIndex(pr=>pr.id===p.audiences[0]?.profileId);
 if(idx<0)return '<p class="muted">请返回列表后重新打开服务。</p>';
 const userPath=`businessAreas.${ai}.profiles.${idx}`,pr=a.profiles[idx];
 const q=(key,label,placeholder)=>serviceShortField(userPath+'.'+key,label,{type:'textarea',required:true,placeholder});
 const additional=field(userPath+'.name','目标用户名称',{placeholder:'选填，便于自己识别这类用户'})+
  serviceShortField(userPath+'.identities','这类客户通常有哪些共同特征？',{type:'textarea',placeholder:'例如行业、岗位、企业规模或其他常见特征。'})+
  serviceShortField(userPath+'.worry','客户最担心什么？',{type:'textarea'})+
  customerQuotesInput(userPath)+
  serviceShortField(userPath+'.ideal','你希望更多服务哪类客户？为什么？',{type:'textarea'})+
  serviceShortField(path+'.audiences.0.note','关于这类客户，还有什么值得补充？',{type:'textarea'})+
  (p.issues?.trim()?serviceShortField(path+'.issues','此前填写的法律问题',{type:'textarea'}):'');
 return `<div class="service-priority-form"><div class="service-priority-intro"><p>先填写 5 项核心信息，其他细节可稍后补充。</p></div><section class="service-essential">${field(path+'.name','服务名称',{required:true,onInput:'renameBoardEntity',placeholder:'例如：劳动争议仲裁代理'})}${q('types','目标客户','例如：被公司辞退的员工、中小企业负责人。')}${serviceShortField(path+'.services','场景',{type:'textarea',required:true,placeholder:'例如：员工被要求当天签署离职协议，补偿方案存在争议。'})}${q('scene','客户需求','例如：核对补偿金额、明确维权路径、准备仲裁材料。')}${field(path+'.feeRange','收费区间',{placeholder:'例如：5000—10000 元／件，也可填写“面议”。'})}</section><div class="service-optional-heading"><h3>进一步补充 <small>选填，可稍后填写</small></h3></div><details class="service-optional" id="service-user-extra-${p.id}"><summary>目标用户的更多信息</summary><div class="service-optional-body">${additional}</div></details><details class="service-optional" id="service-condition-extra-${p.id}"><summary>特殊承接条件</summary><div class="service-optional-body">${serviceShortField(path+'.conditions','这项服务有哪些额外承接条件？',{type:'textarea',placeholder:'例如涉案金额、案件阶段、地域或材料要求；没有可留空。'})}</div></details><p class="service-form-saved">填写内容自动保存，可随时返回列表。</p></div>`;
};
newEntityDialog=function(type,ai,pi){if(type!=='product'){originalDialog(type,ai,pi);return;}if(ai===undefined){createBusinessDomain();return;}addMapProduct(ai,'');requestAnimationFrame(()=>document.querySelector(`#f_businessAreas_${ai}_products_${state.businessAreas[ai].products.length-1}_name_input`)?.focus({preventScroll:true}));};
// Preserve existing price answers when moving to a single free-text range.
for(const area of state.businessAreas)for(const product of area.products){
 if(product.feeRange===undefined)product.feeRange=product.priceMode&&product.priceMode!=='暂不明确'?priceLabel(product):'';
}
const priceLabelBeforeRange=priceLabel;
priceLabel=function(product){return product.feeRange?.trim()||priceLabelBeforeRange(product);};
save();render();
