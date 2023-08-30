import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import loginViaIdentity from '@salesforce/apex/dsfrSiteManagement_CTL.loginViaIdentity';

export default class DsfrLoginCmp extends NavigationMixin(LightningElement) {
    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api mainTitle;
    @api mainDescription;

    @api loginTarget;
    @api lostPwdTarget;
    @api registerTarget;
    
    @api isDebug = false;

    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------
    message;

    //-----------------------------------------------------
    // Custom Labels
    //-----------------------------------------------------
    @api loginHeader;
    @api loginLabel;
    @api registerHeader;
    @api registerLabel;
    @api lostPwdLabel;

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    handleLogin(event) {
        if (this.isDebug) console.log('handleLogin: START ',event);
        event.preventDefault();
        this.message = null;

        let identity = this.template.querySelector('.fr-input[name="username"]').value;
        if (this.isDebug) console.log('handleLogin: identity input fetched ', identity);

        let password = this.template.querySelector('.fr-input[name="password"]').value;
        if (this.isDebug) console.log('handleLogin: password input fetched ', password);

        if (!(identity && password)) {
            if (this.isDebug) console.warn('handleLogin: END KO / missing input');
            this.message = {
                type: "error",
                title: "Echec de connexion",
                details: 'Merci de bien vouloir renseigner tous les champs demandés.'
            };
            return;
        }

        loginViaIdentity({identity:identity, password:password, startUrl:this.loginTarget}).then(result => {
            if (this.isDebug) console.log('handleLogin: login granted ', result);
            /*let pageRef = {type: 'standard__webPage', attributes: {url: result}};
            if (this.isDebug) console.log('handleLogin: END / opening pageRef ', JSON.stringify(pageRef));
            this[NavigationMixin.Navigate](pageRef, false);*/
            if (this.isDebug) console.log('handleLogin: END / opening target');
            window.open(result,'_self');
        }).catch(error => {
            if (this.isDebug) console.log('handleLogin: END KO / login failed ', JSON.stringify(error));
            this.message = {
                type: "error",
                title: "Echec de connexion",
                details: (error.body?.message || error.statusText || '')
            };
        });

        if (this.isDebug) console.log('handleLogin: requesting identification and authentication');
    }
    /*
    handleLostPassword(event) {
        if (this.isDebug) console.log('handleLostPassword: START');

        if (this.isDebug) console.log('handleLostPassword: END');
    }*/

    togglePassword(event) {
        if (this.isDebug) console.log('togglePassword: START ',event);

        let passwordInput = this.template.querySelector('.fr-input[name="password"]');
        if (this.isDebug) console.log('togglePassword: password input fetched ', passwordInput);

        if (this.isDebug) console.log('togglePassword: current password input type ', passwordInput.type);
        passwordInput.type = (passwordInput.type == 'password' ? 'text' : 'password');
        if (this.isDebug) console.log('togglePassword: END / password input type updated ', passwordInput.type);
    }
}