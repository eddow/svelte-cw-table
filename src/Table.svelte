<script lang="ts">
	import TableRow from './TableRow.svelte'
	import {specialRow, setTblCtx} from './table'
  	import {exclude} from './utils/exclude'
  	import {prefixFilter} from './utils/prefixFilter'
	import {useActions} from './utils/useActions'
	import {readable} from 'svelte/store'

	export let data: any[];
	export let key: string = null;
	export let columnFilters: boolean = true;
	export let columnHeaders: boolean = true;
	export let columnFooters: boolean = false;
	export let use = [];
	export let filters = new Map<any, (row: any)=> boolean>();
	let setRawData: (raw: any[])=> void;
	$: setRawData && setRawData(data);
	setTblCtx({
		data: readable(data, (set: (raw: any[])=> void)=> { setRawData = set; }),
		setFilter(key: any, filter: (row: any)=> boolean) {
			filters[filter?'set':'delete'](key, filter);
			filters = new Map<any, (row: any)=> boolean>(filters);
		}
	});
	function rowId(row: any, ndx: number) {
		return key ? row[key] : ndx;
	}
	export let displayedData: any[];
	$: console.assert(key || !filters.size, 'A table with `filters` needs a `key`');
	$: displayedData = data.filter(row=> Array.from(filters.values()).every(filter=> filter(row)))
</script>
<template>
	{filters.size}
	<table use:useActions={use} {...exclude($$props, ['use', 'class', 'tr$'])}>
		{#if columnHeaders}
			<thead>
				<TableRow id="header" row={specialRow.header} {...prefixFilter($$props, 'tr$')}>
					<slot row={specialRow.header} />
				</TableRow>
			</thead>
		{/if}
		{#if columnFilters}
			<thead>
				<TableRow id="filter" row={specialRow.filter} {...prefixFilter($$props, 'tr$')}>
					<slot row={specialRow.filter} />
				</TableRow>
			</thead>
		{/if}
		<tbody>
			{#each displayedData as row, ndx (rowId(row, ndx))}
				<TableRow id={rowId(row, ndx)} row={row} {...prefixFilter($$props, 'tr$')}>
					<slot row={row} />
				</TableRow>
			{/each}
		</tbody>
		{#if columnFooters}
			<tfoot>
				<TableRow id="footer" row={specialRow.footer} {...prefixFilter($$props, 'tr$')}>
					<slot row={specialRow.footer} />
				</TableRow>
			</tfoot>
		{/if}
	</table>
</template>
