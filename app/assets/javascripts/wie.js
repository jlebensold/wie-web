var map;
var current_map = '';
function setMapScale() {
  // TODO: refine this so it always looks awesome
  map.setScale(map.width/1000, map.width, map.height -350);
}
function load_map(name) {
  if (name == window.current_map)
    return; // noop
  window.current_map = name;
  $('#world-map-gdp .wrap').remove();
  $('#world-map-gdp').html('<div class="wrap"></div>');
  window.map = new jvm.WorldMap({
    container: $('#world-map-gdp .wrap'),
    map: name,
    zoomOnScroll: false,
    series: {
      regions: [{
        values: {},
        scale: ['#C8EEFF', '#E7A329'],
        normalizeFunction: 'polynomial'
      }]
    },
    onLabelShow: function(e, el, code){
      el.html(el.html()+' (GDP - '+gdpData[code]+')');
    },
    onRegionClick: function(e, gis) {
      showCountry(e,countries.find(function(d){return d.get('gis') == gis }));
    }
  });
  setMapScale();

}
function showCountry(ev, country) {
  $(".tips").remove();
  ob = country.toJSON();
  emt = $('<div class="tips">' + '<a href="#" class="close"><span class="glyphicon glyphicon-remove"></span></a>' +
  '<h3>' + ob.name + '</h3>' +
  '<h4>Capital: </h4>' + '<p>' + ob.capital + '</p>' +
  '<h4>Population: </h4>' + '<p>' + ob.population + '</p>' +
  '<h4>Landmass (km2): </h4>' + '<p>' + ob.landmass + '</p>' +
  '<h4>Currency: </h4>' + '<p>' + ob.currency + '</p>' +
  '</div>');
  $($(emt).find('.close')).click(function(e) {
    e.preventDefault();
    $(".tips").remove();
  });
  $(emt).css({
    'z-index': 1000,
    'padding': "10px",
    'left':    ($(ev.currentTarget).offset().left - 100)+ 'px',
    'top':     '10px'
  });
  $("#world-map-gdp").append(emt);
}
function load_slider(year) {
  key_dates = [1945,1949,1951,1957,1958,1960,1989,1992,1995,2002,2004];
  $( "#slider" ).labeledslider({
//      tickInterval: 5,
      tickArray: key_dates,
        tickLabels: {
          1960: 'EFTA'
      },
      orientation: 'horizontal',
      min: 1945,
      max: 2015,
      step: 1,
      animate: 'fast',
      value: year,
      slide: function( event, ui ) {
        $(".year").text(ui.value);
        if(ui.value < 1960) {
          load_map('1945_mill_en');
        }
        if(ui.value >= 1994 && ui.value < 2001) {
          load_map('1994_mill_en');
        }
        if (ui.value >= 2001) {
          load_map('2013_mill_en');
        }
        window.map.series.regions[0].clear();
        window.map.series.regions[0].setValues(countries.getCoe(ui.value));
      }
   });
  load_map('2013_mill_en');
  $(".year").text(year);
}
function load_megamenu() {
  $(".toggled").hide();
  $("a.toggler").click(function(e) {
    e.preventDefault();
    if ($(".toggled").hasClass('toggled-out')) {
      $(".toggled").slideUp();
      $(".toggled").removeClass('torgled-out');
      $(".toggler .the-caret").html("&#9660;");
    } else {
      $(".toggled").slideDown();
      $(".toggled").addClass('toggled-out');
      $(".toggler .the-caret").html("&#9650;");
    }

  });
}
var Country = Backbone.Model.extend({});;
var CountryList = Backbone.Collection.extend({
  model: Country,
  getCoe: function(year) {
    o = {};
    _.each(this.filter(function(c) {
      return c.get('coe_at') <= year;
    }),function(c) {
      return o[c.get('gis')] = 12;
    });
    return o;
  }
});
