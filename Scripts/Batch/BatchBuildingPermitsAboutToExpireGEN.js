/*------------------------------------------------------------------------------------------------------/
| Program: BatchBuildingPermitsAboutToExpire  Trigger: Batch    
| Client : Chesterfield County
|
| Version 1.0 - Ray Schug - TruePoint Solutions
|
|   Building/Permit/~/~
|   30 days before Permit Expiration 
|       if Record Status is not 'Issued' then add Adhoc Task 'Inactive Application',
|       if Record Status is 'Issued' then add Adhoc Task 'Inactive Permit'.
|
/------------------------------------------------------------------------------------------------------*/
if (aa.env.getValue("ScriptName") == "Test") {
    aa.env.setValue("batchJobName","Test");
    aa.env.setValue("CurrentUserID", "ADMIN");
    aa.env.setValue("maxRecords", 100);
}
logDebug("batchJobName: " + aa.env.getValue("batchJobName"));
logDebug("CurrentUserID: " + aa.env.getValue("CurrentUserID"));
logDebug("ScriptName: " + aa.env.getValue("ScriptName"));
logDebug("ScriptCode: " + aa.env.getValue("ScriptCode"));
logDebug("EventName: " + aa.env.getValue("EventName"));
/*------------------------------------------------------------------------------------------------------/
| START: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/
var showDebug = true;					                                  // Set to true to see debug messages in event log and email confirmation
var maxSeconds = 5 * 60;				                                  // Number of seconds allowed for batch run, usually < 5*60
var maxRecords = aa.env.getValue("maxRecords");
if (maxRecords == "" || isNaN(maxRecords)) maxRecords = null;
if (maxRecords) maxRecords = parseInt(maxRecords);

var currentUserID = aa.env.getValue("CurrentUserID");   		// Current User

//Variables needed to log parameters below in eventLog
var sysDate = aa.date.getCurrentDate();
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("batchJobName");
var agencyName = aa.getServiceProviderCode();

//Global variables
var startDate = new Date(aa.util.now());
var startTime = startDate.getTime();
var batchStartDate = new Date(aa.util.now());                                                         // System Date
var batchStartTime = batchStartDate.getTime();                                           // Start timer
var partialProcessCompletion = false;                                                                 // Variable to identify if batch script has timed out. Defaulted to "false".

var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var capId;                                                  // Variable used to hold the Cap Id value.
var senderEmailAddr = "noreply@chesterfield.gov"  //.replace("@","-"+agencyName+"@");                 // Email address of the sender
var emailAddress = "";                                      // Email address of the person who will receive the batch script log information
//var emailAddress = "rschug@truepointsolutions.com";
var emailAddress2 = "";                                     // CC email address of the person who will receive the batch script log information
var emailText = "";                                         // Email body
var emailAddressSummary = "";                               // Email address of the person who will receive the batch script summary
//var emailAddressSummary = "rschug@truepointsolutions.com";
var emailTextSummary = "";                                  // Email body for staff summary

if (isEmptyOrNull(emailAddress) && !isEmptyOrNull(batchJobName)) {
    var batchEngineObj = aa.proxyInvoker.newInstance("com.accela.v360.batchjob.BatchEngineBusiness");
    if (batchEngineObj.getSuccess()) {
        logDebug("agencyName:" + agencyName + " batchJobName:" + batchJobName);
        var batchJob = batchEngineObj.getOutput().getBatchJobByName(agencyName, batchJobName);
        if (batchJob != null) {
            var jobEmailID = batchJob.getEmailID();
            //logDebug("fetch email from job details:" + jobEmailID)
            if (!isEmptyOrNull(jobEmailID)) {
                //emailAddress = jobEmailID;
                emailAddressSummary = jobEmailID;
            }
        }
    }
}


//Parameter variables
var paramsOK = true;
var searchCapType = "Building/Permit/*/*" // Cap Type(s) that should be processed.
var sCapTypeArray = searchCapType.split("/");
var searchAppGroup = (sCapTypeArray.length > 0 && sCapTypeArray[0] != "*" ? sCapTypeArray[0] : null);
var searchAppType = (sCapTypeArray.length > 1 && sCapTypeArray[1] != "*" ? sCapTypeArray[1] : null);
var searchAppSubType = (sCapTypeArray.length > 2 && sCapTypeArray[2] != "*" ? sCapTypeArray[2] : null);
var searchAppCategory = (sCapTypeArray.length > 3 && sCapTypeArray[3] != "*" ? sCapTypeArray[3] : null);

// Cap Status that the batch script is suppose to process.
var searchAppStatusValid = ["Submitted", "Pending Applicant", "In Review", "Ready to Issue", "Issued", "Temporary CO Issued", "CO Ready to Issue", "Pending Certificate", "CO Issued", "Partial CO Issued", "Reinstated", "Extended", ""]
var searchAppStatusValid = null;
// Cap Status that the batch script is supposed to ignore.
var searchAppStatusInvalid = ["Completed", "Cancelled", "Expired", "Withdrawn"];

var searchAppSubGroupName = "GENERAL";                                      // Application Spec Info Subgroup Name that the ASI field is associated to.
var searchAppSpecInfoLabel = "Permit Expiration Date";                                   // ASI field name that the batch script is to search.

//var searchDateFrom = dateAdd(startDate, -90);
//var searchDateTo = dateAdd(startDate, 30);
var searchDateFrom = dateAdd(startDate, 30);
var searchDateTo = dateAdd(searchDateFrom, 0);
var capStatusNew = null; // "About to Expire";


/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
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
var doStdChoices = true; // compatibility default
var doScripts = false;
var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice).getOutput().size() > 0;
if (bzr) {
    var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "STD_CHOICE");
    doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";
    var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "SCRIPT");
    doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";
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

eval(getScriptText("INCLUDES_CUSTOM"));
eval(getScriptText("INCLUDES_BATCH"));

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

var showDebug = true;					                                  // Set to true to see debug messages in event log and email confirmation

/*------------------------------------------------------------------------------------------------------/
| END: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/
logDebug("searchCapType: " + searchCapType);
if (searchAppStatusValid) 
    logDebug("searchAppStatusValid: " + searchAppStatusValid);
logDebug("searchAppStatusInvalid: " + searchAppStatusInvalid);

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/------------------------------------------------------------------------------------------------------*/
if (paramsOK) {
    logDebug("Start of " + batchJobName + " Batch Job.");

    //Initialize Counters
    var counts = [];

    mainProcess();

    for (cc in counts) {
        logDebug("Number of Records " + cc + ": " + counts[cc]);
    }
    logDebug("End of " + batchJobName + " Batch Job, Elapsed Time : " + elapsed() + " Seconds.");
}

if (emailAddress.length) {
    logDebug("Sending " + batchJobName + " Results to " + emailAddress);
    aa.sendMail(senderEmailAddr, emailAddress, emailAddress2, batchJobName + " Results", emailText);
}

// Send Summary Email
if (emailAddressSummary.length) {
    logDebug("Sending " + batchJobName + " Results to " + emailAddressSummary);
    aa.sendMail(senderEmailAddr, emailAddressSummary, "", batchJobName + " Summary Results", (emailTextSummary? emailTextSummary:"No Records Processed"));
}


aa.print(">> emailText: \r" + emailText.replace(/<br>/g,"\r"));
aa.print(">> emailTextSummary: \r" + emailTextSummary.replace(/<BR>/g, "\r"));

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function mainProcess() {
    counts["found"] = 0;
    //counts["filtered"] = 0;
    counts["processed"] = 0;
    //counts["already processed"] = 0;
    counts["Child"] = 0;
    /*
    | Note: Start Date and End Date are defaulted to use the current System Date.
    |       To set the Start Date and End Date to specific values for a manual run
    |       replace the following syntax dateAdd(null,-1) to a string date value
    |       in the following format "MM/DD/YYYY".
    */
    var dateFrom = aa.date.parseDate(searchDateFrom);        // Start Date for the batch script to select ASI data on.
    var dateTo = aa.date.parseDate(searchDateTo);               // End Date for the batch script to select ASI data on.
    var searchMsg = searchAppSubGroupName + "." + searchAppSpecInfoLabel + " with Date Range: " + searchDateFrom + " - " + searchDateTo;
    logDebug("Looking for Caps with " + searchMsg);
    var capIdResult = aa.cap.getCapIDsByAppSpecificInfoDateRange(searchAppSubGroupName, searchAppSpecInfoLabel, dateFrom, dateTo);
    if (!capIdResult.getSuccess()) {
        logDebug("**ERROR: Retrieving Caps with " + searchMsg + ": " + capIdResult.getErrorMessage());
        return false;
    }

    var capIdArray = capIdResult.getOutput(); //Array of CapIdScriptModel Objects
    //logDebug("capIdArray.length: " + capIdArray.length);
    counts["found"] = capIdArray.length;
    for (i in capIdArray) {
        if (maxSeconds && elapsed() > maxSeconds) { // Only continue if time hasn't expired
            logDebug("WARNING: Partial completion of this process caused by script timeout.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.");
            partialProcessCompletion = true;
            break;
        }
        if (maxRecords && counts["processed"] >= maxRecords) { // Only continue if max # of records hasn't been reached.
            logDebug("WARNING: Partial Completion of this process because maximum records reached.  Please re-run.  " + counts["processed"] + " records, " + maxRecords + " allowed.");
            partialProcessCompletion = true;
            break;
        }

        capId = capIdArray[i].getCapID(); // CapIDModel Object
        if (capId == null) continue;
        servProvCode = capId.getServiceProviderCode();
        capIDString = capId.getCustomID();
        customId = capId.getCustomID(); // Alternate Cap ID string
        cap = aa.cap.getCap(capId).getOutput();
        appTypeResult = cap.getCapType();
        appTypeAlias = appTypeResult.getAlias();
        appTypeString = appTypeResult.toString();
        appTypeArray = appTypeString.split("/");
        capName = cap.getSpecialText();
        capStatus = cap.getCapStatus();
        partialCap = !cap.isCompleteCap();

        var capIDsFiltered = [];
        var filterReasons = [];
        if (partialCap) filterReasons.push("Partial Cap");
        if (searchCapType && !appMatch(searchCapType)) filterReasons.push("CapType");
        if (appMatch("Building/Permit/Elevator/Master")) filterReasons.push("Elevator Master");
        if (searchAppStatusValid && !exists(capStatus, searchAppStatusValid)) filterReasons.push("CapStatusValid");
        if (searchAppStatusInvalid && exists(capStatus, searchAppStatusInvalid)) filterReasons.push("CapStatusInvalid");
        if (filterReasons && filterReasons.length > 0) {
            //logDebug("Skipped Record: " + capIDString + ", appType: " + appTypeString + ", capStatus: " + capStatus + (searchAppSpecInfoLabel ? ", " + searchAppSpecInfoLabel + ": " + AInfo[searchAppSpecInfoLabel] : "") + ", Reasons: " + filterReasons);
            capIDsFiltered[capId.getCustomID()] = filterReasons;
            //counts["filtered"]++;
            continue;
        }

        var adHocProcess = "ADHOC_WF";
        var adHocTask = "Inactive Application";
        if (capStatus == "Issued") adHocTask = "Inactive Permit";
        var adHocTaskAssignID = null;
        if (appMatch("Building/Permit/*/Amendment") || appMatch("Building/Permit/*/AmendmentTrade") || appMatch("Building/Permit/*/Renewal")) {
            var adHocTaskAssignID = null;

        } else if (appMatch("Building/Permit/Residential/*")) { // Residential Building, Residential Trades, Residential Elevator 
            if (capStatus == "Issued") {
                adHocTaskAssignID = "BROOKSJ"; // Jeff Brooks
            } else {
                adHocTaskAssignID = "EUTSEYM"; // Mike Eutsey
            }
        } else { // Commercial Building, Commercial Trade, Commercial Elevator installation, Signs, Amusements 
            if (capStatus == "Issued") {
                adHocTaskAssignID = "CONDREYC"; // Craig Condrey
            } else {
                adHocTaskAssignID = "SLATER"; // Rodger Slate
            }
        }
        var adHocTaskStatus = "About to Expire";
        if (adHocTaskStatus && adHocTaskStatus == "") adHocTaskStatus = null;
        var adHocTaskComment = "Updated via batch script";
        var adHocNote = "";

        //eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null, useCustomScriptFile));
        getCapGlobals(capId);

        // Check if already processed
        // logDebug("Record: " + capIDString + ", appType: " + appTypeString + ", capStatus: " + capStatus + ", parentCapId: " + parentCapId);
        if (!parentCapId) { 
            //parentCapId = getParent(); 
            getCapResult = aa.cap.getProjectParents(capId, 1);
            if (getCapResult.getSuccess()) {
                parentArray = getCapResult.getOutput();
                if (parentArray.length)
                    parentCapId = parentArray[0].getCapID();
            }
        }
        //if (!parentCapId) { parentCapId = getParent(); }
        //if (!parentCapId) { parentCapId = getParentLicenseCapID(capId); }

        if (parentCapId) {
            parentCap = aa.cap.getCap(parentCapId).getOutput();
            parentAppTypeResult = parentCap.getCapType();
            parentAppTypeAlias = parentAppTypeResult.getAlias();
            parentAppTypeString = parentAppTypeResult.toString();
            parentCapStatus = cap.getCapStatus();
            parentExpDate = getAppSpecific(searchAppSpecInfoLabel, parentCapId);
            logDebug("Checking Parent: " + parentCapId.getCustomID() + " " + parentAppTypeString + ", Status: " + parentCapStatus + ", " + searchAppSpecInfoLabel + ": " + parentExpDate);

//          && (appMatch("Building/Permit/Commercial/*") || appMatch("Building/Permit/Residential/*"))
            if (!(appMatch("Building/Permit/*/NA") || appMatch("Building/Permit/*/Multi-Family"))) {
                parentCap = aa.cap.getCap(parentCapId).getOutput();
                parentAppTypeResult = parentCap.getCapType();
                parentAppTypeAlias = parentAppTypeResult.getAlias();
                parentAppTypeString = parentAppTypeResult.toString();
                parentCapStatus = cap.getCapStatus();
                parentExpDate = getAppSpecific(searchAppSpecInfoLabel, parentCapId);

                //var tasks = loadTasks(parentCapId);
                logDebug("Skipped Record: " + capIDString + ", appType: " + appTypeString + ", capStatus: " + capStatus + (searchAppSpecInfoLabel ? ", " + searchAppSpecInfoLabel + ": " + AInfo[searchAppSpecInfoLabel] : "") + ", Reasons: Child of " + parentCapId.getCustomID() + " " + parentAppTypeString + ", Status: " + parentCapStatus + ", " + searchAppSpecInfoLabel + ": " + parentExpDate);
                counts["Child"]++;
                capIDsFiltered[capId.getCustomID()] = ["Child"];
                continue;
            }
        }

        var tasks = loadTasks(capId);
        if (adHocTask && typeof (tasks[adHocTask]) != "undefined") {
            if (adHocTaskStatus && adHocTaskStatus == tasks[adHocTask].status && tasks[adHocTask].active == "Y") {
                logDebug("Skipped Record: " + capIDString + ", appType: " + appTypeString + ", capStatus: " + capStatus + (searchAppSpecInfoLabel ? ", " + searchAppSpecInfoLabel + ": " + AInfo[searchAppSpecInfoLabel] : "") + ", Reasons: already processed. "
                + (tasks[adHocTask].active == "Y" ? "Active" : "") + " " + adHocTask + " " + tasks[adHocTask].status + ": " + tasks[adHocTask].statusdate);
                //counts["already processed"]++;
                capIDsFiltered[capId.getCustomID()] = ["already processed"];
                continue;
            }
        }

        logDebug("Processing Record: " + capIDString
            + ", appType: " + appTypeString + ", capStatus: " + capStatus
            + (searchAppSpecInfoLabel ? ", " + searchAppSpecInfoLabel + ": " + AInfo[searchAppSpecInfoLabel] : ""));
        counts["processed"]++;

        var emailAddressSummary = "";                                 // Email address of the person who will receive the batch script summary
        emailTextSummary += (emailTextSummary == ""? "Processed these records":"") + br
            + "Record: " + capIDString
            + ", appType: " + appTypeString + ", capStatus: " + capStatus
            + (searchAppSpecInfoLabel ? ", " + searchAppSpecInfoLabel + ": " + AInfo[searchAppSpecInfoLabel]:"")
        //  + (adHocTask ? ", task: " + adHocTask 
        //  + (adHocTaskStatus ? " with status: " + adHocTaskStatus : "") 
        //  + (adHocTaskAssignID? " assigned to " + adHocTaskAssignID:""):"");

        //Expire Building Caps that have a Cap Status of "Issued".
        // If adHocTask does not exist add it.
        try {
            if (adHocTask) {
                if (typeof (tasks[adHocTask]) == "undefined") {
                    logDebug("Adding Workflow Task " + adHocTask + ", capId: " + capId + " " + capId.getCustomID());
                    addAdHocTask(adHocProcess, adHocTask, adHocNote);
                    var tasks = loadTasks(capId);
                }
                if (adHocTaskStatus && adHocTaskStatus != tasks[adHocTask].status) {
                    updateTask(adHocTask, adHocTaskStatus, adHocTaskComment, adHocNote);
                }
                if (tasks[adHocTask].active != "Y") {
                    activateTask(adHocTask);
                }
                if (adHocTaskAssignID)
                    assignTask(adHocTask,adHocTaskAssignID);
                if (capStatusNew)
                    updateAppStatus(capStatusNew);
            }
        } catch (err) {
            var context = "mainProcess()"
            logDebug("ERROR: " + err.message + " In " + context + " Line " + err.lineNumber);
            logDebug("Stack: " + err.stack);
        }
    }
    return counts["processed"];
}

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/

function elapsed() {
    var thisDate = new Date(aa.util.now());
    var thisTime = thisDate.getTime();
    return ((thisTime - batchStartTime) / 1000)
}

// exists:  return true if Value is in Array
function exists(eVal, eArray) {
    for (ii in eArray)
        if (eArray[ii] == eVal) return true;
    return false;
}

function matches(eVal, argList) {
    for (var i = 1; i < arguments.length; i++)
        if (arguments[i] == eVal)
            return true;

}

function isNull(pTestValue, pNewValue) {
    if (pTestValue == null || pTestValue == "")
        return pNewValue;
    else
        return pTestValue;
}

function isEmptyOrNull(value) {
    return value == null || value === undefined || String(value) == "";
}

function logMessage(etype, edesc) {
    aa.eventLog.createEventLog(etype, "Batch Process", batchJobName, sysDate, sysDate, "", edesc, batchJobID);
    aa.print(etype + " : " + edesc);
    emailText += etype + " : " + edesc + "<br />";
}

function logDebug(edesc) {
    if (showDebug) {
        aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, sysDate, sysDate, "", edesc, batchJobID);
        aa.print(edesc);
        emailText += "DEBUG : " + edesc + " <br />";
    }
}

function logDebug(dstr) {
    if (showDebug) {
        aa.print(dstr)
        emailText += dstr + "<br>";
        // disabled to cut down on event log entries.
        //aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr);
        //aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, aa.date.getCurrentDate(), aa.date.getCurrentDate(), "", dstr, batchJobID);
    }
}

function getCapGlobals(itemCap) {
    capId = null,
    cap = null,
    capIDString = "",
    appTypeResult = null,
    appTypeAlias = "",
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

    capId = itemCap;
    if (capId && capId.getCustomID() == null) {
        var s_capResult = aa.cap.getCapID(capId.getID1(), capId.getID2(), capId.getID3());
        if (!s_capResult.getSuccess()) {
            logDebug("**ERROR: Failed to get capId: " + s_capResult.getErrorMessage());
            return null;
        }
        capId = s_capResult.getOutput();
    }
    if (capId != null) {
        servProvCode = capId.getServiceProviderCode();
        capIDString = capId.getCustomID();
        customId = capId.getCustomID(); // Alternate Cap ID string
        cap = aa.cap.getCap(capId).getOutput();
        capGroup = cap.getCapType().getGroup(); // Cap Type Group
        capType = cap.getCapType().getType(); // Cap Per Type
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
        // loadASITables();
    }

}

function convertDate(thisDate) {

    if (typeof (thisDate) == "string") {
        var retVal = new Date(String(thisDate));
        if (!retVal.toString().equals("Invalid Date"))
            return retVal;
    }

    if (typeof (thisDate) == "object") {

        if (!thisDate.getClass) // object without getClass, assume that this is a javascript date already
        {
            return thisDate;
        }

        if (thisDate.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime")) {
            return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
        }

        if (thisDate.getClass().toString().equals("class com.accela.aa.emse.util.ScriptDateTime")) {
            return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
        }

        if (thisDate.getClass().toString().equals("class java.util.Date")) {
            return new Date(thisDate.getTime());
        }

        if (thisDate.getClass().toString().equals("class java.lang.String")) {
            return new Date(String(thisDate));
        }
        if (thisDate.getClass().toString().equals("class java.sql.Timestamp")) {
            return new Date(thisDate.getMonth() + "/" + thisDate.getDate() + "/" + thisDate.getYear());
        }
    }

    if (typeof (thisDate) == "number") {
        return new Date(thisDate);  // assume milliseconds
    }

    logDebug("**WARNING** convertDate cannot parse date : " + thisDate);
    return null;

}

function dateAdd(td, amt)
// perform date arithmetic on a string
// td can be "mm/dd/yyyy" (or any string that will convert to JS date)
// amt can be positive or negative (5, -3) days
// if optional parameter #3 is present, use working days only
{

    var useWorking = false;
    if (arguments.length == 3)
        useWorking = true;

    if (!td) dDate = new Date(aa.util.now());
    else
        dDate = convertDate(td);

    var i = 0;
    if (useWorking)
        if (!aa.calendar.getNextWorkDay) {
            logDebug("getNextWorkDay function is only available in Accela Automation 6.3.2 or higher.");
            while (i < Math.abs(amt)) {
                dDate.setDate(dDate.getDate() + parseInt((amt > 0 ? 1 : -1), 10));
                if (dDate.getDay() > 0 && dDate.getDay() < 6)
                    i++
            }
        } else {
            while (i < Math.abs(amt)) {
                if (amt > 0) {
                    dDate = new Date(aa.calendar.getNextWorkDay(aa.date.parseDate(dDate.getMonth() + 1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
                    i++;
                } else {
                    dDate = new Date(aa.calendar.getPreviousWorkDay(aa.date.parseDate(dDate.getMonth() + 1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
                    i++;

                }
            }
        }
    else
        dDate.setDate(dDate.getDate() + parseInt(amt, 10));

    return (dDate.getMonth() + 1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
} 
