if (wfTask == 'Application Submittal' && wfStatus == 'Accepted') {
	//Fees must be paid before Workflow Status is Accepted//
	if (balanceDue > 0) {
        showMessage = true;
        comment('<font size=small><b>Unpaid Fees:</b></font><br><br>Cannot Complete until Fees are Paid, Balance Due is $ ' + balanceDue+'</b></font>');
        cancel = true;
	}
	//Custom Fields are required//
    if (AInfo["Cycle"] == null) {
        showMessage = true;
		comment('<font size=small><b>Custom Fields are Required</b></font>');
        cancel = true;
	}
	//Estimated Cost of Construction is required//
    if (estValue == 0)  {
        showMessage = true;
		comment('<font size=small><b>Estimated Cost of Construction is Required</b></font>');
        cancel = true;
	}
	//Address, Parcel and Owner required before Application Submittal Accepted
	//Before Workflow Task Status can be selected - confirm that at least one Address, one Parcel and one Owner exists on Record.
	if (!addressExistsOnCap()) {          // Check if address exists
	   showMessage = true;
	   comment('<font size=small><b>Address is required prior to Acceptance</b></font>');
	   cancel = true;
	}
	if (!parcelExistsOnCap()) {             // Check if address exists
	   showMessage = true;
	   comment('<font size=small><b>Parcel is required prior to Acceptance</b></font>');
	   cancel = true;
	}
	if (!ownerExistsOnCap()) {            // Check if address exists
	   showMessage = true;
	   comment('<font size=small><b>Owner is required prior to Acceptance</b></font>');
	   cancel = true;
	}
}
//Before Workflow Task 'Permit Issuance' Status is 'Issued' IF Licensed Professional is null then Error: Licensed Professional is Required before Permit Issuance// removed requirement on 3/11/2021
//if (wfTask == 'Permit Issuance' && wfStatus == 'Issued') {
//	var lps = getLicenseProf(null, null);
//	if (lps == false || lps.length == 0) {
//		showMessage = true;
//		comment('<font size=small><b>Licensed Professional is required prior to Permit Issuance</b></font>');
//		cancel = true;
//	}
//}