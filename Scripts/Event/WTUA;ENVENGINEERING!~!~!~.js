try {
	//Fees
	var TotalLDAcreage = parseFloat(AInfo['Total Land Disturbance Acreage']);
	if (appMatch('EnvEngineering/Plan Review/Linear Project/NA') && (wfTask == 'Application Submittal' && wfStatus == 'Ready for Payment') && (TotalLDAcreage <=.229)) {
		addFee("ERSCRENFMIN","CC-EE","FINAL",1,"Y");
		}
	if (appMatch('EnvEngineering/Plan Review/ESC Plan/NA') && (wfTask == 'Application Submittal' && wfStatus == 'Ready for Payment') && (TotalLDAcreage <=.229)) {
		addFee("ERSCRENFMIN","CC-EE","FINAL",1,"Y");
		}
	if (appMatch('EnvEngineering/Plan Review/Linear Project/NA') && (wfTask == 'Application Submittal' && wfStatus == 'Ready for Payment') && (TotalLDAcreage >.229)) {
		addFee("ERSCRENFORCE","CC-EE","FINAL",1,"Y");
		}
	if (appMatch('EnvEngineering/Plan Review/ESC Plan/NA') && (wfTask == 'Application Submittal' && wfStatus == 'Ready for Payment') && (TotalLDAcreage >.229)) {
		addFee("ERSCRENFORCE","CC-EE","FINAL",1,"Y");
		}
	if (appMatch('EnvEngineering/Plan Review/Timbering/NA') && (wfTask == 'Application Submittal' && wfStatus == 'Ready for Payment')) {
		addFee("ERSCRENFMIN","CC-EE","FINAL",1,"Y");
		}
	/* 164EE For Records: 
	EnvEngineering/ESC Notice to Comply/NA/NA
	EnvEngineering/VSMP Notice to Comply/NA/NA

	WorkflowTaskUpdateAfter
	WHEN: Workflow Task = CPF and Workflow Task Status = Penalty Paid or Adjudication
	THEN: Update the Parent EnvEngineering/Land Disturbance/NA/NA Record Status to Issued 
	*/
	if ((wfTask == 'CPF' && wfStatus == 'Penalty Paid or Adjudication' && parentCapId) && (appMatch('EnvEngineering/Plan Review/ESC Plan/NA') || appMatch('EnvEngineering/VSMP Notice to Comply/NA/NA'))) {
		var parentCapIdLandDisturbance = null;
		var parentCapIds = getParents("EnvEngineering/Land Disturbance/NA/NA");
		if (parentCapIds) {
			for (var pp in parentCapIds) {
				var parentCapIdLandDisturbance = parentCapIds[pp];
				break;
			}
		}
		if (parentCapIdLandDisturbance)
			updateAppStatus("Issued", "Penalty Paid or Adjudication", parentCapId);
	}
	//for all DigEplan processing
		loadCustomScript("WTUA_EXECUTE_DIGEPLAN_SCRIPTS_BUILD");
} catch (err) {
	logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}