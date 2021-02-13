/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_ParcelLineage.js  Trigger: Batch
| Client:
|
| Version 1.0 - Base Version. 11/01/08 JHS
| Version 2.0 - Updated for Masters Scripts 2.0  02/13/14 JHS
| Version 3.0 - Updated for 3.0, new features 9/30/15 JHS
| Version 3.1 - Configured for Chesterfield - 
/------------------------------------------------------------------------------------------------------*/
var scriptTest = false;
if (aa.env.getValue("ScriptName") == "Test") { 	// Setup parameters for Script Test.
    scriptTest = true;
    aa.env.setValue("showDebug", "Y");
}
/*------------------------------------------------------------------------------------------------------/
// testing parameters, uncomment to use in script test

//aa.env.setValue("paramStdChoice","EHS_IBD_EXPIRED_BATCH"); //Expired Year round
/------------------------------------------------------------------------------------------------------*/
// Script Parameters:
aa.env.setValue("BatchJobName", "BATCH_ParcelLineage");

updateParamStdChoice = false; // Do not update standard choice parameters.
var paramStdChoice = "BATCH_ParcelLineage";
//aa.env.setValue("paramStdChoice",paramStdChoice); // Uncomment to use parameters from Standard Choice.

/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var mapServiceURL = "https://atlasdev.chesterfield.gov/server/rest/services/ELM/MapServer";
var mapServiceUsername = null;      // Optional parameters for secure map service
var mapServicePassword = null;

var mapTableName = "ParcelLineage";
var parentParcelFieldName = "ParentTaxID";
var childParcelFieldName = "TaxID";
var transactionIDFieldName = "TransactionID";
var processingDateFieldName = "ProcessingDate";
var processingStatusFieldName = "ProcessingStatus";
var orderByFields = "ProcessingDate,Date,TransactionID,ParentTaxID,TaxID,OBJECTID";
// List of itemNames to include in output.
var emailFields = [];
emailFields.push(processingDateFieldName);
emailFields.push("Date");
emailFields.push(transactionIDFieldName);
emailFields.push(parentParcelFieldName);
emailFields.push(childParcelFieldName);
emailFields.push("Process Status");

var mapServiceURL_xAPO = "https://atlasdev.chesterfield.gov/server/rest/services/ELM_xAPO/MapServer";
var mapServiceUsername_xAPO = null;      // Optional parameters for secure map service
var mapServicePassword_xAPO = null;
mapLayerName_xAPO = "Parcel_Owner";

var partialCapType = "Enforcement/Converted/Historical/NA"; // used to create a partial record for some record based processing.
var partialCapType = "Utilities/RealProperty/NA/NA";        // used to create a partial record for some record based processing.
var partialCapType = "Planning/ChildParcelRecord/NA/NA";        // used to create a partial record for some record based processing.

var current = new Date();
var fromDateMMDDYYYY = null;
var toDateMMDDYYYY = null;
/*
// Calculate fromDate & toDate based on first & last day of next month
var nextMonth = (current.getMonth() == 11? new Date(current.getFullYear() + 1, 0, 1): new Date(current.getFullYear(), current.getMonth() + 1, 1));
var nextMonthEnd = ((nextMonth.getMonth() == 11 ? new Date(nextMonth.getFullYear() + 1, 0, 1) : new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 1)));
nextMonthEnd = new Date(nextMonthEnd.getTime() - (1 * 86400000));
var fromDateMMDDYYYY = (nextMonth.getMonth() < 9 ? "0" + (nextMonth.getMonth()+1) : (nextMonth.getDate()+1)) + "/" + (nextMonth.getDate() < 10 ? "0" + nextMonth.getDate() : nextMonth.getDate()) + "/" + nextMonth.getFullYear();
var toDateMMDDYYYY = (nextMonthEnd.getMonth() < 9 ? "0" + (nextMonthEnd.getMonth() + 1) : (nextMonthEnd.getDate() + 1)) + "/" + (nextMonthEnd.getDate() < 10 ? "0" + nextMonthEnd.getDate() : nextMonthEnd.getDate()) + "/" + nextMonthEnd.getFullYear();
aa.print("Next Month: " + fromDateMMDDYYYY + " " + nextMonth);
aa.print("End of Next Month: " + toDateMMDDYYYY + " " + nextMonthEnd);

// Use specified date range.
var fromDateMMDDYYYY = "09/01/2020";
var toDateMMDDYYYY = "09/30/2020";
aa.env.setValue("fromDate", fromDateMMDDYYYY);
aa.env.setValue("toDate", toDateMMDDYYYY);
*/


if (aa.env.getValue("fromDate") == "" && aa.env.getValue("lookAheadDays") == "") {
    if (fromDateMMDDYYYY) {
        aa.env.setValue("fromDate", fromDateMMDDYYYY);
        aa.env.setValue("toDate", toDateMMDDYYYY);
    } else {
        //fromDate = dateAdd(null, -100);
        //toDate = dateAdd(null, -1);
        aa.env.setValue("lookAheadDays", "-7");
        aa.env.setValue("daySpan", "6");
    }
}

aa.env.setValue("setPrefix", ""); // TODO: Fix Error with Parcel Sets.
aa.env.setValue("emailAddress", "rschug@truepointsolutions.com");
if (aa.env.getValue("setPrefix") == ""){
    aa.env.setValue("createProcessSets", "N");
    aa.env.setValue("setType", "");
    aa.env.setValue("setStatus", "");
} else {
    aa.env.setValue("createProcessSets", "Y");
    aa.env.setValue("setType", "Parcel Condition");
    aa.env.setValue("setStatus", "");
}
aa.env.setValue("deleteCAP", "N");

var maxSeconds = 480;			// Standard Max Batch Job Runtime is 5 min (300 seconds). Reduce if you receive batch time error.

var asiField = "Project Number";
/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
emailText = "";
message = "";
br = "\n<br>";

/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
var SCRIPT_VERSION = 3.0
var useCustomScriptFile = true;  // if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
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
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA, useCustomScriptFile));
    eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA, useCustomScriptFile));
    eval(getScriptText(SAScript, SA));
} else {
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, useCustomScriptFile));
    eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null, useCustomScriptFile));
}

if (typeof (vEventName) == "undefined") var vEventName = "";
var eventType = (vEventName.indexOf("Before") > 0 ? "Before" : "After");

eval(getScriptText("INCLUDES_CUSTOM", null, useCustomScriptFile));
eval(getScriptText("INCLUDES_BATCH", null, false));

if (true) { // Override Standard Functions.
    function logDebug(dstr) {
        if (typeof (showDebug) == "undefined") showDebug = true;
        if (typeof (debug) == "undefined") debug = "";
        if (typeof (br) == "undefined") br = "<BR>";
        if (typeof (formatErrorB) == "undefined") formatErrorB = "";
        if (typeof (formatErrorE) == "undefined") formatErrorE = "";
        if (typeof (lastErrorMsg) == "undefined") lastErrorMsg = "";
        var formatErrB = "";
        var formatErrE = "";
        if (dstr.indexOf("ERROR") >= 0) {
            formatErrB = formatErrorB;
            formatErrE = formatErrorE;
            aa.print(dstr);
            dstr = formatErrB + dstr + formatErrE;
            lastErrorMsg += dstr + br;
        }
        vLevel = 1
        if (arguments.length > 1)
            vLevel = arguments[1];
        if ((showDebug & vLevel) == vLevel || vLevel == 1)
            debug += dstr + br;
        // disabled to cut down on event log entries.
        //if ((showDebug & vLevel) == vLevel)
        //    aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr);
    }

    function logEmail(dstr) {
        aa.print(dstr)
        emailText += dstr + br;
        // disabled to cut down on event log entries.
        //aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr);
        //aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, aa.date.getCurrentDate(), aa.date.getCurrentDate(), "", dstr, batchJobID);
        // ELPLogging.debug(dstr);
    }
}

function getScriptText(vScriptName, servProvCode, useProductScripts) {
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

/*------------------------------------------------------------------------------------------------------/
|
| END: Includes
|
/------------------------------------------------------------------------------------------------------*/

try {

    showDebug = true;
    if (String(aa.env.getValue("showDebug")).length > 0) {
        showDebug = aa.env.getValue("showDebug").substring(0, 1).toUpperCase().equals("Y");
    }

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
    //Log All Environmental Variables as  globals
    var params = aa.env.getParamValues();
    var keys = params.keys();
    var key = null;
    while (keys.hasMoreElements()) {
        key = keys.nextElement();
        if (key != "paramStdChoice") {
            logDebug("params: " + key + " " + aa.env.getValue(key));
            // eval("var " + key + " = aa.env.getValue(\"" + key + "\");");
            if (paramStdChoice && updateParamStdChoice) { // Update Standard Choice from Parameters.
                editLookup(paramStdChoice, key, getJobParam(key));
            }
        }
    }

    var paramStdChoice = getJobParam("paramStdChoice")  // use this standard choice for parameters instead of batch jobs
    var fromDate = getJobParam("fromDate"); // Hardcoded dates.   Use for testing only
    var toDate = getJobParam("toDate"); // ""
    var dFromDate = aa.date.parseDate(fromDate); //
    var dToDate = aa.date.parseDate(toDate); //
    var lookAheadDays = getJobParam("lookAheadDays"); // Number of days from today
    var daySpan = getJobParam("daySpan"); // Days to search (6 if run weekly, 0 if daily, etc.)
    var setPrefix = getJobParam("setPrefix"); //   Prefix for set ID
    var createProcessSets = getJobParam("createProcessSets").substring(0, 1).toUpperCase().equals("Y"); // different sets based on notification preferences
    var setType = getJobParam("setType"); // Sets will be created with this type
    var setStatus = getJobParam("setStatus"); // Sets will be created with this initial status
    var sysFromEmail = "noReply@accela.com".replace("@", "-" + servProvCode + "@")
    var emailAddress = getJobParam("emailAddress"); // email to send report
    var emailAddressAdmin = "rschug@truepointsolutions.com";
    var deleteCAP = getJobParam("deleteCAP").substring(0, 1).toUpperCase().equals("Y"); // delete CAP with Parcels to allow Parcel Conditions to be created.

    var count = 0;
    /*----------------------------------------------------------------------------------------------------/
    |
    | End: BATCH PARAMETERS
    |
    /------------------------------------------------------------------------------------------------------*/
    var startDate = new Date();

    if (!fromDate.length) { // no "from" date, assume today + number of days to look ahead
        fromDate = dateAdd(null, parseInt(lookAheadDays))
    }
    if (!toDate.length) { // no "to" date, assume today + number of look ahead days + span
        toDate = dateAdd(null, parseInt(lookAheadDays) + parseInt(daySpan))
    }

    var mailFrom = lookup("ACA_EMAIL_TO_AND_FROM_SETTING", "RENEW_LICENSE_AUTO_ISSUANCE_MAILFROM");
    var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
    acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));

    logDebug("Date Range -- fromDate: " + fromDate + ", toDate: " + toDate)

    var startTime = startDate.getTime(); // Start timer
    var systemUserObj = aa.person.getUser("ADMIN").getOutput();

} catch (err) {
    logDebug("ERROR: " + err.message + " In " + batchJobName + " (Batch Parameters) Line " + err.lineNumber);
    logDebug("Stack: " + err.stack);
}

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
logDebug("Start of Job: Elapsed Time : " + elapsed() + " Seconds");

try {

    // Dump Objects
    var parcelBusiness = aa.proxyInvoker.newInstance("com.accela.aa.aamain.parcel.ParcelBusiness").getOutput();
    //logDebug("parcelBusiness: " + parcelBusiness + br + describe_TPS(parcelBusiness, null, null, true));
    //logDebug("aa.parcelCondition: " + br + describe_TPS(aa.parcelCondition, null, null, true));
    //logDebug("aa.set: " + br + describe_TPS(aa.set, null, null, true));

    // Setup Map Services
    logDebug("Get ArcGIS MapService Layers");
    // initialize ArcGIS Rest API - MapService
    var mapService = new MapService(mapServiceURL, mapServiceUsername, mapServicePassword);
    var mapService_xAPO = new MapService(mapServiceURL_xAPO, mapServiceUsername_xAPO, mapServicePassword_xAPO);

    var childParcelID = null, childParcelUID = null, childParcelModel = null;
    var parentParcelID = null, parentParcelUID = null, parentParcelModel = null;

    /*
    var childParcelID = "775662353600000";
    mapLayerName_xAPO = "Parcel_Owner";
    mapWhereClause_xAPO = "TaxID = '" + childParcelID + "'"
    //mapWhereClause_xAPO = "GPIN = '7756623536'"
    logDebug("Looking for " + mapLayerName_xAPO + ": " + mapWhereClause_xAPO);
    //mapWhereClause = parentParcelFieldName + " IS NOT NULL";
    var mapFeatures_XAPO = [];
    var mapFeatures_xAPO = mapService_xAPO.query(mapLayerName_xAPO, mapWhereClause_xAPO);
    logDebug(mapService_xAPO.getFeaturesString(mapLayerName_xAPO, mapFeatures_XAPO));
    */

    // prep the set prefix for all sets
    if (setPrefix != "") {
        var yy = startDate.getFullYear().toString().substr(2, 2);
        var mm = (startDate.getMonth() + 1).toString();
        if (mm.length < 2) mm = "0" + mm;
        var dd = startDate.getDate().toString();
        if (dd.length < 2) dd = "0" + dd;
        var hh = startDate.getHours().toString();
        if (hh.length < 2) hh = "0" + hh;
        var mi = startDate.getMinutes().toString();
        if (mi.length < 2) mi = "0" + mi;
        if (setPrefix == "(Date)")
            setPrefix = yy + mm + dd + hh + mi;
        else if (setPrefix == "(DateTime)")
            setPrefix = yy + mm + dd;
        else
            setPrefix += ":" + yy + mm + dd + hh + mi;
    }
    //  create Set of Sets if we are using processing sets
    var masterSetID = null;
    if (createProcessSets && setPrefix != "") {
        var masterSetID = setPrefix + ":ALL";
    }
    // Add to the overall Set
    if (masterSetID) {
        var masterSetType = "SETS";
        var masterSetType = "PARCEL";
        var masterSet = new processingSet(masterSetID, masterSetID, setType, "All sets Processed by Batch Job " + batchJobName + " Job ID " + batchJobID, masterSetType, setStatus);
        logDebug("set: " + masterSet);
        masterSet.status = setStatus;
        masterSet.update(); logDebug("Set Status = " + masterSet.status);
    }

    // Initialize Processing Totals
    var pTotals = [];
    pTotals["Records"] = 0;
    pTotals["Exceptions"] = 0;
    pTotals["Transactions"] = 0;
    var transactionIDs = []; // List of transactions processed.

    // Query map service table for parcel transactions
    mapWhereClause = processingDateFieldName + " >= CURRENT_TIMESTAMP - 90"
    // Format: Sightings BETWEEN DATE '2018-06-01' AND DATE '2018-06-05'
    mapWhereClause = "ParentTaxID IN ('762699615200000', '743709913800001', '743709913800001', '757622459200000')" 
    mapWhereClause += " OR TaxID IN ('762699615200000', '743709913800001', '743709913800001', '757622459200000')" 
    //mapWhereClause += " OR DATE BETWEEN DATE '" + fromDate + "' AND DATE '" + toDate + "'"
    mapWhereClause = processingDateFieldName + " BETWEEN DATE '" + fromDate + "' AND DATE '" + toDate + "'"
    logDebug("Looking for Parcels: " + mapWhereClause);
    var mapOutFields = null, longitude = null, latitude = null;
    //var mapOutFields = "OBJECTID,GPIN,PARENT_GPIN,Description,ParentOverlapAcreage,TransactionID,Date,TaxID,ParentTaxID,ProcessingDate,ProcessingStatus,created_user,created_date,last_edited_user,last_edited_date,GlobalID";
    //var mapOutFields = "OBJECTID,GPIN,PARENT_GPIN,Description,ParentOverlapAcreage,TransactionID,Date,TaxID,ParentTaxID,ProcessingDate,ProcessingStatus,created_user,created_date,last_edited_user,last_edited_date,GID,OriginalObjectID"
    //var mapOutFields = "OBJECTID,TransactionID,TaxID,ParentTaxID,ProcessingDate,ProcessingStatus,Date";
    //var mapFeatures = mapService.query(mapTableName, mapWhereClause);
    var mapFeatures = mapService.query(mapTableName, mapWhereClause, mapOutFields, orderByFields, longitude, latitude);
    logDebug(">> " + mapTableName + br + mapService.getFeaturesString(mapTableName, mapFeatures));

    logDebug("Find Map Features: Elapsed Time : " + elapsed() + " Seconds");

    // Create Partial CAP for use as needed.
    capId = createPartialRecord(partialCapType);
    //capId = createCap(partialCapType, "TEST Parcel Processing CAP")
    logDebug ("Processing CAP: " + capId + " " + partialCapType)
    if (capId != null) {
        servProvCode = capId.getServiceProviderCode();
        capIDString = capId.getCustomID();
        cap = aa.cap.getCap(capId).getOutput();
        appTypeResult = cap.getCapType();
        appTypeAlias = appTypeResult.getAlias();
        appTypeString = appTypeResult.toString();
        appTypeArray = appTypeString.split("/");
        if (appTypeArray[0].substr(0, 1) != "_") {
            var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0], currentUserID).getOutput()
            if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
        }
        capName = cap.getSpecialText();
        capStatus = cap.getCapStatus();
        partialCap = !cap.isCompleteCap();
    } else {
        var cap = null,
            capIDString = "",
            appTypeResult = null,
            appTypeAlias = "",
            appTypeString = "",
            appTypeArray = new Array(),
            capName = null,
            capStatus = null,
            partialCap = false;
    }

    mainProcess();

    if (capId && deleteCAP) {
        if (partialCap) {    // Delete Partial CAP.
            var s_result = aa.cap.deletePartialCAP(capId);
            if (s_result.getSuccess()) {
                logDebug("Success deleting Partial CAP: " + capId);
            } else {
                logDebug("ERROR: deleting Partial CAP: " + capId + ". " + s_result.getErrorMessage());
            }
        } else {
            var s_result = aa.cap.removeRecord(capId);
            if (s_result.getSuccess()) {
                logDebug("Success deleting CAP: " + capId);
            } else {
                logDebug("ERROR: deleting CAP: " + capId + ". " + s_result.getErrorMessage());
            }
        }
    }

    logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

    if (emailAddressAdmin.length) {
        aa.sendMail(sysFromEmail, emailAddressAdmin, "", batchJobName + " DEBUG", debug);
    }

} catch (err) {
    logDebug("ERROR: " + err.message + " In " + batchJobName + " (Main Process) Line " + err.lineNumber);
    logDebug("Stack: " + err.stack);
}

if (scriptTest) {
    if (debug.indexOf("**ERROR") > 0) {
        aa.env.setValue("ScriptReturnCode", "1");
        aa.env.setValue("ScriptReturnMessage", debug);
    } else if (eventType == "Before" && cancel) { //Process Before Event with cancel check
        aa.env.setValue("ScriptReturnCode", "1");
        if (showMessage) aa.env.setValue("ScriptReturnMessage", "<font color=red><b>Action Cancelled</b></font><br><br>" + message);
        if (showDebug) aa.env.setValue("ScriptReturnMessage", "<font color=red><b>Action Cancelled</b></font><br><br>" + debug);
    } else {
        aa.env.setValue("ScriptReturnCode", "0");
        if (showMessage) aa.env.setValue("ScriptReturnMessage", message);
        if (showDebug) aa.env.setValue("ScriptReturnMessage", message + br + ">>Debug: " + br + debug);
    }
}
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
function mainProcess() {
    for (var ff in mapFeatures) {
        itemValues = [];
        var mapFeature = mapFeatures[ff];
        for (var itemName in mapFeature) {
            itemValues.push(itemName + ": " + mapFeature[itemName]);
        }
        //logDebug(">>" + mapTableName + "[" + ff + "]: " + itemValues.join("; "));

        pTotals["Records"]++;

        parentParcelID = mapFeature[parentParcelFieldName];
        childParcelID = mapFeature[childParcelFieldName];
        transactionID = mapFeature[transactionIDFieldName];
        processingDate = mapFeature[processingDateFieldName];
        processingStatus = mapFeature[processingStatusFieldName];

        var tranID = transactionID.substring(1);
        logDebug("tranID: " + tranID);

        if (!exists(tranID, transactionIDs)) transactionIDs.push(tranID);

        rTotals = [];
        //rTotals["Added Parcel Conditions"] = 0;
        //rTotals["Skipped Parcel Conditions"] = 0;

        // Check for Parent Parcel
        mapFeature["Process Status"] = "";
        processStatus = [];

        var sourceSeqNumber = null;
        // Check for Parent Parcel
/*        parentParcelUID = null, parentParcelModel = null;
        var parentParcels = getParcelListForAdmin(parentParcelID);
        if (parentParcels.length > 0) {
            var parentParcelModel = parentParcels[0].getParcelModel();
            for (var xx in parentParcels) {
                var parentParcelModel = parentParcels[xx].getParcelModel();
                //logDebug("Found ref parentParcels[" + xx + "]: " + parentParcelModel.getParcel() + ", UID: " + parentParcelModel.getUID());
            }
            parentParcelUID = parentParcelModel.getUID() + ""; // CHESTERFIELD$*$780654386300057
            //xAPO Workaround
            //parentParcelModel.setUID(parentParcelID);
        } else {
            processStatus.push("Missing Parent");
        } */
        // Check for Child Parcel
        childParcelUID = null, childParcelModel = null;
        var childParcels = getParcelListForAdmin(childParcelID);
        if (childParcels.length > 0) {
            var childParcelModel = childParcels[0].getParcelModel();
            for (var xx in childParcels) {
                var childParcelModel = childParcels[xx].getParcelModel();
                //logDebug("Found ref childParcels[" + xx + "]: " + childParcelModel.getParcel() + ", UID: " + childParcelModel.getUID());
                sourceSeqNumber = childParcelModel.getSourceSeqNumber();
            }
            childParcelUID = childParcelModel.getUID();
            //xAPO Workaround
            //childParcelModel.setUID(childParcelID);
        } else {
            processStatus.push("Missing Child");
            mapLayerName_xAPO = "Parcel_Owner";
            mapWhereClause_xAPO = "TaxID = '" + childParcelID + "'"
            var mapFeatures_xAPO = mapService_xAPO.query(mapLayerName_xAPO, mapWhereClause_xAPO);
            if (mapFeatures_xAPO == null || mapFeatures_xAPO.length == 0) {
                logDebug(mapLayerName_xAPO + " where " + mapWhereClause_xAPO + ": No features found.");
                processStatus.push("Child not in Parcel Layer");
            } else {
                for (var ff in mapFeatures_xAPO) {
                    itemValues = [];
                    var mapFeature_xAPO = mapFeatures_xAPO[ff];
                    for (var itemName in mapFeature_xAPO) {
                        itemValues.push(itemName + ": " + mapFeature_xAPO[itemName]);
                    }
                    logDebug(mapLayerName_xAPO + "[" + ff + "]: " + itemValues.join("; "));
                }
            }
        }

        //if (ff == 0 && childParcelModel) logDebug("childParcelModel: " + br + describe_TPS(childParcelModel, null, null, true));

        // Get parcel conditions
        //if (processStatus.length == 0) {
        //    logDebug("parentParcelModel: " + parentParcelModel.getParcel() + ", UID: " + parentParcelModel.getUID());
        //}

        // Handle Errors
        if (processStatus.length > 0) {
            mapFeature["Process Status"] = processStatus.join("; ");
            logDebug(mapTableName + "[" + ff + "]: "
                + parentParcelFieldName + ": " + parentParcelID + "; "
                + childParcelFieldName + ": " + childParcelID + "; "
                + transactionIDFieldName + ": " + transactionID + "; "
                + processingDateFieldName + ": " + processingDate + "; "
                //+ processingStatusFieldName + ": " + processingStatus + "; "
                + "Status: " + processStatus.join("; ")
            );
            pTotals["Exceptions"]++;
            continue;
        }

        // Check for Parent Parcel
        parentParcelUID = null, parentParcelModel = null;
        var parentParcels = getParcelListForAdmin(parentParcelID);
        if (parentParcels.length > 0) {
            var parentParcelModel = parentParcels[0].getParcelModel();
            for (var xx in parentParcels) {
                var parentParcelModel = parentParcels[xx].getParcelModel();
                //logDebug("Found ref parentParcels[" + xx + "]: " + parentParcelModel.getParcel() + ", UID: " + parentParcelModel.getUID());
                sourceSeqNumber = parentParcelModel.getSourceSeqNumber();
            }
            parentParcelUID = parentParcelModel.getUID() + ""; // CHESTERFIELD$*$780654386300057
            //xAPO Workaround
            //parentParcelModel.setUID(parentParcelID);
        } else {
            processStatus.push("Missing Parent");
        }

        // Remove existing parcels.
        // removeParcels();
        // Add Parcel to temporary record so conditions can be found.
        addParcelFromRef(parentParcelID);
        addParcelFromRef(childParcelID);

        var parentParcelNumber = parentParcelID;
        var childParcelNumber = childParcelID;
        if (parentParcelModel && childParcelModel) {
            var parentParcelNumber = parentParcelModel.getParcelNumber();
            var childParcelNumber = childParcelModel.getParcelNumber();
            var parentParcelNumber = parentParcelModel.getUnmaskedParcelNumber();
            var childParcelNumber = childParcelModel.getUnmaskedParcelNumber();
            logDebug("Using parent parcel number: " + parentParcelNumber
                + " child parcel number: " + childParcelNumber);
        }
        logDebug("childParcel:" 
            //+ ", Model: " + childParcelModel
            + ", Parcel: " + childParcelModel.getParcel()
            + ", ParcelNumber: " + childParcelModel.getParcelNumber()
            + ", UnmaskedParcelNumber: " + childParcelModel.getUnmaskedParcelNumber()
            + ", UID: " + childParcelModel.getUID()
            //+ br + describe_TPS(childParcelModel,null,null,true)
            );

        // copy parcel conditions
        copyrefParcelConditions(parentParcelNumber, childParcelNumber);

        //TODO: Resolve error when adding to Parcel Set.
        //ERROR: parcelSet: add set 2010212004:A0502: 778608831900000. INSERT INTO SETDETAILS (SERV_PROV_CODE, SET_SEQ_NBR, SET_ID, L1_PARCEL_NBR,L1_ADDRESS_NBR,LIC_SEQ_NBR, SOURCE_SEQ_NBR, REC_DATE, REC_FUL_NAM, REC_STATUS) VALUES (?,?,?,?,?,?,?,?,?,?) The INSERT statement conflicted with the FOREIGN KEY constraint "SETDETAILS$L3PARCEL_FK". The conflict occurred in database "CHESTERFIELD", table "dbo.L3PARCEL".

        var childParcelNo = childParcelID;
        if (parentParcelModel && childParcelModel) {
            var childParcelNo = childParcelModel.getParcel();
            logDebug("For sets using child Parcel: " + childParcelNo);
        }

        if (createProcessSets && setPrefix != "" && childParcelNo) {
            var setId = setPrefix + ":" + transactionID;
            var setComment = transactionID + " parcels Batch"
                + (processingDate ? ", Processed on " + jsDateToMMDDYYYY(processingDate) : "")
                + (processingStatus ? ", Status: " + processingStatus : "");
            logDebug("set id: " + setId);
            var s = new processingSet(setId, setId, setType, setComment, "PARCEL", setStatus);
            logDebug("set: " + s);
            logDebug("For set id: " + setId + " adding parcel: " + childParcelNo);
            var s_result = s.add(childParcelNo);
            if (s_result == null || !s_result.getSuccess())
                processStatus.push("Cannot add to Parcel Set")
            if (masterSet) {
                if (masterSet.setType == "parcel") {
                    var s_result = masterSet.add(childParcelNo);
                } else if (masterSet.setType == "sets") {
                    var s_result = masterSet.add(setId);
                } else {
                    var s_result = null;
                }
                if (s_result != null && !s_result.getSuccess()) {
                    logDebug("Warning: could not add channel set to master set " + s_result.getErrorMessage());
                }
            }
        }

        for (var tt in rTotals) {
            processStatus.push(tt + " " + rTotals[tt]);
            logDebug(tt + ": " + rTotals[tt]);
            if (typeof (pTotals[tt]) == "undefined") pTotals[tt] = 0;
            pTotals[tt] = pTotals[tt] + rTotals[tt];
        }

        mapFeature["Process Status"] = processStatus.join("; ");
        logDebug(mapTableName + "[" + ff + "]: "
            + parentParcelFieldName + ": " + parentParcelID + "; "
            + childParcelFieldName + ": " + childParcelID + "; "
            + transactionIDFieldName + ": " + transactionID + "; "
            + processingDateFieldName + ": " + processingDate + "; "
            + processingStatusFieldName + ": " + processingStatus
            + (processStatus.length > 0 ? "; Status: " + processStatus.join("; ") : "")
        );
    } // end for (var ff in mapFeatures)

    logDebug("TransactionsIDs: " + transactionIDs.join(", "));
    pTotals["Transactions"] = transactionIDs.length;

    // Produce Summary Email
    var emailDetailsMsg = "";
    for (var ff in mapFeatures) {
        itemValues = [];
        var mapFeature = mapFeatures[ff];
        var emailDetailMsg = "";
        if (emailFields) {
            for (var ii in emailFields) {
                var itemName = emailFields[ii];
                if (typeof (mapFeature[itemName]) == "undefined") continue;
                var itemValue = mapFeature[itemName];
                if (itemValue && exists(itemName, ["Date", processingDateFieldName]))
                    itemValue = jsDateToASIDate(mapFeature[itemName]);
                emailDetailMsg += "<td>" + itemValue + "</td>";
            }
        } else {
            for (var itemName in mapFeature) {
                var itemValue = mapFeature[itemName];
                if (itemValue && exists(itemName, ["Date", processingDateFieldName]))
                    itemValue = jsDateToASIDate(mapFeature[itemName]);
                emailDetailMsg += "<td>" + itemValue + "</td>";
            }
        }
        if (emailDetailMsg != "") emailDetailsMsg += "<tr>" + emailDetailMsg + "</tr>";
    }
    var emailDetailsMsgH = "";
    if (emailDetailsMsg != "") {
        for (var ff in mapFeatures) {
            var mapFeature = mapFeatures[ff];
            var emailDetailMsg = "";
            if (emailFields) {
                for (var ii in emailFields) {
                    itemName = emailFields[ii];
                    if (typeof (mapFeature[itemName]) == "undefined") continue;
                    emailDetailMsg += "<td>" + itemName + "</td>";
                }
            } else {
                for (var itemName in mapFeature) {
                    emailDetailMsg += "<th>" + itemName + "</th>";
                }
            }
            if (emailDetailMsg != "") emailDetailsMsg = "<tr>" + emailDetailMsg + "</tr>" + emailDetailsMsg;
            break;
        }
    }
    if (emailDetailsMsg != "") {
        emailDetailsMsgFooter = "";
        for (var tt in pTotals) {
            emailDetailsMsgFooter += "<tr><td colspan=4>number of " + tt + "</td><td>" + pTotals[tt] + "</td></tr>";
        }
        emailDetailsMsg = "<table>"
            + "<caption>" + mapTableName + " where " + mapWhereClause.replace(" DATE ", " ").replace(" DATE ", " ") + "</caption>"
            + emailDetailsMsg
            + (emailDetailsMsgFooter != "" ? "<tfoot>" + emailDetailsMsgFooter + "</tfoot>" : "")
            + "</table>";
    }

    if (emailAddress && emailAddress.length) {
        var emailContent = "";
        emailContent += "Processing Results for " + batchJobName + "<br>";
        emailContent += "- processing Date: " + aa.util.formatDate(aa.util.now(), "yyyyMMdd hh:mm:ss") + br;
        //emailContent += "- elapsed time: " + elapsed() + br;
        emailContent += emailDetailsMsg + br;
        emailContent += ">> Debug: " + br + debug;
        sendResult = aa.sendMail(sysFromEmail, emailAddress, "", batchJobName + " Results", emailContent);
        if (!sendResult.getSuccess()) {
            logDebug("Failed to send system email To:" + emailAddress + ", From:" + sysFromEmail + ": " + sendResult.getErrorMessage())
        }
    }

    logMessage(emailDetailsMsg);
    // debug = emailDetailsMsg + br + ">> Debug: " + br + debug;

} // End MainProcess

//##########External functions###################

function getJobParam(pParamName) //gets parameter value and logs message showing param value
{
    var ret;
    if (aa.env.getValue("paramStdChoice") != "") {
        var b = aa.bizDomain.getBizDomainByValue(aa.env.getValue("paramStdChoice"), pParamName);
        if (b.getSuccess()) {
            ret = b.getOutput().getDescription();
        }

        ret = ret ? "" + ret : "";   // convert to String

        logDebug("Parameter (from std choice " + aa.env.getValue("paramStdChoice") + ") : " + pParamName + " = " + ret);
    }
    else {
        ret = "" + aa.env.getValue(pParamName);
        logDebug("Parameter (from batch job) : " + pParamName + " = " + ret);
    }
    return ret;
}

function isNull(pTestValue, pNewValue) {
    if (pTestValue == null || pTestValue == "")
        return pNewValue;
    else
        return pTestValue;
}

function elapsed() {
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    return ((thisTime - startTime) / 1000)
}

function logDebug(dstr) {
    if (typeof (showDebug) == "undefined") showDebug = true;
    if (typeof (debug) == "undefined") debug = "";
    if (typeof (br) == "undefined") br = "<BR>";
    if (typeof (formatErrorB) == "undefined") formatErrorB = "";
    if (typeof (formatErrorE) == "undefined") formatErrorE = "";
    if (typeof (lastErrorMsg) == "undefined") lastErrorMsg = "";
    var formatErrB = "";
    var formatErrE = "";
    if (dstr.indexOf("ERROR") >= 0) {
        formatErrB = formatErrorB;
        formatErrE = formatErrorE;
        aa.print(dstr);
        dstr = formatErrB + dstr + formatErrE;
        lastErrorMsg += dstr + br;
    }
    vLevel = 1
    if (arguments.length > 1)
        vLevel = arguments[1];
    if ((showDebug & vLevel) == vLevel || vLevel == 1)
        debug += dstr + br;
    // disabled to cut down on event log entries.
    //if ((showDebug & vLevel) == vLevel)
    //    aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr);
}

function logEmail(dstr) {
    aa.print(dstr)
    emailText += dstr + "\n<br>";
    // disabled to cut down on event log entries.
    //aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr);
    //aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, aa.date.getCurrentDate(), aa.date.getCurrentDate(), "", dstr, batchJobID);
    // ELPLogging.debug(dstr);
}

function lookup(stdChoice, stdValue) {
    // Modified INCLUDES_ACCELA_FUNCTION to return null if not found.
    var strControl = null;
    var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);

    if (bizDomScriptResult.getSuccess()) {
        var bizDomScriptObj = bizDomScriptResult.getOutput();
        strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
        logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
    }
    else {
        logDebug("lookup(" + stdChoice + "," + stdValue + ") does not exist");
    }
    return strControl;
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

function addParameter(pamaremeters, key, value) {
    if (key != null) {
        if (value == null) {
            value = "";
        }

        pamaremeters.put(key, value);
    }
}

function getCapParcels(itemCap) {
    capParcelArr = null;
    var parcelResult = aa.parcel.getParcelandAttribute(itemCap, null);
    if (!parcelResult.getSuccess()) {
        logDebug("ERROR: Failed to parcel: " + parcelResult.getErrorMessage());
        return null;
    }
    capParcels = parcelResult.getOutput();
    if (capParcels == null || capParcels.length == 0) {
        logDebug("WARNING: no parcel on this CAP:" + itemCap);
        return null;
    }
    return capParcels.toArray();
}

function getParentsByAppTypes(pAppTypes) {
    // returns the capId array of all parent caps
    //Dependency: appMatch function
    //
    myArray = new Array();
    if (pAppTypes && pAppTypes.length == 0) return null;

    var i = 1;
    while (true) {
        if (!(aa.cap.getProjectParents(capId, i).getSuccess())) break;
        i += 1;
    }
    i -= 1;

    var parentArray = null;
    var capResult = aa.cap.getProjectParents(capId, i);
    if (!capResult.getSuccess()) {
        logDebug("**WARNING: Parent record not found.");
        return null;
    }
    parentArray = capResult.getOutput();
    if (parentArray == null || parentArray.length == 0) {
        logDebug("**WARNING: GetParent found no project parent for this application");
        return null;
    }
    for (var x in parentArray) {
        for (y in pAppTypes) {
            pAppType = pAppTypes[y];
            if (pAppType != null) {
                //If parent type matches apType pattern passed in, add to return array
                if (appMatch(pAppType, parentArray[x].getCapID())) {
                     myArray.push(parentArray[x].getCapID());
                }
                else {
                    logDebug("**WARNING: Parent record is not the specified type.");
                    return null;
               }
            }
            else {
                myArray.push(parentArray[x].getCapID());
            }
        }
    }
    return myArray;
}

function getCapIDsByASI(ASIName, ASIValue, appTypeMasks) {
    //
    // returns the cap Id string of an application based on App-Specific Info and applicationtype.  Returns first result only!
    //
    var myArray = new Array();
    var aps = null, xx = null, yy = null;
    var capResult = aa.cap.getCapIDsByAppSpecificInfoField(ASIName, ASIValue);
    if (!capResult.getSuccess()) { logDebug("**ERROR: getting caps by app type: " + capResult.getErrorMessage()); return null }

    var apsArray = capResult.getOutput();
    for (aps in apsArray) {
        myCap = aa.cap.getCap(apsArray[aps].getCapID()).getOutput();
        myAppTypeString = myCap.getCapType().toString();
        myAppTypeArray = myAppTypeString.split("/");

        var isMatch = true;
        for (yy in appTypeMasks) {
            var ats = appTypeMasks[yy];
            var ata = ats.split("/");
            if (ata.length != 4) {
                if (aps == 0) logDebug("**ERROR: getAppIdByASI in appMatch.  The following Application Type String is incorrectly formatted: " + ats);
                continue;
            }
            // logDebug("Checking " + apsArray[aps].getCapID() + (apsArray[aps].getCustomID()? " " + apsArray[aps].getCustomID():"") + " with " + myAppTypeString + " vs " + ats);
            isMatch = true;
            for (xx in ata) {
                if (!ata[xx].equals(myAppTypeArray[xx]) && !ata[xx].equals("*"))
                    isMatch = false;
            }
            if (isMatch) break;
        }

        if (isMatch) {
            myArray.push(apsArray[aps].getCapID());
        }
    }

    return myArray;

}

function MapService(serviceURL) {
    // Depends on ArcGIS REST API. 
    // For more information see https://developers.arcgis.com/rest/services-reference/get-started-with-the-services-directory.htm
    // serviceURL format:
    //      https://<host>/<site>/rest/services/<folder>/<serviceName>/<serviceType>
    this.serverURL = null;
    this.serviceURL = serviceURL;
    this.username = (arguments.length > 1 && arguments[1] != null ? arguments[1] : null);
    this.password = (arguments.length > 2 && arguments[2] != null ? arguments[2] : null);
    this.tokenObj = null
    this.token = null;
    this.tokenExpires = null;
    this.layers = null;
    this.tables = null;
    this.respObj = null;

    var errorCodeMsgs = {
        400: "Bad Request", //The server cannot or will not process the request due to an apparent client error(e.g., malformed request syntax, size too large, invalid request message framing, or deceptive request routing).[31]
        401: "Unauthorized (RFC 7235)", // Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided.The response must include a WWW- Authenticate header field containing a challenge applicable to the requested resource.See Basic access authentication and Digest access authentication.[32] 401 semantically means "unauthorised", [33] the user does not have valid authentication credentials for the target resource.Note: Some sites incorrectly issue HTTP 401 when an IP address is banned from the website(usually the website domain) and that specific address is refused permission to access a website.[citation needed]
        402: "Payment Required", //Reserved for future use.The original intention was that this code might be used as part of some form of digital cash or micropayment scheme, as proposed, for example, by GNU Taler, [34] but that has not yet happened, and this code is not widely used.Google Developers API uses this status if a particular developer has exceeded the daily limit on requests.[35] Sipgate uses this code if an account does not have sufficient funds to start a call.[36] Shopify uses this code when the store has not paid their fees and is temporarily disabled.[37] Stripe uses this code for failed payments where parameters were correct, for example blocked fraudulent payments.[38]
        403: "Forbidden",   // The request contained valid data and was understood by the server, but the server is refusing action.This may be due to the user not having the necessary permissions for a resource or needing an account of some sort, or attempting a prohibited action(e.g.creating a duplicate record where only one is allowed).This code is also typically used if the request provided authentication by answering the WWW - Authenticate header field challenge, but the server did not accept that authentication.The request should not be repeated.
        404 : "Not Found", //The requested resource could not be found but may be available in the future.Subsequent requests by the client are permissible.
        405 : "Method Not Allowed", //A request method is not supported for the requested resource; for example, a GET request on a form that requires data to be presented via POST, or a PUT request on a read - only resource.
        406: "Not Acceptable", // The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request.[39] See Content negotiation.
        407: "Proxy Authentication Required (RFC 7235)", // The client must first authenticate itself with the proxy.[40]
        408: "Request Timeout", //The server timed out waiting for the request.According to HTTP specifications: "The client did not produce a request within the time that the server was prepared to wait. The client MAY repeat the request without modifications at any later time."[41]
        409: "Conflict", // Indicates that the request could not be processed because of conflict in the current state of the resource, such as an edit conflict between multiple simultaneous updates.
        410: "Gone", // Indicates that the resource requested is no longer available and will not be available again.This should be used when a resource has been intentionally removed and the resource should be purged.Upon receiving a 410 status code, the client should not request the resource in the future.Clients such as search engines should remove the resource from their indices.[42] Most use cases do not require clients and search engines to purge the resource, and a "404 Not Found" may be used instead.
        411: "Length Required", // The request did not specify the length of its content, which is required by the requested resource.[43]
        412: "Precondition Failed (RFC 7232)", // The server does not meet one of the preconditions that the requester put on the request header fields.[44][45]
        413: "Payload Too Large (RFC 7231)", // The request is larger than the server is willing or able to process.Previously called "Request Entity Too Large".[46]414 URI Too Long(RFC 7231)The URI provided was too long for the server to process.Often the result of too much data being encoded as a query - string of a GET request, in which case it should be converted to a POST request.[47] Called "Request-URI Too Long" previously.[48]
        415: "Unsupported Media Type (RFC 7231)", // The request entity has a media type which the server or resource does not support.For example, the client uploads an image as image / svg + xml, but the server requires that images use a different format.[49]
        416: "Range Not Satisfiable (RFC 7233)", //The client has asked for a portion of the file(byte serving), but the server cannot supply that portion.For example, if the client asked for a part of the file that lies beyond the end of the file.[50] Called "Requested Range Not Satisfiable" previously.[51]
        417: "Expectation Failed", //The server cannot meet the requirements of the Expect request - header field.[52]
        418: "I'm a teapot (RFC 2324, RFC 7168)", //This code was defined in 1998 as one of the traditional IETF April Fools' jokes, in RFC 2324, Hyper Text Coffee Pot Control Protocol, and is not expected to be implemented by actual HTTP servers.The RFC specifies this code should be returned by teapots requested to brew coffee.[53] This HTTP status is used as an Easter egg in some websites, such as Google.com's I'm a teapot easter egg.[54][55]
        421: "Misdirected Request (RFC 7540)", // The request was directed at a server that is not able to produce a response[56](for example because of connection reuse).[57]
        422: "Unprocessable Entity (WebDAV; RFC 4918)", // The request was well - formed but was unable to be followed due to semantic errors.[16]
        423: "Locked (WebDAV; RFC 4918)", // The resource that is being accessed is locked.[16]
        424: "Failed Dependency (WebDAV; RFC 4918)", // The request failed because it depended on another request and that request failed(e.g., a PROPPATCH).[16]
        425: "Too Early (RFC 8470)", //Indicates that the server is unwilling to risk processing a request that might be replayed.
        426: "Upgrade Required", //The client should switch to a different protocol such as TLS / 1.0, given in the Upgrade header field.[58]
        428: "Precondition Required (RFC 6585)", //The origin server requires the request to be conditional.Intended to prevent the 'lost update' problem, where a client GETs a resource's state, modifies it, and PUTs it back to the server, when meanwhile a third party has modified the state on the server, leading to a conflict.[59]
        429: "Too Many Requests (RFC 6585)", //The user has sent too many requests in a given amount of time. Intended for use with rate-limiting schemes.[59]
        431: "Request Header Fields Too Large (RFC 6585)", //The server is unwilling to process the request because either an individual header field, or all the header fields collectively, are too large.[59]
        451: "Unavailable For Legal Reasons (RFC 7725)", //A server operator has received a legal demand to deny access to a resource or to a set of resources that includes the requested resource.[60] The code 451 was chosen as a reference to the novel Fahrenheit 451 (see the Acknowledgements in the RFC).
        // 5xx server errors: The server failed to fulfill a request.[61]
        // Response status codes beginning with the digit "5" indicate cases in which the server is aware that it has encountered an error or is otherwise incapable of performing the request.Except when responding to a HEAD request, the server should include an entity containing an explanation of the error situation, and indicate whether it is a temporary or permanent condition.Likewise, user agents should display any included entity to the user.These response codes are applicable to any request method.[62]
        498: "Invalid Token (Esri)", //Returned by ArcGIS for Server.Code 498 indicates an expired or otherwise invalid token.[77]
        499: "Token Required (Esri)", //Returned by ArcGIS for Server.Code 499 indicates that a token is required but was not submitted.[77]
        500: "Internal Server Error", // A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.[63]
        501: "Not Implemented", //The server either does not recognize the request method, or it lacks the ability to fulfil the request.Usually this implies future availability(e.g., a new feature of a web - service API).[64]
        502: "Bad Gateway", //The server was acting as a gateway or proxy and received an invalid response from the upstream server.[65]
        503: "Service Unavailable", //The server cannot handle the request (because it is overloaded or down for maintenance).Generally, this is a temporary state.[66]
        504: "Gateway Timeout", //The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.[67]
        505: "HTTP Version Not Supported", //The server does not support the HTTP protocol version used in the request.[68]
        506: "Variant Also Negotiates (RFC 2295)", //Transparent content negotiation for the request results in a circular reference.[69]
        507: "Insufficient Storage (WebDAV; RFC 4918)", //The server is unable to store the representation needed to complete the request.[16]
        508: "Loop Detected (WebDAV; RFC 5842)", // The server detected an infinite loop while processing the request(sent instead of 208 Already Reported).
        510: "Not Extended (RFC 2774)", //Further extensions to the request are required for the server to fulfil it.[70]
        511: "Network Authentication Required (RFC 6585)" //The client needs to authenticate to gain network access.Intended for use by intercepting proxies used to control access to the network(e.g., "captive portals" used to require agreement to Terms of Service before granting full Internet access via a Wi - Fi hotspot).[59]
    }
    logDebug("Initializing MapService: " + serviceURL);
    this.toString = function () {
        return " mapService {URL: " + this.serviceURL
            + (this.username ? ", username: " + this.username : "")
            + (this.password ? ", password: ****" : "")
            + (this.token ? ", token: " + this.token : "")
            + (this.layers ? ", layers: " + this.layers : "")
            + (this.tables ? ", tables: " + this.tables : "")
            + "}";
    }

    this.getFeaturesString = function (mapTableName, mapFeatures) {
        var newLine = "\n";
        var newLine = br;
        var fMsg = "";
        for (var ff in mapFeatures) {
            var mapFeature = mapFeatures[ff];
            if (ff == 0) {
                itemValues = [];
                for (var itemName in mapFeature) {
                    itemValues.push(itemName);
                }
                fMsg += ">> Table: " + mapTableName + newLine + "RowID," + itemValues.join(",");
            }
            var itemValues = [];
            for (var itemName in mapFeature) {
                itemValues.push(mapFeature[itemName]);
            }
            fMsg += newLine + ff + "," + itemValues.join(",");
        }
        return " mapService {URL: " + this.serviceURL
            + (this.username ? ", username: " + this.username : "")
            + (this.password ? ", password: ****" : "")
            + (this.token ? ", token: " + this.token : "")
            + (this.layers ? ", layers: " + this.layers : "")
            + (this.tables ? ", tables: " + this.tables : "")
            + "}" + newLine
            + fMsg;
    }

    this.getToken = function () {
        // For more information see https://developers.arcgis.com/rest/services-reference/generate-token.htm
        // https://<host>:<port>/<site>/tokens/generateToken(POST only)
        // Token URL is typically http://server[:port]/arcgis/tokens/generateToken
        try {
            this.serverURL = null;
            this.serviceProtocol = null;
            this.serviceHost = null;
            this.servicePort = null;
            this.serviceSite = null;
            var remainingURL = this.serviceURL;
            if (remainingURL.indexOf("/arcgis")) {
                this.serverURL = remainingURL.split("/arcgis")[0];
                this.serverURL += "/arcgis";
            } else {
                if (remainingURL.indexOf("https://") >= 0) {
                    this.serviceProtocol = "https://";
                } else if (remainingURL.indexOf("http://") >= 0) {
                    this.serviceProtocol = "http://";
                }
                if (this.serviceProtocol) {
                    remainingURL = remainingURL.replace(this.serviceProtocol, "");
                }
                if (remainingURL.indexOf("/") > 0) {
                    var remainingURLParts = remainingURL.split("/");
                    remainingURL = remainingURLParts[0];
                    if (remainingURLParts.length > 2)
                        this.serviceSite = "/" + remainingURLParts[1];
                } else {
                    this.serviceSite = "/arcgis";
                }
                if (remainingURL.indexOf(":") > 0) {
                    var remainingURLParts = remainingURL.split(":");
                    this.serviceHost = remainingURLParts[0];
                    if (remainingURLParts.length > 2) this.servicePort = remainingURLParts[1];
                } else {
                    this.serviceHost = remainingURL;
                }
                logDebug("remainingURL:" + remainingURL);
                this.serverURL = this.serviceProtocol + this.serviceHost
                    + (this.servicePort ? this.servicePort : "") + this.serviceSite;
                logDebug("mapService Protocol:" + this.serviceProtocol
                    + ", Host:" + this.serviceHost
                    + ", Port:" + this.servicePort
                    + ", Site:" + this.serviceSite);
            }
            logDebug("serverURL:" + this.serverURL);

            this.respObj = null;
            var postURL = this.serverURL + "/tokens/generateToken/";
            var postParameters = "";
            if (this.serverURL && this.username && this.password) {
                postParameters = "username=" + this.username;
                postParameters += "&password=" + this.password;
                postParameters += "&client=requestip";
                //postParameters += "&client=ip&ip=" + java.net.InetAddress.getLocalHost().getHostAddress();
                //postParameters += "&client=ip&ip=10.150.160.40";
            }
            //postParameters += "&expiration=90";
            postParameters += "&f=json"; // Output format: html = HTML, json = JSON, pjson = pretty JSON
            logDebug("Using get token URL: " + postURL + "?" + postParameters);
            var postResult = aa.util.httpPost(postURL, postParameters);
            if (postResult.getSuccess()) {
                this.respObj = null;
                //logDebug("postResult: " + postResult + br + describe_TPS(postResult));
                logDebug("     response: " + postResult.getOutput());
                if (postResult.getOutput() && String(postResult.getOutput()) != "") {
                    resp = String(postResult.getOutput());
                    this.respObj = JSON.parse(resp);
                    if (this.respObj.error) {
                        logDebug("ERROR: mapService.getToken(). Reason: " + this.respObj.error.code + " " + this.respObj.error.message);
                        logDebug("     this.serviceURL: " + this.serviceURL + ", Parameters: " + postParameters);
                        logDebug("     response: " + resp);
                    }
                };
                logDebug("respObj: " + this.respObj + br + describe_TPS(this.respObj));
                this.tokenObj = this.respObj
                if (this.respObj && typeof (this.respObj) == "object") {
                    this.token = this.respObj.token;
                    this.tokenExpires = new Date(this.respObj.expires);
                    logDebug("token: " + this.token + ", expires: " + this.tokenExpires);
                }
                return this.respObj;
            } else {
                logDebug("this.serviceURL: " + this.serviceURL + ", Parameters: " + postParameters);
                logDebug("ERROR: mapService.getToken() unexpected error: " + postResult.getErrorMessage());
                return null;
            }
        } catch (err) {
            logDebug("ERROR: mapService.getToken() unexpected error: " + err.message);
            logDebug("Error occurred: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
            return null;
        }
        return null; // Should not get here.
    }

    this.getLayers = function () {
        // For more information see https://developers.arcgis.com/rest/services-reference/all-layers-and-tables.htm
        //  https://<mapservice-url>/layers
        try {
            this.respObj = null;
            var postURL = this.serviceURL + "/layers";
            var postParameters = (this.token ? "Token=" + this.token : "");
            postParameters += "&f=pjson" // Output format: html = HTML, pjson = JSON
            logDebug("Using get layers URL: " + postURL + "?" + postParameters);
            var postResult = aa.util.httpPost(postURL, postParameters);
            if (!postResult) {
                return null;
            } else if (postResult.getSuccess()) {
                //logDebug("     response: " + postResult.getOutput());
                if (postResult.getOutput() && String(postResult.getOutput()) != "") {
                    resp = String(postResult.getOutput());
                    this.respObj = JSON.parse(resp);
                    if (this.respObj.error) {
                        //logDebug("     this.serviceURL: " + this.serviceURL + ", Parameters: " + postParameters);
                        logDebug("ERROR: mapService.getLayers(). Reason: " + this.respObj.error.code + " " + this.respObj.error.message);
                        return null;
                    }
                    if (this.respObj) {
                        this.layers = null;
                        this.tables = null;
                        //logDebug("respObj: " + this.respObj + br + describe_TPS(this.respObj));
                        if (this.respObj.layers) {
                            this.layers = [];
                            var layers = this.respObj.layers
                            for (var ll in layers) {
                                //logDebug("layer[" + ll + "]: " + layers[ll].id + " " + layers[ll].name + " " + layers[ll].type)
                                this.layers[layers[ll].name] = layers[ll];
                            }
                        }
                        if (this.respObj.tables) {
                            this.tables = [];
                            var tables = this.respObj.tables
                            for (var ll in tables) {
                                //logDebug("tables[" + ll + "]: " + tables[ll].id + " " + tables[ll].name + " " + tables[ll].type)
                                this.tables[tables[ll].name] = tables[ll];
                            }
                        }
                    }
                }
            } else {
                //logDebug("this.serviceURL: " + this.serviceURL + ", Parameters: " + postParameters);
                logDebug("ERROR: mapService.getLayers(). error: " + postResult.getErrorMessage());
                return null;
            }
            return this.respObj;
        } catch (err) {
            logDebug("ERROR: mapService.getLayers() unexpected error: " + err.message);
            logDebug("Error occurred: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
            return null;
        }
        return null; // Should not get here.
    }

    this.query = function (mapLayerName, mapWhereClause) {
        // For more information see https://developers.arcgis.com/rest/services-reference/query-map-service-layer-.htm
        //  https://<mapservice-url>/<layerOrTableId>/query
        var outFields = (arguments.length > 2 && arguments[2] ? arguments[2] : "*"); // Return all fields if null
        var orderByFields = (arguments.length > 3 && arguments[3] ? arguments[3] : null); // order result by these fields.
        // longitude & latitude when querying using a point.
        var longitude = (arguments.length > 4 && arguments[4] ? arguments[4] : null);
        var latitude = (arguments.length > 5 && arguments[5] ? arguments[5] : null);
        try {
            var mapLayerID = null, mapQueryType = null;
            // Get MapLayerID for mapLayer
            if (this.layers) {
                if (typeof (this.layers[mapLayerName]) != "undefined") {
                    mapLayerID = this.layers[mapLayerName].id;
                    mapQueryType = this.layers[mapLayerName].type;
                }
            }
            if (mapLayerID == null && this.tables) {
                if (typeof (this.tables[mapLayerName]) != "undefined") {
                    mapLayerID = this.tables[mapLayerName].id;
                    mapQueryType = this.tables[mapLayerName].type;
                }
            }
            if (mapQueryType == null) {
                logDebug("Unable to find layer or table: " + mapLayerName);
                return null;
            }
            logDebug("Looking for " + mapQueryType + " " + mapLayerName + " ID: " + mapLayerID + " where " + mapWhereClause);
            this.respObj = null;
            var postURL = this.serviceURL + "/" + mapLayerID + "/query"
            postParameters = (this.token ? "Token=" + this.token : "");
            if (mapWhereClause) {
                postParameters += "&where=" + mapWhereClause.replace(/'/g, "%27").replace(/=/g, "%3D");
            } else {
                postParameters += "&where=";
            }
            postParameters += "&text="
            postParameters += "&objectIds="
            postParameters += "&time="
            postParameters += "&geometry="
            if (longitude && latitude) {
                postParameters += "&geometryType=esriGeometryPoint&geometry=" + longitude + "," + latitude;
                postParameters += "&inSR=4326"             // Input Spatial Reference: World Geodetic System 1984 (GCS_WGS_1984, EPSG:4326)
            } else {
                postParameters += "&geometryType=esriGeometryEnvelope";
                postParameters += "&inSR="
            }
            postParameters += "&spatialRel=esriSpatialRelIntersects"
            postParameters += "&relationParam="
            postParameters += "&outFields=" + outFields;
            postParameters += "&returnGeometry=false"
            postParameters += "&returnTrueCurves=false"
            postParameters += "&maxAllowableOffset="
            postParameters += "&geometryPrecision="
            postParameters += "&outSR="               // Output Spatial Reference
            postParameters += "&returnIdsOnly=false"
            postParameters += "&returnCountOnly=false"
            postParameters += "&orderByFields=" + (orderByFields ? orderByFields : "");
            postParameters += "&groupByFieldsForStatistics="
            postParameters += "&outStatistics="
            postParameters += "&returnZ=false"
            postParameters += "&returnM=false"
            postParameters += "&gdbVersion=" // Geodatabase Version Name
            postParameters += "&returnDistinctValues=false"
            postParameters += "&resultOffset="
            postParameters += "&resultRecordCount="
            postParameters += "&queryByDistance="
            postParameters += "&returnExtentsOnly=false"
            postParameters += "&datumTransformation="
            postParameters += "&parameterValues="
            postParameters += "&rangeValues="
            postParameters += "&f=json" // Output format: html = HTML, pjson = JSON 

            //logDebug("Using query " + mapQueryType + " URL: " + postURL + "?" + postParameters);
            var mapFields = null;
            var postResult = aa.util.httpPost(postURL, postParameters);
            if (!postResult) {
                return null;
            } else if (postResult.getSuccess()) {
                // logDebug("     response: " + postResult.getOutput());
                if (postResult.getOutput() && String(postResult.getOutput()) != "") {
                    var resp = String(postResult.getOutput());
                    this.respObj = JSON.parse(resp);
                    if (this.respObj.error) {
                        // mapServiceParameters are invalid. This will give an error (400 Failed to execute query). Check for valid mapLayerID, longitude, latitude, fieldNames.
                        if (this.respObj.error.code == 504) {
                            logDebug("     504 Gateway Timeout.");
                        }
                        if (this.respObj.error.code == 400) logDebug("     400 Bad Request. Check for invalid parameters.");
                        logDebug("     this.serviceURL: " + this.serviceURL + ", Parameters: " + postParameters);
                        logDebug("ERROR: mapService.query(). Reason: " + this.respObj.error.code + " " + this.respObj.error.message);
                        return null;
                    } else {
                        if (typeof (this.respObj["fields"]) != "undefined") {
                            mapFields = [];
                            var gisFields = this.respObj["fields"];
                            for (var f in gisFields) {
                                mapFields[gisFields[f].name] = gisFields[f];
                            }
                        }
                    }
                }
                if (mapFields) {
                    var mapFeatures = null;
                    if (typeof (this.respObj["features"]) != "undefined") {
                        mapFeatures = [];
                        var gisFeatures = this.respObj["features"];
                        for (var f in gisFeatures) {
                            mapFeature = gisFeatures[f]["attributes"];
                            if (typeof (mapFeature) != "undefined") {
                                // Fix Dates
                                if (mapFields) {
                                    for (var ff in mapFields) {
                                        if (mapFields[ff].type == "esriFieldTypeDate") {
                                            if (mapFeature[ff] != null && !isNaN(mapFeature[ff])) {
                                                mapFeature[ff] = new Date(mapFeature[ff]);
                                            } else {
                                                if (mapFeature[ff] != null)
                                                    logDebug(ff + " (Invalid Date): " + mapFeature[ff]);
                                                mapFeature[ff] = null;
                                            }
                                        }
                                    }
                                } else {
                                    mapFeature = gisFeatures[f]["attributes"];
                                }
                                mapFeatures.push(mapFeature);
                            }
                        }
                    }
                    return mapFeatures;
                }
            } else {
                logDebug("ERROR: mapService.query() unexpected error: " + postResult.getErrorMessage());
                return null;
            }
        } catch (err) {
            logDebug("ERROR: mapService.query() unexpected error: " + err.message);
            return null;
        }
        return this.respObj
    }

    if (this.username && this.password) { // Secure connection get token.
        this.getToken();
    }
    if (this.layers == null) {
        this.getLayers();
    }
}

function getCapsByParcel(parcelNumber) {
    //
    // returns and array of capids that match parcel.
    // ats, app type string to check for
    //
    var ats = (arguments.length > 1 && arguments[1] ? arguments[1] : null);
    var ignoreCapIds = (arguments.length > 2 && arguments[2] ? arguments[2] : null);

    var retArr = new Array();
    // get caps with same parcel
    var capAddResult = aa.cap.getCapListByParcelID(parcelNumber, null);
    if (!capAddResult.getSuccess()) {
        logDebug("**ERROR: getting similar parcels: " + capAddResult.getErrorMessage());
        return false;
    }
    var capIdArray = capAddResult.getOutput();

    // loop through related caps
    for (var cc in capIdArray) {
        // skip if current cap
        if (exists(capIdArray[cc].getCustomID(), ignoreCapIds)) continue;

        // get cap ids
        var relcap = aa.cap.getCap(capIdArray[cc].getCapID()).getOutput();
        // get cap type
        var reltypeArray = relcap.getCapType().toString().split("/");

        var isMatch = true;
        if (ats) {
            var ata = ats.split("/");
            if (ata.length != 4)
                logDebug("**ERROR: The following Application Type String is incorrectly formatted: " + ats);
            else
                for (xx in ata)
                    if (!ata[xx].equals(reltypeArray[xx]) && !ata[xx].equals("*"))
                        isMatch = false;
        }

        if (isMatch)
            retArr.push(capIdArray[cc]);

    } // loop through related caps

    if (retArr.length > 0)
        return retArr;
    else
        return null;
}

function parcelHasCondition(parcelNumber, pType) {
    var pStatus = (arguments.length > 2? arguments[2]:null);
    var pDesc = (arguments.length > 3 ? arguments[3] : null);
    var pImpact = (arguments.length > 4 ? arguments[4] : null);
    var pGroup = (arguments.length > 5 ? arguments[5] : null);
    // Checks to see if conditions have been added to CAP
    // 06SSP-00223
    //
    if (pType) {
        var parcCondResult = aa.parcelCondition.getParcelConditions(parcelNumber, pType);
    } else {
        var parcCondResult = aa.parcelCondition.getParcelConditions(parcelNumber);
    }
    if (!parcCondResult.getSuccess()) {
        logDebug("**WARNING: getting Parcel Conditions for " + parcelNumber 
        + ", type: " + pType + " : " + parcCondResult.getErrorMessage());
        return false;
    }

    var cStatus;
    var cDesc;
    var cImpact;

    var parcConds = parcCondResult.getOutput();
    for (cc in parcConds) {
        var thisCond = parcConds[cc];
        var cStatus = thisCond.getConditionStatus();
        var cDesc = thisCond.getConditionDescription();
        var cImpact = thisCond.getImpactCode();
        var cType = thisCond.getConditionType();
        var cGroup = thisCond.getConditionGroup();
        logDebug("Check " + parcelNumber + " Parcel Condition: " + (pGroup ? cGroup + "." : "") + (pType ? cType + " " : "") + cDesc + (pImpact ? ", Impact: " + cImpact : "") + (pStatus ? ", Status: " + cStatus : ""));
        if (cStatus == null) cStatus = " ";
        if (cDesc == null) cDesc = " ";
        if (cImpact == null) cImpact = " ";
        //Look for matching condition
        if (pDesc && !pDesc.toUpperCase().equals(cDesc.toUpperCase())) continue;
        if (pStatus && !pStatus.toUpperCase().equals(cStatus.toUpperCase())) continue;
        if (pImpact && !pImpact.toUpperCase().equals(cImpact.toUpperCase())) continue;
        if (pGroup && !pGroup.toUpperCase().equals(cGroup.toUpperCase())) continue;
        return true; //matching condition found
    }
    return false; //no matching condition found
} //function


function processingSet(desiredSetId) {
    this.id = desiredSetId;
    this.name = (arguments.length > 1 && arguments[1] ? arguments[1] : desiredSetId);
    this.type = (arguments.length > 2 && arguments[2] ? arguments[2] : null);
    this.comment = (arguments.length > 3 && arguments[3] ? arguments[3] : null);
    this.setType = (arguments.length > 4 && arguments[4] && exists(arguments[4].toLowerCase(), ['cap', 'parcel', 'sets', 'address', 'license_professional']) ? arguments[4].toLowerCase() : 'cap');
    this.setStatus = (arguments.length > 5 && arguments[5] ? arguments[5] : "");
    this.setStatusComment = (arguments.length > 6 && arguments[6] ? arguments[6] : "");

    logDebug("processing " + (this.setType ? this.setType : "")
        + " set: ID: " + desiredSetId
        + (this.name ? ", Name: " + this.name : "")
        + (this.type ? ", type: " + this.type : "")
        + (this.comment ? ", comment: " + this.comment : "")
    );

    this.size = 0;
    this.empty = true;
    this.members = new Array();
    this.status = "";
    this.statusComment = "";
    this.model = null;

    this.toString = function () {
        return this.setType + " set ID: " + this.id
            + (this.name ? ", name: " + this.name : "")
            + (this.type ? ", type: " + this.type : "")
            + (this.comment ? ", comment: " + this.comment : "")
            + (this.status ? ", status: " + this.status : "")
            + (this.size ? ", size: " + this.size : "");
    }
    this.refresh = function () {
        try {
            var theSet = aa.set.getSetByPK(this.id).getOutput();
            this.status = theSet.getSetStatus();
            this.setId = theSet.getSetID();
            this.name = theSet.getSetTitle();
            this.comment = theSet.getSetComment();
            this.model = theSet.getSetHeaderModel();
            this.statusComment = theSet.getSetStatusComment();

            if (this.setType == "cap") {
                var memberResult = aa.set.getCAPSetMembersByPK(this.id);
            } else if (this.setType == "parcel") {
                var memberResult = aa.set.getParcelSetMembersByPK(this.id);
            } else if (this.setType == "address") {
                var memberResult = aa.set.getAddressSetMembersByPK(this.id);
            } else if (this.setType == "license_professional") {
                var memberResult = aa.set.getLPSetMembersByPK(this.id);
            } else if (this.setType == "sets") {
                var memberResult = aa.set.getSetSetMembersByPK(this.id);
            } else { // CAP
                var memberResult = aa.set.getCAPSetMembersByPK(this.id);
            }

            if (!memberResult.getSuccess()) {
                logDebug("**WARNING** error loading " + this.setType + " set " + this.id + " of status " + this.status + " : " + memberResult.getErrorMessage());
                return null;
            } else {
                this.members = memberResult.getOutput().toArray();
                this.size = this.members.length;
                if (this.members.length > 0) this.empty = false;
                logDebug("Loaded " + this.setType + " set " + this.id + " of status " + this.status + " with " + this.size + " members");
            }
        } catch (err) {
            logDebug("ERROR: loading " + this.setType + " set " + this.id + " of status " + this.status + " : " + err.message);
            return null;
        }
        return memberResult;
    }

    this.add = function (setMemberID) {
        var setMemberStatus = (arguments.length > 1 ? arguments[1] : null);

        try {
            if (this.setType == "cap") {
                var addResult = aa.set.add(this.id, setMemberID);
            } else if (this.setType == "parcel") {
                logDebug("processing " + (this.setType ? this.setType : "")
                    + " set: ID: " + desiredSetId
                    //+ (this.name ? ", Name: " + this.name : "")
                    //+ (this.type ? ", type: " + this.type : "")
                    //+ (this.comment ? ", comment: " + this.comment : "")
                    + " adding Parcel: " + setMemberID
                );
                var addResult = aa.set.addParcelSetMember(this.id, setMemberID);
            } else if (this.setType == "address") {
                var addResult = aa.set.addAddressSetMember(this.id, setMemberID);
            } else if (this.setType == "license_professional") {
                var addLic = getRefLicenseProf(setMemberID);
                var addResult = aa.set.addLPSetMember(this.id, addLic.licSeqNbr);
            } else if (this.setType == "sets") {
                var addResult = aa.set.addSetofSetMember(this.id, setMemberID);
            } else { // CAP
                var addResult = aa.set.add(this.id, setMemberID);
            }

            if (!addResult.getSuccess()) {
                logDebug("**WARNING** error adding " + setMemberID + " to " + this.setType + " set " + this.id + " : " + addResult.getErrorMessage());
                return null;
            } else {
                logDebug("Added " + setMemberID + " to " + this.setType + " set " + this.id);
            }

            if (addResult && setMemberStatus) this.updateMemberStatus(setMemberID, setMemberStatus);
        } catch (err) {
            logDebug("ERROR: adding " + setMemberID + " to " + this.setType + " set " + this.id + " : " + err.message);
            return null;
        }
        return addResult;
    }

    this.updateMemberStatus = function (setMemberID, setMemberStatus) {
        try {
            // Update a SetMember Status for a Record in SetMember List.
            var setUpdateScript = aa.set.getSetDetailsScriptModel().getOutput();
            setUpdateScript.setSetID(this.id);          //Set ID
            setUpdateScript.setSetMemberStatus(setMemberStatus);
            setUpdateScript.setSetMemberStatusDate(aa.date.getCurrentDate());
            setUpdateScript.setServiceProviderCode(aa.getServiceProviderCode());

            if (this.setType == "cap") {
                setUpdateScript.setID1(setMemberID.getID1());
                setUpdateScript.setID2(setMemberID.getID2());
                setUpdateScript.setID3(setMemberID.getID3());
            } else if (this.setType == "parcel") {
                setUpdateScript.setParcelNumber(setMemberID);
            } else if (this.setType == "address") {
                setUpdateScript.setAddressNBR(setMemberID);
            } else if (this.setType == "license_professional") {
                var addLic = getRefLicenseProf(setMemberID);
                setUpdateScript.setLicenseSeqNBR(addLic.licSeqNbr);
            } else if (this.setType == "sets") {
                setUpdateScript.setChildSetID(setMemberID);
            } else if (setMemberID.getID1) { // CAP
                setUpdateScript.setID1(setMemberID.getID1());
                setUpdateScript.setID2(setMemberID.getID2());
                setUpdateScript.setID3(setMemberID.getID3());
            }

            var updateResult = aa.set.updateSetMemberStatus(setUpdateScript);
            if (updateResult.getSuccess()) {
                logDebug("Updated " + setMemberID + " to status " + setMemberStatus + " for " + this.setType + " set " + this.id);
            } else {
                logDebug("**WARNING** error updating " + setMemberID + " to status " + setMemberStatus + " for " + this.setType + " set " + this.id + " : " + updateResult.getErrorMessage());
                return null;
            }
        } catch (err) {
            logDebug("ERROR: updating " + setMemberID + " to status " + setMemberStatus + " for " + this.setType + " set " + this.id + " : " + err.message);
            return null;
        }
        return updateResult;
    }

    this.remove = function (setMemberID) {
        try {
            if (this.setType == "cap") {
                var removeResult = aa.set.removeSetHeadersListByCap(this.id, setMemberID)
            } else if (this.setType == "parcel") {
                var removeResult = aa.set.removeSetHeadersListByParcel(this.id, setMemberID)
            } else if (this.setType == "address") {
                var removeResult = aa.set.removeSetHeadersListByAddress(this.id, setMemberID)
            } else if (this.setType == "license_professional") {
                var removeLic = getRefLicenseProf(setMemberID);
                var removeResult = aa.set.removeSetHeadersListByLP(this.id, removeLic.licSeqNbr)
            } else if (this.setType == "sets") {
                var removeResult = aa.set.removeSetHeadersListByChild(this.id, setMemberID)
            } else { // CAP
                var removeResult = aa.set.removeSetHeadersListByCap(this.id, setMemberID)
            }

            if (!removeResult.getSuccess()) {
                logDebug("ERROR: removing " + setMemberID + " from " + this.setType + " set " + this.id + ": " + removeResult.getErrorMessage());
                return null;
            } else {
                logDebug("_Set: removed " + setMemberID + " from " + this.setType + " set " + this.id);
            }
        } catch (err) {
            logDebug("ERROR: removing " + setMemberID + " from " + this.setType + " set " + this.id + ": " + err.message);
            return null;
        }
    }

    this.update = function () {
        var sh = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.SetBusiness").getOutput();
        this.model.setSetID(this.setId);
        this.model.setSetTitle(this.name);
        this.model.setSetComment(this.comment);
        this.model.setSetStatus(this.status)
        this.model.setSetStatusComment(this.statusComment);
        if (this.setType == "cap") {
            this.model.setRecordSetType(this.type);
        } else {
            this.model.setRecordSetType(null);
        }

        logDebug("lpSet: updating set header information");
        try {
            var updateResult = sh.updateSetBySetID(this.model);
        } catch (err) {
            logDebug("**WARNING** error updating header for " + this.setType + " set " + this.id + " : " + err.message);
        }
    }

    // Create Set.
    try {
        var theSetResult = aa.set.getSetByPK(this.id);
        if (theSetResult.getSuccess()) {
            this.refresh();
        } else {  // add the set
            theSetResult = aa.set.createSet(this.id, this.name, this.setType, this.comment);
            if (!theSetResult.getSuccess()) {
                logDebug("**WARNING** error creating " + this.setType + " set " + this.id + " : " + theSetResult.getErrorMessage);
            } else {
                logDebug("Created new " + this.setType + " set " + this.id);
                if (this.setStatus != "" || this.setStatusComment != "") {
                    this.status = this.setStatus;
                    this.statusComment = this.setStatusComment;
                    this.update();
                }
                this.refresh();
            }
        }
    } catch (err) {
        logDebug("**WARNING** error updating header for " + this.setType + " set " + this.id + " : " + err.message);
    }

}

function copyConditionsFromParcel(parcelIdString) {
    var getFromCondResult = aa.parcelCondition.getParcelConditions(parcelIdString)
    if (getFromCondResult.getSuccess())
        var condA = getFromCondResult.getOutput();
    else { logDebug("**WARNING: getting parcel conditions: " + getFromCondResult.getErrorMessage()); return false }

    for (cc in condA) {
        var thisC = condA[cc];

        if (!appHasCondition(thisC.getConditionType(), null, thisC.getConditionDescription(), thisC.getImpactCode())) {
            var addCapCondResult = aa.capCondition.addCapCondition(capId, thisC.getConditionType(), thisC.getConditionDescription(), thisC.getConditionComment(), thisC.getEffectDate(), thisC.getExpireDate(), sysDate, thisC.getRefNumber1(), thisC.getRefNumber2(), thisC.getImpactCode(), thisC.getIssuedByUser(), thisC.getStatusByUser(), thisC.getConditionStatus(), currentUserID, "A", thisC.getConditionStatusType(), thisC.getDisplayConditionNotice(), thisC.getIncludeInConditionName(), thisC.getIncludeInShortDescription(), thisC.getInheritable(), thisC.getLongDescripton(), thisC.getPublicDisplayMessage(), thisC.getResolutionAction(), null, null, thisC.getConditionNumber(), thisC.getConditionGroup(), thisC.getDisplayNoticeOnACA(), thisC.getDisplayNoticeOnACAFee());
            if (addCapCondResult.getSuccess())
                logDebug("Successfully added condition (" + thisC.getImpactCode() + ") " + thisC.getConditionDescription());
            else
                logDebug("**ERROR: adding condition (" + thisC.getImpactCode() + "): " + addCapCondResult.getErrorMessage());
        }
        else
            logDebug("**WARNING: adding condition (" + thisC.getImpactCode() + "): condition already exists");

    }
}

function copyrefParcelConditions(refParcelIDSrc, refParcelIDTarget) {
    if (typeof (rTotals) == "undefined") rTotals = [];
    var processStatus = [];
    var parcCondResult = aa.parcelCondition.getParcelConditions(refParcelIDSrc);
    if (!parcCondResult.getSuccess()) {
        logDebug("**WARNING: getting Parcel Conditions using ParcelID: " + refParcelIDSrc + " " + parcCondResult.getErrorMessage());
        return false;
    }
    var parcCondArray = parcCondResult.getOutput();

    // Copy parent parcel conditions to child parcels.
    if (parcCondArray && parcCondArray.length > 0) {
        for (var thisParcCond in parcCondArray) {
            var thisCond = parcCondArray[thisParcCond];
            var cGroup = thisCond.getConditionGroup();
            var cType = thisCond.getConditionType();
            var cStatus = thisCond.getConditionStatus();
            var cStatusType = thisCond.getConditionStatusType();
            var cDesc = thisCond.getConditionDescription();
            var cImpact = thisCond.getImpactCode();
            var cType = thisCond.getConditionType();
            var cComment = thisCond.getConditionComment();
            var cExpireDate = thisCond.getExpireDate();
            var cPriority = null; //thisCond.getPriority();

            //Check if parcel condition exists on child
            if (parcelHasCondition(refParcelIDTarget, cType, cStatus, cDesc, cImpact)) {
                logDebug("Skip existing condition on Parcel " + childParcelID
                    + "  " + (cGroup ? cGroup : "") + "." + cType
                    + ": " + cDesc + ", Impact: " + cImpact);
                if (typeof (rTotals["Skipped Parcel Conditions"]) == "undefined") rTotals["Skipped Parcel Conditions"] = 0;
                rTotals["Skipped Parcel Conditions"]++;
            } else {
                //TODO: copy exactly from parent parcel condition
                //logDebug("thisCond: " + br + describe_TPS(thisCond));

                var cIssuedByUser = systemUserObj;
                if (thisCond.getIssuedByUser()) cIssuedByUser = thisCond.getIssuedByUser();
                var cStatusByUser = systemUserObj;
                if (thisCond.getIssuedByUser()) cStatusByUser = thisCond.getIssuedByUser();

                var addParcelCondResult = aa.parcelCondition.addParcelCondition(refParcelIDTarget, thisCond.getConditionType(), thisCond.getConditionDescription(), thisCond.getConditionComment(), null, null, thisCond.getImpactCode(), thisCond.getConditionStatus(), sysDate, thisCond.getExpireDate(), thisCond.getIssuedDate(), sysDate, cIssuedByUser, cStatusByUser, thisCond.getConditionStatusType(), thisCond.getDisplayConditionNotice(), thisCond.getIncludeInConditionName(), thisCond.getIncludeInShortDescription(), thisCond.getInheritable(), thisCond.getLongDescripton(), thisCond.getPublicDisplayMessage(), thisCond.getResolutionAction(), thisCond.getConditionGroup(), thisCond.getDisplayNoticeOnACA(), thisCond.getDisplayNoticeOnACAFee()); //, cPriority);

                if (!addParcelCondResult.getSuccess()) {
                    var errorMsg = "adding condition to Parcel " + childParcelID + " (" + cDesc + "): "
                        + "  " + (cGroup ? cGroup : "") + "." + cType 
                        + ": " + cDesc + ", Impact: " + cImpact
                        + ": " + addParcelCondResult.getErrorMessage();
                    logDebug("ERROR: " + errorMsg);
                    processStatus.push("Cannot add " + cDesc);
                    pTotals["Exceptions"]++;
                } else {
                    logDebug("Successfully added condition to Parcel " + childParcelID 
                        + "  " + (cGroup ? cGroup : "") + "." + cType
                        + ": " + cDesc + ", Impact: " + cImpact);
                    processStatus.push("Added " + cDesc)
                    if (typeof (rTotals["Copied Parcel Conditions"]) == "undefined") rTotals["Copied Parcel Conditions"] = 0;
                    rTotals["Copied Parcel Conditions"]++;
                }
            }
        }
    } else {
        processStatus.push("No Conditions");

    }
    return processStatus;
}

function describe_TPS(obj) {
    // Modified from describe to also include typeof & class of object; seperate Properties from Functions; Sort them; additional arguments.
    if (typeof (br) == "undefined") br = "<BR>";
    var newLine = "\n";
    var newLine = br;
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

function createPartialRecord(newCapType) {
    if (!servProvCode) servProvCode = aa.getServiceProviderCode();
    var newCapId = null;
    try {
        logDebug("New Partial CAP Type: " + newCapType);
        var newCapTypeArray = newCapType.split("/")
        if (newCapTypeArray.length == 4) {
            var vCapModel = aa.cap.capModel.getOutput();
            var vCapTypeModel = vCapModel.capType;
            vCapTypeModel.setServiceProviderCode(servProvCode);
            vCapTypeModel.setGroup(newCapTypeArray[0]);
            vCapTypeModel.setType(newCapTypeArray[1]);
            vCapTypeModel.setSubType(newCapTypeArray[2]);
            vCapTypeModel.setCategory(newCapTypeArray[3]);
            vCapModel.setCapType(vCapTypeModel);
            var s_result = aa.cap.createPartialRecord(vCapModel);
            if (s_result.getSuccess()) {
                newCapId = s_result.getOutput();
                logDebug("Created partial CAP Type: " + newCapType + ", ID: " + newCapId);
            } else {
                logDebug("ERROR: creating partial CAP Type: " + newCapType + " " + s_result.getErrorMessage());
            }
        } else {
            logDebug("ERROR: invalid CAP Type: " + newCapType);
        }
    } catch (err) {
        logDebug("createPartialRecord Error occurred: " + err.message);
    }
    return newCapId;
}

function getParcelListForAdminX() {
    var refParcelID = (arguments.length > 0 ? arguments[0] : null);
    var refPrclObj = aa.parcel.getParceListForAdmin(refParcelID, null, null, null, null, null, null, null, null, null);
    if (refPrclObj.getSuccess()) {
        var refParcels = refPrclObj.getOutput();
    } else {
        var refParcels = [];
    }
    return refParcels
}


function getParcelListForAdmin(parcel) {
    var ownerName = (arguments.length > 1 ? arguments[1] : null);
    var streetStart = (arguments.length > 2 ? arguments[2] : null);
    var streetEnd = (arguments.length > 3 ? arguments[3] : null);
    var houseFractionStart = (arguments.length > 4 ? arguments[4] : null);
    var houseFractionEnd = (arguments.length > 5 ? arguments[5] : null);
    var houseNumberAlphaStart = (arguments.length > 6 ? arguments[6] : null);
    var houseNumberAlphaEnd = (arguments.length > 7 ? arguments[7] : null);
    var streetDirection = (arguments.length > 8 ? arguments[8] : null);
    var streetPrefix = (arguments.length > 9 ? arguments[9] : null);
    var streetName = (arguments.length > 10 ? arguments[10] : null);
    var streetSuffix = (arguments.length > 11 ? arguments[11] : null);
    var streetSuffixDirection = (arguments.length > 12 ? arguments[12] : null);
    var unitType = (arguments.length > 13 ? arguments[13] : null);
    var unitStart = (arguments.length > 14 ? arguments[14] : null);
    var unitEnd = (arguments.length > 15 ? arguments[15] : null);
    var city = (arguments.length > 16 ? arguments[16] : null);
    var state = (arguments.length > 17 ? arguments[17] : null);
    var zipCode = (arguments.length > 18 ? arguments[18] : null);
    var county = (arguments.length > 19 ? arguments[19] : null);
    var country = (arguments.length > 20 ? arguments[20] : null);
    var levelPrefix = (arguments.length > 21 ? arguments[21] : null);
    var levelNumberStart = (arguments.length > 22 ? arguments[22] : null);
    var levelNumberEnd = (arguments.length > 23 ? arguments[23] : null);
    var refAddressId = (arguments.length > 24 ? arguments[24] : null);
    var primaryParcel = (arguments.length > 25 && exists(arguments[25], [false, "N"]) ? "N" : "Y");
    var itemCap = (arguments.length > 26 && arguments[26] ? arguments[26] : capId);

    var refParcels = [];
    var fMsg = "";
    fMsg += " to " + (arguments.length > 26 && arguments[26] ? "itemCap: " : "capId: ") + (itemCap && itemCap.getCustomID ? itemCap.getCustomID() : itemCap);
    if (parcel) {
        fMsg = "parcel # " + parcel + fMsg;
        //logDebug("Looking for reference parcel using " + fMsg);
        var refParcelValidateModelResult = aa.parcel.getParceListForAdmin(parcel, null, null, null, null, null, null, null, null, null);
    } else if (refAddressId) {
        fMsg = "refAddress # " + refAddressId + fMsg;
        //logDebug("Looking for reference parcel using " + fMsg);
        var refParcelValidateModelResult = aa.parcel.getPrimaryParcelByRefAddressID(refAddressId, "Y");
    } else if (addressStart && addressStreetName && addressStreetSuffix) {
        fMsg = "address # " + streetStart
            + (streetEnd ? " - " + streetEnd : "")
            + (streetDirection ? " " + streetDirection : "")
            + (streetName ? " " + streetName : "")
            + (streetSuffix ? " " + streetSuffix : "")
            + (unitStart ? ", Unit(s): " + unitStart : "")
            + (unitEnd ? " - " + unitEnd : "")
            + (addressCity ? " - " + addressCity : "")
            + (ownerName ? ", ownerName: " + ownerName : "")
            + fMsg;
        //logDebug("Looking for reference parcel using " + fMsg);
        var refParcelValidateModelResult = aa.address.getParcelListForAdmin(null, streetStart, streetEnd, streetDirection, streetName, streetSuffix, unitStart, unitEnd, city, ownerName, houseNumberAlphaStart, houseNumberAlphaEnd, levelPrefix, levelNumberStart, levelNumberEnd);
    } else if (ownerName) {
        fMsg = "ownerName: " + ownerName
            + fMsg;
        //logDebug("Looking for reference parcel using " + fMsg);
        var refParcelValidateModelResult = aa.address.getParcelListForAdmin(null, streetStart, streetEnd, streetDirection, streetName, streetSuffix, unitStart, unitEnd, city, ownerName, houseNumberAlphaStart, houseNumberAlphaEnd, levelPrefix, levelNumberStart, levelNumberEnd);
    } else {
        logDebug("Failed to create transactional Parcel. No parcel/address identified");
        return false;
    }
    
    if (!refParcelValidateModelResult.getSuccess()) {
        logDebug("Failed to get the parcel!" + refParcelValidateModelResult.getErrorMessage());
    } else {
        var refParcelValidateModelList = refParcelValidateModelResult.getOutput();
        if (refParcelValidateModelList == null) {
            logDebug("There is no parcel info.");
            var refParcelValidateModelList = [];
        }
        for (var i = 0; i < refParcelValidateModelList.length; i++) {
            var refParcelValidateModel = refParcelValidateModelList[i];
            //logDebug("refParcelValidateModel: " + refParcelValidateModel + br + describe_TPS(refParcelValidateModel, null, null, true));
            var refParcelModel = refParcelValidateModel.getParcelModel();
            //logDebug("refParcelModel: " + refParcelModel + br + describe_TPS(refParcelModel, null, null, true));
            // Check for those that getParcelListForAdmin doesn't handle.
            /* Ignored Parameters:
            if (houseFractionStart && houseFractionStart != refParcelModel.getHouseFractionStart()) continue;
            if (houseFractionEnd && houseFractionEnd != refParcelModel.getHouseFractionEnd()) continue;
            if (streetPrefix && streetPrefix != refParcelModel.getStreetPrefix()) continue;
            if (streetSuffixDirection && streetSuffixDirection != refParcelModel.getStreetSuffixdirection()) continue;
            if (unitType && unitType != refParcelModel.getUnitType()) continue;
            if (state && state != refParcelModel.getState()) continue;
            if (zipCode && zipCode != refParcelModel.getZip()) continue;
            if (county && county != refParcelModel.getCounty()) continue;
            if (country && country != refParcelModel.getCountry()) continue;
            */
            refParcels.push(refParcelValidateModel);
            logDebug("Found Parcel: " + refParcelModel.getParcel()
            //logDebug("refParcels[" + i + "]: " + refParcelModel.getParcel()
                + (refParcelModel.getPrimaryParcelFlag() && refParcelModel.getPrimaryParcelFlag() == "Y" ? ", Primary" : "")
                //+ (refParcelModel.getPrimaryFlag() && refParcelModel.getPrimaryFlag() == "Y" ? ", Primary" : "")
                //+ (refParcelModel.getRefParcelId() ? ", Id: " + refParcelModel.getRefParcelId() : "")
                //+ (refParcelModel.getRefParcelType() ? ", refParcelType: " + refParcelModel.getRefParcelType() : "")
            );
        }
    }
    return refParcels;
}

function addParcelFromRef(parcel) {
    var ownerName = (arguments.length > 1 ? arguments[1] : null);
    var streetStart = (arguments.length > 2 ? arguments[2] : null);
    var streetEnd = (arguments.length > 3 ? arguments[3] : null);
    var houseFractionStart = (arguments.length > 4 ? arguments[4] : null);
    var houseFractionEnd = (arguments.length > 5 ? arguments[5] : null);
    var houseNumberAlphaStart = (arguments.length > 6 ? arguments[6] : null);
    var houseNumberAlphaEnd = (arguments.length > 7 ? arguments[7] : null);
    var streetDirection = (arguments.length > 8 ? arguments[8] : null);
    var streetPrefix = (arguments.length > 9 ? arguments[9] : null);
    var streetName = (arguments.length > 10 ? arguments[10] : null);
    var streetSuffix = (arguments.length > 11 ? arguments[11] : null);
    var streetSuffixDirection = (arguments.length > 12 ? arguments[12] : null);
    var unitType = (arguments.length > 13 ? arguments[13] : null);
    var unitStart = (arguments.length > 14 ? arguments[14] : null);
    var unitEnd = (arguments.length > 15 ? arguments[15] : null);
    var city = (arguments.length > 16 ? arguments[16] : null);
    var state = (arguments.length > 17 ? arguments[17] : null);
    var zipCode = (arguments.length > 18 ? arguments[18] : null);
    var county = (arguments.length > 19 ? arguments[19] : null);
    var country = (arguments.length > 20 ? arguments[20] : null);
    var levelPrefix = (arguments.length > 21 ? arguments[21] : null);
    var levelNumberStart = (arguments.length > 22 ? arguments[22] : null);
    var levelNumberEnd = (arguments.length > 23 ? arguments[23] : null);
    var refAddressId = (arguments.length > 24 ? arguments[24] : null);
    var primaryParcel = (arguments.length > 25 && exists(arguments[25], [false, "N"]) ? "N" : "Y");
    var itemCap = (arguments.length > 26 && arguments[26] ? arguments[26] : capId);

    var capParcelObj = null;

    var fMsg = "";
    fMsg += " to " + (arguments.length > 2 && arguments[2] != null ? "itemCap: " : "capId: ") + (itemCap && itemCap.getCustomID ? itemCap.getCustomID() : itemCap);
    if (parcel) {
        fMsg = "parcel # " + parcel + fMsg;
        //logDebug("Looking for reference parcel using " + fMsg);
        var refParcelValidateModelResult = aa.parcel.getParceListForAdmin(parcel, null, null, null, null, null, null, null, null, null);
        //var refParcelValidateModelResult = aa.parcel.getParceListForAdmin(parcel, streetStart, streetEnd, streetDirection, streetName, streetSuffix, unitStart, unitEnd, city, ownerName, houseNumberAlphaStart, houseNumberAlphaEnd, levelPrefix, levelNumberStart, levelNumberEnd);
    } else if (refAddressId) {
        fMsg = "refAddress # " + refAddressId + fMsg;
        //logDebug("Looking for reference parcel using " + fMsg);
        var refParcelValidateModelResult = aa.parcel.getPrimaryParcelByRefAddressID(refAddressId, "Y");
    } else if (addressStart && addressStreetName && addressStreetSuffix) {
        fMsg = "address # " + streetStart
            + (streetEnd ? " - " + streetEnd : "")
            + (streetDirection ? " " + streetDirection : "")
            + (streetName ? " " + streetName : "")
            + (streetSuffix ? " " + streetSuffix : "")
            + (unitStart ? ", Unit(s): " + unitStart : "")
            + (unitEnd ? " - " + unitEnd : "")
            + (addressCity ? " - " + addressCity : "");
        + (ownerName ? ", ownerName: " + ownerName : "")
            + fMsg;
        //logDebug("Looking for reference parcel using " + fMsg);
        var refParcelValidateModelResult = aa.address.getParceListForAdmin(null, streetStart, streetEnd, streetDirection, streetName, streetSuffix, unitStart, unitEnd, city, ownerName, houseNumberAlphaStart, houseNumberAlphaEnd, levelPrefix, levelNumberStart, levelNumberEnd);
    } else {
        logDebug("Failed to create transactional Parcel. No parcel/address identified");
        return false;
    }

    if (!refParcelValidateModelResult.getSuccess()) {
        logDebug("xxFailed to get reference Parcel for " + fMsg + " Reason: " + refParcelValidateModelResult.getErrorMessage());
        return false;
    }

    var refParcelNumber = null;
    var refParcelModels = refParcelValidateModelResult.getOutput();
    if (refParcelModels && refParcelModels.length) {
        var prcl = refParcelModels[0].getParcelModel(); // Use 1st matching reference parcel
        var refParcelNumber = prcl.getParcelNumber();
        //if (primaryParcel) 
        prcl.setPrimaryParcelFlag("Y");
        var capPrclResult = aa.parcel.warpCapIdParcelModel2CapParcelModel(itemCap, prcl);
        if (capPrclResult.getSuccess()) {
            capPrcl = capPrclResult.getOutput();
            if (!capPrcl.l1ParcelNo) { logDebug("Updated Wrapped Parcel L1ParcelNo:" + prcl.getL1ParcelNo()); capPrcl.setL1ParcelNo(prcl.getL1ParcelNo()); }
            if (!capPrcl.UID) { logDebug("Updated Wrapped Parcel UID:" + prcl.getUID()); capPrcl.setUID(prcl.getUID()); }
            logDebug("Wrapped Transactional Parcel " + refParcelNumber + " with Reference Data: "
                + (capPrcl && capPrcl.parcelNumber ? ", parcelNumber: " + capPrcl.parcelNumber : "")
                + (capPrcl && capPrcl.l1ParcelNo ? ", l1ParcelNo: " + capPrcl.l1ParcelNo : "")
                + (capPrcl && capPrcl.UID ? ", UID: " + capPrcl.UID : ""));
            var capPrclCreateResult = aa.parcel.createCapParcel(capPrcl);
            if (capPrclCreateResult.getSuccess()) {
                logDebug("Created Transactional Parcel " + refParcelNumber + " with Reference Data");
                //capParcelObj = capPrclCreateResult.getOutput(); // Returns null
                //capParcelObj = getCapParcelObj();
                capParcelObj = true;
            } else {
                logDebug("Failed to create Transactional Parcel with APO Attributes for " + refParcelNumber + " on " + itemCap + " Reason: " + capPrclCreateResult.getErrorMessage());
            }
        } else {
            logDebug("Failed to create Transactional Parcel with APO Attributes for " + refParcelNumber + " on " + itemCap + " Reason: " + capPrclResult.getErrorMessage());
        }
    } else {
        logDebug("No matching reference Parcel for " + fMsg);
        return false;
    }

    return (capParcelObj ? capParcelObj : false);
}

function removeParcels() {
    var deleteFromCapId = (arguments.length > 0 && arguments[0]? arguments[0] : capId);
    if (deleteFromCapId) {
        var pbzns = aa.proxyInvoker.newInstance("com.accela.aa.aamain.parcel.ParcelBusiness").getOutput();
        var s_result = aa.cap.getCap(deleteFromCapId);
        if (s_result.getSuccess()) {
            var deleteFromCap = s_result.getOutput();
            var deleteFromCapModel = deleteFromCap.getCapModel();
            pbzns.removeParcel(deleteFromCapModel);
        }
    }
}

