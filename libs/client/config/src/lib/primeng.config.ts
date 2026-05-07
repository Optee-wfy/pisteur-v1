import type { PrimeNGConfigType } from "primeng/config";
import { PrimeCustomPreset } from "./primeng.preset";

export const PRIME_NG_CONFIG: PrimeNGConfigType = {
  theme: {
    preset: PrimeCustomPreset,
    options: {
      darkModeSelector: false,
      cssLayer: {
        name: "primeng",
        order: "tailwind-base, primeng, tailwind-utilities, override-css",
      },
    },
  },
  overlayAppendTo: "body",
  zIndex: {
    modal: 1100,
    overlay: 1200,
    menu: 1200,
    tooltip: 1300,
  },
  // Other translations available here : https://primeng.org/configuration#api
  translation: {
    dayNames: [
      "Dimanche",
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
    ],
    dayNamesShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    dayNamesMin: ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"],
    monthNames: [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ],
    monthNamesShort: [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Juin",
      "Juil",
      "Aoû",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ],
    today: "Aujourd'hui",
    clear: "Effacer",
    firstDayOfWeek: 1, // La semaine commence le lundi (0 = Dimanche, 1 = Lundi)
    dateFormat: "dd/mm/yy",
  },
};
