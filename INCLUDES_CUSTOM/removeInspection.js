function removeInspection(inspectionModel) {
// Modified from INCLUDES_RECORD.
	var removeResult = null;
	var gsiBiz = aa.proxyInvoker.newInstance("com.accela.aa.inspection.inspection.InspectionBusiness").getOutput();
	if (gsiBiz) {
		try {
			removeResult = gsiBiz.removeInspection(inspectionModel);
		} catch (err) {
            logDebug("**WARNING** error removing inspection failed " + err.message);
		}
    }
    return removeResult;
}
