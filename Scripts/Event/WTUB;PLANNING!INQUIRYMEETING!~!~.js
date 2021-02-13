//19P IF Workflow Task = Review Coordination and Status is updated, if Data Field 'Minor Site Plan Allowed' is null, 
//THEN show Message 'Approved for Minor Site data needs to be populated.'
try {
    if ((wfTask == 'Review Consolidation' && wfStatus == 'Proceed') && (AInfo["Case type"] == 'Site Plan Minor') && (AInfo["11. Minor Site Plan Allowed"] == null)) 
{
        showMessage = true;
        comment('<font size=small><b>Approved for Minor Site data needs to be populated');
        cancel = true;
}
    } catch (err) 
{
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}