# WordpressApp

Security Questionnaire for a website / Kyberturvakysely nettisivulle

Projekti luo kyberturvakyselyn JSON-tiedoston pohjalta ja lähettää Gemini AI:lle Tietoturvaopas.pdf tiedoston sekä palauttaa loppuraportin kyselystä käyttäjälle.

Repositorio sisältää esimerkki kysymyksia.JSON-tiedoston sekä Tietoturvaoppaan. JSON-tiedoston muotoilun täytyy pysyä samana kuin esimerkissä.

Projektiin koodiin täytyy lisätä Google gemini oma API-avain, määrittää kysymyksia.JSON-tiedoston sekä Tietoturvaopas.pdf sijainnin polku.

Google gemini API-avain sekä Tietoturvaopas.pdf polku täytyy laittaa "vastaus" funktioon, kysymykset.JSON-tiedoston polku fetchKysymykset funktioon.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.8.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
