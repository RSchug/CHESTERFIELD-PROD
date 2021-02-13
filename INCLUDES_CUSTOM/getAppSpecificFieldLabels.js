function getAppSpecificFieldLabels() {
// returns an array of field labels (Alias | Label) for each field that matches.
    var itemCap = (arguments.length > 0 && arguments[0] != null ? arguments[0] : capId); // use cap ID specified in args
    var itemGroups = (arguments.length > 1 && arguments[1] != null ? arguments[1] : null);
    var itemNames = (arguments.length > 2 && arguments[2] != null ? arguments[2] : null);
    var itemValues = (arguments.length > 3 && arguments[3] != null ? arguments[3] : ['CHECKED', 'YES', 'Y', 'SELECTED', 'TRUE', 'ON']);
    var itemTypes = (arguments.length > 4 && arguments[4] != null ? arguments[3] : ['Y/N','Checkbox']);

    var fieldTypes = ["", "Text", "Date", "Y/N", "Number", "Dropdown List", "Text Area", "Time", "Money", "Checkbox", ""];

    var items = [];
    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
    if (appSpecInfoResult.getSuccess()) {
        var appspecObj = appSpecInfoResult.getOutput();
        for (var i in appspecObj) {
            var fieldType = appspecObj[i].getCheckboxInd();
            if (appspecObj[i].getCheckboxInd() != null && appspecObj[i].getCheckboxInd() < fieldTypes.length) fieldType = fieldTypes[appspecObj[i].getCheckboxInd()]
            if (itemGroups && !exists(appspecObj[i].getCheckboxType(), itemGroups)) continue;
            if (itemNames && !exists(appspecObj[i].getCheckboxDesc(), itemNames)) continue;
            //if (i == 0) logDebug("appspecObj[i]: " + br + describe_TPS(appspecObj[i]));
            //logDebug("appspecObj["+i+"]: " + appspecObj[i].getCheckboxType() + "." + appspecObj[i].getCheckboxDesc() + ", Label " + appspecObj[i].getFieldLabel() + ", (Type:" + appspecObj[i].getCheckboxInd() +" "+ fieldType + "):  " + appspecObj[i].getChecklistComment());
            if (itemValues && !exists(appspecObj[i].getChecklistComment(), itemValues)) continue;
            if (appspecObj[i].getLabelAlias()) { // Use Alias.
                items.push(appspecObj[i].getLabelAlias());
            } else {
                items.push(appspecObj[i].getCheckboxDesc());
            }
        }
    }
    else { logDebug("**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage()) }
	return items;
}
