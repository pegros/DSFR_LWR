import { LightningElement, api, wire } from 'lwc';

import { NavigationMixin } from 'lightning/navigation';
import { CurrentPageReference } from 'lightning/navigation';
import getNavigations from '@salesforce/apex/dsfrNavigationMenu_CTL.getNavigations';
import dsfrAlertPopupDsp from "c/dsfrAlertPopupDsp";

import isGuest from '@salesforce/user/isGuest';
import userId from '@salesforce/user/Id';
import basePathName from '@salesforce/community/basePath';

import LOGIN_LABEL from '@salesforce/label/c.dsfrHeaderLoginLabel';
import LOGOUT_LABEL from '@salesforce/label/c.dsfrHeaderLogoutLabel';
import SEARCH_LABEL from '@salesforce/label/c.dsfrHeaderSearchLabel';
import MENU_LABEL from '@salesforce/label/c.dsfrHeaderMenuLabel';
import CLOSE_LABEL from '@salesforce/label/c.dsfrHeaderCloseLabel';

export default class DsfrHeaderCmp extends NavigationMixin(LightningElement) {

    //-----------------------------------
    // Configuration Parameters
    //-----------------------------------
    @api logoTitle = 'Nom du Ministère';
    @api loginUrl; // Obsolete name, now corresponding to the main logo URL
    @api logoUrlTitle;
    @api siteTitle = 'Titre du Site';
    @api siteTagline = 'Précisions sur l\'organisation';
    @api tag = 'site_header'; // for GA4 tracking
    //@api isMourning; // set mourning mode
    _isMourning; // set mourning mode
    @api 
    get isMourning() {
        return this._isMourning;
    }
    set isMourning(value) {
        if (this.isDebug) console.log('set header isMourning: value provided ', value);
        this._isMourning = value;
        if ((this._isMourning) && (this._isMourning === "true")){
            console.log('set header isMourning: setting mourning theme');
            document.documentElement.setAttribute("data-fr-mourning",'');
        }
        else {
            console.log('set header isMourning: leaving standard theme');
        }
    }

    @api topMenu;
    @api mainMenu;
    @api complexMenu;

    @api showSearch = false;
    @api searchPage;

    @api userName;
    // {"type":"comm__namedPage","attributes":{"name":"TEST__c"}}
    @api userTarget;
    @api hideLogin = false;

    @api showModes = false;

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
    mainMenuItems;
    complexMenuItems;
    currentIndex = -1;

    //-----------------------------------
    // Custom Labels
    //-----------------------------------
    loginLabel = LOGIN_LABEL;
    logoutLabel = LOGOUT_LABEL;
    searchLabel = SEARCH_LABEL;
    menuLabel = MENU_LABEL;
    closeLabel = CLOSE_LABEL;

    //-----------------------------------
    // Custom Getters
    //-----------------------------------

    get showLogin() {
        return !this.hideLogin;
    }
    get showTopMenu() {
        return (this.topMenuItems || this.userName || !this.hideLogin);
    }

    //-----------------------------------
    // Context Handling (to set selected tab)
    //-----------------------------------
    @wire(CurrentPageReference)
    pageRef;
    // Not working properly --> removed for now


    //----------------------------------------------------------------
    // Component initialisation  
    //----------------------------------------------------------------      
    connectedCallback() {
        if (this.isDebug) console.log('connected: START for header');
        if (this.isDebug) console.log('connected: topMenu ',this.topMenu);
        if (this.isDebug) console.log('connected: mainMenu', this.mainMenu);
        if (this.isDebug) console.log('connected: complexMenu', this.complexMenu);

        if (this.isDebug) console.log('connected: userName', this.userName);
        if (this.isDebug) console.log('connected: userTarget', this.userTarget);
        if (this.isDebug) console.log('connected: hideLogin', this.hideLogin);

        this.menuConfig = [{label:this.topMenu,showHome:false},{label:this.mainMenu,showHome:true}];
        if (this.isDebug) console.log('connected: menuConfig init ', JSON.stringify(this.menuConfig));
        if (this.isDebug) console.log('connected: topMenuItems init ', this.topMenuItems);
        if (this.isDebug) console.log('connected: bottomMenuItems init ', this.bottomMenuItems);

        if (this.isDebug) console.log('connected: GA tag ', this.tag);

        if (this.isDebug) console.log('connected: notifying context to GA ',this.currentUserId);
        let gaContext = { detail:{
            user_id:this.currentUserId,
            user_properties:{
                user_type: (this.isGuestUser ? 'Anonyme' : 'Connecte'),
                user_site: basePathName
            }
        }};
        if (this.isDebug) console.log('connected: gaContext init ',JSON.stringify(gaContext));
        document.dispatchEvent(new CustomEvent('gaConfig',gaContext));
        if (this.isDebug) console.log('connected: context notified to GA');

        if (this.isDebug) console.log('connected: END for header');
    }

    @wire(getNavigations, { menus:'$menuConfig', userId: '$currentUserId'})
    wiredHeaderMenus({ error, data }) {
        if (this.isDebug) console.log('wiredHeaderMenus: START with user ', this.currentUserId);
        if (this.isDebug) console.log('wiredHeaderMenus: menuConfig ',this.menuConfig);
        if (this.isDebug) console.log('wiredHeaderMenus: top menu ',this.topMenu);
        if (this.isDebug) console.log('wiredHeaderMenus: bottom menu ',this.mainMenu);

        if (data) {
            if (this.isDebug) console.log('wiredHeaderMenus: data  received ', JSON.stringify(data));

            let topMenuData = data[this.topMenu] || [];
            let topMenuItems = [];
            topMenuData.forEach(item => {
                if (this.isDebug) console.log('wiredHeaderMenus: processing top menu item ',item);
                let newItem = {... item};
                newItem.labelOrig = item.label;
                if (newItem.label?.includes('&')) {
                    if (this.isDebug) console.log('wiredHeaderMenus: unescaping label');
                    newItem.label = this.htmlDecode(newItem.label);
                }
                if (newItem.label?.includes('#')) {
                    let labelParts = newItem.label.split('#');
                    if (this.isDebug) console.log('wiredHeaderMenus: extracting icon name ', labelParts);
                    newItem.class = 'fr-btn fr-icon-' + labelParts[1];
                    newItem.label = labelParts[0];
                }
                else {
                    newItem.class = 'noIconMenu fr-btn fr-text--sm';
                }
                topMenuItems.push(newItem);
            });
            this.topMenuItems = (topMenuItems.length > 0 ? topMenuItems : null);
            if (this.isDebug) console.log('wiredHeaderMenus: topMenuItems updated',JSON.stringify(this.topMenuItems));

            let mainMenuData = data[this.mainMenu] || [];
            let mainMenuItems = [];
            mainMenuData.forEach(item => {
                if (this.isDebug) console.log('wiredHeaderMenus: processing main menu item ',item);
                let newItem = {... item};
                newItem.labelOrig = item.label;
                if (newItem.label?.includes('&')) {
                    if (this.isDebug) console.log('wiredHeaderMenus: unescaping label');
                    newItem.label = this.htmlDecode(newItem.label);
                }
                mainMenuItems.push(newItem);
            });
            this.mainMenuItems = (mainMenuItems.length > 0 ? mainMenuItems : null);
            if (this.isDebug) console.log('wiredHeaderMenus: mainMenuItems updated',JSON.stringify(this.mainMenuItems));
            if (this.isDebug) console.log('wiredHeaderMenus: END / menus initialized');
        }
        else if (error) {
            console.warn('wiredHeaderMenus: END KO for menus fetch / error  received ', JSON.stringify(error));
            this.topMenuItems = null;
            this.mainMenuItems = null;
        }
        else {
            if (this.isDebug) console.log('wiredHeaderMenus: END / no response');
        }
    }

    renderedCallback() {
        if (this.isDebug) {
            console.log('rendered: header START');

            console.log('rendered: top Menu ',this.topMenu);
            console.log('rendered: main Menu', this.mainMenu);
            console.log('rendered: complexMenu', this.complexMenu);

            console.log('rendered: title ',document?.title);
            console.log('rendered: head title ',document?.head?.title);

            console.log('rendered: current pageRef ',JSON.stringify(this.pageRef));
            console.log('rendered: location ',JSON.stringify(window.location));

            console.log('rendered: isMourning ',this._isMourning);

            console.log('rendered: header END');
        }
    }

    //----------------------------------------------------------------
    // Event handlers
    //----------------------------------------------------------------
    // Navigation links
    handleLogoClick(event) {
        if (this.isDebug) console.log('handleLogoClick: START for Header');
        event.stopPropagation();
        event.preventDefault();
        let newPageRef = {
            type: 'standard__webPage',
            attributes: {
                url: this.loginUrl
            }
        };
        if (this.isDebug) console.log('handleLogoClick: newPageRef prepared ',JSON.stringify(newPageRef));
        
        if (this.isDebug) console.log('handleLogoClick: notifying GA');
        document.dispatchEvent(new CustomEvent('gaEvent',{detail:{
            label:'dsfr_link_click',
            params:{
                event_source:'dsfrHeaderCmp',
                event_site: basePathName,
                event_category:'header_logo',
                event_label:this.tag
            }
        }}));

        this[NavigationMixin.Navigate](newPageRef);
        if (this.isDebug) console.log('handleLogoClick: END for Header');
    }
    handleTopClick(event){
        if (this.isDebug) console.log('handleTopClick: START for Header top menu ',this.topMenu);
        if (this.isDebug) console.log('handleTopClick: event received ',event);
        event.stopPropagation();
        event.preventDefault();
        if (this.isDebug) console.log('handleTopClick: topMenuItems ',JSON.stringify(this.topMenuItems));

        if (this.isDebug) console.log('handleTopClick: notifying GA');
        document.dispatchEvent(new CustomEvent('gaEvent',{detail:{
            label:'dsfr_link_click',
            params:{
                event_source:'dsfrHeaderCmp',
                event_site: basePathName,
                event_category:'header_top_menu',
                event_label:this.tag
            }
        }}));

        this.navigate(event,this.topMenuItems);
        if (this.isDebug) console.log('handleTopClick: END for Header top menu',this.topMenu);
    }
    handleMainClick(event){
        if (this.isDebug) console.log('handleMainClick: START for Header main menu ',this.mainMenu);
        if (this.isDebug) console.log('handleMainClick: event received ',event);
        event.stopPropagation();
        event.preventDefault();
        if (this.isDebug) console.log('handleMainClick: mainMenuItems ', JSON.stringify(this.mainMenuItems));

        if (this.isDebug) console.log('handleMainClick: notifying GA');
        document.dispatchEvent(new CustomEvent('gaEvent',{detail:{
            label:'dsfr_link_click',
            params:{
                event_source:'dsfrHeaderCmp',
                event_site: basePathName,
                event_category:'header_main_menu',
                event_label:this.tag
            }
        }}));

        this.navigate(event,this.mainMenuItems);
        if (this.isDebug) console.log('handleMainClick: END for Header main menu',this.topMenu);
    }

    // Login & logout buttons
    handleLogin(event) {
        if (this.isDebug) console.log('handleLogin: START for Header');
        event.stopPropagation();
        event.preventDefault();

        this.collapseModals();
        if (this.isDebug) console.log('handleLogin: modal closed');

        if (this.isDebug) console.log('handleLogin: notifying GA');
        document.dispatchEvent(new CustomEvent('gaEvent',{detail:{
            label:'dsfr_link_click',
            params:{
                event_source:'dsfrHeaderCmp',
                event_site: basePathName,
                event_category:'header_login',
                event_label:this.tag
            }
        }}));

        if (this.isDebug) console.log('handleLogin: current pageRef ',JSON.stringify(this.pageRef));
        this[NavigationMixin.GenerateUrl](this.pageRef)
        .then((url) => {
            if (this.isDebug) console.log('handleLogin: current url ',url);
            let loginPage = {type:"comm__namedPage",attributes:{name:"Login"}};
            if (    (this.pageRef.type !== 'comm__namedPage')
                ||  (!(['Register','Login','Forgot_Password','Check_Password'].includes(this.pageRef?.attributes?.name)))) {
                if (this.isDebug) console.log('handleLogin: setting current url as startURL');
                loginPage.state = {startURL:url};
            }
            else {
                if (this.pageRef.state?.startURL) {
                    if (this.isDebug) console.log('handleLogin: setting previous startURL');
                    loginPage.state = {startURL:this.pageRef.state.startURL };
                }
                else {
                    if (this.isDebug) console.log('handleLogin: setting no startURL');
                }
            }
            //let loginPage = {type:"comm__namedPage",attributes:{name:"Login"},state:{startURL:url}};
            //let loginPage = {type:'standard__webPage',attributes: {url:'/login'}};
            //let loginPage = {type: 'comm__loginPage',attributes: {actionName: 'login'};
            if (this.isDebug) console.log('handleLogin: loginPage init ', JSON.stringify(loginPage));

            this[NavigationMixin.Navigate](loginPage);                                                                      
            if (this.isDebug) console.log('handleLogin: END for Header / navigation triggered');
        }).catch((error) => {
            console.warn('handleLogin: END KO for Header / current url generation failed ',JSON.stringify(error));
        })
    }
    handleLogout(event) {
        if (this.isDebug) console.log('handleLogout: START for Header');
        event.stopPropagation();
        event.preventDefault();

        let logoutLinks = this.template.querySelectorAll('a.dsfrLogout');
        if (this.isDebug) console.log('handleLogout: logout links found',logoutLinks);
        logoutLinks.forEach(item => {item.disabled = true;});
        if (this.isDebug) console.log('handleLogout: logout links disabled',logoutLinks);
        
        if (this.isDebug) console.log('handleLogout: current pageRef ',JSON.stringify(this.pageRef));

        //if (this.isDebug) console.log('handleLogout: location fetched ', window?.location);
        //if (this.isDebug) console.log('handleLogout: hostname fetched ', window?.location?.hostname);
        if (this.isDebug) console.log('handleLogout: basePathName fetched ', basePathName);
        const baseUrl = basePathName.match(/^\/\w+/i);
        if (this.isDebug) console.log('handleLogout: baseUrl extracted ', baseUrl);
        /*const sitePrefix = basePathName.replace(/\/s$/i, ""); // site prefix is the site base path without the trailing "/s"
        const baseUrl = sitePrefix.slice(0,sitePrefix.indexOf('/',1));*/
        let logoutUrl = baseUrl + "/secur/logout.jsp";

        //let logoutUrl = baseUrl + 'vforcesite/secur/logout.jsp?retUrl=' + encodeURI(basePathName);
        if (this.isDebug) console.log('handleLogout: logoutUrl init ', logoutUrl);
        
        /*let logoutPage = {type:'standard__webPage',attributes: {url: logoutUrl}};
        //https://menjs--devpgro.sandbox.my.site.com/RecrutLWRvforcesite/servlet/networks/switch?startURL=%2Fsecur%2Flogout.jsp
        //https://menjs--devpgro.sandbox.my.site.com/RecrutLWRvforcesite/servlet/networks/switch?startURL=%2Fsecur%2Flogout.jsp
        //let logoutPage = {type:'standard__webPage',attributes: {url:'/secur/logout.jsp'}};
        //let logoutPage = {type: 'comm__loginPage',attributes: {actionName: 'logout'};
        if (this.isDebug) console.log('handleLogout: logoutPage init ', JSON.stringify(logoutPage));
        
        this[NavigationMixin.Navigate](logoutPage);*/
        this.collapseModals();
        if (this.isDebug) console.log('handleLogout: modal closed');

        

        // Fallback if GA event cannot be sent (no handler, add blocker...)
        let timeoutID = setTimeout(() => { 
            if (this.isDebug) console.log('handleLogout: END / opening target (fallback timeout)');
            window.open(logoutUrl,'_self');
        },4000);
        if (this.isDebug) console.log('handleLogout: notifying GA with timeout registered', timeoutID);

        document.dispatchEvent(new CustomEvent('gaEvent',{detail:{
            label:'dsfr_logout_click',
            params:{
                event_source:'dsfrHeaderCmp',
                event_site: basePathName,
                event_category:'header_logout',
                event_label:this.tag,
                event_callback: () => { 
                    if (this.isDebug) console.log('handleLogout: clearing timeout ',timeoutID);
                    clearTimeout(timeoutID);
                    if (this.isDebug) console.log('handleLogout: END for Header / triggering navigation ', logoutUrl);
                    window.open(logoutUrl,'_self');
                }
            }
        }}));
        /*window.open(logoutUrl, '_self');
        if (this.isDebug) console.log('handleLogout: END for Header / navigation triggered');*/
    }
    handleUserOpen(event) {
        if (this.isDebug) console.log('handleUserOpen: START for Header user target ',this.userTarget);
        event.stopPropagation();
        event.preventDefault();

        try {
            let targetPage = JSON.parse(this.userTarget);

            if (this.isDebug) console.log('handleLogin: notifying GA');
            document.dispatchEvent(new CustomEvent('gaEvent',{detail:{
                label:'dsfr_link_click',
                params:{
                    event_source:'dsfrHeaderCmp',
                    event_site: basePathName,
                    event_category:'header_user_page',
                    event_label:this.tag
                }
            }}));

            if (this.isDebug) console.log('handleLogoClick: END OK / opening target page',targetPage);
            this[NavigationMixin.Navigate](targetPage);
        }
        catch (error) {
            console.log('handleLogoClick: END KO / target page parsing failed ', JSON.stringify(error));
        }
    }

    // Display Mode Toggle action
    toggleTheme(event) {
        console.log('toggleTheme: START');
        let currentMode = document.documentElement.getAttribute("data-fr-scheme");
		console.log('toggleTheme: currentMode fetched ', currentMode);
        let targetMode = ((currentMode == 'dark') ? 'light' : 'dark');
		console.log('toggleTheme: setting targetMode ', targetMode);
    	document.documentElement.setAttribute("data-fr-scheme", targetMode);
    	document.documentElement.setAttribute("data-fr-theme", targetMode);
        //document.dispatchEvent(new CustomEvent("toggleDsfrMode", {"detail":"Changement demandé"}));
        console.log('toggleTheme: END');
    }

    // Search button action
    handleSearchKey(event) {
        if (this.isDebug) console.log('handleSearchKey: START for Header',event);
        if (event.key === 'Enter' || event.keyCode === 13) {
            if (this.isDebug) console.log('handleSearchKey: triggering search');
            this.handleSearch(event);
        }
        if (this.isDebug) console.log('handleSearchKey: END for Header');
    }
    handleSearch(event) {
        if (this.isDebug) console.log('handleSearch: START for Header');
        event.stopPropagation();
        event.preventDefault();

        this.collapseModals();
        if (this.isDebug) console.log('handleSearch: modal closed');

        const searchInput = this.template.querySelector('input[name="search-input"]');
        if (this.isDebug) console.log('handleSearch: searchInput fetched ',searchInput);

        const searchValue = searchInput?.value;
        if (this.isDebug) console.log('handleSearch: searchValue extracted ',searchValue);


        let searchPage = (this.searchPage ? {"type":"comm__namedPage","attributes":{"name":this.searchPage}} : {"type":"standard__search"});
        searchPage.state = {"term": searchValue};
        //let searchPage = {type: 'comm__namedPage',attributes:{name: 'Search'},state: {term:"test"}}
        if (this.isDebug) console.log('handleSearch: searchPage init ', JSON.stringify(searchPage));

        if (this.isDebug) console.log('handleSearch: notifying GA');
        document.dispatchEvent(new CustomEvent('gaEvent',{detail:{
            label:'dsfr_search',
            params:{
                event_source:'dsfrHeaderCmp',
                event_site: basePathName,
                event_category:(this.searchPage ? 'custom_search' : 'standard_search'),
                event_label: this.tag,
                search_term: searchValue
            }
        }}));

        this[NavigationMixin.Navigate](searchPage);
        if (this.isDebug) console.log('handleSearch: END for Header / navigation triggered');
    }

    // Expand/collapse of modals when in mobile/narrow mode
    toggleModal(event) {
        if (this.isDebug) console.log('toggleModal: START for Header');
        if (this.isDebug) console.log('toggleModal: event',event);

        const modalName = event.target.dataset.modal;
        if (this.isDebug) console.log('toggleModal: modalName identified ',modalName);

        let modalDiv = this.template.querySelector('div[data-modal=' + modalName + ']');
        if (this.isDebug) console.log('toggleModal: modalDiv found ',modalDiv);

        if (modalDiv) {
            if (this.isDebug) console.log('toggleModal: current classList ',modalDiv.classList);
            if (modalDiv.classList.contains('fr-modal--opened')) {
                if (this.isDebug) console.log('toggleModal: closing modal');
                modalDiv.classList.remove('fr-modal--opened');

                let status = document.removeEventListener('keydown',this.handlePopupKeys);
                if (this.isDebug) console.log('toggleModal: keydown listener removed on document ',status);
            }
            else {
                if (this.isDebug) console.log('toggleModal: opening modal');
                modalDiv.classList.add('fr-modal--opened');

                let status = document.addEventListener('keydown',this.handlePopupKeys, false);
                if (this.isDebug) console.log('toggleModal: keydown listener registered on document ',status);

                setTimeout(() => { 
                    let closeButton = this.template.querySelector('button.fr-btn--close');
                    if (this.isDebug) console.log('toggleModal: START fetching closeButton ',closeButton);
                    closeButton.focus({ focusVisible: true });
                    this.currentIndex = -1;
                    //event.preventDefault();
                    if (this.isDebug) console.log('showAlert: END closeButton focused');
                }, 150);
            }
        }
        if (this.isDebug) console.log('toggleModal: END for Header');
    }

    // Escape and tab key handling for modal close and tab navigation
    // implementing a tab trapping mechanism (in the popup) to support RGAA requirement
    handlePopupKeys = event => {
        if (this.isDebug) console.log('handlePopupKeys: START',event);
        if (event?.key === 'Escape') {
            if (this.isDebug) console.log('handlePopupKeys: END / closing modal');
            this.collapseModals();
            /*let modalDiv = this.template.querySelector('div.fr-modal--opened');
            if (this.isDebug) console.log('handlePopupKeys: modalDiv found ',modalDiv);

            if (modalDiv) {
                if (this.isDebug) console.log('handlePopupKeys: closing modalDiv');
                modalDiv.classList.remove('fr-modal--opened');
            }
            else {
                if (this.isDebug) console.log('handlePopupKeys: END / no open modalDiv found');
            }
            let status = document.removeEventListener('keydown',this.handlePopupKeys);
            if (this.isDebug) console.log('handlePopupKeys: END / keydown listener removed on document ',status);*/
        }
        // event?.key 'Tab' === KEYCODE_TAB
        else if (event?.key === 'Tab') { 
            let popupLinks = this.template.querySelectorAll('a.fr-nav__link');
            if (this.isDebug) console.log('handlePopupKeys: popupLinks fetched',popupLinks);
            if (this.isDebug) console.log('handlePopupKeys: #popupLinks fetched',popupLinks.length);

            if (this.isDebug) console.log('handlePopupKeys: current selection index',this.currentIndex);
            
            if (event.shiftKey) {
                if (this.isDebug) console.log('handlePopupKeys: handling SHIFT + tab ',event.key);
                if ((this.currentIndex == -1) || (this.currentIndex == 0)) {
                    if (this.isDebug) console.log('handlePopupKeys: selecting close button');
                    let closeButton = this.template.querySelector('button.fr-btn--close');
                    if (this.isDebug) console.log('handlePopupKeys: focusing on closeButton ',closeButton);
                    this.currentIndex = -1;
                    closeButton.focus({ focusVisible: true });
                }
                else {
                    this.currentIndex -= 1;
                    if (this.isDebug) console.log('handlePopupKeys: selecting previous link',this.currentIndex);
                    let newFocus = popupLinks[this.currentIndex];
                    if (this.isDebug) console.log('handlePopupKeys: focusing on previous link ',newFocus);
                    newFocus.focus({ focusVisible: true });
                }
                event.preventDefault();
            }
            else {
                if (this.isDebug) console.log('handlePopupKeys: handling tab ',event.key);
                this.currentIndex = (this.currentIndex >= popupLinks.length - 1 ? popupLinks.length - 1 : this.currentIndex += 1);
                if (this.isDebug) console.log('handlePopupKeys: selecting next link',this.currentIndex);
                let newFocus = popupLinks[this.currentIndex];
                if (this.isDebug) console.log('handlePopupKeys: focusing on first/next link ',newFocus);
                newFocus.focus({ focusVisible: true });
                event.preventDefault();
            }
            if (this.isDebug) console.log('handlePopupKeys: END / tab key processed');
        }
        else {
            if (this.isDebug) console.log('handlePopupKeys: END / ignoring key ',event?.key);
        }
    }

    // Custom Action Menu Handling
    handleActionsReady(event) {
        if (this.isDebug) console.log('handleActionsReady: START for Header');
        if (this.isDebug) console.log('handleActionsReady: event received ',event);
        event.stopPropagation();
        event.preventDefault();

        this.complexMenuItems = this.template.querySelector('c-sfpeg-action-bar-cmp').actionConfig;
        if (this.isDebug) console.log('handleActionsReady: actions fetched ',JSON.stringify(this.complexMenuItems));

        if (this.isDebug) console.log('handleActionsReady: END for Header');
    }
    handleActionTrigger(event) {
        if (this.isDebug) console.log('handleActionTrigger: START for Header');
        if (this.isDebug) console.log('handleActionTrigger: event received ',event);
        event.stopPropagation();
        event.preventDefault();
        if (this.isDebug) console.log('handleActionTrigger: event details ',JSON.stringify(event.detail));

        this.collapseMenu();
        this.collapseModals();

        const actionName = event.target.dataset.value;
        if (this.isDebug) console.log('handleActionTrigger: actionName identified ',actionName);

        try {
            if (this.isDebug) console.log('handleActionTrigger: triggering action');
            this.template.querySelector('c-sfpeg-action-bar-cmp').executeBarAction(actionName,null);
            if (this.isDebug) console.log('handleActionTrigger: END OK / action triggered');
        }
        catch (error) {
            console.warn('handleActionTrigger: action execution failed!', JSON.stringify(error));
            
            let alertConfig = {alerts:[],size:'small',label:"Modale d'alerte"};
            if (error.body?.output?.errors) {
                alertConfig.header = error.body?.message;
                error.body.output.errors.forEach(item => {
                    alertConfig.alerts.push({type:'error', message: item.message});
                });
            }
            else {
                alertConfig.alerts.push({type:'error', message: (error.body?.message || error.statusText)});
            }
            console.warn('handleActionTrigger: alertConfig init ', JSON.stringify(alertConfig));

            dsfrAlertPopupDsp.open(alertConfig)
            .then((result) => {
                if (this.isDebug) console.log('handleActionTrigger: END KO / popup closed',result);
            });
            /*let popupUtil = this.template.querySelector('c-dsfr-alert-popup-dsp');
            console.warn('handleActionTrigger: opening popupUtil ', popupUtil);
            popupUtil.showAlert(alertConfig).then(() => {
                if (this.isDebug) console.log('handleActionTrigger: END KO / popup closed');
            });*/
        }
    }
    handleActionDone(event) {
        if (this.isDebug) console.log('handleActionDone: START');
        if (this.isDebug) console.log('handleActionDone: event received ',event);
        event.stopPropagation();
        event.preventDefault();
        
        if (this.isDebug) console.log('handleActionDone: END for Header');
    }

    // Expand/collapse of custom action menu
    toggleMenu(event) {
        if (this.isDebug) console.log('toggleMenu: START for Header');
        if (this.isDebug) console.log('toggleMenu: event',event);
        event.stopPropagation();
        event.preventDefault();

        let currentTarget = event.target?.value;
        if (this.isDebug) console.log('toggleMenu: current target fetched ', currentTarget);
        let currentTargetId = event.target?.ariaControls || currentTarget;
        if (this.isDebug) console.log('toggleMenu: current target ID fetched ', currentTargetId);
        

        let currentStatus =  event.target?.ariaExpanded;
        if (this.isDebug) console.log('toggleMenu: current status fetched ', currentStatus);

        let currentMenu = this.template.querySelector("div.fr-collapse[id='" + currentTargetId + "']")
                        || this.template.querySelector("div.fr-collapse[data-name='" + currentTargetId + "']");
        if (this.isDebug) console.log('toggleMenu: current menu fetched ', currentMenu);
        
        if (!currentMenu) {
            console.warn('toggleMenu: END KO / menu not found ',currentTargetId);
            return;
        }

        if (currentStatus == "true") {
            if (this.isDebug) console.log('toggleMenu: collapsing menu');
            currentMenu.classList?.remove("fr-collapse--expanded");
            event.target.ariaExpanded = "false";
        }
        else {
            if (this.isDebug) console.log('toggleMenu: collapsing previous menu (if any)');
            this.collapseMenu();
            if (this.isDebug) console.log('toggleMenu: expanding new menu');
            currentMenu.classList.add("fr-collapse--expanded");
            event.target.ariaExpanded = "true";
        }

        if (this.isDebug) console.log('toggleMenu: END for Header');
    }

    //----------------------------------------------------------------
    // Utilities
    //----------------------------------------------------------------  
    navigate = function(event,menuItems) {
        if (this.isDebug) console.log('navigate: START for menu ', JSON.stringify(menuItems));

        this.collapseModals();
        if (this.isDebug) console.log('navigate: modal closed');

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

    collapseModals = function() {
        if (this.isDebug) console.log('collapseModals: START');

        let openModal = this.template.querySelector('div.fr-modal--opened');
        if (this.isDebug) console.log('collapseModals: openModal fetched ',openModal);

        if (openModal) {
            if (this.isDebug) console.log('collapseModals: closing modal');
            openModal.classList.remove('fr-modal--opened');
        }

        let status = document.removeEventListener('keydown',this.handlePopupKeys);
        if (this.isDebug) console.log('collapseModals: END / keydown listener removed on document ',status);
    }

    collapseMenu = function() {
        if (this.isDebug) console.log('collapseMenu: START');

        let openMenu = this.template.querySelector('div.fr-collapse--expanded');
        if (this.isDebug) console.log('collapseMenu: openMenu fetched ',openMenu);

        let openButton = this.template.querySelector('.fr-nav__btn[aria-expanded="true"]');
        if (this.isDebug) console.log('collapseMenu: openButton fetched ',openButton);

        if (openMenu) {
            if (this.isDebug) console.log('collapseMenu: closing menu');
            openMenu.classList.remove('fr-collapse--expanded');
        }

        if (openButton) {
            if (this.isDebug) console.log('collapseMenu: deselecting menu button');
            openButton.ariaExpanded = "false";
        }

        if (this.isDebug) console.log('collapseMenu: END');
    }

    htmlDecode = function(input) {
        if (this.isDebug) console.log('htmlDecode: START with ',input);
        const doc = new DOMParser().parseFromString(input, "text/html");
        let result = doc.documentElement.textContent;
        if (this.isDebug) console.log('htmlDecode: END with ',result);
        return result;
    }
      
}