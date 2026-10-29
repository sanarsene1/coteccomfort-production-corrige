// Moteur de secours : répond sans API quand Grok est indisponible ou non configuré.
// Il comprend des intentions (pas des mots-clés figés), garde le fil de la conversation
// et s’appuie sur la fiche officielle COTEC + une petite base technique générale.

import { readFileSync } from 'node:fs';
import { COTEC } from './knowledge.js';

const t = COTEC.tarifs;
const WA = COTEC.telephone;

// ---------- outils ----------
export const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/[^a-z0-9$\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const has = (n, ...re) => re.some((r) => r.test(n));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const vouvoie = (n) => /\b(vous|votre|vos)\b/.test(n);
const tutoie = (n) => /\b(tu|toi|ton|ta|tes|t es|t as|peux tu|es tu|vas tu|sais tu)\b/.test(n);

// ---------- base technique (générale, sans prix ni promesses commerciales) ----------
let kb = [];
try {
  kb = JSON.parse(readFileSync(new URL('./kb.json', import.meta.url), 'utf8'));
} catch {
  kb = [];
}
const STOP = new Set(
  'le la les un une des de du d l et ou a au aux en dans pour par sur avec sans que qui quoi est es suis sont ce cet cette ces mon ma mes ton ta tes son sa ses notre votre vos leur leurs je tu il elle on nous vous ils elles me te se y ne pas plus comment pourquoi quand quel quelle quels quelles puis peux veux faut fait faire cest jai si mais donc car ni tres bien tout tous peut dois doit pouvez voudrais voudrai aimerais besoin question info information svp merci bureau maison commencer methode fiable choisir evaluer preparer decider avant expliquer explique cest quoi'
    .split(' ')
);
const SHORT_OK = new Set(['ip', 'ia', 'ai', 'vpn', 'dns', 'iot', 'lan', 'nat', 'poe', 'ssid', 'wan']);
const tokens = (s) =>
  normalize(s)
    .replace(/\bwi ?fi\b/g, 'wifi')
    .split(' ')
    .filter((w) => !STOP.has(w) && (w.length > 3 || SHORT_OK.has(w) || (w.length >= 2 && /\d/.test(w))));

// Index pondéré (IDF) : les mots rares (vlan, 6e, dhcp…) comptent plus que les mots courants.
const docs = kb.map((e) => ({ e, set: new Set([...e.q, e.cat].flatMap(tokens)) }));
const df = new Map();
for (const d of docs) for (const w of d.set) df.set(w, (df.get(w) || 0) + 1);
const idf = (w) => Math.log((docs.length + 1) / (1 + (df.get(w) || 0)));

function searchKb(message) {
  if (/\b(cotec|comfort)\b/.test(normalize(message))) return null;
  const q = [...new Set(tokens(message))].filter((w) => df.has(w));
  if (!q.length) return null;
  const total = q.reduce((sum, w) => sum + idf(w), 0);
  let best = null;
  for (const d of docs) {
    let got = 0;
    let rare = false;
    for (const w of q) {
      if (d.set.has(w)) {
        got += idf(w);
        if (idf(w) > 2.5) rare = true;
      }
    }
    const score = got / total;
    if (((rare && score >= 0.5) || (score >= 0.99 && q.length >= 2)) && (!best || score > best.score)) best = { e: d.e, score };
  }
  return best ? best.e.a : null;
}

// ---------- intentions ----------
function detect(n) {
  if (!n) return 'vide';
  if (has(n, /\b(merci|thanks|thank you|shukrani)\b/) && n.split(' ').length <= 6) return 'merci';
  if (has(n, /\b(au revoir|a bientot|a plus|bye|bonne soiree|bonne journee|ciao)\b/)) return 'adieu';
  if (has(n, /(comment (tu )?(vas|va|allez)|comment ca va|ca va\b|tu vas bien|vous allez bien|la forme)/)) return 'etat';
  if (has(n, /(tu es qui|t es qui|qui es tu|qui etes vous|vous etes qui|quel est (ton|votre) nom|comment (tu )?t appelles|comment vous appelez|tu t appelles|ton nom|ton prenom)/)) return 'nom';
  if (has(n, /(tu es la|t es la|es tu la|vous etes la|y a quelqu un|allo\b|tu m entends|quelqu un)/)) return 'present';
  if (has(n, /(es tu|tu es|t es|etes vous|vous etes) (un |une )?(robot|bot|ia\b|humain|humaine|vrai|reel|personne|grok|chatgpt|gpt|intelligence)/, /(qui t a (cree|fait|programme)|quel modele|quelle ia|quelle technologie|grok|xai|chatgpt|openai)/)) return 'identite_ia';
  if (has(n, /\b(bonjour|bonsoir|salut|coucou|hello|hi|hey|salam|jambo|mambo|bjr)\b/)) return 'salut';

  // --- procédures techniques tirées du rapport de stage (étapes réellement pratiquées chez COTEC)
  if (has(n, /(sertir|sertissage|rj45|rj 45|t568|testeur de cable|pince a sertir)/) && has(n, /(comment|etape|faire|sert|norme|c est quoi|c quoi)/)) return 'h_sertissage';
  if (has(n, /(tp ?link|routeur)/) && has(n, /(configur|parametr|installer|regler|mettre en place|acceder|interface)/) && !/(mikrotik|starlink)/.test(n)) return 'h_tplink';
  if (has(n, /(mikrotik|winbox)/) && has(n, /(configur|parametr|bridge|dhcp|nat|masquerade|comment|regler)/)) return 'h_mikrotik';
  if (has(n, /(mikhmon|hotspot|voucher|ticket wifi|wifi payant)/)) return 'h_hotspot';
  if (has(n, /(repeter|repeteur|repetition|extender|etendre (le )?(wifi|signal|portee)|booster le wifi)/)) return 'h_repeteur';
  if (has(n, /(nanostation|litebeam|point a point|cambium|rocket)/) && has(n, /(configur|aligner|alignement|orienter|comment|regler|mode station|mode ap|access point)/)) return 'h_p2p';
  if (has(n, /(starlink)/) && has(n, /(comment|etapes|installer|installation|orienter|emplacement)/) && !/(prix|combien|cout|tarif|coute)/.test(n) && !/(vous|tu|votre|faites)/.test(n)) return 'h_starlink';
  // --- COTEC : identité, fondateurs, adresse, ancienneté (tolère les fautes : « c quoi », « fonder »…)
  if (has(n, /(connais (pas|meme pas)|connait (pas|meme pas)|tu sais rien|tu ne sais pas|tu connais cotec|connaissez vous cotec)/) && /cotec|comfort/.test(n)) return 'cotec';
  if (has(n, /(qui (a |ont )?(fonde|fonder|cree|creer|lance|monte)|fondateur|createur|qui est derriere)/)) return 'fondateurs';
  if (has(n, /((vous etes|tu es|etes vous|c|cest|c est) ou\b|ou (est|se trouve|etes vous|vous etes|se situe|habitez)|adresse|localis|situee|situe\b|immeuble|quel quartier|comment (vous )?trouver|siege)/) && !/adresse ip/.test(n) && !/(mon |ma |chez moi|chez nous)/.test(n)) return 'adresse';
  if (has(n, /(rccm|registre du commerce|id nat|identification nationale|statut juridique|legalement|enregistre)/)) return 'juridique';
  if (has(n, /(c quoi|c est quoi|ces quoi|kesako|qu est ce|que veut dire|signifie|parle moi de|presente moi|presentez)\s*(que )?(la |le |l )?(societe |entreprise )?(cotec|comfort)/, /\b(cotec|comfort technologies?)\b.*\b(c est quoi|c quoi)\b/, /^\s*(cotec|comfort technologies?)\s*$/)) return 'cotec';
  if (has(n, /(vulamba|musienene|realisation|projets? (realise|deja)|references?|deja installe|exemples? d installation)/)) return 'terrain';
  if (has(n, /(programme|contenu|module|au programme|que vais je apprendre|qu est ce qu on apprend)/) && /(formation|stage)/.test(n)) return 'programme';
  if (has(n, /(quelle formation|quelles formations|quelle formation tu|formation (que|qu) (tu|vous))/)) return 'programme';
  if (has(n, /(priere|culture d entreprise|valeurs|ambiance|travailler chez|travailler a cotec|emploi|offre d emploi)/)) return 'culture';
  if (has(n, /(tu fais quoi|que fais tu|ton role|a quoi tu sers|tu sers a quoi|que sais tu faire|tu sais faire quoi)/)) return 'role';
  if (has(n, /(ton age|quel age as tu|tu as quel age|tu viens d ou|tu habites)/)) return 'perso';
  if (has(n, /(qui est (le |la )?(chef|patron|boss|directeur|directrice|dg|pdg|responsable|gerant|proprietaire)|qui dirige|qui gere|directeur general|qui sont (les )?(responsables|dirigeants))/)) return 'chef';
  if (has(n, /(equipe|personnel|employes|techniciens|collaborateurs|qui travaille|responsable (technique|commercial|marketing|financier|rh|juridique))/)) return 'equipe';
  if (has(n, /(qui (est|sont) (cotec|comfort|vous)|c est quoi cotec|qu est ce que cotec|que fait cotec|qu est ce que vous faites|que faites vous|presente|a propos|mission|activites|histoire|depuis quand|fondee|creee)/, /\bcotec\b.*\b(fait|exactement)\b/)) return 'cotec';

  if (has(n, /^(comment (ca|cela|tout ca) (marche|fonctionne|se passe)|comment faire|comment proceder|comment ca se deroule|etapes)/) && !/(wifi|routeur|starlink|vlan|ip\b)/.test(n)) return 'fonctionnement';
  if (has(n, /(stage|stagiaire|internship|formation|former|apprendre|apprentissage|cours\b|candidature)/)) return has(n, /(prix|combien|tarif|cout|coute|frais|payant|gratuit)/) ? 'prix_stage' : 'stage';
  if (has(n, /(delai|combien de temps|duree|rapidite|quand (pouvez|peut)|mise en place|rendez vous|disponible quand|des quand)/)) return 'delai';
  if (has(n, /(starlink|spacex)/) && has(n, /(prix|combien|cout|tarif|\$|dollar|coute|budget)/)) return /mini/.test(n) ? 'prix_mini' : /(standard|classique|normal)/.test(n) ? 'prix_standard' : 'prix_starlink';
  if (has(n, /\bmini\b/) && has(n, /(prix|combien|cout|tarif|coute)/)) return 'prix_mini';
  if (has(n, /(abonne|abonnement|reabonn|forfait|mensuel|par mois|illimite|souscri)/)) return 'abonnement';
  if (has(n, /(combien|prix|tarif|coute|cout|budget|c est cher|moins cher|promotion|promo|reduction|gratuit)/)) return 'prix';
  if (has(n, /(starlink|spacex)/)) return 'starlink';
  if (has(n, /(devis|estimation)/)) return 'devis';
  if (has(n, /(installation|installer|poser|pose\b|installez|mise en service)/) || (has(n, /(configurer|configuration)/) && has(n, /(starlink|antenne|kit|chez moi|chez nous)/))) return 'installation';
  if (has(n, /(maintenance|panne|depann|probleme|ne marche|marche pas|coupure|lent|lenteur|connexion instable|plus d internet|reparation|reparer)/)) return 'maintenance';
  if (has(n, /(point a point|liaison|relier|deux sites|entre (deux )?(batiments|bureaux|sites)|nanostation|litebeam|cambium|antenne)/)) return 'p2p';
  if (has(n, /(camera|video ?surveillance|surveillance)/)) return 'camera';
  if (has(n, /(reseau|wifi|wi fi|internet|connexion)/) && has(n, /(faites|faire|proposez|offrez|installez|avez)/)) return 'reseau';
  if (has(n, /(solaire|panneau|energie|onduleur|batterie|electricite)/)) return 'solaire';
  if (has(n, /(boutique|shop|acheter|achat|vendez|vente|materiel|equipement|routeur|router|switch|tp ?link|mikrotik|tenda|wavlink|ubiquiti|hikvision)/)) return 'boutique';
  if (has(n, /(cyber ?securite|securite informatique|pirat|hack|virus|antivirus|phishing|vpn|firewall|pare feu|mot de passe)/)) return 'cyber';
  if (has(n, /(reseau|wifi|wi fi|lan\b|vlan|entreprise|bureau|societe|hotel|ecole|commerce|boutique)/) && has(n, /(solution|conseil|recommand|besoin|pour mon|pour ma|quelle|quel)/)) return 'conseil';
  if (has(n, /(contact|contacter|joindre|telephone|numero|appeler|appel|whatsapp|mail|email|courriel|(votre|vos|l|ton) adresse|localisation|ou etes vous|ou se trouve|trouver)/) && !/adresse ip/.test(n)) return 'contact';
  if (has(n, /(butembo|beni|kasindi|goma|nord kivu|zone|couverture|region|ville|quartier|intervenez|livrez)/)) return 'zone';
  if (has(n, /(horaire|heure d ouverture|ouvert|ferme|24 ?h|assistance)/)) return 'horaires';
  if (has(n, /(paiement|payer|mobile money|m pesa|airtel|orange|facture|cash|virement)/)) return 'paiement';
  if (has(n, /(conseil|aider|aide|orienter|recommand|que me proposez|que proposez|quelle solution|quoi choisir|je cherche|j ai besoin|besoin)/)) return 'conseil';
  if (has(n, /(service|offre|propose|proposez|solutions?)/)) return 'services';
  if (has(n, /(bizarre|nul|inutile|stupide|incompetent|ne comprends pas|tu comprends rien|pas clair)/)) return 'frustration';
  return null;
}

// ---------- réponses ----------
const R = {
  vide: () => 'Je suis là. Écris-moi ta question quand tu veux.',
  merci: () => pick(['Avec plaisir ! Si tu as autre chose, je suis là.', 'De rien, c’est un plaisir de t’aider.', 'Avec plaisir. N’hésite pas si une autre question te vient.']),
  adieu: () => pick(['À bientôt ! Et si tu as besoin, COTEC est joignable sur WhatsApp au ' + WA + '.', 'Merci de ta visite, à très vite chez COTEC !']),
  salut: (n) => {
    const t2 = tutoie(n) || /\b(salut|coucou|hey)\b/.test(n);
    const base = /bonsoir/.test(n) ? 'Bonsoir !' : /bonjour|bjr/.test(n) ? 'Bonjour !' : t2 ? 'Salut !' : 'Bonjour !';
    const aide = t2 ? 'Que puis-je faire pour toi ?' : 'Que puis-je faire pour vous ?';
    return /(comment|ca va)/.test(n) ? `${base} Je vais bien, merci, et ${t2 ? 'toi' : 'vous'} ? ${aide}` : `${base} Je suis COTEC IA. ${aide}`;
  },
  etat: (n) => (!vouvoie(n) ? pick(['Je vais bien, merci, et toi ? Dis-moi ce que je peux faire pour toi.', 'Ça va très bien, merci ! Et toi ? Je peux t’aider sur Internet, Starlink, installation ou formation.']) : pick(['Je vais bien, merci, et vous ? Dites-moi comment je peux vous aider.', 'Très bien, merci ! Je peux vous renseigner sur nos offres, installations ou formations.'])),
  nom: () => 'Je m’appelle COTEC IA, je suis l’assistante de COMFORT TECHNOLOGIES COTEC à Butembo. Et toi, tu es ?',
  present: () => pick(['Oui, je suis là ! Que puis-je faire pour toi ?', 'Je suis là, je t’écoute. Qu’est-ce que je peux faire pour toi ?']),
  identite_ia: () => 'Je suis COTEC IA, l’assistante virtuelle de COTEC. Je ne suis pas une personne, mais je connais bien nos services et je peux te mettre en relation avec un conseiller quand il le faut. Qu’est-ce que je peux faire pour toi ?',
  chef: () => `Sur notre site, le Directeur Général est Désiré Kambale, et le Responsable Technique est Priscille Muhindo. COTEC a été fondée en ${COTEC.fondation} par ${COTEC.fondateurs.slice(0, 2).join(', ')} et ${COTEC.fondateurs[2]}. Tu veux que je te présente le reste de l’équipe ?`,
  equipe: () => 'Voici l’équipe de direction : Désiré Kambale (Directeur Général), Priscille Muhindo (technique), David Musafiri (commercial), Grâce Kavira (marketing), Patrick Vahira (finances), Esther Mulindwa (RH) et Jean Silso (juridique). Sur le terrain, nos techniciens réseau sont Emmanuel Paluku et Kevin Kasereka. Tu as besoin d’un service en particulier ?',
  cotec: () => `COMFORT TECHNOLOGIES COTEC est une entreprise de technologie et de connectivité basée à Butembo (${COTEC.adresse}), fondée en ${COTEC.fondation}. Elle fournit l’accès Internet haut débit, installe Starlink, des antennes et des liaisons point à point, vend et configure du matériel réseau (TP-Link, MikroTik, Cambium, Ubiquiti…), installe des caméras de surveillance, assure la maintenance et accueille des stagiaires. Qu’est-ce que tu veux savoir de plus ?`,
  h_sertissage: () => 'Pour sertir un câble réseau : 1) dénuder l’extrémité pour libérer les 8 fils ; 2) les ranger dans l’ordre de la norme T568B ; 3) les couper à la même longueur et les insérer bien droits dans le connecteur RJ45 ; 4) sertir avec la pince ; 5) tester avec le testeur de câble : les 8 voyants doivent s’allumer. C’est ce qu’on enseigne dès la première semaine de stage chez COTEC.',
  h_tplink: () => 'Pour configurer un routeur TP-Link : 1) branche ton ordinateur au routeur (câble ou Wi-Fi) et ouvre l’interface dans le navigateur, souvent 192.168.0.1 ou 192.168.1.1 ; 2) connecte-toi avec les identifiants par défaut ; 3) dans le sans-fil, choisis le nom du réseau (SSID) et le mot de passe ; 4) dans WAN, choisis DHCP ou Statique selon ta source Internet ; 5) enregistre et redémarre. Tu veux la méthode pour le mode répéteur aussi ?',
  h_mikrotik: () => 'Configuration de base d’un MikroTik avec Winbox : 1) ouvre Winbox et connecte-toi par l’adresse MAC ; 2) menu Bridge : crée un bridge et ajoute les interfaces (ex. ether2 et wlan1) ; 3) IP > Addresses : donne une IP au bridge (ex. 192.168.88.1/24) ; 4) IP > DHCP Client pour recevoir Internet d’en amont ; 5) IP > DHCP Server pour distribuer les IP ; 6) IP > Firewall > NAT : règle masquerade sur l’interface reliée à Internet. Tu veux aussi le mode hotspot ?',
  h_hotspot: () => 'Hotspot avec Mikhmon : 1) active le hotspot sur le MikroTik (IP > Hotspot) sur la bonne interface ; 2) connecte Mikhmon au MikroTik avec son IP et ses identifiants ; 3) crée un profil de vente (durée, vitesse, prix) ; 4) génère des vouchers (codes d’accès) pour tes clients ; 5) suis les utilisateurs connectés et le temps restant depuis Mikhmon.',
  h_repeteur: () => 'Pour répéter un Wi-Fi avec un routeur : 1) ouvre l’interface du routeur (192.168.1.1 ou 192.168.0.1) ; 2) dans les paramètres sans fil, choisis le mode Répéteur (Range Extender ou WISP selon le modèle) ; 3) lance la recherche, sélectionne le réseau à répéter et entre son mot de passe ; 4) enregistre et redémarre. Il captera le Wi-Fi existant et le redistribuera.',
  h_p2p: () => 'Liaison point à point : un équipement en mode Access Point (diffuse) et l’autre en mode Station (se connecte), avec la même fréquence et le même canal. Les deux antennes doivent se voir sans obstacle (arbres, bâtiments) et être orientées l’une vers l’autre. On ajuste l’alignement avec l’indicateur de signal (ou l’outil d’alignement pour Cambium) jusqu’au meilleur niveau. Ça marche pareil pour NanoStation et LiteBeam, avec des portées qui varient selon le modèle. Quelle distance veux-tu couvrir ?',
  h_starlink: () => 'Installation Starlink : 1) choisis un emplacement dégagé, sans obstacle au-dessus de l’antenne ; 2) fixe l’antenne sur son support et relie-la au routeur du kit ; 3) mets sous tension et oriente avec l’application Starlink, qui indique la qualité du signal ; 4) vérifie que Internet fonctionne sur les appareils. Chez COTEC, on s’en occupe pour toi et l’installation est gratuite.',
  fondateurs: () => `COTEC a été fondée en ${COTEC.fondation} par trois ingénieurs congolais : ${COTEC.fondateurs[0]}, ${COTEC.fondateurs[1]} et ${COTEC.fondateurs[2]}. Au départ, l’entreprise vendait et configurait du matériel informatique, puis elle s’est lancée dans la distribution d’Internet haut débit à Butembo. Tu veux connaître nos services ?`,
  adresse: () => `Notre siège est à Butembo, dans l’${COTEC.adresse}. On intervient aussi autour de la ville (Beni, Kasindi…). Pour passer nous voir ou prendre rendez-vous, le plus simple est le ${WA} (appel ou WhatsApp).`,
  juridique: () => `COTEC est une entreprise enregistrée en RDC : ${COTEC.juridique}. Besoin d’autre chose sur l’entreprise ?`,
  terrain: () => 'Quelques exemples sur le terrain : le site de Vulamba, dont une antenne Rocket en mode AP partage la connexion jusqu’à Musienene (des habitants reçoivent le signal avec une antenne Station chez eux) ; des liaisons point à point entre galeries commerciales ; des installations Starlink pour des commerçants ; et des hotspots Wi-Fi payants avec MikroTik. Tu as un projet comparable ?',
  programme: () => 'Le programme de formation et de stage couvre : les bases du réseau (IP, câbles, Wi-Fi), le sertissage RJ45 (norme T568B) et le test des câbles, la configuration de routeurs (TP-Link, Tenda, WavLink), MikroTik avec Winbox (bridge, DHCP, NAT, hotspot Mikhmon), les antennes (NanoStation, LiteBeam, Cambium, Rocket) et les liaisons point à point, l’installation de Starlink, la vidéosurveillance, puis de la pratique sur le terrain. On observe d’abord l’encadreur, puis on pratique sous son contrôle. Tu veux savoir comment déposer ton dossier ?',
  culture: () => 'Chez COTEC, la semaine commence chaque lundi par un moment de prière et de louange avec toute l’équipe, dans un esprit d’unité et de respect. Pour une candidature (stage, formation), c’est la page « Stage & Formation » du site.',
  role: () => 'Je suis COTEC IA : je réponds sur l’entreprise, Internet, Starlink, les antennes, le Wi-Fi, l’installation, le dépannage, les tarifs et les stages. Si je ne sais pas, je te dirige vers l’équipe plutôt que d’inventer. Qu’est-ce qui t’amène ?',
  perso: () => 'Je suis une assistante virtuelle, donc pas d’âge ni de ville à moi, mais je suis au service de COTEC à Butembo. Je peux t’aider sur quoi ?',
  prix_mini: () => `Le Starlink Mini est à ${t.starlinkMini.prix} $ (au lieu de ${t.starlinkMini.ancien} $), installation gratuite. C’est un kit compact, facile à déplacer, idéal pour une maison, une boutique ou un petit bureau. Tu comptes l’utiliser où ?`,
  prix_standard: () => `Le Starlink Standard est à ${t.starlinkStandard.prix} $ (au lieu de ${t.starlinkStandard.ancien} $), installation gratuite. Il est pensé pour un usage quotidien à la maison ou dans un espace professionnel. C’est pour quel type de site ?`,
  prix_starlink: () => `Pour Starlink, on a deux kits avec installation gratuite : le Mini à ${t.starlinkMini.prix} $ (compact, facile à déplacer) et le Standard à ${t.starlinkStandard.prix} $ (usage quotidien, maison ou bureau). Tu as plutôt besoin d’un kit portable ou d’une installation fixe ?`,
  starlink: () => 'On fournit, installe et configure Starlink : étude de l’emplacement, pose et alignement, câblage propre, configuration du Wi-Fi et test de vitesse. L’installation est gratuite. Tu veux connaître les prix des kits ?',
  abonnement: () => `Deux formules mensuelles : l’abonnement point à point illimité à ${t.abonnementPointAPoint.prix} $/mois (au lieu de ${t.abonnementPointAPoint.ancien} $), selon la couverture, et l’abonnement à ${t.abonnementStarlinkClient.prix} $/mois si tu as déjà ton propre kit Starlink. Dis-moi ton quartier à Butembo et on vérifie la couverture.`,
  prix: () => `Voici nos tarifs : Starlink Mini ${t.starlinkMini.prix} $, Starlink Standard ${t.starlinkStandard.prix} $ (installation gratuite), abonnement Internet à partir de ${t.abonnementPointAPoint.prix} $/mois. Pour le matériel réseau, caméras ou liaisons point à point, le prix dépend de ton site : on te fait un devis. Quel service t’intéresse ?`,
  devis: () => 'Pour un devis précis, il me faut ta zone, le type de service voulu (Internet, Starlink, antennes, caméras…), la taille du site et ton usage. Envoie-nous ça sur WhatsApp au ' + WA + ' et l’équipe te répond avec une offre claire.',
  delai: () => 'Il n’y a pas de délai fixe : ça dépend de ta zone, du matériel et du planning de l’équipe. On convient d’abord d’un rendez-vous pour vérifier ton site, puis on installe et on teste le réseau avec toi. Pour une date précise, écris-nous sur WhatsApp au ' + WA + '.',
  installation: () => 'L’installation est gratuite. Concrètement : on vérifie la vue du ciel et le meilleur emplacement, on pose et aligne l’équipement, on passe les câbles proprement, puis on configure le Wi-Fi et on teste la vitesse avec toi. Dis-moi ta localisation et si tu as déjà acheté le kit.',
  maintenance: () => 'Désolée pour ce souci. Si tu es abonné COTEC, la maintenance est gratuite : un ingénieur vérifie le routeur, le Wi-Fi et la liaison, et intervient chez toi. Hors abonnement, on diagnostique d’abord et on te communique les frais avant toute intervention. Peux-tu me dire ce qui se passe exactement (plus d’Internet, connexion lente, Wi-Fi qui coupe) ?',
  fonctionnement: () => 'C’est simple : tu nous dis où tu te trouves et ce que tu veux (Internet, Starlink, antennes, caméras…). On vérifie la couverture ou on passe voir ton site, on te confirme l’offre et le tarif, puis on installe, on configure et on teste le réseau avec toi. Quel est ton besoin ?',
  reseau: () => 'Oui, le réseau est notre cœur de métier : accès Internet, Wi-Fi, antennes longue portée, liaisons point à point entre sites, configuration de routeurs (TP-Link, MikroTik, Tenda…), et maintenance. Tu as un projet pour une maison, un commerce ou une entreprise ?',
  p2p: () => 'On installe des liaisons sans fil point à point pour relier bâtiments, bureaux ou sites, avec des antennes LiteBeam, NanoStation ou Cambium. On étudie d’abord la distance et les obstacles. Quelle distance sépare tes deux sites, à peu près ?',
  camera: () => 'Oui, on installe et on configure des systèmes de vidéosurveillance pour les maisons, commerces et entreprises. Pour te donner une idée juste du budget, l’équipe a besoin du nombre de caméras et de la taille du site : le plus simple est de nous écrire sur WhatsApp au ' + WA + '.',
  solaire: () => 'Notre domaine couvre connectivité, réseaux et énergie, et l’équipement solaire fait partie des choix de notre formulaire d’installation. Pour savoir ce qui est possible dans ton cas, l’équipe te conseille sur WhatsApp au ' + WA + '. C’est pour quel usage ?',
  boutique: () => 'Oui, on fournit et configure des équipements réseau : routeurs TP-Link, Tenda, WavLink, MikroTik, antennes Ubiquiti et Cambium, caméras Hikvision, et les kits Starlink. Tu peux voir la boutique sur le site, et l’équipe confirme prix et disponibilité sur WhatsApp. Tu cherches quel type d’équipement ?',
  cyber: () => 'Pour la cybersécurité avancée, je ne vois pas de service dédié dans notre offre actuelle ; je préfère être honnête là-dessus. En revanche, on configure des réseaux Wi-Fi sécurisés, et quelques réflexes aident beaucoup : changer le mot de passe par défaut du routeur, le tenir à jour, et utiliser un Wi-Fi invité. Pour un besoin précis, l’équipe peut te dire ce qui est possible au ' + WA + '.',
  conseil: () => 'Avec plaisir. Pour te recommander la bonne solution, j’ai besoin de trois choses : où se trouve le site (Butembo, Beni, Kasindi…), l’usage (maison, commerce, bureau, plusieurs bâtiments) et si tu as déjà du matériel. Tu peux commencer par la première ?',
  contact: () => `Tu peux nous joindre au ${COTEC.telephone} (appel et WhatsApp), par e-mail à ${COTEC.email}, ou via le formulaire de la page Contact. On est à Butembo, au Nord-Kivu, et on intervient dans la région.`,
  zone: () => 'On est basés à Butembo et on intervient dans le Nord-Kivu ; le formulaire d’installation propose Butembo, Beni et Kasindi. La couverture se vérifie à ton adresse : envoie-nous ton quartier ou un repère sur WhatsApp au ' + WA + '.',
  horaires: () => 'Notre site annonce une assistance 24 h/24 et 7 j/7. Pour une urgence, le plus rapide est WhatsApp ou l’appel au ' + WA + '.',
  paiement: () => 'Je n’ai pas le détail des modes de paiement. Les frais de départ et le paiement se confirment avec l’équipe au moment de choisir la formule ; écris-leur sur WhatsApp au ' + WA + '.',
  prix_stage: () => `Je n’ai pas de tarif publié pour les stages et formations, et je préfère ne pas t’en donner un au hasard. Les conditions se confirment avec l’équipe : écris-leur sur WhatsApp au ${WA}. Si tu veux déposer ta demande, c’est sur la page « Stage & Formation » (dossier en PDF, 5 Mo max par fichier).`,
  stage: () => `Oui, COTEC accueille des stages académiques et professionnels, ainsi que des formations (installation, antennes, Wi-Fi, Starlink). Tu déposes ton dossier en PDF sur la page « Stage & Formation » : lettre de demande, CV et une pièce complémentaire, 5 Mo max chacun. L’équipe étudie la demande et répond par WhatsApp ou e-mail. Tu cherches un stage ou une formation ?`,
  services: () => 'On propose : Internet haut débit, installation Starlink, antennes et Wi-Fi longue portée, liaisons point à point, vente et configuration de matériel réseau, vidéosurveillance, maintenance et dépannage, et des stages et formations. Quel sujet t’intéresse ?',
  frustration: () => 'Désolée si ma réponse n’était pas claire. Reprenons simplement : dis-moi ce que tu cherches (Internet, Starlink, installation, dépannage, stage…) et je te réponds précisément.',
  defaut: () => 'Je n’ai pas bien saisi, ou je n’ai pas cette information de façon fiable. Tu peux reformuler ? Je peux répondre sur COTEC, Internet, Starlink, l’installation, le dépannage, les tarifs ou les stages. Pour une demande précise, l’équipe répond sur WhatsApp au ' + WA + '.'
};

// Suivi de conversation : « et le standard ? », « et pour Beni ? », « oui », « combien ? »
function followUp(n, history) {
  const prevUser = [...history].reverse().find((m) => m.role === 'user');
  const prevTopic = prevUser ? detect(normalize(prevUser.text)) : null;
  if (/^(et|ok et|et pour|et le|et la|et les)\b/.test(n) || n.split(' ').length <= 3) {
    if (/\bstandard\b/.test(n) && prevTopic && /starlink|prix/.test(prevTopic)) return 'prix_standard';
    if (/\bmini\b/.test(n) && prevTopic && /starlink|prix/.test(prevTopic)) return 'prix_mini';
    if (/^(combien|prix|tarif|c est combien|ca coute combien)\b/.test(n) && prevTopic) {
      if (prevTopic === 'starlink') return 'prix_starlink';
      if (['installation', 'abonnement', 'camera', 'p2p', 'boutique'].includes(prevTopic)) return prevTopic === 'abonnement' ? 'abonnement' : 'devis';
    }
    if (/^(oui|ouais|d accord|ok|volontiers|vas y|go|svp)$/.test(n) && prevTopic) {
      if (prevTopic === 'chef') return 'equipe';
      if (['starlink', 'installation'].includes(prevTopic)) return 'prix_starlink';
      if (prevTopic === 'cotec') return 'services';
    }
  }
  return null;
}

export function localReply(message, history = []) {
  const n = normalize(message);
  let topic = detect(n) || followUp(n, history);

  // Cas mixte : salutation + vraie question → on traite la question.
  if (topic === 'salut' && n.split(' ').length > 5) {
    const rest = detect(n.replace(/\b(bonjour|bonsoir|salut|coucou|hello|hey)\b/g, ''));
    if (rest && rest !== 'salut') topic = rest;
  }

  if (topic === 'etat' && /\b(bonjour|bonsoir|salut|coucou|hello|hey)\b/.test(n)) topic = 'salut';

  const explicatif = /^(c est quoi|qu est ce (que|qu)|a quoi sert|difference|pourquoi|explique|comment (choisir|fonctionne|marche|securiser|configurer|ameliorer|eviter|reparer|tester|proteger))/.test(n);
  if (explicatif && ['installation', 'conseil', 'boutique', 'contact', 'reseau', 'services', 'cyber', 'zone', 'maintenance'].includes(topic)) {
    const tech = searchKb(message);
    if (tech) return `${tech} Si tu veux, l’équipe COTEC peut t’accompagner concrètement sur WhatsApp au ${WA}.`;
  }

  if (topic && R[topic]) return R[topic](n);

  const kbAnswer = searchKb(message);
  if (kbAnswer) return `${kbAnswer} Si tu veux, l’équipe COTEC peut t’accompagner concrètement sur WhatsApp au ${WA}.`;

  if (/\b(cotec|comfort)\b/.test(n)) return R.cotec();
  return R.defaut();
}
