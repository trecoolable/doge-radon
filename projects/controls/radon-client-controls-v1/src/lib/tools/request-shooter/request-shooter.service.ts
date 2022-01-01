import axios from "axios";
import { BehaviorSubject, Subject } from "rxjs";

export class RequestShooterService {

  constructor(public base_url, public shooter_options) { }
  
  
  
  /// HEADERS ///
  //==============================
  
  //headers array
  private headers:{key: string, value: string}[] = [];
  
  
  /*
  * @Params:  key, value
  * @Does:    checks if header exists
  *           if has header, sets new value
  *           if no header, adds header and value
  */
  public setHeader(key, value) {
    let model = this;
    //get header index
    let idx = model.headers.map(item => {return item.key}).indexOf(key);
    //check if has index
    if(idx != -1) {
      //has header, update value
      model.headers[idx].value = value;
    } else {
      //no header, add header
      model.headers.push({key: key, value: value});
    }
  }
  //end setHeader()
  
  
  
  /*
  * @Params:  key
  * @Does:    checks if has header
  *           if has header, splices header
  *           if no header, returns
  */
  public unsetHeader(key) {
    let model = this;
    //get header index
    let idx = model.headers.map(item => {return item.key}).indexOf(key);
    //check if has header
    if(idx == -1) return;
    //has header, remove header
    model.headers.splice(idx, 1);
  }
  //end unsetHeader()
  
  
  
  /*
  * @Params:  key
  * @Does:    gets header value
  * @Return:  value
  */
  public getHeader(key){
    let model = this;
    //get index of key
    let idx = model.headers.map(item => {return item.key}).indexOf(key);
    //check if has header
    if(idx == -1) return null;
    //return value
    return model.headers[idx].value;
  }
  //end getHeader()
  
  //==============================
  /// END HEADERS ///
  
  
  
  
  
  
  
  
  /// LOCAL STORAGE ///
  //==============================
  
  /*
  * @Params:  key, value
  * @Does:    sets local storage item
  */
  public setLocalStorage(key, value){
    //set local storage
    localStorage.setItem('_anj_agent_' + key, value);
  }
  //end setLocalStorage()
  
  
  
  /*
  * @Params:  key
  * @Does:    unsets local storage item
  */
  public unsetLocalStorage(key){
    //unset item
    localStorage.removeItem('_anj_agent_' + key);
  }
  //end unsetLocalStorage()
  
  
  
  /*
  * @Params:  key
  * @Does:    gets storage item
  *           if no value, returns null
  *           if has value, returns value
  * @Return:  value
  */
  public getLocalStorage(key){
    //get item
    let value = localStorage.getItem('_anj_agent_' + key);
    //return value
    return (value != undefined) ? value : null;
  }
  //end getLocalStorage()
  
  //==============================
  /// END LOCAL STORAGE ///
  
  
  
  
  
  
  
  
  /// REQUESTS ///
  //==============================
  
  //content type
  // private content_type = this.shooter_options.content_type || 'multipart/form-data';
  private content_type = this.shooter_options.content_type || 'application/json';
  
  //shooter status
  private shooter_status = '';
  
  //request store
  private requests_store:{signature:string, subject:BehaviorSubject<any>, added:number, waiting:number}[] = [];
  
  
  /*
  * @Params:  path, load
  * @Does:    sends post request with load
  * @Return:  success, message, data
  */
  public post(path, load:any = {}, files:any = []):any {
    let model = this;
    return new Promise(resolve => {
      try {
        //set blank headers
        let headers = {};
        //iterate to set headers
        for(let i = 0; i < model.headers.length; i++){
          //set header
          headers[model.headers[i].key] = model.headers[i].value;
        }
        //set form data
        let form_data = new FormData();
        //set blank body
        let json_body = {};
        //set load keys
        let keys = Object.keys(load);
        //iterate through load
        for(let i = 0; i < keys.length; i++) {
          //set key
          let key = keys[i];
          //set json body field
          json_body[key] = load[key];
        }
        //append json data
        // form_data.append('json_body', JSON.stringify(json_body));
        //iterate through files to append files
        for(let i = 0; i < files.length; i++){
          //append file
          form_data.append('files', files[i]);
        }
        //set options
        let options: any = {
          method: 'post',
          url: model.base_url + path,
          data: json_body,
          headers: {
            'Content-Type': model.content_type,
            ...headers
          }
        };
        //make post
        axios.request(options)
          .then(response => {
            //return with response
            return resolve(response.data);
          }, error => {
            //return with request error
            return resolve(reply(false, 'request error'));
          });
      } catch(error) {
        return resolve(reply(false,'request error'));
      }
    });
  }
  //end post()
  
  
  
  /*
  * @Params:  path, load
  * @Does:    sends get request with query params
  * @Return:  success, message, data
  */
  public get(path, load: any = {}, resend = true):any {
    let model = this;
    let ongoing:any = null;
    return new Promise(async resolve => {
      try {
        //check if shooter status is busy
        if(model.shooter_status == 'busy') await wait(1000);
        //set blank headers
        let headers = {};
        //iterate to set headers
        for(let i = 0; i < model.headers.length; i++) {
          //set header
          headers[model.headers[i].key] = model.headers[i].value; 
        }
        //set options
        let options: any = {
          method: 'get',
          url: model.base_url + path,
          params: load,
          headers: {
            'Content-Type': model.content_type,
            ...headers
          }
        };
        //set signature
        let signature = path + JSON.stringify(load) + (Math.floor(Date.now() / 3500));
        //check if has previous
        let prev = await model.checkPreviousRequest(signature);
        //check has previous, return with reply
        if(prev != null) return resolve(prev);
        //add ongoing
        ongoing = model.addOngoingRequest(signature);
        //make get
        axios.request(options)
          .then(response => {
            //update ongoing request
            ongoing.subject.next(response.data);
            //return with data
            return resolve(response.data);
          }, async error => {
            //check if is 403
            if(error.message.indexOf('403') && resend) {
              //check if has refresh id
              if(model.refresh_id) {
                //await for refresh to complete
                await model.waitForRefresh(model.refresh_id);
              } else {
                //no refresh, set refresh id
                model.refresh_id = Date.now() + '';
                //set busy
                model.shooter_status = 'busy';
                //handle 403
                let refreshOp:any = await model.handle403();
                //unset busy
                model.shooter_status = '';
                //check if success
                if(!refreshOp.success) {
                  if(ongoing) ongoing.subject.next(reply(false, 'request error'));
                  return resolve(reply(false, 'request error'));
                }
                //update refresh subject
                model.refresh_subject.next(model.refresh_id);
                //unset refresh id
                model.refresh_id = '';
              }
              //403 error, resend
              let refreshedOp = await model.get(path, load, false);
              //got reply, update request item
              ongoing.subject.next(refreshedOp);
              //resolve with refreshed
              return resolve(refreshedOp);
            }
            //got reply, update request item
            ongoing.subject.next(reply(false, 'request error'));
            //return with request error
            return resolve(reply(false, 'request error'));
          });
      } catch(error) {
        //got error, update request item
        if(ongoing) ongoing.subject.next(reply(false, 'request error'));
        return resolve(reply(false, 'request error'));
      }
    });
  }
  //end get()
  
  
  
  /*
  * @Params:  signature
  * @Does:    checks if has previous request waiting for a response
  *           if no request, returns null
  *           if has request, subscribes to request subject to return when previous request has been made
  */
  private checkPreviousRequest(signature){
    let model = this;
    return new Promise(async resolve => {
      await wait(Math.floor(Math.random() * (25 - 2 + 1) + 2));
      //get index of previous
      let idx = model.requests_store.map(item => {return item.signature}).indexOf(signature);
      //check if has previous
      if(idx == -1) {
        //return null
        return resolve(null);
      }
      //has previous set prev
      let prev = model.requests_store[idx];
      //check if has reply
      if(prev.subject.value != null) return resolve(prev.subject.value);
      //increase waiting count
      prev.waiting++;
      //subscribe to subject
      prev.subject.subscribe(async (event:any) => {
        //decrement waiting
        prev.waiting--;
        //check if has listening
        if(prev.waiting <= 0) {
          //get index of previous
          idx = model.requests_store.map(item => {return item.signature}).indexOf(signature);
          //splice none waiting
          model.requests_store.splice(idx, 1);
        }
        //return with reply
        return resolve(event);
      });
    });
  }
  //end checkPreviousRequests()
  
  
  
  private addOngoingRequest(signature){
    let model = this;
    //remove previous
    model.requests_store = model.requests_store.filter(item => { return (item.added > (Date.now() - 5000))});
    //create prev
    let prev = {
      signature: signature,
      subject: new BehaviorSubject(null),
      added: Date.now(),
      waiting: 0
    }
    //add event
    model.requests_store.push(prev);
    //return with prev
    return prev;
  }
  
  
  
  
  
  //==============================
  /// END REQUESTS ///
  
  
  
  
  
  /// REFRESHING ///
  //===========================
  
  //refresh id
  private refresh_id = '';
  
  //refresh subject
  private refresh_subject:Subject<string> = new Subject();
  
  /*
  * @Params:  none
  * @Does:    handles 403 access denied
  */
  public handle403 = async () => {};
  
  
  /*
  * @Params:  id
  * @Does:    adds subscription to referesh subject
  *           resolves when refresh subject has been updated with id
  */
  private waitForRefresh(id){
    let model = this;
    return new Promise(resolve => {
      //subscribe to refresh id
      let sub = model.refresh_subject.subscribe(refresh_id => {
        //check if id is same
        if(refresh_id == id) {
          //unsubscribe
          sub.unsubscribe();
          //resolve 
          return resolve(true);
        }
      });
      //set timeout to unsubscribe
      setTimeout(() => {
        //unsubscribe
        sub.unsubscribe();
      }, 15000);
    });
  }
  //end waitForRefresh()
  
  
  
  //===========================
  /// END REFRESHING ///
  
}


function reply(s,m,d = {},e = null){ return {success:s, message:m, data:d, error:e}}

function wait(d){
  return new Promise(resolve => {
    setTimeout(() => {
      return resolve(true);
    }, d);
  });
}