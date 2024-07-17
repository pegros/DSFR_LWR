import { api } from 'lwc';
import LightningModal from 'lightning/modal';

export default class DsfrSearchPopupDsp extends LightningModal {
    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api searchForm;
    @api resultsConfig;
    @api popupLabel = "Formulaire de recherche";
    @api closeLabel = 'Fermer';
    @api searchLabel = 'Rechercher';
    @api fieldsize = 6;
    @api isDebug;
    @api isDebugFine;

    //----------------------------------------------------------------
    // Internal technical properties
    //----------------------------------------------------------------
    queryContext;   //queryContext

    //----------------------------------------------------------------
    // Custom Getters
    //----------------------------------------------------------------
    get resultsTitle() {
        return (this.resultsConfig?.cardTitle || 'Résultats');
    }
    get showResults() {
        return  this.resultsConfig && (this.searchForm ? this.queryContext : true);
    }
    get searchFormFields() {
        return JSON.stringify(this.searchForm?.fields);
    }

    //----------------------------------------------------------------
    // Initialization
    //----------------------------------------------------------------
    connectedCallback(event){
        if (this.isDebug) {
            console.log('connected: START SearchPopup ',this.popupLabel);
            console.log('connected: searchForm ',JSON.stringify(this.searchForm));
            console.log('connected: resultsConfig ',JSON.stringify(this.resultsConfig));
            console.log('connected: END SearchPopup');
        }
    }
    renderedCallback(event){
        if (this.isDebug) {
            console.log('rendered: START SearchPopup');
            console.log('rendered: searchForm ',JSON.stringify(this.searchForm));
            console.log('rendered: resultsConfig ',JSON.stringify(this.resultsConfig));
            console.log('rendered: END SearchPopup');
        }
    }

    //----------------------------------------------------------------
    // Event Handlers
    //----------------------------------------------------------------

    handleSubmit(event) {
        if (this.isDebug) console.log('handleSubmit: START SearchPopup',event);
        event.preventDefault();
        if (this.isDebug) console.log('handleSubmit: details',JSON.stringify(event.detail));
        if (event.detail?.fields) {
            this.queryContext = event.detail.fields;
            if (this.isDebug) console.log('handleSubmit: queryContext updated',JSON.stringify(this.queryContext));
        }
        if (this.isDebug) console.log('handleSubmit: END SearchPopup');
    }

    handleClose(event){
        if (this.isDebug) console.log('handleClose: START SearchPopup with event ',event);
        this.close('Closed');
        if (this.isDebug) console.log('handleClose: END SearchPopup / component closed');
    }

}