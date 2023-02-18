import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { InfoNFT } from 'src/models/infoNFT';
import { Web3Service } from 'src/services/web3.service';

@Component({
  selector: 'app-nfts',
  templateUrl: './nfts.component.html',
  styleUrls: ['./nfts.component.css']
})

export class NftsComponent implements OnInit {
  UrlImagenes: InfoNFT[] = [];
  infoNFT: InfoNFT;

  constructor(
    private cdr: ChangeDetectorRef,
    private web3Srv: Web3Service) { }

  ngOnInit(): void {

    this.web3Srv.idsNfts.subscribe(
      (res: string[]) => { 
        this.inicio(res);
        this.cdr.detectChanges();
    });
  }

  public async inicio(ids:string[]){
    this.UrlImagenes = [];

    for(var i=0; i< ids.length; i++){
      this.infoNFT = new InfoNFT();
      this.infoNFT.idNFT= ids[i];
      this.infoNFT.urlNFT = "https://gateway.pinata.cloud/ipfs/QmYerT6bzAWUZQs9t68DwAsfjMuLtxfY6bGtyEYvLNnQV3/"+ids[i]+".png";

      this.UrlImagenes.push(this.infoNFT);
    }
    console.log(this.UrlImagenes);
  }

  public async actualizarNFTs(){
    await this.web3Srv.obtenerNFTs();
  }

}
