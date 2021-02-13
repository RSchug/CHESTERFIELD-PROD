try {
	//?
	if(matches(appStatus,"Cancelled","Completed","Expired","Withdrawn")) {
		inspCancelAll();
	}
} catch (err) {
	logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}