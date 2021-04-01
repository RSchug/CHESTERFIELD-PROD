try {
	//Add Planning/LandUse/RPAException/NA Fee
	if (publicUser && appMatch("Planning/LandUse/RPAException/NA")){
		addFee("RPAEXCEPTION","CC-PLANNING","FINAL",1,"N");
		addFee("RPAEXCEPTOTH","CC-PLANNING","FINAL",1,"N");
	}
	if (appMatch('Planning/*/*/*')) {
	//create parent relationships - any and all - firstParentName is 1st pageflow, secondParentName is in ASI
		if (AInfo["Inquiry Case Number"] != null) {
			var firstParentName = AInfo["Inquiry Case Number"];
			addParent(firstParentName);
		}
		else if (AInfo["Zoning Opinion Number"] != null) {
			var firstParentName = AInfo["Zoning Opinion Number"];
			addParent(firstParentName);
		}
		if (AInfo["Case Number"] != null) {
			var secondParentName = AInfo["Case Number"]
			addParent(secondParentName);
		}
		else if (AInfo["Historic Case Number"] != null) {
			var secondParentName = AInfo["Historic Case Number"]
			addParent(secondParentName);
		}
		else if (AInfo["Previous Case Number (if applicable)"] != null) {
			var secondParentName = AInfo["Previous Case Number (if applicable)"]
			addParent(secondParentName);
		}
		else if (AInfo["Previous case number"] != null) {
			var secondParentName = AInfo["Previous case number"]
			addParent(secondParentName);
		}
		else if (AInfo["Related case number"] != null) {
			var secondParentName = AInfo["Related case number"]
			addParent(secondParentName);
		}
		else if (AInfo["Related Case Number"] != null) {
			var secondParentName = AInfo["Related Case Number"]
			addParent(secondParentName);
		}
	}

	// auto-emails for Planning records only 18EMAIL
	if (appMatch('Planning/*/*/*')) {
		emailNewPLNapp();
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}

	
function emailNewPLNapp() {
    //showMessageDefault = showMessage;
    //populate email notification parameters
    var emailSendFrom = "";
    var emailSendTo = "";
    var emailCC = "";
    var emailParameters = aa.util.newHashtable();
    var fileNames = [];

    getRecordParams4Notification(emailParameters);
    //getAPOParams4Notification(emailParameters);
    //var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
    //acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));
    //getACARecordParam4Notification(emailParameters,acaSite);
    //addParameter(emailParameters, "$$acaRecordUrl$$", getACARecordURL(acaSite));
    addParameter(emailParameters, "$$RecStatus$$", capStatus);

    var applicantEmail = "";
	var applicantName = "";

	var contObj = {};
    contObj = getContactArray();
        for (co in contObj) {
            if (contObj[co]["email"] != null)
                applicantEmail += contObj[co]["email"] + ";";
				applicantName += contObj[co]["firstName"] + " " + contObj[co]["lastName"] + ",";
        }

    addParameter(emailParameters, "$$applicantEmail$$", applicantEmail);
	addParameter(emailParameters, "$$applicantName$$", applicantName);
	
    if ('Planning/LandUse/*/*') {
		var emailTemplate = "CTRCA_LANDUSE";
        sendNotification(emailSendFrom, emailSendTo, emailCC, emailTemplate, emailParameters, fileNames);
    }
	else if ('Planning/SitePlan/*/*' || 'Planning/Subdivision/*/*') {
		var emailTemplate = "CTRCA_SITESUBDIVISION";
        sendNotification(emailSendFrom, emailSendTo, emailCC, emailTemplate, emailParameters, fileNames);
    }
}

//showMessage = true;
//showDebug = 3;

//Add Standard Solution Includes 
// solutionInc = aa.bizDomain.getBizDomain("STANDARD_SOLUTIONS").getOutput().toArray(); 
// for (sol in solutionInc) { 
//       if (solutionInc[sol].getAuditStatus() != "I") eval(getScriptText(solutionInc[sol].getBizdomainValue(),null)); 
// }  
 
 //Add Configurable RuleSets 
    // configRules = aa.bizDomain.getBizDomain("CONFIGURABLE_RULESETS").getOutput().toArray(); 
    //for (rule in configRules) { 
       //if (configRules[rule].getAuditStatus() != "I") eval(getScriptText(configRules[rule].getBizdomainValue(),null)); 
// }
/*    
	var capContactArray = new Array();
    var cArray = new Array();
    if (!cap.isCompleteCap()) {
		if (cap.getApplicantModel()) {
			capContactArray[0] = cap.getApplicantModel();
		}
		if (cap.getContactsGroup().size() > 0) {
			var capContactAddArray = cap.getContactsGroup().toArray();
			for (ccaa in capContactAddArray)
				capContactArray.push(capContactAddArray[ccaa]);
		}
    } else {
		var capContactResult = aa.people.getCapContactByCapID(itemCap);
		if (capContactResult.getSuccess()) {
			var capContactArray = capContactResult.getOutput();
		}
    }
    if (capContactArray) {
		for (var yy in capContactArray) {
			if (!typesToLoad || exists(capContactArray[yy].getPeople().contactType, typesToLoad)) {
				cArray.push(new contactObj(capContactArray[yy]));
				applicantEmail += contactObj(capContactArray[yy])["email"] + ";";
				applicantName += contactObj(capContactArray[yy])["firstName"] + " " + contactObj(capContactArray[yy])["lastName"] + ",";
			}
		}
    } */