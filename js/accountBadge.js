var accountInfo = {fullName: "Lucas Berrigan"};

function loadAccountBadge() {
	$("body").append("<div id='accountBadge'></div>");
	
	$("#accountBadge").html(
			"<div class='name'>" + accountInfo.fullName + "</div>" +
			"<div class='status'>Logged In</div>" +
			"<ul class='hidden'>" +
			"<li>Profile</li>" +
			"<li>Switch Account</li>" +
			"<li>View Profile</li>" +
			"<li>Policy</li>" +
			"<li>Help</li>" +
			"</ul>" + 
			"<div class='arrow'></div>"
		);
		$("#accountBadge").click(function(){$(this).toggleClass("expand");});
}