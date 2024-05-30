import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private map:any // Variable para almacenar  mapa 
  private currentPosition: { lat: number, lng: number } | null = null; // Variable de tipo objeto que almacena la latitud y longitud de la ubicación del dispositivo 
  
  constructor(
  ) {
    this.getCurrentLocation();
  }

  // Métodos de la clase 

  // Método que asigna un mapa que viene como parámetro a la variable local this.map. 
  setMap(map:any){
    this.map = map
  }

  // Método que en primer lugar centra el mapa si es que currentPosition y mapa existen. En caso contrario, se obtienen las coordenadas y se centra el mapa en caso de existir. 
  centrarMapa(){
    if (this.currentPosition && this.map) {
      this.map.panTo(this.currentPosition);
    } 
    else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        if (this.map) {
          this.map.panTo(this.currentPosition);
        }
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }

  // Método que obtiene las coordenadas actuales del dispositivo. Éste metodo es de uso local (private) por lo que no es accesible desde una instancia de esta clase. 
  // Se llama en el contructor para definir la ubicación desde el principio y mejorar la velocidad del centrado. 
  private getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }

}
