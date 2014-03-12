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
        attribute: 'fill'
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
function load_grouping(groups) {
  $(".infobox").empty()
  $(".infobox").html('<div class="panel-group" id="accordion"></div>');
  _.each(groups, function(group) {
    render_group_panel($(".panel-group"), group);
  });
  $(".infobox").collapse();
}
function render_group_panel(emt, group) {
  emt.append(
  '<div class="panel-heading">' +
    '<h1>' +
      '<a data-toggle="collapse" data-parent="#accordion" href="#'+group.code+'">' +
        group.name +
      '</a>' +
    '</h1>' +
  '</div>' +
  '<div id="'+group.code+'" class="panel-collapse collapse">' +
     '<div class="panel-body">' +
      '<h5>Overview</h5>' +
      '<ul>' +
        '<li><h4>Established:</h4> </br><a href="'+group.uri+'">'+group.established+'</a></li>' +
        '<li><h4>Members:</h4> </br>'+group.num_countries+'</li>' +
        '<li><h4>Headquarters:</h4> </br><a href="/">???</a></li>' +
      '</ul>' +
      group.definition +
      '</br>' +
      '<h5>Read More</h5>' +
      '<ul>' +
        '<li><a href="'+group.url+'">Official Site</a></li>' +
        '<li><a href="'+group.wiki_uri+'">Wikipedia</a></li>' +
      '</ul>' +
     '</div>' +
  '</div>');
}
function load_checkboxes() {
  $(".groupings input[type=checkbox]").bootstrapSwitch('size', 'small');
  $(".groupings input").on('switchChange', function (e, data) {
    countries.clearIndicators();
    reload_map(year);
    _.each($(".groupings input:checked"), function(emt) {
      countries.addIndicator($(emt).val());
      return;
    });
    reload_map(year);
  });
}
function load_slider(year) {
  key_dates = [1945,1949,1951,1957,1958,1960,1989,1992,1995,2002,2004];
  $( "#slider" ).labeledslider({
      tickInterval: 10,
/*
      tickArray: key_dates,
        tickLabels: {
          1960: 'EFTA'
      },
*/
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
        reload_map(ui.value);
      }
   });
  load_map('2013_mill_en');
  $(".year").text(year);
}
function reload_map(year) {
  window.map.series.regions[0].clear();
  result = countries.getYear(year);
  //window.map.series.regions[0].setScale(result.scale);
  window.map.series.regions[0].setValues(result);
}
function load_megamenu() {
  $(".toggled").hide();
  $("a.toggler").click(function(e) {
    e.preventDefault();
    if ($(".toggled").hasClass('toggled-out')) {
      $(".toggled").slideUp();
      $(".toggled").removeClass('toggled-out');
      $(".toggler .the-caret").html("&#9660;");
    } else {
      $(".toggled").slideDown();
      $(".toggled").addClass('toggled-out');
      $(".toggler .the-caret").html("&#9650;");
    }

  });
}
COLOR_MAP = {};
DEFAULT = "#FFFFFF";
function load_color_map() {
  $(".groupings input[type=checkbox]").each(function(emt) {
    COLOR_MAP[$(this).val()] = $(this).data('color');
  });
}
var Country = Backbone.Model.extend({});;
var CountryList = Backbone.Collection.extend({
  model: Country,
  initialize: function() {
    this.clearIndicators();
  },
  addIndicator: function(ind) {
    this.indicators.push(ind);
  },
  clearIndicators: function() {
    this.indicators = [];
  },
  getYear: function(year) {
    var o = {};
    countryMap = {};
    var _self = this;
    this.each(function(c) {
      countryMap[c.get('gis')] = _.map(_self.indicators,function(ind) {
        if (c.get(ind+'_at') == undefined)
          return "#FFFFFF";
        if (c.get(ind+'_at').toString().indexOf('-') > 0) {
          yearRange = c.get(ind+'_at').split('-');
          if ((parseInt(yearRange[0]) <= year && parseInt(yearRange[1]) >= year) && c.get(ind+'_at') != 0) {
            return COLOR_MAP[ind];
          }
        } else {
          if (c.get(ind+'_at') <= year && c.get(ind+'_at') != 0) {
            return COLOR_MAP[ind];
          }
        }
        return "#FFFFFF";
      });
    });
    _.each(countryMap,function(colors,gis) {
      if(colors.length == 0) {
        countryMap[gis] = "#FFFFFF";
      } else if(colors.length == 1) {
        countryMap[gis] = colors[0];
      } else if(colors.length == 2) {
        countryMap[gis] = Color_mixer.mix($.Color(colors[0]),$.Color(colors[1])).toHexString();
      } else {
        mix1 = Color_mixer.mix($.Color(colors[0]),$.Color(colors[1])).toHexString();
        countryMap[gis] = Color_mixer.mix($.Color(mix1),$.Color(colors[2])).toHexString();
      }
    });
    return countryMap;
  }
});
