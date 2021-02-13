/*------------------------------------------------------------------------------------------------------/
| Program: BatchStateRoadAcceptance  Trigger: Batch    
| Client : Chesterfield County
|
| Version 1.0 - Keith Hobday - TruePoint Solutions
|
|
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/
var showDebug = true;					                                  // Set to true to see debug messages in event log and email confirmation
var maxSeconds = 5 * 60;				                                  // Number of seconds allowed for batch run, usually < 5*60
var currentUserID = aa.env.getValue("CurrentUserID");   		// Current User

//Variables needed to log parameters below in eventLog
var sysDate = aa.date.getCurrentDate();
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("batchJobName");

//Global variables
var batchStartDate = new Date();                                                         // System Date
var batchStartTime = batchStartDate.getTime();                                           // Start timer
var timeExpired = false;                                                                 // Variable to identify if batch script has timed out. Defaulted to "false".

var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var capId;                                                                               // Variable used to hold the Cap Id value.
var senderEmailAddr = "noreply@chesterfield.gov";                                   // Email address of the sender
var emailAddress = "khobday@truepointsolutions.com";                                 // Email address of the person who will receive the batch script log information
var emailAddress2 = "khobday@truepointsolutions.com";                                     // CC email address of the person who will receive the batch script log information
var emailText = "";                                                                      // Email body
//Parameter variables
var paramsOK = true;
var paramsAppGroup = "Building";                                                         // Group value of the Cap Type that the batch script is suppose to process.

// Per Type of the Cap Type that the batch script should not process.
var paramsAppType = new Array("Permit");

var paramsAppStatusArr = new Array("Received","In Review");                       // Cap Status that the batch script is suppose to process.

var paramsAppSubGroupName = "CC-BLD-RES-PD";                                      // Application Spec Info Subgroup Name that the ASI field is associated to.
var paramsAppSpecInfoLabel = "State Road Acceptance Date";                                   // ASI field name that the batch script is to search.

/*
| Note: Start Date and End Date are defaulted to use the current System Date.
|       To set the Start Date and End Date to specific values for a manual run
|       replace the following syntax dateAdd(null,-1) to a string date value
|       in the following format "MM/DD/YYYY".
*/
var paramsStartDt = aa.date.parseDate(dateAdd(null,-1));                                 // Start Date for the batch script to select ASI data on.
var paramsEndDt = aa.date.parseDate(dateAdd(null,+3));                                   // End Date for the batch script to select ASI data on.

var paramsCondType = null;                                                               // Application Condition Type
var paramsCondStatus = null;                                                             // Application Condition Status
var paramsCondDesc = null;                                                               // Application Condition Description
var paramsCondImpact = "Lock";                                                           // Application Condition Severity
var paramsInspTypeLike = "Final";                                                        // String phrase used to be found in Inspection Type
var paramsInspResultLike = "Pass";                                                       // String phrase used to be found in Inspection Result


/*------------------------------------------------------------------------------------------------------/
| END: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/------------------------------------------------------------------------------------------------------*/
if (paramsOK)
        {
        logMessage("START","Start of State Road Acceptance Condition Batch Job.");

        var expireCapCount = expBuilding();

        logMessage("INFO","Number of Records processed: " + expireCapCount + ".");
	logMessage("END","End of State Road Acceptance Condition Batch Job: Elapsed Time : " + elapsed() + " Seconds.");
	}

if (emailAddress.length)
	aa.sendMail(senderEmailAddr, emailAddress, emailAddress2, batchJobName + " Results", emailText);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function expBuilding()
	{
//        logMessage("Progress","Step1");

	var capCount = 0;
	var getCapIdResult = aa.cap.getCapIDsByAppSpecificInfoDateRange(paramsAppSubGroupName, paramsAppSpecInfoLabel, paramsStartDt, paramsEndDt);
//logMessage("Var ",paramsAppSubGroupName);
//logMessage("Var ",paramsAppSpecInfoLabel);
//logMessage("Var ",paramsStartDt);
//logMessage("Var ",paramsEndDt);




	if (!getCapIdResult.getSuccess())
		{
		logMessage("**ERROR","Retreiving Cap Id's by Application Specific field date range: " + getCapIdResult.getErrorMessage()+ ".");
		return false;
		}

	var capIdArray = getCapIdResult.getOutput(); //Array of CapIdScriptModel Objects
//logMessage("Progress","Step2");

	for (i in capIdArray)
		{
		if (elapsed() > maxSeconds) // Only continue if time hasn't expired
		   {
		   logMessage("WARNING","A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
		   timeExpired = true;
		   break;
		   }

//logMessage("Progress","Step3");
                capId = capIdArray[i].getCapID(); // CapIDModel Object
                var cap = aa.cap.getCap(capId).getOutput(); // Cap Object
                var capGroup = cap.getCapType().getGroup(); // Cap Type Group
                var capType = cap.getCapType().getType(); // Cap Per Type
                var capStatus = cap.getCapStatus(); // Current Cap Status

                var capId1 = capId.getID1();
		var capId2 = capId.getID2();
		var capId3 = capId.getID3();			
		var capIdObject = getCapId(capId1,capId2,capId3); // call internal function                
                var customId = capIdObject.getCustomID(); // Alternate Cap ID string

                //Expire Building Caps that have a Cap Status of "Issued".
                if (capGroup == paramsAppGroup && exists(capStatus,paramsAppStatusArr))
		   {
                   logMessage("Processing Record ",customId);
                   addStdCondition("Final Plat","Confirm State Roads Acceptance",capId);
                   capCount++;
                   }
		}
	return capCount;
	}

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/

function elapsed() {
	var thisDate = new Date();
	var thisTime = thisDate.getTime();
	return ((thisTime - batchStartTime) / 1000)
}

// exists:  return true if Value is in Array
function exists(eVal, eArray) {
	  for (ii in eArray)
	  	if (eArray[ii] == eVal) return true;
	  return false;
}

function matches(eVal,argList) {
   for (var i=1; i<arguments.length;i++)
   	if (arguments[i] == eVal)
   		return true;

}

function isNull(pTestValue,pNewValue)
	{
	if (pTestValue==null || pTestValue=="")
		return pNewValue;
	else
		return pTestValue;
	}

function logMessage(etype,edesc) {
		aa.eventLog.createEventLog(etype, "Batch Process", batchJobName, sysDate, sysDate,"", edesc,batchJobID);
	aa.print(etype + " : " + edesc);
	emailText+=etype + " : " + edesc + "<br />";
	}

function logDebug(edesc) {
	if (showDebug) {
		aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, sysDate, sysDate,"", edesc,batchJobID);
		aa.print("DEBUG : " + edesc);
		emailText+="DEBUG : " + edesc + " <br />"; }
	}

function getCapId(pid1,pid2,pid3)  {

    var s_capResult = aa.cap.getCapID(pid1, pid2, pid3);
    if(s_capResult.getSuccess())
      return s_capResult.getOutput();
    else
    {
      logMessage("**ERROR","Failed to get capId: " + s_capResult.getErrorMessage());
      return null;
    }
  }

function dateAdd(td,amt)
	// perform date arithmetic on a string
	// td can be "mm/dd/yyyy" (or any string that will convert to JS date)
	// amt can be positive or negative (5, -3) days
	// if optional parameter #3 is present, use working days only
	{

	var useWorking = false;
	if (arguments.length == 3)
		useWorking = true;

	if (!td)
		dDate = new Date();
	else
		dDate = new Date(td);
	var i = 0;
	if (useWorking)
		if (!aa.calendar.getNextWorkDay)
			{
			logMessage("**ERROR","getNextWorkDay function is only available in Accela Automation 6.3.2 or higher.");
			while (i < Math.abs(amt))
				{
				dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * (amt > 0 ? 1 : -1)));
				if (dDate.getDay() > 0 && dDate.getDay() < 6)
					i++
				}
			}
		else
			{
			while (i < Math.abs(amt))
				{
				dDate = new Date(aa.calendar.getNextWorkDay(aa.date.parseDate(dDate.getMonth()+1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
				i++;
				}
			}
	else
		dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * amt));

	return (dDate.getMonth()+1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
	}

function jsDateToMMDDYYYY(pJavaScriptDate)
	{
	//converts javascript date to string in MM/DD/YYYY format
	//
	if (pJavaScriptDate != null)
		{
		if (Date.prototype.isPrototypeOf(pJavaScriptDate))
	return (pJavaScriptDate.getMonth()+1).toString()+"/"+pJavaScriptDate.getDate()+"/"+pJavaScriptDate.getFullYear();
		else
			{
			logMessage("**ERROR","Parameter is not a javascript date");
			return ("INVALID JAVASCRIPT DATE");
			}
		}
	else
		{
		logMessage("**ERROR","Parameter is null");
		return ("NULL PARAMETER VALUE");
		}
	}

function updateAppStatus(stat,cmt) // optional cap id
	{

	var itemCap = capId;
	if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args

	var updateStatusResult = aa.cap.updateAppStatus(itemCap,"APPLICATION",stat, sysDate, cmt ,systemUserObj);
	if (updateStatusResult.getSuccess())
		logMessage("INFO","CAP # "+capId.getCustomID()+" Updated Application Status to " + stat + " successfully.");
	else
		logMessage("**ERROR","CAP # "+capId.getCustomID()+" Application Status update to " + stat + " was unsuccessful. Application Status will need to be updated manually.  The reason is "  + updateStatusResult.getErrorType() + ":" + updateStatusResult.getErrorMessage());
	}

function taskCloseAllActive(pStatus,pComment)
 {
 // Closes all active tasks in CAP with specified status and comment
 // Function is a copy of the taskCloseAllExcept function.

 var workflowResult = aa.workflow.getTasks(capId);
 if (workflowResult.getSuccess())
    var wfObj = workflowResult.getOutput();
 else
     {
     logMessage("**ERROR","CAP # "+capId.getCustomID()+" Failed to get workflow object: " + workflowResult.getErrorMessage());
     return false;
     }

 var fTask;
 var stepnumber;
 var processID;
 var dispositionDate = aa.date.getCurrentDate();
 var wfnote = " ";
 var wftask;

 for (i in wfObj)
     {
     fTask = wfObj[i];
     wftask = fTask.getTaskDescription();
     stepnumber = fTask.getStepNumber();
     processID = fTask.getProcessID();
     if (fTask.getActiveFlag().equals("Y"))
        {
        //aa.workflow.handleDisposition(capId,stepnumber,processID,pStatus,dispositionDate,wfnote,pComment,systemUserObj,"Y");
        aa.workflow.handleDisposition(capId,stepnumber,pStatus,dispositionDate,wfnote,pComment,systemUserObj,"U");
        logMessage("INFO","Completed Workflow Task: " + wftask + " with a status of: " + pStatus + " for CAP # " + capId.getCustomID());

        wfObj[i].setCompleteFlag("Y");
	var fTaskModel = wfObj[i].getTaskItem();
	var tResult = aa.workflow.adjustTaskWithNoAudit(fTaskModel);
	    if (tResult.getSuccess())
	       logMessage("INFO","Completed Workflow Task: " + wftask + ", for CAP # " + capId.getCustomID());
            else
	        logMessage("**ERROR","CAP # "+capId.getCustomID()+" Failed to complete workflow task: " + tResult.getErrorMessage());
        }
     }
 }


function addStdCondition(cType,cDesc) // optional cap ID
	{

	var itemCap = capId;
	if (arguments.length ==3) itemCap = arguments[2]; // use cap ID specified in args

	if (!aa.capCondition.getStandardConditions)
		{
		logDebug("addStdCondition function is not available in this version of Accela Automation.");
		}
        else
		{
		standardConditions = aa.capCondition.getStandardConditions(cType,cDesc).getOutput();
		for(i = 0; i<standardConditions.length;i++)
		    if(standardConditions[i].getConditionType().toUpperCase() == cType.toUpperCase() && standardConditions[i].getConditionDesc().toUpperCase() == cDesc.toUpperCase()) //EMSE Dom function does like search, needed for exact match
			{
			standardCondition = standardConditions[i];

			var addCapCondResult = aa.capCondition.addCapCondition(	capId, 	standardCondition.getConditionType(), standardCondition.getConditionDesc(), standardCondition.getConditionComment(), sysDate, null, sysDate, null, null, standardCondition.getImpactCode(), systemUserObj, systemUserObj, "Applied", currentUserID, "A", null, standardCondition.getDisplayConditionNotice(), standardCondition.getIncludeInConditionName(), standardCondition.getIncludeInShortDescription(), standardCondition.getInheritable(), standardCondition.getLongDescripton(), standardCondition.getPublicDisplayMessage(), standardCondition.getResolutionAction(), null, null, standardCondition.getConditionNbr(), standardCondition.getConditionGroup(), standardCondition.getDisplayNoticeOnACA(), standardCondition.getDisplayNoticeOnACAFee());
			
			if (addCapCondResult.getSuccess())
				{
				logDebug("Successfully added condition (" + standardCondition.getConditionDesc() + ")");
				}
			else
				{
				logDebug( "**ERROR: adding condition (" + standardCondition.getConditionDesc() + "): " + addCapCondResult.getErrorMessage());
				}
			}
		}
	}


/*--------------------------------------------------------------------------------------------------------------------------------------
The following checkLikeInspWithResult() and appHasCondition() functions have been added by Truepoint on 10/4/2012.
--------------------------------------------------------------------------------------------------------------------------------------*/
function checkLikeInspWithResult(insp2Check,insp2Result)
	{
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess())
		{
		var inspList = inspResultObj.getOutput();
		for (xx in inspList)
			if (inspList[xx].getInspectionType().toUpperCase().search(insp2Check.toUpperCase()) > -1 && inspList[xx].getInspectionStatus().toUpperCase().search(insp2Result.toUpperCase()) > -1)
				return true;
		}
	return false;
	}

function appHasCondition(pType,pStatus,pDesc,pImpact)
	{
	// Checks to see if conditions have been added to CAP
	// 06SSP-00223
	//
	if (pType==null)
		var condResult = aa.capCondition.getCapConditions(capId);
	else
		var condResult = aa.capCondition.getCapConditions(capId,pType);
		
	if (condResult.getSuccess())
		var capConds = condResult.getOutput();
	else
		{
		logMessage("**ERROR","CAP # "+capId.getCustomID()+" getting cap conditions: " + condResult.getErrorMessage());
		return false;
		}
	
	var cStatus;
	var cDesc;
	var cImpact;

	for (cc in capConds)
		{
		var thisCond = capConds[cc];
		var cStatus = thisCond.getConditionStatus();
		var cDesc = thisCond.getConditionDescription();
		var cImpact = thisCond.getImpactCode();
		var cType = thisCond.getConditionType();
		if (cStatus==null)
			cStatus = " ";
		if (cDesc==null)
			cDesc = " ";
		if (cImpact==null)
			cImpact = " ";
		//Look for matching condition
		
		if ( (pStatus==null || pStatus.toUpperCase().equals(cStatus.toUpperCase())) && (pDesc==null || pDesc.toUpperCase().equals(cDesc.toUpperCase())) && (pImpact==null || pImpact.toUpperCase().equals(cImpact.toUpperCase())))
			return true; //matching condition found
		}
	return false; //no matching condition found
	}


	function deactivateTask(wfstr) // optional process name
{
	var useProcess = false;
	var processName = "";
	if (arguments.length == 2) 
	{
		processName = arguments[1]; // subprocess
		useProcess = true;
	}

	var workflowResult = aa.workflow.getTaskItems(capId,wfstr,processName,null,null,null);
 	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
  	else
  	  	{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }
	
	for (i in wfObj)
	{
   		var fTask = wfObj[i];
 		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())  && (!useProcess || fTask.getProcessCode().equals(processName)))
		{
			var stepnumber = fTask.getStepNumber();
			var processID = fTask.getProcessID();
			var completeFlag = fTask.getCompleteFlag();

			if (useProcess)
				aa.workflow.adjustTask(capId, stepnumber, processID, "N", completeFlag, null, null)
			else
				aa.workflow.adjustTask(capId, stepnumber, "N", completeFlag, null, null)

			//logDebug("deactivating Workflow Task: " + wfstr);
		}			
	}
}