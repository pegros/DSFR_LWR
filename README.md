# **DSFR** Components for LWR Experience Sites

## Introduction

This package contains a set of configurable  LWC component implementing various
HTML components defined in the French Government Design System
([Système de Design de l'État](https://www.systeme-de-design.gouv.fr/))
for Salesforce Experience Sites.

⚠️ These components aim at reproducing as well as possible the expected DSFR Page 
Layout and Styling within **LWR Build Your Own** template based Experience Sites.   

⚠️ This is a first draft version which will progressively enhanced and extended
for a first live implementation.

These components are built/maintained as contributions/examples for ongoing Advisory assignments by 
[Pierre-Emmanuel Gros](https://github.com/pegros). Please reach out if you want to contribute to
this initiative.

⚠️ This package is based on the v1.7.2 release of the DSFR (see [here](https://www.systeme-de-design.gouv.fr/comment-utiliser-le-dsfr/developpeurs/prise-en-main-du-dsfr) to download a newer version).

## Package Content

It provides different sets of LWC Components:
* Pure layout components (accordion and tabs of sections)
* Complex Components (header and footer implementing responsibe)
* Aggregated Components (card, tiles, alerts...)
* Individual Display Components (tags, buttons...)

Each of the following component is documented in its own dedicated page.

### Composants d'action

* **[dsfrButtonDsp](/help/dsfrButtonDsp.md)**
* **[dsfrActionButtonCmp](/help/dsfrActionButtonCmp.md)**
* **[dsfrFormButtonCmp](/help/dsfrFormButtonCmp.md)**
* **[dsfrFlowPopupCmp](/help/dsfrFlowPopupCmp.md)**

### Composants de structure

* **[dsfrCardCmp](/help/dsfrCardCmp.md)**


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
