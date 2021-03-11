try {
// 57P Summarize each row in the table data: CC - LU - TPA:
	//if (appMatch('Planning/*/*/*')) {
	//create parent relationships - any and all - firstParentName is 1st pageflow, secondParentName is in ASI
		if (AInfo["Related Record ID"] != null) {
			var firstParentName = AInfo["Related Record ID"];
			addParent(firstParentName);
		}
//03-2021 db updated for a 1 record update
    //editAppName('Livingston Apartments Bldg # 1 with Clubhouse');
} catch (err) {
		logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}