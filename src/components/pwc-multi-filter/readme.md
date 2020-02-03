# pwc-multi-filter

<!-- Auto Generated Below -->


## Events

| Event                 | Description | Type                                            |
| --------------------- | ----------- | ----------------------------------------------- |
| `activeFilterChanged` |             | `CustomEvent<IActiveFilterChangedEventPayload>` |


## Methods

### `addFilter(config: PwcMultiFilterInterfaces.IFilterTabConfig) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `getActiveState() => Promise<{ filterRef: HTMLPwcFilterElement; filterName: string; }>`



#### Returns

Type: `Promise<{ filterRef: HTMLPwcFilterElement; filterName: string; }>`



### `getFilter(name: string) => Promise<HTMLPwcFilterElement>`



#### Returns

Type: `Promise<HTMLPwcFilterElement>`



### `getFilterResult(name: string) => Promise<object[]>`



#### Returns

Type: `Promise<object[]>`



### `removeFilter(name: string) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `subscribeToFilterChange(name: string, callback: (filterChangedEvent: _filterChangedEventType) => void) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `switchToFilter(name: string) => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- pwc-tabview-tab
- pwc-filter
- pwc-tabview

### Graph
```mermaid
graph TD;
  pwc-multi-filter --> pwc-tabview-tab
  pwc-multi-filter --> pwc-filter
  pwc-multi-filter --> pwc-tabview
  pwc-filter --> pwc-dynamic-form
  pwc-filter --> pwc-dynamic-form-content
  pwc-dynamic-form-content --> pwc-color-picker
  pwc-dynamic-form-content --> pwc-choices
  pwc-choices --> pwc-choices-input-bar
  pwc-choices --> pwc-choices-dropdown
  pwc-choices-input-bar --> pwc-choices-option-bubble
  pwc-tabview --> pwc-tabview-handle
  style pwc-multi-filter fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
