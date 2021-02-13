try {
//From eReview - but was wrapped in a different function.  There is no wfTask in DUA or DUB... Also, we update AppStatus in DUA_EXECUTE_DIGEPLAN_SCRIPTS, and this script should fire after.
	if (publicUser && !matches(capStatus,'Revisions Received','Submitted',null)) { 
		updateAppStatus("Revisions Received", "Update by Document Upload from Citizen");
		var subNum = parseInt(AInfo['Submittal Count']) + 1;
		editAppSpecific('Submittal Count',subNum);
    }
	if (!publicUser && matches(capStatus,'Pending Applicant','Submitted',null)) { 
		updateAppStatus("Revisions Received", "Update by Document Upload from Back Office");
    }
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}