const answerExamples={
  "base_motivation": "大学期间参加法律援助，接触到因缺少证据而难以维权的劳动者。我希望把法律知识变成能帮助当事人解决具体问题的办法，因此选择成为律师。",
  "base_personalTags": "细致、耐心、表达直接。同事觉得我会反复核对事实，朋友觉得我善于把复杂事情讲清楚。",
  "jobs_#_responsibility": "主要为中小企业审查劳动合同、处理离职争议，并代理劳动仲裁案件，负责沟通、材料整理和开庭准备。",
  "jobs_#_moment": "曾帮助一位材料不完整的员工梳理工作记录。带教律师提醒我“先听清客户在担心什么”，这句话一直影响着我的沟通方式。",
  "jobs_#_supplement": "这段经历让我逐渐把工作重点转向劳动争议，也让我更重视用客户听得懂的语言解释方案。",
  "global_exclude": "通常不承接要求承诺结果或提供不实材料的委托；超出自身经验范围的业务，会建议客户寻找相应领域的律师。",
  "businessAreas_#_products_#_issues": "员工被解除劳动合同，对解除理由或补偿金额有争议，自行协商后仍未解决，需要评估是否申请劳动仲裁。",
  "businessAreas_#_products_#_services": "核对解除经过，整理证据，测算请求金额，起草仲裁申请，参与庭前准备并代理开庭。",
  "businessAreas_#_products_#_conditions": "这项服务优先承接尚未开庭、能提供基本工作记录的案件。已进入后续程序的事项，需先查看材料再评估。",
  "businessAreas_#_profiles_#_types": "本产品主要服务因解除劳动合同、工资或补偿问题与单位发生争议的个人劳动者。",
  "businessAreas_#_profiles_#_identities": "这类客户多为中小企业员工，不熟悉处理程序；手中有工资流水或聊天记录，但不知道哪些材料有用。",
  "businessAreas_#_profiles_#_scene": "收到解除通知后，与公司协商补偿无果，或被要求尽快签署离职协议时，会来咨询这项服务。",
  "businessAreas_#_profiles_#_request": "希望明确可以主张什么、需要哪些证据，并在时间和费用可接受的情况下争取合理补偿。",
  "businessAreas_#_profiles_#_worry": "担心证据不足、律师费超过预期收益，也担心程序耗时影响找下一份工作。",
  "customer-quotes": "公司让我明天就走，我现在能签字吗？\n没有劳动合同还能申请仲裁吗？\n我需要准备哪些材料？",
  "businessAreas_#_profiles_#_ideal": "希望更多服务愿意说明完整事实、配合整理材料、接受客观风险分析的客户，这样更容易形成合理预期。",
  "businessAreas_#_products_#_audiences_#_note": "这类客户部分仍在职，可提前约定晚间咨询。使用本服务前，需要说明材料准备要求及费用范围。",
  "expression_taboo": "不公开讨论未经允许披露的在办事项、客户私人生活，也不以评价同行或前任职机构作为内容主题。",
  "supplement_cases_#_situation": "客户在制造企业工作多年，工资是家庭主要收入来源。当时仍正常上班，尚未寻找新工作。",
  "supplement_cases_#_trigger": "公司突然通知岗位取消，要求三天内签署离职协议。客户对补偿计算有疑问，因此寻求律师帮助。",
  "supplement_cases_#_background": "客户曾与人事部门协商，但对补偿口径仍有分歧。经朋友介绍咨询后，希望委托律师整理证据并推进处理。",
  "supplement_cases_#_goal": "客户更重视尽快解决争议，因此沟通方案时还需要考虑其重新就业的时间安排。"
};
const renderBeforeExamples=render;
render=function(){renderBeforeExamples();document.querySelectorAll('#content textarea').forEach(input=>{
 const key=input.id==='customer-quotes'?input.id:input.id.replace(/^f_/,'').replace(/_input$/,'').replace(/_\d+(?=_|$)/g,'_#');
 const example=answerExamples[key];if(!example)return;
 input.placeholder='回答示例（虚构，仅供参考）：\n'+example;
 if(input.value.trim()){
 const hint=document.createElement('p');hint.className='answer-example';hint.id=input.id+'-example';hint.textContent='回答示例（虚构，仅供参考）：'+example;input.after(hint);input.setAttribute('aria-describedby',hint.id);
 }
});};
