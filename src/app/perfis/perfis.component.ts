import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-perfis',
  imports: [MatIconModule, MatToolbarModule, MatSidenavModule],
  templateUrl: './perfis.component.html',
  styleUrl: './perfis.component.css'
})
export class PerfisComponent {

}
