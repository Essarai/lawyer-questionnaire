// The law firm is optional for every role, and hidden for personal lawyers.
const validateBeforeOptionalFirm=validate;
validate=function(){return validateBeforeOptionalFirm().filter(issue=>issue.text!=='所在律所'&&issue.identityField!=='base_firm');};
render();
