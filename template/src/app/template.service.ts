import { HttpClient } from '@angular/common/http';
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SharedService, ThemeService } from 'jconsumer-shared';
import * as pako from 'pako';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  cachedTemplate$: any = null;
  renderer: any;

  constructor(
    private sharedService: SharedService,
    private themeService: ThemeService,
    private titleService: Title,
    private http: HttpClient,
    private rendererFactory: RendererFactory2
) {
      this.renderer = rendererFactory.createRenderer(null, null);

}

  setCachedTemplate(template) {
    this.cachedTemplate$ = template;
  }

  getCachedTemplate() {
    return this.cachedTemplate$;
  }
  setIcon(url) {
    let link = document.createElement('link'),
      oldLink = document.getElementById('dynamic-favicon');
    link.id = 'dynamic-favicon';
    link.rel = 'shortcut icon';
    link.href = url;
    if (oldLink) {
      document.head.removeChild(oldLink);
    }
    document.head.appendChild(link);
  }
  loadTemplateJSON() {
    const _this = this;
    console.log(this.sharedService);
    
    return new Promise(function(resolve){
      if (_this.sharedService.getTemplateJSON()) {
        _this.sharedService.setTemplateID(_this.sharedService.getTemplateJSON().template);
        _this.titleService.setTitle(_this.sharedService.getTemplateJSON().header.title);
        if(_this.sharedService.getTemplateJSON().logo) {
          _this.setIcon(_this.sharedService.getTemplateJSON().logo);
        }
        resolve(_this.sharedService.getTemplateJSON().template);
      } else {
        _this.getSiteTemplateJSON().subscribe((templateJsonZip: any) => {
          console.log(templateJsonZip);
          
          let templateJson = JSON.parse(pako.ungzip(templateJsonZip, { to: 'string' }));
          console.log("Template",templateJson);
          _this.titleService.setTitle(templateJson.header.title);
          if(templateJson.logo) {
            _this.setIcon(templateJson.logo);
          }
          if(templateJson.secondaryFont) {
            _this.renderer.setStyle(document.body, 'font-family', templateJson.secondaryFont);
          }
          _this.sharedService.setTemplateJSON(templateJson);
          let themeURL = _this.sharedService.getCDNPath() + `assets/scss/themes/`;
          if(templateJson['theme']) {
            _this.themeService.loadTheme(themeURL, templateJson['theme']);
          }          
          _this.sharedService.setTemplateID(templateJson.template);
          resolve(templateJson.template);
        }, (error)=>{
          console.error("API Error:", error);
          _this.sharedService.setTemplateID('template1');
          _this.sharedService.setTemplateJSON(null);
          resolve(null);
        });
      }
    })    
  }

  // getSiteTemplateJSON() {
  //   const path = this.sharedService.getConfigPath() + this.sharedService.getUniqueID() + '/site_template.gz?t=' + new Date();
  //   return this.serviceMeta.httpGet(path, { responseType: 'arraybuffer' });
  // }

  // getAccountConfig() {
  //   const path = this.sharedService.getConfigPath() + this.sharedService.getUniqueID() + '/account_config.json?t=' + new Date();
  //   return this.serviceMeta.httpGet(path)
  // }

  getSiteTemplateJSON() {
    console.log(this.sharedService);
    console.log(this.sharedService.getConfigPath());
    console.log(this.sharedService.getUniqueID());
    
    const path = this.sharedService.getConfigPath() + this.sharedService.getUniqueID() + '/site_template.gz?t=' + new Date();
    return this.http.get(path, { responseType: 'arraybuffer' });
  }

  
  getAccountConfig() {
    const path = this.sharedService.getConfigPath() + this.sharedService.getUniqueID() + '/account_config.gz?t=' + new Date();
    return this.http.get(path, { responseType: 'arraybuffer' });
  }

}
