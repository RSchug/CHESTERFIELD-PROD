try {
	//Variables for the EE Inspector based on Parcel field "Inspection Dist" and Standard Choice 'InspectionAssignmentEnvEngineering'
	var ParcelInspectorEnvEng = AInfo["ParcelAttribute.InspectionDistrict"];
	//var InspAssignment = lookup("InspectionAssignmentEnvEngineering",ParcelInspectorEnvEng);
	var iInspector = assignInspection_CHESTERFIELD(null); // Get Inspector
	var InspAssignment = null;
	if (iInspector && iInspector.getGaUserID()) InspAssignment = iInspector.getGaUserID();
	//If Inspection Result is 'Approved', 'Rain Approved', 'Not Approved' or 'Rain Not Approved' then schedule another Inspection Type a certain amount of days out per Inspection Type
		if(matches(inspResult,"Approved","Rain Approved","Not Approved","Rain Not Approved") && inspType.equals("E and SC")){
		scheduleInspection("E and SC",14,InspAssignment,null,"Auto Scheduled");
		}
		if(matches(inspResult,"Approved","Rain Approved","Not Approved","Rain Not Approved") && inspType.equals("Undisturbed")){
		scheduleInspection("Undisturbed",14,InspAssignment,null,"Auto Scheduled");
		}
		if(matches(inspResult,"Approved","Rain Approved","Not Approved","Rain Not Approved") && inspType.equals("Timbering Only")){
		scheduleInspection("Timbering Only",168,InspAssignment,null,"Auto Scheduled");
		}
		if(matches(inspResult,"Approved","Rain Approved","Not Approved","Rain Not Approved") && inspType.equals("Perimeter Control Installation")){
		scheduleInspection("Perimeter Control Installation",14,InspAssignment,null,"Auto Scheduled");
		}
		if(matches(inspResult,"Approved","Rain Approved","Not Approved","Rain Not Approved") && inspType.equals("Clearing and Grubbing")){
		scheduleInspection("Clearing and Grubbing",14,InspAssignment,null,"Auto Scheduled");
		}
		if(matches(inspResult,"Approved","Rain Approved","Not Approved","Rain Not Approved") && inspType.equals("Rough Grading")){
		scheduleInspection("Rough Grading",14,InspAssignment,null,"Auto Scheduled");
		}
		if(matches(inspResult,"Approved","Rain Approved","Not Approved","Rain Not Approved") && inspType.equals("Finished Grading")){
		scheduleInspection("Finished Grading",14,InspAssignment,null,"Auto Scheduled");
		}
		if(matches(inspResult,"Approved","Rain Approved","Not Approved","Rain Not Approved") && inspType.equals("Final Stabilization")){
		scheduleInspection("Final Stabilization",28,InspAssignment,null,"Auto Scheduled");
		}
		if(matches(inspResult,"Approved","Rain Approved","Not Approved","Rain Not Approved") && inspType.equals("Stabilized and Inactive")){
		scheduleInspection("Stabilized and Inactive",168,InspAssignment,null,"Auto Scheduled");
		}
		if(matches(inspResult,"Approved","Rain Approved","Not Approved","Rain Not Approved") && inspType.equals("One Year Maintenance")){
		scheduleInspection("One Year Maintenance",300,InspAssignment,null,"Auto Scheduled");
		}
		if(matches(inspResult,"Approved","Rain Approved","Not Approved","Rain Not Approved") && inspType.equals("VSMP")){
		scheduleInspection("VSMP",90,InspAssignment,null,"Auto Scheduled");
		}
	//If Inspection Result is 'One Year Maintenance' then schedule another One Year Maintenance Inspection Type and update Workflow Task of 'Inspections' to One Year Maintenance.//
	if(matches(inspResult,"One Year Maintenance")){
		scheduleInspection("One Year Maintenance",300,InspAssignment,null,"Auto Scheduled");
		updateTask("Inspections","One Year Maintenance","Updated based on One Year Maintenance Inspection Result","");
	}
	//If Inspection Result is 'Stabilized and Inactive' then schedule another Stabilized and Inactive Inspection Type and update Workflow Task of 'Inspections' to Stabilized and Inactive.//
	if (matches(inspResult,"Stabilized and Inactive")){
		scheduleInspection("Stabilized and Inactive",168,InspAssignment,null,"Auto Scheduled");
		updateTask("Inspections","Stabilized and Inactive","Updated based on Stabilized and Inactive Inspection Result","");
	}
	//If Inspection Result is 'Final Stabilization' then schedule another Final Stabilization Inspection Type and update Workflow Task of 'Inspections' to Final Stabilization.//
	if (matches(inspResult,"Final Stabilization")){
		scheduleInspection("Final Stabilization",28,InspAssignment,null,"Auto Scheduled");
		updateTask("Inspections","Final Stabilization","Updated based on Final Stabilization Inspection Result","");
	}
	//If Inspection Result is 'Finished Grading' then schedule another Finished Grading Inspection Type and update Workflow Task of 'Inspections' to Finished Grading.//
	if (matches(inspResult,"Finished Grading")){
		scheduleInspection("Finished Grading",14,InspAssignment,null,"Auto Scheduled");
		updateTask("Inspections","Finished Grading","Updated based on Finished Grading Inspection Result","");
	}
	//If Inspection Result is 'Rough Grading' then schedule another Rough Grading Inspection Type and update Workflow Task of 'Inspections' to Rough Grading.//
	if (matches(inspResult,"Rough Grading")){
		scheduleInspection("Rough Grading",14,InspAssignment,null,"Auto Scheduled");
		updateTask("Inspections","Rough Grading","Updated based on Rough Grading Inspection Result","");
	}
	//If Inspection Result is 'Clearing and Grubbing' then schedule another Clearing and Grubbing Inspection Type and update Workflow Task of 'Inspections' to Clearing and Grubbing.//
	if (matches(inspResult,"Clearing and Grubbing")){
		scheduleInspection("Clearing and Grubbing",14,InspAssignment,null,"Auto Scheduled");
		updateTask("Inspections","Clearing and Grubbing","Updated based on Clearing and Grubbing Inspection Result","");
	}
	//If Inspection Result is 'Perimeter Control Installation' then schedule another Perimeter Control Installation Inspection Type and update Workflow Task of 'Inspections' to Perimeter Control Installation.//
	if (inspResult.equals("Perimeter Control Installation")){
		scheduleInspection("Perimeter Control Installation",14,InspAssignment,null,"Auto Scheduled");
		updateTask("Inspections","Perimeter Control Installation","Updated based on Perimeter Control Installation Inspection Result","");
	}
	//If Inspection Result is 'Timbering Only' then schedule another Timbering Only Inspection Type and update Workflow Task of 'Inspections' to Timbering Only.//
	if (inspResult.equals("Timbering Only")){
		scheduleInspection("Timbering Only",168,InspAssignment,null,"Auto Scheduled");
		updateTask("Inspections","Timbering Only","Updated based on Timbering Only Inspection Result","");
	}
	//If Inspection Result is 'Undisturbed' then schedule another Undisturbed Inspection Type and update Workflow Task of 'Inspections' to Undisturbed//
	if (inspResult.equals("Undisturbed")){
		scheduleInspection("Undisturbed",14,InspAssignment,null,"Auto Scheduled based on Undisturbed Inspection Result");
		updateTask("Inspections","Undisturbed","Updated based on Undisturbed Inspection Result","");
	}
	//If Inspection Result is 'Pending Closure' then schedule another Pending Closure Inspection Type 56 calendar days out and update Inspections Workflow Task to Pending Closure.//
	if (matches(inspResult,"Pending Closure")){
		scheduleInspection("Pending Closure",56,InspAssignment,null,"Auto Scheduled");
		updateTask("Inspections","Pending Closure","Updated based on Completed Inspection Result","");
	}

	//If Inspection Result is 'Completed' then schedule another Pending Closure Inspection Type 56 calendar days out and Close Inspections Workflow Task.//
	if (matches(inspResult, "Completed")) {
		// 22EE, 35EE, 48EE, 61EE, 74EE, 87EE, 100EE, 113EE, 126EE, 139EE: WHEN: Inspection Type = E and SC, Undisturbed, Timbering Only, Perimeter Control Installation, Clearing and Grubbing, Rough Grading, Finished Grading, Final Stabilization, Stabilized, One Year Maintenance and Inspection Status = Completed and the Related EnvEngineering/SRA/NA/NA record has an Application (Record) status = 'Closed' and the Related EnvEngineering/BMP/NA/NA record has an Application (Record) status = 'Approved'
		// THEN: Close (deactivate) Inspections Workflow Task with a Task Status = 'Completed' and set the Application (Record) status to 'Closed' 
		// ELSE: Schedule an Inspection Type = Pending Closure and schedule it for 56 calendar days out and assign to the inspector based on the EE Inspector GIS Layer; Update Inspections Workflow Task with a Task Status = 'Pending Closure'
		if (matches(inspType, "E and SC", "Pending Closure", "Undisturbed", "Timbering Only", "Perimeter Control Installation", "Clearing and Grubbing", "Rough Grading", "Finished Grading", "Final Stabilization", "Stabilized", "One Year Maintenance")) {
			// Check Sibling EnvEngineering/BMP/NA/NA record has an Application (Record) status = 'Approved'
			var rCapStatusValidBMP = null; // null: not found, true: found Approved, false: found but none Approved;
			//	var rCapStatusValidBMPs = [], rCapStatusInvalidBMPs = [];
			var rCapIds = [];
			if (parentCapId) {
				rCapIds = getChildren("EnvEngineering/BMP/NA/NA", parentCapId);
			}
			for (var i in rCapIds) {
				var rCapId = rCapIds[i]
				var rCap = aa.cap.getCap(rCapId).getOutput();
				var rCapStatus = rCap.getCapStatus();
				if (exists(rCapStatus, ["Approved"])) {
					//  rCapStatusValidBMPs.push(rCapId.getCustomID() + " "+rCapStatus);
					rCapStatusValidBMP = true;
					logDebug("rCap: " + rCapId.getCustomID() + ", Status: " + rCapStatus + " Valid")
				} else {
					//	rCapStatusInvalidBMPs.push(rCapId.getCustomID() + " " + rCapStatus);
					if (rCapStatusValidBMP == null) rCapStatusValidBMP = false;
					logDebug("rCap: " + rCapId.getCustomID() + ", Status: " + rCapStatus + " Invalid")
				}
			}
			logDebug("Checked for Approved BMP: " + rCapStatusValidBMP);
			// Check Related EnvEngineering/SRA/NA/NA record has an Application (Record) status = 'Closed'
			// Look for child SRA records as Child of record or (Grand Child) Child of Child FP
			var rCapStatusValidSRA = null; // null: not found, true: found Closed, false: found but none Closed;
			//	var rCapStatusValidSRA = [], rCapStatusInvalidSRAs = [];
			var capStatusSRA = null;
			var rCapIds = getChildren("EnvEngineering/SRA/NA/NA", capId);
			if (typeof (rCapIds) == "undefined") rCapIds = [];
			if (!rCapIds) rCapIds = [];
			var rCapIdsFP = getChildren("Planning/Subdivision/Final Plat/NA", capId);
			for (var i in rCapIdsFP) {
				var rCapIdsSRA = getChildren("EnvEngineering/SRA/NA/NA", rCapIdsFP[i]);
				for (var j in rCapIdsSRA) rCapIds.push(rCapIdsSRA[j])
			}
			for (var i in rCapIds) {
				var rCapId = rCapIds[i]
				logDebug("Checking rCapIds[" + i + "]: " + rCapId);
				var rCap = aa.cap.getCap(rCapId).getOutput();
				var rCapStatus = rCap.getCapStatus();
				if (exists(rCapStatus, ["Closed"])) {
					//	rCapStatusValid.push(rCapId.getCustomID() + " " + rCapStatus);
					rCapStatusValidSRA = true;
					logDebug("rCap: " + rCapId.getCustomID() + ", Status: " + rCapStatus + " Valid")
				} else {
					//	rCapStatusInvalid.push(rCapId.getCustomID() + " " + rCapStatus);
					if (rCapStatusValidSRA == null) rCapStatusValidSRA = false;
					logDebug("rCap: " + rCapId.getCustomID() + ", Status: " + rCapStatus + " Invalid")
				}
			}
			logDebug("Checked for Closed SRA: " + rCapStatusValidSRA);
			if (rCapStatusValidBMP && rCapStatusValidSRA) {
				closeTask("Inspections", "Completed", "Updated based on Completed Inspection Result", "");
			} else if (rCapStatusValidBMP && rCapStatusValidSRA == null && parentCapId && appMatch("Planning/SitePlan/Major/NA", parentCapId)) {
				closeTask("Inspections", "Completed", "Updated based on Completed Inspection Result", "");
			} else {
				scheduleInspection("Pending Closure", 56, InspAssignment, null, "Auto Scheduled");
			}
		} else if (matches(inspType, "Pre-Construction Meeting")) {
			// 3EE: WHEN: Inspection Type = Pre - Construction Meeting and Inspection Status = 'Completed'
			// THEN: Update Land Disturbance Permit Workflow Task with a Task Status = 'Issued'; Close Land Disturbance Permit Workflow Task; activate Inspections Workflow Task with a Workflow Task Status = 'Undisturbed'; schedule an E and SC and a VSMP inspection for same day

			//If Inspection Type is Pre-Construction Meeting and Inspection Result is Completed, then Close Land Disturbance Permit Task with Issued and Activate Inspections Task with Undisturbed.//
			closeTask("Land Disturbance Permit", "Issued", "Updated based on Pre-Construction Meeting Inspection Result", ""); activateTask("Inspections");
			updateTask("Inspections", "Undisturbed", "Updated based on Pre-Construction Meeting Inspection Result", "");
			scheduleInspection("E and SC", 0, InspAssignment, null, "Auto Scheduled");
			scheduleInspection("VSMP", 0, InspAssignment, null, "Auto Scheduled");
		} else {
			scheduleInspection("Pending Closure", 56, InspAssignment, null, "Auto Scheduled");
			closeTask("Inspections", "Completed", "Updated based on Completed Inspection Result", "");
		}
	}
	//If Inspection Result is 'Not Approved' or "Rain Not Approved" and not an VSMP then create an ESC Notice to Comply child record AND schedule a Follow-up inspection on the ESC Notice to Comply child record with a scheduled date 7 days from system date.
	if (matches(inspResult, "Not Approved", "Rain Not Approved")) {
		if (inspType.equals("VSMP")) {
			var newCapId = createChildLic("EnvEngineering", "VSMP Notice to Comply", "NA", "NA", "");
			var sCapId = capId; // save current capId.
			capId = newCapId; // use child capId
			scheduleInspection("Follow-up", 7, InspAssignment, null, "Auto Scheduled");
			capId = sCapId; // restore capId.
		} else {
			var newCapId = createChildLic("EnvEngineering", "ESC Notice to Comply", "NA", "NA", "");
			var sCapId = capId; // save current capId.
			capId = newCapId; // use child capId
			scheduleInspection("Follow-up", 7, InspAssignment, null, "Auto Scheduled");
			capId = sCapId; // restore capId.
		}
	}
} catch (err) {
		logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}