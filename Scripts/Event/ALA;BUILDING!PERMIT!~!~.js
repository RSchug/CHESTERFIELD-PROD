try {
//10-2020 Boucher 105aca - 11-2020 added the filter for record types
	var addrArray = [];
	loadAddressAttributes(addrArray);
	var TechRev = addrArray["AddressAttribute.County"];
	
	if (TechRev != null) {
		if (!appMatch('*/*/Elevator/*') && !appMatch('*/*/*/Demolition')) {
			addStdCondition('Economic Development','Eligible for Technology Zone Incentive Program');
			email('techzone@chesterfieldbusiness.com','noreply@chesterfield.gov','Record: ' + capId.getCustomID() + ' submitted in the Tech Zone','Date: ' + fileDate + ' For Record Type: ' + appTypeString);
		}
	}
} catch (err) {
		logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}