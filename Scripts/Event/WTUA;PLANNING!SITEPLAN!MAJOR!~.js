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

		var workflowTasks = aa.workflow.getTasks(capId).getOutput();
		var taskAuditArray = ['Airport Review','Assessor Review','Building Inspection Review','Budget and Management Review','Community Enhancement Review','County Library Review','Chesterfield Historical Society Review','Health Department Review','CDOT Review','Economic Development Review','Environmental Engineering Review','Fire and Life Safety Review','GIS-EDM Utilities Review','GIS-IST Review','Parks and Recreation Review','Planning Review','Police Review','Real Property Review','Schools Research and Planning Review','County Attorney Review','Utilities Review','VDOT Review','Water Quality Review'];
		for (var ind in taskAuditArray) {
			var wfaTask = taskAuditArray[ind];
			for (var i in workflowTasks) {
				var wfbTask = workflowTasks[i];
				if (wfbTask.getActiveFlag() == 'Y') {
					if (wfaTask == wfbTask.getTaskDescription()) {
						if (AInfo['Special Consideration'] == 'Expedited') {
						editTaskDueDate(wfbTask.getTaskDescription(),dateAdd(null,10,true));
						} else if (AInfo['Special Consideration'] == 'Fast Track') {
						editTaskDueDate(wfbTask.getTaskDescription(),dateAdd(null,5,true));
						} else if (AInfo['Special Consideration'] == 'Regular') {
						editTaskDueDate(wfbTask.getTaskDescription(),dateAdd(null,15,true));
						}
					else { editTaskDueDate(wfbTask.getTaskDescription(),dateAdd(null,15,true)); }
					}
				}
			}
		}
	}
	
	//Site Plan - Initial Submittal Fee 8.1P
	if (wfTask == 'First Glance Consolidation' && wfStatus == 'Calculate Fees') {
		updateFee("SITEPLAN","CC-PLANNING","FINAL",1,"N");
	//56.1p 11-2020 Code Schema update for inheritence - copying Community Code and Development Code, if they exist on related records, whatever is related, then filter on the ASI
		if (parentCapId != null) {
			copyASIfromParent_TPS(capId,parentCapId,'Community Code','Community Code');
			copyASIfromParent_TPS(capId,parentCapId,'Development Code','Development Code');
		}
		else if (AInfo['Case Number'] != null) {
			if (AInfo['Case Number'].toUpperCase().indexOf("PR") >= 0) {
				var recType = "Planning/SitePlan/Major/NA"; }
			else if (AInfo['Case Number'].toUpperCase().indexOf("PS") >= 0) {
				var recType = "Planning/SitePlan/Schematics/NA"; }
			else if (AInfo['Case Number'].toUpperCase().indexOf("OP") >= 0) {
				var recType = "Planning/Subdivision/OverallConceptualPlan/NA"; }

			copyASIfromParent(capId,recType,'Community Code','Community Code');
			copyASIfromParent(capId,recType,'Development Code','Development Code');
		}
	}
	if (wfTask == 'First Glance Consolidation' && wfStatus == 'First Glance Review Complete') {
		invoiceAllFees(capId);
	}
	//Erosion and Sediment Control Review and Enforcement Fees 8.2P
	var TotalLDAcreage = parseFloat(AInfo['Total Disturbed Acreage']); 
	if ((wfTask == 'First Glance Consolidation' && wfStatus == 'Calculate Fees') && (TotalLDAcreage <=.229)) {
		updateFee("ERSCRENFMIN","CC-PLANNING","FINAL",1,"N");
	}
	if ((wfTask == 'First Glance Consolidation' && wfStatus == 'Calculate Fees') && (TotalLDAcreage >.229)) {
		updateFee("ERSCRENFORCE","CC-PLANNING","FINAL",1,"N");
	}
	//01-2021 db removed lot fee calculation per site Plan lots - only in Construction Plan 
	//Site Plan - Submittals Subsequent to First 3 Submittals Fees based on ASI Field 'Submittal Count'
	//if ((wfTask == 'Review Distribution' && wfStatus == 'Revisions Received') && (AInfo["Submittal Count"] > 3)){
	//    addFee("SITEPLAN2","CC-PLANNING","FINAL",1,"N")}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}