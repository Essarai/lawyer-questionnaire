// Prototype session state is separate from questionnaire answers and uploaded files.
let platformSignedOut=false;
try{platformSignedOut=sessionStorage.getItem('kalu-platform-signed-out')==='true';}catch{}
const platformSessionHost=document.createElement('div');
platformSessionHost.id='platform-session-root';
document.body.append(platformSessionHost);
const platformSessionRoot=ReactDOM.createRoot(platformSessionHost);
const platformSidebar=document.querySelector('aside');
const platformSidebarScroll=document.createElement('div');
platformSidebarScroll.className='sidebar-scroll-area';
while(platformSidebar.firstChild)platformSidebarScroll.append(platformSidebar.firstChild);
const platformSettingsHost=document.createElement('div');
platformSettingsHost.className='platform-settings-bar';
platformSidebar.append(platformSidebarScroll,platformSettingsHost);
function PlatformSettings(){
 const [open,setOpen]=React.useState(false);
 const icon=name=>h('img',{src:`vendor/lucide-${name}.svg`,width:18,height:18,alt:'','aria-hidden':true});
 return h(antd.Dropdown,{
  open,onOpenChange:setOpen,trigger:['click'],placement:'topLeft',
  menu:{items:[{key:'logout',label:'退出登录',icon:icon('log-out')}],onClick:()=>{setOpen(false);logoutPlatform();}},
 },h(antd.Tooltip,{title:open?'':'设置'},h(antd.Button,{
  type:'text',className:'platform-settings-trigger',icon:icon('settings'),
  'aria-label':'设置','aria-haspopup':'menu','aria-expanded':open,
  onKeyDown:event=>{if(event.key==='Escape')setOpen(false);}
 })));
}
ReactDOM.createRoot(platformSettingsHost).render(h(antd.ConfigProvider,{theme:questionnaireTheme},h(PlatformSettings)));
function syncPlatformSession(){
 document.body.classList.toggle('platform-signed-out',platformSignedOut);
 ReactDOM.flushSync(()=>platformSessionRoot.render(platformSignedOut?h(antd.ConfigProvider,{theme:questionnaireTheme},
  h(antd.Result,{status:'success',title:'已退出登录',extra:h(antd.Button,{type:'primary',onClick:loginPlatform},'重新登录')})
 ):null));
 if(platformSignedOut)platformSessionHost.querySelector('button')?.focus();
}
function logoutPlatform(){
 save();
 document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());
 platformSignedOut=true;
 try{sessionStorage.setItem('kalu-platform-signed-out','true');}catch{}
 syncPlatformSession();
}
function loginPlatform(){
 platformSignedOut=false;
 try{sessionStorage.removeItem('kalu-platform-signed-out');}catch{}
 syncPlatformSession();
 document.querySelector('.platform-settings-trigger')?.focus();
}
syncPlatformSession();
