try {
	if (AInfo["Related Record ID"] != null) {
		addParent(AInfo["Related Record ID"]);
		pLicCap = aa.cap.getCapID(["Related Record ID"]).getOutput();
	}
	
	performCISLookup();
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}