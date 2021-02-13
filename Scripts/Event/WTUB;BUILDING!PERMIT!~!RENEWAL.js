// WTUB:Building/Permit/*/Renewal
if (wfTask == 'Renewal Issuance' && wfStatus == 'Renewed') {
	//Fees must be paid before Permit Issuance Workflow Status is Issued//
    if (balanceDue > 0) {
        showMessage = true;
        comment('<font size=small><b>Unpaid Fees:</b></font><br><br>Cannot Issue Permit until Fees are Paid, Balance Due is $ ' + balanceDue);
        cancel = true;
    }
}