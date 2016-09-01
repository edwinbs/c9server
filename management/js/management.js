
$( document ).ready(function() {
	$('.form-control').keypress(function (e) {
		if (e.which == 13) {
			registerAgent();
			e.preventDefault();
		}
	});
});

function registerAgent() {
	var ipRange = $("#ip-range").val();
	var organization = $("#organization").val();

	if (!ipRange || !organization) {
		if (!ipRange) { $("#ip-range").addClass('error'); }
		if (!organization) { $("#organization").addClass('error'); }
		return;
	}

	$.ajax({
		method: "POST",
		url: "/api/agents",
		contentType: "application/json; charset=utf-8",
		data : JSON.stringify({
			ipRange: ipRange,
			organization: organization
		}),
		success: function(data) {
			showToken(data.token);
		},
		error: function(xhr, status, err) {
			alert("Some error occured");
		}
	});
}

function showToken(token) {
	$("#agent-token").text(token);
	$("#token-container").show();
}