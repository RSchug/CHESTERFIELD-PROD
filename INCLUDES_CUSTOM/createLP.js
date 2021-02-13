function createLP(rlpId, rlpType) {
	var itemCap = (arguments.length > 2 && arguments[2]? arguments[2]:capId);
	var lpBoard = (arguments.length > 3 && arguments[3]? arguments[3]:null);
	var lpExpirDate = (arguments.length > 4 && arguments[4]? arguments[4]:null);
	var lpFirstName = (arguments.length > 5 && arguments[5]? arguments[5]:null);
	var lpMiddleName = (arguments.length > 6 && arguments[6]? arguments[6]:null);
	var lpLastName = (arguments.length > 7 && arguments[7]? arguments[7]:null);
	var lpBusName = (arguments.length > 8 && arguments[8]? arguments[8]:null);
	var lpAddrLine1 = (arguments.length > 9 && arguments[9]? arguments[9]:null);
	var lpAddrLine2 = (arguments.length > 10 && arguments[10]? arguments[10]:null);
	var lpAddrLine3 = (arguments.length > 11 && arguments[11]? arguments[11]:null);
	var lpAddrCity = (arguments.length > 12 && arguments[12]? arguments[12]:null);
	var lpAddrState = (arguments.length > 13 && arguments[13]? arguments[12]:null);
	var lpAddrZip = (arguments.length > 14 && arguments[14]? arguments[14]:null);
	var lpPhone1 = (arguments.length > 15 && arguments[15]? arguments[15]:null);
	var lpPhone2 = (arguments.length > 16 && arguments[16]? arguments[16]:null);
	var lpEmail = (arguments.length > 17 && arguments[17]? arguments[17]:null);
	var lpFax = (arguments.length > 18 && arguments[18]? arguments[18]:null);
	
	// Get Ref LP Object
	var rlpObj = new licenseProfObject(rlpId,rlpType);
	// 
	if (rlpObj && !rlpObj.capLicProfScriptModel) {
		var useRefLP = rlpObj.copyToRecord(capId,false); // copy from reference LP
		if (itemCap){
			var capLicenseArr = null;
			var capLicenseResult = aa.licenseScript.getLicenseProf(itemCap);
			if (capLicenseResult.getSuccess())
				{ capLicenseArr = capLicenseResult.getOutput();  }
			else
				{ logDebug("**ERROR: getting lic prof: " + capLicenseResult.getErrorMessage()); return false; }


			if (!capLicenseArr || capLicenseArr.length == 0) {
				logDebug("WARNING: no license professional available on the application:");
			}

			var capLPModel = null;
			if (capLicenseArr && capLicenseArr.length > 0) {
				for (var capLic in capLicenseArr) {
					var lpsm = capLicenseArr[capLic];
					if (lpsm && lpsm.getLicenseNbr() + "" == rlpId && lpsm.getLicenseType() + "" == rlpType) {
						capLPModel = lpsm;
						rlpObj.capLicProfScriptModel = lpsm;
					}
				}
			}
		}
	}
	// if CAP LP exists?, Skip. otherwise create CAP from parameters.
	if (rlpObj && rlpObj.capLicProfScriptModel) {
		vPrimary = "Y";
		vPrimary = (vPrimary || vPrimary == "Y"? "Y" : "N");
		if (rlpObj.setPrimary) {
			rlpObj.setPrimary(itemCap,"Y");		// make primary
		} else {
			//Get the LP from the Record
			var capLicenseResult = aa.licenseProfessional.getLicenseProf(itemCap);
			var capLicenseArr = new Array();
			var existing = false;
			if (capLicenseResult.getSuccess()) {
				capLicenseArr = capLicenseResult.getOutput();
			}

			// Make primary LP for CAP
			if (capLicenseArr != null) {
				for (capLic in capLicenseArr) {
					var lpsm = capLicenseArr[capLic];
					if (lpsm.getLicenseNbr() + "" == rlpId && lpsm.getLicenseType() + "" == rlpType && lpsm.getPrintFlag() != vPrimary) {
							lpsm.setPrintFlag(vPrimary);
							aa.licenseProfessional.editLicensedProfessional(lpsm);
					}
				}
			}
		}
		logDebug("Using exising LP Type: " + rlpType + ",  Nbr: " + rlpId);
		return true;
	} else {
		var newLic = aa.licenseProfessional.getLicenseProfessionScriptModel().getOutput();
		newLic.setAgencyCode(aa.getServiceProviderCode());
		newLic.setAuditDate(sysDate);
		newLic.setAuditID(currentUserID);
		newLic.setAuditStatus("A");

		newLic.setLicenseType(rlpType);
		newLic.setLicenseNbr(rlpId);
		newLic.setCapID(itemCap); 
		if (lpBoard) 		newLic.setLicenseBoard(lpBoard); //default the state if none was provided
		if (lpExpirDate)	newLic.setLicenseExpirDate(lpExpirDate);
		newLic.setPrintFlag("Y"); 			// Set Primary
		newLic.setSerDes("Description");	// Required

		if (lpFirstName)	newLic.setContactFirstName(lpFirstName);
		if (lpMiddleName && newLic.setContactMiddleName)	newLic.setContactMiddleName(lpMiddleName); 	//method may not available
		if (lpLastName)		newLic.setContactLastName(lpLastName);
		if (lpBusName)		newLic.setBusinessName(lpBusName);
		if (lpAddrLine1)	newLic.setAddress1(lpAddrLine1);
		if (lpAddrLine2)	newLic.setAddress2(lpAddrLine2);
		if (lpAddrLine3)	newLic.setAddress3(lpAddrLine3);
		if (lpAddrCity)		newLic.setCity(lpAddrCity);
		if (lpAddrState)	newLic.setState(lpAddrState);
		if (lpAddrZip)		newLic.setZip(lpAddrZip);
		if (lpPhone1)		newLic.setPhone1(lpPhone1);
		if (lpPhone2)		newLic.setPhone2(lpPhone2);
		if (lpEmail)		newLic.setEMailAddress(lpEmail);
		if (lpFax)			newLic.setFax(lpFax);

		var s_Result = aa.licenseProfessional.createLicensedProfessional(newLic);
		// var s_Result = aa.licenseScript.createRefLicenseProf(newLic);
		if (s_Result.getSuccess()) {
			logDebug("Successfully added License Type: " + rlpType + ",  Nbr: " + rlpId);
			return true;
		} else {
			logDebug("**ERROR: can't added License Type: " + rlpType + ",  Nbr: " + rlpId + " Reason: " + s_Result.getErrorMessage());
			return false;
		}
	}
	return false;
}
