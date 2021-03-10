function dporObj(lpObj){
// Reads the SOAP response from DPOR @param {XMLDocument} lpObj @return {dporObject}

	   this.licNbr = lpObj.licNbr.toString();
	   this.fName = lpObj.addr.firstNme.toString();
	   //this.fName = lpObj.addr.firstNme.toString();
	   this.mName = lpObj.addr.middleNme.toString();
	   this.lName = lpObj.addr.lastNme.toString();
	   this.entTypCde=lpObj.entTypCde.toString();
	   this.boardNme=lpObj.boardNme.toString();
	   this.busName = lpObj.addr.keyNme.toString();
	   this.DBATradeName=lpObj.addr.dba.toString();
	   var amp = new RegExp("&", "g");
	   this.busName = this.busName.replace(amp,"&");
	   this.address1 = (lpObj.addr.strAddrNbr.toString() + " " + lpObj.addr.addrLine1.toString()).trim();
	   this.address2 = lpObj.addr.addrLine2.toString();
	   this.city = lpObj.addr.addrCty.toString();
	   this.state = lpObj.addr.stCde.toString();
	   this.zip = lpObj.addr.addrZip.toString().replace("-","");
	   if(this.zip.length > 5){
			this.zip = this.zip.substring(0,5);
	   }
	   this.issueDate = getFormatedDate(lpObj.origDte.toString());
	   this.expireDate = getFormatedDate(lpObj.exprDte.toString());
	   this.licStatus = lpObj.licStaDesc.toString();
	   this.rankDesc=lpObj.rankDesc.toString();
	   this.rank =  lpObj.rankCde.toString();
	   this.clntNme = lpObj.clntNme.toString();
	   this.codes = new Array();
	   //Build comments for display purposes
	   this.comments = "";
	   for (x in lpObj.mdfs.item){
		  this.comments += "\n" + lpObj.mdfs.item[x].modLngDesc.toString();
		  this.codes.push(lpObj.mdfs.item[x].modCde.toString());
	   }
	   
	   return this;
};