# Site Head Markup (Advanced Settings)

The DSFR static resource should be loaded via the head marketup for the styles, fonts, icons,
pictograms... to be properly displayed. Some custom overrides are also required to properly
style standard Salesforce components (if used).

```
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Community Title</title>

<!-- DSFR Styling -->
<link rel="stylesheet" href="{ basePath }/sfsites/c/resource/dsfr/dsfr.min.css?{ versionKey }" />
<link rel="stylesheet" href="{ basePath }/sfsites/c/resource/dsfr/utility/utility.min.css?{ versionKey }" />

<!-- Salesforce Styling -->
<link rel="stylesheet" href="{ basePath }/assets/styles/styles.css?{ versionKey }" />
<link rel="stylesheet" href="{ basePath }/assets/styles/salesforce-lightning-design-system.min.css?{ versionKey }" />
<link rel="stylesheet" href="{ basePath }/assets/styles/dxp-site-spacing-styling-hooks.min.css?{ versionKey }" />
<link rel="stylesheet" href="{ basePath }/assets/styles/dxp-styling-hooks.min.css?{ versionKey }" />
<link rel="stylesheet" href="{ basePath }/assets/styles/dxp-slds-extensions.min.css?{ versionKey }" />

<!-- Salesforce Styling Overrides (with DSFR values)-->
<link rel="stylesheet" href="{ basePath }/sfsites/c/resource/dsfrSlds?{ versionKey }" />
```

ℹ️ You may also add the following stylesheet at the end to include additional CSS, like
```
<!-- VIRTUO Specific Styling -->
<link rel="stylesheet" href="{ basePath }/sfsites/c/resource/virtuoStyles?{ versionKey }">
```


### Google Analytics Integration

In order to connect your site to Google Analytics, you need to activate the **GA4** Integration
(and provide your site key) from the _Integration_ configuration page in Site Builder.

You then need to add the following lines in your Head Markup to relay the custom events triggered
by the DSFR button and form components to **GA4**.

```
<!-- GA Notifs -->
<script>
    console.log('gaHandler: START / Registering handlers');
    document.addEventListener('gaEvent', function(e) {
        console.log('gaEventHandler: START with ', e.detail?.label );
        //console.log('gaEventHandler: and params ', JSON.stringify(e.detail?.params));
        //console.log('gaEventHandler: current dataLayer ',JSON.stringify(window.dataLayer));
        if (typeof gtag !== 'undefined')  {
            gtag('event', e.detail.label, e.detail.params);
            //console.log('gaEventHandler: dataLayer updated ',JSON.stringify(window.dataLayer));
            console.log('gaEventHandler: END / GA4 event registered');
        }
        else {
            console.warn('gaEventHandler: END / GA4 not configured');            
        }
    });
	console.log('gaHandler: Event handler registered');

    document.addEventListener('gaConfig', function(e) {
        console.log('gaConfigHandler: START with ', JSON.stringify(e.detail));
        //console.log('gaConfigHandler: window data layer ',JSON.stringify(window.dataLayer));
        if (window.dataLayer) {
            let tagConfig = window.dataLayer.find(item => item[0] === 'config');
            //console.log('gaConfigHandler: tagConfig fetched ',JSON.stringify(tagConfig));
            let token = tagConfig[1];
            console.log('gaConfigHandler: token fetched ',token);
            //const tagIndex = window.dataLayer.findIndex(item => item[0] === 'config');
            //console.log('gaConfigHandler: tagIndex fetched ',tagIndex);
            //window.dataLayer.splice(tagIndex,1);
            //console.log('gaConfigHandler: existing config removed ',JSON.stringify(tagConfig));
            if (typeof gtag !== 'undefined')  {
                gtag('config', token, e.detail);
                //console.log('gaConfigHandler: new config added ',JSON.stringify(window.dataLayer));
                console.log('gaConfigHandler: END / GA4 config registered');
            }
            else {
                console.warn('gaEventHandler: END / GA4 not configured');            
            }
        }
        else {
            console.warn('gaConfigHandler: END KO / no window data layer to update GA context');            
        }
    });
    console.log('gaHandler: END / Config handler registered');
</script>
```

ℹ️ You may want to remove or comment all console logs before pushing this code to production.