try {
    // Set the Reviewers Tasks per the wfStatus choosen per REVIEW DEPTS FOR ELM Spreadsheet scritp# 60p - 09-2020 
	if (wfTask == 'Review Distribution' && wfStatus == 'Routed for Review') {
		activateTask("CDOT Review");
		editTaskDueDate('CDOT Review', dateAdd(getTaskDueDate('Review Distribution'),13));
		activateTask("County Attorney Review");
		editTaskDueDate('County Attorney Review', dateAdd(getTaskDueDate('Review Distribution'),13));		
		activateTask("Environmental Engineering Review");
		editTaskDueDate('Environmental Engineering Review', dateAdd(getTaskDueDate('Review Distribution'),13));
		activateTask("Fire and Life Safety Review");
		editTaskDueDate('Fire and Life Safety Review', dateAdd(getTaskDueDate('Review Distribution'),13));
		activateTask("Health Department Review");
		editTaskDueDate('Health Department Review', dateAdd(getTaskDueDate('Review Distribution'),13));
		activateTask("Planning Review");
		editTaskDueDate('Planning Review', dateAdd(getTaskDueDate('Review Distribution'),13));
		activateTask("Utilities Review");
		editTaskDueDate('Utilities Review', dateAdd(getTaskDueDate('Review Distribution'),13));
		activateTask("VDOT Review");
		editTaskDueDate('VDOT Review', dateAdd(getTaskDueDate('Review Distribution'),13));
		activateTask("Real Property Review");
		editTaskDueDate('Real Property Review', dateAdd(getTaskDueDate('Review Distribution'),13));
		deactivateTask("Default");
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}