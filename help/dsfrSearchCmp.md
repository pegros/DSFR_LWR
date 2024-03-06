# Composant Recherche du **DSFR**

## Introduction

Le composant **dsfrSearchCmp** permet d'afficher une barre de recherche avec une saisie de mots clés et un 
ensemble de critères de filtres additionels.

Il reprend la structure de la [barre de recherche](https://www.systeme-de-design.gouv.fr/elements-d-interface/composants/barre-de-recherche) officielle du **DSFR** mais l'adapte légèrement pour y intégrer deux séries de critères
de filtre.

Ce composant n'exécute pas de recherche mais se contente de mettre à jour le contexte de la page de recherche
(via la propriété `state` de la page, cf. [Standard Page References](https://developer.salesforce.com/docs/platform/lwc/guide/reference-page-reference-type.html#named-page-type-experience-builder-sites)). Cela peut s'effectuer en 
redirigeant l'utilisateur vers la page de résultats (par ex. pour mettre une barre de recherche sur la page d'accueil) 
ou en simplement réévaluant la page courante (par ex. après avoir modifié des critères).
 
 Il inclut deux sections différentes qui peuvent être affichées seules ou ensemble:
 * une section de recherche principale (en haut) permettant de saisir des mots clés et de filtrer
 selon critères principaux, le tout dans une barre unique

 ![Main Search](/media/dsfrSearchCmpMain.png) 

 * un section complémentaire (en dessous) permettant d'affiner une sélection selon
 toute une série de critères additionnels

![Search Refine](/media/dsfrSearchCmpAdditional.png) 

Dans les deux cas, les éléments sélectionnés dans les différents critères sont synthétisés
dans des zones dédiées.

⚠️ A l'heure actuelle, seuls des critères reposant sur des champs picklists sont possibles, les
dépendances et contextualisations par Record Type étant prises en compte pour définir les
valeurs sélectionables.


## Configuration

Toute la configuration du composant s'effectue directement dans **Site Builder** au travers des propriétés proposées:
* `Afficher Recherche?`: Flag pour afficher / masquer la section de recherche standard
* `Page de Recherche`: Nom de la page de recherche (si différente de la page de recherche standard)
* `Tag Google Analytics`: Label de l'évènement généré lors de l'execution d'une recherche à destination de Google Analytics
* `Placeholder des mots clés`: Placeholder affiché dans le composant de saisie des mots clés de recherche
* `Titre du bouton rechercher`: Titre explicatif sur le bouton "rechercher" principal
* `Critères principaux`: Liste de noms API de champs picklist fournissant la liste des valeurs possibles de chaque critère principal (au format liste JSON de _ObjectApiName.FieldApiName_ ou  _ObjectApiName.FieldApiName.RecordTypeDevName_)
* `Critères complémentaires`: Liste de noms API de champs picklist fournissant la liste des valeurs possibles de chaque critère complémentaire (au même format que les critères principaux)
* `CSS additionnelle`: Classes de style pour modifier le style du conteneur du composant
* `CSS du titre`: Classes de style pour modifier le style du titre des critères complémentaires
* `Debug?`: Activation de détails pour l'analyse de problèmes


### Exemples de listes de critères

Exemple de liste de critères (sans record type):
```
[
    "OffreEmploi__c.Academie__c",
    "OffreEmploi__c.DomaineFonctionnel__c",
    "OffreEmploi__c.NiveauEtudes__c",
    "OffreEmploi__c.Region__c",
    "OffreEmploi__c.Departement__c",
    "OffreEmploi__c.NatureContrat__c",
    "OffreEmploi__c.Categorie__c",
    "OffreEmploi__c.FonctionFiliere__c",
    "OffreEmploi__c.Population__c"
]
```

Exemple de liste de critères (avec record type):
```
_à compléter_
```

### RAZ des critères

Il est possible de remettre à zéro les filtres d'une page de recherche à l'aide d'un simple
**[dsfrButtonDsp](/help/dsfrButtonDsp.md)** avec une `cible` contenant une référence de page
pointant vers la page courante sans contexte (i.e. `state`).
```
{
    "type":"comm__namedPage",
    "attributes": {"name":"Offers__c"}
}
```


### Préremplissage de critères

Il est possible de naviguer vers une page de recherche en initialisant les critères de filtrage
depuis une autre page en jouant sur le contexte (i.e. `state`) de la référence de page
cible de l'action de navigation.

Dans le `state`, les propriétés suivantes sont disponibles:
* `term` pour les mots clés à positionner dans la barre de recherche
* API Name des champs picklist utilisés dans les critères (avec le code des valeurs 
de picklist à positionner)

Par ex. 
```
{
    "type":"comm__namedPage",
    "attributes":{"name":"Offers__c"},
    "state":{"term": "","Population__c":"DE"}
}
```

## Précisions techniques

A l'heure actuelle, une picklist donnée ne peut être incluse dans les critères qu'avec un seul
record type maximum. Quand aucun record type n'est spécifié, c'est le `master` qui est utilisé
(listant toutes les valeurs possibles).
