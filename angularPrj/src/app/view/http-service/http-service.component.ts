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

  getUrl = 'http://1.15.109.169:9950/posts';

  getHttp() {
    //需要修改服务端Access-Control-Allow-Origin  *
    //且去掉过滤器index.ts中httpInterceptorProviders
    console.log(this.getUrl);
    this.http.get(this.getUrl)
    .subscribe(
       
    res=>{ this.anyList = res;
      this.mRes=res;  })
  }
  
  showRes() {
    
  console.log(this.mRes);
  }
  
}
