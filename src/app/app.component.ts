import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
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
  nappiTeksti = "Seuraava kysymys";
  nappiTeksti2 = "Edellinen kysymys";
  kyselynPiilotus = 0;
  isLoading = true;
  kysymysJaVastaukset: string[][] = [];
  vastaukset: string[] = [];
  aiVastaus: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchKysymykset();
  }

  fetchKysymykset() {
    this.http.get<any>('http://localhost/kysymyksia.json').subscribe(data => {
      this.Kysymykset = data;
      this.vastaukset = [this.Kysymykset[this.kysymysIndexi].Kysymys];
      console.log(this.Kysymykset);
      console.log(this.Kysymykset[0]);
      console.log(this.Kysymykset[1]);
    });
  }

  generatePDF() {
    const elementToPrint: any = document.getElementById('content');
    html2canvas(elementToPrint, { scale: 2 }).then((canvas) => {
      const pdf = new jsPDF();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 211, 298);
      pdf.save('kysely.pdf');
    });
  }

  onCheckboxChange(event: any, vastaus: string) {
    if (event.target.checked) {
      if (!this.vastaukset.includes(this.Kysymykset[this.kysymysIndexi].Kysymys))
        this.vastaukset.unshift(this.Kysymykset[this.kysymysIndexi].Kysymys);

      if (this.Kysymykset[this.kysymysIndexi].Monivalinta == "Ei") {
        this.vastaukset = [this.Kysymykset[this.kysymysIndexi].Kysymys];
        this.vastaukset.push(vastaus);
        console.log("vanha vastaus poistettu listasta ja " + vastaus + " lisätty listaan");
        this.kysymysJaVastaukset[this.kysymysIndexi] = [...this.vastaukset];
        return;
      }

      console.log(vastaus + " lisätty listaan");
      this.vastaukset.push(vastaus);
      this.kysymysJaVastaukset[this.kysymysIndexi] = [...this.vastaukset];
    } else {
      console.log(vastaus + " poistettu listasta");
      const index = this.vastaukset.indexOf(vastaus);
      this.vastaukset.splice(index, 1);
    }
  }

  seuraavaKysymys() {
    if (!this.vastaukset.includes(this.Kysymykset[this.kysymysIndexi].Kysymys))
      this.vastaukset.unshift(this.Kysymykset[this.kysymysIndexi].Kysymys);

    this.kysymysJaVastaukset[this.kysymysIndexi] = [...this.vastaukset];

    if (this.kysymysIndexi < this.Kysymykset.length - 1) {
      this.kysymysIndexi++;
    }

    if (this.nappiTeksti == "Valmis") {
      this.kyselynPiilotus = 1;
      this.vastaus();
    }

    if (this.kysymysIndexi == this.Kysymykset.length - 1) {
      this.nappiTeksti = "Valmis";
    }
    console.log(this.kysymysJaVastaukset);
    this.vastaukset = this.kysymysJaVastaukset[this.kysymysIndexi] || [];
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
        this.aiVastaus = responseText.split("<div></div>");
        console.log(result.response.text());
        success = true;
      } catch (error) {
        attempt++;
        console.error("Errori:", error);
        if (attempt < maxAttempts) {
          console.log(`Yritetään uudelleen (${attempt}/${maxAttempts})...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.error("Kaikki yritykset epäonnistuivat.");
        }
      }
    }
  }

  edellinenKysymys() {
    if (this.kysymysIndexi != 0) {
      this.kysymysIndexi--;
    }

    if (this.kysymysIndexi != (this.Kysymykset.length - 1)) {
      this.nappiTeksti = "Seuraava Kysymys";
    }

    this.vastaukset = this.kysymysJaVastaukset[this.kysymysIndexi] || [];
    console.log(this.kysymysJaVastaukset);
  }
}
