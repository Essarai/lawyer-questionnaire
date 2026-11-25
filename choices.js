// The questionnaire owns the saved values. Ant components use its existing update
// and deletion handlers so dependent questions and confirmation stay in sync.
const choiceOccurrences = new Map();
function choiceField(path, label, options, settings = {}) {
  const occurrence = choiceOccurrences.get(path) || 0;
  choiceOccurrences.set(path, occurrence + 1);
  const id = 'f_' + path.replaceAll('.', '_') + (occurrence ? '_copy' + occurrence : '');
  const config = { id, path, label, options, multi: true, ...settings };
  return `<div class="field choice-field" id="${id}">
    <label for="${id}_input">${esc(label)}${settings.required ? '<span class="required">必填</span>' : ''}</label>
    <div data-choice="${esc(JSON.stringify(config))}"></div>
  </div>`;
}

const plainField = field;
field = function (path, label, settings = {}) {
  if (referenceLinkFields.has(path) || isAccountWorkPath(path)) {
    const id = 'f_' + path.replaceAll('.', '_');
    return `<div class="field reference-links" id="${id}"><label for="${id}_urls_0">${esc(label)}</label>
      <div data-links="${esc(JSON.stringify({ path, label }))}"></div></div>`;
  }
  if (settings.type === 'select' && settings.options.includes('其他')) {
    return choiceField(path, label, settings.options, { multi: false, required: settings.required });
  }
  return plainField(path, label, settings);
};
checks = (path, label, options, required) => choiceField(path, label, options, { required });
listCustom = (path, label, options) => choiceField(path, label, options, { custom: true, required: true });
twoLevelPicker = () => choiceField('businessAreas', '您未来希望重点发展哪些法律业务？', [], { kind: 'areas', required: true });

const h = React.createElement;
const choiceRoots = [];
let reopenChoice = '';

function productChoices(config) {
  const products = get(config.path);
  // Products can be renamed or copied, so their names are not selection IDs.
  const options = products.map(p => ({ label: p.name || '未命名产品', value: 'id:' + p.id }));
  for (const name of config.options) {
    if (!products.some(p => p.name === name)) options.push({ label: name, value: 'new:' + name });
  }
  return { options, value: products.map(p => 'id:' + p.id) };
}

function openNewBusiness() {
  const modal = document.querySelector('#modal');
  modal.innerHTML = `<form class="choice-form"><h2>添加具体业务</h2>
    <label>一级业务分类<select name="category">${business.map((g,i) => '<option value="'+i+'">'+esc(g.name)+'</option>').join('')}</select></label>
    <label>具体业务名称<input name="leaf" type="text" required autocomplete="off"></label>
    <div class="row"><button type="button">取消</button><button class="primary">添加并选择</button></div></form>`;
  const form = modal.querySelector('form');
  form.querySelector('[type=button]').onclick = () => modal.close();
  form.onsubmit = event => {
    event.preventDefault();
    const group = business[Number(form.elements.category.value)];
    const leaf = form.elements.leaf.value.trim();
    if (!leaf) { form.elements.leaf.focus(); return; }
    const path = group.name + ' / ' + leaf;
    modal.close();
    if (state.businessAreas.some(area => area.path === path)) { toast('已选中这项业务'); return; }
    if (!group.items.includes(leaf)) group.items.push(leaf);
    openMapArea(path, true);
  };
  modal.showModal();
}

function QuestionnaireChoice({ config }) {
  const { path, label, multi, custom, kind } = config;
  const [open, setOpen] = React.useState(reopenChoice === config.id);
  const [search, setSearch] = React.useState('');
  const ref = React.useRef(null);
  React.useLayoutEffect(() => {
    if (reopenChoice === config.id) { reopenChoice = ''; ref.current?.focus(); }
  }, []);
  const common = {
    id: config.id + '_input',
    'aria-label': label, ref, open, onOpenChange: setOpen,
    showSearch: true, searchValue: search, onSearch: setSearch,
    placeholder: custom ? '选择或输入新选项' : multi ? '请选择（可多选）' : '请选择',
    notFoundContent: '无匹配选项', style: { width: '100%' },
    maxTagCount: 3, maxTagPlaceholder: hidden => '另 ' + hidden.length + ' 项'
  };
  if (kind === 'city') {
    const b = state.base;
    const options = Object.entries(regionCities).flatMap(([province, cities]) =>
      cities.map(city => ({
        value: province + '/' + city,
        label: province === city ? city : city + '（' + province + '）'
      })));
    return h(antd.Select, {
      ...common, options, value: b.city ? (b.province ? b.province + '/' : '') + b.city : undefined,
      placeholder: '搜索所在城市', optionFilterProp: 'label',
      onSelect: value => {
        const [province, city] = value.split('/');
        b.province = province;
        b.city = city;
        state.sources['base.province'] = state.sources['base.city'] = '律师填写';
        changed();
      }
    });
  }
  if (kind === 'areas') {
    const treeData = business.map(group => ({
      title: group.name, value: 'group:' + group.name, disableCheckbox: true, selectable: false,
      children: group.items.map(leaf => ({ title: leaf, value: group.name + ' / ' + leaf }))
    }));
    return h(antd.TreeSelect, {
      ...common, maxTagCount: undefined,
      tagRender: ({value,label,onClose}) => {
        const i=state.businessAreas.findIndex(a=>a.path===value);
        const action=(name,disabled,fn)=>h('button',{type:'button',disabled,'aria-label':name+label,title:name,onMouseDown:e=>{e.preventDefault();e.stopPropagation();},onClick:e=>{e.stopPropagation();fn();}},name);
        return h('span',{className:'ordered-business-tag',onMouseDown:e=>e.stopPropagation()},
          h('span',null,(i+1)+'. '+label),
          action('前移',i<=0,()=>priorityMove(i,-1)),
          action('后移',i===state.businessAreas.length-1,()=>priorityMove(i,1)),
          action('移除',false,()=>onClose()));
      }, treeData, treeCheckable: true, treeCheckStrictly: true, treeExpandAction: 'click',
      treeNodeLabelProp: 'value', filterTreeNode: (query, node) => node.value.includes(query),
      value: state.businessAreas.map(a => ({ value: a.path, label: a.path })),
      onChange: (next, labels, change) => {
        const name = change.triggerValue;
        const selected = next.some(item => item.value === name);
        if (selected) reopenChoice = config.id;
        else setOpen(false);
        openMapArea(name, selected);
      },
      popupRender: menu => h(React.Fragment, null, menu,
        h(antd.Button, { type: 'link', className: 'new-business', onClick: () => { setOpen(false); openNewBusiness(); } }, '＋ 添加具体业务'))
    });
  }

  const current = get(path);
  const choices = kind === 'products' ? productChoices(config) : {
    value: multi ? current || [] : current || undefined,
    options: [...new Set([...config.options, ...(multi ? current || [] : current ? [current] : [])])]
      .map(value => ({ value, label: value }))
  };
  const query = search.trim();
  const options = choices.options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));
  if (custom && query && !choices.options.some(o => o.label === query)) {
    options.push({ value: kind === 'products' ? 'new:' + query : query, label: '＋ 添加「' + query + '」' });
  }
  function update(value, selected) {
    if (kind === 'products') {
      const areaIndex = Number(path.split('.')[1]);
      if (selected) addMapProduct(areaIndex, value.slice(4));
      else {
        setOpen(false);
        const index = current.findIndex(p => 'id:' + p.id === value);
        if (index >= 0) removeEntry(path, index);
      }
    } else if (kind === 'billing') {
      const [,areaIndex,,productIndex] = path.split('.');
      setBilling(Number(areaIndex), Number(productIndex), value);
    } else if (multi) {
      if (open && value !== '其他' && value !== '其他方言或语言') reopenChoice = config.id;
      choose(path, { value, checked: selected });
    } else {
      put(path, value);
      render();
    }
  }
  return h(antd.Select, {
    ...common, mode: multi ? 'multiple' : undefined, options, value: choices.value,
    optionLabelProp: 'label', filterOption: false, virtual: false,
    allowClear: !multi && !config.required,
    onClear: () => { if (!multi) update('', true); },
    onSelect: value => update(value, true), onDeselect: value => update(value, false)
  });
}

const renderQuestionnaire = render;
const navigateQuestionnaire = go;
go = function(index, keepEditor = false) {
  if (index === 2 && !keepEditor) mapView.tab = 'board';
  navigateQuestionnaire(index);
};
const questionnaireTheme = { token: { colorPrimary: '#315fe9', colorBorder: '#dce3ef', colorText: '#23314a', colorTextPlaceholder: '#8490a5', borderRadius: 7, controlHeight: 44, fontSize: 14, fontFamily: '-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif' } };
render = function () {
  const mapPanels = '.entity-board details[id], .entity-editor details[id]';
  const openMapDetails = new Set([...document.querySelectorAll(mapPanels)].filter(el=>el.open).map(el=>el.id));
  for (const root of choiceRoots.splice(0)) root.unmount();
  choiceOccurrences.clear();
  renderQuestionnaire();
  const prev = document.getElementById('prev'), next = document.getElementById('next');
  prev.onclick = () => go(page-1);
  next.onclick = nextPage;
  if (page === 2) {
    for (const panel of document.querySelectorAll(mapPanels)) panel.open = openMapDetails.has(panel.id);
    prev.textContent = '返回第二部分';
    next.textContent = '进入第四部分';
    if (mapView.tab !== 'board') {
      next.textContent = '完成并返回总览';
      next.onclick = () => visitMapStep('board');
    }
  }
  for (const node of document.querySelectorAll('#content [data-choice], #content [data-links]')) {
    const root = ReactDOM.createRoot(node);
    choiceRoots.push(root);
    const control = node.hasAttribute('data-links') ? h(ReferenceLinks, JSON.parse(node.dataset.links)) :
      h(QuestionnaireChoice, { config: JSON.parse(node.dataset.choice) });
    root.render(h(antd.ConfigProvider, { theme: questionnaireTheme }, control));
  }
};
