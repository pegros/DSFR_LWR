# Composant Bouton du **DSFR** (navigation)

## Introduction

Le composant **dsfrButtonDsp** permet d'afficher un bouton standard du DSFR (cf. [description officielle](https://www.systeme-de-design.gouv.fr/elements-d-interface/composants/bouton)) permettant de déclencher une action de navigation dans un site Experience.

Les différentes variantes du composant sont supportées et configurables au travers de paramètres de configuration (variante, taille, icônes, alignement).
![Variantes du bouton de navigation DSFR](/media/dsfrButtonDsp.png)

La configuration de la navigation repose sur le format des references de page du **[Navigation Service](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.use_navigate_basic)** de Salesforce (cf. [documentation](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_page_reference_type)).
 

## Configuration

Toute la configuration du composant s'effectue directement dans **Site Builder** au travers des propriétés proposées:
* `Libellé` : libellé du bouton
* `Titre` : titre du bouton (en cas de survol du bouton)
* `Taille` : taille du bouton (small, medium, large)
* `Variante` : Variante d'affichage du bouton (primary, secondary...)
* `Icône` : Nom de l'icone DFSR à afficher dans le bouton (e.g. `checkbox-circle-line`)
* `Position de l'icône` : Position de l'icône par rapport au libellé du bouton (left,right)
* `Inactif ?` : Statut d'activité du bouton (true, false)
* `Alignement` : Positionnement du bouton dans son conteneur (left, center, right)
* `Cible` : **[Page reference](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_page_reference_type)** cible du bouton vers lequel l'utilisateur doit être redirigé.


⚠️ Un type special de `Cible` a été ajouté à la liste standard Salesforce afin de déclencher le téléchargement d'un fichier d'une manière compatible avec les contraintes des sites Experience LWR : il s'agit du type **[fileDownload](#Téléchargement-de-fichier)**.
`
### Navigation vers la page de record affiché dans une liste

Par exemple, pour naviguer vers un Compte affiché dans une carte intégrée dans une liste ou une grille standard Salesforce.

```
{
    "type": "standard__recordPage",
    "attributes": {
        "recordId": "{!Item.Id}",
       "objectApiName": "Account",
       "actionName": "view"
    }
}
```

### Navigation vers une page custom avec des paramètres de contexte

Par exemple, pour naviguer vers une page custom en fournissant un contexte.

```
{
    "type": "comm__namedPage",
    "attributes": {
        "name": "RegistrationFlow__c"
    },
    "state": {
        "object": "User",
        "record": "{!User.userId}"
    }
}
```

Les éléments de contexte passés dans le `state` peuvent ensuite être utilisés via les **data bindings** `{!Route.xxx}` pour valoriser des composants dans la page cible.


### Téléchargement de fichier

Il est possible de télécharger en un click un fichier dont on connait l'ID, soit parce qu'il est enregistré sur l'enregistrement courant (par trigger sur un champ text custom ou nativement comme sur certains objets standards comme Campaign), soit parce qu'il est récupéré au travers d'une requête SOQL (cf. composant **[dsfrButtonDsp](/help/dsfrButtonDsp.md)**).

La syntaxe de la cible est similaire aux page references Salesforce standards, en utilisant le type special **fileDownload** .

```
{
    "type": "fileDownload",
    "attributes": {
        "fileId": "{!Item.ContentDocumentId}"
    }
}
```

### Ouverture d'un nouvel onglet de navigateur

En standard, le navigation service n'ouvre un nouvel onglet que lors d'une redirection
vers une URL externe. Les sites Experience Cloud sont en effet des _Single Page Applications_
et il est preférable en termes de performances de toujours rester dans l'onglet courant.

Certains cas particuliers nécessitent toutefois de forcer l'ouverture d'une page dans un nouvel,
par ex. pour déclencher la génération d'un PDF via une page **VisualForce** (en mode `renderAs="pdf"`)
depuis un Experience Site Aura ou via un accès Lightning standard (cf. exemple ci-dessous).

La syntaxe de la cible est similaire aux page references Salesforce standards, en utilisant le type special **openTab** .

```
{
    "type":"openTab",
    "attributes": {
        "url":"/servlet/networks/switch?startURL=/apex/CustomPdfVfPage%3Fid={!User.userId}"
    }
}
```

## Précisions techniques

Le composant est utilisé pour l'affichage et le déclenchement d'action plus complexes dans plusieurs autres composants de boutons:
* **[dsfrActionButtonCmp](/help/dsfrActionButtonCmp.md)** pour déclencher une MAJ directe via Lightning Data Service
* **[dsfrFlowPopupCmp](/help/dsfrFlowPopupCmp.md)** pour déclencher un Flow en popup modale
* **[dsfrFormButtonCmp](/help/dsfrFormButtonCmp.md)** pour présenter un formulaire en popup modale