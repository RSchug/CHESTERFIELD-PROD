try {
	logDebug("Entering IRSA:UTILITIES/RESIDENTIALCOMPANIONMETER/NA/NA");
	var inspBillable = inspObj.getInspection().getActivity().getInspBillable();
	logDebug("Inspection Billable checkbox = " + inspBillable + ". And Inspection Result = " + inspResult);
	if (inspBillable == "Y" && matches(inspResult,"Corrections Required","Approved")) {
		addFeeWithExtraData("REINSPECTION","CC-BLD-ADMIN","FINAL",1,"Y",capId,inspType+" Insp.Seq# "+Math.round(inspTotalTime)+"");
	}
	//52B:If Inspection Result = Corrections Required, and 'Not Ready Fee' is checked, then add Not Ready Fee("CC-BLD-ADMIN", "NOTREADY"). Inspection Detail Page field is called 'Overtime'
	var inspOvertime = inspObj.getInspection().getActivity().getOvertime();
	logDebug("Inspection Not Ready (Overtime) checkbox = " + inspOvertime + ". And Inspection Result = " + inspResult);
	if (matches(inspResult, "Corrections Required") && inspOvertime == "Y") {
		addFeeWithExtraData("NOTREADY","CC-BLD-ADMIN","FINAL",1,"Y",capId,inspType+" Insp.Seq# "+Math.round(inspTotalTime)+"");
	}

if (inspType.equals("Backflow Preventer") && inspResult.equals("Approved")) {
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