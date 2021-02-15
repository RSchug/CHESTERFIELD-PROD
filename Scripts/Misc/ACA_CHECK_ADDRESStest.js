/*------------------------------------------------------------------------------------------------------/
| Program : ACA Page Flow Template.js
| Event   : ACA Page Flow Template
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : Chesterfield
| Action# : ACA Before APO
|
| Notes   : 08-2020 Boucher updated for CC enhancement/issue #11
|
/------------------------------------------------------------------------------------------------------*/
if (aa.env.getValue("ScriptName") == "Test") { 	// Setup parameters for Script Test.
	var CurrentUserID = "PUBLICUSER548433"; // Public User ID: rschug (rschug@truepointsolutions.com)
	var capIDString = "20PR0041";		// Test Record from AA.
	var capIDString = "20PS0010";
//	var capIDString = "19TMP-007173";			// Test Temp Record from ACA.
	//  var capIDString = "2019-LOG-0000239";
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
	var itemCap = capModel;
	aa.print("itemCap: " + itemCap + (itemCap ? " " + itemCap.getClass() : ""));

	aa.env.setValue("CapModel", capModel);
	aa.print("CurrentUserID:" + CurrentUserID);
	aa.print("capIDString:" + capIDString);
	aa.print("capID:" + capID);
	aa.print("capModel:" + capModel);
	cap = capModel;
}
var debugEmailTo = "";
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var showMessage = false; // Set to true to see results in popup window
var showDebug = false; // Set to true to see debug messages in popup window
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var cancel = false;
var useCustomScriptFile = true; // if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startTime = startDate.getTime();
var message = ""; // Message String
var debug = ""; // Debug String
var br = "<BR>"; // Break Tag

var useAppSpecificGroupName = false;

var SCRIPT_VERSION = 9.0;
var useCustomScriptFile = true;  // if true, use Events->Custom Script and Master Scripts, else use Events->Scripts->INCLUDES_*
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
var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice).getOutput().size() > 0;
if (bzr) {
	var bvr3 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "USE_MASTER_INCLUDES");
	if (bvr3.getSuccess()) { if (bvr3.getOutput().getDescription() == "No") useCustomScriptFile = false };
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
eval(getScriptText("INCLUDES_PAGEFLOW"));

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

var cap = aa.env.getValue("CapModel");
var parentId = cap.getParentCapID();
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString(); // Convert application type to string ("Building/A/B/C")
var appTypeArray = appTypeString.split("/"); // Array of application type string
var AInfo = new Array(); // Create array for tokenized variables
var capId = cap.getCapID();
//var capId = null; // needed for next call
loadAppSpecific4ACA(AInfo); // Add AppSpecific Info

var serverName = java.net.InetAddress.getLocalHost().getHostName(); // Host Name

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
if (publicUserEmail) publicUserEmail = publicUserEmail.replace("TURNED_OFF","").toLowerCase();
logDebug("publicUserEmail: " + publicUserEmail);
// Set Debug User if TPS User.
if (publicUserEmail && debugEmailTo == "") {
	//if (publicUserEmail.indexOf("@truepointsolutions.com") > 0) 	debugEmailTo = publicUserEmail;
	//if (exists(publicUserEmail,['rschug@truepointsolutions.com']))	debugEmailTo = publicUserEmail;
}
logDebug("debugEmailTo: " + debugEmailTo);

// page flow custom code begin
try {
	showDebug = true;
	logDebug("Begin Custom Code");
	//var addArray = new Array();
	//loadAddressAttributes4ACA(addArray);

	var addressModel = cap.getAddressModel();
	var addressLine = '';
	if (addressModel) {
		addressLine += (addressModel.getHouseNumberStart() ? (addressLine == '' ? '' : ' ') + addressModel.getHouseNumberStart() : '');
		addressLine += (addressModel.getStreetDirection() ? (addressLine == '' ? '' : ' ') + addressModel.getStreetDirection() : '');
		addressLine += (addressModel.getStreetName() ? (addressLine == '' ? '' : ' ') + addressModel.getStreetName() : '');
		addressLine += (addressModel.getStreetSuffix() ? (addressLine == '' ? '' : ' ') + addressModel.getStreetSuffix() : '');
	}
	logDebug("capId: " + capId + (capId? " "+capId.getCustomID():"") + " at " + addressLine);
	var capIdsFound = null;
	if (addressModel && appMatch('Planning/*/*/*')) {
		//var hseNum = addArray['AddressAttribute.HouseNumberStart'];
		//var streetName = addArray['AddressAttribute.StreetName'];
		//var capAddResult = aa.cap.getCapListByDetailAddress(streetName, hseNum, null, null, null, null);

		logDebug("looking for Records at " + addressLine);
		var capAddResult = aa.cap.getCapListByDetailAddress(addressModel.getStreetName(), addressModel.getHouseNumberStart(), addressModel.getStreetSuffix(), null, addressModel.getStreetDirection(), null);
		if (capAddResult.getSuccess()) {
			var capIdsArray = capAddResult.getOutput();
			logDebug("Address Associated Records: " + capIdsArray.length);
			var capIdsFound = filterCapIds(capIdsArray, "Planning/*/*/*");
			logDebug("Planning Records: " + capIdsFound.length);
		}
		if (capIdsFound && capIdsFound.length > 0) {
			showMessage = true;
			comment('<B><Font Color=RED>Error: There ' + (capIdsFound.length > 1 ? 'are' : 'is an') + ' existing Planning Record(s) at this address ' + addressLine + '.</B></Font>');
		}
	}
	logDebug("End Custom Code")
} catch (err) {
    showDebug = false;
    logDebug("Error in pageflow ACA_CHECK_ADDRESS, err: " + err + ". " + err.stack);
	debugEmailSubject = "";
	debugEmailSubject += (capIDString ? capIDString + " " : (capModel && capModel.getCapID ? capModel.getCapID() + " " : "")) + vScriptName + " - ERROR";
	aa.sendMail("NoReply-" + servProvCode + "@accela.com", debugEmailTo, "", debugEmailSubject, "Debug: " + br + debug);
}

// Send Debug Email
if (debugEmailTo && debugEmailTo != "") {
	debugEmailSubject = "";
	debugEmailSubject += (capIDString ? capIDString + " " : (capModel && capModel.getCapID ? capModel.getCapID() + " " : "")) + vScriptName + " - Debug";
	logDebug("Sending Debug Message to "+debugEmailTo);
	aa.sendMail("NoReply-" + servProvCode + "@accela.com", debugEmailTo, "", debugEmailSubject, "Debug: " + br + debug);
}
// page flow custom code end

if (debug.indexOf("**ERROR") > 0) {
	aa.env.setValue("ErrorCode", "1");
	aa.env.setValue("ErrorMessage", debug);
} else {
	if (cancel) {
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
}

if (aa.env.getValue("ScriptName") == "Test") { 	// Print Debug
	var z = debug.replace(/<BR>/g, "\r"); aa.print(">>> DEBUG: \r" + z);
}

function filterCapIds(capIdsArray,capType) {
	var capStatuses = (arguments.length > 2 && arguments[2]? arguments[2]:null);
	var capNames = (arguments.length > 3 && arguments[3] ? arguments[3] : null);
	var capIdsArrayReturn = [];
	for (y in capIdsArray) {
		var itemCapId = capIdsArray[y].getCapID();
		var itemCap = aa.cap.getCap(itemCapId).getOutput();
		var itemCapType =  itemCap.getCapType();
		var itemCapTypeString = itemCapType.toString();
		var itemCapStatus = itemCap.getCapStatus();
		var itemCapName = itemCap.getSpecialText(); //For Now...this may end up being stored in an ASI field instead
		var filterDetails = [];
		if (capId + "" == itemCapId + "") filterDetails.push("capId: " + (itemCapId ? itemCapId.getCustomID() : itemCapId));
		if (!appMatch(capType, itemCapId)) filterDetails.push("capType: " + itemCapTypeString);
		if (capStatuses && !exists(itemCapStatus, capStatuses)) filterDetails.push("Status: "+ itemCapStatus);
		if (capNames && !exists(itemCapName, capNames)) filterDetails.push("Name: " + itemCapName);
		if (filterDetails.length > 0) {
//			logDebug("Filtered CapId: " + itemCapId.getCustomID() + ", Name: " + itemCapName + " for " + filterDetails.join(","));
			continue;
		}
		logDebug("Found CapId: " + itemCapId.getCustomID() + ", CapType: " + itemCapTypeString + ", Status: " + itemCapStatus + ", Name: " + itemCapName);
		capIdsArrayReturn.push(itemCapId);
	}
	return capIdsArrayReturn;
}

