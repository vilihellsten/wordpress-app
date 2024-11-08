import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as kysymyksia from "../kysymyksia.json"
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'wordpress-app';
  Kysymykset: any = (kysymyksia as any).default;

  constructor() {
    console.log(this.Kysymykset) // näyttää koko JSON sisällön logissa

    console.log(this.Kysymykset[0]) // näyttää ensimmäinsen lohkon
    console.log(this.Kysymykset[1]) // näyttää toisen lohkon

  }

  kysymysIndexi = 0;  // pitää kirjaa siitä missä kysymys"lohkossa" mennään ja auttaa käymään kysymykset läpi "lohko" kerrallaan
  nappiTeksti = "Seuraava kysymys"; // muuttuu viimeisen kysymyksen kohdalla "seuraavaKysymys()" funktion kohdalla

  vastaukset = [] //tallentaa vastaukset !!!! kesken, voi muuttua !!!

  seuraavaKysymys() { // napin painalluksesta html käy ngif/for avulla läpi uuden lohkon ja uudet kysymykset kehiin

    if (this.kysymysIndexi < this.Kysymykset.length - 1) {
      this.kysymysIndexi++;

      if (this.kysymysIndexi == (this.Kysymykset.length - 1))
        this.nappiTeksti = "Valmis"; // kun viimeinen kysymys saapuu, napin teksti muuttuu "valmis" tekstiin
    }
  }
}
