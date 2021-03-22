try {
// CPC and BOS results
	if (matches(wfTask, 'CPC Hearing') && matches(wfStatus, 'Recommend Approval','Recommend Denial')) {
		if (AInfo['CPC Conditions'] == null || AInfo['CPC Complies with Plan'] == null) {
			showMessage = true;
			comment('You cannot advance this workflow until ALL fields in the <b>Results</b> area of the Data Fields are completely filled in.  Put in zeroes (0) for those fields that do not apply.');
			cancel = true;
		}
		else if (AInfo['CPC Conditions'] != null && AInfo['CPC Complies with Plan'] != null) {
			if (!isTaskActive("Public Notices") && !isTaskComplete_TPS("Public Notices")) {
				addAdHocTask_TPS("ADHOC_WF","Public Notices","");
			}
			if (isTaskComplete_TPS("Public Notices")) {
				activateTask("Public Notices");
			}				
			if (!isTaskActive("Adjacents") && !isTaskComplete_TPS("Adjacents")){
				addAdHocTask_TPS("ADHOC_WF","Adjacents","");
			}
			if (isTaskComplete_TPS("Adjacents")) {
				activateTask("Adjacents");
			}
			if (!isTaskActive("Maps") && !isTaskComplete_TPS("Maps")){
				addAdHocTask_TPS("ADHOC_WF","Maps","");
			}
			if (isTaskComplete_TPS("Maps")) {
				activateTask("Maps");
			}
		}
	}
//    if (matches(wfTask, 'BOS Hearing') && matches(wfStatus,'Approved','Denied')) {
//		if (AInfo['BOS Conditions'] == null || AInfo['BOS Proffered Conditions'] == null || AInfo['BOS Cash Proffers'] == null || AInfo['BOS Complies with Plan'] == null || AInfo['BOS Approved Time Limit'] == null || AInfo['BOS Expiration Date'] == null
//		|| AInfo['BOS Residential - Single Family Unit Approved'] == null || AInfo['BOS Residential - Multi Family Unit Approved'] == null || AInfo['BOS Age Restricted Units'] == null) {
//			showMessage = true;
//			comment('You cannot advance this workflow until ALL fields in the <b>Results</b> area of the Data Fields are completely filled in.  Put in zeroes (0) for those fields that do not apply.');
//			cancel = true;
//		}
//	}
} catch (err) {
	logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}

function addAdHocTask_TPS(adHocProcess, adHocTask, adHocNote) {
//adHocProcess must be same as one defined in R1SERVER_CONSTANT
//adHocTask must be same as Task Name defined in AdHoc Process
//adHocNote can be variable
//Optional 4 parameters = Assigned to User ID must match an AA user
//Optional 5 parameters = CapID
	var thisCap = capId;
	var thisUser = currentUserID;
	if(arguments.length > 3)
		thisUser = arguments[3]
	if(arguments.length > 4)
		thisCap = arguments[4];
	var userObj = aa.person.getUser(thisUser);
	if (!userObj.getSuccess())
	{
		logDebug("Could not find user to assign to");
		return false;
	}
	var taskObj = aa.workflow.getTasks(thisCap).getOutput()[0].getTaskItem()
	taskObj.setProcessCode(adHocProcess);
	taskObj.setTaskDescription(adHocTask);
	taskObj.setDispositionNote(adHocNote);
	taskObj.setProcessID(0);
	//taskObj.setAssignmentDate(aa.util.now());
	taskObj.setDueDate(null);
	//taskObj.setAssignedUser(userObj.getOutput());
	wf = aa.proxyInvoker.newInstance("com.accela.aa.workflow.workflow.WorkflowBusiness").getOutput();
	wf.createAdHocTaskItem(taskObj);
	return true;
} 