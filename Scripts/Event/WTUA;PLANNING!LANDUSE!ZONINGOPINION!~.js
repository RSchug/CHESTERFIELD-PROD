try {
    // Set the Reviewers Tasks per the wfStatus choosen per REVIEW DEPTS FOR ELM Spreadsheet scritp# 60p
	if (wfTask == 'Review Distribution' && wfStatus == 'Routed for Commercial Review') {
		activateTask("CDOT Review");
		activateTask("Community Enhancement Review");
		activateTask("Environmental Engineering Review");
		activateTask("Fire and Life Safety Review");
		activateTask("Planning Review");
		activateTask("Utilities Review");
		activateTask("Police Review");
		activateTask("VDOT Review");
		activateTask("Schools Research and Planning Review");
		activateTask("Pre-Application Meeting");
		deactivateTask('Default');
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
		activateTask("Police Review");
		activateTask("Utilities Review");
		activateTask("VDOT Review");
		activateTask("Schools Research and Planning Review");
		activateTask("Pre-Application Meeting");
		if (wfStatus == 'Routed for Residential and Commercial') {
			activateTask("General Services Review");
		}
		deactivateTask('Default');
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
		activateTask("Pre-Application Meeting");
		deactivateTask('Default');
	}
//Set due dates to 3 days out per ELM Due Date Doc 02-2021 removed the business day feature in dateAdd function
	if (wfTask == 'Review Distribution' && matches(wfStatus,'Routed for Towers Review','Routed for Residential and Commercial','Routed for Residential Review','Routed for Commercial Review','Routed for Review')) {
		var workflowTasks = aa.workflow.getTasks(capId).getOutput();
		for (var i in workflowTasks) {
			var wfbTask = workflowTasks[i];
			if (wfbTask.getActiveFlag() == 'Y') {
				if (wfaTask == wfbTask.getTaskDescription()) {
					editTaskDueDate(wfbTask.getTaskDescription(),dateAdd(null,3));
				}
			}
		}
	}
//12-2020 auto-emails 11.1EMAIL
	if (wfTask == 'Review Consolidation') {
		emailPreAppComplete();
	}
	if (wfTask == 'Inquiry Submittal' && wfStatus == 'Pre-Application Meeting Waived') {
		emailPreAppComplete();
	}
	
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}

function emailPreAppComplete() {
    showMessageDefault = showMessage;
    //populate email notification parameters
    var emailSendFrom = "";
    var emailSendTo = "";
    var emailCC = "";
    var emailParameters = aa.util.newHashtable();
    var fileNames = [];

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
	var applicantName = "";
    var assignedTo = getAssignedToStaff();
    var assignedToEmail = "";
    var assignedToFullName = "";
    var contObj = {};
    contObj = getContactArray(capId);
    if (typeof(contObj) == "object") {
        for (co in contObj) {
            if (contObj[co]["contactType"] == "Applicant" && contObj[co]["email"] != null)
                applicantEmail += contObj[co]["email"] + ";";
				applicantName += contObj[co]["firstName"] + " " + contObj[co]["lastName"] + ",";
        }
    }
    addParameter(emailParameters, "$$applicantEmail$$", applicantEmail);
	addParameter(emailParameters, "$$applicantName$$", applicantName);

    if (assignedTo != null) {
        assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
        if (!matches(aa.person.getUser(assignedTo).getOutput().getEmail(), undefined, "", null)) {
            assignedToEmail = aa.person.getUser(assignedTo).getOutput().getEmail();
        }
    }
    addParameter(emailParameters, "$$assignedToFullName$$", assignedToFullName);
    addParameter(emailParameters, "$$assignedToEmail$$", assignedToEmail);

	//Load the Parcel numbers
	var tempAsit = loadASITable("CC-LU-TPA");
		if (tempAsit) {
			var TaxIDArray = "";
			for (b in tempAsit) {
				if (TaxIDArray == "") {
					TaxIDArray = tempAsit[b]["Tax ID"];
				} else { TaxIDArray = TaxIDArray + ", " + tempAsit[b]["Tax ID"]; }
			}
			addParameter(emailParameters, "$$TaxIdArray$$",TaxIDArray);	
		}
    if (applicantEmail != "" && wfStatus == 'Not Authorized') {
		var emailTemplate = "WTUA_PRE_APP_NOT_COMPLETE";
        sendNotification(emailSendFrom, emailSendTo, emailCC, emailTemplate, emailParameters, fileNames);
    }
	else if (applicantEmail != "" && wfStatus == 'Authorized to Proceed') {
		var emailTemplate = "WTUA_PRE_APP_MEET_COMPLETE";
        sendNotification(emailSendFrom, emailSendTo, emailCC, emailTemplate, emailParameters, fileNames);
    }
	else if (applicantEmail != "" && wfStatus == 'Additional Information Requested') {
		var emailTemplate = "WTUA_PRE_APP_NEED_INFO";
        sendNotification(emailSendFrom, emailSendTo, emailCC, emailTemplate, emailParameters, fileNames);
    }
	else if (applicantEmail != "" && wfStatus == 'Pre-Application Meeting Waived') {
		var emailTemplate = "WTUA_PRE_APP_MEET_WAIVED";
        sendNotification(emailSendFrom, emailSendTo, emailCC, emailTemplate, emailParameters, fileNames);
    }
	else if (applicantEmail == "" && assignedToEmail != "") {
            var emailTemplate = "WTUA_INTERNAL NOTIFICATION_REVIEWCOMPLETE";
            sendNotification(emailSendFrom, emailSendTo, emailCC, emailTemplate, emailParameters, fileNames);
            showMessage = true;
            comment("There is no applicant email associated to this permit. Permit Coordinator has been notified via email to contact this applicant directly.");
            showMessage = showMessageDefault;
	}
}