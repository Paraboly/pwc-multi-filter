import {
  Component,
  h,
  Method,
  State,
  Element,
  Listen,
  Event,
  EventEmitter
} from "@stencil/core";
import { PwcMultiFilterInterfaces } from "./PwcMultiFilterInterfaces";
import _ from "lodash";
import "@paraboly/pwc-filter";
import "@paraboly/pwc-tabview";
import { PwcFilter } from "@paraboly/pwc-filter/dist/types/utils/PwcFilter";
import { PwcTabviewInterfaces } from "@paraboly/pwc-tabview/dist/types/interfaces/PwcTabviewInterfaces";

// This is the only way this works, and the export has to stay as well, otherwise it throws "PwcFilter not found".
export type _filterChangedEventType = CustomEvent<
  PwcFilter.FilterChangedEventPayload
>;

@Component({
  tag: "pwc-multi-filter",
  shadow: false
})
export class PwcMultiFilter {
  @Element() root: HTMLPwcMultiFilterElement;

  @State() filterConfigs: PwcMultiFilterInterfaces.IFilterTabConfig[] = [];

  private filterRefs: {
    [key: string]: HTMLPwcFilterElement;
  } = {};

  private filterChangedEventSubscribers: {
    [key: string]: Array<(filterChangedEvent: _filterChangedEventType) => void>;
  } = {};

  private activeFilterName: string;
  private activeFilterRef: HTMLPwcFilterElement;

  private tabViewRef: HTMLPwcTabviewElement;

  @Event() activeFilterChanged: EventEmitter<
    PwcMultiFilterInterfaces.IActiveFilterChangedEventPayload
  >;

  @Listen("tabChanged")
  async tabChangedEventHandler(
    e: CustomEvent<PwcTabviewInterfaces.ITabChangedEventPayload>
  ) {
    this.setActiveState(e.detail.handle);
  }

  @Method()
  async getActiveState() {
    return {
      filterRef: this.activeFilterRef,
      filterName: this.activeFilterName
    };
  }

  @Method()
  async switchToFilter(name: string) {
    // we set the tab's state -> tab emits an event -> we set our inner state -> we emit an event
    this.tabViewRef.switchToTab(name);
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
    callback: (filterChangedEvent: _filterChangedEventType) => void
  ) {
    this.filterChangedEventSubscribers[name] =
      this.filterChangedEventSubscribers[name] || [];
    this.filterChangedEventSubscribers[name].push(callback);
  }

  @Method()
  async getFilterResult(name: string): Promise<object[]> {
    return this.filterRefs[name].filter();
  }

  setActiveState(activeFilterName: string) {
    this.activeFilterName = activeFilterName;
    this.activeFilterRef = this.filterRefs[activeFilterName];

    this.activeFilterChanged.emit({
      filterName: this.activeFilterName,
      filterRef: this.activeFilterRef
    });
  }

  handleChangeEvent(name: string, event: _filterChangedEventType) {
    const subscribers = this.filterChangedEventSubscribers[name];
    if (subscribers) {
      subscribers.forEach(callback => callback(event));
    }
  }

  registerFilterRef(name: string, filterRef: HTMLPwcFilterElement) {
    if (filterRef) {
      const existingRef = this.filterRefs[name];
      this.filterRefs[name] = filterRef;

      if (existingRef !== filterRef) {
        this.initialFilterSetup(name, filterRef);
      }
    }
  }

  initialFilterSetup(name: string, filterRef: HTMLPwcFilterElement) {
    filterRef.addEventListener(
      "filterChanged",
      this.handleChangeEvent.bind(this, name)
    );
  }

  switchToFirstFilter() {
    const firstTabName = this.filterConfigs[0].name;
    this.switchToFilter(firstTabName);
  }

  constructFilterTab(filter: PwcMultiFilterInterfaces.IFilterTabConfig) {
    return (
      <pwc-tabview-tab handle={filter.name}>
        <pwc-filter
          data={filter.data}
          items={filter.items}
          ref={el => this.registerFilterRef(filter.name, el)}
        ></pwc-filter>
      </pwc-tabview-tab>
    );
  }

  render() {
    return (
      this.filterConfigs &&
      this.filterConfigs.length > 0 && (
        <pwc-tabview ref={el => (this.tabViewRef = el)}>
          {this.filterConfigs.map(filter => this.constructFilterTab(filter))}
        </pwc-tabview>
      )
    );
  }
}
