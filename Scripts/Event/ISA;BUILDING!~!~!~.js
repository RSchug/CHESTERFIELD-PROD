try {
	comment("Get the Inspection Count for this type");
	var inspResult = aa.inspection.getInspection(capId, inspId);
	inspObj = inspResult.getOutput();
	inspObj.setTimeTotal(Number(getinsptypecount(capId, inspType)));
	var result = aa.inspection.editInspection(inspObj);

	//if (getLastInspectioncomment(inspType) != "No Comments") {  //removed on Feb 8 2021 to not populate previous inspection comments into the inspection request comment
	//	var reqcomment = getInspectionComment(capId, inspId);
	//	if (reqcomment != "No Comment" && reqcomment != null) {
	//		inspcomment = reqcomment + " Last Result: " + getLastInspectioncomment(inspType);
	//		editInspectionComment(capId, inspId, inspcomment);
	//	}
	//	else {
	//		editInspectionComment(capId, inspId, getLastInspectioncomment(inspType));
	//	}
	//}
	
	//For PROFFERs Commercial
	if (inspType == "Building Final" ){
		if(appMatch("Building/Permit/Commercial/NA") && AInfo["Nature of Work"] == "New Construction" && (parcelHasCondition_TPS("Budget","Applied") || parcelHasCondition_TPS("Budget","Applied(Applied)"))) {
			createPendingInspection("CC-BLD-COMM","Budget and Management Final");
			schedulePendingInspection("Budget and Management Final",inspSchedDate)	
			var address = aa.address.getAddressByCapId(capId).getOutput();
			var fileNames = [];
			var emailParameters; 
			emailParameters = aa.util.newHashtable();
			emailParameters.put("$$RecordID$$", capIDString); 
			emailParameters.put("$$fileDate$$", fileDate);
			emailParameters.put("$$InspectionDate$$", inspSchedDate); 
			emailParameters.put("$$RecordStatus$$", capStatus);
			emailParameters.put("$$ProjectName$$", capName);
			emailParameters.put("$$AddressLine$$", address[0]);
			sendNotification("noreply@chesterfield.gov","budgetproffers@chesterfield.gov","mbouquin@truepointsolutions.com","BUDGET_INSPECTION",emailParameters,fileNames);
		}
	}
	//For PROFFERs Residential Multi-Family
	if (inspType == "Building Final" ){
		if((appMatch("Building/Permit/Residential/NA") || appMatch("Building/Permit/Residential/Multi-Family")) && AInfo["Nature of Work"] == "New Construction of Single Family Dwelling" && (parcelHasCondition_TPS("Budget","Applied") || parcelHasCondition_TPS("Budget","Applied(Applied)"))) {
			createPendingInspection("CC-BLD-COMM","Budget and Management Final");
			schedulePendingInspection("Budget and Management Final",inspSchedDate)	
			var address = aa.address.getAddressByCapId(capId).getOutput();
			var fileNames = [];
			var emailParameters; 
			emailParameters = aa.util.newHashtable();
			emailParameters.put("$$RecordID$$", capIDString); 
			emailParameters.put("$$fileDate$$", fileDate);
			emailParameters.put("$$InspectionDate$$", inspSchedDate); 
			emailParameters.put("$$RecordStatus$$", capStatus);
			emailParameters.put("$$ProjectName$$", capName);
			emailParameters.put("$$AddressLine$$", address[0]);
			sendNotification("noreply@chesterfield.gov","budgetproffers@chesterfield.gov","mbouquin@truepointsolutions.com","BUDGET_INSPECTION",emailParameters,fileNames);
		}
	}
	//added 04-2021 for EE Ad hoc to follow this inspection process and be automated
	if (inspType == "Environmental Engineering Final" ){
		addAdHocTask("ADHOC_WF","Environmental Engineering Final Inspection","");
	}
	//Added 04-2021 for Planning Inspection on any Building Record
	if (inspType == "Planning Final" ) {
		if (appMatch("Building/Permit/Commercial/NA") || appMatch("Building/Permit/Residential/Multi-Family")) {
			var emailSendFrom = '';
			var emailSendTo = "";
			var emailCC = "";
			var fileNames = [];
			var emailTemplate = "ISA_PLAN_FINAL_INSPECT";
			var emailParameters = aa.util.newHashtable();
			getRecordParams4Notification(emailParameters);
			getAPOParams4Notification(emailParameters);
			var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
			acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));
			//getACARecordParam4Notification(emailParameters,acaSite);
			addParameter(emailParameters, "$$acaRecordUrl$$", getACARecordURL(acaSite));
			addParameter(emailParameters, "$$InspectionDate$$", inspSchedDate);
			addParameter(emailParameters, "$$ShortNotes$$", getShortNotes());
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
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}