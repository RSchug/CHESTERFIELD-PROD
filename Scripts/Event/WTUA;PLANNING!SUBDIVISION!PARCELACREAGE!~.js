try {
    // Set the Reviewers Tasks per the wfStatus choosen per REVIEW DEPTS FOR ELM Spreadsheet scritp# 60p
	if (wfTask == 'Review Distribution' && wfStatus == 'Routed for Review') {
		activateTask("Budget and Management Review");
		activateTask("CDOT Review");
		activateTask("Environmental Engineering Review");
		activateTask("Fire and Life Safety Review");
		activateTask("Health Department Review");
		activateTask("Planning Review");
		activateTask("Utilities Review");
		activateTask("VDOT Review");
		activateTask("Real Property Review");
		activateTask("GIS-IST Review");
		activateTask("Assessor Review");
		activateTask("Water Quality Review");
		activateTask("GIS-EDM Utilities Review");
		deactivateTask("Default");
	}	
	if (wfTask == 'Review Distribution' && matches(wfStatus,'Routed for Review','Manual Routing')) {
			//per the ELM Planning Due Dates Doc
		var workflowTasks = aa.workflow.getTasks(capId).getOutput();
		//var taskAuditArray = ['Airport Review','Assessor Review','Building Inspection Review','Budget and Management Review','Community Enhancement Review','County Library Review','Chesterfield Historical Society Review','Health Department Review','CDOT Review','Economic Development Review','Environmental Engineering Review','Fire and Life Safety Review','GIS-EDM Utilities Review','GIS-IST Review','Parks and Recreation Review','Planning Review','Police Review','Real Property Review','Schools Research and Planning Review','County Attorney Review','Utilities Review','VDOT Review','Water Quality Review'];
		//for (var ind in taskAuditArray) {
			//var wfaTask = taskAuditArray[ind];
			for (var i in workflowTasks) {
				var wfbTask = workflowTasks[i];
				if (wfbTask.getActiveFlag() == 'Y') {
					if (capStatus == 'Submit Signed Plat') {
						editTaskDueDate(wfbTask.getTaskDescription(),dateAdd(null,7));
					}
					else { editTaskDueDate(wfbTask.getTaskDescription(),dateAdd(null,14)); }
				}
			}
		//}
	}
	if (wfTask == 'Application Submittal' && wfStatus == 'Calculate Fees') {
	//Fee
		if (AInfo['Plat Type'] == 'Family Subdivision' || AInfo['Plat Type'] == 'Parcel Subdivision'){
			updateFee("PARCELACRE","CC-PLANNING","FINAL",1,"N");
		}
		if (AInfo['Plat Type'] == 'Line Modification' || AInfo['Plat Type'] == 'Amendment Plat'){
			updateFee("FINALPLAT2","CC-PLANNING","FINAL",1,"N");
		}
	}
	if (wfTask == 'Application Submittal' && wfStatus == 'Ready for Payment') {
		invoiceAllFees(capId);
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}