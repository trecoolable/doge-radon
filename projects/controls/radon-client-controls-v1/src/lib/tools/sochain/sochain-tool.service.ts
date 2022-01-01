import axios from "axios";


export class SochainToolService {

  constructor() { }


  public async getBalance(address, confirms = 1) {
    let self = this;
    //get balance
    let getOp:any = await self.get('v2/get_address_balance/DOGETEST/' + address + '/' + confirms);
    //check if error
    if(getOp.error) return reply(false, 'error getting balance', {}, getOp.error);
    //got balance, return balance
    return reply(true, 'got balance', {balance: getOp.data.confirmed_balance});
  }


  public async getUnspent(address) {
    let self = this;
    //get balance
    let getOp:any = await self.get('v2/get_tx_unspent/DOGETEST/' + address + '');
    //check if error
    if(getOp.error) return reply(false, 'error getting unspent', {}, getOp.error);
    //got balance, return balance
    return reply(true, 'got unspent', {txs: getOp.data.txs});
  }


  public async getSpent(address) {
    let self = this;
    //get balance
    let getOp:any = await self.get('v2/get_tx_spent/DOGETEST/' + address + '');
    //check if error
    if(getOp.error) return reply(false, 'error getting spent', {}, getOp.error);
    //got balance, return balance
    return reply(true, 'got spent', {txs: getOp.data.txs});
  }



  public async getTransactions(address){
    let self = this;
    //get balance
    let getOp:any = await self.get('v2/get_tx_received/DOGETEST/' + address + '/');
    //check if error
    if(getOp.error) return reply(false, 'error getting balance', {}, getOp.error);
    //got balance, return balance
    return reply(true, 'got transactions', {txs: getOp.data.txs});
  }



  public async getTransaction(txid){
    let self = this;
    //get tx
    let getOp:any = await self.get('v2/get_tx/DOGETEST/' + txid + '/');
    //check if error
    if(getOp.error) return reply(false, 'error getting transaction', {}, getOp.error);
    //got balance, return tx
    return reply(true, 'got transaction', {tx: getOp.data});
  }


  public async broadcastTransaction(tx_hex){
    let self = this;
    //get tx
    let getOp:any = await self.post('v2/send_tx/DOGETEST', {tx_hex});
    //check if error
    if(getOp.error) return reply(false, 'error getting transaction', {}, getOp.error);
    //got balance, return tx
    return reply(true, 'got transaction', {tx: getOp.data});
  }





  public get(path, load = {}) {
    let self = this;
    return new Promise(resolve => {
      //set options
      let options: any = {
        method: 'get',
        url: 'https://chain.so/api/' + path,
        params: load
      };
      //send request
      axios.request(options)
      .then(response => {
        return resolve(response.data);
      })
      .catch(error => {
        return resolve(reply(false, 'request error', {}, error));
      })
    });
  }


  public post(path, load = {}) {
    let self = this;
    return new Promise(resolve => {
      //set options
      let options: any = {
        method: 'get',
        url: 'https://chain.so/api/' + path,
        data: load
      };
      //send request
      axios.request(options)
      .then(response => {
        return resolve(response.data);
      })
      .catch(error => {
        return resolve(reply(false, 'request error', {}, error));
      })
    });
  }



}

function reply(s,m,d = {},e = null){return {success:s, message:m, data:d, error:e}}