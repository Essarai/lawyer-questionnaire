const answerExamples={
  "base_motivation": "可以从最初的兴趣、一次重要经历或一位影响你的人说起，说明为什么最终选择律师这份职业。",
  "base_personalTags": "写下你认可的性格、做事方式或沟通风格标签，可补充一两件能体现这些特点的小事。",
  "jobs_#_responsibility": "说明你服务的对象、经常处理的工作，以及自己具体负责的环节。",
  "jobs_#_moment": "选一件有成就感或难忘的事，或一位影响你的人，讲讲发生了什么、你做了什么，以及对你的影响。",
  "jobs_#_supplement": "补充这段经历中的转变、收获，或前面没有提到的重要信息；没有可留空。",
  "global_exclude": "说明你通常不承接的案件类型、委托要求或具体情形，以及必要的原因；没有额外限制可填“暂无”。",
  "businessAreas_#_products_#_issues": "聚焦这款产品能解决的法律问题：客户遇到什么争议、困难或风险时会需要它？",
  "businessAreas_#_products_#_services": "按实际办理过程写出你会做的工作，以及客户能获得的文书、分析、代理或其他服务成果。",
  "businessAreas_#_products_#_conditions": "只补充这款产品特有的承接条件，可考虑事项阶段、材料要求、地域或服务范围；没有可留空。",
  "businessAreas_#_profiles_#_types": "只描述这款产品主要服务的客户：是个人、企业还是其他机构？进一步说明其身份或业务角色。",
  "businessAreas_#_profiles_#_identities": "回想实际接触过的客户，归纳他们在行业、规模、职业、知识程度或决策习惯等方面的共同特点，不必每项都写。",
  "businessAreas_#_profiles_#_scene": "描述客户来咨询时的具体场景：发生了什么、事情进展到哪一步、为什么此时来找你。",
  "businessAreas_#_profiles_#_request": "除了表面的法律诉求，写出客户真正想得到的结果，以及对时间、成本或关系维护的考虑。",
  "businessAreas_#_profiles_#_worry": "写出客户最担心的风险、损失或不确定性，可回想他们反复确认、迟迟犹豫的问题。",
  "customer-quotes": "回想咨询中反复出现的问题，尽量保留客户原本的说法。多个问题可分行填写。",
  "businessAreas_#_profiles_#_ideal": "描述你希望更多服务的客户特征，并说明原因，可考虑需求匹配、沟通方式、配合程度或服务价值。",
  "businessAreas_#_products_#_audiences_#_note": "补充这类客户使用当前产品时的特殊需求、沟通安排或注意事项，避免重复前面的回答。",
  "expression_taboo": "列出你不愿在公开平台讨论的话题、人物或经历范围；没有额外限制可填“暂无”。",
  "supplement_cases_#_situation": "描述事件发生时客户原本的生活、工作或经营状态，以及当时面对的压力和限制。",
  "supplement_cases_#_trigger": "写清楚促使客户寻求帮助的具体事件、发生时间，以及是否存在必须尽快处理的节点。",
  "supplement_cases_#_background": "按先后顺序说明客户之前尝试过哪些办法、效果如何，以及最终委托你的原因。",
  "supplement_cases_#_goal": "补充尚未提及的处理经过、结果、特殊情况或值得记录的经验；没有可留空。"
};
const renderBeforeExamples=render;
render=function(){renderBeforeExamples();document.querySelectorAll('#content textarea').forEach(input=>{
 const key=input.id==='customer-quotes'?input.id:input.id.replace(/^f_/,'').replace(/_input$/,'').replace(/_\d+(?=_|$)/g,'_#');
 const example=answerExamples[key];if(!example)return;
 input.placeholder=example;
 if(input.value.trim()){
 const hint=document.createElement('p');hint.className='answer-example';hint.id=input.id+'-example';hint.textContent='填写方向：'+example;input.after(hint);input.setAttribute('aria-describedby',hint.id);
 }
});};
