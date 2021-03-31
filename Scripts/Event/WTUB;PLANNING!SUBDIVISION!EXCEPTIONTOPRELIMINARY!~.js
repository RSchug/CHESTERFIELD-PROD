try {
	// Results required 93P
	if (matches(wfTask, 'Administrative Approval') && matches(wfStatus, 'Final Approval')) {
		if (AInfo['No Time Limit'] != 'CHECKED'){
			if (AInfo['Approved Time Limit'] == null || AInfo['Conditions'] == null) {
				showMessage = true;
				comment('Since the No Time Limit is unchecked, you need to fill in the Approved Time Limit field in the <b>Results</b> area, and cannot advance this workflow until that is filled in.');
				cancel = true;
			}
		}
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}