import { Component, OnInit, ElementRef,ChangeDetectorRef   } from '@angular/core';
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


  constructor(private modalController: ModalController, private elementRef: ElementRef, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadMap();
  }

  loadMap() {
    const mapEle: HTMLElement = document.getElementById('map')!;
    navigator.geolocation.getCurrentPosition((position) => {
      const myLatLng = { lat: position.coords.latitude, lng: position.coords.longitude };

      this.map = new google.maps.Map(mapEle, {
        center: myLatLng,
        zoom: 15,
        disableDefaultUI: true,
        styles: [
          {
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#212121"
              }
            ]
          },
          {
            "elementType": "labels.icon",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          },
          {
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "color": "#212121"
              }
            ]
          },
          {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          },
          {
            "featureType": "administrative.country",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#9e9e9e"
              }
            ]
          },
          {
            "featureType": "administrative.land_parcel",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "administrative.locality",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#bdbdbd"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          },
          {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#181818"
              }
            ]
          },
          {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#616161"
              }
            ]
          },
          {
            "featureType": "poi.park",
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "color": "#1b1b1b"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#2c2c2c"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#8a8a8a"
              }
            ]
          },
          {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#373737"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#3c3c3c"
              }
            ]
          },
          {
            "featureType": "road.highway.controlled_access",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#4e4e4e"
              }
            ]
          },
          {
            "featureType": "road.local",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#616161"
              }
            ]
          },
          {
            "featureType": "transit",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#2c476b"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#3d3d3d"
              }
            ]
          }
        ] // Desactiva los controles predeterminados
      });
      
      google.maps.event.addListenerOnce(this.map, 'idle', () => {
        mapEle.classList.add('show-map');
        google.maps.event.addListener(this.map, 'click', (event: any) => {
          this.clickedLocation = { lat: event.latLng.lat(), lng: event.latLng.lng() };
          this.mostrarFormulario = true;
          this.cdr.detectChanges(); 
          console.log("Estas haciendo click en el mapa");
        });
      });
    }, (error) => {
      console.error('Error al obtener la ubicación:', error);
      // Puedes manejar el error aquí
    });
  }

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
      this.cdr.detectChanges();
    } else {
      console.log('No se ha seleccionado ninguna ubicación');
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.cdr.detectChanges();
  }

}
