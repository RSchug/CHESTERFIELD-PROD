// WTUB:Enforcement/*/*/*
// 32CE: When Workflow Task Status = Invoice Issued
//      THEN: Check to make sure an Abatement Fee is added on the record and if not abatement fee is on the record
//      THEN: Display message "No Abatement Fee Assessed"
if (wfStatus == 'Invoice Issued' && !feeExists("CC-ENF-ZON")) {
    showMessage = true;
    comment('No Abatement Fee Assessed');
    cancel = true;
}
if (wfStatus == 'Invoice Issued' && feeExists("CC-ENF-ZON","NEW")) {
    showMessage = true;
    comment('No Abatement Fee Assessed');
    cancel = true;
}