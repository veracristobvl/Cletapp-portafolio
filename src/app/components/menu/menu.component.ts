import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent  implements OnInit {

  constructor( public authservice: AuthService, private router: Router) { }

  ngOnInit() {}
  perfil() {
    this.router.navigate(['/perfil']);
  }
  home() {
    this.router.navigate(['/home']);
  }
  salir() {
    this. authservice.logout()
    .then(res => {
      this.router.navigate(['/login']);
      console.log(res);
    })
    .catch(error => {
      console.log(error);
    })
  }
}
