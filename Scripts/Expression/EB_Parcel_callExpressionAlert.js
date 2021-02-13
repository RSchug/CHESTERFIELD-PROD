var toPrecision = function(value) {
	var multiplier = 10000;
	return Math.round(value * multiplier) / multiplier;
}

function addDate(iDate, nDays) {
	if (isNaN(nDays)) {
		throw ("Day is a invalid number!");
	}
	return expression.addDate(iDate, parseInt(nDays));
}

function diffDate(iDate1, iDate2) {
	return expression.diffDate(iDate1, iDate2);
}

function parseDate(dateString) {
	return expression.parseDate(dateString);
}

function formatDate(dateString, pattern) {
	if (dateString == null || dateString == '') {
		return '';
	}
	return expression.formatDate(dateString, pattern);
}

var servProvCode = expression.getValue("$$servProvCode$$").value;

var totalRowCount = expression.getTotalRowCount();

// How call an EMSE script from an expression

// Create a paramMap object to store the EMSE script to be called and the list of parameters and the values.
var emseMap = expression.createParamMap();

// Create a paramMap object to store the parameters used by the EMSE script and their values.
var emse_0_param = expression.createParamMap();

// Add the parameters
emse_0_param.put("alertMessage", String("Please select an existing Parcel Number.")); // parameter 1

// Add the list of parameters to the EMSE script name value.
emseMap.put("EXPRESSIONALERT", emse_0_param);

// Call the EMSE script.
expression.callEMSEScript(emseMap);