import { LightningElement, api, wire } from 'lwc';
import changePassword from '@salesforce/apex/dsfrSiteManagement_CTL.changePassword';
import getPasswordPolicyStatement from '@salesforce/apex/dsfrSiteManagement_CTL.getPasswordPolicyStatement';
import basePathName from '@salesforce/community/basePath';

export default class DsfrChangePasswordCmp extends LightningElement {
    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api mainTitle;
    @api formTitle;
    @api tag; // for GA4 tracking
    @api formDescription;
    @api formHint = 'Sauf mention contraire, tous les champs sont obligatoires.';
    @api formButton = 'Modifier';
    @api useCaptcha = false;

    @api isDebug = false;

    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------
    message;

    pwdPolicy;
    @wire(getPasswordPolicyStatement,{})
    wiredPolicy({data,error}) {
        if (this.isDebug) console.log('wiredPolicy: START for Change Password');
        if (data) {
            if (this.isDebug) console.log('wiredPolicy: data received ', data);
            this.pwdPolicy = data;
            if (this.isDebug) console.log('wiredPolicy: END for Change Password');
        }
        else if (error) {
            console.error('wiredPolicy: END KO for Change Password / error raised ', error);
        }
        else {
            console.warn('wiredPolicy: END OK for Change Password / no data fetched');
        }
    };

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) {
            console.log('connected: START for change password ', this.mainTitle);
            console.log('connected: formTitle ', this.formTitle);
            console.log('connected: formDescription ', this.formDescription);
        }

        this.tag = this.tag || this.formTitle || this.mainTitle || 'Undefined';
        if (this.isDebug) {
            console.log('connected: tag evaluated ', this.tag);
            console.log('connected: END for change password');
        }
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    handleChange(event) {
        if (this.isDebug) console.log('handleChange: START ',event);
        event.preventDefault();
        this.message = null;
        this.toggleSpinner(true);

        let passwordInputs = this.template.querySelectorAll('.fr-input[name="password"]');
        if (this.isDebug) console.log('handleChange: password inputs fetched ', passwordInputs);

        let oldPassword = passwordInputs[0]?.value;
        if (this.isDebug) console.log('handleChange: oldPassword input fetched ', oldPassword);
        let newPassword = passwordInputs[1]?.value;
        if (this.isDebug) console.log('handleChange: newPassword input fetched ', newPassword);
        let verifyNewPassword = passwordInputs[2]?.value;
        if (this.isDebug) console.log('handleChange: verifyNewPassword input fetched ', verifyNewPassword);

        if ((!newPassword) || (newPassword !== verifyNewPassword)){
            console.warn('handleChange: END KO / new password values are different: ', newPassword);
            console.warn('handleChange: vs ', verifyNewPassword);
            this.message = {
                type: "error",
                title: "Echec de mise à jour",
                details: 'Les deux valeurs du nouveau mot de passe doivent être identiques.'
            };
            this.toggleSpinner(false);
            return;
        } 
        if (this.isDebug) console.log('handleChange: password inputs checked');

        if (!(newPassword) || !(verifyNewPassword) || !(oldPassword)) {
            console.warn('handleChange: END KO / missing input');
            this.message = {
                type: "error",
                title: "Echec d'envoi",
                details: 'Merci de bien vouloir renseigner tous les champs demandés.'
            };
            this.toggleSpinner(false);
            return;
        }

        if (this.isDebug) console.log('handleChange: notifying GA');
        document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_change_password_submit',params:{event_source:'dsfrChangePasswordCmp', event_site: basePathName, event_category:'change_password',event_label:this.tag}}}));
        
        changePassword({newPassword:newPassword, verifyNewPassword:verifyNewPassword, oldPassword:oldPassword})
        .then(result => {
            if (this.isDebug) console.log('handleChange: password changed',result);

            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_change_password_success',params:{event_source:'dsfrChangePasswordCmp', event_site: basePathName, event_category:'change_password',event_label:this.tag}}}));
            if (this.isDebug) console.log('handleDownload: GA notified');
        
            let passwordInputs = this.template.querySelectorAll('.fr-input[name="password"]');
            if (this.isDebug) console.log('handleChange: password inputs fetched ', passwordInputs);
            try {
                passwordInputs[0].value = '';
                passwordInputs[1].value = '';
                passwordInputs[2].value = '';
                if (this.isDebug) console.log('handleChange: password inputs reset');
            }
            catch(error){
                console.log('handleChange: password inputs reset failed',JSON.stringify(error));
            }
            this.message = {
                type: "success",
                title: "Mise à jour effectuée",
                details: "Votre nouveau mot de passe est désormais actif"
            };
            this.toggleSpinner(false);
            if (this.isDebug) console.log('handleChange: END OK');
        }).catch(error => {
            if (this.isDebug) console.log('handleDownload: notifying GA');
            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{label:'dsfr_change_password_error',params:{event_source:'dsfrChangePasswordCmp', event_site: basePathName, event_category:'change_password',event_label:this.tag}}}));
        
            console.warn('handleChange: END KO / send failed ', JSON.stringify(error));
            this.message = {
                type: "error",
                title: "Echec de mise à jour",
                details: (error.body?.message || error.statusText || 'Erreur technique')
            };
            this.toggleSpinner(false);
        });
        if (this.isDebug) console.log('handleSend: requesting password change');
    }

    togglePassword(event) {
        if (this.isDebug) console.log('togglePassword: START for Change Password ',event);

        let passwordInputs = this.template.querySelectorAll('.fr-input[name="password"]');
        if (this.isDebug) console.log('togglePassword: password inputs fetched ', passwordInputs);

        if (this.isDebug) console.log('togglePassword: current password input type ', passwordInputs[0].type);
        passwordInputs.forEach(iter => {
            iter.type = (iter.type == 'password' ? 'text' : 'password');
        });
        if (this.isDebug) console.log('togglePassword: END for Change Password / password input type updated ', passwordInputs[0].type);
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
}