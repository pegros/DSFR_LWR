# Composant Bouton du **DSFR** (formulaire en modale)

## Introduction

Le composant **dsfrFormButtonCmp** permet d'afficher un bouton d'action permettant d'ouvrir une popup modale permettant de présenter un formulaire de création / édition d'un enregistrement.

![Form Popup Action](/media/dsfrFormButtonCmp.png) 

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
    * `Titre du formulaire` : Titre de la popup du formulaire
    * `Message du formulaire` : Message introductif de la popup du formulaire
    * `Champs du formulaire` : Configuration du formulaire (liste JSON de déclarations de champs, e.g. `[{"name":"fieldApiName"},...]`)
    * `Objet` : API Name de l'objet du formulaire
    * `ID de l'enregistrement` : ID de l'enregistrement du formulaire (mode edit)
    * `Raffraichir la page ?` : Activation d'un raffraichissement automatique de la page à la fermeture de la popup.
* autres proprétés
    * `Debug ?` : Activation de détails pour l'analyse de problèmes

⚠️ Seuls les objets supportés par le **[Lightning Data Service](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/data_service_considerations.htm)** peuvent être utilisés, le formulaire reposant sur le composant standard **[lightning-record-edit-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-edit-form)**.


## Configuration des champs du formulaire

Le paramètre `Champs du formulaire` permet de configurer la liste des champs à inclure dans le formulaire ainsi que la façon dont ils sont affichés. Ce paramètre 
* `name` (obligatoire) donne l'API Name du champ
* `disabled` (optionel) permet basculer le champ en lecture seule (true / false)
* `required` (optionnel) permet de rendre le champ obligatoire (true / false)
* `value` (optionel) permet de renseigner une valeur par défaut pour le champ

Par exemple, la configuration suivante affiche deux champs d'un objet custom, le premier (`Etat__c`) en lecture seule avec une nouvelle valeur par défaut et le second (`Commentaire__c`) modifiable et obligatoire.
```
[
    {
        "name":"Etat__c",
        "disabled": true,
        "value":"EC"
    },
    {
        "name": "Commentaire__c",
        "required": true
    }
]
```

## Précisions techniques

La modification via le formulaire étant effectuée par le Lightning Data Service, les données de l'enregistrement modifié sont automatiquement mise à jour dans le cache de la page (cas des pages de détail des objets) sans nécessité de déclencher ce refresh.

L'option de raffraichissement de la page repose sur le service standard **[refresh](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_lightning_refreshview)**. Dans ce cas, il y a émission d'un évènement spécifique qui doit êter pris en compte par les composants concernés. Cela est par exemple le cas pour les actions déclenchées dans des cartes affichées par le composant **dsfrCardTileListCmp**.
