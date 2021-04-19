try {
// Added per new update 03-2021
	if ((wfTask == 'Inative Application' || wfTask == 'Inactive Permit') && matches(wfStatus, "Withdrawn")) {
		taskCloseAllActive('Closed','Per Record Status Update');
	}
// If setting the License status manually from the workflow
	if (wfTask == 'Annual Status' && wfStatus == 'About to Expire') {
		lic = new licenseObject(capIDString);
		lic.setStatus('About to Expire');
	}
//Created Licensed professional after Application Submittal
	if ((wfTask == "Application Submittal" && (wfStatus == "Accepted - Plan Review Required" || wfStatus == "Accepted - Plan Review Not Required" || wfStatus == "Accepted")) && checkCapForLicensedProfessionalType("Contractor")){
		createRefLicProfFromLicProfTRU2();
	}
//Adhoc task updated to Revision then activate 'Review Distribution' and status of 'Corrections Received'
	if (wfTask =='Document Submitted Online' && wfStatus == 'Revision'){
		if (isTaskActive('Review Distribution')){
			updateTask("Review Distribution", "Corrections Received", "Updated based on Document Submitted Online 'Revision' Status", "");
			updateAppStatus("In Review","Updated based on Document Submitted Online 'Revision' Status.");
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
				logDebug("Could not update " + expField + ". No parent for " + capId.getCustomID());
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
	}
//For DigEplan
	if (matches(wfTask,'Review Distribution','Review Consolidation')) {
		loadCustomScript("WTUA_EXECUTE_DIGEPLAN_SCRIPTS_BUILD");
	}
//For PROFFER
	if (wfTask == 'Review Distribution' && wfStatus == 'Routed for Review') {
		if(appMatch("Building/Permit/Commercial/NA") && AInfo["Nature of Work"] == "New Construction" && (parcelHasCondition_TPS("Budget","Applied") || parcelHasCondition_TPS("Budget","Applied(Applied)"))) {
			addAdHocTask("ADHOC_WF","Budget and Management Review","");
		}
		if((appMatch("Building/Permit/Residential/NA") || appMatch("Building/Permit/Residential/Multi-Family")) && AInfo["Nature of Work"] == "New Construction of Single Family Dwelling" && (parcelHasCondition_TPS("Budget","Applied") || parcelHasCondition_TPS("Budget","Applied(Applied)"))) {
			addAdHocTask("ADHOC_WF","Budget and Management Review","");
		}
	}
//04-2021 For Permit Expiration Update on workflow tasks
	if (wfStatus == 'Corrections Received' || wfStatus == 'Accepted - Plan Review Required') {
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
			logDebug("Could not update " + expField + ". No parent for " + capId.getCustomID());
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
	//04-2021 Adhoc task updated to 'Corrections Required'
	if (wfTask =='Planning Final Review' && wfStatus == 'Corrections Required'){
		var emailSendFrom = '';
		var emailSendTo = "";
		var emailCC = "";
		var fileNames = [];
		var emailTemplate = "WTUA_CONTACT NOTIFICATION_CORRECTION_BLD";
		var emailParameters = aa.util.newHashtable();
		getRecordParams4Notification(emailParameters);
		getAPOParams4Notification(emailParameters);
		var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
		acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));
		//getACARecordParam4Notification(emailParameters,acaSite);
		addParameter(emailParameters, "$$acaRecordUrl$$", getACARecordURL(acaSite));
		addParameter(emailParameters, "$$InspectionDate$$", inspSchedDate);
		addParameter(emailParameters, "$$ShortNotes$$", getShortNotes());
		addParameter(emailParameters, "$$wfComment$$", wfComment);
		var applicantEmail = "";
		var contObj = {};
		contObj = getContactArray(capId);
		if (typeof(contObj) == "object") {
			for (co in contObj) {
				if (contObj[co]["contactType"] == "Applicant" && contObj[co]["email"] != null)
					applicantEmail += contObj[co]["email"] + ";";
			}
			addParameter(emailParameters, "$$applicantEmail$$", applicantEmail);
		} else { logDebug("No contacts at all for " + capIDString); }
		if (applicantEmail != "") {
			sendNotification(emailSendFrom, emailSendTo, emailCC, emailTemplate, emailParameters, fileNames);
		} else { logDebug("No applicants for " + capIDString); }
	}
} catch (err) {
	logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}
function taskCloseAllActive(pStatus,pComment) {
// Closes all active tasks in CAP with specified status and comment
// Function is a copy of the taskCloseAllExcept function.
	var workflowResult = aa.workflow.getTasks(capId);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
		else {
		 logMessage("**ERROR","CAP # "+capId.getCustomID()+" Failed to get workflow object: " + workflowResult.getErrorMessage());
		 return false;
		}
	var fTask;
	var stepnumber;
	var processID;
	var dispositionDate = aa.date.getCurrentDate();
	var wfnote = " ";
	var wftask;

	for (i in wfObj) {
		fTask = wfObj[i];
		wftask = fTask.getTaskDescription();
		stepnumber = fTask.getStepNumber();
		processID = fTask.getProcessID();
		if (fTask.getActiveFlag().equals("Y")) {
			//aa.workflow.handleDisposition(capId,stepnumber,processID,pStatus,dispositionDate,wfnote,pComment,systemUserObj,"Y");
			aa.workflow.handleDisposition(capId,stepnumber,pStatus,dispositionDate,wfnote,pComment,systemUserObj,"U");
			logMessage("INFO","Completed Workflow Task: " + wftask + " with a status of: " + pStatus + " for CAP # " + capId.getCustomID());
			wfObj[i].setCompleteFlag("Y");
			var fTaskModel = wfObj[i].getTaskItem();
			var tResult = aa.workflow.adjustTaskWithNoAudit(fTaskModel);
			if (tResult.getSuccess())
			   logMessage("INFO","Completed Workflow Task: " + wftask + ", for CAP # " + capId.getCustomID());
				else
				logMessage("**ERROR","CAP # "+capId.getCustomID()+" Failed to complete workflow task: " + tResult.getErrorMessage());
		}
	}
}

function createRefLicProfFromLicProfTRU2() {
   //Update to original - added the passing of the specific capId
   // Get the lic prof from the app
   //capLicenseResult = aa.licenseScript.getLicenseProf(capId);
   
	var capLicense = null;
	capLicenseArr = aa.licenseScript.getLicenseProf(capId).getOutput();
	if (capLicenseArr && capLicenseArr.length > 0) {
		for (var i in capLicenseArr) {
			capLicense = capLicenseArr[0];
			logDebug("capLicense[" + i + "]: "
				+ ", Lic #: " + capLicense.getLicenseNbr()
				+ ", Type: " + capLicense.getLicenseType()
				);
		}
 	   if (capLicense.getLicenseType() == "Contractor") //capLicenseResult.getSuccess()
					  { capLicenseArr = capLicenseResult.getOutput();  }
	   else
					  { logDebug("Not a Contractor lic prof: " + capLicenseResult.getErrorMessage()); return false; }

	   if (!capLicenseArr.length)
					  { logDebug("WARNING: no license professional available on the application:"); return false; }

	   licProfScriptModel = capLicenseArr[0];
	   rlpId = licProfScriptModel.getLicenseNbr();
	   birthdate = jsDateToMMDDYYYY(convertDate(licProfScriptModel.getBirthDate()));

	   var updating = false;
	   var newLic = getRefLicenseProf(rlpId)
	   if (newLic) {
		  updating = true;
		  logDebug("Updating existing Ref Lic Prof : " + rlpId);
		  }
	   else
		var newLic = aa.licenseScript.createLicenseScriptModel();

	   newLic.setStateLicense(rlpId);
	   newLic.setAddress1(licProfScriptModel.getAddress1());
	   newLic.setAddress2(licProfScriptModel.getAddress2());
	   newLic.setAddress3(licProfScriptModel.getAddress3());
	   newLic.setAgencyCode(licProfScriptModel.getAgencyCode());
	   newLic.setAuditDate(licProfScriptModel.getAuditDate());
	   newLic.setAuditID(licProfScriptModel.getAuditID());
	   newLic.setAuditStatus(licProfScriptModel.getAuditStatus());
	   newLic.setBusinessLicense(licProfScriptModel.getBusinessLicense());
	   newLic.setBusinessName(licProfScriptModel.getBusinessName());
	   newLic.setBusinessName2(licProfScriptModel.getBusName2());
	   newLic.setCity(licProfScriptModel.getCity());
	   newLic.setCityCode(licProfScriptModel.getCityCode());
	   newLic.setContactFirstName(licProfScriptModel.getContactFirstName());
	   newLic.setContactLastName(licProfScriptModel.getContactLastName());
	   newLic.setContactMiddleName(licProfScriptModel.getContactMiddleName());
	   newLic.setContryCode(licProfScriptModel.getCountryCode());
	   newLic.setCountry(licProfScriptModel.getCountry());
	   newLic.setEinSs(licProfScriptModel.getEinSs());
	   newLic.setEMailAddress(licProfScriptModel.getEmail());
	   newLic.setFax(licProfScriptModel.getFax());
	   newLic.setLicenseType(licProfScriptModel.getLicenseType());
	   newLic.setLicOrigIssDate(licProfScriptModel.getLicesnseOrigIssueDate());
	   newLic.setPhone1(licProfScriptModel.getPhone1());
	   newLic.setPhone2(licProfScriptModel.getPhone2());
	   newLic.setSelfIns(licProfScriptModel.getSelfIns());
	   newLic.setState(licProfScriptModel.getState());
	   newLic.setLicState(licProfScriptModel.getState());
	   newLic.setSuffixName(licProfScriptModel.getSuffixName());
	   newLic.setWcExempt(licProfScriptModel.getWorkCompExempt());
	   newLic.setZip(licProfScriptModel.getZip());
	   newLic.setComment(licProfScriptModel.getComment());
	   newLic.setLicenseBoard(licProfScriptModel.getLicenseBoard());
	   newLic.setFein(licProfScriptModel.getFein());

	   if (updating)
		myResult = aa.licenseScript.editRefLicenseProf(newLic);
	   else
		myResult = aa.licenseScript.createRefLicenseProf(newLic);

	   if (myResult.getSuccess())
		{
		updatereflp(rlpId,licProfScriptModel.getSalutation(),birthdate,licProfScriptModel.getPostOfficeBox())
		logDebug("Successfully added/updated License ID : " + rlpId)
		return rlpId;
		}
	   else
		{ logDebug("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage()); }
	}
}