import { ArchivedTransactionInfo } from "../../../interfaces/archived-transaction/archived-transaction-info";

export class TransactionsItemControlService {

  constructor(public txid:string,  private ControlImports) { }

  /// SOCHAIN ///
  //========================
  
  private Sochain = this.ControlImports.Sochain;
  
  //========================
  /// END SOCHAIN ///



  


  /// ARCHIVED ///
  //=======================

  //account id
  public account_id = '';

  //sending or receiving
  public direction = '';

  //amount
  public amount = 0;
  
  //memo
  public memo = '';

  //meta
  public meta = {};

  //created
  public created = 0;
  
  //created id
  public created_id = 0;
  
  
  /*
  * @Params:  info
  * @Does:    sets transaction info from existing
  * @Return:  success
  */
  public initExistingTx(info:ArchivedTransactionInfo) {
    let self = this;
    //set account id
    self.account_id = info.account_id;
    //set direction
    self.direction = info.direction;
    //set amount
    self.amount = info.amount;
    //set memo
    self.memo = info.memo;
    //set meta
    self.meta = info.meta;
    //set created
    self.created = info.created || 0;
    //set created id
    self.created_id = info.created_id || 0;
  }
  //end initExistingTx()



  /*
  * @Params:  none
  * @Does:    returns with archived transaction info
  * @Return:  tx_obj
  */
  public getTxObj():ArchivedTransactionInfo{
    let self = this;
    return {
      account_id: self.account_id,
      direction: self.direction,
      txid: self.txid,
      amount: self.amount,
      memo: self.memo,
      meta: self.meta,
      created: self.created,
      created_id: self.created_id,
    }
  }
  //end getTxObj()
  
  //=======================
  /// END ARCHIVED ///







  /// RAW ///
  //========================

  /*
  * @Params:  none
  * @Does:    fetches raw transaction details
  * @Return:  {tx}
  */
  public async getRawTx() {
    let self = this;
    //get transaction info
    let txOp = await self.Sochain.getTransaction(self.txid);
    //got transaction info, set info
    let tx = txOp.data.tx;
    //return with transaction info
    return reply(true, 'got tx', {tx});
  }
  //end getRawTx()
  
  //========================
  /// END RAW ///

}

function reply(s,m,d = {},e = null){return {success:s, message:m, data:d, error:e}}