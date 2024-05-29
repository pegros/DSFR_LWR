# Composant Icône et Texte **DSFR**

## Introduction

Le composant **DSFR Liste d'Icônes et Textes** (ou techniquement **dsfrIconFieldListDsp**)
permet d'afficher une liste de composants **[dsfrIconFieldDsp](/help/dsfrIconFieldDsp.md)** 
pour afficher une séquence d'informations textuelles préfixées par des **[icône du DSFR](https://www.systeme-de-design.gouv.fr/elements-d-interface/fondamentaux-techniques/icones)**.

<img src="/media/dsfrIconFieldListDsp.png" alt="Icon Field List" width=400> 


## Configuration

Toute la configuration du composant s'effectue directement dans **Site Builder** au travers des propriétés proposées:
* `Valeurs à afficher` : Configuration (au format liste JSON) de la liste des différentes instances de **dsfrIconFieldDsp** à afficher
* `CSS additionnelle` : Classe à appliquer à la liste (e.g. `verticalUL`  proposée par le 
composant pour présenter la liste verticalement au lieu d'horizontalement)
* `CSS des éléments`: Classe DSFR à appliquer à chaque composant **dsfrIconFieldDsp** (e.g. `fr-my-1v` pour contrôler leur espacement)
* `CSS des icônes`: Classe DSFR à appliquer spécifiquement aux icônes des composants **dsfrIconFieldDsp** (e.g. `fr-text-title--blue-france` pour en changer la couleur)
* `Debug ?` : Activation de traces pour l'analyse de problèmes

La propriété `Valeurs à afficher` doit contenir une liste de configurations unitaires JSON
de composants **dsfrIconFieldDsp**. Chaque configuration unitaire consiste en un objet JSON
valorisant ses différents paramètres:
* `icon`: nom de l'icône
* `value`: valeur à afficher (text, picklist ou nombre)
* `prefix`: préfixe affiché avant la valeur (optionel)
* `suffix`: suffixe affiché après la valeur (optionel)
* `isMpl`: flag booléen pour forcer la conversion d'une valeur multi-picklist
(conversion des `;` en `, `)
* `showEmpty`: flag booléen pour forcer l'affichage du composant même en cas de valeur vide

A titre d'exemple, le composant présenté en introduction repose sur la configuration
suivante dans une page de détail d'un enregistrement.

```
[
    {
        "icon" :"article-fill",
        "value": "{!Item.Domaine__c}",
        "prefix":"Domaine : "
    },
    {
        "icon" :"article-line",
        "value": "{!Item.SousDomaine__c}",
        "prefix":"Sous domaine : "
    },
    {
        "icon" :"time-line",
        "value": "{!Item.TotalCredits}",
        "prefix":"Durée : ",
        "suffix":"jour(s)"
    },
    {
        "icon":"map-pin-user-line",
        "value":"{!Item.ModalitePedagogique__c}",
        "prefix":"Modalité de formation : "
    },
    {
        "icon":"map-pin-user-line",
        "value":"{!Item.MethodeOutilPedagogiques__c}",
        "prefix":"Méthode et/ou outil pédagogique : "
    },
    {
        "icon" :"group-line",
        "value": "{!Item.PublicCible__c}",
        "prefix":"Public : "
    },
    {
        "icon":"map-pin-user-line",
        "value":"{!Item.Tag__c}",
        "prefix":"Tag : ",
        "isMpl":true
    }
]
```

## Précisions techniques

Le composant:
* repose exclusivement sur le composant **[dsfrIconFieldDsp](/help/dsfrIconFieldDsp.md)**.
* est lui même utilisé dans d'autres composants (par ex. **[dsfrCardCmp](/help/dsfrCardCmp.md)**)