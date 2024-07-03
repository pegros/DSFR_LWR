import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getNavigations from '@salesforce/apex/dsfrNavigationMenu_CTL.getNavigations';

import isGuest from '@salesforce/user/isGuest';
import userId from '@salesforce/user/Id';
import basePathName from '@salesforce/community/basePath';

//import MENU_LABEL from '@salesforce/label/c.dsfrFooterMenuLabel';

export default class DsfrFooterCmp extends NavigationMixin(LightningElement) {

    //-----------------------------------
    // Configuration Parameters
    //-----------------------------------
    @api logoTitle = 'Nom du<br/>Ministère';
    @api footerTop;
    @api footerBottom;
    @api tag = 'site_footer'; // for GA4 tracking

    @api topMenu;
    @api bottomMenu;

    @api isDebug = false;
    
    //-----------------------------------
    // Contextual Parameters
    //-----------------------------------
    isGuestUser = isGuest;
    currentUserId = userId;
    
    //-----------------------------------
    // Technical Parameters
    //-----------------------------------
    menuConfig;
    topMenuItems;
    bottomMenuItems;

    //-----------------------------------
    // Custom Labels
    //-----------------------------------
    //closeLabel = CLOSE_LABEL;

    //-----------------------------------
    // Custom Getters
    //-----------------------------------

    /*get loginUrl() {
        return basePathName + '/login';
    }*/
    /*get logoutUrl() {
        return basePathName + '/logout';
    }*/

    //----------------------------------------------------------------
    // Component initialisation  
    //----------------------------------------------------------------      
    connectedCallback() {
        if (this.isDebug) console.log('connected: START for footer');
        if (this.isDebug) console.log('connected: footerTop ',this.footerTop);
        if (this.isDebug) console.log('connected: footerBottom ',this.footerBottom);
        if (this.isDebug) console.log('connected: topMenu ',this.topMenu);
        if (this.isDebug) console.log('connected: mainMenu', this.bottomMenu);

        this.menuConfig = [{label:this.topMenu,showHome:false},{label:this.bottomMenu,showHome:false}];
        if (this.isDebug) console.log('connected: menuConfig init ', this.menuConfig);
        if (this.isDebug) console.log('connected: topMenuItems init ', this.topMenuItems);
        if (this.isDebug) console.log('connected: bottomMenuItems init ', this.bottomMenuItems);

        if (this.isDebug) console.log('connected: END for footer');
    }

    @wire(getNavigations, { menus:'$menuConfig', userId: '$currentUserId'})
    wiredFooterMenus({ error, data }) {
        if (this.isDebug) console.log('wiredFooterMenus: START with user ', this.currentUserId);
        if (this.isDebug) console.log('wiredFooterMenus: menuConfig ',this.menuConfig);
        if (this.isDebug) console.log('wiredFooterMenus: top menu ',this.topMenu);
        if (this.isDebug) console.log('wiredFooterMenus: bottom menu ',this.bottomMenu);

        if (data) {
            if (this.isDebug) console.log('wiredFooterMenus: data  received ', JSON.stringify(data));
            this.topMenuItems = JSON.parse(JSON.stringify(data[this.topMenu] || []));
            this.topMenuItems.forEach(item => {
                if (item.actionType === 'ExternalLink') {
                    item.title = item.label + ' - Nouvelle fenêtre';
                    item._target = "_blank";
                }
                else {
                    item._target = "_self";
                }
                if (item.label?.includes('&')) {
                    if (this.isDebug) console.log('wiredFooterMenus: unescaping label');
                    item.label = this.htmlDecode(item.label);
                }
            });
            //this.topMenuItems = data[this.topMenu] || [];
            if (this.isDebug) console.log('wiredFooterMenus: topMenuItems updated',this.topMenuItems);
            this.bottomMenuItems = JSON.parse(JSON.stringify(data[this.bottomMenu] || []));
            this.bottomMenuItems.forEach(item => {
                if (item.actionType === 'ExternalLink') {
                    item.title = item.label + ' - Nouvelle fenêtre';
                    item._target = "_blank";
                }
                else {
                    item._target = "_self";
                }
                if (item.label?.includes('&')) {
                    if (this.isDebug) console.log('wiredFooterMenus: unescaping label');
                    item.label = this.htmlDecode(item.label);
                }
            });
            //this.bottomMenuItems = data[this.bottomMenu] || [];
            if (this.isDebug) console.log('wiredFooterMenus: bottomMenuItems updated',this.bottomMenuItems);
            if (this.isDebug) console.log('wiredFooterMenus: END / menus initialized');
        }
        else if (error) {
            console.warn('wiredFooterMenus: END KO for menus fetch / error  received ', JSON.stringify(error));
            this.topMenuItems = [];
            this.bottomMenuItems = [];
        }
        else {
            if (this.isDebug) console.log('wiredFooterMenus: END / no response');
        }
    }
    
    /*
    @wire(getMenuItems, { navLabel: '$topMenu', showHome: false })
    wiredTopMenu({ error, data }) {
        if (this.isDebug) console.log('wiredTopMenu: START for footer top menu ',this.topMenu);
        if (data) {
            if (this.isDebug) console.log('wiredTopMenu: data  received ', JSON.stringify(data));
            this.topMenuItems = [];
            data.forEach(item => {
                let newItem = {... item};
                this.topMenuItems.push(newItem);
            });
            if (this.isDebug) console.log('wiredTopMenu: END / using data as menuItems',this.topMenuItems);
        }
        else if (error) {
            console.warn('wiredTopMenu: END KO for footer top menu / error  received ', JSON.stringify(error));
            this.topMenuItems = [];
        }
        else {
            if (this.isDebug) console.log('wiredTopMenu: END / no response');
        }
    }

    @wire(getMenuItems, { navLabel: '$bottomMenu', showHome: false })
    wiredBottomMenu({ error, data }) {
        if (this.isDebug) console.log('wiredBottomMenu: START for footer main menu ',this.mainMenu);
        if (data) {
            if (this.isDebug) console.log('wiredBottomMenu: data  received ', JSON.stringify(data));
            this.bottomMenuItems = [];
            data.forEach(item => {
                let newItem = {... item};
                this.bottomMenuItems.push(newItem);
            });
            if (this.isDebug) console.log('wiredBottomMenu: END / using data as menuItems',this.bottomMenuItems);
        }
        else if (error) {
            console.warn('wiredBottomMenu: END KO for footer bottom menu / error  received ', JSON.stringify(error));
            this.bottomMenuItems = [];
        }
        else {
            if (this.isDebug) console.log('wiredBottomMenu: END / no response');
        }
    }
    */

    renderedCallback() {
        if (this.isDebug) console.log('rendered: footer START');

        if (this.isDebug) console.log('rendered: top Menu ',this.topMenu);
        if (this.isDebug) console.log('rendered: bottom Menu', this.bottomMenu);

        if (this.isDebug) console.log('rendered: title ',document?.title);
        if (this.isDebug) console.log('rendered: head title ',document?.head?.title);

        if (this.isDebug) console.log('rendered: footer END');
    }

    //----------------------------------------------------------------
    // Event handlers  
    //----------------------------------------------------------------      
    handleTopClick(event){
        if (this.isDebug) console.log('handleTopClick: START for footer menu ',this.topMenu);
        if (this.isDebug) console.log('handleTopClick: event received ',event);
        event.stopPropagation();
        event.preventDefault();

        if (this.isDebug) console.log('handleBottomClick: notifying GA');
        document.dispatchEvent(new CustomEvent('gaEvent',{detail:{
            label:'dsfr_link_click',
            params:{
                event_source:'dsfrFooterCmp',
                event_site: basePathName,
                event_category:'footer_top_menu',
                event_label:this.tag
            }
        }}));

        if (this.isDebug) console.log('handleTopClick: topMenuItems ',JSON.stringify(this.topMenuItems));
        this.navigate(event,this.topMenuItems);
        if (this.isDebug) console.log('handleTopClick: END for footer menu',this.topMenu);
    }
    handleBottomClick(event){
        if (this.isDebug) console.log('handleBottomClick: START for footer menu ',this.bottomMenu);
        if (this.isDebug) console.log('handleBottomClick: event received ',event);
        event.stopPropagation();
        event.preventDefault();

        if (this.isDebug) console.log('handleBottomClick: notifying GA');
        document.dispatchEvent(new CustomEvent('gaEvent',{detail:{
            label:'dsfr_link_click',
            params:{
                event_source:'dsfrFooterCmp',
                event_site: basePathName,
                event_category:'footer_bottom_menu',
                event_label:this.tag
            }
        }}));

        if (this.isDebug) console.log('handleBottomClick: bottomMenuItems ', JSON.stringify(this.bottomMenuItems));
        this.navigate(event,this.bottomMenuItems);
        if (this.isDebug) console.log('handleBottomClick: END for footer menu',this.bottomMenu);
    }

    //----------------------------------------------------------------
    // Utilities
    //----------------------------------------------------------------   
    navigate = function(event,menuItems) {
        if (this.isDebug) console.log('navigate: START for menu ', JSON.stringify(menuItems));
        
        const selectedLink = event.target.dataset.value;
        if (this.isDebug) console.log('navigate: selectedLink identified ',selectedLink);

        const selectedItem = menuItems.find(item => item.label === selectedLink);
        if (this.isDebug) console.log('navigate: selectedItem found ',JSON.stringify(selectedItem));

        const newPageRef = {
            type: 'standard__webPage',
            attributes: {
                url: selectedItem.actionValue
            }
        };
        if (this.isDebug) console.log('navigate: newPageRef prepared ',JSON.stringify(newPageRef));

        this[NavigationMixin.Navigate](newPageRef);
        if (this.isDebug) console.log('navigate: END for navigation menu / Navigation triggered');
        return;
    }

    htmlDecode = function(input) {
        if (this.isDebug) console.log('htmlDecode: START with ',input);
        const doc = new DOMParser().parseFromString(input, "text/html");
        let result = doc.documentElement.textContent;
        if (this.isDebug) console.log('htmlDecode: END with ',result);
        return result;
    }
}