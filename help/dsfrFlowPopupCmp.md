# Composant Bouton du **DSFR** (formulaire en modale)

## Introduction

Le composant **dsfrFormButtonCmp** permet d'afficher un bouton d'action permettant d'ouvrir une popup modale permettant d'executer un Flow:

![Flow Popup Action](/media/dsfrFlowPopupCmp.png) 

Il repose sur le composant **(dsfrButtonDsp)[/help/dsfrButtonDsp.md]** pour l'affichage du bouton et en reprend tous les paramètres de d'apparence tout remplaçant son action de navigation par la présentation d'un formulaire. 

Il utilise également le format de **[modale du DSFR](https://www.systeme-de-design.gouv.fr/elements-d-interface/composants/modale)** pour y afficher le formulaire.


## Configuration

Toute la configuration du composant s'effectue directement dans **Site Builder** au travers des propriétés proposées:
* propriétés de bouton
    * `Libellé` : libellé du bouton
    * `Titre` : titre du bouton (en cas de survol du bouton)
    * `Taille` : taille du bouton (small, medium, large)
    * `Variante` : Variante d'affichage du bouton (primùary, secondary...)
    * `Icône` : Nom de l'icone DFSR à afficher dans le bouton (e.g. `checkbox-circle-line`)
    * `Position de l'icône` : Position de l'icône par rapport au libellé du bouton (left,right)
    * `Inactif ?` : Statut d'activité du bouton (true, false)
    * `Alignement` : Positionnement du bouton dans son conteneur (left, center, right)
* propriétés de popup modale
    * `Titre de la modale` : Titre de la popup du processus
    * `Processus` : Nom API du flow à exécuter
    * `Paramètres de processus` : Configuration de la valorisation des paramètres d'entrée du processus
    * `Raffraichir la page ?` : Activation d'un raffraichissement automatique de la page à la fermeture de la popup.
* autres proprétés
    * `Debug ?` : Activation de détails pour l'analyse de problèmes


## Configuration des paramètres du processus

Le paramètre `Paramètres de processus` permet de configurer les paramètres de lancement du processus dans la popup modale. Il doit être valorisé avec une liste JSON de paramètres telle qu'attendue par le composant standard **[lightning-flow](https://developer.salesforce.com/docs/component-library/bundle/lightning-flow/documentation)** sur lequel le composant repose pour afficher et exécuter le flow.

Par ex., la configuration suivante permet de valoriser les deux paramètres `recordId` et `state` du Flow (qui doivent être marqués comme tels dans le Flow) avec des valeurs contextualisées :
```
[
    {
        "name": "recordId",
        "type": "String",
        "value": "{!Item.Id}"
    },
    {
        "name": "state",
        "type": "String",
        "value": "Open"
    }
]
```

## Précisions techniques

L'option de raffraichissement de la page repose sur le service standard **[refresh](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_lightning_refreshview)**. Dans ce cas, il y a émission d'un évènement spécifique qui doit êter pris en compte par les composants concernés. Cela est par exemple le cas pour les actions déclenchées dans des cartes affichées par le composant **dsfrCardTileListCmp**.
