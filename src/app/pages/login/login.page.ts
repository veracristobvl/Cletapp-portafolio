import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})




export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  
  
  constructor(
    private router: Router, 
    private authservice: AuthService 
  ) { 
    
  }

  login() {
    
    this.authservice.login(this.email, this.password)
      .then(res =>{
        console.log(res);
        this.router.navigate(['/home']);
      })
      .catch(err => console.log(err));
  }

  onClick() {
    this.router.navigate(['/registro'])
  }

  ngOnInit() {
  }

}
