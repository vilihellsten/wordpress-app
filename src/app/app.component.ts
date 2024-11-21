import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as kysymyksia from "../kysymyksia.json"
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
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
  nappiTeksti2 = "Edellinen kysymys";

  kyselynPiilotus = 0

  kysymysJaVastaukset: string[][] = [] //tallentaa kysymyksen ja vastaukset !!!! kesken, voi muuttua !!!

  vastaukset: string[] = [this.Kysymykset[this.kysymysIndexi].Kysymys]


  onCheckboxChange(event: any, vastaus: string) { // kuuntelee checkboxeja
    if (event.target.checked) {
      console.log(vastaus + " lisätty listaan")
      this.vastaukset.push(vastaus) // checkbox true = lisää vastauksen vastaukset listaan

    } else {
      console.log(vastaus + " poistetu listasta")
      const index = this.vastaukset.indexOf(vastaus);
      this.vastaukset.splice(index, 1) // checkbox false = poistaa vastauksen vastaukset listasta
    }
  }

  seuraavaKysymys() { // napin painalluksesta html käy ngif/for avulla läpi uuden lohkon ja uudet kysymykset kehiin

    this.kysymysJaVastaukset.push(this.vastaukset) // työntää vastauslistan kysymysjavastaukset listaan jota luodaan onCheckboxChange kohdassa

    if (this.kysymysIndexi < this.Kysymykset.length - 1) {
      this.kysymysIndexi++;
    }

    this.vastaukset = [this.Kysymykset[this.kysymysIndexi].Kysymys] // alustaa vastaukset listan uudelle kysymykselle ja vastaukselle

    if (this.nappiTeksti == "Valmis") // piilottaa kyselyn kun nappiteksti on valmis
      this.kyselynPiilotus = 1

    if (this.kysymysIndexi == this.Kysymykset.length - 1) {// kun viimeinen kysymys saapuu, napin teksti muuttuu "valmis" tekstiin
      this.nappiTeksti = "Valmis";
    }
    console.log(this.kysymysJaVastaukset)

  }

  edellinenKysymys() { // napin painalluksesta html käy ngif/for avulla läpi uuden lohkon ja uudet kysymykset kehiin

    if (this.kysymysIndexi != 0) { // laskee kysymysindexiä jotta edelliset kysymykset tulevat esiin
      this.kysymysIndexi--;
    }

    if (this.kysymysIndexi != (this.Kysymykset.length - 1))// kun viimeinen kysymys saapuu, napin teksti muuttuu "valmis" tekstiin
      this.nappiTeksti = "Seuraava Kysymys";

    // tähän väliin voisi tulla, pitää valitut checkboxit chekattuna

    this.kysymysJaVastaukset.splice(this.kysymysIndexi) // poistaa indexin avulla vastaukset listan kysymysJaVastaukset listasta
    this.vastaukset = [this.Kysymykset[this.kysymysIndexi].Kysymys] // alustaa vastaukset listan edelliselle kysymykselle ja vastauksille
    console.log(this.kysymysJaVastaukset)
  }

}
