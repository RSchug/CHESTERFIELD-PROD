try {
	//Permit Issuance is Issued than updated Permit Expiration Date to 180 days from system date
	if ((wfTask == "Permit Issuance" && wfStatus == "Issued") || (wfTask == "Inspections" && wfStatus == "Temporary CO Issued") || (wfTask == "Inactive Permit" && wfStatus == "Cancelled") || (wfTask == "Inactive Permit" && wfStatus == "Extended") || (wfTask == "Inactive Application" && wfStatus == "Cancelled") || (wfTask == "Inactive Application" && wfStatus == "Extended")) { 
	// Update Permit Expiration Date on record, and where appropriate parent and children
		var expField = "Permit Expiration Date";
		var expDateNew = jsDateToASIDate(new Date(dateAdd(null, 180)));
		editAppSpecific(expField, expDateNew);
		if (appMatch("Building/Permit/Residential/NA") || appMatch("Building/Permit/Residential/Multi-Family") || appMatch("Building/Permit/Commercial/NA")) {
			var childRecs = getChildren("Building/Permit/*/*", capId);
		} else if (parentCapId) {
			logDebug("Updating parent " + parentCapId.getCustomID() + " " + expField + " to " + expDateNew);
			editAppSpecific(expField, expDateNew, parentCapId);
			var childRecs = getChildren("Building/Permit/*/*", parentCapId);
		} else {
			comment("Parent record missing. Could not update parent expiration date.");
			var childRecs = [];
		}
		for (var c in childRecs) {
			var childCapId = childRecs[c];
			var childCapStatus = null;
			var getCapResult = aa.cap.getCap(childCapId);
			if (getCapResult.getSuccess()) {
				var childCap = getCapResult.getOutput();
				var childCapStatus = childCap.getCapStatus();
			}
			if (childCapStatus != "Cancelled") {
				logDebug("Updating child " + childCapId.getCustomID() + " " + childCapStatus + " " + expField + " to " + expDateNew);
				editAppSpecific(expField, expDateNew, childCapId);
			}
		}
	}
	//Temp CO Dates for CO Fees
	var tempcoexpdate = "Temp CO Expiration Date";
	var tempcoexpdatenew = jsDateToASIDate(getTaskDueDate("Inspections"));
	if (matches(wfStatus,'Temporary CO Requested') && appMatch("Building/Permit/Residential/NA")) {  // took this out per Becky:  && !feeExists("TEMPCORES")
		addFee("TEMPCORES","CC-BLD-ADMIN","FINAL",1,"Y");
		//editAppSpecific(tempcoexpdate,tempcoexpdatenew);
		}
	if (matches(wfStatus,'Temporary CO Requested') && appMatch("Building/Permit/Commercial/NA")) { // took this out per Becky:  && !feeExists("TEMPCO")
		addFee("TEMPCO","CC-BLD-ADMIN","FINAL",1,"Y");
		//editAppSpecific(tempcoexpdate,tempcoexpdatenew);
	}
	//Temp CO Date for editAppSpecific
	if (matches(wfStatus,'Temporary CO Issued') && appMatch("Building/Permit/Residential/NA") && !feeExists("TEMPCORES")) { 
		addFee("TEMPCORES","CC-BLD-ADMIN","FINAL",1,"Y");
		//editAppSpecific(tempcoexpdate,tempcoexpdatenew);
	}
	if (matches(wfStatus,'Temporary CO Issued') && appMatch("Building/Permit/Commercial/NA") && !feeExists("TEMPCO")) {
		addFee("TEMPCO","CC-BLD-ADMIN","FINAL",1,"Y");
		//editAppSpecific(tempcoexpdate,tempcoexpdatenew);
	}
		//Temp CO Date for editAppSpecific
	if (matches(wfStatus,'Temporary CO Issued') && appMatch("Building/Permit/Residential/NA")) { 
		editAppSpecific(tempcoexpdate,tempcoexpdatenew);
	}
	if (matches(wfStatus,'Temporary CO Issued') && appMatch("Building/Permit/Commercial/NA")) {
		editAppSpecific(tempcoexpdate,tempcoexpdatenew);
	}
	//Variables for the EE Inspector based on Parcel field "Inspection Dist" and Standard Choice 'InspectionAssignmentEnvEngineering'
	//var ParcelInspectorEnvEng = AInfo["ParcelAttribute.InspectionDistrict"];
	//var InspAssignment = lookup("InspectionAssignmentEnvEngineering", ParcelInspectorEnvEng);
	if (wfTask == 'Review Distribution' && wfStatus == 'Routed for Review') {
		if (isTaskActive("Environmental Engineering Review")) {
			assignTask_CHESTERFIELD("Environmental Engineering Review", null, null, null, "EnvEngineering");
		}
	}
	//Temporary Elevator Renewal Certificate Dates
	var tempcertexpdate = "Temporary Certificate Expiration Date";
	var tempcertexpdatenew = jsDateToASIDate(new Date(dateAdd(null, 30)));
	if (wfStatus == 'Temporary Certificate Issued' && appMatch("Building/Permit/Elevator/Renewal")) {
		editAppSpecific(tempcertexpdate,tempcertexpdatenew);
	}
	//Set parm for all the email types below
	var emailTemplate = "";
	
	//Email if Payment Due 
	if (wfStatus == "Payment Due"){
		emailTemplate = "WTUA_BLDG_PAYMENT_DUE";
	}
	//03-2021 Auto-emails
	if (matches(wfTask,"Application Submittal","Review Distribution","Permit Issuance") && wfStatus == "Additional Information Required") { 
		emailTemplate = "WTUA_CONTACT NOTIFICATION_ADDITIONAL_BLD";
	}
	if (wfTask == 'Structural Review' &&  wfStatus == "Corrections Required") {
		if (appMatch('*/*/Residential/NA') || appMatch('*/*/Residential/Multi-Family')) {
			emailTemplate = "WTUA_CONTACT NOTIFICATION_CORRECTION_BLD";
		}
	}
	if (wfTask == 'Review Consolidation' &&  wfStatus == "Corrections Required") {
		if (appMatch('*/*/Residential/NA') || appMatch('*/*/Residential/Multi-Family')) {
			emailTemplate = "WTUA_CONTACT NOTIFICATION_CORRECTION_BLD";
		}
	}
	//04-2021 added the designation for Fire Record type
	if (wfTask == "Permit Issuance" && matches(wfStatus,"Issued","Issued - Inspections Required","Issued - Inspections Not Required") && !appMatch('*/*/*/Fire')) { 
		emailTemplate = "WTUA_CONTACT NOTIFICATION_APPROVED_BLD";
	}
	if (wfTask == "Permit Issuance" && wfStatus == "Issued" && appMatch('*/*/*/Fire')) { 
		emailTemplate = "WTUA_CONTACT NOTIFICATION_APPROVED_FIRE";	
	}
  	if (wfTask == "Certificate of Occupancy" && wfStatus == "CO Issued") { 
		emailTemplate = "WTUA_CONTACT NOTIFICATION_CO";	
	}
	if (wfTask == "Inspections" && wfStatus == "Amendment Issued") { 
		emailTemplate = "WTUA_CONTACT NOTIFICATION_AMEND_BLD";		
	}
	//Run the email info if there is a template set and it is not the Commercial or Sign Records.
	if (emailTemplate != "" && !appMatch('*/*/Commercial/*') && !appMatch('*/*/Sign/*')) {
		var emailSendFrom = '';
		var emailSendTo = "";
		var emailCC = "";
		var fileNames = [];
		var emailParameters = aa.util.newHashtable();
		getRecordParams4Notification(emailParameters);
		getAPOParams4Notification(emailParameters);
		var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
		acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));
		//getACARecordParam4Notification(emailParameters,acaSite);
		addParameter(emailParameters, "$$acaRecordUrl$$", getACARecordURL(acaSite));
		addParameter(emailParameters, "$$wfComment$$", wfComment);
		addParameter(emailParameters, "$$wfStatus$$", wfStatus);
		addParameter(emailParameters, "$$ShortNotes$$", getShortNotes());
		var applicantEmail = "";
		var contObj = {};
		contObj = getContactArray(capId);
		if (typeof(contObj) == "object") {
			for (co in contObj) {
				if (contObj[co]["contactType"] == "Applicant" && contObj[co]["email"] != null)
					applicantEmail += contObj[co]["email"] + "; ";
			}
			addParameter(emailParameters, "$$applicantEmail$$", applicantEmail);
		} else { logDebug("No contacts at all for " + capIDString); }
	
		if (applicantEmail != "") {
			sendNotification(emailSendFrom, emailSendTo, emailCC, emailTemplate, emailParameters, fileNames);
		} else { logDebug("No Contacts nor LP's for " + capIDString); }
	}
	if (wfTask == 'Review Consolidation' &&  wfStatus == "Corrections Required") {
		if (appMatch('*/*/Commercial/*') || appMatch('*/*/Sign/*')) {
			emailTemplate = "WTUA_CONTACT NOTIFICATION_CORRECTION_BLD_COM";
		}
	}
	//Run the email info if there is a template set and it is Commercial or Sign Records.
	if (emailTemplate != "" && (appMatch('*/*/Commercial/*') || appMatch('*/*/Sign/*'))) {
		var emailSendFrom = '';
		var emailSendTo = "";
		var emailCC = "";
		var fileNames = [];
		var emailParameters = aa.util.newHashtable();
		getRecordParams4Notification(emailParameters);
		getAPOParams4Notification(emailParameters);
		var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
		acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));
		//getACARecordParam4Notification(emailParameters,acaSite);
		addParameter(emailParameters, "$$acaRecordUrl$$", getACARecordURL(acaSite));
		addParameter(emailParameters, "$$wfComment$$", wfComment);
		addParameter(emailParameters, "$$wfStatus$$", wfStatus);
		addParameter(emailParameters, "$$ShortNotes$$", getShortNotes());
		var applicantEmail = "";
		var contObj = {};
		contObj = getContactArray(capId);
		if (typeof(contObj) == "object") {
			for (co in contObj) {
				if (contObj[co]["email"] != null)
					applicantEmail += contObj[co]["email"] + "; ";
			}
			addParameter(emailParameters, "$$applicantEmail$$", applicantEmail);
		} else { logDebug("No contacts at all for " + capIDString); }
	//LP capture - 04-2021
		var lpEmail = "";
		var rArray = new Array();
		licArr = getLicenseProfessional(capId);
		for (i in licArr) {
			var lp = new Array();
			lp["email"] = licArr[i].getEmail();
			if (lp["email"] != null) {
				lpEmail += lp["email"] + "; ";
				/*keep these here for future expansion if needed
				lp["licType"] = licArr[i].getLicenseType();
				lp["lastName"] = licArr[i].getContactLastName();
				lp["firstName"] = licArr[i].getContactFirstName();
				lp["businessName"] = licArr[i].getBusinessName();  */
			}
			else { logDebug("No LP's at all for " + capIDString); }
			
			addParameter(emailParameters, "$$lpEmail$$", lpEmail);
		}
		if (applicantEmail != "" || lpEmail != "") {
			sendNotification(emailSendFrom, emailSendTo, emailCC, emailTemplate, emailParameters, fileNames);
		} else { logDebug("No Contacts nor LP's for " + capIDString); }
	}
} catch (err) {
	logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}