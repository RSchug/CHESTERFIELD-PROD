//Fees must be paid before Workflow Status can be Complete//
try {
    if ((wfTask == 'Application Submittal' && wfStatus == 'Accepted' && balanceDue > 0))
{
        showMessage = true;
        comment('<font size=small><b>Unpaid Fees:</b></font><br><br>Cannot Complete until Fees are Paid, Balance Due is $ ' + balanceDue);
        cancel = true;
}
    } catch (err) 
{
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}
//Custom Fields are required//
try {
    if ((wfTask == 'Application Submittal' && wfStatus == 'Accepted' && (AInfo["Cycle"] == null)))
{
        showMessage = true;
        comment('<font size=small><b>Custom Fields are Required');
        cancel = true;
}
    } catch (err) 
{
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}
//Address, Parcel and Owner required before Application Submittal Accepted
try {
if ((wfTask == 'Application Submittal' && wfStatus == 'Accepted')) 
{
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
    } catch (err) 
{
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}
//Custom Field Service Number is required//
try {
    if ((wfTask == 'Application Submittal' && wfStatus == 'Accepted' && (AInfo["Service Number"] == null)))
{
        showMessage = true;
        comment('<font size=small><b>Service Number Data Field is Required');
        cancel = true;
}
    } catch (err) 
{
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}