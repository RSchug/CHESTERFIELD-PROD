try {
// Added per new update 03-2021
	if ((wfTask == 'Inative Application' || wfTask == 'Inactive Permit') && matches(wfStatus, "Withdrawn")) {
		taskCloseAllActive('Closed','Per Record Status Update');
	}
// If setting the License status manually from the workflow
	if (wfTask == 'Annual Status' && wfStatus == 'About to Expire') {
		lic = new licenseObject(capIDString);
		lic.setStatus('About to Expire');
	}
//Created Licensed professional after Application Submittal
if ((wfTask == "Application Submittal" && (wfStatus == "Accepted - Plan Review Required" || wfStatus == "Accepted - Plan Review Not Required" || wfStatus == "Accepted")) && checkCapForLicensedProfessionalType("Contractor")){
	createRefLicProfFromLicProfTRU();
}
//Adhoc task updated to Revision then activate 'Review Distribution' and status of 'Corrections Received'
	if (wfTask =='Document Submitted Online' && wfStatus == 'Revision'){
		if (isTaskActive('Review Distribution')){
			updateTask("Review Distribution", "Corrections Received", "Updated based on Document Submitted Online 'Revision' Status", "");
			updateAppStatus("In Review","Updated based on Document Submitted Online 'Revision' Status.");
		}
	}
//For DigEplan
	if (matches(wfTask,'Review Distribution','Review Consolidation')) {
		loadCustomScript("WTUA_EXECUTE_DIGEPLAN_SCRIPTS_BUILD");
	}
//For PROFFER
	if (wfTask == 'Review Distribution' && wfStatus == 'Routed for Review') {
		if(appMatch("Building/Permit/Commercial/NA") && AInfo["Nature of Work"] == "New Construction" && (parcelHasCondition_TPS("Budget","Applied") || parcelHasCondition_TPS("Budget","Applied(Applied)"))) {
			addAdHocTask("ADHOC_WF","Budget and Management Review","");
		}
		if((appMatch("Building/Permit/Residential/NA") || appMatch("Building/Permit/Residential/Multi-Family")) && AInfo["Nature of Work"] == "New Construction of Single Family Dwelling" && (parcelHasCondition_TPS("Budget","Applied") || parcelHasCondition_TPS("Budget","Applied(Applied)"))) {
			addAdHocTask("ADHOC_WF","Budget and Management Review","");
		}
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