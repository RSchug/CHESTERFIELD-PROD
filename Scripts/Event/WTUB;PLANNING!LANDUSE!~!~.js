try {
// Variances BZA
	if (appMatch('Planning/LandUse/AdminVariance/NA') || appMatch('Planning/LandUse/Variance/NA') || appMatch('Planning/LandUse/SpecialException/NA') || appMatch('Planning/LandUse/Appeal/NA')){    
		if (matches(wfTask, 'BZA Hearing') && matches(wfStatus,'Approved')) { //Denied removed on 9/23/2020 per request
			if (AInfo['Conditions'] == null || AInfo['Approved Time Limit'] == null) {
				showMessage = true;
				comment('You cannot advance this workflow until ALL fields in the <b>Results</b> area of the Data Fields are completely filled in.  Put in zeroes (0) for those fields that do not apply.');
				cancel = true;
			}
			if (AInfo['No Time Limit'] != 'CHECKED' && AInfo['Approved Time Limit'] == null) {
				showMessage = true;
				comment('You cannot advance this workflow if the <b>No Time Limit</b> is checked and there is nothing filled in for the <b>Approved Time Limit</b>.');
				cancel = true;
			}
		}
	}
	// 42.4P Manufactured Homes and RPA Exception
	if (appMatch('Planning/LandUse/ManufacturedHomes/NA') || appMatch('Planning/LandUse/RPAException/NA')){    
		if (matches(wfTask, 'BOS Hearing') && matches(wfStatus,'Approved')) { //Denied removed on 9/23/2020 per request
			if (AInfo['BOS conditions'] == null || AInfo['BOS Proffered conditions'] == null){
				showMessage = true;
				comment('You cannot advance this workflow until ALL fields in the <b>Results</b> area of the Data Fields are completely filled in.  Put in zeroes (0) for those fields that do not apply.');
				cancel = true;
			}
			if (AInfo['No BOS Time Limit'] != 'CHECKED' && (AInfo['BOS Approved time limit'] == null || AInfo['BOS Approved Time Limit'] == null || AInfo['Approved Time Limit'] == null)) {
				showMessage = true;
				comment('You cannot advance this workflow if the <b>No BOS Time Limit</b> is unchecked and there is nothing filled in for the <b>Approved Time Limit</b>.');
				cancel = true;
			}
			if (appMatch('Planning/LandUse/ManufacturedHomes/NA') && (AInfo['BOS Cash proffers'] == null || AInfo['BOS Complies with plan'] == null)) { 
				showMessage = true;
				comment('You cannot advance this workflow until ALL fields in the <b>Results</b> area of the Data Fields are completely filled in.  Put in zeroes (0) for those fields that do not apply.');
				cancel = true;
			}
		}
	}
	if (appMatch('Planning/LandUse/AdminVariance/NA')){    
		if (matches(wfTask, 'Administrative Outcome') && matches(wfStatus,'Approved')) { //Denied removed on 9/23/2020 per request
			if (AInfo['Conditions'] == null || AInfo['Approved Time Limit'] == null) {
				showMessage = true;
				comment('You cannot advance this workflow until ALL fields in the <b>Results</b> area of the Data Fields are completely filled in.  Put in zeroes (0) for those fields that do not apply.');
				cancel = true;
			}
		}
	}
} catch (err) {
	logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}