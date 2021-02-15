/*------------------------------------------------------------------------------------------------------/
| Program : ScriptTester_v9.0.js
| Event   : ScriptTester
|
| Client  : N/A
| Action# : N/A
|
| Notes   : 07/01/2020 RS Updated for 9.0 to include doConfigurableScriptActions & other masterscript updates
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var myCapId = "20PR0020";		// Replace with Alt ID of test record
var myUserId = "DBOUCHER";			// Replace with User ID of test user.

// Uncomment the event you would like to test be sure to provide event related variables.
var eventName = ""
/* ASA  */ //var eventName = "ApplicationSubmitAfter";
/* CTRCA */ //var eventName = "ConvertToRealCapAfter";
/* ASIUA */ //var eventName = "ApplicationSpecificInfoUpdateAfter";
/* ACAA */  //var eventName = "ApplicationConditionAddAfter"; conditionId = null; // if conditionId is null then use all conditions on record.
/* WTUA */  var eventName = "WorkflowTaskUpdateAfter";  wfTask = "Review Distribution"; wfStatus = "Routed for Review";  // Requires wfTask, wfStatus rest of info from Workflow if task found.
/* IRSA */  //var eventName = "InspectionResultSubmitAfter" ; inspResult = "Pass"; inspResultComment = "Comment";  inspType = "Check Job Status"
/* ISA  */  //var eventName = "InspectionScheduleAfter" ; inspType = "Roofing"
/* PRA  */  //var eventName = "PaymentReceiveAfter";  
/* FAB  */  //var eventName = "FeeAssessBefore"; FeeItemsList = new java.lang.String("[CC-BLD-G-002|CC-BLD-G-003|CC-BLD-G-004|CC-BLD-G-005]"); FeeItemsQuantityList = new java.lang.String("[1|1|1|1]"); NumberOfFeeItems = 4;

var useProductInclude = true; //  set to true to use the "productized" include file (events->custom script), false to use scripts from (events->scripts)
var useProductScript = true;  // set to true to use the "productized" master scripts (events->master scripts), false to use scripts from (events->scripts)
var runEvent = true; // set to true to simulate the event and run all std choices/scripts for the record type.

/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|	BEGIN Set Environment Parameters								***** Do not touch this section *****
/------------------------------------------------------------------------------------------------------*/
aa.env.setValue("CurrentUserID", myUserId); 
aa.env.setValue("EventName", eventName); var vEventName = eventName; var eventType = (eventName.indexOf("Before") > 0? "Before":"After");
var controlString = eventName; var tmpID = aa.cap.getCapID(myCapId).getOutput(); 
if (tmpID != null) { aa.env.setValue("PermitId1", tmpID.getID1()); aa.env.setValue("PermitId2", tmpID.getID2()); aa.env.setValue("PermitId3", tmpID.getID3()); } 
if(eventName.indexOf("Before") > 0){
	var preExecute = "PreExecuteForBeforeEvents";
} else {
	var preExecute = "PreExecuteForAfterEvents"; 
}
var documentOnly = false; 
_setEnvEventParameters(tmpID);

/*******************************************************************************************************/
/************************************ Master Script Code don't touch ***********************************/
/*******************************************************************************************************/
/*------------------------------------------------------------------------------------------------------/
|	BEGIN Master Script Code									***** Do not touch this section *****
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

try {
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
	if (bvr3.getSuccess()) {if(bvr3.getOutput().getDescription() == "No") useCustomScriptFile = false}; 
}

if (SA) {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA,useCustomScriptFile));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA,useCustomScriptFile));
	eval(getScriptText(SAScript, SA));
} else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useCustomScriptFile));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,useCustomScriptFile));
}
/* force for script test*/ showDebug = true; 

eval(getScriptText("INCLUDES_CUSTOM",null,useCustomScriptFile));

if (documentOnly) {
	doStandardChoiceActions(controlString, false, 0);
	aa.env.setValue("ScriptReturnCode", "0");
	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
	aa.abortScript();
}

var prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX", vEventName);
} catch (err) {
	aa.print("A JavaScript Error occurred: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
}

function getScriptText(vScriptName, servProvCode, useProductScripts) {
	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();
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
|	END Master Script Code
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| 	BEGIN Override Standard Functions								<<<< Update as necessary >>>>>
/------------------------------------------------------------------------------------------------------*/
if (true) { // override Functions 
    logDebug("=====");
    logDebug("Overriding functions...");
    logDebug("=====");

    // Set Font colors for EMSE Standard Choice.
    lastErrorMsg = "";      // Used by custom logDebug function for tracking last error.
    formatErrorB = "";      // formatting for custom error messages
    formatErrorE = "";
    formatErrorB = "<font color=Red><b>";
    formatErrorE = "<b></font>";
    stdChoiceCriteriaBeginTrue = "<font color=Blue>";
    stdChoiceCriteriaEndTrue = "</font>";
    stdChoiceCriteriaBeginFalse = "<font color=LightBlue>";
    stdChoiceCriteriaEndFalse = "</font>"
    stdChoiceActionBegin = "<font color=BlueViolet>";
    stdChoiceActionEnd = "</font>"
    stdChoiceDisabledBegin = "<font color=LightGray>";
    stdChoiceDisabledEnd = "</font>"
    stdChoiceDisabledBegin = "";		// Do not display disabled standard choices.
    stdChoiceDisabledBegin = "";

function doStandardChoiceActions(stdChoiceEntry, doExecution, docIndent) {
	var thisDate = new Date();
	var thisTime = thisDate.getTime();
	var lastEvalTrue = false;
	stopBranch = false;  // must be global scope
	logDebug("Executing : " + stdChoiceEntry + "," + doExecution + "," + docIndent + ", Elapsed Time: " + ((thisTime - startTime) / 1000) + " Seconds (Override)")
	var pairObjArray = getScriptAction(stdChoiceEntry);
	if (!doExecution) docWrite(stdChoiceEntry, true, docIndent);
	try {
		for (xx in pairObjArray) {
			doObj = pairObjArray[xx];
			if (doExecution) {
				if (doObj.enabled) {
					if (stopBranch) {
						stopBranch = false;
						break;
					}
					try {
						stdChoiceCriteriaBegin = stdChoiceCriteriaBeginFalse
						stdChoiceCriteriaEnd = stdChoiceCriteriaEndFalse
						if (eval(token(doObj.cri)) || (lastEvalTrue && doObj.continuation)) {
							stdChoiceCriteriaBegin = stdChoiceCriteriaBeginTrue
							stdChoiceCriteriaEnd = stdChoiceCriteriaEndTrue
						}
						logDebug(aa.env.getValue("CurrentUserID") + " : " + stdChoiceEntry + " : #" + doObj.ID + " : Criteria : " + stdChoiceCriteriaBegin + doObj.cri + stdChoiceCriteriaEnd, 2)
						if (eval(token(doObj.cri)) || (lastEvalTrue && doObj.continuation)) {
							logDebug(aa.env.getValue("CurrentUserID") + " : " + stdChoiceEntry + " : #" + doObj.ID + " : Action : " + stdChoiceActionBegin + doObj.act + stdChoiceActionEnd, 2)
							eval(token(doObj.act));
							lastEvalTrue = true;
						}
						else {
							if (doObj.elseact) {
								logDebug(aa.env.getValue("CurrentUserID") + " : " + stdChoiceEntry + " : #" + doObj.ID + " : Else : " + stdChoiceActionBegin + doObj.elseact + stdChoiceActionEnd, 2)
								eval(token(doObj.elseact));
							}
							lastEvalTrue = false;
						}
					}
					catch (err) {
						showDebug = 3;
						logDebug("**ERROR** An error occurred in the following standard choice " + stdChoiceEntry + "#" + doObj.ID + "  Error:  " + err.message);
					}
				} else if (stdChoiceDisabledBegin != "") { // Disabled
					logDebug(stdChoiceDisabledBegin + aa.env.getValue("CurrentUserID") + " : " + stdChoiceEntry + " : #" + doObj.ID + " : <DISABLED> : " + doObj.cri + stdChoiceDisabledEnd, 2)
				}
			}
			else // just document
			{
				docWrite("|  ", false, docIndent);
				var disableString = "";
				if (!doObj.enabled) disableString = "<DISABLED>";
				if (doObj.elseact)
					docWrite("|  " + doObj.ID + " " + disableString + " " + doObj.cri + " ^ " + doObj.act + " ^ " + doObj.elseact, false, docIndent);
				else
					docWrite("|  " + doObj.ID + " " + disableString + " " + doObj.cri + " ^ " + doObj.act, false, docIndent);
				for (yy in doObj.branch) {
					doStandardChoiceActions(doObj.branch[yy], false, docIndent + 1);
				}
			}
		} // next sAction
		if (!doExecution) docWrite(null, true, docIndent);
	} catch (err) {
		showDebug = 3;
		var context = "doStandardChoiceActions (" + stdChoiceEntry + ")";
		logDebug("**ERROR** An error occurred in " + context + " Line " + err.lineNumber + " Error:  " + err.message);
		logDebug("Stack: " + err.stack);
	}
	var thisDate = new Date();
	var thisTime = thisDate.getTime();
	logDebug("Finished: " + stdChoiceEntry + ", Elapsed Time: " + ((thisTime - startTime) / 1000) + " Seconds")
}

function doScriptActions() {
	logDebug("Overriding doScriptActions() from INCLUDES_ACCELA_FUNCTIONS with Debug Email Version");
	try {
		include(prefix + ":" + "*/*/*/*");
		if (typeof (appTypeArray) == "object") {
			include(prefix + ":" + appTypeArray[0] + "/*/*/*");
			include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/*/*");
			include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/*");
			include(prefix + ":" + appTypeArray[0] + "/*/" + appTypeArray[2] + "/*");
			include(prefix + ":" + appTypeArray[0] + "/*/" + appTypeArray[2] + "/" + appTypeArray[3]);
			include(prefix + ":" + appTypeArray[0] + "/*/*/" + appTypeArray[3]);
			include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/*/" + appTypeArray[3]);
			include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + appTypeArray[3]);
		}
	} catch (err) {
		showDebug = 3;
		var context = "doScriptActions (include)";
		logDebug("**ERROR** An error occurred in " + context + " Line " + err.lineNumber + " Error:  " + err.message);
		logDebug("Stack: " + err.stack);
	}

	// Send Debug Email
	try {
		if (typeof (debugEmailTo) == "undefined") { debugEmailTo = ""; }
		if (typeof (controlString) == "undefined") { controlString = ""; }
		if (debugEmailTo != "") {
			var environment = (typeof (envName) == "undefined" ? "" : (envName == "PROD" ? "" : envName));
			var reportPopup = (showMessage && message.indexOf("/portlets/reports/reportShow.do?") >= 0); // Report Popup in message?
			var debugError = (debug.indexOf("**" + "ERROR") > 0); // Error in debug?
			var capIDMsg = (typeof (capIDString) == "undefined" ? "" : capIDString + " ") + (typeof (capId) == "undefined" ? "" : capId + " ");
			logDebug("showMessage (" + showMessage + ") " + (reportPopup ? " with Report Popup" : "") + " " + message.replace("/portlets/reports/reportShow.do?", "").replace("**" + "ERROR", "** ERROR"));
			logDebug("debug (" + showDebug + ") " + (debugError ? " with ERROR" : "") + ", debugEmailTo: " + debugEmailTo);
			result = aa.sendMail(sysFromEmail, debugEmailTo, "", environment + " DEBUG: " + capIDMsg + controlString + (debugError ? " - Failed" : ""), debug);
			if (result.getSuccess()) {
				logDebug(environment + " DEBUG Email sent to " + debugEmailTo);
				if (reportPopup && !debugError) { showDebug = false; aa.print(String("===== DEBUG =====<BR>" + debug).replace(/<BR>/g, "\r")); }  // Allow Popup to show so showDebug must be false;
				if (publicUser && !debugError) { showDebug = false; } // Don't display debug message in ACA unless ERROR. So debug does prevent page from advancing.
			} else {
				logDebug("Failed to send DEBUG Email to " + debugEmailTo);
			}
			if (debugError) showDebug = true;
		}
	} catch (err) {
		showDebug = 3;
		var context = "doScriptActions (sendDebugEmail)";
		logDebug("ERROR: An error occurred in " + context + " Line " + err.lineNumber + " Error:  " + err.message);
		logDebug("Stack: " + err.stack);
	}
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
	if ((showDebug & vLevel) == vLevel)
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr);
}

function getParcel() {
	var thisParcel = null;
   	var capParcelResult = aa.parcel.getParcelandAttribute(itemCap, null);
   	if (capParcelResult.getSuccess()) {
   		var fcapParcelObj = capParcelResult.getOutput().toArray();
		for (i in fcapParcelObj) {
			thisParcel = fcapParcelObj[i];
			if (thisParcel.getPrimaryParcelFlag() == "Y") break;		// Primary found?
		}
	}
	// logDebug("Parcel: " + thisParcel + br + describe_TPS(thisParcel));
	logDebug("Parcel: " + thisParcel.getParcelNumber());
	return thisParcel;
}

} // End Override Functions

/*------------------------------------------------------------------------------------------------------/
| 	BEGIN Override Standard Functions
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|	BEGIN Master Script Code: Business Scripts					***** Do not touch this section *****
/------------------------------------------------------------------------------------------------------*/
if (preExecute.length) doStandardChoiceActions(preExecute,true,0); 	// run Pre-execution code
logGlobals(AInfo);
if (runEvent && typeof (doStandardChoiceActions) == "function" && doStdChoices) try { doStandardChoiceActions(controlString, true, 0); } catch (err) { logDebug(err.message) } 
if (runEvent && typeof (doScriptActions) == "function" && doScripts) doScriptActions();
if (runEvent && typeof (doConfigurableScriptActions) == "function" && doScripts) doConfigurableScriptActions();	// this controller replaces lookups for STANDARD_SOLUTIONS and CONFIGURABLE_RULESETS

/*------------------------------------------------------------------------------------------------------/
|	BEGIN Custom Code goes here								<<<< Update as necessary >>>>>
/------------------------------------------------------------------------------------------------------*/

// New Custom functions


// Custom Code
try {
    showDebug = true;
	now = new Date(aa.util.now());
    var customStartTime = now.getTime();
    logDebug("========== Start Custom Code @: " + now.toDateString() + " " + now.toTimeString().replace(" ", "," + now.getMilliseconds()) + "==========");

	if (matches(wfTask,'Review Distribution') & matches(wfStatus,'Routed for Review')) {
		editTaskDueDate('Sign Posting',dateAdd(null,7));
	//need to have all wfSteps here in order for this script 82p to work.
		
		var workflowTasks = aa.workflow.getTasks(capId).getOutput();
		var taskAuditArray = ['Public Notice','Adjacents','IVR Message','Maps','Airport Review','Assessor Review','Building Inspection Review','Budget and Management Review','Community Enhancement Review','County Library Review','Chesterfield Historical Society Review','Health Department Review','CDOT Review','Economic Development Review','Environmental Engineering Review','Fire and Life Safety Review','GIS-EDM Utilities Review','GIS-IST Review','Parks and Recreation Review','Planning Review','Police Review','Real Property Review','Schools Research and Planning Review','Schoold Board','Utilities Review','VDOT Review','Water Quality Review','Technical Review Committe','Staff and Developer Meeting'];
		for (var i in workflowTasks) {
			if (workflowTasks[i].getCompleteFlag() != "Y") {
				for (var ind in taskAuditArray) {
					if (taskAuditArray[ind] == workflowTasks[i].getTaskDescription()) {
						if (AInfo['Special Consideration'] == 'Expedited') {
						editTaskDueDate(taskAuditArray,dateAdd(null,14));
						} else if (AInfo['Special Consideration'] == 'Fast Track') {
						editTaskDueDate(taskAuditArray,dateAdd(null,7));
						} else if (AInfo['Special Consideration'] == 'Regular') {
						editTaskDueDate(taskAuditArray,dateAdd(null,21));
						}
					else
						editTaskDueDate(taskAuditArray,dateAdd(null,21));
					}
				}
			}
		}
	}

	now = new Date(aa.util.now());
    logDebug("========== Finished Custom Code @: " + now.toDateString() + " " + now.toTimeString().replace(" ", "," + now.getMilliseconds()) +", Elapsed: " + ((now.getTime() - customStartTime) / 1000) + "==========");
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
}
/*------------------------------------------------------------------------------------------------------/
|	END User code goes here
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|	BEGIN Master Script Code: Invoce Fees					***** Do not touch this section *****
/------------------------------------------------------------------------------------------------------*/
// Check for invoicing of fees
if (feeSeqList.length) {
	invoiceResult = aa.finance.createInvoice(capId, feeSeqList, paymentPeriodList);
	if (invoiceResult.getSuccess())
		logMessage("Invoicing assessed fee items is successful.");
	else
		logMessage("**ERROR: Invoicing the fee items assessed to app # " + capIDString + " was not successful.  Reason: " +  invoiceResult.getErrorMessage());
}
/*------------------------------------------------------------------------------------------------------/
|	END Master Script Code: Invoce Fees
/------------------------------------------------------------------------------------------------------*/
// Print Debug
var z = debug.replace(/<BR>/g, "\r"); aa.print(">>> DEBUG: \r" + z);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
//aa.env.setValue("ScriptReturnCode", "0"); 	aa.env.setValue("ScriptReturnMessage", debug);

if (debug.indexOf("**ERROR") > 0) {
	aa.env.setValue("ScriptReturnCode", "1");
	aa.env.setValue("ScriptReturnMessage", debug);
} else if (eventType == "Before" && cancel) { //Process Before Event with cancel check
	aa.env.setValue("ScriptReturnCode", "1");
	if (showMessage) aa.env.setValue("ScriptReturnMessage", "<font color=red><b>Action Cancelled</b></font><br><br>" + message);
	if (showDebug) 	aa.env.setValue("ScriptReturnMessage", "<font color=red><b>Action Cancelled</b></font><br><br>" + debug);
} else {
	aa.env.setValue("ScriptReturnCode", "0");
	if (showMessage) aa.env.setValue("ScriptReturnMessage", message);
	if (showDebug) 	aa.env.setValue("ScriptReturnMessage", debug);
}

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function _setEnvEventParameters(itemCap) { // TO DO: Add Key Environment Parameters for various events
	if (eventName.indexOf("ApplicationCondition") >= 0) {
		if (aa.env.getValue("ConditionId") == "") { // Set Environment Parameter ConditionId
			if (typeof(conditionId) == "undefined") conditionId = null;
			if (conditionId == null) {
				// set ConditionId environment parameter.
				var condResult = aa.capCondition.getCapConditions(itemCap);
				if (!condResult.getSuccess()) {
					logDebug("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
					var capConditions = [];
				} else if (condResult.getOutput()) {
					var capConditions = condResult.getOutput();
				} else {
					var capConditions = [];
				}

				var capConditionIDs = [];
				for (var cc in capConditions) {
					var conditionObj = capConditions[cc];
					logDebug("capConditions["+cc+"]: " + conditionObj.getConditionNumber()
						+ (conditionObj.getConditionGroup()? ", Group: " + conditionObj.getConditionGroup():"")
						+ (conditionObj.getConditionType()? ", Type: " + conditionObj.getConditionType():"")
						+ (conditionObj.getConditionDescription()? ", Name: " + conditionObj.getConditionDescription():"")
							);
					capConditionIDs.push(conditionObj.getConditionNumber());
				}
				conditionId = capConditionIDs.join("|");
			}
			aa.env.setValue("ConditionId",conditionId);
		}
	} else if (eventName.indexOf("WorkflowTaskUpdate") >= 0) { // Requires wfTask, wfStatus rest of info from Workflow
		var now = new Date(aa.util.now());//	wfDate = 2020-07-09
		if (typeof(wfDate) == "undefined") wfDate = null;	// Process ID of workflow
		if (wfDate == null)
			wfDate = now.getFullYear()+"-"+((now.getMonth()+1)<10?"0":"")+(now.getMonth()+1)+"-"+(now.getDate()<10?"0":"")+now.getDate();
		if (typeof(wfProcessID) == "undefined") wfProcessID = null;	// Process ID of workflow
		var wfStep ; var wfComment ; var wfNote ; var wfDue ; var wfHours;	var wfActionBy;	var wfActionByObj; var wfActionByUserID = "";	var wfActionByDept = "";										// Initialize
		var wfProcess ; 											// Initialize
		var wfTimeBillable = aa.env.getValue("Billable");
		var wfTimeOT = aa.env.getValue("Overtime");
		// Go get other task details
		var wfObj = aa.workflow.getTasks(itemCap).getOutput();
		for (i in wfObj) {
			fTask = wfObj[i];
			if (!fTask.getTaskDescription().equals(wfTask)) continue;
			if (wfProcessID && fTask.getProcessID() != wfProcessID) continue;
			wfStep = fTask.getStepNumber();
			wfProcessID = fTask.getProcessID();
			wfProcess = fTask.getProcessCode();
			wfActionBy = fTask.getTaskItem().getSysUser();
			wfActionByObj = aa.person.getUser(wfActionBy.getFirstName(), wfActionBy.getMiddleName(), wfActionBy.getLastName()).getOutput();
			wfComment = (wfComment? wfComment:fTask.getDispositionComment());
			wfNote = fTask.getDispositionNote();
			wfDue = fTask.getDueDate();
			wfHours = fTask.getHoursSpent();
			wfTaskObj = fTask;
			wfStatusDate = new Date(fTask.getStatusDate()? fTask.getStatusDate().getTime():null);
			//wfDate = wfStatusDate.getFullYear()+"-"+((wfStatusDate.getMonth()+1)<10?"0":"")+(wfStatusDate.getMonth()+1)+"-"+(wfStatusDate.getDate()<10?"0":"")+wfStatusDate.getDate();
			wfTimeBillable = fTask.getBillable();
			wfTimeOT = fTask.getOverTime();
		}
		var wfDateMMDDYYYY = wfDate? wfDate.substr(5,2) + "/" + wfDate.substr(8,2) + "/" + wfDate.substr(0,4):"";	// date of status of workflow that triggered event in format MM/DD/YYYY
		if (wfActionByObj) {
			var wfActionByUserID = wfActionByObj.getUserID();
			var wfActionByDept = wfActionByObj.getDeptOfUser();
		}
			
		logDebug("wfTask = " + wfTask);
		logDebug("wfTaskObj = " + (wfTask && wfTask.getClass? wfTask.getClass():null));
		logDebug("wfStatus = " + wfStatus);
		logDebug("wfDate = " + wfDate);
		logDebug("wfDateMMDDYYYY = " + wfDateMMDDYYYY);
		logDebug("wfStep = " + wfStep);
		logDebug("wfComment = " + wfComment);
		logDebug("wfProcess = " + wfProcess);
		logDebug("wfNote = " + wfNote);
		logDebug("wfActionByUserID = " + wfActionByUserID);
		logDebug("wfActionByDept = " + wfActionByDept);

		/* Added for version 1.7 */
		var wfStaffUserID = aa.env.getValue("StaffUserID");
		var timeAccountingArray = new Array()
		if(aa.env.getValue("TimeAccountingArray") != "")
			timeAccountingArray =  aa.env.getValue("TimeAccountingArray");
		logDebug("wfStaffUserID = " + wfStaffUserID);
		logDebug("wfTimeBillable = " + wfTimeBillable);
		logDebug("wfTimeOT = " + wfTimeOT);
		logDebug("wfHours = " + wfHours);
	}
}

function describe_TPS(obj) {
	// Modified from describe to also include typeof & class of object; seperate Properties from Functions; Sort them; additional arguments.
	var newLine = "\n";
	var newLine = br;
	var newLine = "<BR>";
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
		ret += "typeof(): " + typeof (obj) + (obj && obj.getClass ? ", class: " + obj.getClass() : "") + newLine;
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
		logDebug("Error in describe_TPS() at line " + err.lineNumber + " : " + err.message);
		logDebug("Stack: " + err.stack);
	}
	return ret;
}

function logDebug(dstr) {
	if (typeof(showDebug) == "undefined") showDebug = true;
	if (typeof(debug) == "undefined") debug = "";
	if (typeof(br) == "undefined") br = "<BR>";
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
	if ((showDebug & vLevel) == vLevel)
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr);
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

// ----------
//  Standard INCLUDES_ACCELA_FUNCTIONS version 9.2: These were added because some events are calling older master scripts
//  They can be removed once the events are updated to point to newer master scripts.
// ----------
function addParameter(pamaremeters, key, value) {
    // Standard INCLUDES_ACCELA_FUNCTION version 9.2
    if (key != null) {
        if (value == null) {
            value = "";
        }
        pamaremeters.put(key, value);
    }
}