try {
	if (AInfo["Related Record ID"] != null) {
		addParent(AInfo["Related Record ID"]);
		pLicCap  = aa.cap.getCapID(["Related Record ID"]).getOutput();
	}
	//10-2020 Boucher 105aca - 11-2020 added record type filters
	var addrArray = [];
	loadAddressAttributes(addrArray);
	var TechRev = addrArray["AddressAttribute.County"];
	
	if (TechRev != null) {
		if (!appMatch('*/*/Elevator/*') && !appMatch('*/*/*/Demolition')) {
			addStdCondition('Economic Development','Eligible for Technology Zone Incentive Program');
			email('techzone@chesterfieldbusiness.com','noreply@chesterfield.gov','Record: ' + capId.getCustomID() + ' submitted in the Tech Zone','Date: ' + fileDate + ' For Record Type: ' + appTypeAlias);
		}
	}
} catch (err) {
		logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}