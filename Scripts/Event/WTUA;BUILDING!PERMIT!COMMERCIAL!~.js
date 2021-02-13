try {
//11-2020 db updated this to work 
	if (!appMatch("*/*/*/Demolition")){
		if (wfTask =='Document Submitted Online' && wfStatus == 'Amendment'){
			if (isTaskActive('Certificate Issuance') || isTaskActive('Inspections')){
				if (appMatch("*/*/*/NA")) {
					var newAppTypeString = "Building/Permit/Commercial/Amendment";
					updateTask("Certificate Issuance", "Amendment Submitted", "Updated based on Document Submitted Online 'Amendment' Status", "");
				}
				else if (!appMatch("*/*/*/NA")) {
					var newAppTypeString = "Building/Permit/Commercial/AmendmentTrade";
					updateTask("Inspections", "Amendment Submitted", "Updated based on Document Submitted Online 'Amendment' Status", "");
				}
				var newCapName = capName;
				var newCapIdString = getNextChildCapId(capId, newAppTypeString, "-");
				var newCapRelation = "Child";
				var srcCapId = capId;
				var newCapId = createCap_TPS(newAppTypeString, newCapName, newCapIdString, newCapRelation, srcCapId);
				if (newCapId) {
					showMessage = true;
					comment("<b>Created " + (newCapRelation ? newCapRelation + " " : "")
						+ "Amendment: <b>" + newCapId.getCustomID() + "</b> " + newAppTypeString);
					if (wfComment && wfComment != "") {
						cWorkDesc = workDescGet(capId);
						nWorkDesc = cWorkDesc + ", " + wfComment;
						updateWorkDesc(nWorkDesc, newCapId);
					}
					// set the Permit Expiration Date to 180 days from Application Date.
					var expDateField = "Permit Expiration Date";
					var expDate = jsDateToASIDate(new Date(dateAdd(null, 180)));
					editAppSpecific(expDateField, expDate, newCapId);
				}
			}
		}
		if (wfTask =='Inspections' && wfStatus == 'Amendment Submitted') {
			var newAppTypeString = appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + "Amendment";
			if (appMatch("*/*/*/NA")) {
				var newAppTypeString = "Building/Permit/Commercial/Amendment";
				updateTask("Inspections", "Amendment Submitted", "Updated by Workflow Selection", "");
			}
			else if (!appMatch("*/*/*/NA")) {
				var newAppTypeString = "Building/Permit/Commercial/AmendmentTrade";
				updateTask("Inspections", "Amendment Submitted", "Updated by Workflow Selection", "");
			}
			var newCapName = capName;
			var newCapIdString = getNextChildCapId(capId, newAppTypeString, "-");
			var newCapRelation = "Child";
			var srcCapId = capId;
			var newCapId = createCap_TPS(newAppTypeString, newCapName, newCapIdString, newCapRelation, srcCapId);
			if (newCapId) {
				showMessage = true;
				comment("<b>Created " + (newCapRelation ? newCapRelation + " " : "")
					+ "Amendment: <b>" + newCapId.getCustomID() + "</b> " + newAppTypeString);
				if (wfComment && wfComment != "") {
					cWorkDesc = workDescGet(capId);
					nWorkDesc = cWorkDesc + ", " + wfComment;
					updateWorkDesc(nWorkDesc, newCapId);
				}
				// set the Permit Expiration Date to 180 days from Application Date.
				var expDateField = "Permit Expiration Date";
				var expDate = jsDateToASIDate(new Date(dateAdd(null, 180)));
				editAppSpecific(expDateField, expDate, newCapId);
			}
		}
	}
} catch (err) {
	logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}