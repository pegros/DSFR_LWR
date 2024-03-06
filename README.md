# Composants **DSFR** pour Experience Sites LWR

## Introduction

Ce package contient un ensemble de composants LWC à destination des Experience Sites Salesforce implémentant le template **LWR Build Your Own**.

Il s'agit de l'implémentation de différents composants HTML définis dans le **[Système de Design de l'État Français](https://www.systeme-de-design.gouv.fr/)**, prenant en compte la structuration et les contraintes de ce template **LWR Build Your Own** des Experience Sites Salesforce.

Ces composants sont construits/maintenus en tant qu'exemples/contributions de [Pierre-Emmanuel Gros](https://github.com/pegros) dans le cadre de missions de conseil pour Salesforce.
* Il s'agit d'une première version initialisée pour un premier projet en production, les composants étant progressivement enrichis et améliorés au gré des nouveaux besoins rencontrés.
* Merci de le contacter si vous souhaitez participer à cette initiative (par ex. via des pull requests)
* Vous pouvez également utiliser les **[issues](https://github.com/pegros/DSFR_LWR/issues)** pour poser des questions, remonter des problèmes ou demander des améliorations.

⚠️ Ce package est actuellement basé sur la version **v1.10.0** du **DSFR** (see [here](https://www.systeme-de-design.gouv.fr/comment-utiliser-le-dsfr/developpeurs/prise-en-main-du-dsfr) to download a newer version). Les nouvelles versions du *DSFR** sont intégrées en _best effort_. 

ℹ️ Un autre package à destination des sites **LWR Build Your Own**  plus générique est également disponible pour enrichir les capacités de configuration des pages : cf. **[PEG_LWR](https://github.com/pegros/PEG_LWR)**

## Contenu du Package

Ce package propose différents types de composants LWC:
* Composants unitaires de présentation (tags, boutons...)
* Components de présentation (entête, pied de page)
* Composants de structure (accordéons, onglets de sections)
* Composants de sécurité (connexion, changement de mot de passe...)
* Composants complexes (cartes, tuiles, alertes...)

Chaque composant est documenté dans sa propre page.

ℹ️ Certains composants nécessitent le déploiement prélable du package **[PEG_LIST](https://github.com/pegros/PEG_LIST)** pour fonctionner. Il s'agit de tous les composants proposant des fonctionnalités avancées en termes de liste et d'action.

⚠️ Le package comporte également des éléments à charger dans le site en static resource
* la CSS, les polices et les icônes / pictogrammes du **DSFR**
* une CSS de surcharge des caractéristiques du **SLDS** standard Salesforce pour les adapter à la charte graphique du **DSFR** (afin d'utiliser certains composants standards Salesforce, par ex. le [lightning-record-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-form/documentation) ou les inputs standards des [Flows](https://help.salesforce.com/s/articleView?id=sf.flow_ref_elements_screencmp.htm))


### Composants d'action

* **[dsfrButtonDsp](/help/dsfrButtonDsp.md)** pour déclencher une action de navigation
* **[dsfrActionButtonCmp](/help/dsfrActionButtonCmp.md)** pour déclencher une création / MAJ d'un enregistrement (par ex. MAJ d'un statut)
* **[dsfrFormButtonCmp](/help/dsfrFormButtonCmp.md)** pour déclencher un formulaire de création / modification en popup modale
* **[dsfrFlowPopupCmp](/help/dsfrFlowPopupCmp.md)** pour déclencher un processus guidé (Salesforce Flow) en popup modale
* **[dsfrSearchCmp](/help/dsfrSearchCmp.md)** pour définir des critères de sélection
et naviguer vers une page de recherche (ou mettre à jour le contexte de sélection d'une
page de recherche)

### Composants de structure

* **[dsfrIconFieldDsp](/help/dsfrIconFieldDsp.md)**
* **[dsfrCardCmp](/help/dsfrCardCmp.md)**


### Composants de présentation

* **[dsfrHeaderCmp](/help/dsfrHeaderCmp.md)**
* **[dsfrCardTileListCmp](/help/dsfrCardTileListCmp.md)**

### Composants spécifiques

* **[dsfrCombinedPicklistCmp](/help/dsfrCombinedPicklistCmp.md)**

### Composants de gestion utilisateur

* **[dsfrLoginCmp](/help/dsfrLogin.md)**
* **[dsfrRegisterCmp](/help/dsfrLogin.md)**
* **[dsfrChangePasswordCmp](/help/dsfrLogin.md)**
* **[dsfrLostPasswordCmp](/help/dsfrLogin.md)**

## Configuration Details

### Experience Site Template

This package has been tested only in **Build Your Own (LWR)**
Experience Sites.

### Administration Preferences

`Àllow guest users to access public APIs` and
`Let guest users view asset files and CMS content available to the site`
settings should be activated if guest usage is supported.

Guest Usage also equires various elements to be configured to let them
properly access CMS Content, Objects, List Views (e.g. for the standard
**Grid** component), Flows... This is done via feature specific settings
(CMS, Flow) and Guest User profile configuration.

### Security & Privacy

For the time being, it is required to set the CSP to the
`Relaxed CSP: Permit Access to Inline Scripts and Allowed Hosts` value
with the local **domain** URL allowed (e.g. `https:/<mydomain>.sandbox.my.site.com/`)
in order to let the component properly load especially when included in Flows.

### Site Head Markup (Advanced Settings)

The DSFR static resource should be loaded via the head marketup for the styles, fonts, icons,
pictograms... to be properly displayed. Some custom overrides are also required to properly
style standard Salesforce components (if used).

See [dsfrHeadMarkup](/help/dsfrHeadMarkup.md)

### Theme and Branding

In the site theme, the `Set max content width` setting should be checked and the
`Max Content Width` set to 1200 (px) to be consistent with DSFR break points.

All section padding, gutters... should be also set to 0 at site level.

## Technical Details

These components leverage the latest capabilities of LWR Experience Sites and will probably not
work in Aura based ones.

A wide number of components are also usable within Flows in order to be reused for 
Page Flow processes within Experience Sites.

### Use Cards and Tiles with CMS Content

When using Cards and Tiles with CMS Collections (via the standard **Grid** component), it is possible 
to inject the following properties in the DSFR components:
* `{!Item.name}`for card/tile title
* `{!Item.body.contentBody.excerpt}` for card/tile description
* `{!Item.body.contentBody.bannerImage.url}` for card/tile image
