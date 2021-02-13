/**
 * Calculates the fee CC-BLD-MIXEDUSE.CC_BLDR018
 * Resulting in a change of use or an increase in square footage. 
 * Unfinished space to finished, without footings. -- $171.00 ****
 *
 * Search "Work Description - Residential" Nature of work column, look 
 * for "Change of Use" or "Addition" if found add $171.00, else $114.00.
 * 
 * @return null
 */
function calcFee_CC_BLD_MIXEDUSE_CC_BLDR018() {

	//fee variables
	var fcode = "CC_BLDR018";
	var fsched = "CC-BLD-MIXEDUSE";
	var fperiod = "FINAL";
	var fqty = 171.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
        var tblName = "CC-BLD-MIXEDUSE-WD-RESIDENTIAL";
        var changeOfUse = false;

        var workDescriptionResidentialArray = null;
        if (CCBLDMIXEDUSEWDRESIDENTIAL) {
            workDescriptionResidentialArray = CCBLDMIXEDUSEWDCOMMERCIAL;
        } else {
            workDescriptionResidentialArray = loadASITable(tblName);
        }

        if (!workDescriptionResidentialArray) {
            logDebug("Can't find ASI Table: " + tblName);
        } else {
            for (i in workDescriptionResidentialArray) {
                var workDescription = workDescriptionResidentialArray[i];
                var natureOfWork = workDescription["Nature of work"].fieldValue;

                if (natureOfWork.toUpperCase().indexOf("CHANGE OF USE") >= 0 || 
                	natureOfWork.toUpperCase().indexOf("ADDITION") >= 0) {
                    changeOfUse = true;
                }
            }
        }
		
		// calculation code here.
		if (!changeOfUse) fqty = 114.00;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}
