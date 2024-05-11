import { Component, OnInit, ElementRef  } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { InfoPanelComponent } from '../info-panel/info-panel.component';

declare var google: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {
  map: any = null; // Utilizamos 'any' en lugar de 'google.maps.Map | null'
  mostrarFormulario = false;
  clickedLocation: { lat: number, lng: number } = { lat: 0, lng: 0 };
  markers: any[] = [];
  searchQuery: string = '';
  markerComments: { [key: string]: string[] } = {}; // Definimos markerComments aquí
  
  constructor(private modalController: ModalController, private elementRef: ElementRef) {}
  
  ngOnInit() {
    this.loadMap();
  }
  

  
  loadMap() {
    
    // Establece un estilo para ocultar las etiquetas de puntos de interés (POI) predeterminadas en el mapa (Colegios, Restaurantes, Parques, ETC.)
    var myStyles =[
      {
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#ebe3cd"
          }
        ]
      },
      {
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#523735"
          }
        ]
      },
      {
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "color": "#f5f1e6"
          }
        ]
      },
      {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#c9b2a6"
          }
        ]
      },
      {
        "featureType": "administrative.land_parcel",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#dcd2be"
          }
        ]
      },
      {
        "featureType": "administrative.land_parcel",
        "elementType": "labels",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#ae9e90"
          }
        ]
      },
      {
        "featureType": "landscape.natural",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#dfd2ae"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#dfd2ae"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "labels.text",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#93817c"
          }
        ]
      },
      {
        "featureType": "poi.business",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "color": "#a5b076"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#447530"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#f5f1e6"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#fdfcf8"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#f8c967"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#e9bc62"
          }
        ]
      },
      {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#e98d58"
          }
        ]
      },
      {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#db8555"
          }
        ]
      },
      {
        "featureType": "road.local",
        "elementType": "labels",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#806b63"
          }
        ]
      },
      {
        "featureType": "transit",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#dfd2ae"
          }
        ]
      },
      {
        "featureType": "transit.line",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#8f7d77"
          }
        ]
      },
      {
        "featureType": "transit.line",
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "color": "#ebe3cd"
          }
        ]
      },
      {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#dfd2ae"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "color": "#b9d3c2"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#92998d"
          }
        ]
      }
    ]
    // Referencia de elemento HTML donde se mostrara mapa
    const mapEle: HTMLElement = document.getElementById('map')!;
    
    
    navigator.geolocation.getCurrentPosition((position) => {
      var myLatLng = { lat: position.coords.latitude, lng: position.coords.longitude };
      var mapOptions = {
        center: myLatLng,
        zoom: 15,
        disableDefaultUI: true,
        styles: myStyles // Desactiva los controles predeterminados

      }

      // Creación de mapa 
      this.map = new google.maps.Map(mapEle, mapOptions);

      var marker = new google.maps.Marker({
        position:myLatLng,
        map: this.map
      })


      google.maps.event.addListenerOnce(this.map, 'idle', () => {
        mapEle.classList.add('show-map');
        google.maps.event.addListener(this.map, 'click', (event: any) => {
          this.clickedLocation = { lat: event.latLng.lat(), lng: event.latLng.lng() };
          this.mostrarFormulario = true;
        });
      });
    }, (error) => {
      console.error('Error al obtener la ubicación:', error);
      // Puedes manejar el error aquí
    });
  }


  // Funcion para buscar dirección
  search() {
    if (!this.searchQuery.trim()) {
      return;
    }

    const request = {
      query: this.searchQuery,
      fields: ['name', 'geometry'],
    };

    const service = new google.maps.places.PlacesService(this.map);
    service.findPlaceFromQuery(request, (results: any[], status: any) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length) {
        const place = results[0];

        if (this.map) {
          this.map.setCenter(place.geometry.location);
          this.map.setZoom(15)
        } else {
          console.error('El mapa aún no se ha inicializado.');
        }
      }
    });
  }

  // Función para agregar marcador en el mapa
  addMarker() {
    if (this.clickedLocation.lat !== 0 && this.clickedLocation.lng !== 0) {
      const nombreLugarInput: HTMLInputElement = document.querySelector('#nombreLugarInput')!;
      const nombreLugar: string = nombreLugarInput.value.trim();

      if (!nombreLugar) {
        console.log('Por favor, ingresa un nombre para el lugar.');
        return;
      }

      const marker = new google.maps.Marker({
        position: this.clickedLocation,
        map: this.map,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new google.maps.Size(50, 50)
        },
        animation: google.maps.Animation.DROP,
      });

      const url = `https://maps.googleapis.com/maps/api/streetview?size=500x500&location=
                  ${marker.position.lat()},${marker.position.lng()}&heading=0&pitch=0&key=
                  AIzaSyCQiaAh4BSKJ513q6nEXR3Rhn4WzmBXleI`; // Reemplaza YOUR_API_KEY con tu propia clave de API

      const lat = marker.position.lat();
      const lng = marker.position.lng();
      const titulo = marker.getPosition();

      google.maps.event.addListener(marker, 'click', async() => {
        const modal = await this.modalController.create({
          component: InfoPanelComponent,
          componentProps: {
            nombreLugar: nombreLugar,
            url: url,
            lat: lat,
            lng: lng,
            titulo: titulo,
          }
        });
        await modal.present();
      });

      this.markers.push(marker);
      nombreLugarInput.value = '';
      this.clickedLocation = { lat: 0, lng: 0 };
      this.mostrarFormulario = false;
    } else {
      console.log('No se ha seleccionado ninguna ubicación');
    }
  }


  cerrarFormulario() {
    this.mostrarFormulario = false;
  }

}
