function parseDate(dateString){
	return expression.parseDate(dateString);
}

function formatDate(dateString,pattern){ 
	if(dateString==null||dateString==''){
		return '';
	}
	return expression.formatDate(dateString,pattern);
}

var servProvCode=expression.getValue("$$servProvCode$$").value;
var fileDateField=expression.getValue("CAP::capModel*fileDate");
var today=expression.getValue("$$today$$").getValue();
var thisForm=expression.getValue("CAP::FORM");

var totalRowCount = expression.getTotalRowCount();

try {
if(fileDateField.value!=null && fileDateField.value!="" && formatDate(fileDateField.value,'yyyy/MM/dd')>formatDate(today,'yyyy/MM/dd')){
	fileDateField.message="must be <= current date: " + parseDate(fileDateField.value);
	expression.setReturn(fileDateField);

	thisForm.message="Open date must be <= current date";
	thisForm.blockSubmit=true;
	expression.setReturn(thisForm);
}
} catch (err) {
	fileDateField.message="Invalid Date: " + fileDateField.value + " replaced with current date. " + err.message;
//	expression.setReturn(fileDateField);
	thisForm.message="Invalid Date: " + fileDateField.value + " replaced with current date. " + err.message;
//	thisForm.message="A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: "+ err.stack + " " + fileDateField.value;
//	thisForm.blockSubmit=true;
	expression.setReturn(thisForm);
}
