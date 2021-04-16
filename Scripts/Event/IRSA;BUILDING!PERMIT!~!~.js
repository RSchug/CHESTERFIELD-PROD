try {
	if (exists(inspResult,["Approved","Corrections Required"])){//removed on 3/24/2021 && inspType.indexOf("Final") < 0
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
//Amusement Final 275 Days
	if (inspType.equals("Amusement Final") && inspResult.equals("Approved")){
		// Update Permit Expiration Date
		var expField = "Permit Expiration Date";
		var expDateNew = jsDateToASIDate(new Date(dateAdd(null,275)));
		logDebug("Updating " + expField + " to " + expDateNew);
		editAppSpecific(expField, expDateNew);
	}
//Variables for the EE Inspector based on Parcel field "Inspection Dist" and Standard Choice 'InspectionAssignmentEnvEngineering'
	var ParcelInspectorEnvEng = AInfo["ParcelAttribute.InspectionDistrict"];
//var InspAssignment = lookup("InspectionAssignmentEnvEngineering",ParcelInspectorEnvEng);
	var iInspector = assignInspection_CHESTERFIELD(null); // Get Inspector
	var InspAssignment = null;
	if (iInspector && iInspector.getGaUserID()) InspAssignment = iInspector.getGaUserID();
//If Inspection Result is "Corrections Required" for Inspection Type "BI Erosion Control" schedule a E and SC Inspection 2 days out assigned to EE Inspector.//
	if (inspType.equals("BI Erosion Control") && inspResult.equals("Corrections Required")) {
		scheduleInspection("E and SC", 2, InspAssignment, null, "Auto Scheduled from BI Erosion Control Status of Corrections Required");
	}
//For Residential Permit only, when Framing Inspection Type is approved, schedule a VSMP Inspection Type for the following day and assign to EE Inspector
	if (appMatch("Building/Permit/Residential/NA")) {
		if (inspType.equals("Framing") && inspResult.equals("Approved")) {
			scheduleInspection("VSMP", 1, InspAssignment, null, "Auto Scheduled from Framing Approved Inspection.");
		}
	}
//If Inspection Result is "Extended" for Inspection Type "E and SC" schedule another E and SC Inspection 2 days out assigned to EE Inspector.//
	if (inspType.equals("E and SC") && inspResult.equals("Extended")) {
		scheduleInspection("E and SC", 2, InspAssignment, null, "Auto Scheduled from E and SC Status of Extended");
	}
//If Inspection Result is 'Corrections Required' and Inspection Type is 'E and SC' then create an ESC Notice to Comply child record AND schedule a Follow-up inspection on the ESC Notice to Comply child record with a scheduled date 2 days from system date.
	if (inspType.equals("E and SC") && inspResult.equals("Corrections Required")) {
		var newCapId = createChild("EnvEngineering", "ESC Notice to Comply", "NA", "NA", "");
		var sCapId = capId; // save current capId
		capId = newCapId; // use child capId
		scheduleInspection("Follow-up", 2, currentUserID, null, "Auto Scheduled from Not Approved E and SC Inspection");
		capId = sCapId; // restore capId
	}
// 35B: For Record Types: Residential Bldg, Residential Multi-Family and Commercial Building
// If the Inspection Result is 'Approved' on Inspection Type of 'Building Final', and the related 
// BUILDING/STRUCTURE Record Status is 'New Building' update Record Status on BUILDING/STRUCTURE to 'Existing'
	if (inspType.equals("Building Final") && inspResult.equals("Approved")
	&& (appMatch("Building/Permit/Residential/NA") || appMatch("Building/Permit/Residential/Multi-Family") || appMatch("Building/Permit/Commercial/NA"))) {
		if (parentCapId && appMatch("Building/Structure/NA/NA", parentCapId)) {
			var parentCapStatus = null;
			var getCapResult = aa.cap.getCap(parentCapId);
			if (getCapResult.getSuccess()) {
				var parentCap = getCapResult.getOutput();
				parentCapStatus = parentCap.getCapStatus();
			}
			if (parentCapStatus == "New Building") {
				logDebug("Updating Structure " + parentCapId.getCustomID() + " from " + parentCapStatus);
				updateAppStatus("Existing", "Updated via script from " + capId.getCustomID(), parentCapId);
			} else {
				logDebug("Keeping Structure " + parentCapId.getCustomID() + " as " + parentCapStatus);
			}
		}
	}
//31B update for Residential Fire to close out Inspections Workflow
	if (appMatch("Building/Permit/Residential/Fire") && (matches(inspType,"Spk Final Inspection","UGD Final Inspection")) && inspResult.equals("Approved")){
		closeTask("Inspections","Completed","Updated based on Approved Inspection Result","");
	}
//Add from Nick 12-2020
	if (appMatch("Building/Permit/Commercial/Fire") && (matches(inspType,"Alm Final Inspection","Cln Agt Final Inspection","Hood Suppression Final","Spk Final Inspection","UGD Final Inspection")) && inspResult.equals("Approved")){
		closeTask("Inspections","Completed","Updated based on Approved Inspection Result","");
	}
	if((appMatch("Building/Permit/Commercial/NA") || appMatch("Building/Permit/Residential/NA")) && (inspType == "Building Final" || inspType == "Budget and Management Final") && inspResult == "Approved") {
		var budget = checkinspectionstatus("Budget and Management Final","Approved");
		var building = checkinspectionstatus("Building Final","Approved");
		if(budget == "true" && building == "true")
		{
			invoiceAllFees(capId);
		}
	}
//04-2021
	if (inspType.equals("Environmental Engineering Final") && matches(inspResult,"Approved","Cancelled")){
		closeTask("Environmental Engineering Final Inspection","Approved","Updated based on Inspection","");
	}
	if (inspType.equals("Environmental Engineering Final") && inspResult.equals("Corrections Required")){
		updateTask("Environmental Engineering Final Inspection","Corrections Required","Updated based on Inspection","");
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}