import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Firestore, collection, getDocs, query, where, updateDoc, doc} from '@angular/fire/firestore';
import { ModalController } from '@ionic/angular';
import { ModificarPerfilModalComponent } from '../modificar-perfil-modal/modificar-perfil-modal.component';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {

  userData: any;
  photoURL: string;

  constructor(private auth: AuthService, private router: Router, private firestore: Firestore, private modalController: ModalController,private storage: Storage,) { }

  async ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (user) {
      const querySnapshot = await getDocs(query(collection(this.firestore, 'users'), where('uid', '==', user.uid)));
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        this.userData = userData;
        this.photoURL = await this.auth.obtenerURLFotoPerfil(user.uid);
      }
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
        localStorage.setItem('userData', JSON.stringify(this.userData));
      });
    }
  }
  salir() {
    this. auth.logout()
    .then(res => {
      this.router.navigate(['/login']);
      console.log(res);
      this.userData = null;
      this.photoURL = null;    
    })
    .catch(error => {
      console.log(error);
    })
  }
}