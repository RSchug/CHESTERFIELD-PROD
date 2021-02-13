//Fees must be paid before Initiation Workflow Status is Accepted//
try {
	if ((wfTask == 'Initiation' && wfStatus == 'Accepted') && balanceDue > 0) 
{
        showMessage = true;
        comment('<font size=small><b>Unpaid Fees:</b></font><br><br>Cannot Accept until Fees are Paid, Balance Due is $ ' + balanceDue);
        cancel = true;
}
    } catch (err) 
{
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}
//Address/Parcel/Owner must be entered before Initiation Workflow Status is Accepted//
if ((wfTask == 'Initiation' && wfStatus == 'Accepted')) {
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
}}
