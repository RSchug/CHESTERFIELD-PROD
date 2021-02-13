try {
    // Set the Reviewers Tasks per the wfStatus choosen per REVIEW DEPTS FOR ELM Spreadsheet scritp# 60p
	if (wfTask == 'Review Distribution' && wfStatus == 'Routed for Review') {
		activateTask("Building Inspection Review");
		activateTask("CDOT Review");
		activateTask("Environmental Engineering Review");
		activateTask("Fire and Life Safety Review");
		activateTask("Planning Review");
		activateTask("Police Review");
		activateTask("Utilities Review");
		activateTask("VDOT Review");
		activateTask("Real Property Review");
		activateTask("GIS-IST Review");
		activateTask("Water Quality Review");
		deactivateTask("Default");
	//Set due dates to 5 days out per ELM Due Date Doc
	}	
	if (wfTask == 'Review Distribution' && matches(wfStatus,'Routed for Review','Manual Routing')) {
		var workflowTasks = aa.workflow.getTasks(capId).getOutput();
		for (var i in workflowTasks) {
			var wfbTask = workflowTasks[i];
			if (wfbTask.getActiveFlag() == 'Y') {
				if (wfaTask == wfbTask.getTaskDescription()) {
					editTaskDueDate(wfbTask.getTaskDescription(),dateAdd(null,5,true));
				}
			}
		}
	}
	
//33P set the Expiration Date to 1825 days 
	var expDateField = "Expiration Date";
	var expDate = jsDateToASIDate(new Date(dateAdd(null, 1825)));
	if (wfTask == 'Review Consolidation' && wfStatus == 'Approved'){
		editAppSpecific(expDateField, expDate);
	}
//80p - David B. updated to cycle through
	if (wfTask == 'Staff and Developer Meeting' && wfStatus == 'Complete'){
		var workflowTasks = aa.workflow.getTasks(capId).getOutput();
		var taskAuditArray = ['Airport Review','Assessor Review','Building Inspection Review','Budget and Management Review','Community Enhancement Review','County Library Review','Chesterfield Historical Society Review','Health Department Review','CDOT Review','Economic Development Review','Environmental Engineering Review','Fire and Life Safety Review','GIS-EDM Utilities Review','GIS-IST Review','Parks and Recreation Review','Planning Review','Police Review','Real Property Review','Schools Research and Planning Review','County Attorney Review','Utilities Review','VDOT Review','Water Quality Review'];
		for (var ind in taskAuditArray) {
			var wfaTask = taskAuditArray[ind];
			for (var i in workflowTasks) {
				var wfbTask = workflowTasks[i];
				if (wfbTask.getActiveFlag() == 'Y') {
					if (wfaTask == wfbTask.getTaskDescription()) {
						closeTask(wfbTask.getTaskDescription(), wfbTask.getDisposition(), "Staff and Developer Meeting Complete", "Closed by Meeting Complete");
					}
				}
			}
		}
	}
//56.1p 11-2020 Code Schema update for inheritence - copying Community Code and Development Code, if they exist on related records
	if (wfTask == 'Application Submittal' && wfStatus == 'Accepted') {
		if (parentCapId != null) {
			copyASIfromParent_TPS(capId,parentCapId,'Community Code','Community Code');
			copyASIfromParent_TPS(capId,parentCapId,'Development Code','Development Code');
		}
	}
//Autoemail items
	if (matches(wfStatus, "Follow-Up Needed")) {
		emailPendingApplicantNotification(wfTask, wfStatus)
	}
	
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}