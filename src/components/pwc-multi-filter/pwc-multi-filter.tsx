import { Component, h, Method, State, Element, Listen, Event, EventEmitter } from "@stencil/core";
import { PwcMultiFilterInterfaces } from "./PwcMultiFilterInterfaces";
import _ from "lodash";
import "@paraboly/pwc-filter";
import "@paraboly/pwc-tabview";
import { PwcFilter } from "@paraboly/pwc-filter/dist/types/utils/PwcFilter";
import { PwcTabviewInterfaces } from "@paraboly/pwc-tabview/dist/types/interfaces/PwcTabviewInterfaces";

// This is the only way this works, and the export has to stay as well, otherwise it throws "PwcFilter not found".
export type _filterChangedEventType = CustomEvent<PwcFilter.FilterChangedEventPayload>;

@Component({
  tag: "pwc-multi-filter",
  shadow: false
})
export class PwcMultiFilter {
  @Element() root: HTMLPwcMultiFilterElement;

  @State() filterConfigs: PwcMultiFilterInterfaces.IFilterTabConfig[] = [];

  private activeFilter : HTMLPwcFilterElement;

  private filterRefs: {
    [key: string]: HTMLPwcFilterElement;
  } = {};

  private filterChangedEventSubscribers: {
    [key: string]: Array<(filterChangedEvent: _filterChangedEventType) => void>;
  } = {};

  @Event() activeFilterChanged: EventEmitter<PwcMultiFilterInterfaces.IActiveFilterChangedEventPayload>;

  @Listen('tabChanged')
  async tabChangedEventHandler(e: CustomEvent<PwcTabviewInterfaces.ITabChangedEventPayload>) {
    const name = e.detail.handle;
    const activeFilter = await this.getFilter(name);
    this.activeFilter = activeFilter;
    this.activeFilterChanged.emit({originalEvent: e, filterName: name, filterRef: activeFilter});
  }

  @Method()
  async getActiveFilter() {
    return this.activeFilter;
  }

  @Method()
  async addFilter(config: PwcMultiFilterInterfaces.IFilterTabConfig) {
    this.filterConfigs = _.unionBy(this.filterConfigs, [config], f => f.name);
  }

  @Method()
  async removeFilter(name: string) {
    const filtered = this.filterConfigs.filter(val => val.name !== name); 
    this.filterConfigs = [...filtered];
  }

  @Method()
  async getFilter(name: string): Promise<HTMLPwcFilterElement> {
    return this.filterRefs[name];
  }

  @Method()
  async subscribeToFilterChange(
    name: string,
    callback: (
      filterChangedEvent: _filterChangedEventType
    ) => void
  ) {
    this.filterChangedEventSubscribers[name] = this.filterChangedEventSubscribers[name] || [];
    this.filterChangedEventSubscribers[name].push(callback);
  }

  @Method()
  async getFilterResult(name: string): Promise<object[]> {
    return this.filterRefs[name].filter();
  }

  handleChangeEvent(name: string, event: _filterChangedEventType) {
    this.filterChangedEventSubscribers[name].forEach(callback => callback(event));
  }

  constructFilterTab(filter: PwcMultiFilterInterfaces.IFilterTabConfig) {
    return (
      <pwc-tabview-tab handle={filter.name}>
        <pwc-filter data={filter.data} items={filter.items}></pwc-filter>
      </pwc-tabview-tab>
    );
  }

  componentDidRender() {
    const tabs = this.root.querySelectorAll("pwc-tabview-tab");
    tabs.forEach(tab => {
      const handle = tab.handle;
      const filter = tab.querySelector("pwc-filter");
      this.registerFilterRef(handle, filter);
    });
  }

  registerFilterRef(name: string, filterRef: HTMLPwcFilterElement) {
    const existingRef = this.filterRefs[name];
    this.filterRefs[name] = filterRef;

    if(existingRef != filterRef) {
      this.initialFilterSetup(name, filterRef);
    }
  }

  initialFilterSetup(name: string, filterRef: HTMLPwcFilterElement) {
    filterRef.addEventListener("filterChanged", this.handleChangeEvent.bind(this, name));
  }

  render() {
    return (
      this.filterConfigs && this.filterConfigs.length > 0 &&
      <pwc-tabview>
        {this.filterConfigs.map(filter => this.constructFilterTab(filter))}
      </pwc-tabview>
    );
  }
}
