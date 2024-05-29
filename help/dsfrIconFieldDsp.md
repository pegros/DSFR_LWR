# Composant Icône et Texte **DSFR**

## Introduction

Le composant **dsfrIconFieldDsp** permet d'afficher une information textuelle préfixée par une **[icône du DSFR](https://www.systeme-de-design.gouv.fr/elements-d-interface/fondamentaux-techniques/icones)**.

<img src="/media/dsfrIconFieldDsp.png" alt="Icon Field" width=400> 


## Configuration

Toute la configuration du composant s'effectue directement dans **Site Builder** au travers des propriétés proposées:
* `Texte` : Contenu du texte principal à afficher
* `Préfixe` : Préfixe du contenu à ajouter (si celui-ci est renseigné)
* `Suffixe` : Suffixe du contenu à ajouter (si celui-ci est renseigné)
* `Icône` : Nom de l'icone DFSR à afficher dans le bouton (e.g. `checkbox-circle-line`)
* `Toujours afficher`: flag booléen pour forcer l'affichage du composant même en cas de valeur vide. 
En effet, si aucune valeur n'est fournie dans le paramètre `Texte`, le composant n'affiche rien par défaut(i.e. pas d'icône, préfixe ou suffixe).
* `Convertir Multi-Picklist`: flag booléen pour forcer la conversion d'une valeur multi-picklist
(conversion des `;` en `, `)
* `CSS additionnelle` : Classe DSFR à appliquer au composant (e.g. `fr-m-2v`  pour ajouter une marge)
* `CSS de l'icône`: Classe DSFR à appliquer spécifiquement à l'icône (e.g. `fr-text-title--blue-france` pour en changer la couleur)
* `Debug ?` : Activation de traces pour l'analyse de problèmes


## Précisions techniques

ℹ️ Le composant est également utilisé dans le composant **[dsfrIconFieldListDsp](/help/dsfrIconFieldListDsp.md)** pour en afficher une liste simple.