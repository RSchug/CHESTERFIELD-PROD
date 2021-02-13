try {
//3P. Fee Balance = 0 THEN: closeTask = 'Fee Payment' 56p - 01-19-21 added the CodeSchema function
	if (isTaskActive("Fee Payment") && (balanceDue == 0)) {
		closeTask("Fee Payment","Payment Received","Updated based on Balance of 0","");
		overallCodeSchema_CC();
		updateAppStatus("In Review","Updated based on full payment.");
	}
//01-15-21 db added per UAT
	if (appMatch("Planning/LandUse/WrittenDetermination/NA") && matches(capStatus, "Fees Requested") && (balanceDue == 0)) {
		closeTask("Request Submitted","Request Validated","Updated based on full payment","");
		activateTask("Inquiry Letter");
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}