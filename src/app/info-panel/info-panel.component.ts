import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-info-panel',
  templateUrl: './info-panel.component.html',
  styleUrls: ['./info-panel.component.scss'],
})
export class InfoPanelComponent {
  @Input() nombreLugar: string = '';
  @Input() url: string = '';
  @Input() lat: string = '';
  @Input() lng: string = '';
  @Input() titulo: string = '';
  @Output() close = new EventEmitter<void>();

  nombreComentario: string = '';
  textoComentario: string = '';
  comentarios: { nombre: string, texto: string, rating: number }[] = [];

  rating: number = 0;

  constructor(private modalController: ModalController) {}

  closePanel() {
    this.close.emit();
  }

  dismiss() {
    this.modalController.dismiss();
  }
  
  
  agregarComentario() {
    if (this.nombreComentario.trim() !== '' && this.textoComentario.trim() !== '') {
      this.comentarios.push({ nombre: this.nombreComentario, texto: this.textoComentario, rating: this.rating });
      this.nombreComentario = '';
      this.textoComentario = '';
      this.rating = 0;
    }
  }
  
  getStars(rating: number): string {
    let stars = '';
    for (let i = 0; i < rating; i++) {
      stars += '★';
    }
    return stars;
  }
  
}



