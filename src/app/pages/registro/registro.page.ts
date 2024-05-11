import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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
  username: string = '';
  fotoPerfil: File; // Agregar variable para la foto de perfil


  constructor(
    private router: Router, 
    private authservice: AuthService) {
      
  }

  registrar() {
    const userData = {
      nombre: this.nombre,
      apellido: this.apellido,
      username: this.username
    };
    this.authservice.register(this.email, this.password, userData,  this.fotoPerfil)
    .then(res => {
      console.log(res);
      this.router.navigate(['/login']);
    })
    .catch(error => {
      console.log(error);
    });
}

selectPhoto(event: any) {
  this.fotoPerfil = event.target.files[0];
}

volver() {
  this.router.navigate(['/login']);
}

  ngOnInit() {
  }

}


