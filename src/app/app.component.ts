import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  title = 'wordpress-app';

  Kysymykset: any;
  kysymysIndexi = 0;
  seuraava = "Seuraava kysymys";
  edellinen = "Edellinen kysymys";
  kyselynPiilotus = 0;
  isLoading = true;
  kysymysJaVastaukset: string[][] = [];
  vastaukset: string[] = [];
  aiVastaus: string[] = [];

  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    this.fetchKysymykset();
  }
  // Hakee kysymykset json tiedostosta
  fetchKysymykset() {
    const timestamp = new Date().getTime();
    this.http.get<any>(`http://localhost/test_project/browser/kysymyksia.json?timestamp=${timestamp}`).subscribe(data => {
      this.Kysymykset = data;
      this.vastaukset = [this.Kysymykset[this.kysymysIndexi].Kysymys];
      console.log(this.Kysymykset);
    });
  }

  // Tämä funktio generoi pdf tiedoston kyselystä
  generatePDF() {
    const elementToPrint: any = document.getElementById('content');

    html2canvas(elementToPrint, { scale: 2 }).then((canvas) => {
      const pdf = new jsPDF();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 211, 298);

      pdf.save('kysely.pdf');
    });
  }

  // Tällä funktiolla saadaan checkboxin valinta tallennettua tai poistettua vastauksiin
  onCheckboxChange(event: any, vastaus: string) {
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

      console.log(vastaus + " lisätty listaan") // checkbox true = lisää vastauksen vastaukset listaan
      this.vastaukset.push(vastaus)
      this.kysymysJaVastaukset[this.kysymysIndexi] = [...this.vastaukset];

    } else {
      console.log(vastaus + " poistetu listasta") // checkbox false = poistaa vastauksen vastaukset listasta
      const index = this.vastaukset.indexOf(vastaus);
      this.vastaukset.splice(index, 1)
    }
  }

  seuraavaKysymys() {
    this.kysymysJaVastaukset[this.kysymysIndexi] = [...this.vastaukset]; // Tallentaa tiedot kysymysJaVastaukset-rakenteeseen ennen kuin siirtyy seuraavaan kysymykseen

    if (this.kysymysIndexi < this.Kysymykset.length - 1) { //kasvattaa kysymysindexiä jotta seuraavat kysymykset tulevat esiin
      this.kysymysIndexi++;
    }
    if (this.seuraava == "Valmis") { // Jos nappia painetaan kun teksti on Valmis, piilottaa kyselyn ja näyttää Ai vastauksen
      this.kyselynPiilotus = 1
      this.vastaus(); // Kutsu Ai vastauksen hakufunktioon
    }
    if (this.kysymysIndexi == this.Kysymykset.length - 1) {// Viimeisen kysymyksen kohdalla muuttaa napin "valmis" tekstiksi
      this.seuraava = "Valmis";
    }
    console.log(this.kysymysJaVastaukset)
    this.vastaukset = this.kysymysJaVastaukset[this.kysymysIndexi] || [];
  }

  edellinenKysymys() {
    if (this.kysymysIndexi != 0) { // laskee kysymysindexiä jotta edelliset kysymykset tulevat esiin
      this.kysymysIndexi--;
    }
    if (this.kysymysIndexi != (this.Kysymykset.length - 1)) {// Kun siirrytään pois viimeisestä kysymyksestä muuttaa napin "valmis" tekstiksi "seuraava kysymys"
      this.seuraava = "Seuraava kysymys";
    }
    this.vastaukset = this.kysymysJaVastaukset[this.kysymysIndexi] || []; //Hakee vastaukset kysymysJaVastaukset-rakenteesta ja asettaa ne aktiiviseksi
    console.log(this.kysymysJaVastaukset)
  }

  // Tämä funktio hakee vastauksen google generative AI:sta
  async vastaus() {
    const maxAttempts = 5;
    let attempt = 0;
    let success = false;

    // Yritetään hakea vastausta viisi kertaa ennen kuin luovutetaan, aina vastauksen saanti ei onnistu ensimmäisellä kerralla
    while (attempt < maxAttempts && !success) {

      const genAI = new GoogleGenerativeAI("AIzaSyDiBGfjOGyHce_PMShiZyVX7Gqou83Tnuc");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = this.Kysymykset + "Tässä on lista tietoturvakysymyksiä ja niiden vastausvaihtoehtoja," + this.kysymysJaVastaukset + " ja tässä listassa on käyttäjän antamia vastauksia näihin kysymyksiin. Arvioi käyttäjän vastauksia kyselyn vastausvaihtoehtoihin tietoturvan näkökulmasta, vastaus tulee <div></div> väliin joten käytä html koodia joka sopiin divin väliin ja näytä kysymykset ja vastaukset allekkain, vastaus ja arvio <ul>sisällä, loput <li> sisällä ja otsikko <h1> tagin sisällä ja väliotsikot <h3> tagin sisällä. anna jokaiselle vastaukselle arvio ja raportin alkuun kattava yhteenveto";

      try {
        const pdfResp = await fetch('/Tietoturvaopas.pdf'); // Hakee pdf tiedoston
        if (!pdfResp.ok) {
          throw new Error('Network response was not ok');
        }
        const arrayBuffer = await pdfResp.arrayBuffer();
        // Convert ArrayBuffer to base64
        const base64String = this.arrayBufferToBase64(arrayBuffer);

        const result = await model.generateContent([ // Ai:n vastaus tulee result muuttujaan
          {
            inlineData: { // Tässä lähetetään pdf tiedosto Ai:lle
              data: base64String,
              mimeType: "application/pdf",
            },
          },
          'Lue tietoturvaopas ja seuraavissa vastauksissasi käytä sitä apuna. ' + prompt, // Tässä lähetetään ohjeet Ai:lle
        ]);

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
        success = true; // jos vastaus saadaan Ai:lta merkitään se onnistuneeksi

      }
      catch (error) {
        console.error("Errori:", error);
        attempt++;
        if (attempt < maxAttempts) {
          console.log(`Yritetään uudelleen (${attempt}/${maxAttempts})...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // odotetaan kaksi sekunttia ennen uutta yritystä
        } else {
          console.error("Kaikki yritykset epäonnistuivat.");
        }
      }
    }
  }

  // tarvitaan pdf lähetyksessä
  arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary); // Convert binary string to base64
  }
}

