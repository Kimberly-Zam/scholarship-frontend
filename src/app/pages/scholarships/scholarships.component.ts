import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { CardsComponent } from "../../cards/cards.component";

@Component({
  selector: 'app-scholarships',
  imports: [HeaderComponent, CardsComponent],
  templateUrl: './scholarships.component.html',
  styleUrl: './scholarships.component.scss'
})
export class ScholarshipsComponent {

}
