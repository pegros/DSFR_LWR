import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import basePathName from '@salesforce/community/basePath';

export default class DsfrLinkDsp extends NavigationMixin(LightningElement) {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api linkIcon = 'arrow-right-line';
    @api linkIconPosition = 'right';
    @api linkLabel;
    @api linkTitle;
    @api linkTag; // for GA4 tracking
    @api linkSize = 'medium';
    @api linkAlign = 'left';
    @api linkCss;
    @api linkPageRef;
    @api linkTarget = '_self';
    
    //@api linkInactive = 'false';
    @api
    get linkInactive() {
        return this.isInactive;
    }
    set linkInactive(value) {
        if (this.isDebug) console.log('setting linkInactive provided ',value);
        this.isInactive = ((typeof value == 'boolean') ? value : (value === 'true'));
        if (this.isDebug) console.log('setting linkInactive evaluated ', this.isInactive);
    }

    @api isDebug = false;

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    isInactive = false;
    linkClass = 'fr-link';

    //-----------------------------------------------------
    // Custom Getters
    //-----------------------------------------------------
    get alignClass() {
        return (this.linkCss  || '') + ' align-' + this.linkAlign;
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START link for ',this.linkLabel);
            console.log('connected: link title ',this.linkTitle);
            console.log('connected: link icon ',this.linkIcon);
            console.log('connected: link icon position ',this.linkIconPosition);
            console.log('connected: link size ',this.linkSize);
            console.log('connected: link page ref ',this.linkPageRef);
            console.log('connected: link target ',this.linkTarget);
            console.log('connected: link _blank ref? ', this.isBlank);
            console.log('connected: link inactive? ', this.linkInactive);
        }

        this.linkTag = this.linkTag || this.linkLabel || this.linkTitle || 'Undefined';
        if (this.isDebug) console.log('connected: linkTag evaluated ', this.linkTag);

        //this.isInactive = ((typeof this.linkInactive == 'boolean') ? this.linkInactive : (this.linkInactive === 'true'));
        //if (this.isDebug) console.log('connected: isInactive evaluated ', this.isInactive);
        let linkClass = 'fr-link ';
        switch (this.linkSize) {
            case 'small':
                linkClass += ' fr-link--sm';
                break;
            case 'large':
                linkClass += ' fr-link--lg';
                break;
        }
        if (this.linkIcon) {
            linkClass += ' fr-link--icon-' + this.linkIconPosition + ' fr-icon-' + this.linkIcon;
        }
        this.linkClass = linkClass + ' linkLabel';
        if (this.isDebug) console.log('connected: linkClass set ', this.linkClass);

        if (this.isDebug) console.log('connected: END link');
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    openTarget(event) {
        if (this.isDebug) console.log('openTarget: START for link ',this.linkLabel);
        if (this.isDebug) console.log('openTarget: event ',event);
        
        if (this.isDebug) console.log('openTarget: page ref fetched ',this.linkPageRef);
        if (this.isDebug) console.log('openTarget: page ref stringified ',JSON.stringify(this.linkPageRef));

        if (this.linkPageRef === '#'){
            if (this.isDebug) console.log('openTarget: END / Going back to top');
            return;
        }

        event.stopPropagation();
        event.preventDefault();
        if (this.linkPageRef) {
            if (this.isDebug) console.log('openTarget: navigating to page');
            if (this.isDebug) console.log('openTarget: linkPageRef type ',typeof this.linkPageRef);

            let newPageRef = (typeof this.linkPageRef == 'string' ? JSON.parse(this.linkPageRef) : JSON.parse(JSON.stringify(this.linkPageRef)));
            if (this.isDebug) console.log('openTarget: newPageRef init ',newPageRef);
            if (this.isDebug) console.log('openTarget: newPageRef init ',JSON.stringify(newPageRef));

            try {
                if (newPageRef.type == 'fileDownload') {
                    if (this.isDebug) console.log('openTarget: downloading file');
                    
                    let fileId = newPageRef.attributes?.fileId;
                    if (this.isDebug) console.log('openTarget: fileId determined ', fileId);

                    let downloadURL = '/sfc/servlet.shepherd/document/download/' + fileId;
                    if (this.isDebug) console.log('openTarget: opening downloadURL ', downloadURL);
                    window.open(downloadURL,'_blank');

                    if (this.isDebug) console.log('openTarget: notifying GA');
                    document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_link_click',params:{event_source:'dsfrButtonDsp',event_site: basePathName,event_category:'file_download',event_label:this.linkTag}}}));

                    if (this.isDebug) console.log('openTarget: END downloading file');
                }
                else if (newPageRef.type == 'openTab') {
                    if (this.isDebug) console.log('openTarget: opening tab');
                    
                    let targetURL = newPageRef.attributes?.url;
                    if (this.isDebug) console.log('openTarget: opening targetURL ', targetURL);
                    window.open(targetURL,'_blank');

                    if (this.isDebug) console.log('openTarget: notifying GA');
                    document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_link_click',params:{event_source:'dsfrButtonDsp',event_site: basePathName,event_category:'open_tab',event_label:this.linkTag}}}));

                    if (this.isDebug) console.log('openTarget: END opening tab');
                }
                else {
                    if (this.isDebug) console.log('openTarget: triggering standard navigation');

                    if (this.isDebug) console.log('openTarget: notifying GA');
                    document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_link_click',params:{event_source:'dsfrButtonDsp',event_site: basePathName,event_category:'open_page',event_label:this.linkTag}}}));

                    this[NavigationMixin.Navigate](newPageRef);
                    if (this.isDebug) console.log('openTarget: END opening newPageRef');
                }
            }
            catch(error) {
                if (this.isDebug) console.log('openTarget: notifying GA');
                document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_link_click',params:{event_source:'dsfrButtonDsp',event_site: basePathName,event_category:'open_error',event_label:this.linkTag}}}));
                if (this.isDebug) console.log('openTarget: END KO / opening newPageRef failed ', JSON.stringify(error));
            }
        }
        else {
            if (this.isDebug) console.log('openTarget: END / notifying parent (if any via action)');
            this.dispatchEvent(new CustomEvent('trigger',null));
        }
    }
}