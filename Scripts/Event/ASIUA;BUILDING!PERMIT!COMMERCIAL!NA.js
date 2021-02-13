if ((AInfo["Nature of Work"] == "New Construction") && !feeExists("NEWCONST")){
addFee("NEWCONST","CC-BLD-COMM","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-COMM","FINAL",1,"Y")}

if ((AInfo["Nature of Work"] == "Addition")&& !feeExists("ADDITION")){
addFee("ADDITION","CC-BLD-COMM","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-COMM","FINAL",1,"Y")}

if ((AInfo["Nature of Work"] == "Accessory Structure")&& !feeExists("UPFIT")){
addFee("UPFIT","CC-BLD-COMM","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-COMM","FINAL",1,"Y")}

if ((AInfo["Nature of Work"] == "Administrative")&& !feeExists("ADMIN")){
addFee("ADMIN","CC-BLD-COMM","FINAL",1,"Y")}

if ((AInfo["Nature of Work"] == "Classroom or Office Trailer Installation or Relocation")&& !feeExists("CLASS")){
addFee("CLASS","CC-BLD-COMM","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-COMM","FINAL",1,"Y")}

if ((AInfo["Nature of Work"] == "Communication Tower (includes related equipment shelters)")&& !feeExists("COMMTOWER")){
addFee("COMMTOWER","CC-BLD-COMM","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-COMM","FINAL",1,"Y")}

if ((AInfo["Nature of Work"] == "Exterior Renovation")&& !feeExists("UPFIT")){
addFee("UPFIT","CC-BLD-COMM","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-COMM","FINAL",1,"Y")}

if ((AInfo["Nature of Work"] == "Footing and Foundation")&& !feeExists("FOOTING")){
addFee("FOOTING","CC-BLD-COMM","FINAL",1,"Y")}

if ((AInfo["Nature of Work"] == "Industrialized Building")&& !feeExists("INDUSTRIAL")){
addFee("INDUSTRIAL","CC-BLD-COMM","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-COMM","FINAL",1,"Y")}

if ((AInfo["Nature of Work"] == "Interior and Exterior Renovation")&& !feeExists("UPFIT")){
addFee("UPFIT","CC-BLD-COMM","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-COMM","FINAL",1,"Y")}

if ((AInfo["Nature of Work"] == "Interior Renovation")&& !feeExists("UPFIT")){
addFee("UPFIT","CC-BLD-COMM","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-COMM","FINAL",1,"Y")}

if ((AInfo["Nature of Work"] == "Reroof")&& !feeExists("UPFIT")){
addFee("UPFIT","CC-BLD-COMM","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-COMM","FINAL",1,"Y")}

if ((AInfo["Nature of Work"] == "Retaining Wall")&& !feeExists("RETAINWALL")){
addFee("RETAINWALL","CC-BLD-COMM","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-COMM","FINAL",1,"Y")}

if ((AInfo["Nature of Work"] == "Swimming Pool")&& !feeExists("SWIMPOOL")){
addFee("SWIMPOOL","CC-BLD-COMM","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-COMM","FINAL",1,"Y")}

if ((AInfo["Nature of Work"] == "Tenant Upfit")&& !feeExists("UPFIT")){
addFee("UPFIT","CC-BLD-COMM","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-COMM","FINAL",1,"Y")}

if ((AInfo["Nature of Work"] == "Tent")&& !feeExists("TENT")){
addFee("TENT","CC-BLD-COMM","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-COMM","FINAL",1,"Y")}

if ((AInfo["Nature of Work"] == "Flagpole")&& !feeExists("FLAGPOLE")){
addFee("FLAGPOLE","CC-BLD-COMM","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-COMM","FINAL",1,"Y")}
