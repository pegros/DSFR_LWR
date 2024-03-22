# Composant Carte du **DSFR**

## Introduction

Le composant **dsfrCardCmp** permet d'afficher une carte standard du DSFR (cf. [description officielle](https://www.systeme-de-design.gouv.fr/elements-d-interface/composants/carte)).

La plupart des éléments structurants du composant et des variantes d'affichages sont supportées
et configurables au travers de paramètres de configuration.


## Configuration

Toute la configuration du composant s'effectue directement dans **Site Builder** au travers des propriétés proposées:

_à compléter_

## Exemples de configuration

### Utilisation dans une liste ou grille Salesforce standard

Dans une liste ou grille standard Salesforce, il est possible d'utiliser la **Carte DSFR** comme composant de présentation en utilisant simplement les **[data bindings](https://developer.salesforce.com/docs/atlas.en-us.244.0.exp_cloud_lwr.meta/exp_cloud_lwr/advanced_expressions.htm?q=Data+Binding)** des sites LWR.

Par ex. il suffit de renseigner `{!Item.Name}` dans la propriété `Titre` de la carte pour afficher le nom de chaque enregistrement récupéré comme titre de chaque carte.

⚠️ Tous les champs utilisés dans la carte doivent être présent dans la **list view** utilisée pour récupérer les données!
Seul l'ID Salesforce est implicitement disponible (via `{!Item.Id}`).


### Configuration d'une liste de boutons d'action

Dans l'exemple suivant, sur une liste `Mes Comptes` récupérées par le composant standard **Liste** de Salesforce, des ***Cartes DSFR*** sont affichées avec 3 boutons d'action correspondant aux 3 types de boutons actuellement disponibles:
* Bouton DSFR de navigation (cf. composant **[dsfrButtonDsp](/help/dsfrButtonDsp.md)**)
* Bouton DSFR d'action (cf. composant **[dsfrActionDuttonCmp](/help/dsfrActionDuttonCmp.md)**)
* Bouton de Popup de Processus (cf. composant **[dsfrFlowPopupCmp](/help/dsfrFlowPopupCmp.md)**)
* Bouton de Popup de Formulaire (cf. composant **[dsfrFormButtonCmp](/help/dsfrFormButtonCmp.md)**)

```
{
    "sort": [
        {"label": "Sujet","name": "Name"},
        {"label": "Etat","name": "Etat__c"},
        {"label": "Dernière MAJ","name": "LastModifiedDate"}
    ],
    "type": "Card",
    "base": {
        "size": "small",
        "isVertical": false
    },
    "row": {
        "title": "Name",
        "description": "Discussion__c",
        "startDetails": "LastModifiedDate",
        "endDetails": "CreatedDate",
        "Id": "Id"
    },
    "badgeList": [
        {"valueField": "Etat__c","variant": "info"}
    ],
    "buttons": [
        {
            "label": "Ouvrir",
            "target": {
                "type": "standard__recordPage",
                "attributes": {
                    "recordId": "{!Item.Id}",
                    "objectApiName": "Interaction__c",
                    "actionName": "view"
                }
            }
        },
        {
            "label": "Clôturer",
            "hidden":"{!Item.IsClosed__c}",
            "action": {
                "type": "update",
                "params": {
                    "fields": {
                        "Id": "{!Item.Id}",
                        "Etat__c": "CLOS"
                    }
                },
                "refresh": true
            }
        },
        {
            "label": "Répondre",
            "variant": "secondary",
            "inactive":"{!Item.IsNew__c}",
            "flowName": "InteractionFlow",
            "flowParameters": [
                {
                    "name": "recordId",
                    "type": "String",
                    "value": "{!Item.Id}"
                }
            ],
            "modalTitle": "Répondre à {!Item.Name}",
            "refresh": true
        },
        {
            "label": "Editer",
            "recordId": "{!Item.Id}",
            "objectApiName": "Interaction__c",
            "formTitle": "Editer l'interaction",
            "formMessage": "Attention aux champs obligatoires.",
            "formFields": [
                {
                    "name": "Name",
                    "required": true
                },
                {
                    "name":"Etat__c",
                    "disabled": true,
                    "value":"EC"
                }
            ],
            "refresh": true
        }
    ]
}
```

_à compléter_

## Précisions techniques
_à compléter_