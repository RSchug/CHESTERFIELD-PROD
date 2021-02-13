/**
 * Calculates the fee CC-BLD-COMM.CC-BLD-001
 * $7.40 for each $1000 or fraction with a minimum of $297.00
 * 
 * @return null
 */
function calcFee_CC_BLD_COMM_CC_BLD_001() {

	//fee variables
	var fcode = "CC-BLD-001";
	var fsched = "CC-BLD-COMM";
	var fperiod = "FINAL";
	var fqty = 297.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
		var totalCostOfWork = AInfo["Total Cost of Work"];

		if (totalCostOfWork == "" || totalCostOfWork == null) {
			logDebug("Total Cost of Work amount is required to calculate fee.");
			return false;
		}

		// calculation code here.
		totalCostOfWork = parseFloat(totalCostOfWork);
		if (totalCostOfWork > 1000.00) {
			fqty = fqty + (Math.floor((totalCostOfWork / 1000)) * 7.40);
		}

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
