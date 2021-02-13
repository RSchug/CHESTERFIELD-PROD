//25P IF wfTask = 'Request Submitted' && (wfStatus = 'Request Not Applicable' or 'Request Validated') && balance > 0 
//THEN: cancel = true, Comment = "Applcation fee needs to be paid"
try {
    if ((wfTask == 'Request Submitted') && (matches(wfStatus,"Request Not Applicable","Request Validated")) && (balanceDue > 0)) 
{
        showMessage = true;
        comment('<font size=small><b>Cannot Complete until Fees are Paid, Balance Due is $ ' + balanceDue+'');
        cancel = true;
}
    } catch (err) 
{
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}