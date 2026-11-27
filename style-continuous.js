// Match the first module's single-panel form instead of separate cards.
expressionLatest=function(){
 const files=state.expression.files||[];
 const accounts=state.accounts.filter(a=>a.link||a.authorizationDemo);
 return `<div class="identity-panel style-identity-panel"><section><h2>表达素材</h2><div class="identity-grid"><div class="field style-full-width"><div class="style-field-heading"><label for="style-files">自我介绍、音视频或其他表达材料</label><button class="primary" onclick="document.getElementById('style-files').click()">上传文件</button></div><input id="style-files" type="file" multiple hidden style="display:none" onchange="addStyleFiles(this)">${files.length?files.map((name,i)=>`<div class="row style-file-row"><span>${esc(name)}</span><button onclick="state.expression.files.splice(${i},1);changed()">移除</button></div>`).join(''):'<p class="small muted">尚未添加文件。原型仅记录文件名。</p>'}</div><div class="style-full-width">${field('expression.links','参考链接',{type:'textarea'})}</div><div class="field style-full-width"><div class="style-field-heading"><label>自媒体账号</label><button class="primary" onclick="openSocialAuthorization()">添加自媒体账号</button></div><div class="social-connected">${accounts.map(a=>`<span class="social-account-badge">${esc(accountTitle(a))}<small>${a.authorizationDemo?'演示已连接':'已记录'}</small></span>`).join('')||'<p class="small muted">通过扫码授权连接账号。</p>'}</div></div></div></section><section><h2>表达偏好</h2><div class="identity-grid"><div class="style-full-width">${field('expression.taboo','有哪些话题，即使与你的专业领域或职业经历有关，你也不希望在公开平台讨论？',{type:'textarea',placeholder:'没有额外限制可填“暂无”。'})}</div><div class="style-full-width">${field('expression.liked','偏好达人链接',{type:'textarea'})}</div><div class="style-full-width">${field('expression.disliked','不偏好达人链接',{type:'textarea'})}</div></div></section></div>`;
};
const styleBeforeFieldOrder=expressionLatest;
expressionLatest=function(){
 const root=document.createElement('div');root.innerHTML=styleBeforeFieldOrder();
 const sections=root.querySelectorAll('.style-identity-panel>section');
 const first=sections[0],second=sections[1];
 const grid=first.querySelector('.identity-grid');
 const account=grid.querySelector('button[onclick="openSocialAuthorization()"]')?.closest('.field');
 if(account)grid.prepend(account);
 first.querySelector('h2').textContent='账号与参考素材';
 const preferenceGrid=second.querySelector('.identity-grid');
 const boundary=preferenceGrid.querySelector('#f_expression_taboo')?.parentElement;
 if(boundary)preferenceGrid.append(boundary);
 second.querySelector('h2').textContent='表达偏好与边界';
 return root.innerHTML;
};
subtitles[3]='先提供账号与参考素材，再说明表达偏好和不愿涉及的话题。';
render();
