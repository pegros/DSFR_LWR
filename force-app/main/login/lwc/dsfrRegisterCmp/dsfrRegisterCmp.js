import { LightningElement, api, wire } from 'lwc';
//import { getObjectInfo } from 'lightning/uiObjectInfoApi';
//import { getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import getPersonAccountRT from '@salesforce/apex/dsfrSiteManagement_CTL.getPersonAccountRT';
import getPasswordPolicyStatement from '@salesforce/apex/dsfrSiteManagement_CTL.getPasswordPolicyStatement';
import registerUser from '@salesforce/apex/dsfrSiteManagement_CTL.registerUser';

//import getCaptchaSiteKey from '@salesforce/apex/dsfrSiteManagement_CTL.getCaptchaSiteKey';
import validateCaptcha from '@salesforce/apex/dsfrSiteManagement_CTL.validateCaptcha';
//import ACCOUNT_OBJECT from '@salesforce/schema/Account';


export default class DsfrRegisterCmp extends LightningElement {
    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api mainTitle = "S'enregistrer";
    @api mainDescription;

    @api formTitle = 'Se créer un compte en choisissant un identifiant';
    @api formDescription;
    @api formHelp;

    @api rtName;
    @api formFields = '[{"name":"LastName","required":true},{"name":"FirstName","required":true},{"name":"PersonEmail","required":true}]';
    
    @api cnilMention;

    @api startUrl = '/';
    @api showCaptcha = false;

    @api isDebug = false;

    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------
    defaultRecordTypeId;
    @wire(getPersonAccountRT,{name: '$rtName'})
    wiredRT({data,error}) {
        if (this.isDebug) console.log('wiredRT: START for Register');
        if (data) {
            if (this.isDebug) console.log('wiredRT: data received ', data);
            this.defaultRecordTypeId = data;
            if (this.isDebug) console.log('wiredRT: END for Register');
        }
        else if (error) {
            console.error('wiredRT: END KO / error raised ', error);
        }
        else {
            console.warn('wiredRT: END OK / no data fetched');

        }
    };

    pwdPolicy;
    @wire(getPasswordPolicyStatement,{})
    wiredPolicy({data,error}) {
        if (this.isDebug) console.log('wiredPolicy: START for Register');
        if (data) {
            if (this.isDebug) console.log('wiredPolicy: data received ', data);
            this.pwdPolicy = data;
            if (this.isDebug) console.log('wiredPolicy: END OK for Register');
        }
        else if (error) {
            console.error('wiredPolicy: END KO for Register / error raised ', error);
        }
        else {
            console.warn('wiredPolicy: END OK for Register / no data fetched');

        }
    };

    /*captchaSiteKey;
    @wire(getCaptchaSiteKey,{})
    wiredCaptchaSiteKey({data,error}) {
        if (this.isDebug) console.log('wiredCaptchaSiteKey: START for Register');
        if (data) {
            if (this.isDebug) console.log('wiredPolicy: data received ', data);
            this.captchaSiteKey = data;
            this.triggerCaptcha();
            if (this.isDebug) console.log('wiredCaptchaSiteKey: END for Register');
        }
        else if (error) {
            console.error('wiredCaptchaSiteKey: END KO / error raised ', error);
        }
        else {
            console.warn('wiredCaptchaSiteKey: END OK / no data fetched');

        }
    };*/

    /*
    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    accountDesc;

    accountPicklistDesc;
    @wire(getPicklistValuesByRecordType, { objectApiName: ACCOUNT_OBJECT, recordTypeId: '$defaultRecordTypeId'})
    wiredPicklists({data,error}) {
        if (this.isDebug) console.log('wiredPicklists: START for Register');
        if (data) {
            if (this.isDebug) console.log('wiredPicklists: data received ', JSON.stringify(data));
            this.accountPicklistDesc = data;
            if (this.isDebug) console.log('wiredPicklists: END for Register');
        }
        else if (error) {
            console.error('wiredPicklists: END KO / error raised ', error);
        }
        else {
            console.warn('wiredPicklists: END OK / no data fetched');

        }
    };*/

    formFieldList;
    //buttonDisabled;
    //captchaTriggered;
    tmpAccount;
    tmpPassword;

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) console.log('connected: START for Register');
        if (this.isDebug) console.log('connected: defaultRecordTypeId ', this.defaultRecordTypeId);
        if (this.isDebug) console.log('connected: startUrl ', this.startUrl);

        if (this.isDebug) console.log('connected: mainTitle ', this.mainTitle);
        if (this.isDebug) console.log('connected: mainDescription ', this.mainDescription);

        if (this.isDebug) console.log('connected: formTitle ', this.formTitle);
        if (this.isDebug) console.log('connected: formDescription ', this.formDescription);
        if (this.isDebug) console.log('connected: formHelp ', this.formHelp);

        if (this.isDebug) console.log('connected: cnilMention ', this.cnilMention);

        if (this.isDebug) console.log('connected: formFields ', this.formFields);
        try {
            this.formFieldList = JSON.parse(this.formFields);
            if (this.isDebug) console.log('connected: formFieldList parsed', this.formFieldList);
        } catch(error) {
            console.warn('connected: formFieldList parsing failure ', JSON.stringify(error));
            this.formFieldList = [{name:"FieldListParsingFailure",required:true}];
        }

        if (this.showCaptcha) {
            if (this.isDebug) console.log('connected: registering showCaptcha handler');
            document.addEventListener("grecaptchaVerified", this.handleCaptcha);
            if (this.isDebug) console.log('connected: showCaptcha handler registered');
        }

        if (this.isDebug) console.log('connected: END for Register');
    }

    renderedCallback() {
        if (this.isDebug) console.log('rendered: START for Register');
        if (this.isDebug) console.log('rendered: defaultRecordTypeId ', this.defaultRecordTypeId);
        if (this.isDebug) console.log('rendered: formFieldList ', JSON.stringify(this.formFieldList));
        if (this.isDebug) console.log('rendered: accountDesc ', JSON.stringify(this.accountDesc));
        if (this.isDebug) console.log('rendered: accountPicklistDesc ', JSON.stringify(this.accountPicklistDesc));

        /*if (this.showCaptcha) {
            if (this.isDebug) console.log('rendered: triggering showCaptcha');
            this.triggerCaptcha();
        }*/

        if (this.isDebug) console.log('rendered: END for Register');
    }

    disconnectedCallback() {
        if (this.isDebug) console.log('disconnected: START for Register');

        if (this.showCaptcha) {
            if (this.isDebug) console.log('disconnected: deregistering showCaptcha handler');
            document.removeEventListener("grecaptchaVerified", this.handleCaptcha);
            if (this.isDebug) console.log('disconnected: showCaptcha handler deregistered');
        }

        if (this.isDebug) console.log('disconnected: END for Register');
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------

    handleLoad(event) {
        if (this.isDebug) console.log('handleLoad: START for Register',event);
        this.toggleSpinner(false);

        if (this.isDebug) console.log('handleLoad: defaultRecordTypeId ', this.defaultRecordTypeId);

        /*
        if ((!this.formRecordTypeId) && (this.formRecordId)){
            this.formRecordTypeId = (event.detail.records)[this.recordId]?.recordTypeId;
            if (this.isDebug) console.log('handleLoad: formRecordTypeId init ', this.formRecordTypeId);
        }

        if (!this.labelOk) {
            if (this.isDebug) console.log('handleLoad: initialising labels');
            if (this.isDebug) console.log('handleLoad: details provided ',JSON.stringify(event.detail));

            let objectFields = ((event.detail.objectInfos)[this.formObjectApiName])?.fields;
            if (this.isDebug) console.log('handleLoad: objectFields fetched ',JSON.stringify(objectFields));
            this.fieldList.forEach(item => {
                if (this.isDebug) console.log('handleLoad: processing field ',item.name);
                if (!item.label) {
                    item.label = objectFields[item.name]?.label;
                }
                if ((!item.hideHelp) && (!item.help) && (objectFields[item.name]?.inlineHelpText)) {
                    item.help = objectFields[item.name]?.inlineHelpText;
                }
                if (this.isDebug) console.log('handleLoad: label set for field ',item.label);
            });
            if (this.isDebug) console.log('handleLoad: fieldList updated ',JSON.stringify(this.fieldList));
            this.fieldList = [... this.fieldList];
        }
        */
        
        if (this.isDebug) console.log('handleLoad: END for Register');
    }

    handleSubmit(event) {
        if (this.isDebug) console.log('handleSubmit: START for Register',event);
        if (this.isDebug) console.log('handleSubmit: defaultRecordTypeId ', this.defaultRecordTypeId);
        if (this.isDebug) console.log('handleSubmit: startUrl ', this.startUrl);
        event.preventDefault();
        this.toggleSpinner(true);

        let passwordInputs = this.template.querySelectorAll('.fr-input[name="password"]');
        if (this.isDebug) console.log('handleSubmit: password inputs fetched ', passwordInputs);
        if ((!passwordInputs[0].value) || (passwordInputs[0].value !== passwordInputs[1].value)){
            console.warn('handleSubmit: END KO / password values are different: ', passwordInputs[0].value);
            console.warn('handleSubmit: vs ', passwordInputs[1].value);
            this.template.querySelector('lightning-messages').setError('Les deux valeurs du mot de passe doivent être identiques.');
            this.toggleSpinner(false);
            return;
        } 
        if (this.isDebug) console.log('handleSubmit: password inputs checked');

        let cnilCheckbox = this.template.querySelector('input[name="checkbox-cnil"]');
        if (this.isDebug) console.log('handleSubmit: cnilCheckbox input fetched ', cnilCheckbox);
        if (!cnilCheckbox || !cnilCheckbox.checked){
            console.warn('handleSubmit: END KO / CNIL mention not checked');
            this.template.querySelector('lightning-messages').setError('Merci de valider la mention CNIL');
            this.toggleSpinner(false);
            return;
        } 
        if (this.isDebug) console.log('handleSubmit: CNIL mention checked');

        let newAccount = {sobjectType: 'Account', recordTypeId : this.recordTypeId};
        for (let iter in event.detail.fields) {
            if (this.isDebug) console.log('handleSubmit: processing Account field ', iter);
            newAccount[iter] = event.detail.fields[iter];
        }
        if (this.isDebug) console.log('handleSubmit: newAccount prepared ', newAccount);

        let emailControlInput = this.template.querySelector('input[name="email-control"]');
        if (this.isDebug) console.log('handleSubmit: emailControlInput input fetched ', emailControlInput);
        if (!emailControlInput.value || (emailControlInput.value !== newAccount.PersonEmail)) {
            console.warn('handleSubmit: END KO / email values are different: ', emailControlInput.value);
            console.warn('handleSubmit: vs ', newAccount.PersonEmail);
            this.template.querySelector('lightning-messages').setError("Les deux valeurs de l'email doivent être identiques");
            this.toggleSpinner(false);
            return;
        } 
        if (this.isDebug) console.log('handleSubmit: email inputs checked');

        if (this.showCaptcha) {
            if (this.isDebug) console.log('handleSubmit: challenging captcha');
            this.tmpAccount = newAccount;
            this.tmpPassword = passwordInputs[0].value;
            document.dispatchEvent(new CustomEvent("grecaptchaExecute", {"detail": {action: "register"}}));
            if (this.isDebug) console.log('handleSubmit: END / captcha challenge requested');
        }
        else {
            if (this.isDebug) console.log('handleSubmit: no captcha challenge required');

            registerUser({ newAccount: newAccount, password: passwordInputs[0].value, startUrl: this.startUrl})
            .then((result) => {
                if (this.isDebug) console.log('handleSubmit: registration success ',result);
                this.toggleSpinner(false);
                if (this.isDebug) console.log('handleSubmit: END / opening target');
                window.open(result,'_self');
            }).catch((error) => {
                console.warn('handleSubmit: END KO / registration failed ',error);
                this.template.querySelector('lightning-messages').setError(error.body?.message || error.statusText || 'Problème technique');
                this.toggleSpinner(false);
            });

            if (this.isDebug) console.log('handleSubmit: registration requested');
        }
    }

    handleError(event) {
        if (this.isDebug) console.log('handleError: START for Register ',event);
        this.toggleSpinner(false);
        if (this.isDebug) console.log('handleError: END for Register');
    }

    togglePassword(event) {
        if (this.isDebug) console.log('togglePassword: START ',event);

        let passwordInputs = this.template.querySelectorAll('.fr-input[name="password"]');
        if (this.isDebug) console.log('togglePassword: password inputs fetched ', passwordInputs);

        if (this.isDebug) console.log('togglePassword: current password input type ', passwordInputs[0].type);
        passwordInputs.forEach(iter => {
            iter.type = (iter.type == 'password' ? 'text' : 'password');
        });
        if (this.isDebug) console.log('togglePassword: END / password input type updated ', passwordInputs[0].type);
    }

    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------

    toggleSpinner = function(isShown) {
        if (this.isDebug) console.log('toggleSpinner: START with',isShown);

        let spinner = this.template.querySelector('lightning-spinner');
        if (this.isDebug) console.log('toggleSpinner: spinner found',spinner);

        let buttons = this.template.querySelectorAll('button.formButton');
        if (this.isDebug) console.log('toggleSpinner: buttons found',buttons);

        if (spinner) {
            if (isShown) {
                if (this.isDebug) console.log('toggleSpinner: showing spinner');
                spinner.classList.remove('slds-hide');
                buttons.forEach(item => {
                    item.disabled = true;
                });
            }
            else {
                if (this.isDebug) console.log('toggleSpinner: hiding spinner');
                spinner.classList.add('slds-hide');
                buttons.forEach(item => {
                    item.disabled = false;
                });
            }
        }
        else {
            if (this.isDebug) console.log('toggleSpinner: no spinner displayed');
        }
        
        if (this.isDebug) console.log('toggleSpinner: END');
    }

    handleCaptcha = (event) => {
        if (this.isDebug) console.log('handleCaptcha: START for Register with ',JSON.stringify(event.detail));

        if (event.detail.action !== 'register') {
            if (this.isDebug) console.log('handleCaptcha: END for Register / ignoring action');
            return;
        }

        if (this.isDebug) console.log('handleCaptcha: validating captcha ',  JSON.stringify(event.detail));
        //validateCaptcha({ recaptchaResponse: event.detail.response})
        validateCaptcha(event.detail)
        .then(result => {
            if (this.isDebug) console.log('handleCaptcha: captcha validated');

            registerUser({ newAccount: this.tmpAccount, password: this.tmpPassword, startUrl: this.startUrl})
            .then((result) => {
                if (this.isDebug) console.log('handleCaptcha: registration success ',result);
                this.toggleSpinner(false);
                if (this.isDebug) console.log('handleCaptcha: END for Register / opening target');
                window.open(result,'_self');
            }).catch((error) => {
                console.warn('handleCaptcha: END KO for Register / registration failed ',JSON.stringify(error));
                this.template.querySelector('lightning-messages').setError(error.body?.message || error.statusText || 'Problème technique');
                this.toggleSpinner(false);
            });

            if (this.isDebug) console.log('handleCaptcha: registration requested');
        })
        .catch(error => {
            console.warn('handleCaptcha: END KO for Register / Captcha validation failed ',JSON.stringify(error));
            this.template.querySelector('lightning-messages').setError(error.body?.message || error.statusText || 'Problème de validation Captcha');
            this.toggleSpinner(false);
        });
        if (this.isDebug) console.log('handleCaptcha: validation triggered');
    }

    /*triggerCaptcha = function() {
        if (this.isDebug) console.log('triggerCaptcha: START');

        if (this.captchaTriggered) {
            if (this.isDebug) console.log('triggerCaptcha: END / captcha already triggered ');
            return;
        }

        if (this.captchaSiteKey) {
            if (this.isDebug) console.log('triggerCaptcha: site key available ',this.captchaSiteKey);

            let divElement = this.template.querySelector('div.recaptchaCheckbox');
            if (divElement) {
                if (this.isDebug) console.log('triggerCaptcha: divElement available ', divElement);
                let payload = {element: divElement, badge: 'bottomright', key: this.captchaSiteKey};
                document.dispatchEvent(new CustomEvent("grecaptchaRender", {detail: payload}));
                //this.captchaTriggered = true;
                if (this.isDebug) console.log('triggerCaptcha: END / captcha triggered');
            }
            else {
                if (this.isDebug) console.log('triggerCaptcha: END / awaiting ');
            }
        }
        else {
            if (this.isDebug) console.log('triggerCaptcha: END / waiting for site key ');
        }
    }*/

}