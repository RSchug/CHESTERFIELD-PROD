try {
	if (appMatch("Enforcement/Street Light/*/*")){
		scheduleInspection("Site Visit", 7, "BILLINGSLEYR", null, "Auto Scheduled");
	}
} catch (err) {
	logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}