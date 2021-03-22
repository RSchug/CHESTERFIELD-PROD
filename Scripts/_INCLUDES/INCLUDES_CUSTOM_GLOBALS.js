/*------------------------------------------------------------------------------------------------------/
| Program : INCLUDES_CUSTOM_GLOBALS.js
| Event   : N/A
|
| Usage   : Accela Custom Includes.  Required for all Custom Parameters
|
| Notes   : 
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| Custom Parameters
|	Ifchanges are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
feeEstimate=false;
if(vEventName.equals("FeeEstimateAfter4ACA")) 
	feeEstimate=true;
//db added 05-2020
sendDebugEmail = false;                         // Used for debugging ACA Scripts by emailing debug output.
debugEmailAddress = "";                         // Used for sending out debug Emails for testing purposes.
if (matches(publicUserID, "PUBLICUSER1182", "PUBLICUSER1202",'PUBLICUSER548393')) {
    showDebug = true;
    if (publicUserEmail && publicUserEmail != "") {
        //publicUserEmail = publicUserEmail.replace("TURNED_OFF", ""); // replace TURNED_OFF since most ACA user emails are turned off in SUPP.
        sendDebugEmail = true; 
        debugEmailAddress = publicUserEmail;
        logDebug("debugEmailAddress: " + debugEmailAddress);
    }
}

showDebug = false;
if (currentUserID == "ADMIN") showDebug = true;
if (currentUserID == "HOBDAYK") showDebug = true;
if (currentUserID == "KHOBDAY") showDebug = 3;
if (currentUserID == "DBOUCHER") showDebug = true;
if (currentUserID == "MBOUQUIN") showDebug = true;
if (currentUserID == "JGUEST") showDebug = true;
if (currentUserID == "GUESTJ") showDebug = true;
if (currentUserID == "TRUEPOINT") showDebug = 3;
if (currentUserID == "RSCHUG") showDebug = true;
if (currentUserID == "DHOOPS") showDebug = 3;
if (currentUserID == "NGRAF") showDebug = 3;
if (currentUserID == "GATEKEEPER") showDebug = 3;
/*------------------------------------------------------------------------------------------------------/
| END Custom Parameters
/------------------------------------------------------------------------------------------------------*/

/*-----DEFINE AGENCY VARIABLES FOR DIGEPLAN SCRIPTS-----*/
var digEplanAPIUser = "DIGEPLAN";
var inReviewDocStatus = "In Review";
var interimDocStatus = "Comments Available";
var reviewCompleteDocStatus = "Review Complete";
var revisionsRequiredDocStatus = "Revisions Requested";
var docInternalCategory = "Final Plans";
var docCommentCategory = "Comments";
var approvedDocStatus = "Approved";
var approvedFinalDocStatus = "Review Complete - Approved";
var approvedPendingDocStatus = "Approved - Pending";
var approvedIssuedDocStatus = "Approved Set";