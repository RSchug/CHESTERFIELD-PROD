try {
// CPC Hearing Results Required
	if (matches(wfTask,'CPC Hearing') && matches(wfStatus,'CPC Approved','CPC Approved with Admin Review')) { //Denied removed on 9/23/2020 per request
		if (AInfo['No Time Limit'] != 'CHECKED'){
			if (AInfo['Conditions'] == null || AInfo['Approved Time Limit'] == null || AInfo['Number of Town House Units Approved'] == null || AInfo['Non-Residential Gross Building Square Feet'] == null
			|| AInfo['Number of Single Family Units Approved'] == null || AInfo['Number of Multi Family Units Approved'] == null || AInfo['Total Pedestrian Paths'] == null || AInfo['Shared Use Path Width'] == null || AInfo['Shared Use Path'] == null || AInfo['Pedestrian Width'] == null || AInfo['Pedestrian Trails'] == null || AInfo['Sidewalk Width'] == null || AInfo['Sidewalks'] == null) {
				showMessage = true;
				comment('You cannot advance this workflow until ALL fields in the <b>Results</b> area of the Data Fields are completely filled in.  Put in zeroes (0) for those fields that do not apply.');
				cancel = true;
			}
		}
	}
}
catch (err) {
	logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}