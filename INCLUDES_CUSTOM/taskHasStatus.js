// S13 - Given record type workflow task and selected status verify if other statueses in other workflow task in the current record or in another related record are set or not.
function taskHasStatus(capID,wfTask,wfStatus){
	try{
		// get the wF history
		var wfHistoryObj = aa.workflow.getWorkflowHistory(capID, null) ;
		if ( wfHistoryObj.getSuccess()){
			var wfHistory = wfHistoryObj.getOutput() ;
		}
		
		// loop thru workflow and see if given wftask and wfStatus exist
		for ( var i in wfHistory )
		{
			//if match found return true
			if(wfHistory[i].taskDescription.equals(wfTask) &&				
				wfHistory[i].disposition.equals(wfStatus)){
				return true;
			} 
		}
		return false;
	}catch(err){
		logDebug("Method name: taskHasStatus. Message: Error-" + err.message + ". CapID:" + capID);
		return false;
	}
}
