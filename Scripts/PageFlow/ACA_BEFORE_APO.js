/*------------------------------------------------------------------------------------------------------/
| Program : ACA Page Flow Template.js
| Event   : ACA Page Flow Template
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : Chesterfield
| Action# : ACA Before APO
|
| Notes   : 07-2019 Boucher updated for CC specifics
|
/------------------------------------------------------------------------------------------------------*/
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

if (SA) {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA));
	eval(getScriptText(SAScript, SA));
} else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
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

var cap = aa.env.getValue("CapModel");
var parentId = cap.getParentCapID();
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString(); // Convert application type to string ("Building/A/B/C")
var appTypeArray = appTypeString.split("/"); // Array of application type string
var AInfo = new Array(); // Create array for tokenized variables
var capId = null; // needed for next call
loadAppSpecific4ACA(AInfo); // Add AppSpecific Info

// page flow custom code begin

parcel = null;
theTA = 'X';
femaValue = 'X';
cityLimit = false;
floodValue = false;
floodExempt = false;
parcel = cap.getParcelModel();
if (parcel) {
	ParcelValidatedNumber = parcel.getParcelNo();
	comment('Parcel VN = ' + ParcelValidatedNumber);
}

var paArray = new Array();
loadXAPOParcelAttributesTPS(paArray);

/* This is a jurisdiction check - the loadXAPO function has been added to the system
theTA = paArray['ParcelAttribute.Taxing Authority'];
if ((theTA.indexOf('DC') > -1 || theTA.indexOf('DH') > -1 || theTA.indexOf('SV') > -1 || theTA.indexOf('ST') > -1 || theTA.indexOf('SA') > -1 || theTA.indexOf('ZH') > -1 || theTA.indexOf('NP') > -1 || theTA.indexOf('PR') > -1 || theTA.indexOf('ZC') > -1)) {
	cancel = true;
	showMessage = true;
	comment('<B><Font Color=RED>WARNING: This property is not in Pasco County Jurisdiction.  Pasco County does not issue permits for properties within incorporated city limits.</B></Font>');
	cityLimit = true;
}
*/

/*-----------------------------------------------------------------------

Holding this here if needed for CC:  get the NTBD flag for this record.
var ntbdFlag = paArray['ParcelAttribute.NTBD']
09-2019 Verify the NTBD flag (not to be displayed) to prevent this page from showing further
if ((publicUser) && (ntbdFlag == 'Y'))	{
	showMessage = true;
	comment('<B><Font Color=RED>DEBUG NTBD IS TRUE</B></Font>');
	comment('<B><Font Color=RED>WARNING: This permit must be created at the Cheterfield County Building Services department.</B></Font>');
	cancel = true;
} else 	{
	showMessage = true;
	comment('<B><Font Color=RED>DEBUG NTBD IS FALSE</B></Font>');
}

*///-----------------------------------------------------------------------

/*  Flood Zone Check
femaValue = paArray['ParcelAttribute.FEMA'];
floodValue = (femaValue.indexOf('A-') > -1 || femaValue.indexOf('AE') > -1 || femaValue.indexOf('AH') > -1 || femaValue.indexOf('VE') > -1);
if (appMatch('~Commercial/Electrical/System 98 Volts or less') || appMatch('~Plumbing/Irrigation')) {  //make sure to update the ~
	floodExempt = true;
}

if (!floodExempt && floodValue && cityLimit == false) {
	cancel = true;
	showMessage = true;
	comment("<B><Font Color=RED>WARNING: This property or a portion of it is in a flood zone.  Please 'Save without Submit' and gather all this: Temp permit #, Name of Contractor and License #, Description of Work, Valuation, and if a reroof permit - Product Approval # for the shingles, and then email Pasco County Permitting Department at <a href='mailto:floodinfo@pascocountyfl.net?Subject=Property in a flood zone'  style='color: #0000EE;text-decoration:underline;'>floodinfo@pascocountyfl.net</a>.</Font><B>");
}
*/
/* Finding Multifamily units online
findCondoValue = paArray['ParcelAttribute.LegalDesc'];
condoValue = (findCondoValue.indexOf('CONDO') > -1 || findCondoValue.indexOf('condo') > -1 || findCondoValue.indexOf('Condo') > -1);
if (appMatch('~Reroof~') && (condoValue || AInfo['Unit #'])) { //make sure to update the ~
	showMessage = true;
	comment('<B><Font Color=RED>WARNING: This property is a multifamily dwelling.  You will need to apply for the permit in person.</B></Font>');
	cancel = true;
}
*/

var duplicatePermits = 0;
if (appMatch('*/Limited Duration Sign/*/*')) {
	duplicatePermits = findDuplicateOpenPermitsAtAddress(capIdsGetByParcel(ParcelValidatedNumber), appTypeString);
}
//Get duplicate permits by parcel is temp until we get capIdsByAddr() working;
if (duplicatePermits > 0) {
	showMessage = true;
	comment('<B><Font Color=RED>Error: There are ' + duplicatePermits + ' permit(s) for ' + appTypeString + ' that have been opened within the last 6 months.</B></Font>');
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