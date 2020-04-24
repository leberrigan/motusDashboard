
var pageContent = {
								"home": {
									header: "Main", 
									obj: "",
									icon: "",
									elements:
									[
										{type: 'map', name: 'Receivers', id: 'receiverDeployments'},
										{type: 'plot', name: 'Tags', id: 'tags'},
										{type: 'table', name: 'Issues', id: 'issues', cols: ["Category", "Severity", "Type", "Count", "Ignored"]}
									]
								},
								"proj": 
								{
									header: "Project", 
									obj: "",
									icon: "SVG/Options.svg",
									elements:
									[
										{type: 'input', input:"text",id:"name",label:"Project Name",altText:""},
										{type: 'input', input:"text",id:"nameShort",label:"Project Short Name",altText:""},
										{type: 'input', input:"textarea",id:"descriptionShort",label:"Short Description",altText:""},
										{type: 'input', input:"textarea",id:"descriptionLong",label:"Long Description",altText:""},
										{type: 'input', input:"select",id:"primaryContact",label:"Primary Contact",altText:""},
										{type: 'input', input:"select",id:"feeContact", label:"Fee Contact",altText:""}
									]
								},
								"users": 
								{
									header: "Users", 
									obj: "users",
									icon: "SVG/Lock.svg",
									elements:
									[
										{type: 'input', input:"select",id:"addNew",label:"Add new user",altText:""},
										{type: 'table', id:"proj-users",label:"User Settings",altText:"",cols:["Login Name", "Full Name", "Email", "Project", "Tags", "Receivers", "Data"]}
									]
								},
								"sites": 
								{
									header: "Sites", 
									obj: "sites",
									icon: "SVG/Lock.svg",
									elements:
									[
										{type: 'input', input:"select",id:"addNew",label:"Add new site",altText:""},
										{type: 'table', id:"recv-sites",label:"User Settings",altText:"",cols:["Login Name", "Full Name", "Email", "Project", "Tags", "Receivers", "Data"]}
									]
								},
								"landowners": 
								{
									header: "Landowners", 
									obj: "landowners",
									icon: "SVG/Lock.svg",
									elements:
									[
										{type: 'input', input:"select",id:"addNew",label:"Add new landowner",altText:""},
										{type: 'table', id:"proj-landowners",label:"User Settings",altText:"",cols:["Login Name", "Full Name", "Email", "Project", "Tags", "Receivers", "Data"]}
									]
								},
								"issues": 
								{
									header: "Data Issue", 
									obj: "issues",
									icon: "SVG/Issue.svg",
									elements:
									[
										{type: 'table', input:"table",id:"issues",label:"",altText:"", cols: ["Category", "Severity", "Type", "Count", "Ignored"]}
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
										{type: 'tabs', id:"tables", tabs: 
											[
												{
													name: "Devices",
													id: "devices",
													elements: [
														{
															type: "input",
															input: "button",
															id: "new",
															label: "Add receiver",
															link:""
														},
														{
															type: "table",
															id: "recvs",
															cols: ["Motus ID", "Receiver Serial No.", "Receiver Type"/*, "Last Data Processed", "Number of Deployments", "Last Deployment Name", "Currently Deployed"*/],
															colIDs: ["motusID", "serialNo", "model"/*, "Last Data Processed", "Number of Deployments", "Last Deployment Name", "Currently Deployed"*/]
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