// ASIUA:EnvEngineering/Sureties/*/*
/* 153EE WHEN: The Custom Field Lists Colum = Surety Status is updated with a Status = “Released” or “Replaced"
|        THEN: Check and see if ALL SURETIES custom lists rows column = Surety Status has a status of "Released" or "Replaced"; if they do
|        THEN: Update the Sureties Workflow Task with a Status of Pending Release; deactivate the Sureties Workflow Task; activate the Final Processing Workflow Task; update the Final Processing Workflow Task with a Workflow Task Status = "Pending Release Review"
*/
if (isTaskActive("Sureties")) {
	var tableName = "SURETIES";
	logDebug("Loading " + tableName);
	var	wfUpdate = true;
	var tableArray = loadASITable(tableName,capId);
	if (!tableArray) tableArray = [];
	for (xx in tableArray) {
		var tableRow = tableArray[xx];
        logDebug(tableName + "[" + xx + "]: Surety Status: " + tableRow["Surety Status"] + ", Number: " + tableRow["Surety Number"] + ", Type: " + tableRow["Surety Type"] + ", Purpose: " + tableRow["Surety Purpose"]);
        if (tableRow["Surety Status"] && exists(tableRow["Surety Status"],["Released", "Replaced"])) continue;
        wfUpdate = false;
    }
    if (wfUpdate && tableArray.length > 0) {
        var wfTask = "Sureties", wfStatus = "Pending Release";
        resultWorkflowTask(wfTask, "Pending Release", "Updated via script", "");
        deactivateTask(wfTask)
        var wfTask = "Final Processing", wfStatus = "Pending Release Review";
        resultWorkflowTask(wfTask, wfStatus, "Updated via script", "");
        activateTask(wfTask)
    }
}
