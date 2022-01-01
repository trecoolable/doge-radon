import { RadonClientControlsV1Service } from 'projects/controls/radon-client-controls-v1/src/public-api';


export class SendingPageControllerService {

  constructor(private RadonClientControls:RadonClientControlsV1Service) { }

  /// CONTROLS ///
  //=======================
  
  public AccountsControl = this.RadonClientControls.Accounts;
  
  //=======================
  /// END CONTROLS ///





  /// PAGE ///
  //==========================

  //display stage
  public display_stage = 'amount';

  //account id
  public account_id = '';

  //account
  public account_item:any = null;

  
  public async initPage(){
    let self = this;
    //set account item
    self.account_item = await self.AccountsControl.getAccountItem(self.account_id);
  }
  
  
  public resetPage(){
    
  }
  
  //==========================
  /// END PAGE ///
  





  /// AMOUNT ///
  //====================
  
  //amount string
  public amount_string = '0';

  //amount value
  public amount_value = 0;

  public handleAmountInput(input){
    let self = this;
    //check if is backspace
    if(input == '<') {
      //check if is last
      if(self.amount_string.length == 1) {
        //no input
        self.amount_string = '0';
      } else {
        //remove from amount string
        self.amount_string = self.amount_string.substring(0, self.amount_string.length - 1);
      }
    } else if(input == '.') {
      //is period, check if has existing
      if(self.amount_string.indexOf('.') != -1) return;
      //check if is first
      if(self.amount_string.length == 0) return;
      //set period to amount string
      self.amount_string += '.';
    } else {
      //check if is 0 and no input
      if((self.amount_string.length == 0 || !self.amount_string.split('').filter(item => {return (item !== '0')}).length) && input == '0') return;
      //check if has 4 decimals
      if(self.amount_string.indexOf('.') != -1 && self.amount_string.split('.')[1] && self.amount_string.split('.')[1].length >= 4) return;
      //check if amount string is 0
      if(self.amount_string == '0') self.amount_string = '';
      //is number, append number
      self.amount_string += input;
    }
    console.log(self.amount_string)
    //set value
    self.amount_value = parseFloat(self.amount_string);
  }
  
  //====================
  /// END AMOUNT ///





  /// DETAILS ///
  ///========================
  
  //receiving address input
  public receiving_input = {
    value: '',
    message: '',
    changed: '',
    timeout: ''
  }
  
  //memo input
  public memo_input = {
    value: '',
    message: '',
    changed: '',
    timeout: ''
  }
 
  //network fee input
  public fee_input = {
    value: 0,
    message: '',
    changed: '',
    timeout: ''
  }
  
  ///========================
  /// END DETAILS ///





  /// SUBMITTING ///
  //===========================
  
  public async submit(){
    let self = this;
    //send transaction
    let sendOp = await self.account_item.sendTransaction(self.amount_value, self.fee_input.value, self.receiving_input.value);
    console.log(sendOp)
  }


  private createTransaction(){

  }


  private broadcastTransaction(){

  }

  
  private archiveTransaction(){

  }
  
  //===========================
  /// END SUBMITTING ///



}
