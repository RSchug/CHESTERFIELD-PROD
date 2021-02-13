// WTUB:Building/Permit/Elevator/Installation
// Before Permit Issuance: Fees must be paid, Address, Parcel and Owner are required.  // Before Permit Issuance: the Number of Elevators in Table must match the Number of Elevators field.  If not, an error will display indicating missing information
if ((wfTask == 'Permit Issuance' && wfStatus == 'Issued')) {
    var totalElevators = 0;
    if (typeof (CCBLDELEVATOR) != "undefined" && CCBLDELEVATOR && CCBLDELEVATOR.length) totalElevators = CCBLDELEVATOR.length;
    logDebug("totalElevators: " + totalElevators);
    if (totalElevators != AInfo["Number of Elevators"]) {
        showMessage = true;
        comment('<font size=small><b>Prior to Issuance the Number of Elevators must match # of rows in Elevators table.</b></font>');
        cancel = true;
    }
}
