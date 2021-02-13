/*
*
* CRCA;BUILDING!PEMIT!~!RENEWAL.js
*
*/

// Get Parent License so we can update Status  
	if (appMatch('Building/*/Conveyance/Renewal')) {
		parentLicenseCAPID = getParentCapIDForReview(capId);
		comment('ParentLic CAPID = ' + parentLicenseCAPID);

		updateAppStatus('Active - Pending Renewal', 'Renewal Record Activated: ' + capIDString, parentLicenseCAPID);

                today = new Date(); comment("Today = " + today); 
                theMonth = today.getMonth(); comment("the month = " + theMonth);
                theYear = today.getFullYear(); comment("The Year = " + theYear);
                nextYear = theYear + 1; comment("Next Year = " + nextYear);
                if (matches(theMonth,"11")){ 
                     renewalYear = nextYear; 
                }
                else {
                     renewalYear = theYear;
                }

                parentLicenseCAPID = getParentCapIDForReview(capId); comment("ParentLic CAPID = " + parentLicenseCAPID);

                saveCap = cap
                cap = aa.cap.getCap(parentLicenseCAPID).getOutput();	
                pCapIdSplit = String(parentLicenseCAPID).split("-"); pCapIdObj = aa.cap.getCapID(pCapIdSplit[0],pCapIdSplit[1],pCapIdSplit[2]).getOutput(); pCapIDString = pCapIdObj.getCustomID();comment("ParentLic CAPID String= " + pCapIDString);
                stringYear = renewalYear.toString(); editIdString = pCapIDString.substr(0,14)+"R"+stringYear.substr(2,3); aa.cap.updateCapAltID(capId,editIdString);
	}







//Commented next lines out based on lines above.
logDebug("Building Permit Renewal begin.");
aa.cap.updateAccessByACA(capId, "Y");

aa.runScript("CONVERTTOREALCAPAFTER4RENEW");

logDebug("Building Permit Renewal end.");

email("khobday@truepointsolutions.com", "noreply@chesterfield.gov", "CTRCA testing Chesterfield", debug);