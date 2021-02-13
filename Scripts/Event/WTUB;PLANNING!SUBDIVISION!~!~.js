try {
	// CPC Hearing Results required for Subdivisions
	if (appMatch('*/*/ConstructionPlan/NA') || appMatch('*/*/OverallConceptualPlan/NA') || appMatch('*/*/ExceptiontoPreliminary/NA')) {
		if (AInfo['No Time Limit'] != 'CHECKED') {
			if (matches(wfTask, 'CPC Hearing') && matches(wfStatus, 'CPC Approved', 'CPC Approved with Admin Review')) { //Denied removed on 9/23/2020 per request
				if (AInfo['Conditions'] == null || AInfo['Approved Time Limit'] == null) {
					showMessage = true;
					comment('You cannot advance this workflow until ALL fields in the <b>Results</b> area of the Data Fields are completely filled in.  Put in zeroes (0) for those fields that do not apply.');
					cancel = true;
				}
			}
		}
	}
	if (appMatch('*/*/Preliminary/NA')) {
		if (matches(wfTask, 'CPC Hearing') && matches(wfStatus, 'CPC Approved', 'CPC Approved with Admin Review')) { //Denied removed on 9/23/2020 per request
			if (AInfo['No Time Limit'] != 'CHECKED') {
				if (AInfo['Conditions'] == null || AInfo['Approved Time Limit'] == null || AInfo['Sidewalks'] == null || AInfo['Sidewalk Width'] == null || AInfo['Pedestrian Trails'] == null || AInfo['Pedestrian Width'] == null || AInfo['Shared Use Path'] == null || AInfo['Shared Use Path Width'] == null || AInfo['Total Pedestrian Paths'] == null) {
					showMessage = true;
					comment('You cannot advance this workflow until ALL fields in the <b>Results</b> area of the Data Fields are completely filled in.  Put in zeroes (0) for those fields that do not apply.');
					cancel = true;
				}
			}
		}
	}
	if (appMatch('*/*/Final Plat/NA')) {
		if (matches(wfTask, 'Review Consolidation') && matches(wfStatus, 'Ready for County Signatures')) {
			if (AInfo['Sidewalks'] == null || AInfo['Sidewalk Width'] == null || AInfo['Pedestrian Trails'] == null || AInfo['Pedestrian Width'] == null || AInfo['Shared Use Path'] == null || AInfo['Shared Use Path Width'] == null || AInfo['Total Pedestrian Paths'] == null) {
				showMessage = true;
				comment('You cannot advance this workflow until the Pedestrian paths Data Fields are completely filled in.  Put in zeroes (0) for those fields that do not apply.');
				cancel = true;
			}
			/* 3CC For record type Planning/Subdivision/Final Plat/NA when the Review Consolidation Workflow Task is set to Ready for County Signatures; stop the action if there is an active EnvEngineering/ESC Notice to Comply/NA/NA or EnvEngineering/VSMP Notice to Comply/NA/NA record. Error will display. */
			// getParents(pAppType);
			// getChildren(pCapType, pParentCapId);
			var foundNoticeToComply = false;
			var rCapIdsInvalid = [];
			var rCapIds = getChildren("EnvEngineering/*/NA/NA", capId);
			if (rCapIds && rCapIds.length > 0) {
				for (var cc in rCapIds) {
					var rCapId = rCapIds[cc];
					var rCap = aa.cap.getCap(rCapId).getOutput();
					var rCapStatus = rCap.getCapStatus();
					if (!appMatch("EnvEngineering/ESC Notice to Comply/NA/NA", rCapId)
						&& !appMatch("EnvEngineering/VSMP Notice to Comply/NA/NA", rCapId)) continue;
					if (!exists(rCapStatus, ["Approved", "Closed"])) {
						rCapIdsInvalid.push(rCapId.getCustomID() + " " + rCapStatus);
						foundNoticeToComply = true;
					}
				}
			}
			if (foundNoticeToComply) {
				showMessage = true;
				comment('You cannot advance this workflow until the Notice to Comply have been resolved.' + rCapIdsInvalid.join(", "));
				cancel = true;
			}
		}
	}
} catch (err) {
	logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}