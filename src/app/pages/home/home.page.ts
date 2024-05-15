import {
  Component,
  OnInit,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import {
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { InfoPanelComponent } from '../info-panel/info-panel.component';
import { mapConfiguration } from './map-config';

declare var google: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  map: any = null; // Utilizamos 'any' en lugar de 'google.maps.Map | null'
  marker: any = null;
  mostrarFormulario = false;
  clickedLocation: { lat: number; lng: number } = { lat: 0, lng: 0 };
  markers: any[] = [];
  searchQuery: string = '';
  markerComments: { [key: string]: string[] } = {}; // Definimos markerComments aquí
  mapConfiguration: any[] = mapConfiguration;
  constructor(
    private modalController: ModalController,
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef,
    private toastController: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando...',
      duration: 0,
    });

    await loading.present();

    try {
      await this.loadMap();
    } catch (error) {
      console.error('Error al cargar el mapa:', error);
    } finally {
      await loading.dismiss(); // Oculta el loader cuando finalice la carga del mapa
    }
  }

  loadMap() {
    // Elemento html donde se mostrará el mapa
    const mapEle: HTMLElement = document.getElementById('map')!;

    //Crear Mapa
    this.map = new google.maps.Map(mapEle, {
      zoom: 15,
      disableDefaultUI: true,
      styles: this.mapConfiguration,
    });

    // Obtener la ubicación actual y crear el marcador
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const myLatLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        this.marker = new google.maps.Marker({
          position: myLatLng,
          map: this.map,
          title: 'Ubicación Actual',
          icon: {
            url: 'https://storage.googleapis.com/cletapp-images/location-image.gif', // Ruta al GIF animado
            scaledSize: new google.maps.Size(50, 50) // Tamaño del icono
          }
        });
        this.map.setCenter(myLatLng);
        this.updateMarker(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('Error al obtener la ubicación', error);
      }
    );

    // Actualizar la ubicación cada 2 segundos
    setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.updateMarker(
            position.coords.latitude,
            position.coords.longitude
          );
          
        },
        (error) => {
          console.error('Error al obtener la ubicación:', error);
          // Puedes manejar el error aquí
        }
      );
    }, 2000);
    // const myLatLng = {
    //   lat: position.coords.latitude,
    //   lng: position.coords.longitude,
    // };
    // Creación del mapa

    // Crear un marcador en la ubicación actual

    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      mapEle.classList.add('show-map');
      google.maps.event.addListener(this.map, 'click', (event: any) => {
        this.clickedLocation = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };
        this.mostrarFormulario = true;
        this.cdr.detectChanges();
        console.log('Estas haciendo click en el mapa');
      });
    });

    (error) => {
      console.error('Error al obtener la ubicación:', error);
      // Puedes manejar el error aquí
    };
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
      if (
        status === google.maps.places.PlacesServiceStatus.OK &&
        results &&
        results.length
      ) {
        const place = results[0];

        if (this.map) {
          this.map.setCenter(place.geometry.location);
          this.map.setZoom(15);
        } else {
          console.error('El mapa aún no se ha inicializado.');
        }
      }
    });
  }

  addMarker() {
    if (this.clickedLocation.lat !== 0 && this.clickedLocation.lng !== 0) {
      const nombreLugarInput: HTMLInputElement =
        document.querySelector('#nombreLugarInput')!;
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
          scaledSize: new google.maps.Size(50, 50),
        },
        animation: google.maps.Animation.DROP,
      });
      const url = `https://maps.googleapis.com/maps/api/streetview?size=500x500&location=
                  ${marker.position.lat()},${marker.position.lng()}&heading=0&pitch=0&key=
                  AIzaSyCQiaAh4BSKJ513q6nEXR3Rhn4WzmBXleI`; // Reemplaza YOUR_API_KEY con tu propia clave de API
      const lat = marker.position.lat();
      const lng = marker.position.lng();
      const titulo = marker.getPosition();

      google.maps.event.addListener(marker, 'click', async () => {
        const modal = await this.modalController.create({
          component: InfoPanelComponent,
          componentProps: {
            nombreLugar: nombreLugar,
            url: url,
            lat: lat,
            lng: lng,
            titulo: titulo,
          },
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

  updateMarker(latitude: number, longitude: number) {
    const myLatLng = { lat: latitude, lng: longitude };
    if (!this.marker) {
      this.marker = new google.maps.Marker({
        position: myLatLng,
        map: this.map,
        title: 'Ubicación Actual',
        icon: {
          url: 'https://storage.cloud.google.com/imagenes-cletapp/location-image.gif', // Ruta al GIF animado
          scaledSize: new google.maps.Size(50, 50) // Tamaño del icono
        }
      });
    } else {
      this.marker.setPosition(myLatLng);
    }
    
  }
}
