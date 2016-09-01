
$( document ).ready(function() {
	$('.form-control').keypress(function (e) {
		if (e.which == 13) {
			registerAgent();
			e.preventDefault();
		}
	});

	loadAgents();
});

function loadAgents() {
	$.ajax({
		method: "GET",
		url: "/api/agents",
		success: function(data) {
			var html = "";
			for (var key in data) {
				if (data.hasOwnProperty(key)) {
					html += '<div class="row token-list-row"><h3>' + data[key].organization + '</h3><p>' + data[key].ipRange + '</p><p>' + key + '</p><button class="btn btn-primary" onclick="removeToken(' + key + ')">Remove</button></div>';
				}
			}

			$("#token-list-container").html(html);
		},
		error: function(xhr, status, err) {
			console.error("Some error occured");
		}
	});
}

function removeToken(token) {
	$.ajax({
		method: "DELETE",
		url: "/api/agents/"+token,
		success: function() {
			loadAgents();
		},
		error: function(xhr, status, err) {
			console.error("Some error occured");
		}
	});
}

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
			loadAgents();
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