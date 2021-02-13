try {
    // Set the Reviewers Tasks per the wfStatus choosen per REVIEW DEPTS FOR ELM Spreadsheet scritp# 60p
	if (wfTask == 'Review Distribution' && wfStatus == 'Routed for Review') {
		activateTask("CDOT Review");
		activateTask("Economic Development Review");
		activateTask("Environmental Engineering Review");
		activateTask("Fire and Life Safety Review");
		activateTask("Parks and Recreation Review");
		activateTask("Planning Review");
		activateTask("Police Review");
		activateTask("Utilities Review");
		activateTask("VDOT Review");
		activateTask("Inquiry Meeting");
		deactivateTask("Default");
	}	
	if (wfTask == 'Review Distribution' && matches(wfStatus,'Routed for Review','Manual Routing')) {	
		var workflowTasks = aa.workflow.getTasks(capId).getOutput();
		for (var i in workflowTasks) {
			var wfbTask = workflowTasks[i];
			if (wfbTask.getActiveFlag() == 'Y') {
				if (wfaTask == wfbTask.getTaskDescription()) {
					editTaskDueDate(wfbTask.getTaskDescription(),dateAdd(null,7));
				}
			}
		}
	}
	if (wfTask == 'Inquiry Meeting' && wfStatus == 'Complete') {
		var workflowTasks = aa.workflow.getTasks(capId).getOutput();
		var taskAuditArray = ['Airport Review','Assessor Review','Building Inspection Review','Budget and Management Review','Community Enhancement Review','County Library Review','Chesterfield Historical Society Review','Health Department Review','CDOT Review','Economic Development Review','Environmental Engineering Review','Fire and Life Safety Review','GIS-EDM Utilities Review','GIS-IST Review','Parks and Recreation Review','Planning Review','Police Review','Real Property Review','Schools Research and Planning Review','County Attorney Review','Utilities Review','VDOT Review','Water Quality Review'];
		for (var ind in taskAuditArray) {
			var wfaTask = taskAuditArray[ind];
			logDebug( "tasks array : " + wfaTask);
			for (var i in workflowTasks) {
				var wfbTask = workflowTasks[i];
				if (wfbTask.getActiveFlag() == 'Y') {
					deactivateTask(wfaTask);
					logDebug( "deactivative tasks : " + wfaTask);
				}
			}
		}
		activateTask("Review Consolidation");
	}
		
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}