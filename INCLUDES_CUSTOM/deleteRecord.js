function deleteRecord(itemCapId) {
    // aa.cap.removeRecord(itemCapId) is currently giving this error:
    //  DELETE FROM G7SERIES_UPDATE_LOG WHERE SERV_PROV_CODE = ? AND G7_UPDATE_TYPE = ? AND G7_UPDATE_VALUE = ? AND G7_UPDATE_VALUE2 IN (SELECT B1_CONTACT_NBR FROM B3CONTACT WHERE SERV_PROV_CODE = ? AND B1_PER_ID1 = ? AND B1_PER_ID2 = ? AND B1_PER_ID3 = ?) Error converting data type varchar to bigint.
    try {
        var removeRecordResult = aa.cap.removeRecord(itemCapId);
        if (removeRecordResult.getSuccess()) {
            logDebug("Successfully deleted record " + itemCapId.getCustomID());
        } else {
            logDebug("Failed to deleted record " + itemCapId.getCustomID() + ". Reason: " + removeRecordResult.getErrorMessage());
        }
    } catch (err) {
        logDebug("A JavaScript Error occurred: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
    }
}