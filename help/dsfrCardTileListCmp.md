# Composant Liste du **DSFR**

## Introduction

Le composant **dsfrCardTileListCmp** permet d'afficher une liste d'éléments selon différents formats du DSFR.

Il utilise le composant **[sfpegListCmp](https://github.com/pegros/PEG_LIST/blob/master/help/sfpegListCmp.md)** du package **[PEG_LIST](https://github.com/pegros/PEG_LIST)** pour exécuter des requêtes contextualisées et configurer une grande partie de l'affichage. 

Il offre les possibilités suivantes de présentation:
* groupe de [boutons de navigation](/help/dsfrButtonDsp.md)
* liste de [cartes](/help/dsfrCardCmp.md)
* liste de [tuiles](/help/dsfrTileCmp.md)
* liste de [conteneurs](/help/dsfrContainerDsp.md) simples
* liste de [Icône et Texte](/help/dsfrIconFieldDsp.md)

Il permet également d'afficher en cas d'absence de résultat une section paramétrable dans Site Builder pour y inclure d'autres composants, par exemple une [alerte](/help/dsfrAlertCmp.md).


## Configuration

_à compléter_

### Exemple de cartes


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

### Exemple de liste de boutons

Cet exemple permet de présenter une liste dynamique de boutons permettant de naviguer vers les enregistrements **CourseOffering** prédédent et suivant et suivant l'enregistrement courant correspondant au même **TrnCourse**.
La configuration de la query **sfpegList** n'est pas présentée ici. 

```
{
    "type": "Button",
    "align":"center",
    "base": {
        "size": "small",
    },
    "row": {
        "label": "Query",
        "Id": "Id"
    },
    "target": {
        "type": "standard__recordPage",
        "attributes": {
            "recordId": "{!Item.Id}",
            "objectApiName": "CourseOffering",
            "actionName": "view"
        }
    }
}
```

Il est également possible d'exploiter toutes les capacités du framework **sfpegAction** et 
d'appeler une action définie comme _row action_ dans la configuration **sfpegList** utilisée.
Il suffit de remplacer la propriété `target` par la propriété `name` avec le nom de la
_row action_ à déclencher.


### Exemple de liste d'icônes et textes

Cet exemple permet d'afficher le résultat d'une query SOQL `count()` avec un résultat nommé NBR sous la forme d'un texte accompagné d'une icône (`camera-line`) et d'un préfixe (`Number`).
```
{
    "type": "IconField",
    "base": {
        "size": "small",
        "icon":"camera-line",
        "prefix":"Number"
    },
    "row": {
        "Id": "Id",
        "value":"NBR"
    }
}
```

## Précisions techniques

_à compléter_