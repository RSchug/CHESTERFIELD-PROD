//var id1 = aa.env.getValue("id1");
//var id2 = aa.env.getValue("id2");
//var id3 = aa.env.getValue("id3");
//var result = aa.cap.getCapID(id1,id2,id3);
//var capId = result.getOutput();
var debug = "";								// Debug String
var br = "<BR>";
var capId =aa.cap.getCapID("20170119-00001").getOutput();
var payResult = aa.finance.getPaymentByCapID(capId, null);
if (payResult.getSuccess())
	{
      var paydetail = payResult.getOutput(); 
      for (var k = 0; k < paydetail.length; k++)
	{

	  
        // debugObject(paydetail[0]);
	  var statusD= paydetail[k].getPaymentDate();
         var  statusDate = "" + statusD.getMonth() + "/" + statusD.getDayOfMonth() + "/" + statusD.getYear() + " " + statusD.getHourOfDay() + ":" +  statusD.getMinute() +":" + statusD.getSecond();
          aa.print("paymentdate: " +statusDate); 
           var paidamount =paydetail[k].getPaymentAmount();
          aa.print("paidamount : " +paidamount ); 
          var transcode =paydetail[k].getRegisterNbr();
          aa.print("transcode " +transcode);
          var pseqno =paydetail[k].getPaymentSeqNbr();
          aa.print("pseqno: " +pseqno);
      }  

}

//-----------------------
var pfResult = aa.finance.getPaymentFeeItems(capId, null);
if (pfResult.getSuccess())
{
      var payfeedetail = pfResult.getOutput(); 
      for (var kk = 0; kk < payfeedetail.length; kk++)
	{

	  //debugObject(payfeedetail[0]);
            var pseqno1 =payfeedetail[kk].getFeeSeqNbr();
          aa.print("pseqno1: " +pseqno1);

         }
  }
//------------------------
var estValue = 0; var calcValue = 0; var feeFactor			// Init Valuations
var valobj = aa.finance.getContractorSuppliedValuation(capId,null).getOutput();	// Calculated valuation 
if (valobj.length) {
	estValue = valobj[0].getEstimatedValue(); 
	calcValue = valobj[0].getCalculatedValue();
	feeFactor = valobj[0].getbValuatn().getFeeFactorFlag(); 
	}

var balanceDue = 0 ; var houseCount = 0; feesInvoicedTotal = 0;		// Init detail Data
var capDetail = "";
var capDetailObjResult = aa.cap.getCapDetail(capId);			// Detail
if (capDetailObjResult.getSuccess())
	{
	capDetail = capDetailObjResult.getOutput(); 
        // debugObject(capDetail);

	var houseCount = capDetail.getHouseCount(); 
	var feesInvoicedTotal = capDetail.getTotalFee();
	var balanceDue = capDetail.getBalance(); 
        aa.print("balanceDue: " +balanceDue); 
        aa.print("feesInvoicedTotal: " +feesInvoicedTotal);
	}

var asd =loadFees(capId);
 for (var j = 0; j < asd.length; j++)
{
    debugObject(asd[j]);

   aa.print("FEE APPLIED: " +j);
   aa.print("feecode: " +asd[j]["code"]);
   aa.print("ApplyDate: " +asd[j]["applyDate"]);
   aa.print("AccountCode1: " +asd[j]["accCodeL1"]);
   aa.print("AmountPaid: " +asd[j]["amountPaid"]);
}
//******************************************



//**********************************************

function debugObject(object) {
    var output = 'Methods:' + br;
    for (property in object) {
        if (typeof (object[property]) == "function")
            output += "" + property + " " + ': ' + "" + object[property] + "" + br;
    }
    output += "" + br;
    output += "Properties:" + br;

    for (property in object) {
        if (typeof (object[property]) != "function")
            output += "" + property + " " + ': ' + "" + object[property] + "" + br;
    }

    aa.print(output);
}

function getType(obj) {
	if (obj === null)
		return "[object Null]";
	// special case
	//if(obj instanceof javaobject) return obj.getClass();
	return Object.prototype.toString.call(obj).replace(/^\[object (.+)\]$/, "$1").toLowerCase();
} 
function formatDate(date)
{
	if(date == null)
	{
		return "";
	}
	return aa.util.formatDate(date, "MM/dd/yyyy, hh:mm:ss");
}

function loadFees()  // option CapId
	{
	//  load the fees into an array of objects.  Does not
	var itemCap = capId
	if (arguments.length > 0)
		{
		ltcapidstr = arguments[0]; // use cap ID specified in args
		if (typeof(ltcapidstr) == "string")
                {
				var ltresult = aa.cap.getCapID(ltcapidstr);
	 			if (ltresult.getSuccess())
  				 	itemCap = ltresult.getOutput();
	  			else
  				  	{ logMessage("**ERROR: Failed to get cap ID: " + ltcapidstr + " error: " +  ltresult.getErrorMessage()); return false; }
                }
		else
			itemCap = ltcapidstr;
		}

  	var feeArr = new Array();

	var feeResult=aa.fee.getFeeItems(itemCap);
		if (feeResult.getSuccess())
			{ var feeObjArr = feeResult.getOutput(); }
		else
			{ logDebug( "**ERROR: getting fee items: " + feeResult.getErrorMessage()); return false }

		for (ff in feeObjArr)
			{
			fFee = feeObjArr[ff];
			var myFee = new Fee();
			var amtPaid = 0;

			var pfResult = aa.finance.getPaymentFeeItems(itemCap, null);
			if (pfResult.getSuccess())
				{
				var pfObj = pfResult.getOutput();
				for (ij in pfObj)
					if (fFee.getFeeSeqNbr() == pfObj[ij].getFeeSeqNbr())
						amtPaid+=pfObj[ij].getFeeAllocation()
				}

			myFee.sequence = fFee.getFeeSeqNbr();
			myFee.code =  fFee.getFeeCod();
			myFee.sched = fFee.getF4FeeItemModel().getFeeSchudle();
			myFee.description = fFee.getFeeDescription();
			myFee.unit = fFee.getFeeUnit();
			myFee.amount = fFee.getFee();
			myFee.amountPaid = amtPaid;
			if (fFee.getApplyDate()) myFee.applyDate = convertDate(fFee.getApplyDate());
			if (fFee.getEffectDate()) myFee.effectDate = convertDate(fFee.getEffectDate());
			if (fFee.getExpireDate()) myFee.expireDate = convertDate(fFee.getExpireDate());
			myFee.status = fFee.getFeeitemStatus();
			myFee.period = fFee.getPaymentPeriod();
			myFee.display = fFee.getDisplay();
			myFee.accCodeL1 = fFee.getAccCodeL1();
			myFee.accCodeL2 = fFee.getAccCodeL2();
			myFee.accCodeL3 = fFee.getAccCodeL3();
			myFee.formula = fFee.getFormula();
			myFee.udes = fFee.getUdes();
			myFee.UDF1 = fFee.getUdf1();
			myFee.UDF2 = fFee.getUdf2();
			myFee.UDF3 = fFee.getUdf3();
			myFee.UDF4 = fFee.getUdf4();
			myFee.subGroup = fFee.getSubGroup();
			myFee.calcFlag = fFee.getCalcFlag();;
			myFee.calcProc = fFee.getFeeCalcProc();
			myFee.version = fFee.getF4FeeItemModel().getVersion();

			feeArr.push(myFee)
			}

		return feeArr;
		}


//////////////////

function Fee() // Fee Object
	{
	this.sequence = null;
	this.code =  null;
	this.description = null;  // getFeeDescription()
	this.unit = null; //  getFeeUnit()
	this.amount = null; //  getFee()
	this.amountPaid = null;
	this.applyDate = null; // getApplyDate()
	this.effectDate = null; // getEffectDate();
	this.expireDate = null; // getExpireDate();
	this.status = null; // getFeeitemStatus()
	this.recDate = null;
	this.period = null; // getPaymentPeriod()
	this.display = null; // getDisplay()
	this.accCodeL1 = null; // getAccCodeL1()
	this.accCodeL2 = null; // getAccCodeL2()
	this.accCodeL3 = null; // getAccCodeL3()
	this.formula = null; // getFormula()
	this.udes = null; // String getUdes()
	this.UDF1 = null; // getUdf1()
	this.UDF2 = null; // getUdf2()
	this.UDF3 = null; // getUdf3()
	this.UDF4 = null; // getUdf4()
	this.subGroup = null; // getSubGroup()
	this.calcFlag = null; // getCalcFlag();
	this.calcProc = null; // getFeeCalcProc()
	this.auditDate = null; // getAuditDate()
	this.auditID = null; // getAuditID()
	this.auditStatus = null; // getAuditStatus()
	this.version = null; // getVersion()
	}


function convertDate(thisDate)
	{

	if (typeof(thisDate) == "string")
		{
		var retVal = new Date(String(thisDate));
		if (!retVal.toString().equals("Invalid Date"))
			return retVal;
		}

	if (typeof(thisDate)== "object")
		{

		if (!thisDate.getClass) // object without getClass, assume that this is a javascript date already
			{
			return thisDate;
			}

		if (thisDate.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime"))
			{
			return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
			}
			
		if (thisDate.getClass().toString().equals("class com.accela.aa.emse.util.ScriptDateTime"))
			{
			return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
			}			

		if (thisDate.getClass().toString().equals("class java.util.Date"))
			{
			return new Date(thisDate.getTime());
			}

		if (thisDate.getClass().toString().equals("class java.lang.String"))
			{
			return new Date(String(thisDate));
			}
		}

	if (typeof(thisDate) == "number")
		{
		return new Date(thisDate);  // assume milliseconds
		}

	aa.print("**WARNING** convertDate cannot parse date : " + thisDate);
	return null;

	}