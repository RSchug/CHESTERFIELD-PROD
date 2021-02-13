/**
 * Perform date arithmetic on a string
 * @param {string} td       - can be "mm/dd/yyyy" (or any string that will convert to JS date)
 * @param {inte} amt        - can be positive or negative (5, -3) days
 * @param {bool} useWorking - if optional parameter #3 is present, use working days only
 */
function addDate(td, amt) {

    var useWorking = false;
    if (arguments.length == 3)
        useWorking = true;

    if (!td)
        dDate = new Date();
    else
        dDate = convertDate(td);

    var i = 0;
    if (useWorking)
        if (!aa.calendar.getNextWorkDay) {
            logDebug("getNextWorkDay function is only available in Accela Automation 6.3.2 or higher.");
            while (i < Math.abs(amt)) {
                dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * (amt > 0 ? 1 : -1)));
                if (dDate.getDay() > 0 && dDate.getDay() < 6)
                    i++
            }
        } else {
            while (i < Math.abs(amt)) {
                dDate = new Date(aa.calendar.getNextWorkDay(aa.date.parseDate(dDate.getMonth() + 1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
                i++;
            }
        }
    else
        dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * amt));

    return (dDate.getMonth() + 1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
}
