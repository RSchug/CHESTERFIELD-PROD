//Before Workflow Task Status can be selected - confirm that at least one Address, one Parcel and one Owner exists on Record.
if ((wfTask == 'Concern Intake' && wfStatus == 'Assigned') && (!addressExistsOnCap())) {          // Check if address exists
                       showMessage = true;
                       comment('<font size=small><b>Address is required prior to Issuance');
                       cancel = true;
        }
if ((wfTask == 'Concern Intake' && wfStatus == 'Assigned') && (!parcelExistsOnCap())) {             // Check if address exists
                       showMessage = true;
                       comment('<font size=small><b>Parcel is required prior to Issuance');
                       cancel = true;
        }
if ((wfTask == 'Concern Intake' && wfStatus == 'Assigned') && (!ownerExistsOnCap())) {            // Check if address exists
                       showMessage = true;
                       comment('<font size=small><b>Owner is required prior to Issuance');
                       cancel = true;
            }