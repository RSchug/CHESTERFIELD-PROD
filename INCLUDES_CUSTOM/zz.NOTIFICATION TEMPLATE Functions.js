/*--------START NOTIFICATION TEMPLATE FUNCTIONS--------*/
function generateReportSavetoEDMS(reportName,parameters,rModule) 
{
	// Specific to MIS
	var itemCap = capId;
	var capIdStr = String(itemCap.getID1() + "-" + itemCap.getID2() + "-" + itemCap.getID3());
	// var capIdStr = "";
      
    report = aa.reportManager.getReportInfoModelByName(reportName);
    report = report.getOutput();
  
    report.setModule(rModule);
    report.setCapId(capIdStr);

	  // specific to MIS
      report.setReportParameters(parameters);
      var ed1 = report.getEDMSEntityIdModel();
      ed1.setCapId(capIdStr);
      // Needed to determine which record the document is attached
      ed1.setAltId(itemCap.getCustomID());
      // Needed to determine which record the document is attached
      report.setEDMSEntityIdModel(ed1);	

    var permit = aa.reportManager.hasPermission(reportName,currentUserID);

    if(permit.getOutput().booleanValue()) {
       var reportResult = aa.reportManager.getReportResult(report);
     
       if(reportResult) {
	       reportResult = reportResult.getOutput();
	       var reportFile = aa.reportManager.storeReportToDisk(reportResult);
			logMessage("Report Result: "+ reportResult);
	       reportFile = reportFile.getOutput();
	       return reportFile
       } else {
       		logMessage("Unable to run report: "+ reportName + " for Admin" + systemUserObj);
       		return false;
       }
    } else {
         logMessage("No permission to report: "+ reportName + " for Admin" + systemUserObj);
         return false;
    }
}

function getAARecordParam4Notification(params,avUrl) {
	// pass in a hashtable and it will add the additional parameters to the table

	addParameter(params, "$$aaRecordUrl$$", getAARecordUrl(avUrl));
	
	return params;	
}
//db Removed 05-2020 as these did not work - see getACARecordURL 
/*function getACADeepLinkParam4Notification(params,acaUrl,pAppType,pAppTypeAlias,module) {
	// pass in a hashtable and it will add the additional parameters to the table
	addParameter(params, "$$acaDeepLinkUrl$$", getDeepLinkUrl(acaUrl, pAppType, module));
	addParameter(params, "$$acaDeepLinkAppTypeAlias$$", pAppTypeAlias);
	return params;
}
function getDeepLinkUrl(acaUrl, appType, module) {
	var acaDeepLinkUrl = "";
	
	acaDeepLinkUrl = acaUrl + "/Cap/CapApplyDisclaimer.aspx?CAPType=";
	acaDeepLinkUrl += appType;
	acaDeepLinkUrl += "&Module=" + module;
	
	return acaDeepLinkUrl;
}*/
//The one in the INCLUDES_ACCELA_FUNCTIONS and directly above does not work as a deeplink - db 5-2020
function getACARecordURL(acaSite) {
		var acaRecordUrl = "";
		var id1 = capId.ID1;
		var id2 = capId.ID2;
		var id3 = capId.ID3;
		acaRecordUrl = acaSite + "/Cap/CapDetail.aspx?";   
		acaRecordUrl += "Module=" + cap.getCapModel().getModuleName() + "&TabName=" + cap.getCapModel().getModuleName();
		acaRecordUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
		acaRecordUrl += "&agencyCode=" + aa.getServiceProviderCode();
   	return acaRecordUrl; 
}

function getAPOParams4Notification(params) {
	// pass in a hashtable and it will add the additional parameters to the table
	//Get Address Line Param
    var addressLine = "";
	adResult = aa.address.getPrimaryAddressByCapID(capId,"Y");
	if (adResult.getSuccess()) {
		ad = adResult.getOutput().getAddressModel();
		addressLine = ad.getDisplayAddress();
		}
	addParameter(params, "$$addressLine$$", addressLine);
	//Get Parcel Number Param
	var parcelNumber = "";
	paResult = aa.parcel.getParcelandAttribute(capId,null);
	if (paResult.getSuccess()) {
		Parcels = paResult.getOutput().toArray();
		for (zz in Parcels) {
			if(Parcels[zz].getPrimaryParcelFlag() == "Y") {
				parcelNumber = Parcels[zz].getParcelNumber();
			}			
		}
	}
	addParameter(params,"$$parcelNumber$$",parcelNumber);
	//Get Owner Param
	capOwnerResult = aa.owner.getOwnerByCapId(capId);
	if (capOwnerResult.getSuccess()) {
		owner = capOwnerResult.getOutput();
		for (o in owner) {
			thisOwner = owner[o];
			if (thisOwner.getPrimaryOwner() == "Y") {
				addParameter(params, "$$ownerFullName$$", thisOwner.getOwnerFullName());
				addParameter(params, "$$ownerPhone$$", thisOwner.getPhone());
				break;	
			}
		}
	}
	return params;
}

function getAARecordUrl(avUrl) {	
	var aaRecordUrl = "";
	var id1 = capId.ID1;
 	var id2 = capId.ID2;
 	var id3 = capId.ID3;

   	aaRecordUrl = avUrl + "/portlets/cap/capsummary/CapTabSummary.do?mode=tabSummary";
	aaRecordUrl += "&serviceProviderCodee=" + aa.getServiceProviderCode();	
	aaRecordUrl += "&ID1=" + id1 + "&ID2=" + id2 + "&ID3=" + id3;
	aaRecordUrl += "&requireNotice=YES";
	aaRecordUrl += "&clearForm=clearForm";
	aaRecordUrl += "&module=" + cap.getCapModel().getModuleName();

   	return aaRecordUrl;
}

function addParameter(parameters, key, value)
{
	if(key != null)
	{
		if(value == null)
		{
			value = "";
		}
		parameters.put(key, value);
        aa.print(key + " = " + value);
	}
}

/*--------END NOTIFICATION TEMPLATE FUNCTIONS--------*/