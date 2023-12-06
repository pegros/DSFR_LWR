# Composant Contenu **DSFR**

## Introduction

Le composant **dsfrContainerDsp** permet de simplement du contenu textuel sous la forme 
d'un titre et d'une section de texte.

![Contenu DSFR](/media/dsfrContainerDsp.png) 

Configuré ainsi, il a peu de valeur ajoutée par rapport au composant standard **HTML Editor**
mais il est intégré au **[dsfrCardTileListCmp](/help/dsfrCardTileListCmp.md)** comme variante
d'affichage simple d'une liste d'éléments récupérée par une _Query_ custom.

Il offre toutefois la possibilité en mode _expand/collapse_ pour n'afficher que le titre
par défaut tout en permettant d'accéder facilement à un contenu richtext plus étendu
(en adoptant alors l'affichage [Accordéon](https://www.systeme-de-design.gouv.fr/elements-d-interface/composants/accordeon) du DSFR). Ainsi, il peut être intégré au sein
d'un composant **Grille** standard.
 
![Contenu DSFR](/media/dsfrContainerDspAccordion.png)



## Configuration

Toute la configuration du composant s'effectue directement dans **Site Builder** au travers des propriétés proposées:
* `Titre` : Titre du composant (texte)
* `Variante du titre` : Style d'affichage du titre (variantes de titre du DSFR)
* `Message` : Message d'information (richtext)
* `Variante` : Style d'affichage du message (variantes de text du DSFR)
* `Accordéon?` : Activation de l'affichage en mode section d'accordéon
* `Fermé par défaut ?` : Fermeture ou non par défaut du message en mode section d'accordéon
* `Style du Conteneur` : Classes CSS à appliquer au conteneur du composant (pour en modifier légèrement l'apparence)
* `Debug ?` : Activation de détails pour l'analyse de problèmes

ℹ️ Le composant est également disponible dans les **Flows** (et se configure de la même façon).


## Précisions techniques

Si une variable numérique est passée en entrée du titre ou du message, le nombre
0 est converti en la chaîne de caractère `0`.