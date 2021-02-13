//scheduleMeeting(capId,"PLANNING COMMISSION HEARING",'01/01/2017','02/01/2017');
function scheduleMeeting(capID, meetingType,dtFrom,dtTo)
{
	try
	{
		var hearingBody = null;
		var duration = 60;
		var calendarName = null;
		var dateFrom = aa.date.parseDate(dtFrom); 
		var dateTo = aa.date.parseDate(dtTo);
		var dayOfWeek = null;// 0~6
		var location = null;
		var comments = null;
		var reason = null;
		var result = aa.calendar.getAvailableHearingItem(hearingBody, duration,
		calendarName, dateFrom, dateTo, dayOfWeek, location)
		if(result.getSuccess())
		{
		  var hearingItems = result.getOutput();
		  //aa.print("Items length:" + hearingItems.length);
		  for(var i =0 ; i < hearingItems.length; i++)
		  {
			var hearingItem = hearingItems[i];

			//aa.print("capID:" + capID.getCustomID() + "****\n");
			if(hearingItem.getMeetingType().toUpperCase().equals(meetingType)){
				addAgenda(capID, hearingItem.getMeetingGroupIdString(),hearingItem.getMeetingIdString(),duration,null,"Added via script");
			}
		  }
		}
		else
		{
		  logDebug("Get available hearing failed");
		}
	}catch(err){
		logDebug("Method name: scheduleMeeting. Message: Error-" + err.message + ". CapID:" + capID);
		return false;
	}	
}
