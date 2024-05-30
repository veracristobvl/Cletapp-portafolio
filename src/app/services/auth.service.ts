import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider
} from '@angular/fire/auth';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { AlertController } from '@ionic/angular'; // Importa AlertCon
import { Firestore, setDoc } from '@angular/fire/firestore';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
} from '@angular/fire/storage'; // Importa Storage
import { signInAnonymously } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private auth: Auth,
    private alertController: AlertController,
    private firestore: Firestore,
    private storage: Storage
  ) {}
  authState: BehaviorSubject<any> = new BehaviorSubject(null);
  DEFAULT_PHOTO_URL =
    'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

  async subirFotoPerfil(uid: string, foto: File) {
    const photoRef = ref(this.storage, `profile_photos/${uid}`);
    await uploadBytes(photoRef, foto);
  }

  async obtenerURLFotoPerfil(uid: string): Promise<string> {
    const photoRef = ref(this.storage, `profile_photos/${uid}`);
    try {
      return await getDownloadURL(photoRef);
    } catch (error) {
      // Si hay un error al obtener la URL de descarga (por ejemplo, si la foto no existe),
      // se devuelve la URL de la foto de perfil predeterminada.
      return 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
    }
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  async register(email: string, password: string, userData: any, photo: File | null) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      // Subir la foto de perfil a Firebase Storage si el usuario proporciona una foto
      let photoURL = this.DEFAULT_PHOTO_URL;
      if (photo) {
        const photoRef = ref(
          this.storage,
          `profile_photos/${userCredential.user.uid}`
        );
        await uploadBytes(photoRef, photo);
        photoURL = await getDownloadURL(photoRef);
      }else{
        null
      }

      // Agregar el usuario a la colección 'users' con la URL de la foto de perfil
      await addDoc(collection(getFirestore(), 'users'), {
        uid: userCredential.user.uid,
        email: email,
        photoURL: photoURL,
        role: userData.role,
        ...userData,
      });

      await this.showAlert('Success', 'Registrado con éxito');
    } catch (error) {
      console.error('Error registrando usuario:', error);
      throw error;
    }
  }

  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      // El usuario ha iniciado sesión correctamente
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error;
    }
  }

  async signInWithFacebook() {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      // El usuario ha iniciado sesión correctamente
    } catch (error) {
      console.error('Error al iniciar sesión con Facebook:', error);
      throw error;
    }
  }

  async loginAsGuest() {
    try {
      const userCredential = await signInAnonymously(this.auth);

      // Guardar el usuario como invitado en Firestore
      await setDoc(doc(getFirestore(), 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        role: 'guest',
      });

      return userCredential;
    } catch (error) {
      console.error('Error al logear usuario invitado:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    console.log('Credenciales desde servicio => ', email,password)
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      console.error('Ingrese su email y password', error);
      await this.showAlert('Error', 'Datos Incorrectos');
      throw error;
    }
  }

  async forgotPassword(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      console.error('Error al enviar el correo de restablecimiento:', error);
      throw error;
    }
  }

  logout() {
    return signOut(this.auth);
  }

  isLoggedIn() {
    return !!this.auth.currentUser;
  }

  async showAlert(title: string, message: string) {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  isGuestUser() {
    const user = this.getCurrentUser();
    return user ? user.isAnonymous : false;
  }
}
