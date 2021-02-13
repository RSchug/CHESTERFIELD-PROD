try {
	
} catch (err) {
		logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}

/*  This is previous implementer code:
Title : Limited Duration Sign Count
Purpose : Count number of records and update ASI
Author: Yazan Barghouth
Functional Area : ASA
Description : Script gets all address related Caps of type "Building/Permit/Sign/NA",
then counts the records were created in the last 365 days
and update ASI "CC-PLN-LDS.Banner Permits This Year" with count value */
/*
useAppSpecificGroupName = true;
var relatedCaps = getRelatedCapsByAddress("Planning/Limited Duration Sign/NA/NA");
if (relatedCaps) {
	var count = 0;
	for (r in relatedCaps) {
		var tmpCap = aa.cap.getCap(relatedCaps[r].getCapID()).getOutput();
		var capOpenDate = formatDateX(tmpCap.getAuditDate());
		var diff = aa.date.diffDate(formatDateX(aa.date.getCurrentDate()), capOpenDate);
		if (diff <= 365) {
			++count;
		}
	}//for all related caps
	editAppSpecific("CC-PLN-LDS.Banner Permits This Year", "" + count);
}//relatedCaps
function formatDateX(scriptDate) {
	var ret = "";
	ret += scriptDate.getMonth().toString().length == 1 ? "0" + scriptDate.getMonth() : scriptDate.getMonth();
	ret += "/";
	ret += scriptDate.getDayOfMonth().toString().length == 1 ? "0" + scriptDate.getDayOfMonth() : scriptDate.getDayOfMonth();
	ret += "/";
	ret += scriptDate.getYear();
	return ret;
}  */