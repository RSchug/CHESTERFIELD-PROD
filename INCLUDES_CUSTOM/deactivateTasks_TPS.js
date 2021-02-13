function deactivateTasks_TPS() { // optional process name
	// modified from INCLUDES_ACCELA_FUNCTIONS deactivateTask.
	var wfstr = (arguments.length > 0 && arguments[0]? arguments[0]:null);
    var processName = (arguments.length > 1 && arguments[1] && arguments[1] != ""? arguments[1]:null);
	var itemCap = (arguments.length > 2 && arguments[2]? arguments[2]:"");
	var taskArrayExcept = (arguments.length > 3 && arguments[3]? arguments[3]:"");	// tasks to exclude. Do not use if wfstr is not null.
	
    var workflowResult = aa.workflow.getTasks(itemCap);
	if (!workflowResult.getSuccess())
	{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

	var wfObj = workflowResult.getOutput();
	for (i in wfObj) {
		var fTask = wfObj[i];
		if (wfstr && !fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())) continue;
		if (processName && !fTask.getProcessCode().equals(processName)) continue;
        if (wfstr && taskArrayExcept && exists(fTask.getTaskDescription(), taskArrayExcept)) continue;
		if (!fTask.getActiveFlag().equals("Y")) continue;

		var stepnumber = fTask.getStepNumber();
		var processID = fTask.getProcessID();
		var completeFlag = fTask.getCompleteFlag();
		if (processName)
			aa.workflow.adjustTask(vCapId, stepnumber, processID, "N", completeFlag, null, null)
		else
			aa.workflow.adjustTask(vCapId, stepnumber, "N", completeFlag, null, null)

		logDebug("deactivating Workflow Task: " + (processName? processName+".":"") +fTask.getTaskDescription());
	}
}
['Issuance','Closure']