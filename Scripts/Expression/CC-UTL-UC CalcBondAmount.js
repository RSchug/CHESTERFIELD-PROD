// Expression Name: CC-UTL-UC CalcBondAmount
//      Target Portlet: Custom Fields
//      Execute Order:
//      Execute Expression In: [ ] ACA Only [x] AA Only [ ]Both
//      Edit Mode: [ ] Wizard Mode [X]Script Mode
//      Execute Fields:
//          onLoad
//          onSubmit
//			(on Field Change)
//
// Script:
var expressionName = expression.expressionName;

var showMessage = false;		// Set to true to see results in form message
var showDebug = false;			// Set to true to see debug messages in form message
var disableTokens = false;		// turn off tokenizing of std choices (enables use of "{} and []")
var useAppSpecificGroupName = false;	// Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false;	// Use Group name when populating Task Specific Info Values
var enableVariableBranching = true;	// Allows use of variable names in branching.  Branches are not followed in Doc Only
var maxEntries = 99;			// Maximum number of std choice entries.  Entries must be Left Zero Padded

var debugUserIDs = ["RSCHUG"];	// List of UserIDs to turn on debug for.
var supervisor = false;
var supervisorUserIDs = [];		// List of supervisor UserIDs

var cancel = false;
var debug = "";
var message = "";
var br = "<BR>";

var msgFormatInfoBegin = "<font color=Blue>";
var msgFormatInfoEnd = "</font>";
var msgFormatWarnBegin = "<font color=Orange>";
var msgFormatWarnEnd = "</font>";
var msgFormatDebugBegin = "<font color=Purple>";
var msgFormatDebugEnd = "</font>";
var msgFormatValidBegin = "<font color=Green>";
var msgFormatValidEnd = "</font>";

/*---------------- Required variables for using included functions and scripts ----------------------------*/
var aa = expression.getScriptRoot();
var today = expression.getValue("$$today$$").value;
var servProvCode = expression.getValue("$$servProvCode$$").value;
var module = expression.getValue("$$module$$").value;
var userID = expression.getValue("$$userID$$").value;
var gaUserID = expression.getValue("$$gaUserID$$").value;
var userfullname = expression.getValue("$$userfullname$$").value;
var userfirstName = expression.getValue("$$firstName$$").value;
var usermiddleName = expression.getValue("$$middleName$$").value;
var userlastName = expression.getValue("$$lastName$$").value;
var userGroup = expression.getValue("$$userGroup$$").value;
var userDepartment = expression.getValue("$$department$$").value;
var publicuser_email = expression.getValue("$$publicuser_email$$").value;

var totalRowCount = expression.getTotalRowCount();
var startTime = new Date();
var SCRIPT_VERSION = 3.0;

var publicUser = false,
    publicUserID = null,
    publicUserEmail = null;
var systemUserObj = null;  							// Current User Object
var currentUserGroup = null;						// Current User Group
var currentUserGroup = userGroup;

var currentUserID = userID;
if (userID != gaUserID) {
    publicUser = true;
    publicUserID = userID;
    publicUserEmail = publicuser_email;
}
if (currentUserID != null) {
    systemUserObj = aa.person.getUser(currentUserID).getOutput();  	// Current User Object
}

// Migrate to INCLUDES_EXPRESSION_GLOBALS
if (exists(currentUserID, debugUserIDs)) showDebug = true;	// Set to true to see debug messages in form message (Debug Users)
if (exists(currentUserID, supervisorUserIDs)) supervisor = true;

/*------------------ Set context variables -------------------/
| Include the expression object for the ASI fields you want to update here
| Not sure why these are needed but they will not update if not included here
| Even when commented out they are still read by the expression engine
/------------------------------------------------------------*/
var thisForm = expression.getValue("ASI::FORM"); // be sure to update this as neccessary depending on target portlet.

var asiFields = [];
asiFields["Associated Project 1"] = expression.getValue("ASI::CC-UTL-BOND-INFO::Associated Project 1");
asiFields["Associated Project 2"] = expression.getValue("ASI::CC-UTL-BOND-INFO::Associated Project 2");
asiFields["Associated Project 3"] = expression.getValue("ASI::CC-UTL-BOND-INFO::Associated Project 3");
asiFields["Commercial Project"] = expression.getValue("ASI::CC-UTL-PROJ-INFO::Commercial Project");
asiFields["Original Bond Amount"] = expression.getValue("ASI::CC-UTL-BOND-INFO::Original Bond Amount");
asiFields["Sewer Estimated Total Cost"] = expression.getValue("ASI::CC-UTL-BOND-INFO::Sewer Estimated Total Cost");
asiFields["Water Estimated Total Cost"] = expression.getValue("ASI::CC-UTL-BOND-INFO::Water Estimated Total Cost");
asiFields["Sewer Percent Complete"] = expression.getValue("ASI::CC-UTL-STATUS::Sewer Percent Complete");
asiFields["Water Percent Complete"] = expression.getValue("ASI::CC-UTL-STATUS::Water Percent Complete");
asiFields["Sewer Bond Override Amount"] = expression.getValue("ASI::CC-UTL-BOND-INFO::Sewer Bond Override Amount");
asiFields["Water Bond Override Amount"] = expression.getValue("ASI::CC-UTL-BOND-INFO::Water Bond Override Amount");
asiFields["Utility Bond Amount Required"] = expression.getValue("ASI::CC-UTL-BOND-INFO::Utility Bond Amount Required");

var capFields = [];
capFields["altID"] = expression.getValue("CAP::capModel*altID");
capFields["capID"] = expression.getValue("CAP::capID");
capFields["capStatus"] = expression.getValue("CAP::capModel*capStatus");
capFields["capType"] = expression.getValue("CAP::capType");
capFields["specialText"] = expression.getValue("CAP::capModel*specialText");
capFields["createdByACA"] = expression.getValue("CAP::capModel*createdByACA");
capFields["initiatedProduct"] = expression.getValue("CAP::capModel*initiatedProduct");
capFields["generatedByCloning"] = expression.getValue("CAP::capDetailModel*generatedByCloning");
capFields["shortNotes"] = expression.getValue("CAP::capDetailModel*shortNotes");
capFields["url"] = expression.getValue("CAP::capDetailModel*url");

var capId1 = expression.getValue("$$capID1$$").value;
var capId2 = expression.getValue("$$capID2$$").value;
var capId3 = expression.getValue("$$capID3$$").value;

var capId = null,
    cap = null,
    capIDString = capFields["altID"].value,
    appTypeResult = null,
    appTypeString = capFields["capType"].value,
    appTypeArray = (appTypeString ? appTypeString.split("/") : []),
    capName = capFields["specialText"].value,
    capStatus = capFields["capStatus"].value,
    partialCap = true;

var capIdString = capId1.value + "-" + capId2.value + "-" + capId3.value;
var capId = aa.cap.getCapID(capId1.value, capId2.value, capId3.value).getOutput();
if (capId) {
    //if (capId && capId.getCustomID() == capFields["altID"].value && false) {
    capServProvCode = capId.getServiceProviderCode();
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
}

/*---------------- If needed pull in includes ------------------*/
try {
    var useCustomScriptFile = true;  // if true, use Events->Custom Script and Master Scripts, else use Events->Scripts->INCLUDES_*
    //	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useCustomScriptFile));
    //	eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,useCustomScriptFile));
    //	eval(getScriptText("INCLUDES_CUSTOM",null,useCustomScriptFile));
    eval(getScriptText("INCLUDES_EXPRESSION", null));
    eval(getScriptText("INCLUDES_EXPRESSION_GLOBALS", null));
} catch (err) {
    handleError_EXP(err, expressionName);
}
/*------------------- Overridden Standard Functions --------------------- */
if (true) { // Override Standard Function. These should normally be placed in INCLUDES_EXPRESSION script.
    function handleError(err, context) { // Override INCLUDES_ACCELA_FUNCTIONS so message is displayed on Form.
        var rollBack = true;
        var showError = true;

        if (showError) showDebug = true;
        thisForm.message = "**Error " + err.message + " In " + context + " Line " + err.lineNumber;
        expression.setReturn(thisForm);

        aa.print((rollBack ? "**ERROR** " : "ERROR: ") + err.message + " In " + context + " Line " + err.lineNumber);
        aa.print("Stack: " + err.stack);
    }

    function logDebug(dstr) { // Override INCLUDES_ACCELA_FUNCTIONS
        debug += dstr + br;
    }

    function logMessage(dstr) { // Override INCLUDES_ACCELA_FUNCTIONS
        message += dstr + br;
    }

    var toPrecision = function (value) {
        if (value == null) return 0;
        var multiplier = (arguments.length > 1 && arguments[1] ? Math.pow(10, parseInt(arguments[1])) : 1000);
        return Math.round(value * multiplier) / multiplier;
    }
}

/*-------------------------- Your Custom Code -----------------------------*/
var msg = "";
var validprojectAppTypeAlias = ["Utility Construction"];
var validprojectCapStatuses = ["Submitted", "Extended", "Reinstated"];

try {
    logDebug("EMSE Script Framework Versions");
    logDebug("Expression: " + expressionName);
    //	logDebug("INCLUDE VERSION: " + INCLUDE_VERSION);
    logDebug("SCRIPT VERSION : " + SCRIPT_VERSION);

    logDebug("EMSE Script Results for <B>" + capFields["altID"].value + " " + capIDString + "</B>");
    logDebug("capId = " + (capId ? capId + " " + capId.getClass() : null) + ", capID: " + capFields["capID"].value);
    logDebug("cap = " + (cap ? cap.getClass() : null));
    logDebug("currentUserID = " + userID + " " + gaUserID + " " + userfullname + (publicuser_email ? ", publicuser_email: " + publicuser_email : ""));
    logDebug("currentUserGroup = " + currentUserGroup + ", userGroup: " + userGroup);
    logDebug("userDepartment = " + userDepartment);
    logDebug("systemUserObj = " + (systemUserObj ? systemUserObj.getClass() : null));
    logDebug("appTypeString = " + appTypeString + ", capType: " + capFields["capType"].value);
    logDebug("appTypeArray = " + appTypeArray.join("/") + (appTypeResult ? ", alias: " + appTypeResult.getAlias() : ""));
    logDebug("capName = " + capFields["specialText"].value + (cap ? " " + capName : ""));
    logDebug("capStatus = " + capFields["capStatus"].value + (cap ? " " + capStatus : ""));
    logDebug("partialCap = " + partialCap);
    logDebug("module = " + module);

    logDebug("createdByACA = " + capFields["createdByACA"].value);
    logDebug("initiatedProduct = " + capFields["initiatedProduct"].value);
    logDebug("generatedByCloning = " + capFields["generatedByCloning"].value);
    logDebug("shortNotes = " + capFields["shortNotes"].value);
    logDebug("url = " + capFields["url"].value);


    // Custom Code here.
    var bondTotal = 0, bondTotalSewer = 0, bondTotalSewer = 0;
    var estCostWater = 0;
    if (asiFields["Water Estimated Total Cost"].value && asiFields["Water Estimated Total Cost"].value > 0)
        estCostWater = parseFloat(asiFields["Water Estimated Total Cost"].value);
    var estCostSewer = 0;
    if (asiFields["Sewer Estimated Total Cost"].value && asiFields["Sewer Estimated Total Cost"].value > 0)
        estCostSewer = parseFloat(asiFields["Sewer Estimated Total Cost"].value);
    var percentCompleteWater = 0;
    if (asiFields["Water Percent Complete"].value && asiFields["Water Percent Complete"].value > 0)
        percentCompleteWater = parseInt(asiFields["Water Percent Complete"].value);
    var percentCompleteSewer = 0;
    if (asiFields["Sewer Percent Complete"].value && asiFields["Sewer Percent Complete"].value > 0)
        percentCompleteSewer = parseInt(asiFields["Sewer Percent Complete"].value);
    var bondOverrideWater = 0;
    if (asiFields["Water Bond Override Amount"].value && asiFields["Water Bond Override Amount"].value > 0)
        bondOverrideWater = parseFloat(asiFields["Water Bond Override Amount"].value);
    var bondOverrideSewer = 0;
    if (asiFields["Sewer Bond Override Amount"].value && asiFields["Sewer Bond Override Amount"].value > 0)
        bondOverrideSewer = parseFloat(asiFields["Sewer Bond Override Amount"].value);
    var bondAmountRequired = 0;
    if (asiFields["Utility Bond Amount Required"].value && asiFields["Utility Bond Amount Required"].value > 0)
        bondAmountRequired = parseFloat(asiFields["Utility Bond Amount Required"].value);

    var commercialProject = true;
    if (asiFields["Commercial Project"].value == null || asiFields["Commercial Project"].value == "") commercialProject = null;
    else if ((asiFields["Commercial Project"].value.equalsIgnoreCase('NO') || asiFields["Commercial Project"].value.equalsIgnoreCase('N') || asiFields["Commercial Project"].value.equalsIgnoreCase('UNCHECKED') || asiFields["Commercial Project"].value.equalsIgnoreCase('UNSELECTED') || asiFields["Commercial Project"].value.equalsIgnoreCase('FALSE') || asiFields["Commercial Project"].value.equalsIgnoreCase('OFF')))
        commercialProject = false;

    // For Utility Construction Project calculate Bond Amount
    var stateRoadAcceptStatus = taskStatus("Utility State Road Acceptance Inspection");
    logDebug("stateRoadAcceptStatus: "+ stateRoadAcceptStatus);
    //if (stateRoadAcceptDate.getTime() > minValue.getTime()) {
    if (stateRoadAcceptStatus == "Completed") {
        bondTotalSewer = 0;
        bondTotalWater = 0;
    } else {
        if (percentCompleteSewer >= 90)
            bondTotalSewer = estCostSewer * 0.1
        else
            bondTotalSewer = estCostSewer * ((100 - percentCompleteSewer) * 0.01)
        if (percentCompleteWater >= 90)
            bondTotalWater = estCostWater * 0.1
        else
            bondTotalWater = estCostWater * ((100 - percentCompleteWater) * 0.01)
    }

    // check for associated projects
    var associatedProjects = [], projectMsg = "", projectMsgs = [];
    for (var i = 1; i < 4; i++) {
        var projectID = asiFields["Associated Project " + i].value;
        logDebug("Project " + i + " " + projectID);
        if (projectID == null || projectID == "") continue;
        // If lblRdAcpt1.Text = "R" Or lblAsPrj1Com.Text = "C" Then continue // Do not add to bond amount
        var projectID = asiFields["Associated Project " + i].value;
        logDebug("Project " + i + " " + projectID);
        var projectCapId = aa.cap.getCapID(projectID).getOutput();
        if (!projectCapId) continue;
        useAppSpecificGroupName = false;
        projEstCostWater = parseFloat(getAppSpecific("Water Estimated Total Cost", projectCapId));
        projPercentCompleteWater = parseInt(getAppSpecific("Water Percent Complete", projectCapId));
        projEstCostSewer = parseFloat(getAppSpecific("Sewer Estimated Total Cost", projectCapId));
        projPercentCompleteSewer = parseInt(getAppSpecific("Sewer Percent Complete", projectCapId));
        logDebug("Project " + i + " " + projectID
            + " Water " + projEstCostWater + " " + projPercentCompleteWater + "%,"
            + " Sewer: " + projEstCostSewer + " " + projPercentCompleteSewer + "%");

        if (!projEstCostSewer && !projPercentCompleteSewer)
            bondProjSewer = 0
        else if (projPercentCompleteSewer >= 90)
            bondProjSewer = projEstCostSewer * 0.1
        else
            bondProjSewer = projEstCostSewer * ((100 - projPercentCompleteSewer) * 0.01)
        if (!projEstCostWater && !projPercentCompleteWater)
            bondProjWater = 0
        else if (projPercentCompleteWater >= 90)
            bondProjWater = projEstCostWater * 0.1
        else
            bondProjWater = projEstCostWater * ((100 - projPercentCompleteWater) * 0.01)
        bondTotalSewer = bondTotalSewer + bondProjSewer;
        bondTotalWater = bondTotalWater + bondProjWater;
        // Update Project Msgs
        projectMsg = (bondOverrideWater > 0 ? "" : " Water $" + bondProjWater);
        projectMsg = (projectMsg == "" ? "" : projectMsg + " + ")
            + (bondOverrideSewer > 0 ? "" : "Sewer $" + bondProjSewer);
        if (projectMsg != "")
            projectMsgs.push(projectID + " " + projectMsg);
        logDebug("Project " + i + " " + projectID + " " + projectMsg);
    }

    // If have override amount, add water and sewer together to get bond amount - txtbondamt
    if (bondOverrideWater > 0) bondTotalWater = bondOverrideWater;
    if (bondOverrideSewer > 0) bondTotalSewer = bondOverrideSewer;

    // Total bond amounts
    bondTotal = toPrecision(bondTotalSewer + bondTotalWater, 2);

    // if project is commercial, set bond amt to 0 and display label
    if (commercialProject) {
        asiFields["Original Bond Amount"].value = 0;
        asiFields["Original Bond Amount"].message = "Commercial";
        asiFields["Original Bond Amount"].readOnly = true;
        expression.setReturn(asiFields["Original Bond Amount"]);
        asiFields["Utility Bond Amount Required"].value = 0;
        asiFields["Utility Bond Amount Required"].readOnly = true;
        expression.setReturn(asiFields["Utility Bond Amount Required"]);
    } else if (bondTotal > 0) {
        asiFields["Utility Bond Amount Required"].value = bondTotal;
        asiFields["Utility Bond Amount Required"].message = "Water $" + bondTotalWater + " + Sewer $" + bondTotalSewer + (projectMsgs.length > 0 ? " with " + projectMsgs.join(";") : "");
        asiFields["Utility Bond Amount Required"].readOnly = true;
        expression.setReturn(asiFields["Utility Bond Amount Required"]);
    }

    // Set Original Bond Amount
    if (estCostWater > 0 || estCostSewer > 0) {
        asiFields["Original Bond Amount"].value = toPrecision(estCostWater * 1 + estCostSewer * 1, 2);
        asiFields["Original Bond Amount"].readOnly = true;
        expression.setReturn(asiFields["Original Bond Amount"]);
    }

    if (cancel && supervisor) logDebug("** Supervisor override **")
    // Show Debug
    if (debug && debug != "" && (showDebug || debug.indexOf("**ERROR:") >= 0)) {
        thisForm.message = (message == "" ? "" : message + br) + msgFormatDebugBegin + "DEBUG: " + debug + msgFormatDebugEnd;
        expression.setReturn(thisForm);
    } else if (message != "") {
        thisForm.message = message;
        expression.setReturn(thisForm);
    }
    if (cancel && !supervisor) {
        thisForm.blockSubmit = true;
        expression.setReturn(thisForm);
    }
} catch (err) {
    handleError_EXP(err, expressionName);
}

/*------------------------------------------------------------------------------------------------------/
| <=========== Functions below this point ================>
/------------------------------------------------------------------------------------------------------*/
/*------------------- Required Standard Expression Functions --------------------- */
function handleError_EXP(err, context) {
    var rollBack = true;
    var showError = true;

    if (showError) showDebug = true;
    thisForm.message = "**Error " + err.message + " In " + context + " Line " + err.lineNumber + br + "Stack: " + err.stack;
    expression.setReturn(thisForm);

    aa.print((rollBack ? "**ERROR** " : "ERROR: ") + err.message + " In " + context + " Line " + err.lineNumber);
    aa.print("Stack: " + err.stack);
}

function include_EXP(s) {
    try {
        var thisDate = new Date();
        var thisTime = thisDate.getTime();
        var st = getScriptText(s);
        if (st.length) {
            aa.print("Executing script : " + s + ", Elapsed Time: " + ((thisTime - startTime) / 1000) + " Seconds")
            eval(st);
        }
    }
    catch (err) { handleError_EXP(err, s); }
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

function dateFormatted(pMonth, pDay, pYear, pFormat)
//returns date string formatted as YYYY-MM-DD or MM/DD/YYYY (default)
{
    var mth = "";
    var day = "";
    var ret = "";
    if (pMonth > 9)
        mth = pMonth.toString();
    else
        mth = "0" + pMonth.toString();

    if (pDay > 9)
        day = pDay.toString();
    else
        day = "0" + pDay.toString();

    if (pFormat == "YYYY-MM-DD")
        ret = pYear.toString() + "-" + mth + "-" + day;
    else
        ret = "" + mth + "/" + day + "/" + pYear.toString();

    return ret;
}

function logDebug(dstr) {
    debug += dstr + br;
}

function logMessage(dstr) {
    message += dstr + br;
}

function exists(eVal, eArray) {
    for (ii in eArray)
        if (eArray[ii] == eVal) return true;
    return false;
}

function appMatch(ats) { // optional capId or CapID string
    var matchArray = appTypeArray //default to current app
    if (arguments.length == 2) {
        matchCapParm = arguments[1]
        if (typeof (matchCapParm) == "string")
            matchCapId = aa.cap.getCapID(matchCapParm).getOutput();   // Cap ID to check
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
            if (!ata[xx].equals(matchArray[xx]) && !ata[xx].equals("*"))
                isMatch = false;
    return isMatch;
}

function getAppSpecific(itemName, itemCap) {
    var updated = false;
    var i = 0;

    if (useAppSpecificGroupName) {
        if (itemName.indexOf(".") < 0) { logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true"); return false }


        var itemGroup = itemName.substr(0, itemName.indexOf("."));
        var itemName = itemName.substr(itemName.indexOf(".") + 1);
    }

    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
    if (appSpecInfoResult.getSuccess()) {
        var appspecObj = appSpecInfoResult.getOutput();

        if (itemName != "") {
            for (i in appspecObj)
                if (appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup)) {
                    return appspecObj[i].getChecklistComment();
                    break;
                }
        } // item name blank
    }
    else { logDebug("**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage()) }
}

function taskStatus(wfstr) // optional process name and capID
{
    var useProcess = false;
    var processName = "";
    var itemCap = capId;
    if (arguments.length >= 2) {
        processName = arguments[1]; // subprocess
        if (processName)
            useProcess = true;
    }

    if (arguments.length == 3)
        itemCap = arguments[2]; // use cap ID specified in args


    var workflowResult = aa.workflow.getTaskItems(itemCap, wfstr, processName, null, null, null);
    if (workflowResult.getSuccess())
        var wfObj = workflowResult.getOutput();
    else {
        logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
        return false;
    }

    for (i in wfObj) {
        var fTask = wfObj[i];
        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName)))
            return fTask.getDisposition()
    }
} 

/*------------------- Standard Expression Functions --------------------- */
var toPrecision = function (value) {
    if (value == null) return 0;
    var multiplier = (arguments.length > 1 && arguments[1] ? Math.pow(10, parseInt(arguments[1])) : 1000);
    return Math.round(value * multiplier) / multiplier;
}

function addDate(iDate, nDays) {
    if (isNaN(nDays)) {
        throw ("Day is a invalid number!");
    }
    return expression.addDate(iDate, parseInt(nDays));
}

function diffDate(iDate1, iDate2) {
    return expression.diffDate(iDate1, iDate2);
}

function parseDate(dateString) {
    return expression.parseDate(dateString);
}

function formatDate(dateString, pattern) {
    if (dateString == null || dateString == '') {
        return '';
    }
    return expression.formatDate(dateString, pattern);
}

