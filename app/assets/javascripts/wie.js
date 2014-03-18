var map;
var current_map = '';
function setMapScale() {
  scale = getScale();
  map.setScale(scale[0], scale[1], scale[2]);
  reload(window.year);
}
function getScale() { 
  return [map.width/1000, map.width, map.height - 350];
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
    backgroundColor: '#7f8c8d',
    zoomOnScroll: false,
    series: {
      regions: [{
        attribute: 'fill'
      }]
    },
    markerStyle: {
      initial: {
        fill: '#f39c12',
        stroke: '#e67e22'
      }
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


  window.map.setFocusLatLng = function(scale, lat, lng){
      var point,
          proj = jvm.WorldMap.maps[current_map].projection,
          centralMeridian = proj.centralMeridian,
          width = this.width - this.baseTransX * 2 * this.baseScale,
          height = this.height - this.baseTransY * 2 * this.baseScale,
          inset,
          bbox,
          scaleFactor = this.scale / this.baseScale,
          centerX,
          centerY;

      if (lng < (-180 + centralMeridian)) {
          lng += 360;
      }

      point = jvm.Proj[proj.type](lat, lng, centralMeridian);
      inset = this.getInsetForPoint(point.x, point.y);
      bbox = inset.bbox;
      y_offset = 300;
      x_offset = 100;
      x_coord = ((point.x / 10000) + width/2);
      y_coord = ((point.y / 10000) + height) * scale;
      if (x_coord > 200)
        x_coord += x_offset;
      if (y_coord < 100)
        y_coord += y_offset;
      return [x_coord, y_coord];
  }
  scale = getScale();
  var xy = map.setFocusLatLng(scale[0], ob.capital_x, ob.capital_y);


  emt = $('<div class="tips" >' + 
  '<a href="#" class="close"><span class="glyphicon glyphicon-remove"></span></a>' +
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
//    'left':    ($(ev.currentTarget).offset().left - 100)+ 'px',
//    'top':     '10px'
    left: xy[0]+ 'px',
    top: xy[1]+ 'px'

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
        '<a class="fill_color" href="#" data-code="'+group.code+'" data-color="'+group.color+'">'+
          '<span class="glyphicon glyphicon-eye-close" ></span>' +
        '</a>' +
    '</h1>' +
  '</div>' +
  '<div id="'+group.code+'" class="panel-collapse collapse">' +
     '<div class="panel-body">' +
      '<div class="row">'+group.definition+'</div>'+
      '</br>' +
      '<div class="row"><div class="slug col-md-1"></div>' +
      '<ul class="col-md-7">' +
        '<li><h4>Established:</h4> <a href="'+group.uri+'">'+group.established+'</a></li>' +
        '<li><h4>Members:</h4> '+group.num_countries+'</li>' +
        '<li><h4>HQ:</h4> <a href="'+group.uri+'">'+group.headquarters+'</a></li>' +
      '</ul></div>' +
      '<div class="row">'+'<h5>Read More + </h5>'+
        '<a href="'+group.url+'"> Official Site </a>' + 
        '<h5>/ </h5>' +
        '<a href="'+group.wiki_uri+'">Wikipedia </a>' +
      '</div>'+
    '</div>' +
  '</div>');
}
function load_checkboxes() {
  $(".infobox").on({
    mouseenter: function (e) {
      $(e.currentTarget).css('color',$(e.currentTarget).data('color'));
    },
    mouseleave: function(e) {
      $(e.currentTarget).removeAttr('style');
    }
  }, '.fill_color');

  $(".infobox").on('click','a.fill_color', function (e, data) {
    e.preventDefault();
    if($(e.currentTarget).hasClass('enabled')) {
      $(e.currentTarget).removeClass('enabled');
      $($($(e.currentTarget)).find('span')).removeAttr('style');
    } else {
      $(e.currentTarget).addClass('enabled');
      $($($(e.currentTarget)).find('span')).css('color',$(e.currentTarget).data('color'));
    }
    countries.clearIndicators();
    _.each($(".infobox a.fill_color"), function(emt) {
      if($(emt).hasClass('enabled')) {
        countries.addIndicator($(emt).data('code'));
        $(emt).find('.glyphicon').removeClass('glyphicon-eye-close');
        $(emt).find('.glyphicon').addClass('glyphicon-eye-open');
      } else {
        $(emt).find('.glyphicon').addClass('glyphicon-eye-close');
        $(emt).find('.glyphicon').removeClass('glyphicon-eye-open');
      }
    });
    reload_map(year);
  });
}
MIN = 1945;
MAX = 2015;
function load_slider(year) {
  $( "#slider" ).labeledslider({
      tickArray: [1945, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2014],
      orientation: 'horizontal',
      min: MIN,
      max: MAX,
      step: 1,
      animate: 'fast',
      value: year,
      slide: function( event, ui ) {
        window.year = ui.value;
        if(window.year < 1960) {
          load_map('1945_mill_en');
        }
        if(window.year >= 1994 && window.year < 2001) {
          load_map('1994_mill_en');
        }
        if (window.year >= 2001) {
          load_map('2013_mill_en');
        }
        reload(window.year);
      }
   });
  load_map('2013_mill_en');
  $(".year").text(year);
}
function reload(year) {
  $(".year").text(year);
  reload_map(year);
  reload_slider(year);
}
function reload_map(year) {
  window.map.series.regions[0].clear();
  result = countries.getYear(year);
  window.map.series.regions[0].setValues(result);
}
function load_megamenu() {
  $(".menuwrap input").bootstrapSwitch();
  $(".menuwrap input").on('switchChange', function (e, data) {
    if ( $(this).val() == "show_countries") {
      toggle_country_labels($(this).is(':checked'));
    }
    if ( $(this).val() == "show_capitals") {
      toggle_capital_markers($(this).is(':checked'));
    }
  });
}
function toggle_country_labels(enabled) {
  if(enabled) {
   regions=map.regions;
    for ( region in regions ){ // only interested in a subset of countries
    var element = regions[region].element.node;
    bbox = element.getBBox();

    point_ori = [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
    point = map.pointToLatLng(point_ori[0],point_ori[1]); // convert it to lat lon

    var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    var b = bbox;

    text.setAttribute("x", point_ori[0]);
    text.setAttribute("y", point_ori[1]);
    text.setAttribute("country_label", "true");
    text.textContent = map.getRegionName(region);
    text.setAttribute("font-size", "12");

    if (element.parentNode) {
      element.parentNode.appendChild(text);
    }
    };
  } else {
    $("svg text[country_label=true]").remove();
  }
}

function toggle_capital_markers(enabled) {
  if(enabled) {
    countries.each(function(c) {
      map.addMarker(c.get('gis'),{
        latLng: [c.get('capital_x'), c.get('capital_y')],
        name: c.get('capital')
      });
    });
  } else {
    map.removeAllMarkers();
  }
}
function load_key_dates() {
  steps = MAX-MIN;

  _.each(key_dates, function(date) {
    years = Math.abs(MIN-date.year)
    var left = (Math.round(((1/steps) * years)*10000)/100) + '%';
    note = $('<div>').addClass('key_date')
            .css('left', left)
            .html('<p><strong>'+date.year+'</strong>' + date.description + '</p>');
    $(note).attr('data-year',date.year);

    notch = $('<div>').addClass('notch')
            .css('left', left);
    $(notch).click(function(e) {
      $("#slider").labeledslider( "value", date.year);
      reload(date.year);
    });
    $(".ui-slider-wrapper").append(note);
    $(".ui-slider-wrapper").append(notch);
  });
}
function reload_slider(year) {
  $(".key_date").slideUp();
  $(".key_date[data-year="+year+"]").slideDown();

}
COLOR_MAP = {};
DEFAULT_COLOR = "#FFFFFF";
function load_color_map() {
  _.each(grouping,function(g) {
    COLOR_MAP[g.code] = g.color
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
        if (c.get(ind) == "1") {
          return COLOR_MAP[ind];
        }
        if (c.get(ind+'_at') == undefined)
          return null;
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
        return null;
      });
    });
    _.each(countryMap,function(colors,gis) {
      countryMap[gis] = _.compact(colors);
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
