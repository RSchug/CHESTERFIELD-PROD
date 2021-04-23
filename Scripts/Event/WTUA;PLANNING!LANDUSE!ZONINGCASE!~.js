try {
 // Set the Reviewers Tasks per the wfStatus choosen per REVIEW DEPTS FOR ELM Spreadsheet scritp# 60p
	if (wfTask == 'Review Distribution' && wfStatus == 'Routed for Commercial Review') {
		activateTask("CDOT Review");
		activateTask("Community Enhancement Review");
		activateTask("Environmental Engineering Review");
		activateTask("Fire and Life Safety Review");
		activateTask("Planning Review");
		activateTask("Utilities Review");
		activateTask("VDOT Review");
		activateTask("Schools Research and Planning Review");
		activateTask("Police Review");
		activateTask("Technical Review Committee");
		deactivateTask("Default");
	}
	if (wfTask == 'Review Distribution' && (wfStatus == 'Routed for Residential and Commercial' || wfStatus == 'Routed for Residential Review')) {
		activateTask("Budget and Management Review");
		activateTask("CDOT Review");
		activateTask("Community Enhancement Review");
		activateTask("Health Department Review");
		activateTask("Environmental Engineering Review");
		activateTask("Fire and Life Safety Review");
		activateTask("County Library Review");
		activateTask("Parks and Recreation Review");
		activateTask("Planning Review");
		activateTask("Utilities Review");
		activateTask("VDOT Review");
		activateTask("Schools Research and Planning Review");
		activateTask("Police Review");
		activateTask("Technical Review Committee");
		if (wfStatus == 'Routed for Residential and Commercial') {
			activateTask("General Services Review");
		}
		deactivateTask("Default");
	}
	if (wfTask == 'Review Distribution' && wfStatus == 'Routed for Towers Review') {
		activateTask("Airport Review");
		activateTask("CDOT Review");
		activateTask("Community Enhancement Review");
		activateTask("Environmental Engineering Review");
		activateTask("Fire and Life Safety Review");
		activateTask("Planning Review");
		activateTask("Utilities Review");
		activateTask("VDOT Review");
		activateTask("Schools Research and Planning Review");
		activateTask("Police Review");
		activateTask("General Services Review");
		activateTask("Radio Shop Review");
		activateTask("Technical Review Committee");
		deactivateTask("Default");
	}
	if (wfTask == 'Review Consolidation' && wfStatus == 'Move to BOS') {
		activateTask("BOS Hearing");
		deactivateTask("Review Consolidation");
	}
	if (matches(wfTask,'CPC Hearing') && matches(wfStatus,'Recommend Approval','Recommend Denial')) {
						  
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
	//Per the business 04-2021 
		/*if (!isTaskActive("Maps") && !isTaskComplete_TPS("Maps")){
			addAdHocTask_TPS("ADHOC_WF","Maps","");
		}
		if (isTaskComplete_TPS("Maps")) {
			activateTask("Maps");
		} */
	}
// Add Fees
	if (wfTask == 'Application Submittal' && wfStatus == 'Calculate Fees') {
		addFees_ZoneCase();
	}
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