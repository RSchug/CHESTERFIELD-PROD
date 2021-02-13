try {
 // Set the Reviewers Tasks per the wfStatus choosen per REVIEW DEPTS FOR ELM Spreadsheet scritp# 60p
	if (wfTask == 'Review Distribution' && wfStatus == 'Routed for Commercial Review') {
		activateTask("CDOT Review");
		activateTask("Community Enhancement Review");
		activateTask("Environmental Engineering Review");
		activateTask("Fire and Life Safety Review");
		activateTask("Planning Review");
		activateTask("Utilities Review");
		activateTask("VDOT Review");
		activateTask("Schools Research and Planning Review");
		activateTask("Police Review");
		activateTask("Technical Review Committee");
		deactivateTask("Default");
	}
	if (wfTask == 'Review Distribution' && (wfStatus == 'Routed for Residential and Commercial' || wfStatus == 'Routed for Residential Review')) {
		activateTask("Budget and Management Review");
		activateTask("CDOT Review");
		activateTask("Community Enhancement Review");
		activateTask("Health Department Review");
		activateTask("Environmental Engineering Review");
		activateTask("Fire and Life Safety Review");
		activateTask("County Library Review");
		activateTask("Parks and Recreation Review");
		activateTask("Planning Review");
		activateTask("Utilities Review");
		activateTask("VDOT Review");
		activateTask("Schools Research and Planning Review");
		activateTask("Police Review");
		activateTask("Technical Review Committee");
		if (wfStatus == 'Routed for Residential and Commercial') {
			activateTask("General Services Review");
		}
		deactivateTask("Default");
	}
	if (wfTask == 'Review Distribution' && wfStatus == 'Routed for Towers Review') {
		activateTask("Airport Review");
		activateTask("CDOT Review");
		activateTask("Community Enhancement Review");
		activateTask("Environmental Engineering Review");
		activateTask("Fire and Life Safety Review");
		activateTask("Planning Review");
		activateTask("Utilities Review");
		activateTask("VDOT Review");
		activateTask("Schools Research and Planning Review");
		activateTask("Police Review");
		activateTask("General Services Review");
		activateTask("Radio Shop Review");
		activateTask("Technical Review Committee");
		deactivateTask("Default");
	}
	if (wfTask == 'Review Consolidation' && wfStatus == 'Move to BOS') {
		activateTask("BOS Hearing");
		deactivateTask("Review Consolidation");
	}
	if (matches(wfTask,'CPC Hearing') && matches(wfStatus,'Recommend Approval','Recommend Denial')) {
						  
		if (!isTaskActive("Public Notices") && !isTaskComplete_TPS("Public Notices")) {
			addAdHocTask("ADHOC_WF","Public Notices","");
		}
		if (isTaskComplete_TPS("Public Notices")) {
			activateTask("Public Notices");
		}				
		if (!isTaskActive("Adjacents") && !isTaskComplete_TPS("Adjacents")){
			addAdHocTask("ADHOC_WF","Adjacents","");
		}
		if (isTaskComplete_TPS("Adjacents")) {
			activateTask("Adjacents");
		}
		if (!isTaskActive("Maps") && !isTaskComplete_TPS("Maps")){
			addAdHocTask("ADHOC_WF","Maps","");
		}
		if (isTaskComplete_TPS("Maps")) {
			activateTask("Maps");
		}
	}
// Add Fees
	if (wfTask == 'Application Submittal' && wfStatus == 'Calculate Fees') {
		addFees_ZoneCase();
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}