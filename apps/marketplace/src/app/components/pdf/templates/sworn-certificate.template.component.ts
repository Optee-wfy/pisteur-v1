import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { CEELAB_ADDRESS } from "@optee/constants";
import { z } from "zod";
import { accountSchema, locationSchema } from "../common-schemas";

export const SwornCertificateSchema = z.object({
  account: accountSchema.extend({ siret: z.string() }),
  location: locationSchema,
  financier: z.object({ name: z.string(), siret: z.string() }),
  pro: z.object({ name: z.string() }),
  signatoryFirstName: z.string(),
  signatoryLastName: z.string(),
});

export const isSwornCertificateData = (
  data: unknown,
): data is z.infer<typeof SwornCertificateSchema> =>
  !!data && SwornCertificateSchema.safeParse(data).success;

@Component({
  selector: "mkp-sworn-certificate-template",
  host: { class: "text-xs" },
  template: `
    <!-- PDF-PAGE 1 -->
    <div class="pdf-page p-8 px-12">
      <header
        class="mb-4 flex flex-col gap-4 border border-black bg-gray-100 p-2"
      >
        <p class="text-center text-base font-bold">
          CERTIFICATS D’ECONOMIES D’ENERGIE
          <br />
          Attestation sur l’honneur
        </p>

        <p>
          Document à compléter de façon lisible et de préférence en majuscules.
          Les champs précédés d’un astérisque (*) sont obligatoires. Cette
          Attestation sur l’honneur est à compléter une fois les opérations
          d’économies d’énergie achevées.
        </p>

        <p>
          Raison sociale du Demandeur : {{ data().financier.name }}
          <br />
          Numéro SIREN du Demandeur : {{ data().financier.siret.slice(0, 9) }}
        </p>
      </header>

      <p class="mb-4">
        A.
        <strong>FICHE CEE : Mise en place</strong>
        ………………………………
        <br />
        B. ……………………………………………………………………………………………………………..
      </p>

      <p class="mb-4">
        *Date d’engagement de l'opération (ex : date d’acceptation du devis) :
        …..........................
        <br />
        Date de preuve de réalisation de l’opération (ex : date de la facture) :
        ….........................
        <br />
        Référence de la facture : ….........................
        <br />
        *Pour les personnes morales, nom du site des travaux ou nom de la
        copropriété : {{ data().pro.name }}.
        <br />
        *Adresse des travaux : {{ data().location.name }}
      </p>

      <p class="mb-4">
        Complément d’adresse :
        <br />
        *Code postal : {{ data().location.zipcode }}
        <br />
        *Ville : {{ data().location.city }}
      </p>

      <p class="mb-4">
        *Bâtiment résidentiel existant depuis plus de 2 ans à la date
        d'engagement de l'opération : □ OUI □ NON
      </p>

      <p class="mb-4">
        *L’opération est réalisée sur un réseau hydraulique de chauffage ou
        d’eau chaude sanitaire existant :
        <br />
        - depuis plus de 2 ans à la date d'engagement de l'opération : □ Oui □
        Non
        <br />
        - non isolé : □ Oui □ Non
        <br />
        - dont l’isolation en place est de classe inférieure ou égale à 2 : □
        Oui □ Non
      </p>

      <p class="mb-4">
        *L’installation de chauffage collectif ou de production d’eau chaude
        sanitaire a été remplacée après le 01/01/2018 : □ Oui □ Non
      </p>

      <p class="mb-4">
        *Longueur isolée de réseau de chauffage ou d’eau chaude sanitaire situé
        hors du volume chauffé (m) : ….........................
      </p>

      <p class="mb-4">
        Nota – Le volume chauffé est défini au fascicule 1 des règles Th-U
        utilisées dans la méthode de calcul Th-C-E ex prévue par l’arrêté du 13
        juin 2008 relatif à la performance énergétique des bâtiments existants
        de surface supérieure à 1000 mètres carrés, lorsqu’ils font l’objet de
        travaux de rénovation importants et approuvée par l’arrêté du 8 août
        2008. Un volume disposant d'un émetteur de chauffage est également
        considéré comme chauffé.
      </p>

      <p class="mb-4">
        Exemples de volumes chauffés, sans émetteur de chauffage :
        rez-de-chaussée avec sas à l'entrée du bâtiment, palier d'étage
        cloisonné par rapport à un RDC, faux-plafonds, gaine palière, gaine à
        l'intérieur d'un local chauffé... Exemples de volumes non chauffés :
        rez-de-chaussée sans sas à l'entrée du bâtiment, palier d'étage non
        cloisonné par rapport à un RDC sans sas à l'entrée du bâtiment, parking
        souterrain, galerie technique en sous-sol, caves...
      </p>

      <p class="mb-4 bg-yellow-400">
        Caractéristiques de l’isolant mis en place :
        <br />
        *Marque : ….........................
        <br />
        *Référence : ….........................
        <br />
        *Épaisseur : …………………..
        <br />
        *Classe de l’isolant selon la norme NF EN 12 828 + A1:2014 :…………………….
      </p>

      <p class="page-number mb-4">1/4</p>
    </div>

    <!-- PDF-PAGE 2 -->
    <div class="pdf-page p-8">
      <p class="mb-2 font-bold">
        B. Bénéficiaire de l'opération d'économies d'énergie
      </p>

      <p class="mb-2">
        (*) Nom et prénom du signataire
        {{ data().signatoryLastName }} {{ data().signatoryLastName }}
      </p>

      <p class="mb-2">
        (*) Pour les bénéficiaires personnes morales, préciser :
      </p>

      <p class="mb-2">
        (*) Raison sociale du bénéficiaire : {{ data().account.name }}
        <br />
        (*) Numéro SIREN du bénéficiaire :
        {{ data().account.siret.toString().slice(0, 9) }}
      </p>

      <p class="mb-2">
        A défaut : le bénéficiaire atteste sur l'honneur qu'il est dépourvu de
        numéro SIREN en cochant cette case : □
      </p>

      <p class="mb-2">
        (mentionner la raison sociale et le numéro SIREN du syndic dans le cas
        des copropriétés).
      </p>

      <p class="mb-2">
        (*) Fonction du signataire : …………………………………
        <br />
        (*) Adresse : …………………………………
        <br />
        Compléments d'adresse : …………………………………
        <br />
        (*) Code postal : …………………………………
        <br />
        (*) Ville : …………………………………
        <br />
        Pays : …………………………………
        <br />
        (*) Téléphone : ………………………………… (indiquer un numéro de téléphone fixe ou
        de téléphone portable)
        <br />
        (*) Courriel : ………………………………… (indiquer : "néant " si le bénéficiaire ne
        dispose pas d'une adresse de courriel)
      </p>

      <p class="mb-2">
        (*) Cocher l'une des deux cases suivantes : à l'issue des opérations
        d'économies d'énergie :
      </p>

      <p class="mb-2">
        ☒ Je suis : le seul propriétaire (final) ou le locataire des équipements
        installés ; ou le syndic de la copropriété où prend place l'opération
        d'économies d'énergie ; ou l'occupant du logement où prend place
        l'opération d'économies d'énergie et je finance cette opération ; ou la
        personne recevant le service acheté ;
      </p>

      <p class="mb-2">
        ☐ Je suis le maître d'ouvrage, l'un des propriétaires des équipements
        installés, ou l'affectataire (au titre du transfert de compétence entre
        collectivités territoriales) des biens sur lesquels ont lieu
        l'opération.
      </p>

      <p class="mb-2">
        Le bénéficiaire ne peut prétendre pour une même opération qu'à une seule
        contribution versée dans le cadre du dispositif des certificats
        d'économies d'énergie.
      </p>

      <p class="mb-2">
        En tant que bénéficiaire de l'opération d'économies d'énergie, j'atteste
        sur l'honneur :
      </p>
      <ul class="pl-2">
        <li>
          - que ………. m'a apporté une contribution individualisée (action
          personnalisée de sensibilisation ou d'accompagnement, aide financière
          ou équivalent). Cette contribution m'a incité à réaliser cette
          opération d'économies d'énergie ;
        </li>
        <li>
          - que je fournirai exclusivement à ……….. l'ensemble des documents
          permettant de valoriser cette opération au titre du dispositif des
          certificats d'économies d'énergie, notamment la facture (ou à défaut
          une autre preuve de la réalisation effective de l'opération) ;
        </li>
        <li>
          - que je ne signerai pas, pour cette opération, d'attestation sur
          l'honneur semblable avec une autre personne morale ;
        </li>
        <li>
          - l'exactitude des informations que j'ai communiquées ci-dessus sur
          les caractéristiques de mon bien (type de bâtiment, surfaces, énergie
          de chauffage, etc.) et que la ou les opérations d'économies d'énergie
          décrites ci-dessus ont été intégralement réalisées. Je suis informé
          que je suis susceptible d'être contacté par les services du ministère
          chargé de l'énergie (ou tout organisme désigné par le ministère chargé
          de l'énergie) ou par ……………. ou son partenaire (ou tout organisme
          désigné par ceux-ci), dans le cadre d'un contrôle concernant la nature
          de l'opération et la réalisation effective de celle-ci. La réalisation
          effective d'un contrôle à la demande du demandeur ou de son partenaire
          (ou tout organisme désigné par ceux-ci) peut être une des conditions
          imposées par ces derniers pour le versement de leur contribution au
          financement de l'opération. Je m'engage à répondre aux demandes qui me
          seront faites dans le cadre des contrôles et, le cas échéant, à
          permettre l'accès au lieu de l'opération pour la réalisation de ces
          contrôles ;
        </li>
        <li>
          - que les économies d'énergie réalisées par cette opération ne
          viennent pas réduire les émissions de gaz à effet de serre d'une
          installation classée visée à l'article L. 229-5 du code de
          l'environnement dont je suis l'exploitant ;
        </li>
        <li>
          - qu'aucune aide à l'investissement de l'Agence de l'environnement et
          de la maîtrise de l'énergie (ADEME) n'a été reçue ou ne sera
          sollicitée pour cette opération ou qu'une aide à l'investissement de
          l'ADEME a été reçue ou sollicitée et que le calcul et la décision
          d'attribution de cette aide prennent en compte la délivrance de
          certificats d'économies d'énergie.
        </li>
      </ul>

      <p class="mb-2 mt-4">Fait à …………………………………</p>

      <p class="mb-2">(*) Le _ _/ _ _/ _ _ _ _</p>

      <p class="mb-2">(*) Signature du bénéficiaire</p>

      <p class="mb-2">
        Pour les personnes morales, son cachet et la signature du représentant
      </p>
      <div class="h-40 w-60 border border-black"></div>

      <p class="page-number">2/4</p>
    </div>

    <!-- PDF-PAGE 3 -->
    <div class="pdf-page p-8">
      <p class="mb-4 font-bold">
        C. Professionnel ayant mis en œuvre l'opération d'économies d'énergie ou
        assuré sa maîtrise d'œuvre
      </p>

      <p class="mb-4">
        (*) Nom du signataire : ………………………………… (*) Prénom du signataire :
        …………………………………
      </p>

      <p class="mb-4">(*) Fonction du signataire : …………………………………</p>

      <p class="mb-4">(*) Raison sociale : …………………………………</p>

      <p class="mb-4">Numéro SIRET : _ _ _ _ _ _ _ _ _ _ _ _ _ _</p>

      <p class="mb-4">
        (*) Adresse : …………………………………
        <br />
        Code postal : _ _ _ _ _
        <br />
        Ville : …………………………………
      </p>

      <p class="mb-4">
        (*) Téléphone : ………………………………… (indiquer un numéro de téléphone fixe ou
        de téléphone portable)
        <br />
        (*) Courriel : ………………………………… (indiquer : néant si le professionnel ne
        dispose pas d'une adresse de courriel)
      </p>

      <p class="mb-4">(*) En tant que représentant de l'entreprise :</p>

      <p class="mb-4">
        ☒ ayant mis en œuvre ; ou
        <br />
        ☐ ayant assuré la maîtrise d'œuvre
      </p>

      <p class="mb-4">
        de l'opération d'économies d'énergie, j'atteste sur l'honneur :
      </p>

      <ul class="mt-2 pl-2">
        <li>
          - que je fournirai exclusivement à ……….. l'ensemble des documents
          permettant de valoriser cette opération au titre du dispositif des
          certificats d'économies d'énergie, notamment la facture (ou à défaut
          une autre preuve de la réalisation effective de l'opération) ;
        </li>
        <li>
          - que je ne signerai pas, pour cette opération, d'attestation sur
          l'honneur semblable avec une autre personne morale ;
        </li>
        <li>
          - l'exactitude des informations que j'ai communiquées ci-dessus sur
          les caractéristiques techniques relatives à l'opération d'économies
          d'énergie et, le cas échéant, sur les qualifications professionnelles
          requises pour mettre en œuvre cette opération ;
        </li>
        <li>
          - que la ou les opérations d'économies d'énergie décrites ci-dessus
          ont été intégralement réalisées et que j'ai respecté les conditions de
          leur réalisation, conformément à ou aux fiches d'opérations
          standardisées d'économies d'énergie concernées. Je suis informé que je
          suis susceptible d'être contacté par les services du ministère chargé
          de l'énergie (ou tout organisme désigné par le ministère chargé de
          l'énergie) dans le cadre d'un contrôle concernant la nature de
          l'opération et la réalisation effective de celle-ci.
        </li>
      </ul>

      <p class="mb-4">Fait à …………………………………</p>

      <p class="mb-4">(*) Le _ _/ _ _/ _ _ _ _</p>

      <p class="mb-4">(*) Cachet et signature du professionnel</p>

      <div class="h-40 w-60 border border-black"></div>

      <p class="page-number">3/4</p>
    </div>

    <!-- PDF-PAGE 4 -->
    <div class="pdf-page p-8">
      <p class="mb-4 font-bold">Mentions finales</p>

      <p class="mb-4">
        Les informations recueillies font l'objet de traitements informatiques
        pour le ministère chargé de l'énergie, sous la responsabilité de la
        direction générale de l'énergie et du climat, destinés au contrôle des
        demandes de certificats d'économies d'énergie (CEE) et à évaluer le
        dispositif des CEE. Dans ce cadre, vous êtes susceptible d'être
        contacté, à l'initiative du ministère chargé de l'énergie, pour
        l'évaluation ou la réalisation d'un contrôle sur place de la bonne
        réalisation de l'opération. En signant le présent document, vous
        reconnaissez votre consentement au traitement de vos données.
      </p>

      <p class="mb-4">
        Conformément à la loi n° 78-17 du 6 janvier 1978 modifiée relative à
        l'informatique, aux fichiers et aux libertés, vous bénéficiez d'un droit
        d'accès et de rectification aux informations qui vous concernent. Vous
        pouvez également, pour des motifs légitimes, vous opposer aux
        traitements des données vous concernant.
      </p>

      <p class="mb-4">
        Pour exercer ces droits ou pour toute question sur le traitement de vos
        données dans ce dispositif, vous pouvez contacter le responsable de
        traitement de ces données à l'adresse suivante :
      </p>

      <p class="mb-4">
        Direction générale de l'énergie et du climat, ministère de la transition
        écologique, 92055 La Défense Cedex,
      </p>

      <p class="mb-4">
        ou par courriel : {{ sustainableDevelopmentGouvEmails.cee }}
      </p>

      <p class="mb-4">
        ou le délégué à la protection des données à l'adresse suivante :
        {{ sustainableDevelopmentGouvEmails.dpd }}
      </p>

      <p class="mb-4">
        Si vous estimez, après avoir contacté le responsable de traitement ou le
        délégué indiqué ci-dessus, que vos droits ne sont pas respectés, vous
        avez également la possibilité d'adresser une réclamation relative aux
        traitements mis en œuvre à la Commission nationale de l'informatique et
        des libertés.
      </p>

      <p class="mb-4">
        Le responsable du traitement de vos données est la société DRAPO. Les
        informations recueillies font l’objet d’un traitement informatique
        destiné à gérer vos demandes de certificats d’économies d’énergie dans
        le cadre de la règlementation des certificats d’économies d’énergie. Le
        destinataire des données est DRAPO. Conformément à la loi n° 78-17 du 6
        janvier 1978 modifiée relative à l’informatique, aux fichiers et aux
        libertés, vous bénéficiez d’un droit d’accès et de rectification aux
        informations qui vous concernent, que vous pouvez exercer en vous
        adressant à : DRAPO, 128 rue La Boétie, 75008 Paris. Vous pouvez
        également, pour des motifs légitimes, vous opposer aux traitements des
        données vous concernant.
      </p>

      <p class="mb-4">
        De plus, il est rappelé aux signataires de la présente attestation sur
        l'honneur que toute fausse déclaration expose notamment aux sanctions
        prévues au code pénal (article 441-7) : « Est puni d'un an
        d'emprisonnement et de 15 000 euros d'amende le fait : 1° D'établir une
        attestation ou un certificat faisant état de faits matériellement
        inexacts ; 2° De falsifier une attestation ou un certificat
        originairement sincère ; 3° De faire usage d'une attestation ou d'un
        certificat inexact ou falsifié. »
      </p>

      <p class="page-number mb-4">4/4</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwornCertificateTemplateComponent {
  readonly data = input.required<z.infer<typeof SwornCertificateSchema>>();

  protected readonly ceelabAddress = CEELAB_ADDRESS;
  protected readonly blankDots = "………………………………";
  protected readonly sustainableDevelopmentGouvEmails = {
    cee: "cee@developpement-durable.gouv.fr",
    dpd: "dpd.daj.sg@developpement-durable.gouv.fr",
  };
}
