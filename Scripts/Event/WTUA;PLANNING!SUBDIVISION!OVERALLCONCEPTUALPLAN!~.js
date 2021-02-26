try {
    // Set the Reviewers Tasks per the wfStatus choosen per REVIEW DEPTS FOR ELM Spreadsheet scritp# 60p
	if (wfTask == 'Review Distribution' && wfStatus == 'Routed for Review') {
		activateTask("CDOT Review");
		activateTask("Environmental Engineering Review");
		activateTask("Fire and Life Safety Review");
		activateTask("Parks and Recreation Review");
		activateTask("Planning Review");
		activateTask("Police Review");
		activateTask("Utilities Review");
		activateTask("VDOT Review");
		activateTask("GIS-IST Review");
		activateTask("Assessor Review");
		activateTask("Schools Research and Planning Review");
		activateTask("Water Quality Review");
		deactivateTask("Default");
		
		var workflowTasks = aa.workflow.getTasks(capId).getOutput();
		var taskAuditArray = ['Airport Review','Assessor Review','Building Inspection Review','Budget and Management Review','Community Enhancement Review','County Library Review','Chesterfield Historical Society Review','Health Department Review','CDOT Review','Economic Development Review','Environmental Engineering Review','Fire and Life Safety Review','GIS-EDM Utilities Review','GIS-IST Review','Parks and Recreation Review','Planning Review','Police Review','Real Property Review','Schools Research and Planning Review','County Attorney Review','Utilities Review','VDOT Review','Water Quality Review'];
		for (var ind in taskAuditArray) {
			var wfaTask = taskAuditArray[ind];
			for (var i in workflowTasks) {
				var wfbTask = workflowTasks[i];
				if (wfbTask.getActiveFlag() == 'Y') {
					if (wfaTask == wfbTask.getTaskDescription()) {
						if (AInfo['Special Consideration'] == 'Expedited') {
						editTaskDueDate(wfbTask.getTaskDescription(),dateAdd(null,14));
						} else if (AInfo['Special Consideration'] == 'Fast Track') {
						editTaskDueDate(wfbTask.getTaskDescription(),dateAdd(null,7));
						} else if (AInfo['Special Consideration'] == 'Regular') {
						editTaskDueDate(wfbTask.getTaskDescription(),dateAdd(null,21));
						}
					else { editTaskDueDate(wfbTask.getTaskDescription(),dateAdd(null,21)); }
					}
				}
			}
		}
	}
	
	//FEE
	if (wfTask == 'First Glance Consolidation' && wfStatus == 'Calculate Fees') {
		//addFee("OVERALLPLAN","CC-PLANNING","FINAL",1,"N"); - incorrect place/fee
		updateFee("OCPLAN","CC-PLANNING","FINAL",1,"Y");
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}