import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { LoadingController } from '@ionic/angular';
@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {
  email: string = '';
  password: string = '';
  nombre: string = '';
  apellido: string = '';
  nickname: string = '';
  fotoPerfil: File = null; // Agregar variable para la foto de perfil
  formularioRegistro: FormGroup;

  constructor(
    private router: Router, 
    private authservice: AuthService,
    private loadingCtrl: LoadingController,
  ) {
    this.formularioRegistro = new FormGroup(
      {
        nombre: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
        ]),
        apellido: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
        ]),
        nickname: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
        ]),
        email: new FormControl('', [Validators.required, Validators.email],),
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
        ]),
        confirmarPassword: new FormControl('', [Validators.required]),
      },
      {
        validators: [this.passwordMatchValidator,  ],
      }
    );
  }
  ngOnInit() {}
  // Función de validación personalizada que verifica si 2 passwords ingresadas son iguales 
  passwordMatchValidator(control: AbstractControl) {
    return control.get('password')?.value ===
      control.get('confirmarPassword')?.value
      ? null
      : { mismatch: true };
  }

  async registrar() {
    
    const loading = await this.loadingCtrl.create({
      message: 'Cargando...',
      duration: 1500,
    });

    let {nombre, apellido, nickname, email, password } = this.formularioRegistro.value
    const userData = {
      nombre: nombre,
      apellido: apellido,
      nickname: nickname,
      role: 'user',
    };
    await loading.present();
    this.authservice
      .register(email, password, userData, this.fotoPerfil)
      .then((res) => {
        console.log(res);
        this.router.navigate(['/login']);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  selectPhoto(event: any) {
    this.fotoPerfil = event.target.files[0];
  }

  volver() {
    this.router.navigate(['/login']);
  }

}
