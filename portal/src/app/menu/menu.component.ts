import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@Component({
  selector: 'menu-component',
  imports: [NzIconModule, NzMenuModule, RouterLink],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent {}
