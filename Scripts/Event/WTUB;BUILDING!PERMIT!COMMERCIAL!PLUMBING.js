//Exceeds 80 PSI question is required//
try {
    if ((wfTask == 'Utilities Review' && wfStatus == 'Approved') && (AInfo["Exceeds 80 PSI"] == null)) 
{
        showMessage = true;
        comment('<font size=small><b>Exceeds 80 PSI Custom Data Field is Required');
        cancel = true;
}
    } catch (err) 
{
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}