function invokeDPOR(licNbr,token,serviceURL) {
   var respObj = new soapRespObj();
   
   //Set Namespaces and SOAP Envelope
   var soapenv = new Namespace("http://schemas.xmlsoap.org/soap/envelope/");
   var urn = new Namespace("urn:VadporLicLkpService");
   var licSearch = <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:VadporLicLkpService"><soapenv:Header/><soapenv:Body><urn:searchLicense><clientIp>10.111.18.13</clientIp><licNbr/><name/><addr/><board/><clntCde/><token/></urn:searchLicense></soapenv:Body></soapenv:Envelope>;
   
   licSearch.soapenv::Body.urn::searchLicense.licNbr = licNbr;
   licSearch.soapenv::Body.urn::searchLicense.token = token;
   
   //make the Web Service Call returns a success or throws http500 if no license found
   var httpReq = aa.util.httpPostToSoapWebService(serviceURL, licSearch.toString(), "", "", "");
   if(httpReq.getSuccess()){
	  var tmpResp = httpReq.getOutput();
	  tmpResp = tmpResp.replace('<?xml version="1.0" encoding="UTF-8"?>',"");
	  tmpResp = tmpResp.replace("&","&");
	  
	  eval("var httpResp = " + tmpResp.toString() + ";"); //Eval it as XML
	  
	  if(httpResp.soapenv::Body.soapenv::Fault.toString() != ""){
		 //Web Service SOAP Error
		 respObj.isErr = true;
		 respObj.errorMessage = httpResp.soapenv::Body.soapenv::Fault.detail.fault.errorMessage.toString();
	  }
	  else if (httpResp.soapenv::Body.urn::searchLicenseResponse.searchLicenseReturn.toString() == ""){
		 respObj.isErr = true;
		 respObj.errorMessage = "License Not Found";
	  }
	  else{
		 //Web Service OK populated DPOR Object                                          
		 var tmpObj = httpResp.soapenv::Body.urn::searchLicenseResponse.searchLicenseReturn.item;
		 var licObj = new dporObj(tmpObj);
		 respObj.respObj = licObj;
	  }
   }
   else{
	  respObj.isErr = true;
	  respObj.errorMessage = "License Not Found";
   }
   
   return respObj;
};