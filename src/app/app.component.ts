import { Component, ViewChild  } from '@angular/core';
import { MenuController, IonRouterOutlet  } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  @ViewChild(IonRouterOutlet, { static: false }) routerOutlet: IonRouterOutlet;
  constructor(private menu: MenuController, public router: Router, public authservice: AuthService) {
    this.router.events.subscribe(() => {
      if (this.routerOutlet && this.routerOutlet.canGoBack()) {
        this.menu.close();
      }
    });
  }

  login() {
    this.router.navigate(['/login']);
  }

registrar() {
  this.router.navigate(['/registro'])
}

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

shouldShowMenu(): boolean {
  return this.authservice.isLoggedIn() && !['/login', '/registro'].includes(this.router.url);
}

}


