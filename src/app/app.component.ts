import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as kysymyksia from "../kysymyksia.json"
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleGenerativeAI } from "@google/generative-ai";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
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

  kyselynPiilotus = 0;

  isLoading = true;

  kysymysJaVastaukset: string[][] = []; //tallentaa kysymyksen ja vastaukset !!!! kesken, voi muuttua !!!

  vastaukset: string[] = [this.Kysymykset[this.kysymysIndexi].Kysymys] //alustaa sivun avauksen alussa vastaukset listan sisältämään ensimmäisen kysymyksen

  aiVastaus: string[] = [];


  onCheckboxChange(event: any, vastaus: string) { // kuuntelee checkboxien eventtejä
    if (event.target.checked) {

      if (!this.vastaukset.includes(this.Kysymykset[this.kysymysIndexi].Kysymys))
        this.vastaukset.unshift(this.Kysymykset[this.kysymysIndexi].Kysymys) // unshift asettaa arrayn ensimmäiseksi stringiksi tämänhetkisen kysymyksen

      if (this.Kysymykset[this.kysymysIndexi].Monivalinta == "Ei") { // jos kysymyksen tyyppi ei ole monivalinta
        this.vastaukset = [this.Kysymykset[this.kysymysIndexi].Kysymys]
        this.vastaukset.push(vastaus)
        console.log("vanha vastaus poistettu listasta ja " + vastaus + " lisätty listaan")

        this.kysymysJaVastaukset[this.kysymysIndexi] = [...this.vastaukset]; // tämä tallentaa vastauksen listaan vaikka "seuraavaa" tai "valmis" nappia ei olla painettu
        return
      }

      console.log(vastaus + " lisätty listaan")
      this.vastaukset.push(vastaus) // checkbox true = lisää vastauksen vastaukset listaan
      this.kysymysJaVastaukset[this.kysymysIndexi] = [...this.vastaukset];

    } else {
      console.log(vastaus + " poistetu listasta")
      const index = this.vastaukset.indexOf(vastaus);
      this.vastaukset.splice(index, 1) // checkbox false = poistaa vastauksen vastaukset listasta
    }
  }

  seuraavaKysymys() { // napin painalluksesta html käy ngif/for avulla läpi uuden lohkon ja uudet kysymykset kehiin

    if (!this.vastaukset.includes(this.Kysymykset[this.kysymysIndexi].Kysymys)) //jos vastaukset ei sisällä kysymystä, siirtää vastaukset listan alkuun kysymyksen
      this.vastaukset.unshift(this.Kysymykset[this.kysymysIndexi].Kysymys)

    this.kysymysJaVastaukset[this.kysymysIndexi] = [...this.vastaukset]; // Tallentaa tiedot kysymysJaVastaukset-rakenteeseen ennen kuin siirtyy seuraavaan kysymykseen


    if (this.kysymysIndexi < this.Kysymykset.length - 1) {
      this.kysymysIndexi++;
    }

    if (this.nappiTeksti == "Valmis") { // piilottaa kyselyn kun nappiteksti on valmis
      this.kyselynPiilotus = 1

      this.vastaus();
    }

    if (this.kysymysIndexi == this.Kysymykset.length - 1) {// kun viimeinen kysymys saapuu, napin teksti muuttuu "valmis" tekstiin
      this.nappiTeksti = "Valmis";
    }
    console.log(this.kysymysJaVastaukset)

    this.vastaukset = this.kysymysJaVastaukset[this.kysymysIndexi] || []; //Hakee vastaukset kysymysJaVastaukset-rakenteesta ja asettaa ne aktiiviseksi

  }

  async vastaus() {
    const maxAttempts = 5;
    let attempt = 0;
    let success = false;

    while (attempt < maxAttempts && !success) {

      const genAI = new GoogleGenerativeAI("AIzaSyDiBGfjOGyHce_PMShiZyVX7Gqou83Tnuc");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = this.Kysymykset + "Tässä on lista tietoturvakysymyksiä ja niiden vastausmahdollisuuksia," + this.kysymysJaVastaukset + " ja tässä listassa on käyttäjän antamia vastauksia näihin kysymyksiin. Anna arvio vastauksiin tietoturva-asiantuntijan näkökulmasta, vastaus tulee <div></div> väliin joten käytä html koodia joka sopiin divin väliin ja näytä kysymykset ja vastaukset allekkain <ul> <li> sisällä ja otsikko <h1> tagin sisällä. anna jokaiselle vastaukselle arvio ja aivan lopuksi yhteenveto";

      try {

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        if (responseText.startsWith("```html")) {
          responseText = responseText.slice(7);
        }
        if (responseText.endsWith("```\n")) {
          responseText = responseText.slice(0, -5);
        }
        this.isLoading = false;
        this.aiVastaus = responseText.split("<div></div>"); // jakaa vastauksen div tagin kohdalta kahtia

        console.log(result.response.text());
        success = true; // jos vastaus saadaan merkitään se onnistuneeksi

      } catch (error) {
        attempt++;
        console.error("Errori:", error);
        if (attempt < maxAttempts) {
          console.log(`Yritetään uudelleen (${attempt}/${maxAttempts})...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // odotetaan kaksi sekunttia ennen uutta yritystä
        } else {
          console.error("Kaikki yritykset epäonnistuivat.");
        }
      }
    }
  }

  edellinenKysymys() { // napin painalluksesta html käy ngif/for avulla läpi uuden lohkon ja uudet kysymykset kehiin

    if (this.kysymysIndexi != 0) { // laskee kysymysindexiä jotta edelliset kysymykset tulevat esiin
      this.kysymysIndexi--;
    }

    if (this.kysymysIndexi != (this.Kysymykset.length - 1)) {// kun viimeinen kysymys saapuu, napin teksti muuttuu "valmis" tekstiin
      this.nappiTeksti = "Seuraava Kysymys";
    }

    this.vastaukset = this.kysymysJaVastaukset[this.kysymysIndexi] || []; //Hakee vastaukset kysymysJaVastaukset-rakenteesta ja asettaa ne aktiiviseksi

    console.log(this.kysymysJaVastaukset)

  }

}
