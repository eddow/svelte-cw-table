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
	<Column prop="email" title="E-MailS" />
</Table>
```

The `Column` (and `Selection` who is a peculiar column) *have to* appear in a `Table` 

## Demo

The repo can be cloned and `npm run demo` will watch the files. `public/index.html` can then be opened statically.
(TODO: rawcdn.githack.com)

## Table

The table is the main component who will directly translate in a `<table>` tag on which all the attributes (except the reserved ones) are forwarded.

### Attributes

- `data` is an array of rows. Each row is an object whose properties will be accessed.
- `key` is the name of the property who will be used as a key for the row (`'id'`, `'_id'`). If none is specified, the index of the element will be used.
- `columnHeaders` (default: true) determine wether the header of the columns is displayed
- `columnFooters` (default: false) determine wether the footer of the columns is displayed

### `let`-s

The table can use `let:row={row}` (or in this case, just `let:row`) to have a variable `row` defined in the `Table` containing the displayed row.

## Column

Each column has three slots.
- The default one who specifies the content of each data cell. If none is specified, the attribute `prop` will be used to retrieve the value of the cell: equivalent to `row[prop]`.
- The `"header"` and `"footer"` ones respectively describe what to display in the header and the footer of the column (depending on `Table`' `columnHeaders` and `columnFooters` values).
If no header slot is specified, the header will be the `title` property and - if still empty - the `prop` property.

### Attributes

- `prop` is the name of the property to retrieve when the content is not explicitely given
- `title` is the text to use in the header slot

## Selection

`Selection` is a peculiar type of `Column` who contains check-boxes and maintain a multiple-selection value (with a "select all" checkbox in the header)

### Attribute

Use `bind:selection={selection}` to keep the variable `selection` a `Set` of the selected rows (the objects, not the keys)