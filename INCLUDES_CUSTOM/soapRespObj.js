function soapRespObj(){
//Creates SOAPResponsObject that is returned by DPOR Interface
   this.isErr = false; //true if soap Error
   this.respObj = null; //response object
   this.errorMessage = ""; //should be popualted if true;
};