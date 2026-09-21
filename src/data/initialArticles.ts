import { Article, Comment, NewsletterSubscriber, CategoryItem, Poll } from '../types';

import officialLogo from '../assets/images/sticky_and_kawaii_official_logo.png';
import featuredImg from '../assets/images/featured_stickers_art_1789967519218.jpg';
import tutorialImg from '../assets/images/tutorial_journal_art_1789967535689.jpg';
import boutiqueImg from '../assets/images/boutique_packaging_art_1789967550717.jpg';
import gazetteImg from '../assets/images/gazette_tea_art_1789967572992.jpg';

export { officialLogo as mascotImg, featuredImg, tutorialImg, boutiqueImg, gazetteImg };

export const defaultAuthor = {
  name: 'Karine',
  role: 'Créatrice & Illustratrice',
  avatar: officialLogo,
};

export const INITIAL_POLLS: Poll[] = [
  {
    id: 'poll-art-1',
    articleId: 'art-1',
    question: 'Quelle finition de sticker préférez-vous pour vos carnets ?',
    options: [
      { id: 'opt-1', text: 'Holographique scintillant ✨', votes: 124 },
      { id: 'opt-2', text: 'Mat velouté waterproof 🍑', votes: 89 },
      { id: 'opt-3', text: 'Dorure métallique or rose 👑', votes: 76 },
    ],
    totalVotes: 289,
  },
  {
    id: 'poll-art-2',
    articleId: 'art-2',
    question: 'Quel est votre support de journaling favori ?',
    options: [
      { id: 'p2-opt-1', text: 'Carnet à pointillés (Dot Grid) 📖', votes: 156 },
      { id: 'p2-opt-2', text: 'Classeur à anneaux transparent 📁', votes: 92 },
      { id: 'p2-opt-3', text: 'Bloc-notes détachable kawaii 📝', votes: 64 },
    ],
    totalVotes: 312,
  },
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-1',
    slug: 'coulisses-creation-collection-holographique-cosmique',
    title: 'Dans les coulisses de l’atelier : création de notre collection Holographique Cosmique',
    summary: 'Découvrez les croquis secrets, le choix minutieux du vinyle holographique et toutes les étapes artisanales pour donner vie à notre toute dernière collection de stickers scintillants !',
    category: 'Coulisses & Créations',
    readingTime: '5 min',
    publishedAt: '18 Septembre 2026',
    featured: true,
    status: 'published',
    coverImage: featuredImg,
    author: defaultAuthor,
    reactions: {
      stars: 142,
      hearts: 289,
      butterflies: 96,
    },
    tags: ['Stickers', 'Holographique', 'Coulisses', 'Procreate', 'Papeterie'],
    seo: {
      metaTitle: 'Dans les coulisses de l’atelier : stickers holographiques | Sticky',
      metaDescription: 'Découvrez les étapes artisanales de création de nos stickers holographiques cosmétiques : croquis Procreate, vinyle waterproof et découpe précise.',
      focusKeyword: 'stickers holographiques',
      canonicalUrl: 'https://blog.stickyandkawaii.eu/#article-coulisses-creation-collection-holographique-cosmique',
    },
    content: `
Bienvenue dans mon petit cocon créatif ! ✨

Aujourd’hui, j’avais tellement hâte de vous ouvrir les portes de mon atelier pour vous dévoiler l'histoire de la nouvelle collection **« Nébuleuse Douce & Chats Stellaires »**. Quand j’ai commencé à esquisser ces petits compagnons flottant parmi les étoiles pastel, je savais qu'un vinyle standard ne suffirait pas : il fallait ce reflet miroitant, magique et hypnotisant que seul un film holographique de haute qualité peut apporter.

### 🎨 Étape 1 : Des premiers croquis à l'iPad
Tout commence toujours avec une bonne tasse de thé vert et mon casque audio à oreilles de chat sur les oreilles. Sur Procreate, j'aime tester des dizaines de palettes de couleurs : du violet lilas, du rose barbe à papa, et des touches de jaune beurre doux. 

> *« Créer un sticker kawaii, c'est capturer une dose pure de réconfort et la transformer en un petit objet que l'on peut emporter partout avec soi. »*

La difficulté majeure pour les stickers holographiques, c'est de doser la sous-couche blanche. Si l'on met du blanc sous toute l'illustration, l'effet miroir disparaît ! J'ai donc choisi de laisser le contour des étoiles, les reflets des yeux des chatons et la poussière de lune transparents pour qu'ils s'illuminent sous chaque rayon de soleil.

### ✂️ Étape 2 : L'impression haute définition et la découpe die-cut
Une fois les fichiers préparés, place à la machine de découpe. Chaque planche est découpée avec une précision chirurgicale. Le vinyle que nous utilisons pour cette collection est :
- **100% waterproof** (résiste à vos gourdes d'eau et tasses)
- **Résistant aux UV** (les couleurs ne ternissent pas au soleil)
- **Toucher velours ultra doux** avec finition scintillante

[poll:poll-art-1]

### 💡 L'astuce kawaii de Karine
Collez votre sticker sur un coin de votre ordinateur portable ou sur le dos de votre coque transparente pour admirer ses reflets changer en fonction de la lumière du jour !

Merci du fond du cœur pour votre enthousiasme incroyable lors de l'annonce sur Instagram. Les premières planches sont déjà prêtes à rejoindre vos enveloppes décorées !
    `.trim(),
  },
  {
    id: 'art-2',
    slug: 'tuto-diy-customiser-bullet-journal-toploader-kawaii',
    title: 'Tutoriel DIY : Customiser son Bullet Journal & ses toploaders de cartes avec style',
    summary: 'Apprenez à superposer washi tapes, rubans pastel et planches d’autocollants pour créer des pages de carnet féeriques et protéger vos photocards précieuses.',
    category: 'Tutoriels',
    readingTime: '6 min',
    publishedAt: '12 Septembre 2026',
    featured: false,
    status: 'published',
    coverImage: tutorialImg,
    author: defaultAuthor,
    reactions: {
      stars: 88,
      hearts: 215,
      butterflies: 134,
    },
    tags: ['Tuto DIY', 'Bullet Journal', 'Toploader', 'Washi Tape', 'Organisation'],
    seo: {
      metaTitle: 'Tutoriel DIY : Customiser son Bullet Journal & Toploaders Kawaii',
      metaDescription: 'Apprenez à superposer washi tapes, rubans pastel et planches d’autocollants pour créer des pages de carnet et protéger vos photocards.',
      focusKeyword: 'bullet journal',
      canonicalUrl: 'https://blog.stickyandkawaii.eu/#article-tuto-diy-customiser-bullet-journal-toploader-kawaii',
    },
    content: `
Sortez vos ciseaux à bouts ronds, vos pinces de précision et vos plus jolis rouleaux de washi tape : c'est l'heure du craft ! ✂️🌸

Que vous soyez passionné(e) de carnet de journaling ou collectionneur(euse) de cartes K-Pop et cartes à collectionner, la customisation kawaii permet de transformer un simple support plastique ou papier en une véritable œuvre d'art miniature.

### 📝 Le matériel indispensable :
1. Un toploader rigide transparent (ou votre carnet à pointillés favori)
2. Une pince courbée d'artisanat pour poser les stickers délicats sans laisser d'empreintes de doigts
3. Des stickers confettis, rubans et lettres Sticky and Kawaii
4. Un chiffon microfibre doux pour dépoussiérer la surface

### ✨ Guide pas-à-pas pour un toploader féerique :
- **Préparez la surface :** Nettoyez délicatement les deux faces du toploader pour éviter toute poussière.
- **Posez d'abord le cadre :** Utilisez les stickers de rubans ondulés ou de petites perles le long des quatre bordures extérieures pour créer une bordure cocooning.
- **Ajoutez le point focal :** Déposez un motif plus imposant en bas à droite (comme notre mascotte ou un petit gâteau moelleux).
- **Terminez par la poussière d'étoiles :** Comblez les petits espaces vides avec des micro-étoiles dorées ou holographiques.

> *« Ne cherchez pas la symétrie parfaite : ce sont les petits décalages doux et l'abondance de pastel qui rendent vos créations uniques ! »*

N'hésitez pas à partager vos chefs-d'œuvre avec le hashtag **#StickyKawaiiDIY** pour qu'on puisse les reposter avec amour !
    `.trim(),
  },
  {
    id: 'art-3',
    slug: 'nouveaux-packagings-eco-responsables-et-cadeaux-commandes',
    title: 'Nouveaux packagings éco-responsables & petits cadeaux glissés dans vos commandes !',
    summary: 'Découvrez notre nouvelle démarche zéro plastique : papier de soie violet lilas recyclable, rubans kraft et nos nouvelles cartes postales collectors offertes.',
    category: 'Actus Boutique',
    readingTime: '4 min',
    publishedAt: '05 Septembre 2026',
    featured: false,
    status: 'published',
    coverImage: boutiqueImg,
    author: defaultAuthor,
    reactions: {
      stars: 95,
      hearts: 178,
      butterflies: 82,
    },
    tags: ['Boutique', 'Eco-friendly', 'Packaging', 'Cadeaux', 'Goodies'],
    seo: {
      metaTitle: 'Packagings éco-responsables & Cadeaux collectors | Sticky',
      metaDescription: 'Découvrez notre démarche zéro plastique : papier de soie lilas recyclable, rubans kraft et nos cartes postales collectors offertes.',
      focusKeyword: 'packagings éco-responsables',
      canonicalUrl: 'https://blog.stickyandkawaii.eu/#article-nouveaux-packagings-eco-responsables-et-cadeaux-commandes',
    },
    content: `
Chaque commande passée sur **stickyandkawaii.eu** est préparée comme un véritable cadeau d'anniversaire que vous vous offrez à vous-même. 🎁💌

Depuis plusieurs mois, nous cherchions comment préserver cet émerveillement magique au moment de l'ouverture du colis tout en réduisant drastiquement notre impact environnemental. C'est désormais chose faite !

### 🌿 Ce qui change dans vos colis :
- **Enveloppes matelassées 100% papier recyclé :** Finies les bulles en plastique vierge, nous utilisons maintenant un capitonnage en fibres de papier alvéolé entièrement biodégradable.
- **Papier de soie lilas certifié FSC :** Teinté avec des encres végétales à l'eau sans solvants.
- **Sachets glassine compostables :** Pour protéger vos planches de stickers de l'humidité pendant le voyage.
- **Sceau adhésif gaufré :** Fermé à la main avec notre tampon mascotte exclusif.

### 💖 La surprise du mois
Pour fêter le lancement de cette initiative, chaque commande passée ce mois-ci contiendra une mini planche d'autocollants exclusive « Sweet Tea & Cats » non disponible à la vente, ainsi qu'un sachet de thé floral infusé pour vous accompagner lors de votre séance de journaling.

Merci de faire grandir cette belle aventure avec bienveillance et respect pour notre planète !
    `.trim(),
  },
  {
    id: 'art-4',
    slug: 'gazette-kawaii-12-inspirations-automne-thes-playlists',
    title: 'La Gazette Kawaii #12 : Nos inspirations douces pour l’automne, thés & playlists',
    summary: 'Quand les feuilles tombent et que l’air fraîchit, on enfile son pull oversize violet préféré. Voici notre sélection d’ambiances cosy pour dessiner et créer.',
    category: 'Gazettes',
    readingTime: '4 min',
    publishedAt: '01 Septembre 2026',
    featured: false,
    status: 'published',
    coverImage: gazetteImg,
    author: defaultAuthor,
    reactions: {
      stars: 120,
      hearts: 310,
      butterflies: 165,
    },
    tags: ['Gazette', 'Automne', 'Playlist', 'Inspiration', 'Cozy Life'],
    seo: {
      metaTitle: 'La Gazette Kawaii #12 : Inspirations d’automne, thés & playlists',
      metaDescription: 'Quand les feuilles tombent et que l’air fraîchit, découvrez notre sélection d’ambiances cosy pour dessiner, créer et boire du thé.',
      focusKeyword: 'gazette kawaii',
      canonicalUrl: 'https://blog.stickyandkawaii.eu/#article-gazette-kawaii-12-inspirations-automne-thes-playlists',
    },
    content: `
L'automne est officiellement là ! 🍁🍂

C'est ma saison favorite de l'année : celle des plaids tout doux, des boissons chaudes réconfortantes à la cannelle et des après-midis passés à gribouiller pendant que la pluie tambourine contre la fenêtre de l'atelier.

### 🍵 La recette du réconfort : Le Hojicha Latte vanillé
Pour accompagner vos séances de lecture ou de dessin :
- 1 cuillère à café de poudre de thé Hojicha (thé vert japonais torréfié aux notes de noisette)
- 60 ml d'eau chaude à 85°C pour fouetter
- 200 ml de lait d'avoine chaud et bien moussé
- Une goutte d'extrait de vanille naturelle et un trait de sirop d'agave

### 🎧 La Playlist du moment
Sur nos écouteurs violettes à oreilles de chat, tourne en boucle un mélange de Lofi Hip Hop doux, d'OST de Studio Ghibli au piano et de pop acoustique japonaise. Vous pouvez retrouver nos coups de cœur directement dans nos stories Instagram !

### 🎮 Et du côté de nos jeux ?
Avez-vous testé les nouveaux mini-jeux sur **jeux.stickyandkawaii.eu** ? Les mini-quêtes d'automne avec les glands magiques et la récolte de citrouilles pastel sont en ligne !

Prenez bien soin de vous et laissez la douceur envahir vos journées. 💜
    `.trim(),
  },
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comm-1',
    articleId: 'art-1',
    author: 'Mina_Stickers',
    avatarColor: 'bg-pink-100 text-pink-700',
    content: 'J’ai reçu ma commande hier et les reflets holographiques sont encore plus féeriques en vrai ! Gros coup de cœur pour le chat sur la lune 🌙✨',
    createdAt: 'Il y a 2 jours',
  },
  {
    id: 'comm-2',
    articleId: 'art-1',
    author: 'YukiCreative',
    avatarColor: 'bg-purple-100 text-purple-700',
    content: 'Merci pour ce partage des coulisses, c’est fascinant de voir comment tu gères la sous-couche blanche sur Procreate. Continue ton merveilleux travail !',
    createdAt: 'Il y a 1 jour',
  },
  {
    id: 'comm-3',
    articleId: 'art-2',
    author: 'Chloé_Pastel',
    avatarColor: 'bg-indigo-100 text-indigo-700',
    content: 'Trop bien le tuto pour les toploaders ! Je viens d’en faire trois pour mes photocards, le rendu avec la pince est tellement plus net.',
    createdAt: 'Il y a 5 jours',
  },
  {
    id: 'comm-4',
    articleId: 'art-3',
    author: 'Léna_Botanica',
    avatarColor: 'bg-emerald-100 text-emerald-700',
    content: 'Bravo pour la démarche éco-responsable ! C’est si rare d’allier esthétique kawaii et packaging zéro plastique. Vous êtes au top.',
    createdAt: 'Il y a 1 semaine',
  },
];

export const INITIAL_SUBSCRIBERS: NewsletterSubscriber[] = [
  {
    id: 'sub-1',
    email: 'camille.crea@gmail.com',
    subscribedAt: '2026-09-18T14:32:00.000Z',
    source: 'Formulaire bas de page',
  },
  {
    id: 'sub-2',
    email: 'julie.stationery@outlook.fr',
    subscribedAt: '2026-09-19T09:15:00.000Z',
    source: 'Formulaire bas de page',
  },
  {
    id: 'sub-3',
    email: 'sweet_kawaii_bujo@yahoo.com',
    subscribedAt: '2026-09-20T18:42:00.000Z',
    source: 'Formulaire bas de page',
  },
];

export const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-1',
    name: 'Coulisses & Créations',
    slug: 'coulisses-creations',
    description: 'Croquis, fabrication & secrets de stickers',
    icon: 'Palette',
    color: 'purple',
  },
  {
    id: 'cat-2',
    name: 'Actus Boutique',
    slug: 'actus-boutique',
    description: 'Nouveaux drops, packagings & cadeaux',
    icon: 'ShoppingBag',
    color: 'pink',
  },
  {
    id: 'cat-3',
    name: 'Tutoriels',
    slug: 'tutoriels',
    description: 'Guides DIY, bullet journal & toploaders',
    icon: 'Sparkles',
    color: 'amber',
  },
  {
    id: 'cat-4',
    name: 'Gazettes',
    slug: 'gazettes',
    description: 'Moments cosy, playlists & inspirations',
    icon: 'Coffee',
    color: 'emerald',
  },
];

