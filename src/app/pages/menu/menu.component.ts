import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Web3Service } from 'src/services/web3.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})

export class MenuComponent implements OnInit {

  isLogged: boolean = false;
  web3: any; 
  loginUser: boolean = false;
  addressUser: string = '';
  addressUserView: boolean = false;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private web3Srv: Web3Service,
    ) { 
      this.web3 = this.web3Srv.web3Instance;
    }

  ngOnInit(): void {
    // this.conectarMetamask();
    
    this.web3Srv.loginUser.subscribe((res: boolean) => { 
      this.loginUser = res;
      (!this.loginUser) ? this.addressUserView = false : this.addressUserView = true;
      this.cdr.detectChanges();
    });
    
    this.web3Srv.addressUser.subscribe((res: string) => { 
      this.addressUser = res;
      sessionStorage.setItem("address",this.addressUser);
      this.cdr.detectChanges();
    });    
  }

  conectarMetamask() {
    this.web3Srv.connect();
  }

  desconectarMetamask() {
    this.web3Srv.logout();
    console.log(this.loginUser)
    console.log(this.addressUserView)
    this.router.navigate(['inicio']);
  }

  irPagina(idPagina: number) {    
    switch (idPagina) {
      case 0:
        this.router.navigate(['inicio']);
        break;
      case 1:
        this.router.navigate(['recarga']);
        break;
      case 2:
        this.router.navigate(['nfts']);
        break;
      case 3:
        this.router.navigate(['rutas']);
        break;
      default:
        console.error("No hay pagina para redirigir...");
        break;
    }
  }
}
