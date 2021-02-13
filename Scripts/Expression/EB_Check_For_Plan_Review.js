/*------------------------------------------------------------------------------------------------------/
| SVN $Id:  EB_Check_For_Plan_Review.js  
| Program : EB_Check_For_Plan_Review.js
| Usage   : Expression Builder Script that will validate a Cap ID
| Client  : Chesterfield County, VA
| Notes   : Expression builder script to be used on ASI portlet.  Execute on the CAP ID field
/------------------------------------------------------------------------------------------------------*/

var msg = "";
var aa = expression.getScriptRoot();
var licCap = null;
var licObj = expression.getValue("ASI::CC-PLN-SITE_DETAIL::Engineering Plan Review Number");
var thisForm = expression.getValue("ASI::FORM");
var licNum = licObj.value;

if (licNum.toUpperCase().indexOf('ESC') == -1 && licNum.toUpperCase().indexOf('LIN') == -1 && licNum.toUpperCase().indexOf('TMB') == -1)
    {
	msg = "Invalid Record Type, needs to be ESC Plan, Linear Project, or Timbering. Please try again";
    licObj.value = "";
    thisForm.blockSubmit=true;
    }
if (licNum) licCap = aa.cap.getCapID(licNum).getOutput();
if (!licCap)
    {
     msg = "Invalid Record Number, please try again";
     licObj.value = "";
     thisForm.blockSubmit=true;
    }
else
    {
    msg = aa.cap.getCap(licCap).getOutput().getSpecialText();   
    thisForm.blockSubmit=false;
    }
licObj.message = msg;
expression.setReturn(licObj);
expression.setReturn(thisForm);