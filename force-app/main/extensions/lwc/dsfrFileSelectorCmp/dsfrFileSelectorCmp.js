import { LightningElement, api } from 'lwc';
import userId       from '@salesforce/user/Id';
import linkFile from '@salesforce/apex/dsfrFileUpload_CTL.linkFile';

export default class DsfrFileSelectorCmp extends LightningElement {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api label = 'Sélectionner un fichier';
    @api comment = 'Plusieurs fichiers sont déjà disponibles.';

    @api configName;

    _context;
    @api 
    get context() {
        return this._context;
    }
    set context(value) {
        if (value) {
            if ((!this._context) || (value !== this._context)) {
                if (this.isDebug) console.log('set context: new value provided ', value);
                if (this.isDebug) console.log('set context: objectApiName ', this.objectApiName);
                if (this.isDebug) console.log('set context: recordId ', this.recordId);
                this._context = value;
                try {
                    this.contextJson = JSON.parse(value);
                    if (this.isDebug) console.log('set context: value parsed ', this.contextJson);
                }
                catch(error) {
                    console.warn('set listContext: value parsing failed ', error);
                    this.contextJson = null;
                }
            }
            else {
                if (this.isDebug) console.log('set context: same value provided');
            }
        }
        else {
            if (this.isDebug) console.log('set context: no value provided');
        }
    }

    @api shareMode = 'V';
    @api disabled;
    @api wrappingClass;

    @api isDebug = false;

    //-----------------------------------------------------
    // Context parameters
    //-----------------------------------------------------
    @api objectApiName;
    @api recordId;
    currentUserId = userId;

    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------
    message;
    isError = false;
    fileList;
    contextJson;


    //-----------------------------------------------------
    // Custom Getters
    //-----------------------------------------------------
    get hasFiles() {
        return ((this.fileList) && (this.fileList.length > 0));
    }
    get isDisabled() {
        return (this.disabled === 'true');
    }
    get messageClass() {
        return (this.isError ? 'fr-error-text' : 'fr-valid-text');
    }
    

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START for file selector');
            console.log('connected: configName ', this.configName);
            console.log('connected: context ', this.context);
            console.log('connected: objectApiName ', this.objectApiName);
            console.log('connected: recordId ', this.recordId);
            console.log('connected: userId ', this.userId);
            console.log('connected: END for file selector');
        }
    }

    renderedCallback() {
        if (this.isDebug) {
            console.log('rendered: START for file selector');
            console.log('rendered: configName ', this.configName);
            console.log('rendered: recordId ', this.recordId);
            console.log('rendered: context ', this.context);
            console.log('rendered: context parsed ', this.contextJson);
            console.log('rendered: END for file selector');
        }
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    handleRecordLoad(event) {
        if (this.isDebug) console.log('handleRecordLoad: START for file selector',event);
        this.fileList =  event.detail;
        if (this.isDebug) console.log('handleRecordLoad: file list registered',JSON.stringify(this.fileList));
        if (this.isDebug) console.log('handleRecordLoad: END for file selector');
    }

    handleSelect(event) {
        if (this.isDebug) console.log('handleSelect: START for file selector',event);

        let fileSelect = this.template.querySelector("select[name='fileSelect']");
        if (this.isDebug) console.log('handleSelect: file selector value ',fileSelect?.value);

        if (fileSelect?.value) {
            if (this.isDebug) console.log('handleSelect: disabling file selector ',fileSelect);
            fileSelect.disabled = true;
            const linkData = {
                fileId: fileSelect?.value,
                recordId: this.recordId,
                sharing: this.shareMode
            };
            if (this.isDebug) console.log('handleSelect: linkData prepared ', JSON.stringify(linkData));
            linkFile(linkData)
                .then(result => {
                    if (this.isDebug) console.log('handleSelect: file registered as ', JSON.stringify(result));
                    this.message =  'Le fichier a bien été sélectionné!';
                    this.isError =  false;
                    let fileSelect = this.template.querySelector("select[name='fileSelect']");
                    if (this.isDebug) console.log('handleSelect: reactivating file selector ',fileSelect);
                    fileSelect.disabled = false;
                    if (this.isDebug) console.log('handleSelect: END for file selector');
                })
                .catch(error => {
                    let fileSelect = this.template.querySelector("select[name='fileSelect']");
                    if (this.isDebug) console.log('handleSelect: reactivating file selector ',fileSelect);
                    fileSelect.disabled = false;
                    console.warn('handleSelect: END KO / file registration failed ', JSON.stringify(error));
                    this.message = JSON.stringify(error);
                    this.isError = true;
                });
            if (this.isDebug) console.log('handleSelect: link triggered');
        }
        else {
            console.warn('handleSelect: END KO / no selection');
            this.message = 'Merci de sélectionner un ficheir dans la liste';
            this.isError = true;
        }
    }
}