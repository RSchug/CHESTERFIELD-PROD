try {
	//From eReview
	if (appMatch("Planning/*/*/*") || appMatch("Building/*/*/*") || appMatch("EnvEngineering/*/*/*")) {
		loadCustomScript("DUA_EXECUTE_DIGEPLAN_SCRIPTS");
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}