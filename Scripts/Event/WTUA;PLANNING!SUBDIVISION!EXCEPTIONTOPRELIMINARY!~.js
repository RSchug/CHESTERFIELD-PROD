try {
    // Set the Reviewers Tasks per the wfStatus choosen per REVIEW DEPTS FOR ELM Spreadsheet scritp# 60p
	if (wfTask == 'Review Distribution' && wfStatus == 'Routed for Review') {
		activateTask("CDOT Review");
		activateTask("Environmental Engineering Review");
		activateTask("Fire and Life Safety Review");
		activateTask("Planning Review");
		activateTask("Utilities Review");
		activateTask("VDOT Review");
		activateTask("Water Quality Review");
		deactivateTask("Default");
	//02-2021 removed business day feature in dateAdd function call, it don't work	
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
					}
					else { editTaskDueDate(wfbTask.getTaskDescription(),dateAdd(null,21)); }
				}
			}
		}
	}
//Fees
	if (wfTask == 'Application Submittal' && wfStatus == 'Calculate Fees') {
		updateFee("SUBEXCEPTION","CC-PLANNING","FINAL",1,"N");
	}
	//56.1p 11-2020 Code Schema update for inheritence - copying Community Code, Subdivision Code, and Section Code if they exist on related records, whatever is related, then filter on the ASI
	if (wfTask == 'Application Submittal' && wfStatus == 'Accepted') {
		// auto-invoice fee
		invoiceAllFees(capId);
		
		if (parentCapId != null) {
			copyASIfromParent_TPS(capId,parentCapId,'Community Code','Community Code');
			copyASIfromParent_TPS(capId,parentCapId,'Subdivision Code','Subdivision Code');
			copyASIfromParent_TPS(capId,parentCapId,'Section Code','Section Code');
		}
		else if (AInfo['Related Case Number'] != null) {
			if (AInfo['Related Case Number'].toUpperCase().indexOf("CP") >= 0) {
				var recType = "Planning/Subdivision/ConstructionPlan/NA"; }
			else if (AInfo['Related Case Number'].toUpperCase().indexOf("PP") >= 0 || AInfo['Related Case Number'].toUpperCase().indexOf("TS") >= 0) {
				var recType = "Planning/Subdivision/Preliminary/NA"; }	
		}
		copyASIfromParent(capId,recType,'Community Code','Community Code');
		copyASIfromParent(capId,recType,'Subdivision Code','Subdivision Code');
		copyASIfromParent(capId,recType,'Section Code','Section Code');
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}