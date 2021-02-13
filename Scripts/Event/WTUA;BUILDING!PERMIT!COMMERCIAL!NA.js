try {
	if (wfTask == "Review Consolidation" && wfStatus == "Internal Revisions Needed"){
		deactivateTask("Review Consolidation");
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}