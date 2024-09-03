# Composant Bouton du **DSFR** (action directe)

## Introduction

Le composant **dsfrActionButtonCmp** permet d'afficher un bouton d'action permettant de déclencher la création / modification / destruction d'un enregistrement et d'afficher un résultat d'execution (voire de rediriger l'utilisateur vers le nouvel enregistrement en cas de création).

![Form Popup Action](/media/dsfrActionButtonCmp.png) 

Il repose sur le composant **(dsfrButtonDsp)[/help/dsfrButtonDsp.md]** pour l'affichage du bouton et en reprend tous les paramètres de d'apparence tout remplaçant son action de navigation par le déclenchement d'une opération de mise à jour. 

Il utilise également le composant **dsfrAlertPopupDsp** pour afficher le résultat d'exécution.


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
    * `Action` : Configuration de l'opération Lightning Data Service à exécuter (objet JSON de configuration)
* autres proprétés
    * `Debug ?` : Activation de détails pour l'analyse de problèmes

⚠️ Seuls les objets supportés par le **[Lightning Data Service](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/data_service_considerations.htm)** peuvent être utilisés, le formulaire reposant sur le _wire_ service standard **[uiRecordApi](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_lightning_ui_api_record)**.


## Configuration des champs du formulaire

Le paramètre `Action` permet de configurer la modification à executer avec le Lightning Data Service. Il doit être valorisé avec un objet JSON comportant deux principales propriétés :
* `type` : Définition de l'action à réaliser (i.e. `create`, `update` ou `delete`)
* `params` : Paramètres de l'action à réaliser, correspondant aux entrées respectives des méthodes standards **[createRecord](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_create_record)**, **[updateRecord](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_update_record)** ou **[deleteRecord](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_delete_record)**.

Par exemple, la configuration suivante permet de modifier le champ `Etat__c` du record courant d'une page de détail d'objet.
```
{
    "type": "update",
    "params": {
        "fields": {
            "Id": "{!Item.Id}",
            "Etat__c": "CLOS"
        }
    }
}
```

## Actions post-soumission de l'action

Il est possible de:
* ajuster le message de confimation de l'opération au travers des propriétés textuelles `title`et `message`.
* déclencher une navigation vers l'enregistrement créé / modifié ou vers une page du site (en cas de `delete`)
via la propriété  `navigate`.
* demander un raffraichissement d'un ensemble d'enregistrements via la propriété `reload`au format attendu par le service standard [notifyRecordUpdateAvailable](https://developer.salesforce.com/docs/platform/lwc/guide/reference-notify-record-update.html?q=notifyRecordUpdateAvailable)
* déclencher un raffraichissement spécifique aux composants [PEG_LIST](https://github.com/pegros/PEG_LIST) (utilisés dans certains composants DSFR) via la propriété booléenne `refresh`

L'exemple suivant propose une action de création d'un nouvel enregistrement avec popup de
confirmation personnalisée et redirection automatique vers le nouvel enregistrement créé.

```
{
    "type": "create",
    "params": {
        "apiName": "Candidature__c",
        "fields": {
            "Name": "Candidature-{!Item.Name}",
            "Candidat__c": "{!User.Record.AccountId}",
            "OffreEmploi__c": "{!Route.recordId}",
            "StatutInterne__c": "Brouillon"
        }
    },
    "title": "Candidature initialisée.",
    "message": "Merci de fournir les informations complémentaires demandées dans l'écran suivant et soumettre votre candidature pour prise en compte.",
    "navigate": true
}
```

L'exemple suivant propose une action de destruction de l'enregistrement courant avec popup de
confirmation personnalisée et redirection automatique vers la page de liste de l'objet correspondant.
```
{
    "type": "delete",
    "params": "{!Route.recordId}",
    "title": "Enregistrement supprimé",
    "navigate": {
        "type": "standard__objectPage",
        "attributes": {
            "objectApiName": "TEST_PEG__c",
            "actionName": "home"
        }
    }
}
```

⚠️ La propriété `navigate` est booléenne dans le cas des opérations `create`et `update` (et doit être valorisée à
`true` pour déclencher la redirection vers l'enregistrement créé/modifié) et de type objet JSON dans le cas d'un `delete`
(avec une [référence de page](https://developer.salesforce.com/docs/platform/lwc/guide/reference-page-reference-type.html) 
standard Salesforce).


## Précisions techniques

La modification via le formulaire étant effectuée par le Lightning Data Service, les données de l'enregistrement modifié sont automatiquement mise à jour dans le cache de la page (cas des pages de détail des objets) sans nécessité de déclencher ce refresh.

L'option de raffraichissement de la page repose sur le service standard **[refresh](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_lightning_refreshview)**. Dans ce cas, il y a émission d'un évènement spécifique qui doit êter pris en compte par les composants concernés. Cela est par exemple le cas pour les actions déclenchées dans des cartes affichées par le composant **dsfrCardTileListCmp**.