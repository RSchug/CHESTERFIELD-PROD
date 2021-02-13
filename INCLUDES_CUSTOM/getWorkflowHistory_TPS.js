function getWorkflowHistory_TPS() { // Get Workflow History.
    var wfstr = arguments.length > 0 && arguments[0] ? arguments[0] : null;
    var wfstat = arguments.length > 1 && arguments[1] ? arguments[1] : null;
    var processName = arguments.length > 2 && arguments[2] ? arguments[2] : null;
    var itemCap = arguments.length > 3 && arguments[3] ? arguments[3] : capId;

    var useProcess = processName && processName != "" ? true : false;
    if (wfstat + "" == "") wfstat = null;
    var wfStatArray = wfstat && wfstat.split ? wfstat.split(",") : wfstat; // Convert to array
    if (typeof (itemCap) == "string") {
        var result = aa.cap.getCapID(itemCap);
        if (result.getSuccess()) {
            itemCap = result.getOutput();
        } else {
            logMessage("**ERROR: Failed to get cap ID: " + result + " error: " + result.getErrorMessage()); return false;
        }
    }

    var taskArr = new Array();

    var workflowResult = aa.workflow.getHistory(itemCap);
    if (!workflowResult.getSuccess()) {
        logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
        return false;
    }

    var tasks = [];
    var wfObj = workflowResult.getOutput();
    for (var x = 0; x < wfObj.length; x++) {
        var fTask = wfObj[x];
        if (processName && !fTask.getProcessCode().equals(processName)) continue;
        if (wfstr && !fTask.getTaskDescription().equals(wfstr)) continue;
        if (wfStatArray && !exists(fTask.getDisposition(), wfStatArray)) continue;
        
        tasks.push(fTask);
        logDebug("History[" + x + "]: # " + fTask.getProcessHistorySeq()
            + ", Task: " + fTask.getProcessCode() + "." + fTask.getTaskDescription()
            + ", Status: " + fTask.getDisposition() + " " + fTask.getStatusDate()
            //  + br + describe_TPS(fTask)
        );
    }
    return tasks;
}
