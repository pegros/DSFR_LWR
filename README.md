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

```
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Community Title</title>

<!-- DSFR Styling -->
<link rel="stylesheet" href="{ basePath }/sfsites/c/resource/dsfr/dsfr.min.css" />
<link rel="stylesheet" href="{ basePath }/sfsites/c/resource/dsfr/utility/utility.min.css" />

<!-- Salesforce Styling -->
<link rel="stylesheet" href="{ basePath }/assets/styles/styles.css?{ versionKey }" />
<link rel="stylesheet" href="{ basePath }/assets/styles/salesforce-lightning-design-system.min.css?{ versionKey }" />
<link rel="stylesheet" href="{ basePath }/assets/styles/dxp-site-spacing-styling-hooks.min.css?{ versionKey }" />
<link rel="stylesheet" href="{ basePath }/assets/styles/dxp-styling-hooks.min.css?{ versionKey }" />
<link rel="stylesheet" href="{ basePath }/assets/styles/dxp-slds-extensions.min.css?{ versionKey }" />

<!-- Salesforce Styling Overrides (with DSFR values)-->
<link rel="stylesheet" href="{ basePath }/sfsites/c/resource/dsfrSlds" />

<style>
   :root {
      /** set the font for all root/body text **/
      --dxp-g-root-font-family: 'Marianne', arial, sans-serif;
      --dxp-s-body-font-family: 'Marianne', arial, sans-serif;
      --dxp-s-body-small-font-family: 'Marianne', arial, sans-serif;

      /** set the font for headings **/
      --dxp-g-heading-font-family: 'Marianne', arial, serif;
      --dxp-s-text-heading-medium-font-family: 'Marianne', arial, sans-serif;

      /** set the font for headings **/
      --dxp-s-form-element-label-font-size : 1rem;
      --dxp-s-body-small-font-size : 0.75rem;
       
      /* Error color overrides */
      --slds-g-color-error-base-40 : var(--text-default-error);
      --lwc-colorTextError : var(--text-default-error);
       
      /* Checkbox colors overrides */
      --sds-c-checkbox-color-background : white;
      --sds-c-checkbox-color-background-checked : rgb(0,0,145);
      --slds-c-checkbox-shadow: rgb(22,22,22) 0px 0px 0px 1px inset;
      --sds-c-checkbox-radius-border: .25rem;

      /* Error color overrides */
      --slds-c-radio-shadow : inset 0 0 0 1px var(--border-action-high-grey), inset 0 0 0 18px var(--background-default-grey);
       
      /* ul styling reset */
	   --ul-type: 'disc' !important;
   }

</style>
```

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
