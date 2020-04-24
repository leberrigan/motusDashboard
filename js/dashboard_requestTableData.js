
function requestTableData(targetTable, proj, dataset) {
	//	console.log("Opening table: data/proj" + proj + "-" + dataset.replace('-tbl', '') + ".txt   - for table: " + targetTable);
	var data,
				tableName= targetTable,
				columns,
				str,
				jqxhr = $.ajax("data/proj" + proj + "-" + dataset.replace('-tbl', '') + ".txt").done(function(){
					data = JSON.parse(jqxhr.responseText);
				//	console.log(data.columns.length);
					if (!$(targetTable + " > thead > tr > th").length) {
						$.each(data.columns, function(k, colObj) {
							str = '<th>' + colObj.name + '</th>';
							$(str).appendTo(targetTable + '> thead > tr');
						});
					//	console.log(targetTable);
						
						
						var tt = targetTable.replace("#", "").split(delimiter);
					//	console.log(tt);
					//	console.log(tt.length);
						var hideCols = tt.length > 2 ? pageContent[tt[0]].elements[tt[1]].tabs[tt[2]].elements[tt[3] + (tt[4] == undefined ? "" : "-"+tt[4])].hideCols : pageContent[tt[0]].elements[tt[1]].hideCols;
						
					//	console.log(hideCols);
						
						
						
						all_dataTables[targetTable] = $(targetTable).DataTable({
							"data": data.data,
							"columns": data.columns,
							"columnDefs": [
									{
										"targets": hideCols,
										"visible": false,
										"searchable": false
									}
							],
							"fnInitComplete": function () {
								// Event handler to be fired when rendering is complete (Turn off Loading gif for example)
								console.log('Datatable rendering complete');
							},
							pageResize: true,
							scrollX:true,
							scrollY:"50vh",
							scrollCollapse: true,
							select: true,
							"lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
							dom: 'Bfrtlip',
							buttons: [
								'excel',
								'print',
								'pdf',
								{
									extend: 'selected',
									text: 'Delete',
									key: String.fromCharCode(46),
									action: function(){alert('Delete')}
								},
								{
									extend: 'selected',
									text: 'Move',
									key: 'm',
									action: function(){alert('Switch Project')}
								},
								{
									extend: 'selected',
									text: 'Edit',
									key: 'e',
									action: function(){alert(this.text() + " poop")}
								}
							],
							"rowCallback": function (row, data, index) {
								if (data.severityDescr == 'Critical Error') {
									$(row).addClass('issue-critical-error');
								} else if (data.severityDescr == 'Error') {
									$(row).addClass('issue-error');
								}  else if (data.severityDescr == 'Warning') {
									$(row).addClass('issue-warning');
								}  else if (data.severityDescr == 'Note') {
									$(row).addClass('issue-note');
								} 
							}
						}).columns.adjust().draw();
					} else {
						console.log('Updating table');
						all_dataTables[targetTable].clear().rows.add(data.data).draw();
					}
	

					// Add some Render transformations to Columns
					// Not a good practice to add any of this in API/ Json side
					/*data.columns[0].render = function (data, type, row) {
						return '<h4>' + data + '</h4>';
					}*/
							// Debug? console.log(data.columns[0]);
					
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
