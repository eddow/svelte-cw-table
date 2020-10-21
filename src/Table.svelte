<script lang="ts">
	import TableRow from './TableRow.svelte'
	import {setContext} from "svelte";
	import {dataContextKey, header, footer} from './table'
  	import {exclude} from './utils/exclude'
  	import {prefixFilter} from './utils/prefixFilter'
	import {useActions} from './utils/useActions'

	export let data: any[];
	export let key: string = null;
	export let columnHeaders: boolean = true;
	export let columnFooters: boolean = false;
	export let use = [];
	setContext(dataContextKey, ()=> data);
	function rowId(row, ndx) {
		return key ? row[key] : ndx;
	}
</script>
<template>
	<table use:useActions={use} {...exclude($$props, ['use', 'class', 'tr$'])}>
		{#if columnHeaders}
			<thead>
				<TableRow id="header" row={header} {...prefixFilter($$props, 'tr$')}>
					<slot row={header} />
				</TableRow>
			</thead>
		{/if}
		<tbody>
			{#each data as row, ndx (rowId(row, ndx))}
				<TableRow id={rowId(row, ndx)} row={row} {...prefixFilter($$props, 'tr$')}>
					<slot row={row} />
				</TableRow>
			{/each}
		</tbody>
		{#if columnFooters}
			<tfoot>
				<TableRow id="header" row={footer} {...prefixFilter($$props, 'tr$')}>
					<slot row={footer} />
				</TableRow>
			</tfoot>
		{/if}
	</table>
</template>
