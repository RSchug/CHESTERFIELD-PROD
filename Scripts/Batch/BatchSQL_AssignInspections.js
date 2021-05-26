/*------------------------------------------------------------------------------------------------------/
| Program: BatchSQL_AssignInspections.js  Trigger: Batch
| Client:
|
| Version 1.0 - Base Version. 07/29/2016 RS
|
/------------------------------------------------------------------------------------------------------*/
batchJobName = "BatchSQL_AssignInspections";
// testing parameters, uncomment to use in script test
//aa.env.setValue("paramStdChoice", "BLD_SQL_AssignInspections");         // Batch Param Standard Choice.
/*
//aa.env.setValue("showDebug", "Y");
//aa.env.setValue("inspGroupPrefix", "BLD_");
//aa.env.setValue("CurrentUserID", "ADMIN"); // Current User
//aa.env.setValue("ScriptCode", "BatchSQL_AssignInspections");  // ScriptName
//aa.env.setValue("EventName", "InspectionScheduleAfter");  // EventName
//aa.env.setValue("emailAddress", "rschug@truepointsolutions.com");
*/
var appType = "Building/*/*/*"
var inspGroupPrefix = null;
var inspTypes = null;
var inspTypes = ['E and SC', 'VSMP', 'Environmental Engineering Final'];

var appTypeArray = appType.split("/");
var appTypeGroup = appTypeArray[0];
var appTypeType = appTypeArray[1];
var appTypeSubType = appTypeArray[2];
var appTypeCategory = appTypeArray[3];

/* Sql Select statement needs to include the following item name aliases:
    capIDString FOR B1_ALT_ID
    inspId for G6_ACT_NUM
    inspGroup for INSP_GROUP
    inspType for G6_ACT_TYP
    inspDesc for G6_ACT_DES
    inspStatus for G6_STATUS
    inspectorID for GA_USERID
*/

var sqlSelectString = "\
SELECT i.B1_PER_ID1, i.B1_PER_ID2, i.B1_PER_ID3, b.B1_ALT_ID capIDString,  b.B1_APPL_STATUS capStatus \
	 , b.B1_APP_TYPE_ALIAS, b.B1_PER_GROUP, b.B1_PER_TYPE, b.B1_PER_SUB_TYPE, b.B1_PER_CATEGORY \
	 , i.G6_ACT_NUM inspId, i.INSP_GROUP inspGroup, i.G6_ACT_TYP inspType, i.G6_ACT_DES inspDesc \
	 , i.G6_STATUS inspStatus, i.GA_USERID inspectorID \
	 , i.REQUESTOR_FNAME, i.REQUESTOR_MNAME, i.REQUESTOR_LNAME, i.REQUESTOR_USERID \
	 , i.CONTACT_FNAME, i.CONTACT_MNAME, i.CONTACT_LNAME, i.CONTACT_PHONE_NUM \
  FROM B1PERMIT b JOIN G6ACTION i \
    ON i.SERV_PROV_CODE = b.SERV_PROV_CODE \
   AND i.B1_PER_ID1 = b.B1_PER_ID1 \
   AND i.B1_PER_ID2 = b.B1_PER_ID2 \
   AND i.B1_PER_ID3 = b.B1_PER_ID3 \
 WHERE b.SERV_PROV_CODE = '"+ aa.getServiceProviderCode() + "' \
   AND i.G6_ACT_GRP = 'Inspection' \
   AND i.G6_STATUS = 'Scheduled' \
   AND i.GA_USERID IS NULL ";                           //-- Unassigned

   var sqlSelectString = "\
SELECT i.B1_PER_ID1, i.B1_PER_ID2, i.B1_PER_ID3, b.B1_ALT_ID capIDString,  b.B1_APPL_STATUS capStatus \
	 , i.G6_ACT_NUM inspId, i.INSP_GROUP inspGroup, i.G6_ACT_TYP inspType, i.G6_ACT_DES inspDesc \
	 , i.G6_STATUS inspStatus, i.GA_USERID inspectorID \
  FROM B1PERMIT b JOIN G6ACTION i \
    ON i.SERV_PROV_CODE = b.SERV_PROV_CODE \
   AND i.B1_PER_ID1 = b.B1_PER_ID1 \
   AND i.B1_PER_ID2 = b.B1_PER_ID2 \
   AND i.B1_PER_ID3 = b.B1_PER_ID3 \
   AND i.REC_STATUS = 'A' \
 WHERE b.SERV_PROV_CODE = '"+ aa.getServiceProviderCode() + "' \
   AND i.G6_ACT_GRP = 'Inspection' \
   AND i.G6_STATUS = 'Scheduled' \
   AND i.GA_USERID IS NULL ";                           //-- Unassigned

sqlSelectString += ""
    + (!exists(appTypeGroup, ["", "*"]) ? "   AND b.B1_PER_GROUP = '" + appTypeGroup + "' " : "")               //-- Permit Type: Group
    + (!exists(appTypeType, ["", "*"]) ? "   AND b.B1_PER_TYPE = '" + appTypeType + "' " : "")                  //-- Permit Type: Type
    + (!exists(appTypeSubType, ["", "*"]) ? "   AND b.B1_PER_SUB_TYPE = '" + appTypeSubType + "' " : "")        //-- Permit Type: SubType
    + (!exists(appTypeCategory, ["", "*"]) ? "   AND b.B1_PER_CATEGORY = '" + appTypeCategory + "' " : "")      //-- Permit Type: Category
    + (inspGroupPrefix && inspGroupPrefix != "" ? "   AND i.INSP_GROUP LIKE '" + inspGroupPrefix + "%' " : "")  //-- Inspection Group by Prefix
    + (inspTypes && inspTypes.length > 0 ? "   AND i.G6_ACT_TYP IN ('" + inspTypes.join("','") + "') " : "")            //-- Inspection Types
    // + "   AND i.REC_FUL_NAM != 'AA CONV' ";	                //-- Exclude Conversion Records
    + "";

/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var GLOBAL_VERSION = 3.0;

var showMessage = false; 	// Set to true to see results in popup window
var showDebug = false; 		// Set to true to see debug messages in popup window
var disableTokens = false; 	// turn off tokenizing of std choices (enables use of "{} and []")
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var enableVariableBranching = true; // Allows use of variable names in branching.  Branches are not followed in Doc Only
var maxEntries = 99; 		// Maximum number of std choice entries.  Entries must be Left Zero Padded
var maxSeconds = 280;
var maxSeconds = null;
var maxSeconds = 280;

var cancel = false;

var startDate = new Date(aa.util.now());
var startTime = startDate.getTime();
var emailText = "";
var message = ""; 								// Message String
if (typeof debug === 'undefined') {
    var debug = ""; 							// Debug String, do not re-define if calling multiple
}
var br = "<BR>"; 								// Break Tag
var feeSeqList = new Array(); 					// invoicing fee list
var paymentPeriodList = new Array(); 			// invoicing pay periods

var servProvCode = aa.getServiceProviderCode();
var preExecute = "PreExecuteForAfterEvents"; // Standard choice to execute first (for globals, etc)
/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var paramStdChoice = getJobParam("paramStdChoice"); // use this standard choice for parameters instead of batch jobs
var paramShowDebug = getJobParam("showDebug");
showDebug = true;
if (String(paramShowDebug).length > 0) {
    showDebug = paramShowDebug.substring(0, 1).toUpperCase().equals("Y");
    if (paramShowDebug == "3") showDebug = 3;
}
var inspGroupPrefix = getJobParam("inspGroupPrefix"); //   Prefix for Inspection Group
if (!inspGroupPrefix || inspGroupPrefix == "") {
    inspGroupPrefix = ""
}
var currentUserID = getJobParam("CurrentUserID"); // Current User
if (!currentUserID || currentUserID == "") {
    currentUserID = "ADMIN"
}
var vScriptName = "" + getJobParam("BatchJobName"); ;
var vEventName = "" + getJobParam("EventName");
var emailAddress = getJobParam("emailAddress"); // email to send report
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
/// --------------------- GIS UTILS Section
if (typeof (gisMapService) == "undefined") {
    var serviceProviderCode = aa.getServiceProviderCode();
    var parcelBusiness = aa.proxyInvoker.newInstance("com.accela.aa.aamain.parcel.ParcelBusiness").getOutput();
    var gisBusiness = aa.proxyInvoker.newInstance("com.accela.aa.gis.gis.GISBusiness").getOutput();
    var gisMapService = this.gisBusiness.getDefaultGISServiceID(this.serviceProviderCode, "ADMIN"); // Default GIS Map Service ID.
    aa.print("serviceProviderCode: " + serviceProviderCode);
    aa.print("parcelBusiness: " + parcelBusiness);
    aa.print("gisBusiness: " + gisBusiness);
    aa.print("gisMapService: " + gisMapService);
}

/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
var SCRIPT_VERSION = 3.0;
var useCustomScriptFile = false;  // if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
var useSA = false;
var SA = null;
var SAScript = null;
var includes_ScriptName = "";
try {
    // save internal copies of specific functions
    sv_getScriptText = String(getScriptText);
    sv_Functions = sv_getScriptText + String(logDebug);

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

    eval(sv_getScriptText); // Restore Saved Custom Function.

    eval(getScriptText("INCLUDES_CUSTOM", null, useCustomScriptFile));
    eval(sv_Functions); // Restore Saved Custom Functions.
    eval(getScriptText("INCLUDES_BATCH", null, false));     // Needs to be after INCLUDES_CUSTOM because of logDebug function override.
} catch (err) {
    errMsg = "Failed to include script: " + includes_ScriptName;
    handleErrorScript(err, batchJobName + ": " + errMsg);
}

function getScriptText(vScriptName, servProvCode, useProductScripts) {              // Version 3.1.28
    includes_ScriptName = vScriptName;                                              // Modified
    // aa.print("including script: " + vScriptName);
    if (!servProvCode) servProvCode = aa.getServiceProviderCode();
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

function handleErrorScript(err, context) {
    // Modified from handleError to record to server log & include optional parameter for rollback.
    var rollBack = true;
    if (arguments.length > 2 && arguments[2] != null) rollBack = arguments[2];
    var showError = true;

    if (showError) showDebug = true;

    logDebug((rollBack ? "**ERROR** " : "ERROR: ") + err.message + " In " + context + " Line " + err.lineNumber);
    logDebug("  Exception fileName " + err.fileName);
    logDebug("  Exception columnNumber " + err.columnNumber);
    logDebug("  Exception stack " + err.stack);
    logDebug("  Exception Source " + err.toSource());

    aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), context + ": Line: " + err.lineNumber + ", ERROR: " + err.message);
}

/*------------------------------------------------------------------------------------------------------/
| END Includes
/------------------------------------------------------------------------------------------------------*/


sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID();
batchJobName = "" + aa.env.getValue("BatchJobName");
batchJobID = 0;
if (batchJobResult.getSuccess()) {
    batchJobID = batchJobResult.getOutput();
    logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
} else {
    logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());
}

/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var setPrefix = getParam("setPrefix"); //   Prefix for set ID
var emailAddress = getParam("emailAddress"); // email to send report
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
var currentUserID = getJobParam("CurrentUserID"); // Current User
if (currentUserID == null || currentUserID == "") currentUserID = "ADMIN";
var systemUserObj = null;  							// Current User Object
var currentUserGroup = null; 					// Current User Group
var publicUserID = null;
var publicUser = false;

if (currentUserID.indexOf("PUBLICUSER") == 0) {
    publicUserID = currentUserID;
    currentUserID = "ADMIN";
    publicUser = true;
}

var systemUserObj = aa.person.getUser("ADMIN").getOutput();
if (currentUserID != null) {
    systemUserObj = aa.person.getUser(currentUserID).getOutput();  	// Current User Object
}

var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "");
var servProvCode = aa.getServiceProviderCode();

logDebug("EMSE Script Framework Versions");
logDebug("EVENT TRIGGERED: " + vEventName);
logDebug("SCRIPT EXECUTED: " + vScriptName);
logDebug("INCLUDE VERSION: " + INCLUDE_VERSION);
logDebug("SCRIPT VERSION : " + SCRIPT_VERSION);
logDebug("GLOBAL VERSION : " + GLOBAL_VERSION);
logDebug("currentUserID = " + currentUserID);
logDebug("systemUserObj = " + systemUserObj.getClass());
logDebug("sysDate = " + sysDate.getClass());

// Initialize Global Cap Variables
var capId = null,
	cap = null,
	capIDString = "",
	appTypeResult = null,
	appTypeString = "",
	appTypeArray = new Array(),
	capName = null,
	capStatus = null,
	fileDateObj = null,
	fileDate = null,
	fileDateYYYYMMDD = null,
	parcelArea = 0,
	estValue = 0,
	calcValue = 0,
	houseCount = 0,
	feesInvoicedTotal = 0,
	balanceDue = 0,
	houseCount = 0,
	feesInvoicedTotal = 0,
	capDetail = "",
	AInfo = new Array(),
	partialCap = false,
	feeFactor = "",
	parentCapId = null;

logDebug("Start of Job: " + batchJobName + " at " + aa.util.formatDate(aa.util.now(), "MM-dd-YYYY hh:mm:ss"));

try {   // Main Process
    var inspAreaCount = [];
    var pCounts = [];
    pCounts["Inspections Processed"] = 0;

    var db = new dbSql();
    var sqlRows = db.select(sqlSelectString);

    /*
    var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
    //var ds = initialContext.lookup("java:/AA");
    var ds = initialContext.lookup("java:/CHESTERFIELD");
    var conn = ds.getConnection();
    var rs = null;

    aa.print(sqlSelectString);
    var stmt = conn.prepareStatement(sqlSelectString);
    var sqlRows = new Array();
    var rowIndex = 0;

    rs = stmt.executeQuery();

    aa.print("Extracting Data into Array");
    while (rs.next()) {
        resultRow = new Array();
        resultRow["B1_PER_ID1"] = rs.getString("B1_PER_ID1");
        resultRow["B1_PER_ID2"] = rs.getString("B1_PER_ID2");
        resultRow["B1_PER_ID3"] = rs.getString("B1_PER_ID3");
        resultRow["capIDString"] = rs.getString("B1_ALT_ID");
        resultRow["capStatus"] = rs.getString("B1_APPL_STATUS");
        resultRow["inspId"] = rs.getString("G6_ACT_NUM");
        resultRow["inspStatus"] = rs.getString("G6_STATUS");
        resultRow["inspType"] = rs.getString("G6_ACT_TYP");
        resultRow["inspDesc"] = rs.getString("G6_ACT_DES");
        resultRow["inspector"] = rs.getString("GA_USERID");
        sqlRows.push(resultRow);
        rowIndex++;
    }

    if (rs != null) {
        rs.close();
    }
    if (stmt != null) {
        stmt.close();
    }
    if (conn != null) {
        conn.close();
    }
    */

    logDebug("Processing " + sqlRows.length + " records: " + sqlSelectString);

    for (var x in sqlRows) {
        if (maxSeconds && maxSeconds < elapsed()) { // only continue if time hasn't expired
            logDebug("Time out Error " + elapsed() + " elapsed seconds on row: " + x);
            timeExpired = true;
            break;
        }

        curSqlRow = sqlRows[x];
        altId = curSqlRow.capIDString;
        var msg = '[' + x + '] ' + sqlRows[x].capIDString + "(" + sqlRows[x].B1_PER_ID1 + '-' + sqlRows[x].B1_PER_ID2 + '-' + sqlRows[x].B1_PER_ID3 + ")";
        var s_capResult = aa.cap.getCapID(sqlRows[x].B1_PER_ID1, sqlRows[x].B1_PER_ID2, sqlRows[x].B1_PER_ID3);
        if (!s_capResult.getSuccess()) {
            logDebug(msg + " failed to get capId: " + s_capResult.getErrorMessage());
            if (typeof (pCounts["Records Filter Errors"]) == "undefined") pCounts["Records Filter Errors"] = 0;
            pCounts["Records Filter Errors"]++;
            continue;
        }

        capId = s_capResult.getOutput();
        var capResult = aa.cap.getCap(capId);
        if (!capResult.getSuccess()) {
            logDebug(altId + ": Record is deactivated, skipping");
            if (typeof (pCounts["Records Deactivated"]) == "undefined") pCounts["Records Deactivated"] = 0;
            pCounts["Records Deactivated"]++;
            continue;
        } else {
            var cap = capResult.getOutput();
        }

        logDebug("Loading Cap:" + capId);
        aa.env.setValue("PermitId1", capId.getID1());
        aa.env.setValue("PermitId2", capId.getID2());
        aa.env.setValue("PermitId3", capId.getID3());
        if (false) {
            if (SA) {
                eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA));
            } else {
                eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
            }
        } else { // Load Cap Information instead of using INCLUDES_ACCELA_GLOBALS.
            loadCap_Batch();
        }
        
        resultCapIdStringSave = capIDString;

        //
        // Event Specific Details
        //
        inspId = curSqlRow.inspId;
        inspGroup = curSqlRow.inspGroup;
        inspType = curSqlRow.inspType;
        inspStatus = curSqlRow.inspStatus;
        inspDesc = curSqlRow.inspDesc;
        inspectorID = curSqlRow.inspectorID;

        inspObj = aa.inspection.getInspection(capId, inspId).getOutput(); // current inspection object
        if (inspObj) { // Get from inspection based on inspId.
            inspGroup = inspObj.getInspection().getInspectionGroup();
            inspType = inspObj.getInspectionType();
            inspDesc = "";

            inspInspectorObj = inspObj.getInspector();
            inspectorID = inspInspectorObj.getUserID();
            var inspInspectorObj = null;
        } else {
            if (inspectorID) inspInspectorObj = aa.person.getUser(inspectorID).getOutput();
        }
        if (inspObj.getScheduledDate())
            inspSchedDate = inspObj.getScheduledDate().getMonth() + "/" + inspObj.getScheduledDate().getDayOfMonth() + "/" + inspObj.getScheduledDate().getYear();
        else
            inspSchedDate = null;

            if (inspInspectorObj) {
            var InspectorFirstName = inspInspectorObj.getFirstName();
            var InspectorLastName = inspInspectorObj.getLastName();
            var InspectorMiddleName = inspInspectorObj.getMiddleName();
        } else {
            var InspectorFirstName = null;
            var InspectorLastName = null;
            var InspectorMiddleName = null;
        }

        logDebug("Processing Inspection[" + x + "] #" + inspId + " " + inspGroup + "." + inspType + " - " + inspDesc + ", SchedDate: " + inspSchedDate + (inspectorID? ",inspectorID: " + inspectorID + ((InspectorFirstName ? InspectorFirstName : "") + " " + (InspectorMiddleName ? InspectorMiddleName : "") + " " + (InspectorLastName ? InspectorLastName : "")).trim():""));

        // Actions start here:
        vEventName = "";
        if (vEventName && vEventName != "") {
            var prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX", vEventName);
            if (preExecute.length)
                doStandardChoiceActions(preExecute, true, 0); // run Pre-execution code


            if (doStdChoices)
                doStandardChoiceActions(controlString, true, 0);

            if (doScripts)
                doScriptActions();
        }
        // Custom Actions start here:
        _assignInspection_CHESTERFIELD(inspId);

        inspObj = aa.inspection.getInspection(capId, inspId).getOutput(); // current inspection object
        inspObject = inspObj.getInspection();

        inspUserObj = null;
        inspInspectorObj = inspObj.getInspector();
        if (inspInspectorObj) {
            var inspectorFirstName = inspInspectorObj.getFirstName();
            var inspectorLastName = inspInspectorObj.getLastName();
            var inspectorMiddleName = inspInspectorObj.getMiddleName();
        } else {
            var inspectorFirstName = "";
            var inspectorLastName = "";
            var inspectorMiddleName = "";
            inspInspectorObj = null;
        }

        inspUserResultObj = aa.person.getUser(inspectorFirstName, inspectorMiddleName, inspectorLastName);
        if (inspUserResultObj.getSuccess()) {
            inspUserObj = inspUserResultObj.getOutput();
        }

        if (inspUserObj) {
            inspArea = inspUserObj.getUserID();
        } else {
            inspArea = ((inspectorFirstName ? inspectorFirstName : "") + " " + (inspectorMiddleName ? inspectorMiddleName : "") + " " + (inspectorLastName ? inspectorLastName : "")).trim();
        }
        inspAreaCount[inspArea] = (inspAreaCount[inspArea] || 0) + 1;

        pCounts["Inspections Processed"]++;

        //
        // Check for invoicing of fees
        //
        if (feeSeqList.length) {
            invoiceResult = aa.finance.createInvoice(capId, feeSeqList, paymentPeriodList);
            if (invoiceResult.getSuccess())
                logDebug("Invoicing assessed fee items is successful.");
            else
                logDebug("**ERROR: Invoicing the fee items assessed to app # " + capIDString + " was not successful.  Reason: " + invoiceResult.getErrorMessage());
        }
    }

    logDebug(">>> Totals");
    logDebug("Inspections Qualified: " + sqlRows.length);
    for (var cc in pCounts) {
        logDebug(cc+": "+ pCounts[cc])
    }
    for (var cc in inspAreaCount) {
        if (cc == 0) logDebug("Inspections by area: ");
        logDebug(cc + ":" + inspAreaCount[cc]);
    }
} catch (err) {
    errMsg = "Failure in Main Process.";
    handleErrorScript(err, batchJobName + ": " + errMsg);
}

logDebug("End of Job: " + batchJobName + " at " + aa.util.formatDate(aa.util.now(), "MM-dd-YYYY hh:mm:ss") + ", Elapsed Time : " + elapsed() + " Seconds");

// Send system email (Results).
try {
    if (typeof (envName) == "undefined") envName = "unknown";
    if (typeof (sysFromEmail) == "undefined") sysFromEmail = "noreply@accela.com";
    if (emailAddress.length) {
        sendResult = aa.sendMail(sysFromEmail, emailAddress, "", (envName + " " + batchJobName + " Results").trim(), emailText);
        if (!sendResult.getSuccess()) {
            logDebug("Failed to send system email To:" + emailAddress + ", From:" + sysFromEmail + ": " + sendResult.getErrorMessage())
        }
    }
    var z = debug.replace(/<BR>/g, "\r");
    aa.print(z);
} catch (err) {
    errMsg = "Failed to send system email(s).";
    handleErrorScript(err, batchJobName + ": " + errMsg);
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| BEGIN Functions: INCLUDES_BATCH
/------------------------------------------------------------------------------------------------------*/

function addParameter(pamaremeters, key, value) {
    if (key != null) {
        if (value == null) {
            value = "";
        }

        pamaremeters.put(key, value);
    }
}

function exists(eVal, eArray) {
    for (ii in eArray)
        if (eArray[ii] == eVal) return true;
    return false;
}

function getParam(pParamName) { //gets parameter value and logs message showing param value
    var ret = "" + aa.env.getValue(pParamName);
    logDebug("Parameter : " + pParamName + " = " + ret);
    return ret;
}

function getACAUrl() {

    // returns the path to the record on ACA.  Needs to be appended to the site

    itemCap = capId;
    if (arguments.length == 1)
        itemCap = arguments[0]; // use cap ID specified in args
    var acaUrl = "";
    var id1 = capId.getID1();
    var id2 = capId.getID2();
    var id3 = capId.getID3();
    var cap = aa.cap.getCap(capId).getOutput().getCapModel();

    acaUrl += "/urlrouting.ashx?type=1000";
    acaUrl += "&Module=" + cap.getModuleName();
    acaUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
    acaUrl += "&agencyCode=" + aa.getServiceProviderCode();
    return acaUrl;
}

function isNull(pTestValue, pNewValue) {
    if (pTestValue == null || pTestValue == "")
        return pNewValue;
    else
        return pTestValue;
}

function elapsed() {
    var thisDate = new Date(aa.util.now());
    var thisTime = thisDate.getTime();
    return ((thisTime - startTime) / 1000)
}

function logMessage(dstr) {
    aa.print(dstr);
}
function logDebug(dstr) {
    if (showDebug) {
        aa.print(dstr);
        emailText += dstr + "<br>";
        debug += dstr + "<br>";
        aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr);
        if (typeof (batchJobID) == "undefined") batchJobID = "0";
        aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, aa.date.getCurrentDate(), aa.date.getCurrentDate(), "", dstr, batchJobID);
    }
}

function loadCap_Batch() {
    if (typeof (getCapId) != "undefined")
        capId = getCapId();

    if (capId == null) {
        if (aa.env.getValue("CapId") != "") {
            sca = String(aa.env.getValue("CapId")).split("-");
            capId = aa.cap.getCapID(sca[0], sca[1], sca[2]).getOutput();
        } else if (aa.env.getValue("CapID") != "") {
            sca = String(aa.env.getValue("CapID")).split("-");
            capId = aa.cap.getCapID(sca[0], sca[1], sca[2]).getOutput();
        }
    }
    if (capId != null) {
        servProvCode = capId.getServiceProviderCode();
        capIDString = capId.getCustomID();
        cap = aa.cap.getCap(capId).getOutput();
        appTypeResult = cap.getCapType();
        appTypeString = appTypeResult.toString();
        appTypeArray = appTypeString.split("/");
        if (appTypeArray[0].substr(0, 1) != "_") {
            var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0], currentUserID).getOutput()
            if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
        }
        capName = cap.getSpecialText();
        capStatus = cap.getCapStatus();
        partialCap = !cap.isCompleteCap();
        fileDateObj = cap.getFileDate();
        fileDate = "" + fileDateObj.getMonth() + "/" + fileDateObj.getDayOfMonth() + "/" + fileDateObj.getYear();
        fileDateYYYYMMDD = dateFormatted(fileDateObj.getMonth(), fileDateObj.getDayOfMonth(), fileDateObj.getYear(), "YYYY-MM-DD");
        var valobj = aa.finance.getContractorSuppliedValuation(capId, null).getOutput();
        if (valobj.length) {
            estValue = valobj[0].getEstimatedValue();
            calcValue = valobj[0].getCalculatedValue();
            feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
        }

        var capDetailObjResult = aa.cap.getCapDetail(capId);
        if (capDetailObjResult.getSuccess()) {
            capDetail = capDetailObjResult.getOutput();
            var houseCount = capDetail.getHouseCount();
            var feesInvoicedTotal = capDetail.getTotalFee();
            var balanceDue = capDetail.getBalance();
        }
        loadAppSpecific(AInfo);
        loadTaskSpecific(AInfo);
        loadParcelAttributes(AInfo);
        loadASITables();

/*
        var parentCapString = "" + aa.env.getValue("ParentCapID");
        if (parentCapString.length > 0) { parentArray = parentCapString.split("-"); parentCapId = aa.cap.getCapID(parentArray[0], parentArray[1], parentArray[2]).getOutput(); }
        if (!parentCapId) { parentCapId = getParent(); }
        if (!parentCapId) { parentCapId = getParentLicenseCapID(capId); }
*/
        logDebug("Processing " + capIDString + " (" + capId + ") " + capName + ", appType " + appTypeString + ", capStatus = " + capStatus);
//      logDebug("currentUserGroup = " + currentUserGroup);
//      logDebug("fileDate = " + fileDate +", YYYYMMDD = " + fileDateYYYYMMDD);
//      if (parentCapId) logDebug("parentCapId = " + parentCapId.getCustomID());

//      logGlobals(AInfo);
    }
}

function dbSql() {
    this.dbServer = (arguments.length > 0 && arguments[0] && exists(arguments[0], ["Oracle", "MSSQL", "MSSQL Azure"]) ? arguments[0] : "MSSQL Azure");
    this.dsString = (arguments.length > 1 && arguments[1] ? arguments[1] : (this.dbServer && this.dbServer == "MSSQL Azure" ? "java:/" + aa.getServiceProviderCode() : "java:/AA"));	// Use Accela Automation database connection.
    this.initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
    var ds = this.initialContext.lookup(this.dsString);
    this.csvDelimiter = (arguments.length > 2 && arguments[2] ? arguments[2] : ",");
    var TAB = "\t";
    var CR = "\r";
    var LF = "\n";
    var CRLF = "\r\n";
    var FF = "\f";
    var DQUOTE = '\"';
    var SQUOTE = "\'";
    var BACKSLASH = "\\";
    var BACKSPACE = "\b";

    this.select = function (sql) {
        var sqlParams = (arguments.length > 1 && arguments[1] ? arguments[1] : null);
        var showRowNum = (arguments.length > 2 && exists(arguments[2], [false, "N", "No"]) ? false : true);	// Show Row #
        var sqlSelect = sql.replace("select ", "SELECT ").replace("Select ", "SELECT ").replace(" from ", " FROM ").replace(" From ", " FROM ");
        if (sqlSelect.indexOf("SELECT ") < 0 || sqlSelect.indexOf(" FROM ") < 0) logDebug("SQL not properly formatted SELECT or FROM missing")

        if (sqlSelect.indexOf("AA_") > 0) showRowNum = false;
        if (sqlSelect.indexOf("GVIEW_ELEMENT") > 0) showRowNum = false;

        if (this.dbServer && this.dbServer == "Oracle") {	// ORACLE PL/SQL
            var sqlSelect = sql.replace("[dbo].", "").replace("dbo.", ""); // Replace 
        }

        logDebug("From DB: " + this.dsString + ", sqlSelect: " + sqlSelect);
        try {
            var sqlSelectItems = (sqlSelect.split(" FROM "))[0].replace("SELECT ", "").trim();
            // Handle TOP {rowLimit}
            if (sqlSelectItems.indexOf("TOP ") == 0) { // Select has TOP
                sqlSelectItem = sqlSelectItems.trim().split(" ");
                if (sqlSelectItem.length > 2) sqlSelectItems = sqlSelectItems.replace(sqlSelectItem[0] + " " + sqlSelectItem[1], "").trim();
            }
            // Handle Expressions
            sqlSelectItems = sqlSelectItems.split("()").join("{}");
            var i = 0;
            while (sqlSelectItems.indexOf("(") > 0) { // Select has expression.
                itemExpStart = sqlSelectItems.lastIndexOf("(");
                itemExp = sqlSelectItems.substr(itemExpStart);
                itemExpEnd = itemExp.indexOf(")");
                if (itemExpEnd < 0) break;
                itemExp = itemExp.substr(0, itemExpEnd + 1)
                itemExpR = itemExp.replace("(", "{").replace(")", "}").replace(/,/g, ";").replace(/\s/g, "_");
                //logDebug(">> Handling Expressions: " + itemExp + " with " + itemExpR);
                sqlSelectItems = sqlSelectItems.replace(itemExp, itemExpR);
                //logDebug(">> Handled Expressions: " + sqlSelectItems);
                i++;
                if (i > 10) break;
            }
            // Parse Select Items
            sqlSelectItems = sqlSelectItems.replace(/\{/g, "(").replace(/\}/g, ")");
            //logDebug(">> sqlSelectItems: " + sqlSelectItems);
            var sqlSelectItemsArray = sqlSelectItems.split(",");
            var sqlSelectItemNames = new Array();
            for (n in sqlSelectItemsArray) {
                itemName = sqlSelectItemsArray[n].trim();
                var itemNameAlias = itemName;
                if (itemName.trim().indexOf(" as ") > 0) { // Item Name has alias, use alias
                    itemNm = itemName.trim().split(" as ");
                    itemName = itemNm[0].trim();
                    itemNameAlias = itemNm[1];
                } else if (itemName.trim().indexOf(" [") > 0) { // Item Name has alias, use alias
                    itemNm = itemName.trim().split(" [");
                    itemName = itemNm[0].trim();
                    itemNameAlias = itemNm[1];
                } else if (itemName.trim().lastIndexOf(" ") > 0) { // Item Name has alias, use alias
                    itemNm = itemName.trim().split(" ");
                    itemName = itemNm[0].trim();
                    itemNameAlias = itemNm[1];
                    //logDebug("lastIndexOf (1): " + itemName + "; " + itemNameAlias); 
                    itemNameAlias = itemNm[itemNm.length - 1];
                    itemName = itemName.replace(itemNameAlias, "").trim();
                    //logDebug("lastIndexOf (2): " + itemName + "; " + itemNameAlias); 
                }
                if (itemNameAlias.indexOf(".") > 0 && itemNameAlias.trim().indexOf("]") < 0) { // Item Name has table prefix, remove it.
                    itemNm = itemNameAlias.split(".");
                    itemNameAlias = itemNm[1];
                }
                itemNameAlias = itemNameAlias.replace(/\[/g, "").replace(/\]/g, "").trim();
                //logDebug("itemName: " + itemName + ", Alias: " + itemNameAlias);
                if (itemNameAlias != "") sqlSelectItemNames.push(itemNameAlias);
            }

            var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
            var ds = initialContext.lookup(this.dsString);
            var conn = ds.getConnection();
            // Execute SQL Select
            try {
                var dbStmt = conn.prepareStatement(sql);			//	Original:
                //var dbStmt = aa.db.prepareStatement(conn, sql);		//	New API:
                //logDebug("dbStmt: " + dbStmt + br + describe_TPS(dbStmt, null, null, true));
                // Add SQL Params
                if (sqlParams) {
                    var index = 1;
                    for (var i in sqlParams) {
                        logDebug("sqlParams[" + index + "]:" + sqlParams[i]);
                        dbStmt.setString(index++, sqlParams[i]);
                    }
                }
                if (dbStmt.getWarnings()) logDebug("db.select Warnings: " + dbStmt.getWarnings())
            } catch (err1) {
                logDebug("Error Preparing DB Statement: " + err1.message + " at line " + err1.lineNumber + " stack: " + err1.stack);
                handleError(err1, "dbStmt.prepareStatement()");
                sqlResults = null;
            }
            // Execute SQL Select
            try {
                // Execute SQL Query
                dbStmt.executeQuery();
                if (dbStmt.getWarnings()) logDebug("db.select Warnings: " + dbStmt.getWarnings())
                var sqlResults = dbStmt.getResultSet();
            } catch (err1) {
                logDebug("Error Executing DB Query: " + err1.message + " at line " + err1.lineNumber + " stack: " + err1.stack);
                handleError(err1, "dbStmt.executeQuery()");
                sqlResults = null;
            }

            // Process Results
            logDebug("Processing SQL Results...");
            //logDebug("SQL Results: " + sqlResults + br + describe_TPS(sqlResults, "property", null, true));
            var sqlRows = new Array();
            var sqlRowID = 0;

            while (sqlResults && sqlResults.next()) {
                //logDebug("Processing SQL Results[" + sqlRowID + "]: ");
                var sqlObj = new Array();
                var rowMsg = "";
                var rowMsgCSV = "";
                for (n in sqlSelectItemNames) {
                    itemNameAlias = sqlSelectItemNames[n].replace(" ", "-");
                    try {
                        sqlObj[itemNameAlias] = sqlResults.getString(itemNameAlias);
                        rowMsg += (rowMsg == "" ? "" : ",") + itemNameAlias + ": " + sqlObj[itemNameAlias];
                        rowMsgCSV += (rowMsgCSV == "" ? "" : this.csvDelimiter) + sqlObj[itemNameAlias];
                    } catch (err2) {
                        if (sqlRowID == 0) logDebug("Error getting SQL Result " + sqlSelectItemNames[n] + " " + itemNameAlias + " Reason: " + err2.message);
                    }
                }
                if (rowMsg != "") {
                    sqlRows.push(sqlObj);
                    if (sqlRowID == 0) logDebug((showRowNum ? "RowNum" + this.csvDelimiter : "") + sqlSelectItemNames.join(this.csvDelimiter));
                    logDebug((showRowNum ? sqlRowID + this.csvDelimiter : "") + rowMsgCSV);
                    // logDebug("[" + sqlRows.length + "]{" + rowMsg + "}");
                }
                sqlRowID++;
            }
            dbStmt.close();
        } catch (err) {
            logDebug("Error: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
            if (typeof dbStmt != "undefined") dbStmt.close();
        }
        if (typeof conn != "undefined") conn.close();
        return sqlRows;
    }

    this.Update = function (sql) {
        // Beware: Extreme care should be used when using this function especially in an Accela Hosted environment as you can impact other Agencies.
        var sqlUpdate = sql.toUpperCase();
        if (sqlUpdate.indexOf("UPDATE ") < 0 || sqlUpdate.indexOf(" SET ") < 0 || sqlUpdate.indexOf(" WHERE ") < 0) logDebug("SQL not properly formatted UPDATE, SET or WHERE missing")
        if (!(sqlUpdate.indexOf(" SERV_PROV_CODE ") > sqlUpdate.indexOf(" WHERE ") || sqlUpdate.indexOf(" SOURCE_SEQ_NBR ") > sqlUpdate.indexOf(" WHERE "))) logDebug("SQL not properly formatted it is not restricting update to Agency SERV_PROV_CODE or APO SOURCE_SEQ_NBR")
        logDebug("sqlUpdate: " + sqlUpdate);
        var conn = null, dbStmt = null, committed = false, sqlRowCount = null;
        try {
            var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
            var ds = initialContext.lookup("java:/AA");
            var conn = ds.getConnection();
            // Execute SQL Select
            var dbStmt = conn.createStatement();
            dbStmt.executeUpdate(sqlUpdate);
            var sqlRowCount = dbStmt.getUpdateCount();
            logDebug("sqlUpdate: Updated " + sqlRowCount + " rows");
            if (dbStmt.getWarnings()) logDebug("sqlUpdate Warnings: " + dbStmt.getWarnings())
            // conn.commit(); committed = true; // Let Accela manage the commit.
            dbStmt.close();
        } catch (err) {
            logDebug("Error: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
            // if (!commited) conn.rollback(); // Let Accela manage the commit
            if (typeof dbStmt != "undefined") dbStmt.close();
        }
        conn.close();
        return sqlRowCount;
    }
}

function describe_TPS(obj) {
    // Modified from describe to also include typeof & class of object; seperate Properties from Functions; Sort them; additional arguments.
    if (typeof (br) == "undefined") br = "<BR>";
    var newLine = br;
    var newLine = "\n";
    var ret = "";
    var oType = null;
    var oNameRegEx = /(^set.*$)/; // find set functions
    var oNameRegEx = /(^get.*$)/; // find get functions
    var oNameRegEx = null;
    var verbose = false;
    if (arguments.length > 1) oType = arguments[1];
    if (arguments.length > 2) oNameRegEx = arguments[2];
    if (arguments.length > 3) verbose = arguments[3];
    if (obj == null) {
        ret += ": null";
        return ret;
    }
    try {
        ret += "typeof(): " + typeof (obj);
        ret += (obj && obj.getClass ? ", class: " + obj.getClass() : "") + newLine;
    } catch (err) {
        showDebug = 3;
        var context = "describe_TPS(" + obj + ")";
        logDebug("ERROR: An error occured in " + context + " Line " + err.lineNumber + " Error:  " + err.message);
        logDebug("Stack: " + err.stack);
        ret += newLine;
    }
    try {
        var oPropArray = new Array();
        var oFuncArray = new Array();
        if (oType == null) oType = "*";
        for (var i in obj) {
            if (oNameRegEx && !oNameRegEx.test(i)) { continue; }
            try {
                if ((oType == "*" || oType == "function") && typeof (obj[i]) == "function") {
                    oFuncArray.push(i);
                } else if ((oType == "*" || oType == "property") && typeof (obj[i]) != "function") {
                    oPropArray.push(i);
                }
            } catch (err) {
                ret += "unknown:" + i + " " + err + newLine;
            }
        }
        // List Properties
        oPropArray.sort();
        for (var i in oPropArray) {
            n = oPropArray[i];
            try {
                oValue = obj[n];
            } catch (err) {
                oValue = "ERROR: " + err;
            }
            if (oValue && oValue.getClass) {
                //				logDebug(n + " " + oValue.getClass());
                if (oValue.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime")) oValue += " " + (new Date(oValue.getEpochMilliseconds()));
                if (oValue.getClass().toString().equals("class com.accela.aa.emse.util.ScriptDateTime")) oValue += " " + (new Date(oValue.getEpochMilliseconds()));
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
            if (x > 15) x = x + n.length + 1;
            oName = (verbose ? oDef : "function:" + n + "()");                              // Include full definition of function if verbose
            try {
                oValue = ((n.toString().indexOf("get") == 0 && x > 0) ? obj[n]() : "");  // Get function value if "Get" function and no parameters.
            } catch (err) {
                oValue = "ERROR: " + err;
            }
            if (oValue && oValue.getClass) {
                //				logDebug(n + " " + oValue.getClass());
                if (oValue.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime")) oValue += " " + (new Date(oValue.getEpochMilliseconds()));
                if (oValue.getClass().toString().equals("class com.accela.aa.emse.util.ScriptDateTime")) oValue += " " + (new Date(oValue.getEpochMilliseconds()));
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

/*------------------------------------------------------------------------------------------------------/
| END Functions: INCLUDES_BATCH
/------------------------------------------------------------------------------------------------------*/
function getJobParam(pParamName) //gets parameter value and logs message showing param value
{
    var ret;
    if (aa.env.getValue("paramStdChoice") != "") {
        var b = aa.bizDomain.getBizDomainByValue(aa.env.getValue("paramStdChoice"), pParamName);
        if (b.getSuccess()) {
            ret = b.getOutput().getDescription();
        }

        ret = ret ? "" + ret : ""; // convert to String

        logDebug("Parameter (from std choice " + aa.env.getValue("paramStdChoice") + ") : " + pParamName + " = " + ret);
    } else {
        ret = "" + aa.env.getValue(pParamName);
        logDebug("Parameter (from batch job) : " + pParamName + " = " + ret);
    }
    return ret;
}

function _assignInspection_CHESTERFIELD(inspId) {
    // TODO: Update with GIS Info based on record type or insp type.
    // use inspId is null then it will use inspType & cap info to determine inspector.
    var inspectorId = (arguments.length > 1 && arguments[1] != null ? arguments[1] : null);
    var itemCap = (arguments.length > 2 && arguments[2] != null ? arguments[2] : capId);
    var inspType = (arguments.length > 3 && arguments[3] != null ? arguments[3] : null);

    if (arguments.length > 2 && arguments[2] != null) {
        var cap = aa.cap.getCap(itemCap).getOutput();
        var capTypeResult = cap.getCapType();
        var capTypeString = capTypeResult.toString();
        var appTypeArray = capTypeString.split("/");
    } else {
        var appTypeArray = appTypeString.split("/");
    }

    if (inspId) {
        iObjResult = aa.inspection.getInspection(itemCap, inspId);
        if (!iObjResult.getSuccess()) {
            logDebug("**WARNING retrieving inspection " + inspId + " : " + iObjResult.getErrorMessage());
            return false;
        }
        iObj = iObjResult.getOutput();
        inspType = null;
        if (iObj) {
            inspType = iObj.getInspection().getInspectionType();
        }
    }

    var inspDiscipline = appTypeArray[0], inspDistrict = null;
    var gisLayerName = null, gisLayerAbbr = null, gisLayerField = null;
    if (typeof (gisMapService) == "undefined") gisMapService = null; // Check for global.
    if (appMatch("Enforcement/*/*/*")) {
        inspDiscipline = "Enforcement";
    } else if (appMatch("EnvEngineering/*/*/*")) {
        inspDiscipline = "EnvEngineering";
    } else if (exists(inspType,["E and SC","VSMP","Environmental Engineering Final"])) {
        inspDiscipline = "EnvEngineering";
    } else if (iObj && iObj.getInspector() && iObj.getInspector().getDeptOfUser() == "CHESTERFIELD/ENVIRON/NA/NA/NA/NA/NA") {
        inspDiscipline = "EnvEngineering";
    }

    if (inspDiscipline == "Enforcement"){
        inspDistrict = AInfo["ParcelAttribute.CouncilDistrict"];
        gisLayerName = "Enforcement Boundaries";
        gisLayerField = "InspectorID";
    } else if (inspDiscipline == "EnvEngineering") {
        inspDistrict = AInfo["ParcelAttribute.InspectionDistrict"];
        gisLayerName = "Parcel";
        gisLayerField = "EE Inspector";
    }
    if (inspectorId == "") inspectorId == null;

    // Use USER_DISTRICTS, inspDiscipline & inspDistrict to determine inspector.
    if (inspectorId == null) {
        if (inspDistrict == null) {
            if (gisMapService != null && gisLayerName != null && gisLayerField != null) { // Auto assign inspector based on GIS
                inspDistrict = getGISInfo(gisMapService, gisLayerName, gisLayerField);
            }
        }

        if (typeof (inspDistrict) == "undefined") inspDistrict = null;
        if (typeof (inspDiscipline) == "undefined") inspDiscipline = null;
        // Check for inspection discipline & district mapping to inspectors
        inspectorId = lookup("USER_DISTRICTS", (inspDiscipline ? inspDiscipline : "") + (inspDistrict ? "-" + inspDistrict : ""));
        if (typeof (inspectorId) == "undefined" && inspDiscipline)
            inspectorId = lookup("USER_DISTRICTS", inspDiscipline);
        if (typeof (inspectorId) == "undefined" && inspDistrict)
            inspectorId = lookup("USER_DISTRICTS", inspDistrict);
        if (typeof (inspectorId) == "undefined") inspectorId = null;
        if (inspectorId == "") inspectorId == null;
    }

    // Check for valid inspector id.
    var iName = inspectorId;
    var iInspector = getInspectorObj(iName);

    if (!iInspector) {
        logDebug("**WARNING could not find inspector or department: " + iName + ", no assignment was made");
        return false;
    }

    if (inspId) {
        if (inspectorId != null && inspectorId != "" && false) {
            assignInspection(inspId, inspectorId, itemCap);
            logDebug("assigning inspection " + inspId + " to " + inspectorId);
            /* iObj.setInspector(iInspector);
            if (iObj.getScheduledDate() == null) {
                iObj.setScheduledDate(sysDate);
            }
            aa.inspection.editInspection(iObj) */
        } else if (iInspector) { // Department
            logDebug("assigning inspection " + inspId + " to department " + iName);
            iObj.setInspector(iInspector);
            if (iObj.getScheduledDate() == null) {
                iObj.setScheduledDate(sysDate);
            }
            var inspResult = aa.inspection.editInspection(iObj)
            if (inspResult.getSuccess()) {
                logDebug("Successfully assigned inspection: " + inspId
                    + (inspType ? " " + inspType : "") + " to "
                    + (iInspector && iInspector.getGaUserID() ? "inspector: " : "department: ") + iName
                    + (iInspector && iInspector.getGaUserID() && iInspector.getFullName() ? ", Name: " + iInspector.getFullName() : "")
                    + (inspDiscipline ? ", Discipline: " + inspDiscipline : "")
                    + (inspDistrict ? ", District: " + inspDistrict : "")
                );
            } else {
                logDebug("ERROR: assigning inspection: " + inspId
                    + (inspType ? " " + inspType : "") + " to "
                    + (iInspector && iInspector.getGaUserID() ? "inspector: " : "department: ") + iName
                    + (iInspector && iInspector.getGaUserID() && iInspector.getFullName() ? ", Name: " + iInspector.getFullName() : "")
                    + (inspDiscipline ? ", Discipline: " + inspDiscipline : "")
                    + (inspDistrict ? ", District: " + inspDistrict : "")
                    + ": " + inspResult.getErrorMessage());
            }
        }
    } else {
        logDebug("Found "
            + (iInspector && iInspector.getGaUserID() ? "inspector: " : "department: ") + iName
            + (iInspector && iInspector.getGaUserID() && iInspector.getFullName() ? ", Name: " + iInspector.getFullName() : "")
            + (inspDiscipline ? ", Discipline: " + inspDiscipline : "")
            + (inspDistrict ? ", District: " + inspDistrict : "")
        );
    }
    return iInspector;
}
