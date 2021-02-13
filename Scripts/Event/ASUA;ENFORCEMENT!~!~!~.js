try {
    if (matches(appStatus, "Cancelled", "Withdrawn")) {
		taskCloseAllActive('Closed','Per Record Status Update');
		//var workflowTasks = aa.workflow.getTasks(capId).getOutput();
		//for (var i in workflowTasks) {
		//		var wfbTask = workflowTasks[i];
		//		if (wfbTask.getActiveFlag() == 'Y') {
		//			closeTask('*','Per Record Status Update');  closeTask(wfbTask.getDescription(), "Completed", "Updated based on Completed Inspection Result", "");
    }
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}

function taskCloseAllActive(pStatus,pComment)
 {
 // Closes all active tasks in CAP with specified status and comment
 // Function is a copy of the taskCloseAllExcept function.

 var workflowResult = aa.workflow.getTasks(capId);
 if (workflowResult.getSuccess())
    var wfObj = workflowResult.getOutput();
 else
     {
     logMessage("**ERROR","CAP # "+capId.getCustomID()+" Failed to get workflow object: " + workflowResult.getErrorMessage());
     return false;
     }

 var fTask;
 var stepnumber;
 var processID;
 var dispositionDate = aa.date.getCurrentDate();
 var wfnote = " ";
 var wftask;

 for (i in wfObj)
     {
     fTask = wfObj[i];
     wftask = fTask.getTaskDescription();
     stepnumber = fTask.getStepNumber();
     processID = fTask.getProcessID();
     if (fTask.getActiveFlag().equals("Y"))
        {
        //aa.workflow.handleDisposition(capId,stepnumber,processID,pStatus,dispositionDate,wfnote,pComment,systemUserObj,"Y");
        aa.workflow.handleDisposition(capId,stepnumber,pStatus,dispositionDate,wfnote,pComment,systemUserObj,"U");
        logMessage("INFO","Completed Workflow Task: " + wftask + " with a status of: " + pStatus + " for CAP # " + capId.getCustomID());

        wfObj[i].setCompleteFlag("Y");
	var fTaskModel = wfObj[i].getTaskItem();
	var tResult = aa.workflow.adjustTaskWithNoAudit(fTaskModel);
	    if (tResult.getSuccess())
	       logMessage("INFO","Completed Workflow Task: " + wftask + ", for CAP # " + capId.getCustomID());
            else
	        logMessage("**ERROR","CAP # "+capId.getCustomID()+" Failed to complete workflow task: " + tResult.getErrorMessage());
        }
     }
 }