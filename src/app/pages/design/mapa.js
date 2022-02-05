$(function () {
    'use strict'

    var map = L.map('mapa',  {
        editable: true,
        editOptions: {},
        contextmenu: true,
        contextmenuWidth: 140,
        contextmenuItems: [{
            text: 'Ver coordenadas',
            callback: showCoordinates
        }, {
            text: 'Centrar el mapa aqui',
            callback: centerMap
        }, '-', {
            text: 'Zoom mas',
            icon: 'images/zoom-in.png',
            callback: zoomIn
        }, {
            text: 'Zoom menos',
            icon: 'images/zoom-out.png',
            callback: zoomOut
        }]
    }).setView([27.85183460849563, -15.441697559122824], 20);

    map.doubleClickZoom.disable(); 

    var altadefinicion = L.tileLayer.wms("https://idecan1.grafcan.es/ServicioWMS/OrtoUrb?", {
        layers: "OrtoExpressUrb",//de la capa (ver get capabilities)
        maxZoom: 24,
        format: 'image/jpeg',
        transparent: false,
        version: '1.3.0',//wms version (ver get capabilities)
        attribution: "CANARIAS"
        }).addTo(map);

    // Capas base
    var osmBase = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: 'Derechos; <a href="http://osm.org/copyright">OpenStreetMap<\/a>',
    }).addTo(map);

    var PanelLayers = new L.FeatureGroup();
        map.addLayer(PanelLayers);      

    var baseMaps = {
        "OSM": osmBase,
        "Satelite": altadefinicion,
    };

    var overlayMaps = {
        "Paneles": PanelLayers
    };

    var layerControl= L.control.layers(baseMaps, overlayMaps,{
        position: 'topright', // 'topleft', 'bottomleft', 'bottomright'
        collapsed: true // true
    }).addTo(map);

	map.addControl( new L.Control.Search({
		url: 'https://nominatim.openstreetmap.org/search?format=json&q={s}',
		jsonpParam: 'json_callback',
		propertyName: 'display_name',
		propertyLoc: ['lat','lon'],
		marker: L.circleMarker([0,0],{radius:4}),
		autoCollapse: true,
		autoType: false,
		minLength: 2
	}) );

    function adicionargrupolayer(sourceLayer, targetGroup) {
        if (sourceLayer instanceof L.LayerGroup) {
            sourceLayer.eachLayer(function(layer) {
                adicionargrupolayer(layer, targetGroup);
            });
        } else {
            targetGroup.addLayer(sourceLayer);
        }
     }
    

    map.addControl(L.control.zoomBox({
        modal: false,
        title: "Zoom"
    }));

    L.EditControl = L.Control.extend({
        options: {
            position: 'topleft',
            callback: null,
            kind: '',
            html: ''
        },

        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar'),
            link = L.DomUtil.create('a', '', container);
            link.href = '#';
            link.title = 'Crear nuevo ' + this.options.kind;
            link.innerHTML = this.options.html;
            L.DomEvent.on(link, 'click', L.DomEvent.stop)
                      .on(link, 'click', function () {
                        window.LAYER = this.options.callback.call(map.editTools);
                      }, this);
            return container;
        },

    });

    L.NewLineControl = L.EditControl.extend({
        options: {
            position: 'topleft',
            callback: map.editTools.startPolyline,
            kind: 'linea',
            html: '\\/\\'
        }
    });

    L.NewPolygonControl = L.EditControl.extend({
        options: {
            position: 'topleft',
            callback: map.editTools.startPolygon,
            kind: 'poligono',
            html: '▰'
        }
    });

    L.NewRectangleControl = L.EditControl.extend({
        options: {
            position: 'topleft',
            callback: map.editTools.startRectangle,
            kind: 'rectanglulo',
            html: '⬛'
        }
    });

    L.NewCircleControl = L.EditControl.extend({
        options: {
            position: 'topleft',
            callback: map.editTools.startCircle,
            kind: 'circle',
            html: '⬤'
        }
    });


    map.addControl(new L.NewPolygonControl());
    map.addControl(new L.NewLineControl());
    map.addControl(new L.NewRectangleControl());
    map.addControl(new L.NewCircleControl());

    function showCoordinates (e) {
	    alert(e.latlng);
    };

    function centerMap (e) {
        map.panTo(e.latlng);
    };

    function zoomIn (e) {
        map.zoomIn();
    };

    function zoomOut (e) {
        map.zoomOut();
    };

    var clickShape = function (e) {
        if ((e.originalEvent.shiftKey || e.originalEvent.metaKey) && this.editEnabled()) {this.editor.deleteShapeAt(e.latlng)}
        if ((e.originalEvent.ctrlKey || e.originalEvent.metaKey) && this.editEnabled()) {this.editor.newHole(e.latlng);}
    };

    map.on('layeradd', function (e) {
        if (e.layer instanceof L.Path) e.layer.on('click', L.DomEvent.stop).on('click', clickShape, e.layer);
        if (e.layer instanceof L.Path) e.layer.on('dblclick', L.DomEvent.stop).on('dblclick', e.layer.toggleEdit);
    });

    map.on('editable:drawing:end editable:dragend editable:vertex:dragend', function (e) { //cuando se crea un dbibujo
        e.layer.disableEdit();
        e.layer.showMeasurements();
        PanelLayers.clearLayers();

        if (e.layer instanceof L.Polygon) {
            layoutOptions.tilt = parseFloat($('#tilt').val());
            layoutOptions.azimuth = parseFloat($('#azimut').val());
            layoutOptions.rowSpacing = parseFloat($('#esp_fila').val());
            layoutOptions.moduleSpacing = parseFloat($('#esp_cel').val());
            layoutOptions.frameSpacingSpacing = parseFloat($('#esp_mod').val());
            layoutOptions.setBack = parseFloat($('#lindero').val());   
            layoutOptions.orientation = $('#orientation').val();        
            var paneles = PanelesGrid(e.layer.toGeoJSON(), e.layer._leaflet_id, layoutOptions, panelsStyle, 'meters');
            var popupContent = '<table>';
            for (var p in paneles.options.properties) {
                popupContent += '<tr><td>' + p + '</td><td>'+ paneles.options.properties[p] + '</td></tr>';
            }
            popupContent += '</table>';
            e.layer.bindPopup(popupContent + '</br> ID LAYER: ' + e.layer._leaflet_id + '     ID PANELES: ' + paneles._leaflet_id + 
            '</br></br><button type="button" class="btn-sm btn-primary" data-toggle="modal" data-target="#chat"> Chat </button>'+
            '  <button type="button" class="btn-sm btn-primary" data-toggle="modal" data-target="#ahorro"> Ahorro </button>');

            paneles.bindPopup(popupContent);
            PanelLayers.addLayer(paneles);
            //layerControl.addOverlay(paneles, 'String-' + paneles._leaflet_id);
        }
    });

    
    map.on('editable:vertex:altclick', function (e, map) { //cuando se crea un dbibujo
        alert('sf');
        if (e.layer instanceof L.Polygon) {
        
          
        }
    });

    $('html').keyup(function(e){ 
        if(e.keyCode == 27) { 
            map.eachLayer(function(layer) {
                if(layer instanceof L.Polygon) {
                    layer.disableEdit();  
                }
            });
        } else if(e.keyCode == 46) { 
            map.eachLayer(function(layer) {
                if((layer instanceof L.Polygon || layer instanceof L.Circle || layer instanceof L.Polyline) && layer.editEnabled()) {
                    layer.remove();
                }
            });
        } 
    }); 

    var layoutOptions = {
        id: 0,
        padre: 0,
        // parametros diseño panel
        width: 1,     
        height: 1.5, 
        tilt: 10,  
        azimuth: 30, 
        model: '',
        fabricante: '',
        // parametros diseno estructuras
        moduleSpacing: 0.15,  
        rowSpacing: 0.5, 
        frameSpacing: 0.5, 
        frameUp: 1, 
        frameWide: 1, 
        orientation: 'vertical', //horizontal, vertical
        alignment: 'center', // center left rigth space
        setBack: 1,
        // parametros electricos
        Wp: 280, //Potencia maxima pico (W)
        Voc: 38.4, //Tensión de circuito abierto (V)
        Vmp: 31.4, //Tensión máxima (V)
        Isc: 8.94, // Corriente de cortocircuito (A)
        Imp: 8.37, //Corriente máxima (A)
        // estilo dibujo
    };

    var panelsStyle = {
        weight: 1,
        fillColor: 'blue',
        strokeColor: 'blue',
        fillOpacity: 0.5,
    }

    function PanelesGrid(boundaryPolygon, parent, options, style, myUnits) {
        var resultado = {
            "Potencia Generada": 0,
            "Cantidad de Celdas": 0,
        };

        options.padre = parent;
        // Containers
        var bbox1 = turf.bbox(boundaryPolygon);
        var pivot = [bbox1[0], bbox1[3]];
        var op = {pivot: pivot, units: myUnits};
        var boundaryPolygonAzimuth = turf.transformRotate(boundaryPolygon, options.azimuth, op);
        var bbox = turf.bbox(boundaryPolygonAzimuth);
        var results = [];
        var cellPoly;
        const west = bbox[0];
        const south = bbox[1];
        const east = bbox[2];
        const north = bbox[3];
        var width, height;

        if (options.orientation == 'vertical') {
            width = options.width;
            height = options.height;
        } else if (options.orientation == 'horizontal') {
            width = options.height;
            height = options.width;
        }

        //height = height *  // tilt

        const xFraction = width / turf.distance([west, south], [east, south], {units: myUnits});
        const yFraction = height / turf.distance([west, south], [west, north], {units: myUnits});
        const cellWidthDeg = xFraction * (east - west);
        const cellHeightDeg = yFraction * (north - south) ;
        // rows & columns
        const bboxWidth = east - west;
        const bboxHeight = north - south;
        const columns = Math.floor(bboxWidth / cellWidthDeg);
        const rows = Math.floor(bboxHeight / cellHeightDeg);

        // if the grid does not fill the bbox perfectly, center it.
        if (options.alignment == 'center') {
            var deltaX = (bboxWidth - columns * cellWidthDeg) / 2;
            var deltaY = (bboxHeight - rows * cellHeightDeg) / 2;
            var StarX = west;
            var StarY = south; 
        }

        // iterate over columns & rows
        var buffer = turf.buffer(boundaryPolygonAzimuth, -1 * options.setBack, {units: myUnits});
        //results.push(buffer); 

        if (typeof(buffer) != 'undefined') {
            let currentX = StarX + deltaX;
            for (let column = 0; column < columns; column++) {
                let currentY = StarY + deltaY;
                for (let row = 0; row < rows; row++) {
                    cellPoly = turf.polygon([[[currentX, currentY], [currentX, currentY + cellHeightDeg], [currentX + cellWidthDeg, currentY + cellHeightDeg],
                                            [currentX + cellWidthDeg, currentY], [currentX, currentY]]], options, {units: myUnits});
                    cellPoly = turf.transformTranslate(cellPoly, options.moduleSpacing * column, 90, {units: myUnits} );
                    cellPoly = turf.transformTranslate(cellPoly, options.rowSpacing * row, 0, {units: myUnits} );

                    if (buffer.geometry.type != 'MultiPolygon') { 
                        if (turf.booleanContains(buffer, cellPoly)) {  
                            cellPoly = turf.transformRotate(cellPoly, 360 - options.azimuth, op); 
                            resultado["Potencia Generada"] += options.Wp;
                            resultado["Cantidad de Celdas"] += 1;
                            results.push(cellPoly);                             
                        } 
                    } else {
                        buffer.geometry.coordinates.map(function(g) {
                            if (turf.booleanContains(turf.polygon(g, {units: myUnits} ), cellPoly)) {  
                                cellPoly = turf.transformRotate(cellPoly, 360 - options.azimuth, op); 
                                resultado["Potencia Generada"] += options.Wp;
                                resultado["Cantidad de Celdas"] += 1;                               
                                results.push(cellPoly);
                            }  
                        })
                    }     
                    currentY += cellHeightDeg;
                }
                currentX += cellWidthDeg;
            }    
        }

        console.log(turf.featureCollection(results));
        return L.geoJSON(turf.featureCollection(results), resultado);
    }

})

