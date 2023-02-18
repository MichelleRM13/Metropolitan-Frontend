import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Web3Service } from 'src/services/web3.service';

@Component({
  selector: 'app-recarga',
  templateUrl: './recarga.component.html',
  styleUrls: ['./recarga.component.css']
})

export class RecargaComponent implements OnInit {
  cantMTPTKN: string = "0 MTPTKN";
  recargaGroup: FormGroup = this._formBuilder.group({
    mtpknTokens:new FormControl(''),
    penTokens:new FormControl(''),
  });
  cantMTPTKNNew: number=0;
  addressActual:any;
  textButton: string = "Realizar conversión";

  constructor(
    private cdr: ChangeDetectorRef,
    private web3Srv: Web3Service,
    private _formBuilder: FormBuilder,) { }

  ngOnInit(): void {
    this.web3Srv.addressUser.subscribe(
      (res: string) => { 
        this.addressActual = res;
      sessionStorage.setItem("address",this.addressActual);
      this.cdr.detectChanges();
    });

    this.web3Srv.mtptBalance.subscribe(
      (res: number) => { 
        this.cantMTPTKN = res + " MTPTKN";
        this.cdr.detectChanges();
    });

    this.recargaGroup.controls.mtpknTokens.disable();
    this.recargaGroup.controls.mtpknTokens.setValue(this.cantMTPTKNNew+" MTPTKN");
  }

  public async cambiarTokens(){
    if(this.textButton != "Nueva conversión"){
      this.textButton = "Nueva conversión";
      this.recargaGroup.controls.penTokens.disable();
      var amount = this.recargaGroup.controls.penTokens.value;
      console.log(amount);
      await this.web3Srv.comprarMPTKporPEN(amount*10**2);
      await this.web3Srv.obtenerTokens();
    }else{
      this.recargaGroup.controls.penTokens.setValue("");
      this.recargaGroup.controls.penTokens.enable();
      this.textButton = "Realizar conversión";
    }
  }

}
