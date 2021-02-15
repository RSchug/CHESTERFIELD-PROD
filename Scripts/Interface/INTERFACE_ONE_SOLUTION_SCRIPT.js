//aa.env.setValue("id1", "REC17");
//aa.env.setValue("id2", "00000");
//aa.env.setValue("id3", "00010");
var id1 = aa.env.getValue("id1");
var id2 = aa.env.getValue("id2");
var id3 = aa.env.getValue("id3");
var result = aa.cap.getCapID(id1,id2,id3);
var capId = result.getOutput();
aa.env.setValue("ScriptReturnCode","0");
aa.env.setValue("ScriptReturnMessage", "Got the Cap ID successfully");
//var capId =aa.cap.getCapID("20170119-00001").getOutput();
var feeResult=aa.fee.getFeeItems(capId);
var feevalues= new Array();
		if (feeResult.getSuccess())
			{ var feeObjArr = feeResult.getOutput(); }
		else
			{ aa.print( "**ERROR: getting fee items: " + feeResult.getErrorMessage());  }

		for (ff in feeObjArr)
		{
			fFee = feeObjArr[ff];
			var myFee = new Fee();
			var amtPaid = 0;
                        var accountcode  = "";
                        var statusD = "";
                        var statusDate1  = "";
                        var paymentseq = "";
			var pfResult = aa.finance.getPaymentFeeItems(capId, null);
                       
			if (pfResult.getSuccess())
				{
				var pfObj = pfResult.getOutput();
                               // debugObject(pfObj[0]);
				 for (ij in pfObj)
				 {
					if (fFee.getFeeSeqNbr() == pfObj[ij].getFeeSeqNbr())
					{
						                      amtPaid+=pfObj[ij].getFeeAllocation()
                                                aa.print("AmountPaid: " +amtPaid);
                                                 accountcode =  fFee.getAccCodeL1();
                                                aa.print("AccountCode: " +accountcode);
                                                statusD = pfObj[ij].getAuditDate();
                                                 statusDate1 = "" + statusD.getMonth() + "/" + statusD.getDayOfMonth() + "/" + statusD.getYear() + " " + statusD.getHourOfDay() + ":" +  statusD.getMinute() +":" + statusD.getSecond();
                                                aa.print("applydate : " +statusDate1); 
                                                paymentseq = pfObj[ij].getPaymentSeqNbr();
                                                aa.print("Sequenceno: " +paymentseq);
                                                
												
												 var counter = ij;
                                               
                                                 counter = statusDate1 +"-"+ amtPaid +"-"+ accountcode;
                                                 aa.print("counter: " +counter);
												  feevalues.push(counter);
                                                
												  aa.env.setValue("counter",ij);
                                              aa.print("-------------------------");
					}
				  }
				} 
		}
		
for (i = 0; i < feevalues.length; i++) 
{
   aa.print("----");
   aa.print(feevalues[i]);
   aa.env.setValue("AccountCode" +i,feevalues[i]);
 
}

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

