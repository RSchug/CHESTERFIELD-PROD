function updateASITable_TPS(tableName, keyColNames, targetCapId) {
    // Used to update existing table in targetCapId record based on keyCol column in targetCapId.
    // Will not remove any rows not found in srcCapId record
    // Will add rows found in srcCapId record but not found in targetCapId record
    var srcCapId = (arguments.length > 3 && arguments[3] ? arguments[3] : capId);
    logDebug("Updating ASI " + tableName + " table rows using " + keyColNames.join(",")
        + " for " + (targetCapId ? targetCapId.getCustomID() : targetCapId)
        + " from " + (srcCapId ? srcCapId.getCustomID() : srcCapId));
    var sRows = loadASITable(tableName, srcCapId);
    if (typeof (sRows) != "object") srcRows = null;
    if (sRows && sRows.length > 0) {
        var rowsUpdated = 0;
        var newRows = [];
        var tableUpdated = false;
        var tRows = loadASITable(tableName, targetCapId);
        if (typeof (tRows) != "object") srcRows = null;
        if (tRows && tRows.length > 0) {
            logDebug("Updating " + tableName + " table for " + (targetCapId ? targetCapId.getCustomID() : targetCapId));
            var updatedRows = [];
            for (var tEachRow in tRows) {
                var tRow = tRows[tEachRow];
                for (var sEachRow in sRows) {
                    var sRow = sRows[sEachRow];
                    var keysMatch = true;
                    var keys = [];
                    for (var sColName in keyColNames) {
                        var keyColName = keyColNames[sColName];
                        sColValue = null;
                        if (typeof (sRow[keyColName]) != "undefined") sColValue = sRow[keyColName].toString();
                        tColValue = null;
                        if (typeof (tRow[keyColName]) != "undefined") tColValue = tRow[keyColName].toString();
                        if (tColValue != sColValue) {
                            keysMatch = false;
                            keys.push(keyColName + ":" + tColValue)
                        }
                    }
                    if (keysMatch) {
                        logDebug("Updating Row: " + keys.join(","));
                        for (var i in sRow) {
                            if (typeof (tRow[i]) != "undefined")
                                tRow[i] = sRow[i];
                        }
                        updatedRows.push(sEachRow) //
                        tableUpdated = true;
                    }
                }
            }
            // Add new rows
            for (sEachRow in sRows) {
                tableUpdated = true;
                var sRow = sRows[sEachRow];
                if (exists(sEachRow, updatedRows)) continue; // Ignore updated rows.
                var keys = [];
                for (var sColName in keyColNames) {
                    var keyColName = keyColNames[sColName];
                    sColValue = null;
                    if (typeof (sRow[keyColName]) != "undefined") sColValue = sRow[keyColName].toString();
                    tColValue = null;
                    if (typeof (tRow[keyColName]) != "undefined") tColValue = tRow[keyColName].toString();
                    if (tColValue != sColValue) {
                        keysMatch = false;
                        keys.push(keyColName + ":" + tColValue)
                    }
                }
                logDebug("Adding row: " + keys.join(","));
                tRows.push(sRow);
            }
        } else {
            logDebug("Replacing " + tableName + " table for " + (targetCapId ? targetCapId.getCustomID() : targetCapId));
            tRows = sRows;
            tableUpdated = true;

        }
        if (tableUpdated) {
            removeASITable(tableName, targetCapId);
            addASITable(tableName, tRows, targetCapId);
        }
    } else {
        logDebug(tableName + " table is missing for " + (srcCapId ? srcCapId.getCustomID() : srcCapId));
    }
}
