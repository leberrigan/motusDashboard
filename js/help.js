var helpText = {};

function exploreHelp(topic, i) {
  helpText = {
      explore: [
        {el: "#explore_menu", text: "Navigate by selecting one of these broad categories."},
        {el: "#explore_controls", text: "Control the data you see using these options."},
        {el: `#explore_controls .explore-map-${dataType}-filters`, text : "Filter the data"},
        {el: `#explore_controls .explore-map-${dataType}-timeline`, text : "Change the time range"},
        {el: `#explore_controls .explore-map-${dataType}-search`, text : `Search for a${dataType=='animals'?'n':''} ${dataType}`},
        {el: `#explore_controls .explore-map-${dataType}-pdf`, text : `Save the current view as a PDF report`},
        {el: `#explore_controls .explore-map-${dataType}-share`, text : `Share the current view`},
        {el: `#explore_controls .explore-map-${dataType}-help`, text : `Help`}
      ],
      stations: [
        {el: `#${motusMap.el}`, text : `A map of all the stations.`},
        {el: `#explore_controls .explore-map-${dataType}-edit`, text : `View the station planner`}
      ],
      animals: {},
      projects: {},
      regions:  {},
      species:  {}
    };
    
  if (!topic) {topic = dataType;}

  if (!i) {i = 0;}

  if ($('#explore_help').length == 0) {

    $('body').append('<div id="explore_help"></div>');

  }

  $('#explore_help').text();

  $('#explore_help').show(250);

}
