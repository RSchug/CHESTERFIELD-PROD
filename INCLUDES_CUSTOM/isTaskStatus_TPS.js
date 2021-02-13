function isTaskStatus_TPS(wfstr, wfstat) {// optional process name
// 05/20/2020 RS: Modified from INCLUDES_ACCELA_FUNCTIONS to optional capId and array of valid task statuses.
	var useProcess = false;
	var processName = "";
	if (arguments.length > 2) {
		processName = arguments[2]; // subprocess
		useProcess = true;
	}
	var itemCap = arguments.length > 3 && arguments[3]? arguments[3]:capId;
	var wfStatArray = (wfstat && typeof(wfstat) == "string"? [wfstat]:wfstat); // Convert to array

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, wfstat, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		fTask = wfObj[i];
		if (useProcess && !fTask.getProcessCode().equals(processName)) continue;
		if (wfstr && !fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())) continue;
		if (fTask.getDisposition() == null) continue;
		if (wfStatArray && !exist(fTask.getDisposition(),wfStatArray)) continue;
		return true;
	}
	return false;
}
