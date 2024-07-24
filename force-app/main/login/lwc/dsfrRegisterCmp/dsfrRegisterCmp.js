import { LightningElement, api, wire } from 'lwc';
//import { getObjectInfo } from 'lightning/uiObjectInfoApi';
//import { getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import getPersonAccountRT from '@salesforce/apex/dsfrSiteManagement_CTL.getPersonAccountRT';
import getPasswordPolicyStatement from '@salesforce/apex/dsfrSiteManagement_CTL.getPasswordPolicyStatement';
import registerUser from '@salesforce/apex/dsfrSiteManagement_CTL.registerUser';
import validateUser from '@salesforce/apex/dsfrSiteManagement_CTL.validateUser';
import basePathName from '@salesforce/community/basePath';

//import getCaptchaSiteKey from '@salesforce/apex/dsfrSiteManagement_CTL.getCaptchaSiteKey';
import validateCaptcha from '@salesforce/apex/dsfrSiteManagement_CTL.validateCaptcha';
//import ACCOUNT_OBJECT from '@salesforce/schema/Account';

// Custom labels import
import MISSING_PWD from '@salesforce/label/c.dsfrSiteMgtRegistrationPwdMissingError';
import PWD_MISMATCH from '@salesforce/label/c.dsfrSiteMgtRegistrationPwdMismatchError';
import EMAIL_MISMATCH from '@salesforce/label/c.dsfrSiteMgtRegistrationEmailMismatchError';
import EMAIL_FORMAT from '@salesforce/label/c.dsfrSiteMgtRegistrationEmailTemplate';
import MISSING_CNIL from '@salesforce/label/c.dsfrSiteMgtRegistrationCnilError';

export default class DsfrRegisterCmp extends LightningElement {
    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api mainTitle = "S'enregistrer";
    @api mainDescription;
    @api tag; // for GA4 tracking

    @api formTitle = 'Se créer un compte en choisissant un identifiant';
    @api formDescription;
    @api formHelp;

    @api rtName;
    @api formFields = '[{"name":"LastName","required":true},{"name":"FirstName","required":true},{"name":"PersonEmail","required":true}]';
    
    @api cnilMention;
    @api mentionLabel;
    @api mentionDetails;

    @api validationTitle = 'Valider votre compte';
    @api validationDescription = "Un email avec un code d'accès vous a été envoyé à l'adresse indiquée à l'étape précédente. Merci de renseigner ce code.";
    @api showBack = false;

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

    formFieldList;

    // Temporary execution context
    tmpAccount;
    tmpEmail;
    tmpPassword;
    tmpVerification;

    // Progress follow-up
    stages = ["Initialisation","Validation"];
    currentStage = 'Initialisation';
    validationMessage;
    isProcessing = false;

    // Custom labels
    emailHelp = EMAIL_FORMAT;

    //-----------------------------------------------------
    // Custom Getters
    //-----------------------------------------------------
    get isStep1() {
        return this.currentStage === 'Initialisation';
    }

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

        this.tag = this.tag || this.formTitle || this.mainTitle || 'register';
        if (this.isDebug) console.log('connected: tag evaluated ', this.tag);

        if (this.isDebug) console.log('connected: END for Register');
    }

    renderedCallback() {
        if (this.isDebug) console.log('rendered: START for Register');
        if (this.isDebug) console.log('rendered: defaultRecordTypeId ', this.defaultRecordTypeId);
        if (this.isDebug) console.log('rendered: formFieldList ', JSON.stringify(this.formFieldList));
        if (this.isDebug) console.log('rendered: accountDesc ', JSON.stringify(this.accountDesc));
        if (this.isDebug) console.log('rendered: accountPicklistDesc ', JSON.stringify(this.accountPicklistDesc));

        // Does not work
        /*let emailInput = this.template.querySelector('lightning-input-field[data-name="PersonEmail"]');
        if (this.isDebug) console.log('rendered: emailInput fetched',emailInput);
        if (emailInput) {
            emailInput.onchange = this.validateEmailConfirm;
            if (this.isDebug) console.log('rendered: validation registered on emailInput ',emailInput);
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
        if (this.isDebug) console.log('handleLoad: END for Register');
    }

    validateEmailConfirm(event) {
        if (this.isDebug) console.log('validateEmailConfirm: START',event);

        let emailInput = this.template.querySelector('lightning-input-field[data-name="PersonEmail"]');
        if (this.isDebug) console.log('validateEmailConfirm: emailInput fetched',emailInput);

        if ((this.refs.emailConfirm?.value) && (this.refs.emailConfirm?.value !== emailInput?.value)) {
            console.warn('validateEmailConfirm: email inputs should match, i.e.', this.refs.emailConfirm?.value);
            console.warn('validateEmailConfirm: vs ', emailInput.value);
            this.refs.emailConfirm.setCustomValidity(EMAIL_MISMATCH);
        }
        else if (this.refs.emailConfirm?.value) {
            if (this.isDebug) console.log('validateEmailConfirm: validating input ',this.refs.emailConfirm?.value);
            this.refs.emailConfirm.setCustomValidity('');
            this.refs.emailConfirm.validity = { valid: true };
        }
        this.refs.emailConfirm.reportValidity();
        if (this.isDebug) console.log('validateEmailConfirm: END');
    }
    validatePasswordConfirm(event) {
        if (this.isDebug) console.log('validatePasswordConfirm: START',event);
        if (this.refs.pwdInput?.value !==  this.refs.pwdConfirm?.value) {
            console.warn('validatePasswordConfirm: password inputs should match',this.refs.pwdInput?.value);
            console.warn('validatePasswordConfirm: vs ',this.refs.pwdConfirm?.value);
            this.refs.pwdConfirm.setCustomValidity(PWD_MISMATCH);
        }
        else if (this.refs.pwdConfirm?.value) {
            if (this.isDebug) console.log('validatePasswordConfirm: validating input ',this.refs.pwdInput?.value);
            this.refs.pwdConfirm.setCustomValidity('');
            this.refs.pwdConfirm.validity = { valid: true };
        }
        this.refs.pwdConfirm.reportValidity();
        if (this.isDebug) console.log('validatePasswordConfirm: END');
    }
    validateMentionConfirm(event) {
        if (this.isDebug) console.log('validateMentionConfirm: START',event);
        if (this.isDebug) console.log('validateMentionConfirm: mentionConfirm checked?',this.refs.mentionConfirm?.checked);
        if (!this.refs.mentionConfirm.checked) {
            console.warn('validateMentionConfirm: unchecked mention input');
            this.refs.mentionConfirm.setCustomValidity(MISSING_CNIL);
        }
        else {
            if (this.isDebug) console.log('validateMentionConfirm: validating input');
            this.refs.mentionConfirm.setCustomValidity('');
            this.refs.mentionConfirm.validity = { valid: true };
        }
        this.refs.mentionConfirm.reportValidity();
        if (this.isDebug) console.log('validateMentionConfirm: END');
    }

    handleSubmit(event) {
        if (this.isDebug) console.log('handleSubmit: START for Register',event);
        if (this.isDebug) console.log('handleSubmit: defaultRecordTypeId ', this.defaultRecordTypeId);
        if (this.isDebug) console.log('handleSubmit: startUrl ', this.startUrl);
        event.preventDefault();
        this.toggleSpinner(true);

        this.validateEmailConfirm(event);
        this.validatePasswordConfirm(event);
        this.validateMentionConfirm(event);

        if (this.isDebug) console.log('handleSubmit: emailConfirm OK?',this.refs.emailConfirm.checkValidity());
        if (this.isDebug) console.log('handleSubmit: pwdInput OK? ',this.refs.pwdInput.checkValidity());
        if (this.isDebug) console.log('handleSubmit: pwdConfirm OK? ',this.refs.pwdConfirm.checkValidity());
        if (this.isDebug) console.log('handleSubmit: mentionConfirm OK? ',this.refs.mentionConfirm.checkValidity());

        let isOK = this.refs.emailConfirm.checkValidity() && this.refs.pwdInput.checkValidity() && this.refs.pwdConfirm.checkValidity() && this.refs.mentionConfirm.checkValidity();
        this.refs.errorMsg.setError("");
        
        // Error handling
        if (!isOK) {
            console.warn('handleSubmit: invalid inputs');

            if (!this.refs.emailConfirm.checkValidity()) {
                if (this.isDebug) console.log('handleSubmit: focusing on emailConfirm');
                this.refs.emailConfirm.focus();

            }
            else if (!this.refs.pwdInput.checkValidity()) {
                if (this.isDebug) console.log('handleSubmit: focusing on pwdInput');
                this.refs.pwdInput.focus();
            }
            else if (!this.refs.pwdConfirm.checkValidity()) {
                if (this.isDebug) console.log('handleSubmit: focusing on pwdConfirm');
                this.refs.pwdConfirm.focus();
            }
            else {
                if (this.isDebug) console.log('handleSubmit: focusing on mentionConfirm');
                this.refs.mentionConfirm.focus();
            }

            console.warn('handleSubmit: END KO');
            this.toggleSpinner(false);
            return;
        }

        // Standard case handling
        // Account Data Init
        let newAccount = {sobjectType: 'Account', RecordTypeId : this.defaultRecordTypeId};
        if (this.isDebug) console.log('handleSubmit: newAccount init ', JSON.stringify(newAccount));
        for (let iter in event.detail.fields) {
            if (this.isDebug) console.log('handleSubmit: processing Account field ', iter);
            if (this.isDebug) console.log('handleSubmit: with value ', event.detail.fields[iter]);
            newAccount[iter] = event.detail.fields[iter];
            // register value in field list
        }
        if (this.isDebug) console.log('handleSubmit: newAccount prepared ', JSON.stringify(newAccount));

        
        if (this.isDebug) console.log('handleSubmit: input checks OK');
        this.tmpAccount = newAccount;
        this.tmpPassword = this.refs.pwdInput.value;

        // Captcha control
        if (this.showCaptcha) {
            if (this.isDebug) console.log('handleSubmit: challenging captcha');

            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_register_submit',params:{event_source:'dsfrRegisterCmp', event_site: basePathName, event_category:'captcha_register',event_label:this.tag}}}));
            if (this.isDebug) console.log('handleSubmit: GA notified');

            document.dispatchEvent(new CustomEvent("grecaptchaExecute", {"detail": {action: "register"}}));
            if (this.isDebug) console.log('handleSubmit: END / captcha challenge requested');
        }
        else {
            if (this.isDebug) console.log('handleSubmit: no captcha challenge required');

            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_register_submit',params:{event_source:'dsfrRegisterCmp', event_site: basePathName, event_category:'standard_register',event_label:this.tag}}}));
            if (this.isDebug) console.log('handleSubmit: GA notified');

            registerUser({ newAccount: newAccount, password: this.refs.pwdInput.value, startUrl: this.startUrl})
            .then((result) => {
                if (this.isDebug) console.log('handleSubmit: registration success ',result);
                this.toggleSpinner(false);

                document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_validate_init',params:{event_source:'dsfrRegisterCmp', event_site: basePathName, event_category:'standard_register',event_label:this.tag}}}));
                if (this.isDebug) console.log('handleSubmit: GA notified');

                this.tmpVerification = result;
                this.currentStage = 'Validation';
                if (this.isDebug) console.log('handleSubmit: next stage set ',this.currentStage);

                /*this.template.querySelector('.registrationForm').classList.add('slds-hide');
                this.template.querySelector('.validationForm').classList.remove('slds-hide');*/
                if (this.isDebug) console.log('handleSubmit: END / moving to validation stage');
                //if (this.isDebug) console.log('handleSubmit: END / opening target');
                //window.open(result,'_self');
            }).catch((error) => {
                if (this.isDebug) console.log('handleSubmit: notifying GA');
                document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_register_error',params:{event_source:'dsfrRegisterCmp', event_site: basePathName, event_category:'standard_register',event_label:this.tag}}}));
                
                console.warn('handleSubmit: END KO / registration failed ',JSON.stringify(error));
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

        let passwordInputs = this.template.querySelectorAll('lightning-input.fr-password');
        if (this.isDebug) console.log('togglePassword: password inputs refetched ', passwordInputs);

        if (passwordInputs) {
            if (this.isDebug) console.log('togglePassword: current password input type ', passwordInputs[0].type);
            passwordInputs.forEach(iter => {
                iter.type = (iter.type == 'password' ? 'text' : 'password');
            });
            if (this.isDebug) console.log('togglePassword: END / password input type updated ', passwordInputs[0].type);
        }
        else {
            console.warn('togglePassword: END KO / password inputs not found');
        }
    }

    handleBack(event){
        if (this.isDebug) console.log('handleBack: START for Register with currentStage ',this.currentStage);

        document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_validate_cancel',params:{event_source:'dsfrRegisterCmp', event_site: basePathName, event_category:(this.showCaptcha ? 'captcha_register' : 'standard_register'),event_label:this.tag}}}));
        if (this.isDebug) console.log('handleBack: GA notified');

        this.currentStage = 'Initialisation';
        if (this.isDebug) console.log('handleBack: currentStage updated ',this.currentStage);
        /*this.template.querySelector('.registrationForm').classList.remove('slds-hide');
        this.template.querySelector('.validationForm').classList.add('slds-hide');*/
        if (this.isDebug) console.log('handleBack: form visibility switched back');
        if (this.isDebug) console.log('handleBack: END for Register');
    }

    handleValidate(event) {
        if (this.isDebug) console.log('handleValidate: START for Register',event);
        if (this.isDebug) console.log('handleValidate: startUrl ', this.startUrl);
        if (this.isDebug) console.log('handleValidate: verification ID ', this.tmpVerification);
        event.preventDefault();
        this.toggleSpinner(true);
        this.validationMessage = null;

        if (this.isDebug) console.log('handleValidate: notifying GA');
        document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_validate_complete',params:{event_source:'dsfrRegisterCmp', event_site: basePathName, event_category:(this.showCaptcha ? 'captcha_register' : 'standard_register'),event_label:this.tag}}}));
        
        let validationCode = this.template.querySelector('.fr-input[name="validationCode"]').value;
        if (this.isDebug) console.log('handleValidate: validation code fetched ', validationCode);

        if (!(validationCode)) {
            console.warn('handleValidate: END KO / missing code');
            this.validationMessage = {
                type: "error",
                title: "Echec de validation",
                details: 'Merci de bien vouloir renseigner un code.'
            };
            this.toggleSpinner(false);
            return;
        }

        validateUser({verificationId: this.tmpVerification, validationCode:validationCode, email: this.tmpAccount.PersonEmail, password: this.tmpPassword, startUrl:this.startUrl})
        .then(result => {
            if (this.isDebug) console.log('handleValidate: validation granted ', result);

            // Fallback if GA event cannot be sent (no handler, add blocker...)
            let timeoutID = setTimeout(() => { 
                this.toggleSpinner(false);
                if (this.isDebug) console.log('handleValidate: END / opening target (fallback timeout)');
                window.open(result,'_self');
            },5000);
            if (this.isDebug) console.log('handleValidate: notifying GA with timeout registered', timeoutID);

            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{
                label:'dsfr_register_success',
                params:{
                    event_source:'dsfrRegisterCmp',
                    event_site: basePathName,
                    event_category:(this.showCaptcha ? 'captcha_register' : 'standard_register'),
                    event_label:this.tag,
                    event_callback: () => { 
                        this.toggleSpinner(false);
                        if (this.isDebug) console.log('handleValidate: clearing timeout ',timeoutID);
                        clearTimeout(timeoutID);
                        if (this.isDebug) console.log('handleValidate: END OK / user validated, opening target ', result);
                        window.open(result,'_self');
                    }
                }
            }}));
            /*setTimeout(() => { 
                if (this.isDebug) console.log('handleValidate: END OK / user validated, opening target ', result);
                window.open(result,'_self');
            },1000);*/
        }).catch(error => {
            if (this.isDebug) console.log('handleValidate: notifying GA');
            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_register_error',params:{event_source:'dsfrRegisterCmp', event_site: basePathName, event_category:(this.showCaptcha ? 'captcha_register' : 'standard_register'),event_label:this.tag}}}));
            
            if (this.isDebug) console.log('handleValidate: validation error ', JSON.stringify(error));
            this.validationMessage = {
                type: "error",
                title: "Echec de validation",
                details: (error.body?.message || error.statusText || '')
            };
            this.toggleSpinner(false);
            console.warn('handleValidate: END KO / validation and login failed ', JSON.stringify(error));
        });
        if (this.isDebug) console.log('handleValidate: requesting validation and login');
    }

    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------

    toggleSpinner = function(isShown) {
        if (this.isDebug) console.log('toggleSpinner: START with',isShown);

        let spinners = this.template.querySelectorAll('lightning-spinner');
        if (this.isDebug) console.log('toggleSpinner: spinners found',spinners);

        let buttons = this.template.querySelectorAll('button.formButton');
        if (this.isDebug) console.log('toggleSpinner: buttons found',buttons);

        if (spinners) {
            if (isShown) {
                if (this.isDebug) console.log('toggleSpinner: showing spinners');
                this.isProcessing = true;
                /*spinners.forEach(item => {
                    item.classList.remove('slds-hide');
                });*/
                //spinner.classList.remove('slds-hide');
                buttons.forEach(item => {
                    item.disabled = true;
                });
            }
            else {
                if (this.isDebug) console.log('toggleSpinner: hiding spinners');
                //spinner.classList.add('slds-hide');
                this.isProcessing = false;
                /*spinners.forEach(item => {
                    item.classList.add('slds-hide');
                });*/
                buttons.forEach(item => {
                    item.disabled = false;
                });
            }
        }
        else {
            if (this.isDebug) console.log('toggleSpinner: no spinners displayed');
        }
        
        if (this.isDebug) console.log('toggleSpinner: END');
    }

    handleCaptcha = (event) => {
        if (this.isDebug) console.log('handleCaptcha: START for Register with ',JSON.stringify(event.detail));

        if (event.detail.action !== 'register') {
            if (this.isDebug) console.log('handleCaptcha: END for Register / ignoring action');
            return;
        }

        if (this.isDebug) console.log('handleCaptcha: notifying GA');
        document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_captcha_submit',params:{event_source:'dsfrRegisterCmp', event_site: basePathName, event_category:'captcha_register',event_label:this.tag}}}));

        if (this.isDebug) console.log('handleCaptcha: validating captcha ',  JSON.stringify(event.detail));
        //validateCaptcha({ recaptchaResponse: event.detail.response})
        validateCaptcha(event.detail)
        .then(result => {
            if (this.isDebug) console.log('handleCaptcha: captcha validated');

            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_captcha_success',params:{event_source:'dsfrRegisterCmp', event_site: basePathName, event_category:'captcha_register',event_label:this.tag}}}));
            if (this.isDebug) console.log('handleCaptcha: GA notified');

            registerUser({ newAccount: this.tmpAccount, password: this.tmpPassword, startUrl: this.startUrl})
            .then((result) => {
                if (this.isDebug) console.log('handleCaptcha: registration success ',result);
                this.toggleSpinner(false);

                document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_validate_init',params:{event_source:'dsfrRegisterCmp', event_site: basePathName, event_category:'captcha_register',event_label:this.tag}}}));
                if (this.isDebug) console.log('handleSubmit: GA notified');

                this.tmpVerification = result;
                this.currentStage = 'Validation';
                /*this.template.querySelector('.registrationForm').classList.add('slds-hide');
                this.template.querySelector('.validationForm').classList.remove('slds-hide');*/
                if (this.isDebug) console.log('handleCaptcha: END OK / moving to validation stage');
                //if (this.isDebug) console.log('handleCaptcha: END for Register / opening target');
                //window.open(result,'_self');
            }).catch((error) => {
                if (this.isDebug) console.log('handleSubmit: notifying GA');
                document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_register_error',params:{event_source:'dsfrRegisterCmp', event_site: basePathName, event_category:'captcha_register',event_label:this.tag}}}));
                
                console.warn('handleCaptcha: END KO for Register / registration failed ',JSON.stringify(error));
                this.template.querySelector('lightning-messages').setError(error.body?.message || error.statusText || 'Problème technique');
                this.toggleSpinner(false);
            });

            if (this.isDebug) console.log('handleCaptcha: registration requested');
        })
        .catch(error => {
            if (this.isDebug) console.log('handleCaptcha: notifying GA');
            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_captcha_error',params:{event_source:'dsfrRegisterCmp', event_site: basePathName, event_category:'captcha_register',event_label:this.tag}}}));
            
            console.warn('handleCaptcha: END KO for Register / Captcha validation failed ',JSON.stringify(error));
            this.template.querySelector('lightning-messages').setError(error.body?.message || error.statusText || 'Problème de validation Captcha');
            this.toggleSpinner(false);
        });
        if (this.isDebug) console.log('handleCaptcha: validation triggered');
    }

}