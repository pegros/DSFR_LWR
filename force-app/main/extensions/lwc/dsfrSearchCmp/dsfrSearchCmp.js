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
    @api showSearch = false;
    @api criteria;

    @api isDebug = false;

    //-----------------------------------------------------
    // Technical parameters
    //-----------------------------------------------------

    //objectList;
    //objectDescs;
    fieldList;
    currentState;
    searchTerm;
    criteriaList;

    //-----------------------------------------------------
    // Custom Getters
    //-----------------------------------------------------
    get show1() {
        return false;
    };

    //-----------------------------------------------------
    // Context Data
    //-----------------------------------------------------
    @wire(getPicklistValues, { fieldList: '$fieldList' })
    wiredPicklists({ error, data }) {
        if (this.isDebug) console.log('wiredPicklists: START for search ', );
        if (data) {
            if (this.isDebug) console.log('wiredPicklists: Picklist descriptions fetched ', JSON.stringify(data));
            let criteriaList = JSON.parse(JSON.stringify(data));
            if (this.currentState) {
                if (this.isDebug) console.log('wiredPicklists: setting initial states ',JSON.stringify(this.currentState));

                criteriaList.forEach(item => {
                    if (this.isDebug) console.log('wiredPicklists: processing picklist state ', JSON.stringify(item));

                    if (this.currentState[item.name]) {
                        if (this.isDebug) console.log('wiredPicklists: processing picklist state ',item);

                        let selectedItems = (this.currentState[item.name]).split(';');
                        if (this.isDebug) console.log('wiredPicklists: selectedItems extracted ',selectedItems);

                        selectedItems.forEach(selectItem => {
                            if (this.isDebug) console.log('wiredPicklists: processing selected value ',selectItem);

                            let itemValue = (item.values).find(iterVal => {return (iterVal.value === selectItem);});
                            if (this.isDebug) console.log('wiredPicklists: criteria item found ',itemValue);

                            if (itemValue) {
                                itemValue.selected = true;
                            }
                            else {
                                console.warn('wiredPicklists: value not found ',selectItem);
                            }
                        });
                        if (this.isDebug) console.log('wiredPicklists: selectedItems selection updated ',selectedItems);
                    }
                    else {
                        if (this.isDebug) console.log('wiredPicklists: ignoring picklist (no state)');
                    }
                });
            }
            if (this.isDebug) console.log('wiredPicklists: updating criteria list');
            this.criteriaList = criteriaList;
        }
        else if (error) {
            console.warn('wiredPicklists: Picklist fetch failed ', JSON.stringify(error));
            this.criteriaList = [];
        }
        if (this.isDebug) console.log('wiredPicklists: END for search');
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
        if (this.isDebug) console.log('connected: criteria ', this.criteria);

        if (this.criteria) {

            try {
                this.fieldList = JSON.parse(this.criteria);
                if (this.isDebug) console.log('connected: criteria parsed ', this.fieldList);
            }
            catch (error) {
                console.warn('connected: criteria parsing failed ', error);
            }
        }

        if (this.isDebug) console.log('connected: END for search');
    }

    //-----------------------------------------------------
    // Event Handlers
    //-----------------------------------------------------
    toggleSelect(event) {
        if (this.isDebug) console.log('toggleSelect: START for search');
        event.stopPropagation();
        event.preventDefault();

        if (this.isDebug) console.log('toggleSelect: event ',event);
        if (this.isDebug) console.log('toggleSelect: event detail ',event.detail);
        if (this.isDebug) console.log('toggleSelect: selected Name ',event.srcElement);

        const selectName = event.srcElement.dataset.name;
        if (this.isDebug) console.log('toggleSelect: selected Name ', selectName);
        
        let selectInput = this.template.querySelector("input.selector[name='" + selectName + "']");
        if (this.isDebug) console.log('updateSearch: selectInput found ', selectInput);

        if (selectInput) {
            let selectState = selectInput.checked;
            if (this.isDebug) console.log('toggleSelect: selectInput check state ',selectState);
            selectInput.checked = !selectState;
        }
        else {
            console.warn('toggleSelect: selectInput not found ', selectName);
        }
        if (this.isDebug) console.log('toggleSelect: END for search');
    }

    updateSearch(event) {
        if (this.isDebug) console.log('updateSearch: START for search');

        let searchInput = this.template.querySelector('input.mainSearch');
        if (this.isDebug) console.log('updateSearch: searchInput ', searchInput);
        let searchTerm = searchInput.value;
        if (this.isDebug) console.log('updateSearch: search Term extracted ', searchTerm);

        let selectInput = this.template.querySelectorAll('input.selector');
        if (this.isDebug) console.log('updateSearch: all selectInput ',selectInput);
        let selectedValues = {};
        for (let item of selectInput) {
            if (this.isDebug) console.log('updateSearch: processing selection ',item);
            if (this.isDebug) console.log('updateSearch: with value ',item.dataset.value);
            if (this.isDebug) console.log('updateSearch: of criteria ',item.dataset.criteria);
            if (this.isDebug) console.log('updateSearch: in checked state ',item.checked);
            if (item.checked) {
                if (!selectedValues[item.dataset.criteria]) selectedValues[item.dataset.criteria] = [];
                (selectedValues[item.dataset.criteria]).push(item.dataset.value);
            }
        }
        if (this.isDebug) console.log('updateSearch: current selection extracted ', JSON.stringify(selectedValues));

        let searchState = { term: searchTerm};
        for (let iterCriteria in selectedValues) {
            if (this.isDebug) console.log('updateSearch: preparing state for criteria ', iterCriteria);
            searchState[iterCriteria] = (selectedValues[iterCriteria]).join(';');
        }
        if (this.isDebug) console.log('updateSearch: searchState init ', JSON.stringify(searchState));
        let searchPage = {type:"standard__search",state:searchState};
        //let searchPage = {type: 'comm__namedPage',attributes:{name: 'Search'},state: {term:"test"}}
        if (this.isDebug) console.log('handleSearch: searchPage init ', JSON.stringify(searchPage));

        this[NavigationMixin.Navigate](searchPage);

        if (this.isDebug) console.log('updateSearch: END for search');
    }
}