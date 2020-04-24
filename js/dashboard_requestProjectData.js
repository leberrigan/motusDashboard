
function requestProjectData(dataset, proj, select) {
	var data,
		projID = proj == undefined ? false : proj,
		columns,
		selectID = select == undefined ? false : select,
		str,
		jqxhr = $.ajax("data/" + dataset + ".txt").done(function(){
			data = JSON.parse(jqxhr.responseText);
			console.log("Data length: " + data.data.length);
			$.each(data.data, function(k, rowObj) {
				if (select) {
					$(selectID).append('<option value=' + rowObj.projectID + '>#' + rowObj.projectID + " - " + rowObj.projectName + '</option>');
				} else if (proj) {
				//	console.log(proj);
				}
			});
			
			if (select) {
				$(select).val(selectedProject).select2({placeholder:"Select Project", width:"200px"}).change(function(){
						selectedProject = $(this).val();
						window.history.pushState("test", "test", setUrlParameter(window.location.href, 'proj', selectedProject));
						loadData();
					});
			}
		})
		.fail(function (jqXHR, exception) {
						var msg = '';
						if (jqXHR.status === 0) {
							msg = 'Not connect.\n Verify Network.';
						} else if (jqXHR.status == 404) {
							msg = 'Requested page not found. [404]';
						} else if (jqXHR.status == 500) {
							msg = 'Internal Server Error [500].';
						} else if (exception === 'parsererror') {
							msg = 'Requested JSON parse failed.';
						} else if (exception === 'timeout') {
							msg = 'Time out error.';
						} else if (exception === 'abort') {
							msg = 'Ajax request aborted.';
						} else {
							msg = 'Uncaught Error.\n' + jqXHR.responseText;
						}
			console.log(msg);
		});
}
