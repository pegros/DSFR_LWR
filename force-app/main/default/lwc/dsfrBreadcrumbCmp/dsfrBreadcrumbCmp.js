import { api, LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import EXPAND_LABEL from '@salesforce/label/c.dsfrBreadcrumbExpandLabel';
import ARIA_LABEL from '@salesforce/label/c.dsfrBreadcrumbAriaLabel';

export default class DsfrBreadcrumbCmp extends NavigationMixin(LightningElement) {

    //-----------------------------------
    // Configuration Parameters
    //-----------------------------------
    @api
    get breadcrumbConfig() {
        return JSON.stringify(this.breadcrumbItems);
    }
    set breadcrumbConfig(value) {
        try {
            if (this.isDebug) console.log('set breadcrumbConfig: START with ',value);
            if (value.includes('ESCAPE(((')) {
                if (this.isDebug) console.log('set breadcrumbConfig: reworking double quotes');
                let newValue = value;

                let escapeMatches = [...value.matchAll(/ESCAPE(\(\(\()(.*?)(\)\)\))/gms)];
                if (this.isDebug) console.log('set breadcrumbConfig: Double Quotes escapeMatches found ',escapeMatches);
    
                escapeMatches.forEach(matchIter => {
                    if (this.isDebug) console.log('mergeTokens: processing matchIter ',matchIter);
                    let newMatchValue = (matchIter[2]).replace(/"/gms,'\\"');
                    newMatchValue = (newMatchValue).replace(/[\r\n\t]/gms,' ');        
                    if (this.isDebug) console.log('mergeTokens: newMatchValue ', newMatchValue);
                    newValue = newValue.replace(matchIter[0],newMatchValue);
                });
                if (this.isDebug) console.log('mergeTokens: parsing escaped value', newValue);
                this.breadcrumbItems = JSON.parse(newValue);
            }
            else {
                if (this.isDebug) console.log('set breadcrumbConfig: directly parsing value');
                this.breadcrumbItems = JSON.parse(value);
            }
            if (this.isDebug) console.log('set breadcrumbConfig: END with ',this.breadcrumbItems);
        } catch (error) {
            console.error('set breadcrumbConfig: END KO with error ',JSON.stringify(error));
        }
    }
    @api breadcrumbCss;
    @api isDebug = false;

    //-----------------------------------
    // Technical Parameters
    //-----------------------------------
    breadcrumbItems = null;

    //-----------------------------------
    // Custom Labels
    //-----------------------------------
    breadcrumbExpandLabel = EXPAND_LABEL;
    breadcrumbAriaLabel = ARIA_LABEL;

    //-----------------------------------------------------
    // Custom getters
    //-----------------------------------------------------
    get breadcrumbClass() {
        return  (this.breadcrumbCss ? 'fr-breadcrumb ' + this.breadcrumbCss : 'fr-breadcrumb');
    }

    //----------------------------------------------------------------
    // Component initialisation  
    //----------------------------------------------------------------      
    connectedCallback() {
        if (this.isDebug) console.log('connected: START for breadcrumb');
        if (this.isDebug) console.log('connected: config provided ',this.breadcrumbItems);
        if (this.isDebug) console.log('connected: CSS provided ',this.breadcrumbCss);
        if (this.isDebug) console.log('connected: END for breadcrumb');
    }

    renderedCallback() {
        if (this.isDebug) console.log('rendered: START for breadcrumb');
        if (this.isDebug) console.log('rendered: current config ',this.breadcrumbItems);
        if (this.isDebug) console.log('rendered: CSS provided ',this.breadcrumbCss);
        if (this.isDebug) console.log('rendered: END for breadcrumb');
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    openTarget(event) {
        if (this.isDebug) console.log('openTarget: START for breadcrumb ');
        if (this.isDebug) console.log('openTarget: event ',event);
        if (this.isDebug) console.log('openTarget: breadcrumbCss ',this.breadcrumbCss);
        if (this.isDebug) console.log('openTarget: breadcrumbConfig ',this.breadcrumbConfig);
        event.stopPropagation();
        event.preventDefault();

        const selectedItem = event.target.dataset.value;
        if (this.isDebug) console.log('openTarget: selectedItem identified ',selectedItem);

        const selectedConfig = this.breadcrumbItems.find(item => item.label === selectedItem);
        if (this.isDebug) console.log('openTarget: selectedTarget found ',JSON.stringify(selectedConfig));

        if (selectedConfig?.target) {
            if (this.isDebug) console.log('openTarget: navigating to breadcrumb target ');

            if (this.isDebug) console.log('openTarget: END opening newPageRef');
            this[NavigationMixin.Navigate](selectedConfig.target);
        }
        else if (selectedConfig) {
            if (this.isDebug) console.end('openTarget: END ignoring breadcrumb navigation (no target defined)');
        }
        else {
            console.warn('openTarget: END KO / ignoring breadcrumb navigation (label not found)');
        }
    }

    toggleModal(event) {
        if (this.isDebug) console.log('toggleModal: START');
        if (this.isDebug) console.log('toggleModal: event',event);

        let modalButton = this.template.querySelector('button.fr-breadcrumb__button');
        if (this.isDebug) console.log('toggleModal: modalButton found ',modalButton);
        if (modalButton) {
            modalButton.setAttribute("aria-expanded", true);
            if (this.isDebug) console.log('toggleModal: modalButton updated ',modalButton);
        }

        let modalDiv = this.template.querySelector('div.fr-collapse');
        if (this.isDebug) console.log('toggleModal: modalDiv found ',modalDiv);
        if (modalDiv) {
            if (this.isDebug) console.log('toggleModal: current classList ',modalDiv.classList);
            if (modalDiv.classList.contains('fr-collapse--expanded')) {
                if (this.isDebug) console.log('toggleModal: closing modal');
                modalDiv.classList.remove('fr-collapse--expanded');
                modalDiv.style=""
            }
            else {
                if (this.isDebug) console.log('toggleModal: opening modal');
                modalDiv.classList.add('fr-collapse--expanded');
                modalDiv.style="--collapse-max-height:none; --collapse:-28px;"
            }
        }
        if (this.isDebug) console.log('toggleModal: END');
    }
}