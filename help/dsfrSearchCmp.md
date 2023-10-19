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
 

## Configuration

Toute la configuration du composant s'effectue directement dans **Site Builder** au travers des propriétés proposées:

_à compléter_

## Précisions techniques

_à compléter_