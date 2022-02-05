import { Component } from '@angular/core';
import * as L from 'leaflet';
import { latLng, tileLayer, featureGroup, icon, DrawEvents } from 'leaflet';
import * as turf from 'turf';

@Component({
  selector: 'app-design',
  templateUrl: './design.component.html',
  styleUrls: ['./design.component.scss']
})

export class DesignComponent {
  private map: L.Map;

  private altadefinicion = tileLayer.wms("https://idecan1.grafcan.es/ServicioWMS/OrtoUrb?", {
    layers: "OrtoExpressUrb",//de la capa (ver get capabilities)
    maxZoom: 24,
    format: 'image/jpeg',
    transparent: false,
    version: '1.3.0',//wms version (ver get capabilities)
    attribution: "CANARIAS"
    });
  // Capas base
  private osmBase = tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: 'Derechos; <a href="http://osm.org/copyright">OpenStreetMap<\/a>',
  });

  public drawItems = featureGroup();

  public layersControl = {
    baseLayers: {
      'Satelite': this.altadefinicion,
      'Calles': this.osmBase
    },
    overlays: {
      'Diseño': this.drawItems
    }
  }

  // Set the initial set of displayed layers (we could also use the leafletLayers input binding for this)
  options = {
    layers: [ this.altadefinicion, this.osmBase, this.drawItems],
    zoom: 20,
    center: latLng([ 27.85183460849563, -15.441697559122824 ])  
  };

  drawOptions = {
    position: 'topleft',
    draw: {
      marker: {
        icon: L.icon({
          iconSize: [ 25, 41 ],
          iconAnchor: [ 13, 41 ],
          iconUrl: '2b3e1faf89f94a4835397e7a43b4f77d.png',
          iconRetinaUrl: '680f69f3c2e6b90c1812a813edf67fd7.png',
          shadowUrl: 'a0c6cc1401c107b501efee6477816891.png'
        })
      },
      polyline: true,
      circle: {
        radius: 10,
        shapeOptions: {
          color: '#d4af37'
        }
      },
      rectangle: {
        shapeOptions: {
          color: '#85bb65'
        }
      }
    },
    edit: {
      featureGroup: this.drawItems
    }
  };

  public onDrawCreated(e: any) {
    this.drawItems.addLayer((e as DrawEvents.Created).layer);
  }
  

}



