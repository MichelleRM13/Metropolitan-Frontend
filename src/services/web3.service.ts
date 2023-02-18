import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import Web3 from 'web3';
import Swal from 'sweetalert2';

declare let window: any;

@Injectable({
  providedIn: 'root'
})

export class Web3Service {
  web3: Web3 = new Web3(Web3.givenProvider);
  get web3Instance() { return this.web3; }

  chainIds: string[] = ['0x5'];
  addressUser: any = new BehaviorSubject<string>('');
  mtptBalance: any = new BehaviorSubject<number>(0);
  loginUser: any = new BehaviorSubject<boolean>(false);
  accounts: string[] = [];

  mptknContract: any;
  mtptTknAbi: any;
  mtptTknAdd: any;
  cantidadTokens: number = 0;
  mtptPrecision:number = 10 ** 18;
  
  penTknContract: any;
  penTknAbi: any;
  penTknAdd: any;
  penPrecision:number = 10 ** 2;
  
  mtprechargeContract: any;
  mtprechargeAbi: any;
  mtprechargeAdd: any;

  nftContract: any;
  nftAbi: any;
  nftAdd: any;
  idsNfts: any = new BehaviorSubject<string[]>([]);
  defiAdd: any;

  constructor(
    private router: Router) {
    if (typeof window.ethereum !== 'undefined') {
      this.web3 = new Web3(Web3.givenProvider);

      this.penTknAbi = require('../../artifacts/contracts/PENCoin.sol/PENCoin.json').abi;
      this.penTknAdd = "0x020bCBEEB5CB98491911F3543880CBfa69Aea204";

      this.mtptTknAbi = require('../../artifacts/contracts/MetropolitanToken.sol/MetropolitanToken.json').abi;
      this.mtptTknAdd = "0x51251833b4439D66B86AEE970dF6e3941479EEc0";

      this.nftAbi = require('../../artifacts/contracts/MetropolitanNFT.sol/MetropolitanNFT.json').abi;
      this.nftAdd = "0x62db3cE50B16E029aB364aa5E37463EBe5ac309E";

      this.mtprechargeAbi = require('../../artifacts/contracts/MetroRecharge.sol/MetroRecharge.json').abi;
      this.mtprechargeAdd = "0x90E124751a7E1f3230F64bC19A95446d3828aF5E";

      this.defiAdd = "0x2E0a626679B5a50FD744F3Cd2e9e1773aCE0cf71";

      this.penTknContract = new this.web3.eth.Contract(this.penTknAbi,this.penTknAdd);
      this.mptknContract = new this.web3.eth.Contract(this.mtptTknAbi,this.mtptTknAdd);
      this.nftContract = new this.web3.eth.Contract(this.nftAbi,this.nftAdd);
      this.mtprechargeContract = new this.web3.eth.Contract(this.mtprechargeAbi,this.mtprechargeAdd);
      
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No tienes instalado MetaMask!'
      });
    }
  }

  async connect() {
    await this.handleIdChainChanged();
    await this.obtenerTokens();
    await this.obtenerNFTs();
  }

  public async obtenerTokens(){
    const addressActual = this.web3.utils.toChecksumAddress(this.accounts[0]);

    this.mptknContract = new this.web3.eth.Contract(this.mtptTknAbi,this.mtptTknAdd);
    const respuestaBalanceOf = await this.mptknContract.methods.balanceOf(addressActual).call();
    const cantRespuestaBalanceOf = (parseInt(respuestaBalanceOf)) / this.mtptPrecision;
    console.log(cantRespuestaBalanceOf)   

    this.mtptBalance.next(Math.round(cantRespuestaBalanceOf));    
  }

  public async obtenerNFTs(){
    const addressActual = this.web3.utils.toChecksumAddress(this.accounts[0]);
    const respuestaBalanceOf:string[] = await this.nftContract.methods.obtenerNFTs(addressActual).call();

    var listaNFTs:string[] = [];

    for(var i=0; i< respuestaBalanceOf.length; i++){
      if(respuestaBalanceOf[i] != "0"){
        listaNFTs.push(respuestaBalanceOf[i]);
      }
    }

    this.idsNfts.next(listaNFTs);
  }

  public async venderNFT(id:number, amount:number){
    const addressActual = this.web3.utils.toChecksumAddress(this.accounts[0]);

    this.mptknContract = new this.web3.eth.Contract(this.mtptTknAbi,this.mtptTknAdd);
    const respuestaMTPTKN = await this.mptknContract.methods.mint(addressActual,amount).send({from: this.accounts[0]});
    console.log(respuestaMTPTKN)

    this.nftContract = new this.web3.eth.Contract(this.nftAbi,this.nftAdd);
    const respuestaNFT = await this.nftContract.methods.safeBurn(addressActual,id).send({from: this.accounts[0]});  
    console.log(respuestaNFT)

    this.obtenerNFTs();
  }

  public async comprarMPTKporPEN(amount:number){
    this.mtprechargeContract = new this.web3.eth.Contract(this.mtprechargeAbi,this.mtprechargeAdd);
    const respuestaComprarMtptkPorPEN = await this.mtprechargeContract.methods.comprarMtptkPorPEN(amount).send({from: this.accounts[0]});
    console.log(respuestaComprarMtptkPorPEN)
    
    const addressDefi = this.web3.utils.toChecksumAddress(this.defiAdd);
    this.penTknContract = new this.web3.eth.Contract(this.penTknAbi,this.penTknAdd);

    const respuestaPENTransfer = await this.penTknContract.methods.transfer(addressDefi, amount).send({from: this.accounts[0]});
    console.log(respuestaPENTransfer)   
  }

  async handleIdChainChanged() {
    const chainId: string = await Web3.givenProvider.request({ method: 'eth_chainId' });

    if (this.chainIds.includes(chainId)) {
      await this.handleAccountsChanged();
    } else {
      this.router.navigate(['inicio']);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Selecciona la red principal de Goerli'
      });
    }

    Web3.givenProvider.on('chainChanged', (res: string) => {
      if (!this.chainIds.includes(res)) {
        this.logout();
        this.router.navigate(['inicio']);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Selecciona la red principal de Goerli'
        });
      } else {
        if (this.addressUser.getValue() === '') {
          this.handleAccountsChanged();
        } else {
          this.authBackend();
        }
      }
    });
  }

  async handleAccountsChanged() {
    this.accounts = await this.web3.eth.getAccounts(); 

    this.addressUser.next(this.accounts[0]);
    this.authBackend();

    Web3.givenProvider.on('accountsChanged', (accounts: string[]) => {
      this.addressUser.next(accounts[0]);
      this.authBackend();
    });

    this.router.navigate(['recarga']);
  }

  async authBackend() {
    // => IF Success auth api backend
    this.loginUser.next(true);

    // => IF Failed auth api backend d
    //this.logout();
  }

  logout() {
    console.log(false)
    this.loginUser.next(false);
    console.log(this.loginUser)
  }
}