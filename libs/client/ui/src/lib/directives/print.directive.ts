import { Directive, input } from "@angular/core";

@Directive({
  selector: "[ouiPrint]",
  host: {
    "(click)": "print()",
  },
})
export class PrintDirective {
  /**
   * Nom de l'attribut/ID de la section à imprimer.
   * Ex: <div id="sectionA"> ... </div>, vous passerez 'sectionA' à [appPrint].
   */
  readonly printSectionId = input.required<string>();

  readonly printTitle = input<string>("impression");

  print() {
    if (!this.printSectionId()) {
      console.error(
        "Aucun ID de section à imprimer (printSectionId) n’est fourni.",
      );
      return;
    }

    const printContents = document.getElementById(
      this.printSectionId(),
    )?.innerHTML;
    if (!printContents) {
      console.error(
        `Impossible de trouver l'élément avec l'ID: ${this.printSectionId}`,
      );
      return;
    }

    // Ouvre une nouvelle fenêtre (ou onglet) pour l'impression
    const popupWindow = window.open(
      "",
      "_blank",
      "top=0,left=0,height=100%,width=auto",
    );
    if (!popupWindow) {
      console.error("Impossible d’ouvrir la fenêtre de dialogue d’impression.");
      return;
    }

    // Récupère les <link rel="stylesheet"> et <style> présents dans le head du document actuel
    const styleTags = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style'),
    )
      .map((node) => node.outerHTML)
      .join("\n");

    // Injecte le contenu HTML et lance l'impression
    popupWindow.document.open();
    popupWindow.document.write(`
      <html>
        <head>
          <title>${this.printTitle()}</title>
          <style>
            /* Vous pouvez placer vos styles pour l'impression ici */
            ${styleTags}
          </style>
        </head>
        <body onload="window.print();window.close()">
          ${printContents}
        </body>
      </html>
    `);
    popupWindow.document.close();
  }
}
