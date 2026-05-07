import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
} from "@angular/core";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";
import { DividerVerticalComponent } from "@optee/ui/components/atoms/divider/divider-vertical/divider-vertical.component";

@Component({
  selector: "mkp-cgu-page",
  host: {
    class:
      "flex flex-col items-center font-display p-12 mt-8 justify-center gap-8 relative overflow-hidden",
  },
  template: `
    <h1 class="text-5xl">Conditions Générales d'Utilisation</h1>

    <oui-divider-vertical />
    @for (circle of circles; track circle) {
      <oui-circle
        class="w-[1071px]"
        theme="light"
        [class.-left-[519px]]="circle.side === 'left'"
        [class.-right-[600px]]="circle.side === 'right'"
        [style.top.px]="circle.top"
      />
    }

    <div class="prose max-w-prose text-justify">
      <h2>1. Identification et présentation d’Optee</h2>
      <p>
        La société CEELAB (OPTEE – PRIMITY) est une société par actions
        simplifiée inscrite au RCS de Paris sous le n° 840 401 707, au capital
        social de 1400 € dont le siège social est situé 8 rue Notre Dame de
        Lorette 75009 Paris (« Optee »).
      </p>

      <p>
        Optee peut être contactée à l’adresse e-mail suivante :
        <a href="mailto:contact@optee.io">contact&#64;optee.io</a>
      </p>
      <p>
        Optee propose un service de conseil en rénovation et transition
        énergétique et fournit dans ce cadre un service de mise en relation
        entre des clients professionnels (les « Clients ») avec des artisans et
        professionnels du bâtiment (les « Professionnels ») afin de permettre
        aux Clients de réaliser la conception et/ou le suivi de chantier.
      </p>
      <p>
        Dans le cadre de son activité, Optee édite et exploite une plateforme
        permettant notamment de réaliser la mise en relation entre les Clients
        et les Professionnels (la « Plateforme »).
      </p>
      <p>
        Optee a besoin de fédérer un réseau de Professionnels pour accomplir les
        prestations de conception ou de suivi de chantier souhaitées par les
        Clients (les « Chantiers »).
      </p>

      <h2>2. Documents contractuels</h2>
      <p>
        La relation contractuelle entre le Partenaire et Optee est régie, par
        ordre hiérarchique décroissant, par les documents suivants :
      </p>
      <ul>
        <li>
          La proposition commerciale (la « Proposition ») établie sur la
          Plateforme conformément aux informations communiquées par le
          Partenaire dans le cadre du parcours de partenariat sur la Plateforme
          ;
        </li>
        <li>
          Les présentes conditions générales (les « Conditions Générales ») qui
          définissent les modalités du Partenariat et les obligations
          respectives des parties.
        </li>
      </ul>
      <p>
        La Proposition doit être acceptée sur la Plateforme dans un délai
        maximum de 15 jours à compter de son établissement par Optée. Cette
        acceptation vaut acceptation des Conditions Générales dans leur version
        en vigueur à la date de la Proposition.
      </p>
      <p>
        La Proposition et les Conditions Générales forment le contrat (le «
        Contrat »).
      </p>

      <h2>3. Conditions d’accès au Partenariat</h2>
      <p>
        Le Partenaire tel qu’identifié dans la Proposition sur la Plateforme (le
        « Partenaire ») est :
      </p>
      <ul>
        <li>
          (i) un professionnel du bâtiment et dispose d’une expertise dans le
          domaine de la conception et du suivi de chantier ;
        </li>
        <li>
          (ii) qui répond aux critères de sélection prévus à l’article «
          Critères de sélection » des Conditions Générales.
        </li>
      </ul>

      <h2>4. Durée</h2>
      <p>Le Partenariat est souscrit pour une durée indéterminée.</p>
      <p>Le Partenariat peut être mis fin à tout moment par :</p>
      <ul>
        <li>
          Optee en dénonçant le Contrat par l’envoi d’un email envoyé au
          Partenaire ;
        </li>
        <li>
          Le Partenaire en dénonçant le Contrat par l’intermédiaire de la
          fonctionnalité prévue à cet effet sur la Plateforme.
        </li>
      </ul>
      <p>
        La résiliation est effective dans un délai de 15 jours à compter de la
        demande.
      </p>

      <h2>5. Services proposés</h2>
      <p>Optee propose au Partenaire les Services suivants :</p>

      <h3>
        Référencement dans le réseau de Professionnels d’Optee sur la
        Plateforme.
      </h3>
      <p>
        Dans le cadre des Services, Optee permet au Partenaire d’être référencé
        dans son réseau de Professionnels sur la Plateforme et d’ainsi pouvoir
        proposer ses services afin d’être mis en relation avec des Client pour
        la réalisation de Chantiers.
      </p>
      <p>
        Une fois la Proposition acceptée sur la Plateforme, Optee ouvre un
        compte au Partenaire sur la Plateforme (le « Compte Partenaire »), qui
        lui permet notamment de gérer son identification pour son référencement
        sur la Plateforme et de suivre les opérations à réaliser dans le cadre
        des Chantiers qui lui sont par les Clients. Optee communique au
        Partenaire par email l’identifiant de connexion et le mot de passe qui
        lui est affecté.
      </p>
      <p>
        Il appartient au Partenaire de fournir les éléments demandés sur la
        Plateforme afin d’activer son Compte Partenaire.
      </p>
      <p>
        Le Partenaire est seul responsable du maintien de la confidentialité de
        ses identifiants de connexion et mot de passe ainsi que de son
        utilisation de la Plateforme.
      </p>
      <p>
        Le référencement du Partenaire sur la Plateforme lui permet d’être mis
        en relation par Optee avec des Clients afin de conclure des contrats
        avec ces derniers pour l’exécution des Chantiers.
      </p>

      <h3>Service de mise en relation avec les Clients</h3>
      <p>
        Une fois le Partenaire référencé sur la Plateforme, ce dernier s’engage
        à indiquer sur la Plateforme ses qualifications et compétences, sa zone
        d’intervention géographique et ses disponibilités.
      </p>
      <p>
        En fonction des informations communiquées par le Partenaire, Optee lui
        proposera à travers la Plateforme des Chantiers demandés par des
        Clients.
      </p>
      <p>
        Optee, qui est étrangère au Partenaire et n’est liée à celui-ci par
        aucun contrat d’agence, pourra ainsi être amenée par son action
        personnelle et ses interventions, à lui apporter un certain nombre de
        Clients.
      </p>
      <p>
        Si le Partenaire souhaite réaliser un Chantier, il doit transmettre à
        Optee sur la Plateforme un devis établi spécifiquement au regard des
        informations communiquées par Optee pour ledit Chantier (le « Devis »)
        dans un délai maximum de 7 jours à compter de la visite technique sur
        site réalisée par le Partenaire. Le Partenaire fixe librement les
        modalités d’exécution de ses prestations et ses conditions financières
        pour le Chantier.
      </p>
      <p>
        Le Devis soumis par le Partenaire doit comporter les informations
        suivantes :
      </p>
      <ul>
        <li>Détail des travaux exécutés au titre du Chantier ;</li>
        <li>Calendrier de réalisation ;</li>
        <li>Tarifs et frais annexes ;</li>
        <li>Modalités de paiement ;</li>
        <li>
          Toutes les informations techniques et d’éligibilité aux critères de
          certificat d’économie d’énergie demandées par les fiches CEE le cas
          échéant ;
        </li>
        <li>La durée de validité du Devis.</li>
      </ul>
      <p>
        Une fois le Devis transmis par le Partenaire sur la Plateforme, Optee le
        communiquera au Client par tout moyen utile.
      </p>
      <p>
        Si le Devis est accepté par le Client, Optee communiquera au Partenaire
        le Devis dument signé par le Client.
      </p>
      <p>
        Optee pourra alors être amenée à organiser la première rencontre entre
        le Partenaire et le Client pour lancer le début du Chantier.
      </p>
      <p>
        Le Partenaire reconnait et accepte expressément qu’Optee n’intervient en
        aucun cas dans la supervision et la réalisation du Chantier, dont le
        Partenaire reste l’unique responsable.
      </p>
      <h3>Service complémentaires</h3>
      <h4>
        Intermédiation avec un organisme pour la délivrance de certificats
        d’économie d’énergie
      </h4>
      <p>
        Dans le cadre des Services fournis au Partenaire, Optee réalise un
        service d’accompagnement pour l’obtention de certificats d’économie
        d’énergie (les « CEE ») auprès d’organismes mandataires administratifs
        et financiers habilités.
      </p>
      <p>
        Le Partenaire reconnait que seuls les travaux de rénovation énergétiques
        qu’il réalise dans le cadre des Chantiers au profit du Client et
        respectant les critères d’éligibilité pourront donner lieu à l’obtention
        de CEE et qu’Optee ne garantit en aucun cas l’obtention de tels CEE,
        dont la décision relève d’une autorité administrative.
      </p>
      <p>
        Il appartient au Partenaire de fournir à Optee toutes les informations
        et documents utiles afin de lui permettre de transmettre au mandataire
        administratif et financier habilité par le pôle national des certificats
        d’énergie partenaire d’Optee lesdits éléments nécessaires à la
        constitution d’un dossier pour l’obtention de CEE.
      </p>
      <p>
        Le Partenaire s’engage à ce titre à fournir les éléments indiqués sur la
        Plateforme, et notamment, sans que cette liste ne soit limitative :
      </p>
      <ul>
        <li>Le Devis validé par le Client ;</li>
        <li>Les factures relatives aux travaux prévus pour le Chantier ;</li>
        <li>
          L’attestation sur l’honneur relative à la réalisation et l’achèvement
          du Chantier, en version originale ;
        </li>
        <li>Tout autre document nécessaire au dossier de demande CEE.</li>
      </ul>
      <p>
        En cas d’obtention de CEE validé par l’administration compétente (la «
        Prime CEE »), il appartient au Partenaire de se conformer aux exigences
        réglementaires afin de permettre au Client de récupérer la Prime CEE. Le
        Partenaire reconnait expressément que les informations relatives à ces
        exigences réglementaires figurent dans le contrat de mandat communiqué
        par Optee auquel il peut se référer.
      </p>
      <p>
        Le Partenaire reconnait et accepte expressément qu’Optee n’a qu’un rôle
        de mise en relation entre le mandataire habilité pour l’obtention de CEE
        et le Partenaire. La responsabilité d’Optee ne serait en aucun cas être
        engagée au titre des dossiers réalisés par ledit mandataire pour
        l’obtention d’une Prime CEE. Il ne pourrait ainsi être reproché à Optee
        un éventuel refus d’accord de Primee CEE ou toute erreur dans
        l’établissement d’un dossier pour l’obtention d’une telle Prime CEE, ces
        démarches étant réalisées par le mandataire habilité.
      </p>
      <h4>Licence d’utilisation de la Plateforme</h4>
      <p>
        Dans le cadre des Services fournis au Partenaire, Optee lui concède pour
        le monde entier, pour la durée prévue à l’article « Durée » une licence
        non exclusive, personnelle et non transmissible d’utilisation de la
        Plateforme, dans sa version existante à la date des présentes, en mode
        SaaS, pour les seuls besoins du Partenaire dans le cadre du Contrat.
      </p>
      <p>
        Cette licence est destinée à un usage professionnel et s’adresse
        exclusivement aux professionnels dans le cadre de leur activité.
      </p>
      <h4>Maintenance de la Plateforme</h4>
      <p>
        Le Partenaire bénéficie pendant la durée du Contrat d’une maintenance,
        notamment corrective et évolutive. Dans ce cadre, l’accès à la
        Plateforme peut être limité ou suspendu.
      </p>
      <p>
        Concernant la maintenance corrective, Optee fait ses meilleurs efforts
        pour fournir au Partenaire une maintenance corrective afin de corriger
        tout dysfonctionnement ou bogue relevé sur la Plateforme.
      </p>
      <p>
        Concernant la maintenance évolutive, le Partenaire bénéficie pendant la
        durée du Contrat d’une maintenance évolutive, qu’Optee pourra réaliser
        automatiquement et sans information préalable, et qui comprend des
        améliorations des fonctionnalités de la Plateforme et/ou installations
        techniques utilisées dans le cadre de la Plateforme (visant à introduire
        des extensions mineures ou majeures).
      </p>
      <p>
        L’accès à la Plateforme peut par ailleurs être limité ou suspendu pour
        des raisons de maintenance planifiée.
      </p>
      <h4>Hébergement de la Plateforme</h4>
      <p>
        Optee assure, dans les termes d’une obligation de moyens, l’hébergement
        de la Plateforme sur ses serveurs ou par l’intermédiaire d’un
        prestataire d’hébergement professionnel, et sur des serveurs situés dans
        un territoire de l’Union européenne.
      </p>
      <h3>Critères de sélection pour rejoindre le réseau de Professionnels</h3>
      <p>
        Le Partenaire reconnait expressément qu’afin de pouvoir rejoindre le
        réseau de Professionnels d’Optee, ce dernier doit répondre aux critères
        suivants :
      </p>
      <ul>
        <li>
          Être une personne morale dont le siège social est établi en France
          métropolitaine ou sur le territoire de l’Union Européenne ;
        </li>
        <li>Disposer et fournir un extrait K-Bis de moins de 3 mois ;</li>
        <li>
          Être un professionnel dans l’exécution de travaux de rénovation et
          transition énergétique ;
        </li>
        <li>
          Respecter les normes légales et réglementaires applicables sur
          l’exercice de leur profession.
        </li>
      </ul>
      <p>
        Ces critères doivent être maintenus par le Partenaire tout le temps de
        l’exécution du Contrat. CEELAB se réserve le droit de solliciter au
        Partenaire une copie de tout justificatif pouvant attester du respect
        par le Partenaire de l’un ou l’autre de ces critères. La non-fourniture
        de ces informations, ou le non-respect par le Partenaire de ces
        critères, pourra entraîner la suspension ou la résiliation du Contrat.
      </p>
      <h2>6. Conditions financières</h2>
      <h3>Commission</h3>
      <p>
        En contrepartie de la fourniture des Services par Optee au profit du
        Partenaire, ce dernier versera à Optee une commission représentant un
        pourcentage du montant total HT indiqué dans le Devis accepté par le
        Client au titre du Chantier avant une éventuelle application de la Prime
        CEE (la 4 « Commission »). Le montant de la Commission est indiqué sur
        la Proposition communiquée par Optee au Partenaire sur la Plateforme.
      </p>
      <p>
        Le Partenaire dispose d’une entière liberté pour fixer le montant des
        prix qu’elle facture aux Clients.
      </p>
      <h3>Modalités de facturation et de paiement</h3>
      <p>
        Optee adressera au Partenaire ses factures relatives à la Commission à
        chaque signature d’un Devis par un Client.
      </p>
      <p>
        Pour se faire, le Partenaire devra fournir à Optee, par tout moyen utile
        et notamment par la Plateforme, en fin de Chantier, une facture finale
        récapitulant l’ensemble des sommes versées par le Client au titre dudit
        Chantier.
      </p>
      <p>
        Le paiement de la Commission est effectué par prélèvement automatique à
        la fin de chaque Chantier, sur les montants que le Partenaire perçoit
        dans le cadre de la mise en relation proposée par Optee.
      </p>

      <h2>7. Obligations du Partenaire</h2>
      <p>
        Sans préjudice des autres obligations prévues au Contrat, le Partenaire
        s’engage à respecter les obligations qui suivent :
      </p>
      <ul>
        <li>
          <strong>7.1.</strong>
          Le Partenaire est seul responsable du bon accomplissement de toutes
          les formalités notamment administratives, fiscales et/ou sociales qui
          lui incombent en relation avec la réalisation de ses services. La
          responsabilité d’Optee ne pourra en aucun cas être engagée à ce titre.
        </li>
        <li>
          <strong>7.2.</strong>
          Le Partenaire s’engage à fournir à Optee tous les documents, éléments,
          données et informations nécessaires à la réalisation des Services.
          Plus généralement, il s’engage à coopérer activement avec Optee en vue
          de la bonne exécution des Services et à l’informer de toute difficulté
          liée à cette exécution.
        </li>
        <li>
          <strong>7.3.</strong>
          Le Partenaire s’engage, dans son usage des Services et de la
          Plateforme, à respecter le présent Contrat ainsi que les lois et
          règlements en vigueur, et à ne pas porter atteinte aux droits de tiers
          ou à l’ordre public.
        </li>
        <li>
          <strong>7.4.</strong>
          Concernant le Compte du Partenaire, ce dernier garantit que les
          informations et documents transmis lors de l’élaboration de la
          Proposition sur la Plateforme dans le formulaire sont exactes. Il
          s’engage à les mettre à jour le cas échéant.
        </li>
        <li>
          <strong>7.5.</strong>
          Le Partenaire est seul responsable de son utilisation de la
          Plateforme, des Services, et des relations avec les Clients, y compris
          les différends ou litiges ayant pour cause ou origine la réalisation
          des Chantiers.
        </li>
        <li>
          <strong>7.6.</strong>
          Le Partenaire reconnait qu’il lui appartient d’accepter ou de refuser
          les demandes de réalisation de Chantiers formulées par les Clients.
        </li>
        <li>
          <strong>7.7.</strong>
          En cas de validation d’un Devis par un Client, le Partenaire devra
          réaliser la mission dans les conditions prévues. Il s’engage à
          démarrer les travaux dès réception du paiement correspondant à la
          première facture.
        </li>
        <li>
          <strong>7.8.</strong>
          Le Partenaire s’engage à entretenir la relation avec le Client avec
          diligence et à réaliser les Chantiers conformément aux normes de la
          profession.
        </li>
        <li>
          <strong>7.9.</strong>
          Le Partenaire s’engage à transmettre à Optee sur la Plateforme les
          preuves de fin de travaux.
        </li>
        <li>
          <strong>7.10.</strong>
          Le Partenaire est seul responsable des contenus de toute nature
          (rédactionnels, graphiques, audios, audiovisuels ou autres) qu’il
          publie sur la Plateforme (les « Contenus »).
          <p>
            Il garantit à Optee qu’il dispose de tous les droits et
            autorisations nécessaires à la diffusion de ces Contenus.
          </p>
          <p>
            Il s’engage à ce que lesdits Contenus soient licites, ne portent pas
            atteinte à l’ordre public, aux bonnes mœurs ou aux droits de tiers,
            n’enfreignent aucune disposition législative ou règlementaire et
            plus généralement, ne soient aucunement susceptibles de mettre en
            jeu la responsabilité civile ou pénale d’Optee.
          </p>
          <p>
            Le Partenaire s’interdit ainsi notamment de diffuser, sur la
            Plateforme, et sans que cette liste soit exhaustive :
          </p>
          <ul>
            <li>
              des Contenus pornographiques, obscènes, indécents, choquants ou
              inadaptés à un public familial, diffamatoires, injurieux,
              violents, racistes, xénophobes ou révisionnistes,
            </li>
            <li>des Contenus contrefaisants,</li>
            <li>des Contenus attentatoires à l’image d’un tiers,</li>
            <li>
              des Contenus mensongers, trompeurs ou proposant ou promouvant des
              activités illégales, frauduleuses ou trompeuses,
            </li>
            <li>
              des Contenus nuisibles aux systèmes informatiques de tiers (tels
              que virus, vers, chevaux de Troie, etc.),
            </li>
            <li>
              et plus généralement des Contenus susceptibles de porter atteinte
              aux droits de tiers ou d’être préjudiciables à des tiers, de
              quelque manière et sous quelque forme que ce soit.
            </li>
          </ul>
        </li>

        <li>
          <strong>7.11.</strong>
          Dans le cadre de la mise en relation à travers la Plateforme avec les
          Clients, le Partenaire est soumis à des obligations
          <a href="https://www.impots.gouv.fr/portail/node/10841">fiscales</a>
          et
          <a
            href="http://www.securite-sociale.fr/Vos-droits-et-demarches-dans-le-cadre-des-activites-economiques-entre-particuliers-Article-87"
          >
            sociales
          </a>
          . Optee lui recommande d’en prendre connaissance.

          <p>
            Le Partenaire est responsable de toutes les formalités et de tous
            les paiements lui incombant dans le cadre de l’utilisation des
            Services.
          </p>
        </li>
        <li>
          <strong>7.12.</strong>
          Le Partenaire s’engage à faire un usage strictement personnel des
          Services. Il s’interdit en conséquence de céder, concéder ou
          transférer tout ou partie de ses droits ou obligations au titre des
          présentes à un tiers, de quelque manière que ce soit.
        </li>
        <li>
          <strong>7.13.</strong>
          Le Partenaire s’interdit de :
          <ul>
            <li>
              Reproduire, arranger, adapter tout ou partie de la Plateforme ;
            </li>
            <li>
              Procéder à toute forme d’exploitation commerciale de la Plateforme
              ;
            </li>
            <li>
              Céder, fournir, prêter, louer la Plateforme, en concéder des
              sous-licences ou autres droits d’usage, ou de manière plus
              générale, de communiquer à un tiers ou à une société affiliée tout
              partie de la Plateforme ;
            </li>
            <li>
              Intégrer tout ou partie de la Plateforme dans tout système
              informatique ou toute autre solution logicielle autres que ceux
              prévus dans le cadre du Contrat ;
            </li>
            <li>
              Procéder à la télétransmission de la Plateforme, à sa mise en
              réseau, notamment sur internet ou à sa diffusion sous tout autre
              forme, sans autorisation écrite et préalable d’Optee.
            </li>
          </ul>
        </li>

        <li>
          <strong>7.14.</strong>
          Le Partenaire certifie qu’il est titulaire d’une police d’assurance
          garantissant sa responsabilité civile professionnelle pendant la durée
          du Contrat. Il s’engage à communiquer sur demande d’Optee et sans
          délai une attestation d’assurance à jour.
        </li>
        <li>
          <strong>7.15.</strong>
          Le Partenaire garantit Optee contre toutes plaintes, réclamations,
          actions et/ou revendications quelconques qu’elle pourrait subir du
          fait de la violation par le Partenaire de l’une quelconque de ses
          obligations aux termes du Contrat. Le Partenaire s’engage à payer à
          Optee tous les frais, charges et/ou condamnations qu’elle pourrait
          avoir à supporter de ce fait.
        </li>
      </ul>

      <h2>8. Obligations d’Optee</h2>
      <p>
        Sans préjudice des autres obligations prévues au Contrat, Optee s’engage
        à respecter les obligations qui suivent :
      </p>
      <ul>
        <li>
          <strong>8.1.</strong>
          Optee s’engage à fournir les Services avec diligence et selon les
          règles de l’art, étant précisé qu’il pèse sur elle une obligation de
          moyens, à l’exclusion de toute obligation de résultat, ce que le
          Partenaire reconnaît et accepte expressément.
        </li>
        <li>
          <strong>8.2.</strong>
          Optee intervient exclusivement aux fins de fourniture des Services
          décrits au présent Contrat.
        </li>
        <li>
          <strong>8.3.</strong>
          Optee intervient en qualité de courtier dans les rapports entre le
          Client et le Partenaire. Optee n’est pas partie aux relations entre le
          Partenaire et les Clients et ne saurait en aucun cas voir sa
          responsabilité engagée au titre des éventuelles difficultés liées à
          ces relations, ni être partie à quelques litiges éventuels que ce
          soit, les garanties, déclarations et autres obligations quelconques
          auxquelles le Partenaire serait tenu, notamment au titre de la
          réalisation des Chantiers.
        </li>
        <li>
          <strong>8.4.</strong>
          Optee ne garantit aucun volume d’affaires que le Partenaire pourrait
          réaliser à travers l’utilisation des Services.
        </li>
        <li>
          <strong>8.5.</strong>
          Optee s’engage à ne faire aucune déclaration ou garantie aux Clients
          en ce qui concerne les spécifications, les caractéristiques ou les
          capacités des services du Partenaire, qui soit incompatible avec les
          engagements du Partenaire.
        </li>
        <li>
          <strong>8.6.</strong>
          Les Services sont fournis par Optee tels quels et sans garantie
          d’aucune sorte, expresse ou implicite. Optee ne garantit notamment pas
          au Partenaire (i) que les Services, soumis à une recherche constante
          pour en améliorer notamment la performance et le progrès, seront
          totalement exempts d’erreurs, de vices ou défauts, (ii) que les
          Services, étant standards et nullement proposés à la seule intention
          du Partenaire en fonction de ses propres contraintes personnelles,
          répondront spécifiquement à ses besoins et attentes.
        </li>
        <li>
          <strong>8.7.</strong>
          Optee garantit le Partenaire contre toutes plaintes, réclamations,
          actions et/ou revendications quelconques qu’il pourrait subir du fait
          de la violation, par Optee, de l’une quelconque de ses obligations aux
          termes du Contrat.
        </li>
      </ul>
      <p>
        En tout état de cause, la responsabilité susceptible d’être encourue par
        Optee au titre des présentes ne pourra porter que sur les dommages
        directs avérés subis par le Partenaire et sera expressément limitée au
        montant total du prix perçu par Optee pendant les 12 mois précédant le
        fait générateur de responsabilité.
      </p>
      <p>
        La responsabilité d’Optee ne pourra au demeurant être engagée que si le
        Partenaire a émis une réclamation, par lettre recommandée avec accusé de
        réception, dans un délai d’un mois suivant ladite survenance.
      </p>

      <h2>9. Non-sollicitation</h2>
      <p>
        Le Partenaire s’interdit de solliciter ou démarcher les Clients, de
        proposer aux Clients des services identiques ou similaires aux Chantiers
        ou tout autre type de prestation de travaux en contournant le processus
        de mise en relation d’Optee entre les Clients et les Professionnels, à
        travers la Plateforme ou non, directement ou indirectement. Le
        Partenaire reconnait expressément qu’il ne peut contacter le Client
        qu’aux seules fins de mieux comprendre les besoins de ce dernier afin
        d’établir son Devis et d’organiser un rendez-vous-technique
      </p>
      <p>
        La présente interdiction s’applique sur tout le territoire français
        pendant toute la durée du Contrat et pendant une durée de 2 ans à
        compter de sa résiliation, pour quelque raison que ce soir.
      </p>
      <p>
        Cette interdiction constitue une obligation essentielle du Contrat. En
        cas de violation du présent article, Optee pourra mettre fin au Contrat
        dans les conditions prévues à l’article « Résolution pour manquement »
        ou facturer au Partenaire une pénalité d’un montant de 5.000 €
        (cinq-mille euros) HT pour chaque manquement constaté à la présente
        clause, sans préjudice de tous dommages et intérêts qu’Optee pourrait
        réclamer.
      </p>

      <h2>10. Propriété intellectuelle</h2>
      <p>
        Le Contrat n'affecte en rien les droits de propriété intellectuelle
        préexistants de chacune d’Optee et du Partenaire.
      </p>
      <ul>
        <li>
          <strong>10.1.</strong>
          Optee ne bénéficie au titre des présentes que d’une licence
          d’utilisation sur les éléments auxquels il aurait pu avoir accès ou
          qui lui seront transmis par le Partenaire, pour la durée du Contrat et
          aux seules fins d’exécution de celui-ci.
        </li>
        <li>
          <strong>10.2.</strong>
          Le Partenaire reconnaît de convention expresse que le présent Contrat
          ne lui confère aucun droit de propriété intellectuelle sur la
          Plateforme, qui demeure la propriété exclusive d’Optee.
          <br />
          Le Partenaire ne dispose que d’une licence d’utilisation de la
          Plateforme dans les conditions définies à l’article « Licence
          d’utilisation de la Plateforme » des présentes.
          <br />
          En conséquence, tous désassemblages, décompilations, décryptages,
          extractions, réutilisations, copies et plus généralement tous actes de
          reproduction, représentation, diffusion et utilisation de l’un
          quelconque des éléments composant la Plateforme, en tout ou en partie,
          sans l’autorisation d’Optee, sont strictement interdits et pourront
          faire l’objet de poursuites judiciaires.
        </li>
      </ul>

      <h2>11. Données à caractère personnel</h2>
      <p>
        Optee et le Partenaire s’engage à respecter pour ce qui la concerne,
        toutes les obligations légales et réglementaires qui lui incombent en
        matière de protection des données à caractère personnel, notamment la
        loi 78-17 du 6 janvier 1978 dans sa dernière version modifiée dite Loi
        Informatique et Libertés et le règlement UE 2016/679 du Parlement
        européen et du Conseil du 27 avril 2016 (la « Réglementation applicable
        »).
      </p>
      <p>
        Optee et le Partenaire sont respectivement responsables de traitement
        chacun sur leur périmètre de traitement effectué sur les données
        personnelles collectées des Clients. Dans ce cadre, Optee est
        responsable du traitement des données des Clients jusqu’à leur
        transmission au Partenaire.
      </p>
      <p>
        Le Partenaire est quant à lui responsable du traitement des données
        personnelles des Clients lorsque Optee lui a transmis. Il appartient à
        Optee et au Partenaire, en tant que responsable de traitement :
      </p>
      <ul>
        <li>
          de définir la ou les base(s) légale(s) applicable(s) aux traitements
          relevant de son périmètre propre ;
        </li>
        <li>
          d’assurer l’information préalable des personnes concernées, au sujet
          des traitements et transferts effectués, des finalités ;
        </li>
        <li>
          d’assurer le déploiement, sous sa responsabilité exclusive, des
          mesures techniques et organisationnelles appropriées de nature à
          garantir la sécurité, la confidentialité, l’intégrité des données
          personnelles de l’autre partie, contre notamment tout risque de
          destruction, perte, corruption, détournement ou divulgation non
          autorisée ;
        </li>
        <li>
          de mettre en place toute procédure appropriée afin de recevoir et
          gérer les demandes des personnes concernées relatives à leurs droits
          sur leurs données personnelles ;
        </li>
        <li>
          de mettre en place toute procédure appropriée de détection, alerte et
          notification des éventuelles violations de données à caractère
          personnel ;
        </li>
        <li>
          de déployer une protection appropriée au sein de ses propres
          sous-traitants et outils ;
        </li>
        <li>
          d’assurer l’encadrement d’éventuels flux transfrontaliers conformément
          à la Réglementation applicable ;
        </li>
        <li>
          de coopérer entre elles et de se fournir mutuellement toute
          information ou document utile afin de se conformer à la Réglementation
          applicable ;
        </li>
        <li>
          de s’engager respectivement (i) à conclure avec leurs sous-traitants
          amenés à collecter et traiter des données à caractère personnel pour
          leur compte des contrats conformes à la Réglementation applicable et
          (ii) à s’assurer que ces sous-traitants mettent en œuvre des mesures
          techniques et organisationnelles appropriées aux fins de la conformité
          de ces traitements à la Réglementation applicable.
        </li>
      </ul>

      <h2>12. Confidentialité</h2>
      <p>
        Chacune des parties s’engage à garder strictement confidentiels tous les
        documents et informations de nature juridique, commerciale,
        industrielle, stratégique, technique ou financière relatifs à l’autre
        Partie dont elle aurait eu connaissance à l’occasion de la conclusion et
        de l’exécution du Contrat et à ne pas les divulguer sans l’accord écrit
        préalable de l’autre partie.
      </p>
      <p>Cette obligation ne s’étend pas aux documents et informations :</p>
      <ul>
        <li>dont la partie qui les reçoit avait déjà connaissance ;</li>
        <li>
          déjà publics lors de leur communication ou qui le deviendraient sans
          violation du Contrat ;
        </li>
        <li>qui auraient été reçus d’un tiers de manière licite ;</li>
        <li>
          dont la communication serait exigée par les autorités judiciaires, en
          application des lois et règlements ou en vue d’établir les droits
          d’une partie au titre du Contrat.
        </li>
      </ul>
      <p>
        Cette obligation de confidentialité s’étend à l’ensemble des employés,
        collaborateurs, stagiaires, dirigeants et mandataires des parties ainsi
        qu’à leurs conseils affiliés et cocontractants, auxquels ne pourront
        être transmis des documents ou informations confidentielles que s’ils
        sont tenus à la même obligation de confidentialité que celle prévue aux
        présentes.
      </p>
      <p>
        Celle-ci continuera à produire ses effets pendant les 3 ans suivant la
        fin du Contrat, quelle qu’en soit la cause.
      </p>

      <h2>13. Résiliation pour manquement</h2>
      <p>
        Par dérogation aux dispositions de l’article « Durée », Optee peut
        résilier le Contrat de plein droit sans préavis ni mise en demeure, sans
        versement d’aucune indemnité, et sans préjudice de tout autre droit
        d’Optee, notamment tous dommages-intérêts dont Optee peut se prévaloir,
        en cas de :
      </p>
      <ul>
        <li>
          Manquement par le Partenaire à l’obligation de non-sollicitation ;
        </li>
        <li>
          Manquements par le Partenaire répétés des obligations du Partenaire ;
        </li>
        <li>
          Manquement par le Partenaire à l’article « Critères de sélection pour
          rejoindre le réseau de Professionnels » ;
        </li>
        <li>
          Manquement par le Partenaire à l’article « Propriété intellectuelle »
          ;
        </li>
        <li>Manquement par le Partenaire à l’article « Non-sollicitation ».</li>
      </ul>

      <h2>14. Références commerciales</h2>
      <p>
        Optee et le Partenaire s’autorisent mutuellement à faire usage de leurs
        noms, marques et logos respectifs et faire référence à leurs plateformes
        respectives, à titre de références commerciales, pendant la durée du
        Contrat.
      </p>

      <h2>15. Effets de la fin du Contrat</h2>
      <p>
        A la fin du Contrat, pour quelque cause que ce soit, le Partenaire devra
        cesser sans délai toute utilisation de la Plateforme et remettre à Optee
        tous programmes et documents relatifs à celle-ci.
      </p>
      <p>
        La fin du Contrat entraine la fin des Services. Elle est sans incidence
        sur les dispositions des présentes ayant vocation à perdurer au-delà, et
        notamment les articles « Propriété intellectuelle », « Confidentialité
        », « Non-sollicitation » et le présent article, ainsi que sur les
        Chantiers en cours devant être menés par le Partenaire jusqu’à leur fin
        à défaut d’indication contraire de la part d’Optee ou du Client.
      </p>

      <h2>16. Modification des Conditions Générales</h2>
      <p>
        Optee peut modifier ses Conditions Générales à tout moment et en
        informera le Partenaire par tout moyen écrit (et notamment par email) 5
        jours calendaires au moins avant leur entrée en vigueur.
      </p>
      <p>
        Si le Partenaire n’accepte pas ces modifications, il doit se désinscrire
        du Partenariat selon les modalités prévues à l’article « Durée ».
      </p>

      <h2>17. Loi applicable et juridiction</h2>
      <p>
        Le Contrat est soumis au droit français et sera régi et interprété selon
        ce droit.
      </p>
      <p>
        En cas de litige entre Optee et le Partenaire et à défaut d’accord dans
        le mois suivant la première notification, celui-ci sera soumis à la
        compétence exclusive des tribunaux de Paris (France), sauf dispositions
        impératives contraires.
      </p>
    </div>
  `,
  imports: [CircleComponent, DividerVerticalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PolitiqueDeConfidentialitePageComponent {
  circles = this.generateCircles(10, -64, 2000);

  generateCircles(numCircles: number, initialTop: number, spacing: number) {
    const circles = [];
    let side: "left" | "right" = "left";

    for (let i = 0; i < numCircles; i++) {
      circles.push({
        side,
        top: initialTop + i * spacing,
      });
      side = side === "left" ? "right" : "left";
    }

    return circles;
  }
}
