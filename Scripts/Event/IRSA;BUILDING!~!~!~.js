try {
	logDebug("Entering IRSA:BUILDING/*/*/*");
	var inspBillable = inspObj.getInspection().getActivity().getInspBillable();
	logDebug("Inspection Billable checkbox = " + inspBillable + ". And Inspection Result = " + inspResult);
	if (inspBillable == "Y" && matches(inspResult,"Corrections Required","Approved")) {
		addFeeWithExtraData("REINSPECTION","CC-BLD-ADMIN","FINAL",1,"N",capId,inspType+" Insp.Seq# "+Math.round(inspTotalTime)+"");
	}
	//52B:If Inspection Result = Corrections Required, and 'Not Ready Fee' is checked, then add Not Ready Fee("CC-BLD-ADMIN", "NOTREADY"). Inspection Detail Page field is called 'Overtime'
	var inspOvertime = inspObj.getInspection().getActivity().getOvertime();
	logDebug("Inspection Not Ready (Overtime) checkbox = " + inspOvertime + ". And Inspection Result = " + inspResult);
	if (matches(inspResult, "Corrections Required") && inspOvertime == "Y") {
		addFeeWithExtraData("NOTREADY","CC-BLD-ADMIN","FINAL",1,"N",capId,inspType+" Insp.Seq# "+Math.round(inspTotalTime)+"");
	}

	//If Residential Building with Nature of Work of 'New Construction of Single Family Dwelling, Industrialized Building, Manufactured or Mobile Home on Private Property and Inspection Result is "Approved" for Inspection Type "Building Final" close the Inspections Workflow Task.//
	if (appMatch("Building/Permit/Residential/NA") && ((AInfo["Nature of Work"] == "New Construction of Single Family Dwelling") ||
		(AInfo["Nature of Work"] == "Industrialized Building") ||
		(AInfo["Nature of Work"] == "Manufactured or Mobile Home on Private Property")) && (inspType.equals("Building Final") && inspResult.equals("Approved"))) {
			closeTask("Inspections","CO Ready to Issue","Updated based on Completed Inspection Result","");
			activateTask("Certificate of Occupancy");
	}
	//If Residential Building NOT with Nature of Work of 'New Construction of Single Family Dwelling, Industrialized Building, Manufactured or Mobile Home on Private Property and Inspection Result is "Approved" for Inspection Type "Building Final" close the Inspections Workflow Task.//
	if (appMatch("Building/Permit/Residential/NA") && ((AInfo["Nature of Work"] != "New Construction of Single Family Dwelling") &&
		(AInfo["Nature of Work"] != "Industrialized Building") &&
		(AInfo["Nature of Work"] != "Manufactured or Mobile Home on Private Property")) && (inspType.equals("Building Final") && inspResult.equals("Approved"))) {
			closeTask("Inspections","Completed - CO Not Required","Updated based on Approved Inspection Result","");
	}
	if (appMatch("Building/Permit/Residential/Demolition") && inspType.equals("Building Final") && inspResult.equals("Approved")){
		closeTask("Inspections","Completed","Updated based on Completed Inspection Result","");
		if (parentCapId && appMatch("Building/Structure/NA/NA", parentCapId)) {
			logDebug("Updating Structure " + parentCapId.getCustomID() + " to Demolished");
			updateAppStatus("Demolished", "Updated via script from " + capId.getCustomID(), parentCapId);
			//logDebug("Deleting Structure " + parentCapId.getCustomID());
			//deleteRecord(parentCapId);
		}
		}
	if (appMatch("Building/Permit/Commercial/NA") && inspType.equals("Building Final") && inspResult.equals("Approved")){
		closeTask("Inspections","Completed","Updated based on Completed Inspection Result","");
		activateTask("Certificate Issuance");
		}
	if (appMatch("Building/Permit/Commercial/Demolition") && inspType.equals("Building Final") && inspResult.equals("Approved")){
		closeTask("Inspections","Completed","Updated based on Completed Inspection Result","");
		}
	//If Inspection Result is "Approved" for Inspection Type "Property Conversion Inspection" close the Inspections Workflow Task.//
	if (inspType.equals("Property Conversion Inspection") && inspResult.equals("Approved")){
		closeTask("Inspections","Approved","Updated based on Completed Inspection Result","");
		}
	//If Inspection Result is "Approved" for Inspection Type "Home Inspection" close the Inspections Workflow Task.//
	if (inspType.equals("Home Inspection") && inspResult.equals("Approved")){
		closeTask("Inspections","Approved","Updated based on Completed Inspection Result","");
		}
	//If Inspection Result is "Approved" for Inspection Type "Rental Inspection" close the Inspections Workflow Task.//
	if (inspType.equals("Rental Inspection") && inspResult.equals("Approved")){
		closeTask("Inspections","Approved","Updated based on Completed Inspection Result","");
		}
	//If Inspection Result is "Approved" for Inspection Type "Amusement Final" close the Inspections Workflow Task.//
	if (inspType.equals("Amusement Final") && inspResult.equals("Approved") && (AInfo["Permanent installation?"] == "Yes")){
		closeTask("Inspections","Completed (Annual)","Updated based on Completed Inspection Result","");
		activateTask("Certificate of Inspection");
		}
	if (inspType.equals("Amusement Final") && inspResult.equals("Approved") && (AInfo["Permanent installation?"] != "Yes")){
		closeTask("Inspections","Completed","Updated based on Completed Inspection Result","");
		}
	//If Inspection Result is "Approved" for Inspection Type "Boiler" close the Inspections Workflow Task.//
	if (inspType.equals("Boiler Final") && inspResult.equals("Approved")){
		closeTask("Inspections","Completed","Updated based on Completed Inspection Result","");
		}
	//If Inspection Result is "Approved" for Inspection Type "Electrical Final" close the Inspections Workflow Task.//
	if (inspType.equals("Electrical Final") && inspResult.equals("Approved")){
		closeTask("Inspections","Completed","Updated based on Completed Inspection Result","");
		}
	//If Inspection Result is "Approved" for Inspection Type "Gas Final" close the Inspections Workflow Task.//
	if (inspType.equals("Gas Final") && inspResult.equals("Approved")){
		closeTask("Inspections","Completed","Updated based on Completed Inspection Result","");
		}
	//If Inspection Result is "Approved" for Inspection Type "Mechanical Final" close the Inspections Workflow Task.//
	if (inspType.equals("Mechanical Final") && inspResult.equals("Approved")){
		closeTask("Inspections","Completed","Updated based on Completed Inspection Result","");
		}
	//If Inspection Result is "Approved" for Inspection Type "Plumbing Final" close the Inspections Workflow Task.//
	if (inspType.equals("Plumbing Final") && inspResult.equals("Approved")){
		closeTask("Inspections","Completed","Updated based on Completed Inspection Result","");
		}
	//If Inspection Result is "Approved" for Inspection Type "Elevator Final" close the Inspections Workflow Task.//
	if (inspType.equals("Elevator Final") && inspResult.equals("Approved")){
		closeTask("Inspections","Completed","Updated based on Completed Inspection Result","");
		}
	//If Inspection Result is "Approved" for Inspection Type "Sign Final" close the Inspections Workflow Task.//
	if (inspType.equals("Sign Final") && inspResult.equals("Approved")){
		closeTask("Inspections","Completed","Updated based on Completed Inspection Result","");
		}
	// Error message when Fee item selected with wrong status
		if (inspResult == "Approved" && inspOvertime == "Y") {
					showMessage = true;
					comment('<font size=small><b>Not Ready Fee must be Corrections Required status. Fee will not be added until Status is changed to Corrections Required.</b></font>');
					cancel = true;
			}
			if (inspResult == "Cancelled" && inspBillable =="Y") {
					showMessage = true;
					comment('<font size=small><b>Fees are not allowed for Cancelled Status and will not be added.</b></font>');
					cancel = true;
			}
			if (inspResult == "Cancelled" && inspOvertime =="Y") {
				showMessage = true;
				comment('<font size=small><b>Fees are not allowed for Cancelled Status and will not be added.</b></font>');
				cancel = true;
		}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}