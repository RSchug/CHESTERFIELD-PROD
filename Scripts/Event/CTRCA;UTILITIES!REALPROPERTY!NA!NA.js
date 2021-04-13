try {
	if (publicUser) {
	//create parent relationships
		if (AInfo["Utility Construction Record Number"] != null) {
			var UtilParentName = AInfo["Utility Construction Record Number"];
			addParent(UtilParentName);
		}
		if (AInfo["Planning Record Number"] != null) {
			var PlanParentName = AInfo["Planning Record Number"];
			addParent(PlanParentName);
		}
	}
} catch (err) {
		logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}