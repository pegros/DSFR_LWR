import { LightningElement, api, wire } from 'lwc';
//import { getObjectInfo } from 'lightning/uiObjectInfoApi';
//import { getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import getPersonAccountRT from '@salesforce/apex/dsfrSiteManagement_CTL.getPersonAccountRT';
import getPasswordPolicyStatement from '@salesforce/apex/dsfrSiteManagement_CTL.getPasswordPolicyStatement';
import registerUser from '@salesforce/apex/dsfrSiteManagement_CTL.registerUser';
import validateUser from '@salesforce/apex/dsfrSiteManagement_CTL.validateUser';

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

        let newAccount = {sobjectType: 'Account', RecordTypeId : this.defaultRecordTypeId};
        if (this.isDebug) console.log('handleSubmit: newAccount init ', JSON.stringify(newAccount));
        for (let iter in event.detail.fields) {
            if (this.isDebug) console.log('handleSubmit: processing Account field ', iter);
            if (this.isDebug) console.log('handleSubmit: with value ', event.detail.fields[iter]);
            newAccount[iter] = event.detail.fields[iter];
        }
        if (this.isDebug) console.log('handleSubmit: newAccount prepared ', JSON.stringify(newAccount));

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

        this.tmpAccount = newAccount;
        this.tmpPassword = passwordInputs[0].value;
        if (this.showCaptcha) {
            if (this.isDebug) console.log('handleSubmit: challenging captcha');
            document.dispatchEvent(new CustomEvent("grecaptchaExecute", {"detail": {action: "register"}}));
            if (this.isDebug) console.log('handleSubmit: END / captcha challenge requested');
        }
        else {
            if (this.isDebug) console.log('handleSubmit: no captcha challenge required');

            registerUser({ newAccount: newAccount, password: passwordInputs[0].value, startUrl: this.startUrl})
            .then((result) => {
                if (this.isDebug) console.log('handleSubmit: registration success ',result);
                this.toggleSpinner(false);

                this.tmpVerification = result;
                this.currentStage = 'Validation';
                if (this.isDebug) console.log('handleSubmit: next stage set ',this.currentStage);

                this.template.querySelector('.registrationForm').classList.add('slds-hide');
                this.template.querySelector('.validationForm').classList.remove('slds-hide');
                if (this.isDebug) console.log('handleSubmit: END / moving to validation stage');
                //if (this.isDebug) console.log('handleSubmit: END / opening target');
                //window.open(result,'_self');
            }).catch((error) => {
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

        let passwordInputs = this.template.querySelectorAll('.fr-input[name="password"]');
        if (this.isDebug) console.log('togglePassword: password inputs fetched ', passwordInputs);

        if (this.isDebug) console.log('togglePassword: current password input type ', passwordInputs[0].type);
        passwordInputs.forEach(iter => {
            iter.type = (iter.type == 'password' ? 'text' : 'password');
        });
        if (this.isDebug) console.log('togglePassword: END / password input type updated ', passwordInputs[0].type);
    }

    handleBack(event){
        if (this.isDebug) console.log('handleBack: START for Register with currentStage ',this.currentStage);
        this.currentStage = 'Initialisation';
        if (this.isDebug) console.log('handleBack: currentStage updated ',this.currentStage);
        this.template.querySelector('.registrationForm').classList.remove('slds-hide');
        this.template.querySelector('.validationForm').classList.add('slds-hide');
        if (this.isDebug) console.log('handleSubmit: form visibility switched back');
        if (this.isDebug) console.log('handleBack: END for Register');
    }

    handleValidate(event) {
        if (this.isDebug) console.log('handleValidate: START for Register',event);
        if (this.isDebug) console.log('handleValidate: startUrl ', this.startUrl);
        if (this.isDebug) console.log('handleValidate: verification ID ', this.tmpVerification);
        event.preventDefault();
        this.toggleSpinner(true);
        this.validationMessage = null;

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
            if (this.isDebug) console.log('handleValidate: END OK / user validated, opening target ', result);
            window.open(result,'_self');
        }).catch(error => {
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
                spinners.forEach(item => {
                    item.classList.remove('slds-hide');
                });
                //spinner.classList.remove('slds-hide');
                buttons.forEach(item => {
                    item.disabled = true;
                });
            }
            else {
                if (this.isDebug) console.log('toggleSpinner: hiding spinners');
                //spinner.classList.add('slds-hide');
                spinners.forEach(item => {
                    item.classList.add('slds-hide');
                });
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

        if (this.isDebug) console.log('handleCaptcha: validating captcha ',  JSON.stringify(event.detail));
        //validateCaptcha({ recaptchaResponse: event.detail.response})
        validateCaptcha(event.detail)
        .then(result => {
            if (this.isDebug) console.log('handleCaptcha: captcha validated');

            registerUser({ newAccount: this.tmpAccount, password: this.tmpPassword, startUrl: this.startUrl})
            .then((result) => {
                if (this.isDebug) console.log('handleCaptcha: registration success ',result);
                this.toggleSpinner(false);

                this.tmpVerification = result;
                this.currentStage = 'Validation';
                this.template.querySelector('.registrationForm').classList.add('slds-hide');
                this.template.querySelector('.validationForm').classList.remove('slds-hide');
                if (this.isDebug) console.log('handleCaptcha: END OK / moving to validation stage');
                //if (this.isDebug) console.log('handleCaptcha: END for Register / opening target');
                //window.open(result,'_self');
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

}