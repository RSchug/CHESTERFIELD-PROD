//This function activates or deactivates the given wfTask.
//Parameters capID,workflow task name, activateTask "Y" for activate, "N" for deactivate
function activateWFTName(capID,wfTaskName,activateTask){
	
	try{
		var workflowResult = aa.workflow.getTasks(capID);
		if (workflowResult.getSuccess())
			var wfObj = workflowResult.getOutput();
		else
			{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }
		
		for (i in wfObj)
		{
			var fTask = wfObj[i];
			if (fTask.getTaskDescription().toUpperCase().equals(wfTaskName.toUpperCase()))
			{
				var stepnumber = fTask.getStepNumber();
				if (!matches(fTask.getDisposition(),null,"",undefined)) {
					var completeFlag = "Y";
				} else {
					var completeFlag = fTask.getCompleteFlag();
				}
				//adjust task
				aa.workflow.adjustTask(capID, stepnumber, activateTask, completeFlag, null, null)

				// log wf task action into log file
				if(activateTask.toUpperCase()=="Y"){
					logDebug("Method name: activateWFTName. Message: Activating Workflow Task: " + wfTaskName + ". CapID:" + capID);
					return true;
				}else{
					logDebug("Method name: activateWFTName. Message: Deactivating Workflow Task: " + wfTaskName + ". CapID:" + capID);
					return true;
				}
			}			
		}
	}catch(err){
		logDebug("Method name: activateWFTName. Message: Error-" + err.message + ". CapID:" + capID);
		return false;
	}
}
