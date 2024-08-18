import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http"

@Component({
  selector: 'app-http-service',
  templateUrl: './http-service.component.html',
  styleUrls: ['./http-service.component.css']
})
export class HttpServiceComponent implements OnInit {

  constructor(private http:HttpClient) { }
  public anyList:any
  public mRes:any
  ngOnInit(): void {
    console.log(this.mRes);
  }
  values='';
  
  getUrl = 'api/posts';
  #geDatatUrl = 'api/orders';
  geDatatUrl = 'getTxt';
  finalRes:string=''
  prefix='http://139.196.82.84:8888'
  content= ''

  /*
  onKey(event: KeyboardEvent) {
    this.values += (<HTMLInputElement>event.target).value + ' | ';
  }
  */

  onKey(event: KeyboardEvent) {
    this.values = (<HTMLInputElement>event.target).value;
  }

  getHttp() {
    //需要修改服务端Access-Control-Allow-Origin  *
    //且去掉过滤器index.ts中httpInterceptorProviders
    console.log(this.values);
    this.http.get(this.values)
    .subscribe(
    res=>{ this.anyList = res;
      this.mRes=res;  })
  }

  getContent() {
    //需要修改服务端Access-Control-Allow-Origin  *
    //且去掉过滤器index.ts中httpInterceptorProviders
    this.content=this.prefix + this.values
    console.log(this.content);
    this.http.get(this.content)
    .subscribe(
    res=>{ this.anyList = res;
      this.mRes=res;  })
  }

  getDataBaseInfo() {
    console.log(this.geDatatUrl);
    this.http.get(this.geDatatUrl)
    .subscribe(
       
    res=>{ this.anyList = res;
      this.mRes=res;  })
  }
  
  showRes() {  
    console.log(this.mRes);
    //this.finalRes=this.mRes
    this.finalRes=JSON.stringify(this.mRes)
  }
  
}
