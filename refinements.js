function citySelect(province,value,path,id,allowAll=false){const opts=regionCities[province]||[];return `<select id="${id}" aria-label="城市" onchange="put('${path}',this.value);render()" ${!province?'disabled':''}><option value="">${allowAll?'省级全域':'请选择市／地区'}</option>${opts.map(v=>`<option ${value===v?'selected':''}>${esc(v)}</option>`).join('')}</select>`}
changeHomeProvince=function(value){state.base.province=value;state.base.city='';changed()};
const oldRegionForm=regionForm;regionForm=function(){const temp=document.createElement('div');temp.innerHTML=oldRegionForm();const city=temp.querySelector('#f_base_city_input');if(city)city.outerHTML=citySelect(state.base.province,state.base.city,'base.city','f_base_city_input');temp.querySelectorAll('input[aria-label^="服务城市"]').forEach((el,i)=>{const r=state.base.specified[i];el.outerHTML=citySelect(r.province,r.city,`base.specified.${i}.city`,'serviceCity_'+i,true)});return temp.innerHTML};
const fieldAliases={'婚姻家事':'婚姻家事与财富传承','劳动人事':'劳动人事与社会保障','公司商事':'公司与股权','刑事':'刑事业务','知识产权':'知识产权与竞争','建设工程':'建设工程与基础设施','其他':'其他专项业务'};
const catalogParent={
'婚姻家事与财富传承':'婚姻家事','劳动人事与社会保障':'劳动人事','公司与股权':'公司商事','合同与债权债务':'公司商事','刑事业务':'刑事','知识产权与竞争':'知识产权','建设工程与基础设施':'建设工程'};
const moreRecommendations={
'企业合规与法律顾问':{products:['企业合规咨询','企业常年法律顾问','合规专项审查','内部调查服务'],identities:['企业主','企业法务','合规负责人']},
'房地产与物业':{products:['房地产法律咨询','房产纠纷代理','房屋交易合同审查','物业专项顾问'],identities:['购房者','业主','房地产企业负责人','物业管理者']},
'土地与征收补偿':{products:['土地法律咨询','征收补偿争议代理','土地流转合同审查'],identities:['被征收人','土地权利人','集体经济组织负责人']},
'互联网、数据与个人信息':{products:['数据合规咨询','个人信息保护专项','平台合同审查','网络权益争议代理'],identities:['互联网企业负责人','数据合规负责人','个人信息主体']},
'金融、证券与投资':{products:['金融法律咨询','金融争议代理','投融资合同审查','投资专项顾问'],identities:['投资者','金融机构法务','企业融资负责人']},
'破产与不良资产':{products:['破产法律咨询','债权申报代理','破产重整专项','不良资产处置顾问'],identities:['债权人','债务企业负责人','投资人']},
'执行与财产处置':{products:['执行法律咨询','强制执行代理','执行异议代理','财产处置专项'],identities:['申请执行人','被执行人','案外权利人']},
'侵权、赔偿与消费者权益':{products:['侵权法律咨询','损害赔偿代理','消费者维权代理'],identities:['受害人','消费者','企业负责人']},
'医疗健康与保险':{products:['医疗保险法律咨询','医疗纠纷代理','保险理赔代理','医疗合规顾问'],identities:['患者','患者家属','投保人','医疗机构负责人']},
'行政与政府法律事务':{products:['行政法律咨询','行政复议代理','行政诉讼代理','政府法律顾问'],identities:['行政相对人','企业负责人','政府部门']},
'税务与海关':{products:['税务海关咨询','税务争议代理','海关合规专项'],identities:['纳税人','企业财务负责人','进出口企业负责人']},
'涉外与跨境业务':{products:['涉外法律咨询','跨境争议代理','跨境合同审查','海外投资专项'],identities:['外贸企业负责人','跨境投资者','涉外事项当事人']},
'其他专项业务':{products:['专项法律咨询','专项争议代理','专项法律顾问'],identities:['个人客户','企业负责人','机构负责人']}
};
let catalogPrepared=false;
function prepareCatalog(){if(catalogPrepared||!business.length)return;catalogPrepared=true;let migrated=false;state.businessAreas.forEach(a=>{if(!a.path.includes(' / ')){migrated=true;const parent=fieldAliases[a.path]||a.path;let g=business.find(g=>g.name===parent);if(!g){g={name:parent,items:[]};business.push(g)}if(!g.items.includes('综合业务（原配置）'))g.items.push('综合业务（原配置）');a.path=parent+' / 综合业务（原配置）'}});if(migrated){state.confirmed=null;save()}}
function recommendedLeafProducts(leaf) {
  const options = {
    '继承纠纷': ['继承法律咨询','遗产分割协商','继承纠纷代理'],
    '遗嘱与遗产管理': ['遗嘱审查','遗产管理专项服务'],
    '离婚纠纷': ['离婚法律咨询','离婚协议起草','离婚诉讼代理'],
    '工伤与职业病': ['工伤认定咨询','工伤待遇争议代理'],
    '刑事申诉': ['刑事申诉评估','刑事申诉代理'],
    '股权转让': ['股权转让协议审查','股权转让专项服务']
  };
  return Object.hasOwn(options, leaf) ? options[leaf] : [leaf+'法律咨询',leaf+'专项服务'];
}
const oldLib=lib;lib=function(a){const parts=a.path.split(' / '),parent=parts[0],leaf=parts.slice(1).join(' / '),g=business.find(x=>x.name===parent);if(!leaf)return oldLib(a);const base=libraries[catalogParent[parent]]||moreRecommendations[parent]||libraries['其他'];return {items:[...new Set([leaf,...(base.items||g?.items||[])])].filter(x=>x!=='综合业务（原配置）'),products:leaf==='综合业务（原配置）'?base.products:recommendedLeafProducts(leaf),identities:base.identities}};
openMapArea=function(name,on){if(on){if(!state.businessAreas.some(a=>a.path===name))state.businessAreas.push(newArea(name));changed()}else{const i=state.businessAreas.findIndex(a=>a.path===name);removeEntry('businessAreas',i)}};
function twoLevelPicker(){return `<div class="field"><label>您未来希望重点发展哪些法律业务？<span class="required">必填 · 数量不限</span></label><div class="business-tree" style="max-height:480px">${business.map((g,i)=>`<details id="domainGroup_${i}"><summary>${esc(g.name)} <span class="small muted">${state.businessAreas.filter(a=>a.path.startsWith(g.name+' / ')).length||''}</span></summary><div class="options" style="padding:12px">${g.items.map(leaf=>{const key=g.name+' / '+leaf;return `<label class="option"><input type="checkbox" value="${esc(key)}" ${state.businessAreas.some(a=>a.path===key)?'checked':''} onchange="openMapArea(this.value,this.checked)">${esc(leaf)}</label>`}).join('')}</div><div class="row" style="padding:0 12px 12px;justify-content:flex-start"><input id="customDomain_${i}" placeholder="其他具体业务" style="max-width:280px"><button onclick="addCustomDomain(${i})">添加并选择</button></div></details>`).join('')}</div></div>`}
function addCustomDomain(i){const name=$('#customDomain_'+i).value.trim();if(!name)return;const g=business[i];if(!g.items.includes(name))g.items.push(name);openMapArea(g.name+' / '+name,true)}
// Custom selections persist in area paths, and are re-added to the menu on load.
const oldBusinessPage=businessPage;businessPage=function(){prepareCatalog();state.businessAreas.forEach(a=>{const [parent,...parts]=a.path.split(' / '),leaf=parts.join(' / '),g=business.find(g=>g.name===parent);if(g&&leaf&&!g.items.includes(leaf))g.items.push(leaf)});return oldBusinessPage()};
const oldProductUI=productUI;productUI=function(ai,pi){const html=oldProductUI(ai,pi);const a=state.businessAreas[ai],p=a.products[pi];return html.replace('</summary>',` <button class="danger" style="float:right;margin-left:12px" aria-label="删除产品 ${esc(p.name)}" onclick="event.preventDefault();event.stopPropagation();removeEntry('businessAreas.${ai}.products',${pi})">删除产品</button></summary>`)};
const oldValidateRefined=validate;validate=function(){const issues=oldValidateRefined();if(state.base.city&&!(regionCities[state.base.province]||[]).includes(state.base.city))issues.push({page:0,text:'请重新选择所在城市'});return issues};
