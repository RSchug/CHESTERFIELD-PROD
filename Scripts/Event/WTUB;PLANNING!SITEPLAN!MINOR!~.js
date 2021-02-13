//36P if Adjacents Workflow Task Status Date of 'Create List' Status is less than 15 days display error when updating Case Complete task.
try {
    if (wfTask == 'Adjacents' && wfStatus == 'Completed') {
        var tasks = loadTasks(capId);
        if (tasks[wfTask] && tasks[wfTask].status == 'Create List') {
            var wfTaskStatusDateLast = tasks[wfTask].statusdate;
            if (wfTaskStatusDateLast) wfTaskStatusDateLast = new Date(dateAdd(wfTaskStatusDateLast, 15));
            logDebug("Last Status: " + tasks[wfTask].status + " , Date: " + tasks[wfTask].statusdate + " , Date + 15: " + wfTaskStatusDateLast);
            if (wfTaskStatusDateLast && wfTaskStatusDateLast.getTime() > startDate.getTime()) {
                showMessage = true;
                comment('<font size=small><b>Need to assure that residential neighbors have had 15 days of notification</b></font>');
                cancel = true;
            }
        }
    }
		if (matches(wfTask,'Case Complete') && matches(wfStatus,'Closed')) {
            if (AInfo['Sidewalks'] == null || AInfo['Sidewalk Width'] == null || AInfo['Pedestrian Trails'] == null || AInfo['Pedestrian Width'] == null || AInfo['Shared Use Path'] == null || AInfo['Shared Use Path Width'] == null || AInfo['Total Pedestrian Paths'] == null 
            || AInfo['Approved Time Limit'] == null || AInfo['Conditions'] == null || AInfo['Number of Single Family Units Approved'] == null || AInfo['Number of Town House Units Approved'] == null || AInfo['Number of Multi Family Units Approved'] == null || AInfo['Non-Residential Gross Building Square Feet'] == null){
					showMessage = true;
					comment('You cannot advance this workflow until the Results and Pedestrian Paths Data Fields are completely filled in.  Put in zeroes (0) for those fields that do not apply.');
					cancel = true;
				}
			}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}