# Composant Ajout de Fichier du **DSFR**

## Introduction

Le composant **dsfrFileUploadCmp** permet d'afficher un composant permettant de charger un nouveau document
en renseignant un ensemble de méta-données associées et en indiquant une liste d'enregistrements auxquels
il doit être associé.

Il permet également de simplement charger une nouvelle version d'un document existant (auquel cas les 
métadonnées et enregistrements liés ne sont pas modifiés).

Ce composant reprend l'affichage standard du DSFR (cf. [documentation](https://www.systeme-de-design.gouv.fr/elements-d-interface/composants/ajout-de-fichier)).
 

## Configuration

Toute la configuration du composant s'effectue directement dans **Site Builder** au travers des propriétés proposées:
* `Libellé`: Libellé du composant d'ajout
* `Explication`: Texte explicatif du composant d'ajout (surcharge de la valeur par défaut disponible dans le custom label `dsfrFileUploadComment`)
* `Tag Google Analytics`: Label de l'évènement généré lors d'un upload à destination de Google Analytics
* `Extensions`: Liste des extensions de fichiers autorisées (surcharge de la valeur configurée sur la communauté ou par défaut dans le custom label `dsfrFileUploadTypes`)
* `Taille max.`: Taille max. de fichiers autorisée (surcharge de la valeur configurée sur la communauté ou par défaut dans le custom label `dsfrFileUploadSize`)
* `Metadonnées`: Metadonnées à positionner sur le fichier (au format JSON, du style `{"fieldName":"fieldValue",...}`)
* `Inactif?`: Flag booléen pour désactivation du composant.
* `CSS additionnelle`: Classes pour modifier le style de la tuile (par ex. fr-m-2v)
* `ID de l'enregistrement lié`: ID Salesforce de l'enregistrement auquel le fichier sera rattaché
* `ID d'autres enregistrements liés`: ID d'autres l'enregistrements auquel le fichier sera rattaché (liste JSON d'IDs du style `["001xxxxxx","005xxxxxx"]`)
* `MAJ Utilisateur?`: Flag booléen pour demander le refresh des données utilisateur après l'upload
* `ID Document`: ID Salesforce d'un fichier pour lequel une nouvelle version doit être chargée par le composant
* `Debug ?`: Activation de détails pour l'analyse de problèmes


## Précisions techniques

Plusieurs custom labels sont disponibles pour des valeurs par défaut et des messages d'erreur. 
Ils sont tous préfixés par `dsfrFileUpload`.
