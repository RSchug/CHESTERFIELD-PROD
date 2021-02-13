//does not work as variable are only assigned after not before
//try {
//	var inspBillable = inspObj.getInspection().getActivity().getInspBillable();
//	logDebug("Inspection Billable checkbox = " + inspBillable + ". And Inspection Result = " + inspResult);
//	var inspOvertime = inspObj.getInspection().getActivity().getOvertime();
//	logDebug("Inspection Not Ready (Overtime) checkbox = " + inspOvertime + ". And Inspection Result = " + inspResult);
// Error message when Fee item selected with wrong status
//if (inspResult == "Approved" && inspOvertime == "Y") {
//			showMessage = true;
//			comment('<font size=small><b>Not Ready Fee must be Corrections Required status</b></font>');
//			cancel = true;
//	}
//	if (inspResult == "Cancelled" && inspBillable =="Y") {
//			showMessage = true;
//			comment('<font size=small><b>Fees are not allowed for Cancelled Status</b></font>');
//			cancel = true;
//	}
//	if (inspResult == "Cancelled" && inspOvertime =="Y") {
//		showMessage = true;
//		comment('<font size=small><b>Fees are not allowed for Cancelled Status</b></font>');
//		cancel = true;
//}
//} catch (err) {
//	logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
//}
if (appMatch("Building/Permit/Residential/NA")) {
    if (exists(AInfo["Type of Building"],["Single-Family Dwelling", "Multi-Family Dwelling"])) {
        if (inspType.equals("Foundation") && inspResult.equals("Approved") && !checkInspectionResult("E and SC", "Approved")) {
            showMessage = true;
            comment('<font size=small><b> E and SC Inspection is not Approved.</b></font>');
            cancel = true;
        }
    }
}