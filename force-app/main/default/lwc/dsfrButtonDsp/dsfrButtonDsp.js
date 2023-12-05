import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import basePathName from '@salesforce/community/basePath';
export default class DsfrButtonDsp extends NavigationMixin(LightningElement) {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api buttonIcon;
    @api buttonIconPosition = 'left';
    @api buttonLabel;
    @api buttonTitle;
    @api buttonTag; // for GA4 tracking
    @api buttonSize = 'medium';
    @api buttonVariant = 'primary';
    @api buttonTarget;
    @api buttonInactive = 'false';
    @api buttonAlign = 'right';

    @api isDebug = false;

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    isInactive = false;
    buttonClass = 'fr-btn';

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    get alignClass() {
        return 'align-' + this.buttonAlign;
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START button for ',this.buttonLabel);
            console.log('connected: button title ',this.buttonTitle);
            console.log('connected: button icon ',this.buttonIcon);
            console.log('connected: button icon position ',this.buttonIconPosition);
            console.log('connected: button variant ',this.buttonVariant);
            console.log('connected: button size ',this.buttonSize);
            console.log('connected: button target ',this.buttonTarget);
            console.log('connected: button inactive? ', this.buttonInactive);
        }

        this.buttonTag = this.buttonTag || this.buttonLabel || this.buttonTitle || 'Undefined';
        if (this.isDebug) console.log('connected: buttonTag evaluated ', this.buttonTag);

        this.isInactive = (this.buttonInactive === 'true');
        if (this.isDebug) console.log('connected: isInactive evaluated ', this.isInactive);

        let buttonClass = 'fr-btn  fr-btn--' + this.buttonVariant;
        switch (this.buttonSize) {
            case 'small':
                buttonClass += ' fr-btn--sm';
                break;
            case 'large':
                buttonClass += ' fr-btn--lg';
                break;
        }
        if (this.buttonIcon) {
            buttonClass += ' fr-btn--icon-' + this.buttonIconPosition + ' fr-icon-' + this.buttonIcon;
        }
        this.buttonClass = buttonClass + (this.buttonLabel ? ' buttonIcon' : '');
        if (this.isDebug) console.log('connected: buttonClass set ', this.buttonClass);

        if (this.isDebug) console.log('connected: END button');
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    openTarget(event) {
        if (this.isDebug) console.log('openTarget: START for button ',this.buttonLabel);
        if (this.isDebug) console.log('openTarget: event ',event);
        event.stopPropagation();
        event.preventDefault();

        if (this.isDebug) console.log('openTarget: target fetched ',this.buttonTarget);
        if (this.isDebug) console.log('openTarget: target stringified ',JSON.stringify(this.buttonTarget));
        if (this.buttonTarget) {
            if (this.isDebug) console.log('openTarget: navigating to target ');
            if (this.isDebug) console.log('openTarget: buttonTarget type ',typeof this.buttonTarget);

            let newPageRef = (typeof this.buttonTarget == 'string' ? JSON.parse(this.buttonTarget) : JSON.parse(JSON.stringify(this.buttonTag)));
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
                    document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_button_click',params:{event_source:'dsfrButtonDsp',event_site: basePathName,event_category:'file_download',event_label:this.buttonTag}}}));

                    if (this.isDebug) console.log('openTarget: END downloading file');
                }
                else if (newPageRef.type == 'openTab') {
                    if (this.isDebug) console.log('openTarget: opening tab');
                    
                    let targetURL = newPageRef.attributes?.url;
                    if (this.isDebug) console.log('openTarget: opening targetURL ', targetURL);
                    window.open(targetURL,'_blank');

                    if (this.isDebug) console.log('openTarget: notifying GA');
                    document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_button_click',params:{event_source:'dsfrButtonDsp',event_site: basePathName,event_category:'open_tab',event_label:this.buttonTag}}}));

                    if (this.isDebug) console.log('openTarget: END opening tab');
                }
                else {
                    if (this.isDebug) console.log('openTarget: triggering standard navigation');

                    if (this.isDebug) console.log('openTarget: notifying GA');
                    document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_button_click',params:{event_source:'dsfrButtonDsp',event_site: basePathName,event_category:'open_page',event_label:this.buttonTag}}}));

                    this[NavigationMixin.Navigate](newPageRef);
                    if (this.isDebug) console.log('openTarget: END opening newPageRef');
                }
            }
            catch(error) {
                if (this.isDebug) console.log('openTarget: notifying GA');
                document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_button_click',params:{event_source:'dsfrButtonDsp',event_site: basePathName,event_category:'open_error',event_label:this.buttonTag}}}));
                if (this.isDebug) console.log('openTarget: END KO / opening newPageRef failed ', JSON.stringify(error));
            }
        }
        else {
            if (this.isDebug) console.log('openTarget: END / notifying parent (if any via action)');
            this.dispatchEvent(new CustomEvent('trigger',null));
        }
    }
}