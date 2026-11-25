const referenceLinkFields = new Set([
  'base.courses', 'base.talks', 'base.interviews',
  'expression.links', 'expression.liked', 'expression.disliked'
]);
const urlHint = '请输入以 http:// 或 https:// 开头的完整网址';

function webAddress(text) {
  const value = String(text || '').trim();
  if (!/^https?:\/\//i.test(value) || /\s/.test(value)) return null;
  try { return new URL(value).href; } catch { return null; }
}

function UrlInput(props) {
  return h(antd.Input, {
    inputMode: 'url', autoCapitalize: 'none', spellCheck: false,
    placeholder: 'https://', ...props
  });
}

function ReferenceLinks({ path, label }) {
  const [form] = antd.Form.useForm();
  const initial = React.useMemo(() => {
    const value = get(path);
    return { urls: Array.isArray(value) ? value : String(value || '').split(/\r\n|[\r\n]/) };
  }, [path]);
  const rows = antd.Form.useWatch('urls', form) || initial.urls;
  const id = 'f_' + path.replaceAll('.', '_');

  function saveRows(values) {
    const text = values.filter(v => v && v.trim()).join('\n');
    if (text !== (get(path) || '')) put(path, text);
  }
  function pasteRows(event, index) {
    const pasted = event.clipboardData.getData('text/plain');
    if (!/[\r\n]/.test(pasted)) return;
    event.preventDefault();
    const lines = pasted.split(/\r\n|[\r\n]/).map(s => s.trim()).filter(Boolean);
    if (!lines.length) return;
    const input = event.currentTarget;
    const replace = !input.value.trim() ||
      (input.selectionStart === 0 && input.selectionEnd === input.value.length);
    const next = [...form.getFieldValue('urls')];
    next.splice(replace ? index : index + 1, replace ? 1 : 0, ...lines);
    form.setFieldsValue({ urls: next });
    saveRows(next);
  }
  return h(antd.Form, {
    form, component: 'div', name: id, initialValues: initial,
    onValuesChange: (_, values) => saveRows(values.urls || [])
  }, h(antd.Form.List, { name: 'urls' }, (fields, { add, remove }) =>
    h(React.Fragment, null,
      fields.map(({ key, name }) => {
        const value = String(rows[name] || '').trim();
        const invalid = value && (isAccountWorkPath(path) || value !== '暂无') && !webAddress(value);
        const rowLabel = label + '，第 ' + (name + 1) + ' 条';
        return h('div', { key, className: 'reference-link-row' },
          h(antd.Form.Item, { name, validateStatus: invalid ? 'error' : '', help: invalid ? urlHint : undefined },
            h(UrlInput, { type: isAccountWorkPath(path) ? 'url' : 'text', 'aria-label': rowLabel, onPaste: event => pasteRows(event, name) })),
          h(antd.Button, { type: 'text', 'aria-label': '删除' + rowLabel, title: '删除这条链接',
            onClick: () => remove(name) }, '删除'));
      }),
      h(antd.Button, { type: 'link', className: 'link-add', onClick: () => {
        add('');
        requestAnimationFrame(() => document.getElementById(id + '_urls_' + fields.length)?.focus());
      } }, '＋ 添加链接')
    )
  ));
}

function legacyWorkLinks(accounts) {
  const links=new Set();
  for (const account of accounts || []) {
    const text=String(account.highConsultation || '');
    const matches=text.match(/https?:\/\/[^\s<>"“”《》【】、，。；]+/gi) || [];
    for (const url of matches) if (webAddress(url)) links.add(url);
  }
  return [...links];
}

function workLinkRows(value) {
  return String(value || '').split(/\r?\n/).map(url=>url.trim()).filter(Boolean);
}

function isAccountWorkPath(path) {
  return /^accounts\.\d+\.consultationLinks$/.test(path);
}
function accountTitle(a) {
  return (a.platforms || []).map(v=>v==='其他' ? (a.otherPlatform || v) : v).join('、') || '平台账号';
}
function workLinksFor(a) {
  return a.consultationLinks === undefined ? legacyWorkLinks([a]) : workLinkRows(a.consultationLinks);
}
function worksList(urls) {
  const links=urls.filter(webAddress).map(url=>`<li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(url)}</a></li>`);
  return links.length?'<h4>确实带来咨询的作品</h4><ul>'+links.join('')+'</ul>':'';
}
function consultationLinksSummary(input) {
  const cards=(input.accounts||[]).map(a=>{
    const stats=parsedFields.map(([key,label])=>[label,a.stats?.[key]??a[key]]);
    return `<div class="portrait-area"><h3>${esc(accountTitle(a))}</h3>`+
      portraitRows([['账号主页',a.link],['首次正式运营年月',a.startedUnknown?'不清楚':a.started],['统计周期',a.period],...stats])+
      worksList(workLinksFor(a))+'</div>';
  });
  const pending=input.unassignedWorkLinks || workLinkRows(input.consultationLinks);
  return cards.join('')+worksList(pending) || '<p class="muted">尚未添加账号</p>';
}

function restoreAccountWorks(draft) {
  if (!Array.isArray(draft.accounts)) {
    draft.accounts=draft.archivedAnswers?.accounts || [];
    if (draft.archivedAnswers) delete draft.archivedAnswers.accounts;
  }
  const combined=draft.consultationLinks===undefined ? null : workLinkRows(draft.consultationLinks);
  const assigned=new Set();
  for (const a of draft.accounts) {
    if (a.consultationLinks===undefined) {
      const links=legacyWorkLinks([a]);
      a.consultationLinks=(combined===null?links:links.filter(url=>combined.includes(url))).join('\n');
    }
    for (const url of workLinksFor(a)) assigned.add(url);
  }
  if (combined!==null) {
    const pending=combined.filter(url=>!assigned.has(url));
    if (pending.length && draft.accounts.length===1) {
      const a=draft.accounts[0];
      a.consultationLinks=[...new Set([...workLinksFor(a),...pending])].join('\n');
    } else if(pending.length) {
      draft.unassignedWorkLinks=[...new Set([...(draft.unassignedWorkLinks||[]),...pending])];
    }
    delete draft.consultationLinks;
    delete draft.sources.consultationLinks;
  }
}
restoreAccountWorks(state);

function pendingWorksUI() {
  const links=state.unassignedWorkLinks || [];
  if (!links.length) return '';
  const options=state.accounts.map((a,i)=>`<option value="${i}">${esc(accountTitle(a))} · ${esc(a.link)}</option>`).join('');
  return box('待归属的旧版作品链接',links.map((url,i)=>`<div class="field"><label for="pending-work-${i}">作品链接 ${i+1}</label>
    <input id="pending-work-${i}" value="${esc(url)}" placeholder="https://" oninput="put('unassignedWorkLinks.${i}',this.value)">
    <div class="editor-actions">${options?`<select aria-label="作品链接 ${i+1} 归入账号" onchange="if(this.value)movePendingWork(${i},Number(this.value))"><option value="">归入账号</option>${options}</select>`:''}
    <button onclick="state.unassignedWorkLinks.splice(${i},1);changed()">删除</button></div></div>`).join(''));
}
function movePendingWork(index,accountIndex) {
  const a=state.accounts[accountIndex], url=state.unassignedWorkLinks[index].trim();
  if (!webAddress(url)) {toast(urlHint);return;}
  a.consultationLinks=[...new Set([...workLinksFor(a),url])].join('\n');
  state.unassignedWorkLinks.splice(index,1);
  changed();
}
function invalidWorkField() {
  for (const [i,a] of state.accounts.entries()) {
    const row=workLinksFor(a).findIndex(url=>!webAddress(url));
    if(row>=0) return {i,row};
  }
  const row=(state.unassignedWorkLinks||[]).findIndex(url=>url.trim()&&!webAddress(url));
  return row<0?null:{row};
}
function focusInvalidWorkLink() {
  const invalid=invalidWorkField();
  go(4);
  if (!invalid) return;
  if(invalid.i===undefined){document.getElementById('pending-work-'+invalid.row)?.focus();return;}
  const detail=document.getElementById('account-works-'+invalid.i);
  detail.open=true;
  requestAnimationFrame(()=>detail.querySelectorAll('input')[invalid.row]?.focus());
}
const validateBeforeWorkLinks=validate;
validate=function() {
  const issues=validateBeforeWorkLinks();
  if (invalidWorkField()) issues.push({page:4,text:'确实带来咨询的作品',workLinks:true});
  return issues;
};
const exportBeforeWorkLinks=exportAnswers;
exportAnswers=function() {
  if (invalidWorkField()) {focusInvalidWorkLink();toast(urlHint);return;}
  exportBeforeWorkLinks();
};

const accountPlatforms=['小红书','抖音','视频号','公众号','B站','快手','其他'];
function AccountEditor({account,dispose}) {
  const [form]=antd.Form.useForm();
  const [open,setOpen]=React.useState(true);
  const oldPlatform=account?.platforms?.[0];
  const initialPlatform=oldPlatform && !accountPlatforms.includes(oldPlatform)?'其他':oldPlatform;
  const platform=antd.Form.useWatch('platform',form) ?? initialPlatform;
  function saveAccount(values) {
    const link=values.link.trim(), custom=values.platform==='其他'?values.custom.trim():'';
    const name=custom||values.platform;
    if(state.accounts.some(a=>a!==account && accountTitle(a)===name && webAddress(a.link)===webAddress(link))) {
      form.setFields([{name:'link',errors:['这个平台的账号链接已添加']}]);return;
    }
    const target=account||newAccount();
    if(account && (accountTitle(account)!==name || webAddress(account.link)!==webAddress(link))) {
      target.stats={}; target.fetchedAt=null;
    }
    if(!account || values.platform!==oldPlatform) target.platforms=[values.platform];
    target.otherPlatform=custom;
    target.link=link;
    if(!account) state.accounts.push(target);
    setOpen(false);changed();
  }
  return h(antd.Modal,{open,title:account?'编辑账号':'添加账号',okText:'保存',cancelText:'取消',width:460,
    maskClosable:false,onOk:()=>form.submit(),onCancel:()=>setOpen(false),afterClose:dispose},
    h(antd.Form,{form,layout:'vertical',initialValues:{platform:initialPlatform,custom:account?.otherPlatform||(initialPlatform!==oldPlatform?oldPlatform:''),link:account?.link||''},onFinish:saveAccount},
      h(antd.Form.Item,{name:'platform',label:'平台',rules:[{required:true,message:'请选择平台'}]},
        h(antd.Select,{placeholder:'选择平台',virtual:false,getPopupContainer:n=>n.parentElement,options:accountPlatforms.map(value=>({value,label:value}))})),
      platform==='其他' && h(antd.Form.Item,{name:'custom',label:'平台名称',rules:[{required:true,whitespace:true,message:'请填写平台名称'}]},h(antd.Input)),
      h(antd.Form.Item,{name:'link',label:'账号主页链接',required:true,validateTrigger:'onBlur',rules:[{validator:(_,value)=>webAddress(value)?Promise.resolve():Promise.reject(new Error(urlHint))}]},h(UrlInput))));
}
function openAccountEditor(index) {
  const host=document.createElement('div'); document.body.append(host);
  const root=ReactDOM.createRoot(host);
  const dispose=()=>{root.unmount();host.remove();};
  root.render(h(antd.ConfigProvider,{theme:questionnaireTheme},h(AccountEditor,{account:state.accounts[index],dispose})));
}
