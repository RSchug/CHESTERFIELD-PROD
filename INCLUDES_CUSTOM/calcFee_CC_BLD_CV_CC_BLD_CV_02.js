/**
 * Calculates the fee CC-BLD-CV.CC-BLD-CV-02
 * $48 per elevator car. ****
 * The actual construction permit cost for Esc and Elev are covered through 
 * the Bldg and Mech auxiliary permits. This is the annual certificate for 
 * operation after construction. Add up the counts in the ASIT (list of 
 * equipments) do not include escalators.
 * 
 * @return null
 */
function calcFee_CC_BLD_CV_CC_BLD_CV_02() {

    //fee variables
    var fcode = "CC-BLD-CV-02";
    var fsched = "CC-BLD-CV";
    var fperiod = "FINAL";
    var fqty = 48.00;
    var finvoice = "N";

    try {
        // get the ASI field needed for the fee calculation.
        var tblName = "CC-BLD-CV-EL";
        var totalElevators = 0;

        var equipmentArray = loadASITable(tblName);

        if (!equipmentArray) {
            logDebug("Can't find ASI Table: " + tblName);
            return null;
        }

        for (e in equipmentArray) {
            var equipment = equipmentArray[e];

            if (!equipment.Type.fieldValue.toUpperCase().equals("ESCALATOR")) {
                var count = parseInt(equipment.Count.fieldValue);
                totalElevators += count;
            }
        }

        // calculation code here.
        if (totalElevators == 0) {
            logDebug("No elevators found. Can't assess fee " + fsched + "." + fcode);
            return null;
        } else {
            fqty = fqty * totalElevators;
            logDebug("Total elevators found: " + totalElevators);
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
