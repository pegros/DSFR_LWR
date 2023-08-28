# Site Head Markup (Advanced Settings)

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
       
       /* Select colors overrides */
      --sds-c-select-color-background : var(--background-contrast-grey, rgb(238,238,238));
      --sds-c-select-color-background-focus : var(--background-contrast-grey, rgb(238,238,238));

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