import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// Main App component
const App = () => {
  // Data structure for the mind map, organized drawing by drawing for the enluminure
  const initialMindMapData = {
    title: "🗺️ Carte Mentale : Enluminure et Manuscrit d'Énigmes (Dessin par Dessin, Mise à Jour)",
    nodes: [
      {
        id: 'cles_lecture',
        label: '🔑 Clés de Lecture Transversales',
        icon: '🔑',
        children: [
          // Anagramme a été déplacée dans la section "Liste des Énigmes"
          {
            id: 'chaines_dorees',
            label: '🔗 Le Motif des Chaînes Dorées',
            icon: '🔗',
            details: [
              'Ce motif est omniprésent et pourrait suggérer un dessin de constellation selon leur position ou un chemin tracé en reliant les chaînes.',
              'Cheval noir (Général) 🐎',
              'Clé de Saint Pierre (D1) 🔑',
              'Biche couchée (D3) 🦌',
              'Garde d\'Excalibur (D4) ⚔️',
              'Porte des bâtiments médiévaux (D4) 🏛️',
              'Barque de l\'homme capuché (D5) 🛶',
              'Hermès (D7) ⚡',
              'Vierge Marie (D7) 😇',
              'Soldat Romain (D9) 🏛️',
              'Dragon blanc à 3 têtes (D11) 🐉',
            ],
          },
          {
            id: 'excalibur_details',
            label: '⚔️ L\'Épée Excalibur (Centrale)',
            icon: '⚔️',
            details: [
              'Centrale sur toute la longueur de la page d\'enluminures.',
              'Rayure sur la lame : Suggère un chemin à suivre ➡️',
              'Sur la poignée : Symbole fond rouge et 3 carreaux blancs 🟥⬜',
              'Garde (D4) : Chaînette en or pendante avec inscriptions possibles "Noé (ou N-O)" et "S-E" 🧭',
              'Mentionnée explicitement dans E2 ("encore dans son rocher") et E13 ("dernière clé de la quête du Graal", "Tombée par trois fois")',
            ],
          },
          {
            id: 'blasons',
            label: '🛡️ Blasons et Héraldique',
            icon: '🛡️',
            details: [
              'Blason rouge (Général) : Identifié comme celui du chevalier Kahedin (beau-frère de Tristan) 🟥',
              'Blason avec 3 lapins (D1) : Pourrait correspondre au chevalier Courant de Roche Dure ("dur comme roche") 🐇🐇🐇',
              'Blason de Guillaume le Conquérant (D2) : Représenté sur la Tour de Londres 👑',
              'Blason de Lancelot (D2) : Reconnu sur l\'un des chevaliers 🛡️',
              'Blason deux bandes verticales or et rouge (D2) : À identifier 🟡🟥',
              'Blason deux bandes verticales vert et rouge et 3 ailes (D2) : À identifier 🟢🟥',
              'Blason 5 châteaux forts et 2 lions (D10) : Sur le chevalier doré, à déterminer 🏰🦁',
            ],
          },
          {
            id: 'dates_refs',
            label: '🗓️ Dates et Références Historiques',
            icon: '🗓️',
            details: [
              '1066 (D4 et D7) : Sacre de Guillaume le Conquérant à Westminster, mort du roi Harold 👑💀',
              '1095 (D7) : Date de la 1ère Croisade (Pape Urbain II) ✝️',
              'Tapisserie de Bayeux : "HIC SUNT MILITES" (D6, épisode de Rennes) 📜, "HAROLD REX INTERFECTUS EST" (D7) 📜',
              <img src="https://www.wiki-rennes.fr/Fichier:Tapisserie_de_bayeux_rennes.jpg" alt="Image of Tapisserie de Bayeux" className="max-w-full h-auto rounded-lg my-2 shadow-md" />,
              'Énigme 8 : "Bayeux Evad. Ectu" (déroute de Bayeux) lié à la Bataille d\'Hastings et la fuite de Rennes.',
              'Énigme 9 : "An de grâce qui vit mourir le numéro 1" (à identifier, possiblement Jésus).',
            ],
          },
          {
            id: 'syren_bells',
            label: '🔔 Le Motif des Cloches ("Syren Bells")',
            icon: '🔔',
            details: [
              'Quatre cloches reliées par des pointillés (D7) : Pensée au chemin de cloches de "Syren Bells" au sud de l\'Angleterre 🔔🔔🔔🔔',
              <img src="https://i.imgur.com/jl9vlhp.jpeg" alt="Image of Chemin de cloches de Siren Bells" className="max-w-full h-auto rounded-lg my-2 shadow-md" />,
              'Trèfle des cartes (D11) : Ressemblance avec une des "Syren Bells" 🍀',
              'Sanglier cachant une cloche (D12) : Ajoute au motif des cloches 🐗🔔',
            ],
          },
          {
            id: 'c_mystere',
            label: 'C Mystérieux',
            icon: '❓',
            details: [
              'Mentionné dans E6 (suite de chiffres), E7 ("4 C" au féminin, "une à une", suggérant des lieux), E10 ("avant-dernier C" au masculin).',
              'Indique des tracés ou des points à identifier sur la carte (E7, E10).',
            ],
          },
        ],
      },
      {
        id: 'enluminure_scenes',
        label: '🖼️ L\'Enluminure : Scène par Scène',
        icon: '🖼️',
        children: [
          {
            id: 'page_generale',
            label: 'Page Générale',
            details: [
              '4 Chevaliers dans médaillons (Coins) 🛡️: HG: SE ↘️ | HD: O ⬅️ | BG: E ➡️ | BD: NE ↗️',
              'Couronne royale (Bas centre) 👑',
              'Haut centre : Cheval noir (chaîne) 🐎🔗, Blason rouge (Kahedin) 🟥, Lion tenant boule verte 🦁🟢',
            ],
          },
          {
            id: 'dessin1',
            label: 'Dessin 1 : La Chute et la Quête',
            details: [
              '**Personnages** : Saint Pierre 😇, Adam & Ève 🍎, Dame du Lac Viviane 🧚‍♀️',
              '**Animaux** : Serpent 🐍, Lapin albinos 🐇',
              '**Lieux** : Carte Europe occidentale (tracé épée : Asturies-Pyrénées à Loch Ness) 🗺️⚔️',
              '**Symboles** : Clé Saint Pierre (chaînes) 🔑🔗, Cruche 🏺, Astre rouge (Soleil/Mars) 🔴☀️',
              '**Pistes** : Église du Graal Trehorenteuc (lapin/bélier) ⛪🐇🐑',
              '**Lien Énigme 1** : Pomme (Adam & Ève) peut aussi être Avalon ("l\'île aux pommiers") 🍎🏝️',
              '**Lien Énigme 2** : Tracé de l\'épée sur la carte confirmé, début de la quête.',
            ],
          },
          {
            id: 'dessin2',
            label: 'Dessin 2 : Le Taureau, la Tour et les Chevaliers',
            details: [
              '**Animaux** : Taureau blanc (yeux rouges) 🐂🔴',
              '**Personnages** : 9 Chevaliers 🛡️ (armures variées, épées colorées, blasons Lancelot, 2 à identifier), Saint (habit vert 🟢, barbe grise, bâton, pieds nus) 😇',
              '**Lieux** : Tour de Londres 🏰 (blason Guillaume 👑), Vénus de Milo au-dessus 🗽',
              '**Lien Énigme 3** : La Tour de Londres ("Tour-Krak boréale") est la solution de l\'énigme 3.',
            ],
          },
          {
            id: 'dessin3',
            label: 'Dessin 3 : Mystères de Cornouailles',
            details: [
              '**Texte/Symbole** : Carré Sator 📜 (SATOR AREPO TENET OPERA ROTAS)',
              '**Personnages** : Tristan & Iseult 💑, Lancelot & Guenièvre 💑 (sur promontoire)',
              '**Animaux** : Biche couchée (chaîne dorée) 🦌🔗',
              '**Lieux** : Château de Tintagel 🏰, Promontoire des Cornouailles ⛰️',
              '**Astre** : Astre bleu-gris (Lune/Vénus) 🔵⚪🌙',
              '**Lien Énigme 4** : Les couples sont confirmés, Tintagel est la "place forte" et le Carré Sator est complété par les lettres NTAE.',
            ],
          },
          {
            id: 'dessin4',
            label: 'Dessin 4 : Hiver et Rencontres Divines',
            details: [
              '**Paysage** : Hivernal ❄️ (Noël, 1066)',
              '**Lieux** : Abbaye de Westminster ⛪, Bâtiments médiévaux (porte verte avec chaîne) 🏛️🔗',
              '**Personnages** : Saint Nicolas 🎅 (croix blanche à l\'envers ✝️), Hermès ⚡ (caducée sans serpent, chaîne dorée 🔗), Vierge Marie 😇 (chaînette d\'or 🔗)',
              '**Animaux** : Cheval (Llamrei ?) 🐎',
              '**Inscriptions** : "HAROLD REX INTERFECTUS EST" 📜, 1066 🗓️',
              '**Symboles** : 4 cloches reliées (Syren Bells ?) 🔔🔔🔔🔔',
              '**Lien Énigme 5** : Abbaye de Westminster ("Thorn Ey") est le lieu de bénédiction du règne.',
            ],
          },
          {
            id: 'dessin5',
            label: 'Dessin 5 : Écosse, Magie et Tempête',
            details: [
              '**Personnages** : Saint André (croix en X ✖️) 😇, Homme capuché vert (rame dans barque avec chaîne) 🟢🛶🔗, Barde écossais (cornemuse, kilt rouge) 🎶🟥',
              '**Lieux** : Palais/Église 🏛️⛪, Entrée crypte/mausolée 🪦',
              '**Symboles** : Blason Clan Matheson ("fac et spera", vert, main épée couronne) 🟢🛡️',
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Clan_member_crest_badge_-_Clan_Matheson.svg/1280px-Clan_member_crest_badge_-_Clan_Matheson.svg.png" alt="Image of Devise du Clan Matheson" className="max-w-full h-auto rounded-lg my-2 shadow-md" />,
              'Vitrail zodiaque Chartres (nappe) 🌈',
              '**Lien Énigme 5** : La lame de l\'épée, après le déplacement, pourrait se situer sur le Loch du Clan Matheson.',
            ],
          },
          {
            id: 'dessin6',
            label: 'Dessin 6 : La Tente du Combat',
            details: [
              '**Lieu** : Tente sur plaine (guerre/chasse) 🏕️',
              '**Intérieur** : Fond/lit verts 🟢, tenture rouge 🟥, tête de cerf 🦌, balance avec chevaux (Arthur/Mordred ?) ⚖️🐎',
              '**Personnages** : Chevalier couronné blessé non saignant 🤕👑 (Roi Pêcheur/Arthur Camlann ?), Saint observateur (médaillon homme cheveux longs - Judas ?) 🕵️',
              '**Inscriptions** : "HIC SUNT MILITES" (Tapisserie de Bayeux) 📜',
              '**Lien Énigme 8** : L\'épisode du roi et de la lance renvoie au Roi Pêcheur.',
            ],
          },
          {
            id: 'dessin7',
            label: 'Dessin 7 : Urbain II, Jeu et Destin',
            details: [
              '**Paysage** : Grisâtre (automne, désolation, Terre Gaste ?) 🌫️🍂',
              '**Personnages** : Pape Urbain II 👑✝️ (1095, 2 clés 🔑🔑), Ange (livre jaune 🟡) 👼, Hermès ⚡, Vierge Marie 😇',
              '**Lieux** : Abbaye de Cluny ⛪ ("AMEN" en hébreu) 📜',
              <img src="https://i.imgur.com/gKUGtxG.jpeg" alt="Image of Abbaye de Cluny" className="max-w-full h-auto rounded-lg my-2 shadow-md" />,
              'Arbre (inscription Harold) 🌳',
              '**Symboles** : Jeu marelle/moulin (X central) 🎲, 4 oiseaux 🐦🐦🐦🐦, 4 cloches reliées (Syren Bells ?) 🔔🔔🔔🔔, 1066 🗓️',
              '**Lien Énigme 7** : Le jeu du moulin est la "partie preux contre dieux". Le Pape a commencé, l\'Ange a terminé. Le "10" au milieu et le "5" dans un pion rouge sont des indices.',
            ],
          },
          {
            id: 'dessin8',
            label: 'Dessin 8 : Le Combat Céleste',
            details: [
              '**Ciel** : Jupiter (foudre) ⚡🪐, 2 Anges (ailes vertes/rouges, habits rouges/verts) 🟢🔴👼, Grande couronne 👑',
              '**Personnages** : Géant 3 têtes vert vs Petit chevalier armure noire 🟢⚔️⚫ (Arthur/Mordred ?), Saint (tunique bleue 🔵, châle jaune 🟡, panier pains 🍞, gourde 🍶 - St Philippe/Jacques le Majeur ?), Personnage capuché noir (arc alambiqué - Robin des Bois ?) 👤🏹',
              '**Végétation** : Arbrisseau (Aubépine Glastonbury ?) 🌳',
              '**Lieux** : Château bord de lac/étang 🏰🏞️',
              '**Lien Énigme 9** : Le combat peut être lié aux "deux monstres" ou à la trahison.',
              '**Lien Énigme 10** : "Se tourner vers le ciel" pourrait faire référence aux anges et au combat céleste.',
            ],
          },
          {
            id: 'dessin9',
            label: 'Dessin 9 : Printemps et le Graal',
            details: [
              '**Paysage** : Printanier 🌸, Lac 2 cygnes 🦢🦢, Château 🏰, Ville orangée (tours bleues, viaduc) 🌇🔵🌉',
              '**Ciel** : Tête de loup 🐺 (inscription étrange), Étoile blanche 🌟, Arc-en-ciel 🌈, Tête âne/cheval (couronne verte) 🐴🟢, Diamant 💎 & Ancre ⚓ (Île de Wight)',
              '**Personnages** : Soldat romain (chaîne doigt 🔗, montre souche) 🏛️🌳',
              '**Symboles** : Fontaine grotte ⛲, 2 poissons (Ichthus ?) 🐠🐠, Saint Graal 🏆',
              '**Lien Énigme 6** : L\'ancre et le diamant confirment l\'Île de Wight ("WIGHT").',
              '**Lien Énigme 10** : "Se tourner vers le ciel" pourrait faire référence à l\'étoile, au loup, à l\'arc-en-ciel.',
            ],
          },
          {
            id: 'dessin10',
            label: 'Dessin 10 : Stonehenge et le Chevalier Solaire',
            details: [
              '**Ambiance** : Jaune dominante (été, chaleur) 🟡☀️',
              '**Personnages** : Saint Barthélémy 😇 (couteau 🔪), Merlin au centre Stonehenge 🧙🗿, Chevalier doré 🌟 (cheval blanc 🐎, blason 5 châteaux/2 lions 🏰🦁, épée vers Merlin 🗡️)',
              '**Objets** : Selle à carreaux (bleu/blanc/or) 🔵⚪🟡',
              '**Lien Énigme 6** : Stonehenge ("STANEHENGE") est la solution décodée.',
            ],
          },
          {
            id: 'dessin11',
            label: 'Dessin 11 : Ténèbres et Apocalypse',
            details: [
              '**Ambiance** : Très noire et sombre ⚫, ciel orange apocalyptique 🟠',
              '**Personnages** : Saint noir 😇 (lance 🗡️, barbe grise)',
              '**Animaux** : Dragon blanc à 3 têtes 🐉 (crache feu 🔥, chaîne patte 🔗)',
              '**Lieux** : Forteresse bord rivière (Camelot ?) 🏰🏞️, 3 croix sur colline (Golgotha ?) ✝️✝️✝️, Château sous colline 🏰',
              '**Symboles** : Chemin 11 pierres croisées ("_ _ _ _ R _ _ _ _ _ R") 🛣️, 4 pierres (pique ♠️, carreau ♦️, Cœur ❤️, trèfle ♣️ - lien Syren Bells ?) 🍀',
              '**Lien Énigme 9** : Le dragon à 3 têtes peut être l\'un des "deux monstres" de l\'épopée.',
            ],
          },
          {
            id: 'dessin12',
            label: 'Dessin 12 : La Cène, Enfer et Paradis',
            details: [
              '**Personnages** : Saint rouge 😇 (barbe blanche, scie 🪚 - St Simon le Zélote ?), Jésus (Cène sans apôtres) 🙏',
              '**Division** : Gauche (rouge, "Enfer" : comètes ☄️, foudre ⚡, tour construction 🏗️, 2 yeux 👁️👁️ - rouge diabolique 👹, vert humain 🟢) | Droite (Paradis/Avalon : pont palladien 🌉, lac 🏞️) 🌳',
              '**Symboles** : Tour (double face Merlin/Glastonbury Tor ?), Sanglier cachant cloche 🐗🔔, 3 fleurs rouges (Patmos ?) 🌺🌺🌺, Porte avec triangle or (côté Enfer) 🚪🔺',
              '**Lien Énigme 9** : La Cène sans apôtres est liée à la trahison. La tour et les yeux pourraient être Glastonbury Tor. Les 3 fleurs rouges sont la "fleur de Patmos".',
              '**Lien Énigme 13** : Le paysage paradisiaque est lié à Avalon.',
            ],
          },
        ],
      },
      {
        id: 'manuscrit_enigmes',
        label: '📜 Le Manuscrit d\'Énigmes : Structure et Indices',
        icon: '📜',
        children: [
          {
            id: 'medaillons_enigmes',
            label: '🏅 Médaillons Autour des Énigmes',
            icon: '🏅',
            details: [
              'Arthur (G) 👑 / Merlin (D) 🧙',
              'Graal (G) 🏆 / Excalibur (D) ⚔️',
              'Tristan (G, vert) 💚 / Lancelot (D, rouge) ❤️',
              'Llamrei (G, bleu) 💙 / Caball (D, rouge/bleu) ❤️💙',
              'Galaad (G, rouge) ❤️ / Perceval (D, vert) 💚',
            ],
          },
          {
            id: 'mot_central',
            label: '✍️ Mot Central : EXKALIBUR',
            icon: '✍️',
            details: [
              'Avec un "K" 😮',
              'Chaque lettre avec un nombre différent de fleurs de lys ⚜️⚜️⚜️',
            ],
          },
          {
            id: 'liste_enigmes_details',
            label: '📝 Liste des Énigmes (Titres, Initiales & Dessins)',
            icon: '📝',
            details: [
              '**L\'Anagramme Révélée :** Initiales des 13 énigmes (A I T E R L L S U N O C A) forment "AU SIR LANCELOT" 🛡️ (Hypothèse confirmée, mais lien avec Arthur à affiner).', // Anagramme déplacée ici
              '1. Amis aventuriers : A (or sur fond vert) 🟡🟢',
              '2. In principio : I (rouge) 🔴 + Viviane 🧚‍♀️',
              '3. Terra incognita : T (vert) 🟢 + Romain (Trajan ?) 🏛️',
              '4. Ecce homo : E (gris) ⚪ + Château (Tintagel ?) 🏰',
              '5. Rex dei gratia : R (blanc) ⬜ + Enfant roi couronné (Arthur ou Guillaume) 👶👑',
              '6. Lux in tenebris : L (or) 🟡 + Menhirs 🗿',
              '7. Libera nos a malo : L (gris) ⚪ + Moine/homme capuché (Merlin ?) 🧙‍♂️',
              '8. Sub rosa : S (vert) 🟢 + Rose 🌹',
              '9. Ultima cena : U (rouge) 🔴 + Dragon 🐉',
              '10. Noli me tangere : N (bleu) 🔵 + Labyrinthe 🌀',
              '11. Omnia vincit amor : O (noir) ⚫ + Reine couronnée 👑',
              '12. Consummatum est : C (noir) ⚫ + Château inconnu (Camelot ?) 🏰',
              '13. Ad vitam eternam : A (multicolore) 🌈 + Fontaine du Graal ⛲🏆',
            ],
          },
          {
            id: 'enigmes_textes',
            label: '📖 Textes Complets des Énigmes',
            icon: '📖',
            children: [
                {
                    id: 'enigme1_text',
                    label: 'Enigme 1 : Amis aventuriers',
                    details: [
                        '**Déductions :** Narrateur = Galaad. Importance du soleil et de la lune (présents sur des dessins). Aube personnifiée et mention des hêtres (lien aubépine/forêt ?). La pomme peut aussi renvoyer à Avalon ("l\'île aux pommiers").',
                        'Que j\'ai aimé voir le soleil mourir à l\'horizon! Le pleurer chaque soir, et me lever dans l\'espoir de le voir renaître. Quand l\'aube arrive, la devinant sous les hêtres, lui murmurer. Elle nous invite, et je ne connais pas plus grand bonheur au monde que de sentir tous les matins le miracle de l\'univers s\'accomplir sous nos yeux. J\'ai tant appris des fées et des mystères des bois. Je sais qu\'il reviendra, et le merveilleux pourra fleurir à nouveau, dans l\'astre immortel qui réveille les fleurs, la Lune qui berce la mer, et les chants d\'oiseaux qui narguent les hommes.',
                        'Il est tard, et la quête, sans doute, est à confier à d\'autres que moi. Ce n\'est plus ma croix. Quand tout t\'apparaîtra, comme dernier d\'entre eux, je te céderai le siège, et l\'épée s\'offrira à ton bras. Ce jour là, il fera beau, j\'irai croquer la pomme au bord de l\'eau. Ce qui jadis fut meurtri rayonnera d\'un trait glorieux. Je monterai haut dans le ciel, où le soleil ne me quittera plus pour d\'autres aventures.',
                    ],
                },
                {
                    id: 'enigme2_text',
                    label: 'Enigme 2 : In principio',
                    details: [
                        '**Déductions :** Tracé de l\'épée sur la carte confirmé (lien D1). Identification du Château d\'Urquhart comme "ruines de la poésie écossaise" près du Loch Ness.',
                        '**Image du tracé de l\'épée sur la carte :** ',
                        <img src="https://i.imgur.com/rO63nTd.jpeg" alt="Image of Tracé de l'épée sur la carte" className="max-w-full h-auto rounded-lg my-2 shadow-md" />,
                        'Les Asturies dansaient avec les voiles, épuisées de chaleur et noyées d\'espace. C\'est ici que débute ta quête. La Dame du Lac avait reçu en héritage la mission des celtes: féconder la terre d\'Europe d\'un idéal, après Rome et Athènes. De sa magie, la fée forgea une épée si belle, si rayonnante, et si puissante, que seule une âme pure, intègre et pieuse pouvait avoir l\'honneur de la porter.',
                        'Elle la forgea à même le continent, débutant le flanc Ouest de a garde en a "belle lionne" de Leon, et les quillons, maîtres du feu, prirent forme, se jetant à l\'Est entre L\'Aragon et le Midi, jusqu\'à près de 11 lieues vers Rennes-le-Chateau, dans ce château où brûle la mémoire du pays Cathare. Le pommeau brillait au sud, dans les terres du Cid, où le preux devint prince, en ce lieu saint des chants maures oubliés, qui, dans l\'orgue qui préféra le Dieu latin, perpétue le récit du calice de la porte des Apôtres. La Dame prit la poignée, et la lame, née dans le tombeau de Pyrène, se dressa dans la féérie d\'un geste de révolte, traversant la Guyenne, l\'Anjou, La Bretagne, Les Cornouailles, le pays de Galles, et franchissant jusqu\'au mur d\'Hadrien,. dans l\'ure de ces ruines de la poésie écossaise, bordant le Loch Ness, où Colomba en son temps arrêta la bête sortie des eaux. Fais tes tracés, et vois l\'Épée. Elle est encore dans son rocher.',
                    ],
                },
                {
                    id: 'enigme3_text',
                    label: 'Enigme 3 : Terra incognita',
                    details: [
                        '**Déductions :** Résolue par "Traianous" ou "Troia Nova". Les deux mènent à la Tour de Londres (statue de Trajan ou Londres comme "Nouvelle Troie"). La Tour de Londres bâtie par Guillaume. L\'importance de la référence à Énée reste à prendre en compte.',
                        '" Rome orpheline, fille d\'Énée, toi le berceau du monde, où réveront les enfants ? Mon premier pour Hélène perdit ses remparts. Mon second fut un Lion, au coeur rouge de gloire. Mon troisième est premier de l\'Empire de Rome. Mon quatrième eut l\'aile brûlée en plein vol. Mon cinquième, le Grand, prit Perse par le fer. Mon sixième mit l\'Arche par-dessus les mers. Ma septième, épopée, conta l\'Ithaque libre. Mon huitième, d\'Auvergne, jeté dans le Tibre, plia devant César, qui mit en mon dernier, la couronne posthume aux feuilles de Lauriers. Trouve mon tout, dit LAC. Au centre, dès Guillaume, la Tour-Krak boréale s\'éleva, et les joyaux du trône',
                    ],
                },
                {
                    id: 'enigme4_text',
                    label: 'Enigme 4 : Ecce homo',
                    details: [
                        '**Déductions :** Couples identifiés : Tristan et Iseult (TI), Lancelot et Guenièvre (LG). Lieu trouvé : Tintagel. Les lettres TILG sont retirées, et NTAE est utilisé pour compléter le Carré Sator (D3).',
                        'La terre était prête à border le nouveau-né. L\'Espérance est toujours fille d\'amour. Je voyais les Damoiselles et Damoiseaux comparaître sur le promontoire des Cornouailles, chacun devant prouver sa valeur, pour être digne du don de l\'autre. L\'un d\'eux combattit un géant, abattit un dragon, et gagna, par le précieux breuvage trois années durant, l\'amour de sa belle (__). Le second Compagnon, traitre à \'amour de son roi, mais fidèle à son coeur, vola sa Dame jusqu\'au milieu des flammes (__). Complète le carré, et trouve la place forte (________). Ici, Pendragon conçut son garçon et changea la face du monde.',
                    ],
                },
                {
                    id: 'enigme5_text',
                    label: 'Enigme 5 : Rex dei gratia',
                    details: [
                        '**Déductions :** Confusion entre légende arthurienne et Guillaume le Conquérant. Anneau du sacre à Salisbury (Old Sarum/Kingsbury Ring) - 181 milia = 267 km. Bénédiction du règne à Thorn Ey (Abbaye de Westminster). Ce chemin déplace les quillons de l\'épée, décalant le tracé global. La lame pourrait alors se situer sur le Loch du Clan Matheson.',
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Clan_member_crest_badge_-_Clan_Matheson.svg/1280px-Clan_member_crest_badge_-_Clan_Matheson.svg.png" alt="Image of Devise du Clan Matheson" className="max-w-full h-auto rounded-lg my-2 shadow-md" />,
                        <img src="https://i.imgur.com/DI9ELyL.jpeg" alt="Image of Tracé modifié de l'énigme Rex dei gratia" className="max-w-full h-auto rounded-lg my-2 shadow-md" />,
                        'L\'aurore, pleine de promesses, embrassait le royaume, et dans l\'élan d\'un seul coeur, le peuple celte, dans sa grande humilité qui confiait à l\'innocence, acclamait en ce jour béni le roi que Dieu leur avait donné. Le garçon, descendant de Rome, fit halte par deux fois. Il s\'en alla d\' abord quérir l\'anneau du sacre, à 181 milia (?) vers l\'orient, puis fit bénir son règne à Thorn Ey (?). La Dame du Lac déplaça les quillons sur ce chemin royal.',
                    ],
                },
                {
                    id: 'enigme6_text',
                    label: 'Enigme 6 : Lux in tenebris',
                    details: [
                        '**Déductions :** "STANEHENGE" (Stonehenge) décodé à partir des 24 chevaliers et décimales. L\'erreur sur l\'epsilon d\'"Eurêka" mène à "WIGHT" (Île de Wight), confirmée par l\'ancre et le diamant (D9). La suite de chiffres reste partiellement non résolue.',
                        'Des hommes en armure fendant l\'air, panache au vent, soulevaient le sable et la terre sous le galop de leurs montures. Ils étaient 24, et rejoignaient le roi, qui les invita autour d\'une table en bois, parfaitement ronde, à la décimale près. Le roi, dernier arrivé, sortit d\'un fourreau sang et or une large épée. A cette vue, les chevaliers posèrent genou en terre et le roi les embrassa comme ses frères. Il leur montra les pierres dressées, et leur dit : " nobles compagnons, de l\'Armorique à la Bretagne, sur ces pierres, je bâtirai mon royaume."',
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c8/Winchester_-_Table_ronde_du_roi_Arthur.JPG" alt="Image of Table ronde du roi Arthur" className="max-w-full h-auto rounded-lg my-2 shadow-md" />,
                        '6.4 -2.9 - 1.2 - 5.4 - 23.7 - 14.9 - 1.1 - 24.6- 9.7 - 9 - 1 - 7×9 - 1 & 2 -3 -C Eurêka.',
                    ],
                },
                {
                    id: 'enigme7_text',
                    label: 'Enigme 7 : Libera nos a malo',
                    details: [
                        '**Déductions :** Référence à Merlin (dans le texte) et à la Première Croisade, protection du Sépulcre du Christ à Jérusalem et quête du Graal. "Preux contre dieux" renvoie au jeu du moulin (D7) entre le Pape et l\'Ange (10 au milieu, 5 dans pion rouge à résoudre). Les "4 C" (féminin, "une à une") sont des lieux, liés au "C" de E6. La "Tour-Krak" est la Tour de Londres. Le "champ de bataille" (Hastings, Camlann ?) et le "lieu très Sainte" (Vierge, Chartres D5, Cluny D7 ?) sont à identifier. Demande un tracé sur la carte.',
                        '" Il est des forces occultes en ce monde, dit le roi, qui ne dorment jamais. Nous autres, pauvres chevaliers, avons une mission : les combattre. C\'est à jamais notre devoir". Sur ces dires, le roi fit convier l\'enchanteur, et celui-ci les avertit: "preux chevaliers, un avenir m\'est apparu, et cet avenir est funeste. Le Sépulcre court un grand danger. Il vous faudra porter la guerre très loin de nos terres, pour protéger la coupe de Vie. Vous en serez les dépositaires. Voilà votre quête, qui ne connaîtra pas de fin."',
                        'Observe la partie, preux contre dieux. Commencera le Père, et finiront les cieux. Tu as les 4 C, relie-les une à une. Depuis la tour-krak , en passant par le champ de bataille, parcours la même distance, jusqu\'a te recueillir dans ce lieu très Sainte. "',
                    ],
                },
                {
                    id: 'enigme8_text',
                    label: 'Enigme 8 : Sub rosa',
                    details: [
                        '**Déductions :** "Bayeux Evad. Ectu" = déroute de Bayeux. Liens avec Bataille d\'Hastings, victoire de Guillaume, mort de Harold, fuite de Rennes. Piste d\'une maison Adam et Ève à Bayeux. L\'épisode du roi et de la lance renvoie au Roi Pêcheur (D6). L\'identité de "sa dame" est inconnue. Demande un tracé du lieu très saint, suivant la déroute, à travers une forêt (Avalon ?) vers la cité de l\'Autre Monde.',
                        'Bayeux Evad. Ectu Parti au combat, et blessé d\'un coup de lance, le roi la récupéra, non sans l\'avoir essayée, et l\'offrit à sa dame après le combat. "Vous êtes blessé mon roi?" Mais non, le trait qui l\'a percé, goutte de sang n\'avait versé. Depuis le lieu très saint, suis la déroute devant le Conquérant et trace une nouvelle garde. Elle s\'achève à l\'Orient, à travers les bois qui mènent à la cité de l\'Autre Monde.',
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Maison_d%27Adam_et_%C3%88ve_Bayeux.jpg/1280px-Maison_d%27Adam_et_%C3%88ve_Bayeux.jpg" alt="Image of Maison d'Adam et Ève à Bayeux" className="max-w-full h-auto rounded-lg my-2 shadow-md" />,
                    ],
                },
                {
                    id: 'enigme9_text',
                    label: 'Enigme 9 : Ultima Cena',
                    details: [
                        '**Déductions :** Thème de la trahison (Arthur/Lancelot/Mordred, Judas/Cène D12, Guillaume/Harold). La tour et les yeux (D12) = Glastonbury Tor ? Fleur de Patmos (D12) = Hémérocalle, pétales à compter (sur dessin ou nombre fixe ?). "Deux monstres" ambigu (traîtres ? vrais monstres ? épopées ? dragons D11 ?). "An de grâce qui vit mourir le numéro 1" (Jésus ?). Demande un tracé et une distance ("mesure de pèlerin"). "Île sainte" et "Jérusalem terrestre" (Abbaye de Glastonbury ?).',
                        'L\'un d\'eux l\'avait trahi. À l\'heure la plus grave, le roi convoqua les braves, mais deux manquaient à l\'appel. Il leur demanda d\'aller bâtir la plus haute tour jamais construite, et d\'y accoler ses deux yeux. Ainsi, jamais plus, du nord au sud, de l\' entrée du Styx aux grilles de saint-Pierre, de cette frontière entre le ciel et la Terre, il ne se verrait trompé par l\'un de ses frères.',
                        'Compte les pétales de la fleur de Patmos, et l\'an de grâce qui vit mourir le numéro 1. Multiplie- les au carré, car il y a deux monstres dans ton épopée, et depuis l\'ile sainte, en mesure de pèlerin, marche vers la Jérusalem terrestre. Tu trouveras l\'humble serviteur du Graal.',
                    ],
                },
                {
                    id: 'enigme10_text',
                    label: 'Enigme 10 : Noli me tangere',
                    details: [
                        '**Déductions :** Défaite d\'Arthur à Camlann. "Se tourner vers le ciel" (D9/D8 ?). Gardien de l\'objet convoité (Graal ?), immortalité (millénaire). "Couleur de la trahison" (rouge/jaune ?). "Croisée des chemins entre la garde et le royaume" renvoie au tracé de l\'épée. Référence au "C" mystérieux, cette fois "avant-dernier C" au masculin.',
                        'Il combattit vaillamment, jusqu\'à ce que l\'adversaire lui porte un coup mortel. "Adieu mes frères. N\'abandonnez pas la quête. Souvenez_vous toujours, dans les moments de doute, de vous tourner vers le ciel. " Je jurai de garder l\'objet tant convoité, et je me retirai. Un millénaire a passé, et tout ce dont je me souviens, c\'est le prix de la trahison, et sa couleur. Pour en conjurer le sort, je transformerai ce jour de honte en jour de gloire. D\'ici là, j\'arrivai à la croisée des chemins, entre la garde et le royaume, et parcourus la même distance des 4 C, vers l\' Est, jusqu\'à l\'avant-dernier C.',
                    ],
                },
                {
                    id: 'enigme11_text',
                    label: 'Enigme 11 : Omnia vincit amor',
                    details: [
                        '**Déductions :** Référence à Virgile (Énée). Roi en barque vers château de la gardienne de la lumière (Viviane/Lac de Comper, Morgane/Avalon, Aurore, Brigid/White Wells/Glastonbury). "Papillons de nuit" étrange. "Amour, Rome" = Vénus et Mars (planètes des dessins), ou Viviane/Merlin, Arthur/Angleterre. "Deux flammes... revenir à la Terre" : Vénus/Mars humiliation, Aurore/Mars, Viviane/Merlin, Guenièvre bûcher, Arthur/Glastonbury. "Rome et Amour. Nomme-les." = ROMA AMOR ou Vénus/Mars. "Terre du 10ème père" (Noé/Ararat, 10ème roi Angleterre, 10ème pape Pie Ier/Aquilée). "Nom de Dieu. Garde ses trois premières lettres." (nombreuses possibilités). "Île au sud" (Yeu, Avalon, Wight ?). "Elles entouraient le roi..." (lettres, 9 fées, 9 Syren Bells ?). "Fiers aïeux" = sépulture/résidence royale. Instructions : "Compte-les" (9 choses), "mesure la distance qui les sépare de la gardienne". Non résolue.',
                        'Le roi allait rejoindre en barque le château de la gardienne de la lumière. Ils avaient tournoyé tous deux, tels des papillons de nuit, l\'une autour de l\'Amour, L\'autre autour de Rome, deux flammes aussi brûlantes, jusqu\'à se consumer par le feu, et revenir à la Terre. Rome et Amour. Nomme-les.',
                        'Respecte la règle à la lettre, et prononce le nom de la Terre du 10ème père. (_) Prononce enfin le nom de Dieu. Garde ses trois premières lettres. (___) sur l\'ile au sud, elles entouraient le roi, parmi ses fiers aïeux. Compte-les, et mesure la distance qui les sépare de la gardienne.',
                    ],
                },
                {
                    id: 'enigme12_text',
                    label: 'Enigme 12 : Consummatum est',
                    details: [
                        '**Déductions :** Titre = mort de Jésus. "Table Ronde n\'est plus" = fin du règne d\'Arthur. "Angle du dernier chevalier" (regard chevaliers coins ? Galaad ?). "Jeter l\'ancre depuis Montsalvage" (incohérent, "lever l\'ancre" ? Montségur / Mont Salvat ?). "if\'" (???) fois : possible 17, Château d\'If (trop loin ?). "Prépare l\'obole pour ton ultime traversée" = paiement pour dernière traversée d\'eau (Manche ? Méditerranée ?).',
                        'La Table Ronde n\'est plus. Il est temps de suivre l\'angle du dernier chevalier, et de jeter l\'ancre, depuis Montsalvage, en laissant le palais s\'éloigner à l\'horizon. Monté à bord de la barque, parcours la même distance, if\' (???) fois très parfaitement, et prépare l\'obole pour ton ultime traversée.',
                    ],
                },
                {
                    id: 'enigme13_text',
                    label: 'Enigme 13 : Ad vitam eternam',
                    details: [
                        '**Déductions :** "Dix stades romains séparaient les troisième et onzième" (1.85 km). Épée "aux portes d\'Avalon", "Tombée par trois fois" (lieu précis ou tracé ?). "Tout commence et tout s\'achève" = cycle. "Chant retentir" (quel chant ?). Tracé supposé à travers Brocéliande (chemin de rempart, clairière, jonction, eaux enchantées, grande roche, 10 pas N, 10 pas E, souche-majesté, 8 derniers pas, boussole). "Coupe du charpentier" = Graal.',
                        '**Image du tracé supposé en Brocéliande :** ',
                        <img src="https://i.imgur.com/HFnkrCU.jpeg" alt="Image of Tracé du chemin de la dernière énigme" className="max-w-full h-auto rounded-lg my-2 shadow-md" />,
                        'Dieu sut se montrer favorable; dix stades romains séparaient les troisième et onzième. Le roi avait rejoint les fées, et laissé son épée aux portes d\'Avalon. L\'épée, évidemment. L\'épée, depuis toujours! Là était la dernière clé de la quête du Graal. Tombée par trois fois, elle était revenue là où elle n\'avait jamais cessé d\'être.',
                        'Tout commence et tout s\'achève. J\'entends le chant retentir. j\'ai fait une dernière veille au chemin de rempart, et l\'endroit m\'est apparu au matin, illuminé par l\'astre glorieux qui magnifiait le ruisseau. Dans la clairière, à la jonction des chemins, j\'ai suivi à sénestre les eaux enchantées jusqu\'à la grande roche, puis fis dix pas au nord, autant à l\'est. Arrivé à la souche-majesté, je fis huit derniers pas, et ma boussole suivait le jour dernier. Ici, tu trouveras la coupe du charpentier.',
                    ],
                },
            ],
          },
        ],
      },
    ],
  };

  // State to manage the expansion/collapse of nodes
  const [mindMapData, setMindMapData] = useState(initialMindMapData);
  const [expandedNodes, setExpandedNodes] = useState({
    // Initialize some nodes as open by default for better visibility
    cles_lecture: true,
    enluminure_scenes: true,
    manuscrit_enigmes: true,
  });
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Initialize Firebase and authenticate
  useEffect(() => {
    try {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');

      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setDb(firestore);
      setAuth(firebaseAuth);

      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          // Sign in anonymously if no initial auth token
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(firebaseAuth, __initial_auth_token);
          } else {
            const anonUser = await signInAnonymously(firebaseAuth);
            setUserId(anonUser.user.uid);
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error initializing Firebase:", error);
      setMessage("Erreur lors de l'initialisation de Firebase.");
      setLoading(false);
    }
  }, []);

  // Load and listen for real-time updates from Firestore
  useEffect(() => {
    if (!db || !userId) return;

    const mindMapDocRef = doc(db, `artifacts/${__app_id}/public/data/mindMaps`, 'sharedMindMap');

    const unsubscribe = onSnapshot(mindMapDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.mindMap) {
          try {
            // Ensure images are rendered as React elements
            const parsedData = JSON.parse(data.mindMap, (key, value) => {
              if (typeof value === 'string' && value.startsWith('<img src=')) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(value, 'text/html');
                const imgElement = doc.body.firstChild;
                if (imgElement && imgElement.tagName === 'IMG') {
                  return <img src={imgElement.src} alt={imgElement.alt} className={imgElement.className} />;
                }
              }
              return value;
            });
            setMindMapData(parsedData);
            setMessage("Carte mentale chargée avec succès.");
          } catch (e) {
            console.error("Error parsing mind map data from Firestore:", e);
            setMessage("Erreur lors du chargement de la carte mentale.");
          }
        }
      } else {
        // If document doesn't exist, save the initial data
        saveMindMap(initialMindMapData);
        setMessage("Aucune carte mentale trouvée, la carte initiale a été sauvegardée.");
      }
    }, (error) => {
      console.error("Error listening to mind map data:", error);
      setMessage("Erreur de synchronisation en temps réel.");
    });

    return () => unsubscribe();
  }, [db, userId]); // Re-run when db or userId changes

  // Function to save the mind map data to Firestore
  const saveMindMap = useCallback(async (dataToSave) => {
    if (!db || !userId) {
      setMessage("Impossible de sauvegarder : Firebase non initialisé ou utilisateur non connecté.");
      return;
    }
    setLoading(true);
    try {
      const mindMapDocRef = doc(db, `artifacts/${__app_id}/public/data/mindMaps`, 'sharedMindMap');
      // Convert React elements (like <img>) back to string for storage
      const stringifiedData = JSON.stringify(dataToSave, (key, value) => {
        if (React.isValidElement(value)) {
          // Simple serialization for img tags. More complex elements would need a more robust solution.
          if (value.type === 'img') {
            return `<img src="${value.props.src}" alt="${value.props.alt}" class="${value.props.className}" />`;
          }
        }
        return value;
      });
      await setDoc(mindMapDocRef, { mindMap: stringifiedData, lastUpdated: new Date() });
      setMessage("Carte mentale sauvegardée avec succès !");
    } catch (error) {
      console.error("Error saving mind map:", error);
      setMessage("Erreur lors de la sauvegarde de la carte mentale.");
    } finally {
      setLoading(false);
    }
  }, [db, userId]);

  // Function to toggle the open/closed state of a node
  const toggleNode = (id) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Recursive component to render the mind map nodes
  const MindMapNode = ({ node, level }) => {
    const isOpen = expandedNodes[node.id];

    // Define colors for different levels to create visual hierarchy
    const nodeColors = [
      'bg-blue-800',
      'bg-purple-800',
      'bg-green-800',
      'bg-red-800',
      'bg-indigo-800',
      'bg-yellow-800',
      'bg-teal-800',
      'bg-orange-800',
    ];
    const borderColors = [
      'border-blue-500',
      'border-purple-500',
      'border-green-500',
      'border-red-500',
      'border-indigo-500',
      'border-yellow-500',
      'border-teal-500',
      'border-orange-500',
    ];

    const bgColor = nodeColors[level % nodeColors.length];
    const borderColor = borderColors[level % borderColors.length];
    const paddingLeft = level * 1; // Indentation for visual hierarchy

    return (
      <div
        className={`w-full rounded-lg shadow-xl mb-4 ${bgColor} border-l-4 ${borderColor}`}
        style={{ paddingLeft: `${paddingLeft}rem` }}
      >
        <div
          className="flex items-center p-3 sm:p-4 cursor-pointer hover:bg-opacity-80 transition-all duration-200 text-white"
          onClick={() => toggleNode(node.id)}
        >
          {node.icon && <span className="text-xl sm:text-2xl mr-3">{node.icon}</span>}
          <h3 className="text-xl sm:text-2xl font-semibold flex-grow">
            {node.label}
          </h3>
          {node.children && (
            <span className="text-xl">
              {isOpen ? '🔽' : '▶️'}
            </span>
          )}
        </div>

        {isOpen && node.details && (
          <ul className="list-disc pl-8 sm:pl-12 pb-3 sm:pb-4 text-sm sm:text-base">
            {node.details.map((detail, index) => (
              <li key={index} className="mb-1 text-gray-200">
                {detail}
              </li>
            ))}
          </ul>
        )}

        {isOpen && node.children && (
          <div className="ml-4 sm:ml-6 border-l border-gray-600 pl-4 pt-2">
            {node.children.map((childNode) => (
              <MindMapNode key={childNode.id} node={childNode} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 text-gray-100 p-4 sm:p-8 font-inter">
      {/* Tailwind CSS and Inter font */}
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Custom CSS for font-family */}
      <style>
        {`
          body {
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>

      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-white mb-6 sm:mb-8 leading-tight">
          {mindMapData.title}
        </h1>

        {loading && <p className="text-center text-blue-400 mb-4">Chargement...</p>}
        {message && (
          <div className={`p-3 mb-4 rounded-lg text-center ${message.includes('Erreur') ? 'bg-red-700 text-red-100' : 'bg-green-700 text-green-100'}`}>
            {message}
          </div>
        )}

        <div className="text-center mb-6">
          <p className="text-gray-400 text-sm mb-2">
            Votre ID utilisateur : <span className="font-mono text-blue-300 break-all">{userId || 'Connexion...'}</span>
          </p>
          <p className="text-gray-400 text-sm mb-4">
            Partagez cette application avec d'autres utilisateurs Gemini pour collaborer sur la même carte mentale.
          </p>
          <button
            onClick={() => saveMindMap(mindMapData)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            disabled={loading || !db || !userId}
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder la carte mentale'}
          </button>
        </div>

        <div className="border-t-2 border-gray-600 pt-6">
          {mindMapData.nodes.map((node) => (
            <MindMapNode key={node.id} node={node} level={0} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;


