[![npm](https://img.shields.io/npm/v/svelte-cw-table.svg)](https://www.npmjs.com/package/svelte-cw-table)

# Svelte column-wise table definition

This small library allows the programer to define a table column-wise.
```js
import {Table, Column, Selection} from 'svelte-cw-table'
```
```xml
<Table let:row data={data}>
	<Selection bind:selection={selection} />
	<Column>
		<th scope="row">{row.username}</th>
	</Column>
	<Column prop="name" title="Name" />
	<Column prop="email" title="E-Mail" />
</Table>
```

The `Column` (and `Selection` who is a peculiar column) *have to* appear in a `Table` 

## Demo

The repo can be cloned and `npm run demo` will watch the files. `public/index.html` can then be opened statically.

Also available [here](https://rawcdn.githack.com/eddow/svelte-cw-table/master/public/index.html), executing [this code](https://github.com/eddow/svelte-cw-table/blob/master/demo/App.svelte)

## Table

The table is the main component who will directly translate in a `<table>` tag on which all the attributes (except the reserved ones) are forwarded.

Every `<tr>` has an attribute `row-id` containing the id of the row : its key element or its index if no `key` were specified.

### Attributes

- `data: any[]` is an array of rows. Each row is an object whose properties will be accessed.
- `key: string` is the name of the property who will be used as a key for the row (`'id'`, `'_id'`, ...). If none is specified, the index of the element will be used.
- `columnHeaders: boolean` (default: true) determine wether the headers of the columns are displayed
- `columnFilters: boolean` (default: false) determine wether the filters of the columns are displayed
- `columnFooters: boolean` (default: false) determine wether the footers of the columns are displayed
- `filters: Map<any, (row: any)=> boolean>` is the list or [filters](#filters)
- `displayedData: any[]` if used is to be initialised to `[]` and bound to retrieve the filtered & sorted data
- `tr$...` attributes will be forwarded on the `<tr>` tags (without the `tr$` prefix)

### `let`-s

The table can use `let:row={row}` (or in this case, just `let:row`) to have a variable `row` defined in the `Table` referencing the displayed row.

## Column

Each column has three slots.
- The default one who specifies the content of each data cell. If none is specified, the attribute `prop` will be used to retrieve the value of the cell: equivalent to `row[prop]`.
- The `"header"` and `"footer"` ones respectively describe what to display in the header and the footer of the column (depending on `Table`' `columnHeaders` and `columnFooters` values).
If no header slot is specified, the header will be the `title` property and - if still empty - the `prop` property.
- The `"filter"` slot is displayed below the `"header"` one

All the slots have to be a table definition or header (`td` or `th`).

### Attributes

- `prop: string` is the name of the property to retrieve when the content is not explicitely given
- `title: string` is the text to use in the header slot
- `headers: boolean` (default: false) determines wether the cells are data-cell(false) or row-headers(true)

## Selection

`Selection` is a peculiar type of `Column` who contains check-boxes and maintain a multiple-selection value (with a "select all" checkbox in the header)

Note: each cell is a `<th class="selection">`. The "Select all" has a `scope="col"`, each individual selection a `scope="row"`

Note: rows filtered out won't be deselected.

### Attribute

Use `bind:selection={selection}` to keep the variable `selection` a `Set` of the selected rows (the objects, not the keys)

## Contexts

Custom user-controls to use in the table can be done and will retrieve contexts to interact with the table.
These contexts can be retrieved with the functions `getXxxCtx` that are exported by the library.

### Table Context

Retrieved with `getTblCtx()`, this context defines :
- `setFilter: (key: any, filter: (row: any)=> boolean)=> void` see [filters](#column-wise-globals)
- `data: Readable<any[]>` a readable store giving the whole data (before filtering/sorting)

### Row context

Retrieved with `getRowCtx()`,

### Column Context

Retrieved with `getClmnCtx()`, this context defines :
- `setFilter: (filter: (value: any)=> boolean)=> void` see [filters](#column-wise)
- If the column has a defined `prop`, `value: Writable<any>` a writable store giving the value of the cell

## Filters

Filters can either be specified globally (`income > expenses`) or column-wise (`age > 18`). If globally, they can be specified programatically from an external control, and if column-wise, they can be included in the column, in the `"filter"` (indeed, even `"header"` or "`footer"`) slot.

If a filter is given with a false-ish value, it is simply removed.

A table that uses filters *have to* have a `key` defined.

### Globally

The table has a property `filters: Map<any, (row: any)=> boolean>` that can be modified and will rapport all the used filters.

The key can be anything (objects should be prefered to strings in order to avoid conflicts) and has to remain the same as the filter change.

The value is a function that select the rows that will be kept and displayed. Ex: `(firm: any)=> firm.income > firm.expense`

### Column-wise

Column containing a filter *have to* have a `prop` value, as it will filter on the given value. Filter controls must be surrounded by a table definition or header (`td` or `th`). Ex: `<td slot="filter"><MyFilter /></td>`

The control will retrieve the column context by calling the exported function `getClmnCtx`, and in it the `setFilter` function, called with this column' filter.

```ts
import {getClmnCtx, ...} from "svelte-cw-table"
...
const setFilter = getClmnCtx().setFilter;
...
$: setFilter((value: any)=> [ ... ])
...
```
A more complete example can be seen [here](https://github.com/eddow/svelte-cw-table/tree/master/src/filters/StringContent.svelte)

#### Composition of filters

Even if only one filter can be used by column, filters can be made more complex. Ex:
```xml
<td slot="filter">
	<label>
		case sensitive
		<input type="checkbox" bind:checked={caseSensitive} />
	</label>
	<StringContentFilter caseSensitive={caseSensitive} />
</td>
```

### Column-wise globals

A really specific case of custom controls for, let's say, a parent class intended to be used in several tables on children classes in the table structure can be used. For this, instead of using the `setFilter` of the column-context, one can use the `setFilter` of the table-context.

```ts
import {getTblCtx, ...} from "svelte-cw-table"
...
const setFilter = getTblCtx().setFilter;
const filterKey = {};
...
$: setFilter(filterKey, (row: any)=> [ ... ])
...
```

### Pre-defined filters

These components can be imported directly from the library and used in the table.

#### StringContentFilter

An `<input type="text" />` that filters the column depending on its content.

##### Attributes

- `beginsWith: boolean` (default: false) determines if it filters the strings that *begin with* or *contain* the given value.
- `caseSensitive: boolean` (default: false)
- `value: string` (default: "")

## TODOs

Next step: make cells editable