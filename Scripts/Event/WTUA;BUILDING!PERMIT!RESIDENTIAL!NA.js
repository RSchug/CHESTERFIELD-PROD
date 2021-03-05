//if (wfTask == "Review Distribution" && wfStatus == "Routed for Review"){
//	deactivateTask("Structural Review");
//	activateTask("Addressing Review");
//	deactivateTask("Budget Review");
//	deactivateTask("Utilities Review");
//	deactivateTask("Environmental Engineering Review");
//}
//if (wfTask == "Application Submittal" && AInfo['Nature of Work'] == "Additions, Porches and Chimney" && (wfStatus == "Accepted - Plan Review Required" || wfStatus == "Accepted - Plan Review Not Required")){
// updateFee("CC_BLD_12","CC-BLD-RESIDENTIAL","FINAL",1,"N");
// updateFee("CC_BLD_02","CC-BLD-RESIDENTIAL","FINAL",1,"N");
// updateFee("CC-BLD-G-001","CC-BLD-GENERAL","FINAL",1,"N");
//}
//if (wfTask == "Review Distribution" && wfStatus == "Routed for Review" && AInfo['Nature of Work'] == "Additions, Porches and Chimney"){
// deactivateTask("Addressing Review");
// deactivateTask("Budget and Management Review");
//deactivateTask("Environmental Engineering Review");
// deactivateTask("Environmental Health Review");
// deactivateTask("Non Structural Review");
//deactivateTask("Planning Review");
//deactivateTask("Structural Review");
// deactivateTask("Transportation Review");
//deactivateTask("Utilities Review");
//}
// 10-13-19 Keith added to create AUX Permits when Building is issued
//if (wfTask == "Permit Issuance" && wfStatus == "Issued"){
//   newChildID = createChild("Building","Permit","Residential","AuxiliaryElectrical",""); copyAppSpecific(newChildID); comment("New Elec Permit app id = "+ newChildID);
//    saveCapId = capId;
//    capId = newChildID;
//    closeTask("Application Submittal","Accepted","Issued as MultiUnit","")
//    closeTask("Permit Issuance","Issued","Issued as MultiUnit","")
//    capId = saveCapId;
//   newChildID = createChild("Building","Permit","Residential","AuxiliaryMechanical",""); copyAppSpecific(newChildID); comment("New Mech Permit app id = "+ newChildID);
//    saveCapId = capId;
//    capId = newChildID;
//    closeTask("Application Submittal","Accepted","Issued as MultiUnit","")
//    closeTask("Permit Issuance","Issued","Issued as MultiUnit","")
//    capId = saveCapId;
//   newChildID = createChild("Building","Permit","Residential","AuxiliaryPlumbing",""); copyAppSpecific(newChildID); comment("New Plum Permit app id = "+ newChildID);
//    saveCapId = capId;
//    capId = newChildID;
//    closeTask("Application Submittal","Accepted","Issued as MultiUnit","")
//    closeTask("Permit Issuance","Issued","Issued as MultiUnit","")
//    capId = saveCapId;
//    }
try {
//Adhoc task updated to Amendment then update Status 'Amendment Submitted' on Inspections, Certificate Issuance or Certificate of Occupancy
	if ((wfTask =='Document Submitted Online' && wfStatus == 'Amendment')){
		if (isTaskActive('Inspections')){
			updateTask("Inspections", "Amendment Submitted", "Updated based on Document Submitted Online 'Amendment' Status", "");
				var newAppTypeString = appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + "Amendment";
				if (appMatch("Building/Permit/Residential/NA"))
					var newAppTypeString = "Building/Permit/Residential/Amendment";
				var newCapName = capName;
				var newCapIdString = getNextChildCapId(capId, newAppTypeString, "-");
				var newCapRelation = "Child";
				var srcCapId = capId;
				var copySections = ["Addresses", "ASI", "ASIT", "Cap Name", "Cap Short Notes", "Contacts", "GIS Objects", "LPs", "Owners", "Parcels","Documents"];
				var newCapId = createCap_TPS(newAppTypeString, newCapName, newCapIdString, newCapRelation, srcCapId, copySections);
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
				addFee("ADMIN", "CC-BLD-ADMIN", "FINAL", 1, "Y");
		}
	}

	if (wfTask =='Inspections' && wfStatus == 'Amendment Submitted') {
		var newAppTypeString = appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + "Amendment";
		if (appMatch("Building/Permit/Residential/NA"))
			var newAppTypeString = "Building/Permit/Residential/Amendment";
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
		addFee("ADMIN", "CC-BLD-ADMIN", "FINAL", 1, "Y");
	}
	///New EE script
	if (AInfo["Type of Building"] == "Single-Family Dwelling" || AInfo["Type of Building"] == "Multi-Family Dwelling"){
		if (wfStatus == 'Issued'){
			if (AInfo["Nature of Work"] == "Above-ground swimming pool with barrier" || 
			AInfo["Nature of Work"] == "Additions and other accessory structures" || 
			AInfo["Nature of Work"] == "Alterations, and converting deck/porch/garage to finished space" || 
			AInfo["Nature of Work"] == "Deck, carport, gazebo, dormers, greenhouse, unheated pool house, retaining wall, boat dock with roof" || 
			AInfo["Nature of Work"] == "Detached garages (no second floor occupiable space), double-door car shed, and finished pool house" || 
			AInfo["Nature of Work"] == "Florida rooms, attached garages, detached garages with occupiable space" || 
			AInfo["Nature of Work"] == "In-ground swimming pool with barrier" || 
			AInfo["Nature of Work"] == "Industrialized Building" || 
			AInfo["Nature of Work"] == "Manufactured or Mobile Home in Mobile Home Park" || 
			AInfo["Nature of Work"] == "Manufactured or Mobile Home on Private Property" || 
			AInfo["Nature of Work"] == "New Construction of Single Family Dwelling" || 
			AInfo["Nature of Work"] == "Porch and chimney additions" || 
			AInfo["Nature of Work"] == "Relocation (house moving)" || 
			AInfo["Nature of Work"] == "Renovation, alteration, conversion-resulting in change in use of square footage" || 
			AInfo["Nature of Work"] == "Renovation, alteration, conversion-resulting in no change in use of square footage" || 
			AInfo["Nature of Work"] == "Shed > 256sqft.") {
			//Variables for the EE Inspector based on Parcel field "Inspection Dist" and Standard Choice 'InspectionAssignmentEnvEngineering'
				var ParcelInspectorEnvEng = AInfo["ParcelAttribute.InspectionDistrict"];
				//var InspAssignment = lookup("InspectionAssignmentEnvEngineering",ParcelInspectorEnvEng);
				var iInspector = assignInspection_CHESTERFIELD(null); // Get Inspector
				var InspAssignment = null;
					if (iInspector && iInspector.getGaUserID()) InspAssignment = iInspector.getGaUserID();
					scheduleInspection("E and SC",15,InspAssignment,null,"Auto Scheduled based on Permit Issued");
			}
		}
	}
} catch (err) {
	logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}