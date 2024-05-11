import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Firestore, collection, getDocs, query, where, updateDoc, doc} from '@angular/fire/firestore';
import { ModalController } from '@ionic/angular';
import { ModificarPerfilModalComponent } from '../../pages/modificar-perfil-modal/modificar-perfil-modal.component';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';


@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {

  userData: any;
  photoURL: string;

  constructor(private auth: AuthService, private firestore: Firestore, private modalController: ModalController,private storage: Storage,) { }

  async ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (user) {
      const querySnapshot = await getDocs(query(collection(this.firestore, 'users'), where('uid', '==', user.uid)));
      querySnapshot.forEach(async (doc) => {
        this.userData = doc.data();
        this.userData.id = doc.id;555
        const photoRef = ref(this.storage, this.userData.photoURL); // Referencia a la foto de perfil
        this.photoURL = await getDownloadURL(photoRef); // URL de descarga de la foto de perfil
        console.log(this.userData);
      });
    }
  }

  async seleccionarNuevaFoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      const user = this.auth.getCurrentUser();
      if (user) {
        await this.auth.subirFotoPerfil(user.uid, file);
        this.photoURL = await this.auth.obtenerURLFotoPerfil(user.uid);
      }
    };
    input.click();
  }


  async abrirModalModificar(campo: string, valorActual: string) {
    const modal = await this.modalController.create({
      component: ModificarPerfilModalComponent,
      componentProps: {
        campo: campo,
        valorActual: valorActual
      }
    });
  
    modal.onDidDismiss().then((data) => {
      if (data.role === 'guardar') {
        this.actualizarDatos(data.data.campo, data.data.nuevoValor);
      }
    });
    
    return await modal.present();
  }
  
  async actualizarDatos(campo: string, nuevoValor: string) {
    const user = this.auth.getCurrentUser();
    if (user) {
      const querySnapshot = await getDocs(query(collection(this.firestore, 'users'), where('uid', '==', user.uid)));
      querySnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, { [campo]: nuevoValor });
        this.userData[campo] = nuevoValor;
      });
    }
  }
}