/**
 * Calculate the due date for a given list of work flow tasks.
 * @param  {Array} taskList     - Array containing the list of task to calculate the due date
 * @param  {int} dueDays        - Number of days to calculate the due date. It will take the file date as base to make the calculation.
 * @param  {string} baseDate    - Date to be used to make the due date calculation.
 * @param  {boolean} useWorking - if optional parameter #3 is present, use working days only
 * @return {boolean}            - False if any error.
 */
function calcWFTDueDate(taskList, dueDays, baseDate) {
    try {
        var useWorking = false;
        if (arguments.length == 3)
            useWorking = true;        

        var dueDate = addDate(baseDate, 10, useWorking);

        for (t in taskList) {
            var thisTask = taskList[t];
            editTaskDueDate(thisTask, dueDate);
        }
        return true;
    } catch (err) {
        logDebug("calcWFTDueDate Message: Error-" + err.message + ". CapID:" + capID);
        return false;
    }
}
