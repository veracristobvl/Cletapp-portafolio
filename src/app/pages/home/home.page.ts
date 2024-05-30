import {
  Component,
  OnInit,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import {
  LoadingController,
  ModalController,
  Platform,
  ToastController,
} from '@ionic/angular';
import { InfoPanelComponent } from '../info-panel/info-panel.component';
import { mapConfiguration } from './map-config';
import { MapService } from 'src/app/services/map.service';
import { GoogleMap } from '@capacitor/google-maps';
declare var google: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  map: any = null; // Utilizamos 'any' en lugar de ''
  myLatLng : any; 
  location : any;
  marker: any = null;
  mostrarFormulario = false;
  clickedLocation: { lat: number; lng: number } = { lat: 0, lng: 0 };
  markers: any[] = [];
  searchQuery: string = '';
  markerComments: { [key: string]: string[] } = {}; // Definimos markerComments aquí
  mapConfiguration: any[] = mapConfiguration;
  autocompleteService = new google.maps.places.AutocompleteService()
  predictions: any = [];
  
  
  constructor(
    private modalController: ModalController,
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef,
    private toastController: ToastController,
    private loadingCtrl: LoadingController,
    private mapService: MapService,
    private platform: Platform
  ) { }
  
  async ngOnInit() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando...',
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
  
  async loadMap() {
    // Elemento html donde se mostrará el mapa
    const mapEle: HTMLElement = document.getElementById('map')!;
    if (this.platform.is('hybrid')){
      console.log('Aqui')
      this.map = await GoogleMap.create({
        id: 'my-map',
        element: mapEle,
        apiKey: 'AIzaSyCQiaAh4BSKJ513q6nEXR3Rhn4WzmBXleI',
        config: {
          center: {
            lat: this.myLatLng.lat,
            lng: this.myLatLng.lng,
          },
          zoom: 15,
          disableDefaultUI: true,
          styles: this.mapConfiguration
        },
      });
  
    }else {
      //Creación de mapa almacenado en "mapEle"
      this.map = new google.maps.Map(mapEle, {
        zoom: 15,
        disableDefaultUI: true,
        styles: this.mapConfiguration,
      });
    
  }
    
    // Obtener la ubicación actual y crear el marcador
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.myLatLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        this.location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude );
        
        this.marker = new google.maps.Marker({
          position: this.myLatLng,
          map: this.map,
          title: 'Ubicación Actual',
          icon: {
            url: 'https://storage.googleapis.com/cletapp-images/location-image.gif', // Ruta al GIF animado
            scaledSize: new google.maps.Size(50, 50), // Tamaño del icono
          },
        });
        this.map.setCenter(this.myLatLng);
        this.updateMarker(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('Error al obtener la ubicación', error);
      }
    );


    // Método que lleva mapa creado a "mapService" 
    this.mapService.setMap(this.map);
    
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

    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      mapEle.classList.add('show-map');
      google.maps.event.addListener(this.map, 'click', (event: any) => {
        this.clickedLocation = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };
        this.mostrarFormulario = true;
        this.cdr.detectChanges();
      });
    });
    (error) => {
      console.error('Error al obtener la ubicación:', error);
    };
  }

  search() {
    // Verifica si el campo de búsqueda está vacío o contiene solo espacios en blanco
    if (!this.searchQuery.trim()) {
      return; // Si está vacío, no hace nada y retorna inmediatamente
    }
    // Define el objeto de solicitud con la consulta y los campos requeridos
    const request = {
      query: this.searchQuery, // Usa el término de búsqueda proporcionado por el usuario
      fields: ['name', 'geometry'], // Especifica que los resultados deben incluir el nombre y la geometría del lugar
    };
    // Crea una instancia del servicio Places de Google Maps, vinculada al mapa actual
    const service = new google.maps.places.PlacesService(this.map);
    // Llama al método findPlaceFromQuery del servicio Places para buscar lugares según la consulta
    service.findPlaceFromQuery(request, (results: any[], status: any) => {
      // Verifica si la búsqueda fue exitosa y si hay resultados
      if (
        status === google.maps.places.PlacesServiceStatus.OK &&
        results &&
        results.length
      ) {
        const place = results[0]; // Toma el primer resultado de la búsqueda
        // Si el mapa está inicializado
        if (this.map) {
          this.map.panTo(place.geometry.location); // Centra el mapa en la ubicación del lugar encontrado
          this.map.setZoom(17); // Ajusta el nivel de zoom a 15 para acercar el mapa
        } else {
          console.error('El mapa aún no se ha inicializado.'); // Muestra un error si el mapa no está listo
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
          scaledSize: new google.maps.Size(50, 50), // Tamaño del icono
        },
      });
    } else {
      this.marker.setPosition(myLatLng);
    }
  }



  async presentLoading(message: string, duration: number) {
    const loading = await this.loadingCtrl.create({
      message: message,
      duration: duration
      // Optional configuration options (see below)
    });
    await loading.present();
  }

  getPlacePredictions(input: string, location?: any, radius?: number, callback?: (predictions:any, status: any) => void) {
    const request = {
      input: input,
      location:location,
      radius: radius,
      types: ['geocode'] // Ajusta el tipo de predicción según tus necesidades
    };
    this.autocompleteService.getPlacePredictions(request, callback);
  }


  onSearchChange() {
    if (this.searchQuery.trim() === '') {
      this.predictions = [];
      return;
    }
    this.getPlacePredictions(this.searchQuery, this.location, 20000, (predictions, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        this.predictions = predictions;
      } else {
        this.predictions = [];
      }
    });
  }

  selectPrediction(prediction:any) {
    this.searchQuery = prediction.description;
    this.predictions = [];
  }


}
