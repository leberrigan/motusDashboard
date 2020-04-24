
var pageContent = {
								"home": {
									header: "Main", 
									obj: "",
									icon: "",
									elements:
									{
										'receiverDeployments': {type: 'map', name: 'Receivers'},
										'tags': {type: 'plot', name: 'Tags'},
										'issues': {type: 'table', name: 'Issues', hideCols: [1,2,3,4,5,6,7,8,13,14,15,16,17,19]/*{"Category":{"errorCode":"issue-types@type"}, "Severity":{"errorCode":"issue-codes@severity"}, "Type":{"errorCode":"issue-types@subType"}, "Description":{"errorCode":"issue-codes@errorDescr"}}*/}
									}
								},
								"proj": 
								{
									header: "Project", 
									obj: "",
									icon: "SVG/Options.svg",
									elements:
									[
										"name":{type: 'input', input:"text",label:"Project Name",altText:""},
										"nameShort":{type: 'input', input:"text",label:"Project Short Name",altText:""},
										"descriptionShort":{type: 'input', input:"textarea",label:"Short Description",altText:""},
										"descriptionLong":{type: 'input', input:"textarea",label:"Long Description",altText:""},
										"primaryContact":{type: 'input', input:"select",label:"Primary Contact",altText:""},
										"feeContact":{type: 'input', input:"select", label:"Fee Contact",altText:""}
									]
								},
								"users": 
								{
									header: "Users", 
									obj: "users",
									icon: "SVG/Lock.svg",
									elements:
									[
										"addNew": {type: 'input', input:"select",label:"Add new user",altText:""},
										"proj-users": {type: 'table',label:"User Settings",altText:"",cols:["Login Name", "Full Name", "Email", "Project", "Tags", "Receivers", "Data"]}
									]
								},
								"sites": 
								{
									header: "Sites", 
									obj: "sites",
									icon: "SVG/Lock.svg",
									elements:
									[
										"addNew": {type: 'input', input:"select",label:"Add new site",altText:""},
										"recv-sites": {type: 'table',label:"User Settings",altText:"",cols:["Login Name", "Full Name", "Email", "Project", "Tags", "Receivers", "Data"]}
									]
								},
								"landowners": 
								{
									header: "Landowners", 
									obj: "landowners",
									icon: "SVG/Lock.svg",
									elements:
									[
										"addNew": {type: 'input', input:"select",label:"Add new landowner",altText:""},
										"proj-landowners": {type: 'table',label:"User Settings",altText:"",cols:["Login Name", "Full Name", "Email", "Project", "Tags", "Receivers", "Data"]}
									]
								},
								"issues": 
								{
									header: "Data Issue", 
									obj: "issues",
									icon: "SVG/Issue.svg",
									elements:
									[
										"issues": {type: 'table', input:"table",label:"",altText:"", cols: ["Category", "Severity", "Type", "Count", "Ignored"]}
									]
								},
								"Receivers": 
								{
									header: "Receivers", 
									obj: "receivers",
									icon: "SVG/Station.svg",
									elements:
									[
								//		{type: 'input', input:"submit", id:"addReceiver", label:"Add tag", altText:""},
								//		{type: 'input', input:"select", id:"newDeployment", label:"New deployment", altText:""},
										"tables": {type: 'tabs', tabs: 
											[
												"devices": {
													name: "Devices",
													elements: [
														"new": {
															type: "input",
															input: "button",
															label: "Add receiver",
															link:""
														},
														"recvs": {
															type: "table",
															cols: ["Motus ID", "Receiver Serial No.", "Receiver Type"/*, "Last Data Processed", "Number of Deployments", "Last Deployment Name", "Currently Deployed"*/],
															colIDs: ["motusID", "serialNo", "model"/*, "Last Data Processed", "Number of Deployments", "Last Deployment Name", "Currently Deployed"*/]
														}														
													]
												}, 
												"deps": {	
													name: "Deployments",
													elements: [
														{
															type: "input",
															input: "button",
															id: "new",
															label: "New deployment",
															link:""
														},
														{
															type: "table",
															id: "recv-deps",
															cols: ["Deployment ID", "Motus ID", "Receiver Serial No.", "Receiver Type", "Deployment Status", "Deployment Name", "Deployment Site", "Deployment Start Date", "Deployment End Date"/*, "Last Data Processed"*/, "Mobile Receiver", "Latitude", "Longitude"],
															colIDs: ["Deployment ID", "motusID", "serialNo", "Model", "status", "name", "site", "depStart", "depEnd"/*, "Last Data Processed"*/, "mobile", "lat", "lon"]
														}
													]
												}
											]
										}
									]
								},
								"tags": 
								{
									header: "Tags", 
									obj: "tags",
									icon: "SVG/Tag2.svg",
									elements:
									[
							//			{type: 'input', input:"submit", id:"addTags", label:"Add tag", altText:""},
							//			{type: 'input', input:"select", id:"newDeployment", label:"New deployment", altText:""},
										{type: 'tabs', id:"tables",tabs: 
											[
												{
													name: "Devices",
													id: "devices",
													elements: [
														/*{
															type: "input",
															input: "button",
															id: "new",
															label: "Add tags",
															link:""
														},*/
														{
															type: "table",
															id: "tags",
															cols: ["Motus ID", "Manufacturer ID", "Burst Interval", "Date Bin", "Tag Model", "Nominal Frequency", "Deployment Status", "Lifespan"/*, "Number of Deployments"*/],
															colIDs: ["motusID", "mfgID", "bi", "dateBin", "model", "freq", "status", "lifespan"/*, "Number of Deployments"*/]
														}														
													]
												}, 
												{	
													name: "Deployments",
													id: "deps",
													elements: [
														{
															type: "input",
															input: "button",
															id: "new",
															label: "New deployment",
															link:""
														},
														{
															type: "table",
															id: "tag-deps",
												//			cols: ["Deployment ID", "Motus ID", "Manufacturer ID", "Burst Interval", "Date Bin", "Tag Model", "Nominal Frequency", "Deployment Status", "Deployment Start Date", "Deployment End Date",  "Lifespan", "Species ID", "Deployment Latitude", "Deployment Longitude", "Marker Number"],
															cols: ["Motus ID", "Manufacturer ID", "Burst Interval", "Date Bin", "Tag Model", "Nominal Frequency", "Deployment Status", "Lifespan"/*, "Number of Deployments"*/],
															colIDs: ["motusID", "mfgID", "bi", "dateBin", "model", "freq", "status", "lifespan"/*, "Number of Deployments"*/]
														}
													]
												}
											]
										}
									]
								},
								"upload": 
								{
									header: "Upload", 
									obj: "upload",
									icon: "SVG/Upload.svg",
									elements:
									[
										{type: 'input', input:"upload",id:"upload",label:"Select file",altText:""}
									]
								},
								"download": 
								{
									header: "Download Data", 
									obj: "download",
									icon: "SVG/Download.svg",
									elements:
									[
										{type: 'input', input:"button",id:"download",label:"Download file",altText:""},
										{type: 'input', input:"button",id:"download",label:"Download file",altText:""},
										{type: 'input', input:"button",id:"download",label:"Download file",altText:""},
										{type: 'input', input:"button",id:"download",label:"Download file",altText:""}
									]
								}
							};