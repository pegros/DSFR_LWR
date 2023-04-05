import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { CurrentPageReference } from 'lightning/navigation';
//import { getPicklistValues } from 'lightning/uiObjectInfoApi';
//import { getObjectInfos } from 'lightning/uiObjectInfoApi';
import getPicklistValues from '@salesforce/apex/dsfrPicklist_CTL.getPicklistValues';

export default class DsfrSearchCmp extends NavigationMixin(LightningElement) {

    //-----------------------------------------------------
    // Configuration parameters
    //-----------------------------------------------------
    @api showSearch = false;    // Display search bar
    @api mainCriteria;          // Main criteria configuration
    @api criteria;              // Additional criteria configuration

    @api isDebug = false;

    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------
    mainFieldList;          // Picklist field API Names for main Criteria
    fieldList;              // Picklist field API Names for additional Criteria

    currentState;           // Current page state
    searchTerm;             // Current page state search term

    mainCriteriaList;       // main criteria values
    criteriaList;           // additional criteria values

    isReady = false;

    //-----------------------------------------------------
    // Custom Getters
    //-----------------------------------------------------

    //-----------------------------------------------------
    // Context Data
    //-----------------------------------------------------
    @wire(getPicklistValues, { fieldList: '$mainFieldList' })
    wiredMainPicklists({ error, data }) {
        if (this.isDebug) console.log('wiredMainPicklists: START for main search criteria');
        if (data) {
            if (this.isDebug) console.log('wiredMainPicklists: Picklist descriptions fetched ', JSON.stringify(data));
            let criteriaList = JSON.parse(JSON.stringify(data));

            if (this.currentState) {
                if (this.isDebug) console.log('wiredMainPicklists: setting initial states');
                this.mainCriteriaList = this.initCriteria(criteriaList,this.currentState);
            }
            else {
                if (this.isDebug) console.log('wiredMainPicklists: no current state to set');
                this.mainCriteriaList = criteriaList;
            }
        }
        else if (error) {
            console.warn('wiredMainPicklists: Picklist fetch failed ', JSON.stringify(error));
            this.mainCriteriaList = [];
        }
        if (this.isDebug) console.log('wiredMainPicklists: END for main search criteria');
    }

    @wire(getPicklistValues, { fieldList: '$fieldList' })
    wiredPicklists({ error, data }) {
        if (this.isDebug) console.log('wiredPicklists: START for search criteria ');
        if (data) {
            if (this.isDebug) console.log('wiredPicklists: Picklist descriptions fetched ', JSON.stringify(data));
            let criteriaList = JSON.parse(JSON.stringify(data));

            criteriaList.forEach(item => {
                if (item.values.length < 11) {
                    item.isTag = true;
                }
            });
            if (this.isDebug) console.log('wiredPicklists: Picklist tags init ', JSON.stringify(criteriaList));

            if (this.currentState) {
                if (this.isDebug) console.log('wiredPicklists: setting initial states');
                this.criteriaList = this.initCriteria(criteriaList,this.currentState);
            }
            else {
                if (this.isDebug) console.log('wiredPicklists: no current state to set');
                this.criteriaList = criteriaList;
            }
        }
        else if (error) {
            console.warn('wiredPicklists: Picklist fetch failed ', JSON.stringify(error));
            this.criteriaList = [];
        }
        if (this.isDebug) console.log('wiredPicklists: END for search criteria');
    }

    @wire(CurrentPageReference) 
    wiredPageRef(data) {
        if (this.isDebug) console.log('wiredPageRef: START for search');
        if (this.isDebug) console.log('wiredPageRef: page ref provided ', JSON.stringify(data));

        this.currentState = data.state;
        if (this.isDebug) console.log('wiredPageRef: current state set ', JSON.stringify(this.currentState));

        this.searchTerm = this.currentState.term || '';
        if (this.isDebug) console.log('wiredPageRef: search term updated ', this.searchTerm);

        if (this.isDebug) console.log('wiredPageRef: END for search');
    }

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) console.log('connected: START for search');
        if (this.isDebug) console.log('connected: showSearch ', this.showSearch);
        
        if (this.mainCriteria) {
            if (this.isDebug) console.log('connected: processing mainCriteria ', this.mainCriteria);
            try {
                this.mainFieldList = JSON.parse(this.mainCriteria);
                if (this.isDebug) console.log('connected: main field list registered ', mainFieldList);
            }
            catch (error) {
                console.warn('connected: main criteria parsing failed ', error);
            }
        }
        if (this.criteria) {
            if (this.isDebug) console.log('connected: processing criteria ', this.criteria);
            try {
                this.fieldList = JSON.parse(this.criteria);
                if (this.isDebug) console.log('connected: additional field list registered ', fieldList);
            }
            catch (error) {
                console.warn('connected: additional criteria parsing failed ', error);
            }
        }

        if (this.isDebug) console.log('connected: END for search');
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    // Expand/Collapse events
    expandCollapse(event) {
        if (this.isDebug) console.log('expandCollapse: START');
        if (this.isDebug) console.log('expandCollapse: event ',event);
        event.stopPropagation();
        event.preventDefault();

        let currentTarget = event.target?.value;
        if (this.isDebug) console.log('expandCollapse: current target fetched ', currentTarget);

        let currentStatus =  event.target?.ariaExpanded;
        if (this.isDebug) console.log('expandCollapse: current status fetched ', currentStatus);

        let currentSection = this.template.querySelector("div.fr-collapse[data-name='" + currentTarget + "']");
        if (this.isDebug) console.log('expandCollapse: current section fetched ', currentSection);
        
        if (currentStatus == "true") {
            if (this.isDebug) console.log('expandCollapse: collapsing section');
            currentSection.classList?.remove("fr-collapse--expanded");
            event.target.ariaExpanded = "false";
        }
        else {
            if (this.isDebug) console.log('expandCollapse: expanding section');
            currentSection.classList.add("fr-collapse--expanded");
            event.target.ariaExpanded = "true";
        }

        if (this.isDebug) console.log('expandCollapse: END');
    }

    // Option Selection events
    toggleMenuSelect(event){
        if (this.isDebug) console.log('toggleMenuSelect: START for search');
        event.stopPropagation();
        event.preventDefault();

        if (this.isDebug) console.log('toggleMenuSelect: event ',event);
        if (this.isDebug) console.log('toggleMenuSelect: event detail ',event.detail);
        if (this.isDebug) console.log('toggleMenuSelect: selected Name ',event.srcElement.dataset.name);
        if (this.isDebug) console.log('toggleMenuSelect: previous situation ', event.srcElement.ariaCurrent);

        let srcCmp = this.template.querySelector("a.menuSelector[data-name='"+ event.srcElement.dataset.name +"']");
        if (this.isDebug) console.log('toggleMenuSelect: srcCmp fetched ', srcCmp);
        if (this.isDebug) console.log('toggleMenuSelect: with attributes ',srcCmp.getAttributeNames());

        if (event.srcElement.ariaCurrent) {
            if (this.isDebug) console.log('toggleMenuSelect: deselecting item');
            srcCmp.removeAttribute('aria-current');
            // delete srcCmp.ariaCurrent
            //event.srcElement.ariaCurrent = '';
        }
        else {
            if (this.isDebug) console.log('toggleMenuSelect: selecting item');
            srcCmp.ariaCurrent = 'selection';
        }

        //if (this.isDebug) console.log('toggleMenuSelect: new situation ', event.srcElement.ariaCurrent);
        if (this.isDebug) console.log('toggleMenuSelect: new situation ', srcCmp.ariaCurrent);

        this.activateApply(false);
        if (this.isDebug) console.log('toggleMenuSelect: END for search');
    }
    toggleTagSelect(event){
        if (this.isDebug) console.log('toggleTagSelect: START for search');
        event.stopPropagation();
        event.preventDefault();

        if (this.isDebug) console.log('toggleTagSelect: event ',event);
        if (this.isDebug) console.log('toggleTagSelect: event detail ',event.detail);
        if (this.isDebug) console.log('toggleTagSelect: selected Name ',event.srcElement.dataset.name);
        if (this.isDebug) console.log('toggleTagSelect: situation ', event.srcElement.ariaPressed);

        event.srcElement.ariaPressed = (event.srcElement.ariaPressed === "true" ? "false" : "true");

        this.activateApply(false);
        if (this.isDebug) console.log('toggleTagSelect: END for search');
    }
    toggleCheckSelect(event) {
        if (this.isDebug) console.log('toggleCheckSelect: START for search');
        event.stopPropagation();
        event.preventDefault();

        if (this.isDebug) console.log('toggleCheckSelect: event ',event);
        if (this.isDebug) console.log('toggleCheckSelect: event detail ',event.detail);
        if (this.isDebug) console.log('toggleCheckSelect: selected Name ',event.srcElement);

        const selectName = event.srcElement.dataset.name;
        if (this.isDebug) console.log('toggleCheckSelect: selected Name ', selectName);
        
        let selectInput = this.template.querySelector("input.checkSelector[name='" + selectName + "']");
        if (this.isDebug) console.log('toggleCheckSelect: selectInput found ', selectInput);

        if (selectInput) {
            let selectState = selectInput.checked;
            if (this.isDebug) console.log('toggleCheckSelect: selectInput check state ',selectState);
            selectInput.checked = !selectState;
            this.activateApply(false);
        }
        else {
            console.warn('toggleCheckSelect: selectInput not found ', selectName);
        }

        if (this.isDebug) console.log('toggleCheckSelect: END for search');
    }


    // Search trigger events
    handleSearchKey(event) {
        if (this.isDebug) console.log('handleSearchKey: START',event);
        if (event.key === 'Enter' || event.keyCode === 13) {
            if (this.isDebug) console.log('handleSearchKey: triggering search');
            this.updateSearch(event);
        }
        if (this.isDebug) console.log('handleSearchKey: END');
    }
    
    updateSearch(event) {
        if (this.isDebug) console.log('updateSearch: START for search');

        let newState = JSON.parse(JSON.stringify(this.currentState));
        if (this.isDebug) console.log('updateSearch: newState prepared ', JSON.stringify(newState));

        let searchInput = this.template.querySelector('input.mainSearch');
        if (this.isDebug) console.log('updateSearch: searchInput found ', searchInput);
        if (searchInput) {
            newState.term = searchInput.value;
            if (this.isDebug) console.log('updateSearch: term updated ', JSON.stringify(newState));
        }
        
        let criteriaSelections = {};

        let menuSelectors = this.template.querySelectorAll('a.menuSelector');
        if (this.isDebug) console.log('updateSearch: all menu Selectors fetched ',menuSelectors);
        for (let item of menuSelectors) {
            if (this.isDebug) console.log('updateSearch: processing menu option ',item);
            if (!criteriaSelections[item.dataset.criteria]) criteriaSelections[item.dataset.criteria] = [];
            if (item.ariaCurrent === 'page') {
                (criteriaSelections[item.dataset.criteria]).push(item.dataset.value);
            }
        }
        if (this.isDebug) console.log('updateSearch: menu selections extracted ', JSON.stringify(criteriaSelections));

        let tagSelectors = this.template.querySelectorAll('button.tagSelector');
        if (this.isDebug) console.log('updateSearch: all tag Selectors fetched ',tagSelectors);
        for (let item of tagSelectors) {
            if (this.isDebug) console.log('updateSearch: processing tag ',item);
            if (!criteriaSelections[item.dataset.criteria]) criteriaSelections[item.dataset.criteria] = [];
            if (item.ariaPressed === 'true') {
                (criteriaSelections[item.dataset.criteria]).push(item.dataset.value);
            }
        }
        if (this.isDebug) console.log('updateSearch: tag selections extracted ', JSON.stringify(criteriaSelections));

        let checkSelectors = this.template.querySelectorAll('input.checkSelector');
        if (this.isDebug) console.log('updateSearch: all checkbox Selectors fetched ',checkSelectors);
        for (let item of checkSelectors) {
            if (this.isDebug) console.log('updateSearch: processing checkbox ',item);
            if (!criteriaSelections[item.dataset.criteria]) criteriaSelections[item.dataset.criteria] = [];
            if (item.checked) {
                (criteriaSelections[item.dataset.criteria]).push(item.dataset.value);
            }
        }
        if (this.isDebug) console.log('updateSearch: checkbox selections extracted ', JSON.stringify(criteriaSelections));

        for (let iterCriteria in criteriaSelections) {
            if (this.isDebug) console.log('updateSearch: preparing state for criteria ', iterCriteria);
            if (criteriaSelections[iterCriteria].length > 0) {
                if (this.isDebug) console.log('updateSearch: registering selected values', JSON.stringify(criteriaSelections[iterCriteria]));
                newState[iterCriteria] = criteriaSelections[iterCriteria].join(';');
            }
            else {
                if (this.isDebug) console.log('updateSearch: unregistering criteria');
                delete newState[iterCriteria];
            }
        }
        if (this.isDebug) console.log('updateSearch: newState finalized ', JSON.stringify(newState));

        let searchPage = {type:"standard__search",state:newState};
        if (this.isDebug) console.log('updateSearch: searchPage init ', JSON.stringify(searchPage));

        this[NavigationMixin.Navigate](searchPage);
        this.activateApply(true);
        if (this.isDebug) console.log('updateSearch: END for search');
    }

    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------
    initCriteria = function(criteriaList, pageState) {
        if (this.isDebug) console.log('initCriteria: START ');
        if (this.isDebug) console.log('initCriteria: criteria list ', JSON.stringify(criteriaList));
        if (this.isDebug) console.log('initCriteria: page state ', JSON.stringify(pageState));

        criteriaList.forEach(item => {
            if (this.isDebug) console.log('initCriteria: processing criteria ', item.fullName);

            if (pageState[item.name]) {
                if (this.isDebug) console.log('initCriteria: processing criteria state ', pageState[item.name]);

                let selectedItems = (pageState[item.name]).split(';');
                if (this.isDebug) console.log('initCriteria: selectedItems extracted ',selectedItems);

                selectedItems.forEach(selectItem => {
                    if (this.isDebug) console.log('initCriteria: processing selected value ',selectItem);

                    let itemValue = (item.values).find(iterVal => {return (iterVal.value === selectItem);});
                    if (this.isDebug) console.log('initCriteria: criteria item found ', JSON.stringify(itemValue));

                    if (itemValue) {
                        itemValue.selected = true;
                    }
                    else {
                        console.warn('initCriteria: value not found ',selectItem);
                        console.warn('initCriteria: for criteria ',item.fullName);
                    }
                });
                if (this.isDebug) console.log('wiredPicklists: criteria values selection updated ',JSON.stringify(item.values));
            }
            else {
                if (this.isDebug) console.log('initCriteria: ignoring picklist (no state)');
            }
        });

        if (this.isDebug) console.log('initCriteria: END with ', JSON.stringify(criteriaList));
        return criteriaList;
    }
    activateApply = function(state) {
        if (this.isDebug) console.log('activateApply: START for state ',state);
        let applyButton = this.template.querySelector('.applyButton');
        if (this.isDebug) console.warn('activateApply: applyButton found ', applyButton);
        if (applyButton) {
            applyButton.disabled = state;
            if (this.isDebug) console.warn('activateApply: applyButton activated');
        }
        else {
            if (this.isDebug) console.warn('activateApply: no applyButton to activate');
        }
    }
}