//comment("Test form ISA"); moved to ISA Building
//comment("Get the Inspection Count for this type");
//var inspResult = aa.inspection.getInspection(capId, inspId);
//inspObj = inspResult.getOutput();
//inspObj.setTimeTotal(Number(getinsptypecount(capId, inspType)));
//var result = aa.inspection.editInspection(inspObj);
//
//if (getLastInspectioncomment(inspType) != "No Comments") {
//	var reqcomment = getInspectionComment(capId, inspId);
//	if (reqcomment != "No Comment" && reqcomment != null) {
//		inspcomment = reqcomment + " Last Result: " + getLastInspectioncomment(inspType);
//		editInspectionComment(capId, inspId, inspcomment);
//	}
//	else {
//		editInspectionComment(capId, inspId, getLastInspectioncomment(inspType));
//	}
//}
//When Framing Inspection Type is scheduled, schedule a VSMP Inspection Type for the following day and assign to EE Inspector
//if (matches(inspType, "Framing")) {
//	scheduleInspectDate("VSMP", dateAdd(inspSchedDate, 1), currentUserID, null, "Auto Scheduled from Scheduled Framing Inspection");
//}


//var isInspectionRemove = false;
// Permit must be Issued or Temporary CO Issued, except Site Visit Inspection
//if (inspType != "Site Visit" && (!wasCapStatus(["Issued", "Temporary CO Issued"]))) {
//	showMessage = true;
//	comment('<font size=small><b>Record must be Issued to schedule inspections</b></font>');
//	if (exists(vEventName, ["InspectionMultipleScheduleAfter", "InspectionMultipleScheduleBefore"])) isInspectionRemove = true;
//}

// Remove Pending Inspection created via Manage Inspection
//if (isInspectionRemove) {
//	if (inspObj.getInspection) {
//		var removeResult = removeInspection(inspObj.getInspection());
//		logDebug("Removing Inspection: " + inspObj.getIdNumber()
//			+ " " + inspObj.getInspectionType()
//			+ " " + inspObj.getInspectionStatus()
//			+ (removeResult ? (removeResult.getSuccess() ? " Successful" : " failed. ERROR:" + removeResult.getErrorMessage()) : "")
//		);
//	} else {
//		logDebug("ERROR: Removing Inspection: " + inspObj.getInspectionType())
//	}
//}