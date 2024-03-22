import { LightningElement, api } from 'lwc';
import userId       from '@salesforce/user/Id';

export default class DsfrActionListCmp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------

    @api actionConfig;          // sfpegAction metadata record name to display
    _actionContext;             // Custom context to provide to the action configuration
    @api 
    get actionContext() {
        return this._actionContext;
    }
    set actionContext(value) {
        let actionContext;
        try {
            if (this.isDebug) console.log('set actionContext: START with value provided ', JSON.stringify(value));
            actionContext = JSON.parse(value);
            if (this.isDebug) console.log('set actionContext: value parsed ', JSON.stringify(actionContext));
        }
        catch(error) {
            console.warn('set actionContext: END KO / value parsing failed ', error);
            this._actionContext = null;
            return;
        }
        this._actionContext = actionContext;
        if (this.isDebug) console.log('set actionContext: END OK / value set ', JSON.stringify(this._actionContext));
    }

    @api wrappingCss;           // Styling class for the button list

    @api isDebug = false;       // Debug mode activation

    
    //-----------------------------------------------------
    // Context parameters
    //-----------------------------------------------------
    @api objectApiName;
    @api recordId;
    currentUserId = userId;
    
    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------

    isReady = false;        // Flag indicating that action configuration is ready to display
    actionList= [];         // List of Actions to display 

    //-----------------------------------------------------
    // Custom Getters
    //-----------------------------------------------------
    get actionCount() {
        if (this.isDebug) console.log('actionCount: current actionList ',JSON.stringify(this.actionList));
        if (this.isDebug) console.log('actionCount: returning ',(this.actionList || []).length);
        return (this.actionList || []).length;
    }
    get actionContextStr() {
        return JSON.stringify(this._actionContext);
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START for action list ',this.actionConfig);
            console.log('connected: with actionContext ', JSON.stringify(this.actionContext));
            console.log('connected: with objectApiName ', this.objectApiName);
            console.log('connected: with ecordId ', this.recordId);
            console.log('connected: with userId ', this.currentUserId);
            console.log('connected: END for action list list');
        }
    }

    renderedCallback() {
        if (this.isDebug) {
            console.log('rendered: START for action list ',this.actionConfig);
            console.log('rendered: with actionContext ', JSON.stringify(this.actionContext));
            console.log('rendered: ready ? ', this.isReady);
            console.log('rendered: actionList init ', JSON.stringify(this.actionList));
            console.log('rendered: START for action list ',this.actionConfig);
        }
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    handleConfigLoad(event) {
        if (this.isDebug) console.log('handleConfigLoad: START for action list ',this.actionConfig);
        if (this.isDebug) console.log('handleConfigLoad: event received',event);

        let actionLoader = this.refs.actionLoader;
        if (this.isDebug) console.log('handleConfigLoad: actionLoader fetched',actionLoader);
        let actions = actionLoader.actionConfig;
        if (this.isDebug) console.log('handleConfigLoad: actions extracted',JSON.stringify(actions));

        if (actions) {
            if (this.isDebug) console.log('handleConfigLoad: activating display ');
            this.isReady = true ;
            this.actionList = actions;
        }
        else {
            if (this.isDebug) console.log('handleConfigLoad: deactivating display ');
            this.isReady = false ;
            this.actionList = [];
        }

        if (this.isDebug) console.log('handleConfigLoad: actionList updated ',JSON.stringify(this.actionList));
        if (this.isDebug) console.log('handleConfigLoad: END for action list ',this.actionConfig);
    }

}