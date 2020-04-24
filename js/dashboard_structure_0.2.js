
var pageContent = {
								"home": {
									header: "Main", 
									obj: "",
									icon: "",
									elements:
									{/*
										'indicators': {
											type: ''
										}				*/							
										'recv-deps-map': {
											type: 'map', 
											name: 'Receivers', 
											shapes: {
													col: "status",
													values: [0, 1, 2],
													names: ['Pending', 'Terminated', 'Active'],
													color: [false, false, true],
													shape: [
														"https://cdn.mapmarker.io/api/v1/pin?size=50&background=%23%s&icon=fa-exclamation&color=%23FFFFFF&voffset=0&hoffset=1&",
														"https://cdn.mapmarker.io/api/v1/fa?size=50&icon=fa-times&color=%23000000&",
														"https://cdn.mapmarker.io/api/v1/pin?size=50&background=%23%s&icon=fa-check&color=%23FFFFFF&voffset=0&hoffset=1&"
													],
													zIndex: [101, 99, 100]
											},
											colors: {
												col: "tsDiff",
												values: ["NA", 0, 1, 30, 90, 180, 365],
												names: ['No data', '<1', '>1', '>30', '>90', '>180', '>365'],
												color: ['000000', '68CCCA', 'A4DD00', 'DBDF00', 'FCDC00', 'FE9200', 'F44E3B'],
												shape: [
													"https://cdn.mapmarker.io/api/v1/pin?size=50&background=%23%s&icon=fa-question&color=%23FFFFFF&voffset=0&hoffset=0&",
													0, 0, 0, 0, 0, 0
												]
											},
											legendLabel: 'Number of days since last data received'
										},
										'tags': {type: 'plot', name: 'Tags'},
										'issues-tbl': {
											type: 'table', name: 'Issues', hideCols: [1,2,3,4,5,6,7,8,13,14,15,16,17,19]
										/*{"Category":{"errorCode":"issue-types@type"}, "Severity":{"errorCode":"issue-codes@severity"}, "Type":{"errorCode":"issue-types@subType"}, "Description":{"errorCode":"issue-codes@errorDescr"}}*/
										}
									}
								},
								"proj": 
								{
									header: "Project", 
									obj: "",
									icon: "SVG/Options.svg",
									elements:
									{
										"name":{type: 'input', input:"text",label:"Project Name",altText:""},
										"nameShort":{type: 'input', input:"text",label:"Project Short Name",altText:""},
										"descriptionShort":{type: 'input', input:"textarea",label:"Short Description",altText:""},
										"descriptionLong":{type: 'input', input:"textarea",label:"Long Description",altText:""},
										"primaryContact":{type: 'input', input:"select",label:"Primary Contact",altText:""},
										"feeContact":{type: 'input', input:"select", label:"Fee Contact",altText:""}
									}
								},
								"users": 
								{
									header: "Users", 
									obj: "users",
									icon: "SVG/Lock2.svg",
									elements:
									{
										"addNew": {type: 'input', input:"select",label:"Add new user",altText:""},
										"proj-users-tbl": {type: 'table',label:"User Settings",altText:"",cols:["Login Name", "Full Name", "Email", "Project", "Tags", "Receivers", "Data"]}
									}
								},
								"sites-landowners": {
									header: "Sites and Landowners", 
									obj: "sitesLandowners",
									icon: "SVG/Marker.svg",
									elements: {
										'recv-sites-map': {
											type: 'map', 
											name: 'Receiver Sites', 
											height:"25vh",
											shapes: {
													col: "status",
													values: [0, 1, 2],
													color: [true, true, true],
													names: ['Pending', 'Terminated', 'Active'],
													shape: [
														"https://cdn.mapmarker.io/api/v1/pin?size=50&background=%23%s&icon=fa-exclamation&color=%23FFFFFF&voffset=0&hoffset=1&",
														"https://cdn.mapmarker.io/api/v1/fa?size=50&icon=fa-times&color=%23000000&",
														"https://cdn.mapmarker.io/api/v1/pin?size=50&background=%23%s&icon=fa-check&color=%23FFFFFF&voffset=0&hoffset=1&"
													],
													zIndex: [101, 99, 100]
											},
											colors: {
												col: "status",
												values: [0, 1, 2],
												names: ['Pending', 'Terminated', 'Active'],
												color: ['F44E3B', '000000', 'A4DD00'],
												shape: [0, 0, 0]
											},
											legendLabel: 'Station status'
										},
										"tables": {
											type: 'tabs', tabs: {
												"sites": {
													name: "Sites",
													elements: {
														"addNew": {type: 'input', input:"select",label:"Add new site",altText:""},
														"recv-sites-tbl": {
															type: 'table',
															label:"User Settings",
															altText:"",
															cols:["Login Name", "Full Name", "Email", "Project", "Tags", "Receivers", "Data"]
														}
													}
												},
												"landowners": {
													name: "Landowners",
													elements: {
														"addNew": {type: 'input', input:"select",label:"Add new landowner",altText:""},
														"proj-landowners-tbl": {type: 'table',label:"User Settings",altText:"",cols:["Login Name", "Full Name", "Email", "Project", "Tags", "Receivers", "Data"]}
													}
												}
											}
										}
									}
								},/*
								"landowners": 
								{
									header: "Landowners", 
									obj: "landowners",
									icon: "SVG/Landowners.svg",
									elements:
									{
										"addNew": {type: 'input', input:"select",label:"Add new landowner",altText:""},
										"proj-landowners-tbl": {type: 'table',label:"User Settings",altText:"",cols:["Login Name", "Full Name", "Email", "Project", "Tags", "Receivers", "Data"]}
									}
								},*/
								"issues": 
								{
									header: "Data Issue", 
									obj: "issues",
									icon: "SVG/Issue.svg",
									elements:
									{
										"issues-tbl": {type: 'table', input:"table",label:"",altText:"", hideCols: [1,2,3,4,5,6,7,8,13,14,15,16,17,19]}
									}
								},
								"receivers": 
								{
									header: "Receivers", 
									obj: "receivers",
									icon: "SVG/Station.svg",
									elements:
									{
								//		{type: 'input', input:"submit", id:"addReceiver", label:"Add tag", altText:""},
										"recv-deps-map": {type: "map"},
								//		{type: 'input', input:"select", id:"newDeployment", label:"New deployment", altText:""},
										"tables": {type: 'tabs', tabs: 
											{
												"devices": {
													name: "Devices",
													elements: {
														"new": {
															type: "input",
															input: "button",
															label: "Add receiver",
															link:""
														},
														"recvs-tbl": {
															type: "table",
															cols: ["Motus ID", "Receiver Serial No.", "Receiver Type"/*, "Last Data Processed", "Number of Deployments", "Last Deployment Name", "Currently Deployed"*/],
															colIDs: ["motusID", "serialNo", "model"/*, "Last Data Processed", "Number of Deployments", "Last Deployment Name", "Currently Deployed"*/]
														}														
													}
												}, 
												"deps": {	
													name: "Deployments",
													elements:{
														"new": {
															type: "input",
															input: "button",
															label: "New deployment",
															link:""
														},
														"recv-deps-tbl": {
															type: "table",
															cols: ["Deployment ID", "Motus ID", "Receiver Serial No.", "Receiver Type", "Deployment Status", "Deployment Name", "Deployment Site", "Deployment Start Date", "Deployment End Date"/*, "Last Data Processed"*/, "Mobile Receiver", "Latitude", "Longitude"],
															colIDs: ["Deployment ID", "motusID", "serialNo", "Model", "status", "name", "site", "depStart", "depEnd"/*, "Last Data Processed"*/, "mobile", "lat", "lon"]
														}
													}
												}
											}
										}
									}
								},
								"tags": 
								{
									header: "Tags", 
									obj: "tags",
									icon: "SVG/Tag2.svg",
									elements:
									{
							//			{type: 'input', input:"submit", id:"addTags", label:"Add tag", altText:""},
							//			{type: 'input', input:"select", id:"newDeployment", label:"New deployment", altText:""},
										"tables": {
											type: 'tabs',
											tabs: {
												"devices": {
													name: "Devices",
													elements: {
														"tags-tbl": {
															type: "table",
															cols: ["Motus ID", "Manufacturer ID", "Burst Interval", "Date Bin", "Tag Model", "Nominal Frequency", "Deployment Status", "Lifespan"],
															colIDs: ["motusID", "mfgID", "bi", "dateBin", "model", "freq", "status", "lifespan"]
														}														
													}
												}, 
												"deps": {	
													name: "Deployments",
													elements: {
														"new": {
															type: "input",
															input: "button",
															label: "New deployment",
															link:""
														},
														"tag-deps-tbl": {
															type: "table",
												//			cols: ["Deployment ID", "Motus ID", "Manufacturer ID", "Burst Interval", "Date Bin", "Tag Model", "Nominal Frequency", "Deployment Status", "Deployment Start Date", "Deployment End Date",  "Lifespan", "Species ID", "Deployment Latitude", "Deployment Longitude", "Marker Number"],
															cols: ["Motus ID", "Manufacturer ID", "Burst Interval", "Date Bin", "Tag Model", "Nominal Frequency", "Deployment Status", "Lifespan"/*, "Number of Deployments"*/],
															colIDs: ["motusID", "mfgID", "bi", "dateBin", "model", "freq", "status", "lifespan"/*, "Number of Deployments"*/]
														}
													}
												}
											}
										}
									}
								},
								"upload": 
								{
									header: "Upload", 
									obj: "upload",
									icon: "SVG/Upload.svg",
									elements:
									{
										"upload": {type: 'input', input:"upload",label:"Select file",altText:""}
									}
								}/*,
								"download": 
								{
									header: "Download Data", 
									obj: "download",
									icon: "SVG/Download.svg",
									elements:
									{
										"download": {type: 'input', input:"button",label:"Download file",altText:""}
									}
								}*/
							};