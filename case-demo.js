// One explicitly fictional example illustrates the result of document import.
if(!state.caseImportDemoSeeded){
 if(!state.jobs.length){const job=newCareerJob();job.organization='示例律师事务所（虚构）';job.position='律师';state.jobs.push(job);}
 const job=state.jobs.find(j=>/律/.test(j.organization+' '+j.position))||state.jobs[0];job.id ||= uid();
 const text=`案例名称：违法解除劳动合同赔偿争议（虚构示例）
事项类型：劳动仲裁及调解
法律领域：劳动人事与社会保障 / 劳动合同解除
涉及行业：互联网服务
客户类型：个人劳动者，企业运营岗位员工
客户处境：客户在某互联网企业工作约四年，劳动合同尚未到期。公司调整组织架构后，要求客户短期内办理离职，客户仍有房贷及家庭支出，希望保留工作或获得合理补偿。
触发事件：客户收到公司以岗位调整、绩效不达标为由发出的解除通知，但对考核依据及解除程序存在异议。双方对解除理由和补偿金额分歧较大，客户担心错过维权期限。
委托背景：客户先与直属负责人及人力资源部门沟通，并自行收集劳动合同、工资流水、绩效记录和聊天记录，未能就补偿达成一致。经朋友介绍委托律师，协助核对证据、评估请求并参与劳动仲裁。
处理结果：律师梳理解除经过、工资构成及证据缺口，协助准备仲裁申请，并就解除依据和补偿方案进行沟通。双方最终达成调解，公司按约支付款项，客户确认收款后结束争议。本案例、人物、机构、经过及结果均为虚构，仅用于展示原型。`;
 const c=extractCaseFields(text,'劳动争议案例材料_虚构示例.docx');c.jobId=job.id;c.isMock=true;state.supplement.cases.push(c);state.caseImportDemoSeeded=true;save();
}
const caseCardBeforeDemoLabel=caseCard;
caseCard=function(i){const html=caseCardBeforeDemoLabel(i);return state.supplement.cases[i]?.isMock?html.replace('材料已读取 · 请核对','模拟识别结果 · 虚构示例').replace('仅回填原文中明确标注的信息，其余请结合原文补充。','以下为预置演示数据，展示上传材料后的效果；没有实际上传文件。'):html;};
if(location.hash==='#case-demo'){
 const c=state.supplement.cases.find(c=>c.isMock);editingCareerJob=state.jobs.find(j=>j.id===c?.jobId);go(1);
 requestAnimationFrame(()=>document.getElementById('imported-case-'+c?.id)?.scrollIntoView({block:'start'}));
}else render();
