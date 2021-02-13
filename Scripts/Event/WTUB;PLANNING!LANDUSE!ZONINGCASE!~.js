try {
// 08-2020 Boucher 42.1p check that Custom data is filled in before moving to next step
	if (matches(wfTask, 'CPC Hearing') && matches(wfStatus, 'Recommend Approval','Recommend Denial')) {
			if (AInfo['CPC Conditions'] == null || AInfo['CPC Proffered Conditions'] == null || AInfo['CPC Cash Proffers'] == null || AInfo['CPC Complies with Plan'] == null ){
				showMessage = true;
				comment('You cannot advance this workflow until all CPC fields in the <b>Results</b> area of the Data Fields are completely filled in.  You can put in zeroes (0) for those fields that do not apply.');
				cancel = true;
			}
		}
    if (matches(wfTask, 'BOS Hearing') && matches(wfStatus,'Approved')) { //Denied removed on 9/23/2020 per request
		if (AInfo['BOS Conditions'] == null || AInfo['BOS Proffered Conditions'] == null || AInfo['BOS Cash Proffers'] == null || AInfo['BOS Complies with Plan'] == null 
		|| AInfo['BOS Residential - Single Family Unit Approved'] == null || AInfo['BOS Residential - Multi Family Unit Approved'] == null || AInfo['BOS Age Restricted Units'] == null) {
			showMessage = true;
			comment('You cannot advance this workflow until all BOS fields in the <b>Results</b> area of the Data Fields are completely filled in.  You can put in zeroes (0) for those fields that do not apply.');
			cancel = true;
		}
	}
// When the Time Limit Checkbox is not checked, then those time fields need to be filled in
	if (matches(wfTask, 'CPC Hearing') && matches(wfStatus, 'Recommend Approval','Recommend Denial')) {
		if (AInfo['No CPC Time Limit'] != 'CHECKED'){
			if (AInfo['CPC Approved Time Limit'] == null || AInfo['CPC Expiration Date'] == null) {
			showMessage = true;
			comment('Since the No CPC Time Limit is unchecked, you need to fill in the CPC Time and Date fields in the <b>Results</b> area, and cannot advance this workflow until those 2 fields are filled in.');
			cancel = true;
			}
		}
	}
	if (matches(wfTask, 'BOS Hearing') && matches(wfStatus, 'Approved')) { //Denied removed on 9/23/2020 per request
		if (AInfo['No BOS Time Limit'] != 'CHECKED'){
			if (AInfo['BOS Approved Time Limit'] == null || AInfo['BOS Expiration Date'] == null) {
			showMessage = true;
			comment('Since the No BOS Time Limit is unchecked, you need to fill in the BOS Time and Date fields in the <b>Results</b> area, and cannot advance this workflow until those 2 fields are filled in.');
			cancel = true;
			}
		}
	}
} catch (err) {
	logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}