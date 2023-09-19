# Composant DSFR Picklists Combinées **DSFR**

## Introduction

Le composant **dsfrCombinedPicklistCmp** permet de présenter et éditer un champ multi-picklist d'un enregistrement en découpant chaque valeur en plusieurs libellés indépendants.

![Combined Picklist](/media/dsfrCombinedPicklistCmp.png) 

Un cas d'usage classique est de combiner en une seule liste un type de compétence et un niveau en un seul champ multi-picklist pour éviter de définir un petit objet custom pour stocker deux informations simples (et donc gagner en stockage).

Le composant permet de les présenter sous forme de [tableau DSFR](https://www.systeme-de-design.gouv.fr/elements-d-interface/composants/tableau) avec la possibilité de retirer des valeurs ou d'en ajouter à l'aide de sélecteurs séparés pour chaque composante de valeur de valeur de picklist (`Langue` et `Niveau` dans l'exemple présenté).

Il nécessite de construire un ensemble de valeurs de picklist combinant l'ensemble des possibilités possibles de chaque composante de valeur de picklist, en utilisant un même séparateur ` - ` pour les codes et les libellés de picklist.

Une logique est mise en place sur les valeurs du premier type de libellé pour éviter tout doublon dans la liste des valeurs combinées sélectionnées. Seules les valeurs non sélectionnées dans le tableau sont disponible dans le premier sélecteur de la section d'ajout.


## Configuration

Toute la configuration du composant s'effectue directement dans **Site Builder** au travers des propriétés proposées:
* `Titre` : Titre du composant (optionnel)
* `Message` : Message d'information (optionnel)
* `Nom du Champ` : Nom API du champ Multi-Picklist considéré
* `Libellé des champs` : Libellé des entêtes de colonnes à utiliser pour les différentes composantes des valeurs de picklist
* `Objet` : Nom API de l'objet considéré
* `ID de l'enregistrement` : ID Salesforce de l'enregistrement considéré
* `CSS additionnelle` : Classes CSS à appliquer au conteneur du composant (pour en modifier légèrement l'apparence)
* `Debug ?` : Activation de détails pour l'analyse de problèmes

### Configuration de la multi-picklist

Dans l'exemple présenté ci-dessus, le global value set comporte les valeurs suivantes:
```
Code            Libellé
-------------------------------------
CH - 1          Chinois - Débutant
CH - 2          Chinois - Moyen
CH - 3          Chinois - Avancé
CH - 4          Chinois - Courant
FR - 1          Français - Débutant
FR - 2          Français - Moyen
FR - 3          Français - Avancé
FR - 4          Français - Courant
EN - 1          Anglais - Débutant
EN - 2          Anglais - Moyen
...
```

La propriété `Libellé des champs` est alors configurée avec la valeur `["Langue","Niveau"]` identifiant la première partie de valeurs de picklist comme la langue et la seconde comme le niveau.
* Le même séparateur (`- `) doit être utilisé pour les libellés et les codes
* chaque langue doit avoir une entrée pour tous les niveaux possibles

## Précisions techniques

Le composant repose sur quelques **wire** services standards de la **UI API** Salesforce:
* [getPicklistValues](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_wire_adapters_picklist_values) pour récupérer les valeurs possibles du champ multi-picklist considéré
* [getRecord](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_wire_adapters_record) pour récupérer la valeur courante du champ multi-picklist de l'enregistrement considéré
* [updateRecord](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_update_record) pour mettre à jour la valeur du champ multi-picklist de l'enregistrement considéré

⚠️ Le composant ne fonctionne donc qu'avec les [objets compatibles](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_all_supported_objects.htm) avec la UI API Salesforce.