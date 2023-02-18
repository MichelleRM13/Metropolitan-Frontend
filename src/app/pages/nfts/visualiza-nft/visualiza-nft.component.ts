import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { InfoNFT } from 'src/models/infoNFT';
import { Web3Service } from 'src/services/web3.service';

@Component({
  selector: 'app-visualiza-nft',
  templateUrl: './visualiza-nft.component.html',
  styleUrls: ['./visualiza-nft.component.css']
})

export class VisualizaNftComponent implements OnInit {

  @Input() nft: InfoNFT;
  url:string = "";
  id:string = "0";
  tipoNFT:string = 'básico';
  amount:number = 0;
  MIN_TKN_BASICO = 5000;
  MAX_TKN_BASICO = 10000;
  MAX_TKN_LEGENDARIO = 15000;
  cantMTPTKNOferta: string;

  constructor(
    private cdr: ChangeDetectorRef,
    private web3Srv: Web3Service) { }

  ngOnInit(): void {
    this.url = this.nft.urlNFT;
    this.id = this.nft.idNFT;

    if(parseInt(this.id)>100){
      this.tipoNFT = "legendario";
    }else{
      this.tipoNFT = "básico";
    }

    this.calcularOferta();
  }

  public async venderNft(){
    await this.web3Srv.venderNFT(parseInt(this.id),(this.amount * (10**18)));
  }

  public calcularOferta(){
    console.log("Oferta this.id: "+this.id);
    var min;
    var max;

    if(this.tipoNFT != "legendario"){
      min = Math.ceil(this.MIN_TKN_BASICO);
      max = Math.floor(this.MAX_TKN_BASICO);
    }else{
      min = Math.ceil(this.MAX_TKN_BASICO);
      max = Math.floor(this.MAX_TKN_LEGENDARIO);
    }

    var montoDia = (new Date().getTime()) / (parseInt(this.id) * (10 **10));
    console.log(montoDia);
    var amount = montoDia * (max - min + 1);

    console.log(amount);
    console.log(max * Math.round(amount/max));
    amount = amount - (max*Math.round(amount/max)) + min;

    if(amount > max){
      amount = amount - max;
    }
    console.log(amount);

    this.amount = Math.round(amount);

    console.log(amount)
    this.cantMTPTKNOferta = this.amount + " MTPTKN";
  }

}
