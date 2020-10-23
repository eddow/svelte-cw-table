<script lang="ts">
	import {specialRow, getRowCtx, getTblCtx, setClmnCtx} from './table'
	import {writable} from "svelte/store";

	export let prop: string = '';
	export let title: string = '';
	export let headers: boolean = false;
	let row: any = {};
	getRowCtx().row.subscribe((value: any)=> row = value);
	const tblSetFilter = getTblCtx().setFilter;
	let ctx: any = {
		setFilter(filter: (name: any)=> boolean) {
			console.assert(prop, 'A filtered column must define a `prop`')
			// TODO: `prop` -> `thisControl` : find back that API
			tblSetFilter(prop, filter && ((row: any)=> filter(row[prop])));
		}
	};
	let value = writable(prop && (typeof row === 'object') && row[prop]);
	console.dir(value); 
	$: value.set(prop && typeof row === 'object' && row[prop]);
	//let unsubscribeValue: ()=> void;
	/*$: */if(prop && typeof row === 'object') {
		/*if(unsubscribeValue) unsubscribeValue();
		unsubscribeValue = */value.subscribe((v: any)=> row[prop] = v);
		ctx.value = value;
	}
	setClmnCtx(ctx);
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
				<th scope="row">{$value}</th>
			{:else}
				<td>{$value}</td>
			{/if}
		</slot>
	{/if}
</template>
