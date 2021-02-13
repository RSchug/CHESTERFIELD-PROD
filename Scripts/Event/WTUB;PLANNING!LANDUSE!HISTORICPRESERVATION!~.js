//41P and 42.5P results
try {
    if (matches(wfTask, 'CPC Hearing') && matches(wfStatus, 'Recommend Approval','Recommend Denial')) {
		if (AInfo['CPC Conditions'] == null ) {
			showMessage = true;
			comment('You cannot advance this workflow until ALL fields in the <b>Results</b> area of the Data Fields are completely filled in.  Put in zeroes (0) for those fields that do not apply.');
			cancel = true;
		}
	//added 01-2021 per business testing
		else if (AInfo['CPC Conditions'] != null ) {
			if (!isTaskActive("Public Notices") && !isTaskComplete_TPS("Public Notices")) {
				addAdHocTask("ADHOC_WF","Public Notices","");
			}
			if (isTaskComplete_TPS("Public Notices")) {
				activateTask("Public Notices");
			}				
			if (!isTaskActive("Adjacents") && !isTaskComplete_TPS("Adjacents")){
				addAdHocTask("ADHOC_WF","Adjacents","");
			}
			if (isTaskComplete_TPS("Adjacents")) {
				activateTask("Adjacents");
			}
			if (!isTaskActive("Maps") && !isTaskComplete_TPS("Maps")){
				addAdHocTask("ADHOC_WF","Maps","");
			}
			if (isTaskComplete_TPS("Maps")) {
				activateTask("Maps");
			}
		}
	}
	if (matches(wfTask, 'BOS Hearing') && matches(wfStatus, 'Approved')) { //Denied removed on 9/23/2020 per request
		if (AInfo['BOS Conditions'] == null ) {
			showMessage = true;
			comment('You cannot advance this workflow until ALL fields in the <b>Results</b> area of the Data Fields are completely filled in.  Put in zeroes (0) for those fields that do not apply.');
			cancel = true;
		}
	}	
} catch (err) {
	logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}