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
//03-2021 this is to account for GIS feature not getting populated via ACA
	if (publicUser) {
		copyParcelGisObjects();
	}
//03-2021 add by N Graf for DPOR expression	
	var lpcheck = aa.licenseProfessional.getLicensedProfessionalsByCapID(capId)
	if (lpcheck.getSuccess()) {
		var dporURL = lookup("DPOR_INTERFACE","URL");
		var dporToken = lookup("DPOR_INTERFACE","TOKEN");	
		var lp = lpcheck.getOutput();
		var licNumber = lp[0].getLicenseNbr();
		var dpor = invokeDPOR(licNumber,dporToken,dporURL);	
		var result=JSON.parse(JSON.stringify(dpor));
		var Rate= lookup("DPOR_RATE_MAPPING",result.respObj.rank);
			if(Rate!=null) {
				lp[0].setSalutation(Rate);
			}
			else {
				lp[0].setSalutation(result.respObj.rank)
			}
		lp[0].setComment(result.respObj.comments.trim());
		lp[0].setLicenseBoard("Department of Professional and Occupational Regulation");
		aa.licenseProfessional.editLicensedProfessional(lp[0]);
	}
	
} catch (err) {
		logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}