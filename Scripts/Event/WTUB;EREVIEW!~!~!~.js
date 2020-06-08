//Added per business request 04-2020, then removed per business request 05-2020 mb
//try {
//    if (appMatch('*/Planning/*/*') && matches(wfTask,'Review Distribution') & matches(wfStatus,'Routed for Review') && AInfo['Fees Paid'] != 'CHECKED') {
//        showMessage = true;
//	comment('The Fees Paid has NOT been checked in the Data Fields - please assure that fees are paid and then check the checkbox');
//	cancel = true;
//    }
//} catch (err) {
//    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
//}