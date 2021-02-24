// WTUB:Building/Permit/*/*
try {
	if (wfTask == 'Permit Issuance' && wfStatus == 'Issued') {
		if (!getLicenseProf() && (AInfo["Jurat Checkbox"] == null)) {
			showMessage = true;
			comment('&lt;font size=small&gt;&lt;b&gt;Owner Contractor Exemption Jurat Checkbox is required prior to Issuance if no Licensed Professional is selected.&lt;/b&gt;&lt;/font&gt;');
			cancel = true;
		}
		//Fees must be paid before Permit Issuance Workflow Status is Issued//
		logDebug("Checking Fees paid: " + balanceDue);
		if (balanceDue > 0) {
			showMessage = true;
			comment('<font size=small><b>Unpaid Fees:</b></font><br><br>Cannot Issue Permit until Fees are Paid, Balance Due is $ ' + balanceDue);
			cancel = true;
		}
		//Before Workflow Task 'Permit Issuance' Status is 'Issued' IF Licensed Professional is 'TBD' then Error: Licensed Professional is Required before Permit Issuance//
		if (getLicenseProf(null, ['TBD'])) {
			showMessage = true;
			comment('<font size=small><b>Licensed Professional is required prior to Issuance</b></font>');
			cancel = true;
		}
		// Permit must be Issued
		var parentAppTypes = null;
		if (exists(appTypeArray[3], ["Boiler", "Fire", "Gas", "Mechanical", "Plumbing"])) {
			var parentAppTypes = ["Building/Permit/Commercial/NA", "Building/Permit/Residential/NA", "Building/Permit/Residential/Multi-Family"];
		} else if (exists(appTypeArray[3], ["Electrical"])) { // Includes Elevator & Sign 
			var parentAppTypes = ["Building/Permit/Commercial/NA", "Building/Permit/Residential/NA", "Building/Permit/Residential/Multi-Family", "Building/Permit/Elevator/Installation", "Building/Permit/Sign/NA"];
		} else if (appMatch("Building/Permit/Elevator/Installation")) {
			var parentAppTypes = ["Building/Permit/Commercial/NA", "Building/Permit/Residential/NA", "Building/Permit/Residential/Multi-Family"];
		}
		if (parentAppTypes) {
			logDebug("Checking parentCap: " + (parentCapId ? parentCapId.getCustomID() : parentCapId) + " was issued");
		}
		if (parentAppTypes && parentCapId && !wasCapStatus(["Issued"],parentCapId)) {
			parentCap = aa.cap.getCap(parentCapId).getOutput();
			parentAppTypeString = parentCap.getCapType().toString()
			logDebug("parentAppTypeArray: " + parentAppTypeString + " in " + parentAppTypes.join(","));
			if (exists(parentAppTypeString, parentAppTypes)) {
				showMessage = true;
				comment('<font size=small><b>Parent Permit must be Issued before Trade Permit can be Issued</b></font>');
				cancel = true;
			}
		}
		// 07-2020 Boucher 11p For Residential or Commercial here are the Proffer Conditions that need to be met on the Parcel before permit can be issued - turned off - looking for business rule.
//		if ((appMatch('*/*/Residential/NA') || appMatch('*/*/Commercial/NA') || appMatch('*/*/Residential/Multi-Family'))  && 
/*			(parcelHasCondition_TPS('CDOT', 'Applied') ||
			parcelHasCondition_TPS('Budget', 'Applied') ||
			parcelHasCondition_TPS('EE', 'Applied') ||
			parcelHasCondition_TPS('Fire', 'Applied') ||
			parcelHasCondition_TPS('Parks and Rec', 'Applied') ||
			parcelHasCondition_TPS('Planning', 'Applied') ||
			parcelHasCondition_TPS('Utilities', 'Applied'))) {
				showMessage = true;
				comment('<font size=small><b>The Parcel(s) seem to have still applied Conditions?</b> You will need to update the Condition Status to Condition Met to proceed in the workflow </font>');
				cancel = true;
		}*/
	}
	if (wfTask == 'Application Submittal' && exists(wfStatus, ['Accepted - Plan Review Required', 'Accepted - Plan Review Not Required', 'Accepted'])) {
		//Before Workflow Task Status can be selected - confirm that at least one Address, one Parcel and one Owner exists on Record.
		if (!addressExistsOnCap()) {          // Check if address exists
			showMessage = true;
			comment('<font size=small><b>Address is required </b></font>');
			cancel = true;
		}
		if (!parcelExistsOnCap()) {             // Check if address exists
			showMessage = true;
			comment('<font size=small><b>Parcel is required </b></font>');
			cancel = true;
		}
		if (!ownerExistsOnCap()) {            // Check if address exists
			showMessage = true;
			comment('<font size=small><b>Owner is required </b></font>');
			cancel = true;
		}
	}
	//Temporary CO Fees must be paid before Workflow Status is Temporary CO Issued//
	//if (wfStatus == 'Temporary CO Issued' && balanceDue > 0) {
	//	showMessage = true;
	//	comment('<font size=small><b>Unpaid Fees:</b></font><br><br>Cannot Issue Temporary CO until Temporary CO Fees are Paid, Balance Due is $ ' + balanceDue);
	//	cancel = true;
	//}
} catch (err) {
	logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}