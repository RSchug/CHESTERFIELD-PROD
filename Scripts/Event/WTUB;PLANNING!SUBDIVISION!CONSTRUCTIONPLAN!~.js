try {
	// Results and Ped Info required 93P
	if (matches(wfTask, 'Administrative Approval') && matches(wfStatus, 'Final Approval')) {
		if (AInfo['No Time Limit'] != 'CHECKED') {
			if (AInfo['Approved Time Limit'] == null) {
				showMessage = true;
				comment('Since the No Time Limit is unchecked, you need to fill in the Approved Time Limit field in the <b>Results</b> area, and cannot advance this workflow until that is filled in.');
				cancel = true;
			}
		}
		if (AInfo['Conditions'] == null || AInfo['Number of Town House Units Approved'] == null || AInfo['Number of Single Family Units Approved'] == null
			|| AInfo['Total Pedestrian Paths'] == null || AInfo['Shared Use Path Width'] == null || AInfo['Shared Use Path'] == null || AInfo['Pedestrian Width'] == null 
			|| AInfo['Pedestrian Trails'] == null || AInfo['Sidewalk Width'] == null || AInfo['Sidewalks'] == null) {
				showMessage = true;
				comment('You cannot advance this workflow until ALL fields in the <b>Results</b> area of the Data Fields are completely filled in.  Put in zeroes (0) for those fields that do not apply.');
				cancel = true;
		}
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}