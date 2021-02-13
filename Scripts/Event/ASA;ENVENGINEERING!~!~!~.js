try {
//11-2020 Boucher 105aca added per call with Economic Development
	var addrArray = [];
	loadAddressAttributes(addrArray);
	var TechRev = addrArray["AddressAttribute.County"];
	
	if (TechRev != null) {
		if (appMatch('*/ESC Notice to Comply/*/*') || appMatch('*/Land Disturbance/*/*')) {
			addStdCondition('Economic Development','Eligible for Technology Zone Incentive Program');
			email('techzone@chesterfieldbusiness.com','noreply@chesterfield.gov','Record: ' + capId.getCustomID() + ' submitted in the Tech Zone','Date: ' + fileDate + ' For Record Type: ' + appTypeAlias);
		}
	}
} catch (err) {
		logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}