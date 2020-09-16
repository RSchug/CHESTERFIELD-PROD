try {
    if (matches(wfTask, 'Review Distribution') & matches(wfStatus, 'Additional Information Requested')) {
        emailPendingApplicantNotification();
    }
    if (appMatch('*/Planning/*/*') && matches(wfTask,'Review Distribution') & matches(wfStatus,'Routed for Review') && AInfo['Review Time Options'] == 'First Glance') {
		editTaskDueDate('*',dateAdd(null,7));
	}
    if (wfProcess == "EREVIEW1") {
        loadCustomScript("WTUA_EXECUTE_DIGEPLAN_SCRIPTS_EREVIEW1");
    }
	if (wfProcess == "EREVIEW2") {
    loadCustomScript("WTUA_EXECUTE_DIGEPLAN_SCRIPTS_EREVIEW2");
	}
	if (!publicUser && matches(capStatus, "Pending Applicant") && isTaskActive('Review Distribution')) {
        updateTask("Review Distribution", "Revisions Requested","Corrections or Revisions Requested");
    }
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}