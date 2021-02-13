function isTaskComplete_TPS(wfstr) // optional process name
{	// 09/28/2018 RS: Modified from INCLUDES_ACCELA_FUNCTIONS v9.3.6 to include optional capID & how processName is handled.
	var useProcess = false;
	var processName = "";
	if (arguments.length > 1 && arguments[1] && arguments[1] != "") { // 10/17/2018 RS: Modified to ignore if null or blank.
		processName = arguments[1]; // subprocess
		useProcess = true;
	}
    var itemCap = (arguments.length > 2 && arguments[2]? arguments[2]:capId); // use cap ID specified in args

	var workflowResult = aa.workflow.getTaskItems(itemCap, wfstr, processName, "Y", null, null);
	if (!workflowResult.getSuccess()) {
		logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		return null;
		// Task not found.
	}

	wfObj = workflowResult.getOutput();
	for (i in wfObj) {
		fTask = wfObj[i];
		if (useProcess && !fTask.getProcessCode().equals(processName)) continue;
		if (!fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())) continue;
		if (fTask.getCompleteFlag().equals("Y"))
			return true;
		else
			return false;
	}
	return false;
}
