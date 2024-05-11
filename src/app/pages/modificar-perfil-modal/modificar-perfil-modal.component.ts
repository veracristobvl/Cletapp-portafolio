import { Component, Input} from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modificar-perfil-modal',
  templateUrl: './modificar-perfil-modal.component.html',
  styleUrls: ['./modificar-perfil-modal.component.scss'],
})
export class ModificarPerfilModalComponent {

  @Input() campo: string;
  @Input() valorActual: string;
  nuevoValor: string;


  constructor(private modalController: ModalController) { }

  dismiss() {
    this.modalController.dismiss();
  }

  guardar() {
    this.modalController.dismiss({ campo: this.campo, nuevoValor: this.nuevoValor }, 'guardar');
    
  }
}
