/**
 * Calculates the fee CC-BLD-MULTIUNIT.CC_BLDMU003
 * Townhouse, Townhouse building with units sold as condominiums, or Duplex. $684 per unit
 * 
 * @return null
 */
function calcFee_CC_BLD_MULTIUNIT_CC_BLDMU003() {

	//fee variables
	var fcode = "CC_BLDMU003";
	var fsched = "CC-BLD-MULTIUNIT";
	var fperiod = "FINAL";
	var fqty = 684.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
        var tblName = "CC-BLD-MULTI-UNIT-DETAIL";
        var unitCount = 0;

        var unitDetailArray = null;
        if (CCBLDMULTIUNITDETAIL) {
            unitDetailArray = CCBLDMULTIUNITDETAIL;
        } else {
            unitDetailArray = loadASITable(tblName);
        }

        if (!unitDetailArray) {
            logDebug("Can't find ASI Table: " + tblName);
        } else {
        	unitCount = unitDetailArray.length;
        }
		
		// calculation code here.
		fqty = fqty * unitCount;
		
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
