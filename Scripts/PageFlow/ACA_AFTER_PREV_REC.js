/*------------------------------------------------------------------------------------------------------/
| Program : ACA_AFTER_PREV_REC.js
| Event   : 1st Pageflow
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   : D Boucher updated for Chesterfield
|
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var showMessage = false; // Set to true to see results in popup window
var showDebug = false; // Set to true to see debug messages in popup window
var showDebug = true; // Set to true to see debug messages in popup window
var debugEmailTo = "";
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var cancel = false;
var useCustomScriptFile = true; // if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
var scrubApplicant = false;
var scrubContacts = false;
var scrubLPs = true;

if (aa.env.getValue("ScriptName") == "Test") { 	// Setup parameters for Script Test.
    var CurrentUserID = "PUBLICUSER124450"; // Public User ID: rschug
    var CurrentUserID = "PUBLICUSER548433"; // Public User ID: rschug
    var capIDString = "20PR0128";			// Test Temp Record from ACA.
    var capIDString = "20TMP-000782";			// Test Temp Record from ACA.
    var capIDString = "20TMP-000805";			// Test Temp Record from ACA.
    aa.env.setValue("ScriptCode", "Test");
    aa.env.setValue("CurrentUserID", CurrentUserID); 	// Current User
    sca = capIDString.split("-");
    if (sca.length == 3 && sca[1] == "00000") { // Real capId
        var capID = aa.cap.getCapID(sca[0], sca[1], sca[2]).getOutput();
        aa.print("capID: " + capID + ", capIDString: " + sca.join("-") + " sca");
    } else { // Alt capId
        capID = aa.cap.getCapID(capIDString).getOutput();
        aa.print("capID: " + capID + ", capIDString: " + capIDString);
    }
    capModel = aa.cap.getCapViewBySingle4ACA(capID);
    aa.env.setValue("CapModel", capModel);
    aa.print("CurrentUserID:" + CurrentUserID);
    aa.print("capIDString:" + capIDString);
    aa.print("capID:" + capID);
    aa.print("capModel:" + capModel);
    aa.env.setValue("fromReviewPage", "N");
}

/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var vScriptName = aa.env.getValue("ScriptCode");
var vEventName = aa.env.getValue("EventName");
var startDate = new Date();
var startTime = startDate.getTime();
var message = ""; // Message String
if (typeof debug === 'undefined') {
    var debug = ""; // Debug String, do not re-define if calling multiple
}
var br = "<BR>"; // Break Tag
var feeSeqList = new Array(); // invoicing fee list
var paymentPeriodList = new Array(); // invoicing pay periods

var SCRIPT_VERSION = 9.0;
var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {
    useSA = true;
    SA = bzr.getOutput().getDescription();
    bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
    if (bzr.getSuccess()) {
        SAScript = bzr.getOutput().getDescription();
    }
}

var controlFlagStdChoice = "EMSE_EXECUTE_OPTIONS";
var doStdChoices = true; // compatibility default
var doScripts = false;
var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice).getOutput().size() > 0;
if (bzr) {
    var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "STD_CHOICE");
    doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";
    var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "SCRIPT");
    doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";
    var bvr3 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "USE_MASTER_INCLUDES");
    if (bvr3.getSuccess()) {
        if (bvr3.getOutput().getDescription() == "No")
            useCustomScriptFile = false
    };
}

if (SA) {
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA, useCustomScriptFile));
    eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA, useCustomScriptFile));
    eval(getScriptText(SAScript, SA));
} else {
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, useCustomScriptFile));
    eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null, useCustomScriptFile));
}

eval(getScriptText("INCLUDES_CUSTOM", null, useCustomScriptFile));

function getScriptText(vScriptName, servProvCode, useProductScripts) {
    if (!servProvCode)
        servProvCode = aa.getServiceProviderCode();
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try {
        if (useProductScripts) {
            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
        } else {
            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
        }
        return emseScript.getScriptText() + "";
    } catch (err) {
        return "";
    }
}

if (true) { // override logDebug
    function logDebug(dstr) {
        debug += dstr + br;
        aa.print(dstr);
    }
}
/*------------------------------------------------------------------------------------------------------/
| BEGIN Event Specific Variables
/------------------------------------------------------------------------------------------------------*/
//Log All Environmental Variables as  globals
var params = aa.env.getParamValues();
var keys = params.keys();
var key = null;
while (keys.hasMoreElements()) {
    key = keys.nextElement();
    eval("var " + key + " = aa.env.getValue(\"" + key + "\");");
    logDebug("Loaded Env Variable: " + key + " = " + aa.env.getValue(key));
}

var capModelInited = aa.env.getValue("CAP_MODEL_INITED");
var capModel = aa.env.getValue("CapModel");
if (capModel == "")
    capModel = null;
var currentUserID = aa.env.getValue("CurrentUserID"); // Current User
if (currentUserID == "")
    currentUserID = "ADMIN";
/*------------------------------------------------------------------------------------------------------/
| END Event Specific Variables
/------------------------------------------------------------------------------------------------------*/
var serverName = java.net.InetAddress.getLocalHost().getHostName(); // Host Name
// From INCLUDES_ACCELA_GLOBALS
var systemUserObj = null; // Current User Object
var currentUserGroup = null; // Current User Group
var publicUserID = null;
var publicUser = false;

if (currentUserID.indexOf("PUBLICUSER") == 0) {
    publicUserID = currentUserID;
    currentUserID = "ADMIN";
    publicUser = true;
}
// Get Public User Email Address
var publicUserEmail = "";
if (publicUserID) {
    var publicUserModelResult = aa.publicUser.getPublicUserByPUser(publicUserID);
    if (publicUserModelResult.getSuccess() || !publicUserModelResult.getOutput()) {
        publicUserEmail = publicUserModelResult.getOutput().getEmail();
        logDebug("publicUserEmail: " + publicUserEmail + " for " + publicUserID)
    } else {
        publicUserEmail = null;
        logDebug("publicUserEmail: " + publicUserEmail);
    }
}
if (publicUserEmail) {
    publicUserEmail = publicUserEmail.toLowerCase();
    // Fix turned off email address for development users.
    if (publicUserEmail.indexOf("@truepointsolutions.com") >= 0)
        publicUserEmail = publicUserEmail.replace("turned_off", "");
    if (exists(publicUserEmail, ["rschug@truepointsolutions.com"]))
        var showDebug = true; // Set to true to see debug messages in popup window
}

if (currentUserID != null) {
    systemUserObj = aa.person.getUser(currentUserID).getOutput(); // Current User Object
}
// User Email Addresses
var systemUserEmail = "";
if (systemUserObj != null) {
    systemUserEmail = systemUserObj.getEmail();
} else if (currentUserID != null) {
    systemUserObj = aa.person.getUser(currentUserID).getOutput(); // Current User Object
    if (systemUserObj != null) {
        systemUserEmail = systemUserObj.getEmail();
    } else {
        logDebug("User not found: " + currentUserID);
    }
}
if (systemUserEmail)
    systemUserEmail = systemUserEmail.toLowerCase();

var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "");
var servProvCode = aa.getServiceProviderCode();

logDebug("EMSE Script Framework Versions");
logDebug("EVENT TRIGGERED: " + vEventName);
logDebug("SCRIPT EXECUTED: " + vScriptName);
//logDebug("INCLUDE VERSION: " + INCLUDE_VERSION);
logDebug("SCRIPT VERSION : " + SCRIPT_VERSION);
logDebug("GLOBAL VERSION : " + GLOBAL_VERSION);
/*------------------------------------------------------------------------------------------------------*/

var cap = null,
    capId = null,
    appTypeResult = null,
    appTypeAlias = "",
    appTypeString = "",
    appTypeArray = new Array(),
    capName = null,
    capStatus = null,
    fileDateObj = null,
    fileDate = null,
    fileDateYYYYMMDD = null,
    AInfo = new Array(),
    parentCapId = null;

errorMessage = "",
    errorCode = "0";

//var currentUserID = aa.env.getValue("CurrentUserID");
//if (currentUserID.indexOf("PUBLICUSER") == 0) { currentUserID = "ADMIN" ; publicUser = true }  // ignore public users

if (capModel != null) {
    cap = capModel;
    capId = capModel.getCapID();
    capIDString = capId.getCustomID();
    appTypeResult = capModel.getCapType();
    appTypeAlias = appTypeResult.getAlias();
    appTypeString = appTypeResult.toString();
    appTypeArray = appTypeString.split("/");

    loadAppSpecific4ACA(AInfo);

    parentCapIdString = "" + cap.getParentCapID();
    if (parentCapIdString) {
        pca = parentCapIdString.split("-");
        parentCapId = aa.cap.getCapID(pca[0], pca[1], pca[2]).getOutput();
    }
    if (parentCapId) {
        parentCap = aa.cap.getCapViewBySingle4ACA(parentCapId);
    }
    logDebug("<B>EMSE Script Results for " + capIDString + "</B>");
    logDebug("capId = " + capId.getClass());
    logDebug("cap = " + cap.getClass());
    logDebug("currentUserID = " + currentUserID + ", email: " + systemUserEmail);
    logDebug("currentUserGroup = " + currentUserGroup);
    logDebug("systemUserObj = " + systemUserObj.getClass());
    if (publicUser && publicUserID)
        logDebug("publicUser = " + publicUserID + ", email: " + publicUserEmail)
    logDebug("appTypeString = " + appTypeString);
    logDebug("appTypeAlias = " + appTypeAlias);
    logDebug("capName = " + capName);
    logDebug("capStatus = " + capStatus);
    logDebug("fileDate = " + fileDate);
    logDebug("fileDateYYYYMMDD = " + fileDateYYYYMMDD);
    logDebug("sysDate = " + sysDate.getClass());
    logDebug("parcelArea = " + parcelArea);
    logDebug("estValue = " + estValue);
    logDebug("calcValue = " + calcValue);
    logDebug("feeFactor = " + feeFactor);
    logDebug("houseCount = " + houseCount);
    logDebug("feesInvoicedTotal = " + feesInvoicedTotal);
    logDebug("balanceDue = " + balanceDue);
    if (parentCapId)
        logDebug("parentCapId = " + parentCapId.getCustomID());

    //logGlobals(AInfo);
}
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
// page flow custom code begin
try {
    showMessage = false; showDebug = false;
    amendCapModel = null;
	if (capModel && capModelInited != "TRUE" && fromReviewPage != "Y") {
		loadAppSpecific4ACA(AInfo);

		//logDebug("===== capModel (Before) =====");
		//logCapModel(capModel);
		logDebug("load capModel from cap: " + capId.getCustomID());
		capSections = ["AppName", "ASI", "ASIT", "Contacts", "LPs", "Additional Info"]; //"Addresses", "Parcels", "Owners", "Conditions", "Education", "Continuing Education", "Examination"] removed these based on business request 02-2021
		capSections = ["AppName", "ASIT", "Contacts"];
		var capSections = null;
		loadCapModel(capId);
		aa.env.setValue("CAP_MODEL_INITED", "TRUE");

		if (amendCapModel) { // Use amendCapModel
			// Restore original values
			var svFieldNames = ["Is there a Previous Inquiry Case?", "Inquiry Case Number","Zoning Opinion Number","Related Case Number"]
			for (var ff in svFieldNames) {
				var svFieldName = svFieldNames[ff];
				logDebug("restoring " + svFieldName + ": " + AInfo[svFieldName]);
				_editAppSpecific4ACA(svFieldName, AInfo[svFieldName], amendCapModel);
			}

			aa.env.setValue("CapModel", amendCapModel);
			aa.env.setValue("CAP_MODEL_INITED", "TRUE");
			logDebug("===== amendCapModel ===== ");
			logDebug("amendCapModel.parentCapID: " + (amendCapModel.parentCapID ? amendCapModel.parentCapID.getCustomID() : amendCapModel.parentCapID));
		} else {
			amendCapModel = capModel
			aa.env.setValue("CapModel", capModel);
			logDebug("===== capModel (After) =====");
			logDebug("capModel.parentCapID: " + (capModel.parentCapID ? capModel.parentCapID.getCustomID() : capModel.parentCapID));
		}
		logCapModel(amendCapModel, capSections);
	}

} catch (err) {
    handleError(err, "Page Flow Script: " + vScriptName);
}
// page flow custom code end

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

if (debug.indexOf("**ERROR") > 0) {
    aa.env.setValue("ErrorCode", "1");
    aa.env.setValue("ErrorMessage", debug);
} else if (cancel) {
    aa.env.setValue("ErrorCode", "-2");
    if (showMessage)
        aa.env.setValue("ErrorMessage", message);
    if (showDebug)
        aa.env.setValue("ErrorMessage", debug);
} else {
    aa.env.setValue("ErrorCode", "0");
    if (showMessage)
        aa.env.setValue("ErrorMessage", message);
    if (showDebug)
        aa.env.setValue("ErrorMessage", debug);
}

// Send Debug Email
debugEmailSubject = "";
debugEmailSubject += (capIDString ? capIDString + " " : "") + vScriptName + " - Debug";
// Override debugEmailTo for specific Public Users based on email address.
if (exists(publicUserEmail, ["dboucher@truepointsolutions.com", "bushatos@hotmail.com"]))
    debugEmailTo = "dboucher@truepointsolutions.com";
else if (publicUserEmail.indexOf("@truepointsolutions.com") >= 0)
    debugEmailTo = publicUserEmail.replace("turned_off", "");
logDebug("debugEmailTo: " + debugEmailTo)
if (debugEmailTo && debugEmailTo != "")
    aa.sendMail("noreply@chesterfield.gov", debugEmailTo, "", debugEmailSubject, "Debug: " + br + debug);

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function loadCapModel(targetCapId) {
    //----------------------------------------
    if (targetCapId == null) {
        logError("targetCapId is null.");
        end();
        return;
    }
    logDebug("loadCapModel from CapId:" + targetCapId + (targetCapId && targetCapId.getCustomID ? " " + targetCapId.getCustomID() : ""));

    // Get Previous record info to copy to application online

	var parentCapIdField = "";
	parentCapIdString = null;
	parentCapId = null;
	if (appMatch_local("*/LandUse/*/*", targetCapId)) {
		parentCapIdField = "Zoning Opinion Number";
	} else if (appMatch_local("*/SitePlan/*/*", targetCapId)) {
		if (AInfo["Case Number"] != null) {
			parentCapIdField = "Case Number";
		} else if (AInfo["Inquiry Case Number"] != null) {
			parentCapIdField = "Inquiry Case Number";
		} else if (AInfo["Related Case Number"] != null) {
			parentCapIdField = "Related Case Number";
		}
	} else if (appMatch_local("*/Subdivision/*/*", targetCapId)) {
		if (AInfo["Inquiry Case Number"] != null) {
			parentCapIdField = "Inquiry Case Number";
		} else if (AInfo["Related Case Number"] != null) {
			parentCapIdField = "Related Case Number";
		}
	} else {
	showMessage = true;
	comment('Not valid Record Type at intake.');
	//cancel = true;
	}
		// logGlobals(AInfo);
		parentCapIdString = AInfo[parentCapIdField];
		logDebug("parentCapId (" + parentCapIdField + "): " + parentCapIdString);

		if (parentCapIdString != null) {
			var s_result = aa.cap.getCapID(parentCapIdString);
			if (s_result.getSuccess()) 
				parentCapId = s_result.getOutput(); // Cap ID entered as future parent
			else {
				logDebug("ERROR: getting parentCapId: " + parentCapIdString + " " + s_result.getErrorMessage());
				parentCapId = null;
			}
		}
		if (parentCapId && parentCapIdField != "") { // Set parentCapId
			addParent(parentCapId);
			capModel.setParentCapID(parentCapId);
			logDebug("capModel.setParentCapID(" + capModel.getParentCapID() + "):");
		}
		if (!parentCapId) {
			parentCapId = capModel.getParentCapID();
			if (parentCapId)
				parentCapIdString = parentCapId.getCustomID();
		}
		logDebug("parentCapId (" + parentCapIdField + "): " + parentCapIdString + " " + parentCapId);

		var srcCapId = parentCapId, srcCapMsg = "Parent";
		if (arguments.length > 1 && arguments[1]) {
			srcCapId = arguments[1];
			srcCapMsg = "Source";
		}
		logDebug("srcCapId: " + (srcCapId && srcCapId.getCustomID ? srcCapId.getCustomID() : srcCapId) + " " + srcCapMsg);
		if (srcCapId == null) {
			logError("Not actually an Error, just advising that " + srcCapMsg + "is not a valid record, so you will need to fill the application completely");
			//end();
			//return;
		}
		
    try {
		if (srcCapId != null) {
			if (capSections == null)
				capSections = ["AppName", "CapWorkDes", "ASI", "ASIT", "Contacts", "LPs", "Additional Info"]; //"Addresses", "Parcels", "Owners", "Conditions", "Education", "Continuing Education", "Examination" ] removed 02-2021 based on business request

			logDebug("===== copying ===== from "
				+ (srcCapId && srcCapId.getCustomID ? srcCapId.getCustomID() : srcCapId) + " to "
				+ (targetCapId && targetCapId.getCustomID ? targetCapId.getCustomID() : targetCapId)
				+ ", sections: " + capSections.join(","));
			//2. Remove license professionals were sequence #, type or number matches what was given.
			//copy License information
			if (exists("LPs", capSections)) {
				removeLicenseProfessionals(targetCapId);
				copyLicenseProfessional(srcCapId, targetCapId);
			}
			//copy Cap Detail Info
			if (exists("CapDetail", capSections)) {
				copyCapDetailInfo(srcCapId, targetCapId);
			}
			//copy App Name (Project Name)
			if (exists("AppName", capSections)) {
				copyApplicationName(srcCapId, targetCapId);
		   }
			//copy Cap Detail Info
			if (exists("CapWorkDes", capSections)) {
				copyCapWorkDesInfo(srcCapId, targetCapId);
			}
			//copy ASI information
			if (exists("ASI", capSections)) {
				copyAppSpecificInfo(srcCapId, targetCapId);
			}
			//copy AST information
			if (exists("ASIT", capSections))
				// remove ASIT
				copyAppSpecificTable(srcCapId, targetCapId);
			//copy Address information
			if (exists("Addresses", capSections))
				copyAddress(srcCapId, targetCapId);
			//copy Parcel information
			if (exists("Parcels", capSections))
				copyParcel(srcCapId, targetCapId);
			//copy Owner information
			if (exists("Owners", capSections))
				copyOwner(srcCapId, targetCapId);
			//copy People information
			if (exists("Contacts", capSections))
				copyPeople(srcCapId, targetCapId);
			//Copy CAP condition information
			if (exists("Conditions", capSections))
				copyCapCondition(srcCapId, targetCapId);
			//Copy additional info.
			if (exists("Additional Info", capSections))
				copyAdditionalInfo(srcCapId, targetCapId);
			//Copy Education information.
			if (exists("Education", capSections))
				copyEducation(srcCapId, targetCapId);
			//Copy Continuing Education information.
			if (exists("Continuing Education", capSections))
				copyContEducation(srcCapId, targetCapId);
			//Copy Examination information.
			if (exists("Examination", capSections))
				copyExamination(srcCapId, targetCapId);

			amendCapModel = aa.cap.getCapViewBySingle4ACA(targetCapId);
			logDebug("amendCapModel.getCapType().getSpecInfoCode(): " + amendCapModel.getCapType().getSpecInfoCode());
			amendCapModel.getCapType().setSpecInfoCode(capModel.getCapType().getSpecInfoCode());
			amendCapModel.setAppSpecificInfoGroups(capModel.getAppSpecificInfoGroups());
			if (parentCapId && !amendCapModel.getParentCapID())
				amendCapModel.setParentCapID(parentCapId);

			//fix ASI information
			if (exists("ASI", capSections)) {
				srcCapModel = aa.cap.getCapViewBySingle4ACA(srcCapId);
				_copyAppSpecific4ACA(srcCapModel, amendCapModel);
			}

			// Fix Component Info for Contacts & Applicant
			// Get the non-Applicant contacts
			logDebug("Scrub component information for Contacts");
			contactList = amendCapModel.getContactsGroup();
			if (contactList && scrubContacts) {
				for (i = 0; i < contactList.size(); i++) {
					var capContactModel = contactList.get(i);
					// Scrub Contact List Sequence Number.
					capContactModel.setCapID(targetCapId);
					var peopleModel = capContactModel.getPeople();
					// Remove contact seq number, this is only for parent cap.
					peopleModel.setContactSeqNumber(null);
					// Update the Label Information for Contact Attributes
					peopleModel.setAttributes(updateContactAttributeFieldLabel(peopleModel.getContactType(), peopleModel.getAttributes()));
					capContactModel.setPeople(peopleModel);
					// Set Component Name based on Contact Type
					var contactType = capContactModel.getContactType();
					var contactTypeComponents = {
						"Applicant": "Applicant",
						"Site Contact": "Contact1",
						"Business": "Contact2"
					};
					//if (typeof(contactTypeComponents[contactType]) != "undefined") capContactModel.setComponentName(contactTypeComponents[contactType]);
					capContactModel.setComponentName(null); // Fix from CRC for contacts not displaying in ACA
					contactList.set(i, capContactModel);
					logDebug("Scrubed contactsGroup[" + i + "]: " + +capContactModel.getCapID() + " " + capContactModel.contactSeqNumber + ", type: " + capContactModel.contactType + ", name: " + capContactModel.contactName + ", component: " + capContactModel.componentName);
				}
			}
			amendCapModel.setContactsGroup(contactList);

			// Scrub the applicant
			logDebug("Scrub component information for Applicant");
			applicantModel = amendCapModel.getApplicantModel();
			if (applicantModel && scrubApplicant) {
				applicantModel.setCapID(targetCapId);
				applicantModel.getPeople().setContactSeqNumber(null);
				//applicantModel.setComponentName("Applicant");
				applicantModel.setComponentName(null); // Fix from CRC for contacts not displaying in ACA
				amendCapModel.setApplicantModel(applicantModel);
				logDebug("Scrubed applicantModel: " + applicantModel.getPeople().getContactSeqNumber() + ", type: " + applicantModel.contactType + ", name: " + applicantModel.contactName + ", component: " + applicantModel.componentName);
			}

			// Display LPs
			logDebug("Scrub component information for License Professionals")
			logDebug("amendCapModel.getLicenseProfessionalList().isEmpty(): " + (amendCapModel.getLicenseProfessionalList() ? ".isEmpty(): " + amendCapModel.getLicenseProfessionalList().isEmpty() : ": " + amendCapModel.getLicenseProfessionalList()));
			var capLicenses = null;
			if (amendCapModel.getLicenseProfessionalList())
				capLicenses = amendCapModel.getLicenseProfessionalList().toArray();
			if (capLicenses && scrubLPs) {
				for (i in capLicenses) {
					capLicProfModel = capLicenses[i];
					if (capLicProfModel.getResLicenseType() == null)
						capLicProfModel.setResLicenseType(capLicProfModel.getLicenseType()); // 02/14/2019 RS - 91468 Fix Missing License Type
					//capLicProfModel.setComponentName("Licensed Professional");
					//capLicProfModel.setComponentName("License");
					//capLicProfModel.setComponentName("License_697");
					capLicProfModel.setComponentName(null); // Fix for LP not displaying in ACA

					logDebug("Scrubed Licensed Professional[" + i + "]: " +
						(capLicProfModel.getPrintFlag() == "Y" ? "Primary" : "") + " " + capLicProfModel.getAuditStatus() +
						" License: #" + capLicProfModel.getLicSeqNbr() + " " + capLicProfModel.getLicenseType() + " " + capLicProfModel.getLicenseNbr() +
						(capLicProfModel.getBusinessName() ? ", Business: " + capLicProfModel.getBusinessName() : "") +
						(capLicProfModel.getFullName() ? ", Name: " + capLicProfModel.getFullName() : "") +
						(capLicProfModel.getLicenseBoard() ? " " + capLicProfModel.getLicenseBoard() : "") + ", component: " + capLicProfModel.getComponentName());
					//logDebug("capLicProfModel[" + i + "]: " + capLicProfModel + br + describe_TPS(capLicProfModel, "function", /(^get.*$)/, true));
				}
			}
		}
    } catch (e) {
        logDebug("Error " + e.message + " at " + e.lineNumber + "Stack: " + e.stack);
        logError("Error: " + e);
        end();
    }
}

function logCapModel() {
    var pCapModel = (arguments.length > 0 && arguments[0] ? arguments[0] : cap);
    var capSections = (arguments.length > 1 && arguments[1] ? arguments[1] : null);
    logDebug("pCapModel.getCapID(): " + pCapModel.getCapID() + " " + pCapModel.getCapID().getCustomID());
    logDebug("pCapModel.getParentCapID(): " + pCapModel.getParentCapID() + (pCapModel.getParentCapID() ? " " + pCapModel.getParentCapID().getCustomID() : ""));
    logDebug("pCapModel.getCapType().getSpecInfoCode(): " + pCapModel.getCapType().getSpecInfoCode());
    //logDebug("pCapModel: " + pCapModel + br + describe_TPS(pCapModel, null, null, true));

    // Display ASI
    // if (capSections == null || exists("ASI", capSections)) logCapModelASI(pCapModel);
    if (capSections == null || exists("ASI", capSections)) {
        capModel_AInfo = [];
        loadAppSpecific4CapModel(capModel_AInfo, pCapModel);
        logGlobals(capModel_AInfo);
    }

    // Display ASIT
    if (capSections == null || exists("ASIT", capSections)) logCapModelASIT(pCapModel);

    // Display non-Applicant contacts
    if (capSections == null || exists("Contacts", capSections)) {
        contactList = pCapModel.getContactsGroup();
        if (contactList) {
            for (var i = 0; i < contactList.size(); i++) {
                var capContactModel = contactList.get(i);
                logDebug("contactsGroup[" + i + "]: " + capContactModel.getCapID() + " " + capContactModel.contactSeqNumber + ", type: " + capContactModel.contactType +
                    ", name: " + capContactModel.contactName + ", component: " + capContactModel.componentName);
            }
        }
    }

    // Display applicant
    if (capSections == null || exists("Applicant", capSections)) {
        applicantModel = pCapModel.getApplicantModel();
        if (applicantModel) {
            logDebug("applicantModel: " + applicantModel.getPeople().getContactSeqNumber() + ", type: " + applicantModel.contactType +
                ", name: " + applicantModel.contactName + ", component: " + applicantModel.componentName);
        }
    }

    // Display LPs
    if (capSections == null || exists("LPs", capSections)) {
        var capLicenses = []
        if (pCapModel.getLicenseProfessionalList())
            capLicenses = pCapModel.getLicenseProfessionalList().toArray();
        for (loopk in capLicenses) {
            capLicProfModel = capLicenses[loopk];
            logDebug("capLicProfModel[" + loopk + "]: " + (capLicProfModel.getPrintFlag() == "Y" ? "Primary" : "") + " " + capLicProfModel.getAuditStatus() +
                " License: #" + capLicProfModel.getLicSeqNbr() + " " + capLicProfModel.getLicenseType() + " " + capLicProfModel.getLicenseNbr() +
                (capLicProfModel.getBusinessName() ? ", Business: " + capLicProfModel.getBusinessName() : "") +
                (capLicProfModel.getFullName() ? ", Name: " + capLicProfModel.getFullName() : "") +
                (capLicProfModel.getLicenseBoard() ? " " + capLicProfModel.getLicenseBoard() : "") +
                ", component: " + capLicProfModel.getComponentName());
            //logDebug("capLicProfModel[" + loopk + "]: " + br + describe_TPS(capLicProfModel, null, null, true));
        }
    }
}

function logCapModelASI() {
    var pCapModel = (arguments.length > 0 && arguments[0] ? arguments[0] : cap);
    var capASI = pCapModel.getAppSpecificInfoGroups();
    if (!capASI) { logDebug("No ASI for the CapModel"); return; }
    var i = capASI.iterator();
    while (i.hasNext()) {
        var group = i.next();
        var fields = group.getFields();
        if (fields != null) {
            var iteFields = fields.iterator();
            while (iteFields.hasNext()) {
                var field = iteFields.next();
                logDebug(field.getCheckboxType() + "." + field.getCheckboxDesc() + ": " + field.getChecklistComment());
            }
        }
    }
}

function logCapModelASIT() {
    var pCapModel = (arguments.length > 0 && arguments[0] ? arguments[0] : cap);
    var gm = pCapModel.getAppSpecificTableGroupModel();
    if (!gm) { logDebug("No ASIT for the CapModel"); return; }
    for (var ta = gm.getTablesMap(), tai = ta.values().iterator(); tai.hasNext();) {
        var tsm = tai.next();
        if (!tsm.rowIndex.isEmpty()) {
            var tempObject = new Array,
                tempArray = new Array,
                tn = tsm.getTableName();
            //tn = String(tn).replace(/[^a-zA-Z0-9]+/g, ""),
            //    isNaN(tn.substring(0, 1)) || (tn = "TBL" + tn);
            for (var tsmfldi = tsm.getTableField().iterator(), tsmcoli = tsm.getColumns().iterator(), numrows = 1; tsmfldi.hasNext();) {
                if (!tsmcoli.hasNext()) {
                    var tsmcoli = tsm.getColumns().iterator();
                    logDebug(tn + "[" + numrows + "] " + tempArray.join("; "));
                    var tempArray = new Array;
                    numrows++;
                }

                var tcol = tsmcoli.next();
                var tobj = tsmfldi.next();
                var tval = "";
                try {
                    tval = tobj.getInputValue();
                } catch (ex) {
                    tval = tobj;
                }
                tempArray.push(tcol.getColumnName() + ": " + tval);
            }
            logDebug(tn + "[" + numrows + "] " + tempArray.join("; "));
        }
    }
}

function _logGlobals(globArray) {

    for (loopGlob in globArray)
        logDebug("{" + loopGlob + "} = " + globArray[loopGlob])
}

function loadAppSpecific4CapModel(thisArr) {
    // Returns an associative array of App Specific Info
    // Optional second parameter, capModel to load from
    var itemCap = capId;
    var pCapModel = (arguments.length > 1 && arguments[1] ? arguments[1] : cap);
    logDebug("loadAppSpecific4CapModel from " + (pCapModel ? pCapModel.getAltID() : pCapModel));
    var capASI = pCapModel.getAppSpecificInfoGroups();
    if (!capASI) {
        logDebug("No ASI for the CapModel");
    } else {
        var i = capASI.iterator();
        while (i.hasNext()) {
            var group = i.next();
            var fields = group.getFields();
            if (fields != null) {
                var iteFields = fields.iterator();
                while (iteFields.hasNext()) {
                    var field = iteFields.next();
                    if (field.getChecklistComment())
                        logDebug(field.getCheckboxDesc() + ": " + field.getChecklistComment());
                    if (useAppSpecificGroupName)
                        thisArr[field.getCheckboxType() + "." + field.getCheckboxDesc()] = field.getChecklistComment();
                    else
                        thisArr[field.getCheckboxDesc()] = field.getChecklistComment();
                }
            }
        }
    }
}

function updateContactAttributeFieldLabel(contactType, peopleAttributes) {
    //Fixes copied contact field lables in ACA
    if (peopleAttributes == null ||
        peopleAttributes.size() == 0 ||
        contactType == null ||
        contactType == "") {

        return null;
    }

    var ejbContactAttr = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.ContactAttributeBusiness").getOutput();

    // Paramter 1: Agency Code
    // Paramter 2: Contact Type
    // Paramter 3: Status
    // Paramter 4: Caller ID
    var contactAttributes = ejbContactAttr.getContactAttrFromRContact(servProvCode, contactType, "A", "ADMIN");

    if (contactAttributes != null && contactAttributes.size() > 0) {

        var resultAttributes = aa.util.newArrayList()

        var peopleAttrList = peopleAttributes.toArray();
        var contactAttrList = contactAttributes.toArray();

        for (xx in peopleAttrList) {

            for (yy in contactAttrList) {

                if (peopleAttrList[xx].getServiceProviderCode().toLowerCase().equals(contactAttrList[yy].getServiceProviderCode().toLowerCase()) &&
                    peopleAttrList[xx].getContactType().toLowerCase().equals(contactAttrList[yy].getContactType().toLowerCase()) &&
                    peopleAttrList[xx].getAttributeName().toLowerCase().equals(contactAttrList[yy].getAttributeName().toLowerCase())) {
                    //logDebug("Updated to: " + contactAttrList[yy].getAttributeLabel());
                    peopleAttrList[xx].setAttributeLabel(contactAttrList[yy].getAttributeLabel());
                    break;
                }
            }

            resultAttributes.add(peopleAttrList[xx]);
        }
    }

    return resultAttributes;
}

function appMatch_local(ats) // optional capId or CapID string
{ // Modified from INCLUDES_ACCELA_FUNCTIONS
    //	if optional capId is null then use appTypeArray.
    //	Allow for capID to be passed as java.lang.String class.
    var matchArray = appTypeArray //default to current app
    if (arguments.length > 1 && arguments[1]) {
        matchCapParm = arguments[1];
        if (typeof (matchCapParm) == "string" || matchCapParm.getClass() == "class java.lang.String")
            matchCapId = aa.cap.getCapID(matchCapParm).getOutput(); // Cap ID to check
        else
            matchCapId = matchCapParm;
        if (!matchCapId) {
            logDebug("**WARNING: CapId passed to appMatch was not valid: " + arguments[1]);
            return false
        }
        matchCap = aa.cap.getCap(matchCapId).getOutput();
        matchArray = matchCap.getCapType().toString().split("/");
    }

    var isMatch = true;
    var ata = ats.split("/");
    if (ata.length != 4)
        logDebug("**ERROR in appMatch.  The following Application Type String is incorrectly formatted: " + ats);
    else
        for (xx in ata)
            if (!ata[xx].toUpperCase().equals(matchArray[xx].toUpperCase()) && !ata[xx].equals("*"))
                isMatch = false;
    return isMatch;
}

function logError(error) {
    aa.print(error);
    errorMessage += error + br;
    errorCode = -1;
}

function end() {
    aa.env.setValue("ErrorCode", errorCode);
    aa.env.setValue("ErrorMessage", errorMessage);
}

function getParent(targetCapId) {
    // returns the capId object of the parent.  Assumes only one parent!
    //
    var getCapResult = aa.cap.getProjectParents(targetCapId, 1);
    if (getCapResult.getSuccess()) {
        var parentArray = getCapResult.getOutput();
        if (parentArray.length)
            return parentArray[0].getCapID();
        else {
            logDebug("**WARNING: GetParent found no project parent for this application");
            return false;
        }
    } else {
        logDebug("**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
        return false;
    }
}

function matches(eVal, argList) {
    for (var i = 1; i < arguments.length; i++)
        if (arguments[i] == eVal)
            return true;
}

//
// Functions from ConvertToRealCapAfter4Renew
//
function copyEducation(srcCapId, targetCapId) {
    if (srcCapId != null && targetCapId != null) {
        aa.education.copyEducationList(srcCapId, targetCapId);
        logDebug("copying Education: "
            + (srcCapId && srcCapId.getCustomID ? srcCapId.getCustomID() : srcCapId) + " to "
            + (targetCapId && targetCapId.getCustomID ? targetCapId.getCustomID() : targetCapId));
    }
}

function copyContEducation(srcCapId, targetCapId) {
    if (srcCapId != null && targetCapId != null) {
        aa.continuingEducation.copyContEducationList(srcCapId, targetCapId);
        logDebug("copying continuing education: "
            + (srcCapId && srcCapId.getCustomID ? srcCapId.getCustomID() : srcCapId) + " to "
            + (targetCapId && targetCapId.getCustomID ? targetCapId.getCustomID() : targetCapId));
    }
}

function copyExamination(srcCapId, targetCapId) {
    if (srcCapId != null && targetCapId != null) {
        aa.examination.copyExaminationList(srcCapId, targetCapId);
        logDebug("copying Examination: "
            + (srcCapId && srcCapId.getCustomID ? srcCapId.getCustomID() : srcCapId) + " to "
            + (targetCapId && targetCapId.getCustomID ? targetCapId.getCustomID() : targetCapId));
    }
}

function copyApplicationName(srcCapId, targetCapId) {
    logDebug("copying AppName: "
        + (srcCapId && srcCapId.getCustomID ? srcCapId.getCustomID() : srcCapId) + " to "
        + (targetCapId && targetCapId.getCustomID ? targetCapId.getCustomID() : targetCapId));
    //1. Get CapModel with source CAPID.
    var srcCapModel = getCapModel(srcCapId, true);
    if (srcCapModel == null) {
        return;
    }
    //2. Get CapModel with target CAPID.
    var targetCapModel = getCapModel(targetCapId, true);
    if (targetCapModel == null) {
        return;
    }
    //3. Copy application name from source to target.
    var srcCapName = srcCapModel.getSpecialText();
    targetCapModel.setSpecialText(srcCapName);
    aa.cap.editCapByPK(targetCapModel);
}

function copyCapDetailInfo(srcCapId, targetCapId) { // not seeing this work - db03-2021
    if (srcCapId != null && targetCapId != null) {
        aa.cap.copyCapDetailInfo(srcCapId, targetCapId);
        logDebug("copying CapDetail: "
            + (srcCapId && srcCapId.getCustomID ? srcCapId.getCustomID() : srcCapId) + " to "
            + (targetCapId && targetCapId.getCustomID ? targetCapId.getCustomID() : targetCapId));
    }
}

function copyCapWorkDesInfo(srcCapId, targetCapId) {
    if (srcCapId != null && targetCapId != null) {
        aa.cap.copyCapWorkDesInfo(srcCapId, targetCapId);

	//db added for planning 03-2021
		//get the source record Assigned to User
		capDetail = aa.cap.getCapDetail(srcCapId).getOutput();
		userObj = aa.person.getUser(capDetail.getAsgnStaff());
		if (userObj.getSuccess()) {
			staff = userObj.getOutput();
			userID = staff.getUserID();
			logDebug("userID: " + userID);
		}
		//set the target record to the assigned to
		var cdScriptObjResult = aa.cap.getCapDetail(targetCapId);
		if (!cdScriptObjResult.getSuccess())
			{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }
		var cdScriptObj = cdScriptObjResult.getOutput();
		if (!cdScriptObj)
			{ logDebug("**ERROR: No cap detail script object") ; return false; }
		cd = cdScriptObj.getCapDetailModel();
		iNameResult  = aa.person.getUser(userID);
		if (!iNameResult.getSuccess())
			{ logDebug("**ERROR retrieving user model " + userID + " : " + iNameResult.getErrorMessage()) ; return false ; }
		iName = iNameResult.getOutput();
		cd.setAsgnDept(iName.getDeptOfUser());
		cd.setAsgnStaff(userID);
		cdWrite = aa.cap.editCapDetail(cd)
		if (cdWrite.getSuccess())
			{ logDebug("Assigned CAP to " + userID) }
		else
			{ logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage()) ; return false ; }
			
			logDebug("copying Work Desc: "
				+ (srcCapId && srcCapId.getCustomID ? srcCapId.getCustomID() : srcCapId) + " to "
				+ (targetCapId && targetCapId.getCustomID ? targetCapId.getCustomID() : targetCapId));
    }
}

function copyAppSpecificInfo(srcCapId, targetCapId) {
    //1. Get Application Specific Information with source CAPID.
    var appSpecificInfo = getAppSpecificInfo(srcCapId);
    //if (appSpecificInfo == null || appSpecificInfo.length == 0) {
    //    return;   }
    for (loopk in appSpecificInfo) {
        var srcFieldModel = appSpecificInfo[loopk];
        if (srcFieldModel.getChecklistComment())
            logDebug("copying ASI " // + srcFieldModel
                + (useAppSpecificGroupName ? srcFieldModel.getCheckboxType() + "." : "")
                + srcFieldModel.getCheckboxDesc() + ": "
                + srcFieldModel.getChecklistComment()
                + (srcFieldModel.getFieldLabel() && srcFieldModel.getCheckboxDesc() != srcFieldModel.getFieldLabel() ? ", Label: " + srcFieldModel.getFieldLabel() : "")
                + (srcFieldModel.getAlternativeLabel() ? ", Alt Label: " + srcFieldModel.getAlternativeLabel() : "")
                + (srcFieldModel.getLabelAlias() ? ", LabelAlias: " + srcFieldModel.getLabelAlias() : "")
                + (loopk == -1 ? br + describe_TPS(srcFieldModel) : ""));
        //2. Set target CAPID to source Specific Information.
        //srcFieldModel.setPermitID1(targetCapId.getID1());
        //srcFieldModel.setPermitID2(targetCapId.getID2());
        //srcFieldModel.setPermitID3(targetCapId.getID3());
        //3. Edit ASI on target CAP (Copy info from source to target)
        //aa.appSpecificInfo.editAppSpecInfoValue(srcFieldModel);
        var fieldName = (useAppSpecificGroupName ? srcFieldModel.getCheckboxType() + "." : "")
            + srcFieldModel.getCheckboxDesc();
        var fieldValue = srcFieldModel.getChecklistComment();
        editAppSpecific(fieldName, fieldValue, targetCapId);
    }
}

function getAppSpecificInfo(capId) {
    capAppSpecificInfo = null;
    var s_result = aa.appSpecificInfo.getByCapID(capId);
    if (s_result.getSuccess()) {
        capAppSpecificInfo = s_result.getOutput();
        if (capAppSpecificInfo == null || capAppSpecificInfo.length == 0) {
            logDebug("WARNING: no appSpecificInfo on this CAP:"
                + (capId && capId.getCustomID ? capId.getCustomID() : capId));
            capAppSpecificInfo = null;
        }
    } else {
        logDebug("ERROR: Failed to appSpecificInfo: " + s_result.getErrorMessage());
        capAppSpecificInfo = null;
    }
    // Return AppSpecificInfoModel[]
    return capAppSpecificInfo;
}

function copyLicenseProfessional(srcCapId, targetCapId) {
    // Modified to include additional logDebug statements.
    // Modified to copy Primary or last License Professional
    //1. Get license professionals with source CAPID.
    logDebug(">> copy LPs")
    var capLicenses = getLicenseProfessional(srcCapId);
    if (capLicenses == null || capLicenses.length == 0) {
        logDebug("Skipping copy LP as source doesn't have licenses");
        return;
    }
    //2. Get license professionals with target CAPID.
    var targetLicenses = getLicenseProfessional(targetCapId);
    if (targetLicenses) {
        logDebug("Skipping copy LP as target already has " + targetLicenses.length + " licenses");
        logDebug("targetLicenses[0]: " + targetLicenses[0].getLicenseNbr() + " " + targetLicenses[0].getLicenseType());
        return;
    }
    //3. Check to see which licProf is matched in both source and target.
    for (loopk in capLicenses) {
        sourceLicProfModel = capLicenses[loopk];
        //3.1 Set target CAPID to source lic prof.
        sourceLicProfModel.setCapID(targetCapId);

        if (sourceLicProfModel.getPrintFlag() == "Y")
            break; // Only copy Primary or last License Professional
    }

    if (sourceLicProfModel) {
        lpPrimary = sourceLicProfModel.getPrintFlag();
        logDebug((sourceLicProfModel.getPrintFlag() == "Y" ? "Primary" : "") + " License: " + sourceLicProfModel.getLicenseType() + " " + sourceLicProfModel.getLicenseNbr() + " " + sourceLicProfModel.getLicenseNbr());

        targetLicProfModel = null;
        //3.2 Check to see if sourceLicProf exist.
        if (targetLicenses != null && targetLicenses.length > 0) {
            for (loop2 in targetLicenses) {
                if (isMatchLicenseProfessional(sourceLicProfModel, targetLicenses[loop2])) {
                    targetLicProfModel = targetLicenses[loop2];
                    break;
                }
            }
        }

        //3.3 It is a matched licProf model.
        if (targetLicProfModel != null) {
            //3.3.1 Copy information from source to target.
            aa.licenseProfessional.copyLicenseProfessionalScriptModel(sourceLicProfModel, targetLicProfModel);
            // 91468 Fix for missing License Nbr
            targetLicProfModel.setLicenseNbr(sourceLicProfModel.getLicenseNbr());
            if (targetLicProfModel.getLicenseType() == null)
                targetLicProfModel.setLicenseType(sourceLicProfModel.getLicenseType());
            if (targetLicProfModel.getResLicenseType() == null)
                targetLicProfModel.setResLicenseType(sourceLicProfModel.getLicenseType());
            //3.3.2 Edit licProf with source licProf information.
            aa.licenseProfessional.editLicensedProfessional(targetLicProfModel);
            logDebug("Copied LicenseProfessional: "
                + (srcCapId && srcCapId.getCustomID ? srcCapId.getCustomID() : srcCapId) + " to "
                + (targetCapId && targetCapId.getCustomID ? targetCapId.getCustomID() : targetCapId)
                + " " + sourceLicProfModel.getLicenseType() + " " + sourceLicProfModel.getLicenseNbr());

            //3.4 It is new licProf model.
        } else {
            //3.4.1 Create new license professional.
            aa.licenseProfessional.createLicensedProfessional(sourceLicProfModel);
            logDebug("Created " + sourceLicProfModel.getLicenseType() + " " + sourceLicProfModel.getLicenseNbr() + " to "
                + (targetCapId && targetCapId.getCustomID ? targetCapId.getCustomID() : targetCapId));
        }
    }
    logDebug("copy LPs Finished")

}

function isMatchLicenseProfessional(licProfScriptModel1, licProfScriptModel2) {
    if (licProfScriptModel1 == null || licProfScriptModel2 == null) {
        return false;
    }
    if (licProfScriptModel1.getLicenseType().equals(licProfScriptModel2.getLicenseType()) &&
        licProfScriptModel1.getLicenseNbr().equals(licProfScriptModel2.getLicenseNbr())) {
        return true;
    }
    return false;
}

function getLicenseProfessional(capId) {
    capLicenseArr = null;
    var s_result = aa.licenseProfessional.getLicenseProf(capId);
    if (s_result.getSuccess()) {
        capLicenseArr = s_result.getOutput();
        if (capLicenseArr == null || capLicenseArr.length == 0) {
            logDebug("WARNING: no licensed professionals on this CAP:"
                + (capId && capId.getCustomID ? capId.getCustomID() : capId));
            capLicenseArr = null;
        }
    } else {
        logDebug("ERROR: Failed to license professional: " + s_result.getErrorMessage());
        capLicenseArr = null;
    }
    return capLicenseArr;
}

function copyAddress(srcCapId, targetCapId) {
    //1. Get address with source CAPID.
    var capAddresses = getAddress(srcCapId);
    if (capAddresses == null || capAddresses.length == 0) {
        return;
    }
    //2. Get addresses with target CAPID.
    var targetAddresses = getAddress(targetCapId);
    //3. Check to see which address is matched in both source and target.
    for (loopk in capAddresses) {
        sourceAddressfModel = capAddresses[loopk];
        //3.1 Set target CAPID to source address.
        sourceAddressfModel.setCapID(targetCapId);
        targetAddressfModel = null;
        //3.2 Check to see if sourceAddress exist.
        if (targetAddresses != null && targetAddresses.length > 0) {
            for (loop2 in targetAddresses) {
                if (isMatchAddress(sourceAddressfModel, targetAddresses[loop2])) {
                    targetAddressfModel = targetAddresses[loop2];
                    break;
                }
            }
        }
        //3.3 It is a matched address model.
        if (targetAddressfModel != null) {

            //3.3.1 Copy information from source to target.
            aa.address.copyAddressModel(sourceAddressfModel, targetAddressfModel);
            //3.3.2 Edit address with source address information.
            aa.address.editAddressWithAPOAttribute(targetCapId, targetAddressfModel);
        }
        //3.4 It is new address model.
        else {
            //3.4.1 Create new address.
            aa.address.createAddressWithAPOAttribute(targetCapId, sourceAddressfModel);
        }
    }
}

function isMatchAddress(addressScriptModel1, addressScriptModel2) {
    if (addressScriptModel1 == null || addressScriptModel2 == null) {
        return false;
    }
    var streetName1 = addressScriptModel1.getStreetName();
    var streetName2 = addressScriptModel2.getStreetName();
    if ((streetName1 == null && streetName2 != null) ||
        (streetName1 != null && streetName2 == null)) {
        return false;
    }
    if (streetName1 != null && !streetName1.equals(streetName2)) {
        return false;
    }
    return true;
}

function getAddress(capId) {
    capAddresses = null;
    var s_result = aa.address.getAddressByCapId(capId);
    if (s_result.getSuccess()) {
        capAddresses = s_result.getOutput();
        if (capAddresses == null || capAddresses.length == 0) {
            logDebug("WARNING: no addresses on this CAP:"
                + (capId && capId.getCustomID ? capId.getCustomID() : capId));
            capAddresses = null;
        }
    } else {
        logDebug("ERROR: Failed to address: " + s_result.getErrorMessage());
        capAddresses = null;
    }
    return capAddresses;
}


function copyAppSpecificTableX(srcCapId, targetCapId) {
    var tableNames = (arguments.length > 2 ? arguments[2] : null); // list of tables to copy
    var tableNameArray = getTableName(srcCapId);
    if (tableNameArray == null) {
        return;
    }
    for (loopk in tableNameArray) {
        var tableName = tableNameArray[loopk];
        if (tableNames && !exists(tableName, tableNames)) continue;
        logDebug("copying table: " + tableName + " "
            + (srcCapId && srcCapId.getCustomID ? srcCapId.getCustomID() : srcCapId) + " to "
            + (targetCapId && targetCapId.getCustomID ? targetCapId.getCustomID() : targetCapId));

        //1. Get appSpecificTableModel with source CAPID
        var targetAppSpecificTable = getAppSpecificTable(srcCapId, tableName);
        if (targetAppSpecificTable == null) continue;

        //2. Edit AppSpecificTableInfos with target CAPID
        var aSTableModel = targetAppSpecificTable.getAppSpecificTableModel();
        aa.appSpecificTableScript.editAppSpecificTableInfos(aSTableModel, targetCapId, null);
    }
}

function copyAppSpecificTable(srcCapId, targetCapId) {
    //var tableNames = ["OFFICER/OWNERSHIP INFORMATION","SIGNING AUTHORITY","POWER OF ATTORNEY INFORMATION","TRADE NAMES / OPERATING NAME"];
    var tableNames = (arguments.length > 2 ? arguments[2] : null); // list of tables to copy
    var tableNameArray = getTableName(srcCapId);
    if (tableNameArray == null) {
        return;
    }
    for (loopk in tableNameArray) {
        var tableName = tableNameArray[loopk];
        if (tableNames && !exists(tableName, tableNames)) continue;
        logDebug("copying table: " + tableName + " "
            + (srcCapId && srcCapId.getCustomID ? srcCapId.getCustomID() : srcCapId) + " to "
            + (targetCapId && targetCapId.getCustomID ? targetCapId.getCustomID() : targetCapId));

        var targetAppSpecificTable = _loadASITable(tableName, srcCapId);
        removeASITable(tableName, targetCapId);
        _addASITable(tableName, targetAppSpecificTable, targetCapId);
    }
}

function getTableName(capId) {
    var tableName = null;
    var result = aa.appSpecificTableScript.getAppSpecificGroupTableNames(capId);
    if (result.getSuccess()) {
        tableName = result.getOutput();
        if (tableName != null) {
            return tableName;
        }
    }
    return tableName;
}

function getAppSpecificTable(capId, tableName) {
    appSpecificTable = null;
    var s_result = aa.appSpecificTableScript.getAppSpecificTableModel(capId, tableName);
    if (s_result.getSuccess()) {
        appSpecificTable = s_result.getOutput();
        if (appSpecificTable == null || appSpecificTable.length == 0) {
            logDebug("WARNING: no appSpecificTable on this CAP:"
                + (capId && capId.getCustomID ? capId.getCustomID() : capId));
            appSpecificTable = null;
        }
    } else {
        logDebug("ERROR: Failed to appSpecificTable: " + s_result.getErrorMessage());
        appSpecificTable = null;
    }
    return appSpecificTable;
}

function _loadASITable(tname) {
    // Returns a single ASI Table array of arrays
    // Optional parameter, cap ID to load from
    var itemCap = (arguments.length > 1 ? arguments[1] : capId); // use cap ID specified in args

    var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
    var ta = gm.getTablesArray()
    var tai = ta.iterator();
    while (tai.hasNext()) {
        var tsm = tai.next();
        var tn = tsm.getTableName();

        if (!tn.equals(tname)) continue;
        if (tsm.rowIndex.isEmpty()) {
            logDebug("Couldn't load ASI Table " + tname + " it is empty");
            return false;
        }

        var tempObject = new Array();
        var tempArray = new Array();

        var tsmfldi = tsm.getTableField().iterator();
        var tsmcoli = tsm.getColumns().iterator();
        var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
        var numrows = 1;

        while (tsmfldi.hasNext()) { // cycle through fields
            if (!tsmcoli.hasNext()) { // cycle through columns
                var tsmcoli = tsm.getColumns().iterator();
                tempArray.push(tempObject);  // end of record
                var tempObject = new Array();  // clear the temp obj
                numrows++;
            }
            var tcol = tsmcoli.next();
            var tval = tsmfldi.next();
            var readOnly = 'N';
            if (readOnlyi.hasNext()) {
                readOnly = readOnlyi.next();
            }
            var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
            tempObject[tcol.getColumnName()] = fieldInfo;
        }
        tempArray.push(tempObject);  // end of record
    }
    return tempArray;
}

function asiTableValObj(columnName, fieldValue, readOnly) {
    this.columnName = columnName;
    this.fieldValue = fieldValue;
    this.readOnly = readOnly;

    asiTableValObj.prototype.toString = function () { return this.fieldValue }
};

function _addASITable(tableName, tableValueArray) {// optional capId
    //  tableName is the name of the ASI table
    //  tableValueArray is an array of associative array values.  All elements MUST be either a string or asiTableVal object
    var itemCap = (arguments.length > 2 ? arguments[2] : capId); // use cap ID specified in args

    var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap, tableName);
    if (!tssmResult.getSuccess()) { logDebug("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage()); return false }

    var tssm = tssmResult.getOutput();
    var tsm = tssm.getAppSpecificTableModel();
    var fld = tsm.getTableField();
    var fld_readonly = tsm.getReadonlyField(); // get Readonly field

    for (thisrow in tableValueArray) {
        var col = tsm.getColumns()
        var coli = col.iterator();
        while (coli.hasNext()) {
            var colname = coli.next();
            if (typeof (tableValueArray[thisrow][colname.getColumnName()]) == "object") { // we are passed an asiTablVal Obj
                fld.add(tableValueArray[thisrow][colname.getColumnName()].fieldValue);
                fld_readonly.add(tableValueArray[thisrow][colname.getColumnName()].readOnly);
            } else { // we are passed a string
                fld.add(tableValueArray[thisrow][colname.getColumnName()]);
                fld_readonly.add(null);
            }
        }
        tsm.setTableField(fld);
        tsm.setReadonlyField(fld_readonly);
    }

    var addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);
    if (!addResult.getSuccess()) { logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage()); return false }
    else {
        //Refresh Cap Model (Custom Addition by Engineering, but wasn't able to submit ACA record)
        //var tmpCap = aa.cap.getCapViewBySingle(capId);
        //cap.setAppSpecificTableGroupModel(tmpCap.getAppSpecificTableGroupModel()); 
        logDebug("Successfully added record to ASI Table: " + tableName);
    }
}

function copyParcel(srcCapId, targetCapId) {
    //1. Get parcels with source CAPID.
    var copyParcels = getParcel(srcCapId);
    if (copyParcels == null || copyParcels.length == 0) {
        return;
    }
    //2. Get parcel with target CAPID.
    var targetParcels = getParcel(targetCapId);
    //3. Check to see which parcel is matched in both source and target.
    for (i = 0; i < copyParcels.size(); i++) {
        sourceParcelModel = copyParcels.get(i);
        //3.1 Set target CAPID to source parcel.
        sourceParcelModel.setCapID(targetCapId);
        targetParcelModel = null;
        //3.2 Check to see if sourceParcel exist.
        if (targetParcels != null && targetParcels.size() > 0) {
            for (j = 0; j < targetParcels.size(); j++) {
                if (isMatchParcel(sourceParcelModel, targetParcels.get(j))) {
                    targetParcelModel = targetParcels.get(j);
                    break;
                }
            }
        }
        //3.3 It is a matched parcel model.
        if (targetParcelModel != null) {
            //3.3.1 Copy information from source to target.
            var tempCapSourceParcel = aa.parcel.warpCapIdParcelModel2CapParcelModel(targetCapId, sourceParcelModel).getOutput();
            var tempCapTargetParcel = aa.parcel.warpCapIdParcelModel2CapParcelModel(targetCapId, targetParcelModel).getOutput();
            aa.parcel.copyCapParcelModel(tempCapSourceParcel, tempCapTargetParcel);
            //3.3.2 Edit parcel with sourceparcel.
            aa.parcel.updateDailyParcelWithAPOAttribute(tempCapTargetParcel);
        }
        //3.4 It is new parcel model.
        else {
            //3.4.1 Create new parcel.
            aa.parcel.createCapParcelWithAPOAttribute(aa.parcel.warpCapIdParcelModel2CapParcelModel(targetCapId, sourceParcelModel).getOutput());
        }
    }
}

function isMatchParcel(parcelScriptModel1, parcelScriptModel2) {
    if (parcelScriptModel1 == null || parcelScriptModel2 == null) {
        return false;
    }
    if (parcelScriptModel1.getParcelNumber().equals(parcelScriptModel2.getParcelNumber())) {
        return true;
    }
    return false;
}

function getParcel(capId) {
    capParcelArr = null;
    var s_result = aa.parcel.getParcelandAttribute(capId, null);
    if (s_result.getSuccess()) {
        capParcelArr = s_result.getOutput();
        if (capParcelArr == null || capParcelArr.length == 0) {
            logDebug("WARNING: no parcel on this CAP:"
                + (capId && capId.getCustomID ? capId.getCustomID() : capId));
            capParcelArr = null;
        }
    } else {
        logDebug("ERROR: Failed to parcel: " + s_result.getErrorMessage());
        capParcelArr = null;
    }
    return capParcelArr;
}

function copyPeople(srcCapId, targetCapId) {
    // Modified to allow for optional parameter of contact types to copy.
    var contactTypes = null;
    if (arguments.length > 2)
        contactTypes = arguments[2];
    //1. Get people with source CAPID.
    var capPeoples = getPeople(srcCapId);
    if (capPeoples == null || capPeoples.length == 0) {
        return;
    }
    //2. Get people with target CAPID.
    var targetPeople = getPeople(targetCapId);
    //3. Check to see which people is matched in both source and target.
    for (loopk in capPeoples) {
        sourcePeopleModel = capPeoples[loopk];
        //3.0 skip contact if not in contact types and contact types exists.
        if (contactTypes && !exists(sourcePeopleModel.getCapContactModel().getContactType(), contactTypes))
            continue;
        //3.1 Set target CAPID to source people.
        sourcePeopleModel.getCapContactModel().setCapID(targetCapId);
        targetPeopleModel = null;
        //3.2 Check to see if sourcePeople exist.
        if (targetPeople != null && targetPeople.length > 0) {
            for (loop2 in targetPeople) {
                if (isMatchPeople(sourcePeopleModel, targetPeople[loop2])) {
                    targetPeopleModel = targetPeople[loop2];
                    break;
                }
            }
        }
        logDebug("sourcePeopleModel.getPeople(): " + sourcePeopleModel.getPeople().contactSeqNumber + " " + sourcePeopleModel.getPeople().contactType + " " + sourcePeopleModel.getPeople().contactName);
        //3.3 It is a matched people model.
        if (targetPeopleModel != null) {
            //3.3.1 Copy information from source to target.
            aa.people.copyCapContactModel(sourcePeopleModel.getCapContactModel(), targetPeopleModel.getCapContactModel());
            //3.3.2 Edit People with source People information.
            aa.people.editCapContactWithAttribute(targetPeopleModel.getCapContactModel());
            //3.3.3 It is new People model.
            logDebug("Copied contact " + sourcePeopleModel.getCapContactModel().getContactType() +
                " " + sourcePeopleModel.getCapContactModel().getPeople().getFirstName() +
                " " + sourcePeopleModel.getCapContactModel().getPeople().getLastName());
        }
        //3.4 It is new People model.
        else {
            //3.4.1 Create new people.
            aa.people.createCapContactWithAttribute(sourcePeopleModel.getCapContactModel());
            //3.4.2 It is new People model.
            logDebug("Created contact " + sourcePeopleModel.getCapContactModel().getContactType() +
                " " + sourcePeopleModel.getCapContactModel().getPeople().getFirstName() +
                " " + sourcePeopleModel.getCapContactModel().getPeople().getLastName());
        }
    }
}

function isMatchPeople(capContactScriptModel, capContactScriptModel2) {
    if (capContactScriptModel == null || capContactScriptModel2 == null) {
        return false;
    }
    var contactType1 = capContactScriptModel.getCapContactModel().getPeople().getContactType();
    var contactType2 = capContactScriptModel2.getCapContactModel().getPeople().getContactType();
    var firstName1 = capContactScriptModel.getCapContactModel().getPeople().getFirstName();
    var firstName2 = capContactScriptModel2.getCapContactModel().getPeople().getFirstName();
    var lastName1 = capContactScriptModel.getCapContactModel().getPeople().getLastName();
    var lastName2 = capContactScriptModel2.getCapContactModel().getPeople().getLastName();
    var fullName1 = capContactScriptModel.getCapContactModel().getPeople().getFullName();
    var fullName2 = capContactScriptModel2.getCapContactModel().getPeople().getFullName();
    if ((contactType1 == null && contactType2 != null) ||
        (contactType1 != null && contactType2 == null)) {
        return false;
    }
    if (contactType1 != null && !contactType1.equals(contactType2)) {
        return false;
    }
    if ((firstName1 == null && firstName2 != null) ||
        (firstName1 != null && firstName2 == null)) {
        return false;
    }
    if (firstName1 != null && !firstName1.equals(firstName2)) {
        return false;
    }
    if ((lastName1 == null && lastName2 != null) ||
        (lastName1 != null && lastName2 == null)) {
        return false;
    }
    if (lastName1 != null && !lastName1.equals(lastName2)) {
        return false;
    }
    if ((fullName1 == null && fullName2 != null) ||
        (fullName1 != null && fullName2 == null)) {
        return false;
    }
    if (fullName1 != null && !fullName1.equals(fullName2)) {
        return false;
    }
    return true;
}

function getPeople(capId) {
    capPeopleArr = null;
    var s_result = aa.people.getCapContactByCapID(capId);
    if (s_result.getSuccess()) {
        capPeopleArr = s_result.getOutput();
        if (capPeopleArr == null || capPeopleArr.length == 0) {
            logDebug("WARNING: no People on this CAP:"
                + (capId && capId.getCustomID ? capId.getCustomID() : capId));
            capPeopleArr = null;
        }
    } else {
        logDebug("ERROR: Failed to People: " + s_result.getErrorMessage());
        capPeopleArr = null;
    }
    return capPeopleArr;
}

function copyOwner(srcCapId, targetCapId) {
    //1. Get Owners with source CAPID.
    var capOwners = getOwner(srcCapId);
    if (capOwners == null || capOwners.length == 0) {
        return;
    }
    //2. Get Owners with target CAPID.
    var targetOwners = getOwner(targetCapId);
    //3. Check to see which owner is matched in both source and target.
    for (loopk in capOwners) {
        sourceOwnerModel = capOwners[loopk];
        //3.1 Set target CAPID to source Owner.
        sourceOwnerModel.setCapID(targetCapId);
        targetOwnerModel = null;
        //3.2 Check to see if sourceOwner exist.
        if (targetOwners != null && targetOwners.length > 0) {
            for (loop2 in targetOwners) {
                if (isMatchOwner(sourceOwnerModel, targetOwners[loop2])) {
                    targetOwnerModel = targetOwners[loop2];
                    break;
                }
            }
        }
        //3.3 It is a matched owner model.
        if (targetOwnerModel != null) {
            //3.3.1 Copy information from source to target.
            aa.owner.copyCapOwnerModel(sourceOwnerModel, targetOwnerModel);
            //3.3.2 Edit owner with source owner information.
            aa.owner.updateDailyOwnerWithAPOAttribute(targetOwnerModel);
        }
        //3.4 It is new owner model.
        else {
            //3.4.1 Create new Owner.
            aa.owner.createCapOwnerWithAPOAttribute(sourceOwnerModel);
        }
    }
}

function isMatchOwner(ownerScriptModel1, ownerScriptModel2) {
    if (ownerScriptModel1 == null || ownerScriptModel2 == null) {
        return false;
    }
    var fullName1 = ownerScriptModel1.getOwnerFullName();
    var fullName2 = ownerScriptModel2.getOwnerFullName();
    if ((fullName1 == null && fullName2 != null) ||
        (fullName1 != null && fullName2 == null)) {
        return false;
    }
    if (fullName1 != null && !fullName1.equals(fullName2)) {
        return false;
    }
    return true;
}

function getOwner(capId) {
    capOwnerArr = null;
    var s_result = aa.owner.getOwnerByCapId(capId);
    if (s_result.getSuccess()) {
        capOwnerArr = s_result.getOutput();
        if (capOwnerArr == null || capOwnerArr.length == 0) {
            logDebug("WARNING: no Owner on this CAP:"
                + (capId && capId.getCustomID ? capId.getCustomID() : capId));
            capOwnerArr = null;
        }
    } else {
        logDebug("ERROR: Failed to Owner: " + s_result.getErrorMessage());
        capOwnerArr = null;
    }
    return capOwnerArr;
}

function copyCapCondition(srcCapId, targetCapId) {
    //1. Get Cap condition with source CAPID.
    var capConditions = getCapConditionByCapID(srcCapId);
    if (capConditions == null || capConditions.length == 0) {
        return;
    }
    //2. Get Cap condition with target CAPID.
    var targetCapConditions = getCapConditionByCapID(targetCapId);
    //3. Check to see which Cap condition is matched in both source and target.
    for (loopk in capConditions) {
        sourceCapCondition = capConditions[loopk];
        //3.1 Set target CAPID to source Cap condition.
        sourceCapCondition.setCapID(targetCapId);
        targetCapCondition = null;
        //3.2 Check to see if source Cap condition exist in target CAP.
        if (targetCapConditions != null && targetCapConditions.length > 0) {
            for (loop2 in targetCapConditions) {
                if (isMatchCapCondition(sourceCapCondition, targetCapConditions[loop2])) {
                    targetCapCondition = targetCapConditions[loop2];
                    break;
                }
            }
        }
        //3.3 It is a matched Cap condition model.
        if (targetCapCondition != null) {
            //3.3.1 Copy information from source to target.
            sourceCapCondition.setConditionNumber(targetCapCondition.getConditionNumber());
            //3.3.2 Edit Cap condition with source Cap condition information.
            aa.capCondition.editCapCondition(sourceCapCondition);
        }
        //3.4 It is new Cap condition model.
        else {
            //3.4.1 Create new Cap condition.
            aa.capCondition.createCapCondition(sourceCapCondition);
        }
    }
}

function isMatchCapCondition(capConditionScriptModel1, capConditionScriptModel2) {
    if (capConditionScriptModel1 == null || capConditionScriptModel2 == null) {
        return false;
    }
    var description1 = capConditionScriptModel1.getConditionDescription();
    var description2 = capConditionScriptModel2.getConditionDescription();
    if ((description1 == null && description2 != null) ||
        (description1 != null && description2 == null)) {
        return false;
    }
    if (description1 != null && !description1.equals(description2)) {
        return false;
    }
    var conGroup1 = capConditionScriptModel1.getConditionGroup();
    var conGroup2 = capConditionScriptModel2.getConditionGroup();
    if ((conGroup1 == null && conGroup2 != null) ||
        (conGroup1 != null && conGroup2 == null)) {
        return false;
    }
    if (conGroup1 != null && !conGroup1.equals(conGroup2)) {
        return false;
    }
    return true;
}

function getCapConditionByCapID(capId) {
    capConditionScriptModels = null;

    var s_result = aa.capCondition.getCapConditions(capId);
    if (s_result.getSuccess()) {
        capConditionScriptModels = s_result.getOutput();
        if (capConditionScriptModels == null || capConditionScriptModels.length == 0) {
            logDebug("WARNING: no cap condition on this CAP:"
                + (capId && capId.getCustomID ? capId.getCustomID() : capId));
            capConditionScriptModels = null;
        }
    } else {
        logDebug("ERROR: Failed to get cap condition: " + s_result.getErrorMessage());
        capConditionScriptModels = null;
    }
    return capConditionScriptModels;
}

function copyAdditionalInfo(srcCapId, targetCapId) {
    //1. Get Additional Information with source CAPID.  (BValuatnScriptModel)
    var additionalInfo = getAdditionalInfo(srcCapId);
    if (additionalInfo == null) {
        return;
    }
    //2. Get CAP detail with source CAPID.
    var capDetail = getCapDetailByID(srcCapId);
    //3. Set target CAP ID to additional info.
    additionalInfo.setCapID(targetCapId);
    if (capDetail != null) {
        capDetail.setCapID(targetCapId);
    }
    //4. Edit or create additional infor for target CAP.
    aa.cap.editAddtInfo(capDetail, additionalInfo);
}

//Return BValuatnScriptModel for additional info.
function getAdditionalInfo(capId) {
    bvaluatnScriptModel = null;
    var s_result = aa.cap.getBValuatn4AddtInfo(capId);
    if (s_result.getSuccess()) {
        bvaluatnScriptModel = s_result.getOutput();
        if (bvaluatnScriptModel == null) {
            logDebug("WARNING: no additional info on this CAP:"
                + (capId && capId.getCustomID ? capId.getCustomID() : capId));
            bvaluatnScriptModel = null;
        }
    } else {
        logDebug("ERROR: Failed to get additional info: " + s_result.getErrorMessage());
        bvaluatnScriptModel = null;
    }
    // Return bvaluatnScriptModel
    return bvaluatnScriptModel;
}

function getCapDetailByID(capId) {
    capDetailScriptModel = null;
    var s_result = aa.cap.getCapDetail(capId);
    if (s_result.getSuccess()) {
        capDetailScriptModel = s_result.getOutput();
        if (capDetailScriptModel == null) {
            logDebug("WARNING: no cap detail on this CAP:"
                + (capId && capId.getCustomID ? capId.getCustomID() : capId));
            capDetailScriptModel = null;
        }
    } else {
        logDebug("ERROR: Failed to get cap detail: " + s_result.getErrorMessage());
        capDetailScriptModel = null;
    }
    // Return capDetailScriptModel
    return capDetailScriptModel;
}

function getCapId() {
    var s_id1 = aa.env.getValue("PermitId1");
    var s_id2 = aa.env.getValue("PermitId2");
    var s_id3 = aa.env.getValue("PermitId3");

    var s_capResult = aa.cap.getCapIDModel(s_id1, s_id2, s_id3);
    if (s_capResult.getSuccess()) {
        return s_capResult.getOutput();
    } else {
        logDebug("ERROR: Failed to get capId: " + s_capResult.getErrorMessage());
        return null;
    }
}

// Get partial cap id
function getPartialCapID(capid) {
    if (capid == null || aa.util.instanceOfString(capid)) {
        return null;
    }
    //1. Get original partial CAPID  from related CAP table.
    var result = aa.cap.getProjectByChildCapID(capid, "EST", null);
    if (result.getSuccess()) {
        projectScriptModels = result.getOutput();
        if (projectScriptModels == null || projectScriptModels.length == 0) {
            logDebug("ERROR: Failed to get partial CAP with CAPID(" + capid + ")");
            return null;
        }
        //2. Get original partial CAP ID from project Model
        projectScriptModel = projectScriptModels[0];
        return projectScriptModel.getProjectID();
    } else {
        logDebug("ERROR: Failed to get partial CAP by child CAP(" + capid + "): " + result.getErrorMessage());
        return null;
    }
}

function getCapModel(capId, isActive) {
    var capModel = null;
    //If the isActive is true, it will return the active CAP.
    //If the isActive is false, it will return the active or inactive CAP.
    var s_result = aa.cap.getCapByPK(capId, isActive);
    if (s_result.getSuccess()) {
        capModel = s_result.getOutput();
    } else {
        logDebug("ERROR: Failed to get CapModel: " + s_result.getErrorMessage());
        capModel = null;
    }
    return capModel;
}

function removeLicenseProfessionals() {
    var itemCap = capId;
    if (arguments.length > 0 && arguments[0])
        itemCap = arguments[0];
    var licenseNbr = false;
    if (arguments.length > 1)
        licenseNbr = arguments[1];
    var licenseTypes = false;
    if (arguments.length > 2)
        licenseTypes = arguments[2];

    //1. Get license professionals
    var capLicenses = getLicenseProfessional(itemCap);
    if (capLicenses == null || capLicenses.length == 0) {
        return;
    }

    //2. Remove license professionals were sequence #, type or number matches what was given.
    for (capLic in capLicenseArr) {
        var capLicense = capLicenseArr[capLic];
        if (licenseNbr && licenseNbr == capLicense.getLicenseNbr() + "")
            continue;
        if (licenseTypes && !exists(capLicense.getLicenseType() + "", licenseTypes))
            continue;
        var removeResult = aa.licenseProfessional.removeLicensedProfessional(capLicenseArr[capLic]);
        if (removeResult.getSuccess())
            logDebug("(removeLicenseProfessionals) removed license professional: " + capLicense.getLicenseType() + " " + capLicense.getLicenseNbr() +
                " from record " + itemCap.getCustomID());
        else
            logDebug("(removeLicenseProfessionals) removed license professional: " + capLicense.getLicenseType() + " " + capLicense.getLicenseNbr() +
                " from record " + itemCap.getCustomID() + " : " + removeResult.getErrorMessage());
    }
}

function describe_TPS(obj) {
    // Modified from describe to also include typeof & class of object; seperate Properties from Functions; Sort them; additional arguments.
    var newLine = "\n";
    //	var newLine = br;
    //var newLine = "<BR>";
    var newLine = "<BR>\n";
    var ret = "";
    var oType = null;
    var oNameRegEx = /(^set.*$)/; // find set functions
    var oNameRegEx = /(^get.*$)/; // find get functions
    var oNameRegEx = null;
    var verbose = false;
    if (arguments.length > 1)
        oType = arguments[1];
    if (arguments.length > 2)
        oNameRegEx = arguments[2];
    if (arguments.length > 3)
        verbose = arguments[3];
    if (obj == null) {
        ret += ": null";
        return ret;
    }
    try {
        ret += "typeof(): " + typeof (obj) + (obj && obj.getClass ? ", class: " + obj.getClass() : "") + newLine;
        var oPropArray = new Array();
        var oFuncArray = new Array();
        if (oType == null)
            oType = "*";
        for (var i in obj) {
            if (oNameRegEx && !oNameRegEx.test(i)) {
                continue;
            }
            if ((oType == "*" || oType == "function") && typeof (obj[i]) == "function") {
                oFuncArray.push(i);
            } else if ((oType == "*" || oType == "property") && typeof (obj[i]) != "function") {
                oPropArray.push(i);
            }
        }
        // List Properties
        oPropArray.sort();
        for (var i in oPropArray) {
            n = oPropArray[i];
            oValue = obj[n];
            if (oValue && oValue.getClass) {
                //				logDebug(n + " " + oValue.getClass());
                if (oValue.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime"))
                    oValue += " " + (new Date(oValue.getEpochMilliseconds()));
                if (oValue.getClass().toString().equals("class com.accela.aa.emse.util.ScriptDateTime"))
                    oValue += " " + (new Date(oValue.getEpochMilliseconds()));
                // if (oValue.getClass().toString().equals("class java.util.Date")) oValue += " " + convertDate(oValue);
            }
            ret += "property:" + n + " = " + oValue + newLine;
        }
        // List Functions
        oFuncArray.sort();
        for (var i in oFuncArray) {
            n = oFuncArray[i];
            oDef = String(obj[n]).replace("\n", " ").replace("\r", " ").replace(String.fromCharCode(10), " ").replace(String.fromCharCode(10), " ")
            x = oDef.indexOf(n + "()", n.length + 15);
            if (x > 15)
                x = x + n.length + 1;
            oName = (verbose ? oDef : "function:" + n + "()"); // Include full definition of function if verbose
            oValue = ((n.toString().indexOf("get") == 0 && x > 0) ? obj[n]() : ""); // Get function value if "Get" function and no parameters.
            if (oValue && oValue.getClass) {
                //				logDebug(n + " " + oValue.getClass());
                if (oValue.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime"))
                    oValue += " " + (new Date(oValue.getEpochMilliseconds()));
                if (oValue.getClass().toString().equals("class com.accela.aa.emse.util.ScriptDateTime"))
                    oValue += " " + (new Date(oValue.getEpochMilliseconds()));
                // if (oValue.getClass().toString().equals("class java.util.Date")) oValue += " " + convertDate(oValue);
            }
            ret += oName + " = " + oValue + newLine;
        }
    } catch (err) {
        showDebug = 3;
        var context = "describe_TPS(" + obj + ")";
        logDebug("ERROR: An error occured in " + context + " Line " + err.lineNumber + " Error:  " + err.message);
        logDebug("Stack: " + err.stack);
    }
    return ret;
}


// 4ACA Functions - This functions update the capModel without a database update
function _copyAppSpecific4ACA(capFrom) { // copy all App Specific info into new Cap
    var capModelTo = (arguments.length > 1 && arguments[1] ? arguments[1] : cap);
    if (!capFrom.getAppSpecificInfoGroups)
        logDebug("Invalid capModel. capFrom: " + capFrom);
    var i = capFrom.getAppSpecificInfoGroups().iterator();
    while (i.hasNext()) {
        var group = i.next();
        var fields = group.getFields();
        if (fields != null) {
            var iteFields = fields.iterator();
            while (iteFields.hasNext()) {
                var field = iteFields.next();
                if (useAppSpecificGroupName) {
                    if (field.getChecklistComment())
                        logDebug("copying " + field.getCheckboxType() + "." + field.getCheckboxDesc() + " : " + field.getChecklistComment());
                    _editAppSpecific4ACA(field.getCheckboxType() + "." + field.getCheckboxDesc(), field.getChecklistComment(), capModelTo);
                } else {
                    if (field.getChecklistComment())
                        logDebug("copying " + field.getCheckboxDesc() + " : " + field.getChecklistComment());
                    _editAppSpecific4ACA(field.getCheckboxDesc(), field.getChecklistComment(), capModelTo);
                }
            }
        }
    }
}

function _editAppSpecific4ACA(itemName, itemValue) {
    var pCapModel = (arguments.length > 2 && arguments[2] ? arguments[2] : cap);
    var capASI = pCapModel.getAppSpecificInfoGroups();
    if (!capASI) {
        logDebug("No ASI for the CapModel");
        return null;
    }
    var i = pCapModel.getAppSpecificInfoGroups().iterator();
    while (i.hasNext()) {
        var group = i.next();
        var fields = group.getFields();
        if (fields != null) {
            var iteFields = fields.iterator();
            while (iteFields.hasNext()) {
                var field = iteFields.next();
                if ((useAppSpecificGroupName && itemName.equals(field.getCheckboxType() + "." + field.getCheckboxDesc())) || itemName.equals(field.getCheckboxDesc())) {
                    field.setChecklistComment(itemValue);
                    if (field.getChecklistComment())
                        logDebug("Updated " + field.getCheckboxDesc() + ": " + field.getChecklistComment());
                }
            }
        }
    }
}
