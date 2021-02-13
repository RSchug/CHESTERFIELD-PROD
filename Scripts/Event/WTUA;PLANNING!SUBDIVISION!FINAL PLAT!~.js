try {
    // Set the Reviewers Tasks per the wfStatus choosen per REVIEW DEPTS FOR ELM Spreadsheet scritp# 60p
	if (wfTask == 'Review Distribution' && wfStatus == 'Routed for Review') {
		activateTask("Budget and Management Review");
		activateTask("CDOT Review");
		activateTask("Environmental Engineering Review");
		activateTask("Fire and Life Safety Review");
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
	//per the ELM Planning Due Dates Doc - removed true from dateAdd function 02-2021
		var workflowTasks = aa.workflow.getTasks(capId).getOutput();
		for (var i in workflowTasks) {
			var wfbTask = workflowTasks[i];
			if (wfbTask.getActiveFlag() == 'Y') {
				if (capStatus == 'Submit Signed Plat') {
					editTaskDueDate(wfbTask.getTaskDescription(),dateAdd(null,7));
				}
				else { editTaskDueDate(wfbTask.getTaskDescription(),dateAdd(null,14)); }
			}
		}
	}
	if (wfTask == 'Application Submittal' && wfStatus == 'Calculate Fees') {
	//49P Final Plat Fee
		if (AInfo['Case Type'] == 'Amended Plat' || AInfo['Case Type'] == 'Line Modification'){
			updateFee("FINALPLAT2","CC-PLANNING","FINAL",1,"N");
		}
		else if (AInfo['Case Type'] == 'New') {
			updateFee("FINALPLAT1","CC-PLANNING","FINAL",1,"N");
		}

	//56.1p 11-2020 Code Schema update for inheritence - copying Community Code, Subdivision Code, and Section Code if they exist on related records, whatever is related, then filter on the ASI
		if (parentCapId != null) {
			copyASIfromParent_TPS(capId,parentCapId,'Community Code','Community Code');
			copyASIfromParent_TPS(capId,parentCapId,'Subdivision Code','Subdivision Code');
			copyASIfromParent_TPS(capId,parentCapId,'Section Code','Section Code');
		}
		else if (AInfo['Related Case Number'] != null) {
			if (AInfo['Related Case Number'].toUpperCase().indexOf("CP") >= 0) {
				var recType = "Planning/Subdivision/ConstructionPlan/NA"; }
			else if (AInfo['Related Case Number'].toUpperCase().indexOf("PP") >= 0) {
				var recType = "Planning/Subdivision/Preliminary/NA"; }	
		}
		copyASIfromParent(capId,recType,'Community Code','Community Code');
		copyASIfromParent(capId,recType,'Subdivision Code','Subdivision Code');
		copyASIfromParent(capId,recType,'Section Code','Section Code');
	}
	
	if (wfTask == 'Application Submittal' && wfStatus == 'Ready for Payment') {
		invoiceAllFees(capId);
	}
	
	if (matches(wfTask, 'Review Consolidation') && matches(wfStatus, 'Revisions Requested','Submit Signed Plat')) {
		var BlankExpireDate = AInfo['Expiration Date'];
		var months = 12 ;
			if(BlankExpireDate == null || BlankExpireDate == "") {
				var NewExpireDate = dateAddMonths(dateAdd(null,0),months);
			}
			if(BlankExpireDate != null && BlankExpireDate != "") {
				var NewExpireDate = dateAddMonths(BlankExpireDate,months);
			}
			editAppSpecific("Expiration Date",NewExpireDate);
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}