<script lang="ts">
	import {getContext, } from "svelte";
	import {specialRow, rowContextKey, getTblCtx, setClmnCtx} from './table'
	//import {writable} from "svelte/store";

	export let prop: string = '';
	export let title: string = '';
	export let headers: boolean = false;
	const row: any = getContext(rowContextKey);
	const tblSetFilter = getTblCtx().setFilter;
	setClmnCtx({
		setFilter(filter: (name: any)=> boolean) {
			console.assert(prop, 'A filtered column must define a `prop`')
			// TODO: `prop` -> `thisControl` : find back that API
			tblSetFilter(prop, filter && ((row: any)=> filter(row[prop])));
		}
	})
	/*let value = prop && typeof row === 'object' && writable(row[prop]);
	if(value) value.subscribe((v: any)=> row[prop] = v);*/
</script>
<template>
	{#if !row}
		<th>`Column` is to be used in a `Table` only</th>
	{:else if row === specialRow.filter}
		<slot name="filter">
			<td />
		</slot>
	{:else if row === specialRow.header}
		<slot name="header">
			<th scope="col">{title || prop}</th>
		</slot>
	{:else if row === specialRow.footer}
		<slot name="footer">
			<th scope="col" />
		</slot>
	{:else}
		<slot>
			{#if headers}
				<th scope="row">{row[prop]}</th>
			{:else}
				<td>{row[prop]}</td>
			{/if}
		</slot>
	{/if}
</template>
