# Composant Icône et Texte **DSFR**

## Introduction

Le composant **dsfrIconFieldDsp** permet d'afficher une information textuelle préfixée par une **[icône du DSFR](https://www.systeme-de-design.gouv.fr/elements-d-interface/fondamentaux-techniques/icones)**.

<img src="/media/dsfrIconFieldDsp.png" alt="Register" width=400> 

## Configuration

Toute la configuration du composant s'effectue directement dans **Site Builder** au travers des propriétés proposées:
* `Texte` : Contenu du texte principal à afficher
* `Préfixe` : Préfixe du contenu à ajouter (si celui-ci est renseigné)
* `Suffixe` : Suffixe du contenu à ajouter (si celui-ci est renseigné)
* `Icône` : Nom de l'icone DFSR à afficher dans le bouton (e.g. `checkbox-circle-line`)
* `CSS additionnelle` : Classe DSFR à appliquer au composant (e.g. `fr-m-2v`  pour ajouter une marge)
* `CSS de l'icône`: Classe DSFR à appliquer spécifiquement à l'icône (e.g. `fr-text-title--blue-france` pour en changer la couleur)
* `Debug ?` : Activation de traces pour l'analyse de problèmes

ℹ️ Si aucune valeur n'est fournie dans le paramètre `Texte`, le composant n'affiche rien (i.e. pas d'icône, préfixe ou suffixe).


## Précisions techniques

ℹ️ Le composant est également utilisé dans le composant **[dsfrIconFieldListCmp](/help/dsfrIconFieldListCmp.md)** pour en afficher une liste simple. Ce composant est lui même utilisé dans d'autres composants.