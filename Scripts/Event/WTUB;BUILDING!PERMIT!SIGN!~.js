// WTUB:Building/Permit/Sign/*
try {
if (wfTask == 'Permit Issuance' && exists(wfStatus,['Issued - Inspections Not Required','Issued - Inspections Required'])) {
	//Before Workflow Task Status can be selected - confirm that at least one Address, one Parcel and one Owner exists on Record.
	if (!addressExistsOnCap()) {          // Check if address exists
	   showMessage = true;
	   comment('<font size=small><b>Address is required prior to Issuance</b></font>');
	   cancel = true;
	}
	if (!parcelExistsOnCap()) {             // Check if address exists
	   showMessage = true;
	   comment('<font size=small><b>Parcel is required prior to Issuance</b></font>');
	   cancel = true;
	}
	if (!ownerExistsOnCap()) {            // Check if address exists
	   showMessage = true;
	   comment('<font size=small><b>Owner is required prior to Issuance</b></font>');
	   cancel = true;
	}
	//Fees must be paid before Permit Issuance Workflow Status is Issued//
    if (balanceDue > 0) {
        showMessage = true;
        comment('<font size=small><b>Unpaid Fees:</b></font><br><br>Cannot Issue Permit until Fees are Paid, Balance Due is $ ' + balanceDue);
        cancel = true;
	}
	//Before Workflow Task 'Permit Issuance' Status is 'Issued' IF Licensed Professional is 'TBD' then Error: Licensed Professional is Required before Permit Issuance//
	if (getLicenseProf(null,['TBD'])) {
		showMessage = true;
		comment('<font size=small><b>Licensed Professional is required prior to Issuance</b></font>');
		cancel = true;
	}
}

} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}
