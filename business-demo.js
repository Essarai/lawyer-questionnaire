function makeBusinessDemo() {
  const employee = {...newProfile(), name:'收到解除通知的员工', types:'个人', identities:'准备办理离职的员工',
    scene:'人事要求当天签署离职协议，补偿只写了总额。', request:'核对补偿与欠付奖金，决定是否签字。',
    worry:'签字后还能不能追讨季度奖金。', questions:['协议只写了一笔总额，怎么知道里面算没算奖金？']};
  const hr = {...newProfile(), name:'处理解约的人事负责人', types:'中小企业', identities:'负责人员调整的人事经理',
    scene:'部门合并后需要和员工协商解除，现有协议没有约定年假和提成。', request:'明确支付项目，准备谈话方案和书面协议。',
    questions:['剩余年假和没结算的提成，应该怎么列？']};
  const supplier = {...newProfile(), name:'货款逾期的供货商', types:'制造与批发企业', identities:'负责回款的经营者或财务主管',
    scene:'货已交付三个月，对方以未完成内部对账为由迟迟不付款。', request:'固定交易证据，向采购方追收货款。',
    questions:['只有签收单和微信对账，可以先发催款函吗？']};
  const parent = {...newProfile(), name:'协商离婚的未成年子女家长', types:'个人', identities:'正在协商抚养安排的父母一方',
    scene:'双方同意离婚，但对探望时间、教育费和房贷分担没有谈拢。', request:'把探望和分担费用的办法写成可执行的约定。',
    questions:['孩子临时要上课，探望日期怎么调整？']};

  function offering(name, issues, services, feeMethod, fixed, customers) {
    return {...newMapProduct(name), issues, services, feeMethod, fees:[feeMethod], billingVersion:2,
      source:'模拟数据', priceMode:'固定价格', fixed:String(fixed),
      audiences:customers.map(([pr,note])=>({profileId:pr.id,note}))};
  }
  const labor = newArea('劳动人事与社会保障 / 解除终止与经济补偿');
  labor.items=['解除协议审阅','经济补偿测算','核查未休年假与销售提成'];
  labor.profiles=[employee,hr];
  labor.products=[
    offering('解除协议审阅','补偿条款和放弃权利的范围不清楚。','核对补偿明细，逐条批注协议，提供一次电话说明。','按件',1200,
      [[employee,'带上解除通知和近十二个月工资流水。'],[hr,'提供企业拟签版本及补偿测算表。']]),
    offering('劳动仲裁申请准备','与单位协商未果，需要确定请求和证据。','梳理时间线、起草仲裁申请书，整理证据目录。','按阶段',3200,
      [[employee,'本阶段交付申请材料，出庭代理另行约定。']])
  ];
  labor.products[0].core=true;
  const trade = newArea('合同与债权债务 / 买卖合同');
  trade.items=['货款催收','核验签收人与对账记录','分期还款协议起草'];
  trade.profiles=[supplier];
  trade.products=[
    offering('货款催收函','买方拖延对账或付款。','核验订单和签收单，起草并寄送律师函，记录送达情况。','按件',1800,[[supplier,'按同一买方归集多批次订单。']]),
    offering('货款诉前证据梳理','订单、交付和开票记录无法逐笔对应。','制作逐笔对账表，列明证据缺口，评估诉前准备工作。','按阶段',3600,[[supplier,'适用于催款后仍有金额争议的交易。']])
  ];
  const family = newArea('婚姻家事与财富传承 / 离婚纠纷');
  family.items=['抚养和探望安排','房贷分担约定','离婚协议起草'];
  family.profiles=[parent];
  family.products=[
    offering('抚养与探望方案咨询','假期探望和日常费用分担缺少具体安排。','结合子女作息拟定探望日历，梳理教育和医疗支出分担方式。','按次',800,[[parent,'可带上孩子的作息表和近期支出。']]),
    offering('离婚协议起草','双方已达成初步意向，需要落实为书面条款。','核对财产清单，起草协议并根据反馈修改一轮。','按件',2800,[[parent,'先确认双方已达成共识的事项。']])
  ];
  return {version:'business-map-v6',answerRevision:5,demo:true,
    base:{name:'陈知予',display:'陈律师',firm:'示例律师事务所',qualification:'律师执业资格',years:'5年及以上',
      role:'合伙人',province:'浙江省',city:'杭州市',outOfTown:'视案件情况而定',languages:['普通话']},
    global:{consultations:'6—10',exclude:'不承接存在利益冲突的委托；不接受以保证胜诉或保证回款为前提的委托。'},
    businessAreas:[labor,trade,family],experience:[],jobs:[],method:'先核对事实和材料，再与客户确认希望实现的结果。',
    expression:{links:'',liked:'',disliked:'',taboo:'不讨论未公开的案件细节。'},accounts:[],supplement:{cases:[]},
    sources:{'global.consultations':'模拟数据','global.exclude':'模拟数据'},confirmed:null};
}
