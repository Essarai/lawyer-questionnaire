const careerBeforeRelatedCases=careerPage;
careerPage=function(){return careerBeforeRelatedCases().replaceAll('案例库','相关案例').replaceAll('上传案例材料','上传文件');};
const portraitBeforeRelatedCases=portraitBody;
portraitBody=function(p){return portraitBeforeRelatedCases(p).replaceAll('案例库','相关案例');};
const boardBeforeDomainMenu=businessBoard;
businessBoard=function(){
 const root=document.createElement('div');root.innerHTML=boardBeforeDomainMenu();
 root.querySelectorAll('.legal-domain').forEach(section=>{
  const old=section.querySelector('.legal-delete-domain');if(!old)return;
  const action=old.getAttribute('onclick');
  const holder=document.createElement('div');holder.className='domain-more-holder';
  holder.innerHTML=`<button type="button" class="domain-more-button" aria-label="更多领域操作" aria-expanded="false" onclick="toggleDomainMore(this)">···</button><div class="domain-more-menu" hidden role="menu"><button type="button" role="menuitem" onclick="${action};closeDomainMenus()">删除业务领域</button></div>`;
  old.replaceWith(holder);
 });return root.innerHTML;
};
function closeDomainMenus(){document.querySelectorAll('.domain-more-menu').forEach(menu=>menu.hidden=true);document.querySelectorAll('.domain-more-button').forEach(button=>button.setAttribute('aria-expanded','false'));}
function toggleDomainMore(button){const menu=button.nextElementSibling,wasOpen=!menu.hidden;closeDomainMenus();if(!wasOpen){menu.hidden=false;button.setAttribute('aria-expanded','true');}}
document.addEventListener('click',event=>{if(!event.target.closest('.domain-more-holder'))closeDomainMenus();});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeDomainMenus();});
render();
