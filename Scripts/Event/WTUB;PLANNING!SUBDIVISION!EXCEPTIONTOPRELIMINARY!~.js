// Results required 93P
if (matches(wfTask, 'Administrative Approval') && matches(wfStatus, 'Final Approval')) {
    if (AInfo['No Time Limit'] != 'CHECKED'){
    if (AInfo['Approved Time Limit'] == null || AInfo['Conditions'] == null) {
        showMessage = true;
        comment('You cannot advance this workflow until ALL fields in the <b>Results</b> area of the Data Fields are completely filled in.  Put in zeroes (0) for those fields that do not apply.');
        cancel = true;
    }
}
}